namespace GymFinder.Api.Models;
public class Badge
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<ProductBadge> ProductBadges { get; set; }
        = new List<ProductBadge>();
}
