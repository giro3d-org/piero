FROM node:24 AS builder
WORKDIR /piero-build

COPY --parents package.json package-lock.json packages/*/package.json /piero-build/
RUN npm ci
COPY . .
COPY .env.production.docker .env.production
RUN npm run libs:build && npm run app:build

FROM nginx:1-alpine-slim

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=builder /piero-build/dist /usr/share/nginx/html

# Copy optional custom Nginx config (if needed)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENV PIERO_BASE_URL="http://localhost:8080"
ENV PIERO_APP_TITLE="Piero"

COPY env.sh /docker-entrypoint.d/env.sh
RUN dos2unix /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh
ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["nginx","-g","daemon off;"]
