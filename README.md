# LUMS Registrar Office Management System (LUMS-RO)

A full-stack web application for managing academic administrative processes at LUMS (Lahore University of Management Sciences), including document requests, grade change petitions, major declarations, and academic calendar management.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, wouter (routing), TanStack Query
- **Backend**: Flask 3.0 (Python), SQLAlchemy ORM, Flask-JWT-Extended
- **Database**: PostgreSQL
- **Proxy**: Express.js serves the frontend via Vite and proxies `/api/*` requests to the Flask backend

## Features

### Role-Based Access Control
The system supports three user roles, each with different permissions:

| Role | Capabilities |
|------|-------------|
| **Student** | Submit document requests, declare/change major, view calendar, dashboard |
| **Instructor** | Submit grade change petitions, view calendar, dashboard |
| **Admin** | Review and approve/reject all requests, manage calendar events, full dashboard |

### Core Modules

- **Document Requests** - Students can request academic documents (transcripts, enrollment letters, etc.) with a built-in payment workflow
- **Grade Change Petitions** - Instructors submit grade change requests for students with justification; duplicate detection per student/course
- **Major Declarations** - Students can declare or change their major/school; prevents duplicate pending applications for the same school and major
- **Academic Calendar** - View academic events; admins can create and manage calendar entries
- **Notifications** - In-app notification system for status updates on requests
- **Payments** - Payment tracking for document requests

### Approval Workflows

| Request Type | Status Flow |
|-------------|-------------|
| Document Requests | submitted &rarr; payment_pending &rarr; pending_approval &rarr; approved/completed/rejected |
| Grade Petitions | submitted &rarr; pending_approval &rarr; approved/rejected |
| Major Applications | submitted &rarr; pending_approval &rarr; approved/rejected |

### Authentication

- JWT token-based authentication with 30-minute expiry
- Automatic token refresh (20-minute interval)
- Silent retry on 401 errors
- Role-based route protection via `role_required` decorator

## Project Structure

```
LUMS-RO/
├── client/                    # Frontend (React + TypeScript)
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── hooks/             # Custom hooks (auth, data fetching)
│       ├── lib/               # Utilities (API client, query config)
│       └── pages/             # Page components
├── flask_app/                 # Backend (Flask + SQLAlchemy)
│   ├── __init__.py            # App factory, JWT setup
│   ├── models.py              # SQLAlchemy models
│   ├── decorators.py          # Auth decorators
│   ├── seed.py                # Database seeding
│   └── routes/                # API route blueprints
│       ├── auth.py
│       ├── document_requests.py
│       ├── petitions.py
│       ├── major_applications.py
│       ├── calendar.py
│       ├── payments.py
│       └── notifications.py
├── server/                    # Express proxy server
│   ├── index.ts
│   └── routes.ts
└── run.py                     # Flask entry point
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT token |
| POST | `/api/auth/logout` | Logout (client-side token removal) |
| GET | `/api/auth/user` | Get current authenticated user |

### Document Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/document-requests` | List document requests |
| POST | `/api/document-requests` | Create a new document request |
| PATCH | `/api/document-requests/:id/status` | Update request status |

### Grade Change Petitions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/petitions` | List petitions |
| POST | `/api/petitions` | Create a new petition |
| PATCH | `/api/petitions/:id/status` | Update petition status |

### Major Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/major-applications` | List major applications |
| POST | `/api/major-applications` | Create a new application |
| PATCH | `/api/major-applications/:id/status` | Update application status |

### Calendar & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar` | List calendar events |
| POST | `/api/calendar` | Create a calendar event (admin) |
| GET | `/api/notifications` | List user notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Create a payment |

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ibrahim-Noor/LUMS-RO.git
   cd LUMS-RO
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install flask flask-jwt-extended flask-cors sqlalchemy psycopg2-binary
   ```

4. Set up environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_secret_key
   ```

5. Run the application:
   ```bash
   npm run dev
   ```
   This starts Express (port 5000) which spawns Flask (port 5001) and the Vite dev server.

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Student | student | student123 |
| Instructor | instructor | instructor123 |
| Admin | admin | admin123 |

## Database Schema

The application uses the following PostgreSQL tables managed via SQLAlchemy:

- `users` - User accounts with role-based access
- `document_requests` - Academic document requests
- `payments` - Payment records for document requests
- `grade_change_petitions` - Grade change petition records
- `major_applications` - Major declaration/change applications
- `calendar_events` - Academic calendar events
- `notifications` - User notification records
- `sessions` - Session management

## License

This project is developed for academic purposes at LUMS.
