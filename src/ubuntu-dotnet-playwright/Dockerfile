# .NET environment for browser tests with Playwright: ubuntu-dotnet with the system libraries Chromium needs.

ARG BASE_IMAGE=ghcr.io/devpro/ubuntu-dotnet:latest

FROM ${BASE_IMAGE}

# Installing system packages needs root, which a step running as runner does not have, so they are installed here once.
# The image has no Node to run `playwright install-deps`, so the packages are the ones the Chromium headless shell fails to load without on Ubuntu 24.04.
# The browser itself is left to the job, since each project pins the Playwright version its browser build has to match.
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 libatspi2.0-0t64 libdbus-1-3 libgbm1 \
    libglib2.0-0t64 libnspr4 libnss3 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 \
  && rm -rf /var/lib/apt/lists/*
USER runner
