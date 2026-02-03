using GymFinder.Api.Data;
using GymFinder.Api.Models;
using GymFinder.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly GymFinderDbContext _context;
    private readonly IOtpService _otpService;
    private readonly IEmailService _emailService;

    public AuthController(GymFinderDbContext context, IOtpService otpService, IEmailService emailService)
    {
        _context = context;
        _otpService = otpService;
        _emailService = emailService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Email và mật khẩu là bắt buộc." });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == request.Password);

        if (user == null)
        {
            return Unauthorized(new AuthResponse { Success = false, Message = "Email hoặc mật khẩu không đúng." });
        }

        return Ok(new AuthResponse 
        { 
            Success = true, 
            Message = "Đăng nhập thành công.",
            User = user
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var user = request.User;
        var otp = request.Otp;

        Console.WriteLine($"Registering user: {user.Email} with OTP: {otp}");
        try
        {
            if (string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.PasswordHash))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Email và mật khẩu là bắt buộc." });
            }

            if (string.IsNullOrEmpty(otp))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Mã OTP là bắt buộc." });
            }

            // Verify OTP
            if (!_otpService.VerifyOtp(user.Email, otp))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Mã OTP không chính xác hoặc đã hết hạn." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Email đã tồn tại." });
            }

            // Set default role
            if (string.IsNullOrEmpty(user.Role))
            {
                user.Role = "USER";
            }

            user.Id = 0;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new AuthResponse 
            { 
                Success = true, 
                Message = "Đăng ký thành công.",
                User = user
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new AuthResponse { Success = false, Message = "Lỗi server: " + ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<AuthResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Email là bắt buộc." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Email không tồn tại trong hệ thống." });
        }

        try
        {
            var otp = _otpService.GenerateOtp(request.Email);
            var subject = "Mã xác nhận khôi phục mật khẩu GYMFINDER";
            var body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;'>
                    <h2 style='color: #FF204E; text-align: center;'>Khôi phục mật khẩu GYMFINDER</h2>
                    <p>Bạn đã yêu cầu khôi phục mật khẩu. Đây là mã xác nhận (OTP) của bạn:</p>
                    <div style='background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>
                        {otp}
                    </div>
                    <p>Mã này có hiệu lực trong vòng 5 phút. Nếu bạn không yêu cầu thay đổi này, hãy bỏ qua email này.</p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>
                    <p style='font-size: 12px; color: #888; text-align: center;'>Đây là email tự động, vui lòng không phản hồi.</p>
                </div>";

            await _emailService.SendEmailAsync(request.Email, subject, body);

            return Ok(new AuthResponse { Success = true, Message = "Mã OTP đã được gửi đến email của bạn." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new AuthResponse { Success = false, Message = "Lỗi khi gửi OTP: " + ex.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<AuthResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp) || string.IsNullOrEmpty(request.NewPassword))
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Email, OTP và mật khẩu mới là bắt buộc." });
        }

        if (!_otpService.VerifyOtp(request.Email, request.Otp))
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Mã OTP không chính xác hoặc đã hết hạn." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Người dùng không tồn tại." });
        }

        user.PasswordHash = request.NewPassword; // Note: In real app, hash this
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse { Success = true, Message = "Mật khẩu đã được thay đổi thành công." });
    }
}
