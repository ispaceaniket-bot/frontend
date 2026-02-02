# Quick Reference Guide

**Created:** January 29, 2026  
**Version:** 1.0

---

## 🚀 Getting Started

### Default Users for Testing

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Buyer | buyer@test.com | password | `/dashboard` |
| Admin | admin@test.com | password | `/admin-dashboard` |
| GP | gp@test.com | password | `/gps-dashboard` |
| QA | qa@test.com | password | `/qa-dashboard` |

### First Time Setup

1. **Start Development Server**
   ```bash
   npm install
   npm run dev
   ```

2. **Login**
   - Go to http://localhost:5173
   - Select role (buyer)
   - Enter credentials
   - Click Login

3. **Create Test Case** (as Buyer)
   - Click "Create New"
   - Enter DOB: 01/15/1990
   - Enter Notes: "Test case for review"
   - Upload a test PDF
   - Click "Create Case"

4. **Assign Case** (as Admin)
   - Go to Admin Dashboard
   - Select case
   - Click "Review Case"
   - Select Specialty: "General"
   - Select GP: "Tom"
   - Set SLA: 5
   - Click "Assign"

5. **Review Case** (as GP)
   - Go to GP Dashboard
   - See "My Assigned Cases"
   - Click case to expand
   - Add comments
   - Click "Submit"

6. **QA Audit** (as QA)
   - Go to QA Dashboard
   - See "Cases Pending Audit"
   - Click case to expand
   - Add QA comments
   - Select "Ready to Go" or "Rework"
   - Click "Submit"

---

## 📱 Dashboard Quick Links

### Buyer Dashboard
- **Create Case**: "➕ Create New" button
- **View Created**: "Created Cases" tab
- **View Assigned**: "Assigned Cases" tab
- **View Approved**: "Approved Cases" tab
- **Case Details**: Click case → View/Upload/Comment

### Admin Dashboard
- **View Stats**: Statistics Grid (6 cards)
- **Filter Cases**: 7 filter tabs
- **Assign Case**: Click case → Review → Assign
- **Set Details**: Specialty, GP, SLA

### GP Dashboard
- **View Stats**: Statistics Grid (4 cards)
- **My Cases**: "My Assigned Cases" card
- **Review**: Click case → Expand
- **Clarify**: "Ask Clarification" button
- **Approve**: Add comments → "Submit"

### QA Dashboard
- **View Stats**: Statistics Grid (5 cards)
- **Audit Cases**: "Cases Pending Audit" section
- **Review**: Click case → Expand
- **Decide**: "Ready to Go ✓" or "Rework ⟳"
- **Comment**: Add QA comments

---

## 🎯 Key Actions Checklist

### Creating a Case (Buyer)
- [ ] Click "Create Case"
- [ ] Enter date of birth
- [ ] Enter case notes
- [ ] Upload documents
- [ ] Click "Create Case"
- [ ] Confirm success notification

### Assigning a Case (Admin)
- [ ] Go to Admin Dashboard
- [ ] Click case
- [ ] Click "Review Case"
- [ ] Select specialty
- [ ] Select GP name
- [ ] Enter SLA (days)
- [ ] Click "Assign"

### Reviewing a Case (GP)
- [ ] Go to GP Dashboard
- [ ] Click case (Pending Review)
- [ ] Review case details
- [ ] (Optional) Request clarification
- [ ] Add approval comments
- [ ] Click "Submit"
- [ ] Verify case shows "Approved" badge

### Auditing a Case (QA)
- [ ] Go to QA Dashboard
- [ ] Click case to expand
- [ ] Review case info
- [ ] Check GP Comments tab
- [ ] Add QA comments (required)
- [ ] Select decision:
  - [ ] "Ready to Go ✓" (green)
  - [ ] "Rework ⟳" (red)
- [ ] Click "Submit"

---

## 🔍 Status Indicators Guide

### Case Status

| Status | Color | Meaning | Who Can See |
|--------|-------|---------|-------------|
| Pending | Gray | Newly created | Buyer, Admin |
| Assigned | Blue | With GP | Buyer, Admin, GP |
| Closed | Green | GP done | All roles |

### QA Status

| Status | Color | Meaning | Final? |
|--------|-------|---------|--------|
| NA | Gray | Not reviewed | No |
| Ready to Go | Green | Approved | Yes ✓ |
| Rework | Red | Needs revision | No |

---

## 📊 Statistics Quick View

### What Each Stat Means

**Admin Dashboard:**
| Stat | Means | Formula |
|------|-------|---------|
| Total Created | All cases | count(all cases) |
| Allotted | Assigned to GP | count(status="Assigned") |
| Closed | GP approved | count(status="Closed") |
| Ready to Go | QA approved | count(qaStatus="Ready to Go") |
| Rework | QA feedback | count(qaStatus="Rework") |
| Approved | All approvals | count(approved \| closed) |

**GP Dashboard (Individual):**
| Stat | Means |
|------|-------|
| Allotted | My total cases |
| Pending | Awaiting my action |
| Approved | I've completed |
| Rework | QA feedback on my work |

**QA Dashboard:**
| Stat | Means |
|------|-------|
| Total | All in system |
| QA Picked | Ready for me |
| Submitted | I've reviewed |
| Rework | Need revision |
| Ready to Go | I approved |

---

## 💾 Data Storage

### What's Stored Where

```
localStorage["cases"]               → All case data
localStorage["caseAssignments"]     → GP assignments
localStorage["caseThreads"]         → Discussion messages
localStorage["activities"]          → User activity log
localStorage["token"]               → Auth token
localStorage["userEmail"]           → Current user email
localStorage["userName"]            → Current user name
localStorage["userRole"]            → Current user role
```

### Clearing Data

```javascript
// Clear everything
localStorage.clear()

// Clear specific
localStorage.removeItem("cases")
localStorage.removeItem("caseThreads")
```

---

## 🚨 Common Issues & Solutions

### Issue: Cases Not Showing
**Solution:** 
- Check user role is correct
- Verify case status matches filter
- Check browser localStorage is enabled
- Try refresh browser

### Issue: Statistics Wrong
**Solution:**
- Page refresh to recalculate
- Check filters are set correctly
- Verify case status values

### Issue: File Upload Failed
**Solution:**
- Check file format (PDF, JPG, PNG only)
- Verify file size < browser limit
- Try drag & drop instead of click
- Check browser console for errors

### Issue: Case Not Visible to QA
**Solution:**
- Verify case status is "Closed"
- Check case was GP approved
- Refresh QA Dashboard
- Verify QA user is logged in

### Issue: Comments Not Showing
**Solution:**
- Check comment has been submitted
- Verify user role can see comments
- Comment tab only shows if comments exist
- Try refresh page

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Go to Dashboard | Alt + D |
| Create Case | Alt + C |
| Search | Alt + F |
| Logout | Alt + L |

(Note: Shortcuts not yet implemented, for future enhancement)

---

## 🎨 Color Reference

### Status Colors
- **Green** (#059669): Ready to Go, Approved, Success
- **Red** (#dc2626): Rework, Error, Attention needed
- **Blue** (#3b82f6): Assigned, In Progress, Action
- **Amber** (#ca8a04): Pending, Awaiting action
- **Gray** (#6b7280): NA, Inactive, Neutral

### Background Colors
- **Light Green** (#f0fdf4): Ready to Go background
- **Light Red** (#fef2f2): Rework background
- **Light Blue** (#f0f9ff): Assigned/Action background
- **Light Amber** (#fefce8): Pending background
- **Light Gray** (#f9fafb): Neutral background

---

## 📋 Form Fields Reference

### Create Case Form
- **Claimant DOB**: MM/DD/YYYY format
- **Description**: Free text, required
- **Documents**: PDF, JPG, PNG only

### GP Assignment Form
- **Specialty**: Dropdown (6 options)
- **GP Name**: Dropdown (6 GPs)
- **SLA**: Numeric (days)

### Review Forms
- **Comments**: Free text (required)
- **Decision**: Button selection (required)

---

## 🔄 Workflow Summary

```
Buyer Creates Case
        ↓
Admin Assigns to GP
        ↓
GP Reviews & Approves
        ↓
QA Audits & Decides
        ↓
Case Complete (Ready to Go or Rework)
```

**Total Timeline:** 5-9 days

---

## 📞 Contact & Support

For issues or questions:
1. Check this quick reference
2. Review SYSTEM_OVERVIEW.md for detailed info
3. Check COMPONENTS.md for component details
4. Review FEATURES_WORKFLOW.md for workflows

---

## ✅ Testing Checklist

- [ ] Can create case as buyer
- [ ] Can upload documents
- [ ] Can view case details
- [ ] Admin can filter cases
- [ ] Admin can assign to GP
- [ ] GP can see assigned case
- [ ] GP can add clarification
- [ ] GP can approve case
- [ ] QA can see approved case
- [ ] QA can submit review
- [ ] Statistics update correctly
- [ ] Comments tabs appear correctly
- [ ] Discussion thread works
- [ ] Logout and re-login works
- [ ] Different roles see correct data

---

**Last Updated:** January 29, 2026  
**Version:** 1.0  
**Status:** Complete
