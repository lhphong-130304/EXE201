using System;
using GymFinder.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GymFinder.Api.Data;

public class GymFinderDbContext : DbContext
{
    public GymFinderDbContext(DbContextOptions<GymFinderDbContext> options)
        : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        // Bỏ qua cảnh báo PendingModelChangesWarning để có thể chạy Migration
        optionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Gym> Gyms => Set<Gym>();
    public DbSet<GymReview> GymReviews => Set<GymReview>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<ProductBadge> ProductBadges => Set<ProductBadge>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<PersonalTrainer> PersonalTrainers => Set<PersonalTrainer>();
    public DbSet<PersonalTrainerReview> PersonalTrainerReviews => Set<PersonalTrainerReview>();
    public DbSet<PersonalTrainerBooking> PersonalTrainerBookings => Set<PersonalTrainerBooking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Notification relationship
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId);

        // Configure ProductBadge composite key (Many-to-Many join table)
        modelBuilder.Entity<ProductBadge>()
            .HasKey(pb => new { pb.ProductId, pb.BadgeId });

        modelBuilder.Entity<ProductBadge>()
            .HasOne(pb => pb.Product)
            .WithMany(p => p.ProductBadges)
            .HasForeignKey(pb => pb.ProductId);

        modelBuilder.Entity<ProductBadge>()
            .HasOne(pb => pb.Badge)
            .WithMany(b => b.ProductBadges)
            .HasForeignKey(pb => pb.BadgeId);

        // Configure Gym - Owner (User) relationship
        modelBuilder.Entity<Gym>()
            .HasOne(g => g.Owner)
            .WithMany(u => u.OwnedGyms)
            .HasForeignKey(g => g.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure GymReview relationships
        modelBuilder.Entity<GymReview>()
            .HasOne(gr => gr.Gym)
            .WithMany(g => g.Reviews)
            .HasForeignKey(gr => gr.GymId);

        modelBuilder.Entity<GymReview>()
            .HasOne(gr => gr.User)
            .WithMany(u => u.GymReviews)
            .HasForeignKey(gr => gr.UserId);

        // Configure ProductReview relationships
        modelBuilder.Entity<ProductReview>()
            .HasOne(pr => pr.Product)
            .WithMany(p => p.ProductReviews)
            .HasForeignKey(pr => pr.ProductId);

        modelBuilder.Entity<ProductReview>()
            .HasOne(pr => pr.User)
            .WithMany(u => u.ProductReviews)
            .HasForeignKey(pr => pr.UserId);

        // Configure Product - Gym relationship
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Gym)
            .WithMany(g => g.Products)
            .HasForeignKey(p => p.GymId);

        // Configure Product - Category relationship
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId);

        // Configure Order - User relationship
        modelBuilder.Entity<Order>()
            .HasOne<User>()
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId);

        // Configure OrderDetail
        modelBuilder.Entity<OrderDetail>()
            .HasOne<Order>()
            .WithMany(o => o.OrderDetails)
            .HasForeignKey(od => od.OrderId);

        modelBuilder.Entity<OrderDetail>()
            .HasOne(od => od.Product)
            .WithMany()
            .HasForeignKey(od => od.ProductId);

        // Configure Cart relationships
        modelBuilder.Entity<Cart>()
            .HasOne(c => c.User)
            .WithOne() // Assuming One-to-One for simplicity, or modify User model to have One Cart
            .HasForeignKey<Cart>(c => c.UserId);

        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Cart)
            .WithMany(c => c.CartItems)
            .HasForeignKey(ci => ci.CartId);

        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Product)
            .WithMany()
            .HasForeignKey(ci => ci.ProductId);

        // Configure Booking relationships
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Gym)
            .WithMany()
            .HasForeignKey(b => b.GymId);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId);

        // Configure PersonalTrainerReview relationships
        modelBuilder.Entity<PersonalTrainerReview>()
            .HasOne(ptr => ptr.Trainer)
            .WithMany(t => t.Reviews)
            .HasForeignKey(ptr => ptr.TrainerId);

        modelBuilder.Entity<PersonalTrainerReview>()
            .HasOne(ptr => ptr.User)
            .WithMany()
            .HasForeignKey(ptr => ptr.UserId);

        // Configure PersonalTrainerBooking relationships
        modelBuilder.Entity<PersonalTrainerBooking>()
            .HasOne(ptb => ptb.Trainer)
            .WithMany()
            .HasForeignKey(ptb => ptb.TrainerId);

        modelBuilder.Entity<PersonalTrainerBooking>()
            .HasOne(ptb => ptb.User)
            .WithMany()
            .HasForeignKey(ptb => ptb.UserId);

        // --- SEED DATA ---

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Mass Gainer" },
            new Category { Id = 2, Name = "Whey Protein" },
            new Category { Id = 3, Name = "Pre-Workout" },
            new Category { Id = 4, Name = "Creatine" },
            new Category { Id = 5, Name = "BCAA" },
            new Category { Id = 6, Name = "Protein Bar" },
            new Category { Id = 7, Name = "Accessories" }
        );

        modelBuilder.Entity<Badge>().HasData(
            new Badge { Id = 1, Name = "Hot" },
            new Badge { Id = 2, Name = "Best Seller" },
            new Badge { Id = 3, Name = "Sale" },
            new Badge { Id = 4, Name = "New" },
            new Badge { Id = 5, Name = "Premium" },
            new Badge { Id = 6, Name = "Limited" }
        );

        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, FullName = "Admin User", Email = "admin@gym.com", PasswordHash = "hash", Role = "ADMIN" },
            new User { Id = 2, FullName = "Nguyen Van A", Email = "a@gym.com", PasswordHash = "hash", Role = "USER" },
            new User { Id = 3, FullName = "Tran Thi B", Email = "b@gym.com", PasswordHash = "hash", Role = "USER" },
            new User { Id = 4, FullName = "Le Van C", Email = "c@gym.com", PasswordHash = "hash", Role = "USER" },
            new User { Id = 5, FullName = "Pham Minh D", Email = "d@gym.com", PasswordHash = "hash", Role = "USER" }
        );

        modelBuilder.Entity<Gym>().HasData(
            new Gym { Id = 1, OwnerId = 1, Name = "California Fitness & Yoga", Address = "88 Láng Hạ, Đống Đa, Hà Nội", Description = "Trung tâm thể hình và yoga cao cấp với trang thiết bị hiện đại.", Rating = 4.8, Image = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" },
            new Gym { Id = 2, OwnerId = 1, Name = "Elite Fitness Xuan Dieu", Address = "51 Xuân Diệu, Tây Hồ, Hà Nội", Description = "Phòng tập sang trọng với hồ bơi và các lớp học group-X đa dạng.", Rating = 4.6, Image = "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop" },
            new Gym { Id = 3, OwnerId = 1, Name = "City Gym Cầu Giấy", Address = "226 Cầu Giấy, Hà Nội", Description = "Không gian tập luyện rộng rãi, phù hợp cho mọi trình độ.", Rating = 4.5, Image = "https://images.unsplash.com/photo-1571902251103-d87382404ff4?q=80&w=1374&auto=format&fit=crop" },
            new Gym { Id = 4, OwnerId = 1, Name = "The Fitness Village", Address = "68 Ngõ 310 Nghi Tàm, Tây Hồ, Hà Nội", Description = "Phòng tập phong cách cộng đồng với nhiều lớp học outdoors.", Rating = 4.7, Image = "https://images.unsplash.com/photo-1623874514711-4f3b2580dc2e?q=80&w=1470&auto=format&fit=crop" },
            new Gym { Id = 5, OwnerId = 1, Name = "Sweat Factory", Address = "Tầng 4, 31 Láng Hạ, Đống Đa, Hà Nội", Description = "Chuyên về Functional Training và CrossFit chuyên sâu.", Rating = 4.9, Image = "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1469&auto=format&fit=crop" },
            new Gym { Id = 6, OwnerId = 1, Name = "Nshape Fitness", Address = "Tầng 5, 71 Nguyễn Chí Thanh, Hà Nội", Description = "Tiện nghi và chuyên nghiệp hàng đầu tại khu vực Đống Đa.", Rating = 4.4, Image = "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1469&auto=format&fit=crop" },
            new Gym { Id = 7, OwnerId = 1, Name = "Blue Gym Võ Thị Sáu", Address = "Số 1 Võ Thị Sáu, Hai Bà Trưng, Hà Nội", Description = "Phòng tập bình dân nhưng đầy đủ trang thiết bị và không gian rộng.", Rating = 4.2, Image = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop" },
            new Gym { Id = 8, OwnerId = 1, Name = "Level Fitness", Address = "Tầng 3, Tràng An Complex, Cầu Giấy, Hà Nội", Description = "Phòng tập cao cấp với bể bơi bốn mùa trên cao.", Rating = 4.7, Image = "https://images.unsplash.com/photo-1590239068531-291124237f37?q=80&w=1470&auto=format&fit=crop" },
            new Gym { Id = 9, OwnerId = 1, Name = "GymHaus Boutique Fitness", Address = "Số 5 Ngõ 12 Đặng Thai Mai, Tây Hồ, Hà Nội", Description = "Phong cách boutique cá tính, tập trung vào PT và nhóm nhỏ.", Rating = 4.9, Image = "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1470&auto=format&fit=crop" },
            new Gym { Id = 10, OwnerId = 1, Name = "Star Fitness The Garden", Address = "Tầng 4, The Garden, Mễ Trì, Hà Nội", Description = "Khu phức hợp tập luyện và thư giãn đẳng cấp khu vực Mỹ Đình.", Rating = 4.6, Image = "https://images.unsplash.com/photo-1534367507873-d2d7e24c798f?q=80&w=1470&auto=format&fit=crop" },
            new Gym { Id = 11, OwnerId = 1, Name = "Cali Century Riverside", Address = "458 Minh Khai, Hai Bà Trưng, Hà Nội", Description = "Chi nhánh Riverside với thiết kế sang trọng và view đẹp.", Rating = 4.5, Image = "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1374&auto=format&fit=crop" },
            new Gym { Id = 12, OwnerId = 1, Name = "Gym 24 Seven", Address = "25 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội", Description = "Hoạt động 24/7, phù hợp cho những người bận rộn.", Rating = 4.3, Image = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1528&auto=format&fit=crop" },
            new Gym { Id = 13, OwnerId = 1, Name = "Teekiu Fitness", Address = "Tầng 4-5, số 36A La Thành, Ô Chợ Dừa, Hà Nội", Description = "Không gian tập luyện hiện đại với phong cách industrial cực chất.", Rating = 4.7, Image = "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 14, OwnerId = 1, Name = "Golden Wellness", Address = "Tầng 4, tháp C, Golden Palace, Mễ Trì, Hà Nội", Description = "Tổ hợp chăm sóc sức khỏe 5 sao với bể bơi nước mặn.", Rating = 4.8, Image = "https://images.unsplash.com/photo-1571902251103-d87382404ff4?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 15, OwnerId = 1, Name = "Peak Fitness Hà Nội", Address = "Tầng 27, tháp Mipec, 229 Tây Sơn, Hà Nội", Description = "View toàn thành phố từ tầng cao, máy móc chuẩn quốc tế.", Rating = 4.6, Image = "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 16, OwnerId = 1, Name = "Aura Fitness & Yoga", Address = "Số 1 Kim Mã, Ba Đình, Hà Nội", Description = "Phòng tập yên tĩnh, chuyên sâu về Yoga trị liệu và thiền.", Rating = 4.5, Image = "https://images.unsplash.com/photo-1545208393-2160291ba86e?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 17, OwnerId = 1, Name = "Fit City Hà Đông", Address = "Số 1 Phùng Hưng, Hà Đông, Hà Nội", Description = "Hệ thống phòng tập giá rẻ nhưng chất lượng chuyên nghiệp.", Rating = 4.2, Image = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 18, OwnerId = 1, Name = "Fuel Fitness", Address = "Tầng 2, 101 Láng Hạ, Đống Đa, Hà Nội", Description = "Phòng tập trẻ trung, cộng đồng tập luyện năng động.", Rating = 4.4, Image = "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 19, OwnerId = 1, Name = "Kickfit Sports Nguyễn Trãi", Address = "Số 9 Nguyễn Trãi, Thanh Xuân, Hà Nội", Description = "Chuyên về Boxing, Muay Thai và võ thuật kết hợp thể hình.", Rating = 4.7, Image = "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 20, OwnerId = 1, Name = "Jade Fitness", Address = "Tầng 4, 114 Mai Hắc Đế, Hai Bà Trưng, Hà Nội", Description = "Thiết kế sang trọng, khu vực xông hơi và thư giãn tuyệt vời.", Rating = 4.5, Image = "https://images.unsplash.com/photo-1623874514711-4f3b2580dc2e?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 21, OwnerId = 1, Name = "F5 Fitness", Address = "Ngõ 102 Ngụy Như Kon Tum, Thanh Xuân, Hà Nội", Description = "Phòng tập private dành cho những ai thích sự riêng tư.", Rating = 4.9, Image = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 22, OwnerId = 1, Name = "Landmark 72 Fitness", Address = "Tầng 7, Keangnam Landmark 72, Nam Từ Liêm, Hà Nội", Description = "Đẳng cấp thượng lưu với đầy đủ dịch vụ nghỉ dưỡng.", Rating = 4.8, Image = "https://images.unsplash.com/photo-1590239068531-291124237f37?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 23, OwnerId = 1, Name = "Rambo Gym", Address = "Số 110 Hoàng Quốc Việt, Cầu Giấy, Hà Nội", Description = "Lựa chọn tốt nhất cho các tín đồ đam mê Bodybuilding.", Rating = 4.3, Image = "https://images.unsplash.com/photo-1583454110551-21f2fa2021b1?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 24, OwnerId = 1, Name = "MD Fitness", Address = "Số 194 Thái Thịnh, Đống Đa, Hà Nội", Description = "Phòng tập bình dân, không gian thoáng mát, giá sinh viên.", Rating = 4.1, Image = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 25, OwnerId = 1, Name = "X-Men Gym", Address = "Dịch Vọng Hậu, Cầu Giấy, Hà Nội", Description = "Phòng tập hardcore cho nam giới với tạ nặng và đa dạng.", Rating = 4.2, Image = "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 26, OwnerId = 1, Name = "Yoga Plus", Address = "Tầng 3, Aeon Mall Long Biên, Hà Nội", Description = "Trung tâm chuyên biệt về Yoga với giáo viên Ấn Độ.", Rating = 4.6, Image = "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 27, OwnerId = 1, Name = "Long Biên Fitness", Address = "Khu đô thị Việt Hưng, Long Biên, Hà Nội", Description = "Phòng tập hiện đại hàng đầu khu vực phía Đông Hà Nội.", Rating = 4.4, Image = "https://images.unsplash.com/photo-1534367507873-d2d7e24c798f?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 28, OwnerId = 1, Name = "Mfitness", Address = "1/163 Hoàng Ngân, Trung Hòa, Cầu Giấy, Hà Nội", Description = "Mô hình CLB gia đình sang trọng với bể bơi ngoài trời.", Rating = 4.7, Image = "https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 29, OwnerId = 1, Name = "Times City Gym", Address = "Tầng hầm B1, T6 Times City, Hà Nội", Description = "Tiện lợi cho cư dân với hệ thống máy móc LifeFitness.", Rating = 4.5, Image = "https://images.unsplash.com/photo-1596357399117-574246604163?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 30, OwnerId = 1, Name = "Passion Fitness", Address = "101 Xuân La, Tây Hồ, Hà Nội", Description = "Tận hưởng không gian tập luyện chuyên nghiệp gần Hồ Tây.", Rating = 4.4, Image = "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 31, OwnerId = 1, Name = "Topgym Fitness", Address = "Ngõ 376 Bưởi, Ba Đình, Hà Nội", Description = "Chất lượng cao, giá thành hợp lý, cộng đồng thân thiện.", Rating = 4.3, Image = "https://images.unsplash.com/photo-1517130038641-a774d04afb3c?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 32, OwnerId = 1, Name = "Fit24 Hà Đông", Address = "Tòa nhà Hồ Gươm Plaza, Hà Đông, Hà Nội", Description = "Tiêu chuẩn Châu Âu ngay tại cửa ngõ phía Tây.", Rating = 4.5, Image = "https://images.unsplash.com/photo-1599058917233-3583e717c06c?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 33, OwnerId = 1, Name = "Lofit", Address = "Hào Nam, Đống Đa, Hà Nội", Description = "Sự kết hợp hoàn hảo giữa tập luyện và dinh dưỡng.", Rating = 4.6, Image = "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 34, OwnerId = 1, Name = "Strong First", Address = "Văn Quán, Hà Đông, Hà Nội", Description = "Lò luyện sức mạnh với các bài tập Compound kinh điển.", Rating = 4.7, Image = "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 35, OwnerId = 1, Name = "The Gym Linh Đàm", Address = "HH Linh Đàm, Hoàng Mai, Hà Nội", Description = "Phòng tập đông vui, nhộn nhịp tại khu vực Linh Đàm.", Rating = 4.0, Image = "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 36, OwnerId = 1, Name = "Wefit Home", Address = "Phan Chu Trinh, Hoàn Kiếm, Hà Nội", Description = "Trải nghiệm tập luyện như tại nhà với PT cá nhân.", Rating = 4.8, Image = "https://images.unsplash.com/photo-1584735935682-2f2b69dff3d2?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 37, OwnerId = 1, Name = "Unifit Hà Nội", Address = "Tố Hữu, Nam Từ Liêm, Hà Nội", Description = "Hệ thống máy tập Cardio đa dạng giúp giảm cân hiệu quả.", Rating = 4.4, Image = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 38, OwnerId = 1, Name = "The Light Fitness", Address = "Tòa nhà CT2, Mỹ Đình 2, Nam Từ Liêm, Hà Nội", Description = "Phòng tập sạch sẽ, máy móc được bảo trì liên tục.", Rating = 4.3, Image = "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 39, OwnerId = 1, Name = "Gym King", Address = "Kim Giang, Hoàng Mai, Hà Nội", Description = "Địa điểm tập luyện lý tưởng cho các bạn học sinh sinh viên.", Rating = 4.1, Image = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 40, OwnerId = 1, Name = "Ares Gym", Address = "Lê Đức Thọ, Nam Từ Liêm, Hà Nội", Description = "Chuyên về đào tạo vận động viên thi đấu thể hình.", Rating = 4.9, Image = "https://images.unsplash.com/photo-1581009146145-b5ef03a74e7f?auto=format&fit=crop&q=80&w=1470" },
            new Gym { Id = 41, OwnerId = 1, Name = "Victory Fitness", Address = "Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội", Description = "Rộng rãi, nhiều lớp Group-X thú vị như Zumba, Sexy Dance.", Rating = 4.5, Image = "https://images.unsplash.com/photo-1522898467493-49d5f8f5db14?auto=format&fit=crop&q=80&w=1470", PricePerHour = 60000 },
            new Gym { Id = 42, OwnerId = 1, Name = "The Garden Gym", Address = "KĐT Định Công, Hoàng Mai, Hà Nội", Description = "Thiết kế mở, gần gũi thiên nhiên, tập luyện thư thái.", Rating = 4.3, Image = "https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=1470", PricePerHour = 50000 }
        );

        modelBuilder.Entity<PersonalTrainer>().HasData(
            new PersonalTrainer { Id = 1, Name = "Tài Nguyễn", Role = "Huấn luyện viên", Image = "assets/images/team/hlv/1.png", Address = "California Fitness & Yoga, Láng Hạ", Bio = "Chuyên gia về tăng cơ và giảm mỡ với hơn 5 năm kinh nghiệm. Đã giúp hơn 100 học viên đạt được vóc dáng mơ ước qua các lộ trình cá nhân hóa.", PricePerHour = 500000m, Rating = 4.9, Phone = "0987111222" },
            new PersonalTrainer { Id = 2, Name = "Nguyễn Lý Nam", Role = "Huấn luyện viên", Image = "assets/images/team/hlv/2.png", Address = "Elite Fitness, Xuân Diệu", Bio = "Chứng chỉ quốc tế NASM, chuyên về tập luyện chức năng (Functional Training) và phục hồi sau chấn thương.", PricePerHour = 450000m, Rating = 4.8, Phone = "0987333444" },
            new PersonalTrainer { Id = 3, Name = "Nguyễn Hoàng Việt", Role = "Huấn luyện viên", Image = "assets/images/team/hlv/3.png", Address = "City Gym, Cầu Giấy", Bio = "Vận động viên thể hình chuyên nghiệp, am hiểu sâu về dinh dưỡng và các bài tập cường độ cao (HIIT).", PricePerHour = 600000m, Rating = 5.0, Phone = "0987555666" },
            new PersonalTrainer { Id = 4, Name = "Đặng Ngọc", Role = "Huấn luyện viên", Image = "assets/images/team/hlv/4.png", Address = "The Fitness Village, Nghi Tàm", Bio = "Chuyên về Yoga và Stretch, giúp cải thiện sự linh hoạt, dẻo dai và cân bằng tâm trí qua các bài tập chuyên sâu.", PricePerHour = 400000m, Rating = 4.7, Phone = "0987777888" },
            new PersonalTrainer { Id = 5, Name = "Lê Minh Anh", Role = "Huấn luyện viên", Image = "assets/images/team/hlv/1.png", Address = "Sweat Factory, Đống Đa", Bio = "HLV chuyên về Pilates và chỉnh sửa tư thế. Tận tâm và luôn theo sát học viên trong từng buổi tập.", PricePerHour = 550000m, Rating = 4.6, Phone = "0987999000" }
        );

        modelBuilder.Entity<PersonalTrainerReview>().HasData(
            new PersonalTrainerReview { Id = 1, TrainerId = 1, UserId = 2, Rating = 5, Comment = "HLV rất nhiệt tình, bài tập đa dạng và hiệu quả.", CreatedAt = DateTime.UtcNow.AddDays(-10) },
            new PersonalTrainerReview { Id = 2, TrainerId = 1, UserId = 3, Rating = 4, Comment = "Khá hài lòng với lộ trình tập luyện.", CreatedAt = DateTime.UtcNow.AddDays(-5) },
            new PersonalTrainerReview { Id = 3, TrainerId = 2, UserId = 4, Rating = 5, Comment = "Kiến thức chuyên môn rất tốt, giúp mình cải thiện tư thế đáng kể.", CreatedAt = DateTime.UtcNow.AddDays(-2) },
            new PersonalTrainerReview { Id = 4, TrainerId = 3, UserId = 5, Rating = 5, Comment = "HLV cực kỳ chuyên nghiệp và kỷ luật. Rất đáng tiền!", CreatedAt = DateTime.UtcNow.AddDays(-1) }
        );

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "ON Serious Mass", CategoryId = 1, GymId = 1, Price = 1100000m, OriginalPrice = 1300000m, UnitsInStock = 50, Rating = 5, Image = "https://www.wheystore.vn/images/products/2023/12/15/resized/serious-mass-12lbs_1702628517.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2023/12/15/resized/serious-mass-12lbs_1702628517.jpg.webp" },
            new Product { Id = 2, Name = "Mass Tech Extreme 2000", CategoryId = 1, GymId = 1, Price = 1550000m, OriginalPrice = 1800000m, UnitsInStock = 30, Rating = 5, Image = "https://www.wheystore.vn/images/products/2023/12/19/resized/mass-tech-extreme-2000-22lbs_1702956244.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2023/12/19/resized/mass-tech-extreme-2000-22lbs_1702956244.jpg.webp" },
            new Product { Id = 3, Name = "Mutant Mass 15lbs", CategoryId = 1, GymId = 1, Price = 1630000m, OriginalPrice = 1950000m, UnitsInStock = 20, Rating = 5, Image = "https://www.wheystore.vn/images/products/2024/12/07/resized/mutant-mass-15lbs_1733541654.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2024/12/07/resized/mutant-mass-15lbs_1733541654.jpg.webp" },
            new Product { Id = 4, Name = "ON Platinum Hydro Whey 3.5lbs", CategoryId = 2, GymId = 1, Price = 2550000m, OriginalPrice = 2900000m, UnitsInStock = 15, Rating = 4, Image = "https://www.wheystore.vn/images/products/2023/11/23/large/platinum-hydro-whey-3-5lbs_1700708519.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2023/11/23/large/platinum-hydro-whey-3-5lbs_1700708519.jpg.webp" },
            new Product { Id = 5, Name = "Labrada Muscle Mass Gainer", CategoryId = 1, GymId = 1, Price = 1550000m, OriginalPrice = null, UnitsInStock = 40, Rating = 5, Image = "https://www.wheystore.vn/images/products/2023/12/14/resized/muscle-mass-gainer-12lbs_1702547889.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2023/12/14/resized/muscle-mass-gainer-12lbs_1702547889.jpg.webp" },
            new Product { Id = 6, Name = "Nutrabolics Mass Fusion 12lbs", CategoryId = 1, GymId = 1, Price = 1690000m, OriginalPrice = 1850000m, UnitsInStock = 25, Rating = 4, Image = "https://www.wheystore.vn/images/products/2023/12/15/large/mass-fusion-12lbs_1702610773.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2023/12/15/large/mass-fusion-12lbs_1702610773.jpg.webp" },
            new Product { Id = 7, Name = "Beverly Hydrolyzed Whey Delicatesse", CategoryId = 2, GymId = 1, Price = 1350000m, OriginalPrice = 1500000m, UnitsInStock = 10, Rating = 5, Image = "https://www.wheystore.vn/images/products/2025/10/31/large/beverly-hydrolyzed-whey-delicatesse-2-2lbs_1761880514.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2025/10/31/large/beverly-hydrolyzed-whey-delicatesse-2-2lbs_1761880514.jpg.webp" },
            new Product { Id = 8, Name = "Rule1 Protein 1.98lbs", CategoryId = 2, GymId = 1, Price = 1450000m, OriginalPrice = 1650000m, UnitsInStock = 60, Rating = 5, Image = "https://www.wheystore.vn/images/products/2026/01/08/large/rule-1-protein-1-98lbs_1767854498.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2026/01/08/large/rule-1-protein-1-98lbs_1767854498.jpg.webp" },
            new Product { Id = 9, Name = "BPI ISO HD 100% Pure Isolate", CategoryId = 2, GymId = 1, Price = 1850000m, OriginalPrice = null, UnitsInStock = 35, Rating = 4, Image = "https://www.wheystore.vn/images/products/2025/06/25/large/bpi-iso-hd-5lbs_1750826723.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2025/06/25/large/bpi-iso-hd-5lbs_1750826723.jpg.webp" },
            new Product { Id = 10, Name = "Applied Nutrition Critical Cookie 12 x", CategoryId = 6, GymId = 1, Price = 740000m, OriginalPrice = null, UnitsInStock = 100, Rating = 5, Image = "https://www.wheystore.vn/images/products/2024/02/05/large/12-banh-critical-cookie_1707123280.jpg.webp", HoverImage = "https://www.wheystore.vn/images/products/2024/02/05/large/12-banh-critical-cookie_1707123280.jpg.webp" },
            new Product { Id = 11, Name = "Bình lắc WheyStore 1 ngăn - 600ml", CategoryId = 7, GymId = 1, Price = 150000m, OriginalPrice = null, UnitsInStock = 200, Rating = 4, Image = "https://www.wheystore.vn/images/products/2024/01/18/resized/binh-lac-wheystore-1-ngan_1705572623.jpg", HoverImage = "https://www.wheystore.vn/images/products/2024/01/18/resized/binh-lac-wheystore-1-ngan_1705572623.jpg" },
            new Product { Id = 12, Name = "Bình lắc Amix Nutrition 2 ngăn", CategoryId = 7, GymId = 1, Price = 180000m, OriginalPrice = null, UnitsInStock = 120, Rating = 4, Image = "https://www.wheystore.vn/images/products/2024/01/19/resized/binh-lac-amix-nutrition-600ml_1705651699.jpg", HoverImage = "https://www.wheystore.vn/images/products/2024/01/19/resized/binh-lac-amix-nutrition-600ml_1705651699.jpg" },
            new Product { Id = 13, Name = "Bình lắc Perfect Nutrition", CategoryId = 7, GymId = 1, Price = 190000m, OriginalPrice = null, UnitsInStock = 80, Rating = 5, Image = "https://www.wheystore.vn/images/products/2024/02/01/resized/binh-lac-perfect-nutrition-900ml_1706753309.jpg", HoverImage = "https://www.wheystore.vn/images/products/2024/02/01/resized/binh-lac-perfect-nutrition-900ml_1706753309.jpg" },
            new Product { Id = 14, Name = "SmartShake Ronnie Coleman 3 ngăn", CategoryId = 7, GymId = 1, Price = 250000m, OriginalPrice = null, UnitsInStock = 45, Rating = 5, Image = "https://www.wheystore.vn/images/products/2024/01/19/resized/binh-lac-ronnie-coleman_1705656016.jpg", HoverImage = "https://www.wheystore.vn/images/products/2024/01/19/resized/binh-lac-ronnie-coleman_1705656016.jpg" },
            new Product { Id = 15, Name = "Bao tay WheyStore (Gym Gloves)", CategoryId = 7, GymId = 1, Price = 180000m, OriginalPrice = 220000m, UnitsInStock = 70, Rating = 4, Image = "https://www.wheystore.vn/images/products/2024/01/19/resized/bao-tay-wheystore_1705649952.jpg", HoverImage = "https://www.wheystore.vn/images/products/2024/01/19/resized/bao-tay-wheystore_1705649952.jpg" },
            new Product { Id = 16, Name = "Quấn Cổ Tay WheyStore", CategoryId = 7, GymId = 1, Price = 150000m, OriginalPrice = null, UnitsInStock = 90, Rating = 4, Image = "https://www.wheystore.vn/images/products/2024/01/19/resized/quan-co-tay-wheystore_1705649918.jpg", HoverImage = "https://www.wheystore.vn/images/products/2024/01/19/resized/quan-co-tay-wheystore_1705649918.jpg" },
            new Product { Id = 17, Name = "Đai móc cáp tập chân WheyStore", CategoryId = 7, GymId = 1, Price = 150000m, OriginalPrice = null, UnitsInStock = 50, Rating = 4, Image = "https://www.wheystore.vn/images/products/2024/01/19/resized/dai-moc-cap-tap-chan-wheystore_1705654258.jpg", HoverImage = "https://www.wheystore.vn/images/products/2024/01/19/resized/dai-moc-cap-tap-chan-wheystore_1705654258.jpg" },
            new Product { Id = 18, Name = "Dây kéo lưng Lifting Strap", CategoryId = 7, GymId = 1, Price = 150000m, OriginalPrice = null, UnitsInStock = 110, Rating = 5, Image = "https://www.wheystore.vn/images/products/2024/01/22/resized/day-keo-lifting-strap-wheystore_1705908393.jpg", HoverImage = "https://www.wheystore.vn/images/products/2024/01/22/resized/day-keo-lifting-strap-wheystore_1705908393.jpg" }
        );

        modelBuilder.Entity<GymReview>().HasData(
            new GymReview { Id = 1, GymId = 1, UserId = 2, Rating = 5 },
            new GymReview { Id = 2, GymId = 1, UserId = 3, Rating = 4 }
        );

        modelBuilder.Entity<ProductBadge>().HasData(
            new ProductBadge { ProductId = 1, BadgeId = 1 }, // Hot
            new ProductBadge { ProductId = 2, BadgeId = 2 }, // Best Seller
            new ProductBadge { ProductId = 3, BadgeId = 3 }, // Sale
            new ProductBadge { ProductId = 5, BadgeId = 4 }, // New
            new ProductBadge { ProductId = 7, BadgeId = 1 }, // Hot
            new ProductBadge { ProductId = 8, BadgeId = 3 }, // Sale
            new ProductBadge { ProductId = 10, BadgeId = 4 }, // New
            new ProductBadge { ProductId = 13, BadgeId = 1 }, // Hot
            new ProductBadge { ProductId = 14, BadgeId = 6 }, // Limited (Added badge #6)
            new ProductBadge { ProductId = 18, BadgeId = 2 }  // Best Seller
        );
    }
}
