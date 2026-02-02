using System.ComponentModel.DataAnnotations;

namespace GymFinder.Api.Models;

public class ProductReview
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int UserId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; } // 1-5 sao
    
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public Product? Product { get; set; }
    public User? User { get; set; }
}
