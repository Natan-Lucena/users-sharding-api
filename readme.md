## Description

This application is a user management system that uses database sharding and caching to increase performance.
Additionally, it supports receiving messages to update users' profiles and grpc request to list user details

## 🚀 Technologies Used

- **TS (TypeScript)** — main language of the application
- **Express** — lightweight and fast web framework
- **gRPC** — efficient communication between microservices
- **RabbitMQ** — efficient communication between microservices
- **Protocol Buffers (Protobuf)** — defines gRPC contracts
- **PostgreSQL** — relational database
- **Docker (optional)** — for running dependencies (DB, etc.)
- **JWT (JSON Web Tokens)** — for service-to-service authentication

## 🧩 Microservices Structure

- **users-api** (this project):

  - Responsible for user creation and authentication
  - Generates and signs JWT tokens
  - Exposes a gRPC service (`UserService`) that returns user data
  - Link to repo: https://github.com/Natan-Lucena/users-sharding-api

- **Files-API** (another service):

  - Responsible saving users profile pictures in AWS S3
  - Send messages to a RabbitMQ Queue that is listened by users-api
  - Link to repo:https://github.com/Natan-Lucena/Rabbit-Image-Uploader

- **products-api** (another service):

  - Responsible for product creation and management
  - Validates JWTs received in REST requests
  - Uses gRPC to communicate with the users service
  - Creates products linked to the authenticated user

## ▶️ Running the Project

```bash

# Running Docker

$ Docker-compose up -d

# Run the migrates in all shards

$ npx prisma migrate deploy

# Instaling dependencies

$ npm install

# Running application

$ npm run start:dev

```

## Routes

```bash

$ /users -> Post

$ /users/sign-in -> Post

```

This application must run alongside this repository: https://github.com/Natan-Lucena/Rabbit-Image-Uploader

This application must run alongside this repository: https://github.com/Natan-Lucena/products-go-api
