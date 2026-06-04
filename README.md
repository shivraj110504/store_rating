# RateHub — Store Rating Platform

A full‑stack, role‑based store rating application that allows users to discover stores, submit ratings, and lets admins manage users and stores.

## Table of Contents

- [Demo (accounts)](#demo-accounts)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Seeding Data](#seeding-data)
- [Running the App](#running-the-app)
- [Core Features](#core-features)
- [API Endpoints (overview)](#api-endpoints-overview)
- [Database Schema (summary)](#database-schema-summary)
- [License & Author](#license--author)

## Demo Accounts

Use these demo accounts for manual testing (credentials provided for a local demo environment only):

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@ratehub.com | Admin@123 |
| Store Owner | owner@ratehub.com | Owner@123 |
| User | user@ratehub.com | User@1234 |

## Tech Stack

- Backend: NestJS, TypeORM, Passport (JWT)
- Database: PostgreSQL
- Frontend: React + TypeScript, Vite
- Auth: JSON Web Tokens (JWT)

## Project Structure

Top-level layout:

```
store-rating-app/
├── backend/       # NestJS backend
└── frontend/      # React + Vite frontend
```

## Prerequisites

- Node.js >= 18
- npm (or pnpm/yarn)
- PostgreSQL (local install or Docker)

## Local Setup

1. Clone the repository and enter the project:

```bash
git clone https://github.com/shivraj110504/store_rating
cd store-rating-app
```

2. Start PostgreSQL (example using Docker):

```bash
docker run --name ratehub-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=store_rating_db \
  -p 5432:5432 \
  -d postgres
```

## Environment Variables

Copy the example env and edit values for your environment:

```bash
cd backend
cp .env.example .env
```

Required variables are listed in `backend/.env.example` (DB connection, JWT secret, port, etc.).

## Seeding Data

The backend includes a seed script to create demo users and sample stores/ratings.

From the `backend` folder run:

```bash
npm install
npm run seed
```

## Running the App (development)

Backend (NestJS):

```bash
cd backend
npm install
npm run start:dev
```

Frontend (Vite + React):

```bash
cd frontend
npm install
npm run dev
```

Open the frontend in your browser at the URL shown by Vite (usually `http://localhost:5173`). The backend defaults to port `3001`.

## Core Features

- Role-based authentication: Admin, Store Owner, User
- User registration and login
- Browse stores and filter results
- Submit, update, and view ratings
- Admin dashboard: manage users and stores
- Store owner dashboard: view assigned store analytics

## API Endpoints (overview)

Base path: `/api`

- Auth
  - `POST /auth/login` — login and receive JWT
  - `POST /auth/register` — create account
- Users
  - `GET /users` — list users (admin)
  - `POST /users` — create user (admin)
  - `GET /users/me` — current user
  - `PATCH /users/password` — update password
- Stores
  - `GET /stores` — list stores
  - `POST /stores` — create store
  - `GET /stores/:id` — store details
  - `GET /stores/my-store` — store owner endpoint
- Ratings
  - `POST /ratings` — create rating
  - `PATCH /ratings/:id` — update rating
- Admin
  - `GET /admin/dashboard` — admin metrics

Refer to the backend source (controllers in `backend/src`) for full endpoint details and request/response shapes.

## Database Schema (summary)

- `users`: id, name, email, password, role, address
- `stores`: id, name, email, address, ownerId
- `ratings`: id, value, userId, storeId

#
