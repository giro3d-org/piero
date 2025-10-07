FROM node:23-alpine3.20 AS builder

WORKDIR /app

COPY . .

RUN npm ci

RUN mv config.ts.sample config.ts
RUN mv styles.ts.sample styles.ts

ARG BASE_URL=http://localhost:8080

RUN npm run build -- --base $BASE_URL

FROM nginx:1-alpine-slim

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optional custom Nginx config (if needed)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
