namespace GymFinder.Api.Models;
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string HoverImage { get; set; } = string.Empty;

    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int UnitsInStock { get; set; }
    public double Rating { get; set; }
    public string Description { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public int GymId { get; set; }
    public Gym Gym { get; set; } = null!;

    public ICollection<ProductBadge> ProductBadges { get; set; }
        = new List<ProductBadge>();

    public ICollection<ProductReview> ProductReviews { get; set; }
        = new List<ProductReview>();
}
