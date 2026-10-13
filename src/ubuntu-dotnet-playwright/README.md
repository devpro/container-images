# Ubuntu .NET Playwright

.NET environment for browser tests with Playwright, in a CI job or on a workstation.

## Content

- Everything in [Ubuntu .NET](../ubuntu-dotnet/README.md)
- The system libraries and the font the Chromium headless shell needs

The browser is installed by the project, matching its own Playwright version:

```bash
pwsh test/<project>/bin/Debug/net10.0/playwright.ps1 install chromium
```

Steps run as `runner` (uid 1000), not root.

## Usage

```bash
docker run --rm -v "$PWD":/src -w /src ghcr.io/devpro/ubuntu-dotnet-playwright dotnet test
```

## Build

```bash
docker build -t ubuntu-dotnet-playwright src/ubuntu-dotnet-playwright
```
