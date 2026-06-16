#!/usr/bin/env bash
# deploy/deploy.sh — build prod images, push to Artifact Registry, and deploy
# the multi-container Cloud Run service that scales to zero.
#
# Usage (from any directory):
#   PROJECT_ID=my-gcp-project REGION=europe-west2 ./deploy/deploy.sh
#
# Prerequisites:
#   gcloud auth login && gcloud auth configure-docker <region>-docker.pkg.dev

set -euo pipefail

# Always operate from the repository root regardless of invocation directory.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)"
cd "${REPO_ROOT}"

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${REGION:-europe-west2}"          # London — good for NHS workloads
SERVICE_NAME="casenote"
REPO="casenote"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "ERROR: PROJECT_ID is not set. Run: export PROJECT_ID=<your-project>" >&2
  exit 1
fi

echo "==> Project:  ${PROJECT_ID}"
echo "==> Region:   ${REGION}"
echo "==> Registry: ${REGISTRY}"

# ── 1. Enable required APIs ────────────────────────────────────────────────────
echo "==> Enabling APIs..."
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  --project="${PROJECT_ID}"

# ── 2. Create Artifact Registry repository (idempotent) ───────────────────────
echo "==> Ensuring Artifact Registry repo '${REPO}'..."
gcloud artifacts repositories describe "${REPO}" \
  --location="${REGION}" --project="${PROJECT_ID}" &>/dev/null \
|| gcloud artifacts repositories create "${REPO}" \
     --repository-format=docker \
     --location="${REGION}" \
     --project="${PROJECT_ID}"

# ── 3. Configure Docker credential helper ─────────────────────────────────────
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# ── 4. Build prod images ───────────────────────────────────────────────────────
# --platform ensures amd64 even when building on Apple Silicon.
echo "==> Building frontend image (prod)..."
docker build \
  --file apps/frontend/Dockerfile \
  --target prod \
  --platform linux/amd64 \
  --tag "${REGISTRY}/frontend:latest" \
  .

echo "==> Building mock-api image (prod)..."
docker build \
  --file apps/mock-api/Dockerfile \
  --target prod \
  --platform linux/amd64 \
  --tag "${REGISTRY}/mock-api:latest" \
  .

# ── 5. Push images ─────────────────────────────────────────────────────────────
echo "==> Pushing images..."
docker push "${REGISTRY}/frontend:latest"
docker push "${REGISTRY}/mock-api:latest"

# ── 6. Deploy multi-container Cloud Run service ────────────────────────────────
echo "==> Deploying Cloud Run service '${SERVICE_NAME}'..."
sed "s|REGISTRY_PLACEHOLDER|${REGISTRY}|g" deploy/cloudrun.yaml \
  | gcloud run services replace - \
      --region="${REGION}" \
      --project="${PROJECT_ID}"

# ── 7. Grant public access (unauthenticated prototype) ────────────────────────
echo "==> Granting public access..."
gcloud run services add-iam-policy-binding "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --member="allUsers" \
  --role="roles/run.invoker"

# ── 8. Print the live URL ──────────────────────────────────────────────────────
URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)")

echo ""
echo "==> Deployed: ${URL}"
