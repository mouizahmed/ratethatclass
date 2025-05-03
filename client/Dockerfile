# Use Node.js 20 as the base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables for build time AND runtime
ENV NEXT_PUBLIC_URL=http://localhost:3001

# Build the application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]

