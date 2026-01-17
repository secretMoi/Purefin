using System.ComponentModel.DataAnnotations;

namespace PureFin.Backend.Features.Auth.Dto;

public record RegisterRequest(
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password,
    [Required] string FirstName,
    [Required] string LastName
);

public record LoginRequest(
    [Required][EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponse(
    string Token,
    string Email,
    string FirstName,
    string LastName,
    DateTime ExpiresAt
);
