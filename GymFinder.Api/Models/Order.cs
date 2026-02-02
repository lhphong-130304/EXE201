namespace GymFinder.Api.Models;
public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
     // Thông tin nhận hàng
    public string FullName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string? Note { get; set; }
    // Thanh toán
    public string PaymentMethod { get; set; } = "COD"; // COD | ONLINE
    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public DateTime OrderDate { get; set; } = DateTime.Now;

    public ICollection<OrderDetail> OrderDetails { get; set; }
        = new List<OrderDetail>();
}
public enum OrderStatus
{
    Pending = 0,        // Chờ xác nhận
    Confirmed = 1,      // Đã xác nhận
    Shipping = 2,       // Đang giao
    Completed = 3,      // Hoàn tất
    Cancelled = 4       // Đã hủy
}
