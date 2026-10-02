
import React, { useEffect, useMemo, useState } from "react";
import "./UIDStatusList.css";
import Swal from "sweetalert2";

export default function PIDStatusList({ facultyId }) {
  const [submissions, setSubmissions] = useState([]);

  const [filter, setFilter] = useState("approved");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  const itemsPerPage = 5;

  /* =====================================================
     SAFE TEXT
  ===================================================== */

  const safeText = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value !== "string") {
      return String(value);
    }

    return value.trim();
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =====================================================
     FETCH PID DATA
  ===================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!facultyId) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `/api/faculty/pid-status/${facultyId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch PID data");
        }

        const data = await response.json();

        if (isMounted) {
          setSubmissions(
            Array.isArray(data) ? data : []
          );
        }
      } catch (error) {
        console.error("PID fetch error:", error);

        if (isMounted) {
          setSubmissions([]);

          Swal.fire({
            icon: "error",
            title: "Unable to Load",
            text: "Failed to load PID status.",
            confirmButtonColor: "#2563eb",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [facultyId]);

  /* =====================================================
     RESET PAGE
  ===================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, sortBy, facultyId]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filtered = useMemo(() => {
    let result = [];

    if (filter === "approved") {
      result = submissions.filter(
        (request) =>
          request.adminAccept === true &&
          request.isRejected === false
      );
    }

    if (filter === "pending") {
      result = submissions.filter(
        (request) =>
          request.adminAccept === false &&
          request.isRejected === false
      );
    }

    if (filter === "rejected") {
      result = submissions.filter(
        (request) => request.isRejected === true
      );
    }

    /* =================================================
       SEARCH
    ================================================= */

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((request) => {
        const title = safeText(
          request.paperTitle
        ).toLowerCase();

        const uid = safeText(
          request.uid
        ).toLowerCase();

        const pid = safeText(
          request.pid
        ).toLowerCase();

        const target = safeText(
          request.target
        ).toLowerCase();

        return (
          title.includes(search) ||
          uid.includes(search) ||
          pid.includes(search) ||
          target.includes(search)
        );
      });
    }

    /* =================================================
       SORT
    ================================================= */

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(
            b.uploadedAt || b.submittedAt || 0
          ) -
          new Date(
            a.uploadedAt || a.submittedAt || 0
          )
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(
            a.uploadedAt || a.submittedAt || 0
          ) -
          new Date(
            b.uploadedAt || b.submittedAt || 0
          )
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
    submissions,
    filter,
    searchTerm,
    sortBy,
  ]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const counts = {
    approved: submissions.filter(
      (request) =>
        request.adminAccept === true &&
        request.isRejected === false
    ).length,

    pending: submissions.filter(
      (request) =>
        request.adminAccept === false &&
        request.isRejected === false
    ).length,

    rejected: submissions.filter(
      (request) =>
        request.isRejected === true
    ).length,
  };

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / itemsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const paginatedData = useMemo(() => {
    return filtered.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filtered, startIndex]);

  /* =====================================================
     TOGGLE CARD
  ===================================================== */

  const toggleCard = (id) => {
    setExpandedCards((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  /* =====================================================
     TOGGLE ABSTRACT
  ===================================================== */

  const toggleAbstract = (id) => {
    setExpandedAbstracts((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  /* =====================================================
     REFRESH
  ===================================================== */

  const fetchData = async (showLoading = true) => {
    if (!facultyId) {
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    setRefreshing(true);

    try {
      const response = await fetch(
        `/api/faculty/pid-status/${facultyId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PID data");
      }

      const data = await response.json();

      setSubmissions(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error("PID refresh error:", error);

      Swal.fire({
        icon: "error",
        title: "Refresh Failed",
        text: "Failed to refresh PID status.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      return "No approved PID requests found.";
    }

    if (filter === "pending") {
      return "No pending PID requests found.";
    }

    return "No rejected PID requests found.";
  };

  /* =====================================================
     STATUS LABEL
  ===================================================== */

  const getStatusLabel = (value) => {
    return value ? (
      <span className="status-badge status-approved">
        <span className="status-dot">✓</span>
        Approved
      </span>
    ) : (
      <span className="status-badge status-pending">
        <span className="status-dot">⌛</span>
        Pending
      </span>
    );
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

          {/* APPROVED */}

          <button
            type="button"
            onClick={() => {
              setFilter("approved");
              setExpandedCards({});
            }}
            className={`filter-btn ${
              filter === "approved"
                ? "active approved-filter"
                : ""
            }`}
          >
            <span className="filter-icon">
              ✓
            </span>

            <span>
              Approved
            </span>

            <span className="filter-count">
              {counts.approved}
            </span>
          </button>

          {/* PENDING */}

          <button
            type="button"
            onClick={() => {
              setFilter("pending");
              setExpandedCards({});
            }}
            className={`filter-btn ${
              filter === "pending"
                ? "active pending-filter"
                : ""
            }`}
          >
            <span className="filter-icon">
              ⌛
            </span>

            <span>
              Pending
            </span>

            <span className="filter-count">
              {counts.pending}
            </span>
          </button>

          {/* REJECTED */}

          <button
            type="button"
            onClick={() => {
              setFilter("rejected");
              setExpandedCards({});
            }}
            className={`filter-btn ${
              filter === "rejected"
                ? "active rejected-filter"
                : ""
            }`}
          >
            <span className="filter-icon">
              ×
            </span>

            <span>
              Rejected
            </span>

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
          title="Refresh PID requests"
        >
          <span className="refresh-icon">
            ↻
          </span>

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

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search paper title, UID, PID or target..."
          />

          {searchTerm && (
            <button
              type="button"
              className="clear-search"
              onClick={() =>
                setSearchTerm("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

        <div className="sort-box">

          <label htmlFor="pid-sort">
            Sort
          </label>

          <select
            id="pid-sort"
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
            <strong>
              {filtered.length}
            </strong>{" "}
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
              Loading PID requests...
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
                : `Your ${filter} PID requests will appear here.`}
            </p>

          </div>

        ) : (

          paginatedData.map((req) => {

            const abstract =
              safeText(req.abstract);

            const isAbstractExpanded =
              expandedAbstracts[req._id];

            return (
              <div
                key={req._id}
                className="uid-status-card"
              >

                {/* =========================================
                    HEADER
                ========================================== */}

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

                  {/* UID BADGE
                      Keep this because this is the same
                      UID CSS structure.
                  */}

                  {req.uid && (
                    <div className="uid-badge">

                      <span>
                        UID
                      </span>

                      <strong>
                        {safeText(req.uid)}
                      </strong>

                    </div>
                  )}

                </div>

                {/* =========================================
                    INFORMATION
                ========================================== */}

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
                        req.uploadedAt ||
                        req.submittedAt
                      )}
                    </span>

                  </div>

                </div>

                {/* =========================================
                    EXPANDED CONTENT
                ========================================== */}

                {expandedCards[req._id] && (

                  <div className="expanded-card-content">

                    {/* PID */}

                    <div className="coauthors-section">

                      <div className="section-label">
                        <span>🆔</span>
                        PID
                      </div>

                      <div className="coauthors-list">

                        <div className="coauthor-item">

                          <div className="author-avatar">
                            P
                          </div>

                          <div className="author-details">

                            <strong>
                              {safeText(req.pid) ||
                                "Not assigned"}
                            </strong>

                            <span>
                              PID Number
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* UID */}

                    <div className="coauthors-section">

                      <div className="section-label">
                        <span>🆔</span>
                        UID
                      </div>

                      <div className="coauthors-list">

                        <div className="coauthor-item">

                          <div className="author-avatar">
                            U
                          </div>

                          <div className="author-details">

                            <strong>
                              {safeText(req.uid) ||
                                "Not assigned"}
                            </strong>

                            <span>
                              UID Number
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* ABSTRACT */}

                    <div className="abstract-section">

                      <div className="section-label">

                        <span>
                          📝
                        </span>

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
                            toggleAbstract(
                              req._id
                            )
                          }
                        >
                          {isAbstractExpanded
                            ? "Show Less ↑"
                            : "Show More ↓"}
                        </button>

                      )}

                    </div>

                    {/* =====================================
                        PENDING
                    ====================================== */}

                    {filter === "pending" && (

                      <div className="approval-section">

                        <div className="approval-header">

                          <div>

                            <h4>
                              PID Status
                            </h4>

                            <p>
                              Waiting for R&amp;D dean
                              review
                            </p>

                          </div>

                          <span className="progress-count">
                            ⌛
                          </span>

                        </div>

                        <div className="approval-list">

                          <div className="approval-item">

                            <span>
                              R&amp;D Dean
                            </span>

                            {getStatusLabel(
                              req.adminAccept
                            )}

                          </div>

                        </div>

                      </div>

                    )}

                    {/* =====================================
                        APPROVED
                    ====================================== */}

                    {filter === "approved" && (

                      <div className="approved-message">

                        <span className="approved-check">
                          ✓
                        </span>

                        <div>

                          <strong>
                            PID Approved
                          </strong>

                          <p>
                            PID has been approved
                            successfully.
                          </p>

                        </div>

                      </div>

                    )}

                    {/* =====================================
                        REJECTED
                    ====================================== */}

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
                              req.rejectionReason ||
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

                )}

                {/* =========================================
                    SHOW MORE / SHOW LESS
                ========================================== */}

                <button
                  type="button"
                  className="card-expand-btn"
                  onClick={() =>
                    toggleCard(req._id)
                  }
                >

                  {expandedCards[req._id] ? (
                    <>
                      Show Less{" "}
                      <span>↑</span>
                    </>
                  ) : (
                    <>
                      Show More{" "}
                      <span>↓</span>
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
              <span>
                Previous
              </span>
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
              <span>
                Next
              </span>
              →
            </button>

          </div>

        )}

    </div>
  );
}
// import React, { useEffect, useMemo, useState } from 'react';
// import './UIDStatusList.css';
// import Swal from 'sweetalert2';

// export default function PIDStatusList({ facultyId }) {
//   const [submissions, setSubmissions] = useState([]);

//   const [filter, setFilter] = useState('approved');
//   const [loading, setLoading] = useState(true);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('newest');

//   const [expandedId, setExpandedId] = useState(null);

//   // =====================================================
//   // TOGGLE SHOW MORE
//   // =====================================================
//   const toggleExpand = (id) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   // =====================================================
//   // FETCH PID DATA
//   // =====================================================
//   const fetchSubmissions = async (showLoading = true) => {
//     if (!facultyId) return;

//     if (showLoading) {
//       setLoading(true);

//       Swal.fire({
//         title: 'Loading...',
//         html: `
//           <div class="custom-spinner">
//             <div class="circle"></div>
//             <div class="circle"></div>
//             <div class="circle"></div>
//           </div>
//           <p>Fetching PID details, please wait...</p>
//         `,
//         showConfirmButton: false,
//         allowOutsideClick: false,
//         customClass: {
//           popup: 'swal-loading-popup'
//         }
//       });
//     }

//     try {
//       const res = await fetch(
//         `/api/faculty/pid-status/${facultyId}`
//       );

//       if (!res.ok) {
//         throw new Error('Failed to fetch PID details');
//       }

//       const data = await res.json();

//       setSubmissions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching PID status:', err);

//       Swal.fire({
//         icon: 'error',
//         title: 'Oops!',
//         text: 'Failed to load PID details. Please try again.',
//         confirmButtonText: 'OK',
//         confirmButtonColor: '#e11d48',
//         background: '#fff',
//         color: '#111'
//       });
//     } finally {
//       if (showLoading) {
//         Swal.close();
//       }

//       setLoading(false);
//     }
//   };

//   // =====================================================
//   // INITIAL FETCH
//   // =====================================================
//   useEffect(() => {
//     if (facultyId) {
//       fetchSubmissions();
//     }
//   }, [facultyId]);

//   // =====================================================
//   // STATUS COUNTS
//   // =====================================================
//   const approvedCount = submissions.filter(
//     (doc) =>
//       doc.adminAccept === true &&
//       doc.isRejected === false
//   ).length;

//   const pendingCount = submissions.filter(
//     (doc) =>
//       doc.adminAccept === false &&
//       doc.isRejected === false
//   ).length;

//   const rejectedCount = submissions.filter(
//     (doc) => doc.isRejected === true
//   ).length;

//   // =====================================================
//   // FILTER + SEARCH + SORT
//   // =====================================================
//   const filtered = useMemo(() => {
//     let result = submissions.filter((doc) => {
//       if (filter === 'approved') {
//         return (
//           doc.adminAccept === true &&
//           doc.isRejected === false
//         );
//       }

//       if (filter === 'pending') {
//         return (
//           doc.adminAccept === false &&
//           doc.isRejected === false
//         );
//       }

//       if (filter === 'rejected') {
//         return doc.isRejected === true;
//       }

//       return true;
//     });

//     // ---------------------------------------------------
//     // SEARCH
//     // ---------------------------------------------------
//     const search = searchTerm.trim().toLowerCase();

//     if (search) {
//       result = result.filter((doc) => {
//         return (
//           (doc.paperTitle || '')
//             .toLowerCase()
//             .includes(search) ||

//           (doc.uid || '')
//             .toLowerCase()
//             .includes(search) ||

//           (doc.target || '')
//             .toLowerCase()
//             .includes(search)
//         );
//       });
//     }

//     // ---------------------------------------------------
//     // SORT
//     // ---------------------------------------------------
//     result.sort((a, b) => {
//       switch (sortBy) {
//         case 'newest':
//           return (
//             new Date(b.uploadedAt || 0) -
//             new Date(a.uploadedAt || 0)
//           );

//         case 'oldest':
//           return (
//             new Date(a.uploadedAt || 0) -
//             new Date(b.uploadedAt || 0)
//           );

//         case 'title-asc':
//           return (a.paperTitle || '').localeCompare(
//             b.paperTitle || ''
//           );

//         case 'title-desc':
//           return (b.paperTitle || '').localeCompare(
//             a.paperTitle || ''
//           );

//         case 'type':
//           return (a.type || '').localeCompare(
//             b.type || ''
//           );

//         case 'target':
//           return (a.target || '').localeCompare(
//             b.target || ''
//           );

//         default:
//           return 0;
//       }
//     });

//     return result;
//   }, [
//     submissions,
//     filter,
//     searchTerm,
//     sortBy
//   ]);

//   // =====================================================
//   // REFRESH
//   // =====================================================
//   const handleRefresh = async () => {
//     await fetchSubmissions(true);
//   };

//   // =====================================================
//   // RENDER
//   // =====================================================
//   return (
//     <div className="uid-status-container">

//       {/* =================================================
//           TOP FILTER BUTTONS
//       ================================================== */}
//       <div className="filter-buttons">

//         <button
//           onClick={() => {
//             setFilter('approved');
//             setExpandedId(null);
//           }}
//           className={
//             filter === 'approved' ? 'active approved-btn' : ''
//           }
//         >
//           ✓ Approved
//           <span className="count">
//             {approvedCount}
//           </span>
//         </button>

//         <button
//           onClick={() => {
//             setFilter('pending');
//             setExpandedId(null);
//           }}
//           className={
//             filter === 'pending' ? 'active pending-btn' : ''
//           }
//         >
//           ⌛ Pending
//           <span className="count">
//             {pendingCount}
//           </span>
//         </button>

//         <button
//           onClick={() => {
//             setFilter('rejected');
//             setExpandedId(null);
//           }}
//           className={
//             filter === 'rejected' ? 'active rejected-btn' : ''
//           }
//         >
//           × Rejected
//           <span className="count">
//             {rejectedCount}
//           </span>
//         </button>

//         {/* REFRESH */}
//         <button
//           className="refresh-btn"
//           onClick={handleRefresh}
//         >
//           ↻ Refresh
//         </button>

//       </div>

//       {/* =================================================
//           SEARCH + SORT
//       ================================================== */}
//       <div className="search-sort-row">

//         <div className="search-container">

//           <span className="search-icon">
//             ⌕
//           </span>

//           <input
//             type="text"
//             placeholder="Search paper title, UID or target..."
//             value={searchTerm}
//             onChange={(e) =>
//               setSearchTerm(e.target.value)
//             }
//           />

//         </div>

//         <div className="sort-container">

//           <label>
//             Sort
//           </label>

//           <select
//             value={sortBy}
//             onChange={(e) =>
//               setSortBy(e.target.value)
//             }
//           >
//             <option value="newest">
//               Newest First
//             </option>

//             <option value="oldest">
//               Oldest First
//             </option>

//             <option value="title-asc">
//               Title A–Z
//             </option>

//             <option value="title-desc">
//               Title Z–A
//             </option>

//             <option value="type">
//               Publication Type
//             </option>

//             <option value="target">
//               Target
//             </option>
//           </select>

//         </div>

//       </div>

//       {/* =================================================
//           REQUEST COUNT
//       ================================================== */}
//       <p className="request-count">
//         Showing <strong>{filtered.length}</strong> requests
//       </p>

//       {/* =================================================
//           CARDS
//       ================================================== */}
//       <div className="uid-status-list">

//         {loading ? (

//           <p className="loading-text">
//             <span className="dot one"></span>
//             <span className="dot two"></span>
//             <span className="dot three"></span>
//           </p>

//         ) : filtered.length === 0 ? (

//           <p className="no-results">
//             No {filter} documents found.
//           </p>

//         ) : (

//           filtered.map((doc) => (

//             <div
//               key={doc._id}
//               className={`uid-status-card ${
//                 doc.isRejected
//                   ? 'rejected'
//                   : doc.adminAccept
//                   ? 'approved'
//                   : 'pending'
//               }`}
//             >

//               {/* =========================================
//                   CARD HEADER
//               ========================================== */}
//               <div className="card-header">

//                 <div className="card-title-section">

//                   <p className="title">
//                     {doc.paperTitle}
//                   </p>

//                   <p className="publication-type">
//                     {doc.type || 'Not specified'}
//                   </p>

//                 </div>

//                 {/* UID BADGE */}
//                 <div className="uid-badge">

//                   <span>
//                     UID
//                   </span>

//                   <strong>
//                     {doc.uid || 'N/A'}
//                   </strong>

//                 </div>

//               </div>

//               {/* =========================================
//                   BASIC INFORMATION
//               ========================================== */}
//               <div className="card-summary">

//                 <div className="summary-item">

//                   <span>
//                     TYPE
//                   </span>

//                   <strong>
//                     {doc.type || 'N/A'}
//                   </strong>

//                 </div>

//                 <div className="summary-item">

//                   <span>
//                     TARGET
//                   </span>

//                   <strong>
//                     {doc.target || 'N/A'}
//                   </strong>

//                 </div>

//                 <div className="summary-item">

//                   <span>
//                     SUBMITTED
//                   </span>

//                   <strong>
//                     {doc.uploadedAt
//                       ? new Date(
//                           doc.uploadedAt
//                         ).toLocaleDateString(
//                           'en-GB',
//                           {
//                             day: '2-digit',
//                             month: 'short',
//                             year: 'numeric'
//                           }
//                         )
//                       : 'N/A'}
//                   </strong>

//                 </div>

//               </div>

//               {/* =========================================
//                   SHOW MORE BUTTON
//               ========================================== */}
//               <button
//                 type="button"
//                 className="show-more-btn"
//                 onClick={() =>
//                   toggleExpand(doc._id)
//                 }
//               >
//                 {expandedId === doc._id
//                   ? 'Show Less ↑'
//                   : 'Show More ↓'}
//               </button>

//               {/* =========================================
//                   EXPANDED DETAILS
//               ========================================== */}
//               {expandedId === doc._id && (

//                 <div className="card-expanded-content">

//                   <div className="detail-row">
//                     <strong>UID:</strong>
//                     <span>
//                       {doc.uid || 'Not assigned'}
//                     </span>
//                   </div>

//                   <div className="detail-row">
//                     <strong>PID:</strong>
//                     <span>
//                       {doc.pid || 'Not assigned'}
//                     </span>
//                   </div>

//                   <div className="detail-row">
//                     <strong>Type:</strong>
//                     <span>
//                       {doc.type || 'Not specified'}
//                     </span>
//                   </div>

//                   <div className="detail-row">
//                     <strong>Target:</strong>
//                     <span>
//                       {doc.target || 'Not specified'}
//                     </span>
//                   </div>

//                   <div className="detail-row">
//                     <strong>Uploaded At:</strong>
//                     <span>
//                       {doc.uploadedAt
//                         ? new Date(
//                             doc.uploadedAt
//                           ).toLocaleDateString(
//                             'en-GB',
//                             {
//                               day: '2-digit',
//                               month: 'long',
//                               year: 'numeric'
//                             }
//                           )
//                         : 'Not available'}
//                     </span>
//                   </div>

//                   <div className="abstract-section">

//                     <strong>
//                       Abstract:
//                     </strong>

//                     <p>
//                       {doc.abstract ||
//                         'No abstract provided.'}
//                     </p>

//                   </div>

//                   {/* REJECTION REASON */}
//                   {filter === 'rejected' && (

//                     <div className="rejection-reason">

//                       <strong>
//                         Reason:
//                       </strong>

//                       <p>
//                         {doc.rejectionReason ||
//                           'Not provided'}
//                       </p>

//                     </div>

//                   )}

//                   {/* PENDING STATUS */}
//                   {filter === 'pending' && (

//                     <div className="pending-status">

//                       ⌛ Waiting for R&D dean review

//                     </div>

//                   )}

//                   {/* APPROVED STATUS */}
//                   {filter === 'approved' && (

//                     <div className="approved-status">

//                       ✓ Approved by Admin

//                     </div>

//                   )}

//                 </div>

//               )}

//             </div>

//           ))

//         )}

//       </div>

//     </div>
//   );
// }

// // import React, { useEffect, useState } from 'react';
// // import './PIDStatusList.css';
// // import Swal from 'sweetalert2';
// // export default function PIDStatusList({ facultyId }) {
// //   const [submissions, setSubmissions] = useState([]);
// //   const [filter, setFilter] = useState('approved'); // 'approved' | 'pending' | 'rejected'
// //   const [loading, setLoading] = useState(true);
// //   const [expandedId, setExpandedId] = useState(null);

// // const toggleExpand = (id) => {
// //   setExpandedId(expandedId === id ? null : id);
// // };

// //   useEffect(() => {
// //   const fetchSubmissions = async () => {
// // Swal.fire({
// //   title: 'Loading...',
// //   html: `
// //     <div class="custom-spinner">
// //       <div class="circle"></div>
// //       <div class="circle"></div>
// //       <div class="circle"></div>
// //     </div>
// //     <p>Fetching PID details, please wait...</p>
// //   `,
// //   showConfirmButton: false,
// //   allowOutsideClick: false,
// //   customClass: {
// //     popup: 'swal-loading-popup'
// //   }
// // });



// // //     Swal.fire({
// // //   title: 'Loading...',
// // //   html: `<div class="swal-loader">
// // //            Fetching PID details<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
// // //          </div>`,
// // //   allowOutsideClick: false,
// // //   didOpen: () => {
// // //     Swal.showLoading();
// // //   },
// // //   customClass: {
// // //     popup: 'swal-loading-popup',
// // //     title: 'swal-loading-title',
// // //     htmlContainer: 'swal-loading-text'
// // //   }
// // // });



// //     try {
// //       const res = await fetch(`/api/faculty/pid-status/${facultyId}`);
// //       const data = await res.json();
// //       setSubmissions(data);
// //     } catch (err) {
// //       console.error('Error fetching PID status:', err);
// //       Swal.fire({
// //   icon: 'error',
// //   title: 'Oops!',
// //   text: 'Failed to load PID details. Please try again.',
// //   confirmButtonText: 'OK',
// //   confirmButtonColor: '#e11d48', // red
// //   background: '#fff',
// //   color: '#111',
// // });

// //       // Swal.fire({
// //       //   icon: 'error',
// //       //   title: 'Error',
// //       //   text: 'Failed to load PID Details.'
// //       // });
// //     } finally {
// //       Swal.close(); // ✅ CLOSE LOADING
// //       setLoading(false);
// //     }
// //   };

// //   if (facultyId) {
// //     fetchSubmissions();
// //   }
// // }, [facultyId]);


// //   // useEffect(() => {
// //   //   const fetchSubmissions = async () => {
// //   //     setLoading(true); // Start loading
// //   //     try {
// //   //       const res = await fetch(`/api/faculty/pid-status/${facultyId}`);
// //   //       const data = await res.json();
// //   //       setSubmissions(data);
// //   //     } catch (err) {
// //   //       console.error('Error fetching PID status:', err);
// //   //     } finally {
// //   //       setLoading(false); // Done loading
// //   //     }
// //   //   };

// //   //   if (facultyId) {
// //   //     fetchSubmissions();
// //   //   }
// //   // }, [facultyId]);

// //   const filteredSubmissions = () => {
// //     if (filter === 'approved') {
// //       return submissions.filter(sub => sub.adminAccept === true && sub.isRejected === false);
// //     }
// //     if (filter === 'rejected') {
// //       return submissions.filter(sub => sub.isRejected === true);
// //     }
// //     if (filter === 'pending') {
// //       return submissions.filter(sub => sub.adminAccept === false && sub.isRejected === false);
// //     }
// //     return [];
// //   };

// //   const filtered = filteredSubmissions();

// //   return (
// //     <div>
// //       <div className="filter-buttons">
// //         <button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'active' : ''}>✅ Approved</button>
// //         <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>⌛ Pending</button>
// //         <button onClick={() => setFilter('rejected')} className={filter === 'rejected' ? 'active' : ''}>❌ Rejected</button>
// //       </div>

// //       <div className="uid-status-list">
// //         {loading ? (
// //           <p className="loading-text">
  
// //   <span className="dot one"></span>
// //   <span className="dot two"></span>
// //   <span className="dot three"></span>
// // </p>

// //           // <p className="loading-text">🌀 Loading.....<span className="dots"></span></p>
// //         ) : filtered.length === 0 ? (
// //           <p>No {filter} documents found.</p>
// //         ) : (
// //          filtered.map((doc) => (
// //   <div key={doc._id} className={`uid-status-card ${doc.isRejected ? 'rejected' : doc.adminAccept ? 'approved' : 'pending'}`}>

// //     {/* Header row */}
// //     <div className="card-header" onClick={() => toggleExpand(doc._id)}>
// //       <p className="title">{doc.paperTitle}</p>

// //       <span className="arrow">
// //         {expandedId === doc._id ? '▲' : '▼'}
// //       </span>
// //     </div>

// //     {/* Always visible */}
// //     {/* <p><strong>PID:</strong> {doc.pid}</p> */}
// //     {doc.adminAccept === true && doc.isRejected === false && (
// //   <p><strong>PID:</strong> {doc.pid}</p>
// // )}

// //     {/* Expandable section */}
// //     {expandedId === doc._id && (
// //       <div className="card-body">
// //         <p><strong>UID:</strong> {doc.uid}</p>
// //         <p><strong>Type:</strong> {doc.type}</p>
// //         <p><strong>Abstract:</strong> {doc.abstract}</p>
// //         <p><strong>Target:</strong> {doc.target}</p>
// //         <p><strong>Uploaded At:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>

// //         {filter === 'rejected' && (
// //           <p className="reason"><strong>Reason:</strong> {doc.rejectionReason || 'Not provided'}</p>
// //         )}

// //         {filter === 'pending' && (
// //           <p className="pending">⌛ Waiting for R&D dean review</p>
// //         )}

// //         {filter === 'approved' && (
// //           <p className="approved">✅ Approved by Admin</p>
// //         )}
// //       </div>
// //     )}
// //   </div>
// // ))
         
// //           // filtered.map((doc) => (
// //           //   <div key={doc._id} className="uid-status-card">
// //           //     <p style={{ color: 'blue', fontSize: '23px' }}>{doc.paperTitle}</p>
// //           //     <p><strong>UID:</strong> {doc.uid}</p>
// //           //     <p><strong>PID:</strong> {doc.pid}</p>
// //           //     <p><strong>Type:</strong> {doc.type}</p>
// //           //     <p><strong>Abstract:</strong> {doc.abstract}</p>
// //           //     <p><strong>Target:</strong> {doc.target}</p>
// //           //     <p><strong>Uploaded At:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>

// //           //     {filter === 'rejected' && (
// //           //       <p style={{ color: 'red' }}><strong>Reason:</strong> {doc.rejectionReason || 'Not provided'}</p>
// //           //     )}

// //           //     {filter === 'pending' && (
// //           //       <p style={{ color: 'orange' }}><strong>Status:</strong> Waiting for R&D dean review</p>
// //           //     )}

// //           //     {filter === 'approved' && (
// //           //       <p style={{ color: 'green' }}><strong>Status:</strong> ✅ Approved by Admin</p>
// //           //     )}
// //           //   </div>
// //           // ))
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
