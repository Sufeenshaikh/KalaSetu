# Backend Dockerfile for Google Cloud Run
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port (Cloud Run will set PORT env variable)
EXPOSE 8080

# Use environment PORT or default to 8080
ENV PORT=8080

# Start the server
CMD ["node", "server.js"]

