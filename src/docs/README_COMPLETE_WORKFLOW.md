# Complete Medical CRM Case Lifecycle

## System Overview
A comprehensive medical case management system with multi-role access control (Buyer, GP, Admin, QA) supporting a complete case workflow from creation through quality audit.

## Complete Case Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE CASE WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────┤

1. CASE CREATION (Buyer Role)
   ├─ Navigate to CreateCase component
   ├─ Fill case form (DOB, notes, etc.)
   ├─ Upload documents (PDF, JPG, PNG)
   ├─ Submit case
   └─ Status: PENDING ✓

2. ADMIN REVIEW PHASE (Admin Role)
   ├─ AdminDashboard → Review pending cases
   ├─ Step 1: List view of all pending cases
   ├─ Step 2: Click case → Review details & add comments
   ├─ Step 3: Approve review → Assign to specific GP
   └─ Status: ASSIGNED ✓

3. GP APPROVAL PHASE (GP Role)
   ├─ GPSDashboard → View assigned cases only
   ├─ Case details show:
   │  ├─ Original case notes
   │  ├─ Admin review comments
   │  ├─ Case documents with download capability
   │  └─ Discussion thread with buyer
   ├─ Add approval comments
   ├─ Submit approval decision
   └─ Status: APPROVED ✓

4. BUYER DISCUSSION & DOCUMENT MANAGEMENT
   ├─ Available throughout entire workflow
   ├─ Features:
   │  ├─ Real-time threaded discussions with GP
   │  ├─ Upload additional documents to case
   │  ├─ Download case documents
   │  ├─ Delete documents (buyer only)
   │  └─ View document metadata
   └─ 3 Dashboard tabs:
      ├─ Created (Pending cases)
      ├─ Assigned (Assigned cases)
      └─ Approved (Approved cases)

5. QA QUALITY AUDIT (QA Role) ← NEW
   ├─ QADashboard → Audit approved cases
   ├─ Step 1: Case review
   │  ├─ View case notes
   │  ├─ View GP approval comments
   │  └─ Add mandatory QA comments
   ├─ Step 2: Review audit before submit
   │  ├─ Verify all information
   │  └─ Submit audit or go back to edit
   ├─ Save audit record with timestamp
   ├─ Update case status to AUDITED
   └─ Status: AUDITED ✓

FINAL STATE: Case fully processed through all workflows
└─ Buyer: Case visible in Approved tab
  └─ Admin: Case removed from review queue
    └─ GP: Case marked as approved and audited
      └─ QA: Audit record kept for compliance

```

## User Roles & Permissions

### 1. BUYER Role
**Access**: CreateCase, Dashboard (own cases only)
**Permissions**:
- Create new cases
- Upload documents to cases
- Download case documents
- Delete documents from own cases
- View case status (Pending/Assigned/Approved)
- Send messages to assigned GP
- View GP comments on case

**Case Visibility**: Only own created cases

### 2. GP Role
**Access**: GPSDashboard
**Permissions**:
- View only assigned cases (filter applied)
- View case notes and buyer documents
- Participate in case discussion
- Download documents
- Add approval comments
- Approve or reject cases
- View admin's initial review

**Case Visibility**: Cases assigned by Admin

### 3. ADMIN Role
**Access**: AdminDashboard
**Permissions**:
- View all pending cases (Pending status)
- Review case details and notes
- Add review comments
- Assign cases to specific GPs
- View buyer documents
- Cannot download or delete documents

**Case Visibility**: All cases with Pending status

### 4. QA Role
**Access**: QADashboard
**Permissions**:
- View all approved cases (Approved status)
- Review GP's approval decision
- Add mandatory QA comments
- View case documents
- Complete audit process
- Track audit history

**Case Visibility**: All cases with Approved status

## Key Features

### Document Management
- **File Types**: PDF, JPG, PNG
- **Storage**: Base64 encoding in localStorage
- **Operations**: Upload, Download, Delete (buyer-only)
- **Metadata**: Name, size, type, upload date, uploader

### Discussion System
- **Thread Per Case**: Each case has separate discussion
- **Participants**: Buyer + Assigned GP
- **Messages**: Timestamped, author-identified
- **Types**: Text, status updates

### Status Workflow
```
PENDING → ASSIGNED → APPROVED → AUDITED
   ↑          ↑          ↑
 Buyer     Admin        GP        QA
 creates   assigns    approves   audits
```

### Data Storage (localStorage)
- `cases` - Master case records with status
- `caseAssignments` - Admin-to-GP assignment records
- `caseDecisions` - GP approval decisions
- `caseThreads` - Buyer-GP discussions
- `caseReviews` - Admin review comments
- `caseAudits` - QA audit records
- `activities` - Role-specific activity logs

## Component Structure

### Frontend Components
```
App.jsx
├─ Navbar
├─ Login/Register
├─ ProtectedRoute
├─ Dashboard (Buyer) - Case creation, listing, management
├─ CreateCase (Buyer) - New case form with file upload
├─ AdminDashboard - 3-step review & assignment workflow
├─ GPSDashboard - Case approval workflow
└─ QADashboard - Audit review workflow
```

### Styling
- **File**: styles.css (2,800+ lines)
- **Classes**: 80+ semantic CSS classes
- **Responsive**: Mobile-first design with media queries
- **Components**: Dashboard, modals, forms, cards, tabs

## Session Management
- **Login**: Username + role stored in localStorage
- **Session**: Persists across browser sessions
- **Logout**: Clears session data
- **Role**: Determines component visibility and permissions

## Testing Scenarios

### Complete Happy Path
1. Buyer creates case (Case #1)
2. Admin reviews and assigns to GP-1
3. GP-1 reviews and approves
4. QA audits and completes audit
5. Case status: AUDITED

### Multiple Cases
- Buyer can create multiple cases (numbered 1, 2, 3...)
- Admin can assign different cases to different GPs
- GP sees only assigned cases
- QA reviews all approved cases in sequence

### Document Workflow
- Buyer uploads docs when creating case
- Buyer can upload more docs after case creation
- GP can view and download docs (no delete)
- Admin can view docs (no download, no delete)
- QA can view docs (no download, no delete)

## Performance Considerations
- localStorage-based (no server required)
- Efficient filtering for role-based views
- Activity logs limited to 100 records per role
- Cases loaded on-demand on dashboard
- Modal rendering optimized with conditions

## Security & Privacy
- Role-based access control enforced in UI
- GP can only see assigned cases (filtered)
- Admin cannot access buyer-specific documents
- QA sees only approved cases
- Case-level permissions enforced
- File access controlled by uploader role

## Future Enhancements
- Backend API integration
- Database persistence
- Real-time notifications
- Email notifications
- Advanced search/filtering
- Analytics dashboard
- Audit reports export
- Multi-language support
