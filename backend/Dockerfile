# KalaSetu/backend/Dockerfile

# Use Node.js 20-slim as the base image to satisfy joi@18.0.1's requirement (Node.js >= 20)
# 'slim' is generally preferred over 'alpine' for Node.js in production for better compatibility
# with pre-built binaries of some npm packages.
FROM node:20-slim

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's build cache.
# Changes to these files invalidate this layer, triggering re-installation of dependencies.
COPY package*.json ./

# Install dependencies using 'npm ci' for clean, reproducible installs.
# We are installing only production dependencies.
# The 'npm install' step (on your local machine) prior to pushing code
# will ensure package.json and package-lock.json are in sync.
RUN npm ci --only=production

# Copy the rest of your application code into the container.
# This includes server.js, and any other application files.
COPY . .

# Expose the port your application will listen on.
# Cloud Run will inject the PORT environment variable, which your Node.js app
# should use. EXPOSE is mostly for documentation or for local testing.
# Your Node.js application itself *must* listen on process.env.PORT.
EXPOSE 8080

# Cloud Run automatically injects the PORT environment variable.
# Your Node.js application should read from process.env.PORT.
# This ENV line here is often redundant in Cloud Run, but can serve as a fallback
# or for local testing if not explicitly set elsewhere.
ENV PORT=8080

# Command to start your Node.js application.
# Ensure your package.json has a "start" script, e.g., "start": "node server.js"
CMD ["npm", "start"]


