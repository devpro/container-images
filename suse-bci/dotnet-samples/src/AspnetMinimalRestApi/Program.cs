using SuseBci.DotnetSamples.AspnetMinimalRestApi.Dtos;

var builder = WebApplication.CreateBuilder(args);

// add services to the build collection
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// configures the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/weather-forecasts", () =>
{
    var forecast = Enumerable.Range(1, 5)
        .Select(index => new WeatherForecastDto(index, Random.Shared))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();
