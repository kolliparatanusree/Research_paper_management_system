import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./UIDStatusList.css";
import Swal from "sweetalert2";

export default function UIDStatusList({ facultyId }) {
  const [allRequests, setAllRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);

  const [filter, setFilter] = useState("approved");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [editingRequest, setEditingRequest] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const toggleCard = (id) => {
  setExpandedCards((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};


  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  const itemsPerPage = 5;

  /* =====================================================
     SAFE TEXT
  ===================================================== */

  const safeText = (value) => {
    if (value === null || value === undefined) return "";

    if (typeof value !== "string") {
      return String(value);
    }

    return value.trim();
  };

  /* =====================================================
     FETCH DATA
  ===================================================== */

  const fetchData = useCallback(
    async (showLoader = true) => {
      if (!facultyId) {
        setAllRequests([]);
        setRejectedRequests([]);
        setLoading(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const [uidResponse, rejectedResponse] =
          await Promise.all([
            fetch(`/api/faculty/uid-requests/${facultyId}`),
            fetch(`/api/faculty/rejected-uids/${facultyId}`),
          ]);

        if (!uidResponse.ok || !rejectedResponse.ok) {
          throw new Error("Failed to fetch UID data");
        }

        const uidData = await uidResponse.json();
        const rejectedData = await rejectedResponse.json();

        setAllRequests(
          Array.isArray(uidData) ? uidData : []
        );

        setRejectedRequests(
          Array.isArray(rejectedData)
            ? rejectedData
            : []
        );
      } catch (error) {
        console.error("UID fetch error:", error);

        Swal.fire({
          icon: "error",
          title: "Unable to Load",
          text: "Failed to load UID status.",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [facultyId]
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      await fetchData(true);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [fetchData]);

  /* =====================================================
     RESET PAGE
  ===================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, sortBy, facultyId]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const counts = useMemo(() => {
    const approved = allRequests.filter(
      (request) =>
        request.hodAccept &&
        request.principalAccept &&
        request.adminAccept &&
        safeText(request.uid)
    ).length;

    const pending = allRequests.filter(
      (request) =>
        !(
          request.hodAccept &&
          request.principalAccept &&
          request.adminAccept &&
          safeText(request.uid)
        )
    ).length;

    return {
      approved,
      pending,
      rejected: rejectedRequests.length,
    };
  }, [allRequests, rejectedRequests]);

  /* =====================================================
     FILTER + SEARCH + SORT
  ===================================================== */

  const filtered = useMemo(() => {
    let result = [];

    if (filter === "approved") {
      result = allRequests.filter(
        (request) =>
          request.hodAccept &&
          request.principalAccept &&
          request.adminAccept &&
          safeText(request.uid)
      );
    }

    if (filter === "pending") {
      result = allRequests.filter(
        (request) =>
          !(
            request.hodAccept &&
            request.principalAccept &&
            request.adminAccept &&
            safeText(request.uid)
          )
      );
    }

    if (filter === "rejected") {
      result = [...rejectedRequests];
    }

    /* SEARCH */

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((request) => {
        const title = safeText(
          request.paperTitle
        ).toLowerCase();

        const uid = safeText(
          request.uid
        ).toLowerCase();

        const target = safeText(
          request.target
        ).toLowerCase();

        return (
          title.includes(search) ||
          uid.includes(search) ||
          target.includes(search)
        );
      });
    }

    /* SORT */

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.submittedAt || 0) -
          new Date(a.submittedAt || 0)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.submittedAt || 0) -
          new Date(b.submittedAt || 0)
        );
      }

      if (sortBy === "title-asc") {
        return safeText(a.paperTitle).localeCompare(
          safeText(b.paperTitle)
        );
      }

      if (sortBy === "title-desc") {
        return safeText(b.paperTitle).localeCompare(
          safeText(a.paperTitle)
        );
      }

      return 0;
    });

    return result;
  }, [
    filter,
    allRequests,
    rejectedRequests,
    searchTerm,
    sortBy,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / itemsPerPage)
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const paginatedData = filtered.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* =====================================================
     STATUS
  ===================================================== */

  const getStatusLabel = (value) => {
    return value ? (
      <span className="status-badge status-approved">
        <span>✓</span>
        Approved
      </span>
    ) : (
      <span className="status-badge status-pending">
        <span>⌛</span>
        Pending
      </span>
    );
  };

  /* =====================================================
     APPROVAL PROGRESS
  ===================================================== */

  const getApprovalProgress = (request) => {
    let completed = 0;

    if (request.hodAccept) completed++;
    if (request.principalAccept) completed++;
    if (request.adminAccept) completed++;

    return completed;
  };

  /* =====================================================
     CURRENT APPROVAL STAGE
  ===================================================== */

  const getCurrentStage = (request) => {
    if (!request.hodAccept) {
      return {
        text: "Waiting for HOD approval",
        className: "stage-hod",
      };
    }

    if (!request.principalAccept) {
      return {
        text: "Waiting for Principal approval",
        className: "stage-principal",
      };
    }

    if (!request.adminAccept) {
      return {
        text: "Waiting for Admin approval",
        className: "stage-admin",
      };
    }

    if (safeText(request.uid)) {
      return {
        text: "UID generated successfully",
        className: "stage-complete",
      };
    }

    return {
      text: "Processing request",
      className: "stage-processing",
    };
  };

  /* =====================================================
     ABSTRACT
  ===================================================== */

  const toggleAbstract = (id) => {
    setExpandedAbstracts((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  /* =====================================================
     DATE
  ===================================================== */

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const openEditModal = (request) => {
    setEditingRequest({
      ...request,
    });
  };

  const closeEditModal = () => {
    if (!updating) {
      setEditingRequest(null);
    }
  };

  /* =====================================================
     UPDATE
  ===================================================== */

  const handleUpdate = async () => {
    if (!editingRequest) return;

    const paperTitle = safeText(
      editingRequest.paperTitle
    );

    const abstract = safeText(
      editingRequest.abstract
    );

    const target = safeText(
      editingRequest.target
    );

    if (!paperTitle) {
      Swal.fire(
        "Paper Title Required",
        "Please enter the paper title.",
        "warning"
      );
      return;
    }

    if (!abstract) {
      Swal.fire(
        "Abstract Required",
        "Please enter the abstract.",
        "warning"
      );
      return;
    }

    if (!target) {
      Swal.fire(
        "Target Required",
        "Please enter the target.",
        "warning"
      );
      return;
    }

    setUpdating(true);

    try {
      const res = await fetch(
        `/api/faculty/uid-request/${editingRequest._id}/edit/${facultyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paperTitle,
            abstract,
            target,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Failed to update UID request"
        );
      }

      const updatedRequest = {
        ...editingRequest,
        paperTitle,
        abstract,
        target,
      };

      setAllRequests((previous) =>
        previous.map((request) =>
          request._id === editingRequest._id
            ? updatedRequest
            : request
        )
      );

      setEditingRequest(null);

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text:
          data?.message ||
          "UID request updated successfully.",
        confirmButtonColor: "#16a34a",
      });
    } catch (error) {
      console.error("UID update error:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.message ||
          "Unable to update UID request.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setUpdating(false);
    }
  };

  /* =====================================================
     EMPTY MESSAGE
  ===================================================== */

  const getEmptyMessage = () => {
    if (searchTerm.trim()) {
      return "No matching requests found.";
    }

    if (filter === "approved") {
      return "No approved UID requests found.";
    }

    if (filter === "pending") {
      return "No pending UID requests found.";
    }

    return "No rejected UID requests found.";
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="uid-status-wrapper">

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="uid-toolbar">

        <div className="filter-container">

          <button
            type="button"
            onClick={() => setFilter("approved")}
            className={`filter-btn ${
              filter === "approved"
                ? "active approved-filter"
                : ""
            }`}
          >
            <span>✓</span>
            <span>Approved</span>

            <span className="filter-count">
              {counts.approved}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`filter-btn ${
              filter === "pending"
                ? "active pending-filter"
                : ""
            }`}
          >
            <span>⌛</span>
            <span>Pending</span>

            <span className="filter-count">
              {counts.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("rejected")}
            className={`filter-btn ${
              filter === "rejected"
                ? "active rejected-filter"
                : ""
            }`}
          >
            <span>×</span>
            <span>Rejected</span>

            <span className="filter-count">
              {counts.rejected}
            </span>
          </button>

        </div>

        {/* REFRESH */}

        <button
          type="button"
          className={`refresh-btn ${
            refreshing ? "refreshing" : ""
          }`}
          onClick={() => fetchData(false)}
          disabled={refreshing}
          title="Refresh UID requests"
        >
          <span className="refresh-icon">↻</span>

          <span>
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>

      </div>

      {/* =================================================
          SEARCH + SORT
      ================================================= */}

      <div className="search-sort-bar">

        <div className="search-box">

          <span className="search-icon">⌕</span>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search paper title, UID or target..."
          />

          {searchTerm && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

        <div className="sort-box">

          <label htmlFor="uid-sort">
            Sort
          </label>

          <select
            id="uid-sort"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="title-asc">
              Title A–Z
            </option>

            <option value="title-desc">
              Title Z–A
            </option>
          </select>

        </div>

      </div>

      {/* =================================================
          RESULT SUMMARY
      ================================================= */}

      {!loading && (
        <div className="result-summary">

          <span>
            Showing{" "}
            <strong>{filtered.length}</strong>{" "}
            {filtered.length === 1
              ? "request"
              : "requests"}
          </span>

          {searchTerm && (
            <span className="search-result-label">
              for "{searchTerm}"
            </span>
          )}

        </div>
      )}

      {/* =================================================
          LIST
      ================================================= */}

      <div className="uid-status-list">

        {loading ? (
          <div className="uid-state-card">

            <div className="loading-spinner"></div>

            <p>
              Loading UID requests...
            </p>

          </div>
        ) : filtered.length === 0 ? (
          <div className="uid-state-card empty-state">

            <div className="empty-icon">
              {searchTerm
                ? "⌕"
                : filter === "approved"
                ? "✓"
                : filter === "pending"
                ? "⌛"
                : "×"}
            </div>

            <h3>
              {getEmptyMessage()}
            </h3>

            <p>
              {searchTerm
                ? "Try a different search term."
                : `Your ${filter} UID requests will appear here.`}
            </p>

          </div>
        ) : (
          paginatedData.map((req) => {

            const abstract =
              safeText(req.abstract);

            const isAbstractExpanded =
              expandedAbstracts[req._id];

            const approvalProgress =
              getApprovalProgress(req);

            const currentStage =
              getCurrentStage(req);

            return (
              <div
                key={req._id}
                className="uid-status-card"
              >

                {/* HEADER */}

                <div className="card-header">

                  <div className="title-section">

                    <h3 className="paper-title">
                      {safeText(
                        req.paperTitle
                      ) || "Untitled Paper"}
                    </h3>

                    <div className="paper-subtitle">
                      {safeText(req.type) ||
                        "Type not specified"}
                    </div>

                  </div>

                  {req.uid && (
                    <div className="uid-badge">

                      <span>UID</span>

                      <strong>
                        {safeText(req.uid)}
                      </strong>

                    </div>
                  )}

                </div>

                {/* INFORMATION */}

                <div className="request-info-grid">

                  <div className="info-item">
                    <span className="info-label">
                      Type
                    </span>

                    <span className="info-value">
                      {safeText(req.type) ||
                        "Not specified"}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">
                      Target
                    </span>

                    <span className="info-value">
                      {safeText(req.target) ||
                        "Not specified"}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">
                      Submitted
                    </span>

                    <span className="info-value">
                      {formatDate(
                        req.submittedAt
                      )}
                    </span>
                  </div>

                </div>

                {/* CO AUTHORS */}
{expandedCards[req._id] && (
  <div className="expanded-card-content">
                {req.coAuthors?.hasCoAuthors &&
                  Array.isArray(
                    req.coAuthors.authors
                  ) &&
                  req.coAuthors.authors.length >
                    0 && (

                    <div className="coauthors-section">

                      <div className="section-label">
                        <span>👥</span>
                        Co Authors
                      </div>

                      <div className="coauthors-list">

                        {req.coAuthors.authors.map(
                          (author, index) => {

                            const name =
                              safeText(
                                author?.name
                              ) ||
                              "Unnamed Author";

                            const affiliation =
                              author?.affiliation ===
                              "Other"
                                ? safeText(
                                    author?.otherAffiliation
                                  )
                                : safeText(
                                    author?.affiliation
                                  );

                            return (
                              <div
                                className="coauthor-item"
                                key={`${req._id}-${index}`}
                              >

                                <div className="author-avatar">
                                  {name
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="author-details">

                                  <strong>
                                    {name}
                                  </strong>

                                  {affiliation && (
                                    <span>
                                      {affiliation}
                                    </span>
                                  )}

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>
                  )}

                {/* ABSTRACT */}

                <div className="abstract-section">

                  <div className="section-label">
                    <span>📝</span>
                    Abstract
                  </div>

                  <p
                    className={
                      isAbstractExpanded
                        ? "abstract-text expanded"
                        : "abstract-text"
                    }
                  >
                    {abstract ||
                      "No abstract provided."}
                  </p>

                  {abstract.length > 180 && (
                    <button
                      type="button"
                      className="abstract-toggle"
                      onClick={() =>
                        toggleAbstract(req._id)
                      }
                    >
                      {isAbstractExpanded
                        ? "Show Less ↑"
                        : "Show More ↓"}
                    </button>
                  )}

                </div>

                {/* =================================================
                    PENDING
                ================================================= */}

                {filter === "pending" && (
                  <div className="approval-section">

                    <div className="approval-header">

                      <div>
                        <h4>
                          Approval Progress
                        </h4>

                        <p>
                          {approvalProgress} of 3
                          approvals completed
                        </p>
                      </div>

                      <span className="progress-count">
                        {approvalProgress}/3
                      </span>

                    </div>

                    <div className="progress-bar">

                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            (approvalProgress /
                              3) *
                            100
                          }%`,
                        }}
                      />

                    </div>

                    <div className="approval-list">

                      <div className="approval-item">
                        <span>HOD</span>

                        {getStatusLabel(
                          req.hodAccept
                        )}
                      </div>

                      <div className="approval-item">
                        <span>
                          Principal
                        </span>

                        {getStatusLabel(
                          req.principalAccept
                        )}
                      </div>

                      <div className="approval-item">
                        <span>Admin</span>

                        {getStatusLabel(
                          req.adminAccept
                        )}
                      </div>

                    </div>

                    {/* CURRENT STAGE */}

                    <div
                      className={`current-stage ${currentStage.className}`}
                    >
                      <span className="stage-dot"></span>

                      <span>
                        {currentStage.text}
                      </span>
                    </div>

                    {/* EDIT */}

                    {!req.hodAccept ? (
                      <div className="edit-area">

                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() =>
                            openEditModal(req)
                          }
                        >
                          ✏️ Edit Request
                        </button>

                        <p className="edit-hint">
                          You can edit this request
                          until HOD approval.
                        </p>

                      </div>
                    ) : (
                      <div className="edit-locked">
                        🔒 Editing is locked after
                        HOD approval.
                      </div>
                    )}

                  </div>
                )}

                {/* APPROVED */}

                {filter === "approved" && (
                  <div className="approved-message">

                    <span className="approved-check">
                      ✓
                    </span>

                    <div>
                      <strong>
                        UID Approved
                      </strong>

                      <p>
                        All required approvals have
                        been completed.
                      </p>
                    </div>

                  </div>
                )}

                {/* REJECTED */}

                {filter === "rejected" && (
                  <div className="rejected-section">

                    <div className="rejected-header">

                      <span className="rejected-icon">
                        ×
                      </span>

                      <strong>
                        Request Rejected
                      </strong>

                    </div>

                    <div className="rejection-reason">

                      <span>
                        Reason
                      </span>

                      <p>
                        {safeText(
                          req.reason
                        ) ||
                          "No reason provided."}
                      </p>

                    </div>

                    {req.rejectedBy && (
                      <div className="rejected-by">

                        <span>
                          Rejected By
                        </span>

                        <strong>
                          {safeText(
                            req.rejectedBy
                          ).toUpperCase()}
                        </strong>

                      </div>
                    )}

                  </div>
                )}

  </div>
)}<button
  type="button"
  className="card-expand-btn"
  onClick={() => toggleCard(req._id)}
>
  {expandedCards[req._id] ? (
    <>
      Show Less <span>↑</span>
    </>
  ) : (
    <>
      Show More <span>↓</span>
    </>
  )}
</button>

              </div>
            );
          })
        )}

      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!loading &&
        filtered.length > itemsPerPage && (
          <div className="pagination">

            <button
              type="button"
              className="pagination-nav"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(
                  (page) => page - 1
                )
              }
            >
              ←
              <span>Previous</span>
            </button>

            <div className="page-numbers">

              {Array.from(
                { length: totalPages },
                (_, index) => {

                  const page =
                    index + 1;

                  return (
                    <button
                      type="button"
                      key={page}
                      className={
                        currentPage === page
                          ? "page-number active-page"
                          : "page-number"
                      }
                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>
                  );
                }
              )}

            </div>

            <button
              type="button"
              className="pagination-nav"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) => page + 1
                )
              }
            >
              <span>Next</span>
              →
            </button>

          </div>
        )}

      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {editingRequest && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-uid-title"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !updating
            ) {
              closeEditModal();
            }
          }}
        >

          <div className="edit-modal-card">

            <div className="modal-header">

              <div>

                <span className="modal-eyebrow">
                  UID REQUEST
                </span>

                <h3 id="edit-uid-title">
                  Edit UID Request
                </h3>

                <p>
                  Update your request before HOD
                  approval.
                </p>

              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeEditModal}
                disabled={updating}
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <div className="form-group">

                <label htmlFor="paper-title">
                  Paper Title
                </label>

                <input
                  id="paper-title"
                  type="text"
                  value={
                    editingRequest.paperTitle ||
                    ""
                  }
                  onChange={(e) =>
                    setEditingRequest({
                      ...editingRequest,
                      paperTitle:
                        e.target.value,
                    })
                  }
                  placeholder="Enter paper title"
                  disabled={updating}
                />

              </div>

              <div className="form-group">

                <label htmlFor="paper-abstract">
                  Abstract
                </label>

                <textarea
                  id="paper-abstract"
                  value={
                    editingRequest.abstract ||
                    ""
                  }
                  onChange={(e) =>
                    setEditingRequest({
                      ...editingRequest,
                      abstract:
                        e.target.value,
                    })
                  }
                  placeholder="Enter paper abstract"
                  rows={7}
                  disabled={updating}
                />

              </div>

              <div className="form-group">

                <label htmlFor="paper-target">
                  Target
                </label>

                <input
                  id="paper-target"
                  type="text"
                  value={
                    editingRequest.target ||
                    ""
                  }
                  onChange={(e) =>
                    setEditingRequest({
                      ...editingRequest,
                      target:
                        e.target.value,
                    })
                  }
                  placeholder="Enter target journal / conference"
                  disabled={updating}
                />

              </div>

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={closeEditModal}
                disabled={updating}
              >
                Cancel
              </button>

              <button
                type="button"
                className="update-btn"
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <span className="button-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>✓ Update Request</>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

