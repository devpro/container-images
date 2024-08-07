# Rancher Hello World

💡 This is a hard fork of [rancher/hello-world](https://github.com/rancher/hello-world) which hasn't been updated since 2018.

This is the source code of a web application used for demoing and/or testing. It shows data about hostname, k8s services and request headers.

## Local development

### How to run locally

Update the dependencies (if a change has been made):

```bash
go mod tidy
```

Build the application:

```bash
go build
```

Start the web server:

````bash
HTTP_PORT=8080 ./rancher-helloworld
````

Open [localhost:8080](http://localhost:8080)

### How to run in a container

The container image is using [SUSE BCI (Base Container Images)](https://registry.suse.com/).

Build a local image:

```bash
docker build -t devprofr/rancher-helloworld .
```

Start a container:

```bash
docker run --rm -p 8080:80 devprofr/rancher-helloworld
```

Open [localhost:8080](http://localhost:8080)
