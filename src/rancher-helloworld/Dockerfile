FROM registry.suse.com/bci/golang:1.26 as build
COPY . /go/src
WORKDIR /go/src
RUN go build

FROM registry.suse.com/bci/bci-minimal:15.7 as run
COPY ./img /img
COPY --from=build /go/src/rancher-helloworld /rancher-helloworld
EXPOSE 80
ENTRYPOINT ["/rancher-helloworld"]
