# Component Documentation

**Created:** January 29, 2026  
**Version:** 1.0

---

## Table of Contents
1. [Login Component](#login-component)
2. [Register Component](#register-component)
3. [Dashboard Component (Buyer)](#dashboard-component-buyer)
4. [CreateCase Component](#createcase-component)
5. [AdminDashboard Component](#admindashboard-component)
6. [GPSDashboard Component](#gpsdashboard-component)
7. [QADashboard Component](#qadashboard-component)
8. [Navbar Component](#navbar-component)
9. [ProtectedRoute Component](#protectedroute-component)

---

## Login Component

**File:** `src/components/Login.jsx`

### Purpose
Handles user authentication and role-based login.

### Features
- Email & password authentication
- Role selection (buyer, admin, gps, qa)
- Form validation
- Error handling
- Session persistence in localStorage
- Auto-redirect to appropriate dashboard

### State Variables
```javascript
formData: {
  email: string,
  password: string,
  role: "buyer" | "admin" | "gps" | "qa"
}
error: string
loading: boolean
```

### Key Methods
- `handleInputChange()` - Update form fields
- `handleSubmit()` - Validate and authenticate
- `handleRoleChange()` - Update selected role

### localStorage Keys Set
- `token` - Authentication token
- `userEmail` - User's email
- `userName` - User's display name
- `userRole` - User's role

### Navigation
- Redirects to `/dashboard` for buyers
- Redirects to `/admin-dashboard` for admin
- Redirects to `/gps-dashboard` for GPs
- Redirects to `/qa-dashboard` for QA

---

## Register Component

**File:** `src/components/Register.jsx`

### Purpose
Handles new user registration.

### Features
- User registration form
- Role selection
- Password validation
- Form validation
- Success/error notifications
- Auto-login after registration

### State Variables
```javascript
formData: {
  email: string,
  password: string,
  confirmPassword: string,
  username: string,
  role: "buyer" | "admin" | "gps" | "qa"
}
error: string
loading: boolean
notification: { show: boolean, message: string }
```

### Validation Rules
- Email must be valid format
- Password minimum 6 characters
- Passwords must match
- Full name required
- Role required

### Key Methods
- `handleInputChange()` - Update form fields
- `handleRoleChange()` - Update selected role
- `handleSubmit()` - Create user account
- `handleLogin()` - Auto-login after registration

---

## Dashboard Component (Buyer)

**File:** `src/components/Dashboard.jsx`

### Purpose
Main buyer dashboard for managing cases.

### Features
- View created, assigned, and approved cases
- Create new cases
- Case details modal
- Document management (upload/download/delete)
- Discussion threads
- QA and GP comments tabs
- Case deletion with confirmation
- Real-time status tracking

### State Variables
```javascript
detailsTab: "discussion" | "qaComments" | "gpComments"
cases: Case[]
selectedCase: Case | null
showCaseDetails: boolean
caseThreads: { [caseId]: Message[] }
replyMessage: string
activeTab: "created" | "active" | "closed"
notification: { show: boolean, message: string, type: string }
```

### Key Methods
- `loadCases()` - Fetch user's cases
- `loadThreads()` - Load discussion threads
- `getFilteredCases()` - Filter by tab (created/active/closed)
- `handleViewCase()` - Open case details
- `handleCloseCaseDetails()` - Close modal
- `handleDeleteCase()` - Delete case
- `handleAddReply()` - Add discussion reply
- `handleFileUpload()` - Upload documents
- `handleDownloadDocument()` - Download document
- `handleDeleteDocument()` - Delete document
- `getTimeAgo()` - Format timestamps

### Case Status Categories

**Created Tab:** Pending cases not yet assigned
```javascript
status === "Pending" && !isAssigned
```

**Active Tab:** Cases assigned to GP
```javascript
status === "Assigned"
```

**Approved Tab:** Cases approved by GP
```javascript
status === "Approved" || status === "Closed"
```

### Case Details Modal Tabs

1. **Discussion Tab**
   - Shows case threads
   - GP clarification requests
   - Reply capability
   
2. **QA Comments Tab** (appears only if comments exist)
   - Shows all QA review comments
   - Decision (Ready to Go or Rework)
   - Reviewer name & timestamp

3. **GP Comments Tab** (appears only if comments exist)
   - Shows all GP approval comments
   - Approval decision
   - Reviewer name & timestamp

### Document Management
- Supported formats: PDF, JPG, PNG
- Maximum file size: browser dependent
- Upload via drag-drop or click
- Download with original filename
- Delete with confirmation

---

## CreateCase Component

**File:** `src/components/CreateCase.jsx`

### Purpose
Form for creating new cases.

### Features
- Case information form
- Document upload (drag & drop)
- File validation
- Form validation
- Success notification
- Auto-redirect after creation
- Case initialization with default values

### State Variables
```javascript
formData: {
  dateOfBirth: string,
  notes: string,
  files: File[]
}
isDragging: boolean
error: string
loading: boolean
```

### Required Fields
- Date of Birth (MM/DD/YYYY format)
- Case Notes/Description

### Case Initialization
Each new case is created with:
```javascript
{
  id: "auto-incremented",
  status: "Pending",
  qaStatus: "NA",
  qaComments: [],
  gpComments: [],
  dateOfBirth: "user input",
  notes: "user input",
  files: [],
  createdBy: "user email",
  createdByName: "user name",
  createdAt: "ISO timestamp"
}
```

### Document Upload
- Drag & drop support
- File validation (type checking)
- Multiple file selection
- Real-time feedback
- Base64 encoding for localStorage

### File Validation
```javascript
const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"]
```

---

## AdminDashboard Component

**File:** `src/components/AdminDashboard.jsx`

### Purpose
Administrative oversight and case assignment.

### Features
- Statistics grid (6 cards)
- Case filtering (7 categories)
- Case assignment to GPs
- Specialty assignment
- SLA configuration
- Case review interface
- Real-time statistics

### State Variables
```javascript
pendingCases: Case[]
allCases: Case[]
selectedCase: Case | null
reviewStep: "list" | "review" | "assign"
statusFilter: "all" | "created" | "allotted" | "closed" | "readyToGo" | "rework" | "approved"
caseStats: {
  totalCreated: number,
  allotted: number,
  closed: number,
  approved: number,
  rework: number,
  readyToGo: number
}
```

### Statistics Cards

| Card | Calculation | Color |
|------|-------------|-------|
| Total Cases Created | All cases | Gray |
| Allotted to GPs | Assigned status cases | Blue |
| Closed Cases | Status === "Closed" | Red |
| Ready to Go | qaStatus === "Ready to Go" | Green |
| Rework Required | qaStatus === "Rework" | Amber |
| Approved/Processed | Status === "Approved" \| "Closed" | Indigo |

### Filter Categories

1. **All Cases** - All cases in system
2. **Created** - Pending, not assigned
3. **Allotted** - Assigned to GP
4. **Closed** - GP completed
5. **Ready to Go** - QA approved
6. **Rework** - QA feedback needed
7. **Approved** - GP approved

### Key Methods
- `loadPendingCases()` - Load all cases with stats
- `getFilteredCases()` - Filter by status
- `handleSelectCase()` - Select case for assignment
- `handleApproveReview()` - Admin review
- `handleAssignToGP()` - Assign to GP
- `addActivity()` - Log admin actions

### Case Assignment Flow
1. Admin clicks "Review Case"
2. Selects specialty from dropdown
3. Assigns GP from list
4. Sets SLA (days)
5. Confirms assignment
6. Case status changes to "Assigned"
7. caseAssignment record created

---

## GPSDashboard Component

**File:** `src/components/GPSDashboard.jsx`

### Purpose
GP case review and approval interface.

### Features
- Statistics grid (4 cards)
- Assigned cases list with status badges
- Case details modal
- Clarification request system
- Case approval with comments
- Approved cases remain visible
- Real-time statistics

### State Variables
```javascript
assignedCases: Case[]
selectedCase: Case | null
showCaseDetails: boolean
clarificationComment: string
finalDecision: string
decisionComments: string
caseThreads: { [caseId]: Message[] }
gpStats: {
  allotted: number,
  pending: number,
  approved: number,
  rejected: number
}
```

### Statistics Cards

| Card | Calculation | Color | Status |
|------|-------------|-------|--------|
| Allotted Cases | Total cases assigned | Blue | Displayed |
| Pending Review | Status === "Pending Review" | Amber | Awaiting action |
| Approved | Status === "Approved" | Green | Completed |
| Rejected/Rework | qaStatus === "Rework" | Red | Needs rework |

### Case Status Display
- **Pending Review** - Light gray background, amber badge
- **Approved** - Light green background, green badge
- Approved cases remain in list (not removed)

### Case Review Features

**Clarification Request:**
- GP can request information from buyer
- Creates discussion thread entry
- Buyer receives notification
- Message tagged as "clarification"

**Case Approval:**
- GP must add approval comments
- Only "Approved" decision allowed
- Case status changes to "Closed"
- GP comments stored in case data
- Case visible to QA after approval

### Key Methods
- `loadAssignedCases()` - Load GP's cases
- `handleViewCase()` - Open case details
- `handleAddClarification()` - Request clarification
- `handleFinalDecision()` - Approve case
- `addActivity()` - Log GP actions

### Case Approval Flow
1. GP clicks case to review
2. Can add clarification request (optional)
3. Reviews GP Comments tab (if exists)
4. Reviews Discussion thread
5. Adds approval comments (required)
6. Confirms approval
7. Case status → "Closed"
8. GP comments stored
9. Case visible to QA
10. Case reloads with "Approved" badge

---

## QADashboard Component

**File:** `src/components/QADashboard.jsx`

### Purpose
Quality assurance audit and case review.

### Features
- Statistics grid (5 cards)
- Cases pending audit
- Case details modal
- Two-decision review system
- QA comments submission
- Real-time statistics
- Case visibility for audit trail

### State Variables
```javascript
auditCases: Case[]
expandedCaseId: string | null
showCommentSection: boolean
auditComments: string
auditDecision: "good" | "rework"
qaStats: {
  totalCases: number,
  picked: number,
  submitted: number,
  rework: number,
  readyToGo: number
}
notification: { show: boolean, message: string }
```

### Statistics Cards

| Card | Calculation | Color |
|------|-------------|-------|
| Total Cases | All cases | Gray |
| QA Picked | Status === "Approved" \| "Closed" | Blue |
| Submitted | Cases with qaComments | Indigo |
| Rework | qaStatus === "Rework" | Amber |
| Ready to Go | qaStatus === "Ready to Go" | Green |

### Case Availability
- QA picks up cases with status "Approved" or "Closed"
- Cases from GP approval visible for review
- Cases with existing QA feedback still available
- No case removal after QA review (audit trail)

### QA Review Decisions

**Ready to Go (Decision: "good")**
- QA approves the case
- qaStatus → "Ready to Go"
- Case marked as green
- Indicates case quality acceptable

**Rework (Decision: "rework")**
- QA identifies issues
- qaStatus → "Rework"
- Case marked as red
- Indicates case needs revision

### QA Comments Storage
```javascript
qaComments: [
  {
    comment: "Review comment text",
    decision: "good" | "rework",
    by: "QA Username",
    at: "ISO timestamp"
  }
]
```

### Key Methods
- `loadApprovedCases()` - Load cases for QA review
- `handleCaseClick()` - Expand/collapse case
- `handleQACommentClick()` - Toggle comment section
- `handleSubmitAudit()` - Submit QA review
- `getFilteredCases()` - Filter by status (not implemented in UI)

### Case Review Flow
1. QA sees "Cases Pending Audit" list
2. Clicks case to expand details
3. Reviews:
   - Case information
   - Case notes
   - GP comments (via Comments tab)
4. Adds QA comments (required)
5. Selects decision:
   - "Ready to Go" (green)
   - "Rework" (red)
6. Submits review
7. Case qaComments updated
8. Statistics refresh
9. Case remains visible

---

## Navbar Component

**File:** `src/components/Navbar.jsx`

### Purpose
Navigation and user information display.

### Features
- Logo/brand display
- Role-based navigation links
- User information display
- Logout functionality
- Responsive design

### Navigation Links by Role

**Buyer:**
- Dashboard
- Create Case

**Admin:**
- Admin Dashboard

**GP:**
- GPS Dashboard

**QA:**
- QA Dashboard

### Key Methods
- `handleLogout()` - Clear session and redirect
- `getRoleLinks()` - Get role-specific links

---

## ProtectedRoute Component

**File:** `src/components/ProtectedRoute.jsx`

### Purpose
Route protection based on user role.

### Features
- Role-based access control
- Redirect unauthorized users
- Session validation
- Role verification

### Props
```javascript
{
  children: ReactNode,
  allowedRoles: string[]
}
```

### Implementation
```javascript
// Check if user is authenticated
const userRole = localStorage.getItem("userRole")

// Check if role is allowed
if (!allowedRoles.includes(userRole)) {
  // Redirect to login
}

// Render protected component
```

### Usage Example
```jsx
<ProtectedRoute allowedRoles={["buyer"]}>
  <Dashboard />
</ProtectedRoute>
```

---

## Data Flow Diagrams

### 1. Case Creation Flow
```
Buyer → CreateCase form → New Case Object
         ↓
         Store in localStorage["cases"]
         ↓
         Redirect to Dashboard
         ↓
         Show success notification
```

### 2. Case Assignment Flow
```
Admin → Select case → Assign to GP + Specialty + SLA
        ↓
        Create caseAssignment record
        ↓
        Update case status to "Assigned"
        ↓
        GP sees case in dashboard
```

### 3. Case Review Flow
```
GP → Review case → Add clarifications → Approve case
     ↓
     Case status → "Closed"
     ↓
     GP comments stored
     ↓
     Case visible to QA
```

### 4. QA Audit Flow
```
QA → Pick case → Review case & GP comments → Add QA review
     ↓
     qaStatus → "Ready to Go" or "Rework"
     ↓
     Statistics updated
     ↓
     Case marked complete (audit trail)
```

---

## Common Data Structures

### Case Object
```javascript
{
  id: string,
  status: "Pending" | "Assigned" | "Closed",
  qaStatus: "NA" | "Ready to Go" | "Rework",
  type: string,
  dateOfBirth: string,
  notes: string,
  files: File[],
  qaComments: QAComment[],
  gpComments: GPComment[],
  createdBy: string,
  createdByName: string,
  createdAt: string
}
```

### Message Object (Discussion Thread)
```javascript
{
  id: string,
  author: string,
  role: "Buyer" | "GP",
  message: string,
  timestamp: string,
  type: "reply" | "clarification" | "decision"
}
```

### File Object
```javascript
{
  id: string,
  name: string,
  size: number,
  type: string,
  uploadedAt: string,
  uploadedBy: string,
  data: string (base64)
}
```

---

**Last Updated:** January 29, 2026  
**Version:** 1.0  
**Status:** Complete
