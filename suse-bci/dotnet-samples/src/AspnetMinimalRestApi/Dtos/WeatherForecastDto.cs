namespace SuseBci.DotnetSamples.AspnetMinimalRestApi.Dtos
{
    public record WeatherForecastDto(DateOnly Date, int TemperatureC, string? Summary)
    {
        private static readonly string[] s_summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        public WeatherForecastDto(int index, Random random)
            : this(DateOnly.FromDateTime(DateTime.Now.AddDays(index)), random.Next(-20, 55), s_summaries[random.Next(s_summaries.Length)])
        {
        }

        public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
    }
}
