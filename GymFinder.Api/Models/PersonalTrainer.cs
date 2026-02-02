using System.Collections.Generic;

namespace GymFinder.Api.Models;

public class PersonalTrainer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "Huấn luyện viên";
    public string Image { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public decimal PricePerHour { get; set; }
    public double Rating { get; set; } = 0;
    public string Phone { get; set; } = string.Empty;

    public ICollection<PersonalTrainerReview> Reviews { get; set; } = new List<PersonalTrainerReview>();
}
