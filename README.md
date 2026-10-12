# LMS Authentication System for a Role-Based Platform

## 1. Project Description

The LMS Authentication System is a backend application developed using Node.js, TypeScript, Express.js, and MySQL. It provides secure user registration, login, JWT authentication, and role-based access control.

The system supports three user roles: **Student, Instructor, and Admin**. Each role has different permissions to access protected API endpoints.

## 2. Technologies Used

- Node.js
- TypeScript
- Express.js
- MySQL
- bcryptjs
- JSON Web Token (JWT)
- Passport.js
- express-session
- Postman
- Git and GitHub

## 3. Features

- User registration and login.
- Password hashing using bcryptjs.
- JWT-based authentication.
- Role-based authorization for students, instructors, and admins.
- Protected student dashboard.
- Instructor courses endpoint.
- Admin-only user deletion.
- Passport Local Strategy for login authentication.
- Session management using express-session.
- API testing using Postman.

## 4. Project Structure

```text
lms-auth/
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── passport.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   └── roleMiddleware.ts
│   ├── models/
│   │   └── User.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── studentRoutes.ts
│   │   ├── instructorRoutes.ts
│   │   └── adminRoutes.ts
│   └── app.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 5. Installation and Setup

**Step 1: Clone the repository**

```bash
git clone <your-github-repository-url>
```

**Step 2: Open the project folder**

```bash
cd lms-auth
```

**Step 3: Install dependencies**

```bash
npm install
```

**Step 4: Configure environment variables**

Create a `.env` file using `.env.example` and configure your MySQL database details, port, JWT secret, and session secret.

**Step 5: Create the database**

Create a MySQL database named `lms_auth` and create the required `users` table.

**Step 6: Start the application**

```bash
npm run dev
```

The server runs at:

`http://localhost:5000`

## 6. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check server status |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/student/dashboard` | Access the protected dashboard |
| GET | `/api/instructor/courses` | Access instructor courses |
| DELETE | `/api/admin/users/:id` | Delete a user as an admin |

Protected endpoints require a valid JWT in the Authorization header:

```text
Authorization: Bearer <your-jwt-token>
```

## 7. Testing

Use Postman to test registration, login, authentication, role-based authorization, and user deletion. Check the HTTP status codes and response messages for successful requests and errors.

## 8. Security

- Passwords are hashed before storing them in MySQL.
- JWT tokens are verified before protected resources are accessed.
- Role-based middleware restricts access according to user roles.
- Environment variables are used for configuration and secrets.
- The `.env` file should not be uploaded to GitHub.

## 9. Limitations

Google OAuth login has not been implemented in this version. Password recovery and email verification can be added in future updates.

## 10. Conclusion

This project demonstrates how to build a secure authentication system with JWT, Passport.js, MySQL, and role-based authorization. It provides a foundation for managing users and protecting resources in a Learning Management System.
