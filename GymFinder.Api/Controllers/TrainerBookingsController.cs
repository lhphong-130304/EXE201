using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainerBookingsController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public TrainerBookingsController(GymFinderDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] TrainerBookingDto dto)
    {
        var trainer = await _context.PersonalTrainers.FindAsync(dto.TrainerId);
        if (trainer == null)
            return NotFound(new { message = "Không tìm thấy huấn luyện viên." });

        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
            return NotFound(new { message = "Người dùng không tồn tại." });

        // Check for double booking
        var isOccupied = await _context.PersonalTrainerBookings
            .AnyAsync(b => b.TrainerId == dto.TrainerId && 
                           b.BookingDate.Date == dto.BookingDate.Date && 
                           b.TimeSlot == dto.TimeSlot &&
                           b.Status != BookingStatus.Cancelled);

        if (isOccupied)
            return BadRequest(new { message = "Khung giờ này đã có người đặt. Vui lòng chọn khung giờ khác." });

        var booking = new PersonalTrainerBooking
        {
            TrainerId = dto.TrainerId,
            UserId = dto.UserId,
            BookingDate = dto.BookingDate,
            TimeSlot = dto.TimeSlot,
            TotalPrice = trainer.PricePerHour,
            Status = BookingStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.PersonalTrainerBookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã gửi yêu cầu thuê huấn luyện viên!", bookingId = booking.Id });
    }

    [HttpGet("occupied")]
    public async Task<ActionResult<IEnumerable<string>>> GetOccupiedSlots(int trainerId, DateTime date)
    {
        var occupiedSlots = await _context.PersonalTrainerBookings
            .Where(b => b.TrainerId == trainerId && 
                        b.BookingDate.Date == date.Date && 
                        b.Status != BookingStatus.Cancelled)
            .Select(b => b.TimeSlot)
            .ToListAsync();

        return Ok(occupiedSlots);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAllBookings()
    {
        return await _context.PersonalTrainerBookings
            .Include(b => b.Trainer)
            .Include(b => b.User)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new {
                b.Id,
                b.TrainerId,
                b.UserId,
                TrainerName = b.Trainer.Name,
                UserName = b.User.FullName,
                b.BookingDate,
                b.TimeSlot,
                b.TotalPrice,
                b.Status,
                StatusLabel = b.Status.ToString(),
                b.CreatedAt
            })
            .ToListAsync();
    }

    [HttpGet("my/{userId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetUserBookings(int userId)
    {
        return await _context.PersonalTrainerBookings
            .Where(b => b.UserId == userId)
            .Include(b => b.Trainer)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new {
                b.Id,
                b.TrainerId,
                b.UserId,
                TrainerName = b.Trainer.Name,
                TrainerImage = b.Trainer.Image,
                b.BookingDate,
                b.TimeSlot,
                b.TotalPrice,
                b.Status,
                StatusLabel = b.Status.ToString(),
                b.CreatedAt
            })
            .ToListAsync();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] BookingStatusUpdateDto dto)
    {
        var booking = await _context.PersonalTrainerBookings.FindAsync(id);
        if (booking == null) return NotFound();

        if (booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled)
        {
            return BadRequest("Không thể thay đổi trạng thái của yêu cầu đã hoàn tất hoặc đã hủy.");
        }

        booking.Status = (BookingStatus)dto.Status;

        // Notification logic
        var statusLabel = (BookingStatus)dto.Status switch
        {
            BookingStatus.Pending => "đang chờ xác nhận",
            BookingStatus.Confirmed => "đã được xác nhận",
            BookingStatus.Cancelled => "đã bị hủy",
            BookingStatus.Completed => "đã hoàn tất",
            _ => dto.Status.ToString()
        };

        var trainerName = await _context.PersonalTrainers.Where(t => t.Id == booking.TrainerId).Select(t => t.Name).FirstOrDefaultAsync();

        var notification = new Notification
        {
            UserId = booking.UserId,
            Message = $"Yêu cầu thuê HLV {trainerName} của bạn {statusLabel}.",
            RelatedType = "TrainerBooking",
            RelatedId = booking.Id,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    // PUT: api/TrainerBookings/{id}/cancel
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var booking = await _context.PersonalTrainerBookings.FindAsync(id);
        if (booking == null) return NotFound("Không tìm thấy yêu cầu thuê PT");

        if (booking.Status == BookingStatus.Completed)
            return BadRequest("Không thể hủy yêu cầu đã hoàn tất");

        if (booking.Status == BookingStatus.Cancelled)
            return BadRequest("Yêu cầu đã được hủy trước đó");

        booking.Status = BookingStatus.Cancelled;

        var trainerName = await _context.PersonalTrainers.Where(t => t.Id == booking.TrainerId).Select(t => t.Name).FirstOrDefaultAsync();

        var notification = new Notification
        {
            UserId = booking.UserId,
            Message = $"Yêu cầu thuê HLV {trainerName} của bạn đã được hủy thành công.",
            RelatedType = "TrainerBooking",
            RelatedId = booking.Id,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Hủy yêu cầu thuê PT thành công" });
    }

    public class TrainerBookingDto
    {
        public int TrainerId { get; set; }
        public int UserId { get; set; }
        public DateTime BookingDate { get; set; }
        public string TimeSlot { get; set; } = string.Empty;
    }

    public class BookingStatusUpdateDto
    {
        public int Status { get; set; }
    }
}
