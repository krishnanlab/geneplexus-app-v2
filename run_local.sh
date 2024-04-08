#!/usr/bin/env bash

COMPOSE_CMD="docker compose -f local_runner/docker-compose.yml"

${COMPOSE_CMD} up --build -d && \
${COMPOSE_CMD} logs -f frontend backend
