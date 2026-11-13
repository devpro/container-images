# Node.js environment: markup lint, build, unit and end to end tests, Terraform quality.

ARG NODE_VERSION=24
# npm's latest tag stays behind its releases at times, so the release carrying the fixes of its bundled dependencies is named.
ARG NPM_VERSION=12.2.2
ARG PNPM_VERSION=12
ARG DOCKER_VERSION=29
ARG TERRAFORM_VERSION=1.17
# The userland a job's scripts run on (uutils coreutils, dash, bash, grep) is the one ubuntu-latest runs, so a script failing there fails here first.
ARG UBUNTU_VERSION=26.04

# Binaries are taken from official images rather than third party apt repositories, so no repository key or package cache lands in a layer.
# The official Node images are Debian or Alpine only, and the Debian build of Node links against nothing newer than the glibc of Ubuntu.
FROM node:${NODE_VERSION}-trixie-slim AS node
FROM docker:${DOCKER_VERSION}-cli AS docker
FROM hashicorp/terraform:${TERRAFORM_VERSION} AS terraform

FROM ubuntu:${UBUNTU_VERSION}

ARG NPM_VERSION
ARG PNPM_VERSION

# pipx backs `pipx run yamllint` and `pipx run checkov`, git is what every checkout and change detection step calls, and jq is what scripts read JSON with, as on a hosted runner.
# curl and unzip are what the Syft, Trivy, Terraform and TFLint composite actions download their pinned release with, and zip is what tests packing an archive call.
# g++ and make build the native modules an npm install compiles when no prebuilt binary matches, as on a hosted runner.
# gawk is the awk of a hosted runner, taking over from the mawk of the Ubuntu base through a higher alternatives priority, so an awk script meets the same dialect.
# libatomic1 is the one library Node links against that the Ubuntu base lacks.
# The Ubuntu image is rebuilt less often than Ubuntu publishes security fixes, which an image scan reports.
RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends ca-certificates curl g++ gawk git jq libatomic1 make pipx unzip zip \
  && rm -rf /var/lib/apt/lists/*

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/include/node /usr/local/include/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules

# The npm bundled with Node lags behind its own dependency fixes, which an image scan reports.
# pnpm stands in for `pnpm/action-setup`, which a container job does without.
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
  && npm install -g npm@${NPM_VERSION} pnpm@${PNPM_VERSION} \
  && npm cache clean --force

# The Docker client, buildx and compose let a job build an image against the host daemon socket, as an end to end test or an image scan does.
COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker /usr/local/libexec/docker/cli-plugins/docker-buildx /usr/local/libexec/docker/cli-plugins/docker-buildx
COPY --from=docker /usr/local/libexec/docker/cli-plugins/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose

# A container job gets no `hashicorp/setup-terraform`, so a Node project generating Terraform finds it here.
COPY --from=terraform /bin/terraform /usr/local/bin/terraform

# Steps run as an ordinary user, as on a hosted runner, which keeps a job from owning the machine it runs on.
# The uid is 1000, the first user of a Linux or WSL host, so a workspace that user created is writable from inside.
RUN usermod --login runner --home /home/runner --move-home --groups '' ubuntu \
  && groupmod --new-name runner ubuntu
USER runner
