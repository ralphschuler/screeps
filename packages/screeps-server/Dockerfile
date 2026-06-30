FROM node:22-bookworm-slim

ARG SCREEPS_VERSION=4.3.0
ARG SCREEPSMOD_AUTH_VERSION=2.8.2
ARG SCREEPSMOD_ADMIN_UTILS_VERSION=1.36.0
ARG SCREEPSMOD_MONGO_VERSION=2.13.0

ENV NODE_ENV=production \
    NODE_PATH=/usr/local/lib/node_modules/screeps/node_modules:/usr/local/lib/node_modules \
    SCREEPS_HOME=/screeps \
    SCREEPS_CONFIG=/screeps/config.ci.yml \
    SCREEPS_MODFILE=/screeps/mods.ci.json

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl python3 make g++ git \
  && npm install -g \
    screeps@${SCREEPS_VERSION} \
    screepsmod-auth@${SCREEPSMOD_AUTH_VERSION} \
    screepsmod-admin-utils@${SCREEPSMOD_ADMIN_UTILS_VERSION} \
    screepsmod-mongo@${SCREEPSMOD_MONGO_VERSION} \
  && rm -rf /usr/local/lib/node_modules/screepsmod-*/node_modules/@screeps \
  && npm cache clean --force \
  && apt-get purge -y git \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /screeps
COPY packages/screeps-server/docker-entrypoint.sh /usr/local/bin/screeps-ci-entrypoint
RUN chmod +x /usr/local/bin/screeps-ci-entrypoint \
  && useradd --create-home --shell /bin/bash screeps \
  && chown -R screeps:screeps /screeps

USER screeps
EXPOSE 21025 21026
ENTRYPOINT ["screeps-ci-entrypoint"]
