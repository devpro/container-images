# Node.js environment: markup lint, build, unit and end to end tests, Terraform quality.

ARG NODE_VERSION=22
ARG NPM_VERSION=11
ARG PNPM_VERSION=11
ARG DOCKER_VERSION=29
ARG TERRAFORM_VERSION=1.16

# Binaries are taken from official images rather than third party apt repositories, so no repository key or package cache lands in a layer.
FROM docker:${DOCKER_VERSION}-cli AS docker
FROM hashicorp/terraform:${TERRAFORM_VERSION} AS terraform

FROM node:${NODE_VERSION}-trixie-slim

ARG NPM_VERSION
ARG PNPM_VERSION

# pipx backs `pipx run yamllint` and `pipx run checkov`, git is what every checkout and change detection step calls, and jq is what scripts read JSON with, as on a hosted runner.
# curl and unzip are what the Syft, Trivy, Terraform and TFLint composite actions download their pinned release with, and zip is what tests packing an archive call.
# g++ and make build the native modules an npm install compiles when no prebuilt binary matches, as on a hosted runner.
# The Node image is rebuilt less often than Debian publishes security fixes, which an image scan reports.
RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends ca-certificates curl g++ git jq make pipx unzip zip \
  && rm -rf /var/lib/apt/lists/*

# The npm bundled with Node lags behind its own dependency fixes, which an image scan reports.
# pnpm stands in for `pnpm/action-setup`, which a container job does without.
RUN npm install -g npm@${NPM_VERSION} pnpm@${PNPM_VERSION} \
  && npm cache clean --force

# The Docker client, buildx and compose let a job build an image against the host daemon socket, as an end to end test or an image scan does.
COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker /usr/local/libexec/docker/cli-plugins/docker-buildx /usr/local/libexec/docker/cli-plugins/docker-buildx
COPY --from=docker /usr/local/libexec/docker/cli-plugins/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose

# A container job gets no `hashicorp/setup-terraform`, so a Node project generating Terraform finds it here.
COPY --from=terraform /bin/terraform /usr/local/bin/terraform

# Steps run as an ordinary user, as on a hosted runner, which keeps a job from owning the machine it runs on.
# The uid is 1000, the first user of a Linux or WSL host, so a workspace that user created is writable from inside.
RUN usermod --login runner --home /home/runner --move-home node \
  && groupmod --new-name runner node
USER runner
