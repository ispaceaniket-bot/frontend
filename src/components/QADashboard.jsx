import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { getCurrentUser, getDocuments, qaCases, assignRandomQA, submitQaFeedback, downloadDocument, adminGPs } from "../api";

export default function QADashboard() {
  const [userName, setUserName] = useState("QA User");
  const [userRole, setUserRole] = useState("QA");

  const [auditCases, setAuditCases] = useState([]);
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [auditComments, setAuditComments] = useState("");
  const [auditDecision, setAuditDecision] = useState(""); // "good" or "rework"
  const [qaStats, setQaStats] = useState({
    totalCases: 0,
    picked: 0,
    submitted: 0,
    rework: 0,
    readyToGo: 0,
  });

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [gpList, setGpList] = useState([]);

  // Define loadApprovedCases at component level so it's accessible from handlers
  const loadApprovedCases = async () => {
    try {
      const data = await qaCases();
      
      // Map assigned_gp_id to GP username using gpList
      const mapped = (data || []).map((c) => {
        let assignedGPName = "Not Assigned";
        if (c.assigned_gp_id) {
          const gp = gpList.find(g => g.id === c.assigned_gp_id);
          assignedGPName = gp ? gp.username : `GP #${c.assigned_gp_id}`;
        }
        
        return {
          id: c.id,
          createdAt: c.created_at,
          notes: c.description,
          files: [],
          gpComments: c.gp_decision_comment || "No comments provided",
          qaStatus: c.qa_feedback || "NA",
          status: c.status, // Store backend status for QA decision tracking
          assigned_gp_id: c.assigned_gp_id,
          assignedGP: assignedGPName,
        };
      });

      setAuditCases(mapped);

      // Calculate stats based on backend qa_feedback and status
      const stats = {
        totalCases: mapped.length,
        picked: 0,
        // submitted: cases that have qa_feedback (QA has submitted feedback)
        submitted: mapped.filter(c => c.qaStatus && c.qaStatus !== "NA").length,
        // rework: cases where QA submitted feedback and status is RETURNED
        rework: mapped.filter(c => c.status === "returned").length,
        // readyToGo: cases where QA submitted feedback and status is COMPLETED
        readyToGo: mapped.filter(c => c.status === "completed").length,
      };
      setQaStats(stats);
    } catch (err) {
      console.error("Failed to load QA cases:", err);
      setAuditCases([]);
      setQaStats({ totalCases: 0, picked: 0, submitted: 0, rework: 0, readyToGo: 0 });
    }
  };

  // Load current user and QA pool on mount
  useEffect(() => {
    (async () => {
      try {
        // Fetch GP list for mapping assigned_gp_id to username
        const gps = await adminGPs();
        setGpList(gps || []);
      } catch (err) {
        console.warn("Failed to load GP list:", err);
      }
      
      try {
        const me = await getCurrentUser();
        if (me) {
          setUserName(me.username || me.email || "QA User");
          setUserRole(me.role || "QA");
        }
      } catch (err) {
        console.warn("Failed to load user:", err);
      }
      await loadApprovedCases();
    })();
  }, []);

  const handleDownloadDocument = (file) => {
    if (!file) return;
    // Use API download helper if file has id
    if (file.id && expandedCaseId) {
      (async () => {
        try {
          const blob = await downloadDocument(expandedCaseId, file.id);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.filename || file.name || `document-${file.id}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Download failed', err);
          alert('Failed to download document: ' + err.message);
        }
      })();
      return;
    }
    if (file.data) {
      const link = document.createElement("a");
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (file.url) {
      window.open(file.url, "_blank");
    }
  };

  const handleCaseClick = (caseId) => {
    const newId = expandedCaseId === caseId ? null : caseId;
    setExpandedCaseId(newId);
    setShowCommentSection(false);
    setAuditComments("");
    setAuditDecision("");

    // If expanding, load documents for this case
    if (newId) {
      (async () => {
        try {
          const docs = await getDocuments(newId);
          setAuditCases(prev => prev.map(c => c.id === newId ? { ...c, files: docs } : c));
        } catch (err) {
          console.warn('Failed to load documents for case', newId, err);
        }
      })();
    }
  };

  const handleQACommentClick = () => setShowCommentSection(!showCommentSection);

  const handleSubmitAudit = async () => {
    if (!auditComments.trim() || !auditDecision) {
      alert("QA comments and decision are required");
      return;
    }

    if (!expandedCaseId) {
      alert('No case selected');
      return;
    }

    try {
      const payload = {
        feedback: auditComments,
        approved: auditDecision === 'good'
      };
      await submitQaFeedback(expandedCaseId, payload);
      alert('✓ QA review submitted');
      // refresh list and close expanded case view
      await loadApprovedCases();
      setExpandedCaseId(null);
      setShowCommentSection(false);
      setAuditComments('');
      setAuditDecision('');
    } catch (err) {
      console.error('Failed to submit QA feedback', err);
      alert('Failed to submit QA feedback: ' + err.message);
    }
  };


  return (
    <>
      <Navbar />
      <div className="dashboard">
        <h1>QA Dashboard</h1>
        <p className="subtitle">Quality Assurance & Compliance</p>

        {/* QA Statistics Grid */}
        <div className="stats-grid-responsive">
          <div className="stat-card-modern">
            <div className="stat-label">Total Cases</div>
            <div className="stat-value">{qaStats.totalCases}</div>
            <div className="stat-subtitle">📊 All in system</div>
          </div>
          
          <div className="stat-card-modern stat-card-indigo">
            <div className="stat-label">Submitted</div>
            <div className="stat-value stat-value-indigo">{qaStats.submitted}</div>
            <div className="stat-subtitle stat-subtitle-indigo">✉️ With feedback</div>
          </div>
          
          <div className="stat-card-modern stat-card-yellow">
            <div className="stat-label">Rework</div>
            <div className="stat-value stat-value-yellow">{qaStats.rework}</div>
            <div className="stat-subtitle stat-subtitle-yellow">⟳ Needs revision</div>
          </div>
          
          <div className="stat-card-modern stat-card-green">
            <div className="stat-label">Ready to Go</div>
            <div className="stat-value stat-value-green">{qaStats.readyToGo}</div>
            <div className="stat-subtitle stat-subtitle-green">✓ Approved</div>
          </div>
        </div>

        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {auditCases.length > 0 && (
          <div className="card">
            <h3>Cases Pending Audit ({auditCases.length})</h3>
            <div className="qa-cases-list">
              {auditCases.map((auditCase) => (
                <div key={auditCase.id} className="qa-case-container">
                  <div
                    className="qa-case-header"
                    onClick={() => handleCaseClick(auditCase.id)}
                  >
                    <div className="qa-case-summary">
                      <h4>Case #{auditCase.id}</h4>
                      <p>GP: {auditCase.assignedGP}</p>
                      <p className="case-preview">{auditCase.notes.substring(0, 80)}...</p>
                      {auditCase.qaStatus && auditCase.qaStatus !== "NA" && (
                        <div style={{ 
                          marginTop: "8px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          display: "inline-block",
                          backgroundColor: auditCase.status === "completed" ? "#d1fae5" : auditCase.status === "returned" ? "#fee2e2" : "#f0f9ff",
                          color: auditCase.status === "completed" ? "#059669" : auditCase.status === "returned" ? "#dc2626" : "#0369a1"
                        }}>
                          {auditCase.status === "completed" ? "✓ Approved" : auditCase.status === "returned" ? "⟳ Need Revision" : "Submitted"}
                        </div>
                      )}
                    </div>
                    <span className="toggle-icon">
                      {expandedCaseId === auditCase.id ? "▼" : "▶"}
                    </span>
                  </div>

                  {expandedCaseId === auditCase.id && (
                    <div className="qa-case-details">
                      <div className="case-section">
                        <h5>Case Details</h5>
                        <div className="detail-item">
                          <label>Case Name:</label>
                          <p>Case #{auditCase.id}</p>
                        </div>
                        <div className="detail-item">
                          <label>Date:</label>
                          <p>{new Date(auditCase.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="case-section">
                        <h5>Case Notes</h5>
                        <div className="case-text-box">
                          {auditCase.notes}
                        </div>
                      </div>

                      <div className="case-section">
                        <h5>Documents</h5>
                        {auditCase.files && auditCase.files.length > 0 ? (
                          <div className="document-flex-container">
                            {auditCase.files.map((file) => (
                              <div key={file.id} className="document-file-row">
                                <div>{file.filename || file.name || (file.file_path && file.file_path.split('/').pop())}</div>
                                <div className="document-file-info">
                                  <button onClick={() => handleDownloadDocument(file)} title="Download document">⬇️</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="document-empty-text">No documents attached</div>
                        )}
                      </div>

                      <div className="case-section">
                        <h5>GP Comments</h5>
                        <div className="case-text-box">
                          {auditCase.gpComments}
                        </div>
                      </div>

                      <button
                        className="btn-comment"
                        onClick={handleQACommentClick}
                      >
                        QA Comment Option
                      </button>

                      {showCommentSection && (
                        <div className="qa-comment-section">
                          <div className="decision-buttons-container">
                            <button
                              className={`btn-decision-flex btn-decision ${auditDecision === "good" ? "active" : ""}`}
                              onClick={() => setAuditDecision("good")}
                            >
                              Ready to Go ✓
                            </button>
                            <button
                              className={`btn-decision-flex btn-decision rework ${auditDecision === "rework" ? "active" : ""}`}
                              onClick={() => setAuditDecision("rework")}
                            >
                              Rework ⟳
                            </button>
                          </div>

                          <div className="comment-box">
                            <label>QA Comments (Required) *</label>
                            <textarea
                              value={auditComments}
                              onChange={(e) => setAuditComments(e.target.value)}
                              placeholder="Enter your QA review comments..."
                              className="qa-textarea"
                            />
                          </div>

                          <button
                            className="btn-submit qa-submit-button"
                            onClick={handleSubmitAudit}
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {auditCases.length === 0 && (
          <div className="card">
            <p className="empty-activity">No cases pending audit</p>
          </div>
        )}
      </div>
    </>
  );
}
