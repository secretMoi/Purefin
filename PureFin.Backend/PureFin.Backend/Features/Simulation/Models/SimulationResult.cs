
namespace PureFin.Backend.Features.Simulation.Models;

public record SimulationResult(
    decimal CompanyRevenue,
    decimal CompanyExpenses,
    decimal CompanyTax,
    decimal NetCompanyProfit,
    
    decimal PersonalGrossSalary,
    decimal PersonalTax,
    decimal PersonalSocialSecurity,
    decimal PersonalNetSalary,
    
    decimal TotalPackageValue, 
    List<string> AppliedPerks
);
