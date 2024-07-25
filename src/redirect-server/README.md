# Redirect server

[![Docker Image Version](https://img.shields.io/docker/v/devprofr/redirect-server?label=Docker)](https://hub.docker.com/r/devprofr/redirect-server)

This is the source for a container image to be able to run servers that will redirect requests to an URL that is a runtime parameter.

## How to run locally

```bash
# creates a new image
docker build -t redirect-container .

# runs a container
docker run -p 8080:8080 -e REDIRECT_URL="https://github.com" redirect-container

# tests the container (should display GitHub main page source)
curl -L http://localhost:8080
```
