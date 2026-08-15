# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Set build argument for VITE_API_URL and expose as ENV
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build frontend
RUN npm run build

# Runtime Stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
