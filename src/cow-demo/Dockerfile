FROM registry.suse.com/bci/golang:1.22 as build
COPY . /go/src
WORKDIR /go/src
RUN go build

FROM registry.suse.com/bci/bci-minimal:15.5 as run
COPY ./static /static
COPY ./templates /templates
COPY --from=build /go/src/cow-demo /bin/cow-demo
EXPOSE 8080
ENTRYPOINT ["/bin/cow-demo"]
