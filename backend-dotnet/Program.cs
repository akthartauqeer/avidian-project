using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Data;
using Dapper;
using MySql.Data.MySqlClient;  // For MySQL connection


var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5045);
});
// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Add MySQL database connection
builder.Services.AddScoped<IDbConnection>(sp =>
    new MySqlConnection(builder.Configuration.GetConnectionString("DefaultConnection")));

// Initialize Firebase Admin SDK
FirebaseApp.Create(new AppOptions()
{
    Credential = GoogleCredential.FromFile("FirebaseCredentials/serviceAccountKey.json")
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
