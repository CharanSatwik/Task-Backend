# Task Management API

A lightweight, robust RESTful Task Management API built with **Node.js** and **Express**, utilizing an in-memory storage array.

---

## Architecture & Folder Structure

The project follows a clean MVC + Middleware pipeline structure:

```
task-backend/
├── config/
│   └── constants.js        # Status enums, validation limits, port config
├── controllers/
│   └── taskController.js   # Business logic and HTTP response handling
├── middleware/
│   ├── taskValidator.js    # Comprehensive request validation (params, body, query, headers)
│   └── errorHandler.js     # Malformed JSON, 404 route not found, and global 500 handlers
├── models/
│   ├── taskSchema.js       # Task entity class with schema validation logic
│   └── taskModel.js        # In-memory repository with seed data, query filters, and CRUD
├── routes/
│   └── taskRoutes.js       # Route declarations under /api/tasks wired to middleware
├── docs/
│   └── images/             # Interaction snapshots and documentation assets
├── public/
│   └── index.html          # Interactive web dashboard for instant browser testing
├── app.js                  # Express setup, static files, and error handlers
├── server.js               # Server entry point listening on port 3000
├── test_api.js             # Automated test suite (29 tests)
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm`

### Installation

```bash
npm install
```

### Running the Server

Start in production mode:
```bash
npm start
```

Start in development mode (with automatic reload on file changes):
```bash
npm run dev
```

The server listens on:
```
http://localhost:3000
```

- **Interactive Dashboard (Browser)**: Visit `http://localhost:3000` to create, filter, update, and delete tasks directly from a web UI.
- **REST API Endpoints**: Access `http://localhost:3000/api/tasks` for raw JSON responses.

### Running Tests

Run the comprehensive automated test suite (29 test assertions):
```bash
npm test
```

---

## Result

### 1. Interactive Web Dashboard (`http://localhost:3000`)
The web dashboard provides a live interface to create, filter by status, update, and delete tasks in real time:

![Task Management Dashboard](docs/images/result-dashboard.png)

### 2. REST API JSON Output (`http://localhost:3000/api/tasks`)
Raw JSON response returned by the backend verifying task creation, auto-generated IDs, status tracking, and ISO timestamps:

![REST API JSON Response](docs/images/result-json-api.png)

---

## Data Model

Each task contains the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | Number | Auto-generated positive integer (e.g. `1`, `2`) |
| `title` | String | **Required**, non-empty, max 255 characters |
| `description` | String | Optional string, max 2000 characters (default: `""`) |
| `status` | String | `"pending"`, `"in-progress"`, or `"completed"` (default: `"pending"`) |
| `created_at` | String | Auto-generated ISO 8601 timestamp |

---

## Request Validation Rules

Validation is applied before reaching controllers:

1. **Route Parameter (`:id`) Validation**:
   - Must be a positive integer (e.g. `1`, `2`). Non-numeric or negative values return `400 Bad Request`.
2. **Payload / Body Validation**:
   - Must be a valid JSON object (arrays and primitive values are rejected with `400 Bad Request`).
   - Fields `id` and `created_at` cannot be supplied in `POST` or `PUT` payloads (returns `400 Bad Request`).
   - `title`: Must be a non-empty string after trimming; max 255 chars.
   - `description`: If provided, must be a string; max 2000 chars.
   - `status`: If provided, must be strictly one of `pending`, `in-progress`, or `completed`.
   - `PUT` requests require at least one valid updatable field (`title`, `description`, or `status`).
3. **Query Parameter Validation**:
   - `GET /api/tasks?status=...`: Must be one of the allowed statuses.
4. **Content-Type Validation**:
   - `POST` and `PUT` require `Content-Type: application/json`.
5. **JSON Parse Validation**:
   - Malformed JSON payloads return `400 Bad Request` with `{ "error": "Malformed JSON payload in request body." }`.

---

## API Endpoints & Examples

Base URL: `http://localhost:3000`

### 1. Create a Task
- **Method**: `POST /api/tasks`
- **Status Code**: `201 Created`

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build backend API",
    "description": "Implement Node.js and Express Task API",
    "status": "in-progress"
  }'
```

**Response (`201 Created`):**
```json
{
  "id": 1,
  "title": "Build backend API",
  "description": "Implement Node.js and Express Task API",
  "status": "in-progress",
  "created_at": "2026-10-19T09:45:00.000Z"
}
```

---

### 2. Get All Tasks (with optional status filter)
- **Method**: `GET /api/tasks`
- **Method with query filter**: `GET /api/tasks?status=in-progress`
- **Status Code**: `200 OK`

```bash
curl http://localhost:3000/api/tasks
```

**Response (`200 OK`):**
```json
[
  {
    "id": 1,
    "title": "Build backend API",
    "description": "Implement Node.js and Express Task API",
    "status": "in-progress",
    "created_at": "2026-10-19T09:45:00.000Z"
  }
]
```

---

### 3. Get Single Task by ID
- **Method**: `GET /api/tasks/:id`
- **Status Code**: `200 OK` (or `404 Not Found`, `400 Bad Request`)

```bash
curl http://localhost:3000/api/tasks/1
```

**Response (`200 OK`):**
```json
{
  "id": 1,
  "title": "Build backend API",
  "description": "Implement Node.js and Express Task API",
  "status": "in-progress",
  "created_at": "2026-10-19T09:45:00.000Z"
}
```

---

### 4. Update a Task by ID
- **Method**: `PUT /api/tasks/:id`
- **Status Code**: `200 OK` (or `400 Bad Request`, `404 Not Found`)

```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

**Response (`200 OK`):**
```json
{
  "id": 1,
  "title": "Build backend API",
  "description": "Implement Node.js and Express Task API",
  "status": "completed",
  "created_at": "2026-10-19T09:45:00.000Z"
}
```

---

### 5. Delete a Task by ID
- **Method**: `DELETE /api/tasks/:id`
- **Status Code**: `200 OK` (or `404 Not Found`, `400 Bad Request`)

```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

**Response (`200 OK`):**
```json
{
  "message": "Task with id '1' deleted successfully.",
  "task": {
    "id": 1,
    "title": "Build backend API",
    "description": "Implement Node.js and Express Task API",
    "status": "completed",
    "created_at": "2026-10-19T09:45:00.000Z"
  }
}
```

---

## Status Codes & Error Responses

| Status Code | Reason | Example Response |
|---|---|---|
| `200 OK` | Successful retrieval, update, or deletion | `{"id": 1, ...}` or `{"message": "..."}` |
| `201 Created` | Task successfully created | `{"id": 1, ...}` |
| `400 Bad Request` | Missing/empty title | `{"error": "Title is required and must be a non-empty string."}` |
| `400 Bad Request` | Invalid status value | `{"error": "Invalid status. Status must be one of: pending, in-progress, completed."}` |
| `400 Bad Request` | Invalid ID parameter | `{"error": "Invalid task ID 'abc'. ID must be a positive integer."}` |
| `400 Bad Request` | Attempting to modify `id` or `created_at` | `{"error": "Fields 'id' and 'created_at' are immutable and cannot be updated."}` |
| `400 Bad Request` | Malformed JSON in request | `{"error": "Malformed JSON payload in request body."}` |
| `404 Not Found` | Task ID does not exist | `{"error": "Task with id '99' not found."}` |
| `404 Not Found` | Route does not exist | `{"error": "Cannot GET /unknown - Route not found."}` |
| `415 Unsupported Media Type` | Non-JSON Content-Type on POST/PUT | `{"error": "Unsupported Media Type. Content-Type must be application/json."}` |
| `500 Internal Server Error` | Unhandled server error | `{"error": "Internal Server Error"}` |

---

## Interaction with agent

Below are the interaction snapshots capturing the iterative development and requirements discussion with the AI agent:

### 1. Initial Prompt & Project Setup
![Initial Prompt & Backend Requirements](docs/images/interaction-1-initial-prompt.png)

### 2. Feature Specification & Schema Confirmation
![Task Management Features and Schema](docs/images/interaction-2-feature-spec.png)

### 3. Refinement, Model Generation, and Quality Improvements
![Refinement Prompt and Quality Implementation](docs/images/interaction-3-refinement-prompt.png)

