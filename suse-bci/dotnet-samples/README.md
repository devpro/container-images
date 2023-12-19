# .NET Samples

# ASP.NET minimal REST API

Create an image with `docker build . -t susebciaspnetminapi -f src/AspnetMinimalRestApi/Dockerfile`.

Runs the image with `docker run -it --rm -p 9002:80 -e ASPNETCORE_ENVIRONMENT=Development susebciaspnetminapi`.

Open [localhost:9002/swagger](http://localhost:9002/swagger) in a browser.
