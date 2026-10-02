import React, { useEffect, useMemo, useState } from "react";
import "./HodUidApproval.css";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  FiActivity,
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiDownload,
  FiFileText,
  FiFilter,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiTarget,
  FiUser,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

export default function RDcoordinatorUidApproval({
  rdCoordinatorId: propRdCoordinatorId,
}) {
  const [requests, setRequests] = useState([]);
  const [department, setDepartment] = useState("RD Coordinator");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const [expandedId, setExpandedId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  /* =========================================================
     RD COORDINATOR ID
  ========================================================= */

  const rdCoordinatorId =
    propRdCoordinatorId ||
    JSON.parse(localStorage.getItem("user") || "null")?.userId ||
    localStorage.getItem("userId");

  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchRequests = async (showLoader = true) => {
    if (!rdCoordinatorId) {
      Swal.fire({
        icon: "error",
        title: "RD Coordinator session not found",
        text: "Please log in again.",
      });

      setLoading(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      /*
       * Use the common faculty profile endpoint.
       * Your RD Dashboard already uses:
       * /api/faculty/${userId}
       */
      const profileRes = await fetch(
        `/api/faculty/${rdCoordinatorId}`
      );

      if (!profileRes.ok) {
        throw new Error(
          "Unable to fetch RD Coordinator profile"
        );
      }

      const profileData = await profileRes.json();

      setDepartment(
        profileData.department || "RD Coordinator"
      );

      /*
       * RD Coordinator pending UID requests
       */
      const requestRes = await fetch(
        `/api/rdcoordinator/uid-requests/${rdCoordinatorId}`
      );

      if (!requestRes.ok) {
        throw new Error(
          "Unable to fetch RD Coordinator UID requests"
        );
      }

      const data = await requestRes.json();

      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Error fetching RD Coordinator UID requests:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Unable to load requests",
        text:
          "Something went wrong while loading UID requests.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests(true);
  }, [rdCoordinatorId]);

  /* =========================================================
     ACCEPT / REJECT ACTIONS
  ========================================================= */

  const handleAction = async (id, status) => {
    try {
      let url = `/api/rdcoordinator/uid-request/${id}/accept/${rdCoordinatorId}`;

      let body = null;

      if (status === "reject") {
        const finalReason =
          rejectReason === "Other"
            ? customReason.trim()
            : rejectReason;

        if (!finalReason) {
          Swal.fire({
            icon: "warning",
            title: "Reason required",
            text:
              "Please provide a reason for rejecting this request.",
          });

          return;
        }

        url = `/api/rdcoordinator/uid-request/${id}/reject/${rdCoordinatorId}`;

        body = JSON.stringify({
          reason: finalReason,
        });
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Action failed"
        );
      }

      await Swal.fire({
        icon: "success",
        title:
          status === "reject"
            ? "Request Rejected"
            : "Request Accepted",
        text:
          data.message ||
          "Action completed successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      /*
       * Remove request from current pending list
       */
      setRequests((prev) =>
        prev.filter((r) => r._id !== id)
      );

      setRejectingId(null);
      setRejectReason("");
      setCustomReason("");
      setExpandedId(null);
    } catch (error) {
      console.error(
        "RD Coordinator UID action error:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Action failed",
        text:
          error.message ||
          "Unable to process the request.",
      });
    }
  };

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...requests]
      .filter((req) => {
        const searchMatch =
          !query ||
          req.paperTitle
            ?.toLowerCase()
            .includes(query) ||
          req.facultyName
            ?.toLowerCase()
            .includes(query) ||
          req.facultyId
            ?.toLowerCase()
            .includes(query) ||
          req.type
            ?.toLowerCase()
            .includes(query) ||
          req.target
            ?.toLowerCase()
            .includes(query);

        const typeMatch =
          filterType === "all" ||
          req.type === filterType;

        return searchMatch && typeMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.submittedAt
        ).getTime();

        const dateB = new Date(
          b.submittedAt
        ).getTime();

        return sortOrder === "latest"
          ? dateB - dateA
          : dateA - dateB;
      });
  }, [
    requests,
    search,
    filterType,
    sortOrder,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const today = new Date().toDateString();

    return {
      total: requests.length,

      journals: requests.filter(
        (r) => r.type === "Journal"
      ).length,

      conferences: requests.filter(
        (r) => r.type === "Conference"
      ).length,

      today: requests.filter(
        (r) =>
          new Date(
            r.submittedAt
          ).toDateString() === today
      ).length,
    };
  }, [requests]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const isNewRequest = (date) => {
    if (!date) return false;

    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) return false;

    return (
      Date.now() - timestamp <
      24 * 60 * 60 * 1000
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const toggleExpanded = (id) => {
    setExpandedId((prev) =>
      prev === id ? null : id
    );

    if (
      rejectingId &&
      rejectingId !== id
    ) {
      setRejectingId(null);
      setRejectReason("");
      setCustomReason("");
    }
  };

  const openRejectPanel = (id) => {
    setRejectingId(id);
    setExpandedId(id);
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason("");
    setCustomReason("");
  };

  /* =========================================================
     EXPORT EXCEL
  ========================================================= */

  const exportToExcel = async () => {
    if (!filteredRequests.length) {
      Swal.fire({
        icon: "info",
        title: "Nothing to export",
        text:
          "There are no requests matching the current filters.",
      });

      return;
    }

    const workbook = new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet("UID Requests");

    sheet.columns = [
      {
        header: "Paper Title",
        key: "paperTitle",
        width: 35,
      },
      {
        header: "Faculty Name",
        key: "facultyName",
        width: 25,
      },
      {
        header: "Faculty ID",
        key: "facultyId",
        width: 20,
      },
      {
        header: "Department",
        key: "department",
        width: 18,
      },
      {
        header: "Type",
        key: "type",
        width: 18,
      },
      {
        header: "Target",
        key: "target",
        width: 22,
      },
      {
        header: "Submitted Date",
        key: "submittedAt",
        width: 20,
      },
    ];

    sheet
      .getRow(1)
      .eachCell((cell) => {
        cell.font = {
          bold: true,
          color: {
            argb: "FFFFFF",
          },
          size: 11,
        };

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "183B68",
          },
        };

        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        cell.border = {
          bottom: {
            style: "thin",
            color: {
              argb: "D8E1EC",
            },
          },
        };
      });

    filteredRequests.forEach((req) => {
      sheet.addRow({
        paperTitle: req.paperTitle || "",
        facultyName: req.facultyName || "",
        facultyId: req.facultyId || "",
        department:
          req.department || department || "",
        type: req.type || "",
        target: req.target || "",
        submittedAt: formatDate(
          req.submittedAt
        ),
      });
    });

    sheet.eachRow(
      (row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = {
            vertical: "middle",
            wrapText: true,
          };
        }
      }
    );

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `RD_Coordinator_UID_Requests_${department}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  };

  /* =========================================================
     EXPORT PDF
  ========================================================= */

  const exportPDF = () => {
    if (!filteredRequests.length) {
      Swal.fire({
        icon: "info",
        title: "Nothing to export",
        text:
          "There are no requests matching the current filters.",
      });

      return;
    }

    const doc = new jsPDF(
      "landscape"
    );

    doc.setFontSize(18);
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      `UID REQUEST REPORT - ${department}`,
      14,
      15
    );

    doc.setFontSize(9);
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      `Generated on ${new Date().toLocaleString(
        "en-IN"
      )}`,
      14,
      22
    );

    const tableData =
      filteredRequests.map((req) => [
        req.paperTitle || "-",
        req.facultyName || "-",
        req.facultyId || "-",
        req.type || "-",
        req.target || "-",
        formatDate(req.submittedAt),
      ]);

    autoTable(doc, {
      head: [
        [
          "Paper Title",
          "Faculty",
          "Faculty ID",
          "Type",
          "Target",
          "Date",
        ],
      ],

      body: tableData,

      startY: 28,

      styles: {
        fontSize: 8,
        cellPadding: 4,
      },

      headStyles: {
        fillColor: [
          24,
          59,
          104,
        ],
        textColor: 255,
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: [
          245,
          248,
          252,
        ],
      },
    });

    doc.save(
      `RD_Coordinator_UID_Report_${department}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  };

  /* =========================================================
     EMAIL REPORT
  ========================================================= */

  const sendReportToRdCoordinator =
    async () => {
      if (!filteredRequests.length) {
        Swal.fire({
          icon: "info",
          title: "Nothing to send",
          text:
            "There are no requests matching the current filters.",
        });

        return;
      }

      try {
        const user = JSON.parse(
          localStorage.getItem("user") ||
            "null"
        );

        const email =
          user?.email || "";

        if (!email) {
          Swal.fire({
            icon: "warning",
            title: "Email not found",
            text:
              "No email address is available for the RD Coordinator account.",
          });

          return;
        }

        const userId =
          user?.userId ||
          localStorage.getItem(
            "userId"
          );

        /*
         * RD Coordinator report endpoint.
         *
         * If your backend currently uses a different
         * endpoint for RD email reports, change ONLY
         * this URL.
         */
        const res = await fetch(
          "/api/rdcoordinator/send-report",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              userId,
              reportData:
                filteredRequests,
            }),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Failed to send email"
          );
        }

        Swal.fire({
          icon: "success",
          title: "Report Sent",
          text:
            "The UID report has been sent successfully.",
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(
          "RD Coordinator email report error:",
          error
        );

        Swal.fire({
          icon: "error",
          title: "Email failed",
          text:
            error.message ||
            "Server error while sending email.",
        });
      }
    };

  const rejectionOptions = [
    "Insufficient Details",
    "Not Relevant to Department",
    "Duplicate Submission",
    "Unclear Abstract",
    "Other",
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="uid-approval-page">

      {/* =====================================================
          HERO HEADER
      ===================================================== */}

      <motion.section
        className="uid-approval-hero"
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
      >
        <div className="hero-content">

          <div className="hero-icon">
            <FiActivity />
          </div>

          <div>
            <div className="hero-title-row">

              <h1>
                UID Approval Center
              </h1>

              <span className="department-badge">
                {department}
              </span>

            </div>

            <p>
              Review, approve and manage faculty UID
              requests submitted for your department.
            </p>
          </div>

        </div>

        <button
          className="refresh-btn"
          onClick={() =>
            fetchRequests(false)
          }
          disabled={refreshing}
          title="Refresh requests"
        >
          <FiRefreshCw
            className={
              refreshing
                ? "spinning"
                : ""
            }
          />

          <span>
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>

      </motion.section>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="stats-bar">

        <motion.div
          className="stat-card stat-total"
          whileHover={{ y: -4 }}
        >
          <div className="stat-icon-circle">
            <span>📋</span>
          </div>

          <div className="stat-content">
            <p>Total Requests</p>

            <h3>
              {statistics.total}
            </h3>

            <span className="stat-subtitle">
              Pending approvals
            </span>
          </div>
        </motion.div>

        <motion.div
          className="stat-card stat-journal"
          whileHover={{ y: -4 }}
        >
          <div className="stat-icon-circle">
            <span>📘</span>
          </div>

          <div className="stat-content">
            <p>Journals</p>

            <h3>
              {statistics.journals}
            </h3>

            <span className="stat-subtitle">
              Journal requests
            </span>
          </div>
        </motion.div>

        <motion.div
          className="stat-card stat-conference"
          whileHover={{ y: -4 }}
        >
          <div className="stat-icon-circle">
            <span>🎤</span>
          </div>

          <div className="stat-content">
            <p>Conferences</p>

            <h3>
              {statistics.conferences}
            </h3>

            <span className="stat-subtitle">
              Conference requests
            </span>
          </div>
        </motion.div>

        <motion.div
          className="stat-card stat-today"
          whileHover={{ y: -4 }}
        >
          <div className="stat-icon-circle">
            <span>📅</span>
          </div>

          <div className="stat-content">
            <p>Today</p>

            <h3>
              {statistics.today}
            </h3>

            <span className="stat-subtitle">
              New submissions
            </span>
          </div>
        </motion.div>

      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <section className="uid-control-panel">

        <div className="control-top">

          <div className="control-heading">

            <div className="control-heading-icon">
              <FiFilter />
            </div>

            <div>
              <h3>
                Request Management
              </h3>

              <span>
                Search and filter pending UID submissions
              </span>
            </div>

          </div>

          <div className="result-count">

            <strong>
              {filteredRequests.length}
            </strong>

            <span>
              {filteredRequests.length === 1
                ? "request"
                : "requests"}{" "}
              shown
            </span>

          </div>

        </div>

        <div className="toolbar">

          <div className="search-wrapper">

            <FiSearch />

            <input
              type="text"
              placeholder="Search paper, faculty, ID or target..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                <FiX />
              </button>
            )}

          </div>

          <div className="select-wrapper">

            <FiFileText />

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Publication Types
              </option>

              <option value="Journal">
                Journal
              </option>

              <option value="Conference">
                Conference
              </option>

              <option value="Book Chapter">
                Book Chapter
              </option>

              <option value="Book">
                Book
              </option>

              <option value="Patent">
                Patent
              </option>
            </select>

          </div>

          <div className="select-wrapper">

            <FiCalendar />

            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value
                )
              }
            >
              <option value="latest">
                Latest First
              </option>

              <option value="oldest">
                Oldest First
              </option>
            </select>

          </div>

          <div className="export-group">

            <button
              className="toolbar-btn excel-btn"
              onClick={
                exportToExcel
              }
            >
              <FiDownload />
              <span>Excel</span>
            </button>

            <button
              className="toolbar-btn pdf-btn"
              onClick={exportPDF}
            >
              <FiFileText />
              <span>PDF</span>
            </button>

            <button
              className="toolbar-btn email-btn"
              onClick={
                sendReportToRdCoordinator
              }
            >
              <FiMail />
              <span>Email</span>
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
              Pending UID Requests
            </h2>

            <span className="pending-pill">
              {requests.length} Pending
            </span>

          </div>

          <p>
            Review faculty research publication requests
            before forwarding them to the next approval stage.
          </p>

        </div>

        {search ||
        filterType !== "all" ? (
          <button
            className="reset-filter-btn"
            onClick={() => {
              setSearch("");
              setFilterType("all");
              setSortOrder("latest");
            }}
          >
            <FiX />
            Clear Filters
          </button>
        ) : null}

      </div>

      {/* =====================================================
          LOADING / EMPTY / REQUEST LIST
      ===================================================== */}

      {loading ? (

        <div className="uid-loading-state">

          <div className="loading-spinner">
            <div></div>
          </div>

          <h3>
            Loading UID requests
          </h3>

          <p>
            Fetching the latest submissions for{" "}
            {department}.
          </p>

        </div>

      ) : filteredRequests.length === 0 ? (

        <motion.div
          className="uid-empty-state"
          initial={{
            opacity: 0,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >

          <div className="empty-icon">
            {requests.length === 0 ? (
              <FiCheck />
            ) : (
              <FiSearch />
            )}
          </div>

          <h3>
            {requests.length === 0
              ? "All caught up!"
              : "No matching requests"}
          </h3>

          <p>
            {requests.length === 0
              ? `There are currently no pending UID requests for ${department}.`
              : "Try changing your search or filter settings."}
          </p>

          {requests.length === 0 ? (

            <button
              className="empty-refresh-btn"
              onClick={() =>
                fetchRequests(false)
              }
            >
              <FiRefreshCw />
              Refresh Requests
            </button>

          ) : (

            <button
              className="empty-refresh-btn"
              onClick={() => {
                setSearch("");
                setFilterType("all");
              }}
            >
              <FiX />
              Clear Filters
            </button>

          )}

        </motion.div>

      ) : (

        <div className="uid-request-list">

          <AnimatePresence mode="popLayout">

            {filteredRequests.map(
              (req, index) => {

                const expanded =
                  expandedId ===
                  req._id;

                const rejecting =
                  rejectingId ===
                  req._id;

                return (
                  <motion.article
                    layout
                    key={req._id}
                    className={`uid-request-card ${
                      expanded
                        ? "is-expanded"
                        : ""
                    } ${
                      rejecting
                        ? "is-rejecting"
                        : ""
                    }`}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -20,
                      height: 0,
                      marginBottom: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(
                        index * 0.04,
                        0.25
                      ),
                    }}
                  >

                    {/* =========================================
                        CARD TOP
                    ========================================= */}

                    <div
                      className="request-card-top"
                      onClick={() =>
                        toggleExpanded(
                          req._id
                        )
                      }
                    >

                      <div className="request-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      <div className="request-main">

                        <div className="request-badges">

                          {isNewRequest(
                            req.submittedAt
                          ) && (
                            <span className="new-badge">
                              <span></span>
                              NEW
                            </span>
                          )}

                          <span
                            className={`type-badge ${(
                              req.type || ""
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            <FiFileText />
                            {req.type ||
                              "Publication"}
                          </span>

                        </div>

                        <h3>
                          {req.paperTitle ||
                            "Untitled Research Paper"}
                        </h3>

                        <div className="request-meta">

                          <span>
                            <FiUser />
                            {req.facultyName ||
                              "Unknown Faculty"}
                          </span>

                          <span className="meta-separator">
                            •
                          </span>

                          <span>
                            {req.facultyId ||
                              "No Faculty ID"}
                          </span>

                          <span className="meta-separator">
                            •
                          </span>

                          <span>
                            <FiCalendar />
                            {formatDate(
                              req.submittedAt
                            )}
                          </span>

                        </div>

                      </div>

                      <div className="request-right">

                        <div className="request-date">

                          <span>
                            Submitted
                          </span>

                          <strong>
                            {formatTime(
                              req.submittedAt
                            )}
                          </strong>

                        </div>

                        <button
                          className={`expand-request-btn ${
                            expanded
                              ? "active"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();

                            toggleExpanded(
                              req._id
                            );
                          }}
                        >
                          {expanded ? (
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

                        <span className="quick-icon">
                          <FiTarget />
                        </span>

                        <div>
                          <small>
                            Target
                          </small>

                          <strong>
                            {req.target ||
                              "Not specified"}
                          </strong>
                        </div>

                      </div>

                      <div className="quick-info-item">

                        <span className="quick-icon">
                          <FiBookOpen />
                        </span>

                        <div>
                          <small>
                            Department
                          </small>

                          <strong>
                            {req.department ||
                              department}
                          </strong>
                        </div>

                      </div>

                      <div className="quick-info-item">

                        <span className="quick-icon">
                          <FiUser />
                        </span>

                        <div>
                          <small>
                            Faculty ID
                          </small>

                          <strong>
                            {req.facultyId ||
                              "N/A"}
                          </strong>
                        </div>

                      </div>

                      <div className="quick-info-item">

                        <span className="quick-icon">
                          <FiCalendar />
                        </span>

                        <div>
                          <small>
                            Submitted
                          </small>

                          <strong>
                            {formatDate(
                              req.submittedAt
                            )}
                          </strong>
                        </div>

                      </div>

                    </div>

                    {/* =========================================
                        EXPANDED CONTENT
                    ========================================= */}

                    <AnimatePresence
                      initial={false}
                    >

                      {expanded && (
                        <motion.div
                          className="request-expanded-content"
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.3,
                          }}
                        >

                          <div className="expanded-divider"></div>

                          {/* DETAILS */}

                          <div className="detail-section">

                            <div className="detail-section-heading">

                              <div>

                                <span className="heading-icon">
                                  <FiFileText />
                                </span>

                                <div>

                                  <h4>
                                    Request Details
                                  </h4>

                                  <p>
                                    Publication
                                    information
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
                                  {req.facultyName ||
                                    "N/A"}
                                </strong>
                              </div>

                              <div className="detail-box">
                                <span>
                                  Faculty ID
                                </span>

                                <strong>
                                  {req.facultyId ||
                                    "N/A"}
                                </strong>
                              </div>

                              <div className="detail-box">
                                <span>
                                  Department
                                </span>

                                <strong>
                                  {req.department ||
                                    department}
                                </strong>
                              </div>

                              <div className="detail-box">
                                <span>
                                  Publication Type
                                </span>

                                <strong>
                                  {req.type ||
                                    "N/A"}
                                </strong>
                              </div>

                              <div className="detail-box">
                                <span>
                                  Target
                                </span>

                                <strong>
                                  {req.target ||
                                    "N/A"}
                                </strong>
                              </div>

                              <div className="detail-box">
                                <span>
                                  Submitted
                                </span>

                                <strong>
                                  {formatDate(
                                    req.submittedAt
                                  )}
                                </strong>
                              </div>

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
                                  Submitted by faculty
                                </span>

                              </div>

                            </div>

                            <div className="abstract-content">

                              {req.abstract ? (
                                <p>
                                  {req.abstract}
                                </p>
                              ) : (
                                <p className="no-abstract">
                                  No abstract was
                                  provided for this
                                  request.
                                </p>
                              )}

                            </div>

                          </div>

                          {/* REJECTION PANEL */}

                          <AnimatePresence>

                            {rejecting && (
                              <motion.div
                                className="rejection-panel"
                                initial={{
                                  opacity: 0,
                                  height: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  height: "auto",
                                }}
                                exit={{
                                  opacity: 0,
                                  height: 0,
                                }}
                              >

                                <div className="rejection-header">

                                  <div className="rejection-title">

                                    <span>
                                      <FiAlertCircle />
                                    </span>

                                    <div>

                                      <h4>
                                        Reject Request
                                      </h4>

                                      <p>
                                        Select a reason
                                        for rejecting
                                        this UID
                                        request.
                                      </p>

                                    </div>

                                  </div>

                                  <button
                                    className="close-rejection"
                                    onClick={
                                      cancelReject
                                    }
                                  >
                                    <FiX />
                                  </button>

                                </div>

                                <div className="reason-options">

                                  {rejectionOptions.map(
                                    (option) => (
                                      <label
                                        key={option}
                                        className={`reason-option ${
                                          rejectReason ===
                                          option
                                            ? "selected"
                                            : ""
                                        }`}
                                      >

                                        <input
                                          type="radio"
                                          name={`reason-${req._id}`}
                                          value={option}
                                          checked={
                                            rejectReason ===
                                            option
                                          }
                                          onChange={(e) =>
                                            setRejectReason(
                                              e.target
                                                .value
                                            )
                                          }
                                        />

                                        <span className="radio-custom"></span>

                                        <span>
                                          {option}
                                        </span>

                                      </label>
                                    )
                                  )}

                                </div>

                                {rejectReason ===
                                  "Other" && (
                                  <motion.textarea
                                    initial={{
                                      opacity: 0,
                                      y: -5,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    placeholder="Enter a detailed rejection reason..."
                                    value={
                                      customReason
                                    }
                                    onChange={(e) =>
                                      setCustomReason(
                                        e.target.value
                                      )
                                    }
                                  />
                                )}

                                <div className="rejection-actions">

                                  <button
                                    className="cancel-reject-btn"
                                    onClick={
                                      cancelReject
                                    }
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    className="confirm-reject-btn"
                                    onClick={() =>
                                      handleAction(
                                        req._id,
                                        "reject"
                                      )
                                    }
                                  >
                                    <FiX />
                                    Confirm Rejection
                                  </button>

                                </div>

                              </motion.div>
                            )}

                          </AnimatePresence>

                          {/* ACTION FOOTER */}

                          {!rejecting && (
                            <div className="approval-footer">

                              <div className="approval-note">

                                <span>
                                  <FiClock />
                                </span>

                                <p>
                                  Review the request
                                  details before
                                  taking an action.
                                </p>

                              </div>

                              <div className="approval-actions">

                                <button
                                  className="reject-request-btn"
                                  onClick={() =>
                                    openRejectPanel(
                                      req._id
                                    )
                                  }
                                >
                                  <FiX />
                                  Reject
                                </button>

                                <button
                                  className="accept-request-btn"
                                  onClick={() =>
                                    handleAction(
                                      req._id,
                                      "accept"
                                    )
                                  }
                                >
                                  <FiCheck />
                                  Accept Request
                                </button>

                              </div>

                            </div>
                          )}

                        </motion.div>
                      )}

                    </AnimatePresence>

                  </motion.article>
                );
              }
            )}

          </AnimatePresence>

        </div>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      {!loading &&
        requests.length > 0 && (
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
              pending requests
            </span>

            <span>
              <FiActivity />
              UID Approval Center
            </span>

          </div>
        )}

    </div>
  );
}

// import React, { useEffect, useState } from 'react';
// import './HodUidApproval.css'; // reuse same styling
// import Swal from 'sweetalert2';
// import { motion, AnimatePresence } from "framer-motion";

// export default function RDcoordinatorUidApproval({ department: propDepartment }) {
//   const [requests, setRequests] = useState([]);
//   const [department, setDepartment] = useState(propDepartment || '');
//   const [loading, setLoading] = useState(true);
//   const [rejectingId, setRejectingId] = useState(null);
//   const [rejectReason, setRejectReason] = useState('');
//   const [customReason, setCustomReason] = useState('');
//   const [expandedId, setExpandedId] = useState(null);

//   // 🔥 NEW
//   const [search, setSearch] = useState("");
//   const [filterType, setFilterType] = useState("all");
//   const [sortOrder, setSortOrder] = useState("latest");

//   const rdCoordinatorId = JSON.parse(localStorage.getItem("user"))?.userId;

//   useEffect(() => {
//     const fetchRequests = async () => {
//       if (!rdCoordinatorId) {
//         alert('RD Coordinator not logged in');
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);

//         if (!department) {
//           const profileRes = await fetch(`/api/faculty/${rdCoordinatorId}`);
//           const profileData = await profileRes.json();
//           setDepartment(profileData.department);
//         }

//         const requestRes = await fetch(
//           `/api/rdcoordinator/uid-requests/${rdCoordinatorId}`
//         );

//         if (!requestRes.ok) throw new Error('Failed to fetch UID requests');

//         const deptRequests = await requestRes.json();
//         setRequests(deptRequests);

//       } catch (err) {
//         console.error(err);
//         alert('Failed to load UID requests');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRequests();
//   }, [rdCoordinatorId, department]);

//   // 🔥 FILTER + SEARCH + SORT
//   const filteredRequests = requests
//     .filter((req) => {
//       const searchMatch =
//         req.paperTitle?.toLowerCase().includes(search.toLowerCase()) ||
//         req.facultyName?.toLowerCase().includes(search.toLowerCase());

//       const typeMatch =
//         filterType === "all" || req.type === filterType;

//       return searchMatch && typeMatch;
//     })
//     .sort((a, b) => {
//       if (sortOrder === "latest") {
//         return new Date(b.submittedAt) - new Date(a.submittedAt);
//       } else {
//         return new Date(a.submittedAt) - new Date(b.submittedAt);
//       }
//     });

//   const handleAction = async (id, status) => {
//     try {
//       let url = `/api/rdcoordinator/uid-request/${id}/accept/${rdCoordinatorId}`;
//       let body = null;

//       if (status === 'reject') {
//         const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
//         if (!finalReason) return Swal.fire('Error', 'Provide reason', 'error');

//         url = `/api/rdcoordinator/uid-request/${id}/reject/${rdCoordinatorId}`;
//         body = JSON.stringify({ reason: finalReason });
//       }

//       const res = await fetch(url, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body
//       });

//       const data = await res.json();

//       Swal.fire('Success', data.message, 'success');
//       setRequests(prev => prev.filter(r => r._id !== id));
//       setRejectingId(null);
//       setRejectReason('');
//       setCustomReason('');
//     } catch (err) {
//       Swal.fire('Error', 'Action failed', 'error');
//     }
//   };

//   const rejectionOptions = [
//     'Insufficient Details',
//     'Not Relevant to Department',
//     'Duplicate Submission',
//     'Unclear Abstract',
//     'Other'
//   ];

//   return (
//     <div className="uid-requests-container">

//       {/* 🔥 STATS */}
//       <div className="stats-bar">
//         <div className="stat-card">
//           <p>Total</p>
//           <h3>{requests.length}</h3>
//         </div>
//         <div className="stat-card">
//           <p>Journals</p>
//           <h3>{requests.filter(r => r.type === "Journal").length}</h3>
//         </div>
//         <div className="stat-card">
//           <p>Conferences</p>
//           <h3>{requests.filter(r => r.type === "Conference").length}</h3>
//         </div>
//       </div>

//       {/* 🔥 TOOLBAR */}
//       <div className="toolbar">

//         <input
//           type="text"
//           placeholder="🔍 Search..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="search-input"
//         />

//         <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
//           <option value="all">All Types</option>
//           <option value="Journal">Journal</option>
//           <option value="Conference">Conference</option>
//           <option value="Book">Book</option>
//         </select>

//         <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
//           <option value="latest">Latest</option>
//           <option value="oldest">Oldest</option>
//         </select>

//       </div>

//       <h2>Pending UID Requests ({department})</h2>

//       {loading ? (
//         <p>Loading...</p>
//       ) : filteredRequests.length === 0 ? (
//         <p>No UID requests.</p>
//       ) : (
//         filteredRequests.map(req => (
//           <motion.div
//             key={req._id}
//             layout
//             className="uid-request-card"
//           >

//             {/* HEADER */}
//             <div className="card-header">
//               <div onClick={() =>
//                 setExpandedId(expandedId === req._id ? null : req._id)
//               }>
//                 <h4>{req.paperTitle}</h4>
//                 <p>{req.facultyName}</p>
//               </div>

//               <button onClick={() =>
//                 setExpandedId(expandedId === req._id ? null : req._id)
//               }>
//                 {expandedId === req._id ? "▲" : "▼"}
//               </button>
//             </div>

//             {/* BODY */}
//             <AnimatePresence>
//               {expandedId === req._id && (
//                 <motion.div
//                   className="card-body"
//                   initial={{ height: 0 }}
//                   animate={{ height: "auto" }}
//                   exit={{ height: 0 }}
//                 >

//                   <p><strong>ID:</strong> {req.facultyId}</p>
//                   <p><strong>Type:</strong> {req.type}</p>
//                   <p><strong>Target:</strong> {req.target}</p>
//                   <p><strong>Date:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>

//                   <p><strong>Abstract:</strong> {req.abstract}</p>

//                   {/* ACTIONS */}
//                   <div className="actions">
//                     <button className="accept" onClick={() => handleAction(req._id, 'accept')}>
//                       Accept
//                     </button>

//                     {rejectingId === req._id ? (
//                       <>
//                         <select
//                           value={rejectReason}
//                           onChange={(e) => setRejectReason(e.target.value)}
//                         >
//                           <option value="">Select reason</option>
//                           {rejectionOptions.map((opt, i) => (
//                             <option key={i} value={opt}>{opt}</option>
//                           ))}
//                         </select>

//                         {rejectReason === "Other" && (
//                           <input
//                             type="text"
//                             placeholder="Custom reason"
//                             value={customReason}
//                             onChange={(e) => setCustomReason(e.target.value)}
//                           />
//                         )}

//                         <button onClick={() => handleAction(req._id, 'reject')}>
//                           Confirm
//                         </button>

//                         <button onClick={() => setRejectingId(null)}>
//                           Cancel
//                         </button>
//                       </>
//                     ) : (
//                       <button onClick={() => setRejectingId(req._id)}>
//                         Reject
//                       </button>
//                     )}
//                   </div>

//                 </motion.div>
//               )}
//             </AnimatePresence>

//           </motion.div>
//         ))
//       )}
//     </div>
//   );
// }

// // // src/pages/RDcoordinatorUidApproval.jsx
// // import React, { useEffect, useState } from 'react';
// // import './HodDashboard.css';
// // import Swal from 'sweetalert2';

// // export default function RDcoordinatorUidApproval({ department: propDepartment }) {
// //   const [requests, setRequests] = useState([]);
// //   const [department, setDepartment] = useState(propDepartment || '');
// //   const [loading, setLoading] = useState(true);
// //   const [rejectingId, setRejectingId] = useState(null);
// //   const [rejectReason, setRejectReason] = useState('');
// //   const [customReason, setCustomReason] = useState('');

// //   const rdCoordinatorId = JSON.parse(localStorage.getItem("user"))?.userId;

// //   useEffect(() => {
// //     const fetchRequests = async () => {
// //       if (!rdCoordinatorId) {
// //         alert('RD Coordinator not logged in');
// //         setLoading(false);
// //         return;
// //       }

// //       try {
// //         // If department not passed as prop, fetch from RD Coordinator profile
// //         if (!department) {
// //           const profileRes = await fetch(`/api/faculty/${rdCoordinatorId}`);
// //           const profileData = await profileRes.json();
// //           setDepartment(profileData.department);
// //         }

// //         // Fetch pending UID requests for this department
// //         const requestRes = await fetch(
// //           `/api/rdcoordinator/uid-requests/${rdCoordinatorId}`
// //         );

// //         if (!requestRes.ok) throw new Error('Failed to fetch UID requests');

// //         const deptRequests = await requestRes.json();
// //         setRequests(deptRequests);
// //       } catch (err) {
// //         console.error('Error fetching UID requests:', err);
// //         alert('Failed to load UID requests');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchRequests();
// //   }, [rdCoordinatorId, department]);

// //   const handleAction = async (id, status) => {
// //     try {
// //       let url = `/api/rdcoordinator/uid-request/${id}/accept/${rdCoordinatorId}`;
// //       let body = null;

// //       if (status === 'reject') {
// //         const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
// //         if (!finalReason) return Swal.fire('Error', 'Please provide a reason', 'error');

// //         url = `/api/rdcoordinator/uid-request/${id}/reject/${rdCoordinatorId}`;
// //         body = JSON.stringify({ reason: finalReason });
// //       }

// //       const res = await fetch(url, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json' },
// //         body
// //       });

// //       const data = await res.json();

// //       Swal.fire('Success', data.message, 'success');
// //       setRequests(prev => prev.filter(r => r._id !== id));
// //       setRejectingId(null);
// //       setRejectReason('');
// //       setCustomReason('');
// //     } catch (err) {
// //       console.error(err);
// //       Swal.fire('Error', 'Action failed', 'error');
// //     }
// //   };

// //   const rejectionOptions = [
// //     'Insufficient Details',
// //     'Not Relevant to Department',
// //     'Duplicate Submission',
// //     'Unclear Abstract',
// //     'Other'
// //   ];

// //   return (
// //     <div className="uid-requests-container">
// //       <h2>Pending UID Requests ({department})</h2>

// //       {loading ? (
// //         <p>Loading...</p>
// //       ) : requests.length === 0 ? (
// //         <p>No UID requests pending from {department}.</p>
// //       ) : (
// //         requests.map(req => (
// //           <div className="uid-request-card" key={req._id}>
// //             <h4>{req.paperTitle}</h4>
// //             <p><strong>Faculty Name:</strong> {req.facultyName}</p>
// //             <p><strong>Faculty ID:</strong> {req.facultyId}</p>
// //             <p><strong>Department:</strong> {req.department}</p>
// //             <p><strong>Type:</strong> {req.type}</p>
// //             <p><strong>Target:</strong> {req.target}</p>
// //             <p><strong>Abstract:</strong> {req.abstract}</p>
// //             <p><strong>Submitted At:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>

// //             <div className="actions">
// //               <button className="accept" onClick={() => handleAction(req._id, 'accept')}>Accept</button>

// //               {rejectingId === req._id ? (
// //                 <>
// //                   <select
// //                     className="reason-select"
// //                     value={rejectReason}
// //                     onChange={(e) => setRejectReason(e.target.value)}
// //                   >
// //                     <option value="">Select reason</option>
// //                     {rejectionOptions.map((opt, idx) => (
// //                       <option key={idx} value={opt}>{opt}</option>
// //                     ))}
// //                   </select>

// //                   {rejectReason === 'Other' && (
// //                     <input
// //                       type="text"
// //                       placeholder="Enter custom reason"
// //                       value={customReason}
// //                       onChange={(e) => setCustomReason(e.target.value)}
// //                       className="custom-reason-input"
// //                     />
// //                   )}

// //                   <button className="confirm-reject" onClick={() => handleAction(req._id, 'reject')}>
// //                     Confirm Reject
// //                   </button>
// //                   <button className="cancel-reject" onClick={() => {
// //                     setRejectingId(null);
// //                     setRejectReason('');
// //                     setCustomReason('');
// //                   }}>
// //                     Cancel
// //                   </button>
// //                 </>
// //               ) : (
// //                 <button className="reject" onClick={() => setRejectingId(req._id)}>Reject</button>
// //               )}
// //             </div>
// //           </div>
// //         ))
// //       )}
// //     </div>
// //   );
// // }