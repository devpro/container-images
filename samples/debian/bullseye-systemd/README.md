# Container image to run Debian 11 ("bullseye") with systemd

Inspired by [github.com/Rosa-Luxemburgstiftung-Berlin/ansible-role-unbound](https://github.com/Rosa-Luxemburgstiftung-Berlin/ansible-role-unbound/blob/main/molecule/default/Dockerfile-debian11.j2)

## Build & run the image

```bash
# creates an image
docker build --no-cache . -t bulleyesystemd

# runs a container
docker run -it --rm --name bulleyesystemd --privileged bulleyesystemd
```
## Use the container

From another terminal run `docker exec -it bulleyesystemd bash`:

```bash
systemctl
```
