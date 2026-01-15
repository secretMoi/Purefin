using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PureFin.Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Simulations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Revenue = table.Column<decimal>(type: "numeric", nullable: false),
                    GrossSalary = table.Column<decimal>(type: "numeric", nullable: false),
                    IncludeCar = table.Column<bool>(type: "boolean", nullable: false),
                    IncludeMealVouchers = table.Column<bool>(type: "boolean", nullable: false),
                    IncludeInternet = table.Column<bool>(type: "boolean", nullable: false),
                    IncludeInsurance = table.Column<bool>(type: "boolean", nullable: false),
                    IncludeAccountant = table.Column<bool>(type: "boolean", nullable: false),
                    CalculatedNetSalary = table.Column<decimal>(type: "numeric", nullable: false),
                    CalculatedCompanyTax = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Simulations", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Simulations");
        }
    }
}
