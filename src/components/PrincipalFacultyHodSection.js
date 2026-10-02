import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import "./HodFacultySection.css";

import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

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
  UserCheck,
  Layers3,
} from "lucide-react";

import {
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


export default function PrincipalFacultyHodSection({ type }) {

  /* =========================================================
     BASIC STATE
  ========================================================= */

  const [personList, setPersonList] = useState([]);

  const [topPublicationDepartment, setTopPublicationDepartment] = useState("");
const [topPublicationCount, setTopPublicationCount] = useState(0);

  const [selectedPerson, setSelectedPerson] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [department, setDepartment] = useState("");

  const [filterType, setFilterType] = useState("all");
  const [sortType, setSortType] = useState("name-asc");

  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [error, setError] = useState("");

  const [visibleCount, setVisibleCount] = useState(8);

  const [activeTab, setActiveTab] = useState("overview");

  const [showFilters, setShowFilters] = useState(false);

  const loadMoreRef = useRef(null);


  /* =========================================================
     DISPLAY LABELS
  ========================================================= */

  const isFaculty = type === "faculty";

  const maleHodCount = useMemo(() => {
  if (isFaculty) return 0;

  return personList.filter(
    (person) =>
      String(person?.gender || "").trim().toLowerCase() === "male"
  ).length;
}, [personList, isFaculty]);

const femaleHodCount = useMemo(() => {
  if (isFaculty) return 0;

  return personList.filter(
    (person) =>
      String(person?.gender || "").trim().toLowerCase() === "female"
  ).length;
}, [personList, isFaculty]);

  const personLabel = isFaculty ? "Faculty" : "HOD";

  const pluralLabel = isFaculty ? "Faculty" : "HODs";


  /* =========================================================
     API ENDPOINTS
  ========================================================= */

  const listEndpoint = isFaculty
    ? "/api/principal/faculty"
    : "/api/principal/hod";


  /* =========================================================
     CHART COLORS
  ========================================================= */

  const CHART_COLORS = [
    "#2563eb",
    "#e97262",
    "#7c3aed",
    "#059669",
    "#db2777",
    "#0891b2",
    "#d97706",
  ];


  /* =========================================================
     PID CHECK
     
     Publication is counted only when PID is assigned.
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
     HELPERS
  ========================================================= */

  const getPublicationCount = (person) => {
    return Number(person?.publicationCount || 0);
  };


  const getCollaboratorCount = (person) => {
    return Number(
      person?.collaboratorCount ??
      person?.coAuthorCount ??
      person?.coAuthorsCount ??
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

    if (!words.length || !words[0]) {
      return isFaculty ? "F" : "H";
    }

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return `${words[0][0]}${
      words[words.length - 1][0]
    }`.toUpperCase();
  };


  const getProfileImage = (person) => {

    if (!person?.profilePic) {
      return "/default-profile.png";
    }

    if (
      person.profilePic.startsWith("http://") ||
      person.profilePic.startsWith("https://") ||
      person.profilePic.startsWith("/")
    ) {
      return person.profilePic;
    }

    return `/${person.profilePic}`;
  };


  const getPublicationYear = (publication) => {

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

    return Number.isNaN(year)
      ? "Unknown"
      : String(year);
  };


  const getPublicationType = (publication) => {

    return (
      publication?.type ||
      publication?.publicationType ||
      publication?.target ||
      "Other"
    );
  };

  const fetchTopPublicationDepartment = async () => {
  try {
    const response = await axios.get("/api/principal/approved-papers");

    const papers = Array.isArray(response.data)
      ? response.data
      : [];

    if (!papers.length) {
      setTopPublicationDepartment("");
      setTopPublicationCount(0);
      return;
    }

    const departmentCounts = {};

    papers.forEach((paper) => {
      const dept = paper?.department?.trim();

      if (!dept) return;

      departmentCounts[dept] =
        (departmentCounts[dept] || 0) + 1;
    });

    const sortedDepartments = Object.entries(departmentCounts)
      .sort((a, b) => b[1] - a[1]);

    if (sortedDepartments.length > 0) {
      setTopPublicationDepartment(sortedDepartments[0][0]);
      setTopPublicationCount(sortedDepartments[0][1]);
    } else {
      setTopPublicationDepartment("");
      setTopPublicationCount(0);
    }
  } catch (err) {
    console.error(
      "Failed to fetch top publication department:",
      err
    );

    setTopPublicationDepartment("");
    setTopPublicationCount(0);
  }
};


  /* =========================================================
     FETCH PEOPLE + PUBLICATION DATA
  ========================================================= */

  const fetchPeople = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await axios.get(listEndpoint);

      const peopleData = Array.isArray(response.data)
        ? response.data
        : [];


      /* =====================================================
         DEPARTMENTS
      ===================================================== */

      const deptList = [
        ...new Set(
          peopleData
            .map((person) => person?.department)
            .filter(Boolean)
        ),
      ].sort();

      setDepartments(deptList);


      /* =====================================================
         FETCH PUBLICATIONS + CO-AUTHORS
         
         We enrich every person with:
         - publicationCount
         - collaboratorCount
      ===================================================== */

    const enrichedPeople = await Promise.all(
  peopleData.map(async (person) => {
    const userId = person?.userId;

    let publicationCount = 0;
    let collaboratorCount = 0;

    // Only Faculty gets publication/collaborator data
    if (isFaculty && userId) {
      try {
        const publicationRes = await axios.get(
          `/api/faculty/publications/${encodeURIComponent(userId)}`
        );

        const publications = Array.isArray(publicationRes.data)
          ? publicationRes.data
          : [];

        publicationCount = publications.filter(
          hasAssignedPid
        ).length;
      } catch (err) {
        console.error(
          `Failed to fetch publications for ${userId}:`,
          err
        );
      }

      try {
        const coAuthorRes = await axios.get(
          `/api/faculty/coauthors/${encodeURIComponent(userId)}`
        );

        collaboratorCount = Array.isArray(coAuthorRes.data)
          ? coAuthorRes.data.length
          : 0;
      } catch (err) {
        console.error(
          `Failed to fetch collaborators for ${userId}:`,
          err
        );
      }
    }

    return {
      ...person,
      publicationCount,
      collaboratorCount,
    };
  })
);      
      // const enrichedPeople = await Promise.all(
      //   peopleData.map(async (person) => {

      //     const userId = person?.userId;

      //     let publicationCount = 0;
      //     let collaboratorCount = 0;


      //     /* =================================================
      //        PUBLICATIONS
      //     ================================================= */

      //     if (userId) {

      //       try {

      //         const publicationRes =
      //           await axios.get(
      //             `/api/faculty/publications/${encodeURIComponent(
      //               userId
      //             )}`
      //           );

      //         const publications = Array.isArray(
      //           publicationRes.data
      //         )
      //           ? publicationRes.data
      //           : [];

      //         const pidPublications =
      //           publications.filter(hasAssignedPid);

      //         publicationCount =
      //           pidPublications.length;

      //       } catch (publicationError) {

      //         console.error(
      //           `Failed to fetch publications for ${userId}`,
      //           publicationError
      //         );

      //         publicationCount = 0;
      //       }


      //       /* =============================================
      //          CO-AUTHORS
      //       ============================================= */

      //       try {

      //         const coAuthorRes =
      //           await axios.get(
      //             `/api/faculty/coauthors/${encodeURIComponent(
      //               userId
      //             )}`
      //           );

      //         const coAuthors = Array.isArray(
      //           coAuthorRes.data
      //         )
      //           ? coAuthorRes.data
      //           : [];

      //         collaboratorCount =
      //           coAuthors.length;

      //       } catch (coAuthorError) {

      //         console.error(
      //           `Failed to fetch collaborators for ${userId}`,
      //           coAuthorError
      //         );

      //         collaboratorCount = 0;
      //       }
      //     }


      //     return {
      //       ...person,
      //       publicationCount,
      //       collaboratorCount,
      //     };
      //   })
      // );


      setPersonList(enrichedPeople);

    } catch (err) {

      console.error(
        "Principal faculty/HOD fetch error:",
        err
      );

      setError(
        `Failed to load ${personLabel.toLowerCase()} data.`
      );

    } finally {

      setLoading(false);
    }
  };


  /* =========================================================
     FETCH WHEN TYPE CHANGES
  ========================================================= */

 useEffect(() => {
  setSearchText("");
  setDepartment("");
  setFilterType("all");
  setSortType("name-asc");
  setSelectedPerson(null);
  setActiveTab("overview");

  fetchPeople();

  if (type === "hod") {
    fetchTopPublicationDepartment();
  } else {
    setTopPublicationDepartment("");
    setTopPublicationCount(0);
  }
}, [type]);
 
  // useEffect(() => {

  //   setSearchText("");
  //   setDepartment("");
  //   setFilterType("all");
  //   setSortType("name-asc");
  //   setSelectedPerson(null);
  //   setActiveTab("overview");

  //   fetchPeople();

  // }, [type]);


  /* =========================================================
     FILTER + SEARCH + SORT
  ========================================================= */

  const filteredPeople = useMemo(() => {

    let result = [...personList];

    const q = searchText
      .trim()
      .toLowerCase();


    /* =====================================================
       SEARCH
    ===================================================== */

    if (q) {

      result = result.filter((person) => {

        return (
          person?.fullName
            ?.toLowerCase()
            .includes(q) ||

          person?.userId
            ?.toLowerCase()
            .includes(q) ||

          person?.email
            ?.toLowerCase()
            .includes(q) ||

          person?.department
            ?.toLowerCase()
            .includes(q)
        );
      });
    }


    /* =====================================================
       DEPARTMENT
    ===================================================== */

    if (department) {

      result = result.filter(
        (person) =>
          person?.department === department
      );
    }


    /* =====================================================
       RESEARCH FILTER
    ===================================================== */

    if (filterType !== "all") {

      result = result.filter((person) => {

        const count =
          getPublicationCount(person);

        if (filterType === "high") {
          return count >= 20;
        }

        if (filterType === "active") {
          return count >= 10;
        }

        if (filterType === "emerging") {
          return count >= 5;
        }

        if (filterType === "profile") {
          return count < 5;
        }

        return true;
      });
    }


    /* =====================================================
       SORT
    ===================================================== */

    result.sort((a, b) => {

      const nameA = a?.fullName || "";
      const nameB = b?.fullName || "";

      const pubA =
        getPublicationCount(a);

      const pubB =
        getPublicationCount(b);

      const colA =
        getCollaboratorCount(a);

      const colB =
        getCollaboratorCount(b);


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
    personList,
    searchText,
    department,
    filterType,
    sortType,
  ]);


  /* =========================================================
     RESET PAGINATION
  ========================================================= */

  useEffect(() => {

    setVisibleCount(8);

  }, [
    searchText,
    department,
    filterType,
    sortType,
    type,
  ]);


  const visiblePeople =
    filteredPeople.slice(
      0,
      visibleCount
    );


  /* =========================================================
     INFINITE SCROLL
  ========================================================= */

  useEffect(() => {

    const node =
      loadMoreRef.current;

    if (!node) return;


    const observer =
      new IntersectionObserver(
        (entries) => {

          if (
            entries[0].isIntersecting &&
            visibleCount <
              filteredPeople.length
          ) {

            setVisibleCount(
              (prev) => prev + 6
            );
          }
        },
        {
          threshold: 0.2,
        }
      );


    observer.observe(node);

    return () =>
      observer.disconnect();

  }, [
    visibleCount,
    filteredPeople.length,
  ]);


  /* =========================================================
     ANALYTICS
  ========================================================= */

  const analytics = useMemo(() => {

    const totalPeople =
      personList.length;


    const totalPublications =
      personList.reduce(
        (sum, person) =>
          sum +
          getPublicationCount(person),
        0
      );


    const activeResearchers =
      personList.filter(
        (person) =>
          getPublicationCount(person) >= 1
      ).length;


    const emergingResearchers =
      personList.filter(
        (person) =>
          getPublicationCount(person) >= 5
      ).length;


    const totalCollaborators =
      personList.reduce(
        (sum, person) =>
          sum +
          getCollaboratorCount(person),
        0
      );


    const averagePublications =
      totalPeople > 0
        ? (
            totalPublications /
            totalPeople
          ).toFixed(1)
        : "0.0";


    return {
      totalPeople,
      totalPublications,
      activeResearchers,
      emergingResearchers,
      totalCollaborators,
      averagePublications,
    };

  }, [personList]);


  /* =========================================================
     VIEW DETAILS
  ========================================================= */
  const viewDetails = async (userId) => {
  try {
    setDetailsLoading(true);
    setError("");
    setActiveTab("overview");

    const detailsEndpoint = isFaculty
      ? `/api/principal/faculty-details/${encodeURIComponent(userId)}`
      : `/api/principal/hod-details/${encodeURIComponent(userId)}`;

    // HOD → only basic profile details
    if (!isFaculty) {
      const res = await axios.get(detailsEndpoint);

      setSelectedPerson({
        ...res.data,
        publications: [],
        coAuthors: [],
      });

      return;
    }

    // Faculty → full research information
    const [personRes, pubRes, coRes] =
      await Promise.all([
        axios.get(detailsEndpoint),

        axios.get(
          `/api/faculty/publications/${encodeURIComponent(userId)}`
        ),

        axios.get(
          `/api/faculty/coauthors/${encodeURIComponent(userId)}`
        ),
      ]);

    const publications = Array.isArray(pubRes.data)
      ? pubRes.data.filter(hasAssignedPid)
      : [];

    setSelectedPerson({
      ...personRes.data,
      publications,
      coAuthors: Array.isArray(coRes.data)
        ? coRes.data
        : [],
    });

  } catch (err) {
    console.error(
      "Principal person details error:",
      err
    );

    setError(
      `Failed to fetch ${personLabel.toLowerCase()} details.`
    );
  } finally {
    setDetailsLoading(false);
  }
};
  // const viewDetails = async (userId) => {

  //   try {

  //     setDetailsLoading(true);
  //     setError("");
  //     setActiveTab("overview");


  //     const detailsEndpoint =
  //       isFaculty
  //         ? `/api/principal/faculty-details/${encodeURIComponent(
  //             userId
  //           )}`
  //         : `/api/principal/hod-details/${encodeURIComponent(
  //             userId
  //           )}`;


  //     const [
  //       personRes,
  //       pubRes,
  //       coRes,
  //     ] = await Promise.all([

  //       axios.get(detailsEndpoint),

  //       axios.get(
  //         `/api/faculty/publications/${encodeURIComponent(
  //           userId
  //         )}`
  //       ),

  //       axios.get(
  //         `/api/faculty/coauthors/${encodeURIComponent(
  //           userId
  //         )}`
  //       ),
  //     ]);


  //     const allPublications =
  //       Array.isArray(personRes.data?.publications)
  //         ? personRes.data.publications
  //         : Array.isArray(pubRes.data)
  //         ? pubRes.data
  //         : [];


  //     const pidPublications =
  //       allPublications.filter(
  //         hasAssignedPid
  //       );


  //     const coAuthors =
  //       Array.isArray(coRes.data)
  //         ? coRes.data
  //         : [];


  //     setSelectedPerson({

  //       ...personRes.data,

  //       publications:
  //         pidPublications,

  //       coAuthors,

  //     });

  //   } catch (err) {

  //     console.error(
  //       "Principal person details error:",
  //       err
  //     );

  //     setError(
  //       `Failed to fetch ${personLabel.toLowerCase()} details.`
  //     );

  //   } finally {

  //     setDetailsLoading(false);
  //   }
  // };


  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {

    setSelectedPerson(null);
    setActiveTab("overview");

  };


  /* =========================================================
     SELECTED PUBLICATION STATS
  ========================================================= */

  const selectedPublicationStats =
    useMemo(() => {

      if (!selectedPerson) {
        return [];
      }

      const map = {};


      selectedPerson.publications?.forEach(
        (publication) => {

          const year =
            getPublicationYear(
              publication
            );


          if (year !== "Unknown") {

            map[year] =
              (map[year] || 0) + 1;
          }
        }
      );


      return Object.entries(map)
        .sort(
          (a, b) =>
            Number(a[0]) -
            Number(b[0])
        )
        .map(
          ([year, count]) => ({
            year,
            publications: count,
          })
        );

    }, [selectedPerson]);


  /* =========================================================
     PUBLICATION TYPE STATS
  ========================================================= */

  const selectedTypeStats =
    useMemo(() => {

      if (!selectedPerson) {
        return [];
      }

      const map = {};


      selectedPerson.publications?.forEach(
        (publication) => {

          const type =
            getPublicationType(
              publication
            );

          map[type] =
            (map[type] || 0) + 1;
        }
      );


      return Object.entries(map)
        .map(
          ([name, value]) => ({
            name,
            value,
          })
        );

    }, [selectedPerson]);


  /* =========================================================
     EXPORT REPORT
  ========================================================= */

  const exportReport = () => {

    const doc = new jsPDF();


    doc.setFontSize(18);

    doc.text(
      `Principal ${personLabel} Research Report`,
      14,
      18
    );


    doc.setFontSize(11);

    doc.text(
      `Category: ${personLabel}`,
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

      head: [[
        `${personLabel} Name`,
        "User ID",
        "Department",
        "Email",
        "Publications",
        "Collaborators",
        "Research Status",
      ]],

      body: personList.map(
        (person) => {

          const count =
            getPublicationCount(
              person
            );


          return [
            person?.fullName || "-",
            person?.userId || "-",
            person?.department || "-",
            person?.email || "-",
            count,
            getCollaboratorCount(
              person
            ),
            getResearchStatus(
              count
            ),
          ];
        }
      ),

      styles: {
        fontSize: 8,
      },

      headStyles: {
        fontSize: 8,
      },
    });


    doc.save(
      `Principal_${personLabel}_Research_Report.pdf`
    );
  };


  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {

    setSearchText("");
    setDepartment("");
    setFilterType("all");
    setSortType("name-asc");

  };


  /* =========================================================
     RETURN
  ========================================================= */

  return (

    <div className="hod-faculty-section">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="faculty-page-header">

        <div>

          <div className="header-label">

            <UsersRound size={17} />

            Principal {personLabel} Directory

          </div>


          <h2>

            {personLabel} Directory

          </h2>


         <p>
  {isFaculty
    ? "Explore faculty members, publications, collaborations and research activity across departments."
    : "Explore Heads of Departments and their professional profile information across departments."}
</p>

        </div>


        <button
          className="faculty-export-btn"
          onClick={exportReport}
          disabled={!personList.length}
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

            <span>
              Total {pluralLabel}
            </span>

            <strong>
              {analytics.totalPeople}
            </strong>

          </div>

        </motion.div>
        {isFaculty && (
    <motion.div
      className="faculty-stat-card stat-purple"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div className="stat-icon">
        <BookOpen size={22} />
      </div>

      <div>
        <span>Total Publications</span>

        <strong>
          {analytics.totalPublications}
        </strong>
      </div>
    </motion.div>
  )}

  {isFaculty && (
    <motion.div
      className="faculty-stat-card stat-green"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="stat-icon">
        <TrendingUp size={22} />
      </div>

      <div>
        <span>Active Researchers</span>

        <strong>
          {analytics.activeResearchers}
        </strong>
      </div>
    </motion.div>
  )}

  {isFaculty && (
    <motion.div
      className="faculty-stat-card stat-orange"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
       <div className="stat-icon">
        <UsersRound size={22} />
      </div>

      <div>
        <span>Total Collaborators</span>

        <strong>
          {analytics.totalCollaborators}
        </strong>
      </div>
    </motion.div>
  )}

        {!isFaculty && (
  <>
    {/* Male HODs */}
    <motion.div
      className="faculty-stat-card stat-purple"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div className="stat-icon">
        <UserRound size={22} />
      </div>

      <div>
        <span>Male HODs</span>
        <strong>{maleHodCount}</strong>
      </div>
    </motion.div>

    {/* Female HODs */}
    <motion.div
      className="faculty-stat-card stat-green"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="stat-icon">
        <Users size={22} />
      </div>

      <div>
        <span>Female HODs</span>
        <strong>{femaleHodCount}</strong>
      </div>
    </motion.div>

    {/* Top Publication Department */}
    <motion.div
      className="faculty-stat-card stat-orange"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="stat-icon">
        <Award size={22} />
      </div>

      <div>
        <span>Top Publication Department</span>
        <strong>{topPublicationDepartment || "N/A"}</strong>
          {topPublicationCount > 0 && (
          <span>
            {topPublicationCount} Publications
          </span>
        )}
      </div>
    </motion.div>
  </>
)}

      </div>


      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="faculty-toolbar">


        <div className="faculty-search-wrapper">

          <Search size={19} />

          <input
            type="text"
            placeholder={`Search ${personLabel.toLowerCase()} by name, ID or email...`}
            value={searchText}
            onChange={(e) =>
              setSearchText(
                e.target.value
              )
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

          <SlidersHorizontal
            size={17}
          />

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
          onClick={fetchPeople}
          disabled={loading}
          title={`Refresh ${personLabel}`}
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


            {/* DEPARTMENT */}

            <div className="filter-group">

              <label>
                Department
              </label>

              <select
                value={department}
                onChange={(e) =>
                  setDepartment(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Departments
                </option>

                {departments.map(
                  (dept) => (

                    <option
                      key={dept}
                      value={dept}
                    >
                      {dept}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* RESEARCH */}
                {isFaculty && (

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
                  All {pluralLabel}
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
                )}

            {/* SORT */}

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
{isFaculty && (
<>
                <option value="publications-high">
                  Most Publications
                </option>

                <option value="publications-low">
                  Least Publications
                </option>

                <option value="collaborators">
                  Most Collaborators
                </option>
                </>
)}
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
          RESULTS
      ===================================================== */}

      <div className="faculty-results-row">

        <span>

          Showing{" "}

          <strong>
            {Math.min(
              visibleCount,
              filteredPeople.length
            )}
          </strong>{" "}

          of{" "}

          <strong>
            {filteredPeople.length}
          </strong>{" "}

          {pluralLabel.toLowerCase()}

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
            Loading {pluralLabel.toLowerCase()}...
          </span>

        </div>

      )}


      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        filteredPeople.length === 0 && (

          <div className="faculty-empty">

            <div className="empty-icon">
              <Users size={28} />
            </div>

            <h3>
              No {pluralLabel.toLowerCase()} found
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
          PEOPLE GRID
      ===================================================== */}

      <div className="faculty-container">

        {visiblePeople.map(
          (person, index) => {

            const publicationCount =
              getPublicationCount(
                person
              );

            const collaboratorCount =
              getCollaboratorCount(
                person
              );

            const status =
              getResearchStatus(
                publicationCount
              );


            return (

              <motion.div
                key={
                  person.userId ||
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


                {/* TOP */}

                <div className="faculty-card-top">


                  <div className="faculty-avatar-wrapper">

                    {person.profilePic ? (

                      <img
                        src={getProfileImage(
                          person
                        )}
                        alt={
                          person.fullName ||
                          personLabel
                        }
                        className="faculty-avatar"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/default-profile.png";
                        }}
                      />

                    ) : (

                      <div className="faculty-avatar initials-avatar">

                        {getInitials(
                          person.fullName
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


                {/* CONTENT */}

                <div className="faculty-card-content">


                  <h3>
                    {person.fullName ||
                      `${personLabel} Member`}
                  </h3>


                  <p className="faculty-id">
                    {person.userId ||
                      "ID unavailable"}
                  </p>


                  <p className="faculty-email">

                    <Mail size={14} />

                    {person.email ||
                      "Email unavailable"}

                  </p>


                  <p className="faculty-id">

                    <Building2 size={14} />

                    {person.department ||
                      "Department unavailable"}

                  </p>


                  <div className="faculty-mini-stats">

                       {/* Publications - Faculty only */}
  {isFaculty && (
                    <div>

                      <BookOpen size={16} />

                      <strong>
                        {publicationCount}
                      </strong>

                      <span>
                        Publications
                      </span>

                    </div>
  )}

 {/* Publications - Faculty only */}
  {isFaculty && (
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
  )}

                  </div>


                  <button
                    className="view-profile-btn"
                    onClick={() =>
                      viewDetails(
                        person.userId
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
        filteredPeople.length && (

        <div
          ref={loadMoreRef}
          className="faculty-load-more"
        >

          <RefreshCw
            size={18}
            className="spin-icon"
          />

          Loading more {pluralLabel.toLowerCase()}...

        </div>

      )}


      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}

      <AnimatePresence>

        {selectedPerson && (

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


              {/* =================================================
                  LOADING
              ================================================= */}

              {detailsLoading ? (

                <div className="modal-loading">

                  <RefreshCw
                    size={28}
                    className="spin-icon"
                  />

                  <p>
                    Loading {personLabel.toLowerCase()} profile...
                  </p>

                </div>

              ) : (

                <>


                  {/* =================================================
                      MODAL HEADER
                  ================================================= */}

                  <div className="modal-profile-header">


                    <div className="modal-profile-image-wrapper">

                      {selectedPerson.profilePic ? (

                        <img
                          src={getProfileImage(
                            selectedPerson
                          )}
                          alt={
                            selectedPerson.fullName ||
                            personLabel
                          }
                          onError={(e) => {
                            e.currentTarget.src =
                              "/default-profile.png";
                          }}
                        />

                      ) : (

                        <div className="modal-initials">

                          {getInitials(
                            selectedPerson.fullName
                          )}

                        </div>

                      )}

                    </div>


                    <div className="modal-profile-main">


                      <span className="modal-department">

                        {selectedPerson.department ||
                          "Department"}

                      </span>


                      <h2>

                        {selectedPerson.fullName ||
                          `${personLabel} Member`}

                      </h2>


                      <p>
                        {selectedPerson.userId}
                      </p>


                      <div className="modal-contact-row">


                        {selectedPerson.email && (

                          <span>

                            <Mail size={14} />

                            {selectedPerson.email}

                          </span>

                        )}


                        {selectedPerson.phoneNumber && (

                          <span>

                            <Phone size={14} />

                            {selectedPerson.phoneNumber}

                          </span>

                        )}

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      STATS
                  ================================================= */}
                  {isFaculty && (
                    <div className="modal-stat-grid">


                      <div>

                        <BookOpen size={20} />

                        <strong>
                          {selectedPerson
                            .publications
                            ?.length || 0}
                        </strong>

                        <span>
                          Publications
                        </span>

                      </div>


                      <div>

                        <UsersRound size={20} />

                        <strong>
                          {selectedPerson
                            .coAuthors
                            ?.length || 0}
                        </strong>

                        <span>
                          Collaborators
                        </span>

                      </div>


                      <div>

                        <Award size={20} />

                        <strong>
                          {getResearchStatus(
                            selectedPerson
                              .publications
                              ?.length || 0
                          )}
                        </strong>

                        <span>
                          Research Status
                        </span>

                      </div>

                    </div>
                  )}


                  {/* =================================================
                      TABS
                  ================================================= */}
                  {isFaculty && (
  <div className="faculty-modal-tabs">

    <button
      className={
        activeTab === "overview"
          ? "active"
          : ""
      }
      onClick={() =>
        setActiveTab("overview")
      }
    >
      <UserRound size={16} />
      Overview
    </button>

    <button
      className={
        activeTab === "publications"
          ? "active"
          : ""
      }
      onClick={() =>
        setActiveTab("publications")
      }
    >
      <FileText size={16} />
      Publications
    </button>

    <button
      className={
        activeTab === "collaborators"
          ? "active"
          : ""
      }
      onClick={() =>
        setActiveTab("collaborators")
      }
    >
      <UsersRound size={16} />
      Collaborators
    </button>

    <button
      className={
        activeTab === "research"
          ? "active"
          : ""
      }
      onClick={() =>
        setActiveTab("research")
      }
    >
      <BarChart3 size={16} />
      Research
    </button>

  </div>
)}
                  {/* <div className="faculty-modal-tabs">


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

                      <UsersRound
                        size={16}
                      />

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

                  </div> */}


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
                              {personLabel} ID
                            </span>

                            <strong>
                              {selectedPerson.userId ||
                                "-"}
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
                              {selectedPerson.email ||
                                "-"}
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
                              {selectedPerson.phoneNumber ||
                                "-"}
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
                              {selectedPerson.department ||
                                "-"}
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
                              {selectedPerson.educationDetails ||
                                "Not provided"}
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


                      {selectedPerson
                        .publications
                        ?.length === 0 ? (

                        <div className="tab-empty">

                          <FileText size={30} />

                          <h4>
                            No publications found
                          </h4>

                          <p>
                            This {personLabel.toLowerCase()}
                            has no PID-assigned
                            publications recorded
                            yet.
                          </p>

                        </div>

                      ) : (

                        <div className="publication-list">

                          {selectedPerson.publications.map(
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

                                        {publication.pid}

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


                      {selectedPerson
                        .coAuthors
                        ?.length === 0 ? (

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

                          {selectedPerson.coAuthors.map(
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

                  {activeTab ===
                    "research" && (

                    <div className="modal-tab-content">

                      <div className="research-chart-grid">


                        {/* PUBLICATIONS BY YEAR */}

                        <div className="research-chart-card">

                          <div className="chart-card-header">

                            <div>

                              <h3>
                                Publications by Year
                              </h3>

                              <p>
                                PID-assigned publication
                                activity over time
                              </p>

                            </div>

                          </div>


                          {selectedPublicationStats.length >
                          0 ? (

                            <div
                              className="research-chart-wrapper"
                              style={{
                                width:
                                  "100%",
                                height:
                                  "320px",
                                minHeight:
                                  "320px",
                              }}
                            >

                              <BarChart
                                width={500}
                                height={300}
                                data={
                                  selectedPublicationStats
                                }
                                margin={{
                                  top: 20,
                                  right: 20,
                                  left: 10,
                                  bottom: 20,
                                }}
                              >

                                <CartesianGrid
                                  strokeDasharray="3 3"
                                />

                                <XAxis
                                  dataKey="year"
                                  tick={{
                                    fontSize: 12,
                                  }}
                                />

                                <YAxis
                                  allowDecimals={
                                    false
                                  }
                                  tick={{
                                    fontSize: 12,
                                  }}
                                />

                                <Tooltip />


                                <Bar
                                  dataKey="publications"
                                  barSize={45}
                                  radius={[
                                    6,
                                    6,
                                    0,
                                    0,
                                  ]}
                                  fill="#0f766e"
                                />

                              </BarChart>

                            </div>

                          ) : (

                            <div className="chart-empty">

                              <FileText
                                size={30}
                              />

                              <span>
                                No yearly
                                publication data
                              </span>

                            </div>

                          )}

                        </div>


                        {/* PUBLICATION TYPES */}

                        <div className="research-chart-card">

                          <div className="chart-card-header">

                            <div>

                              <h3>
                                Publication Types
                              </h3>

                              <p>
                                Distribution by
                                publication type
                              </p>

                            </div>

                          </div>


                          {selectedTypeStats.length >
                          0 ? (

                            <div
                              className="research-chart-wrapper"
                              style={{
                                width:
                                  "100%",
                                height:
                                  "320px",
                                minHeight:
                                  "320px",
                                display:
                                  "flex",
                                justifyContent:
                                  "center",
                                alignItems:
                                  "center",
                              }}
                            >

                              <PieChart
                                width={450}
                                height={300}
                              >

                                <Pie
                                  data={
                                    selectedTypeStats
                                  }
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="45%"
                                  outerRadius={90}
                                  innerRadius={45}
                                  paddingAngle={3}
                                  label
                                >

                                  {selectedTypeStats.map(
                                    (
                                      entry,
                                      index
                                    ) => (

                                      <Cell
                                        key={`cell-${index}`}
                                        fill={
                                          CHART_COLORS[
                                            index %
                                              CHART_COLORS.length
                                          ]
                                        }
                                      />

                                    )
                                  )}

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

                              <FileText
                                size={30}
                              />

                              <span>
                                No publication
                                type data
                              </span>

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

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./PrincipalFacultyHodSection.css";
// export default function PrincipalFacultyHodSection({ type }) {
//   const [list, setList] = useState([]);
//   const [filteredList, setFilteredList] = useState([]);
//   const [selectedPerson, setSelectedPerson] = useState(null);
//   const [search, setSearch] = useState("");
//   const [error, setError] = useState("");
//   const [department, setDepartment] = useState("");
// const [departments, setDepartments] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const url =
//           type === "faculty"
//             ? "/api/principal/faculty"
//             : "/api/principal/hod";
//         const res = await axios.get(url);
//         setList(res.data);
//         setFilteredList(res.data);
//       } catch (err) {
//         console.error(err);
//         setError(`Failed to load ${type} data`);
//       }
//     };
//     fetchData();
//   }, [type]);


//   useEffect(() => {
//   const fetchData = async () => {
//     try {
//       const url =
//         type === "faculty"
//           ? "/api/principal/faculty"
//           : "/api/principal/hod";

//       const res = await axios.get(url);

//       setList(res.data);
//       setFilteredList(res.data);

//       // 🔹 Extract unique departments
//       const deptList = [...new Set(res.data.map(p => p.department))];
//       setDepartments(deptList);

//     } catch (err) {
//       console.error(err);
//       setError(`Failed to load ${type} data`);
//     }
//   };
//   fetchData();
// }, [type]);

// useEffect(() => {
//   let filtered = list.filter(
//     p =>
//       p.fullName.toLowerCase().includes(search.toLowerCase()) ||
//       p.userId.toLowerCase().includes(search.toLowerCase()) ||
//       p.email.toLowerCase().includes(search.toLowerCase())
//   );

//   // 🔹 Department filter
//   if (department !== "") {
//     filtered = filtered.filter(p => p.department === department);
//   }

//   setFilteredList(filtered);

// }, [search, department, list]);

//   // useEffect(() => {
//   //   setFilteredList(
//   //     list.filter(
//   //       p =>
//   //         p.fullName.toLowerCase().includes(search.toLowerCase()) ||
//   //         p.userId.toLowerCase().includes(search.toLowerCase()) ||
//   //         p.email.toLowerCase().includes(search.toLowerCase())
//   //     )
//   //   );
//   // }, [search, list]);

//   const viewDetails = async (userId) => {
//     try {
//       const url =
//         type === "faculty"
//           ? `/api/principal/faculty-details/${userId}`
//           : `/api/principal/hod-details/${userId}`;
//       const res = await axios.get(url);
//       setSelectedPerson(res.data);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch details");
//     }
//   };

//   const closeModal = () => setSelectedPerson(null);

//   return (
//     <div className="faculty-hod-page">
//       {error && <p style={{ color: "red" }}>{error}</p>}
//      <div className="filter-container">

//   <input
//     type="text"
//     placeholder={`Search ${type} by name, ID, email...`}
//     value={search}
//     onChange={(e) => setSearch(e.target.value)}
//     className="search-input"
//   />

//   <select
//     value={department}
//     onChange={(e) => setDepartment(e.target.value)}
//     className="department-dropdown"
//   >
//     <option value="">All Departments</option>
//     {departments.map((dept, index) => (
//       <option key={index} value={dept}>
//         {dept}
//       </option>
//     ))}
//   </select>

// </div>

//       <div className="card-container">
//         {/* {filteredList.length === 0 && <p>No {type} found.</p>} */}
//         {filteredList.length === 0 && (
//   <div style={{ textAlign: "center", width: "100%", marginTop: "50px" }}>
//     <h3>No {type} found 😕</h3>
//     <p>Try adjusting search or filters</p>
//   </div>
// )}
//         {filteredList.map(p => (
//           <div key={p.userId} className="profile-card">
//             <img
//   src={`/${p.profilePic}`}
//   alt="profile"
//   className="profile-img"
// />
// {/* <div
//   key={p.userId}
//   className="profile-card"
//   onClick={() => viewDetails(p.userId)}
// >      */}
// <h4>{p.fullName}</h4>
//             <h5>ID: {p.userId}</h5>
//             <button className="view-btn" onClick={() => viewDetails(p.userId)}>
//   View Details
// </button>
//           </div>
//         ))}
//       </div>

//       {selectedPerson && (
//         <div className="details-modal">
//          <div className="modal-content">
//             <button className="close-btn" onClick={closeModal}>
//               ✖
//             </button>
//             <div style={{ textAlign: "center", marginBottom: 20 }}>
//               {/* <img
//   src={`/${selectedPerson.profilePic}`}
//   alt="profile"
//   className="modal-profile-img"
// /> */}<img
//   src={`/${selectedPerson.profilePic}`}
//   alt="profile"
//   className="modal-profile-img"
//   onError={(e) => (e.target.src = "/default-avatar.png")}
// />
//               <h3>{selectedPerson.fullName}</h3>
//             </div>
//             <p><strong>ID:</strong> {selectedPerson.userId}</p>
//             <p><strong>Email:</strong> {selectedPerson.email}</p>
//             <p><strong>Phone:</strong> {selectedPerson.phoneNumber}</p>
//             {/* <p><strong>Gender:</strong> {selectedPerson.gender}</p> */}
//             <p><strong>Department:</strong> {selectedPerson.department}</p>
//             {selectedPerson.educationDetails && (
//               <p><strong>Education:</strong> {selectedPerson.educationDetails}</p>
//             )}
//             {/* {selectedPerson.experienceDetails && (
//               <p><strong>Experience:</strong> {selectedPerson.experienceDetails}</p>
//             )} */}
//             {/* {type === "faculty" && selectedPerson.publications?.length > 0 && (
//               <>
//                 <h4>Publications:</h4>
//                 <ul>
//                   {selectedPerson.publications.map((pub, idx) => (
//                     <li key={idx}>{pub.title}</li>
//                   ))}
//                 </ul>
//               </>
//             )} */}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }