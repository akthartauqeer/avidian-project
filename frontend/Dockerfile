FROM node:23-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port Vite runs on
EXPOSE 3000

# Run the built application
CMD ["npx", "serve", "-s", "dist"]
