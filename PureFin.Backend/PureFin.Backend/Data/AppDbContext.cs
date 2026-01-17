
using Microsoft.EntityFrameworkCore;
using PureFin.Backend.Features.Auth.Models;
using PureFin.Backend.Features.Simulation.Data;

namespace PureFin.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<SimulationEntity> Simulations { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).HasMaxLength(256);
        });
        
        modelBuilder.Entity<SimulationEntity>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.HasOne(s => s.User)
                  .WithMany(u => u.Simulations)
                  .HasForeignKey(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
