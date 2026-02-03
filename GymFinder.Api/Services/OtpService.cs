using System.Collections.Concurrent;

namespace GymFinder.Api.Services;

public class OtpService : IOtpService
{
    // In-memory storage for OTPs. Key: Email, Value: (Otp, Expiry)
    private static readonly ConcurrentDictionary<string, (string Otp, DateTime Expiry)> _otpCache = new();
    private readonly TimeSpan _otpExpiry = TimeSpan.FromMinutes(5);

    public string GenerateOtp(string email)
    {
        var otp = new Random().Next(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.Add(_otpExpiry);
        
        _otpCache[email] = (otp, expiry);
        
        return otp;
    }

    public bool VerifyOtp(string email, string otp)
    {
        if (_otpCache.TryGetValue(email, out var cachedData))
        {
            if (DateTime.UtcNow <= cachedData.Expiry && cachedData.Otp == otp)
            {
                // Remove OTP after successful verification
                _otpCache.TryRemove(email, out _);
                return true;
            }
        }
        return false;
    }
}
