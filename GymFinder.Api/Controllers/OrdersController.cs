using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymFinder.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public OrdersController(GymFinderDbContext context)
    {
        _context = context;
    }

    // POST: api/orders/checkout
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CreateOrderFromCartRequest request)
    {
        // 1. Lấy cart theo user
        var cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId);

        if (cart == null || cart.CartItems.Count == 0)
        {
            return BadRequest("Giỏ hàng trống");
        }

        // 2. Tạo Order
        var order = new Order
        {
            UserId = request.UserId,
            FullName = request.FullName,
            Phone = request.Phone,
            Address = request.Address,
            Note = request.Note,
            Status = OrderStatus.Pending,
            OrderDate = DateTime.Now
        };

        decimal totalAmount = 0;

        // 3. CartItem → OrderDetail
        foreach (var cartItem in cart.CartItems)
        {
            if (cartItem.Product == null)
                return BadRequest("Sản phẩm không tồn tại");

            // Kiểm tra tồn kho
            if (cartItem.Product.UnitsInStock < cartItem.Quantity)
            {
                return BadRequest($"Sản phẩm '{cartItem.Product.Name}' chỉ còn {cartItem.Product.UnitsInStock} sản phẩm trong kho. Vui lòng cập nhật giỏ hàng.");
            }

            // Giảm số lượng tồn kho
            cartItem.Product.UnitsInStock -= cartItem.Quantity;

            var orderDetail = new OrderDetail
            {
                ProductId = cartItem.ProductId,
                Quantity = cartItem.Quantity,
                Price = cartItem.Product.Price
            };

            totalAmount += cartItem.Quantity * cartItem.Product.Price;
            order.OrderDetails.Add(orderDetail);
        }

        order.TotalAmount = totalAmount;
        order.PaymentMethod = request.PaymentMethod;

        // 4. Lưu Order
        _context.Orders.Add(order);

        // 5. Xóa cart items sau khi đặt hàng
        _context.CartItems.RemoveRange(cart.CartItems);

        await _context.SaveChangesAsync();

        string qrUrl = null;
        if (order.PaymentMethod == "QR")
        {
            // VietQR Template: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<NAME>
            // Using dummy Info (MB Bank - 9999999999 - NGUYEN VAN A)
            string bankId = "MB";
            string accountNo = "0311045678888";
            string template = "compact2";
            string accountName = "Phạm Gia Khải";
            string description = Uri.EscapeDataString($"Thanh toan don hang {order.Id}");

            qrUrl = $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png?amount={(int)order.TotalAmount}&addInfo={description}&accountName={Uri.EscapeDataString(accountName)}";
        }

        return Ok(new
        {
            success = true,
            message = "Đặt hàng thành công",
            orderId = order.Id,
            totalAmount = order.TotalAmount,
            paymentMethod = order.PaymentMethod,
            qrUrl = qrUrl
        });
    }
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetOrdersByUser(int userId)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return Ok(orders);
    }

    // GET: api/orders
    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return Ok(orders);
    }

    // PUT: api/orders/{id}/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDto request)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
        {
            return NotFound("Không tìm thấy đơn hàng");
        }

        if (order.Status == OrderStatus.Completed || order.Status == OrderStatus.Cancelled)
        {
            return BadRequest("Không thể thay đổi trạng thái của đơn hàng đã hoàn tất hoặc đã hủy.");
        }

        order.Status = request.Status;

        // Create notification
        var statusLabel = request.Status switch
        {
            OrderStatus.Pending => "Chờ xác nhận",
            OrderStatus.Confirmed => "Đã được xác nhận",
            OrderStatus.Shipping => "Đang được giao",
            OrderStatus.Completed => "Đã hoàn tất",
            OrderStatus.Cancelled => "Đã bị hủy",
            _ => request.Status.ToString()
        };

        var notification = new Notification
        {
            UserId = order.UserId,
            Message = $"Đơn hàng #{order.Id} của bạn đã {statusLabel}.",
            RelatedType = "Order",
            RelatedId = order.Id,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Cập nhật trạng thái thành công" });
    }
    // PUT: api/orders/{id}/cancel
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound("Không tìm thấy đơn hàng");

        if (order.Status == OrderStatus.Completed)
            return BadRequest("Không thể hủy đơn hàng đã hoàn tất");

        if (order.Status == OrderStatus.Cancelled)
            return BadRequest("Đơn hàng đã được hủy trước đó");

        // Restore stock
        foreach (var detail in order.OrderDetails)
        {
            if (detail.Product != null)
            {
                detail.Product.UnitsInStock += detail.Quantity;
            }
        }

        order.Status = OrderStatus.Cancelled;

        // Notification for user (optional, but good for consistency)
        var notification = new Notification
        {
            UserId = order.UserId,
            Message = $"Đơn hàng #{order.Id} đã được hủy thành công.",
            RelatedType = "Order",
            RelatedId = order.Id,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Hủy đơn hàng thành công" });
    }
}

public class OrderStatusUpdateDto
{
    public OrderStatus Status { get; set; }
}
