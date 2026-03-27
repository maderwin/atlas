FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_SERVICES_YAML_URL=/data/services.yaml
RUN npm run build
# Remove any bundled YAML data
RUN rm -f dist/services.yaml dist/vibe.yaml

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/data
EXPOSE 80
