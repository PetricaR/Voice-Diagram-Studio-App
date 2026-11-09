#!/usr/bin/env bash
# Voice Diagram Studio on Google Cloud Run.
#
#   ./cloudrun.sh setup     once: runtime service account, session secret, IAM, Firestore TTL
#   ./cloudrun.sh deploy    build from source and deploy (sign-in required, fails closed)
#
# GOOGLE_CLIENT_ID=<web client id> ./cloudrun.sh deploy also sets the OAuth client
# (README → Sign-in); later deploys keep it. Override any of the names below
# with environment variables.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT=${PROJECT:-formare-dev}
REGION=${REGION:-europe-west4}
SERVICE=${SERVICE:-voice-diagram-studio}
SA_NAME=${SA_NAME:-voice-diagram-studio}
SA="$SA_NAME@$PROJECT.iam.gserviceaccount.com"
KEY_SECRET=${KEY_SECRET:-gemini-drawio-api-key}
SESSION_SECRET_NAME=${SESSION_SECRET_NAME:-voice-studio-session-secret}
MAX_INSTANCES=${MAX_INSTANCES:-10}

setup() {
  if ! gcloud iam service-accounts describe "$SA" --project "$PROJECT" >/dev/null 2>&1; then
    gcloud iam service-accounts create "$SA_NAME" --project "$PROJECT" \
      --display-name "Voice Diagram Studio runtime" \
      --description "Cloud Run service $SERVICE: reads its two secrets and the studio_users / studio_usage Firestore collections"
  fi
  if ! gcloud secrets describe "$SESSION_SECRET_NAME" --project "$PROJECT" >/dev/null 2>&1; then
    # Random, never printed: piped straight into Secret Manager
    openssl rand -base64 48 | tr -d '\n' |
      gcloud secrets create "$SESSION_SECRET_NAME" --project "$PROJECT" --replication-policy automatic --data-file -
  fi
  for secret in "$KEY_SECRET" "$SESSION_SECRET_NAME"; do
    gcloud secrets add-iam-policy-binding "$secret" --project "$PROJECT" \
      --member "serviceAccount:$SA" --role roles/secretmanager.secretAccessor --condition None >/dev/null
  done
  # Sign-ins and daily session counts
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member "serviceAccount:$SA" --role roles/datastore.user --condition None >/dev/null
  # Old daily counters delete themselves (studio_usage/{day}:{user}.expireAt)
  gcloud firestore fields ttls update expireAt --collection-group studio_usage --enable-ttl \
    --project "$PROJECT" --async --quiet
  echo "Set up $SA, $SESSION_SECRET_NAME and the Firestore TTL in $PROJECT."
}

deploy() {
  local env="STUDIO_AUTH=google"
  [[ -n "${GOOGLE_CLIENT_ID:-}" ]] && env+="@GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
  [[ -n "${STUDIO_OWNER_EMAILS:-}" ]] && env+="@STUDIO_OWNER_EMAILS=$STUDIO_OWNER_EMAILS"
  gcloud run deploy "$SERVICE" --source . --project "$PROJECT" --region "$REGION" \
    --service-account "$SA" \
    --max-instances "$MAX_INSTANCES" \
    --set-secrets "GEMINI_API_KEY=$KEY_SECRET:latest,SESSION_SECRET=$SESSION_SECRET_NAME:latest" \
    --update-env-vars "^@^$env"
}

case "${1:-}" in
  setup) setup ;;
  deploy) deploy ;;
  *) sed -n '2,10p' "$0"; exit 1 ;;
esac
