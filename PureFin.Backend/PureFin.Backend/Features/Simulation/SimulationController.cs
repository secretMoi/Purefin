using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PureFin.Backend.Features.Simulation.Dto;
using PureFin.Backend.Features.Simulation.Services;

namespace PureFin.Backend.Features.Simulation;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SimulationController : ControllerBase
{
    private readonly SimulationService _simulationService;

    public SimulationController(SimulationService simulationService)
    {
        _simulationService = simulationService;
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? Guid.Parse(claim.Value) : throw new UnauthorizedAccessException();
    }

    [HttpGet]
    public async Task<ActionResult<SimulationListResponse>> GetSimulations()
    {
        var userId = GetUserId();
        var result = await _simulationService.GetUserSimulationsAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SimulationDto>> GetSimulation(Guid id)
    {
        var userId = GetUserId();
        var result = await _simulationService.GetSimulationAsync(id, userId);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<SimulationDto>> SaveSimulation([FromBody] SaveSimulationRequest request)
    {
        var userId = GetUserId();
        var result = await _simulationService.SaveSimulationAsync(request, userId);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSimulation(Guid id)
    {
        var userId = GetUserId();
        var deleted = await _simulationService.DeleteSimulationAsync(id, userId);
        
        if (!deleted)
            return NotFound();
            
        return NoContent();
    }
}
