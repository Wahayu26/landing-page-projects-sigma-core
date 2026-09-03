# Build this directory, NOT the new frontend repository root.
# The existing CMS image supplies the matching Payload source and dependencies.
ARG CMS_BASE_IMAGE=scs/web:20260901-2
FROM ${CMS_BASE_IMAGE}

USER root
WORKDIR /app
COPY --chown=1001:1001 apply.mjs /opt/scs-cms-ui/apply.mjs
COPY --chown=1001:1001 overlay /opt/scs-cms-ui/overlay
RUN node /opt/scs-cms-ui/apply.mjs /app \
    && chown -R 1001:1001 '/app/app/(payload)' /app/cms/components \
       /app/payload.config.ts /app/public/assets/scs-icon.png

USER nextjs
# Build-only placeholders; no production database, SMTP credentials or account data.
# These do not become runtime ENV values in the resulting image.
RUN PAYLOAD_DB_PROVIDER=sqlite \
    PAYLOAD_SQLITE_URL=file:/tmp/scs-cms-ui-build.db \
    PAYLOAD_DB_PUSH=false \
    PAYLOAD_SECRET=scs-ui-build-placeholder-not-for-runtime \
    PAYLOAD_SERVER_URL=https://cms.sigmacore.id \
    NEXT_PUBLIC_SERVER_URL=https://sigmacore.id \
    NEXT_TELEMETRY_DISABLED=1 \
    pnpm build

# Retain the base image's non-root runtime, start command, healthcheck and port.
