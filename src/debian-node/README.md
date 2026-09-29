# Debian Node

Node.js environment for building, testing and linting, in a CI job or on a workstation.

## Content

- Node.js 22 on Debian slim (`node:22-trixie-slim`), npm 11, pnpm 11
- g++, make, git, curl, jq, zip, unzip, sudo, pipx (for `pipx run yamllint` and `pipx run checkov`)
- Docker client, buildx and compose, to reach a Docker daemon through its socket
- Terraform

## Usage

```bash
docker run --rm -v "$PWD":/src -w /src ghcr.io/devpro/debian-node npm ci
```

## Build

```bash
docker build -t debian-node src/debian-node
```
