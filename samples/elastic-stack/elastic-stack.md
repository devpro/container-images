# Docker file for Elastic Stack

[Home](../readme.md) > [Elastic Stack](./elastic-stack.md)

## Usage

### Prerequisites

- `docker-compose` must be available
- The file path must be shared on Docker (D: drive for example)

### Get the sources

```dos
git clone https://github.com/devpro/docker-files.git
cd docker-files/elastic-stack
```

### Start the whole thing

```dos
docker-compose up
```

### Open the applications

- Elasticsearch [127.0.0.1:9200](http://127.0.0.1:9200/)
- Kibana at [localhost:5601](http://localhost:5601/)

### Monitor docker containers

```dos
docker ps -a --format "{{.Names}}: {{.Status}}"
```

### Stop

```dos
docker-compose down
```

### Clean

```dos
docker-compose down --volumes --remove-orphans
```

## References

- [github.com/elastic/stack-docker](https://github.com/elastic/stack-docker)
- [Logstash Redis input plugin](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-redis.html)
