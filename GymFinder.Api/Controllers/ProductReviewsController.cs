using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductReviewsController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public ProductReviewsController(GymFinderDbContext context)
    {
        _context = context;
    }

    // POST: api/productreviews
    [HttpPost]
    public async Task<IActionResult> SubmitReview([FromBody] CreateProductReviewRequest request)
    {
        // 1. Kiểm tra User
        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null) return BadRequest("Người dùng không tồn tại");

        // 2. Kiểm tra Product
        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null) return BadRequest("Sản phẩm không tồn tại");

        // 3. KIỂM TRA QUYỀN ĐÁNH GIÁ (Phải có đơn hàng status Completed chứa sản phẩm này)
        var hasPurchased = await _context.Orders
            .Include(o => o.OrderDetails)
            .AnyAsync(o => o.UserId == request.UserId && 
                           o.Status == OrderStatus.Completed && 
                           o.OrderDetails.Any(od => od.ProductId == request.ProductId));

        if (!hasPurchased)
        {
            return BadRequest("Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã hoàn tất.");
        }

        // 4. Kiểm tra xem đã đánh giá chưa (mỗi user 1 sản phẩm 1 đánh giá?)
        // Tạm thời cho phép đánh giá nhiều lần hoặc update? 
        // Thường là 1 sản phẩm 1 review.
        var existingReview = await _context.ProductReviews
            .FirstOrDefaultAsync(pr => pr.UserId == request.UserId && pr.ProductId == request.ProductId);

        if (existingReview != null)
        {
            // Cập nhật đánh giá cũ
            existingReview.Rating = request.Rating;
            existingReview.Comment = request.Comment;
            existingReview.CreatedAt = DateTime.Now;
        }
        else
        {
            // Tạo đánh giá mới
            var review = new ProductReview
            {
                ProductId = request.ProductId,
                UserId = request.UserId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.Now
            };
            _context.ProductReviews.Add(review);
        }

        await _context.SaveChangesAsync();

        // 5. Cập nhật Rating trung bình của Product
        var allReviews = await _context.ProductReviews
            .Where(pr => pr.ProductId == request.ProductId)
            .ToListAsync();
        
        if (allReviews.Any())
        {
            // Tính trung bình cộng và làm tròn 1 chữ số thập phân (VD: 4.5)
            product.Rating = Math.Round(allReviews.Average(pr => (double)pr.Rating), 1);
        }
        else
        {
            product.Rating = 5; // Mặc định 5 hoặc 0 tùy logic
        }
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Cảm ơn bạn đã đánh giá sản phẩm!" });
    }

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetProductReviews(int productId)
    {
        var reviews = await _context.ProductReviews
            .Include(pr => pr.User)
            .Where(pr => pr.ProductId == productId)
            .OrderByDescending(pr => pr.CreatedAt)
            .Select(pr => new {
                pr.Id,
                pr.Rating,
                pr.Comment,
                pr.CreatedAt,
                UserName = pr.User.FullName
            })
            .ToListAsync();

        return Ok(reviews);
    }
}

public class CreateProductReviewRequest
{
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
