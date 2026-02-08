# Software Requirements Specification (SRS)
## LUMS Registrar Office Management System

**Document Version:** 2.0  
**Date:** February 8, 2026  
**Project:** CS 564 - Vibe Coding Assignment  
**Standard:** IEEE 830-1998  

**Technology Stack:**
- **Backend:** Flask 3.0+ (Python)
- **Frontend:** React 18+
- **Database:** PostgreSQL

---

## PROMPT LOG - PHASE 1: REQUIREMENTS GENERATION

### Prompt 1 (Initial Request)
```
Can you help me complete this assignment [assignment details provided]
```
**Purpose:** Initiate project understanding

### Prompt 2 (Technology Clarification)
```
For backend I want to use python based library. Preferably flask and for frontend 
I want to use react along with MUI for styling.
```
**Purpose:** Specify Flask + React + MUI stack

### Prompt 3 (Technology Confirmation)
```
Apologies. I made a mistake instead of using django + react. I will be using 
flask + react. Please update the document accordingly and carefully so no 
reference of django remains.
```
**Purpose:** Confirm Flask (not Django) as final backend choice

### Prompt 4 (Payment Gateway Clarification)
```
Your srs mentions payment gateway but does my sample site has any kind of 
payment gateway?
```
**Purpose:** Verify actual features from reference site

### Prompt 5 (Role Structure Simplification)
```
Please update the srs to allow three roles: student, instructor, admin

Academic calendar, dashboard will only be accessible/created by admin

Student can access: dashboard, major declaration, document requests

Instructor can access: dashboard, Grade petitions

Also, student major declaration and document requests will be forwarded to 
admin and after the approval the requests will be marked completed.

Instructor grade petition request will go to admin whose decision will mark 
the request complete.
```
**Purpose:** Simplify role structure and approval workflows

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [System Design](#4-system-design)
5. [Appendices](#appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the **LUMS Registrar Office Management System**. This system is being developed as part of the CS 564 course project using the **vibe coding methodology** - where all requirements, design, code, and testing are generated exclusively through LLM prompts without manual code editing.

**Intended Audience:**
- Development team (LLM-based code generation)
- Course instructors and evaluators
- Quality assurance team (LLM-based testing)
- Project stakeholders

### 1.2 Scope

The LUMS Registrar Office Management System (LUMS-RO) is a web-based platform designed to automate academic administrative processes at Lahore University of Management Sciences.

**System Name:** LUMS Registrar Office Management System (LUMS-RO)

**Key Features:**
- Three-role system (Student, Instructor, Admin)
- Online document request services (transcripts, degrees, letters)
- Payment voucher generation for bank deposits
- Grade change petition workflow
- Major declaration applications
- Academic calendar management (admin-controlled)
- Simple approval workflows (all requests go to admin)
- Mobile-responsive interface (iOS and Android browsers)

**Benefits:**
- Streamlined request submission process
- Transparent tracking of application status
- Centralized admin approval system
- Reduced paper-based processes

**Out of Scope:**
- Course registration system
- Student information system (SIS) - will integrate with existing
- Financial aid management
- Admission processing
- Online payment gateway integration (only payment voucher generation)
- Multi-level approval hierarchies

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| LUMS | Lahore University of Management Sciences |
| RO | Registrar Office |
| SRS | Software Requirements Specification |
| LLM | Large Language Model |
| GCP | Grade Change Petition |
| UAT | User Acceptance Testing |
| API | Application Programming Interface |
| REST | Representational State Transfer |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| SDLC | Software Development Life Cycle |
| ORM | Object-Relational Mapping (SQLAlchemy) |
| WSGI | Web Server Gateway Interface |

### 1.4 References

1. IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
2. LUMS Registrar Office Website: https://ro.lums.edu.pk
3. Flask Documentation: https://flask.palletsprojects.com/
4. React Documentation: https://react.dev/
5. SQLAlchemy Documentation: https://www.sqlalchemy.org/
6. CS 564 Project Guidelines: Vibe Coding Assignment PDF

### 1.5 Overview

This document is organized as follows:
- **Section 2** provides an overall description of the system including product perspective, functions, user characteristics, constraints, and assumptions
- **Section 3** details specific functional and non-functional requirements
- **Section 4** presents the system design including architecture, database schema, API specifications, and UI design
- **Appendices** contain supplementary information including prompt logs and development methodology

---

## 2. Overall Description

### 2.1 Product Perspective

The LUMS-RO system is a new, self-contained web application that will integrate with existing LUMS infrastructure:

**System Interfaces:**
- **Student Information System (SIS):** RESTful API integration for student data retrieval
- **Email Service:** SMTP integration for notifications

**User Interfaces:**
- Web-based responsive interface accessible via desktop and mobile browsers
- Simple, clean design focused on usability
- Accessibility compliant (WCAG 2.1 Level AA)

**Hardware Interfaces:**
- Standard web servers for hosting
- PostgreSQL database server
- File storage system for documents

**Software Interfaces:**
- Flask 3.0+ web framework
- React 18+ for frontend
- PostgreSQL 15+ database
- Nginx web server
- Gunicorn WSGI server

**Communications Interfaces:**
- HTTPS (TLS 1.3) for all client-server communication
- RESTful API over HTTP/HTTPS

**Memory Constraints:**
- Application server: Minimum 4GB RAM
- Database server: Minimum 8GB RAM
- Client browser: Minimum 2GB RAM

**Operations:**
- 24/7 system availability (99% uptime target)
- Daily database backups
- Log rotation and archival

### 2.2 Product Functions

The major functions of LUMS-RO organized by user role:

**Admin Functions:**
- Manage academic calendar (create, edit, delete events)
- View system-wide dashboard with all requests
- Approve/reject document requests from students
- Approve/reject major declaration applications from students
- Approve/reject grade change petitions from instructors
- Manage user accounts
- Generate system reports
- Configure system settings

**Student Functions:**
- View personalized dashboard
- Submit document requests (transcripts, degrees, letters)
- Download payment vouchers
- Submit major declaration applications
- Track request status
- Receive email notifications

**Instructor Functions:**
- View personalized dashboard
- Submit grade change petitions
- Track petition status
- Receive email notifications

### 2.3 User Characteristics

| User Type | Characteristics | Technical Expertise | Frequency of Use |
|-----------|----------------|---------------------|------------------|
| **Students** | Currently enrolled, ages 18-25, tech-savvy | High - familiar with web applications | Weekly |
| **Instructors** | Faculty submitting grade petitions | Medium - training required | Monthly during grading periods |
| **Administrators** | RO staff processing all requests | Medium - requires training | Daily |

### 2.4 Constraints

**2.4.1 Development Constraints**
- **LLM-Only Development:** All code must be generated via LLM prompts with no manual editing (vibe coding requirement)
- Must use Flask backend and React frontend
- Development timeline: As per course schedule
- Documentation must include all prompts in sequence

**2.4.2 Technical Constraints**
- Must support modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Must be responsive for mobile devices (320px to 2560px width)
- Backend must use Flask 3.0+
- Frontend must use React 18+
- Database must be PostgreSQL 15+

**2.4.3 Security Constraints**
- All data transmission must use HTTPS (TLS 1.3)
- User authentication required for all services
- Password hashing required (bcrypt with 12 rounds)
- Protection against common vulnerabilities (SQL injection, XSS, CSRF)

**2.4.4 Business Constraints**
- Single admin approval for all requests (no multi-level hierarchy)
- Payment vouchers only (no online payment processing)
- Three roles only (Student, Instructor, Admin)

### 2.5 Assumptions and Dependencies

**Assumptions:**
1. Users have access to internet-connected devices with modern browsers
2. Student data is available from existing SIS via API
3. SMTP email service is available for notifications
4. University provides hosting infrastructure
5. Bank payment processing handled offline

**Dependencies:**
1. **Flask Framework:** Application depends on Flask 3.0+ and its ecosystem
2. **React:** Frontend depends on React 18+ and associated libraries
3. **PostgreSQL:** Database functionality depends on PostgreSQL 15+
4. **SQLAlchemy:** ORM depends on SQLAlchemy 2.0+ for database operations
5. **Student Information System:** Integration requires SIS API availability
6. **Email Service:** Notifications depend on SMTP service (e.g., SendGrid, AWS SES)
7. **LLM Access:** Development process depends on LLM availability

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Authentication and Authorization (FR-1)

**FR-1.1: User Login**
- The system shall provide a login interface accepting email and password
- Priority: High | Status: Mandatory

**FR-1.2: User Roles**
- The system shall support exactly three user roles: Student, Instructor, and Admin
- Each user shall have exactly one role
- Priority: High | Status: Mandatory

**FR-1.3: Role-Based Access Control**
- The system shall restrict access to features based on user role:
  - **Student:** Dashboard, Document Requests, Major Declaration
  - **Instructor:** Dashboard, Grade Change Petitions
  - **Admin:** Dashboard, Academic Calendar, All Approvals, User Management, Reports
- Priority: High | Status: Mandatory

**FR-1.4: Session Management**
- The system shall maintain secure user sessions using JWT tokens
- Sessions shall expire after 30 minutes of inactivity
- Priority: High | Status: Mandatory

**FR-1.5: Password Security**
- Passwords shall be hashed using bcrypt with 12 rounds
- Minimum password requirements: 8 characters, mix of letters and numbers
- Priority: High | Status: Mandatory

#### 3.1.2 Dashboard (FR-2)

**FR-2.1: Student Dashboard**
- Students shall see:
  - Pending document requests count
  - Pending major applications count
  - Recent request history
  - Quick action buttons for new requests
- Priority: High | Status: Mandatory

**FR-2.2: Instructor Dashboard**
- Instructors shall see:
  - Pending grade petitions count
  - Recent petition history
  - Quick action button for new petition
- Priority: High | Status: Mandatory

**FR-2.3: Admin Dashboard**
- Admins shall see:
  - All pending requests (documents, major declarations, grade petitions)
  - System-wide statistics
  - Recent activity log
  - Academic calendar overview
- Priority: High | Status: Mandatory

**FR-2.4: Dashboard Access Control**
- Only Admin can create/edit dashboard content
- Students and Instructors have read-only personalized dashboards
- Priority: High | Status: Mandatory

#### 3.1.3 Document Request Services (FR-3) - STUDENT ONLY

**FR-3.1: Request Types**
- Students shall request the following document types:
  - Official Transcript
  - Electronic Transcript
  - Degree Certificate
  - Enrollment Letter
  - Completion Letter
  - Document Attestation
- Priority: High | Status: Mandatory

**FR-3.2: Request Submission**
- Students shall fill a form with:
  - Document type selection
  - Quantity (1-10)
  - Delivery method (Collection / Mailing)
  - Mailing address (if applicable)
  - Special instructions (optional)
- Priority: High | Status: Mandatory

**FR-3.3: Fee Calculation**
- System shall automatically calculate fees based on:
  - Document type (Transcript: PKR 500, Degree: PKR 1,000, etc.)
  - Delivery method (Collection: Free, Local Mail: PKR 300, International: PKR 2,500)
  - Quantity
- Priority: High | Status: Mandatory

**FR-3.4: Payment Voucher Generation**
- Upon request submission, system shall generate PDF payment voucher with:
  - Unique voucher number
  - Application ID
  - Amount breakdown
  - Bank deposit instructions
  - Student details
- Priority: High | Status: Mandatory

**FR-3.5: Request Status**
- Request status flow:
  - **Submitted:** Request created, waiting for payment
  - **Payment Pending:** Voucher downloaded by student
  - **Pending Approval:** Payment confirmed, waiting for admin approval
  - **Approved:** Admin approved, document being prepared
  - **Completed:** Document ready for collection/mailed
  - **Rejected:** Admin rejected the request
- Priority: High | Status: Mandatory

**FR-3.6: Admin Approval**
- Admin shall review document requests
- Admin shall approve or reject with comments
- Upon approval, status changes to "Completed"
- Student receives email notification
- Priority: High | Status: Mandatory

#### 3.1.4 Major Declaration (FR-4) - STUDENT ONLY

**FR-4.1: Application Submission**
- Students shall submit major declaration application with:
  - Ranked major preferences (up to 3 choices)
  - Supporting documents upload (PDF, max 5MB)
  - Justification text
- Priority: High | Status: Mandatory

**FR-4.2: Application Status**
- Application status flow:
  - **Submitted:** Application created
  - **Pending Approval:** Waiting for admin review
  - **Approved:** Admin approved
  - **Rejected:** Admin rejected with comments
- Priority: High | Status: Mandatory

**FR-4.3: Admin Approval**
- Admin shall review major declaration applications
- Admin shall approve or reject with comments
- Upon approval, status changes to "Approved"
- Student receives email notification
- Priority: High | Status: Mandatory

#### 3.1.5 Grade Change Petition (FR-5) - INSTRUCTOR ONLY

**FR-5.1: Petition Submission**
- Instructors shall submit grade change petitions with:
  - Student ID
  - Course code
  - Current grade
  - Proposed new grade
  - Justification (minimum 100 characters)
- Priority: High | Status: Mandatory

**FR-5.2: Petition Status**
- Petition status flow:
  - **Submitted:** Petition created
  - **Pending Approval:** Waiting for admin review
  - **Approved:** Admin approved, grade will be changed
  - **Rejected:** Admin rejected with comments
- Priority: High | Status: Mandatory

**FR-5.3: Admin Approval**
- Admin shall review grade change petitions
- Admin shall approve or reject with comments
- Upon approval, status changes to "Approved"
- Instructor and student receive email notifications
- Priority: High | Status: Mandatory

#### 3.1.6 Academic Calendar (FR-6) - ADMIN ONLY

**FR-6.1: Calendar Management**
- Only Admin can create, edit, and delete calendar events
- Events shall include:
  - Title
  - Date
  - Description
  - Category (Deadline, Holiday, Exam, Registration)
- Priority: High | Status: Mandatory

**FR-6.2: Calendar Display**
- All users (Student, Instructor, Admin) can view the calendar
- Calendar views: Month, Week, List
- Events color-coded by category
- Priority: High | Status: Mandatory

**FR-6.3: Calendar Export**
- Users shall export calendar to iCal format (.ics file)
- Priority: Medium | Status: Optional

#### 3.1.7 Notification System (FR-7)

**FR-7.1: Email Notifications**
- System shall send email notifications for:
  - Request status changes (submitted, approved, rejected, completed)
  - New request assignment to admin
  - Major application status changes
  - Grade petition status changes
- Priority: High | Status: Mandatory

**FR-7.2: In-App Notifications**
- Users shall see notification bell icon with unread count
- Clicking bell shall display recent notifications (last 30 days)
- Priority: Medium | Status: Mandatory

#### 3.1.8 User Management (FR-8) - ADMIN ONLY

**FR-8.1: User Account Management**
- Admin shall:
  - View all user accounts in a table
  - Search users by name, email, or ID
  - Create new user accounts
  - Activate/deactivate accounts
  - Reset user passwords
  - Assign user roles
- Priority: High | Status: Mandatory

**FR-8.2: Bulk Operations**
- Admin shall perform bulk user operations:
  - Import users from CSV
  - Export user list to CSV
- Priority: Low | Status: Optional

#### 3.1.9 Reports and Analytics (FR-9) - ADMIN ONLY

**FR-9.1: Request Reports**
- Admin shall generate reports:
  - Daily request summary (by type, status)
  - Weekly statistics
  - Monthly trends
- Export formats: PDF, Excel, CSV
- Priority: Medium | Status: Mandatory

**FR-9.2: User Activity Reports**
- Admin shall view:
  - Active users count
  - Request volume by user role
  - Peak usage times
- Priority: Low | Status: Optional

#### 3.1.10 Audit Logging (FR-10)

**FR-10.1: System Audit Log**
- System shall maintain audit logs for:
  - User login/logout
  - Request submissions
  - Admin approvals/rejections
  - Calendar modifications
  - User account changes
- Logs shall include: timestamp, user, action, IP address
- Priority: High | Status: Mandatory

**FR-10.2: Log Retention**
- Audit logs shall be retained for minimum 1 year
- Logs shall be searchable by date, user, action type
- Priority: Medium | Status: Mandatory

---

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance Requirements (NFR-1)

**NFR-1.1: Page Load Time**
- All pages shall load within 3 seconds on standard broadband (5 Mbps)
- React components shall use code-splitting and lazy loading
- Priority: High

**NFR-1.2: API Response Time**
- Flask API responses shall be delivered within 1 second for 95% of requests
- Database queries shall be optimized with proper indexing
- Priority: High

**NFR-1.3: Concurrent User Capacity**
- System shall support 100 concurrent users without performance degradation
- Flask shall be deployed with Gunicorn (4 worker processes)
- Priority: Medium

**NFR-1.4: File Upload Performance**
- Document uploads (up to 5MB) shall complete within 10 seconds on 5 Mbps connection
- Priority: Medium

#### 3.2.2 Security Requirements (NFR-2)

**NFR-2.1: Data Encryption in Transit**
- All communication shall use HTTPS with TLS 1.3
- Priority: High

**NFR-2.2: Password Security**
- Passwords shall be hashed using Flask-Bcrypt with 12 rounds
- No passwords stored in plain text
- Priority: High

**NFR-2.3: Session Security**
- JWT tokens with 30-minute expiry for access tokens
- Secure, httpOnly cookies
- CSRF protection on all state-changing operations
- Priority: High

**NFR-2.4: SQL Injection Prevention**
- All database queries shall use SQLAlchemy ORM
- No raw SQL with string concatenation
- Priority: High

**NFR-2.5: XSS Prevention**
- React shall escape all user inputs by default
- Content Security Policy (CSP) headers configured
- Priority: High

**NFR-2.6: File Upload Security**
- File types restricted to PDF only
- File size limit: 5MB per file
- Files scanned for malware before storage
- Files stored outside web root
- Priority: High

#### 3.2.3 Reliability Requirements (NFR-3)

**NFR-3.1: System Uptime**
- System shall maintain 99% uptime
- Planned maintenance during low-usage periods (2-4 AM)
- Priority: High

**NFR-3.2: Data Backup**
- Database shall be backed up daily
- Backups retained for 30 days
- Priority: High

**NFR-3.3: Error Handling**
- All errors shall be caught and logged
- User-friendly error messages displayed
- No sensitive information in error messages
- Priority: High

**NFR-3.4: Data Integrity**
- Database transactions shall use ACID properties
- SQLAlchemy sessions with proper commit/rollback handling
- Priority: High

#### 3.2.4 Usability Requirements (NFR-4)

**NFR-4.1: Mobile Responsiveness**
- System shall be fully functional on devices with screen widths from 320px to 2560px
- Touch-friendly UI elements (minimum 44x44px)
- Priority: High

**NFR-4.2: Browser Compatibility**
- System shall work on:
  - Chrome 90+ (Windows, macOS, Android)
  - Firefox 88+ (Windows, macOS)
  - Safari 14+ (macOS, iOS)
  - Edge 90+ (Windows)
- Priority: High

**NFR-4.3: Accessibility (WCAG 2.1 Level AA)**
- All interactive elements keyboard accessible
- Images shall have alt text
- Color contrast ratio minimum 4.5:1
- ARIA labels for screen readers
- Priority: High

**NFR-4.4: User Learning Curve**
- New users shall be able to submit a request within 5 minutes without training
- Clear labels and instructions on all forms
- Priority: Medium

**NFR-4.5: Consistent UI/UX**
- All pages shall follow consistent design patterns
- Reusable React component library
- Priority: Medium

#### 3.2.5 Maintainability Requirements (NFR-5)

**NFR-5.1: Code Documentation**
- All Flask routes and models shall have docstrings
- React components shall have JSDoc comments
- Priority: Medium

**NFR-5.2: Modular Architecture**
- Flask blueprints shall be modular and loosely coupled
- React components shall be reusable
- Priority: High

**NFR-5.3: Version Control**
- All code shall be version controlled using Git
- Meaningful commit messages required
- Priority: High

**NFR-5.4: Database Migrations**
- All schema changes shall use Alembic migrations
- Migrations shall be reversible
- Priority: High

#### 3.2.6 Portability Requirements (NFR-6)

**NFR-6.1: Platform Independence**
- Backend shall run on Linux, macOS, Windows
- Docker containerization for consistent deployment
- Priority: High

**NFR-6.2: Cloud Deployment**
- System shall be deployable on major cloud platforms (AWS, GCP, DigitalOcean)
- Priority: Medium

---

## 4. System Design

### 4.1 System Architecture

#### 4.1.1 Architectural Style

The LUMS-RO system follows a **three-tier architecture**:

**1. Presentation Layer (Client-Side)**
- React 18+ Single Page Application (SPA)
- Responsive UI
- State management: React Context API
- HTTP client: Axios for API communication

**2. Application Layer (Server-Side)**
- Flask 3.0+ web framework
- RESTful API using Flask blueprints
- JWT authentication using Flask-JWT-Extended
- Business logic organized in Flask blueprints

**3. Data Layer**
- PostgreSQL 15+ relational database
- SQLAlchemy ORM for database abstraction
- File storage: Local filesystem

#### 4.1.2 System Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          React 18 SPA (Browser)                         │   │
│  │  - Components (Login, Dashboard, Forms)                 │   │
│  │  - React Router (Navigation)                            │   │
│  │  - Context API (State Management)                       │   │
│  │  - Axios (HTTP Client)                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS (REST API)
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Flask 3.0 + Flask Blueprints                    │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  Flask Blueprints:                              │    │   │
│  │  │  - auth (Authentication)                        │    │   │
│  │  │  - student (Document Requests, Major)           │    │   │
│  │  │  - instructor (Grade Petitions)                 │    │   │
│  │  │  - admin (Approvals, Calendar, Users)           │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  Middleware:                                    │    │   │
│  │  │  - CORS (Flask-CORS)                            │    │   │
│  │  │  - CSRF Protection                              │    │   │
│  │  │  - JWT Authentication (Flask-JWT-Extended)      │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  Services:                                      │    │   │
│  │  │  - Fee Calculator                               │    │   │
│  │  │  - PDF Generator (ReportLab)                    │    │   │
│  │  │  - Email Service                                │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Database Queries (SQLAlchemy)
┌─────────────────────────────────────────────────────────────────┐
│                         DATA TIER                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           PostgreSQL 15+ Database                       │   │
│  │  - Users (Student, Instructor, Admin)                   │   │
│  │  - Document Requests                                    │   │
│  │  - Major Applications                                   │   │
│  │  - Grade Petitions                                      │   │
│  │  - Academic Calendar                                    │   │
│  │  - Notifications                                        │   │
│  │  - Audit Logs                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           File Storage (Local)                          │   │
│  │  - Uploaded documents (major applications)              │   │
│  │  - Generated PDFs (payment vouchers)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

External Services:
├─ Email Service (SendGrid / SMTP)
└─ Student Information System (SIS) - API Integration
```

#### 4.1.3 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18.2+ | UI framework |
| | React Router | 6.x | Client-side routing |
| | Axios | 1.x | HTTP client |
| | Formik | 2.x | Form handling |
| | Yup | 1.x | Validation |
| **Backend** | Flask | 3.0+ | Web framework |
| | Flask-JWT-Extended | 4.5+ | JWT authentication |
| | Flask-SQLAlchemy | 3.1+ | SQLAlchemy integration |
| | Flask-Migrate | 4.0+ | Database migrations |
| | Flask-Bcrypt | 1.0+ | Password hashing |
| | Flask-CORS | 4.0+ | Cross-origin support |
| | Marshmallow | 3.20+ | Serialization/validation |
| | ReportLab | 4.0+ | PDF generation |
| **Database** | PostgreSQL | 15+ | Primary database |
| | SQLAlchemy | 2.0+ | ORM |
| | Alembic | 1.12+ | Database migrations |
| **Web Server** | Nginx | 1.24+ | Reverse proxy |
| | Gunicorn | 21.0+ | WSGI server |
| **Deployment** | Docker | 24.0+ | Containerization |

### 4.2 Database Design

#### 4.2.1 Entity Relationship Diagram (ERD)

```
┌──────────────────┐
│      User        │
├──────────────────┤
│ PK id            │
│ UK email         │
│    password_hash │
│    first_name    │
│    last_name     │
│    role          │  (student/instructor/admin)
│    is_active     │
│    created_at    │
│    updated_at    │
└──────────────────┘
         │
         │ 1:N (if role = student)
         │
┌──────────────────┐
│ DocumentRequest  │
├──────────────────┤
│ PK id            │
│ FK user_id       │
│ UK application_id│
│    type          │
│    status        │
│    quantity      │
│    amount        │
│    notes         │
│    voucher_path  │
│    created_at    │
│    admin_comment │
└──────────────────┘

┌──────────────────┐
│ MajorApplication │
├──────────────────┤
│ PK id            │
│ FK user_id       │
│    preferences   │  (JSON: ranked list)
│    status        │
│    document_path │
│    justification │
│    submitted_at  │
│    admin_comment │
└──────────────────┘

┌──────────────────┐
│  GradePetition   │
├──────────────────┤
│ PK id            │
│ FK instructor_id │  (FK to User where role=instructor)
│    student_id    │
│    course_code   │
│    old_grade     │
│    new_grade     │
│    justification │
│    status        │
│    submitted_at  │
│    admin_comment │
└──────────────────┘

┌──────────────────┐
│ AcademicCalendar │
├──────────────────┤
│ PK id            │
│    title         │
│    description   │
│    event_date    │
│    category      │
│    created_by    │  (FK to User where role=admin)
└──────────────────┘

┌──────────────────┐
│  Notification    │
├──────────────────┤
│ PK id            │
│ FK user_id       │
│    title         │
│    message       │
│    type          │
│    is_read       │
│    created_at    │
└──────────────────┘

┌──────────────────┐
│   AuditLog       │
├──────────────────┤
│ PK id            │
│ FK user_id       │
│    action        │
│    resource_type │
│    resource_id   │
│    ip_address    │
│    created_at    │
└──────────────────┘
```

#### 4.2.2 Database Schema (SQLAlchemy Models)

**1. User Model**
```python
# app/models/user.py
from app import db, bcrypt
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    role = db.Column(db.Enum('student', 'instructor', 'admin', name='user_role'), 
                     nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    document_requests = db.relationship('DocumentRequest', back_populates='user', 
                                       lazy='dynamic')
    major_applications = db.relationship('MajorApplication', back_populates='user', 
                                        lazy='dynamic')
    grade_petitions = db.relationship('GradePetition', back_populates='instructor', 
                                      lazy='dynamic')
    notifications = db.relationship('Notification', back_populates='user', 
                                   lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
```

**2. Document Request Model**
```python
# app/models/document_request.py
from app import db
from datetime import datetime

class DocumentRequest(db.Model):
    __tablename__ = 'document_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    application_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    type = db.Column(db.Enum('transcript', 'etranscript', 'degree', 
                             'letter_enrollment', 'letter_completion', 
                             'attestation', name='request_type'), nullable=False)
    status = db.Column(db.Enum('submitted', 'payment_pending', 'pending_approval', 
                               'approved', 'completed', 'rejected', 
                               name='request_status'), default='submitted')
    quantity = db.Column(db.Integer, default=1)
    amount = db.Column(db.Numeric(10, 2))
    delivery_method = db.Column(db.Enum('collection', 'local_mail', 
                                       'international_mail', name='delivery_method'))
    mailing_address = db.Column(db.Text)
    notes = db.Column(db.Text)
    voucher_path = db.Column(db.String(255))  # Path to generated PDF voucher
    admin_comment = db.Column(db.Text)  # Admin approval/rejection comment
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = db.relationship('User', back_populates='document_requests')
    
    def __repr__(self):
        return f'<DocumentRequest {self.application_id}>'
```

**3. Major Application Model**
```python
# app/models/major_application.py
from app import db
from datetime import datetime

class MajorApplication(db.Model):
    __tablename__ = 'major_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    preferences = db.Column(db.JSON)  # Ranked list: ["CS", "EE", "Math"]
    status = db.Column(db.Enum('submitted', 'pending_approval', 'approved', 
                               'rejected', name='application_status'), 
                      default='submitted')
    document_path = db.Column(db.String(255))  # Uploaded supporting documents
    justification = db.Column(db.Text)
    admin_comment = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='major_applications')
    
    def __repr__(self):
        return f'<MajorApplication {self.id} - User {self.user_id}>'
```

**4. Grade Petition Model**
```python
# app/models/grade_petition.py
from app import db
from datetime import datetime

class GradePetition(db.Model):
    __tablename__ = 'grade_petitions'
    
    id = db.Column(db.Integer, primary_key=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    student_id = db.Column(db.String(20), nullable=False)  # Student ID string
    course_code = db.Column(db.String(20), nullable=False)
    old_grade = db.Column(db.String(5), nullable=False)
    new_grade = db.Column(db.String(5), nullable=False)
    justification = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum('submitted', 'pending_approval', 'approved', 
                               'rejected', name='petition_status'), 
                      default='submitted')
    admin_comment = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    instructor = db.relationship('User', back_populates='grade_petitions')
    
    def __repr__(self):
        return f'<GradePetition {self.id} - {self.course_code}>'
```

**5. Academic Calendar Model**
```python
# app/models/academic_calendar.py
from app import db

class AcademicCalendar(db.Model):
    __tablename__ = 'academic_calendar'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.Date, nullable=False, index=True)
    category = db.Column(db.Enum('deadline', 'holiday', 'exam', 'registration', 
                                 name='event_category'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def __repr__(self):
        return f'<AcademicCalendar {self.title} on {self.event_date}>'
```

### 4.3 API Design

#### 4.3.1 RESTful API Endpoints

Base URL: `http://localhost:5000/api/`

**Authentication Endpoints**

| Method | Endpoint | Auth | Access | Description |
|--------|----------|------|--------|-------------|
| POST | `/api/auth/login` | No | All | User login, returns JWT |
| POST | `/api/auth/logout` | Yes | All | Logout user |
| GET | `/api/auth/me` | Yes | All | Get current user details |

**Student Endpoints**

| Method | Endpoint | Auth | Access | Description |
|--------|----------|------|--------|-------------|
| GET | `/api/student/dashboard` | Yes | Student | Get student dashboard |
| POST | `/api/student/requests` | Yes | Student | Create document request |
| GET | `/api/student/requests` | Yes | Student | List my requests |
| GET | `/api/student/requests/<id>` | Yes | Student | Get request details |
| GET | `/api/student/requests/<id>/voucher` | Yes | Student | Download payment voucher |
| POST | `/api/student/major` | Yes | Student | Submit major application |
| GET | `/api/student/major` | Yes | Student | Get my major application |

**Instructor Endpoints**

| Method | Endpoint | Auth | Access | Description |
|--------|----------|------|--------|-------------|
| GET | `/api/instructor/dashboard` | Yes | Instructor | Get instructor dashboard |
| POST | `/api/instructor/petitions` | Yes | Instructor | Create grade petition |
| GET | `/api/instructor/petitions` | Yes | Instructor | List my petitions |
| GET | `/api/instructor/petitions/<id>` | Yes | Instructor | Get petition details |

**Admin Endpoints**

| Method | Endpoint | Auth | Access | Description |
|--------|----------|------|--------|-------------|
| GET | `/api/admin/dashboard` | Yes | Admin | Get admin dashboard |
| GET | `/api/admin/requests` | Yes | Admin | List all document requests |
| PATCH | `/api/admin/requests/<id>/approve` | Yes | Admin | Approve document request |
| PATCH | `/api/admin/requests/<id>/reject` | Yes | Admin | Reject document request |
| GET | `/api/admin/major-applications` | Yes | Admin | List all major applications |
| PATCH | `/api/admin/major/<id>/approve` | Yes | Admin | Approve major application |
| PATCH | `/api/admin/major/<id>/reject` | Yes | Admin | Reject major application |
| GET | `/api/admin/petitions` | Yes | Admin | List all grade petitions |
| PATCH | `/api/admin/petitions/<id>/approve` | Yes | Admin | Approve grade petition |
| PATCH | `/api/admin/petitions/<id>/reject` | Yes | Admin | Reject grade petition |
| GET | `/api/admin/calendar` | Yes | Admin | List calendar events |
| POST | `/api/admin/calendar` | Yes | Admin | Create calendar event |
| PUT | `/api/admin/calendar/<id>` | Yes | Admin | Update calendar event |
| DELETE | `/api/admin/calendar/<id>` | Yes | Admin | Delete calendar event |
| GET | `/api/admin/users` | Yes | Admin | List all users |
| POST | `/api/admin/users` | Yes | Admin | Create user |
| PATCH | `/api/admin/users/<id>` | Yes | Admin | Update user |

**Public Endpoints**

| Method | Endpoint | Auth | Access | Description |
|--------|----------|------|--------|-------------|
| GET | `/api/calendar/events` | No | All | View calendar (read-only) |

#### 4.3.2 Request/Response Examples

**Example 1: Student Submits Document Request**

Request:
```http
POST /api/student/requests
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
Content-Type: application/json

{
  "type": "transcript",
  "quantity": 2,
  "delivery_method": "local_mail",
  "mailing_address": "123 Main St, Lahore, Pakistan",
  "notes": "Needed for job application"
}
```

Response:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "application_id": "REQ20260208001",
  "type": "transcript",
  "quantity": 2,
  "amount": "1300.00",
  "status": "submitted",
  "voucher_url": "/api/student/requests/1/voucher",
  "created_at": "2026-02-08T10:30:00Z",
  "message": "Request created. Please download payment voucher and submit to bank."
}
```

**Example 2: Admin Approves Document Request**

Request:
```http
PATCH /api/admin/requests/1/approve
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
Content-Type: application/json

{
  "comment": "Payment verified. Document will be ready in 2 days."
}
```

Response:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "application_id": "REQ20260208001",
  "status": "approved",
  "admin_comment": "Payment verified. Document will be ready in 2 days.",
  "updated_at": "2026-02-08T14:00:00Z",
  "message": "Request approved successfully. Student will be notified via email."
}
```

**Example 3: Instructor Submits Grade Petition**

Request:
```http
POST /api/instructor/petitions
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
Content-Type: application/json

{
  "student_id": "24030011",
  "course_code": "CS200",
  "old_grade": "B",
  "new_grade": "A-",
  "justification": "Student's final exam was re-evaluated and grading error was found in Question 3. After correction, the total marks increased from 82 to 88, which changes the grade from B to A-."
}
```

Response:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 5,
  "student_id": "24030011",
  "course_code": "CS200",
  "old_grade": "B",
  "new_grade": "A-",
  "status": "submitted",
  "submitted_at": "2026-02-08T15:30:00Z",
  "message": "Grade petition submitted. Admin will review and notify you."
}
```

#### 4.3.3 Flask Application Structure

```
backend/
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── config.py             # Configuration
│   ├── models/               # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── document_request.py
│   │   ├── major_application.py
│   │   ├── grade_petition.py
│   │   ├── academic_calendar.py
│   │   ├── notification.py
│   │   └── audit_log.py
│   ├── routes/               # Flask blueprints
│   │   ├── __init__.py
│   │   ├── auth.py           # /api/auth/*
│   │   ├── student.py        # /api/student/*
│   │   ├── instructor.py     # /api/instructor/*
│   │   ├── admin.py          # /api/admin/*
│   │   └── public.py         # /api/calendar/events (public)
│   ├── services/             # Business logic
│   │   ├── __init__.py
│   │   ├── fee_calculator.py
│   │   ├── pdf_generator.py
│   │   ├── email_service.py
│   │   └── notification_service.py
│   └── utils/                # Helper functions
│       ├── __init__.py
│       ├── decorators.py     # @role_required decorator
│       └── helpers.py
├── migrations/               # Alembic migrations
├── tests/                    # Pytest tests
├── uploads/                  # Uploaded files (outside web root)
├── vouchers/                 # Generated PDF vouchers
├── .env
├── .env.example
├── requirements.txt
└── run.py                    # Application entry point
```

#### 4.3.4 Role-Based Access Control Decorator

```python
# app/utils/decorators.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.user import User

def role_required(*roles):
    """
    Decorator to require specific roles for Flask routes.
    Usage: @role_required('admin') or @role_required('student', 'admin')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            if not user.is_active:
                return jsonify({"error": "Account is inactive"}), 403
            
            if user.role not in roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            
            # Pass user object to route function
            return f(current_user=user, *args, **kwargs)
        return decorated_function
    return decorator
```

**Usage in Routes:**
```python
# app/routes/student.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.decorators import role_required

bp = Blueprint('student', __name__, url_prefix='/api/student')

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('student')
def get_dashboard(current_user):
    # current_user is passed by decorator
    pending_requests = current_user.document_requests.filter_by(
        status='pending_approval'
    ).count()
    
    return jsonify({
        "name": f"{current_user.first_name} {current_user.last_name}",
        "pending_requests": pending_requests,
        "recent_requests": []  # ... fetch recent requests
    })
```

### 4.4 User Interface Design

#### 4.4.1 Page Access Matrix

| Page | Student | Instructor | Admin |
|------|---------|------------|-------|
| Login | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ |
| Document Requests | ✓ | ✗ | ✗ |
| Major Declaration | ✓ | ✗ | ✗ |
| Grade Petitions | ✗ | ✓ | ✗ |
| Academic Calendar (View) | ✓ | ✓ | ✓ |
| Academic Calendar (Edit) | ✗ | ✗ | ✓ |
| Admin Panel | ✗ | ✗ | ✓ |
| All Requests (Review) | ✗ | ✗ | ✓ |
| User Management | ✗ | ✗ | ✓ |

#### 4.4.2 Wireframe Descriptions

**Student Dashboard:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [☰] LUMS RO                    [🔔 3] [John Doe (Student) ▾]     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Welcome, John Doe                                                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Pending    │  │   Pending    │  │    Total     │           │
│  │   Requests   │  │    Major     │  │    Spent     │           │
│  │      2       │  │Application: 1│  │  PKR 2,500   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  Quick Actions:                                                   │
│  [+ New Document Request]  [+ Submit Major Declaration]          │
│                                                                   │
│  Recent Requests:                                                 │
│  ┌─────┬──────────┬─────────────┬──────┬─────────┐              │
│  │ ID  │   Type   │   Status    │ Date │ Amount  │              │
│  ├─────┼──────────┼─────────────┼──────┼─────────┤              │
│  │ 001 │Transcript│Pending Appr.│02/07 │ PKR 800 │              │
│  │ 002 │  Degree  │  Approved   │02/05 │PKR 1700 │              │
│  └─────┴──────────┴─────────────┴──────┴─────────┘              │
│                                                                   │
│  Sidebar: Dashboard | My Requests | Major Declaration | Calendar │
│                      Profile | Logout                            │
└──────────────────────────────────────────────────────────────────┘
```

**Instructor Dashboard:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [☰] LUMS RO                 [🔔 2] [Dr. Sarah Khan (Inst.) ▾]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Welcome, Dr. Sarah Khan                                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                              │
│  │   Pending    │  │   Approved   │                              │
│  │  Petitions   │  │  Petitions   │                              │
│  │      3       │  │      15      │                              │
│  └──────────────┘  └──────────────┘                              │
│                                                                   │
│  Quick Actions:                                                   │
│  [+ New Grade Petition]                                           │
│                                                                   │
│  Recent Grade Petitions:                                          │
│  ┌─────┬──────────┬────────┬─────────────┬──────┐               │
│  │ ID  │  Course  │Student │   Status    │ Date │               │
│  ├─────┼──────────┼────────┼─────────────┼──────┤               │
│  │ 005 │  CS200   │ 24030  │Pending Appr.│02/08 │               │
│  │ 004 │  CS150   │ 23056  │  Approved   │02/01 │               │
│  │ 003 │  CS200   │ 24012  │  Rejected   │01/28 │               │
│  └─────┴──────────┴────────┴─────────────┴──────┘               │
│                                                                   │
│  Sidebar: Dashboard | My Petitions | Calendar | Profile | Logout │
└──────────────────────────────────────────────────────────────────┘
```

**Admin Dashboard:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [☰] LUMS RO - Admin              [🔔 12] [Admin User ▾]          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Admin Dashboard - All Pending Approvals                          │
│                                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │  Pending    │ │  Pending    │ │  Pending    │                │
│  │  Document   │ │    Major    │ │    Grade    │                │
│  │  Requests:5 │ │  Apps: 3    │ │Petitions: 4 │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                   │
│  Tabs: [Document Requests] [Major Apps] [Grade Petitions]        │
│                                                                   │
│  Document Requests Pending Approval:                              │
│  ┌─────┬────────┬──────────┬─────────┬──────┬─────────────┐     │
│  │ ID  │ User   │   Type   │ Quantity│Amount│   Actions   │     │
│  ├─────┼────────┼──────────┼─────────┼──────┼─────────────┤     │
│  │ 001 │John Doe│Transcript│    2    │ 1300 │[Approve][Reject]│ │
│  │ 003 │Jane S. │  Degree  │    1    │ 1000 │[Approve][Reject]│ │
│  └─────┴────────┴──────────┴─────────┴──────┴─────────────┘     │
│                                                                   │
│  Sidebar: Dashboard | Requests | Major Apps | Grade Petitions |  │
│           Calendar | Users | Reports | Settings | Logout         │
└──────────────────────────────────────────────────────────────────┘
```

#### 4.4.3 Workflow Diagrams

**Document Request Workflow:**
```
Student                    System                    Admin
   |                          |                         |
   |-- Submit Request ------->|                         |
   |                          |                         |
   |<----- Generate Voucher --|                         |
   |                          |                         |
   |-- Download Voucher ----->|                         |
   |                          |                         |
   |   (Student pays at bank) |                         |
   |                          |                         |
   |-- Upload Receipt ------->|                         |
   |                          |                         |
   |                          |-- Notify Admin -------->|
   |                          |                         |
   |                          |<-- Review Request ------|
   |                          |                         |
   |                          |<-- Approve/Reject ------|
   |                          |                         |
   |<----- Email Notification-|                         |
   |                          |                         |
   | (If approved: document prepared & ready)           |
```

**Grade Petition Workflow:**
```
Instructor                 System                    Admin
   |                          |                         |
   |-- Submit Petition ------>|                         |
   |                          |                         |
   |                          |-- Notify Admin -------->|
   |                          |                         |
   |                          |<-- Review Petition -----|
   |                          |                         |
   |                          |<-- Approve/Reject ------|
   |                          |                         |
   |<----- Email Notification-|                         |
   |                          |-- Email to Student ---->|
   |                          |                         |
   | (If approved: grade updated in SIS)                |
```

### 4.5 Security Design

#### 4.5.1 Authentication Flow

1. User submits email + password to `/api/auth/login`
2. Flask validates credentials using bcrypt password verification
3. On success, Flask-JWT-Extended generates access token (30 min expiry)
4. Token returned to client, stored in memory (not localStorage)
5. Client includes token in Authorization header for subsequent requests
6. Flask validates token on protected routes using `@jwt_required()` decorator
7. Flask checks user role using `@role_required()` decorator

#### 4.5.2 Authorization Matrix

| Resource | Student | Instructor | Admin |
|----------|---------|------------|-------|
| Create Document Request | ✓ | ✗ | ✗ |
| View Own Requests | ✓ | ✗ | ✗ |
| View All Requests | ✗ | ✗ | ✓ |
| Approve Requests | ✗ | ✗ | ✓ |
| Create Grade Petition | ✗ | ✓ | ✗ |
| View Own Petitions | ✗ | ✓ | ✗ |
| View All Petitions | ✗ | ✗ | ✓ |
| Approve Petitions | ✗ | ✗ | ✓ |
| Create Major Application | ✓ | ✗ | ✗ |
| View All Major Apps | ✗ | ✗ | ✓ |
| Approve Major Apps | ✗ | ✗ | ✓ |
| Manage Calendar | ✗ | ✗ | ✓ |
| View Calendar | ✓ | ✓ | ✓ |
| Manage Users | ✗ | ✗ | ✓ |

#### 4.5.3 Data Protection Measures

1. **Password Hashing:** Flask-Bcrypt with 12 rounds
2. **HTTPS Only:** All traffic encrypted with TLS 1.3
3. **CSRF Protection:** Enabled on all state-changing operations
4. **SQL Injection Prevention:** SQLAlchemy ORM only
5. **XSS Prevention:** React auto-escaping + CSP headers
6. **File Upload Security:** 
   - PDF only
   - 5MB limit
   - Virus scanning
   - Stored outside web root
7. **Audit Logging:** All admin actions logged

---

## 5. Deployment

### 5.1 Docker Configuration

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: lums_ro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    command: gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
    volumes:
      - ./backend:/app
      - uploads:/app/uploads
      - vouchers:/app/vouchers
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/lums_ro
      - FLASK_ENV=production

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  uploads:
  vouchers:
```

---

## Appendices

### Appendix A: Complete Prompt Log

1. "Can you help me complete this assignment [PDF uploaded]"
2. "For backend I want to use python based library. Preferably flask and for frontend I want to use react along with MUI for styling."
3. "Apologies. I made a mistake instead of using django + react. I will be using flask + react. Please update the document accordingly and carefully so no reference of django remains."
4. "Your srs mentions payment gateway but does my sample site has any kind of payment gateway?"
5. **"Please update the srs to allow three roles: student, instructor, admin. Academic calendar, dashboard will only be accessible/created by admin. Student can access: dashboard, major declaration, document requests. Instructor can access: dashboard, Grade petitions. Also, student major declaration and document requests will be forwarded to admin and after the approval the requests will be marked completed. Instructor grade petition request will go to admin whose decision will mark the request complete."**

### Appendix B: Key Simplifications from Original SRS

| Aspect | Original | Simplified (v2.0) |
|--------|----------|-------------------|
| **Roles** | 6 roles (Student, Alumni, Separated, Faculty, Staff, Admin) | 3 roles (Student, Instructor, Admin) |
| **GCP Workflow** | 3-level approval (Dept → Dean → RO) | Single admin approval |
| **Document Requests** | Multi-level processing | Direct to admin approval |
| **Payment** | Online gateway integration | Payment voucher only |
| **Calendar** | All users can view | Admin creates, all can view |
| **Dashboards** | Role-specific | Simplified per role |

### Appendix C: LLM Prompts for Code Generation

**Flask Backend Prompt:**
```
Generate a complete Flask 3.0+ backend for LUMS Registrar Office System.

SIMPLIFIED REQUIREMENTS:
- 3 roles only: student, instructor, admin
- Student: submit document requests & major applications (go to admin for approval)
- Instructor: submit grade petitions (go to admin for approval)
- Admin: approve/reject all requests, manage calendar, manage users
- Payment voucher generation only (no online payment gateway)
- Single-level approval: everything goes to admin

TECH STACK:
- Flask 3.0+, Flask-JWT-Extended, Flask-SQLAlchemy, Flask-Bcrypt
- PostgreSQL, SQLAlchemy ORM, Alembic migrations
- ReportLab for PDF generation

MODELS NEEDED:
1. User (id, email, password_hash, role, first_name, last_name)
2. DocumentRequest (with admin_comment field)
3. MajorApplication (with admin_comment field)
4. GradePetition (with admin_comment field)
5. AcademicCalendar
6. Notification
7. AuditLog

API ENDPOINTS:
- /api/auth/* (login, logout, me)
- /api/student/* (dashboard, requests, major)
- /api/instructor/* (dashboard, petitions)
- /api/admin/* (dashboard, approve/reject all, calendar, users)
- /api/calendar/events (public view)

Include @role_required decorator and complete implementation.
```

**React Frontend Prompt:**
```
Generate a complete React 18 frontend for LUMS Registrar Office System.

3 USER TYPES:
1. Student - can access: Dashboard, Document Requests, Major Declaration, Calendar (view)
2. Instructor - can access: Dashboard, Grade Petitions, Calendar (view)
3. Admin - can access: All Approvals Dashboard, Calendar (edit), User Management

PAGES NEEDED:
1. Login
2. Student Dashboard (with stats cards and recent requests table)
3. Document Request Form (type, quantity, delivery, notes)
4. Major Declaration Form (preferences, justification, file upload)
5. Instructor Dashboard (with grade petitions table)
6. Grade Petition Form (student ID, course, grades, justification)
7. Admin Dashboard (tabs for: Document Requests, Major Apps, Grade Petitions)
8. Admin Calendar Management
9. Admin User Management

Use React Router for navigation, Context API for auth state, Axios for API calls.
Include role-based route protection and token refresh logic.
Simple, clean design - mobile responsive.
```

---

## Document Summary

**Version:** 2.0 (Simplified)  
**Date:** February 8, 2026  
**Technology:** Flask + React  
**Roles:** 3 (Student, Instructor, Admin)  
**Approval:** Single-level (all to admin)  
**Payment:** Voucher generation only  
**Total Requirements:** 35 Functional + 25 Non-Functional  
**LLM Generated:** 100% (Claude Sonnet 4.5)  

---

**END OF DOCUMENT**
