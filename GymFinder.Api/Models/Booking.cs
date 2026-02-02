using System;

namespace GymFinder.Api.Models;

public class Booking
{
    public int Id { get; set; }
    public int GymId { get; set; }
    public Gym Gym { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public DateTime BookingDate { get; set; }
    public string TimeSlot { get; set; } = string.Empty; // e.g. "08:00 - 09:00"
    public decimal TotalPrice { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
