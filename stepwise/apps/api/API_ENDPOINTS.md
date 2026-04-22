# StepWise Developer API Documentation

This document explains the core REST endpoints exposed by the StepWise API (`http://localhost:4000`), what payloads they expect, and how to test them.

---

## 1. System Health

### `GET /health`
- **Description:** Verifies the API is online and responding.
- **Input:** None
- **Response:** `{ "status": "ok", "ts": "2026-04-22T..." }`
- **Test Command:**
  ```bash
  curl http://localhost:4000/health
  ```

---

## 2. Authentication (Public Routes)

### `POST /auth/register`
- **Description:** Creates a new student account in the database and automatically securely hashes the password.
- **Headers:** `Content-Type: application/json`
- **Input Body:**
  ```json
  {
    "email": "student@example.com",
    "password": "securepassword",
    "username": "student123"
  }
  ```
- **Response:** `201 Created` with userId, email, and username.
- **Test Command:**
  ```bash
  curl -X POST http://localhost:4000/auth/register \
       -H "Content-Type: application/json" \
       -d '{"email":"test@test.com","password":"password123","username":"tester"}'
  ```

### `POST /auth/login/password`
- **Description:** Authenticates a user and issues a raw JWT authorization token for subsequent requests.
- **Headers:** `Content-Type: application/json`
- **Input Body:**
  ```json
  {
    "email": "test@test.com",
    "password": "password123"
  }
  ```
- **Response:** `200 OK` with `{ "token": "eyJh..." }`
- **Test Command:**
  ```bash
  curl -X POST http://localhost:4000/auth/login/password \
       -H "Content-Type: application/json" \
       -d '{"email":"test@test.com","password":"password123"}'
  ```

---

## 3. Curriculum Data (Public Routes)

### `GET /challenges`
- **Description:** Retrieves the master catalog of all available challenges/quests loaded in the StepWise ecosystem.
- **Input:** None
- **Response:** Array of challenge objects (ID, title, description, language).
- **Test Command:**
  ```bash
  curl http://localhost:4000/challenges
  ```

### `GET /challenges/:id`
- **Description:** Fetches deeply nested curriculum metadata (like Steps and System Requirements) for a specific challenge.
- **Input:** URL Parameter `:id` (e.g., `node-crud`).
- **Response:** Complete JSON manifest of the challenge.
- **Test Command:**
  ```bash
  curl http://localhost:4000/challenges/node-crud
  ```

---

## 4. Protected Routes
*Note: All endpoints below strictly require an Authorization header containing the JWT token issued by the `/auth/login/password` route: `Authorization: Bearer <TOKEN>`*

### `GET /auth/me`
- **Description:** Validates your JWT token and returns securely authenticated profile data.
- **Input:** Authentication Header only.
- **Test Command:**
  ```bash
  curl http://localhost:4000/auth/me \
       -H "Authorization: Bearer YOUR_JWT_TOKEN"
  ```

### `GET /dashboard`
- **Description:** Returns the current user's aggregated progression metrics (completed challenges, in-progress challenges).
- **Input:** Authentication Header only.

### `POST /attempts/start`
- **Description:** Signals the backend that the user is actively starting to code a specific challenge natively.
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <TOKEN>`
- **Input Body:**
  ```json
  {
    "challengeId": "node-crud",
    "userId": "<YOUR-USER-ID>",
    "mode": "local"
  }
  ```

### `POST /attempts/submit-result`
- **Description:** Natively triggered by the StepWise CLI once unit tests execute in the student's terminal. Stores the test outcomes structurally in the Postgres Database.
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <TOKEN>`
- **Input Body:**
  ```json
  {
    "attemptId": "<UUID>",
    "userId": "<YOUR-USER-ID>",
    "result": {
      "challengeId": "node-crud",
      "challengeVersion": "1.0",
      "stepId": "01-setup",
      "mode": "local",
      "total": 1,
      "passed": 1,
      "failed": 0,
      "executionTime": 1500,
      "results": [
        {
          "name": "Server responds quickly",
          "status": "pass",
          "duration": 50
        }
      ]
    }
  }
  ```
