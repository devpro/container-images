# Ubuntu .NET

.NET environment for building, testing and analysing, in a CI job or on a workstation.

## Content

- .NET SDK 10.0 (`mcr.microsoft.com/dotnet/sdk:10.0`, Ubuntu based)
- OpenJDK 21 JRE, for the Sonar scanner
- Terraform

Browser tests with Playwright run on [Ubuntu .NET Playwright](../ubuntu-dotnet-playwright/README.md).
A database is started by the job, with the MongoDB action of github-workflow-parts, not installed in the image.

Steps run as `runner` (uid 1000), not root.

## Usage

```bash
docker run --rm -v "$PWD":/src -w /src ghcr.io/devpro/ubuntu-dotnet dotnet test
```

## Build

```bash
docker build -t ubuntu-dotnet src/ubuntu-dotnet
```
