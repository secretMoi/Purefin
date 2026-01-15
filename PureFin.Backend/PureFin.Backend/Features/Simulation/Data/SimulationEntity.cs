
using System.ComponentModel.DataAnnotations;

namespace PureFin.Backend.Features.Simulation.Data;

public class SimulationEntity
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public decimal Revenue { get; set; }
    public decimal GrossSalary { get; set; }
    
    public bool IncludeCar { get; set; }
    public bool IncludeMealVouchers { get; set; }
    public bool IncludeInternet { get; set; }
    public bool IncludeInsurance { get; set; }
    public bool IncludeAccountant { get; set; }
    
    public decimal CalculatedNetSalary { get; set; }
    public decimal CalculatedCompanyTax { get; set; }
}
