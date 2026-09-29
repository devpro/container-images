# Node.js environment: markup lint, build, unit and end to end tests, Terraform quality.

ARG NODE_VERSION=22
ARG NPM_VERSION=11
ARG DOCKER_VERSION=29
ARG TERRAFORM_VERSION=1.16

# Binaries are taken from official images rather than third party apt repositories, so no repository key or package cache lands in a layer.
FROM docker:${DOCKER_VERSION}-cli AS docker
FROM hashicorp/terraform:${TERRAFORM_VERSION} AS terraform

FROM node:${NODE_VERSION}-trixie-slim

ARG NPM_VERSION

# pipx backs `pipx run yamllint` and `pipx run checkov`, git is what every checkout and change detection step calls.
# curl and unzip are what the Syft, Trivy, Terraform and TFLint composite actions download their pinned release with.
# sudo is what those actions install the binary with, written for a hosted runner, and root runs it without a password.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git pipx sudo unzip \
  && rm -rf /var/lib/apt/lists/*

# The npm bundled with Node lags behind its own dependency fixes, which an image scan reports.
RUN npm install -g npm@${NPM_VERSION} \
  && npm cache clean --force

# The Docker client, buildx and compose let a job build an image against the host daemon socket, as an end to end test or an image scan does.
COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker /usr/local/libexec/docker/cli-plugins/docker-buildx /usr/local/libexec/docker/cli-plugins/docker-buildx
COPY --from=docker /usr/local/libexec/docker/cli-plugins/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose

# A container job gets no `hashicorp/setup-terraform`, so a Node project generating Terraform finds it here.
COPY --from=terraform /bin/terraform /usr/local/bin/terraform
