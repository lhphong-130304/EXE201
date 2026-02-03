using GymFinder.Api.Models;
using GymFinder.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OtpController : ControllerBase
{
    private readonly IOtpService _otpService;
    private readonly IEmailService _emailService;

    public OtpController(IOtpService otpService, IEmailService emailService)
    {
        _otpService = otpService;
        _emailService = emailService;
    }

    [HttpPost("send")]
    public async Task<ActionResult<OtpResponse>> SendOtp([FromBody] OtpRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
        {
            return BadRequest(new OtpResponse { Success = false, Message = "Email là bắt buộc." });
        }

        try
        {
            var otp = _otpService.GenerateOtp(request.Email);
            var subject = "Mã xác nhận đăng ký GYMFINDER";
            var body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;'>
                    <h2 style='color: #FF204E; text-align: center;'>Chào mừng bạn đến với GYMFINDER!</h2>
                    <p>Cảm ơn bạn đã quan tâm đến dịch vụ của chúng tôi. Đây là mã xác nhận (OTP) để hoàn tất đăng ký của bạn:</p>
                    <div style='background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>
                        {otp}
                    </div>
                    <p>Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>
                    <p style='font-size: 12px; color: #888; text-align: center;'>Đây là email tự động, vui lòng không phản hồi.</p>
                </div>";

            await _emailService.SendEmailAsync(request.Email, subject, body);

            return Ok(new OtpResponse { Success = true, Message = "Mã OTP đã được gửi đến email của bạn." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new OtpResponse { Success = false, Message = "Lỗi khi gửi OTP: " + ex.Message });
        }
    }

    [HttpPost("verify")]
    public ActionResult<OtpResponse> VerifyOtp([FromBody] OtpVerificationRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp))
        {
            return BadRequest(new OtpResponse { Success = false, Message = "Email và mã OTP là bắt buộc." });
        }

        var isValid = _otpService.VerifyOtp(request.Email, request.Otp);

        if (isValid)
        {
            return Ok(new OtpResponse { Success = true, Message = "Xác nhận OTP thành công." });
        }
        else
        {
            return BadRequest(new OtpResponse { Success = false, Message = "Mã OTP không chính xác hoặc đã hết hạn." });
        }
    }
}
