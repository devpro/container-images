# Devpro container images

[![CI](https://github.com/devpro/container-images/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/devpro/container-images/actions/workflows/ci.yaml)
[![PKG](https://github.com/devpro/container-images/actions/workflows/pkg.yaml/badge.svg?branch=main)](https://github.com/devpro/container-images/actions/workflows/pkg.yaml)

Container image definitions to provide examples & best pratices, and push images on a registry.

## Development environments

Published on `ghcr.io/devpro`, one image per language, with the tooling its build, test and lint steps call.

* [Debian Node](src/debian-node/README.md)
* [Debian Node Playwright](src/debian-node-playwright/README.md)
* [Ubuntu .NET](src/ubuntu-dotnet/README.md)

Go has none: the official `golang:<version>-trixie` image already carries git, curl and a C toolchain.

## Demonstrations

* [Cow demo](src/cow-demo/README.md)
* [Game 2048](src/game-2048/README.md)
* [Rancher Hello World](src/rancher-helloworld/README.md)
* [Redirect Server](src/redirect-server/README.md)

## Security workshops

* [NextPortal](src/nextportal/README.md)
* [Tiny File Manager](src/tinyfilemanager/README.md)

## Utilities

* [Redirect Server](src/redirect-server/README.md)
