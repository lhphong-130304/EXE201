using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonalTrainersController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public PersonalTrainersController(GymFinderDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetTrainers()
    {
        return await _context.PersonalTrainers
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Role,
                t.Image,
                t.Address,
                t.Rating,
                t.PricePerHour
            })
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetTrainer(int id)
    {
        var trainer = await _context.PersonalTrainers
            .Include(t => t.Reviews)
            .ThenInclude(r => r.User)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Role,
                t.Image,
                t.Address,
                t.Bio,
                t.PricePerHour,
                t.Rating,
                t.Phone,
                Reviews = t.Reviews.Select(r => new
                {
                    r.Id,
                    r.UserId,
                    UserName = r.User.FullName,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt
                })
            })
            .FirstOrDefaultAsync(t => t.Id == id);

        if (trainer == null)
            return NotFound();

        return trainer;
    }
}
