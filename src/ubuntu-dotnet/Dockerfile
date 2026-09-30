# .NET environment: restore, build, test, Sonar analysis, Terraform.
# Syft and Trivy are not included: their composite actions download a pinned release with curl, which the SDK image carries.

ARG DOTNET_VERSION=10.0
ARG TERRAFORM_VERSION=1.16

# Binaries are taken from official images rather than third party apt repositories, so no repository key or package cache lands in a layer.
FROM hashicorp/terraform:${TERRAFORM_VERSION} AS terraform

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION}

# The Sonar scanner runs on Java, which a setup action installs on a hosted runner and a container job does without.
# The SDK image is rebuilt less often than Ubuntu publishes security fixes, which an image scan reports.
RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends openjdk-21-jre-headless \
  && rm -rf /var/lib/apt/lists/*

COPY --from=terraform /bin/terraform /usr/local/bin/terraform

# Steps run as an ordinary user, as on a hosted runner, which keeps a job from owning the machine it runs on.
# The uid is 1000, the first user of a Linux or WSL host, so a workspace that user created is writable from inside.
RUN usermod --login runner --home /home/runner --move-home --groups '' ubuntu \
  && groupmod --new-name runner ubuntu
USER runner
