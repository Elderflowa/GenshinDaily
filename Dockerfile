FROM node:22-alpine AS build
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY server.mjs .
COPY --from=build /app/dist ./dist
ENV DATA_DIR=/data
VOLUME /data
EXPOSE 3000
CMD ["node", "server.mjs"]
