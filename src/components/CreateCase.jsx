import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { createCase, uploadDocument } from "../api";


export default function CreateCase() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    notes: "",
    files: [],
  });

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- INPUT HANDLERS ---------------- */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (files) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

    const newFiles = Array.from(files).filter((file) => {
      const isValidType = allowedTypes.includes(file.type);
      const hasValidExtension = allowedExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!isValidType && !hasValidExtension) {
        setError(
          `❌ ${file.name} is not supported. Only PDF, JPG, PNG allowed.`
        );
        return false;
      }
      return true;
    });

    if (newFiles.length) {
      setError("");
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles],
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  /* ---------------- SUBMIT (BACKEND INTEGRATION) ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.dateOfBirth || !formData.notes.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create the case
      const newCase = await createCase({
        description: formData.notes,
        date_of_birth: formData.dateOfBirth,
      });

      // Step 2: Upload documents if any
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          try {
            await uploadDocument(newCase.id, file);
          } catch (uploadErr) {
            console.error(`Failed to upload ${file.name}:`, uploadErr);
            setError(`⚠️ Case created but failed to upload ${file.name}`);
          }
        }
      }

      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create case");
      setLoading(false);
    }
  };



  return (
    <>
      <Navbar />
      <div className="create-case-container">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-case-form">
          {/* Header */}
          <div className="create-case-header">
            <h1>Create New Case</h1>
          </div>

          {/* Main Content Grid */}
          <div className="create-case-grid">
            {/* Left Panel - Case Info & Documents */}
            <div className="create-case-left">
              {/* Case Information Section */}
              <div className="form-section">
                <h3 className="section-title">Case Information</h3>
                <div className="form-fields-grid">
                  <div className="form-field">
                    <label htmlFor="dateOfBirth">Claimant DOB</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  {/* <div className="form-field">
                    <label htmlFor="specialty">Specialty</label>
                    <select className="form-input">
                      <option>Select specialty...</option>
                      <option>Cardiology</option>
                      <option>Orthopedic</option>
                      <option>Neurology</option>
                    </select>
                  </div> */}
                </div>
                
                <div className="form-field">
                  <label htmlFor="notes">Description</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Enter case description..."
                    rows="6"
                    required
                  ></textarea>
                </div>
              </div>

              {/* Documents Section */}
              <div className="form-section">
                <h3 className="section-title">Documents</h3>
                
                {/* Uploaded Files */}
                {formData.files.length > 0 && (
                  <div className="documents-list">
                    {formData.files.map((file, index) => (
                      <div key={index} className="document-item">
                        <div className="document-icon">📄</div>
                        <div className="document-details">
                          <div className="document-name">{file.name}</div>
                          <div className="document-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                        <button 
                          type="button"
                          className="document-remove"
                          onClick={() => removeFile(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                <div
                  className={`upload-area ${isDragging ? "dragging" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <label htmlFor="fileInput" className="upload-label">
                    <div className="upload-icon">⬆️</div>
                    <div className="upload-text">Click to upload document</div>
                    <div className="upload-hint">PDF, JPG, PNG up to 10MB</div>
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                    className="file-input-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Right Panel - Submit Actions */}
            <div className="create-case-right">
              <div className="action-panel">
                <div className="action-info">
                  <p className="action-label">Ready to submit?</p>
                  <p className="action-text">Please review all information above before submitting your case.</p>
                </div>
                
                <div className="profile-button-flex">
                  <button
                    type="submit"
                    className="btn-submit-case"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "✓ Submit Case"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="btn-cancel-case"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
