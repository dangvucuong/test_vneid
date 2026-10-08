using System.Reflection;
using Microsoft.OpenApi.Models;
using VNeIDSignGateway.Configurations;
using VNeIDSignGateway.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Configuration
builder.Services.Configure<VNeIDGatewayOptions>(
    builder.Configuration.GetSection(VNeIDGatewayOptions.SectionName));

// 2. Register Application Services & Typed HttpClients
builder.Services.AddSingleton<ISignFlowLogger, SignFlowLogger>();
builder.Services.AddSingleton<IVneIdSqlLog, VneIdSqlLog>();
builder.Services.AddSingleton<IWebhookValidator, WebhookValidator>();
builder.Services.AddSingleton<IWebhookEventStore, WebhookEventStore>();
builder.Services.AddSingleton<IUniversalLinkBuilder, UniversalLinkBuilder>();

const string ConsoleCorsPolicy = "VNeIDConsole";
builder.Services.AddCors(options =>
{
    options.AddPolicy(ConsoleCorsPolicy, policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var gatewayBaseUrl = builder.Configuration[$"{VNeIDGatewayOptions.SectionName}:BaseUrl"];
builder.Services.AddHttpClient(VNeIDAuthService.HttpClientName, client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
    if (!string.IsNullOrWhiteSpace(gatewayBaseUrl))
    {
        client.BaseAddress = new Uri(gatewayBaseUrl.TrimEnd('/'));
    }
});
builder.Services.AddSingleton<IVNeIDAuthService, VNeIDAuthService>();

builder.Services.AddHttpClient<IVNeIDGatewayClient, VNeIDGatewayClient>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(180);
});

// 3. Add Controllers
builder.Services.AddControllers();

// 4. Configure Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "VNeID Remote Signing Gateway API",
        Version = "v1",
        Description = "Hệ thống Backend tích hợp Cổng Ký số Tập trung VNeID qua Đơn vị trung gian kết nối (RSVAN). Hỗ trợ cấp chứng thư số và ký số từ xa bằng dữ liệu băm (Hash Signing).",
        Contact = new OpenApiContact
        {
            Name = "VNeID Integration Team"
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "VNeID Gateway API v1");
        c.RoutePrefix = string.Empty; // Swagger UI at root "/"
    });
}

app.UseHttpsRedirection();

app.UseCors(ConsoleCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
