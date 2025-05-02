# projectsphere-backend

## description

ProjectSphere is a scalable and secure backend system built using **Node.js**,**Typescript**, **Express**, **MongoDB**. It provides a role-based project management platform where admins and project managers collaborate efficiently. The system supports secure user authentication, permission handling, project creation, and client management. All features are built following modern backend development practices.

## Features

- **Authentication & Authorization**: Secure login system using JWT and OTP-based flows for password resets and account verification.
- **Role-Based Access Control**: Granular user roles (Admin, Project Manager, etc.) with access control logic based on business needs.
- **User Management**: Endpoints to create, update, and manage user profiles, roles, and account settings.
- **Project Management**: Modular APIs to manage project entities, including client details and stakeholders.
- **Password Policy Enforcement**: Enforces password complexity, expiration every 30 days, and account lockout after repeated failed 3 login attempts.
- **Session Security**: Automatically invalidates all active sessions when a password is reset for enhanced account protection.
- **OTP Verification Flow**: OTP-based password reset flow with configurable expiry time and length.
- **Swagger API Documentation**: Auto-generated Swagger UI for interactive exploration and testing of all endpoints.
- **Standardized API Responses**: Unified response structure with consistent HTTP status codes and messages.
- **Error Handling**: Centralized error handling for streamlined debugging and improved client-side feedback.
- **Scalable & Modular Structure**: Clean codebase organized into modules for future scalability and easy maintenance.

## Prerequisites

Before getting started, ensure that you have the following installed on your local machine:

- **Node.js** (>= 20.x) - [Download from Node.js Official Website](https://nodejs.org/)
- **MongoDB** (or MongoDB Atlas for cloud setup) - [Download from MongoDB Official Website](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js) or **yarn** (optional, preferred for some projects) - [Yarn Official Website](https://yarnpkg.com/)
- **Git** - [Download from Git Official Website](https://github.com/NinjatechDevOps/projectsphere-backend)
<!-- - **Swagger API Documentation** - [Access Swagger Docs](https://construction-qa-backend.projectanddemoserver.com/api-docs) -->

## Project Setup

Follow the steps below to set up the project on your local machine:

### 1. Clone the Repository

First, clone the repository to your local machine using Git:

```bash
git clone https://github.com/NinjatechDevOps/projectsphere-backend
cd projectsphere-backend
```

### 2. Install Dependencies

```bash
npm install
# OR if you prefer yarn:
    # yarn install

```

### 3. Start the project

```bash
npm run dev
```

### 4. Folder structure

### 5.Environment Variables

- `PORT=3000` - The port on which the application will run.
- `NODE_ENV="development"` - The environment mode (e.g., development, production).
- `DB_URL=your-mongo-key` - MongoDB connection string.
- `LOG_FORMAT` -dev
- `LOG_DIR` - your logs direc.
- `RESET_WINDOW_MINUTE`- 5m
- `SECRET_KEY=your-secret-key` - Secret key for secure operations.
- `GMAIL_USER=your-gmail` - Gmail username for email services.
- `OTP_EXPIRY_TIME_MIN` -5m
- `FORGOT_PASSWORD_TOKEN_EXPIRY` -15m
- `GMAIL_PASSWORD=your-gmail-app-password` - Gmail password or app-specific password for email services.
- `EMAIL_SERVICE=your-email-service` - Email service provider.
- `BASE_URL="http://localhost:3000"` - Base URL for the application.
- `FRONTEND_URL=your-frontend-url` - Frontend application URL.
- `BACKEND_SERVER_URL=your-server-url` - Backend server URL.
- `OTP_LENGTH=6` - Length of the OTP (One-Time Password).
- `OTP_EXPIRY_TIME_MIN=5` - OTP expiry time in minutes.
- `TOKEN_EXPIRY=24` - Token expiry time in hours.
- `AWS_REGION=your-region` - AWS region for S3 services.
- `AWS_ACCESS_KEY_ID=your-access-key` - AWS access key ID.
- `AWS_SECRET_ACCESS_KEY=your-secret-key` - AWS secret access key.
- `S3_BUCKET_NAME=your-bucket-name` - S3 bucket name for storage.

## Setup Instructions

1. Create a `.env` file in the root directory of the project.
2. Copy the environment variables listed above into the `.env` file.
3. Replace placeholder values (e.g., `your-access-key`, `your-secret-key`) with actual credentials.
4. Ensure all sensitive information (e.g., passwords, keys) is securely managed and not hardcoded.

## Notes

- The `FRONTEND_URL` and `BACKEND_SERVER_URL` can be adjusted based on your deployment environment.
- For production, consider using secure methods to manage secrets (e.g., AWS Secrets Manager, environment variable injection).

## License

This project is licensed under the MIT License. See the [MIT](https://choosealicense.com/licenses/mit/) file for details.
