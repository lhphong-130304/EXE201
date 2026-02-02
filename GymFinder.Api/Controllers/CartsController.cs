using Microsoft.AspNetCore.Mvc;
using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace GymFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartsController : ControllerBase
{
    private readonly GymFinderDbContext _context;

    public CartsController(GymFinderDbContext context)
    {
        _context = context;
    }

    // GET: api/carts?userId=1
    [HttpGet]
    public async Task<IActionResult> GetCart(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            return Ok(new List<object>()); // Empty cart
        }

        var result = cart.CartItems.Select(ci => new
        {
            id = ci.Product.Id,
            name = ci.Product.Name,
            price = ci.Product.Price.ToString("N0") + "đ",
            image = ci.Product.Image.StartsWith("http") ? ci.Product.Image : $"assets/images/shop/{ci.Product.Image}",
            quantity = ci.Quantity
        });

        return Ok(result);
    }

    // POST: api/carts/add
    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId);

        if (cart == null)
        {
            cart = new Cart { UserId = request.UserId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null) return NotFound("Sản phẩm không tồn tại");

        var cartItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == request.ProductId);
        int currentQty = cartItem?.Quantity ?? 0;
        int totalRequested = currentQty + request.Quantity;

        if (totalRequested > product.UnitsInStock)
        {
            return BadRequest($"Rất tiếc, sản phẩm này chỉ còn {product.UnitsInStock} trong kho.");
        }

        if (cartItem != null)
        {
            cartItem.Quantity = totalRequested;
        }
        else
        {
            cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };
            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    // POST: api/carts/update
    [HttpPost("update")]
    public async Task<IActionResult> UpdateQuantity([FromBody] UpdateCartRequest request)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId);

        if (cart == null) return NotFound("Cart not found");

        var cartItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == request.ProductId);
        if (cartItem != null)
        {
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product != null && request.Quantity > product.UnitsInStock)
            {
                return BadRequest($"Số lượng yêu cầu vượt quá tồn kho ({product.UnitsInStock}).");
            }

            cartItem.Quantity = request.Quantity;
            if (cartItem.Quantity <= 0)
            {
                _context.CartItems.Remove(cartItem);
            }
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true });
    }

    // DELETE: api/carts/remove?userId=1&productId=1
    [HttpDelete("remove")]
    public async Task<IActionResult> RemoveFromCart(int userId, int productId)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart != null)
        {
            var cartItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
            if (cartItem != null)
            {
                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
            }
        }

        return Ok(new { success = true });
    }
}

public class AddToCartRequest
{
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateCartRequest
{
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
