# Medical CRM - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Application will be available at: `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

## Login Credentials (for testing)

### Buyer Role
- **Username**: buyer1
- **Role**: Buyer
- **Features**: Create cases, upload documents, manage own cases

### Admin Role
- **Username**: admin1
- **Role**: Admin
- **Features**: Review pending cases, assign to GPs

### GP Role
- **Username**: gp1 (or any GP username)
- **Role**: GP
- **Features**: Review assigned cases, approve/deny

### QA Role ← NEW
- **Username**: qa1 (or any QA username)
- **Role**: QA
- **Features**: Audit approved cases, add compliance comments

**Note:** You can use any username with the role you want. The system will auto-assign the role based on your selection.

## Workflow Demo (5 minutes)

### Step 1: Create a Case (2 min)
1. Login as **buyer1** (Buyer)
2. Click "Create Case"
3. Fill in the form:
   - Date of Birth: Any date
   - Notes: "Sample case for demo"
4. Click "Upload Document" and select a PDF/JPG/PNG file
5. Click "Submit Case"
6. You'll see: "Case #1 created successfully"

### Step 2: Review & Assign (1 min)
1. Open new tab, login as **admin1** (Admin)
2. Click "Admin Dashboard"
3. Find "Case #1" in "Cases Pending Review"
4. Click to review
5. Add comments: "Looks good"
6. Click "Approve Review"
7. Select a GP from dropdown (e.g., "gp1")
8. Click "Assign to GP"
9. You'll see: "Case assigned successfully"

### Step 3: Approve (1 min)
1. Open new tab, login as **gp1** (GP)
2. Click "GP Dashboard"
3. Find "Case #1" in your assigned cases
4. Click to review
5. Add approval comments: "Approved"
6. Click "Approve Case"
7. You'll see: "Case approved successfully"

### Step 4: Audit (1 min) ← NEW
1. Open new tab, login as **qa1** (QA)
2. Click "QA Dashboard"
3. Find "Case #1" in "Cases Pending Audit"
4. Click "Audit Case"
5. Add QA comments: "Audit passed"
6. Click "Continue to Review"
7. Click "Submit Audit"
8. You'll see: "Audit for Case #1 submitted successfully"
9. Case moves to "Completed Audits" section

## Key Features Overview

### 📋 Buyer Dashboard
- **Create Cases**: Submit medical cases with documentation
- **Upload Documents**: Add PDF, JPG, PNG files
- **Track Cases**: View in Created/Assigned/Approved tabs
- **Discuss**: Chat with assigned GPs
- **Download/Delete**: Manage uploaded documents

### 🔍 Admin Dashboard
- **3-Step Workflow**: List → Review → Assign
- **Review Cases**: Add comments on pending cases
- **Assign GPs**: Allocate cases to specific GPs
- **View Documents**: Access case files (read-only)

### ✓ GP Dashboard
- **Assigned Cases**: View only cases assigned to you
- **Review Details**: See case notes and buyer documents
- **Approve/Deny**: Make final decision with mandatory comments
- **Participate**: Discuss with buyer in case thread

### 🎯 QA Dashboard (NEW)
- **Audit Cases**: Review approved cases
- **Mandatory Comments**: Add compliance feedback
- **2-Step Process**: Review → Confirm → Submit
- **Track Audits**: View completed audit history

## Case Status Flow

```
Created (Buyer)
    ↓
Pending (waiting for admin review)
    ↓
Assigned (admin assigned to GP)
    ↓
Approved (GP approved)
    ↓
Audited (QA audited) ← NEW
```

## Document Management

### Supported File Types
- PDF (.pdf)
- Images (.jpg, .jpeg, .png)

### Upload Locations
1. **Case Creation**: Upload when creating new case
2. **Case Details**: Upload additional documents anytime

### Permissions
- **Buyer**: Can view, download, and delete own documents
- **Admin**: Can view documents (no download/delete)
- **GP**: Can view and download documents
- **QA**: Can view documents

## Discussion Thread

- Buyers and assigned GPs can exchange messages
- Each case has separate discussion thread
- Messages timestamped and author-identified
- Available throughout entire case lifecycle

## Activity Tracking

- Each role tracks its own activities
- Last 50 activities stored per role
- Timestamps show: "just now", "5m ago", "2h ago"
- Includes: case creation, assignments, approvals, audits

## localStorage Data

The application uses browser localStorage for all data. This means:

### ✓ Advantages
- No server required
- Instant data persistence
- Works offline
- No network latency

### ⚠️ Limitations
- ~5-10MB storage limit
- Clears if browser data is cleared
- Single browser only (not synced across devices)

### Reset Data
To start fresh:
```javascript
// Open Developer Tools (F12)
// Console tab:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Troubleshooting

### Cases Not Appearing
1. Make sure you're in the correct role's dashboard
2. Check case status matches your role:
   - Buyer sees: own cases
   - Admin sees: Pending cases
   - GP sees: assigned to them
   - QA sees: Approved cases
3. Clear localStorage and try again

### Can't Upload Documents
1. Check file is PDF, JPG, or PNG (not other formats)
2. Check file size (typically <10MB)
3. Try uploading in a different browser

### Role/Username Not Recognized
1. Any username works - just enter username and select role
2. First time login auto-creates that user
3. Use same username and role to maintain data

### Notification Not Appearing
1. Check browser hasn't disabled notifications
2. Check top-right corner of screen
3. Notification auto-dismisses after 3 seconds
4. Check browser console for errors

## Features by Role

### Buyer
- ✓ Create cases
- ✓ Upload documents  
- ✓ Download documents
- ✓ Delete own documents
- ✓ View case status
- ✓ Chat with GP
- ✓ View GP comments

### Admin
- ✓ View all pending cases
- ✓ Add review comments
- ✓ Assign to specific GP
- ✓ View case documents
- ✗ Cannot approve/deny cases

### GP
- ✓ View assigned cases only
- ✓ View case documents
- ✓ Download documents
- ✓ Add approval comments
- ✓ Approve/deny cases
- ✓ Chat with buyer
- ✗ Cannot see other GPs' cases

### QA
- ✓ View approved cases
- ✓ Add audit comments (mandatory)
- ✓ View all case information
- ✓ Submit audits
- ✓ Track audit history
- ✓ View case documents
- ✗ Cannot download documents
- ✗ Cannot approve cases

## Testing Tips

### Create Multiple Cases
1. Switch to Buyer role (new tab)
2. Create Case #1, #2, #3
3. Then run through workflow for each

### Test Different GPs
1. Create cases and assign to gp1, gp2, gp3
2. Login as each GP separately
3. Verify each sees only their assigned cases

### Test Concurrent Access
1. Open multiple browser tabs with different roles
2. Create case in Buyer tab
3. Assign in Admin tab
4. Approve in GP tab
5. Audit in QA tab
6. Refresh each tab to verify data consistency

### Test on Mobile
1. Right-click → "Inspect" in browser
2. Click device toolbar (mobile icon)
3. Select device (e.g., iPhone 14)
4. Verify layout responsive

## Performance Notes

- Application runs entirely in browser (no server)
- Very fast - no network latency
- Scales to ~100+ cases before noticeable slowdown
- Activity logs auto-limited to prevent bloat

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge 2022+)
- JavaScript enabled
- localStorage enabled
- Cookie support
- 50MB+ available disk space for localStorage

## Next Steps

After familiarizing yourself with the workflow:

1. **Test Complete Workflow**: Create case → Assign → Approve → Audit
2. **Test Document Management**: Upload, download, delete documents
3. **Test Discussion**: Exchange messages between buyer and GP
4. **Test Validation**: Try submitting empty fields, invalid data
5. **Test Mobile**: Resize browser and verify responsive design
6. **Test Data Persistence**: Refresh page, close browser, reopen

## Support

For issues or questions:
1. Check browser console (F12) for errors
2. Clear localStorage and try again
3. Try different browser
4. Check file sizes and formats
5. Review troubleshooting section above
