namespace GymFinder.Api.Models;
public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "USER";
    public string? PhoneNumber { get; set; }
    public string? Gender { get; set; }

    public ICollection<Gym> OwnedGyms { get; set; } = new List<Gym>();
    public ICollection<GymReview> GymReviews { get; set; } = new List<GymReview>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<ProductReview> ProductReviews { get; set; } = new List<ProductReview>();
}
