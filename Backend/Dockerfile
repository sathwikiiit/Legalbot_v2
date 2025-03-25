# Use Eclipse Temurin JDK 22 as the base image
FROM eclipse-temurin:22-jdk AS backend

# Set the working directory inside the container for the backend
WORKDIR /app/backend

# Copy the Spring Boot JAR file into the backend container
COPY target/*.jar app.jar

# Use a Node.js image to build the Angular frontend
FROM node:lts-alpine AS frontend

# Set the working directory inside the container for the frontend
WORKDIR /app/frontend

# Copy the Angular application files
COPY Legalbot/ .

# Install Angular dependencies
RUN npm install

# Build the Angular application for production, outputting to Spring Boot static
RUN npm run build -- --prod --output-path=/app/backend/src/main/resources/static

# Expose the application port (change if needed) - Only need to expose the backend port
EXPOSE 9090

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]