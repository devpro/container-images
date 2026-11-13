# Ubuntu Node

Node.js environment for building, testing and linting, in a CI job or on a workstation.

## Content

- Ubuntu 26.04, the release `ubuntu-latest` runs, with its uutils coreutils, dash, bash 5.3, GNU sed, grep and findutils, mawk
- Node.js 24, the default of `ubuntu-latest`, npm 12, pnpm 12
- g++, make, git, curl, jq, zip, unzip, pipx (for `pipx run yamllint` and `pipx run checkov`)
- Docker client, buildx and compose, to reach a Docker daemon through its socket
- Terraform

Steps run as `runner` (uid 1000), not root.

It replaces Debian Node, whose GNU coreutils let pass what the runner fails on:
`tr` of uutils writes each line as it comes, so `cmd | tr -d '\r' | grep -q x` under `set -o pipefail` fails with 141 once `grep -q` has quit.

## Tags

Tag      | Node.js
---------|--------
`22`     | 22
`24`     | 24
`latest` | 24

These are the majors the `ubuntu-latest` tools cache holds.
IstarCI picks the one a job's `actions/setup-node` asks for, with `.istarci.yml`:

```yaml
runner:
  toolchainImages:
    node: ghcr.io/devpro/ubuntu-node:{version}
```

## Usage

```bash
docker run --rm -v "$PWD":/src -w /src ghcr.io/devpro/ubuntu-node npm ci
```

## Build

```bash
docker build -t ubuntu-node src/ubuntu-node
docker build -t ubuntu-node:22 --build-arg NODE_VERSION=22 src/ubuntu-node
```

## Test

The image is compared with the machine running the check, a GitHub hosted runner in CI, on the implementation of each tool a script calls, the bash minor and the Node.js major:

```bash
scripts/check_runner_parity.sh ghcr.io/devpro/ubuntu-node:latest
```
