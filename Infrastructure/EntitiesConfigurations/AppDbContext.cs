using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure.EntitiesConfigurations
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Children> Childrens { get; set; }
        public DbSet<EnrollmentApplication> EnrollmentApplications { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<ClassChildren> ClassChildrens { get; set; }
        public DbSet<ClassTeacher> ClassTeachers { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceDetail> InvoiceDetails { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<EnrichmentProgram> EnrichmentPrograms { get; set; }
        public DbSet<TypeProgram> TypePrograms { get; set; }
        public DbSet<Syllabus> Syllabi { get; set; }
        public DbSet<SyllabusDetail> SyllabusDetails { get; set; }
        public DbSet<GradeLevel> GradeLevels { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>()
                .HasOne(a => a.Role)
                .WithMany(r => r.Accounts)
                .HasForeignKey(a => a.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(a => a.Accounts)
                .WithMany(n => n.Notifications)
                .HasForeignKey(a => a.AccountID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EnrollmentApplication>()
                .HasOne(ea => ea.Accounts)
                .WithMany(a => a.EnrollmentApplications)
                .HasForeignKey(ea => ea.ParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EnrollmentApplication>()
                .HasOne(ea => ea.GradeLevels)
                .WithMany(gl => gl.EnrollmentApplications)
                .HasForeignKey(ea => ea.GradeLevelID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EnrollmentApplication>()
                .HasOne(ea => ea.Childrens)
                .WithMany(ch => ch.EnrollmentApplications)
                .HasForeignKey(ea => ea.ChildrenID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EnrollmentApplication>()
                .HasOne(ea => ea.Invoices)
                .WithOne(i => i.EnrollmentApplications)
                .HasForeignKey<EnrollmentApplication>(ea => ea.InvoiceID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Children>()
                .HasOne(ch => ch.Parents)
                .WithMany(a => a.Childrens)
                .HasForeignKey(ch => ch.ParentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Childrens)
                .WithMany(ch => ch.Invoices)
                .HasForeignKey(i => i.ChildrenID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvoiceDetail>()
                .HasOne(id => id.Invoices)
                .WithMany(i => i.InvoiceDetails)
                .HasForeignKey(id => id.InvoiceID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvoiceDetail>()
                .HasOne(id => id.Programs)
                .WithMany(p => p.InvoiceDetails)
                .HasForeignKey(id => id.ProgramID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClassChildren>()
                .HasOne(cc => cc.Classes)
                .WithMany(cl => cl.ClassChildrens)
                .HasForeignKey(cc => cc.ClassID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClassChildren>()
                .HasOne(cc => cc.Childrens)
                .WithMany(ch => ch.ClassChildrens)
                .HasForeignKey(cc => cc.ChildrenID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Attendance>()
                .HasOne(at => at.ClassChildrens)
                .WithMany(cc => cc.Attendances)
                .HasForeignKey(at => at.ClassChildrenID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClassTeacher>()
                .HasOne(ct => ct.Classes)
                .WithMany(cl => cl.ClassTeachers)
                .HasForeignKey(ct => ct.ClassID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClassTeacher>()
                .HasOne(ct => ct.Teachers)
                .WithMany(ch => ch.ClassTeachers)
                .HasForeignKey(ct => ct.TeacherID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Class>()
                .HasOne(cl => cl.Syllabi)
                .WithMany(s => s.Classes)
                .HasForeignKey(cl => cl.SyllabusID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SyllabusDetail>()
                .HasOne(sd => sd.Syllabi)
                .WithMany(s => s.SyllabusDetails)
                .HasForeignKey(sd => sd.SyllabusID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EnrichmentProgram>()
                .HasOne(p => p.TypePrograms)
                .WithMany(tp => tp.Programs)
                .HasForeignKey(p => p.TypeProgramID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

//dotnet ef migrations add InitialCreate (Create database)

//dotnet ef database update (Accept update database)

//dotnet ef database update --project Infrastructure --startup-project WebAPI
