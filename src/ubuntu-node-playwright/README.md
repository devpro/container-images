# Ubuntu Node Playwright

Node.js environment for browser tests with Playwright, in a CI job or on a workstation.

## Content

- Everything in [Ubuntu Node](../ubuntu-node/README.md), with the same tags (`22`, `24`, `latest`)
- The system libraries Chromium needs, installed with `playwright install-deps chromium`

The browser is installed by the project, matching its own Playwright version:

```bash
npx playwright install chromium
```

Steps run as `runner` (uid 1000), not root.

## Usage

```bash
docker run --rm -v "$PWD":/src -w /src ghcr.io/devpro/ubuntu-node-playwright npx playwright test
```

## Build

```bash
docker build -t ubuntu-node-playwright src/ubuntu-node-playwright
```
