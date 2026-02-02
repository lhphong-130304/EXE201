using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainerReviewsController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public TrainerReviewsController(GymFinderDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitReview([FromBody] TrainerReviewDto dto)
    {
        // 1. Check if user already reviewed this PT
        var existing = await _context.PersonalTrainerReviews
            .FirstOrDefaultAsync(r => r.TrainerId == dto.TrainerId && r.UserId == dto.UserId);
        
        if (existing != null)
            return BadRequest(new { message = "Bạn đã đánh giá huấn luyện viên này rồi." });

        // 2. Check if user actually hired this PT (at least one completed booking)
        var hasHired = await _context.PersonalTrainerBookings
            .AnyAsync(b => b.TrainerId == dto.TrainerId && b.UserId == dto.UserId && b.Status == BookingStatus.Completed);
        
        if (!hasHired)
            return BadRequest(new { message = "Bạn chỉ có thể đánh giá sau khi đã hoàn thành buổi tập với HLV." });

        var review = new PersonalTrainerReview
        {
            TrainerId = dto.TrainerId,
            UserId = dto.UserId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.PersonalTrainerReviews.Add(review);
        await _context.SaveChangesAsync();

        // Update PT composite rating
        var trainer = await _context.PersonalTrainers.Include(t => t.Reviews).FirstOrDefaultAsync(t => t.Id == dto.TrainerId);
        if (trainer != null && trainer.Reviews.Any())
        {
            trainer.Rating = trainer.Reviews.Average(r => r.Rating);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Cảm ơn bạn đã gửi đánh giá!", rating = trainer?.Rating });
    }

    public class TrainerReviewDto
    {
        public int TrainerId { get; set; }
        public int UserId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}
