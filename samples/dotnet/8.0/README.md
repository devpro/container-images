# .NET 8.0 Samples

## Base container images

Why [SUSE BCI](https://registry.suse.com/)?

```txt
$ trivy image mcr.microsoft.com/dotnet/aspnet:8.0

Total: 86 (UNKNOWN: 0, LOW: 62, MEDIUM: 20, HIGH: 3, CRITICAL: 1)

$ trivy image registry.suse.com/bci/dotnet-aspnet:8.0

Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)
```

## Configuration

Set the environments variables by creating an `.env` file:

```env
Application__IsHttpsRedirectionEnabled=false
Application__IsSwaggerEnabled=true
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://[::]:8080
Logging__LogLevel__Default=Debug
Logging__LogLevel__Microsoft__AspNetCore=Debug
Logging__LogLevel__SuseBci=Debug
```

## Projects

### ASP.NET minimal REST API

Create an image with `docker build --no-cache . -t aspnetminapi:8.0 -f src/AspnetMinimalRestApi/Dockerfile`.

Run the image with `docker run -it --rm -p 9002:8080 --env-file .env aspnetminapi:8.0`.

Open [localhost:9002/swagger](http://localhost:9002/swagger) in a browser.
