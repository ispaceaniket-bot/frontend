# QA Dashboard - Testing Guide

## Setup Instructions

### 1. Clear Previous Data
Before testing QA features, clear localStorage to start fresh:

```javascript
// Open browser Developer Tools (F12)
// Go to Console tab and paste:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 2. Create Test Data
The workflow requires data at specific statuses:

1. **Create a Case (Buyer Role)**
   - Login as: Buyer
   - Go to "Create Case"
   - Fill form with:
     - DOB: Any date
     - Notes: "Test case for QA audit"
   - Upload a sample PDF/JPG/PNG
   - Submit (Case #1 created, Status: PENDING)

2. **Assign Case (Admin Role)**
   - Login as: Admin
   - Go to "Admin Dashboard"
   - Find Case #1 in review list
   - Click to review case
   - Add comments: "Case looks good, assigning to GP-1"
   - Click "Approve & Continue"
   - Select GP from dropdown (e.g., "GP-1")
   - Set SLA and click "Assign"
   - Case now: Status ASSIGNED

3. **Approve Case (GP Role)**
   - Login as: GP-1 (username from assignment)
   - Go to "GP Dashboard"
   - Find Case #1 in assigned cases
   - Review case details
   - Add approval comments: "Approved - case meets standards"
   - Click "Approve Case"
   - Case now: Status APPROVED ✓

4. **Audit Case (QA Role)** ← NEW WORKFLOW
   - Login as: Any QA user
   - Go to "QA Dashboard"
   - Click "Review Cases (1)" button or see case in "Cases Pending Audit" section

## QA Dashboard Testing Scenarios

### Scenario 1: Complete Audit Workflow

**Steps:**
1. In QA Dashboard, click "Audit Case" button or case item
2. Modal opens - "Audit Case" step appears

**Verify Step 1 (Audit Case Review):**
- ✓ Title shows "Audit Case"
- ✓ Left side shows:
  - Case #1
  - Date (today's date)
  - Case Notes: "Test case for QA audit"
  - GP Comments: "Approved - case meets standards"
- ✓ Right side shows:
  - "QA Comments (Required) *" heading
  - Empty textarea with placeholder text
  - "Continue to Review" button

**Add QA Comments:**
1. Click in textarea
2. Type: "Audit passed - all compliance checks completed"
3. Click "Continue to Review" button

**Verify Step 2 (Audit Completed):**
- ✓ Title changes to "Audit Completed"
- ✓ Left side still shows case info and GP comments
- ✓ Right side shows:
  - QA Comments (read-only): "Audit passed - all compliance checks completed"
  - Green "Submit Audit" button
  - Gray "Back to Edit" button

**Submit Audit:**
1. Click "Submit Audit" button
2. Notification appears: "Audit for Case #1 submitted successfully"
3. Modal closes after 2 seconds

**Verify Audit Completed:**
1. Return to QA Dashboard
2. "Cases Pending Audit" section should be empty
3. "Completed Audits" section shows:
   - Case #1
   - Audited by: [QA User]
   - Timestamp: just now
   - Status: ✓ Completed

### Scenario 2: Validation - Empty Comments

**Steps:**
1. Open audit case again for another case
2. Without typing in QA Comments, click "Continue to Review"

**Verify:**
- ✓ Error notification: "QA Comments are mandatory"
- ✓ Modal stays open at "Audit Case" step
- ✓ Notification auto-dismisses after 3 seconds

**Try Step 2:**
1. Add some comments: "Test"
2. Click "Continue to Review"
3. Go to "Audit Completed" step
4. Click "Back to Edit" button

**Verify:**
- ✓ Returns to Step 1 (Audit Case Review)
- ✓ Comments still there: "Test"
- ✓ Can edit again if needed

### Scenario 3: Multiple Cases

**Setup:**
1. Create 3 test cases (Case #2, #3, #4) using same workflow
2. Assign all to GPs and approve

**In QA Dashboard:**
1. "Cases Pending Audit" shows all 3 cases
2. Stats show: "Cases Under Review: 3"
3. Click any case to audit

**Audit Each:**
1. Audit Case #2 with different comments
2. Audit Case #3 with different comments
3. Audit Case #4 with different comments

**Verify:**
- ✓ After each audit, case moves to "Completed Audits"
- ✓ Stats update: "Cases Under Review" decreases, "Audits Completed" increases
- ✓ Activity log shows: "Audited Case #2", "Audited Case #3", "Audited Case #4"

### Scenario 4: Case Status Updates

**Verify Case Status Changes:**
1. Before audit: Case #1 status = "Approved"
2. After audit submission: Case #1 status = "Audited"

**Check In Dashboard (Buyer Role):**
1. Login as Buyer who created case
2. Go to Dashboard
3. Click "Approved" tab
4. Case #1 should show there (status shown as Audited)

### Scenario 5: Profile Management

**Edit QA Profile:**
1. In QA Dashboard, click pencil icon (✎) in QA Profile card
2. Change name from current to "QA Auditor 1"
3. Click "Save" button

**Verify:**
- ✓ Name updates immediately
- ✓ Notification: "Profile updated successfully"
- ✓ Activity log shows: "Profile updated - Name changed to 'QA Auditor 1'"
- ✓ Profile avatar letter changes to "Q"

**Cancel Edit:**
1. Click edit again
2. Change name
3. Click "Cancel" button
4. Name reverts to previous

### Scenario 6: Activity Tracking

**Verify Activity Logging:**
1. Perform several audits
2. Edit profile
3. Check "Recent Activity" section (bottom of dashboard)

**Verify:**
- ✓ Shows last 5 activities
- ✓ Timestamps display: "just now", "2m ago", etc.
- ✓ Format: "Audited Case #X"
- ✓ Latest activities appear first

## UI/UX Verification Checklist

### Modal Design
- [ ] Modal has close button (✕) in top right
- [ ] Clicking outside modal doesn't close (click on modal itself test)
- [ ] Clicking close button closes modal
- [ ] Grid layout 2-column on desktop
- [ ] Grid layout 1-column on mobile (< 768px)

### Case Information Display
- [ ] Case details box has background color (#f9fafb)
- [ ] Labels are smaller gray text
- [ ] Case name/date are bold and larger
- [ ] Case notes display with proper formatting
- [ ] GP comments display with proper formatting

### Textarea Styling
- [ ] Textarea has border
- [ ] Placeholder text visible when empty
- [ ] Text wraps properly
- [ ] Resizable (drag bottom-right corner)
- [ ] Min height is appropriate (120px)

### Buttons
- [ ] Primary button (blue) on action
- [ ] Secondary button (gray) for cancel/back
- [ ] Green button for submit success action
- [ ] Buttons full width in mobile
- [ ] Hover effects on buttons

### Notifications
- [ ] Appears top-right of screen
- [ ] Success notification (green) with ✓
- [ ] Error notification (red) with ✗
- [ ] Slides in from right
- [ ] Auto-dismisses after 3 seconds

### Stats Grid
- [ ] Shows 4 stats cards
- [ ] Stats update with real numbers
- [ ] "Cases Under Review" shows audit case count
- [ ] "Audits Completed" shows completed audit count

### Lists
- [ ] "Cases Pending Audit" shows only non-audited approved cases
- [ ] Each case item has case number, GP, notes
- [ ] "Completed Audits" shows only audited cases
- [ ] Each audit shows case number, auditor, timestamp, status badge

## Responsive Design Testing

### Desktop (> 768px)
1. Open QA Dashboard on full screen
2. Verify:
   - [ ] 2-column grid layout
   - [ ] Stats grid shows 4 columns
   - [ ] Modal content properly spaced
   - [ ] Buttons appropriately sized

### Tablet (768px)
1. Resize browser to 768px width
2. Verify layout transitions smoothly
3. Check all elements fit without overflow

### Mobile (< 768px)
1. Resize browser to 375px width
2. Verify:
   - [ ] 1-column grid layout
   - [ ] Full-width buttons
   - [ ] Text readable without zoom
   - [ ] Modal fits on screen
   - [ ] No horizontal scrolling

## Edge Cases Testing

### No Approved Cases
1. Start fresh with no cases
2. Login as QA
3. Go to QA Dashboard

**Verify:**
- [ ] "Cases Pending Audit" section doesn't show
- [ ] Stats show "Cases Under Review: 0"
- [ ] "Completed Audits" section doesn't show
- [ ] "Review Cases (0)" button disabled/grayed

### Mixed Case Statuses
1. Have cases at different statuses: Pending, Assigned, Approved
2. Login as QA

**Verify:**
- [ ] Only Approved cases appear for audit
- [ ] Pending/Assigned cases hidden

### Rapid Successive Audits
1. Audit Case #1 and close modal
2. Immediately click Case #2 to audit
3. Complete audit quickly

**Verify:**
- [ ] No data conflicts
- [ ] Each audit saves separately
- [ ] Stats update correctly
- [ ] Activity log shows all audits

### Browser Back Button
1. Audit a case, submit
2. Notification shows, modal closing
3. Press browser back button during close

**Verify:**
- [ ] Page doesn't navigate away
- [ ] Modal properly closed
- [ ] Dashboard fully functional

## Data Persistence Testing

### Refresh Page During Audit
1. Open audit case
2. Add comments
3. Press F5 (refresh page)

**Verify:**
- [ ] Modal closes
- [ ] Case still appears in pending list (comments not lost automatically)
- [ ] Can open case again

### Complete Audit and Refresh
1. Audit a case and click "Submit Audit"
2. After notification, press F5 (refresh)

**Verify:**
- [ ] Case appears in "Completed Audits" after refresh
- [ ] Audit record persisted to localStorage
- [ ] Activity log shows audit

### Close Browser and Reopen
1. Audit cases, create activity
2. Close browser tab
3. Reopen application

**Verify:**
- [ ] All audit records still there
- [ ] Activity history still visible
- [ ] Case statuses correct (Audited, Approved, etc.)

## Performance Testing

### Many Cases
1. Create 20+ test cases and audit several
2. Verify:
   - [ ] Dashboard loads quickly
   - [ ] Scrolling smooth
   - [ ] No lag when opening modal
   - [ ] Audit submission responsive

### Activity Log
1. Perform 50+ activities
2. Check "Recent Activity" shows only last 5
3. Verify localStorage doesn't bloat

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Android)

## Final Sign-off Checklist

- [ ] Approved cases display correctly
- [ ] Audit case modal opens and closes properly
- [ ] Step 1: Case review with comments textarea works
- [ ] Step 2: Audit completed review works
- [ ] "Continue to Review" validates mandatory comments
- [ ] "Submit Audit" saves record and updates case status
- [ ] Notification system works (success/error)
- [ ] Case moves from pending to completed list
- [ ] Stats update in real-time
- [ ] Activity log tracks audits
- [ ] Profile edit works
- [ ] Responsive design works on all breakpoints
- [ ] Data persists across page refreshes
- [ ] Case statuses propagate correctly

## Troubleshooting

### Cases Not Appearing in QA Dashboard
**Solution:**
1. Check case status is "Approved" (not "Assigned")
2. Verify case hasn't been audited already
3. Clear localStorage: `localStorage.clear()`
4. Create new test case through full workflow

### Modal Not Opening
**Solution:**
1. Check case exists in auditCases array
2. Verify case.id is valid
3. Check browser console for errors
4. Reload page

### Comments Not Saving
**Solution:**
1. Check validation error appears
2. Ensure minimum characters entered
3. Check localStorage size not exceeded
4. Try different browser

### Stats Not Updating
**Solution:**
1. Refresh page
2. Check localStorage data
3. Verify audit completed successfully
4. Check browser console for errors
