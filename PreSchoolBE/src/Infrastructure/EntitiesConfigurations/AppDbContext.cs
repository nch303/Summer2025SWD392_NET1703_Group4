using Microsoft.EntityFrameworkCore;
using PreSchoolBE.src.Infrastructure.Entities;

namespace PreSchoolBE.src.Infrastructure.EntitiesConfigurations
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Accounts)
                .HasForeignKey(u => u.RoleId);


        }
    }
}

//dotnet ef migrations add InitialCreate (Create database)

//dotnet ef database update (Accept update database)