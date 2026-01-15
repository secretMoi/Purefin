
using AutoMapper;
using PureFin.Backend.Features.Simulation.Data;
using PureFin.Backend.Features.Simulation.Models;

namespace PureFin.Backend.Features.Simulation;

public class SimulationProfile : Profile
{
    public SimulationProfile()
    {
        CreateMap<SimulationRequest, SimulationEntity>();
    }
}
