import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import "./UIDStatusList.css";
import Swal from "sweetalert2";

export default function HODUIDStatusList({ userId }) {
  /* =====================================================
     STATE
  ===================================================== */

  const [approvedRequests, setApprovedRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);

  const [filter, setFilter] = useState("approved");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

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
     FETCH HOD UID DATA
  ===================================================== */

  const fetchData = useCallback(
    async (showLoader = true) => {
      if (!userId) {
        setApprovedRequests([]);
        setPendingRequests([]);
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
        /*
         * IMPORTANT:
         * Do NOT put the ngrok URL here.
         *
         * React proxy:
         *
         * This works on:
         * localhost
         * ngrok
         * mobile
         */

        const response = await fetch(
          `/api/hod/uid-status/${encodeURIComponent(userId)}`
        );

        if (!response.ok) {
          let errorMessage =
            "Failed to fetch HOD UID status.";

          try {
            const errorData = await response.json();

            if (errorData?.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // Ignore JSON parsing error
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log("HOD UID STATUS DATA:", data);

        /*
         * Backend response:
         *
         * {
         *   department: "CSE",
         *   counts: {...},
         *   approved: [...],
         *   pending: [...],
         *   rejected: [...]
         * }
         */

        setApprovedRequests(
          Array.isArray(data.approved)
            ? data.approved
            : []
        );

        setPendingRequests(
          Array.isArray(data.pending)
            ? data.pending
            : []
        );

        setRejectedRequests(
          Array.isArray(data.rejected)
            ? data.rejected
            : []
        );
      } catch (error) {
        console.error(
          "HOD UID status error:",
          error
        );

        setApprovedRequests([]);
        setPendingRequests([]);
        setRejectedRequests([]);

        Swal.fire({
          icon: "error",
          title: "Unable to Load",
          text:
            error.message ||
            "Failed to load UID status.",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  /* =====================================================
     INITIAL FETCH
  ===================================================== */

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  /* =====================================================
     RESET PAGE
  ===================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filter,
    searchTerm,
    sortBy,
    userId,
  ]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const counts = useMemo(() => {
    return {
      approved: approvedRequests.length,
      pending: pendingRequests.length,
      rejected: rejectedRequests.length,
    };
  }, [
    approvedRequests,
    pendingRequests,
    rejectedRequests,
  ]);

  /* =====================================================
     FILTER + SEARCH + SORT
  ===================================================== */

  const filtered = useMemo(() => {
    let result = [];

    /* ---------------------------------------------------
       FILTER
    --------------------------------------------------- */

    if (filter === "approved") {
      result = [...approvedRequests];
    }

    if (filter === "pending") {
      result = [...pendingRequests];
    }

    if (filter === "rejected") {
      result = [...rejectedRequests];
    }

    /* ---------------------------------------------------
       SEARCH
    --------------------------------------------------- */

    const search =
      searchTerm.trim().toLowerCase();

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

        const facultyName = safeText(
          request.facultyName ||
            request.fullName
        ).toLowerCase();

        const facultyId = safeText(
          request.facultyId ||
            request.userId
        ).toLowerCase();

        const type = safeText(
          request.type
        ).toLowerCase();

        return (
          title.includes(search) ||
          uid.includes(search) ||
          target.includes(search) ||
          facultyName.includes(search) ||
          facultyId.includes(search) ||
          type.includes(search)
        );
      });
    }

    /* ---------------------------------------------------
       SORT
    --------------------------------------------------- */

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(
            b.submittedAt ||
              b.rejectedAt ||
              0
          ) -
          new Date(
            a.submittedAt ||
              a.rejectedAt ||
              0
          )
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(
            a.submittedAt ||
              a.rejectedAt ||
              0
          ) -
          new Date(
            b.submittedAt ||
              b.rejectedAt ||
              0
          )
        );
      }

      if (sortBy === "title-asc") {
        return safeText(
          a.paperTitle
        ).localeCompare(
          safeText(b.paperTitle)
        );
      }

      if (sortBy === "title-desc") {
        return safeText(
          b.paperTitle
        ).localeCompare(
          safeText(a.paperTitle)
        );
      }

      if (sortBy === "faculty-asc") {
        return safeText(
          a.facultyName ||
            a.fullName
        ).localeCompare(
          safeText(
            b.facultyName ||
              b.fullName
          )
        );
      }

      if (sortBy === "faculty-desc") {
        return safeText(
          b.facultyName ||
            b.fullName
        ).localeCompare(
          safeText(
            a.facultyName ||
              a.fullName
          )
        );
      }

      if (sortBy === "uid-asc") {
        return safeText(
          a.uid
        ).localeCompare(
          safeText(b.uid)
        );
      }

      if (sortBy === "uid-desc") {
        return safeText(
          b.uid
        ).localeCompare(
          safeText(a.uid)
        );
      }

      return 0;
    });

    return result;
  }, [
    filter,
    approvedRequests,
    pendingRequests,
    rejectedRequests,
    searchTerm,
    sortBy,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length /
        itemsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const paginatedData =
    filtered.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  /* =====================================================
     DATE
  ===================================================== */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Not available";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     STATUS LABEL
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

  const getApprovalProgress = (
    request
  ) => {
    let completed = 0;

    if (request.hodAccept) {
      completed++;
    }

    if (request.principalAccept) {
      completed++;
    }

    if (request.adminAccept) {
      completed++;
    }

    return completed;
  };

  /* =====================================================
     CURRENT APPROVAL STAGE
  ===================================================== */

  const getCurrentStage = (
    request
  ) => {
    if (!request.hodAccept) {
      return {
        text:
          "Waiting for HOD approval",
        className:
          "stage-hod",
      };
    }

    if (!request.principalAccept) {
      return {
        text:
          "Waiting for Principal approval",
        className:
          "stage-principal",
      };
    }

    if (!request.adminAccept) {
      return {
        text:
          "Waiting for Admin approval",
        className:
          "stage-admin",
      };
    }

    if (safeText(request.uid)) {
      return {
        text:
          "UID generated successfully",
        className:
          "stage-complete",
      };
    }

    return {
      text:
        "Processing request",
      className:
        "stage-processing",
    };
  };

  /* =====================================================
     EMPTY MESSAGE
  ===================================================== */

  const getEmptyMessage = () => {
    if (searchTerm.trim()) {
      return "No matching UID requests found.";
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

    {/* APPROVED */}
    <button
      type="button"
      onClick={() => setFilter("approved")}
      className={`uid-status-filter uid-status-approved ${
        filter === "approved" ? "uid-status-selected" : ""
      }`}
    >
      <span>✓</span>

      <span>Approved</span>

      <span className="uid-filter-count">
        {counts.approved}
      </span>
    </button>


    {/* PENDING */}
    <button
      type="button"
      onClick={() => setFilter("pending")}
      className={`uid-status-filter uid-status-pending ${
        filter === "pending" ? "uid-status-selected" : ""
      }`}
    >
      <span>⌛</span>

      <span>Pending</span>

      <span className="uid-filter-count">
        {counts.pending}
      </span>
    </button>


    {/* REJECTED */}
    <button
      type="button"
      onClick={() => setFilter("rejected")}
      className={`uid-status-filter uid-status-rejected ${
        filter === "rejected" ? "uid-status-selected" : ""
      }`}
    >
      <span>×</span>

      <span>Rejected</span>

      <span className="uid-filter-count">
        {counts.rejected}
      </span>
    </button>

  </div>


  {/* REFRESH */}
  <button
    type="button"
    className={`refresh1-btn ${
      refreshing ? "refreshing" : ""
    }`}
    onClick={() => fetchData(false)}
    disabled={refreshing}
    title="Refresh UID requests"
  >
    <span className="refresh-icon">
      ↻
    </span>

    <span>
      {refreshing ? "Refreshing..." : "Refresh"}
    </span>
  </button>

</div>
      {/* <div className="uid-toolbar">

        <div className="filter-container">


          <button
            type="button"
            onClick={() =>
              setFilter("approved")
            }
            className={`filter1-btn ${
              filter === "approved"
                ? "active approved-filter"
                : ""
            }`}
          >
            <span>✓</span>

            <span>
              Approved
            </span>

            <span className="filter-count">
              {counts.approved}
            </span>
          </button>


          <button
            type="button"
            onClick={() =>
              setFilter("pending")
            }
            className={`filter-btn ${
              filter === "pending"
                ? "active pending-filter"
                : ""
            }`}
          >
            <span>⌛</span>

            <span>
              Pending
            </span>

            <span className="filter-count">
              {counts.pending}
            </span>
          </button>


          <button
            type="button"
            onClick={() =>
              setFilter("rejected")
            }
            className={`filter-btn ${
              filter === "rejected"
                ? "active rejected-filter"
                : ""
            }`}
          >
            <span>×</span>

            <span>
              Rejected
            </span>

            <span className="filter-count">
              {counts.rejected}
            </span>
          </button>

        </div>


        <button
          type="button"
          className={`refresh1-btn ${
            refreshing
              ? "refreshing"
              : ""
          }`}
          onClick={() =>
            fetchData(false)
          }
          disabled={refreshing}
          title="Refresh UID requests"
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

      </div> */}

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
              setSearchTerm(
                e.target.value
              )
            }
            placeholder="Search faculty, paper title, UID or target..."
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

          <label htmlFor="hod-uid-sort">
            Sort
          </label>

          <select
            id="hod-uid-sort"
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
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

            <option value="faculty-asc">
              Faculty A–Z
            </option>

            <option value="faculty-desc">
              Faculty Z–A
            </option>

            <option value="uid-asc">
              UID A–Z
            </option>

            <option value="uid-desc">
              UID Z–A
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

        {/* LOADING */}

        {loading ? (
          <div className="uid-state-card">

            <div className="loading-spinner"></div>

            <p>
              Loading UID requests...
            </p>

          </div>

        ) : filtered.length === 0 ? (

          /* EMPTY */

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
                : `Your department's ${filter} UID requests will appear here.`}
            </p>

          </div>

        ) : (

          /* DATA */

          paginatedData.map((req) => {

            const abstract =
              safeText(
                req.abstract
              );

            const isAbstractExpanded =
              expandedAbstracts[
                req._id
              ];

            const isExpanded =
              expandedCards[
                req._id
              ];

            const approvalProgress =
              getApprovalProgress(
                req
              );

            const currentStage =
              getCurrentStage(
                req
              );

            const facultyName =
              safeText(
                req.facultyName ||
                  req.fullName
              ) ||
              "Faculty";

            const facultyId =
              safeText(
                req.facultyId ||
                  req.userId
              );

            return (
              <div
                key={req._id}
                className="uid-status-card"
              >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="card-header">

                  <div className="title-section">

                    <h3 className="paper-title">
                      {safeText(
                        req.paperTitle
                      ) ||
                        "Untitled Paper"}
                    </h3>

                    <div className="paper-subtitle">
                      {safeText(
                        req.type
                      ) ||
                        "Type not specified"}
                    </div>

                  </div>

                  {req.uid && (
                    <div className="uid-badge">

                      <span>
                        UID
                      </span>

                      <strong>
                        {safeText(
                          req.uid
                        )}
                      </strong>

                    </div>
                  )}

                </div>

                {/* =================================================
                    INFORMATION
                ================================================= */}

                <div className="request-info-grid">

                  {/* FACULTY */}

                  <div className="info-item">

                    <span className="info-label">
                      Faculty
                    </span>

                    <span className="info-value">
                      {facultyName}
                    </span>

                  </div>

                  {/* FACULTY ID */}

                  <div className="info-item">

                    <span className="info-label">
                      Faculty ID
                    </span>

                    <span className="info-value">
                      {facultyId ||
                        "Not available"}
                    </span>

                  </div>

                  {/* TYPE */}

                  <div className="info-item">

                    <span className="info-label">
                      Type
                    </span>

                    <span className="info-value">
                      {safeText(
                        req.type
                      ) ||
                        "Not specified"}
                    </span>

                  </div>

                  {/* TARGET */}

                  <div className="info-item">

                    <span className="info-label">
                      Target
                    </span>

                    <span className="info-value">
                      {safeText(
                        req.target
                      ) ||
                        "Not specified"}
                    </span>

                  </div>

                  {/* SUBMITTED */}

                  <div className="info-item">

                    <span className="info-label">
                      Submitted
                    </span>

                    <span className="info-value">
                      {formatDate(
                        req.submittedAt ||
                          req.rejectedAt
                      )}
                    </span>

                  </div>

                </div>

                {/* =================================================
                    EXPANDED CONTENT
                ================================================= */}

                {isExpanded && (
                  <div className="expanded-card-content">

                    {/* =================================================
                        CO AUTHORS
                    ================================================= */}

                    {req.coAuthors?.hasCoAuthors &&
                      Array.isArray(
                        req.coAuthors.authors
                      ) &&
                      req.coAuthors.authors.length >
                        0 && (

                        <div className="coauthors-section">

                          <div className="section-label">

                            <span>
                              👥
                            </span>

                            Co Authors

                          </div>

                          <div className="coauthors-list">

                            {req.coAuthors.authors.map(
                              (
                                author,
                                index
                              ) => {

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
                                        .charAt(
                                          0
                                        )
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

                    {/* =================================================
                        ABSTRACT
                    ================================================= */}

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

                      {abstract.length >
                        180 && (
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

                    {/* =================================================
                        PENDING APPROVAL
                    ================================================= */}

                    {filter ===
                      "pending" && (
                      <div className="approval-section">

                        <div className="approval-header">

                          <div>

                            <h4>
                              Approval Progress
                            </h4>

                            <p>
                              {
                                approvalProgress
                              }{" "}
                              of 3 approvals
                              completed
                            </p>

                          </div>

                          <span className="progress-count">
                            {
                              approvalProgress
                            }
                            /3
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

                            <span>
                              HOD
                            </span>

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

                            <span>
                              Admin
                            </span>

                            {getStatusLabel(
                              req.adminAccept
                            )}

                          </div>

                        </div>

                        <div
                          className={`current-stage ${currentStage.className}`}
                        >

                          <span className="stage-dot"></span>

                          <span>
                            {
                              currentStage.text
                            }
                          </span>

                        </div>

                      </div>
                    )}

                    {/* =================================================
                        APPROVED
                    ================================================= */}

                    {filter ===
                      "approved" && (
                      <div className="approved-message">

                        <span className="approved-check">
                          ✓
                        </span>

                        <div>

                          <strong>
                            UID Approved
                          </strong>

                          <p>
                            All required
                            approvals have
                            been completed.
                          </p>

                        </div>

                      </div>
                    )}

                    {/* =================================================
                        REJECTED
                    ================================================= */}

                    {filter ===
                      "rejected" && (
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
                )}

                {/* =================================================
                    SHOW MORE / LESS
                ================================================= */}

                <button
                  type="button"
                  className="card-expand-btn"
                  onClick={() =>
                    toggleCard(
                      req._id
                    )
                  }
                >

                  {isExpanded ? (
                    <>
                      Show Less
                      <span>↑</span>
                    </>
                  ) : (
                    <>
                      Show More
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
        filtered.length >
          itemsPerPage && (
          <div className="pagination">

            <button
              type="button"
              className="pagination-nav"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    page - 1
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
                {
                  length:
                    totalPages,
                },
                (_, index) => {
                  const page =
                    index + 1;

                  return (
                    <button
                      type="button"
                      key={page}
                      className={
                        currentPage ===
                        page
                          ? "page-number active-page"
                          : "page-number"
                      }
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
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
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    page + 1
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