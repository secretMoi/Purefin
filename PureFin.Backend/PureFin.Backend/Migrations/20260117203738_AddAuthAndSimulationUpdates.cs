using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PureFin.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthAndSimulationUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IncludeAccountant",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "IncludeCar",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "IncludeInsurance",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "IncludeInternet",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "IncludeMealVouchers",
                table: "Simulations");

            migrationBuilder.RenameColumn(
                name: "GrossSalary",
                table: "Simulations",
                newName: "RestaurantMonthly");

            migrationBuilder.RenameColumn(
                name: "CalculatedNetSalary",
                table: "Simulations",
                newName: "PhoneMonthly");

            migrationBuilder.RenameColumn(
                name: "CalculatedCompanyTax",
                table: "Simulations",
                newName: "PensionAnnual");

            migrationBuilder.AddColumn<decimal>(
                name: "CalculatedCorpTax",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CalculatedIPP",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CalculatedNetAnnual",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CalculatedReserves",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CalculatedSocialContributions",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CarMonthly",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "GrossSalaryMonthly",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "InsuranceAnnual",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "InternetMonthly",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MealVouchersMonthly",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Simulations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "OtherAnnual",
                table: "Simulations",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Simulations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Simulations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Simulations_UserId",
                table: "Simulations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Simulations_Users_UserId",
                table: "Simulations",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Simulations_Users_UserId",
                table: "Simulations");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Simulations_UserId",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "CalculatedCorpTax",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "CalculatedIPP",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "CalculatedNetAnnual",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "CalculatedReserves",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "CalculatedSocialContributions",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "CarMonthly",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "GrossSalaryMonthly",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "InsuranceAnnual",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "InternetMonthly",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "MealVouchersMonthly",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "OtherAnnual",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Simulations");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Simulations");

            migrationBuilder.RenameColumn(
                name: "RestaurantMonthly",
                table: "Simulations",
                newName: "GrossSalary");

            migrationBuilder.RenameColumn(
                name: "PhoneMonthly",
                table: "Simulations",
                newName: "CalculatedNetSalary");

            migrationBuilder.RenameColumn(
                name: "PensionAnnual",
                table: "Simulations",
                newName: "CalculatedCompanyTax");

            migrationBuilder.AddColumn<bool>(
                name: "IncludeAccountant",
                table: "Simulations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IncludeCar",
                table: "Simulations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IncludeInsurance",
                table: "Simulations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IncludeInternet",
                table: "Simulations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IncludeMealVouchers",
                table: "Simulations",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
