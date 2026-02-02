using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GymReviewsController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public GymReviewsController(GymFinderDbContext context)
    {
        _context = context;
    }

    public class ReviewRequest
    {
        public int GymId { get; set; }
        public int UserId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    private async Task<bool> HasSuccessfulBooking(int userId, int gymId)
    {
        return await _context.Bookings.AnyAsync(b => 
            b.UserId == userId && 
            b.GymId == gymId && 
            (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Completed));
    }

    [HttpGet("eligible/{gymId}/{userId}")]
    public async Task<IActionResult> GetEligibility(int gymId, int userId)
    {
        var eligible = await HasSuccessfulBooking(userId, gymId);
        return Ok(new 
        { 
            eligible = eligible, 
            message = eligible ? "Bạn có thể đánh giá." : "Bạn cần hoàn thành một lịch tập tại phòng gym này để có thể đánh giá." 
        });
    }

    [HttpPost]
    public async Task<IActionResult> SubmitReview([FromBody] ReviewRequest request)
    {
        // 1. Kiểm tra User và Gym tồn tại
        var user = await _context.Users.FindAsync(request.UserId);
        var gym = await _context.Gyms.FindAsync(request.GymId);

        if (user == null || gym == null)
        {
            return BadRequest(new { message = "User hoặc Gym không tồn tại." });
        }

        // 1.1. Kiểm tra điều kiện có booking thành công
        if (!await HasSuccessfulBooking(request.UserId, request.GymId))
        {
            return BadRequest(new { message = "Bạn cần hoàn thành một lịch tập tại phòng gym này để có thể đánh giá." });
        }

        // 2. Kiểm tra xem đã review chưa (Cập nhật nếu đã có)
        var existingReview = await _context.GymReviews
            .FirstOrDefaultAsync(r => r.GymId == request.GymId && r.UserId == request.UserId);

        if (existingReview != null)
        {
            existingReview.Rating = request.Rating;
            existingReview.Comment = request.Comment;
            existingReview.CreatedAt = DateTime.UtcNow;
            _context.GymReviews.Update(existingReview);
        }
        else
        {
            var newReview = new GymReview
            {
                GymId = request.GymId,
                UserId = request.UserId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };
            _context.GymReviews.Add(newReview);
        }

        await _context.SaveChangesAsync();

        // 3. Cập nhật Rating trung bình của Gym
        var allReviews = await _context.GymReviews
            .Where(r => r.GymId == request.GymId)
            .ToListAsync();

        if (allReviews.Any())
        {
            gym.Rating = Math.Round(allReviews.Average(r => (double)r.Rating), 1);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Gửi đánh giá thành công!", averageRating = gym.Rating });
    }
}
