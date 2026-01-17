namespace PureFin.Backend.Features.Auth.Models;

using PureFin.Backend.Features.Simulation.Data;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation
    public ICollection<SimulationEntity> Simulations { get; set; } = new List<SimulationEntity>();
}

