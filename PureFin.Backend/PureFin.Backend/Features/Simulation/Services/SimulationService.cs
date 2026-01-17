using Microsoft.EntityFrameworkCore;
using PureFin.Backend.Data;
using PureFin.Backend.Features.Simulation.Data;
using PureFin.Backend.Features.Simulation.Dto;

namespace PureFin.Backend.Features.Simulation.Services;

public class SimulationService
{
    private readonly AppDbContext _context;

    public SimulationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SimulationListResponse> GetUserSimulationsAsync(Guid userId)
    {
        var simulations = await _context.Simulations
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.UpdatedAt ?? s.CreatedAt)
            .Select(s => new SimulationDto(
                s.Id,
                s.Name,
                s.CreatedAt,
                s.UpdatedAt,
                s.Revenue,
                s.GrossSalaryMonthly,
                s.InsuranceAnnual,
                s.PhoneMonthly,
                s.InternetMonthly,
                s.CarMonthly,
                s.MealVouchersMonthly,
                s.RestaurantMonthly,
                s.PensionAnnual,
                s.OtherAnnual,
                s.CalculatedNetAnnual,
                s.CalculatedSocialContributions,
                s.CalculatedIPP,
                s.CalculatedCorpTax,
                s.CalculatedReserves
            ))
            .ToListAsync();

        return new SimulationListResponse(simulations, simulations.Count);
    }

    public async Task<SimulationDto?> GetSimulationAsync(Guid simulationId, Guid userId)
    {
        return await _context.Simulations
            .Where(s => s.Id == simulationId && s.UserId == userId)
            .Select(s => new SimulationDto(
                s.Id,
                s.Name,
                s.CreatedAt,
                s.UpdatedAt,
                s.Revenue,
                s.GrossSalaryMonthly,
                s.InsuranceAnnual,
                s.PhoneMonthly,
                s.InternetMonthly,
                s.CarMonthly,
                s.MealVouchersMonthly,
                s.RestaurantMonthly,
                s.PensionAnnual,
                s.OtherAnnual,
                s.CalculatedNetAnnual,
                s.CalculatedSocialContributions,
                s.CalculatedIPP,
                s.CalculatedCorpTax,
                s.CalculatedReserves
            ))
            .FirstOrDefaultAsync();
    }

    public async Task<SimulationDto> SaveSimulationAsync(SaveSimulationRequest request, Guid userId)
    {
        SimulationEntity entity;

        if (request.Id.HasValue)
        {
            entity = await _context.Simulations.FirstOrDefaultAsync(s => s.Id == request.Id.Value && s.UserId == userId)
                     ?? throw new InvalidOperationException("Simulation not found");
            
            entity.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            entity = new SimulationEntity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Simulations.Add(entity);
        }

        entity.Name = request.Name;
        entity.Revenue = request.Revenue;
        entity.GrossSalaryMonthly = request.GrossSalaryMonthly;
        entity.InsuranceAnnual = request.InsuranceAnnual;
        entity.PhoneMonthly = request.PhoneMonthly;
        entity.InternetMonthly = request.InternetMonthly;
        entity.CarMonthly = request.CarMonthly;
        entity.MealVouchersMonthly = request.MealVouchersMonthly;
        entity.RestaurantMonthly = request.RestaurantMonthly;
        entity.PensionAnnual = request.PensionAnnual;
        entity.OtherAnnual = request.OtherAnnual;
        entity.CalculatedNetAnnual = request.CalculatedNetAnnual;
        entity.CalculatedSocialContributions = request.CalculatedSocialContributions;
        entity.CalculatedIPP = request.CalculatedIPP;
        entity.CalculatedCorpTax = request.CalculatedCorpTax;
        entity.CalculatedReserves = request.CalculatedReserves;

        await _context.SaveChangesAsync();

        return new SimulationDto(
            entity.Id,
            entity.Name,
            entity.CreatedAt,
            entity.UpdatedAt,
            entity.Revenue,
            entity.GrossSalaryMonthly,
            entity.InsuranceAnnual,
            entity.PhoneMonthly,
            entity.InternetMonthly,
            entity.CarMonthly,
            entity.MealVouchersMonthly,
            entity.RestaurantMonthly,
            entity.PensionAnnual,
            entity.OtherAnnual,
            entity.CalculatedNetAnnual,
            entity.CalculatedSocialContributions,
            entity.CalculatedIPP,
            entity.CalculatedCorpTax,
            entity.CalculatedReserves
        );
    }

    public async Task<bool> DeleteSimulationAsync(Guid simulationId, Guid userId)
    {
        var entity = await _context.Simulations.FirstOrDefaultAsync(s => s.Id == simulationId && s.UserId == userId);
        if (entity == null) return false;

        _context.Simulations.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
