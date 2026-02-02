namespace GymFinder.Api.Models;
public class GymReview
{
    public int Id { get; set; }
    public int GymId { get; set; }
    public int UserId { get; set; }

    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Gym Gym { get; set; } = null!;
    public User User { get; set; } = null!;
}
