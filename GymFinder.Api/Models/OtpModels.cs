namespace GymFinder.Api.Models;

public class OtpRequest
{
    public string Email { get; set; } = string.Empty;
}

public class OtpVerificationRequest
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}

public class OtpResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public User User { get; set; } = null!;
    public string Otp { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
