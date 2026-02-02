using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public UsersController(GymFinderDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProfile(int id)
    {
        var user = await _context.Users
            .Select(u => new 
            {
                u.Id,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                u.Gender,
                u.Role
            })
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound(new { message = "Người dùng không tồn tại." });

        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UserUpdateDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Người dùng không tồn tại." });

        // Update fields
        user.FullName = dto.FullName ?? user.FullName;
        user.Email = dto.Email ?? user.Email;
        user.PhoneNumber = dto.PhoneNumber;
        user.Gender = dto.Gender;
        

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật hồ sơ thành công!", user });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật hồ sơ: " + ex.Message });
        }
    }

    public class UserUpdateDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Gender { get; set; }
    }
}
