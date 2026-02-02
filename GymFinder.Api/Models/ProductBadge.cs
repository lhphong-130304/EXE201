namespace GymFinder.Api.Models;
public class ProductBadge
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int BadgeId { get; set; }
    public Badge Badge { get; set; } = null!;
}
