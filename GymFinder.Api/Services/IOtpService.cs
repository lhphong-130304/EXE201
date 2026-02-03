namespace GymFinder.Api.Services;

public interface IOtpService
{
    string GenerateOtp(string email);
    bool VerifyOtp(string email, string otp);
}
