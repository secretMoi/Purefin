
using Microsoft.EntityFrameworkCore;
using PureFin.Backend.Features.Simulation.Data;

namespace PureFin.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    public DbSet<SimulationEntity> Simulations { get; set; }
}
