# CRM Case Management System - Complete System Overview

**Version:** 1.0  
**Last Updated:** January 29, 2026  
**Technology Stack:** React 19 + Vite + React Router 7

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Core Features](#core-features)
5. [Database Structure](#database-structure)
6. [Component Documentation](#component-documentation)
7. [Workflow Processes](#workflow-processes)
8. [Installation & Setup](#installation--setup)
9. [API Structure](#api-structure)

---

## 🎯 Project Overview

The CRM Case Management System is a multi-role application designed to manage medical/legal cases through a complete workflow involving multiple stakeholders:

- **Buyers**: Create and manage cases with documentation
- **GPs (General Practitioners)**: Review and approve cases
- **QA (Quality Assurance)**: Audit cases after GP approval
- **Admin**: Oversee all cases and assign work to GPs

The system uses **localStorage** for data persistence and implements real-time status tracking across all user roles.

---

## 🏗️ System Architecture

### Technology Stack
- **Frontend Framework**: React 19
- **Build Tool**: Vite (with Rolldown)
- **Routing**: React Router 7
- **State Management**: React Hooks (useState, useEffect)
- **Data Storage**: Browser localStorage
- **Styling**: CSS-in-JS (inline styles & CSS modules)

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx              # Authentication
│   │   ├── Register.jsx           # User registration
│   │   ├── Dashboard.jsx          # Buyer dashboard
│   │   ├── CreateCase.jsx         # Create new cases
│   │   ├── AdminDashboard.jsx     # Admin oversight
│   │   ├── GPSDashboard.jsx       # GP case review
│   │   ├── QADashboard.jsx        # QA audit
│   │   ├── Navbar.jsx             # Navigation
│   │   └── ProtectedRoute.jsx     # Route protection
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   ├── styles.css                 # Global styles
│   └── api.js                     # API utilities
├── public/                        # Static assets
├── package.json
├── vite.config.js
└── eslint.config.js
```

---

## 👥 User Roles & Permissions

### 1. **Buyer/Creator**
- Create new cases with case details and documents
- Upload multiple documents (PDF, JPG, PNG)
- View case status across different stages
- Participate in discussion threads
- Download and manage uploaded documents
- View case details with QA and GP comments tabs
- Dashboard Tabs:
  - Created Cases (Pending)
  - Assigned Cases (Active)
  - Approved Cases (Closed)

### 2. **GP (General Practitioners)**
- View assigned cases for review
- Add clarification requests to buyers
- Approve or manage cases
- Leave approval comments
- Track case status (Pending Review → Approved)
- Statistics Dashboard showing:
  - Allotted Cases (total assigned)
  - Pending Review (awaiting action)
  - Approved (completed)
  - Rejected/Rework (QA feedback)

### 3. **QA (Quality Assurance)**
- Review all approved cases from GPs
- Provide feedback with decision: "Ready to Go" or "Rework"
- Leave QA comments on cases
- Track case qaStatus
- Statistics Dashboard showing:
  - Total Cases (all in system)
  - QA Picked (cases ready for review)
  - Submitted (cases with feedback)
  - Rework (cases needing revision)
  - Ready to Go (QA approved)

### 4. **Admin**
- View all cases in the system
- Assign cases to GPs
- Filter cases by status:
  - Created (new, not assigned)
  - Allotted (assigned to GP)
  - Closed (GP approved)
  - Ready to Go (QA approved)
  - Rework (needs revision)
  - Approved (GP approved/processed)
- Statistics Grid showing:
  - Total Cases Created
  - Allotted to GPs
  - Closed Cases
  - Ready to Go
  - Rework Required
  - Approved/Processed

---

## ✨ Core Features

### 1. **Case Management**
- Create cases with detailed information
- Track case status through workflow
- Document management (upload/download/delete)
- Support for PDF, JPG, PNG formats

### 2. **Discussion & Comments**
- Thread-based communication between buyers and GPs
- Clarification requests from GPs
- QA Comments tab (appears when comments exist)
- GP Comments tab (appears when comments exist)
- Timestamp tracking for all messages

### 3. **QA Review System**
- QA Status field defaults to "NA"
- Two-decision review: "Ready to Go" or "Rework"
- QA comments stored with decision and timestamp
- Cases remain visible after QA review for audit trail

### 4. **Status Tracking**
- **Case Status**: Pending → Assigned → Closed
- **QA Status**: NA → Ready to Go / Rework
- Real-time status updates across all dashboards
- Color-coded status indicators

### 5. **Statistics & Reporting**
- Real-time statistics for each user role
- Dashboard cards showing key metrics
- Case filtering by status
- Performance indicators

---

## 💾 Database Structure

### localStorage Keys

#### Cases
```javascript
cases: [
  {
    id: "1",
    status: "Closed",              // Pending, Assigned, Closed
    qaStatus: "NA",                // NA, Ready to Go, Rework
    qaComments: [                  // Array of QA reviews
      {
        comment: "...",
        decision: "good",          // "good" or "rework"
        by: "QA Username",
        at: "ISO timestamp"
      }
    ],
    gpComments: [                  // Array of GP reviews
      {
        comment: "...",
        decision: "Approved",
        by: "GP Name",
        at: "ISO timestamp"
      }
    ],
    type: "Case Type",
    dateOfBirth: "MM/DD/YYYY",
    notes: "Case description",
    files: [                       // Uploaded documents
      {
        id: "file_id",
        name: "document.pdf",
        size: 1024,
        type: "application/pdf",
        uploadedAt: "ISO timestamp",
        uploadedBy: "user@email.com",
        data: "base64 encoded content"
      }
    ],
    createdBy: "user@email.com",
    createdByName: "John Doe",
    createdAt: "ISO timestamp"
  }
]
```

#### Case Assignments
```javascript
caseAssignments: [
  {
    caseId: "1",
    caseName: "Case #1",
    assignedGP: "GP Name",
    specialty: "General",
    sla: 5,
    status: "Assigned"
  }
]
```

#### Case Threads (Discussion)
```javascript
caseThreads: {
  "1": [                          // Case ID as key
    {
      id: "msg_id",
      author: "John Doe",
      role: "Buyer" | "GP",
      message: "Message content",
      timestamp: "ISO timestamp",
      type: "reply" | "clarification" | "decision"
    }
  ]
}
```

#### Case Decisions (Legacy)
```javascript
caseDecisions: {
  "1": {
    decision: "Approved" | "Rejected",
    comments: "..."
  }
}
```

#### User Activities
```javascript
activities: [
  {
    id: "timestamp",
    description: "Activity description",
    timestamp: "ISO timestamp",
    userRole: "buyer" | "admin" | "gps" | "qa"
  }
]
```

---

## 📦 Component Documentation

### 1. **Login.jsx**
- User authentication
- Role-based login (buyer, admin, gps, qa)
- localStorage session management
- Redirects to appropriate dashboard

**State:**
- formData (email, password)
- error messages
- loading state

### 2. **Register.jsx**
- New user registration
- Role selection
- Form validation
- Success/error notifications

### 3. **Dashboard.jsx** (Buyer)
- Display buyer's created cases
- Three tabs: Created, Assigned, Approved
- Case details modal with:
  - Case information
  - Document management
  - Discussion thread
  - QA Comments tab
  - GP Comments tab
- File upload/download functionality

**Stats Tracked:**
- qaStatus (with color-coded badge)
- Case status
- Document count

### 4. **CreateCase.jsx**
- Case creation form
- Document upload (drag & drop support)
- File validation
- Case initialization with:
  - qaStatus: "NA"
  - qaComments: []
  - gpComments: []

### 5. **AdminDashboard.jsx**
- Statistics Grid (6 cards):
  - Total Cases Created
  - Allotted to GPs
  - Closed Cases
  - Ready to Go
  - Rework Required
  - Approved/Processed
- Case filtering (7 tabs):
  - All Cases
  - Created
  - Allotted
  - Closed
  - Ready to Go
  - Rework
  - Approved
- Case assignment to GPs
- SLA and specialty assignment

### 6. **GPSDashboard.jsx**
- Statistics Grid (4 cards):
  - Allotted Cases
  - Pending Review
  - Approved
  - Rejected/Rework
- Case review interface
- Clarification request feature
- Case approval with comments
- Approved cases remain visible in list

### 7. **QADashboard.jsx**
- Statistics Grid (5 cards):
  - Total Cases
  - QA Picked
  - Submitted
  - Rework
  - Ready to Go
- Case audit interface
- Two-button decision system (Ready to Go / Rework)
- QA comments submission
- Case status updates

### 8. **Navbar.jsx**
- Navigation menu
- User info display
- Logout functionality
- Role-based navigation links

### 9. **ProtectedRoute.jsx**
- Route protection by role
- Redirect to login if unauthorized
- Automatic role-based routing

### 10. **api.js**
- Backend API wrapper
- Authentication helpers
- Request interceptors
- Error handling

---

## 🔄 Workflow Processes

### 1. **Complete Case Workflow**

```
┌─────────────────────────────────────────────────────────────┐
│ BUYER Creates Case                                          │
│ - Case Status: "Pending"                                    │
│ - QA Status: "NA"                                           │
│ - Upload Documents                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ ADMIN Reviews & Assigns to GP                               │
│ - Case Status: "Assigned"                                   │
│ - Assign Specialty, SLA, GP Name                            │
│ - Create caseAssignment record                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ GP Reviews Case                                             │
│ - Can request clarifications                                │
│ - Can add comments & messages                               │
│ - Approves case when ready                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ GP Approves → Case Status Changes to "Closed"               │
│ - GP Comments stored in gpComments array                    │
│ - Case becomes visible to QA                                │
│ - Case remains in GP's list with "Approved" badge           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ QA Reviews Case (QA Picked)                                 │
│ - Reviews GP's work & comments                              │
│ - Can access QA Comments tab                                │
│ - Can access GP Comments tab                                │
│ - Decides: "Ready to Go" or "Rework"                        │
└──────────────────┬──────────────────────────────────────────┘
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
    Ready to Go          Rework Required
    QA Status:           QA Status:
    "Ready to Go"        "Rework"
    (green)              (red)
         │                    │
         │                    ▼
         │            ┌──────────────────┐
         │            │ Send back to GP  │
         │            │ for revision     │
         │            └──────────────────┘
         │                    │
         └────────┬───────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ CASE CLOSED      │
         │ Final Status     │
         └──────────────────┘
```

### 2. **QA Review Decision Flow**

```
Case Status: "Closed" (from GP approval)
        │
        ▼
QA Receives Case for Review
        │
        ├─ Reviews case details
        ├─ Reads GP Comments (in tab)
        ├─ Adds QA Comments
        └─ Makes Decision
           │
           ├─ "Ready to Go" → qaStatus = "Ready to Go" (green)
           └─ "Rework" → qaStatus = "Rework" (red)
```

### 3. **Case Status Flow**

```
"Pending" (Created)
    ↓
    Admin assigns to GP
    ↓
"Assigned" (In Progress)
    ↓
    GP reviews & approves
    ↓
"Closed" (GP Done, now visible to QA)
    ↓
    QA Reviews
    ↓
qaStatus: "Ready to Go" or "Rework"
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with localStorage support

### Installation Steps

```bash
# 1. Navigate to frontend directory
cd d:\Projects\2026\crm_app\frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

### Development Server
- **URL**: `http://localhost:5173`
- **HMR**: Enabled (hot module reload)
- **Port**: 5173 (configurable in vite.config.js)

---

## 🔌 API Structure

### Backend Integration Points

The system currently uses localStorage but is structured for future backend integration.

#### Planned API Endpoints
```
Authentication:
  POST   /login
  POST   /register
  GET    /me

Cases:
  GET    /cases                    # Get all cases
  GET    /cases/:id                # Get case by ID
  POST   /cases                    # Create case
  PUT    /cases/:id                # Update case
  DELETE /cases/:id                # Delete case

Case Operations:
  PUT    /cases/:id/assign         # Assign to GP
  PUT    /cases/:id/approve        # GP approve
  PUT    /cases/:id/qa             # QA review

Documents:
  GET    /documents
  POST   /documents/upload         # Upload document
  GET    /documents/:id/download   # Download document
  DELETE /documents/:id            # Delete document

Reports:
  GET    /reports                  # Get reports
  GET    /reports/stats            # Get statistics
```

### Current localStorage Wrapper
```javascript
// api.js provides wrapper functions:
api.login(email, password)
api.register(email, password, username)
api.uploadDocument(file)
api.getDocuments()
api.updateQA(reportId, qaStatus, qaComments)
```

---

## 🎨 UI/UX Features

### Color Coding System
- **Blue** (#3b82f6): Information, general actions
- **Green** (#059669): Success, approved, ready to go
- **Red** (#dc2626): Error, rejected, rework needed
- **Amber** (#ca8a04): Warning, pending review
- **Gray** (#6b7280): Neutral, inactive

### Status Badges
- Case Status: SUBMITTED, Assigned, Closed
- QA Status: NA (gray), Ready to Go (green), Rework (red)
- Decision Status: Pending Review, Approved, Rejected

### Responsive Design
- Mobile-first approach
- Flexbox/Grid layouts
- Responsive typography
- Touch-friendly buttons and inputs

---

## 📊 Statistics & Metrics

### Admin Dashboard Stats
1. Total Cases Created - All cases
2. Allotted to GPs - Assigned cases
3. Closed Cases - Completed by GP
4. Ready to Go - QA approved
5. Rework Required - QA feedback needed
6. Approved/Processed - GP reviewed

### GP Dashboard Stats
1. Allotted Cases - Total assigned
2. Pending Review - Awaiting GP action
3. Approved - GP completed
4. Rejected/Rework - QA feedback

### QA Dashboard Stats
1. Total Cases - All in system
2. QA Picked - Ready for review
3. Submitted - With QA feedback
4. Rework - Needs revision
5. Ready to Go - QA approved

---

## 🔐 Security Features

### Authentication
- Role-based access control (RBAC)
- Protected routes by role
- Session management via localStorage
- Token-based auth (future backend integration)

### Data Protection
- Input validation on all forms
- File type validation (PDF, JPG, PNG only)
- XSS protection via React
- CSRF tokens (future backend integration)

---

## 🐛 Known Limitations & Future Enhancements

### Current Limitations
1. Data stored in localStorage (not persistent across browsers)
2. No backend server (mock data only)
3. No real authentication (demo users)
4. File size limits based on browser storage

### Planned Features
1. Backend API integration
2. Database persistence (PostgreSQL/MongoDB)
3. Real authentication (JWT/OAuth)
4. File storage (S3/Cloud Storage)
5. Email notifications
6. Advanced reporting & analytics
7. Bulk operations
8. Audit logging
9. Multi-language support
10. API documentation (Swagger)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 29, 2026 | Initial release with all core features |
| 0.9 | Jan 28, 2026 | QA Dashboard statistics added |
| 0.8 | Jan 28, 2026 | GP Dashboard statistics added |
| 0.7 | Jan 28, 2026 | Admin Dashboard with filtering |
| 0.6 | Jan 28, 2026 | GP case list with approval badges |
| 0.5 | Jan 28, 2026 | QA comments and GP comments tabs |
| 0.4 | Jan 27, 2026 | Core case workflow implementation |

---

## 📞 Support & Contact

For issues, feature requests, or documentation updates, please contact the development team.

**Project Location:** `d:\Projects\2026\crm_app\frontend`

---

**Last Updated:** January 29, 2026  
**Status:** Active Development  
**Maintainer:** Development Team
