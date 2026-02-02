import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { gpCases, getDocuments, getCaseMessages, postCaseMessage, gpDecision, getCurrentUser, downloadDocument } from "../api";

export default function GPSDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("GPS User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [userRole, setUserRole] = useState("GPs");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("GPS User");
  const [activities, setActivities] = useState([]);

  // EPIC 3 - Case Review States
  const [assignedCases, setAssignedCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [clarificationComment, setClarificationComment] = useState("");
  const [finalDecision, setFinalDecision] = useState("");
  const [decisionComments, setDecisionComments] = useState("");
  const [caseThreads, setCaseThreads] = useState({});
  const [gpStats, setGpStats] = useState({
    allotted: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const roleDescriptions = {
    claimant: "Create and manage insurance/legal claims",
    gps: "General Medical Review Services",
    qa: "Quality Assurance & Compliance",
    admin: "Full system administration",
  };
  const roleDescription = roleDescriptions[userRole.toLowerCase()] || "Access your dashboard";

  useEffect(() => {
    const init = async () => {
      // Load current user from backend (avoid localStorage)
      try {
        const me = await getCurrentUser();
        if (me) {
          setUserName(me.username || me.email || "GPS User");
          setEditedName(me.username || me.email || "GPS User");
          setUserEmail(me.email || "user@example.com");
          setUserRole(me.role || "GPs");
        }
      } catch (err) {
        // If fetching current user fails, continue with defaults
        console.warn("Failed to load current user:", err);
      }

      loadActivities();
      await loadAssignedCases();
    };
    init();
  }, []);

  const loadActivities = () => {
    // Activities are not persisted client-side anymore. Start with empty list.
    setActivities([]);
  };

  const loadAssignedCases = async () => {
    try {
      // Fetch assigned cases for current GP from backend
      const data = await gpCases();

      const normalizeStatus = (raw) => {
        if (!raw) return "Pending Review";
        const s = String(raw).toLowerCase();
        if (s === "completed" || s === "completed") return "Approved";
        if (s === "qa_pending" || s === "qa pending") return "Pending Review";
        return s.split(/[_\s]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      };

      const cases = (data || []).map((c) => {
        // calculate days remaining to SLA if present
        let slaVal = "N/A";
        if (c.sla_deadline) {
          const days = Math.ceil((new Date(c.sla_deadline) - new Date()) / (24 * 60 * 60 * 1000));
          slaVal = days >= 0 ? days : 0;
        }

        return {
          caseId: c.id,
          caseName: `Case #${c.id}`,
          specialty: c.specialty || "General",
          sla: slaVal,
          status: normalizeStatus(c.status),
          actualStatus: c.status,
          qaStatus: c.qa_feedback || "NA",
          documents: "Available",
          createdAt: c.created_at,
          claimantId: c.claimant_id,
          notes: c.description,
          dateOfBirth: c.date_of_birth,
          createdBy: `Claimant #${c.claimant_id}`,
        };
      });

      setAssignedCases(cases);

      const stats = {
        allotted: cases.length,
        pending: cases.filter((c) => c.status === "Pending Review").length,
        approved: cases.filter((c) => c.status === "Approved").length,
        rejected: cases.filter((c) => c.qaStatus === "Rework").length,
      };
      setGpStats(stats);
    } catch (err) {
      console.error("Failed to load assigned cases from backend:", err);
      setAssignedCases([]);
      setGpStats({ allotted: 0, pending: 0, approved: 0, rejected: 0 });
    }
  };

  const addActivity = (description) => {
    const newActivity = {
      id: Date.now(),
      description,
      timestamp: new Date().toISOString(),
      userRole: userRole,
    };
    
    // Keep activities in-memory only
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  };

  const handleSaveProfile = () => {
    if (editedName !== userName) {
      addActivity(`Profile updated - Name changed to "${editedName}"`);
    }
    // No client-side persistence. Update local state only.
    setUserName(editedName);
    setIsEditingProfile(false);
  };

  const handleViewCase = async (caseItem) => {
    // Load case documents and messages from backend
    try {
      // Get documents from general endpoint
      let docs = [];
      try {
        docs = await getDocuments(caseItem.caseId);
      } catch (err) {
        console.warn("Failed to load documents:", err);
        docs = [];
      }

      const mappedFiles = docs.map((f) => ({
        id: f.id,
        name: f.filename || f.name,
        uploaded_at: f.uploaded_at,
        file_path: f.file_path,
      }));

      // fetch existing messages for this case
      let msgs = [];
      try {
        msgs = await getCaseMessages(caseItem.caseId);
      } catch (err) {
        console.warn("Failed to load messages for case", caseItem.caseId, err);
        msgs = [];
      }

      // Use caseItem data (from /gp/cases) and attach documents & messages
      setCaseThreads(prev => ({ ...prev, [caseItem.caseId]: msgs }));
      setSelectedCase({ ...caseItem, files: mappedFiles });
      setShowCaseDetails(true);
      setClarificationComment("");
      setFinalDecision("");
      setDecisionComments("");
    } catch (err) {
      console.error("Error preparing case view:", err);
      alert(`Failed to load case documents: ${err?.message || err}`);
    }
  };

  const handleDownloadDocument = (file) => {
    if (!file || !selectedCase) return;
    (async () => {
      try {
        const blob = await downloadDocument(selectedCase.caseId, file.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name || file.filename || "document";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to download document:", err);
        alert("Failed to download document: " + (err?.message || err));
      }
    })();
  };

  const handleAddClarification = () => {
    if (!clarificationComment.trim()) {
      alert("Please enter a clarification comment");
      return;
    }

    const caseId = selectedCase.caseId;
    (async () => {
      try {
        await postCaseMessage(caseId, { content: clarificationComment });
        // reload messages for this case
        const msgs = await getCaseMessages(caseId);
        setCaseThreads(prev => ({ ...prev, [caseId]: msgs }));
        setClarificationComment("");
        addActivity(`Asked clarification for case: ${selectedCase.caseName}`);
      } catch (err) {
        console.error("Failed to post clarification:", err);
        alert("Failed to send clarification");
      }
    })();
  };

  const handleFinalDecision = () => {
  (async () => {
    if (!finalDecision || !decisionComments.trim()) {
      alert("Decision and comments are required");
      return;
    }
    const caseId = selectedCase.caseId;
    try {
      const decision = finalDecision === "Approved" ? "approve" : "deny";
      // gpDecision expects { decision: 'approve'|'deny', comment: '...' }
      await gpDecision(caseId, { decision, comment: decisionComments });
      alert("✓ Decision submitted successfully");
      // reload assigned cases and messages
      await loadAssignedCases();
      const msgs = await getCaseMessages(caseId);
      setCaseThreads(prev => ({ ...prev, [caseId]: msgs }));
      setShowCaseDetails(false);
      setSelectedCase(null);
    } catch (err) {
      console.error("Failed to submit decision:", err);
      alert("Failed to submit decision");
    }
  })();
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
        <h1>Welcome back, {editedName}! 👥</h1>
        <p className="subtitle">{userRole} — {roleDescription}</p>

        {/* Individual GP Statistics Grid */}
        <div className="stats-grid-responsive">
          <div className="stat-card-modern stat-card-blue">
            <div className="stat-label">Allotted Cases</div>
            <div className="stat-value stat-value-blue">{gpStats.allotted}</div>
            <div className="stat-subtitle stat-subtitle-blue">📋 Total assigned</div>
          </div>
          
          <div className="stat-card-modern stat-card-yellow">
            <div className="stat-label">Pending Review</div>
            <div className="stat-value stat-value-yellow">{gpStats.pending}</div>
            <div className="stat-subtitle stat-subtitle-yellow">⏳ Awaiting action</div>
          </div>
          
          <div className="stat-card-modern stat-card-green">
            <div className="stat-label">Approved</div>
            <div className="stat-value stat-value-green">{gpStats.approved}</div>
            <div className="stat-subtitle stat-subtitle-green">✓ Completed</div>
          </div>
          
          <div className="stat-card-modern">
            <div className="stat-label">Rejected/Rework</div>
            <div className="stat-value" style={{ color: "#dc2626" }}>{gpStats.rejected}</div>
            <div className="stat-subtitle" style={{ color: "#dc2626" }}>⟳ Need rework</div>
          </div>
        </div>

        {/* Case Review Section */}
        {!showCaseDetails ? (
          <div className="grid-2">
            {/* Case List */}
            <div className="card">
              <div className="card-header">
                <h3>📋 My Assigned Cases ({assignedCases.length})</h3>
              </div>
              
              {assignedCases.length === 0 ? (
                <p className="empty-activity">No cases assigned yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "500px", overflowY: "auto" }}>
                  {assignedCases.map((caseItem) => (
                    <div
                      key={caseItem.caseId}
                      className={`case-item-container ${caseItem.status === "Approved" ? "case-item-approved" : ""}`}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = caseItem.status === "Approved" ? "#dcfce7" : "#f0f9ff"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = caseItem.status === "Approved" ? "#f0fdf4" : "#f9fafb"}
                      onClick={() => handleViewCase(caseItem)}
                    >
                      <div className="case-item-header">
                        <div className="case-item-title">
                          {caseItem.caseName}
                        </div>
                        <span className={`case-item-status-badge ${caseItem.status === "Approved" ? "case-status-approved" : "case-status-pending"}`}>
                          {caseItem.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        📌 Specialty: <strong>{caseItem.specialty}</strong>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        ⏱️ SLA: <strong>{caseItem.sla} days</strong>
                      </div>
                      <div style={{ fontSize: "12px", color: caseItem.documents === "Available" ? "#10b981" : "#ef4444" }}>
                        {caseItem.documents === "Available" ? "✓ Documents Available" : "⚠️ Documents: Load Failed"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Card */}
            <div className="card">
              <div className="card-header">
                <h3>Profile</h3>
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
              <p className="muted">Member since January 27, 2026</p>
            </div>
          </div>
        ) : (
          <>
            {/* Request GP Review - Case Details & Clarification */}
            <div className="card">
              <div className="card-header">
                <h3>Request GP Review</h3>
                <button
                  onClick={() => setShowCaseDetails(false)}
                  style={{ cursor: "pointer", fontSize: "20px", background: "none", border: "none" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Case Details Panel */}
                <div>
                  <h4 style={{ marginTop: "0" }}>Case Details</h4>
                  <div style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Claimant Name</div>
                    <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>{selectedCase.createdByName || selectedCase.createdBy || selectedCase.caseName}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Claimant DOB</div>
                    <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>{selectedCase.dateOfBirth || "N/A"}</div>

                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px", marginTop: "6px" }}>Documents</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedCase.files && selectedCase.files.length > 0 ? (
                        selectedCase.files.map((file) => (
                          <div key={file.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "white" }}>
                            <div style={{ fontSize: "13px", color: "#111827" }}>{file.name}</div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleDownloadDocument(file)} style={{ cursor: "pointer", background: "none", border: "none" }}>⬇️</button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>No documents uploaded</div>
                      )}
                    </div>
                  </div>

                  <h4>Description</h4>
                  <div style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px", backgroundColor: "#f9fafb", minHeight: "120px", fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
                    {selectedCase.notes || "No description provided by claimant."}
                  </div>
                </div>

                {/* Request Clarification Panel */}
                <div>
                  <h4 style={{ marginTop: "0" }}>Request Clarification</h4>
                  <textarea
                    value={clarificationComment}
                    onChange={(e) => setClarificationComment(e.target.value)}
                    placeholder="Enter your message..."
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      marginBottom: "12px",
                      boxSizing: "border-box",
                      minHeight: "120px",
                      resize: "vertical",
                    }}
                  />
                  <button
                    onClick={handleAddClarification}
                    style={{
                      width: "50%",
                      padding: "10px",
                      backgroundColor: "#0ea5e9",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Clarification History */}
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                <h4>Clarification History</h4>
                <div style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "12px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  backgroundColor: "#f9fafb",
                }}>
                  {caseThreads[selectedCase.caseId] && caseThreads[selectedCase.caseId].length > 0 ? (
                    caseThreads[selectedCase.caseId].map((msg) => (
                      <div key={msg.id} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>
                        <div style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "4px" }}>
                          {msg.sender_username} ({msg.sender_role}) • {getTimeAgo(msg.timestamp)}
                        </div>
                        <div style={{ fontSize: "13px", color: "#374151" }}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted">No clarification messages yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Final Decision Section */}
            <div className="card">
              <div className="card-header">
                <h3>Final Decision</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Decision Buttons */}
                <div>
                  <h4 style={{ marginTop: "0", marginBottom: "12px" }}>Decision</h4>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setFinalDecision("Approved")}
                      style={{
                        width: "50%",
                        padding: "12px",
                        backgroundColor: finalDecision === "Approved" ? "#10b981" : "#e5e7eb",
                        color: finalDecision === "Approved" ? "white" : "#374151",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      {finalDecision === "Approved" ? "✓ " : ""}Approve
                    </button>
                    <button
                      onClick={() => setFinalDecision("Denied")}
                      style={{
                        width: "50%",
                        padding: "12px",
                        backgroundColor: finalDecision === "Denied" ? "#ef4444" : "#e5e7eb",
                        color: finalDecision === "Denied" ? "white" : "#374151",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      {finalDecision === "Denied" ? "✕ " : ""}Deny
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h4 style={{ marginTop: "0", marginBottom: "12px" }}>Comments (Required) *</h4>
                  <textarea
                    value={decisionComments}
                    onChange={(e) => setDecisionComments(e.target.value)}
                    placeholder="Please provide your decision comments..."
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      minHeight: "100px",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleFinalDecision}
                style={{
                  marginTop: "16px",
                  width: "50%",
                  padding: "12px",
                  backgroundColor: finalDecision && decisionComments.trim() ? "#0ea5e9" : "#d1d5db",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: finalDecision && decisionComments.trim() ? "pointer" : "not-allowed",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
                disabled={!finalDecision || !decisionComments.trim()}
              >
                Submit Decision
              </button>
            </div>
          </>
        )}

        <div className="card">
          <h3>Recent Activity</h3>
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
