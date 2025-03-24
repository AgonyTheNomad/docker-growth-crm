# Development-focused Dockerfile for React app using Yarn
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies with Yarn
RUN yarn install

# Copy the rest of the code
COPY . .

# Expose port for the application
EXPOSE 3000

# Command to run the React development server
CMD ["yarn", "start"]