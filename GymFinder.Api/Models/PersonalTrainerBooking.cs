using System;

namespace GymFinder.Api.Models;

public class PersonalTrainerBooking
{
    public int Id { get; set; }
    public int TrainerId { get; set; }
    public PersonalTrainer Trainer { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime BookingDate { get; set; }
    public string TimeSlot { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
