import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { myCases, uploadDocument, getDocuments, deleteCase, getCaseMessages, postCaseMessage, getCurrentUser, downloadDocument } from "../api";

export default function Dashboard() {
  const [detailsTab, setDetailsTab] = useState("discussion"); // discussion, qaComments, gpComments

  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [caseDocuments, setCaseDocuments] = useState({});
  const [caseThreads, setCaseThreads] = useState({});
  const [replyMessage, setReplyMessage] = useState("");
  const [activeTab, setActiveTab] = useState("created"); // created, active, closed
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        setUserEmail(user.email || "");
        setUserName(user.username || user.email || "");
      } catch (err) {
        console.warn("Failed to load current user:", err);
      }
      loadCases();
    })();
  }, []);

  // Threads are fetched per-case from backend when viewing a case
  

  const loadCases = async () => {
    try {
      const data = await myCases(); // 🔑 FETCH FROM BACKEND
      if (!Array.isArray(data)) {
        console.error("myCases returned unexpected payload:", data);
        setCases([]);
        return;
      }
      setCases(data);
    } catch (err) {
      console.error("Failed to load cases", err);
      alert(`Failed to load cases: ${err.message}`);
      setCases([]);
    }
  };

  useEffect(() => {
    // keep notification logic separate
    const newCaseCreated = sessionStorage.getItem("caseCreated");
    if (newCaseCreated) {
      setNotification({
        show: true,
        message: "✓ Case created successfully!",
        type: "success",
      });
      sessionStorage.removeItem("caseCreated");
      sessionStorage.removeItem("newCaseId");

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 4000);
    }
  }, [cases]);


  const getFilteredCases = () => {
    if (activeTab === "created") {
      // Show cases that are Pending (newly created, not yet assigned)
      return cases.filter(c => !c.status || c.status === "pending");
    } else if (activeTab === "active") {
      // Show cases that are Assigned (assigned to GP but not yet approved)
      return cases.filter(c => c.status === "assigned");
    } else if (activeTab === "closed") {
      // Show cases that are Approved or Closed (GP has reviewed and approved)
      return cases.filter(c => c.status === "completed" || c.status === "returned");
    }
    return cases;
  };

  const handleCreateNew = () => {
    navigate("/create-case");
  };

  const handleDeleteCase = async (caseId) => {
    if (!window.confirm("Delete this case?")) return;

    try {
      await deleteCase(caseId);
      alert("✓ Case deleted successfully!");
      loadCases(); // refresh dashboard
    } catch (err) {
      console.error("Delete error:", err);
      alert(`❌ Failed to delete case: ${err.message}`);
    }
  };


  const handleViewCase = (caseItem) => {
    setSelectedCase({
      ...caseItem,
      gp_decision_comment: caseItem.gp_decision_comment || null,
      qa_feedback: caseItem.qa_feedback || null
    });
    setShowCaseDetails(true);
    setReplyMessage("");
    
    // Fetch documents for this case
    getDocuments(caseItem.id)
      .then(docs => {
        setCaseDocuments(prev => ({
          ...prev,
          [caseItem.id]: docs
        }));
      })
      .catch(err => console.error("Failed to fetch documents:", err));
    // Fetch messages for this case from backend
    getCaseMessages(caseItem.id)
      .then(msgs => setCaseThreads(prev => ({ ...prev, [caseItem.id]: msgs })))
      .catch(err => {
        console.error("Failed to load messages:", err);
        setCaseThreads(prev => ({ ...prev, [caseItem.id]: [] }));
      });
  };

  const handleCloseCaseDetails = () => {
    setShowCaseDetails(false);
    setSelectedCase(null);
    setReplyMessage("");
  };

  const handleAddReply = () => {
    if (!replyMessage.trim()) {
      alert("Please enter a reply message");
      return;
    }
    const caseId = selectedCase.id;
    (async () => {
      try {
        await postCaseMessage(caseId, { content: replyMessage });
        const msgs = await getCaseMessages(caseId);
        setCaseThreads(prev => ({ ...prev, [caseId]: msgs }));
        setReplyMessage("");
        alert("✓ Reply sent successfully!");
      } catch (err) {
        console.error("Failed to send reply:", err);
        alert("Failed to send reply");
      }
    })();
  };

  const handleDownloadDocument = async (file, caseId) => {
    try {
      const blob = await downloadDocument(caseId, file.id);
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

  const handleDeleteDocument = (caseId, fileId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    // Update in-memory documents state for this case
    setCaseDocuments(prev => {
      const updated = { ...prev };
      if (Array.isArray(updated[caseId])) {
        updated[caseId] = updated[caseId].filter(f => f.id !== fileId);
      }
      return updated;
    });

    // Update selectedCase view if present
    setSelectedCase(prev => {
      if (!prev) return prev;
      const newFiles = (prev.files || []).filter(f => f.id !== fileId);
      return { ...prev, files: newFiles, filesCount: newFiles.length };
    });

    alert("✓ Document deleted locally. Refresh from server to persist change if supported.");
  };

  const handleFileUpload = (e, caseId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

    Array.from(files).forEach(async (file) => {
      const isValidType = allowedTypes.includes(file.type);
      const hasValidExtension = allowedExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );

      if (!isValidType && !hasValidExtension) {
        alert(`❌ ${file.name} is not supported. Only PDF, JPG, and PNG files are allowed.`);
        return;
      }

      try {
        await uploadDocument(caseId, file);
        alert(`✓ ${file.name} uploaded successfully!`);
        e.target.value = ""; // Reset file input
      } catch (err) {
        console.error("Upload error:", err);
        alert(`❌ Failed to upload ${file.name}: ${err.message}`);
      }
    });
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

  const getRoleColor = (role) => {
    if (role === "GP") return "#3b82f6"; // Blue
    if (role === "Claimant") return "#10b981"; // Green
    return "#6b7280"; // Gray
  };

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="case-header">
          <h1>My Cases</h1>
          <button className="btn-create-new" onClick={handleCreateNew}>
            ➕ Create New
          </button>
        </div>

        {notification.show && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Case Status Tabs */}
        <div className="case-tabs">
          <button 
            className={`case-tab ${activeTab === "created" ? "active" : ""}`}
            onClick={() => setActiveTab("created")}
          >
            Created Cases
            <span className="tab-count">{cases.filter(c => !c.status || c.status === "pending").length}</span>
          </button>
          <button 
            className={`case-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Assigned Cases
            <span className="tab-count">{cases.filter(c => c.status === "assigned").length}</span>
          </button>
          <button 
            className={`case-tab ${activeTab === "closed" ? "active" : ""}`}
            onClick={() => setActiveTab("closed")}
          >
            Approved Cases
            <span className="tab-count">{cases.filter(c => c.status === "completed" || c.status === "returned").length}</span>
          </button>
        </div>

        <div className="case-list">
          {getFilteredCases().length === 0 ? (
            <div className="empty-state">
              <p>
                {activeTab === "created" && "No created cases. Click 'Create New' to get started."}
                {activeTab === "active" && "No assigned cases. Cases will appear here when admin assigns them to a GP."}
                {activeTab === "closed" && "No approved cases yet. Cases will appear here when GP approves them."}
              </p>
            </div>
          ) : (
            getFilteredCases().map((caseItem) => (
              <div key={caseItem.id} className="case-card-item">
                <div className="case-card-header">
                  <div className="case-card-title">
                    <span className="case-card-number">Case #{caseItem.id}</span>
                    <button 
                      className="case-card-delete" 
                      title="Delete case"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCase(caseItem.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                  <span className="case-card-status" style={{
                    backgroundColor: caseItem.status === "returned" ? "#fee2e2" :
                                    caseItem.status === "completed" ? "#d1fae5" :
                                    caseItem.status === "assigned" ? "#fef3c7" : "#e0e7ff",
                    color: caseItem.status === "returned" ? "#dc2626" :
                           caseItem.status === "completed" ? "#059669" :
                           caseItem.status === "assigned" ? "#ca8a04" : "#4f46e5"
                  }}>
                    {caseItem.status === "returned" ? "DENIED" :
                     caseItem.status === "completed" ? "APPROVED" :
                     caseItem.status === "assigned" ? "ASSIGNED" : "SUBMITTED"}
                  </span>
                </div>
                <div className="case-card-date">  📅 {new Date(caseItem.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                
                <div className="case-card-summary">
                  <div className="summary-label">SUMMARY</div>
                  <div className="summary-text">{caseItem.description.split('\n')[0] || "No description"}</div>
                </div>

                <button className="case-card-view" onClick={() => handleViewCase(caseItem)}>
                  View Details <span>→</span>
                </button>
              </div>
            ))
          )}
        </div>

        {showCaseDetails && selectedCase && (
          <div className="case-details-modal">
            <div className="case-details-container">
              {/* Header */}
              <div className="case-details-header">
                <div className="case-details-title-row">
                  <h1 className="case-details-title">Case #{selectedCase.id}</h1>
                  <span className="-badge" style={{
                    backgroundColor: selectedCase.status === "returned" ? "#fee2e2" :
                                    selectedCase.status === "completed" ? "#d1fae5" :
                                    selectedCase.status === "assigned" ? "#fef3c7" : "#e0e7ff",
                    color: selectedCase.status === "returned" ? "#dc2626" :
                           selectedCase.status === "completed" ? "#059669" :
                           selectedCase.status === "assigned" ? "#ca8a04" : "#4f46e5",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontWeight: "bold"
                  }}>
                    {selectedCase.status === "returned" ? "DENIED" :
                     selectedCase.status === "completed" ? "APPROVED" :
                     selectedCase.status === "assigned" ? "ASSIGNED" : "SUBMITTED"}
                  </span>
                </div>
                <p className="case-details-created">Created on {new Date(selectedCase.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              {/* Main Content Grid */}
              <div className="case-details-grid">
                {/* Left Panel - Case Info & Documents */}
                <div className="case-details-left">
                  {/* Case Information Section */}
                  <div className="case-info-section">
                    <h3 className="section-title">Case Information</h3>
                    <div className="case-info-grid">
                      <div className="info-item">
                        <div className="info-label">Claimant DOB</div>
                        <div className="info-value">{selectedCase.dateOfBirth}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Specialty</div>
                        <div className="info-value">Not classified</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">QA Status</div>
                        <div className="info-value" style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          display: "inline-block",
                          backgroundColor: selectedCase.qaStatus === "NA" ? "#e5e7eb" : 
                                         selectedCase.qaStatus === "Ready to Go" ? "#d1fae5" :
                                         selectedCase.qaStatus === "Rework" ? "#fee2e2" : "#f0f9ff",
                          color: selectedCase.qaStatus === "NA" ? "#6b7280" :
                                selectedCase.qaStatus === "Ready to Go" ? "#059669" :
                                selectedCase.qaStatus === "Rework" ? "#dc2626" : "#0369a1"
                        }}>
                          {selectedCase.qaStatus || "NA"}
                        </div>
                      </div>
                    </div>
                    <div className="case-info-description">
                      <div className="info-label">Description</div>
                      <div className="info-value">{selectedCase.notes}</div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="case-documents-section">
                    <h3 className="section-title">Documents</h3>
                    <div className="documents-list">
                      {(caseDocuments[selectedCase.id] && caseDocuments[selectedCase.id].length > 0) ? (
                        <>
                          {caseDocuments[selectedCase.id].map((file) => (
                            <div key={file.id} className="document-item">
                              <div className="document-icon">📄</div>
                              <div className="document-details">
                                <div className="document-name">{file.filename.substring(0, 30)}</div>
                                <div className="document-date">{new Date(file.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                              </div>
                              <div className="document-actions">
                                <button
                                  onClick={() => handleDownloadDocument(file, selectedCase.id)}
                                  className="document-download"
                                  title="Download document"
                                  type="button"
                                >
                                  ⬇️
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="no-documents">No documents uploaded</div>
                      )}
                    </div>
                    <div className="upload-area">
                      <label htmlFor="document-upload" className="upload-label">
                        <div className="upload-icon">⬆️</div>
                        <div className="upload-text">Click to upload document</div>
                        <div className="upload-hint">PDF, JPG, PNG up to 10MB</div>
                      </label>
                      <input
                        id="document-upload"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, selectedCase.id)}
                        className="file-input-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Panel - Discussion and Comments */}
                <div className="case-details-right">
                  <div className="discussion-section">
                    {/* Tabs for Discussion, QA Comments, GP Comments */}
                    <div className="details-tabs-row">
                      <button
                        className={`details-tab-button ${detailsTab === "discussion" ? "active-discussion" : ""}`}
                        onClick={() => setDetailsTab("discussion")}
                      >
                        💬 Discussion
                      </button>
                      {(selectedCase.qaComments && selectedCase.qaComments.length > 0) || selectedCase.qa_feedback ? (
                        <button
                          className={`details-tab-button ${detailsTab === "qaComments" ? "active-qa" : ""}`}
                          onClick={() => setDetailsTab("qaComments")}
                        >
                          ✓ QA Comments
                        </button>
                      ) : null}
                      {(selectedCase.gpComments && selectedCase.gpComments.length > 0) || selectedCase.gp_decision_comment ? (
                        <button
                          className={`details-tab-button ${detailsTab === "gpComments" ? "active-gp" : ""}`}
                          onClick={() => setDetailsTab("gpComments")}
                        >
                          🏥 GP Comments
                        </button>
                      ) : null}
                    </div>

                    {/* Discussion Tab */}
                    {detailsTab === "discussion" && (
                      <>
                        <h3 className="section-title">💬 Discussion</h3>
                        <div className="discussion-messages">
                          {caseThreads[selectedCase.id]?.length === 0 ? (
                            <p className="empty-discussion">No comments yet. Start the discussion.</p>
                          ) : (
                            <>
                              {caseThreads[selectedCase.id]?.map((msg) => (
                                <div key={msg.id} className="discussion-message">
                                  <div className="message-header-row">
                                    <span className="message-author">{(msg.sender_role || "").toLowerCase() === "gp" ? "🏥" : "👤"} {msg.sender_username || msg.sender}
                                    </span>
                                    <span className="message-time">{getTimeAgo(msg.timestamp)}</span>
                                  </div>
                                  {(msg.sender_role || "").toLowerCase() === "gp" && (
                                    <div className="message-badge">❓ Clarification</div>
                                  )}
                                  <p className="message-text">{msg.content}</p>
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        {/* Message Input - Always visible */}
                        <div className="message-input-area">
                          {caseThreads[selectedCase.id]?.some(m => (m.sender_role || "").toLowerCase() === "gp") ? (
                            <>
                              <label className="message-input-label">Reply to Clarification</label>
                              <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                className="message-input"
                                placeholder="Type your reply here..."
                              ></textarea>
                              <button 
                                className="send-button" 
                                onClick={handleAddReply}
                                disabled={!replyMessage.trim()}
                              >
                                Send Reply
                              </button>
                            </>
                          ) : (
                            <div className="no-reply-message">
                              <p>No pending clarifications. Replies will appear here when the GP requests information.</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* QA Comments Tab */}
                    {detailsTab === "qaComments" && (
                      <>
                        <h3 className="section-title">✓ QA Review Comments</h3>
                        <div className="comments-list">
                          {selectedCase.qaComments && selectedCase.qaComments.length > 0 ? (
                            selectedCase.qaComments.map((comment, index) => (
                              <div key={index} className="comment-item">
                                <div className="comment-header-flex">
                                  <span className={comment.decision === "good" ? "comment-author-bold" : "comment-author-rework"}>
                                    {comment.decision === "good" ? "✓ Ready to Go" : "Rework"}
                                  </span>
                                  <span className="comment-timestamp">
                                    {new Date(comment.at).toLocaleDateString()} by {comment.by}
                                  </span>
                                </div>
                                <p className="comment-text">{comment.comment}</p>
                              </div>
                            ))
                          ) : selectedCase.qa_feedback ? (
                            <div className="comment-item">
                              <div className="comment-header-flex">
                                <span className={selectedCase.status === "completed" ? "comment-author-bold" : "comment-author-rework"}>
                                  {selectedCase.status === "completed" ? "✓ Ready to Go" : selectedCase.status === "returned" ? "Rework" : "QA Feedback"}
                                </span>
                                <span className="comment-timestamp">by QA</span>
                              </div>
                              <p className="comment-text">{selectedCase.qa_feedback}</p>
                            </div>
                          ) : (
                            <p className="muted">No QA comments yet</p>
                          )}
                        </div>
                      </>
                    )}                    {/* GP Comments Tab */}
                    {detailsTab === "gpComments" && (
                      <>
                        <h3 className="section-title">🏥 GP Review Comments</h3>
                        <div className="comments-list">
                          {selectedCase.gpComments && selectedCase.gpComments.length > 0 ? (
                            selectedCase.gpComments.map((comment, index) => (
                              <div key={index} className="comment-item gp-comment-item">
                                <div className="comment-header-flex">
                                  <span className="comment-author-bold" style={{ color: "#3b82f6" }}>
                                    🏥 {comment.decision || "Approved"}
                                  </span>
                                  <span className="comment-timestamp">
                                    {new Date(comment.at).toLocaleDateString()} by {comment.by}
                                  </span>
                                </div>
                                <p className="comment-text">{comment.comment}</p>
                              </div>
                            ))
                          ) : selectedCase.gp_decision_comment ? (
                            <div className="comment-item gp-comment-item">
                              <div className="comment-header-flex">
                                <span className="comment-author-bold" style={{ color: "#3b82f6" }}>
                                  🏥 GP Decision
                                </span>
                                <span className="comment-timestamp">—</span>
                              </div>
                              <p className="comment-text">{selectedCase.gp_decision_comment}</p>
                            </div>
                          ) : (
                            <p className="muted">No GP comments yet</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button className="case-details-close" onClick={handleCloseCaseDetails}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
