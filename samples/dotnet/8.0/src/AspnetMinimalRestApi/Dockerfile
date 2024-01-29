FROM registry.suse.com/bci/dotnet-aspnet:8.0 AS base
#USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM registry.suse.com/bci/dotnet-sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/", "./"]
RUN dotnet restore "AspnetMinimalRestApi/AspnetMinimalRestApi.csproj"
COPY . .
WORKDIR "/src/AspnetMinimalRestApi"
RUN dotnet build "AspnetMinimalRestApi.csproj" -c Release -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "AspnetMinimalRestApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SuseBci.DotnetSamples.AspnetMinimalRestApi.dll"]
