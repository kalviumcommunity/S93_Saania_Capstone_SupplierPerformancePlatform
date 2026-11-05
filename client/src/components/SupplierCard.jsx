import { useState } from "react";

const API_URL = "http://localhost:5000/api/suppliers";

function Score({ label, value }) {
  return (
    <div className="score-item">
      <span>{label}</span>
      <strong>{value === null ? "—" : `${value}%`}</strong>

      <div className="score-track">
        <div
          className="score-fill"
          style={{
            width: `${value === null ? 0 : Math.min(100, Math.max(0, value))}%`,
          }}
        />
      </div>
    </div>
  );
}

function SupplierCard({ supplier, onEdit, onDelete, token }) {
  const performance = supplier.performance;
  const supplierId = supplier._id || supplier.id;

  const quality =
    performance?.qualityScore ?? supplier.quality ?? null;

  const delivery =
    performance?.deliveryScore ?? supplier.delivery ?? null;

  const cost =
    performance?.costScore ?? supplier.cost ?? null;

  const overall =
    performance?.overallScore ?? supplier.score ?? null;

  const [documents, setDocuments] = useState([]);
  const [showDocuments, setShowDocuments] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function getStatusClass(status) {
    if (status === "Active") return "status-active";
    if (status === "Inactive") return "status-inactive";
    return "status-pending";
  }

  // Fetch supplier documents
  async function fetchDocuments() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/${supplierId}/documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load documents");
      }

      setDocuments(data.documents || []);
    } catch (error) {
      setMessage(error.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  // Upload document
  async function handleUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);

    try {
      setMessage("");

      const response = await fetch(
        `${API_URL}/${supplierId}/documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Document upload failed");
      }

      setMessage("Document uploaded successfully.");

      await fetchDocuments();
    } catch (error) {
      setMessage(error.message || "Document upload failed");
    } finally {
      event.target.value = "";
    }
  }

  // Show or hide documents
  async function handleViewDocuments() {
    const nextState = !showDocuments;

    setShowDocuments(nextState);

    if (nextState) {
      await fetchDocuments();
    }
  }

  // Download document
  async function handleDownload(doc) {
    try {
      setMessage("");

      const response = await fetch(
        `${API_URL}/${supplierId}/documents/${doc._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Document download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = doc.originalName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error.message || "Document download failed");
    }
  }

  // Delete document
  async function handleDeleteDocument(documentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const response = await fetch(
        `${API_URL}/${supplierId}/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Document deletion failed");
      }

      setMessage("Document deleted successfully.");

      await fetchDocuments();
    } catch (error) {
      setMessage(error.message || "Document deletion failed");
    }
  }

  return (
    <article className="supplier-card">
      <div className="supplier-card-heading">
        <div className="supplier-identity">
          <div className="supplier-avatar">
            {supplier.name?.charAt(0)?.toUpperCase() || "S"}
          </div>

          <div>
            <h3>{supplier.name}</h3>
            <p>{supplier.category || "Uncategorized"}</p>
          </div>
        </div>

        <span className={`status-badge ${getStatusClass(supplier.status)}`}>
          {supplier.status || "Pending"}
        </span>
      </div>

      <div className="supplier-info">
        <p>
          <span>Email</span>
          {supplier.email || "—"}
        </p>

        <p>
          <span>Contact</span>
          {supplier.contactPerson || "—"}
        </p>
      </div>

      <div className="scores-heading">
        <span>PERFORMANCE SCORES</span>
        <span>{performance ? "Evaluated" : "Not evaluated"}</span>
      </div>

      <div className="scores-grid">
        <Score label="Quality" value={quality} />
        <Score label="Delivery" value={delivery} />
        <Score label="Cost" value={cost} />
      </div>

      <div className="overall-row">
        <span>Overall Score</span>
        <strong>
          {overall === null ? "Not evaluated" : `${overall}%`}
        </strong>
      </div>

      <div className="supplier-actions">
        <button
          className="action-edit"
          onClick={() => onEdit(supplier)}
          title="Edit supplier"
        >
          <span>✎</span> Edit
        </button>

        <button
          className="action-delete"
          onClick={() => onDelete(supplier)}
          title="Delete supplier"
        >
          <span>⌫</span> Delete
        </button>
      </div>

      {/* Supplier Document Upload Section */}
      <div className="document-section">
        <hr />

        <h4>Supplier Documents</h4>

        <p>Upload supplier certificates, agreements and invoices.</p>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleUpload}
        />

        <button
          type="button"
          onClick={handleViewDocuments}
        >
          {showDocuments ? "Hide Documents" : "View Documents"}
        </button>

        {message && (
          <p role="status">{message}</p>
        )}

        {showDocuments && (
          <div className="document-list">
            {loading ? (
              <p>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p>No documents uploaded.</p>
            ) : (
              documents.map((doc) => (
                <div className="document-item" key={doc._id}>
                  <p>{doc.originalName}</p>

                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                  >
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc._id)}
                  >
                    Delete Document
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default SupplierCard;