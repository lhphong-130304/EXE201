using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymFinder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGymBookingSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PricePerHour",
                table: "Gyms",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GymId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    BookingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeSlot = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Gyms_GymId",
                        column: x => x.GymId,
                        principalTable: "Gyms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "GymReviews",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 2, 4, 47, 14, 953, DateTimeKind.Utc).AddTicks(1402));

            migrationBuilder.UpdateData(
                table: "GymReviews",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 2, 4, 47, 14, 953, DateTimeKind.Utc).AddTicks(1700));

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 1,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 2,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 3,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 4,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 5,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 6,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 7,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 8,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 9,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 10,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 11,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 12,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 13,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 14,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 15,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 16,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 17,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 18,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 19,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 20,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 21,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 22,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 23,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 24,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 25,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 26,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 27,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 28,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 29,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 30,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 31,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 32,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 33,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 34,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 35,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 36,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 37,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 38,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 39,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 40,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 41,
                column: "PricePerHour",
                value: 60000m);

            migrationBuilder.UpdateData(
                table: "Gyms",
                keyColumn: "Id",
                keyValue: 42,
                column: "PricePerHour",
                value: 50000m);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_GymId",
                table: "Bookings",
                column: "GymId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserId",
                table: "Bookings",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropColumn(
                name: "PricePerHour",
                table: "Gyms");

            migrationBuilder.UpdateData(
                table: "GymReviews",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 1, 1, 49, 42, 834, DateTimeKind.Utc).AddTicks(6725));

            migrationBuilder.UpdateData(
                table: "GymReviews",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 1, 1, 49, 42, 834, DateTimeKind.Utc).AddTicks(6986));
        }
    }
}
