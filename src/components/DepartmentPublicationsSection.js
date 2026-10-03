
import React, { useEffect, useMemo, useState } from "react";
import "./DepartmentPublicationsSection.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_BASE_URL } from '../config';
import { motion } from "framer-motion";
import {
  Download,
  Search,
  CalendarDays,
  BarChart3,
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

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function DepartmentPublicationsSection({ department }) {
  const [publications, setPublications] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const [deptComparison, setDeptComparison] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* =========================================================
     FETCH DEPARTMENT PUBLICATIONS
  ========================================================= */

  const fetchPublications = async () => {
    if (!department) return;

    try {
      setLoading(true);

      let url = `${API_BASE_URL}/api/faculty/department-publications/${encodeURIComponent(
        department
      )}?`;

      if (startDate) {
        url += `startDate=${encodeURIComponent(startDate)}&`;
      }

      if (endDate) {
        url += `endDate=${encodeURIComponent(endDate)}&`;
      }

      if (searchText.trim()) {
        url += `search=${encodeURIComponent(searchText.trim())}&`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch publications");
      }

      const data = await res.json();

      setPublications(
        Array.isArray(data?.publicationHistory)
          ? data.publicationHistory
          : []
      );
    } catch (error) {
      console.error("Publication fetch error:", error);
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!department) return;

    const timer = setTimeout(() => {
      fetchPublications();
    }, 400);

    return () => clearTimeout(timer);
  }, [department, searchText, startDate, endDate]);

  /* =========================================================
     DEPARTMENT COMPARISON
  ========================================================= */

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/faculty/department-comparison`);

        if (!res.ok) {
          throw new Error("Failed to fetch comparison");
        }

        const data = await res.json();

        setDeptComparison(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Comparison fetch error:", error);
        setDeptComparison([]);
      }
    };

    fetchComparison();
  }, []);

  /* =========================================================
     DEPARTMENT TRENDS
  ========================================================= */

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/faculty/department-trends`);

        if (!res.ok) {
          throw new Error("Failed to fetch trends");
        }

        const data = await res.json();

        setTrendData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Trend fetch error:", error);
        setTrendData([]);
      }
    };

    fetchTrend();
  }, []);

  /* =========================================================
     COLLEGE LEADERBOARD
  ========================================================= */

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/faculty/college-leaderboard`);

        if (!res.ok) {
          throw new Error("Failed to fetch leaderboard");
        }

        const data = await res.json();

        setLeaderboard(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Leaderboard fetch error:", error);
        setLeaderboard([]);
      }
    };

    fetchLeaderboard();
  }, []);

  /* =========================================================
     RESET PAGINATION WHEN FILTERS CHANGE
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedFaculty, selectedType, searchText, startDate, endDate]);

  /* =========================================================
     AVAILABLE YEARS
  ========================================================= */

  const availableYears = useMemo(() => {
    const years = publications
      .map((p) => String(p.year || "").trim())
      .filter(Boolean);

    return [...new Set(years)].sort((a, b) => Number(b) - Number(a));
  }, [publications]);

  /* =========================================================
     FACULTY LIST
  ========================================================= */

  const availableFaculty = useMemo(() => {
    const faculty = publications
      .map((p) => String(p.userId || "").trim())
      .filter(Boolean);

    return [...new Set(faculty)].sort();
  }, [publications]);

  /* =========================================================
     PUBLICATION TYPES
  ========================================================= */

  const availableTypes = useMemo(() => {
    const types = publications
      .map((p) => String(p.type || "").trim())
      .filter(Boolean);

    return [...new Set(types)].sort();
  }, [publications]);

  /* =========================================================
     FILTERED PUBLICATIONS
  ========================================================= */

  const filteredPublications = useMemo(() => {
    return publications.filter((p) => {
      const yearMatch =
        selectedYear === "all" ||
        String(p.year || "") === String(selectedYear);

      const facultyMatch =
        selectedFaculty === "all" ||
        String(p.userId || "") === String(selectedFaculty);

      const typeMatch =
        selectedType === "all" ||
        String(p.type || "") === String(selectedType);

      return yearMatch && facultyMatch && typeMatch;
    });
  }, [publications, selectedYear, selectedFaculty, selectedType]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPublications.length / itemsPerPage)
  );

  const paginatedPublications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return filteredPublications.slice(start, start + itemsPerPage);
  }, [filteredPublications, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =========================================================
     FACULTY STATS
  ========================================================= */

  const facultyStats = useMemo(() => {
    const map = {};

    filteredPublications.forEach((publication) => {
      const id = String(publication.userId || "Unknown");

      map[id] = (map[id] || 0) + 1;
    });

    return Object.entries(map)
      .map(([faculty, count]) => ({
        faculty,
        count: Number(count),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredPublications]);

  const rankings = useMemo(() => {
    return facultyStats.map((faculty, index) => ({
      ...faculty,
      rank: index + 1,
    }));
  }, [facultyStats]);

  const topFaculty = facultyStats.slice(0, 5);

  /* =========================================================
     PUBLICATION TYPE DATA
  ========================================================= */

  const typeData = useMemo(() => {
    const map = {};

    filteredPublications.forEach((publication) => {
      const type = publication.type || "Other";

      map[type] = (map[type] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredPublications]);

  const chartColors = [
    "#2563eb",
    "#f97316",
    "#16a34a",
    "#9333ea",
    "#0891b2",
    "#dc2626",
  ];

  /* =========================================================
     YEARLY DATA
  ========================================================= */

  const yearlyData = useMemo(() => {
    const map = {};

    filteredPublications.forEach((publication) => {
      const year = String(publication.year || "Unknown");

      map[year] = (map[year] || 0) + 1;
    });

    return Object.entries(map)
      .filter(([year]) => year !== "Unknown")
      .map(([year, publicationsCount]) => ({
        year,
        publications: publicationsCount,
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [filteredPublications]);

  /* =========================================================
     DEPARTMENT COMPARISON DATA
  ========================================================= */

  const comparisonData = useMemo(() => {
    if (!Array.isArray(deptComparison)) return [];

    return deptComparison.map((item) => ({
      department: item.department || "Unknown",
      publications: Number(item.count || item.publications || 0),
    }));
  }, [deptComparison]);

  /* =========================================================
     SORTED LEADERBOARD
  ========================================================= */

  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort(
      (a, b) =>
        Number(b.publications || b.count || 0) -
        Number(a.publications || a.count || 0)
    );
  }, [leaderboard]);

  /* =========================================================
     SUMMARY COUNTS
  ========================================================= */

  const summary = useMemo(() => {
    const total = filteredPublications.length;

    const journals = filteredPublications.filter(
      (p) => String(p.type || "").toLowerCase() === "journal"
    ).length;

    const conferences = filteredPublications.filter(
      (p) => String(p.type || "").toLowerCase() === "conference"
    ).length;

    const books = filteredPublications.filter(
      (p) => String(p.type || "").toLowerCase() === "book"
    ).length;

    const patents = filteredPublications.filter(
      (p) => String(p.type || "").toLowerCase() === "patent"
    ).length;

    const facultyCount = new Set(
      filteredPublications
        .map((p) => p.userId)
        .filter(Boolean)
    ).size;

    return {
      total,
      journals,
      conferences,
      books,
      patents,
      facultyCount,
    };
  }, [filteredPublications]);

  /* =========================================================
     YEAR GROWTH / AI INSIGHT
  ========================================================= */

  const aiInsight = useMemo(() => {
    if (!yearlyData.length) {
      return {
        status: "No Data",
        message: "No publication data is available for analysis.",
        percentage: 0,
      };
    }

    if (yearlyData.length === 1) {
      return {
        status: "Baseline",
        message: `The department has ${yearlyData[0].publications} publication(s) recorded for ${yearlyData[0].year}.`,
        percentage: 0,
      };
    }

    const current = yearlyData[yearlyData.length - 1];
    const previous = yearlyData[yearlyData.length - 2];

    const difference = current.publications - previous.publications;

    const percentage =
      previous.publications === 0
        ? 100
        : (difference / previous.publications) * 100;

    if (difference > 0) {
      return {
        status: "Growing",
        message: `Publication output increased by ${Math.abs(
          percentage
        ).toFixed(1)}% compared with ${previous.year}.`,
        percentage,
      };
    }

    if (difference < 0) {
      return {
        status: "Declining",
        message: `Publication output decreased by ${Math.abs(
          percentage
        ).toFixed(1)}% compared with ${previous.year}.`,
        percentage,
      };
    }

    return {
      status: "Stable",
      message: `Publication output remained stable compared with ${previous.year}.`,
      percentage: 0,
    };
  }, [yearlyData]);

  /* =========================================================
     RISK ANALYSIS
  ========================================================= */

  const riskAlert = useMemo(() => {
    if (!facultyStats.length) {
      return {
        level: "high",
        title: "No Research Data",
        message: "No faculty publication data is currently available.",
      };
    }

    const total = facultyStats.reduce(
      (sum, faculty) => sum + faculty.count,
      0
    );

    const average = total / facultyStats.length;

    const lowOutputFaculty = facultyStats.filter(
      (faculty) => faculty.count < average * 0.5
    );

    if (lowOutputFaculty.length >= facultyStats.length / 2) {
      return {
        level: "high",
        title: "Needs Attention",
        message: `${lowOutputFaculty.length} of ${facultyStats.length} faculty members are significantly below the department average.`,
      };
    }

    if (lowOutputFaculty.length > 0) {
      return {
        level: "medium",
        title: "Monitor",
        message: `${lowOutputFaculty.length} faculty member(s) are below the expected publication output.`,
      };
    }

    return {
      level: "low",
      title: "Healthy Output",
      message: "Faculty publication output is distributed above the low-output threshold.",
    };
  }, [facultyStats]);

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchText("");
    setSelectedYear("all");
    setSelectedFaculty("all");
    setSelectedType("all");
    setCurrentPage(1);
  };

  /* =========================================================
     PDF EXPORT
  ========================================================= */

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`${department || "Department"} Publications`, 14, 18);

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
      head: [["Title", "Faculty", "Type", "Year", "PID"]],
      body: filteredPublications.map((p) => [
        p.title || "N/A",
        p.userId || "Unknown",
        p.type || "N/A",
        p.year || "N/A",
        p.pid || "Not Assigned",
      ]),
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [37, 99, 235],
      },
    });

    doc.save(
      `${department || "department"}-publications.pdf`
    );
  };

  /* =========================================================
     CSV EXPORT
  ========================================================= */

  const downloadCSV = () => {
    const headers = [
      "Title",
      "Faculty ID",
      "Type",
      "Journal",
      "Year",
      "PID",
    ];

    const rows = filteredPublications.map((p) => [
      p.title || "",
      p.userId || "",
      p.type || "",
      p.journal || "",
      p.year || "",
      p.pid || "",
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${department || "department"}-publications.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     DYNAMIC TREND DEPARTMENTS
  ========================================================= */

  const trendDepartments = useMemo(() => {
    const keys = new Set();

    trendData.forEach((item) => {
      Object.keys(item || {}).forEach((key) => {
        if (
          key !== "month" &&
          key !== "year" &&
          key !== "_id"
        ) {
          keys.add(key);
        }
      });
    });

    return [...keys];
  }, [trendData]);

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
              <h2>Department Publications</h2>

              <p>
                {department || "Department"} research output and
                publication analytics
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

          {/* <button
            className="analytics-btn"
            onClick={() => setShowAnalytics(true)}
          >
            <BarChart3 size={18} />
            Analytics
          </button> */}
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
            <span>Total Publications</span>
            <strong>{summary.total}</strong>
            <small>Current filtered result</small>
          </div>
        </div>

        <div className="publication-summary-card green">
          <div className="summary-icon">
            <FileText size={22} />
          </div>

          <div>
            <span>Journals</span>
            <strong>{summary.journals}</strong>
            <small>Journal publications</small>
          </div>
        </div>

        <div className="publication-summary-card orange">
          <div className="summary-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Conferences</span>
            <strong>{summary.conferences}</strong>
            <small>Conference papers</small>
          </div>
        </div>

        <div className="publication-summary-card purple">
          <div className="summary-icon">
            <Award size={22} />
          </div>

          <div>
            <span>Books / Patents</span>
            <strong>
              {summary.books + summary.patents}
            </strong>
            <small>
              {summary.books} books • {summary.patents} patents
            </small>
          </div>
        </div>

        <div className="publication-summary-card cyan">
          <div className="summary-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Active Faculty</span>
            <strong>{summary.facultyCount}</strong>
            <small>Faculty with publications</small>
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
            <span>Research Trend</span>
            <h3>{aiInsight.status}</h3>
            <p>{aiInsight.message}</p>
          </div>
        </div>

        <div
          className={`insight-card risk-card ${riskAlert.level}`}
        >
          <div className="insight-card-icon">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Research Output</span>
            <h3>{riskAlert.title}</h3>
            <p>{riskAlert.message}</p>
          </div>
        </div>

        <div className="insight-card top-faculty-card">
          <div className="insight-card-icon">
            <Award size={22} />
          </div>

          <div>
            <span>Top Faculty</span>
            <h3>
              {topFaculty[0]?.faculty || "N/A"}
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
          FILTERS
      ===================================================== */}

      <div className="publication-filter-panel">

        <div className="filter-title">
          <Search size={19} />
          <span>Search & Filter Publications</span>
        </div>

        <div className="filter-grid">

          <div className="filter-field search-field">
            <label>Search</label>

            <div className="search-input-wrapper">
              <Search size={17} />

              <input
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
                placeholder="Search title, faculty, journal..."
              />
            </div>
          </div>

          <div className="filter-field">
            <label>Year</label>

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value)
              }
            >
              <option value="all">All Years</option>

              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Faculty</label>

            <select
              value={selectedFaculty}
              onChange={(e) =>
                setSelectedFaculty(e.target.value)
              }
            >
              <option value="all">All Faculty</option>

              {availableFaculty.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Type</label>

            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value)
              }
            >
              <option value="all">All Types</option>

              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>From</label>

            <div className="date-input-wrapper">
              <CalendarDays size={16} />

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
              />
            </div>
          </div>

          <div className="filter-field">
            <label>To</label>

            <div className="date-input-wrapper">
              <CalendarDays size={16} />

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
              />
            </div>
          </div>

        </div>

        <div className="filter-footer">

          <span>
            Showing{" "}
            <strong>{filteredPublications.length}</strong>{" "}
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
          MAIN CONTENT
      ===================================================== */}

      {/* <div className="publication-content-grid">

       

        <div className="publication-list-panel">

          <div className="section-heading">
            <div>
              <h3>Research Publications</h3>
              <p>
                Published research papers from{" "}
                {department || "the department"}
              </p>
            </div>

            <span className="result-count">
              {filteredPublications.length}
            </span>
          </div>

          {loading ? (
            <div className="publication-empty">
              <div className="loading-spinner"></div>
              <p>Loading publications...</p>
            </div>
          ) : paginatedPublications.length === 0 ? (
            <div className="publication-empty">
              <BookOpen size={42} />
              <h3>No Publications Found</h3>
              <p>
                Try changing the selected filters or search term.
              </p>
            </div>
          ) : (
            <div className="publication-list">

              {paginatedPublications.map((publication, index) => (

                <motion.div
                  key={
                    publication._id ||
                    publication.pid ||
                    `${publication.userId}-${index}`
                  }
                  className="publication-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.03,
                  }}
                >

                  <div className="publication-card-main">

                    <div className="publication-number">
                      {(currentPage - 1) * itemsPerPage +
                        index +
                        1}
                    </div>

                    <div className="publication-info">

                      <h4>
                        {publication.title ||
                          "Untitled Publication"}
                      </h4>

                      <div className="publication-meta">

                        <span>
                          <Users size={14} />
                          {publication.userId ||
                            "Unknown Faculty"}
                        </span>

                        <span>
                          <CalendarDays size={14} />
                          {publication.year || "N/A"}
                        </span>

                        <span className="type-badge">
                          {publication.type ||
                            "Publication"}
                        </span>

                        {publication.pid && (
                          <span className="pid-badge">
                            PID: {publication.pid}
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
                        setSelectedPub(publication)
                      }
                    >
                      <Eye size={16} />
                      View
                    </button>

                  </div>

                </motion.div>

              ))}

            </div>
          )}


          {filteredPublications.length > 0 && (
            <div className="pagination">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
              >
                <ChevronLeft size={17} />
              </button>

              <span>
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
              >
                <ChevronRight size={17} />
              </button>

            </div>
          )}

        </div>


        <div className="leaderboard-panel">

          <div className="section-heading">
            <div>
              <h3>College Leaderboard</h3>
              <p>Publication output by department</p>
            </div>
          </div>

          {sortedLeaderboard.length === 0 ? (
            <div className="small-empty">
              No leaderboard data available.
            </div>
          ) : (
            <div className="leaderboard-list">

              {sortedLeaderboard.map((item, index) => {

                const count = Number(
                  item.publications || item.count || 0
                );

                const isCurrentDepartment =
                  String(item.department || "").toLowerCase() ===
                  String(department || "").toLowerCase();

                return (
                  <div
                    key={
                      item.department || `dept-${index}`
                    }
                    className={`leaderboard-row ${
                      isCurrentDepartment
                        ? "current-department"
                        : ""
                    }`}
                  >

                    <div className="leaderboard-rank">
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}
                    </div>

                    <div className="leaderboard-department">
                      <strong>
                        {item.department ||
                          "Unknown Department"}
                      </strong>

                      {isCurrentDepartment && (
                        <small>Current Department</small>
                      )}
                    </div>

                    <strong className="leaderboard-score">
                      {count}
                    </strong>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div> */}
      
{/* =====================================================
    COLLEGE LEADERBOARD — BELOW SEARCH/FILTERS
===================================================== */}

<div className="leaderboard-panel leaderboard-full-width">

  <div className="leaderboard-header">

    <div className="leaderboard-title-area">
      <div className="leaderboard-icon">
        <Award size={21} />
      </div>

      <div>
        <h3>College Leaderboard</h3>
        <p>Publication output across departments</p>
      </div>
    </div>

    <div className="leaderboard-total">
      <span>Departments</span>
      <strong>{sortedLeaderboard.length}</strong>
    </div>

  </div>

  {sortedLeaderboard.length === 0 ? (

    <div className="small-empty">
      <Award size={32} />
      <span>No leaderboard data available.</span>
    </div>

  ) : (

    <div className="leaderboard-list">

      {sortedLeaderboard.map((item, index) => {

        const count = Number(
          item.publications || item.count || 0
        );

        const isCurrentDepartment =
          String(item.department || "").toLowerCase() ===
          String(department || "").toLowerCase();

        const maxCount = Math.max(
          ...sortedLeaderboard.map((d) =>
            Number(d.publications || d.count || 0)
          ),
          1
        );

        const percentage = Math.min(
          100,
          (count / maxCount) * 100
        );

        return (
          <motion.div
            key={item.department || `dept-${index}`}
            className={`leaderboard-row ${
              isCurrentDepartment
                ? "current-department"
                : ""
            }`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.2,
              delay: index * 0.04,
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
                  {item.department ||
                    "Unknown Department"}
                </strong>

                {isCurrentDepartment && (
                  <span className="current-dept-badge">
                    Current Department
                  </span>
                )}

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
              <strong>{count}</strong>
              <span>Publications</span>
            </div>

          </motion.div>
        );
      })}

    </div>
  )}

</div>


{/* =====================================================
    PUBLICATIONS CONTENT
===================================================== */}

<div className="publication-content-grid">

  {/* =====================================================
      PUBLICATION LIST
  ===================================================== */}

  <div className="publication-list-panel">

    <div className="section-heading">

      <div>
        <div className="section-title-with-icon">
          <div className="section-heading-icon">
            <BookOpen size={18} />
          </div>

          <h3>Research Publications</h3>
        </div>

        <p>
          Published research papers from{" "}
          {department || "the department"}
        </p>
      </div>

      <span className="result-count">
        {filteredPublications.length}
      </span>

    </div>

    {loading ? (

      <div className="publication-empty">
        <div className="loading-spinner"></div>
        <p>Loading publications...</p>
      </div>

    ) : paginatedPublications.length === 0 ? (

      <div className="publication-empty">
        <BookOpen size={42} />
        <h3>No Publications Found</h3>
        <p>
          Try changing the selected filters or search term.
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
                delay: index * 0.03,
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
                    {publication.title ||
                      "Untitled Publication"}
                  </h4>

                  <div className="publication-meta">

                    <span>
                      <Users size={14} />
                      {publication.userId ||
                        "Unknown Faculty"}
                    </span>

                    <span>
                      <CalendarDays size={14} />
                      {publication.year ||
                        "N/A"}
                    </span>

                    <span className="type-badge">
                      {publication.type ||
                        "Publication"}
                    </span>

                    {publication.pid && (
                      <span className="pid-badge">
                        PID: {publication.pid}
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
                    setSelectedPub(publication)
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

    {filteredPublications.length > 0 && (
      <div className="pagination">

        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((page) =>
              Math.max(1, page - 1)
            )
          }
        >
          <ChevronLeft size={17} />
        </button>

        <span>
          Page <strong>{currentPage}</strong>{" "}
          of <strong>{totalPages}</strong>
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((page) =>
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
          ANALYTICS MODAL
      ===================================================== */}

      {showAnalytics && (
        <div
          className="analytics-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowAnalytics(false);
            }
          }}
        >

          <motion.div
            className="analytics-modal"
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{ duration: 0.25 }}
          >

            <div className="analytics-header">

              <div>
                <span>Department Research</span>
                <h2>Analytics Dashboard</h2>
              </div>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setShowAnalytics(false)
                }
              >
                <X size={21} />
              </button>

            </div>

            <div className="analytics-scroll">

              {/* ANALYTICS SUMMARY */}

              <div className="analytics-mini-grid">

                <div>
                  <span>Total</span>
                  <strong>{summary.total}</strong>
                </div>

                <div>
                  <span>Faculty</span>
                  <strong>
                    {summary.facultyCount}
                  </strong>
                </div>

                <div>
                  <span>Top Faculty</span>
                  <strong>
                    {topFaculty[0]?.faculty || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Trend</span>
                  <strong>{aiInsight.status}</strong>
                </div>

              </div>

              {/* FACULTY RANKING */}

              <div className="analytics-box">

                <div className="analytics-box-header">
                  <div>
                    <h3>🏅 Faculty Ranking</h3>
                    <p>
                      Faculty publication productivity
                    </p>
                  </div>
                </div>

                {rankings.length === 0 ? (
                  <div className="chart-empty">
                    No faculty data available.
                  </div>
                ) : (
                  <div className="ranking-table-wrapper">

                    <table className="ranking-table">

                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Faculty ID</th>
                          <th>Publications</th>
                        </tr>
                      </thead>

                      <tbody>
                        {rankings.map((faculty) => (
                          <tr key={faculty.faculty}>

                            <td>
                              <span className="rank-number">
                                #{faculty.rank}
                              </span>
                            </td>

                            <td>
                              {faculty.faculty}
                            </td>

                            <td>
                              <strong>
                                {faculty.count}
                              </strong>
                            </td>

                          </tr>
                        ))}
                      </tbody>

                    </table>

                  </div>
                )}

              </div>

              {/* CHART GRID */}

              <div className="analytics-chart-grid">

                {/* PUBLICATION TYPES */}

                <div className="analytics-box chart-box">

                  <h3>📊 Publication Types</h3>

                  {typeData.length === 0 ? (
                    <div className="chart-empty">
                      No type data available.
                    </div>
                  ) : (
                    <div className="pie-chart-container">

                      <ResponsiveContainer
                        width="100%"
                        height={280}
                      >
                        <PieChart>

                          <Pie
                            data={typeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={3}
                          >
                            {typeData.map(
                              (_, index) => (
                                <Cell
                                  key={index}
                                  fill={
                                    chartColors[
                                      index %
                                        chartColors.length
                                    ]
                                  }
                                />
                              )
                            )}
                          </Pie>

                          <Tooltip />

                          <Legend />

                        </PieChart>
                      </ResponsiveContainer>

                    </div>
                  )}

                </div>

                {/* YEARLY TREND */}

                <div className="analytics-box chart-box">

                  <h3>📈 Publication Trend</h3>

                  {yearlyData.length === 0 ? (
                    <div className="chart-empty">
                      No yearly data available.
                    </div>
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height={280}
                    >
                      <LineChart data={yearlyData}>

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis dataKey="year" />

                        <YAxis allowDecimals={false} />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="publications"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                          }}
                        />

                      </LineChart>
                    </ResponsiveContainer>
                  )}

                </div>

              </div>

              {/* FACULTY PRODUCTIVITY */}

              <div className="analytics-box chart-box">

                <h3>👥 Faculty Productivity</h3>

                {facultyStats.length === 0 ? (
                  <div className="chart-empty">
                    No faculty data available.
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height={320}
                  >
                    <BarChart
                      data={facultyStats}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 40,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="faculty"
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                      />

                      <YAxis allowDecimals={false} />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                      />

                    </BarChart>
                  </ResponsiveContainer>
                )}

              </div>

              {/* DEPARTMENT COMPARISON */}

              <div className="analytics-box chart-box">

                <h3>🏫 Department Comparison</h3>

                {comparisonData.length === 0 ? (
                  <div className="chart-empty">
                    No department comparison data available.
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height={320}
                  >
                    <BarChart
                      data={comparisonData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 30,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis dataKey="department" />

                      <YAxis allowDecimals={false} />

                      <Tooltip />

                      <Bar
                        dataKey="publications"
                        fill="#f97316"
                        radius={[6, 6, 0, 0]}
                      />

                    </BarChart>
                  </ResponsiveContainer>
                )}

              </div>

              {/* DEPARTMENT TRENDS */}

              <div className="analytics-box chart-box">

                <h3>📅 Department Trends</h3>

                {trendData.length === 0 ? (
                  <div className="chart-empty">
                    No department trend data available.
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height={340}
                  >
                    <BarChart
                      data={trendData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 20,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey={
                          trendData[0]?.month
                            ? "month"
                            : "year"
                        }
                      />

                      <YAxis allowDecimals={false} />

                      <Tooltip />

                      <Legend />

                      {trendDepartments.map(
                        (deptName, index) => (
                          <Bar
                            key={deptName}
                            dataKey={deptName}
                            fill={
                              chartColors[
                                index %
                                  chartColors.length
                              ]
                            }
                            radius={[4, 4, 0, 0]}
                          />
                        )
                      )}

                    </BarChart>
                  </ResponsiveContainer>
                )}

              </div>

              {/* TOP FACULTY */}

              <div className="analytics-box">

                <div className="analytics-box-header">
                  <div>
                    <h3>🏆 Top Faculty</h3>
                    <p>
                      Faculty with the highest publication
                      output
                    </p>
                  </div>
                </div>

                <div className="top-faculty-list">

                  {topFaculty.length === 0 ? (
                    <div className="chart-empty">
                      No faculty data available.
                    </div>
                  ) : (
                    topFaculty.map(
                      (faculty, index) => (
                        <div
                          key={faculty.faculty}
                          className="top-faculty-row"
                        >

                          <div className="top-faculty-rank">
                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : `#${index + 1}`}
                          </div>

                          <div className="top-faculty-name">
                            <strong>
                              {faculty.faculty}
                            </strong>

                            <div className="faculty-progress">
                              <span
                                style={{
                                  width: `${
                                    topFaculty[0]
                                      ? (faculty.count /
                                          topFaculty[0]
                                            .count) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              ></span>
                            </div>
                          </div>

                          <strong>
                            {faculty.count}
                          </strong>

                        </div>
                      )
                    )
                  )}

                </div>

              </div>

            </div>

          </motion.div>

        </div>
      )}

      {/* =====================================================
          PUBLICATION DETAILS MODAL
      ===================================================== */}

      {selectedPub && (
        <div
          className="publication-popup-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
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
                <span>Publication Details</span>

                <h2>
                  {selectedPub.title ||
                    "Untitled Publication"}
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
                  <span>Faculty ID</span>
                  <strong>
                    {selectedPub.userId ||
                      "Unknown"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Publication Type</span>
                  <strong>
                    {selectedPub.type ||
                      "Not Available"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Journal / Conference</span>
                  <strong>
                    {selectedPub.journal ||
                      "Not Available"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Year</span>
                  <strong>
                    {selectedPub.year || "N/A"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>PID</span>
                  <strong>
                    {selectedPub.pid ||
                      "Not Assigned"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Uploaded Date</span>
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

                  <h3>Abstract</h3>

                  <p>
                    {selectedPub.abstract}
                  </p>

                </div>
              )}

              {Array.isArray(
                selectedPub.coAuthors
              ) &&
                selectedPub.coAuthors.length > 0 && (
                  <div className="coauthors-section">

                    <h3>Co-Authors</h3>

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
                              : author.name ||
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



// import React, { useEffect, useState, useMemo } from "react";
// import "./DepartmentPublicationsSection.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { motion } from "framer-motion";
// import { Download } from "lucide-react";

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
// } from "recharts";

// export default function DepartmentPublicationsSection({ department }) {
//   const [publications, setPublications] = useState([]);
//   const [selectedPub, setSelectedPub] = useState(null);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [deptComparison, setDeptComparison] = useState([]);
//   const [showAnalytics, setShowAnalytics] = useState(false);
//   const [selectedYear, setSelectedYear] = useState("all");
//   const [selectedFaculty, setSelectedFaculty] = useState("all");
//   const [trendData, setTrendData] = useState([]);
//   const [leaderboard, setLeaderboard] = useState([]);

//   useEffect(() => {
//   const fetchComparison = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/faculty/department-comparison");
//       const data = await res.json();
//       setDeptComparison(data || []);
//     } catch (err) {
//       console.error("Comparison fetch error", err);
//       setDeptComparison([]);
//     }
//   };

//   fetchComparison();
// }, []);

// useEffect(() => {
//   const fetchTrend = async () => {
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/api/faculty/department-trends"
//       );
//       const data = await res.json();
//       setTrendData(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error(err);
//       setTrendData([]);
//     }
//   };

//   fetchTrend();
// }, []);

//   // FETCH
//   const fetchPublications = async () => {
//     try {
//       let url = `${API_BASE_URL}/api/faculty/department-publications/${department}?`;

//       if (startDate) url += `startDate=${startDate}&`;
//       if (endDate) url += `endDate=${endDate}&`;
//       if (searchText) url += `search=${encodeURIComponent(searchText)}&`;

//       const res = await fetch(url);
//       const data = await res.json();
//       setPublications(data.publicationHistory || []);
//     } catch {
//       setPublications([]);
//     }
//   };

// useEffect(() => {
//   if (!department) return;

//   const delayDebounce = setTimeout(() => {
//     fetchPublications();
//   }, 400);

//   return () => clearTimeout(delayDebounce);
// }, [searchText, startDate, endDate, department]);


//   useEffect(() => {
//   const fetchLeaderboard = async () => {
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/api/faculty/college-leaderboard"
//       );
//       const data = await res.json();
//       setLeaderboard(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setLeaderboard([]);
//     }
//   };

//   fetchLeaderboard();
// }, []);

//   // FILTERED DATA
//   const filteredPublications = publications.filter((p) => {
//     const yearMatch = selectedYear === "all" || p.year === selectedYear;
//     const facultyMatch =
//       selectedFaculty === "all" || p.userId === selectedFaculty;
//     return yearMatch && facultyMatch;
//   });

//   // FACULTY STATS
//   const facultyStats = useMemo(() => {
//   const map = {};

//   publications.forEach((p) => {
//     const id = String(p.userId || "Unknown"); // clean ID

//     map[id] = (map[id] || 0) + 1; // ONLY number addition
//   });

//   return Object.entries(map)
//     .map(([faculty, count]) => ({
//       faculty,
//       count: Number(count),
//     }))
//     .sort((a, b) => b.count - a.count);
// }, [publications]);

//   // TOP 5
//   const topFaculty = facultyStats.slice(0, 5);

//   // RANKINGS
//   const rankings = facultyStats.map((f, i) => ({
//     ...f,
//     rank: i + 1,
//   }));

//   // RISK ALERT
//   const riskAlert = useMemo(() => {
//     if (!facultyStats.length) {
//       return {
//         level: "high",
//         message: "No publication data found. Immediate attention required.",
//       };
//     }

//     const avg =
//       facultyStats.reduce((a, b) => a + b.count, 0) / facultyStats.length;

//     const low = facultyStats.filter((f) => f.count < avg * 0.5);

//     if (low.length >= facultyStats.length / 2) {
//       return {
//         level: "high",
//         message: "Majority faculty have low research output.",
//       };
//     }

//     if (low.length > 0) {
//       return {
//         level: "medium",
//         message: `${low.length} faculty below expected output.`,
//       };
//     }

//     return {
//       level: "low",
//       message: "Research output is healthy.",
//     };
//   }, [facultyStats]);

//   // AI INSIGHT
//   const aiInsight = useMemo(() => {
//     if (!publications.length)
//       return { status: "No Data", message: "No insights available" };

//     const years = {};
//     publications.forEach((p) => {
//       years[p.year] = (years[p.year] || 0) + 1;
//     });

//     const vals = Object.values(years);
//     const diff = vals[vals.length - 1] - vals[vals.length - 2];

//     if (diff > 2)
//       return { status: "Improving 🚀", message: "Publication trend rising." };

//     if (diff < -2)
//       return { status: "Declining ⚠️", message: "Drop in research output." };

//     return { status: "Stable", message: "Consistent performance." };
//   }, [publications]);

//   // CHART DATA
//   const facultyData = facultyStats.map((f) => ({
//     faculty: f.faculty,
//     count: f.count,
//   }));

//   const typeData = useMemo(() => {
//     const t = { Journal: 0, Conference: 0, Book: 0, Patent: 0 };

//     filteredPublications.forEach((p) => {
//       const type = p.type || "Journal";
//       if (t[type] !== undefined) t[type]++;
//     });

//     return Object.keys(t).map((k) => ({ name: k, value: t[k] }));
//   }, [filteredPublications]);

//   const COLORS = ["#1f6feb", "#ff7f50", "#28a745", "#a855f7"];

//   // PDF
//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.text(`Department Publications`, 14, 20);

//     autoTable(doc, {
//       head: [["Title", "Faculty", "Type", "Year"]],
//       body: publications.map((p) => [
//         p.title,
//         p.userId,
//         p.type,
//         p.year,
//       ]),
//     });

//     doc.save("dept.pdf");
//   };

//   const comparisonData = Array.isArray(deptComparison)
//   ? deptComparison.map((d) => ({
//       department: d.department,
//       publications: d.count,
//     }))
//   : [];

//   return (
//     <div className="publications-container">

//      <div className="leaderboard-box">
//   <h3>🏫 College Leaderboard</h3>

//   <div className="leaderboard-list">
//     {leaderboard
//       .sort((a, b) => b.publications - a.publications)
//       .map((d, i) => (
//         <div key={i} className="leaderboard-row">
//           <div className="rank">
//   {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
// </div>

//           <div className="dept-name">
//             {d.department}
//           </div>

//           <div className="score">
//             {d.publications}
//           </div>
//         </div>
//       ))}
//   </div>
// </div>

//       {/* SUMMARY DASHBOARD (OUTSIDE ANALYTICS) */}
// <div className="summary-container">

//   <div className="summary-card ai">
//     <h4>🤖 AI Insight</h4>
//     <p>{aiInsight.status}</p>
//     <small>{aiInsight.message}</small>
//   </div>

//   <div className={`summary-card risk ${riskAlert.level}`}>
//     <h4>⚠️ Risk Analysis</h4>
//     <p>{riskAlert.message}</p>
//   </div>

//   <div className="summary-card">
//     <h4>📊 Total Publications</h4>
//     <h2>{filteredPublications.length}</h2>
//   </div>

//   <div className="summary-card">
//     <h4>🏆 Top Faculty</h4>
//     <h3>{topFaculty[0]?.faculty || "N/A"}</h3>
//   </div>

// </div>

//       <h2>📚 Department Publications</h2>

//       {/* FILTERS */}
//       <div className="filter-container">
//         <label>From:</label>
//         <input type="date" onChange={(e) => setStartDate(e.target.value)} />
//         <label>To:</label>
//         <input type="date" onChange={(e) => setEndDate(e.target.value)} />
//         <input
//           placeholder="Search..."
//           onChange={(e) => setSearchText(e.target.value)}
//         />

//         <button onClick={downloadPDF}> <Download size={18} />PDF</button>
//         <button onClick={() => setShowAnalytics(true)}>
//           📊 Analytics
//         </button>
//       </div>

//       {/* LIST */}
//       {publications.map((p, i) => (
//         <div key={i} className="publication-item">
//           <span>{p.title}</span>
//           <button onClick={() => setSelectedPub(p)}>View</button>
//         </div>
//       ))}

//       {/* ================= ANALYTICS ================= */}
//       {showAnalytics && (
//         <div className="analytics-overlay">
//           <motion.div
//             className="analytics-modal"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3 }}
//           >

//             <div className="analytics-header">
//               <h3>📊 Dashboard</h3>
//               <button onClick={() => setShowAnalytics(false)}>✖</button>
//             </div>

//             <div className="analytics-scroll">

//               {/* AI INSIGHT */}
//               {/* <div className={`ai-insight`}>
//                 <h3>🤖 AI Insight</h3>
//                 <h2>{aiInsight.status}</h2>
//                 <p>{aiInsight.message}</p>
//               </div> */}

//               {/* RISK */}
//               {/* <div className={`risk-card ${riskAlert.level}`}>
//                 <h3>⚠️ Risk Analysis</h3>
//                 <p>{riskAlert.message}</p>
//               </div> */}

//               {/* LIVE CARDS */}
//               {/* <div className="live-cards">
//                 <div className="live-card">
//                   <h4>Total</h4>
//                   <h2>{filteredPublications.length}</h2>
//                 </div>

//                 <div className="live-card">
//                   <h4>Top Faculty</h4>
//                   <h2>{topFaculty[0]?.faculty || "N/A"}</h2>
//                 </div>
//               </div> */}

//               {/* DEPARTMENT COMPARISON */}
//                  {/* RANKING */}
//               <div className="ranking-box">
//   <h3>🏅 Faculty Ranking</h3>

//   <table className="ranking-table">
//     <thead>
//       <tr>
//         <th>Rank</th>
//         <th>Faculty ID</th>
//         <th>Publications</th>
//       </tr>
//     </thead>

//     <tbody>
//       {rankings.map((f) => (
//         <tr key={f.faculty}>
//           <td>#{f.rank}</td>
//           <td>{f.faculty}</td>
//           <td>{f.count}</td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>
// <div className="comparison-box">
//   <h3>🏫 Department Comparison</h3>

//   <ResponsiveContainer width="100%" height={250}>
//     <BarChart data={comparisonData}>
//       <XAxis dataKey="department" />
//       <YAxis />
//       <Tooltip />
//       <Bar dataKey="publications" fill="#ff7f50" />
//     </BarChart>
//   </ResponsiveContainer>
// </div>
          
//               {/* BAR */}
//               <h3>📈 Faculty Productivity Chart</h3>
//               <ResponsiveContainer width="100%" height={250}>
//                 <BarChart data={facultyData}>
//                   <XAxis dataKey="faculty" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="count" fill="#1f6feb" />
//                 </BarChart>
//               </ResponsiveContainer>

//               {/* PIE */}
//               {/* <ResponsiveContainer width="100%" height={250}>
//                 <PieChart>
//                   <Pie data={typeData} dataKey="value" outerRadius={80}>
//                     {typeData.map((_, i) => (
//                       <Cell key={i} fill={COLORS[i]} />
//                     ))}
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer> */}
//               <div className="chart-box">
//   <h3>📈 Department Trends</h3>

//   <ResponsiveContainer width="100%" height={250}>
//     <BarChart data={trendData}>
//       <XAxis dataKey="month" />
//       <YAxis />
//       <Tooltip />
//       <Bar dataKey="CSE" fill="#1f6feb" />
//       <Bar dataKey="ECE" fill="#ff7f50" />
//     </BarChart>
//   </ResponsiveContainer>
// </div>
          

//             </div>
//           </motion.div>
//         </div>
//       )}

//       {selectedPub && (
//   <div className="popup-overlay">
//     <div className="popup-card">
//       <button className="close-btn" onClick={() => setSelectedPub(null)}>✖</button>

//       <h3>{selectedPub.title || "No Title"}</h3>

//       <p><strong>Faculty ID:</strong> {selectedPub.userId || "Unknown"}</p>
//       <p><strong>Journal / Conference:</strong> {selectedPub.journal || "Not Available"}</p>
//       <p><strong>Year:</strong> {selectedPub.year || "N/A"}</p>
//       <p><strong>PID:</strong> {selectedPub.pid || "Not Assigned"}</p>

//       {selectedPub.abstract && (
//         <p><strong>Abstract:</strong> {selectedPub.abstract}</p>
//       )}

//       {selectedPub.uploadedAt && (
//         <p>
//           <strong>Uploaded Date:</strong>{" "}
//           {new Date(selectedPub.uploadedAt).toLocaleDateString()}
//         </p>
//       )}
//     </div>
//   </div>
// )}

//     </div>
//   );
// }