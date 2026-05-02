# Track board

A lightweight, production-grade web app for running a an event using tracks.

Built with **React + Vite**, served by a hardened **nginx** container, deployed on **Kubernetes**.

---

## Features

Role        | Capabilities
------------|----------------------------------------------------------------------------------------------------------------
Participant | Register a handle, pick a team, see the active Instruqt track link, follow the live scoreboard
Admin       | Configure 6 track URLs, control which round is live, toggle completions per team, review the participant roster

---

## Project Structure

```txt
├── src/
│   ├── main.jsx          # React entry point
│   ├── index.css         # Global reset
│   ├── App.jsx           # Main component & all views
│   ├── constants.js      # Config, env vars, default state
│   └── storage.js        # localStorage wrapper (async, namespaced)
├── nginx/
│   ├── nginx.conf        # Worker config, JSON access log
│   └── default.conf      # Vhost, security headers, SPA routing, health endpoint
├── k8s/
│   ├── namespace.yaml
│   ├── deployment.yaml   # Non-root, read-only FS, resource limits, probes
│   ├── service.yaml
│   ├── ingress.yaml      # TLS via cert-manager
│   ├── hpa.yaml          # Autoscaling (2–5 replicas)
│   ├── pdb.yaml          # PodDisruptionBudget (minAvailable: 1)
│   └── networkpolicy.yaml
├── .github/workflows/
│   └── ci.yaml           # Lint → Build → Docker push → K8s deploy
├── Dockerfile            # Multi-stage: deps → builder → nginx:alpine
└── vite.config.js
```

---

## Local Development

```bash
npm install

npm run dev
echo http://localhost:5173

npm run lint
npm run format
```

### Environment variables

All vars are prefixed `VITE_` and baked into the bundle at build time.

Variable              | Default            | Description
----------------------|--------------------|-----------------------------------------
`VITE_EVENT_NAME`     | `DevOpsDay Geneva` | Shown in the header
`VITE_EVENT_DATE`     | `May 2026`         | Shown in the subtitle
`VITE_NUM_ROUNDS`     | `6`                | Number of CTF rounds
`VITE_ADMIN_PASSWORD` | `devopsday2026`    | Admin panel password — **override this**

Create a `.env.local` for local overrides (never committed):

```bash
VITE_ADMIN_PASSWORD=mysecretpassword
```

---

## Docker

```bash
docker build --build-arg VITE_ADMIN_PASSWORD=mysecretpassword -t devopsday-ctf:local .

docker run --rm -p 8080:8080 devopsday-ctf:local

echo http://localhost:8080
```

The image:

- Runs as **non-root** (`nginx` user, UID 101)
- Uses a **read-only filesystem** (writable emptyDirs for nginx cache/tmp)
- Exposes port **8080** (not 80, so no root needed)
- Has a `/healthz` endpoint for probes

---

## Kubernetes Deployment

### Prerequisites

- A running K8s cluster
- `kubectl` configured
- An ingress controller (nginx-ingress assumed; adjust annotations in `ingress.yaml`)
- `cert-manager` for TLS (or remove TLS block and manage certs yourself)

### Required secrets in GitHub Actions

Secret                | Description
----------------------|-------------------------------------------
`VITE_ADMIN_PASSWORD` | Baked into the Docker image at build time
`KUBECONFIG`          | Base64-encoded kubeconfig for your cluster

### Manual deploy

```bash
# 1. Update image in deployment.yaml, then:
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/

# 2. Watch rollout
kubectl rollout status deployment/ctf-app -n ctf
```

### Update the domain

Edit `k8s/ingress.yaml` and replace `ctf.yourdomain.com` with your actual hostname.

---

## Before the Event Checklist

- [ ] Set `VITE_ADMIN_PASSWORD` in GitHub Secrets (not the default)
- [ ] Update `ctf.yourdomain.com` in `k8s/ingress.yaml`
- [ ] Update `YOUR_ORG` in `k8s/deployment.yaml` image reference
- [ ] Push to `main` — CI builds and deploys automatically
- [ ] Open the app, go to **Admin → Setup**, paste all 6 Instruqt track URLs
- [ ] On event day: open **Admin → Scores** on your laptop, project **Participant** view on screen

---

## State & Persistence

All state (track config, scores, participants) is stored in **`localStorage`** under the `ctf:` namespace. This means:

- State persists across browser refreshes
- State is **per-browser** — if you need shared state across devices, the `storage.js` module is designed as a drop-in: replace the `localStorage` calls with API calls to a backend

---

## License

GPL-3.0
