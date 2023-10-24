# Use Node.js 18 alpine
FROM node:18-alpine

# Install Redis
RUN apk add --no-cache redis

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy Prisma files
COPY prisma ./prisma/

# Copy tsconfig.json
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Start Redis server in the background
RUN redis-server --daemonize yes

# Expose the application on port 3000
EXPOSE 3000

# The command to run the application
CMD ["npm", "run", "start:prod"]
