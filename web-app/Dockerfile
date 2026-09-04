FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web-app/package.json web-app/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile --filter @bozar/web-app...
COPY web-app web-app
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm --dir web-app build

FROM nginx:1.27-alpine
COPY web-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web-app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/health || exit 1
