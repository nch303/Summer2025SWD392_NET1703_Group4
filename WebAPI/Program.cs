using Application.Mappings;
using Domain.Entities;
using WebAPI.Extensions;
using Application.Extensions;
using Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerWithJwt();
builder.Services.AddCorsPolicy();

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthorization();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));
// Add VnPay settings
builder.Services.Configure<VnPaySettings>(builder.Configuration.GetSection("VnPaySettings"));
//import QuestPDF
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AllowSpecificOrigins");
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "PreSchool API v1"));
app.MapControllers();
app.Run();
