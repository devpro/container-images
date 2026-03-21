# ASP.NET Core Web application sample

## How to build with Docker

```bash
# build a new image (from solution root folder)
docker build . -t devpro-samples/aspnetcore-web -f src/AspNetCoreWebApp/Dockerfile --no-cache

# check image in local repository
docker images
```

## How to run with Docker

```bash
# run a container on the new image
docker run -it --rm -p 8080:80 --name aspnetcorewebsample devpro-samples/aspnetcore-web

# open http://localhost:8080/ in a browser

# generate local certificate (see https://docs.microsoft.com/en-us/aspnet/core/security/docker-https?view=aspnetcore-3.1)
dotnet dev-certs https --clean
dotnet dev-certs https -ep %USERPROFILE%\.aspnet\https\aspnetapp.pfx -p <password>
dotnet dev-certs https --trust

# run a container with HTTPS
docker run --rm -it -p 8000:80 -p 8001:443 -e ASPNETCORE_URLS="https://+;http://+" -e ASPNETCORE_ENVIRONMENT=Development -e ASPNETCORE_HTTPS_PORT=8001 -e ASPNETCORE_Kestrel__Certificates__Default__Password="password" -e ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx -v %USERPROFILE%\.aspnet\https:/https/ --name aspnetcorewebsample devpro-samples/aspnetcore-web

# open http://localhost:8000/ in a browser (you should be redirected to https://localhost:8001/)

# if there is an issue (direct crash), replace the ENTRYPOINT line by CMD "/bin/bash" in Dockerfile, build the image and run a new container
docker run -i -t -p 8080:80 devpro-samples/aspnetcore-web
```

## How to run on Kubernetes

__Tip__: On Windows, you can use Git Bash to get some interesting Linux programs (kubectl and minikube exe file to manually copy in C:\Program Files\Git\mingw64\bin).

```bash
# first push the image on a repository accessible from the nodes
docker build . -t devprofr/aspnetcoresample:latest -f src/AspNetCoreWebApp/Dockerfile --no-cache
docker push devprofr/aspnetcoresample:latest

# then create a Kubernetes deployment (see https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
kubectl create deployment aspnetcore-sample --image=devprofr/aspnetcoresample:latest

# make sure the pod is running ok
kubectl get deploy,pod
kubectl get deployment aspnetcore-sample -o yaml

# update the container port (see https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/)
cat > deployment.yaml <<EOL
spec:
  template:
    spec:
      containers:
        - name: aspnetcoresample
          ports:
            - containerPort: 80
EOL
kubectl patch deployment aspnetcore-sample --patch "$(cat deployment.yaml)"

# access the webapp through a NodePort service, open http://<ip>:<node_port> (or how to get the url on Minikube)
kubectl expose deployment aspnetcore-sample --type=NodePort --name=aspnetcoresample
kubectl describe service aspnetcoresample
minikube service aspnetcoresample --url
kubectl delete service aspnetcoresample

# access the webapp through a NodePort service (and how to get the url on Minikube)
kubectl expose deployment aspnetcore-sample --type=LoadBalancer --port 80 --target-port 80 --name aspnetcoresample
minikube service aspnetcoresample
kubectl delete service aspnetcoresample

# execute bash commands in the pod
kubectl exec --stdin --tty <pod-name> -- bash
```

## How to clean-up

```bash
# remove unused data (see https://docs.docker.com/engine/reference/commandline/system_prune/)
docker system prune -f
```
