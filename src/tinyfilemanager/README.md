# Tiny File Manager

Distribution of [tinyfilemanager.github.io](https://tinyfilemanager.github.io/) for security workshops.

## Deployment

Build the container image:

```bash
docker build -t ghcr.io/devpro/tinyfilemanager:2.4.6 .
```

Test the image:

```bash
docker run --rm --name tinyfilemanager -p 8080:80 ghcr.io/devpro/tinyfilemanager:2.4.6
```

Open the local website (default user credentials are provided in [wiki/Security-and-User-Management](https://github.com/prasathmani/tinyfilemanager/wiki/Security-and-User-Management)):

```bash
echo http://localhost:8080
```

Login container image registry (GitHub packages, with a classic personal access token with write:packages permissions)

```bash
docker login ghcr.io
```

Publish the image:

```bash
docker push ghcr.io/devpro/tinyfilemanager:2.4.6
```

Make sure the package is public, from the GitHub profile.

<!--
trivy image ghcr.io/devpro/tinyfilemanager:2.4.6
-->
