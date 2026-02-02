namespace GymFinder.Api.Models;
public class Gym
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Description { get; set; }
    public string? Image { get; set; }
    public double Rating { get; set; } = 5.0;
    public decimal PricePerHour { get; set; } = 50000; 

    public ICollection<GymReview> Reviews { get; set; } = new List<GymReview>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
