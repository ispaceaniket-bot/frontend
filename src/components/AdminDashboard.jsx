import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { adminCases, adminGPs, getDocuments, assignGP, getCurrentUser } from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("admin@example.com");
  const [userRole, setUserRole] = useState("Admin");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(userName);
  const [activities, setActivities] = useState([]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  
  // Case review and GP assignment state
  const [pendingCases, setPendingCases] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [reviewStep, setReviewStep] = useState("list"); // "list", "review", or "assign"
  const [reviewComments, setReviewComments] = useState("");
  const [caseSpecialty, setCaseSpecialty] = useState("");
  const [assignedGP, setAssignedGP] = useState("");
  const [caseSLA, setCaseSLA] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, created, allotted, closed, approved, rework, readyToGo
  const [caseStats, setCaseStats] = useState({
    totalCreated: 0,
    allotted: 0,
    closed: 0,
    approved: 0,
    rework: 0,
    readyToGo: 0,
  });
  const [gpList, setGpList] = useState([]);

  const specialties = ["General", "Cardiology", "Radiology", "Orthopedics", "Neurology", "Dermatology"];
  
  const roleDescription = "Full system administration";

  useEffect(() => {
    // Load user data, activities, ensure we load GP list first so we can map GP names onto cases
    const init = async () => {
      await loadUserData();
      loadActivities();
      await loadGPs();
      await loadPendingCases();
    };
    init();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setUserName(user.full_name || user.username || "Admin");
      setUserEmail(user.email || "admin@example.com");
      setUserRole(user.role || "Admin");
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  const loadGPs = async () => {
    try {
      const gps = await adminGPs();
      setGpList(gps);
    } catch (err) {
      console.error("Failed to load GPs:", err);
    }
  };

  const loadActivities = () => {
    // Activities are now stored in component state only
    // In the future, this could be fetched from a backend API endpoint
    setActivities([]);
  };

  const loadPendingCases = async () => {
    try {
      // Fetch all cases from backend
      const casesData = await adminCases();
      
      // Map to the format expected by the component
      const normalizeStatus = (raw) => {
        if (!raw) return "Unknown";
        const s = String(raw).toLowerCase();
        if (s === "completed") return "Closed";
        if (s === "qa_pending") return "QA Pending";
        // convert snake_case or lowercase to Title Case
        return s.split(/[_\s]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      };

      const cases = casesData.map((caseItem) => {
        const gp = gpList.find(g => g.id === caseItem.assigned_gp_id);
        const assignedGPName = gp ? gp.username : (caseItem.assigned_gp_id ? `GP #${caseItem.assigned_gp_id}` : null);
        return {
          id: caseItem.id,
          name: `Case #${caseItem.id}`,
          uploadedAt: caseItem.created_at,
          createdBy: "Claimant", // Will fetch from user details if needed
          createdByEmail: caseItem.claimant_id,
          dateOfBirth: caseItem.date_of_birth,
          notes: caseItem.description,
          size: 0,
          status: normalizeStatus(caseItem.status),
          qaStatus: caseItem.qa_feedback || "NA",
          hasAllDocuments: true,
          isAllotted: !!caseItem.assigned_gp_id,
          assignedGP: assignedGPName,
        };
      });
      
      setPendingCases(cases);
      setAllCases(cases);
      
      // Calculate statistics based on backend status and QA feedback
      const stats = {
        totalCreated: casesData.length,
        allotted: cases.filter(c => c.isAllotted).length,
        closed: cases.filter(c => c.status === "Closed").length,
        approved: cases.filter(c => c.status === "Closed").length,
        // rework: cases where status is RETURNED (QA rejected)
        rework: cases.filter(c => c.status === "Returned").length,
        // readyToGo: cases where status is COMPLETED (QA approved)
        readyToGo: cases.filter(c => c.status === "Completed").length,
      };
      setCaseStats(stats);
    } catch (err) {
      console.error("Failed to load cases:", err);
      setAllCases([]);
      setPendingCases([]);
    }
  };

  const addActivity = (description) => {
    const newActivity = {
      id: Date.now(),
      description,
      timestamp: new Date().toISOString(),
      userRole: userRole,
    };
    
    // Store activities in component state only
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  };

  const handleSaveProfile = () => {
    if (editedName !== userName) {
      addActivity(`Profile updated - Name changed to "${editedName}"`);
    }
    setUserName(editedName);
    setIsEditingProfile(false);
    // In the future, this could save to backend API
  };

  const handleSelectCase = async (caseItem) => {
    setSelectedCase(caseItem);
    setReviewStep("review");
    setReviewComments("");
    setCaseSpecialty("");
    setAssignedGP("");
    setCaseSLA("");
    
    // Fetch documents from backend
    try {
      const docs = await getDocuments(caseItem.id);
      // Update selectedCase with documents
      setSelectedCase(prev => ({
        ...prev,
        files: docs.map(doc => ({
          id: doc.id,
          name: doc.filename,
          uploadedAt: doc.uploaded_at,
          size: 0,
        }))
      }));
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const handleApproveReview = () => {
    if (!reviewComments.trim()) {
      setNotification({
        show: true,
        message: "⚠️ Please add review comments",
        type: "error",
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "error" }), 4000);
      return;
    }

    // Review is now stored in component state and activity log
    // In the future, this could be saved to a backend API endpoint
    addActivity(`Reviewed case: ${selectedCase.name} - Approved`);

    // Move to assignment step
    setReviewStep("assign");
    setReviewComments("");
  };

  const handleRejectReview = () => {
    if (!reviewComments.trim()) {
      setNotification({
        show: true,
        message: "⚠️ Please add rejection reason",
        type: "error",
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "error" }), 4000);
      return;
    }

    // Review is now stored in component state and activity log
    // In the future, this could be saved to a backend API endpoint
    addActivity(`Reviewed case: ${selectedCase.name} - Rejected`);

    // Remove from pending and show notification
    setPendingCases(pendingCases.filter(c => c.id !== selectedCase.id));
    setSelectedCase(null);
    setReviewStep("list");
    
    setNotification({
      show: true,
      message: `✗ Case rejected and removed from queue`,
      type: "error",
    });
    setTimeout(() => setNotification({ show: false, message: "", type: "error" }), 4000);
  };

  const handleBackToReview = () => {
    setReviewStep("review");
    setCaseSpecialty("");
    setAssignedGP("");
    setCaseSLA("");
  };

  const handleBackToList = () => {
    setSelectedCase(null);
    setReviewStep("list");
    setReviewComments("");
    setCaseSpecialty("");
    setAssignedGP("");
    setCaseSLA("");
  };

  const handleAssignCase = async () => {
    if (!selectedCase || !caseSpecialty || !assignedGP || !caseSLA) {
      alert("Please fill all assignment fields");
      return;
    }

    try {
      // Call backend API to assign GP
      await assignGP(selectedCase.id, {
        gp_id: parseInt(assignedGP),
        specialty: caseSpecialty,
        sla_deadline: new Date(Date.now() + parseInt(caseSLA) * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Remove from pending and refresh
      setPendingCases(pendingCases.filter(c => c.id !== selectedCase.id));
      setSelectedCase(null);
      setReviewStep("list");
      loadPendingCases();

      alert(`✓ Case assigned to GP`);
    } catch (err) {
      console.error("Assignment error:", err);
      alert(`❌ Failed to assign case: ${err.message}`);
    }
  };


  const getFilteredCases = () => {
    switch (statusFilter) {
      case "created":
        return allCases.filter(c => c.status === "Pending" && !c.isAllotted);
      case "allotted":
        // Show any case that has been assigned to a GP in the Allotted tab
        return allCases.filter(c => c.isAllotted);
      case "closed":
        return allCases.filter(c => c.status === "Closed");
      case "approved":
        return allCases.filter(c => c.status === "Approved" || c.status === "Closed");
      case "rework":
        // Cases where QA returned them (status = RETURNED)
        return allCases.filter(c => c.status === "Returned");
      case "readyToGo":
        // Cases where QA approved them (status = COMPLETED)
        return allCases.filter(c => c.status === "Completed");
      default:
        return allCases;
    }
  };

  const handleDownloadDocument = async (file, caseId) => {
    try {
      const response = await fetch(`https://backend-2e54.onrender.com/cases/${caseId}/download/${file.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download document");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename || file.name || `document-${file.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert(`Failed to download document: ${err.message}`);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const seconds = Math.floor((now - time) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <>
      <Navbar />
      <div className="dashboard">
        {notification.show && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}
        <h1>Home 🛡️</h1>
        <p className="subtitle">{userRole} — {roleDescription}</p>

        {/* Statistics Grid */}
        <div className="stats-grid-responsive">
          <div className="stat-card-modern">
            <div className="stat-label">Total Cases Created</div>
            <div className="stat-value">{caseStats.totalCreated}</div>
            <div className="stat-subtitle" style={{ color: "#10b981" }}>📊 All cases</div>
          </div>
          
          <div className="stat-card-modern stat-card-blue">
            <div className="stat-label">Allotted to GPs</div>
            <div className="stat-value stat-value-blue">{caseStats.allotted}</div>
            <div className="stat-subtitle stat-subtitle-blue">👥 Assigned</div>
          </div>
          
          <div className="stat-card-modern">
            <div className="stat-label">Closed Cases</div>
            <div className="stat-value" style={{ color: "#dc2626" }}>{caseStats.closed}</div>
            <div className="stat-subtitle" style={{ color: "#dc2626" }}>🔐 Completed</div>
          </div>
          
          <div className="stat-card-modern stat-card-green">
            <div className="stat-label">Ready to Go</div>
            <div className="stat-value stat-value-green">{caseStats.readyToGo}</div>
            <div className="stat-subtitle stat-subtitle-green">✓ QA Approved</div>
          </div>
          
          <div className="stat-card-modern stat-card-yellow">
            <div className="stat-label">Rework Required</div>
            <div className="stat-value stat-value-yellow">{caseStats.rework}</div>
            <div className="stat-subtitle stat-subtitle-yellow">⟳ Needs Review</div>
          </div>
          
          <div className="stat-card-modern stat-card-indigo">
            <div className="stat-label">Approved/Processed</div>
            <div className="stat-value stat-value-indigo">{caseStats.approved}</div>
            <div className="stat-subtitle stat-subtitle-indigo">📋 GP Approved</div>
          </div>
        </div>

        <div>
          {/* <div className="card">
            <div className="card-header">
              <h3>Admin Profile</h3>
              <button
                className="edit-btn"
                onClick={() => setIsEditingProfile(true)}
                title="Edit profile"
              >
                ✎
              </button>
            </div>

            {isEditingProfile ? (
              <div className="edit-profile-form">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="edit-input"
                  placeholder="Enter name"
                />
                <div className="edit-actions" style={{display: "flex", gap: "10px", justifyContent: "flex-end"}}>
                  <button
                    className="btn-save"
                    onClick={handleSaveProfile}
                    style={{padding: "8px 16px", fontSize: "13px", fontWeight: "500", borderRadius: "6px"}}
                  >
                    Save
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setEditedName(userName);
                      setIsEditingProfile(false);
                    }}
                    style={{padding: "8px 16px", fontSize: "13px", fontWeight: "500", borderRadius: "6px"}}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="profile-avatar">{editedName.charAt(0).toUpperCase()}</div>
                <div>
                  <p><strong>{editedName}</strong></p>
                  <p>{userEmail}</p>
                  <span className="role-tag">{userRole}</span>
                </div>
              </div>
            )}
            <p className="muted">Admin since January 27, 2026</p>
          </div> */}

          {/* <div className="card gradient">
            <h3>Admin Controls</h3>
            <div className="actions-grid">
              <button
                className="action-card"
                onClick={() => navigate("/uploaded-documents")}
                title="Review Documents"
              >
                <span className="action-icon">📋</span>
                <span>Review Documents</span>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/reports")}
                title="View All Reports"
              >
                <span className="action-icon">📊</span>
                <span>All Reports</span>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/qa-reports")}
                title="QA Oversight"
              >
                <span className="action-icon">✓</span>
                <span>QA Oversight</span>
              </button>
              <button
                className="action-card"
                onClick={() => alert("User management coming soon")}
                title="Manage Users"
              >
                <span className="action-icon">👥</span>
                <span>Manage Users</span>
              </button>
            </div>
          </div> */}
        </div>

        {/* Home—Case List Section */}
        <div className="card">
          <div className="card-header">
            <h3>Home — Case Management</h3>
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "15px", paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
            <button
              onClick={() => setStatusFilter("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: statusFilter === "all" ? "#1f2937" : "#f3f4f6",
                color: statusFilter === "all" ? "white" : "#6b7280",
                cursor: "pointer",
                fontWeight: statusFilter === "all" ? "bold" : "normal",
              }}
            >
              All Cases ({allCases.length})
            </button>
            <button
              onClick={() => setStatusFilter("created")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: statusFilter === "created" ? "#f59e0b" : "#fef3c7",
                color: statusFilter === "created" ? "white" : "#92400e",
                cursor: "pointer",
                fontWeight: statusFilter === "created" ? "bold" : "normal",
              }}
            >
              Created ({allCases.filter(c => c.status === "Pending" && !c.isAllotted).length})
            </button>
            <button
              onClick={() => setStatusFilter("allotted")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: statusFilter === "allotted" ? "#3b82f6" : "#dbeafe",
                color: statusFilter === "allotted" ? "white" : "#1e40af",
                cursor: "pointer",
                fontWeight: statusFilter === "allotted" ? "bold" : "normal",
              }}
            >
              Allotted ({allCases.filter(c => c.isAllotted && c.status === "Assigned").length})
            </button>
            <button
              onClick={() => setStatusFilter("closed")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: statusFilter === "closed" ? "#dc2626" : "#fee2e2",
                color: statusFilter === "closed" ? "white" : "#7f1d1d",
                cursor: "pointer",
                fontWeight: statusFilter === "closed" ? "bold" : "normal",
              }}
            >
              Closed ({allCases.filter(c => c.status === "Closed").length})
            </button>
            <button
              onClick={() => setStatusFilter("readyToGo")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: statusFilter === "readyToGo" ? "#059669" : "#d1fae5",
                color: statusFilter === "readyToGo" ? "white" : "#065f46",
                cursor: "pointer",
                fontWeight: statusFilter === "readyToGo" ? "bold" : "normal",
              }}
            >
              Ready to Go ({allCases.filter(c => c.qaStatus === "Ready to Go").length})
            </button>
            <button
              onClick={() => setStatusFilter("rework")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: statusFilter === "rework" ? "#ca8a04" : "#fef08a",
                color: statusFilter === "rework" ? "white" : "#78350f",
                cursor: "pointer",
                fontWeight: statusFilter === "rework" ? "bold" : "normal",
              }}
            >
              Rework ({allCases.filter(c => c.qaStatus === "Rework").length})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: statusFilter === "approved" ? "#4f46e5" : "#f0f4ff",
                color: statusFilter === "approved" ? "white" : "#3730a3",
                cursor: "pointer",
                fontWeight: statusFilter === "approved" ? "bold" : "normal",
              }}
            >
              Approved ({allCases.filter(c => c.status === "Approved" || c.status === "Closed").length})
            </button>
          </div>

          {reviewStep === "list" && (
            <div className="case-management-grid">
              {/* Case List */}
              <div>
                <div className="pending-review-section">
                  {statusFilter === "all" ? "All Cases" : 
                   statusFilter === "created" ? "Created Cases" :
                   statusFilter === "allotted" ? "Allotted Cases" :
                   statusFilter === "closed" ? "Closed Cases" :
                   statusFilter === "readyToGo" ? "Ready to Go" :
                   statusFilter === "rework" ? "Rework Required" :
                   "Approved Cases"}
                </div>
                {getFilteredCases().length === 0 ? (
                  <p className="muted">No cases in this category</p>
                ) : (
                  <div className="case-list-container">
                    {getFilteredCases().map((caseItem) => (
                      <div
                        key={caseItem.id}
                        onClick={() => handleSelectCase(caseItem)}
                        className={selectedCase?.id === caseItem.id ? "case-list-item selected" : "case-list-item"}
                      >
                        <div className="case-list-item-name">{caseItem.name}</div>
                        <div className="case-list-item-meta">By: {caseItem.createdBy}</div>
                        <div className="case-list-item-meta">Status: {caseItem.status} | QA: {caseItem.qaStatus}</div>
                        {caseItem.assignedGP && <div className="case-list-item-meta">GP: {caseItem.assignedGP}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Panel */}
              <div>
                {selectedCase ? (
                  <div className="case-info-panel">
                    <div className="case-summary-card">
                      <div className="case-summary-label">Case Summary</div>
                      <div className="case-summary-title">{selectedCase.name}</div>
                      <div className="case-summary-details">
                        <p><strong>Submitted By:</strong> {selectedCase.createdBy}</p>
                        <p><strong>Date of Birth:</strong> {selectedCase.dateOfBirth}</p>
                        <p><strong>Files:</strong> Multiple documents</p>
                      </div>
                    </div>
                    <p className="case-info-text">Click "Review Case" to proceed with case evaluation.</p>
                    <button
                      onClick={() => handleSelectCase(selectedCase)}
                      className="btn-review-case"
                    >
                      📋 Review Case
                    </button>
                  </div>
                ) : (
                  <p className="muted">Select a case to view details</p>
                )}
              </div>
            </div>
          )}

          {reviewStep === "review" && selectedCase && (
            <div className="review-container">
              {/* Case Review Details */}
              <div className="review-details-header">
                <h4 style={{ margin: "0 0 12px 0" }}>Review Case</h4>
                <div className="review-details-grid">
                  <div className="review-detail-item">
                    <p className="review-detail-label">Name</p>
                    <p className="review-detail-value">{selectedCase.createdBy}</p>
                  </div>
                  <div className="review-detail-item">
                    <p className="review-detail-label">Date</p>
                    <p className="review-detail-value">{selectedCase.dateOfBirth}</p>
                  </div>
                  <div className="review-detail-item review-detail-fullwidth">
                    <p className="review-detail-label">Case Notes</p>
                    <p className="review-detail-text">
                      {selectedCase.notes}
                    </p>
                  </div>
                  <div className="review-detail-item review-detail-fullwidth">
                    <p className="review-detail-label">Medical Documents</p>
                    {selectedCase.files && selectedCase.files.length > 0 ? (
                      <div className="medical-documents-section">
                        {selectedCase.files.map((file) => (
                          <div key={file.id} className="medical-document-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div className="document-info">
                              <p className="document-name">📄 {file.filename || file.name}</p>
                              <p className="document-size">{file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'N/A'}</p>
                            </div>
                            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                              <span className="document-date">{new Date(file.uploaded_at || file.uploadedAt).toLocaleDateString()}</span>
                              <button
                                onClick={() => handleDownloadDocument(file, selectedCase.id)}
                                className="btn-download"
                                title="Download document"
                                type="button"
                              >
                                ⬇️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-documents-message">
                        📄 No documents attached
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Comments */}
              <div>
                <label className="review-comments-label">Review Comments *</label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Enter your review comments..."
                  className="review-comments-textarea"
                />
              </div>

              {/* Review Actions */}
              <div className="review-actions" style={{display: "flex", gap: "12px", justifyContent: "flex-end"}}>
                <button
                  onClick={handleBackToList}
                  className="btn-back"
                  style={{padding: "10px 20px", fontSize: "14px", fontWeight: "500", borderRadius: "6px"}}
                >
                  Back
                </button>
                <button
                  onClick={handleRejectReview}
                  className="btn-reject"
                  style={{padding: "10px 20px", fontSize: "14px", fontWeight: "500", borderRadius: "6px"}}
                >
                  ✗ Reject
                </button>
                <button
                  onClick={handleApproveReview}
                  className="btn-approve"
                  style={{padding: "10px 20px", fontSize: "14px", fontWeight: "500", borderRadius: "6px"}}
                >
                  ✓ Assign
                </button>
              </div>
            </div>
          )}

          {reviewStep === "assign" && selectedCase && (
            <div className="assign-container">
              {/* Assignment Info */}
              <div className="assign-info-box">
                <h4 className="assign-info-title">✓ Case Approved - Now Assign to GP</h4>
                <p className="assign-info-case">{selectedCase.name}</p>
              </div>

              <div className="form-field">
                <label htmlFor="specialty" className="form-field-label">Specialty *</label>
                <select
                  id="specialty"
                  value={caseSpecialty}
                  onChange={(e) => setCaseSpecialty(e.target.value)}
                  className="form-field-select"
                >
                  <option value="">-- Select Specialty --</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="gp" className="form-field-label">Assign to GP *</label>
                <select
                  id="gp"
                  value={assignedGP}
                  onChange={(e) => setAssignedGP(e.target.value)}
                  className="form-field-select"
                >
                  <option value="">-- Select GP --</option>
                  {gpList.map((gp) => (
                    <option key={gp.id} value={gp.id}>{gp.username}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="sla" className="form-field-label">SLA (Days) *</label>
                <input
                  type="number"
                  id="sla"
                  value={caseSLA}
                  onChange={(e) => setCaseSLA(e.target.value)}
                  placeholder="e.g., 5"
                  min="1"
                  max="30"
                  className="form-field-input"
                />
              </div>

              {/* Assignment Actions */}
              <div className="assign-actions" style={{display: "flex", gap: "12px", justifyContent: "flex-end"}}>
                <button
                  onClick={handleBackToReview}
                  className="btn-back"
                  style={{padding: "10px 20px", fontSize: "14px", fontWeight: "500", borderRadius: "6px"}}
                >
                  Back
                </button>
                <button
                  onClick={handleAssignCase}
                  className="btn-assign"
                  style={{padding: "10px 20px", fontSize: "14px", fontWeight: "500", borderRadius: "6px"}}
                >
                  📤 Assign to GP
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Admin Activity Log</h3>
          {activities.length === 0 ? (
            <p className="empty-activity">No activity yet</p>
          ) : (
            <div className="activity-list">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-description">{activity.description}</span>
                  <span className="activity-time">{getTimeAgo(activity.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Stat({ title, value, change }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
      <span className="green">{change}</span>
    </div>
  );
}
