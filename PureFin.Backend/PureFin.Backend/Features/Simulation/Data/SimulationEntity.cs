
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PureFin.Backend.Features.Auth.Models;

namespace PureFin.Backend.Features.Simulation.Data;

public class SimulationEntity
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    public string Name { get; set; } = "Ma Simulation";
    
    // Foreign key to User
    public Guid? UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
    
    // Revenue inputs
    public decimal Revenue { get; set; }
    public decimal GrossSalaryMonthly { get; set; }
    
    // Expense inputs (monthly)
    public decimal InsuranceAnnual { get; set; }
    public decimal PhoneMonthly { get; set; }
    public decimal InternetMonthly { get; set; }
    public decimal CarMonthly { get; set; }
    public decimal MealVouchersMonthly { get; set; }
    public decimal RestaurantMonthly { get; set; }
    public decimal PensionAnnual { get; set; }
    public decimal OtherAnnual { get; set; }
    
    // Calculated results (stored for history)
    public decimal CalculatedNetAnnual { get; set; }
    public decimal CalculatedSocialContributions { get; set; }
    public decimal CalculatedIPP { get; set; }
    public decimal CalculatedCorpTax { get; set; }
    public decimal CalculatedReserves { get; set; }
}
