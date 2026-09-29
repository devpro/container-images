# Contributing

## Requirements

- Docker
- [Task](https://taskfile.dev)

## Build

```bash
task build
```

## Continuous integration

The CI pipeline of the last commit runs locally in containers with [IstarCI](https://github.com/devpro/istarci), cloned in `~/repos/istarci` or in `ISTARCI_DIR`:

```bash
task ci
```

The image of each job is set in `.istarci.yml`.
