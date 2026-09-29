# Ubuntu .NET

.NET environment for building, testing and analysing, in a CI job or on a workstation.

## Content

- .NET SDK 10.0 (`mcr.microsoft.com/dotnet/sdk:10.0`, Ubuntu based)
- OpenJDK 21 JRE, for the Sonar scanner
- Terraform

A database is given to a job as a service container (`mongo:8`), not installed in the image.

## Usage

```bash
docker run --rm -v "$PWD":/src -w /src ghcr.io/devpro/ubuntu-dotnet dotnet test
```

## Build

```bash
docker build -t ubuntu-dotnet src/ubuntu-dotnet
```
