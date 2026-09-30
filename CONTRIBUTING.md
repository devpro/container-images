# Contributing

## Requirements

- Docker
- [Task](https://taskfile.dev)

## Build

```bash
task build
```

## Continuous integration

[IstarCI](https://github.com/devpro/istarci) is recommended but optional: the CI is the GitHub Actions pipeline, and IstarCI runs it locally on every commit, in containers, and blocks `git push` when it failed.
It is installed once per machine from GitHub Packages, with a `~/.npmrc` token that reads `@devpro` packages:

```bash
npm install --global @devpro/istarci
istarci daemon install
istarci daemon start
task ci:setup   # registers this repository and installs the pre-push hook
```

Every commit made afterwards runs in the background:

```bash
task ci        # the runs of the recent commits
task ci:logs   # the output of the last run
```

The image of each job is set in `.istarci.yml`.
When working on IstarCI itself, `task ci:from-clone` runs the pipeline once from a clone in `~/repos/istarci` or `ISTARCI_DIR`, without the package.
