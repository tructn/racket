# Stage 1: Build the application
FROM oven/bun:latest as build

# Set the working directory
WORKDIR /app

# Copy the package.json and bun.lockb to install dependencies
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the Vite React application
RUN bun run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's default static serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if you have one (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
