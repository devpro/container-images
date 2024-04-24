FROM golang:1.12-alpine as app
RUN apk add -U build-base git
COPY . /go/src
WORKDIR /go/src
ENV GO111MODULE=on
RUN go build

FROM alpine:latest
RUN apk add -U --no-cache curl
COPY ./static /static
COPY --from=app /go/src/cow-demo /bin/cow-demo
COPY ./templates /templates
ENV COW_COLOR yellow
EXPOSE 8080
ENTRYPOINT ["/bin/cow-demo"]
