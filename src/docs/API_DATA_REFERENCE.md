# API & Data Structure Reference

**Created:** January 29, 2026  
**Version:** 1.0

---

## 📚 Table of Contents

1. [Data Structures](#data-structures)
2. [localStorage Schema](#localstorage-schema)
3. [API Endpoints (Planned)](#api-endpoints-planned)
4. [Enums & Constants](#enums--constants)
5. [Examples](#examples)

---

## 🏗️ Data Structures

### Case Object

```javascript
interface Case {
  id: string                    // Auto-incremented: "1", "2", "3"
  status: CaseStatus           // Pending | Assigned | Closed
  qaStatus: QAStatus           // NA | "Ready to Go" | "Rework"
  
  // Case Information
  type: string                 // Case type from notes
  dateOfBirth: string          // Format: MM/DD/YYYY
  notes: string                // Case description/notes
  
  // Files
  files: File[]                // Array of uploaded documents
  filesCount: number           // Count of files
  
  // Comments
  qaComments: QAComment[]      // Array of QA reviews
  gpComments: GPComment[]      // Array of GP approvals
  
  // Metadata
  createdBy: string            // User email who created
  createdByName: string        // User name who created
  createdAt: string            // ISO timestamp
  
  // Styling (optional)
  statusColor?: string         // Hex color code
}

type CaseStatus = "Pending" | "Assigned" | "Closed"
type QAStatus = "NA" | "Ready to Go" | "Rework"
```

### File Object

```javascript
interface File {
  id: string                   // UUID or random string
  name: string                 // Original filename with extension
  size: number                 // File size in bytes
  type: string                 // MIME type (application/pdf, image/jpeg, etc)
  
  uploadedAt: string           // ISO timestamp
  uploadedBy: string           // User email who uploaded
  data: string                 // Base64 encoded file content
}
```

### Message Object (Discussion Thread)

```javascript
interface Message {
  id: string                   // Timestamp or UUID
  author: string               // User name
  role: "Buyer" | "GP"        // Sender role
  message: string              // Message content
  timestamp: string            // ISO timestamp
  type: "reply" | "clarification" | "decision"  // Message type
  
  // Optional fields
  decision?: string            // For decision messages: "Approved"
}
```

### QA Comment Object

```javascript
interface QAComment {
  comment: string              // QA review feedback
  decision: "good" | "rework"  // QA decision
  by: string                   // QA user name
  at: string                   // ISO timestamp of submission
}
```

### GP Comment Object

```javascript
interface GPComment {
  comment: string              // GP approval comment
  decision: string             // Always "Approved" currently
  by: string                   // GP name
  at: string                   // ISO timestamp of approval
}
```

### Case Assignment Object

```javascript
interface CaseAssignment {
  caseId: string               // References case.id
  caseName: string             // Display name "Case #1"
  assignedGP: string           // GP name assigned to
  specialty: string            // Medical specialty
  sla: number                  // Service Level Agreement in days
  status?: string              // "Assigned" or custom status
}
```

### Activity Log Object

```javascript
interface Activity {
  id: string                   // Timestamp as ID
  description: string          // Activity description
  timestamp: string            // ISO timestamp
  userRole: string             // Role who performed action
}
```

### User Session Object

```javascript
interface UserSession {
  token: string                // Authentication token
  userEmail: string            // User email address
  userName: string             // User display name
  userRole: "buyer" | "admin" | "gps" | "qa"  // User role
}
```

### Statistics Object (Admin)

```javascript
interface AdminStats {
  totalCreated: number         // All cases
  allotted: number             // Assigned to GP
  closed: number               // Closed by GP
  approved: number             // Approved (including closed)
  rework: number               // Rework status
  readyToGo: number            // Ready to Go status
}
```

### Statistics Object (GP)

```javascript
interface GPStats {
  allotted: number             // Total assigned to this GP
  pending: number              // Pending review
  approved: number             // GP approved
  rejected: number             // QA feedback received
}
```

### Statistics Object (QA)

```javascript
interface QAStats {
  totalCases: number           // All cases in system
  picked: number               // Cases for QA review
  submitted: number            // Cases with QA feedback
  rework: number               // Rework decision count
  readyToGo: number            // Ready to Go count
}
```

---

## 💾 localStorage Schema

### Key: `cases`
**Type:** `Case[]`
**Description:** Array of all cases in system

```javascript
localStorage.setItem("cases", JSON.stringify([
  {
    id: "1",
    status: "Closed",
    qaStatus: "NA",
    type: "Medical Review",
    dateOfBirth: "01/15/1990",
    notes: "Case description here...",
    files: [],
    qaComments: [],
    gpComments: [],
    createdBy: "buyer@test.com",
    createdByName: "John Buyer",
    createdAt: "2026-01-29T10:30:00Z"
  }
]))
```

### Key: `caseAssignments`
**Type:** `CaseAssignment[]`
**Description:** GP assignments for cases

```javascript
localStorage.setItem("caseAssignments", JSON.stringify([
  {
    caseId: "1",
    caseName: "Case #1",
    assignedGP: "Tom",
    specialty: "Cardiology",
    sla: 5,
    status: "Assigned"
  }
]))
```

### Key: `caseThreads`
**Type:** `{ [caseId: string]: Message[] }`
**Description:** Discussion threads indexed by case ID

```javascript
localStorage.setItem("caseThreads", JSON.stringify({
  "1": [
    {
      id: "1705227000000",
      author: "John Buyer",
      role: "Buyer",
      message: "Case submitted for review",
      timestamp: "2026-01-29T10:30:00Z",
      type: "reply"
    },
    {
      id: "1705227060000",
      author: "Tom",
      role: "GP",
      message: "Can you provide more details about the symptoms?",
      timestamp: "2026-01-29T10:31:00Z",
      type: "clarification"
    }
  ]
}))
```

### Key: `caseDecisions` (Legacy)
**Type:** `{ [caseId: string]: Decision }`
**Description:** Legacy GP decisions (being replaced by case.gpComments)

```javascript
localStorage.setItem("caseDecisions", JSON.stringify({
  "1": {
    decision: "Approved",
    comments: "Case looks good"
  }
}))
```

### Key: `activities`
**Type:** `Activity[]`
**Description:** Activity log for all users

```javascript
localStorage.setItem("activities", JSON.stringify([
  {
    id: "1705227000000",
    description: "Case #1 created",
    timestamp: "2026-01-29T10:30:00Z",
    userRole: "buyer"
  }
]))
```

### Key: `token`
**Type:** `string`
**Description:** Authentication token (demo)

```javascript
localStorage.setItem("token", "demo-token-12345")
```

### Key: `userEmail`
**Type:** `string`
**Description:** Current logged-in user email

```javascript
localStorage.setItem("userEmail", "buyer@test.com")
```

### Key: `userName`
**Type:** `string`
**Description:** Current logged-in user display name

```javascript
localStorage.setItem("userName", "John Buyer")
```

### Key: `userRole`
**Type:** `string`
**Description:** Current logged-in user role

```javascript
localStorage.setItem("userRole", "buyer")
```

---

## 🔌 API Endpoints (Planned)

### Authentication Endpoints

#### POST /login
**Purpose:** Authenticate user

**Request:**
```javascript
{
  email: "user@example.com",
  password: "password123"
}
```

**Response (200):**
```javascript
{
  token: "jwt-token",
  user: {
    email: "user@example.com",
    name: "John Doe",
    role: "buyer"
  }
}
```

#### POST /register
**Purpose:** Create new user account

**Request:**
```javascript
{
  email: "user@example.com",
  password: "password123",
  username: "John Doe",
  role: "buyer"
}
```

**Response (201):**
```javascript
{
  token: "jwt-token",
  user: { /* ... */ }
}
```

#### GET /me
**Purpose:** Get current user info

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response (200):**
```javascript
{
  email: "user@example.com",
  name: "John Doe",
  role: "buyer"
}
```

### Case Endpoints

#### GET /cases
**Purpose:** Get all cases (admin) or user's cases

**Query Parameters:**
```
?status=Assigned          // Filter by status
?role=buyer               // Filter by user role
?skip=0&limit=10         // Pagination
```

**Response (200):**
```javascript
[
  { /* Case object */ },
  { /* Case object */ }
]
```

#### GET /cases/:id
**Purpose:** Get single case by ID

**Response (200):**
```javascript
{ /* Case object */ }
```

#### POST /cases
**Purpose:** Create new case

**Request:**
```javascript
{
  dateOfBirth: "01/15/1990",
  notes: "Case description",
  files: [/* File objects */]
}
```

**Response (201):**
```javascript
{ /* Created Case object */ }
```

#### PUT /cases/:id
**Purpose:** Update case

**Request:**
```javascript
{
  status: "Assigned",
  notes: "Updated notes"
}
```

**Response (200):**
```javascript
{ /* Updated Case object */ }
```

#### DELETE /cases/:id
**Purpose:** Delete case

**Response (204):** No content

### Case Assignment Endpoints

#### POST /cases/:id/assign
**Purpose:** Assign case to GP

**Request:**
```javascript
{
  assignedGP: "Tom",
  specialty: "Cardiology",
  sla: 5
}
```

**Response (200):**
```javascript
{ /* Updated Case object */ }
```

### Case Review Endpoints

#### PUT /cases/:id/approve
**Purpose:** GP approves case

**Request:**
```javascript
{
  decision: "Approved",
  comments: "Case approved after review"
}
```

**Response (200):**
```javascript
{ /* Updated Case with status: "Closed" */ }
```

#### PUT /cases/:id/qa
**Purpose:** QA audits case

**Request:**
```javascript
{
  qaStatus: "Ready to Go",
  qaComments: "Quality review passed"
}
```

**Response (200):**
```javascript
{ /* Updated Case with qaStatus */ }
```

### Document Endpoints

#### POST /documents/upload
**Purpose:** Upload document to case

**Multipart Form:**
```
file: <binary>
caseId: "1"
```

**Response (201):**
```javascript
{
  id: "file-123",
  name: "document.pdf",
  url: "/documents/file-123"
}
```

#### GET /documents/:id/download
**Purpose:** Download document

**Response (200):** File content with appropriate headers

#### DELETE /documents/:id
**Purpose:** Delete document

**Response (204):** No content

### Statistics Endpoints

#### GET /reports/stats
**Purpose:** Get system statistics

**Query Parameters:**
```
?type=admin|gp|qa        // Stat type
?gpName=Tom             // Optional filter
```

**Response (200):**
```javascript
{
  totalCreated: 50,
  allotted: 35,
  closed: 20,
  approved: 15,
  rework: 5,
  readyToGo: 10
}
```

---

## 📊 Enums & Constants

### Case Status Enum
```javascript
const CaseStatus = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  CLOSED: "Closed"
}
```

### QA Status Enum
```javascript
const QAStatus = {
  NA: "NA",
  READY_TO_GO: "Ready to Go",
  REWORK: "Rework"
}
```

### User Role Enum
```javascript
const UserRole = {
  BUYER: "buyer",
  ADMIN: "admin",
  GP: "gps",
  QA: "qa"
}
```

### Specialties
```javascript
const Specialties = [
  "General",
  "Cardiology",
  "Radiology",
  "Orthopedics",
  "Neurology",
  "Dermatology"
]
```

### GP Names
```javascript
const GPs = [
  "Tom",
  "sai naveen",
  "Robert",
  "Aniket",
  "veena",
  "Jennifer"
]
```

### Message Type Enum
```javascript
const MessageType = {
  REPLY: "reply",
  CLARIFICATION: "clarification",
  DECISION: "decision"
}
```

### Decision Type Enum
```javascript
const QADecision = {
  GOOD: "good",           // Maps to "Ready to Go"
  REWORK: "rework"        // Maps to "Rework"
}
```

### File Types
```javascript
const AllowedFileTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png"
]

const AllowedExtensions = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png"
]
```

---

## 📝 Examples

### Example 1: Create Case

**Request:**
```javascript
POST /cases
Content-Type: application/json

{
  dateOfBirth: "01/15/1990",
  notes: "Patient experiencing chest pain, requires cardiac evaluation",
  files: []
}
```

**Response:**
```javascript
{
  id: "1",
  status: "Pending",
  qaStatus: "NA",
  type: "Patient experiencing chest pain, requires cardiac evaluation",
  dateOfBirth: "01/15/1990",
  notes: "Patient experiencing chest pain, requires cardiac evaluation",
  files: [],
  qaComments: [],
  gpComments: [],
  createdBy: "buyer@test.com",
  createdByName: "John Buyer",
  createdAt: "2026-01-29T10:30:00Z"
}
```

### Example 2: Assign Case to GP

**Request:**
```javascript
POST /cases/1/assign
Content-Type: application/json
Authorization: Bearer token

{
  assignedGP: "Tom",
  specialty: "Cardiology",
  sla: 5
}
```

**Response:**
```javascript
{
  id: "1",
  status: "Assigned",
  // ... rest of case object
}
```

**localStorage Updated:**
```javascript
caseAssignments = [
  {
    caseId: "1",
    caseName: "Case #1",
    assignedGP: "Tom",
    specialty: "Cardiology",
    sla: 5,
    status: "Assigned"
  }
]
```

### Example 3: GP Approves Case

**Request:**
```javascript
PUT /cases/1/approve
Content-Type: application/json
Authorization: Bearer gp-token

{
  decision: "Approved",
  comments: "Case thoroughly reviewed. Patient requires immediate cardiac intervention."
}
```

**Response:**
```javascript
{
  id: "1",
  status: "Closed",
  qaStatus: "NA",
  gpComments: [
    {
      comment: "Case thoroughly reviewed. Patient requires immediate cardiac intervention.",
      decision: "Approved",
      by: "Tom",
      at: "2026-01-29T14:30:00Z"
    }
  ],
  // ... rest of case object
}
```

### Example 4: QA Audits Case

**Request:**
```javascript
PUT /cases/1/qa
Content-Type: application/json
Authorization: Bearer qa-token

{
  qaStatus: "Ready to Go",
  qaComments: "Quality review passed. All documentation complete and case properly evaluated."
}
```

**Response:**
```javascript
{
  id: "1",
  status: "Closed",
  qaStatus: "Ready to Go",
  qaComments: [
    {
      comment: "Quality review passed. All documentation complete and case properly evaluated.",
      decision: "good",
      by: "QA User",
      at: "2026-01-29T16:00:00Z"
    }
  ],
  // ... rest of case object
}
```

### Example 5: Get Statistics

**Request:**
```javascript
GET /reports/stats?type=admin
Authorization: Bearer token
```

**Response:**
```javascript
{
  totalCreated: 100,
  allotted: 85,
  closed: 60,
  approved: 55,
  rework: 5,
  readyToGo: 50,
  timestamp: "2026-01-29T16:00:00Z"
}
```

---

## 🔗 Relationships

### Case → File
```
1 Case has many Files
Case.files: File[]
```

### Case → Messages
```
1 Case has many Messages (in caseThreads)
caseThreads[caseId]: Message[]
```

### Case → GP
```
1 Case assigned to 1 GP (via CaseAssignment)
Case.id → CaseAssignment.caseId → CaseAssignment.assignedGP
```

### User → Cases
```
1 User creates many Cases
Case.createdBy → User.email
```

---

## ✔️ Validation Rules

### Case Creation
- dateOfBirth: Required, format MM/DD/YYYY
- notes: Required, min 10 chars
- files: Optional, max 5 files, max 10MB total

### Case Assignment
- assignedGP: Required, must be in GP list
- specialty: Required, must be in specialty list
- sla: Required, numeric, 1-30 days

### QA Review
- qaComments: Required, min 5 characters
- qaStatus: Required, must be "Ready to Go" or "Rework"

### GP Approval
- comments: Required, min 5 characters
- decision: Required, must be "Approved"

---

**Last Updated:** January 29, 2026  
**Version:** 1.0  
**Status:** Complete
