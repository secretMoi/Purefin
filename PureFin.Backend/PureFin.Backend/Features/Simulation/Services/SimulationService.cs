
namespace PureFin.Backend.Features.Simulation.Services;

using PureFin.Backend.Features.Simulation.Models;
using PureFin.Backend.Features.Simulation.Data;

public interface ISimulationService
{
    SimulationResult Calculate(SimulationRequest request);
}

public class SimulationService : ISimulationService
{
    public SimulationResult Calculate(SimulationRequest request)
    {
        // Constants (Simulated Belgian Rules 2024ish)
        const decimal CorpTaxRate = 0.20m; // SME reduced rate
        const decimal PatronalSocialSecRate = 0.25m; // Approx
        const decimal EmployeeSocialSecRate = 0.1307m;
        
        // Costs
        decimal perksCost = 0;
        var appliedPerks = new List<string>();
        
        if (request.IncludeCar) { perksCost += 6000; appliedPerks.Add("Company Car (6k)"); }
        if (request.IncludeMealVouchers) { perksCost += 1500; appliedPerks.Add("Meal Vouchers (1.5k)"); }
        if (request.IncludeInternet) { perksCost += 600; appliedPerks.Add("Internet (600)"); }
        if (request.IncludeInsurance) { perksCost += 2500; appliedPerks.Add("Hospitalization (2.5k)"); }
        if (request.IncludeAccountant) { perksCost += 3000; appliedPerks.Add("Accountant (3k)"); } 
        
        decimal grossSalary = request.GrossSalary;
        decimal patronalCost = grossSalary * PatronalSocialSecRate;
        
        decimal totalCompanyExpenses = grossSalary + patronalCost + perksCost;
        
        decimal taxableCompanyIncome = request.TotalRevenue - totalCompanyExpenses;
        if (taxableCompanyIncome < 0) taxableCompanyIncome = 0;
        
        decimal companyTax = taxableCompanyIncome * CorpTaxRate;
        decimal netCompanyProfit = taxableCompanyIncome - companyTax;
        
        // Personal
        decimal personalSocialSec = grossSalary * EmployeeSocialSecRate;
        decimal taxablePersonal = grossSalary - personalSocialSec;
        
        // Progressive tax (simplified)
        decimal personalTax = CalculatePersonalTax(taxablePersonal);
        
        decimal netSalary = taxablePersonal - personalTax;
        
        // Total Package (Net + value of benefits)
        decimal perksValue = 0;
        if (request.IncludeCar) perksValue += 5000; 
        if (request.IncludeMealVouchers) perksValue += 1500;
        if (request.IncludeInternet) perksValue += 600;
        if (request.IncludeInsurance) perksValue += 2500;

        return new SimulationResult(
            request.TotalRevenue,
            totalCompanyExpenses,
            companyTax,
            netCompanyProfit,
            grossSalary,
            personalTax,
            personalSocialSec,
            netSalary,
            netSalary + perksValue,
            appliedPerks
        );
    }
    
    private decimal CalculatePersonalTax(decimal taxable)
    {
        // Simplified bands
        // 0 - 15200 : 25%
        // 15200 - 26830 : 40%
        // 26830 - 46440 : 45%
        // > 46440 : 50%
        
        decimal tax = 0;
        
        // Band 1
        decimal b1 = Math.Min(taxable, 15200);
        tax += b1 * 0.25m;
        
        if (taxable > 15200) {
            decimal b2 = Math.Min(taxable - 15200, 26830 - 15200);
            tax += b2 * 0.40m;
        }
        
        if (taxable > 26830) {
            decimal b3 = Math.Min(taxable - 26830, 46440 - 26830);
            tax += b3 * 0.45m;
        }
        
        if (taxable > 46440) {
            decimal b4 = taxable - 46440;
            tax += b4 * 0.50m;
        }
        
        // Tax free allowance approx impact
        tax -= 2500; 
        
        if (tax < 0) tax = 0;
        return tax;
    }
}
