# LUMS Registrar Office Management System (LUMS-RO)

## Overview
Web application for managing academic administrative processes at LUMS including document requests, grade change petitions, major declarations, and academic calendar management.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Flask 3.0 (Python) with SQLAlchemy ORM + JWT authentication
- **Proxy**: Express.js serves frontend via Vite and proxies /api/* to Flask on port 5001
- **Database**: PostgreSQL (Neon-backed) via SQLAlchemy
- **Auth**: JWT tokens (Flask-JWT-Extended) with localStorage persistence
- **Routing**: wouter (frontend), Flask Blueprints (backend API)

## Authentication System (Updated Feb 2026)
- Flask backend with JWT token-based authentication (Flask-JWT-Extended)
- Tokens stored in localStorage, sent via Authorization: Bearer header
- 30-minute token expiry
- 3 roles: Student, Instructor, Admin
- role_required decorator for route protection

### Demo Credentials
| Role | Username | Password |
|------|----------|----------|
| Student | student | student123 |
| Instructor | instructor | instructor123 |
| Admin | admin | admin123 |

## Role-Based Access
- **Student**: Document Requests, Major Declaration, Calendar (view), Dashboard
- **Instructor**: Grade Change Petitions, Calendar (view), Dashboard
- **Admin**: All features + Approve/Reject capabilities + Calendar management

## Key Files
- `flask_app/__init__.py` - Flask app factory with JWT setup
- `flask_app/models.py` - SQLAlchemy models (User, DocumentRequest, Payment, etc.)
- `flask_app/decorators.py` - role_required decorator for route protection
- `flask_app/seed.py` - Database seeding (demo users + sample data)
- `flask_app/routes/auth.py` - JWT auth endpoints (login, logout, user)
- `flask_app/routes/document_requests.py` - Document request CRUD
- `flask_app/routes/petitions.py` - Grade change petition CRUD
- `flask_app/routes/major_applications.py` - Major application CRUD
- `flask_app/routes/calendar.py` - Calendar events CRUD
- `flask_app/routes/payments.py` - Payment processing
- `flask_app/routes/notifications.py` - User notifications
- `run.py` - Flask app entry point (port 5001)
- `server/index.ts` - Express server (port 5000) + Flask child process + Vite
- `server/routes.ts` - Express proxy routes to Flask
- `client/src/lib/queryClient.ts` - JWT token management + API request helper
- `client/src/hooks/use-auth.ts` - Auth hook (login/logout/user)
- `client/src/hooks/use-registrar.ts` - Data fetching hooks
- `client/src/components/layout-shell.tsx` - Main layout with role-based nav
- `client/src/pages/` - All page components

## API Routes (Flask)
- POST /api/auth/login - Login, returns JWT token
- POST /api/auth/logout - Logout (client-side token removal)
- GET /api/auth/user - Get current user from JWT
- GET/POST /api/document-requests - Document request CRUD
- PATCH /api/document-requests/:id/status - Update document request status
- GET/POST /api/petitions - Grade change petition CRUD
- PATCH /api/petitions/:id/status - Update petition status
- GET/POST /api/major-applications - Major application CRUD
- PATCH /api/major-applications/:id/status - Update application status
- GET/POST /api/calendar - Calendar events CRUD
- GET/POST /api/payments - Payment CRUD
- GET /api/notifications - User notifications
- PATCH /api/notifications/:id/read - Mark notification as read

## Approval Workflow
- Students/Instructors submit requests
- Admin reviews and approves/rejects with optional comments
- Status flows:
  - Document Requests: submitted → payment_pending → pending_approval → approved/completed/rejected
  - Grade Petitions: submitted → pending_approval → approved/rejected
  - Major Applications: submitted → pending_approval → approved/rejected

## Database Tables (SQLAlchemy models)
- users, sessions, document_requests, payments, grade_change_petitions, major_applications, calendar_events, notifications

## Running the Application
- `npm run dev` starts Express (port 5000) which spawns Flask (port 5001) and Vite
- Express proxies all /api/* requests to Flask backend
- Frontend served by Vite through Express

## Recent Changes (Feb 9, 2026)
- Migrated backend from Express.js to Flask (Python) with SQLAlchemy
- Implemented JWT authentication (Flask-JWT-Extended) replacing session-based auth
- Created SQLAlchemy models matching existing PostgreSQL schema
- Added Flask Blueprint routes for all API endpoints
- Updated frontend to use JWT tokens (localStorage) with Bearer auth headers
- Express server now proxies API requests to Flask backend
- End-to-end tested: login, dashboard, token persistence across page reloads
