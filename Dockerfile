# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

WORKDIR /app

ENV NODE_ENV="production"


FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY package-lock.json package.json ./
RUN npm ci --include=dev

COPY . .

RUN npx next build --experimental-build-mode compile

RUN npm prune --omit=dev

FROM base AS final

WORKDIR /app

COPY --from=build /app /app

ENTRYPOINT ["node", "/app/docker-entrypoint.js"]

EXPOSE 3000
CMD ["npm", "run", "start"]