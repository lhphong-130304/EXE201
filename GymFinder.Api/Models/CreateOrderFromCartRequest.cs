namespace GymFinder.Api.Models;

public class CreateOrderFromCartRequest
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string? Note { get; set; }
    public string PaymentMethod { get; set; } = "COD"; // "COD" or "QR"
}
