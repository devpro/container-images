# Node.js base for application images: the stages building an application and the one running it.

ARG NODE_VERSION=24
ARG ALPINE_VERSION=3.24
# npm's latest tag stays behind its releases at times, so the release carrying the fixes of its bundled dependencies is named.
ARG NPM_VERSION=12.2.1

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION}

ARG NPM_VERSION

# The Node image is rebuilt less often than Alpine publishes security fixes, and its bundled npm lags behind its own dependency fixes, both of which an image scan reports.
RUN apk upgrade --no-cache \
  && npm install -g npm@${NPM_VERSION} \
  && npm cache clean --force
