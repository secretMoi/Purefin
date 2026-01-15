
namespace PureFin.Backend.Features.Simulation;

using Microsoft.AspNetCore.Mvc;
using PureFin.Backend.Features.Simulation.Models;
using PureFin.Backend.Features.Simulation.Services;
using PureFin.Backend.Features.Simulation.Data;
using PureFin.Backend.Data;

[ApiController]
[Route("api/[controller]")]
public class SimulationController : ControllerBase
{
    private readonly ISimulationService _simulationService;
    private readonly AppDbContext _context;
    private readonly AutoMapper.IMapper _mapper;
    
    public SimulationController(ISimulationService simulationService, AppDbContext context, AutoMapper.IMapper mapper)
    {
        _simulationService = simulationService;
        _context = context;
        _mapper = mapper;
    }
    
    [HttpPost("calculate")]
    public async Task<ActionResult<SimulationResult>> Calculate([FromBody] SimulationRequest request)
    {
        var result = _simulationService.Calculate(request);
        
        // Save history
        var entity = _mapper.Map<SimulationEntity>(request);
        entity.CalculatedNetSalary = result.PersonalNetSalary;
        entity.CalculatedCompanyTax = result.CompanyTax;
        
        _context.Simulations.Add(entity);
        await _context.SaveChangesAsync();
        
        return Ok(result);
    }
}
