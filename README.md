# Store Rating System

A full-stack web application where users can register, browse stores, and submit ratings (1–5).
The platform has a single login system with **three roles** — System Administrator, Normal User, and
Store Owner — each with role-based access to different functionality.



## Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Backend  | **Express.js** (Node.js)                     |
| Database | **MySQL** (raw SQL via `mysql2`, no ORM)     |
| Frontend | **React** (Vite) + React Router              |
| Auth     | JWT (JSON Web Tokens) + bcrypt password hash |

---

## Features by Role

### System Administrator
- Dashboard with total **users**, total **stores**, and total **ratings**.
- Add new users (Normal / Admin / Owner) and stores.
- List stores (Name, Email, Address, Rating) with filters.
- List users (Name, Email, Address, Role) with filters; Owner rows show their store's average rating.
- Sorting (asc/desc) on key fields. Secure logout.

### Normal User
- Sign up and log in.
- View / search the list of registered stores by **Name** and **Address**.
- See each store's overall average rating and their own submitted rating.
- Submit and **modify** a rating (1–5) for any store.
- Update password.

### Store Owner
- Log in to a dashboard.
- See the **list of users** who have rated their store.
- See the **average rating** of their store.
- Update password.

---

## Form Validations (enforced on frontend AND backend)
- **Name:** 20–60 characters.
- **Address:** max 400 characters.
- **Password:** 8–16 characters, at least one uppercase letter and one special character.
- **Email:** standard email format.

---

## Project Structure

```
.
├── backend/                 # Express + MySQL API
│   ├── src/
│   │   ├── config/          # env config
│   │   ├── db/              # pool, schema.sql, init + seed scripts
│   │   ├── middleware/      # auth (JWT/role) + error handling
│   │   ├── controllers/     # auth, account, admin, user, owner
│   │   ├── routes/          # route definitions
│   │   ├── utils/           # validators, hashing/JWT, sorting
│   │   ├── app.js           # Express app
│   │   └── server.js        # entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                # React (Vite) client
    ├── src/
    │   ├── api/             # fetch client
    │   ├── components/      # Layout, DataTable, StarRating, ProtectedRoute
    │   ├── context/         # AuthContext
    │   ├── hooks/           # useSort
    │   ├── pages/           # login, register, admin/, user/, owner/
    │   ├── utils/           # validators
    │   ├── App.jsx          # routes
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## Prerequisites
- **Node.js** v18+ and npm
- **MySQL** server v8+ running locally (or a remote connection string)

---

## Step-by-Step Setup

### 1. Database
Make sure MySQL is running. You do **not** need to create tables manually — the init script does it.
Just make sure you know your MySQL username/password.

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your MySQL credentials and a JWT secret:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://localhost:5173
```

Install dependencies and initialize the database (creates the `store_rating` database + tables):

```bash
npm install
npm run db:init      # creates database and tables from schema.sql
npm run db:seed      # creates a default admin + sample stores/users (optional)
```

Start the API:

```bash
npm run dev          # http://localhost:4000
```

**Default accounts (from `npm run db:seed`):**

| Role  | Email                     | Password     |
| ----- | ------------------------- | ------------ |
| Admin | `admin@store-rating.com`  | `Admin@1234` |
| Owner | `owner@store-rating.com`  | `Owner@1234` |
| User  | `user@store-rating.com`   | `User@1234`  |

### 3. Frontend

In a new terminal:

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev            # http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## API Overview

| Method | Endpoint                      | Role  | Description                       |
| ------ | ----------------------------- | ----- | --------------------------------- |
| POST   | `/api/auth/register`          | —     | Normal user sign up               |
| POST   | `/api/auth/login`             | —     | Login (all roles)                 |
| GET    | `/api/account/me`             | Auth  | Current user                      |
| PUT    | `/api/account/password`       | Auth  | Update password                   |
| GET    | `/api/admin/dashboard`        | Admin | Totals                            |
| POST   | `/api/admin/users`            | Admin | Create user                       |
| GET    | `/api/admin/users`            | Admin | List/filter/sort users            |
| GET    | `/api/admin/users/:id`        | Admin | User details                      |
| POST   | `/api/admin/stores`           | Admin | Create store                      |
| GET    | `/api/admin/stores`           | Admin | List/filter/sort stores           |
| GET    | `/api/stores`                 | User  | List stores + my rating           |
| POST   | `/api/stores/:id/rating`      | User  | Submit / update a rating          |
| GET    | `/api/owner/dashboard`        | Owner | Avg rating + raters of own store  |

All protected routes require an `Authorization: Bearer <token>` header.

---

## Notes
- Passwords are hashed with **bcrypt**; tokens are signed with **JWT**.
- All SQL uses **parameterized queries** (`?` placeholders) to prevent SQL injection.
- Validation rules from the spec are enforced on both client and server.
