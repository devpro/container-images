using SuseBci.DotnetSamples.AspnetMinimalRestApi.Dtos;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (builder.Configuration.GetValue<bool>("Application:IsSwaggerEnabled"))
{
    app.Logger.LogInformation("Swagger enabled");
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (builder.Configuration.GetValue<bool>("Application:IsHttpsRedirectionEnabled"))
{
    app.Logger.LogInformation("HTTPS redirection enabled");
    app.UseHttpsRedirection();
}

app.MapGet("/weather-forecasts", () =>
{
    app.Logger.LogInformation("GetWeatherForecast request received");
    var forecast = Enumerable.Range(1, 5)
        .Select(index => new WeatherForecastDto(index, Random.Shared))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();
