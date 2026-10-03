import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./HodFacultySection.css";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { API_BASE_URL } from '../config';
import {
  Search,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  UserRound,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  CalendarDays,
  UsersRound,
  FileText,
  Download,
  SlidersHorizontal,
  ChevronDown,
  X,
  BarChart3,
  Eye,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function HodFacultySection({ hodProfile }) {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortType, setSortType] = useState("name-asc");

  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const [visibleCount, setVisibleCount] = useState(8);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);

  const loadMoreRef = useRef(null);

  const dept = hodProfile?.department;
const CHART_COLORS = [
  "#2563eb", // Blue
  "#e97262", // Red
  
  "#7c3aed", // Violet
  "#059669", // Emerald
  "#db2777", // Pink
  "#0891b2", // Cyan
  "#d97706", // Amber
];

  /* =========================================================
     PUBLICATION RULE
     
     A publication is counted ONLY when a PID is assigned.
     
     Example:
     pid: "PID20260314_0001"  -> COUNT
     pid: "PID20260314_0002"  -> COUNT
     pid: null                -> DON'T COUNT
     pid: ""                  -> DON'T COUNT
     pid: "Not Assigned"      -> DON'T COUNT
  ========================================================= */

  const hasAssignedPid = (publication) => {
    const pid = publication?.pid;

    return (
      pid !== null &&
      pid !== undefined &&
      String(pid).trim() !== "" &&
      String(pid).trim().toLowerCase() !== "not assigned"
    );
  };

  /* =========================================================
     FETCH FACULTY + PUBLICATIONS
  ========================================================= */

const fetchFaculty = async () => {
  if (!dept) return;

  try {
    setLoading(true);
    setError("");

    const [facultyRes, publicationRes] = await Promise.all([
      axios.get(
        `${API_BASE_URL}/api/hod/faculty?dept=${encodeURIComponent(dept)}`
      ),

      axios.get(
        `${API_BASE_URL}/api/faculty/department-publications/${encodeURIComponent(
          dept
        )}`
      ),
    ]);

    const facultyData = Array.isArray(facultyRes.data)
      ? facultyRes.data
      : [];

    const publicationHistory = Array.isArray(
      publicationRes.data?.publicationHistory
    )
      ? publicationRes.data.publicationHistory
      : [];

    /*
     * ONLY PID-ASSIGNED PUBLICATIONS
     */
    const pidPublications =
      publicationHistory.filter(hasAssignedPid);

    /*
     * Publication count map
     */
    const publicationCountMap = {};

    pidPublications.forEach((publication) => {
      const userId = publication?.userId;

      if (!userId) return;

      publicationCountMap[userId] =
        (publicationCountMap[userId] || 0) + 1;
    });

    /*
     * =========================================================
     * FETCH CO-AUTHORS FOR EVERY FACULTY
     * =========================================================
     */

    const facultyWithCollaborators = await Promise.all(
      facultyData.map(async (faculty) => {
        const userId = faculty?.userId;

        let collaboratorCount = 0;

        if (userId) {
          try {
            const coAuthorRes = await axios.get(
              `${API_BASE_URL}/api/faculty/coauthors/${encodeURIComponent(
                userId
              )}`
            );

            const coAuthors = Array.isArray(
              coAuthorRes.data
            )
              ? coAuthorRes.data
              : [];

            collaboratorCount = coAuthors.length;
          } catch (coAuthorError) {
            console.error(
              `Failed to fetch collaborators for ${userId}:`,
              coAuthorError
            );

            collaboratorCount = 0;
          }
        }

        return {
          ...faculty,

          /*
           * PID-based publication count
           */
          publicationCount: userId
            ? publicationCountMap[userId] || 0
            : 0,

          /*
           * Co-author count
           */
          collaboratorCount,
        };
      })
    );

    setFacultyList(facultyWithCollaborators);
  } catch (err) {
    console.error(
      "Faculty/publication fetch error:",
      err
    );

    setError(
      "Failed to load faculty and publication data."
    );
  } finally {
    setLoading(false);
  }
};

  // const fetchFaculty = async () => {
    // if (!dept) return;

  //   try {
  //     setLoading(true);
  //     setError("");

  //     /*
  //      * Fetch both:
  //      *
  //      * 1. Faculty list
  //      * 2. Department publication history
  //      *
  //      * Publication counts will be calculated from #2 using PID.
  //      */

  //     const [facultyRes, publicationRes] = await Promise.all([
  //       axios.get(
  //         `${API_BASE_URL}/api/hod/faculty?dept=${encodeURIComponent(dept)}`
  //       ),

  //       axios.get(
  //         `${API_BASE_URL}/api/faculty/department-publications/${encodeURIComponent(
  //           dept
  //         )}`
  //       ),
  //     ]);

  //     const facultyData = Array.isArray(facultyRes.data)
  //       ? facultyRes.data
  //       : [];

  //     const publicationHistory = Array.isArray(
  //       publicationRes.data?.publicationHistory
  //     )
  //       ? publicationRes.data.publicationHistory
  //       : [];

  //     /*
  //      * ONLY PID-ASSIGNED PUBLICATIONS
  //      */
  //     const pidPublications = publicationHistory.filter(
  //       hasAssignedPid
  //     );

  //     /*
  //      * Count publications for every faculty member.
  //      *
  //      * Example:
  //      *
  //      * faculty2 -> 2
  //      * faculty7 -> 0
  //      */

  //     const publicationCountMap = {};

  //     pidPublications.forEach((publication) => {
  //       const userId = publication?.userId;

  //       if (!userId) return;

  //       publicationCountMap[userId] =
  //         (publicationCountMap[userId] || 0) + 1;
  //     });

  //     /*
  //      * Merge the calculated publication count into
  //      * the faculty list.
  //      */

  //     const enrichedFaculty = facultyData.map((faculty) => {
  //       const userId = faculty?.userId;

  //       return {
  //         ...faculty,

  //         /*
  //          * This becomes the ONLY publication count used
  //          * by this component.
  //          */
  //         publicationCount: userId
  //           ? publicationCountMap[userId] || 0
  //           : 0,
  //       };
  //     });

  //     setFacultyList(enrichedFaculty);
  //   } catch (err) {
  //     console.error("Faculty/publication fetch error:", err);
  //     setError("Failed to load faculty and publication data.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchFaculty();
  }, [dept]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getPublicationCount = (faculty) => {
    return Number(faculty?.publicationCount || 0);
  };

  const getCollaboratorCount = (faculty) => {
    return Number(
      faculty?.collaboratorCount ??
        faculty?.coAuthorCount ??
        faculty?.coAuthorsCount ??
        0
    );
  };

  const getResearchStatus = (count) => {
    if (count >= 20) return "Highly Active";
    if (count >= 10) return "Active Researcher";
    if (count >= 5) return "Emerging Research";
    return "Research Profile";
  };

  const getStatusClass = (count) => {
    if (count >= 20) return "status-high";
    if (count >= 10) return "status-active";
    if (count >= 5) return "status-emerging";
    return "status-basic";
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/);

    if (!words.length || !words[0]) return "F";

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return `${words[0][0]}${
      words[words.length - 1][0]
    }`.toUpperCase();
  };

  // const getProfileImage = (faculty) => {
  //   if (!faculty?.profilePic) {
  //     return "/default-profile.png";
  //   }

  //   if (
  //     faculty.profilePic.startsWith("http://") ||
  //     faculty.profilePic.startsWith("https://") ||
  //     faculty.profilePic.startsWith("/")
  //   ) {
  //     return faculty.profilePic;
  //   }

  //   return `/${faculty.profilePic}`;
  // };

  const getProfileImage = (faculty) => {
  if (!faculty?.profilePic) {
    return "/default-profile.png";
  }

  if (
    faculty.profilePic.startsWith("http://") ||
    faculty.profilePic.startsWith("https://")
  ) {
    return faculty.profilePic;
  }

  return `${API_BASE_URL}/${faculty.profilePic.replace(/^\/+/, "")}`;
};
  const getPublicationYear = (publication) => {
    /*
     * Some publication records already have a year field.
     * Prefer that.
     */

    if (publication?.year) {
      return String(publication.year);
    }

    const date =
      publication?.submittedAt ||
      publication?.uploadedAt ||
      publication?.createdAt ||
      publication?.publicationDate;

    if (!date) return "Unknown";

    const year = new Date(date).getFullYear();

    return Number.isNaN(year) ? "Unknown" : String(year);
  };

  const getPublicationType = (publication) => {
    return (
      publication?.type ||
      publication?.publicationType ||
      publication?.target ||
      "Other"
    );
  };

  /* =========================================================
     FILTER + SEARCH + SORT
  ========================================================= */

  const filteredFaculty = useMemo(() => {
    let result = [...facultyList];

    const q = searchText.trim().toLowerCase();

    if (q) {
      result = result.filter((faculty) => {
        return (
          faculty?.fullName
            ?.toLowerCase()
            .includes(q) ||
          faculty?.userId
            ?.toLowerCase()
            .includes(q) ||
          faculty?.email
            ?.toLowerCase()
            .includes(q) ||
          faculty?.department
            ?.toLowerCase()
            .includes(q)
        );
      });
    }

    if (filterType !== "all") {
      result = result.filter((faculty) => {
        const count = getPublicationCount(faculty);

        if (filterType === "high") return count >= 20;
        if (filterType === "active") return count >= 10;
        if (filterType === "emerging") return count >= 5;
        if (filterType === "profile") return count < 5;

        return true;
      });
    }

    result.sort((a, b) => {
      const nameA = a?.fullName || "";
      const nameB = b?.fullName || "";

      const pubA = getPublicationCount(a);
      const pubB = getPublicationCount(b);

      const colA = getCollaboratorCount(a);
      const colB = getCollaboratorCount(b);

      switch (sortType) {
        case "name-desc":
          return nameB.localeCompare(nameA);

        case "publications-high":
          return pubB - pubA;

        case "publications-low":
          return pubA - pubB;

        case "collaborators":
          return colB - colA;

        default:
          return nameA.localeCompare(nameB);
      }
    });

    return result;
  }, [
    facultyList,
    searchText,
    filterType,
    sortType,
  ]);

  useEffect(() => {
    setVisibleCount(8);
  }, [searchText, filterType, sortType]);

  const visibleFaculty = filteredFaculty.slice(
    0,
    visibleCount
  );

  /* =========================================================
     INFINITE SCROLL
  ========================================================= */

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleCount < filteredFaculty.length
        ) {
          setVisibleCount((prev) => prev + 6);
        }
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [
    visibleCount,
    filteredFaculty.length,
  ]);

  /* =========================================================
     DEPARTMENT ANALYTICS
     
     IMPORTANT:
     totalPublications = ONLY PID ASSIGNED
  ========================================================= */

  const analytics = useMemo(() => {
    const totalFaculty = facultyList.length;

    const totalPublications = facultyList.reduce(
      (sum, faculty) =>
        sum + getPublicationCount(faculty),
      0
    );

    const activeResearchers = facultyList.filter(
      (faculty) =>
        getPublicationCount(faculty) >= 1
    ).length;

    const emergingResearchers = facultyList.filter(
      (faculty) =>
        getPublicationCount(faculty) >= 5
    ).length;

    const totalCollaborators = facultyList.reduce(
      (sum, faculty) =>
        sum + getCollaboratorCount(faculty),
      0
    );

    const averagePublications =
      totalFaculty > 0
        ? (
            totalPublications /
            totalFaculty
          ).toFixed(1)
        : "0.0";

    return {
      totalFaculty,
      totalPublications,
      activeResearchers,
      emergingResearchers,
      totalCollaborators,
      averagePublications,
    };
  }, [facultyList]);

  /* =========================================================
     VIEW DETAILS
  ========================================================= */

  const viewDetails = async (facultyUserId) => {
    try {
      setDetailsLoading(true);
      setError("");
      setActiveTab("overview");

      const [
        facultyRes,
        pubRes,
        coRes,
      ] = await Promise.all([
        axios.get(
          `${API_BASE_URL}/api/hod/faculty-details/${facultyUserId}`
        ),

        axios.get(
          `${API_BASE_URL}/api/faculty/publications/${facultyUserId}`
        ),

        axios.get(
          `${API_BASE_URL}/api/faculty/coauthors/${facultyUserId}`
        ),
      ]);

      /*
       * IMPORTANT:
       * Keep only PID-assigned publications.
       *
       * This prevents UID-only records such as trail21
       * from appearing in the publication statistics.
       */

      const allPublications = Array.isArray(
        pubRes.data
      )
        ? pubRes.data
        : [];

      const pidPublications =
        allPublications.filter(hasAssignedPid);

      setSelectedFaculty({
        ...facultyRes.data,

        /*
         * Only actual PID publications.
         */
        publications: pidPublications,

        coAuthors: Array.isArray(coRes.data)
          ? coRes.data
          : [],
      });
    } catch (err) {
      console.error(
        "Faculty details error:",
        err
      );

      setError(
        "Failed to fetch faculty details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedFaculty(null);
    setActiveTab("overview");
  };

  /* =========================================================
     PUBLICATION ANALYTICS
  ========================================================= */

  const selectedPublicationStats = useMemo(() => {
    if (!selectedFaculty) return [];

    const map = {};

    selectedFaculty.publications?.forEach(
      (publication) => {
        const year =
          getPublicationYear(publication);

        if (year !== "Unknown") {
          map[year] =
            (map[year] || 0) + 1;
        }
      }
    );

    return Object.entries(map)
      .sort(
        (a, b) =>
          Number(a[0]) - Number(b[0])
      )
      .map(([year, count]) => ({
        year,
        publications: count,
      }));
  }, [selectedFaculty]);

  const selectedTypeStats = useMemo(() => {
    if (!selectedFaculty) return [];

    const map = {};

    selectedFaculty.publications?.forEach(
      (publication) => {
        const type =
          getPublicationType(publication);

        map[type] =
          (map[type] || 0) + 1;
      }
    );

    return Object.entries(map).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [selectedFaculty]);

  /* =========================================================
     EXPORT PDF
  ========================================================= */

  const exportFacultyReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Department Faculty Research Report",
      14,
      18
    );

    doc.setFontSize(11);

    doc.text(
      `Department: ${dept || "Department"}`,
      14,
      27
    );

    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      14,
      34
    );

    autoTable(doc, {
      startY: 42,

      head: [
        [
          "Faculty Name",
          "User ID",
          "Email",
          "Publications",
          "Collaborators",
          "Research Status",
        ],
      ],

      body: facultyList.map((faculty) => {
        const count =
          getPublicationCount(faculty);

        return [
          faculty?.fullName || "-",
          faculty?.userId || "-",
          faculty?.email || "-",
          count,
          getCollaboratorCount(faculty),
          getResearchStatus(count),
        ];
      }),

      styles: {
        fontSize: 8,
      },

      headStyles: {
        fontSize: 8,
      },
    });

    doc.save(
      `${
        dept || "Department"
      }_Faculty_Research_Report.pdf`
    );
  };

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    setSearchText("");
    setFilterType("all");
    setSortType("name-asc");
  };

  /* =========================================================
     NO DEPARTMENT
  ========================================================= */

  if (!dept) {
    return (
      <div className="hod-faculty-loading-page">
        <RefreshCw
          className="spin-icon"
          size={24}
        />

        <p>
          Loading HOD information...
        </p>
      </div>
    );
  }

  return (
    <div className="hod-faculty-section">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="faculty-page-header">

        <div>

          <div className="header-label">
            <UsersRound size={17} />
            Department Research
          </div>

          <h2>
            Faculty Directory
          </h2>

          <p>
            Explore faculty members,
            publications, collaborations and
            research activity in the{" "}
            {dept} department.
          </p>

        </div>

        <button
          className="faculty-export-btn"
          onClick={exportFacultyReport}
          disabled={!facultyList.length}
        >
          <Download size={17} />
          Export Report
        </button>

      </div>

      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <div className="faculty-analytics-grid">

        <motion.div
          className="faculty-stat-card stat-blue"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total Faculty</span>

            <strong>
              {analytics.totalFaculty}
            </strong>
          </div>
        </motion.div>

        <motion.div
          className="faculty-stat-card stat-purple"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.05,
          }}
        >
          <div className="stat-icon">
            <BookOpen size={22} />
          </div>

          <div>
            <span>
              Total Publications
            </span>

            <strong>
              {analytics.totalPublications}
            </strong>
          </div>
        </motion.div>

        <motion.div
          className="faculty-stat-card stat-green"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
        >
          <div className="stat-icon">
            <Award size={22} />
          </div>

          <div>
            <span>
              Active Researchers
            </span>

            <strong>
              {analytics.activeResearchers}
            </strong>
          </div>
        </motion.div>

        <motion.div
          className="faculty-stat-card stat-orange"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
        >
          <div className="stat-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>
              Avg. Publications
            </span>

            <strong>
              {analytics.averagePublications}
            </strong>
          </div>
        </motion.div>

      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="faculty-toolbar">

        <div className="faculty-search-wrapper">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search by name, ID or email..."
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
          />

          {searchText && (
            <button
              className="clear-search-btn"
              onClick={() =>
                setSearchText("")
              }
            >
              <X size={16} />
            </button>
          )}

        </div>

        <button
          className={`filter-toggle ${
            showFilters
              ? "active"
              : ""
          }`}
          onClick={() =>
            setShowFilters(
              (prev) => !prev
            )
          }
        >
          <SlidersHorizontal size={17} />

          Filters

          <ChevronDown
            size={16}
            className={
              showFilters
                ? "rotate-chevron"
                : ""
            }
          />
        </button>

        <button
          className="refresh-faculty-btn"
          onClick={fetchFaculty}
          disabled={loading}
          title="Refresh faculty"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "spin-icon"
                : ""
            }
          />
        </button>

      </div>

      {/* =====================================================
          FILTER PANEL
      ===================================================== */}

      <AnimatePresence>

        {showFilters && (
          <motion.div
            className="faculty-filter-panel"
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

            <div className="filter-group">

              <label>
                Research Activity
              </label>

              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  All Faculty
                </option>

                <option value="high">
                  20+ Publications
                </option>

                <option value="active">
                  10+ Publications
                </option>

                <option value="emerging">
                  5+ Publications
                </option>

                <option value="profile">
                  Under 5 Publications
                </option>
              </select>

            </div>

            <div className="filter-group">

              <label>
                Sort By
              </label>

              <select
                value={sortType}
                onChange={(e) =>
                  setSortType(
                    e.target.value
                  )
                }
              >

                <option value="name-asc">
                  Name A–Z
                </option>

                <option value="name-desc">
                  Name Z–A
                </option>

                <option value="publications-high">
                  Most Publications
                </option>

                <option value="publications-low">
                  Least Publications
                </option>

                <option value="collaborators">
                  Most Collaborators
                </option>

              </select>

            </div>

            <button
              className="reset-filter-btn"
              onClick={resetFilters}
            >
              Reset Filters
            </button>

          </motion.div>
        )}

      </AnimatePresence>

      {/* =====================================================
          RESULTS INFO
      ===================================================== */}

      <div className="faculty-results-row">

        <span>
          Showing{" "}
          <strong>
            {Math.min(
              visibleCount,
              filteredFaculty.length
            )}
          </strong>{" "}
          of{" "}
          <strong>
            {filteredFaculty.length}
          </strong>{" "}
          faculty
        </span>

        {searchText && (
          <span className="search-result-label">
            Results for "{searchText}"
          </span>
        )}

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="faculty-error">
          {error}
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="faculty-loading">

          <RefreshCw
            className="spin-icon"
            size={24}
          />

          <span>
            Loading faculty...
          </span>

        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        filteredFaculty.length === 0 && (
          <div className="faculty-empty">

            <div className="empty-icon">
              <Users size={28} />
            </div>

            <h3>
              No faculty found
            </h3>

            <p>
              Try changing your search
              or filter settings.
            </p>

            <button
              onClick={resetFilters}
            >
              Clear Filters
            </button>

          </div>
        )}

      {/* =====================================================
          FACULTY GRID
      ===================================================== */}

      <div className="faculty-container">

        {visibleFaculty.map(
          (faculty, index) => {

            const publicationCount =
              getPublicationCount(
                faculty
              );

            const collaboratorCount =
              getCollaboratorCount(
                faculty
              );

            const status =
              getResearchStatus(
                publicationCount
              );

            return (
              <motion.div
                key={
                  faculty.userId ||
                  index
                }
                className="faculty-card"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                  delay:
                    (index % 6) *
                    0.05,
                }}
                whileHover={{
                  y: -6,
                }}
              >

                <div className="faculty-card-top">

                  <div className="faculty-avatar-wrapper">

                    {faculty.profilePic ? (
                      <img
                        src={getProfileImage(
                          faculty
                        )}
                        alt={
                          faculty.fullName ||
                          "Faculty"
                        }
                        className="faculty-avatar"
                      />
                    ) : (
                      <div className="faculty-avatar initials-avatar">
                        {getInitials(
                          faculty.fullName
                        )}
                      </div>
                    )}

                    <span className="online-dot" />

                  </div>

                  <span
                    className={`research-status ${getStatusClass(
                      publicationCount
                    )}`}
                  >
                    {status}
                  </span>

                </div>

                <div className="faculty-card-content">

                  <h3>
                    {faculty.fullName ||
                      "Faculty Member"}
                  </h3>

                  <p className="faculty-id">
                    {faculty.userId ||
                      "ID unavailable"}
                  </p>

                  <p className="faculty-email">

                    <Mail size={14} />

                    {faculty.email ||
                      "Email unavailable"}

                  </p>

                  <div className="faculty-mini-stats">

                    <div>

                      <BookOpen size={16} />

                      <strong>
                        {publicationCount}
                      </strong>

                      <span>
                        Publications
                      </span>

                    </div>

                    <div>

                      <UsersRound
                        size={16}
                      />

                      <strong>
                        {collaboratorCount}
                      </strong>

                      <span>
                        Collaborators
                      </span>

                    </div>

                  </div>

                  <button
                    className="view-profile-btn"
                    onClick={() =>
                      viewDetails(
                        faculty.userId
                      )
                    }
                  >
                    <Eye size={16} />
                    View Profile
                  </button>

                </div>

              </motion.div>
            );
          }
        )}

      </div>

      {/* =====================================================
          LOAD MORE
      ===================================================== */}

      {visibleCount <
        filteredFaculty.length && (
        <div
          ref={loadMoreRef}
          className="faculty-load-more"
        >
          <RefreshCw
            size={18}
            className="spin-icon"
          />

          Loading more faculty...
        </div>
      )}

      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}

      <AnimatePresence>

        {selectedFaculty && (
          <motion.div
            className="faculty-modal-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={closeModal}
          >

            <motion.div
              className="faculty-modal"
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                className="close-btn"
                onClick={closeModal}
              >
                <IoClose size={24} />
              </button>

              {detailsLoading ? (
                <div className="modal-loading">

                  <RefreshCw
                    size={28}
                    className="spin-icon"
                  />

                  <p>
                    Loading faculty
                    profile...
                  </p>

                </div>
              ) : (
                <>

                  {/* =================================================
                      MODAL HEADER
                  ================================================= */}

                  <div className="modal-profile-header">

                    <div className="modal-profile-image-wrapper">

                      {selectedFaculty.profilePic ? (
                        <img
                          src={getProfileImage(
                            selectedFaculty
                          )}
                          alt={
                            selectedFaculty.fullName
                          }
                        />
                      ) : (
                        <div className="modal-initials">
                          {getInitials(
                            selectedFaculty.fullName
                          )}
                        </div>
                      )}

                    </div>

                    <div className="modal-profile-main">

                      <span className="modal-department">
                        {selectedFaculty.department ||
                          dept}
                      </span>

                      <h2>
                        {selectedFaculty.fullName ||
                          "Faculty Member"}
                      </h2>

                      <p>
                        {selectedFaculty.userId}
                      </p>

                      <div className="modal-contact-row">

                        {selectedFaculty.email && (
                          <span>
                            <Mail size={14} />
                            {
                              selectedFaculty.email
                            }
                          </span>
                        )}

                        {selectedFaculty.phoneNumber && (
                          <span>
                            <Phone size={14} />
                            {
                              selectedFaculty.phoneNumber
                            }
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      MODAL STATS
                  ================================================= */}

                  <div className="modal-stat-grid">

                    <div>

                      <BookOpen size={20} />

                      <strong>
                        {
                          selectedFaculty
                            .publications
                            ?.length || 0
                        }
                      </strong>

                      <span>
                        Publications
                      </span>

                    </div>

                    <div>

                      <UsersRound size={20} />

                      <strong>
                        {
                          selectedFaculty
                            .coAuthors
                            ?.length || 0
                        }
                      </strong>

                      <span>
                        Collaborators
                      </span>

                    </div>

                    <div>

                      <Award size={20} />

                      <strong>
                        {getResearchStatus(
                          selectedFaculty
                            .publications
                            ?.length || 0
                        )}
                      </strong>

                      <span>
                        Research Status
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      TABS
                  ================================================= */}

                  <div className="faculty-modal-tabs">

                    <button
                      className={
                        activeTab ===
                        "overview"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveTab(
                          "overview"
                        )
                      }
                    >
                      <UserRound size={16} />
                      Overview
                    </button>

                    <button
                      className={
                        activeTab ===
                        "publications"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveTab(
                          "publications"
                        )
                      }
                    >
                      <FileText size={16} />
                      Publications
                    </button>

                    <button
                      className={
                        activeTab ===
                        "collaborators"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveTab(
                          "collaborators"
                        )
                      }
                    >
                      <UsersRound size={16} />
                      Collaborators
                    </button>

                    <button
                      className={
                        activeTab ===
                        "research"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveTab(
                          "research"
                        )
                      }
                    >
                      <BarChart3 size={16} />
                      Research
                    </button>

                  </div>

                  {/* =================================================
                      OVERVIEW
                  ================================================= */}

                  {activeTab ===
                    "overview" && (
                    <div className="modal-tab-content">

                      <div className="overview-grid">

                        <div className="info-box">

                          <UserRound size={18} />

                          <div>
                            <span>
                              Faculty ID
                            </span>

                            <strong>
                              {
                                selectedFaculty.userId ||
                                "-"
                              }
                            </strong>
                          </div>

                        </div>

                        <div className="info-box">

                          <Mail size={18} />

                          <div>
                            <span>
                              Email
                            </span>

                            <strong>
                              {
                                selectedFaculty.email ||
                                "-"
                              }
                            </strong>
                          </div>

                        </div>

                        <div className="info-box">

                          <Phone size={18} />

                          <div>
                            <span>
                              Phone
                            </span>

                            <strong>
                              {
                                selectedFaculty.phoneNumber ||
                                "-"
                              }
                            </strong>
                          </div>

                        </div>

                        <div className="info-box">

                          <Building2 size={18} />

                          <div>
                            <span>
                              Department
                            </span>

                            <strong>
                              {
                                selectedFaculty.department ||
                                dept ||
                                "-"
                              }
                            </strong>
                          </div>

                        </div>

                        <div className="info-box full-width">

                          <GraduationCap
                            size={18}
                          />

                          <div>
                            <span>
                              Education
                            </span>

                            <strong>
                              {
                                selectedFaculty.educationDetails ||
                                "Not provided"
                              }
                            </strong>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* =================================================
                      PUBLICATIONS
                  ================================================= */}

                  {activeTab ===
                    "publications" && (
                    <div className="modal-tab-content">

                      {selectedFaculty
                        .publications
                        ?.length === 0 ? (
                        <div className="tab-empty">

                          <FileText size={30} />

                          <h4>
                            No publications found
                          </h4>

                          <p>
                            This faculty member
                            has no PID-assigned
                            publications recorded
                            yet.
                          </p>

                        </div>
                      ) : (
                        <div className="publication-list">

                          {selectedFaculty.publications.map(
                            (
                              publication,
                              index
                            ) => (
                              <motion.div
                                className="publication-item"
                                key={
                                  publication._id ||
                                  publication.uid ||
                                  publication.pid ||
                                  index
                                }
                                initial={{
                                  opacity: 0,
                                  y: 8,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                              >

                                <div className="publication-icon">
                                  <FileText
                                    size={18}
                                  />
                                </div>

                                <div className="publication-info">

                                  <h4>
                                    {publication.paperTitle ||
                                      publication.title ||
                                      publication.name ||
                                      "Untitled Publication"}
                                  </h4>

                                  <div className="publication-meta">

                                    <span>
                                      <BookOpen
                                        size={13}
                                      />

                                      {getPublicationType(
                                        publication
                                      )}
                                    </span>

                                    <span>
                                      <CalendarDays
                                        size={13}
                                      />

                                      {getPublicationYear(
                                        publication
                                      )}
                                    </span>

                                    {publication.pid && (
                                      <span>
                                        PID:{" "}
                                        {
                                          publication.pid
                                        }
                                      </span>
                                    )}

                                  </div>

                                </div>

                              </motion.div>
                            )
                          )}

                        </div>
                      )}

                    </div>
                  )}

                  {/* =================================================
                      COLLABORATORS
                  ================================================= */}

                  {activeTab ===
                    "collaborators" && (
                    <div className="modal-tab-content">

                      {selectedFaculty
                        .coAuthors?.length ===
                      0 ? (
                        <div className="tab-empty">

                          <UsersRound
                            size={30}
                          />

                          <h4>
                            No collaborators found
                          </h4>

                          <p>
                            No co-author
                            information is
                            available.
                          </p>

                        </div>
                      ) : (
                        <div className="collaborator-grid">

                          {selectedFaculty.coAuthors.map(
                            (
                              author,
                              index
                            ) => {

                              const authorName =
                                author?.name ||
                                author?.fullName ||
                                author?.authorName ||
                                "Unknown Author";

                              return (
                                <div
                                  className="collaborator-card"
                                  key={
                                    author?._id ||
                                    index
                                  }
                                >

                                  <div className="collaborator-avatar">
                                    {getInitials(
                                      authorName
                                    )}
                                  </div>

                                  <div>

                                    <h4>
                                      {authorName}
                                    </h4>

                                    <p>
                                      {author?.affiliation ||
                                        author?.institution ||
                                        "Affiliation not provided"}
                                    </p>

                                  </div>

                                </div>
                              );
                            }
                          )}

                        </div>
                      )}

                    </div>
                  )}

                  {/* =================================================
                      RESEARCH
                  ================================================= */}
{activeTab === "research" && (
  <div className="modal-tab-content">
    <div className="research-chart-grid">

      {/* ================= PUBLICATIONS BY YEAR ================= */}
      <div className="research-chart-card">

        <div className="chart-card-header">
          <div>
            <h3>Publications by Year</h3>
            <p>PID-assigned publication activity over time</p>
          </div>
        </div>

        {selectedPublicationStats.length > 0 ? (
          <div
            className="research-chart-wrapper"
            style={{
              width: "100%",
              height: "320px",
              minHeight: "320px",
            }}
          >
            <BarChart
              width={500}
              height={300}
              data={selectedPublicationStats}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 20,
              }}
               dataKey="publications"
  barSize={45}
  radius={[6, 6, 0, 0]}
  fill="#0f766e"
  activeBar={{
    fill: "#115e59",
  }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip />

              <Bar
                dataKey="publications"
                barSize={45}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </div>
        ) : (
          <div className="chart-empty">
            <FileText size={30} />
            <span>No yearly publication data</span>
          </div>
        )}

      </div>


      {/* ================= PUBLICATION TYPES ================= */}
      <div className="research-chart-card">

        <div className="chart-card-header">
          <div>
            <h3>Publication Types</h3>
            <p>Distribution by publication type</p>
          </div>
        </div>

        {selectedTypeStats.length > 0 ? (
          <div
            className="research-chart-wrapper"
            style={{
              width: "100%",
              height: "320px",
              minHeight: "320px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PieChart
              width={450}
              height={300}
            >
              <Pie
                data={selectedTypeStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={90}
                innerRadius={45}
                paddingAngle={3}
                label
              >
                 {selectedTypeStats.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={CHART_COLORS[index % CHART_COLORS.length]}
    />
  ))}
              </Pie>

              <Tooltip />

              <Legend
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </div>
        ) : (
          <div className="chart-empty">
            <FileText size={30} />
            <span>No publication type data</span>
          </div>
        )}

      </div>

    </div>
  </div>
)}
                 

                </>
              )}

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
