using Application.Interfaces;
using Application.Interfaces.IServices;
using Application.Services;
using Application.Services.AuthService;
using Microsoft.Extensions.DependencyInjection;
using PreSchoolBE.src.Application.Services;

namespace Application.Extensions;

public static class ApplicationExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IInvoiceDetailService, InvoiceDetailService>();
        services.AddScoped<IVnPayService, VnPayService>();
        services.AddScoped<IChildrenService, ChildrenService>();
        services.AddScoped<IEAService, EAService>();
        services.AddScoped<IEnrichProgramService, EnrichProgramService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IGradeLevelService, GradeLevelService>();
        services.AddScoped<ITuitionFeeService, TuitionFeeService>();
        services.AddScoped<IChildrenGradeService, ChildrenGradeService>();
        services.AddScoped<IClassService, ClassService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IStaffService, StaffService>();
        services.AddScoped<IClassChildrenService, ClassChildrenService>();
        services.AddScoped<INewsService, NewsService>();
        services.AddScoped<ISyllabusService, SyllabusService>();
        services.AddScoped<ISyllabusDetailService, SyllabusDetailService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<ITypeProgramService, TypeProgramService>();

        return services;
    }
}
