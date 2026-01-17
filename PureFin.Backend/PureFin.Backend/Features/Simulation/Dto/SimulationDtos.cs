namespace PureFin.Backend.Features.Simulation.Dto;

public record SimulationDto(
    Guid Id,
    string Name,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    
    // Inputs
    decimal Revenue,
    decimal GrossSalaryMonthly,
    decimal InsuranceAnnual,
    decimal PhoneMonthly,
    decimal InternetMonthly,
    decimal CarMonthly,
    decimal MealVouchersMonthly,
    decimal RestaurantMonthly,
    decimal PensionAnnual,
    decimal OtherAnnual,
    
    // Results
    decimal CalculatedNetAnnual,
    decimal CalculatedSocialContributions,
    decimal CalculatedIPP,
    decimal CalculatedCorpTax,
    decimal CalculatedReserves
);

public record SaveSimulationRequest(
    Guid? Id,
    string Name,
    
    decimal Revenue,
    decimal GrossSalaryMonthly,
    decimal InsuranceAnnual,
    decimal PhoneMonthly,
    decimal InternetMonthly,
    decimal CarMonthly,
    decimal MealVouchersMonthly,
    decimal RestaurantMonthly,
    decimal PensionAnnual,
    decimal OtherAnnual,
    
    // Pre-calculated on frontend
    decimal CalculatedNetAnnual,
    decimal CalculatedSocialContributions,
    decimal CalculatedIPP,
    decimal CalculatedCorpTax,
    decimal CalculatedReserves
);

public record SimulationListResponse(
    List<SimulationDto> Simulations,
    int TotalCount
);
