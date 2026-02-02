using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GymFinder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPTHiringSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PersonalTrainers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PricePerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rating = table.Column<double>(type: "float", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalTrainers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PersonalTrainerBookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TrainerId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    BookingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeSlot = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalTrainerBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalTrainerBookings_PersonalTrainers_TrainerId",
                        column: x => x.TrainerId,
                        principalTable: "PersonalTrainers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PersonalTrainerBookings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PersonalTrainerReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TrainerId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalTrainerReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalTrainerReviews_PersonalTrainers_TrainerId",
                        column: x => x.TrainerId,
                        principalTable: "PersonalTrainers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PersonalTrainerReviews_Users_UserId",
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
                value: new DateTime(2026, 2, 2, 10, 13, 44, 153, DateTimeKind.Utc).AddTicks(2740));

            migrationBuilder.UpdateData(
                table: "GymReviews",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 2, 10, 13, 44, 153, DateTimeKind.Utc).AddTicks(3051));

            migrationBuilder.InsertData(
                table: "PersonalTrainers",
                columns: new[] { "Id", "Address", "Bio", "Image", "Name", "Phone", "PricePerHour", "Rating", "Role" },
                values: new object[,]
                {
                    { 1, "California Fitness & Yoga, Láng Hạ", "Chuyên gia về tăng cơ và giảm mỡ với hơn 5 năm kinh nghiệm. Đã giúp hơn 100 học viên đạt được vóc dáng mơ ước qua các lộ trình cá nhân hóa.", "assets/images/team/hlv/1.png", "Tài Nguyễn", "0987111222", 500000m, 4.9000000000000004, "Huấn luyện viên" },
                    { 2, "Elite Fitness, Xuân Diệu", "Chứng chỉ quốc tế NASM, chuyên về tập luyện chức năng (Functional Training) và phục hồi sau chấn thương.", "assets/images/team/hlv/2.png", "Nguyễn Lý Nam", "0987333444", 450000m, 4.7999999999999998, "Huấn luyện viên" },
                    { 3, "City Gym, Cầu Giấy", "Vận động viên thể hình chuyên nghiệp, am hiểu sâu về dinh dưỡng và các bài tập cường độ cao (HIIT).", "assets/images/team/hlv/3.png", "Nguyễn Hoàng Việt", "0987555666", 600000m, 5.0, "Huấn luyện viên" },
                    { 4, "The Fitness Village, Nghi Tàm", "Chuyên về Yoga và Stretch, giúp cải thiện sự linh hoạt, dẻo dai và cân bằng tâm trí qua các bài tập chuyên sâu.", "assets/images/team/hlv/4.png", "Đặng Ngọc", "0987777888", 400000m, 4.7000000000000002, "Huấn luyện viên" },
                    { 5, "Sweat Factory, Đống Đa", "HLV chuyên về Pilates và chỉnh sửa tư thế. Tận tâm và luôn theo sát học viên trong từng buổi tập.", "assets/images/team/hlv/1.png", "Lê Minh Anh", "0987999000", 550000m, 4.5999999999999996, "Huấn luyện viên" }
                });

            migrationBuilder.InsertData(
                table: "PersonalTrainerReviews",
                columns: new[] { "Id", "Comment", "CreatedAt", "Rating", "TrainerId", "UserId" },
                values: new object[,]
                {
                    { 1, "HLV rất nhiệt tình, bài tập đa dạng và hiệu quả.", new DateTime(2026, 1, 23, 10, 13, 44, 153, DateTimeKind.Utc).AddTicks(290), 5, 1, 2 },
                    { 2, "Khá hài lòng với lộ trình tập luyện.", new DateTime(2026, 1, 28, 10, 13, 44, 153, DateTimeKind.Utc).AddTicks(530), 4, 1, 3 },
                    { 3, "Kiến thức chuyên môn rất tốt, giúp mình cải thiện tư thế đáng kể.", new DateTime(2026, 1, 31, 10, 13, 44, 153, DateTimeKind.Utc).AddTicks(535), 5, 2, 4 },
                    { 4, "HLV cực kỳ chuyên nghiệp và kỷ luật. Rất đáng tiền!", new DateTime(2026, 2, 1, 10, 13, 44, 153, DateTimeKind.Utc).AddTicks(537), 5, 3, 5 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PersonalTrainerBookings_TrainerId",
                table: "PersonalTrainerBookings",
                column: "TrainerId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalTrainerBookings_UserId",
                table: "PersonalTrainerBookings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalTrainerReviews_TrainerId",
                table: "PersonalTrainerReviews",
                column: "TrainerId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalTrainerReviews_UserId",
                table: "PersonalTrainerReviews",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PersonalTrainerBookings");

            migrationBuilder.DropTable(
                name: "PersonalTrainerReviews");

            migrationBuilder.DropTable(
                name: "PersonalTrainers");

            migrationBuilder.UpdateData(
                table: "GymReviews",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 2, 6, 14, 14, 385, DateTimeKind.Utc).AddTicks(642));

            migrationBuilder.UpdateData(
                table: "GymReviews",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 2, 6, 14, 14, 385, DateTimeKind.Utc).AddTicks(909));
        }
    }
}
