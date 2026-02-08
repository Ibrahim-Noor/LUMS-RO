# LUMS Registrar Office Management System (LUMS-RO)

## Overview
Web application for managing academic administrative processes at LUMS including document requests, grade change petitions, major declarations, and academic calendar management.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon-backed) via Drizzle ORM
- **Auth**: Username/password with passport-local + bcrypt (session-based)
- **Routing**: wouter (frontend), Express (backend)

## Authentication System (Updated Feb 2026)
- Switched from Replit Auth to username/password authentication
- Uses passport-local strategy with bcrypt password hashing (12 rounds)
- Session-based auth with connect-pg-simple session store
- 3 roles: Student, Instructor, Admin

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
- `shared/schema.ts` - Database schema (Drizzle ORM)
- `shared/models/auth.ts` - User & session table definitions
- `shared/routes.ts` - API contract definitions
- `server/auth.ts` - Authentication setup (passport-local, bcrypt)
- `server/routes.ts` - API route handlers + seed data
- `server/storage.ts` - Database CRUD operations
- `client/src/hooks/use-auth.ts` - Auth hook (login/logout/user)
- `client/src/hooks/use-registrar.ts` - Data fetching hooks
- `client/src/components/layout-shell.tsx` - Main layout with role-based nav
- `client/src/pages/` - All page components

## Approval Workflow
- Students/Instructors submit requests
- Admin reviews and approves/rejects with optional comments
- Status flows:
  - Document Requests: submitted → payment_pending → pending_approval → approved/completed/rejected
  - Grade Petitions: submitted → pending_approval → approved/rejected
  - Major Applications: submitted → pending_approval → approved/rejected

## Database Tables
- users, sessions, document_requests, payments, grade_change_petitions, major_applications, calendar_events, notifications

## Recent Changes (Feb 8, 2026)
- Removed Replit Auth integration entirely
- Implemented passport-local + bcrypt authentication
- Simplified from 5 roles to 3 roles (student, instructor, admin)
- Added admin approval/reject workflow with comments
- Updated all frontend pages for role-based access
- Added demo credential buttons on login page
- Seeded 3 user accounts and sample calendar events
