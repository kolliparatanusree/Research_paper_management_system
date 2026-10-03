import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiCheck,
  FiX,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiFileText,
  FiBookOpen,
  FiUsers,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiMapPin,
  FiTarget,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiDownload,
  FiFile,
} from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "./HodUidApproval.css";

const REJECTION_REASONS = [
  "Insufficient Details",
  "Not Relevant",
  "Duplicate",
  "Unclear Abstract",
  "Other",
];

export default function PrincipalUidApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [openRequestId, setOpenRequestId] = useState(null);

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const fetchRequests = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/principal/uid-requests`
      );

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.requests)) {
        data = response.data.requests;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      }

      /*
       * Principal should only handle requests that have already
       * passed RD Coordinator approval.
       *
       * The backend endpoint should normally already return
       * only RD Coordinator-approved requests. This additional
       * check keeps the page safe if the endpoint returns a
       * broader list.
       */
      data = data.filter((request) => {
        const rdApproval = request?.RDCordinatorAccept;

        if (
          rdApproval === undefined ||
          rdApproval === null
        ) {
          return true;
        }

        return (
          rdApproval === true ||
          rdApproval === "true" ||
          rdApproval === "approved" ||
          rdApproval === "Approved" ||
          rdApproval === 1
        );
      });

      setRequests(data);
    } catch (error) {
      console.error("Principal UID fetch error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Requests",
        text:
          error?.response?.data?.message ||
          "Could not fetch UID requests for Principal approval.",
        confirmButtonColor: "#2563eb",
      });

      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getRequestId = (request) =>
    request?._id ||
    request?.id ||
    request?.requestId;

  const getDepartment = (request) =>
    request?.department ||
    request?.Department ||
    "Unknown";

  const getType = (request) =>
    request?.type ||
    request?.paperType ||
    "Research";

  const getTitle = (request) =>
    request?.paperTitle ||
    request?.title ||
    "Untitled Research Paper";

  const getFacultyName = (request) =>
    request?.facultyName ||
    request?.fullName ||
    request?.faculty?.fullName ||
    request?.user?.fullName ||
    "Unknown Faculty";

  const getFacultyId = (request) =>
    request?.userId ||
    request?.facultyId ||
    request?.faculty?.userId ||
    "N/A";

  const getAbstract = (request) =>
    request?.abstract ||
    request?.description ||
    "";

  const getTarget = (request) =>
    request?.target ||
    request?.publicationTarget ||
    "Not specified";

  const getSubmittedDate = (request) =>
    request?.submittedAt ||
    request?.createdAt ||
    request?.updatedAt;

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Not available";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Not available";
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const departments = useMemo(() => {
    const values = requests
      .map((request) => getDepartment(request))
      .filter(Boolean)
      .filter((value) => value !== "Unknown");

    return [...new Set(values)].sort();
  }, [requests]);

  const types = useMemo(() => {
    const values = requests
      .map((request) => getType(request))
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [requests]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalRequests = requests.length;

  const journalCount = requests.filter(
    (request) =>
      getType(request).toLowerCase() === "journal"
  ).length;

  const conferenceCount = requests.filter(
    (request) =>
      getType(request).toLowerCase() === "conference"
  ).length;

  const todayCount = requests.filter((request) => {
    const submittedDate = getSubmittedDate(request);

    if (!submittedDate) return false;

    const date = new Date(submittedDate);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;

  /* =========================================================
     FILTERED REQUESTS
  ========================================================= */

  const filteredRequests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const title = getTitle(request).toLowerCase();
      const faculty = getFacultyName(request).toLowerCase();
      const facultyId = String(getFacultyId(request)).toLowerCase();
      const department = getDepartment(request).toLowerCase();
      const type = getType(request).toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        faculty.includes(search) ||
        facultyId.includes(search) ||
        department.includes(search) ||
        type.includes(search);

      const matchesDepartment =
        departmentFilter === "all" ||
        department === departmentFilter.toLowerCase();

      const matchesType =
        typeFilter === "all" ||
        type === typeFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesType
      );
    });
  }, [
    requests,
    searchTerm,
    departmentFilter,
    typeFilter,
  ]);

  /* =========================================================
     EXPAND / COLLAPSE
  ========================================================= */

  const toggleRequest = (id) => {
    setOpenRequestId((current) =>
      current === id ? null : id
    );

    if (rejectingId !== id) {
      setRejectingId(null);
      setRejectReason("");
      setCustomReason("");
    }
  };

  /* =========================================================
     ACCEPT REQUEST
  ========================================================= */

  const handleAccept = async (request) => {
    const requestId = getRequestId(request);

    if (!requestId) {
      Swal.fire({
        icon: "error",
        title: "Invalid Request",
        text: "Request ID could not be identified.",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Approve UID Request?",
      html: `
        <div style="font-size:13px;color:#64748b;line-height:1.6;">
          You are approving the UID request for
          <strong>${getFacultyName(request)}</strong>.
          <br/>
          <span style="color:#334155;">
            ${getTitle(request)}
          </span>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Approve Request",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#21855a",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/principal/uid-request/${requestId}/accept`
      );

      Swal.fire({
        icon: "success",
        title: "Request Approved",
        text: "The UID request has been approved successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      setOpenRequestId(null);
      await fetchRequests(false);
    } catch (error) {
      console.error("Principal UID accept error:", error);

      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text:
          error?.response?.data?.message ||
          "Unable to approve this UID request.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  /* =========================================================
     OPEN REJECTION
  ========================================================= */

  const openRejectPanel = (requestId) => {
    setRejectingId(requestId);
    setRejectReason("");
    setCustomReason("");
  };

  /* =========================================================
     CANCEL REJECTION
  ========================================================= */

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason("");
    setCustomReason("");
  };

  /* =========================================================
     CONFIRM REJECTION
  ========================================================= */

  const handleReject = async (request) => {
    const requestId = getRequestId(request);

    if (!requestId) {
      Swal.fire({
        icon: "error",
        title: "Invalid Request",
        text: "Request ID could not be identified.",
      });
      return;
    }

    if (!rejectReason) {
      Swal.fire({
        icon: "warning",
        title: "Select a Reason",
        text: "Please select a rejection reason.",
        confirmButtonColor: "#c85858",
      });
      return;
    }

    if (
      rejectReason === "Other" &&
      !customReason.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Enter Rejection Reason",
        text: "Please provide a custom rejection reason.",
        confirmButtonColor: "#c85858",
      });
      return;
    }

    const finalReason =
      rejectReason === "Other"
        ? customReason.trim()
        : rejectReason;

    const result = await Swal.fire({
      icon: "warning",
      title: "Reject UID Request?",
      html: `
        <div style="font-size:13px;color:#64748b;line-height:1.6;">
          This request will be rejected with the reason:
          <br/>
          <strong style="color:#b14a4a;">
            ${finalReason}
          </strong>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Reject Request",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#bd5050",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/principal/uid-request/${requestId}/reject`,
        {
          reason: finalReason,
          rejectionReason: finalReason,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Request Rejected",
        text: "The UID request has been rejected.",
        timer: 1800,
        showConfirmButton: false,
      });

      cancelReject();
      setOpenRequestId(null);

      await fetchRequests(false);
    } catch (error) {
      console.error("Principal UID reject error:", error);

      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text:
          error?.response?.data?.message ||
          "Unable to reject this UID request.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("all");
    setTypeFilter("all");
  };

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const exportCSV = () => {
    if (!filteredRequests.length) {
      Swal.fire({
        icon: "info",
        title: "Nothing to Export",
        text: "There are no UID requests matching the current filters.",
      });
      return;
    }

    const headers = [
      "Faculty Name",
      "User ID",
      "Department",
      "Paper Title",
      "Type",
      "Target",
      "Submitted Date",
      "Abstract",
    ];

    const rows = filteredRequests.map((request) => [
      getFacultyName(request),
      getFacultyId(request),
      getDepartment(request),
      getTitle(request),
      getType(request),
      getTarget(request),
      formatDate(getSubmittedDate(request)),
      getAbstract(request),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "").replace(
              /"/g,
              '""'
            );

            return `"${text}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `principal_uid_requests_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="uid-approval-page">
        <div className="uid-loading-state">
          <div className="loading-spinner"></div>

          <h3>Loading UID Requests</h3>

          <p>
            Fetching UID requests awaiting Principal approval...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="uid-approval-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="uid-approval-hero">

        <div className="hero-content">

          <div className="hero-icon">
            <FiCheckCircle />
          </div>

          <div>

            <div className="hero-title-row">

              <h1>Principal UID Approval</h1>

              <span className="department-badge">
                All Departments
              </span>

            </div>

            <p>
              Review and approve UID requests that have
              completed the RD Coordinator approval stage.
            </p>

          </div>

        </div>

        <button
          className="refresh-btn"
          onClick={() => fetchRequests(false)}
          disabled={refreshing}
        >
          <FiRefreshCw
            className={refreshing ? "spinning" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="stats-bar">

        <div className="stat-card stat-total">

          <div className="stat-icon-circle">
            <span>
              <FiFileText />
            </span>
          </div>

          <div className="stat-content">

            <p>Total Requests</p>

            <h3>{totalRequests}</h3>

            <span className="stat-subtitle">
              Awaiting Principal review
            </span>

          </div>

        </div>


        <div className="stat-card stat-journal">

          <div className="stat-icon-circle">
            <span>
              <FiBookOpen />
            </span>
          </div>

          <div className="stat-content">

            <p>Journal Requests</p>

            <h3>{journalCount}</h3>

            <span className="stat-subtitle">
              Journal publications
            </span>

          </div>

        </div>


        <div className="stat-card stat-conference">

          <div className="stat-icon-circle">
            <span>
              <FiUsers />
            </span>
          </div>

          <div className="stat-content">

            <p>Conference Requests</p>

            <h3>{conferenceCount}</h3>

            <span className="stat-subtitle">
              Conference publications
            </span>

          </div>

        </div>


        <div className="stat-card stat-today">

          <div className="stat-icon-circle">
            <span>
              <FiCalendar />
            </span>
          </div>

          <div className="stat-content">

            <p>Submitted Today</p>

            <h3>{todayCount}</h3>

            <span className="stat-subtitle">
              New requests today
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          CONTROL PANEL
      ===================================================== */}

      <section className="uid-control-panel">

        <div className="control-top">

          <div className="control-heading">

            <div className="control-heading-icon">
              <FiFilter />
            </div>

            <div>
              <h3>Request Filters</h3>

              <span>
                Search and filter UID requests across all departments
              </span>
            </div>

          </div>

          <div className="result-count">
            Showing
            <strong>{filteredRequests.length}</strong>
            requests
          </div>

        </div>


        <div className="toolbar">

          {/* SEARCH */}

          <div className="search-wrapper">

            <FiSearch />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search faculty, title, department or user ID..."
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                type="button"
              >
                <FiX />
              </button>
            )}

          </div>


          {/* DEPARTMENT */}

          <div className="select-wrapper">

            <FiMapPin />

            <select
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value)
              }
            >
              <option value="all">
                All Departments
              </option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}

            </select>

          </div>


          {/* TYPE */}

          <div className="select-wrapper">

            <FiFile />

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              <option value="all">
                All Types
              </option>

              {types.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}

            </select>

          </div>


          {/* EXPORT */}

          <div className="export-group">

            <button
              className="toolbar-btn excel-btn"
              onClick={exportCSV}
              type="button"
              title="Export CSV"
            >
              <FiDownload />
              <span>Export</span>
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION HEADER
      ===================================================== */}

      <div className="requests-section-header">

        <div>

          <div className="section-title-row">

            <h2>
              UID Approval Requests
            </h2>

            <span className="pending-pill">
              {filteredRequests.length} Pending
            </span>

          </div>

          <p>
            Requests approved by the RD Coordinator and
            awaiting Principal decision
          </p>

        </div>


        {(searchTerm ||
          departmentFilter !== "all" ||
          typeFilter !== "all") && (
          <button
            className="reset-filter-btn"
            onClick={resetFilters}
          >
            <FiX />
            Reset Filters
          </button>
        )}

      </div>


      {/* =====================================================
          REQUEST LIST
      ===================================================== */}

      {filteredRequests.length === 0 ? (

        <div className="uid-empty-state">

          <div className="empty-icon">
            <FiCheckCircle />
          </div>

          <h3>
            No UID Requests Found
          </h3>

          <p>
            There are currently no UID requests matching
            your selected filters.
          </p>

          {(searchTerm ||
            departmentFilter !== "all" ||
            typeFilter !== "all") && (
            <button
              className="empty-refresh-btn"
              onClick={resetFilters}
            >
              <FiRefreshCw />
              Clear Filters
            </button>
          )}

        </div>

      ) : (

        <div className="uid-request-list">

          {filteredRequests.map(
            (request, index) => {

              const requestId =
                getRequestId(request);

              const isOpen =
                openRequestId === requestId;

              const isRejecting =
                rejectingId === requestId;

              return (
                <div
                  className={`uid-request-card ${
                    isOpen ? "is-expanded" : ""
                  } ${
                    isRejecting ? "is-rejecting" : ""
                  }`}
                  key={requestId || index}
                >

                  {/* =========================================
                      REQUEST TOP
                  ========================================= */}

                  <div
                    className="request-card-top"
                    onClick={() =>
                      toggleRequest(requestId)
                    }
                  >

                    <div className="request-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>


                    <div className="request-main">

                      <div className="request-badges">

                        <span className="new-badge">
                          <span></span>
                          Pending
                        </span>

                        <span className="type-badge">
                          <FiFileText />
                          {getType(request)}
                        </span>

                      </div>


                      <h3>
                        {getTitle(request)}
                      </h3>


                      <div className="request-meta">

                        <span>
                          <FiUser />
                          {getFacultyName(request)}
                        </span>

                        <span className="meta-separator">
                          •
                        </span>

                        <span>
                          <FiMapPin />
                          {getDepartment(request)}
                        </span>

                        <span className="meta-separator">
                          •
                        </span>

                        <span>
                          ID: {getFacultyId(request)}
                        </span>

                      </div>

                    </div>


                    <div className="request-right">

                      <div className="request-date">

                        <span>
                          Submitted
                        </span>

                        <strong>
                          {formatDate(
                            getSubmittedDate(request)
                          )}
                        </strong>

                      </div>


                      <button
                        type="button"
                        className={`expand-request-btn ${
                          isOpen ? "active" : ""
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();

                          toggleRequest(requestId);
                        }}
                      >
                        {isOpen ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </button>

                    </div>

                  </div>


                  {/* =========================================
                      QUICK INFO
                  ========================================= */}

                  <div className="quick-info-row">

                    <div className="quick-info-item">

                      <div className="quick-icon">
                        <FiUser />
                      </div>

                      <div>

                        <small>
                          FACULTY
                        </small>

                        <strong>
                          {getFacultyName(request)}
                        </strong>

                      </div>

                    </div>


                    <div className="quick-info-item">

                      <div className="quick-icon">
                        <FiMapPin />
                      </div>

                      <div>

                        <small>
                          DEPARTMENT
                        </small>

                        <strong>
                          {getDepartment(request)}
                        </strong>

                      </div>

                    </div>


                    <div className="quick-info-item">

                      <div className="quick-icon">
                        <FiFileText />
                      </div>

                      <div>

                        <small>
                          TYPE
                        </small>

                        <strong>
                          {getType(request)}
                        </strong>

                      </div>

                    </div>


                    <div className="quick-info-item">

                      <div className="quick-icon">
                        <FiTarget />
                      </div>

                      <div>

                        <small>
                          TARGET
                        </small>

                        <strong>
                          {getTarget(request)}
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* =========================================
                      EXPANDED CONTENT
                  ========================================= */}

                  {isOpen && (
                    <div className="request-expanded-content">

                      <div className="expanded-divider"></div>


                      {/* DETAILS */}

                      <div className="detail-section">

                        <div className="detail-section-heading">

                          <div>

                            <div className="heading-icon">
                              <FiFileText />
                            </div>

                            <div>

                              <h4>
                                Request Details
                              </h4>

                              <p>
                                UID request information
                              </p>

                            </div>

                          </div>

                        </div>


                        <div className="detail-grid">

                          <div className="detail-box">

                            <span>
                              Faculty Name
                            </span>

                            <strong>
                              {getFacultyName(request)}
                            </strong>

                          </div>


                          <div className="detail-box">

                            <span>
                              User ID
                            </span>

                            <strong>
                              {getFacultyId(request)}
                            </strong>

                          </div>


                          <div className="detail-box">

                            <span>
                              Department
                            </span>

                            <strong>
                              {getDepartment(request)}
                            </strong>

                          </div>


                          <div className="detail-box">

                            <span>
                              Publication Type
                            </span>

                            <strong>
                              {getType(request)}
                            </strong>

                          </div>


                          <div className="detail-box">

                            <span>
                              Target
                            </span>

                            <strong>
                              {getTarget(request)}
                            </strong>

                          </div>


                          <div className="detail-box">

                            <span>
                              Submitted
                            </span>

                            <strong>
                              {formatDateTime(
                                getSubmittedDate(request)
                              )}
                            </strong>

                          </div>


                          {request?.uid && (
                            <div className="detail-box">

                              <span>
                                UID
                              </span>

                              <strong>
                                {request.uid}
                              </strong>

                            </div>
                          )}

                        </div>

                      </div>


                      {/* ABSTRACT */}

                      <div className="abstract-section">

                        <div className="abstract-heading">

                          <div className="abstract-icon">
                            <FiFileText />
                          </div>

                          <div>

                            <h4>
                              Research Abstract
                            </h4>

                            <span>
                              Submitted research summary
                            </span>

                          </div>

                        </div>


                        <div className="abstract-content">

                          {getAbstract(request) ? (
                            <p>
                              {getAbstract(request)}
                            </p>
                          ) : (
                            <p className="no-abstract">
                              No abstract was provided
                              for this request.
                            </p>
                          )}

                        </div>

                      </div>


                      {/* =====================================
                          REJECTION PANEL
                      ===================================== */}

                      {isRejecting && (
                        <div className="rejection-panel">

                          <div className="rejection-header">

                            <div className="rejection-title">

                              <span>
                                <FiAlertCircle />
                              </span>

                              <div>

                                <h4>
                                  Reject UID Request
                                </h4>

                                <p>
                                  Select a reason for rejecting
                                  this request.
                                </p>

                              </div>

                            </div>


                            <button
                              type="button"
                              className="close-rejection"
                              onClick={cancelReject}
                            >
                              <FiX />
                            </button>

                          </div>


                          <div className="reason-options">

                            {REJECTION_REASONS.map(
                              (reason) => (
                                <label
                                  key={reason}
                                  className={`reason-option ${
                                    rejectReason === reason
                                      ? "selected"
                                      : ""
                                  }`}
                                >

                                  <input
                                    type="radio"
                                    name={`reject-${requestId}`}
                                    value={reason}
                                    checked={
                                      rejectReason ===
                                      reason
                                    }
                                    onChange={(e) =>
                                      setRejectReason(
                                        e.target.value
                                      )
                                    }
                                  />

                                  <span className="radio-custom"></span>

                                  {reason}

                                </label>
                              )
                            )}

                          </div>


                          {rejectReason === "Other" && (
                            <textarea
                              value={customReason}
                              onChange={(e) =>
                                setCustomReason(
                                  e.target.value
                                )
                              }
                              placeholder="Enter the rejection reason..."
                            />
                          )}


                          <div className="rejection-actions">

                            <button
                              type="button"
                              className="cancel-reject-btn"
                              onClick={cancelReject}
                            >
                              <FiX />
                              Cancel
                            </button>


                            <button
                              type="button"
                              className="confirm-reject-btn"
                              onClick={() =>
                                handleReject(request)
                              }
                            >
                              <FiCheck />
                              Confirm Rejection
                            </button>

                          </div>

                        </div>
                      )}


                      {/* =====================================
                          APPROVAL FOOTER
                      ===================================== */}

                      {!isRejecting && (
                        <div className="approval-footer">

                          <div className="approval-note">

                            <span>
                              <FiClock />
                            </span>

                            <p>
                              This request has completed
                              the RD Coordinator approval
                              stage and is awaiting the
                              Principal's decision.
                            </p>

                          </div>


                          <div className="approval-actions">

                            <button
                              type="button"
                              className="reject-request-btn"
                              onClick={() =>
                                openRejectPanel(
                                  requestId
                                )
                              }
                            >
                              <FiX />
                              Reject
                            </button>


                            <button
                              type="button"
                              className="accept-request-btn"
                              onClick={() =>
                                handleAccept(request)
                              }
                            >
                              <FiCheck />
                              Approve UID
                            </button>

                          </div>

                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>
      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="uid-page-footer">

        <span>
          Showing{" "}
          <strong>
            {filteredRequests.length}
          </strong>{" "}
          of{" "}
          <strong>
            {requests.length}
          </strong>{" "}
          pending UID requests
        </span>

        <span>
          <FiCheckCircle />
          Principal Approval Panel
        </span>

      </div>

    </div>
  );
}