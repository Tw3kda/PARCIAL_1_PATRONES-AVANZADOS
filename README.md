# Pedido App – Helm Chart + ArgoCD (Frontend + Backend + PostgreSQL)

Repositorio para desplegar **Pedido App** en Kubernetes usando **Helm** (manual) o **ArgoCD** (GitOps).  
Incluye **frontend**, **backend (FastAPI)**, **PostgreSQL (Bitnami)**, **Ingress (nginx)** y **HPA** para el backend.

---

## Contenido del chart

- **Chart**: `pedido-app/`
  - `Chart.yaml`  
    - `dependencies`: `bitnami/postgresql` `15.5.22`
  - `values.yaml`  

    - Imágenes:  
      - Backend: `dani008/fastapi-backend:1.0.0`  
      - Frontend: `dani008/frontend:1.0.0`

    - Servicios:  
      - Backend: `ClusterIP:8080`  
      - Frontend: `ClusterIP:80`

    - Ingress: `enabled: true`, `host: pedido.local`, `ingressClassName: nginx`

    - PostgreSQL: `enabled: true`  
      - `auth.username: patrones_1parcial`  
      - `auth.password: parcial1`  
      - `auth.postgresPassword: parcial1`  
      - `auth.database: patrones`

  - Plantillas:
    - `deployment.yaml` (backend + frontend)
    - `service.yaml` (svc backend + frontend)
    - `ingress.yaml` (host `pedido.local`, paths `/` → frontend, `/api` → backend)
    - `configmap-backend.yaml` (DB_NAME/DB_HOST/DB_PORT/DATABASE_URL)
    - `secrets.yaml` (Secret `postgres` con `POSTGRES_USER` y `POSTGRES_PASSWORD`)
    - `hpa_backend.yaml` (HPA backend: 2–5 réplicas, 70% CPU)

- **ArgoCD Application**: `application.yaml`  
  ```yaml
  apiVersion: argoproj.io/v1alpha1
  kind: Application
  metadata:
    name: pedido-app-dev
    namespace: argocd
  spec:
    project: default
    source:
      repoURL: https://github.com/nicholastrsu/PARCIAL_CHARTS_PATRONES-AVANZADOS.git
      targetRevision: HEAD
      path: pedido-app
      helm:
        valueFiles:
          - values.yaml
          - values-dev.yaml
    destination:
      server: https://kubernetes.default.svc
      namespace: pedido-dev
    syncPolicy:
      automated:
        prune: true
        selfHeal: true
      syncOptions:
        - CreateNamespace=true

## Instalacion manual (Helm)

 1) Clonar y entrar al chart
git clone https://github.com/nicholastrsu/PARCIAL_CHARTS_PATRONES-AVANZADOS.git
cd PARCIAL_CHARTS_PATRONES-AVANZADOS/pedido-app

 2) Preparar dependencias (Bitnami PostgreSQL)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm dependency update

 3) Instalar en el namespace 'pedido-dev'
helm install pedido-app . -n pedido-dev --create-namespace

 4) Agregar DNS local del Ingress
reemplaza <IP_INGRESS> por la IP de tu controlador (minikube ip o LB)
Ejemplo minikube: echo "$(minikube ip) pedido.local" | sudo tee -a /etc/hosts
Ejemplo genérico:
echo "<IP_INGRESS> pedido.local" | sudo tee -a /etc/hosts

## Instalación con ArgoCD

Aplicar la Application
kubectl apply -f application.yaml -n argocd

## Comandos utiles:

Ver estado general:
kubectl get pods,svc,ingress,hpa -n pedido-dev

Ver logs del backend / frontend:
kubectl logs -n pedido-dev deploy/backend -f
kubectl logs -n pedido-dev deploy/frontend -f




