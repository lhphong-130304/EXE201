using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public AuthController(GymFinderDbContext context)
    {
        _context = context;
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
    public async Task<ActionResult<AuthResponse>> Register([FromBody] User user)
    {
        Console.WriteLine($"Registering user: {user.Email}");
        try
        {
            if (string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.PasswordHash))
            {
                Console.WriteLine("Register failed: Email or PasswordHash is null/empty.");
                return BadRequest(new AuthResponse { Success = false, Message = "Email và mật khẩu là bắt buộc." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            {
                Console.WriteLine($"Register failed: Email {user.Email} already exists.");
                return BadRequest(new AuthResponse { Success = false, Message = "Email đã tồn tại." });
            }

            // Set default role if not provided
            if (string.IsNullOrEmpty(user.Role))
            {
                user.Role = "USER";
            }

            // Ensure Id is 0 for new user
            user.Id = 0;

            Console.WriteLine($"Total users before: {await _context.Users.CountAsync()}");
            Console.WriteLine("Adding user to context...");
            _context.Users.Add(user);
            
            Console.WriteLine("Saving changes to database...");
            var result = await _context.SaveChangesAsync();
            Console.WriteLine($"Changes saved. Rows affected: {result}");
            Console.WriteLine($"Total users after: {await _context.Users.CountAsync()}");

            return Ok(new AuthResponse 
            { 
                Success = true, 
                Message = "Đăng ký thành công.",
                User = user
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine("CRITICAL ERROR DURING REGISTRATION:");
            Console.WriteLine(ex.ToString());
            return StatusCode(500, new AuthResponse { Success = false, Message = "Lỗi server: " + ex.Message });
        }
    }
}
