using Application.Services.AuthService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using PreSchoolBE.src.Application.Interfaces.IServices;
using Infrastructure.EntitiesConfigurations;
using PreSchoolBE.src.Application.Services;
using Domain.Interfaces;
using Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Add repositories
builder.Services.AddScoped<IAuthRepository, AuthRepository>();


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

Console.WriteLine($"JwtSettings - SecretKey: {secretKey}, Issuer: {issuer}, Audience: {audience}, ExpiryInMinutes: {expiryInMinutes}");

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
builder.Services.AddControllers();

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

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// Use CORS
app.UseCors("AllowSpecificOrigins");

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ProjectName API v1"));

app.MapControllers();
app.Run();