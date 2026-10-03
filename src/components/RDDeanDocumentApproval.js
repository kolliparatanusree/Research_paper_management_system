import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronDown,
  FiDownload,
  FiUser,
  FiCalendar,
  FiTarget,
  FiBookOpen,
  FiX,
    FiEye
} from "react-icons/fi";

import "./RDDeanDocumentApproval.css";

// const API_BASE_URL = "";
import { API_BASE_URL } from "../config";

const rejectionReasons = [
  "Incomplete document",
  "Invalid journal",
  "Duplicate submission",
  "Incorrect paper details",
  "Journal not indexed",
  "Other"
];

export default function RDDeanDocumentApproval() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [previewFile, setPreviewFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchSubmissions = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/all-submitted-documents`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.documents || response.data?.data || [];

      setSubmissions(data);
    } catch (error) {
      console.error("R&D Dean document fetch error:", error);

      setSubmissions([]);

      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: "Unable to load submitted documents."
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const toggleDocument = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getFacultyId = (doc) =>
    doc.facultyId || doc.userId || "Not Available";

  const getTitle = (doc) =>
    doc.paperTitle || "Untitled Paper";

  const getType = (doc) =>
    doc.type || "Not Specified";

  const getTarget = (doc) =>
    doc.target || "Not Available";

  const getUploadedDate = (doc) => {
    if (!doc.uploadedAt) return "Not Available";

    return new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getUploadedDateTime = (doc) => {
    if (!doc.uploadedAt) return "Not Available";

    return new Date(doc.uploadedAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const types = useMemo(() => {
    return [
      ...new Set(
        submissions
          .map((doc) => doc.type)
          .filter(Boolean)
      )
    ].sort();
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return submissions.filter((doc) => {
      const matchesSearch =
        !term ||
        getFacultyId(doc).toLowerCase().includes(term) ||
        getTitle(doc).toLowerCase().includes(term) ||
        (doc.uid || "").toLowerCase().includes(term) ||
        (doc.type || "").toLowerCase().includes(term) ||
        (doc.target || "").toLowerCase().includes(term);

      const matchesType =
        !typeFilter ||
        (doc.type || "").toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [submissions, searchTerm, typeFilter]);

  const stats = useMemo(() => {
    const total = submissions.length;

    const journal = submissions.filter(
      (doc) => doc.type?.toLowerCase() === "journal"
    ).length;

    const conference = submissions.filter(
      (doc) => doc.type?.toLowerCase() === "conference"
    ).length;

    const today = new Date();

    const submittedToday = submissions.filter((doc) => {
      if (!doc.uploadedAt) return false;

      const date = new Date(doc.uploadedAt);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;

    return {
      total,
      journal,
      conference,
      submittedToday
    };
  }, [submissions]);

//   const downloadFile = (file) => {
//     if (!file?.base64) {
//       Swal.fire({
//         icon: "info",
//         title: "File Not Available",
//         text: "This document is not available for download."
//       });
//       return;
//     }


//     const link = document.createElement("a");

//     link.href = `data:${file.contentType};base64,${file.base64}`;
//     link.download = file.filename || "document";

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };


const downloadFile = (file) => {
  if (!file?.base64) {
    Swal.fire({
      icon: "info",
      title: "File Not Available",
      text: "This document is not available for download."
    });
    return;
  }

  const link = document.createElement("a");

  link.href = `data:${
    file.contentType || "application/pdf"
  };base64,${file.base64}`;

  link.download = file.filename || "document";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


// ================= PDF PREVIEW =================

const previewPdf = (file) => {
  if (!file?.base64) {
    Swal.fire({
      icon: "info",
      title: "File Not Available",
      text: "This PDF is not available for preview."
    });
    return;
  }

  const pdfUrl = `data:${
    file.contentType || "application/pdf"
  };base64,${file.base64}`;

  setPreviewFile({
    url: pdfUrl,
    filename: file.filename || "Document.pdf"
  });
};


const closePreview = () => {
  setPreviewFile(null);
};
  const handleAccept = async (id) => {
    const result = await Swal.fire({
      title: "Accept Document Submission?",
      text: "A PID will be generated for this submission.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Accept & Generate PID",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b"
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/document-submission/${id}/accept`
      );

      const pid = response.data?.pid;

      await Swal.fire({
        icon: "success",
        title: "Submission Accepted!",
        html: pid
          ? `<p>Document submission has been approved.</p>
             <p><strong>PID:</strong> ${pid}</p>`
          : "Document submission has been approved.",
        confirmButtonText: "OK",
        confirmButtonColor: "#10b981"
      });

      setSubmissions((prev) =>
        prev.filter((doc) => doc._id !== id)
      );

      setExpandedId(null);
    } catch (error) {
      console.error("Document acceptance error:", error);

      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text:
          error.response?.data?.message ||
          "Failed to accept the document submission."
      });
    }
  };

  const handleReject = async (id) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Document Submission",
      html: `
        <select id="reasonSelect" class="swal2-select">
          <option value="">Select reason</option>
          ${rejectionReasons
            .map(
              (reason) =>
                `<option value="${reason}">${reason}</option>`
            )
            .join("")}
        </select>

        <input
          id="otherReason"
          class="swal2-input"
          placeholder="Enter custom reason"
          style="display:none"
        />
      `,
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",

      didOpen: () => {
        const select =
          document.getElementById("reasonSelect");

        const otherInput =
          document.getElementById("otherReason");

        select.addEventListener("change", () => {
          otherInput.style.display =
            select.value === "Other"
              ? "block"
              : "none";
        });
      },

      preConfirm: () => {
        const select =
          document.getElementById("reasonSelect").value;

        const other =
          document.getElementById("otherReason").value.trim();

        if (!select) {
          Swal.showValidationMessage(
            "Please select a rejection reason."
          );
          return false;
        }

        if (select === "Other" && !other) {
          Swal.showValidationMessage(
            "Please enter the rejection reason."
          );
          return false;
        }

        return select === "Other" ? other : select;
      }
    });

    if (!reason) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/document-submission/${id}/reject`,
        {
          reason
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Submission Rejected",
        text:
          response.data?.message ||
          "Document submission has been rejected.",
        confirmButtonColor: "#10b981"
      });

      setSubmissions((prev) =>
        prev.filter((doc) => doc._id !== id)
      );

      setExpandedId(null);
    } catch (error) {
      console.error("Document rejection error:", error);

      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text:
          error.response?.data?.message ||
          "Failed to reject the document submission."
      });
    }
  };

  if (loading) {
    return (
      <div className="document-approval-page">
        <div className="document-loading-state">
          <div className="document-loading-spinner"></div>
          <h3>Loading Document Submissions...</h3>
          <p>Please wait while we retrieve pending submissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-approval-page">

      {/* HERO */}
      <div className="document-approval-hero">
        <div className="document-hero-content">

          <div className="document-hero-icon">
            <FiFileText />
          </div>

          <div className="document-hero-text">
            <div className="document-title-row">
              <h1>Document Submission Approval</h1>

              <span className="document-role-badge">
                R&D Dean
              </span>
            </div>

            <p>
              Review and approve research-paper submissions
              and generate PIDs for accepted documents.
            </p>
          </div>

          <button
            className="document-refresh-btn"
            onClick={() => fetchSubmissions(false)}
            disabled={refreshing}
            title="Refresh"
          >
            <FiRefreshCw
              className={refreshing ? "spinning" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>
      </div>

      {/* STATS */}
      <div className="document-stats-bar">

        <div className="document-stat-card stat-total">
          <div className="document-stat-icon">
            <FiFileText />
          </div>

          <div>
            <span className="document-stat-value">
              {stats.total}
            </span>
            <span className="document-stat-label">
              Pending Documents
            </span>
          </div>
        </div>

        <div className="document-stat-card stat-journal">
          <div className="document-stat-icon">
            <FiBookOpen />
          </div>

          <div>
            <span className="document-stat-value">
              {stats.journal}
            </span>
            <span className="document-stat-label">
              Journal
            </span>
          </div>
        </div>

        <div className="document-stat-card stat-conference">
          <div className="document-stat-icon">
            <FiTarget />
          </div>

          <div>
            <span className="document-stat-value">
              {stats.conference}
            </span>
            <span className="document-stat-label">
              Conference
            </span>
          </div>
        </div>

        <div className="document-stat-card stat-today">
          <div className="document-stat-icon">
            <FiClock />
          </div>

          <div>
            <span className="document-stat-value">
              {stats.submittedToday}
            </span>
            <span className="document-stat-label">
              Submitted Today
            </span>
          </div>
        </div>

      </div>

      {/* CONTROL PANEL */}
      <div className="document-control-panel">

        <div className="document-control-heading">
          <div>
            <h2>
              <FiFilter />
              Pending Submissions
            </h2>

            <p>
              Research documents awaiting R&D Dean approval
            </p>
          </div>

          <span className="document-result-count">
            {filteredSubmissions.length} Results
          </span>
        </div>

        <div className="document-toolbar">

          <div className="document-search-wrapper">
            <FiSearch />

            <input
              type="text"
              placeholder="Search Faculty, Paper Title, UID..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            {searchTerm && (
              <button
                className="document-clear-search"
                onClick={() => setSearchTerm("")}
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="document-select-wrapper">
            <FiFilter />

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              <option value="">All Types</option>

              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* REQUEST LIST */}
      <div className="document-section-header">

        <div>
          <h2>
            <FiFileText />
            Submitted Documents
          </h2>

          <p>
            Review the details and supporting documents before
            making an approval decision.
          </p>
        </div>

        {(searchTerm || typeFilter) && (
          <button
            className="document-reset-btn"
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("");
            }}
          >
            Clear Filters
          </button>
        )}

      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="document-empty-state">
          <div className="document-empty-icon">
            <FiCheckCircle />
          </div>

          <h3>No Pending Documents</h3>

          <p>
            There are currently no document submissions
            waiting for R&D Dean approval.
          </p>

          <button
            className="document-empty-refresh-btn"
            onClick={() => fetchSubmissions(false)}
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      ) : (
        <div className="document-request-list">

          {filteredSubmissions.map((doc, index) => {

            const isExpanded =
              expandedId === doc._id;

            return (
              <div
                className={`document-request-card ${
                  isExpanded ? "is-expanded" : ""
                }`}
                key={doc._id}
              >

                {/* CARD TOP */}
                <div className="document-card-top">

                  <div className="document-request-number">
                    #{String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="document-request-main">

                    <div className="document-request-badges">
                      <span className="document-pending-badge">
                        Pending Review
                      </span>

                      <span className="document-type-badge">
                        {getType(doc)}
                      </span>
                    </div>

                    <h3>{getTitle(doc)}</h3>

                    <div className="document-request-meta">
                      <span>
                        <FiUser />
                        {getFacultyId(doc)}
                      </span>

                      <span className="document-meta-separator">
                        •
                      </span>

                      <span>
                        UID: {doc.uid || "Not Available"}
                      </span>
                    </div>

                  </div>

                  <div className="document-request-right">

                    <div className="document-request-date">
                      <FiCalendar />
                      {getUploadedDate(doc)}
                    </div>

                    <button
                      className={`document-expand-btn ${
                        isExpanded ? "active" : ""
                      }`}
                      onClick={() =>
                        toggleDocument(doc._id)
                      }
                    >
                      <FiChevronDown />
                    </button>

                  </div>

                </div>

                {/* QUICK INFO */}
                <div className="document-quick-info">

                  <div className="document-quick-item">
                    <span className="document-quick-icon">
                      <FiUser />
                    </span>
                    <div>
                      <small>Faculty</small>
                      <strong>
                        {getFacultyId(doc)}
                      </strong>
                    </div>
                  </div>

                  <div className="document-quick-item">
                    <span className="document-quick-icon">
                      <FiFileText />
                    </span>
                    <div>
                      <small>UID</small>
                      <strong>
                        {doc.uid || "Not Available"}
                      </strong>
                    </div>
                  </div>

                  <div className="document-quick-item">
                    <span className="document-quick-icon">
                      <FiTarget />
                    </span>
                    <div>
                      <small>Target</small>
                      <strong>
                        {getTarget(doc)}
                      </strong>
                    </div>
                  </div>

                  <div className="document-quick-item">
                    <span className="document-quick-icon">
                      <FiCalendar />
                    </span>
                    <div>
                      <small>Uploaded</small>
                      <strong>
                        {getUploadedDate(doc)}
                      </strong>
                    </div>
                  </div>

                </div>

                {/* EXPANDED CONTENT */}
                {isExpanded && (
                  <div className="document-expanded-content">

                    <div className="document-expanded-divider"></div>

                    {/* DETAILS */}
                    <div className="document-detail-section">

                      <h3>
                        <FiFileText />
                        Submission Details
                      </h3>

                      <div className="document-detail-grid">

                        <div className="document-detail-box">
                          <span>Faculty ID</span>
                          <strong>
                            {getFacultyId(doc)}
                          </strong>
                        </div>

                        <div className="document-detail-box">
                          <span>UID</span>
                          <strong>
                            {doc.uid || "Not Available"}
                          </strong>
                        </div>

                        <div className="document-detail-box">
                          <span>Type</span>
                          <strong>
                            {getType(doc)}
                          </strong>
                        </div>

                        <div className="document-detail-box">
                          <span>Target</span>
                          <strong>
                            {getTarget(doc)}
                          </strong>
                        </div>

                        <div className="document-detail-box">
                          <span>Uploaded</span>
                          <strong>
                            {getUploadedDateTime(doc)}
                          </strong>
                        </div>

                        <div className="document-detail-box">
                          <span>ISSN</span>
                          <strong>
                            {doc.issn || "Not Available"}
                          </strong>
                        </div>

                      </div>
                    </div>

                    {/* ABSTRACT */}
                    <div className="document-abstract-section">

                      <h3>
                        <FiBookOpen />
                        Abstract
                      </h3>

                      <div className="document-abstract-content">
                        {doc.abstract ||
                          "No abstract provided."}
                      </div>

                    </div>

                    {/* DOCUMENTS */}
                    {/* <div className="document-files-section">

                      <h3>
                        <FiDownload />
                        Supporting Documents
                      </h3>

                      <div className="document-file-grid">

                        <button
                          className="document-file-btn"
                          disabled={!doc.acceptanceLetter?.base64}
                          onClick={() =>
                            downloadFile(
                              doc.acceptanceLetter
                            )
                          }
                        >
                          <FiDownload />

                          <span>
                            <strong>
                              Acceptance Letter
                            </strong>
                            <small>
                              {doc.acceptanceLetter?.filename ||
                                "Not Available"}
                            </small>
                          </span>
                        </button>

                        <button
                          className="document-file-btn"
                          disabled={!doc.indexingProof?.base64}
                          onClick={() =>
                            downloadFile(
                              doc.indexingProof
                            )
                          }
                        >
                          <FiDownload />

                          <span>
                            <strong>
                              Indexing Proof
                            </strong>
                            <small>
                              {doc.indexingProof?.filename ||
                                "Not Available"}
                            </small>
                          </span>
                        </button>

                        <button
                          className="document-file-btn"
                          disabled={!doc.paymentReceipt?.base64}
                          onClick={() =>
                            downloadFile(
                              doc.paymentReceipt
                            )
                          }
                        >
                          <FiDownload />

                          <span>
                            <strong>
                              Payment Receipt
                            </strong>
                            <small>
                              {doc.paymentReceipt?.filename ||
                                "Not Available"}
                            </small>
                          </span>
                        </button>

                      </div>

                    </div> */}

                    <div className="document-files-section">

  <h3>
    <FiDownload />
    Supporting Documents
  </h3>

  <div className="document-file-grid">

    {/* ================= ACCEPTANCE LETTER ================= */}
    <div className="document-file-actions">

      <button
  className="document-file-btn"
  disabled={!doc.publishedPaper?.base64}
  onClick={() =>
    previewPdf(doc.publishedPaper)
  }
>
  <FiFileText />

  <span>
    <strong>
      Published Paper
    </strong>

    <small>
      {doc.publishedPaper?.filename ||
        "Not Available"}
    </small>
  </span>

  <span className="document-view-label">
    View
  </span>
</button>

      <button
  className="document-download-btn"
  disabled={!doc.publishedPaper?.base64}
  onClick={() =>
    downloadFile(doc.publishedPaper)
  }
  title="Download Published Paper"
>
  <FiDownload />
</button>
    </div>


    {/* ================= INDEXING PROOF ================= */}
    <div className="document-file-actions">

      <button
        className="document-file-btn"
        disabled={!doc.indexingProof?.base64}
        onClick={() =>
          previewPdf(doc.indexingProof)
        }
      >
        <FiFileText />

        <span>
          <strong>
            Indexing Proof
          </strong>
          <strong>
          <small>
            {doc.indexingProof?.filename ||
              "Not Available"}
          </small></strong>
          <small className="indexing-proof-note">
  Indexing Proof is required only for <br/> Journal and Conference.
</small>
          
        </span>
          <span className="document-view-label">
      View
    </span>
      </button>

      <button
        className="document-download-btn"
        disabled={!doc.indexingProof?.base64}
        onClick={() =>
          downloadFile(doc.indexingProof)
        }
        title="Download Indexing Proof"
      >
        <FiDownload />
      </button>

    </div>


    {/* ================= PAYMENT RECEIPT ================= */}
    <div className="document-file-actions">

      <button
        className="document-file-btn"
        disabled={!doc.paymentReceipt?.base64}
        onClick={() =>
          previewPdf(doc.paymentReceipt)
        }
      >
        <FiFileText />

        <span>
          <strong>
            Payment Receipt
          </strong>

          <small>
            {doc.paymentReceipt?.filename ||
              "Not Available"}
          </small>
        </span>
          <span className="document-view-label">
      View
    </span>
      </button>

      <button
        className="document-download-btn"
        disabled={!doc.paymentReceipt?.base64}
        onClick={() =>
          downloadFile(doc.paymentReceipt)
        }
        title="Download Payment Receipt"
      >
        <FiDownload />
      </button>

    </div>

  </div>

</div>

                    {/* ACTIONS */}
                    <div className="document-approval-footer">

                      <div className="document-approval-note">
                        <FiClock />

                        <span>
                          This submission is awaiting R&D
                          Dean approval. Accepting it will
                          generate a PID.
                        </span>
                      </div>

                      <div className="document-approval-actions">

                        <button
                          className="document-reject-btn"
                          onClick={() =>
                            handleReject(doc._id)
                          }
                        >
                          <FiXCircle />
                          Reject
                        </button>

                        <button
                          className="document-accept-btn"
                          onClick={() =>
                            handleAccept(doc._id)
                          }
                        >
                          <FiCheckCircle />
                          Accept & Generate PID
                        </button>

                      </div>

                    </div>

                  </div>
                )}

              </div>
            );
          })}

        </div>
      )}

      <div className="document-page-footer">
        <FiCheckCircle />
        <span>
          R&D Dean Document Approval Panel
        </span>
      </div>

      {/* PDF PREVIEW MODAL */}
{previewFile && (
  <div className="pdf-preview-overlay">

    <div className="pdf-preview-modal">

      {/* HEADER */}
      <div className="pdf-preview-header">

        <div className="pdf-preview-title">
          <FiFileText />

          <div>
            <h3>Document Preview</h3>

            <span>
              {previewFile.filename}
            </span>
          </div>
        </div>

        <button
          className="pdf-preview-close"
          onClick={closePreview}
          title="Close Preview"
        >
          <FiX />
        </button>

      </div>

      {/* PDF */}
      <div className="pdf-preview-body">

        <iframe
          src={previewFile.url}
          title={previewFile.filename}
          className="pdf-preview-frame"
        />

      </div>

    </div>

  </div>
)}
    </div>
  );
}