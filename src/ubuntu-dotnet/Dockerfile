# .NET environment: restore, build, test, Sonar analysis, Terraform.
# Syft and Trivy are not included: their composite actions download a pinned release with curl, which the SDK image carries.

ARG DOTNET_VERSION=10.0
ARG TERRAFORM_VERSION=1.16

# Binaries are taken from official images rather than third party apt repositories, so no repository key or package cache lands in a layer.
FROM hashicorp/terraform:${TERRAFORM_VERSION} AS terraform

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION}

# The Sonar scanner runs on Java, which a setup action installs on a hosted runner and a container job does without.
# sudo is what the Syft and Trivy composite actions install their binary with, written for a hosted runner, and root runs it without a password.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openjdk-21-jre-headless sudo \
  && rm -rf /var/lib/apt/lists/*

COPY --from=terraform /bin/terraform /usr/local/bin/terraform
