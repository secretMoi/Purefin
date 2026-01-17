using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PureFin.Backend.Features.Auth.Services;
using PureFin.Backend.Features.Simulation.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database - Using SQLite for development (easy setup, no external dependencies)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=purefin.db";

if (connectionString.Contains("Host="))
{
    // PostgreSQL for production
    builder.Services.AddDbContext<PureFin.Backend.Data.AppDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    // SQLite for development
    builder.Services.AddDbContext<PureFin.Backend.Data.AppDbContext>(options =>
        options.UseSqlite(connectionString));
}

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Application Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<SimulationService>();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "PureFinSuperSecretKey2026!@#$%^&*()";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "PureFin";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "PureFinUsers";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Auto-migrate database on startup (for development)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PureFin.Backend.Data.AppDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Allow CORS for development
app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

