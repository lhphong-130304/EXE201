using Microsoft.AspNetCore.Mvc;
using GymFinder.Api.Models;
using GymFinder.Api.Data;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly GymFinderDbContext _context;
    
    public ProductsController(GymFinderDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public IActionResult GetProducts([FromQuery] bool includeOutOfStock = false)
    {
        var query = _context.Products.Include(p => p.Category)
            .Include(p => p.ProductBadges)
            .ThenInclude(pb => pb.Badge)
            .Include(p => p.ProductReviews)
            .AsQueryable();

        if (!includeOutOfStock)
        {
            query = query.Where(p => p.UnitsInStock > 0);
        }

        var products = query.ToList()
            .Select(p => new
            {
                id = p.Id,
                name = p.Name,
                image = p.Image.StartsWith("http") ? p.Image : $"assets/images/shop/{p.Image}",
                hoverImage = string.IsNullOrEmpty(p.HoverImage) ? "" : (p.HoverImage.StartsWith("http") ? p.HoverImage : $"assets/images/shop/{p.HoverImage}"),
                price = p.Price.ToString("N0") + "đ",
                numericPrice = p.Price,
                originalPrice = p.OriginalPrice.HasValue ? p.OriginalPrice.Value.ToString("N0") + "đ" : null,
                rating = p.ProductReviews.Any() ? Math.Round(p.ProductReviews.Average(r => (double)r.Rating), 1) : p.Rating,
                reviewCount = p.ProductReviews.Count,
                badges = p.ProductBadges.Select(pb => pb.Badge.Name).ToList(),
                categoryId = p.CategoryId,              
                categoryName = p.Category?.Name ?? "General",
                unitsInStock = p.UnitsInStock,
                description = p.Description,
                link = "product-details.html"
            });

        return Ok(products);
    }
    
    [HttpGet("{id}")]
    public IActionResult GetProductById(int id)
    {
        var product = _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductBadges)
                .ThenInclude(pb => pb.Badge)
            .Include(p => p.ProductReviews)
            .FirstOrDefault(p => p.Id == id);
        
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID {id} not found" });
        }

        double averageRating = product.ProductReviews.Any() 
            ? Math.Round(product.ProductReviews.Average(r => (double)r.Rating), 1) 
            : product.Rating;
        
        var productDetail = new
        {
            id = product.Id,
            name = product.Name,
            description = product.Description,
            image = product.Image.StartsWith("http") ? product.Image : $"assets/images/shop/{product.Image}",
            price = product.Price.ToString("N0") + "đ",
            originalPrice = product.OriginalPrice.HasValue ? product.OriginalPrice.Value.ToString("N0") + "đ" : null,
            unitsInStock = product.UnitsInStock,
            rating = averageRating,
            reviewCount = product.ProductReviews.Count,
            category = product.Category?.Name ?? "Uncategorized",
            categoryId = product.CategoryId,
            reviews = product.ProductReviews.OrderByDescending(r => r.CreatedAt).Select(r => new {
                id = r.Id,
                rating = r.Rating,
                comment = r.Comment,
                date = r.CreatedAt.ToString("dd/MM/yyyy")
            }).ToList()
        };
        
        return Ok(productDetail);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name,
            Image = request.Image ?? "product-placeholder.jpg",
            Price = request.Price,
            UnitsInStock = request.UnitsInStock,
            CategoryId = request.CategoryId,
            Description = request.Description ?? $"Mô tả cho {request.Name}",
            Rating = 5.0,
            GymId = 1 // Default
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return Ok(new { success = true, product });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound("Sản phẩm không tồn tại");

        if (!string.IsNullOrEmpty(request.Name)) product.Name = request.Name;
        product.Price = request.Price;
        product.UnitsInStock = request.UnitsInStock;
        if (request.CategoryId > 0) product.CategoryId = request.CategoryId;
        if (!string.IsNullOrEmpty(request.Image)) product.Image = request.Image;
        if (request.Description != null) product.Description = request.Description;

        await _context.SaveChangesAsync();
        return Ok(new { success = true, product });
    }

    [HttpPut("{id}/stock")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateStockRequest request)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound("Sản phẩm không tồn tại");

        product.UnitsInStock = request.UnitsInStock;
        await _context.SaveChangesAsync();
        return Ok(new { success = true, unitsInStock = product.UnitsInStock });
    }
}

public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Image { get; set; }
    public decimal Price { get; set; }
    public int UnitsInStock { get; set; }
    public int CategoryId { get; set; }
    public string? Description { get; set; }
}

public class UpdateProductRequest
{
    public string? Name { get; set; }
    public decimal Price { get; set; }
    public int UnitsInStock { get; set; }
    public int CategoryId { get; set; }
    public string? Image { get; set; }
    public string? Description { get; set; }
}

public class UpdateStockRequest
{
    public int UnitsInStock { get; set; }
}
