using System;
using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GymsController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public GymsController(GymFinderDbContext context)
    {
        _context = context;
    }

    // 1. Lấy danh sách phòng Gym có lọc theo tên/địa chỉ và rating (có phân trang)
    [HttpGet]
    public async Task<ActionResult<object>> GetGyms(string? search = null, double minRating = 0, int page = 1, int pageSize = 9)
    {
        var query = _context.Gyms
            .Include(g => g.Reviews)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(g => g.Name.Contains(search) || (g.Address != null && g.Address.Contains(search)));
        }

        if (minRating > 0)
        {
            query = query.Where(g => g.Rating >= minRating);
        }

        var totalCount = await query.CountAsync();
        
        var gyms = await query
            .OrderByDescending(g => g.Rating)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(g => new {
                g.Id,
                g.Name,
                g.Address,
                g.Description,
                g.Image,
                g.Rating,
                g.PricePerHour,
                reviewCount = g.Reviews.Count
            }).ToListAsync();

        return Ok(new {
            items = gyms,
            totalCount,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            currentPage = page,
            pageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetGymById(int id)
    {
        var gym = await _context.Gyms
            .Include(g => g.Reviews)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (gym == null) return NotFound();

        return Ok(new {
            gym.Id,
            gym.Name,
            gym.Address,
            gym.Description,
            gym.Image,
            gym.Rating,
            gym.PricePerHour,
            reviews = gym.Reviews.Select(r => new {
                r.Id,
                r.Rating,
                r.Comment,
                userName = r.User.FullName,
                date = r.CreatedAt.ToString("dd/MM/yyyy")
            })
        });
    }
}
