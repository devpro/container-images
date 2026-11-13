#!/usr/bin/env bash
# Compares the userland of an image with the one of the machine running the script, a GitHub hosted runner in CI.
# A runner image moving to another implementation of a tool (GNU to uutils coreutils, bash to a new minor, another default Node.js) then fails the image's pipeline, not the next pipeline of a project using it.
# Versions within an implementation are left out, as the runner image and the image are rebuilt on different days from the same archive.
# Git is reported only, as the runner installs it from the git-core PPA, a third party repository the image does without.
#
# Usage: scripts/check_runner_parity.sh <image>

set -euo pipefail

image="${1:?Usage: $0 <image>}"

# Prints one "tool=implementation" line per tool.
# It is a function so that its text, given by declare -f, runs as is on both sides, the image's bash expanding it rather than the runner's.
probe() {
  local c
  # Ubuntu 26.04 mixes uutils and GNU within coreutils, so each command a script commonly calls is named.
  for c in basename cat chmod cp cut date dirname env head ls mkdir mktemp mv readlink realpath rm sha256sum sort tail tee touch tr uniq wc \
    find xargs sed grep diff tar; do
    # The implementation is what --version names in parentheses, "GNU coreutils" or "uutils coreutils".
    echo "$c=$("$c" --version 2>&1 | head -n 1 | sed -n 's/^[^(]*(\([^)]*\)).*/\1/p')"
  done
  echo "sh=$(basename "$(readlink -f /bin/sh)")"
  echo "awk=$(basename "$(readlink -f "$(command -v awk)")")"
  echo "bash=${BASH_VERSINFO[0]}.${BASH_VERSINFO[1]}"
  # A job asking for a Node.js major gets it from the runner tools cache, while a container job runs the one of the image.
  echo "node=$(node --version 2>/dev/null | sed 's/^v\([0-9]*\).*/\1/')"
}

runner=$(probe)
in_image=$(docker run --rm --entrypoint bash "$image" -c "$(declare -f probe); probe")

echo "git on the runner: $(git --version), in the image: $(docker run --rm --entrypoint git "$image" --version)"

# The probe prints the tools in one order on both sides, so line n of one is line n of the other.
status=0
while IFS=$'\t' read -r on_runner on_image; do
  tool="${on_runner%%=*}"
  if [ "$on_runner" = "$on_image" ]; then
    echo "✅ ${tool}: ${on_runner#*=}"
  else
    echo "❌ ${tool}: ${on_runner#*=} on the runner, ${on_image#*=} in $image"
    status=1
  fi
done < <(paste <(echo "$runner") <(echo "$in_image"))
exit "$status"
