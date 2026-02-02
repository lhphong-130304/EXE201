using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GymFinder.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Badges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Badges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Carts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Carts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Gyms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rating = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gyms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Gyms_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GymReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GymId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GymReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GymReviews_Gyms_GymId",
                        column: x => x.GymId,
                        principalTable: "Gyms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GymReviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HoverImage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Rating = table.Column<double>(type: "float", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    GymId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Products_Gyms_GymId",
                        column: x => x.GymId,
                        principalTable: "Gyms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CartId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartItems_Carts_CartId",
                        column: x => x.CartId,
                        principalTable: "Carts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CartItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductBadges",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    BadgeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductBadges", x => new { x.ProductId, x.BadgeId });
                    table.ForeignKey(
                        name: "FK_ProductBadges_Badges_BadgeId",
                        column: x => x.BadgeId,
                        principalTable: "Badges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductBadges_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductReviews_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductReviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Badges",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Hot" },
                    { 2, "Best Seller" },
                    { 3, "Sale" },
                    { 4, "New" },
                    { 5, "Premium" },
                    { 6, "Limited" }
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Mass Gainer" },
                    { 2, "Whey Protein" },
                    { 3, "Pre-Workout" },
                    { 4, "Creatine" },
                    { 5, "BCAA" },
                    { 6, "Protein Bar" },
                    { 7, "Accessories" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "FullName", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, "admin@gym.com", "Admin User", "hash", "ADMIN" },
                    { 2, "a@gym.com", "Nguyen Van A", "hash", "USER" },
                    { 3, "b@gym.com", "Tran Thi B", "hash", "USER" },
                    { 4, "c@gym.com", "Le Van C", "hash", "USER" },
                    { 5, "d@gym.com", "Pham Minh D", "hash", "USER" }
                });

            migrationBuilder.InsertData(
                table: "Gyms",
                columns: new[] { "Id", "Address", "Description", "Image", "Name", "OwnerId", "Rating" },
                values: new object[,]
                {
                    { 1, "88 Láng Hạ, Đống Đa, Hà Nội", "Trung tâm thể hình và yoga cao cấp với trang thiết bị hiện đại.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop", "California Fitness & Yoga", 1, 4.7999999999999998 },
                    { 2, "51 Xuân Diệu, Tây Hồ, Hà Nội", "Phòng tập sang trọng với hồ bơi và các lớp học group-X đa dạng.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop", "Elite Fitness Xuan Dieu", 1, 4.5999999999999996 },
                    { 3, "226 Cầu Giấy, Hà Nội", "Không gian tập luyện rộng rãi, phù hợp cho mọi trình độ.", "https://images.unsplash.com/photo-1571902251103-d87382404ff4?q=80&w=1374&auto=format&fit=crop", "City Gym Cầu Giấy", 1, 4.5 },
                    { 4, "68 Ngõ 310 Nghi Tàm, Tây Hồ, Hà Nội", "Phòng tập phong cách cộng đồng với nhiều lớp học outdoors.", "https://images.unsplash.com/photo-1623874514711-4f3b2580dc2e?q=80&w=1470&auto=format&fit=crop", "The Fitness Village", 1, 4.7000000000000002 },
                    { 5, "Tầng 4, 31 Láng Hạ, Đống Đa, Hà Nội", "Chuyên về Functional Training và CrossFit chuyên sâu.", "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1469&auto=format&fit=crop", "Sweat Factory", 1, 4.9000000000000004 },
                    { 6, "Tầng 5, 71 Nguyễn Chí Thanh, Hà Nội", "Tiện nghi và chuyên nghiệp hàng đầu tại khu vực Đống Đa.", "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1469&auto=format&fit=crop", "Nshape Fitness", 1, 4.4000000000000004 },
                    { 7, "Số 1 Võ Thị Sáu, Hai Bà Trưng, Hà Nội", "Phòng tập bình dân nhưng đầy đủ trang thiết bị và không gian rộng.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop", "Blue Gym Võ Thị Sáu", 1, 4.2000000000000002 },
                    { 8, "Tầng 3, Tràng An Complex, Cầu Giấy, Hà Nội", "Phòng tập cao cấp với bể bơi bốn mùa trên cao.", "https://images.unsplash.com/photo-1590239068531-291124237f37?q=80&w=1470&auto=format&fit=crop", "Level Fitness", 1, 4.7000000000000002 },
                    { 9, "Số 5 Ngõ 12 Đặng Thai Mai, Tây Hồ, Hà Nội", "Phong cách boutique cá tính, tập trung vào PT và nhóm nhỏ.", "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1470&auto=format&fit=crop", "GymHaus Boutique Fitness", 1, 4.9000000000000004 },
                    { 10, "Tầng 4, The Garden, Mễ Trì, Hà Nội", "Khu phức hợp tập luyện và thư giãn đẳng cấp khu vực Mỹ Đình.", "https://images.unsplash.com/photo-1534367507873-d2d7e24c798f?q=80&w=1470&auto=format&fit=crop", "Star Fitness The Garden", 1, 4.5999999999999996 },
                    { 11, "458 Minh Khai, Hai Bà Trưng, Hà Nội", "Chi nhánh Riverside với thiết kế sang trọng và view đẹp.", "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1374&auto=format&fit=crop", "Cali Century Riverside", 1, 4.5 },
                    { 12, "25 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội", "Hoạt động 24/7, phù hợp cho những người bận rộn.", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1528&auto=format&fit=crop", "Gym 24 Seven", 1, 4.2999999999999998 },
                    { 13, "Tầng 4-5, số 36A La Thành, Ô Chợ Dừa, Hà Nội", "Không gian tập luyện hiện đại với phong cách industrial cực chất.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1470", "Teekiu Fitness", 1, 4.7000000000000002 },
                    { 14, "Tầng 4, tháp C, Golden Palace, Mễ Trì, Hà Nội", "Tổ hợp chăm sóc sức khỏe 5 sao với bể bơi nước mặn.", "https://images.unsplash.com/photo-1571902251103-d87382404ff4?auto=format&fit=crop&q=80&w=1470", "Golden Wellness", 1, 4.7999999999999998 },
                    { 15, "Tầng 27, tháp Mipec, 229 Tây Sơn, Hà Nội", "View toàn thành phố từ tầng cao, máy móc chuẩn quốc tế.", "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=1470", "Peak Fitness Hà Nội", 1, 4.5999999999999996 },
                    { 16, "Số 1 Kim Mã, Ba Đình, Hà Nội", "Phòng tập yên tĩnh, chuyên sâu về Yoga trị liệu và thiền.", "https://images.unsplash.com/photo-1545208393-2160291ba86e?auto=format&fit=crop&q=80&w=1470", "Aura Fitness & Yoga", 1, 4.5 },
                    { 17, "Số 1 Phùng Hưng, Hà Đông, Hà Nội", "Hệ thống phòng tập giá rẻ nhưng chất lượng chuyên nghiệp.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1470", "Fit City Hà Đông", 1, 4.2000000000000002 },
                    { 18, "Tầng 2, 101 Láng Hạ, Đống Đa, Hà Nội", "Phòng tập trẻ trung, cộng đồng tập luyện năng động.", "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=1470", "Fuel Fitness", 1, 4.4000000000000004 },
                    { 19, "Số 9 Nguyễn Trãi, Thanh Xuân, Hà Nội", "Chuyên về Boxing, Muay Thai và võ thuật kết hợp thể hình.", "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?auto=format&fit=crop&q=80&w=1470", "Kickfit Sports Nguyễn Trãi", 1, 4.7000000000000002 },
                    { 20, "Tầng 4, 114 Mai Hắc Đế, Hai Bà Trưng, Hà Nội", "Thiết kế sang trọng, khu vực xông hơi và thư giãn tuyệt vời.", "https://images.unsplash.com/photo-1623874514711-4f3b2580dc2e?auto=format&fit=crop&q=80&w=1470", "Jade Fitness", 1, 4.5 },
                    { 21, "Ngõ 102 Ngụy Như Kon Tum, Thanh Xuân, Hà Nội", "Phòng tập private dành cho những ai thích sự riêng tư.", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1470", "F5 Fitness", 1, 4.9000000000000004 },
                    { 22, "Tầng 7, Keangnam Landmark 72, Nam Từ Liêm, Hà Nội", "Đẳng cấp thượng lưu với đầy đủ dịch vụ nghỉ dưỡng.", "https://images.unsplash.com/photo-1590239068531-291124237f37?auto=format&fit=crop&q=80&w=1470", "Landmark 72 Fitness", 1, 4.7999999999999998 },
                    { 23, "Số 110 Hoàng Quốc Việt, Cầu Giấy, Hà Nội", "Lựa chọn tốt nhất cho các tín đồ đam mê Bodybuilding.", "https://images.unsplash.com/photo-1583454110551-21f2fa2021b1?auto=format&fit=crop&q=80&w=1470", "Rambo Gym", 1, 4.2999999999999998 },
                    { 24, "Số 194 Thái Thịnh, Đống Đa, Hà Nội", "Phòng tập bình dân, không gian thoáng mát, giá sinh viên.", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1470", "MD Fitness", 1, 4.0999999999999996 },
                    { 25, "Dịch Vọng Hậu, Cầu Giấy, Hà Nội", "Phòng tập hardcore cho nam giới với tạ nặng và đa dạng.", "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=1470", "X-Men Gym", 1, 4.2000000000000002 },
                    { 26, "Tầng 3, Aeon Mall Long Biên, Hà Nội", "Trung tâm chuyên biệt về Yoga với giáo viên Ấn Độ.", "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=1470", "Yoga Plus", 1, 4.5999999999999996 },
                    { 27, "Khu đô thị Việt Hưng, Long Biên, Hà Nội", "Phòng tập hiện đại hàng đầu khu vực phía Đông Hà Nội.", "https://images.unsplash.com/photo-1534367507873-d2d7e24c798f?auto=format&fit=crop&q=80&w=1470", "Long Biên Fitness", 1, 4.4000000000000004 },
                    { 28, "1/163 Hoàng Ngân, Trung Hòa, Cầu Giấy, Hà Nội", "Mô hình CLB gia đình sang trọng với bể bơi ngoài trời.", "https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&q=80&w=1470", "Mfitness", 1, 4.7000000000000002 },
                    { 29, "Tầng hầm B1, T6 Times City, Hà Nội", "Tiện lợi cho cư dân với hệ thống máy móc LifeFitness.", "https://images.unsplash.com/photo-1596357399117-574246604163?auto=format&fit=crop&q=80&w=1470", "Times City Gym", 1, 4.5 },
                    { 30, "101 Xuân La, Tây Hồ, Hà Nội", "Tận hưởng không gian tập luyện chuyên nghiệp gần Hồ Tây.", "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=1470", "Passion Fitness", 1, 4.4000000000000004 },
                    { 31, "Ngõ 376 Bưởi, Ba Đình, Hà Nội", "Chất lượng cao, giá thành hợp lý, cộng đồng thân thiện.", "https://images.unsplash.com/photo-1517130038641-a774d04afb3c?auto=format&fit=crop&q=80&w=1470", "Topgym Fitness", 1, 4.2999999999999998 },
                    { 32, "Tòa nhà Hồ Gươm Plaza, Hà Đông, Hà Nội", "Tiêu chuẩn Châu Âu ngay tại cửa ngõ phía Tây.", "https://images.unsplash.com/photo-1599058917233-3583e717c06c?auto=format&fit=crop&q=80&w=1470", "Fit24 Hà Đông", 1, 4.5 },
                    { 33, "Hào Nam, Đống Đa, Hà Nội", "Sự kết hợp hoàn hảo giữa tập luyện và dinh dưỡng.", "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=1470", "Lofit", 1, 4.5999999999999996 },
                    { 34, "Văn Quán, Hà Đông, Hà Nội", "Lò luyện sức mạnh với các bài tập Compound kinh điển.", "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=1470", "Strong First", 1, 4.7000000000000002 },
                    { 35, "HH Linh Đàm, Hoàng Mai, Hà Nội", "Phòng tập đông vui, nhộn nhịp tại khu vực Linh Đàm.", "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&q=80&w=1470", "The Gym Linh Đàm", 1, 4.0 },
                    { 36, "Phan Chu Trinh, Hoàn Kiếm, Hà Nội", "Trải nghiệm tập luyện như tại nhà với PT cá nhân.", "https://images.unsplash.com/photo-1584735935682-2f2b69dff3d2?auto=format&fit=crop&q=80&w=1470", "Wefit Home", 1, 4.7999999999999998 },
                    { 37, "Tố Hữu, Nam Từ Liêm, Hà Nội", "Hệ thống máy tập Cardio đa dạng giúp giảm cân hiệu quả.", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1470", "Unifit Hà Nội", 1, 4.4000000000000004 },
                    { 38, "Tòa nhà CT2, Mỹ Đình 2, Nam Từ Liêm, Hà Nội", "Phòng tập sạch sẽ, máy móc được bảo trì liên tục.", "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&q=80&w=1470", "The Light Fitness", 1, 4.2999999999999998 },
                    { 39, "Kim Giang, Hoàng Mai, Hà Nội", "Địa điểm tập luyện lý tưởng cho các bạn học sinh sinh viên.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1470", "Gym King", 1, 4.0999999999999996 },
                    { 40, "Lê Đức Thọ, Nam Từ Liêm, Hà Nội", "Chuyên về đào tạo vận động viên thi đấu thể hình.", "https://images.unsplash.com/photo-1581009146145-b5ef03a74e7f?auto=format&fit=crop&q=80&w=1470", "Ares Gym", 1, 4.9000000000000004 },
                    { 41, "Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội", "Rộng rãi, nhiều lớp Group-X thú vị như Zumba, Sexy Dance.", "https://images.unsplash.com/photo-1522898467493-49d5f8f5db14?auto=format&fit=crop&q=80&w=1470", "Victory Fitness", 1, 4.5 },
                    { 42, "KĐT Định Công, Hoàng Mai, Hà Nội", "Thiết kế mở, gần gũi thiên nhiên, tập luyện thư thái.", "https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=1470", "The Garden Gym", 1, 4.2999999999999998 }
                });

            migrationBuilder.InsertData(
                table: "GymReviews",
                columns: new[] { "Id", "Comment", "CreatedAt", "GymId", "Rating", "UserId" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2026, 2, 1, 1, 49, 42, 834, DateTimeKind.Utc).AddTicks(6725), 1, 5, 2 },
                    { 2, null, new DateTime(2026, 2, 1, 1, 49, 42, 834, DateTimeKind.Utc).AddTicks(6986), 1, 4, 3 }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "GymId", "HoverImage", "Image", "Name", "OriginalPrice", "Price", "Rating" },
                values: new object[,]
                {
                    { 1, 1, 1, "https://www.wheystore.vn/images/products/2023/12/15/resized/serious-mass-12lbs_1702628517.jpg.webp", "https://www.wheystore.vn/images/products/2023/12/15/resized/serious-mass-12lbs_1702628517.jpg.webp", "ON Serious Mass", 1300000m, 1100000m, 5.0 },
                    { 2, 1, 1, "https://www.wheystore.vn/images/products/2023/12/19/resized/mass-tech-extreme-2000-22lbs_1702956244.jpg.webp", "https://www.wheystore.vn/images/products/2023/12/19/resized/mass-tech-extreme-2000-22lbs_1702956244.jpg.webp", "Mass Tech Extreme 2000", 1800000m, 1550000m, 5.0 },
                    { 3, 1, 1, "https://www.wheystore.vn/images/products/2024/12/07/resized/mutant-mass-15lbs_1733541654.jpg.webp", "https://www.wheystore.vn/images/products/2024/12/07/resized/mutant-mass-15lbs_1733541654.jpg.webp", "Mutant Mass 15lbs", 1950000m, 1630000m, 5.0 },
                    { 4, 2, 1, "https://www.wheystore.vn/images/products/2023/11/23/large/platinum-hydro-whey-3-5lbs_1700708519.jpg.webp", "https://www.wheystore.vn/images/products/2023/11/23/large/platinum-hydro-whey-3-5lbs_1700708519.jpg.webp", "ON Platinum Hydro Whey 3.5lbs", 2900000m, 2550000m, 4.0 },
                    { 5, 1, 1, "https://www.wheystore.vn/images/products/2023/12/14/resized/muscle-mass-gainer-12lbs_1702547889.jpg.webp", "https://www.wheystore.vn/images/products/2023/12/14/resized/muscle-mass-gainer-12lbs_1702547889.jpg.webp", "Labrada Muscle Mass Gainer", null, 1550000m, 5.0 },
                    { 6, 1, 1, "https://www.wheystore.vn/images/products/2023/12/15/large/mass-fusion-12lbs_1702610773.jpg.webp", "https://www.wheystore.vn/images/products/2023/12/15/large/mass-fusion-12lbs_1702610773.jpg.webp", "Nutrabolics Mass Fusion 12lbs", 1850000m, 1690000m, 4.0 },
                    { 7, 2, 1, "https://www.wheystore.vn/images/products/2025/10/31/large/beverly-hydrolyzed-whey-delicatesse-2-2lbs_1761880514.jpg.webp", "https://www.wheystore.vn/images/products/2025/10/31/large/beverly-hydrolyzed-whey-delicatesse-2-2lbs_1761880514.jpg.webp", "Beverly Hydrolyzed Whey Delicatesse", 1500000m, 1350000m, 5.0 },
                    { 8, 2, 1, "https://www.wheystore.vn/images/products/2026/01/08/large/rule-1-protein-1-98lbs_1767854498.jpg.webp", "https://www.wheystore.vn/images/products/2026/01/08/large/rule-1-protein-1-98lbs_1767854498.jpg.webp", "Rule1 Protein 1.98lbs", 1650000m, 1450000m, 5.0 },
                    { 9, 2, 1, "https://www.wheystore.vn/images/products/2025/06/25/large/bpi-iso-hd-5lbs_1750826723.jpg.webp", "https://www.wheystore.vn/images/products/2025/06/25/large/bpi-iso-hd-5lbs_1750826723.jpg.webp", "BPI ISO HD 100% Pure Isolate", null, 1850000m, 4.0 },
                    { 10, 6, 1, "https://www.wheystore.vn/images/products/2024/02/05/large/12-banh-critical-cookie_1707123280.jpg.webp", "https://www.wheystore.vn/images/products/2024/02/05/large/12-banh-critical-cookie_1707123280.jpg.webp", "Applied Nutrition Critical Cookie 12 x", null, 740000m, 5.0 },
                    { 11, 7, 1, "https://www.wheystore.vn/images/products/2024/01/18/resized/binh-lac-wheystore-1-ngan_1705572623.jpg", "https://www.wheystore.vn/images/products/2024/01/18/resized/binh-lac-wheystore-1-ngan_1705572623.jpg", "Bình lắc WheyStore 1 ngăn - 600ml", null, 150000m, 4.0 },
                    { 12, 7, 1, "https://www.wheystore.vn/images/products/2024/01/19/resized/binh-lac-amix-nutrition-600ml_1705651699.jpg", "https://www.wheystore.vn/images/products/2024/01/19/resized/binh-lac-amix-nutrition-600ml_1705651699.jpg", "Bình lắc Amix Nutrition 2 ngăn", null, 180000m, 4.0 },
                    { 13, 7, 1, "https://www.wheystore.vn/images/products/2024/02/01/resized/binh-lac-perfect-nutrition-900ml_1706753309.jpg", "https://www.wheystore.vn/images/products/2024/02/01/resized/binh-lac-perfect-nutrition-900ml_1706753309.jpg", "Bình lắc Perfect Nutrition", null, 190000m, 5.0 },
                    { 14, 7, 1, "https://www.wheystore.vn/images/products/2024/01/19/resized/binh-lac-ronnie-coleman_1705656016.jpg", "https://www.wheystore.vn/images/products/2024/01/19/resized/binh-lac-ronnie-coleman_1705656016.jpg", "SmartShake Ronnie Coleman 3 ngăn", null, 250000m, 5.0 },
                    { 15, 7, 1, "https://www.wheystore.vn/images/products/2024/01/19/resized/bao-tay-wheystore_1705649952.jpg", "https://www.wheystore.vn/images/products/2024/01/19/resized/bao-tay-wheystore_1705649952.jpg", "Bao tay WheyStore (Gym Gloves)", 220000m, 180000m, 4.0 },
                    { 16, 7, 1, "https://www.wheystore.vn/images/products/2024/01/19/resized/quan-co-tay-wheystore_1705649918.jpg", "https://www.wheystore.vn/images/products/2024/01/19/resized/quan-co-tay-wheystore_1705649918.jpg", "Quấn Cổ Tay WheyStore", null, 150000m, 4.0 },
                    { 17, 7, 1, "https://www.wheystore.vn/images/products/2024/01/19/resized/dai-moc-cap-tap-chan-wheystore_1705654258.jpg", "https://www.wheystore.vn/images/products/2024/01/19/resized/dai-moc-cap-tap-chan-wheystore_1705654258.jpg", "Đai móc cáp tập chân WheyStore", null, 150000m, 4.0 },
                    { 18, 7, 1, "https://www.wheystore.vn/images/products/2024/01/22/resized/day-keo-lifting-strap-wheystore_1705908393.jpg", "https://www.wheystore.vn/images/products/2024/01/22/resized/day-keo-lifting-strap-wheystore_1705908393.jpg", "Dây kéo lưng Lifting Strap", null, 150000m, 5.0 }
                });

            migrationBuilder.InsertData(
                table: "ProductBadges",
                columns: new[] { "BadgeId", "ProductId" },
                values: new object[,]
                {
                    { 1, 1 },
                    { 2, 2 },
                    { 3, 3 },
                    { 4, 5 },
                    { 1, 7 },
                    { 3, 8 },
                    { 4, 10 },
                    { 1, 13 },
                    { 6, 14 },
                    { 2, 18 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems",
                column: "CartId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_ProductId",
                table: "CartItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Carts_UserId",
                table: "Carts",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GymReviews_GymId",
                table: "GymReviews",
                column: "GymId");

            migrationBuilder.CreateIndex(
                name: "IX_GymReviews_UserId",
                table: "GymReviews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Gyms_OwnerId",
                table: "Gyms",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_OrderId",
                table: "OrderDetails",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_ProductId",
                table: "OrderDetails",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBadges_BadgeId",
                table: "ProductBadges",
                column: "BadgeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReviews_ProductId",
                table: "ProductReviews",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReviews_UserId",
                table: "ProductReviews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_GymId",
                table: "Products",
                column: "GymId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "GymReviews");

            migrationBuilder.DropTable(
                name: "OrderDetails");

            migrationBuilder.DropTable(
                name: "ProductBadges");

            migrationBuilder.DropTable(
                name: "ProductReviews");

            migrationBuilder.DropTable(
                name: "Carts");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Badges");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Gyms");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
