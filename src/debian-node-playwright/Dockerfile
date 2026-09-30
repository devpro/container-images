# Node.js environment for browser tests with Playwright: debian-node with the system libraries Chromium needs.

ARG BASE_IMAGE=ghcr.io/devpro/debian-node:latest
ARG PLAYWRIGHT_VERSION=1

FROM ${BASE_IMAGE}

ARG PLAYWRIGHT_VERSION

# Installing system packages needs root, which a step running as runner does not have, so they are installed here once.
# The browser itself is left to the job, since each project pins the Playwright version its browser build has to match.
USER root
RUN npx --yes playwright@${PLAYWRIGHT_VERSION} install-deps chromium \
  && rm -rf /var/lib/apt/lists/* /root/.npm
USER runner
