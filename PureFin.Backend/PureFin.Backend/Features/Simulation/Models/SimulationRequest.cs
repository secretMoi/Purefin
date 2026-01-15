
namespace PureFin.Backend.Features.Simulation.Models;

public record SimulationRequest(
    decimal TotalRevenue,
    decimal GrossSalary,
    bool IncludeCar,
    bool IncludeMealVouchers,
    bool IncludeInternet,
    bool IncludeInsurance,
    bool IncludeAccountant
);
