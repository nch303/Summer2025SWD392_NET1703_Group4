using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Extensions;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IInvoiceDetailRepository, InvoiceDetailRepository>();
        services.AddScoped<IChildrenRepository, ChildrenRepository>();
        services.AddScoped<IEARepository, EARepository>();
        services.AddScoped<IEnrichProgramRepository, EnrichProgramRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IGradeLevelRepository, GradeLevelRepository>();
        services.AddScoped<ITuitionFeeRepositiry, TuitionFeeRepository>();
        services.AddScoped<IChildrenGradeRepository, ChildrenGradeRepository>();
        services.AddScoped<IClassRepository, ClassRepository>();
        services.AddScoped<INotificationsRepository, NotificationRepository>();
        services.AddScoped<IStaffRepository, StaffRepository>();
        services.AddScoped<IClassChildrenRepository, ClassChildrenRepository>();
        services.AddScoped<INewsRepository, NewsRepository>();
        services.AddScoped<ISyllabusRepository, SyllabusRepository>();
        services.AddScoped<ISyllabusDetailRepository, SyllabusDetailRepository>();
        services.AddScoped<IAttendanceRepository, AttendanceRepository>();
        services.AddScoped<ITypeProgramRepository, TypeProgramRepository>();

        return services;
    }
}
