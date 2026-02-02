using GymFinder.Api.Data;
using GymFinder.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GymFinder.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BadgeController : ControllerBase
    {
        private readonly GymFinderDbContext _context;

        public BadgeController(GymFinderDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetBadges()
        {
            var badges = _context.Badges.ToList();
            return Ok(badges);
        }

    }
}
