
# Legalbot_v2

## Introduction
Legalbot_v2 is a legal automation project comprised of two main components: a Spring Boot backend and an Angular frontend. This project aims to streamline legal processes and provide efficient assistance to users.

## Features
- Prerequisites
  Before running Legalbot_v2, ensure you have the following software installed on your development machine:
  - Java Development Kit (JDK) 11 or later (https://www.oracle.com/java/technologies/javase/downloads/)
  - Maven (https://maven.apache.org/)
  - Node.js and npm (https://nodejs.org/)
  - MySQL Workbench

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sathwikiiit/Legalbot_v2.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Legalbot_v2
   ```

3. Install Backend dependencies:
   ```bash
   mvn install
   ```

4. Install Frontend dependencies:
   ```bash
   cd Legalbot
   npm install
   cd .. #back to the project directory
   ```
## Configuring Database Connection (Backend)
To connect Legalbot_v2 to your database, you need to update the application.properties file located in the Backend folder. This file defines various configuration settings for the Spring Boot application.

Here are the essential properties for database connection:
- spring.datasource.url: The JDBC URL of your database server (e.g., jdbc:mysql://localhost:3306/legalbot_db).
- spring.datasource.username: Your database username.
- spring.datasource.password: Your database password.
- spring.jpa.hibernate.ddl-auto: Optional property to control database schema initialization (e.g., update to automatically update schema changes).

## Running the Application
- Start the Backend:
   ```bash
   cd Backend
   mvn spring-boot:run
   ```

   This will start the Spring Boot application, typically accessible on http://localhost:8080 by default (port might vary).

- Start the Frontend:
   ```bash
   cd Legalbot
   ng serve
   ```

   This will start the Angular development server, usually accessible on http://localhost:4200 by default.

Remember: Configure database before running your application.
