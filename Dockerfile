# syntax=docker/dockerfile:1
# Build context: this repo's root (pivault-pwa).

# ---- build the static app ----
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json .npmrc ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME=PiVault
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_NAME=$VITE_APP_NAME
RUN npm run build

# ---- tiny carrier image: just the files ----
FROM busybox:stable
COPY --from=builder /app/dist /site
CMD ["true"]
