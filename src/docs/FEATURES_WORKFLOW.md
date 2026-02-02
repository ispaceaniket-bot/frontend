# Features & Workflow Guide

**Created:** January 29, 2026  
**Version:** 1.0

---

## 📌 Table of Contents

1. [Core Features](#core-features)
2. [Complete Workflow](#complete-workflow)
3. [Status Management](#status-management)
4. [Comment System](#comment-system)
5. [Statistics & Reporting](#statistics--reporting)
6. [User Role Capabilities](#user-role-capabilities)
7. [Common Scenarios](#common-scenarios)

---

## ✨ Core Features

### 1. Case Management

#### Creating a Case
**User:** Buyer/Creator

**Steps:**
1. Navigate to "Create Case"
2. Enter "Claimant Date of Birth"
3. Enter "Case Description/Notes"
4. Upload supporting documents
5. Click "Create Case"
6. System shows success notification
7. Redirected to Dashboard

**Case Initialization:**
```javascript
{
  id: "auto-incremented",
  status: "Pending",
  qaStatus: "NA",
  qaComments: [],
  gpComments: [],
  dateOfBirth: "input",
  notes: "input",
  files: [],
  createdAt: "now",
  createdBy: "user email"
}
```

#### Viewing Cases
- **Buyer**: Can view created, assigned, and approved cases
- **Admin**: Can view all cases with filtering
- **GP**: Can view assigned cases
- **QA**: Can view approved/closed cases for audit

#### Case Details View
Includes sections for:
- Case Information (DOB, description, QA status)
- Documents (upload/download/delete)
- Discussion Tab (threads, clarifications)
- QA Comments Tab (if QA comments exist)
- GP Comments Tab (if GP comments exist)

### 2. Document Management

#### Supported Formats
- PDF (.pdf)
- JPEG (.jpg, .jpeg)
- PNG (.png)

#### Document Operations

**Upload:**
```
Click upload area or drag-drop files
→ Browser validation
→ Encode as base64
→ Store in case.files array
→ Save to localStorage
```

**Download:**
```
Click download button
→ Retrieve base64 data
→ Create download link
→ Trigger browser download
```

**Delete:**
```
Click delete button
→ Confirm action
→ Remove from files array
→ Update localStorage
```

### 3. Discussion System

#### Thread Creation
- Initiated by case creation
- Referenced by caseId
- Stored in `localStorage["caseThreads"][caseId]`

#### Message Types

**Reply Message:**
- Author responds to existing thread
- Used for general communication
- No special badge

**Clarification:**
- GP requests additional information
- Tagged with "❓ Clarification" badge
- Prompts buyer to reply
- Shows in Discussion tab

**Decision:**
- GP approves case
- Tagged with decision status
- Marks case as approved

#### Message Structure
```javascript
{
  id: "timestamp",
  author: "User Name",
  role: "Buyer" | "GP",
  message: "Message content",
  timestamp: "ISO timestamp",
  type: "reply" | "clarification" | "decision"
}
```

### 4. QA Review System

#### Two-Decision System

**Decision 1: Ready to Go**
- Button: "Ready to Go ✓"
- Sets qaStatus: "Ready to Go"
- Color: Green (#059669)
- Meaning: Case passes QA audit

**Decision 2: Rework**
- Button: "Rework ⟳"
- Sets qaStatus: "Rework"
- Color: Red (#dc2626)
- Meaning: Case needs revision/improvement

#### QA Review Flow
```
1. QA sees case in "Cases Pending Audit"
2. Clicks case to view details
3. Reviews case information
4. Reads GP Comments (via tab)
5. Adds QA comments (required)
6. Selects decision (Ready to Go or Rework)
7. Clicks "Submit"
8. qaComments array updated
9. Statistics refresh
```

#### QA Comments Storage
```javascript
qaComments: [
  {
    comment: "Quality review comment",
    decision: "good",        // or "rework"
    by: "QA User Name",
    at: "2026-01-29T10:30:00Z"
  }
]
```

### 5. GP Approval System

#### Approval Process

**Step 1: Review Case**
- GP clicks case to view
- Reviews case details and documents
- Reviews GP Comments tab
- Participates in discussion

**Step 2: Optional Clarifications**
- GP can request clarification from buyer
- Message tagged as "clarification"
- Buyer receives in Discussion tab

**Step 3: Approve Case**
- GP adds approval comments (required)
- Only "Approved" decision available
- Clicks "Submit"
- System actions:
  - Case status → "Closed"
  - GP comments stored
  - Case visible to QA
  - Case removed from "Pending Review"
  - Case reappears with "Approved" badge

#### GP Comments Storage
```javascript
gpComments: [
  {
    comment: "GP approval comment",
    decision: "Approved",
    by: "GP Name",
    at: "2026-01-29T10:30:00Z"
  }
]
```

### 6. Admin Assignment System

#### Assignment Process

**Step 1: Select Case**
- Admin views case in list
- Clicks "Review Case" button

**Step 2: Assign Details**
- Select Specialty:
  - General, Cardiology, Radiology, Orthopedics, Neurology, Dermatology
- Select GP from list:
  - Tom, sai naveen, Robert, Aniket, veena, Jennifer
- Set SLA (Service Level Agreement) in days

**Step 3: Confirm Assignment**
- System creates caseAssignment record
- Case status → "Assigned"
- GP sees case in dashboard

#### Assignment Record Structure
```javascript
{
  caseId: "1",
  caseName: "Case #1",
  assignedGP: "GP Name",
  specialty: "Specialty",
  sla: 5,
  status: "Assigned"
}
```

---

## 🔄 Complete Workflow

### Full Case Journey (Visual)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. BUYER CREATES CASE                                            │
│    Status: Pending                                               │
│    qaStatus: NA                                                  │
│    - Enter case details                                          │
│    - Upload documents                                            │
│    - Case saved to localStorage                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │ 1-2 days
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. ADMIN REVIEWS & ASSIGNS                                       │
│    Status: Pending → Assigned                                    │
│    - View case in Admin Dashboard                                │
│    - Click "Review Case"                                         │
│    - Select specialty (e.g., Cardiology)                         │
│    - Select GP (e.g., "Tom")                                     │
│    - Set SLA (e.g., 5 days)                                      │
│    - Case assigned to GP                                         │
│    - caseAssignment record created                               │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Immediately visible
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. GP REVIEWS CASE                                               │
│    Status: Assigned                                              │
│    - Case appears in GP Dashboard (Pending Review)               │
│    - View case details                                           │
│    - Can request clarification from buyer                        │
│    - Review documents                                            │
│    - Participate in discussion                                   │
│    - Analyze case information                                    │
└──────────────────────┬───────────────────────────────────────────┘
                       │ 3-5 days
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. GP ADDS COMMENTS & APPROVES                                   │
│    Status: Assigned → Closed                                     │
│    - GP enters approval comments                                 │
│    - Clicks "Approve" button                                     │
│    - Case status changes to "Closed"                             │
│    - GP comments stored in gpComments array                      │
│    - Case appears in GP Dashboard with "Approved" badge          │
│    - Case becomes visible to QA                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Immediately visible
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. QA RECEIVES CASE FOR AUDIT                                    │
│    Status: Closed                                                │
│    qaStatus: NA → Ready to Go or Rework                         │
│    - Case appears in QA Dashboard (Cases Pending Audit)          │
│    - QA reviews case details                                     │
│    - Reads GP Comments tab                                       │
│    - Reads Discussion thread                                     │
│    - Evaluates case quality                                      │
└──────────────────────┬───────────────────────────────────────────┘
                       │ 1-2 days
        ┌──────────────┴───────────────┐
        │                              │
        ▼                              ▼
    READY TO GO              REWORK REQUIRED
    qaStatus:                qaStatus:
    "Ready to Go"            "Rework"
    (green)                  (red)
        │                              │
        │  QA Comments stored          │  QA Comments stored
        │  Decision: "good"            │  Decision: "rework"
        │                              │
        │                              ▼
        │                    ┌──────────────────────────┐
        │                    │ Case flagged for rework  │
        │                    │ GP receives notification │
        │                    │ Revise and resubmit      │
        │                    └──────────────────────────┘
        │
        ▼
    ┌──────────────────────────────────────┐
    │ CASE APPROVED & COMPLETE            │
    │ Ready for further processing         │
    └──────────────────────────────────────┘
```

### Detailed Timeline

| Phase | Duration | Actor | Action |
|-------|----------|-------|--------|
| 1. Create | <5 min | Buyer | Create case with documents |
| 2. Assign | 1 day | Admin | Assign to GP with specialty/SLA |
| 3. Review | 3-5 days | GP | Review case and clarify if needed |
| 4. Approve | <2 hours | GP | Add comments and approve |
| 5. Audit | 1-2 days | QA | Review and decide Ready/Rework |
| **Total** | **5-9 days** | Various | Complete process |

---

## 📊 Status Management

### Case Status Flow

```
"Pending"
  │ Admin assigns to GP
  ▼
"Assigned"
  │ GP approves case
  ▼
"Closed"
  │ QA audits case
  ▼
"Ready to Go" or "Rework" (qaStatus)
```

### Status Combinations

| Case Status | QA Status | Meaning |
|-------------|-----------|---------|
| Pending | NA | Newly created, awaiting assignment |
| Assigned | NA | Assigned to GP, awaiting review |
| Closed | NA | GP approved, awaiting QA review |
| Closed | Ready to Go | QA approved, process complete |
| Closed | Rework | QA flagged for revision |

### Status Indicators

**Case Status Badges:**
- Gray: "Submitted" (Pending)
- Blue: "Assigned" (In GP review)
- Green: "Closed" (GP done)

**QA Status Badges:**
- Gray: "NA" (Not reviewed)
- Green: "Ready to Go" (QA approved)
- Red: "Rework" (QA feedback needed)

---

## 💬 Comment System

### Three Types of Comments

#### 1. QA Comments
- **Who**: QA auditors
- **When**: After GP approval
- **What**: Quality feedback and audit results
- **Decision**: "good" (Ready to Go) or "rework" (Rework)
- **Storage**: `case.qaComments[]`
- **Visibility**: 
  - QA can see when editing
  - Buyer/GP can see in "QA Comments" tab
  - Visible after submission

#### 2. GP Comments
- **Who**: General Practitioners
- **When**: During/after case approval
- **What**: Approval feedback and medical review
- **Decision**: "Approved"
- **Storage**: `case.gpComments[]`
- **Visibility**:
  - GP can see when editing
  - Buyer/QA can see in "GP Comments" tab
  - Visible after submission

#### 3. Discussion Messages
- **Who**: Buyers and GPs
- **When**: Throughout review process
- **Types**:
  - General replies
  - Clarification requests (from GP)
  - Decision messages (GP approval)
- **Storage**: `caseThreads[caseId][]`
- **Visibility**: Both parties see in real-time

### Comment Tab Logic

**QA Comments Tab:**
```javascript
if (case.qaComments && case.qaComments.length > 0) {
  // Show tab with comments
} else {
  // Hide tab
}
```

**GP Comments Tab:**
```javascript
if (case.gpComments && case.gpComments.length > 0) {
  // Show tab with comments
} else {
  // Hide tab
}
```

---

## 📈 Statistics & Reporting

### Admin Dashboard Statistics

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN STATISTICS GRID                                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Total Cases Created     │ All cases in system             │
│ 2. Allotted to GPs         │ Cases assigned (Assigned status)│
│ 3. Closed Cases            │ GP completed (Closed status)    │
│ 4. Ready to Go             │ QA approved (Ready to Go)       │
│ 5. Rework Required         │ QA feedback (Rework status)     │
│ 6. Approved/Processed      │ All GP approvals                │
└─────────────────────────────────────────────────────────────┘
```

### GP Dashboard Statistics

```
┌─────────────────────────────────────────────────────────────┐
│ GP STATISTICS GRID (Individual GP)                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Allotted Cases    │ Total assigned to this GP            │
│ 2. Pending Review    │ Still awaiting GP action             │
│ 3. Approved          │ Completed by this GP                 │
│ 4. Rejected/Rework   │ QA feedback on this GP's work        │
└─────────────────────────────────────────────────────────────┘
```

### QA Dashboard Statistics

```
┌─────────────────────────────────────────────────────────────┐
│ QA STATISTICS GRID                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Total Cases   │ All cases in system                      │
│ 2. QA Picked     │ Cases ready for QA review                │
│ 3. Submitted     │ Cases with QA feedback                   │
│ 4. Rework        │ Cases needing revision                   │
│ 5. Ready to Go   │ QA approved cases                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 User Role Capabilities

### Buyer/Creator Capabilities

| Feature | Can Do | Can't Do |
|---------|--------|---------|
| Create cases | ✓ | - |
| Upload documents | ✓ | - |
| Download documents | ✓ | - |
| Delete documents | ✓ (own cases) | - |
| View case details | ✓ (own cases) | Other buyer's cases |
| Reply to messages | ✓ | - |
| Request clarification | ✗ | - |
| Approve case | ✗ | - |
| Perform QA audit | ✗ | - |
| Assign to GP | ✗ | - |

### GP Capabilities

| Feature | Can Do | Can't Do |
|---------|--------|---------|
| View assigned cases | ✓ | - |
| Request clarification | ✓ | - |
| Reply to messages | ✓ | - |
| Add approval comments | ✓ | - |
| Approve case | ✓ | - |
| Create case | ✗ | - |
| Perform QA audit | ✗ | - |
| Assign to another GP | ✗ | - |
| Delete case | ✗ | - |

### QA Capabilities

| Feature | Can Do | Can't Do |
|---------|--------|---------|
| View approved cases | ✓ | Pending/Assigned |
| Read QA comments | ✓ | - |
| Read GP comments | ✓ | - |
| Add QA comments | ✓ | - |
| Decide (Ready/Rework) | ✓ | - |
| Approve case | ✗ | - |
| Assign to GP | ✗ | - |
| Create case | ✗ | - |
| Delete case | ✗ | - |

### Admin Capabilities

| Feature | Can Do | Can't Do |
|---------|--------|---------|
| View all cases | ✓ | - |
| Filter cases | ✓ | - |
| Assign to GP | ✓ | - |
| Set specialty | ✓ | - |
| Set SLA | ✓ | - |
| Review cases | ✓ | - |
| Create case | ✗ (as buyer) | - |
| Perform QA audit | ✗ | - |
| Delete case | Limited | - |

---

## 📝 Common Scenarios

### Scenario 1: Happy Path (No Issues)

```
Day 1: Buyer creates case → Admin assigns to GP
Days 2-5: GP reviews and approves
Days 6-7: QA audits and approves
Result: Case ready, qaStatus = "Ready to Go" ✓
```

### Scenario 2: Clarification Needed

```
Day 2: GP requests clarification
Day 3: Buyer provides additional info
Day 4: GP reviews new info and approves
Days 5-6: QA approves
Result: Case complete ✓
```

### Scenario 3: QA Feedback Required

```
Day 1: Buyer creates case
Days 2-4: GP approves case
Days 5-6: QA reviews, identifies issues
Result: Case flagged, qaStatus = "Rework" ⟳
         GP receives notification for revision
```

### Scenario 4: Multiple QA Reviews

```
Day 1: Buyer creates
Days 2-4: GP approves
Days 5-6: QA reviews, qaStatus = "Rework"
Days 7-8: GP revises and resubmits
Days 9-10: QA reviews again, qaStatus = "Ready to Go"
Result: Final approval ✓
```

### Scenario 5: Admin Oversight

```
Admin Dashboard:
- See all 100 cases
- Filter: 45 created, 30 allotted, 20 closed, 10 ready-to-go, 5 rework
- Identify bottlenecks
- Reassign cases as needed
- Monitor SLA compliance
```

---

## 🔐 Data Persistence

### localStorage Keys Used

```javascript
// User session
localStorage.setItem("token", "auth_token")
localStorage.setItem("userEmail", "user@example.com")
localStorage.setItem("userName", "John Doe")
localStorage.setItem("userRole", "buyer")

// Main data
localStorage.setItem("cases", JSON.stringify([]))
localStorage.setItem("caseAssignments", JSON.stringify([]))
localStorage.setItem("caseThreads", JSON.stringify({}))
localStorage.setItem("caseDecisions", JSON.stringify({}))
localStorage.setItem("activities", JSON.stringify([]))
```

### Data Retention

- All data stored in browser localStorage
- Data persists until manually cleared
- Data lost on browser cache clear
- No automatic backup (frontend only)

---

**Last Updated:** January 29, 2026  
**Version:** 1.0  
**Status:** Complete
