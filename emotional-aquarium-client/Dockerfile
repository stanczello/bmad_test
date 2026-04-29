# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Skip desktop packaging postinstall hooks inside container builds.
RUN npm ci --ignore-scripts

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S app && adduser -S -G app app
RUN npm i -g serve@14.2.5

COPY --from=build /app/out/renderer ./out/renderer

USER app
EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4173/ >/dev/null 2>&1 || exit 1

CMD ["serve", "-s", "out/renderer", "-l", "4173"]
