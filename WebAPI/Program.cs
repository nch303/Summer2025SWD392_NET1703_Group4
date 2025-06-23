using Application.Interfaces;
using Application.Interfaces.IServices;
using Application.Mappings;
using Application.Services;
using Application.Services.AuthService;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PreSchoolBE.src.Application.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IInvoiceDetailService, InvoiceDetailService>();
builder.Services.AddScoped<IVnPayService, VnPayService>();
builder.Services.AddScoped<IChildrenService, ChildrenService>();
builder.Services.AddScoped<IEAService, EAService>();
builder.Services.AddScoped<IEnrichProgramService, EnrichProgramService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IGradeLevelService, GradeLevelService>();
builder.Services.AddScoped<ITuitionFeeService, TuitionFeeService>();
builder.Services.AddScoped<IChildrenGradeService, ChildrenGradeService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IClassChildrenService, ClassChildrenService>();
builder.Services.AddScoped<INewsService, NewsService>();
builder.Services.AddScoped<ISyllabusService, SyllabusService>();
builder.Services.AddScoped<ISyllabusDetailService, SyllabusDetailService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();



// Add repositories
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<IInvoiceDetailRepository, InvoiceDetailRepository>();
builder.Services.AddScoped<IChildrenRepository, ChildrenRepository>();
builder.Services.AddScoped<IEARepository, EARepository>();
builder.Services.AddScoped<IEnrichProgramRepository, EnrichProgramRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IGradeLevelRepository, GradeLevelRepository>();
builder.Services.AddScoped<ITuitionFeeRepositiry, TuitionFeeRepository>();
builder.Services.AddScoped<IChildrenGradeRepository, ChildrenGradeRepository>();
builder.Services.AddScoped<IClassRepository, ClassRepository>();
builder.Services.AddScoped<INotificationsRepository, NotificationRepository>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IClassChildrenRepository, ClassChildrenRepository>();
builder.Services.AddScoped<INewsRepository, NewsRepository>();
builder.Services.AddScoped<ISyllabusRepository, SyllabusRepository>();
builder.Services.AddScoped<ISyllabusDetailRepository, SyllabusDetailRepository>();
builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();

// Add VnPay settings
builder.Services.Configure<VnPaySettings>(builder.Configuration.GetSection("VnPaySettings"));


// add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});


// Configure JWT
var jwtConfig = builder.Configuration.GetSection("JwtSettings");
if (!jwtConfig.Exists())
{
    throw new Exception("JwtSettings section is missing in configuration.");
}

var secretKey = jwtConfig["SecretKey"];
var issuer = jwtConfig["Issuer"];
var audience = jwtConfig["Audience"];
var expiryInMinutes = jwtConfig["ExpiryInMinutes"];


if (string.IsNullOrEmpty(secretKey))
{
    throw new Exception("SecretKey is null or empty in JwtSettings.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();
builder.Services.AddControllers();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Add Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PreSchool API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

//import QuestPDF
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// Use CORS
app.UseCors("AllowSpecificOrigins");

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ProjectName API v1"));

app.MapControllers();
app.Run();