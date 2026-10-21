# Alpine Node

Node.js base for application images, in place of the official `node` image whose bundled npm lags behind its own security fixes.

## Content

- Node.js 24 on Alpine (`node:24-alpine3.24`), with its Alpine packages upgraded
- npm 12

The user is root, as in the official image, and `node` (uid 1000) is there for the stage running the application.

## Usage

```dockerfile
FROM ghcr.io/devpro/alpine-node:latest
```

## Build

```bash
docker build -t alpine-node src/alpine-node
```
