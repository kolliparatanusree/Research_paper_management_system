import React, { useEffect, useMemo, useState } from "react";
import "./DepartmentPublicationsSection.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";

import {
  Download,
  Search,
  CalendarDays,
  BookOpen,
  FileText,
  Award,
  Users,
  TrendingUp,
  AlertTriangle,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export default function PrincipalPublishedPapers({ approvedPids = [] }) {
  const [searchText, setSearchText] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedPub, setSelectedPub] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  /* =========================================================
     NORMALIZE APPROVED PID DATA
  ========================================================= */

  const publications = useMemo(() => {
    if (!Array.isArray(approvedPids)) return [];

    return approvedPids.map((paper) => ({
      ...paper,

      // Support both structures
      title:
        paper.paperTitle ||
        paper.title ||
        "Untitled Publication",

      userId:
        paper.userId ||
        paper.facultyId ||
        "Unknown Faculty",

      facultyName:
        paper.facultyName ||
        paper.fullName ||
        "",

      department:
        paper.department ||
        "Unknown Department",

      type:
        paper.type ||
        "Publication",

      pid:
        paper.pid ||
        "",

      uid:
        paper.uid ||
        "",

      year:
        paper.year ||
        (
          paper.uploadedAt
            ? new Date(paper.uploadedAt).getFullYear()
            : ""
        ),

      uploadedAt:
        paper.uploadedAt ||
        paper.createdAt ||
        "",

      journal:
        paper.journal ||
        paper.conference ||
        "",

      abstract:
        paper.abstract ||
        "",

      target:
        paper.target ||
        "",
    }));
  }, [approvedPids]);

  console.log("Approved PIDs:", publications);

  /* =========================================================
     AVAILABLE FILTER VALUES
  ========================================================= */

  const availableDepartments = useMemo(() => {
    return [
      ...new Set(
        publications
          .map((p) => String(p.department || "").trim())
          .filter(Boolean)
      ),
    ].sort();
  }, [publications]);

  const availableYears = useMemo(() => {
    return [
      ...new Set(
        publications
          .map((p) => String(p.year || "").trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [publications]);

  const availableFaculty = useMemo(() => {
    return [
      ...new Set(
        publications
          .map((p) => String(p.userId || "").trim())
          .filter(Boolean)
      ),
    ].sort();
  }, [publications]);

  const availableTypes = useMemo(() => {
    return [
      ...new Set(
        publications
          .map((p) => String(p.type || "").trim())
          .filter(Boolean)
      ),
    ].sort();
  }, [publications]);

  /* =========================================================
     FILTER PUBLICATIONS
  ========================================================= */

  const filteredPublications = useMemo(() => {
    const term = searchText.trim().toLowerCase();

    return publications.filter((p) => {
      const departmentMatch =
        selectedDept === "all" ||
        String(p.department).toLowerCase() ===
          String(selectedDept).toLowerCase();

      const yearMatch =
        selectedYear === "all" ||
        String(p.year) === String(selectedYear);

      const facultyMatch =
        selectedFaculty === "all" ||
        String(p.userId) === String(selectedFaculty);

      const typeMatch =
        selectedType === "all" ||
        String(p.type).toLowerCase() ===
          String(selectedType).toLowerCase();

      const searchMatch =
        !term ||
        String(p.title || "").toLowerCase().includes(term) ||
        String(p.userId || "").toLowerCase().includes(term) ||
        String(p.facultyName || "").toLowerCase().includes(term) ||
        String(p.department || "").toLowerCase().includes(term) ||
        String(p.uid || "").toLowerCase().includes(term) ||
        String(p.pid || "").toLowerCase().includes(term) ||
        String(p.journal || "").toLowerCase().includes(term);

      let dateMatch = true;

      if (startDate && p.uploadedAt) {
        dateMatch =
          new Date(p.uploadedAt) >=
          new Date(`${startDate}T00:00:00`);
      }

      if (dateMatch && endDate && p.uploadedAt) {
        dateMatch =
          new Date(p.uploadedAt) <=
          new Date(`${endDate}T23:59:59`);
      }

      return (
        departmentMatch &&
        yearMatch &&
        facultyMatch &&
        typeMatch &&
        searchMatch &&
        dateMatch
      );
    });
  }, [
    publications,
    searchText,
    selectedDept,
    selectedYear,
    selectedFaculty,
    selectedType,
    startDate,
    endDate,
  ]);

  /* =========================================================
     RESET PAGINATION
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchText,
    selectedDept,
    selectedYear,
    selectedFaculty,
    selectedType,
    startDate,
    endDate,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPublications.length / itemsPerPage)
  );

  const paginatedPublications = useMemo(() => {
    const start =
      (currentPage - 1) * itemsPerPage;

    return filteredPublications.slice(
      start,
      start + itemsPerPage
    );
  }, [filteredPublications, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const summary = useMemo(() => {
    const total = filteredPublications.length;

    const journals =
      filteredPublications.filter(
        (p) =>
          String(p.type).toLowerCase() === "journal"
      ).length;

    const conferences =
      filteredPublications.filter(
        (p) =>
          String(p.type).toLowerCase() === "conference"
      ).length;

    const books =
      filteredPublications.filter(
        (p) =>
          String(p.type).toLowerCase() === "book"
      ).length;

    const patents =
      filteredPublications.filter(
        (p) =>
          String(p.type).toLowerCase() === "patent"
      ).length;

    const facultyCount =
      new Set(
        filteredPublications
          .map((p) => p.userId)
          .filter(Boolean)
      ).size;

    const departmentCount =
      new Set(
        filteredPublications
          .map((p) => p.department)
          .filter(Boolean)
      ).size;

    return {
      total,
      journals,
      conferences,
      books,
      patents,
      facultyCount,
      departmentCount,
    };
  }, [filteredPublications]);

  /* =========================================================
     DEPARTMENT LEADERBOARD
  ========================================================= */

  const departmentLeaderboard = useMemo(() => {
    const map = {};

    filteredPublications.forEach((paper) => {
      const department =
        paper.department || "Unknown Department";

      map[department] =
        (map[department] || 0) + 1;
    });

    return Object.entries(map)
      .map(([department, publications]) => ({
        department,
        publications,
      }))
      .sort(
        (a, b) =>
          b.publications - a.publications
      );
  }, [filteredPublications]);

  /* =========================================================
     FACULTY STATISTICS
  ========================================================= */

  const facultyStats = useMemo(() => {
    const map = {};

    filteredPublications.forEach((paper) => {
      const faculty =
        paper.userId || "Unknown Faculty";

      map[faculty] =
        (map[faculty] || 0) + 1;
    });

    return Object.entries(map)
      .map(([faculty, count]) => ({
        faculty,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredPublications]);

  const topFaculty = facultyStats.slice(0, 5);

  /* =========================================================
     YEAR STATISTICS
  ========================================================= */

  const yearlyData = useMemo(() => {
    const map = {};

    filteredPublications.forEach((paper) => {
      const year = String(
        paper.year || "Unknown"
      );

      map[year] =
        (map[year] || 0) + 1;
    });

    return Object.entries(map)
      .filter(([year]) => year !== "Unknown")
      .map(([year, publications]) => ({
        year,
        publications,
      }))
      .sort(
        (a, b) =>
          Number(a.year) - Number(b.year)
      );
  }, [filteredPublications]);

  /* =========================================================
     RESEARCH TREND
  ========================================================= */

  const researchTrend = useMemo(() => {
    if (!yearlyData.length) {
      return {
        status: "No Data",
        message:
          "No publication data is currently available.",
      };
    }

    if (yearlyData.length === 1) {
      return {
        status: "Baseline",
        message: `${yearlyData[0].publications} publication(s) recorded for ${yearlyData[0].year}.`,
      };
    }

    const current =
      yearlyData[yearlyData.length - 1];

    const previous =
      yearlyData[yearlyData.length - 2];

    const difference =
      current.publications -
      previous.publications;

    if (difference > 0) {
      return {
        status: "Growing",
        message:
          "Publication output increased compared with the previous recorded year.",
      };
    }

    if (difference < 0) {
      return {
        status: "Declining",
        message:
          "Publication output decreased compared with the previous recorded year.",
      };
    }

    return {
      status: "Stable",
      message:
        "Publication output remained stable compared with the previous recorded year.",
    };
  }, [yearlyData]);

  /* =========================================================
     OUTPUT INSIGHT
  ========================================================= */

  const outputInsight = useMemo(() => {
    if (!filteredPublications.length) {
      return {
        title: "No Research Data",
        message:
          "No approved publications match the current filters.",
        level: "high",
      };
    }

    return {
      title: "Research Output",
      message: `${filteredPublications.length} approved publication(s) are currently displayed.`,
      level: "low",
    };
  }, [filteredPublications]);

  /* =========================================================
     TOP DEPARTMENT
  ========================================================= */

  const topDepartment =
    departmentLeaderboard[0];

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearchText("");
    setSelectedDept("all");
    setSelectedYear("all");
    setSelectedFaculty("all");
    setSelectedType("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  /* =========================================================
     CSV EXPORT
  ========================================================= */

  const downloadCSV = () => {
    if (!filteredPublications.length) return;

    const headers = [
      "Faculty ID",
      "Faculty Name",
      "Department",
      "Paper Title",
      "UID",
      "PID",
      "Type",
      "Target",
      "Year",
      "Uploaded Date",
    ];

    const rows =
      filteredPublications.map((paper) => [
        paper.userId || "",
        paper.facultyName || "",
        paper.department || "",
        paper.title || "",
        paper.uid || "",
        paper.pid || "",
        paper.type || "",
        paper.journal || "",
        paper.year || "",
        paper.uploadedAt
          ? new Date(
              paper.uploadedAt
            ).toLocaleDateString()
          : "",
      ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "principal-approved-publications.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     PDF EXPORT
  ========================================================= */

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Approved Published Papers",
      14,
      18
    );

    doc.setFontSize(10);

    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      14,
      26
    );

    doc.text(
      `Total Publications: ${filteredPublications.length}`,
      14,
      33
    );

    autoTable(doc, {
      startY: 40,

      head: [
        [
          "Title",
          "Faculty",
          "Department",
          "Type",
          "Year",
          "PID",
        ],
      ],

      body:
        filteredPublications.map(
          (paper) => [
            paper.title ||
              "Untitled",
            paper.userId ||
              "Unknown",
            paper.department ||
              "Unknown",
            paper.type ||
              "N/A",
            paper.year ||
              "N/A",
            paper.pid ||
              "Not Assigned",
          ]
        ),

      styles: {
        fontSize: 8,
      },

      headStyles: {
        fillColor: [37, 99, 235],
      },
    });

    doc.save(
      "principal-approved-publications.pdf"
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="department-publications-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="department-page-header">

        <div>
          <div className="page-title-row">

            <div className="page-title-icon">
              <BookOpen size={26} />
            </div>

            <div>
              <h2>
                Published Papers
              </h2>

              <p>
                Approved research publications
                across the institution
              </p>
            </div>

          </div>
        </div>

        <div className="header-actions">

          <button
            className="secondary-btn"
            onClick={downloadCSV}
          >
            <Download size={17} />
            CSV
          </button>

          <button
            className="primary-btn"
            onClick={downloadPDF}
          >
            <Download size={17} />
            PDF
          </button>

        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="publication-summary-grid">

        <div className="publication-summary-card blue">

          <div className="summary-icon">
            <BookOpen size={22} />
          </div>

          <div>
            <span>
              Total Publications
            </span>

            <strong>
              {summary.total}
            </strong>

            <small>
              Approved publications
            </small>
          </div>

        </div>

        <div className="publication-summary-card green">

          <div className="summary-icon">
            <FileText size={22} />
          </div>

          <div>
            <span>Journals</span>

            <strong>
              {summary.journals}
            </strong>

            <small>
              Journal publications
            </small>
          </div>

        </div>

        <div className="publication-summary-card orange">

          <div className="summary-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Conferences</span>

            <strong>
              {summary.conferences}
            </strong>

            <small>
              Conference papers
            </small>
          </div>

        </div>

        <div className="publication-summary-card purple">

          <div className="summary-icon">
            <Award size={22} />
          </div>

          <div>
            <span>
              Books / Patents
            </span>

            <strong>
              {summary.books +
                summary.patents}
            </strong>

            <small>
              {summary.books} books •{" "}
              {summary.patents} patents
            </small>
          </div>

        </div>

        <div className="publication-summary-card cyan">

          <div className="summary-icon">
            <Users size={22} />
          </div>

          <div>
            <span>
              Active Faculty
            </span>

            <strong>
              {summary.facultyCount}
            </strong>

            <small>
              Faculty with publications
            </small>
          </div>

        </div>

      </div>

      {/* =====================================================
          INSIGHT CARDS
      ===================================================== */}

      <div className="insight-grid">

        <div className="insight-card ai-card">

          <div className="insight-card-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>
              Research Trend
            </span>

            <h3>
              {researchTrend.status}
            </h3>

            <p>
              {researchTrend.message}
            </p>
          </div>

        </div>

        <div
          className={`insight-card risk-card ${outputInsight.level}`}
        >

          <div className="insight-card-icon">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>
              Research Output
            </span>

            <h3>
              {outputInsight.title}
            </h3>

            <p>
              {outputInsight.message}
            </p>
          </div>

        </div>

        <div className="insight-card top-faculty-card">

          <div className="insight-card-icon">
            <Award size={22} />
          </div>

          <div>
            <span>
              Top Faculty
            </span>

            <h3>
              {topFaculty[0]?.faculty ||
                "N/A"}
            </h3>

            <p>
              {topFaculty[0]
                ? `${topFaculty[0].count} publication(s)`
                : "No publication data"}
            </p>
          </div>

        </div>

      </div>

      {/* =====================================================
          FILTER PANEL
      ===================================================== */}

      <div className="publication-filter-panel">

        <div className="filter-title">
          <Search size={19} />

          <span>
            Search & Filter Publications
          </span>
        </div>

        <div className="filter-grid">

          {/* SEARCH */}

          <div className="filter-field search-field">

            <label>
              Search
            </label>

            <div className="search-input-wrapper">

              <Search size={17} />

              <input
                value={searchText}
                onChange={(e) =>
                  setSearchText(
                    e.target.value
                  )
                }
                placeholder="Search title, faculty, UID, PID..."
              />

            </div>

          </div>

          {/* DEPARTMENT */}

          <div className="filter-field">

            <label>
              Department
            </label>

            <select
              value={selectedDept}
              onChange={(e) =>
                setSelectedDept(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Departments
              </option>

              {availableDepartments.map(
                (department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                )
              )}

            </select>

          </div>

          {/* YEAR */}

          <div className="filter-field">

            <label>
              Year
            </label>

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Years
              </option>

              {availableYears.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}

            </select>

          </div>

          {/* FACULTY */}

          <div className="filter-field">

            <label>
              Faculty
            </label>

            <select
              value={selectedFaculty}
              onChange={(e) =>
                setSelectedFaculty(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Faculty
              </option>

              {availableFaculty.map(
                (faculty) => (
                  <option
                    key={faculty}
                    value={faculty}
                  >
                    {faculty}
                  </option>
                )
              )}

            </select>

          </div>

          {/* TYPE */}

          <div className="filter-field">

            <label>
              Type
            </label>

            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Types
              </option>

              {availableTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}

            </select>

          </div>

          {/* FROM */}

          <div className="filter-field">

            <label>
              From
            </label>

            <div className="date-input-wrapper">

              <CalendarDays size={16} />

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* TO */}

          <div className="filter-field">

            <label>
              To
            </label>

            <div className="date-input-wrapper">

              <CalendarDays size={16} />

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

        </div>

        <div className="filter-footer">

          <span>
            Showing{" "}
            <strong>
              {filteredPublications.length}
            </strong>{" "}
            publication(s)
          </span>

          <button
            className="clear-filter-btn"
            onClick={clearFilters}
          >
            <RotateCcw size={16} />
            Clear Filters
          </button>

        </div>

      </div>

      {/* =====================================================
          COLLEGE LEADERBOARD
      ===================================================== */}

      <div className="leaderboard-panel leaderboard-full-width">

        <div className="leaderboard-header">

          <div className="leaderboard-title-area">

            <div className="leaderboard-icon">
              <Award size={21} />
            </div>

            <div>
              <h3>
                College Publication Leaderboard
              </h3>

              <p>
                Approved publication output
                across departments
              </p>
            </div>

          </div>

          <div className="leaderboard-total">

            <span>
              Departments
            </span>

            <strong>
              {departmentLeaderboard.length}
            </strong>

          </div>

        </div>

        {departmentLeaderboard.length === 0 ? (

          <div className="small-empty">

            <Award size={32} />

            <span>
              No leaderboard data available.
            </span>

          </div>

        ) : (

          <div className="leaderboard-list">

            {departmentLeaderboard.map(
              (item, index) => {

                const maxCount =
                  Math.max(
                    ...departmentLeaderboard.map(
                      (d) =>
                        d.publications
                    ),
                    1
                  );

                const percentage =
                  Math.min(
                    100,
                    (item.publications /
                      maxCount) *
                      100
                  );

                return (
                  <motion.div
                    key={item.department}
                    className="leaderboard-row"
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay:
                        index * 0.04,
                    }}
                  >

                    <div className="leaderboard-rank">

                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : (
                          <span className="rank-text">
                            #{index + 1}
                          </span>
                        )}

                    </div>

                    <div className="leaderboard-department">

                      <div className="leaderboard-dept-top">

                        <strong>
                          {item.department}
                        </strong>

                      </div>

                      <div className="leaderboard-progress">

                        <span
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                    <div className="leaderboard-score-box">

                      <strong>
                        {item.publications}
                      </strong>

                      <span>
                        Publications
                      </span>

                    </div>

                  </motion.div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          PUBLICATIONS
      ===================================================== */}

      <div className="publication-content-grid">

        <div className="publication-list-panel">

          <div className="section-heading">

            <div>

              <div className="section-title-with-icon">

                <div className="section-heading-icon">
                  <BookOpen size={18} />
                </div>

                <h3>
                  Research Publications
                </h3>

              </div>

              <p>
                Approved published research
                papers across the institution
              </p>

            </div>

            <span className="result-count">
              {filteredPublications.length}
            </span>

          </div>

          {paginatedPublications.length === 0 ? (

            <div className="publication-empty">

              <BookOpen size={42} />

              <h3>
                No Publications Found
              </h3>

              <p>
                Try changing the selected
                filters or search term.
              </p>

            </div>

          ) : (

            <div className="publication-list">

              {paginatedPublications.map(
                (publication, index) => (

                  <motion.div
                    key={
                      publication._id ||
                      publication.pid ||
                      `${publication.userId}-${index}`
                    }
                    className="publication-card"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay:
                        index * 0.03,
                    }}
                  >

                    <div className="publication-card-main">

                      <div className="publication-number">

                        {(currentPage - 1) *
                          itemsPerPage +
                          index +
                          1}

                      </div>

                      <div className="publication-info">

                        <h4>
                          {publication.title}
                        </h4>

                        <div className="publication-meta">

                          <span>
                            <Users size={14} />

                            {publication.userId}
                          </span>

                          <span>
                            {publication.department}
                          </span>

                          <span>
                            <CalendarDays size={14} />

                            {publication.year ||
                              "N/A"}
                          </span>

                          <span className="type-badge">
                            {publication.type}
                          </span>

                          {publication.pid && (
                            <span className="pid-badge">
                              PID:{" "}
                              {publication.pid}
                            </span>
                          )}

                        </div>

                        {publication.journal && (
                          <p className="publication-journal">
                            {publication.journal}
                          </p>
                        )}

                      </div>

                      <button
                        className="view-publication-btn"
                        onClick={() =>
                          setSelectedPub(
                            publication
                          )
                        }
                      >
                        <Eye size={16} />
                        View
                      </button>

                    </div>

                  </motion.div>
                )
              )}

            </div>
          )}

          {/* PAGINATION */}

          {filteredPublications.length >
            0 && (

            <div className="pagination">

              <button
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >
                <ChevronLeft size={17} />
              </button>

              <span>
                Page{" "}
                <strong>
                  {currentPage}
                </strong>{" "}
                of{" "}
                <strong>
                  {totalPages}
                </strong>
              </span>

              <button
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >
                <ChevronRight size={17} />
              </button>

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          PUBLICATION DETAILS MODAL
      ===================================================== */}

      {selectedPub && (

        <div
          className="publication-popup-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedPub(null);
            }
          }}
        >

          <motion.div
            className="publication-popup"
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
          >

            <div className="popup-header">

              <div>

                <span>
                  Publication Details
                </span>

                <h2>
                  {selectedPub.title}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedPub(null)
                }
                className="popup-close-btn"
              >
                <X size={20} />
              </button>

            </div>

            <div className="popup-content">

              <div className="detail-grid">

                <div className="detail-item">
                  <span>
                    Faculty ID
                  </span>

                  <strong>
                    {selectedPub.userId ||
                      "Unknown"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Faculty Name
                  </span>

                  <strong>
                    {selectedPub.facultyName ||
                      "Not Available"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Department
                  </span>

                  <strong>
                    {selectedPub.department ||
                      "Not Available"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Publication Type
                  </span>

                  <strong>
                    {selectedPub.type ||
                      "Not Available"}
                  </strong>
                </div>
{/* 
                <div className="detail-item">
                  <span>
                    Journal / Conference
                  </span>

                  <strong>
                    {selectedPub.journal ||
                      "Not Available"}
                  </strong>
                </div> */}

                <div className="detail-item">
                  <span>
                    Year
                  </span>

                  <strong>
                    {selectedPub.year ||
                      "N/A"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    UID
                  </span>

                  <strong>
                    {selectedPub.uid ||
                      "Not Available"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    PID
                  </span>

                  <strong>
                    {selectedPub.pid ||
                      "Not Assigned"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Target
                  </span>

                  <strong>
                    {selectedPub.target ||
                      "Not Available"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Uploaded Date
                  </span>

                  <strong>
                    {selectedPub.uploadedAt
                      ? new Date(
                          selectedPub.uploadedAt
                        ).toLocaleDateString()
                      : "Not Available"}
                  </strong>
                </div>

              </div>

              {selectedPub.abstract && (

                <div className="abstract-section">

                  <h3>
                    Abstract
                  </h3>

                  <p>
                    {selectedPub.abstract}
                  </p>

                </div>

              )}

              {Array.isArray(
                selectedPub.coAuthors
              ) &&
                selectedPub.coAuthors.length >
                  0 && (

                  <div className="coauthors-section">

                    <h3>
                      Co-Authors
                    </h3>

                    <div className="coauthor-list">

                      {selectedPub.coAuthors.map(
                        (author, index) => (

                          <div
                            key={index}
                            className="coauthor-chip"
                          >
                            {typeof author ===
                            "string"
                              ? author
                              : author?.name ||
                                "Unknown"}
                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

            </div>

            <div className="popup-footer">

              <button
                className="secondary-btn"
                onClick={() =>
                  setSelectedPub(null)
                }
              >
                Close
              </button>

            </div>

          </motion.div>

        </div>

      )}

    </div>
  );
}
// import React, { useState } from "react";

// export default function PrincipalPublishedPapers({ approvedPids }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedDept, setSelectedDept] = useState("All");
//   const [selectedPaper, setSelectedPaper] = useState(null);

//   // Departments for filter
//   const departments = ["All", ...new Set(approvedPids.map(p => p.department))];


// console.log("Approved PIDs:", approvedPids);

//   const filteredPids = approvedPids
//   .filter(doc => {
//     if (selectedDept !== "All" && doc.department !== selectedDept) return false;

//     if (!searchTerm.trim()) return true;

//     const term = searchTerm.toLowerCase();

//     return (
//       (doc.paperTitle && doc.paperTitle.toLowerCase().includes(term)) ||
//       (doc.userId && doc.userId.toLowerCase().includes(term)) ||
//       (doc.uid && doc.uid.toLowerCase().includes(term)) ||
//       (doc.pid && doc.pid.toLowerCase().includes(term))
//     );
//   })
//   .sort((a, b) => (a.department || "").localeCompare(b.department || ""));

//   const viewDetails = (paper) => setSelectedPaper(paper);
//   const closeDetails = () => setSelectedPaper(null);

//   // Download CSV
//   const downloadCSV = () => {
//     if (filteredPids.length === 0) return;

//     const headers = [
//       "Faculty ID",
//       "Faculty Name",
//       "Department",
//       "Paper Title",
//       "UID",
//       "PID",
//       "Type",
//       "Target",
//       "Uploaded At"
//     ];

//     const rows = filteredPids.map(p => [
//       p.userId || "",
//       p.facultyName || "",
//       p.department || "",
//       p.paperTitle || "",
//       p.uid || "",
//       p.pid || "",
//       p.type || "",
//       p.target || "",
//       new Date(p.uploadedAt).toLocaleDateString()
//     ]);

//     const csvContent =
//       "data:text/csv;charset=utf-8," +
//       [headers, ...rows].map(e => e.join(",")).join("\n");

//     const encodedUri = encodeURI(csvContent);

//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", "published_papers.csv");
//     document.body.appendChild(link);

//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div>
//       <h2>Published Papers / Approved PIDs</h2>

//       {/* Filters */}
//       <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>

//         <input
//           type="text"
//           placeholder="Search by Faculty, Paper Title, UID or PID"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={{ flex: "1 1 250px", padding: "0.5rem" }}
//         />

//         <select
//           value={selectedDept}
//           onChange={(e) => setSelectedDept(e.target.value)}
//           style={{ padding: "0.5rem" }}
//         >
//           {departments.map((dept, i) => (
//             <option key={i} value={dept}>{dept}</option>
//           ))}
//         </select>

//         <button
//           onClick={downloadCSV}
//           style={{
//             background: "#10b981",
//             color: "white",
//             padding: "0.5rem 1rem",
//             borderRadius: 5,
//             cursor: "pointer"
//           }}
//         >
//           📥 Download Publication Details
//         </button>

//       </div>

//       {/* Cards */}
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>

//         {filteredPids.length === 0 && <p>No published papers found.</p>}

//         {filteredPids.map((doc) => (

//           <div
//             key={doc._id}
//             style={{
//               border: "1px solid #ccc",
//               padding: 10,
//               width: 250,
//               borderRadius: 8,
//               textAlign: "center",
//               boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
//             }}
//           >

//             <h4 style={{ fontSize: "15px", lineHeight: "1.4" }}>
//   {doc.paperTitle?.trim()}
// </h4>
// {/* <h4>{doc.paperTitle || "No Title Available"}</h4> */}
//             <p><strong>Faculty ID:</strong> {doc.facultyId}</p>

//             <p><strong>Department:</strong> {doc.department}</p>

//             <button
//               onClick={() => viewDetails(doc)}
//               style={{
//                 marginTop: 5,
//                 padding: "5px 10px",
//                 borderRadius: 5,
//                 cursor: "pointer"
//               }}
//             >
//               View Details
//             </button>

//           </div>

//         ))}

//       </div>

//       {/* Modal */}
//       {selectedPaper && (

//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.5)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 999
//           }}
//         >

//           <div
//             style={{
//               background: "white",
//               padding: 20,
//               borderRadius: 10,
//               maxWidth: 500,
//               width: "90%",
//               maxHeight: "90%",
//               overflowY: "auto",
//               position: "relative"
//             }}
//           >

//             <button
//               onClick={closeDetails}
//               style={{
//                 position: "absolute",
//                 top: 10,
//                 right: 10,
//                 fontSize: 18,
//                 cursor: "pointer",
//                 background: "transparent",
//                 border: "none"
//               }}
//             >
//               ✖
//             </button>

//             <h3>{selectedPaper.paperTitle?.trim()}</h3>

//             <p><strong>Faculty ID:</strong> {selectedPaper.facultyId}</p>

//             <p><strong>Faculty Name:</strong> {selectedPaper.facultyName}</p>

//             <p><strong>Department:</strong> {selectedPaper.department}</p>

//             <p><strong>UID:</strong> {selectedPaper.uid}</p>

//             <p><strong>PID:</strong> {selectedPaper.pid}</p>

//             <p><strong>Type:</strong> {selectedPaper.type}</p>

//             <p><strong>Target:</strong> {selectedPaper.target}</p>

//             {/* <p>
//               <strong>Uploaded:</strong>{" "}
//               {new Date(selectedPaper.uploadedAt).toLocaleDateString()}
//             </p> */}

//           </div>

//         </div>

//       )}

//     </div>
//   );
// }