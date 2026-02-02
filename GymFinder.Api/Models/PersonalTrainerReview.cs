using System;

namespace GymFinder.Api.Models;

public class PersonalTrainerReview
{
    public int Id { get; set; }
    public int TrainerId { get; set; }
    public PersonalTrainer Trainer { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
