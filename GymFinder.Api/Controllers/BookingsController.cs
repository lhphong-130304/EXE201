using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public BookingsController(GymFinderDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<Booking>> CreateBooking(BookingDto dto)
    {
        var gym = await _context.Gyms.FindAsync(dto.GymId);
        if (gym == null) return NotFound("Gym not found");

        var booking = new Booking
        {
            GymId = dto.GymId,
            UserId = dto.UserId,
            BookingDate = dto.BookingDate,
            TimeSlot = dto.TimeSlot,
            TotalPrice = gym.PricePerHour, // Simple for now, assuming 1 hour
            Status = BookingStatus.Pending,
            CreatedAt = System.DateTime.UtcNow
        };

        if (booking.TotalPrice == 0) booking.TotalPrice = 50000; // Fallback

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(booking);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAllBookings()
    {
        return await _context.Bookings
            .Include(b => b.Gym)
            .Include(b => b.User)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new {
                b.Id,
                b.GymId,
                gymName = b.Gym.Name,
                b.UserId,
                userName = b.User.FullName,
                b.BookingDate,
                b.TimeSlot,
                b.TotalPrice,
                b.Status,
                statusLabel = b.Status.ToString(),
                b.CreatedAt
            })
            .ToListAsync();
    }

    [HttpGet("my/{userId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetUserBookings(int userId)
    {
        return await _context.Bookings
            .Where(b => b.UserId == userId)
            .Include(b => b.Gym)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new {
                b.Id,
                gymName = b.Gym.Name,
                b.BookingDate,
                b.TimeSlot,
                b.TotalPrice,
                b.Status,
                statusLabel = b.Status.ToString(),
                b.CreatedAt
            })
            .ToListAsync();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] BookingStatusUpdateDto dto)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        if (booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled)
        {
            return BadRequest("Không thể thay đổi trạng thái của lịch đặt đã hoàn tất hoặc đã hủy.");
        }

        booking.Status = (BookingStatus)dto.Status;

        // Create notification
        var statusLabel = (BookingStatus)dto.Status switch
        {
            BookingStatus.Pending => "đang chờ xác nhận",
            BookingStatus.Confirmed => "đã được xác nhận",
            BookingStatus.Cancelled => "đã bị hủy",
            BookingStatus.Completed => "đã hoàn tất",
            _ => dto.Status.ToString()
        };

        var gymName = await _context.Gyms.Where(g => g.Id == booking.GymId).Select(g => g.Name).FirstOrDefaultAsync();

        var notification = new Notification
        {
            UserId = booking.UserId,
            Message = $"Lịch đặt tại {gymName} vào ngày {booking.BookingDate.ToShortDateString()} {statusLabel}.",
            RelatedType = "Booking",
            RelatedId = booking.Id,
            CreatedAt = System.DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    // PUT: api/bookings/{id}/cancel
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound("Không tìm thấy lịch đặt");

        if (booking.Status == BookingStatus.Completed)
            return BadRequest("Không thể hủy lịch đặt đã hoàn tất");

        if (booking.Status == BookingStatus.Cancelled)
            return BadRequest("Lịch đặt đã được hủy trước đó");

        booking.Status = BookingStatus.Cancelled;

        var gymName = await _context.Gyms.Where(g => g.Id == booking.GymId).Select(g => g.Name).FirstOrDefaultAsync();

        var notification = new Notification
        {
            UserId = booking.UserId,
            Message = $"Lịch đặt tại {gymName} của bạn đã được hủy thành công.",
            RelatedType = "Booking",
            RelatedId = booking.Id,
            CreatedAt = System.DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Hủy lịch đặt thành công" });
    }
}

public class BookingDto
{
    public int GymId { get; set; }
    public int UserId { get; set; }
    public System.DateTime BookingDate { get; set; }
    public string TimeSlot { get; set; } = string.Empty;
}

public class BookingStatusUpdateDto
{
    public int Status { get; set; }
}
