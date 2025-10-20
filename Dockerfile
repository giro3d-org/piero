FROM node:23-alpine3.20 AS builder

WORKDIR /app

COPY .env.production.docker .env.production

COPY . .

RUN npm ci

RUN mv config.ts.sample config.ts
RUN mv styles.ts.sample styles.ts

RUN npm run build

FROM nginx:1-alpine-slim

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

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
