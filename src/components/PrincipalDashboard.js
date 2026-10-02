
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HodDashboard.css";
import PrincipalUidApproval from "./PrincipalUidApproval";
import { FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2";

import PrincipalFacultyHodSection from "./PrincipalFacultyHodSection";
import PrincipalPublishedPapers from "./PrincipalPublishedPapers";
import NotificationsSection from "./NotificationsSection";
import ProfileSection from "./faculty/ProfileSection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

const API_BASE_URL = "http://localhost:5000";
export default function PrincipalDashboard() {
  const navigate = useNavigate();

  /* =========================================================
     BASIC STATE
  ========================================================= */

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const userId = localStorage.getItem("userId");
  const [topResearchFaculty, setTopResearchFaculty] = useState([]);

  /* =========================================================
     PROFILE
  ========================================================= */

  const [principalProfile, setPrincipalProfile] =
    useState(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [profileError, setProfileError] =
    useState(null);

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const [notifications, setNotifications] =
    useState([]);

  const [notifCount, setNotifCount] =
    useState(0);

  /* =========================================================
     APPROVED PUBLICATIONS
  ========================================================= */

  const [approvedPids, setApprovedPids] =
    useState([]);

  const [loadingPids, setLoadingPids] =
    useState(true);

  /* =========================================================
     PROFILE FETCH
  ========================================================= */

  useEffect(() => {
    if (!userId) {
      setProfileError(
        "No Principal ID found. Please login again."
      );

      setLoadingProfile(false);
      return;
    }
    const getProfileImageUrl = (profilePic) => {
  if (!profilePic) return null;

  // If backend returns an object
  if (typeof profilePic === "object") {
    profilePic =
      profilePic.url ||
      profilePic.path ||
      profilePic.filename ||
      profilePic.filePath ||
      "";
  }

  if (!profilePic) return null;

  const imagePath = String(profilePic).trim();

  // Base64 image
  if (imagePath.startsWith("data:image")) {
    return imagePath;
  }

  // Already a complete URL
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  // Existing API base URL
  const baseUrl =
    API_BASE_URL ||
    "http://localhost:5000";

  // Remove duplicate slashes
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;

  return `${cleanBase}${cleanPath}`;
};

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const res = await axios.get(
          `/api/faculty/${userId}`
        );

        const data = res.data;

        setPrincipalProfile({
          fullName:
            data.fullName ||
            data.name ||
            "Principal",

          userId:
            data.userId ||
            userId,

          department:
            data.department ||
            "Administration",

          email:
            data.email || "",

          phoneNumber:
            data.phoneNumber || "",

          gender:
            data.gender || "",

          profilePic:
            data.profilePic || "",
        });

        setProfileError(null);
      } catch (error) {
        console.error(
          "Principal profile error:",
          error
        );

        setProfileError(
          "Failed to load Principal profile."
        );

        Swal.fire({
          icon: "error",
          title: "Profile Error",
          text: "Failed to fetch Principal profile.",
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userId]);


useEffect(() => {
  const loadTopResearchFaculty = async () => {
    try {
      const facultyMap = {};

      approvedPids.forEach((paper) => {
        let userId = null;

        let facultyName =
          paper.facultyName ||
          paper.fullName ||
          paper.name ||
          "Faculty";

        if (typeof paper.facultyId === "object") {
          userId =
            paper.facultyId?.userId ||
            paper.facultyId?._id;

          facultyName =
            paper.facultyId?.fullName ||
            paper.facultyId?.name ||
            facultyName;
        } else {
          userId =
            paper.facultyId ||
            paper.userId;
        }

        if (!userId) return;

        const key = String(userId);

        if (!facultyMap[key]) {
          facultyMap[key] = {
            userId: key,
            name: facultyName,
            department:
              paper.department || "—",
            publications: 0,
            profilePic: null,
          };
        }

        facultyMap[key].publications += 1;
      });

      const facultyList =
        Object.values(facultyMap)
          .sort(
            (a, b) =>
              b.publications -
              a.publications
          )
          .slice(0, 5);

      const enrichedFaculty =
        await Promise.all(
          facultyList.map(async (faculty) => {
            try {

              // IMPORTANT:
              // Use the same API path style as the rest
              // of your PrincipalDashboard.
              const response = await axios.get(
                `/api/faculty/${faculty.userId}`
              );

              console.log(
                "PROFILE RESPONSE:",
                faculty.userId,
                response.data
              );

              const profile =
                response.data?.faculty ||
                response.data?.user ||
                response.data;

              console.log(
                "PROFILE OBJECT:",
                profile
              );

              return {
                ...faculty,

                name:
                  profile?.fullName ||
                  profile?.name ||
                  faculty.name,

                department:
                  profile?.department ||
                  faculty.department,

                profilePic:
                  profile?.profilePic ||
                  profile?.profilePicture ||
                  profile?.profileImage ||
                  profile?.avatar ||
                  profile?.image ||
                  null,
              };

            } catch (error) {

              console.error(
                `Failed to load profile for ${faculty.userId}`,
                error
              );

              return faculty;
            }
          })
        );

      console.log(
        "TOP RESEARCH FACULTY:",
        enrichedFaculty
      );

      setTopResearchFaculty(
        enrichedFaculty
      );

    } catch (error) {

      console.error(
        "Error loading top research faculty:",
        error
      );

      setTopResearchFaculty([]);

    }
  };

  if (approvedPids.length > 0) {
    loadTopResearchFaculty();
  } else {
    setTopResearchFaculty([]);
  }

}, [approvedPids]);
/* =========================================================
     FETCH NOTIFICATIONS
  ========================================================= */

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const res = await axios.get(
        `/api/notifications/${userId}?role=principal`
      );

      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );
    }
  };

  const fetchNotificationCount = async () => {
    if (!userId) return;

    try {
      const res = await axios.get(
        `/api/auth/notifications/unread-count/${userId}`
      );

      setNotifCount(
        Number(res.data?.count || 0)
      );
    } catch (error) {
      console.error(
        "Notification count error:",
        error
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();

    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  /* =========================================================
     FETCH APPROVED PUBLICATIONS
  ========================================================= */

  const fetchApprovedPids = async () => {
    try {
      setLoadingPids(true);

      const res = await axios.get(
        "/api/principal/approved-papers"
      );

      setApprovedPids(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Approved publication fetch error:",
        error
      );

      setApprovedPids([]);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load approved publications.",
      });
    } finally {
      setLoadingPids(false);
    }
  };

  useEffect(() => {
    fetchApprovedPids();
  }, []);


  const facultyCount = useMemo(() => {
    const facultyIds = new Set();

    approvedPids.forEach((paper) => {
      let facultyId = null;

      if (
        typeof paper.facultyId === "object"
      ) {
        facultyId =
          paper.facultyId?.userId ||
          paper.facultyId?._id;
      } else {
        facultyId =
          paper.facultyId ||
          paper.userId;
      }

      if (facultyId) {
        facultyIds.add(
          String(facultyId)
        );
      }
    });

    return facultyIds.size;
  }, [approvedPids]);

  /* =========================================================
     DEPARTMENT-WISE RESEARCH DATA
  ========================================================= */

  const departmentData = useMemo(() => {
    const departments = {};

    approvedPids.forEach((paper) => {
      const name =
        paper.department ||
        "Unknown";

      if (!departments[name]) {
        departments[name] = {
          department: name,
          faculty: new Set(),
          publications: 0,
        };
      }

      departments[name].publications += 1;

      let facultyId = null;

      if (
        typeof paper.facultyId === "object"
      ) {
        facultyId =
          paper.facultyId?.userId ||
          paper.facultyId?._id;
      } else {
        facultyId =
          paper.facultyId ||
          paper.userId;
      }

      if (facultyId) {
        departments[name].faculty.add(
          String(facultyId)
        );
      }
    });

    return Object.values(departments)
      .map((item) => ({
        department:
          item.department,

        faculty:
          item.faculty.size,

        publications:
          item.publications,
      }))
      .sort(
        (a, b) =>
          b.publications -
          a.publications
      );
  }, [approvedPids]);

  /* =========================================================
     DEPARTMENT COUNT
  ========================================================= */

  const departmentCount =
    departmentData.length;

  /* =========================================================
     PUBLICATION COUNT
  ========================================================= */

  const publicationCount =
    approvedPids.length;

  /* =========================================================
     ACTIVE RESEARCH DEPARTMENTS
  ========================================================= */

  const activeDepartmentCount =
    departmentData.filter(
      (department) =>
        department.publications > 0
    ).length;

  /* =========================================================
     RECENT NOTIFICATIONS
  ========================================================= */

  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(0, 4);
  }, [notifications]);

  /* =========================================================
     GREETING
  ========================================================= */

  const greeting = useMemo(() => {
    const hour =
      new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 17) {
      return "Good Afternoon";
    }

    return "Good Evening";
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNavigation = async (
    section
  ) => {
    if (section === "logout") {
      const result =
        await Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to log out?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText:
            "Yes, log me out",
          cancelButtonText:
            "Cancel",
          confirmButtonColor:
            "#2563eb",
          cancelButtonColor:
            "#ef4444",
        });

      if (result.isConfirmed) {
        localStorage.clear();

        await Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have successfully logged out!",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/login");
      }

      return;
    }

    setActiveSection(section);
    setSidebarOpen(false);
  };

  /* =========================================================
     NOTIFICATION CLICK
  ========================================================= */

  const handleNotificationClick =
    async () => {
      setActiveSection(
        "notifications"
      );

      setSidebarOpen(false);

      if (!userId) return;

      try {
        await axios.put(
          `/api/auth/notifications/mark-read/${userId}`
        );

        setNotifCount(0);

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );
      } catch (error) {
        console.error(
          "Unable to mark notifications as read:",
          error
        );
      }
    };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatNotificationDate = (
    date
  ) => {
    if (!date) return "";

    const formattedDate =
      new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "";
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     PROFILE IMAGE
  ========================================================= */

  const profileImage =
    principalProfile?.profilePic
      ? `/${principalProfile.profilePic}`
      : "/default-profile.png";

  /* =========================================================
     DASHBOARD
  ========================================================= */

  const renderDashboard = () => {
    return (
      <div className="hod-home">

        {/* ===================================================
            WELCOME
        =================================================== */}

        <section className="hod-welcome-section">

          <div className="hod-welcome-content">

            <div>

              <p className="hod-eyebrow">
                Institutional Research Management
              </p>

              <h1>
                {greeting},{" "}
                {principalProfile?.fullName ||
                  "Principal"}{" "}

                <span className="wave">
                  👋
                </span>
              </h1>

              <p className="hod-welcome-subtitle">
                Here's an overview of research
                activities and publications
                across all departments of the
                institution.
              </p>

            </div>

            <div className="department-badge">

              <span className="department-icon">
                🏛️
              </span>

              <div>

                <small>
                  Scope
                </small>

                <strong>
                  All Departments
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <section className="hod-summary-grid">

          {/* FACULTY */}

          <div
            className="hod-summary-card faculty1-card"
            onClick={() =>
              handleNavigation(
                "faculty-details"
              )
            }
          >

            <div className="summary-card-top">

              <div className="summary-icon">
                👥
              </div>

              <span className="summary-arrow">
                →
              </span>

            </div>

            <div className="summary-label">
              Research Faculty
            </div>

            <div className="summary-value">
              {loadingPids
                ? "..."
                : facultyCount}
            </div>

            <div className="summary-description">
              Faculty with approved research
            </div>

          </div>

          {/* DEPARTMENTS */}

          <div
            className="hod-summary-card pending-card"
            onClick={() =>
              handleNavigation(
                "hod-details"
              )
            }
          >

            <div className="summary-card-top">

              <div className="summary-icon">
                🏛️
              </div>

              <span className="summary-arrow">
                →
              </span>

            </div>

            <div className="summary-label">
              Departments
            </div>

            <div className="summary-value">
              {loadingPids
                ? "..."
                : departmentCount}
            </div>

            <div className="summary-description">
              Departments with research activity
            </div>

          </div>

          {/* PUBLICATIONS */}

          <div
            className="hod-summary-card approved-card"
            onClick={() =>
              handleNavigation(
                "published-papers"
              )
            }
          >

            <div className="summary-card-top">

              <div className="summary-icon">
                📚
              </div>

              <span className="summary-arrow">
                →
              </span>

            </div>

            <div className="summary-label">
              Publications
            </div>

            <div className="summary-value">
              {loadingPids
                ? "..."
                : publicationCount}
            </div>

            <div className="summary-description">
              Approved research publications
            </div>

          </div>

          {/* NOTIFICATIONS */}

          <div
            className="hod-summary-card research-card"
            onClick={
              handleNotificationClick
            }
          >

            <div className="summary-card-top">

              <div className="summary-icon">
                🔔
              </div>

              <span className="summary-arrow">
                →
              </span>

            </div>

            <div className="summary-label">
              Notifications
            </div>

            <div className="summary-value">
              {notifCount}
            </div>

            <div className="summary-description">
              Unread notifications
            </div>

          </div>

        </section>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="hod-section">

          <div className="hod-section-header">

            <div>

              <h2>
                Quick Actions
              </h2>

              <p>
                Access institution-wide
                research management areas
              </p>

            </div>

          </div>

          <div className="hod-quick-actions">

            {/* FACULTY */}

            <button
              className="quick-action-card"
              onClick={() =>
                handleNavigation(
                  "faculty-details"
                )
              }
            >

              <span className="quick-action-icon purple">
                👥
              </span>

              <span className="quick-action-text">

                <strong>
                  Faculty Directory
                </strong>

                <small>
                  View faculty across all departments
                </small>

              </span>

              <span className="quick-action-arrow">
                →
              </span>

            </button>

            {/* UID APPROVAL */}

<button
  className="quick-action-card"
  onClick={() =>
    handleNavigation("uid-approval")
  }
>
  <span className="quick-action-icon purple">
    <FiCheckCircle />
  </span>

  <span className="quick-action-text">
    <strong>
      Pending <br/> UID Approval
    </strong>

    <small>
      Review and approve UID requests
    </small>
  </span>

  <span className="quick-action-arrow">
    →
  </span>
</button>

            {/* HOD */}

            <button
              className="quick-action-card"
              onClick={() =>
                handleNavigation(
                  "hod-details"
                )
              }
            >

              <span className="quick-action-icon green">
                👨‍💼
              </span>

              <span className="quick-action-text">

                <strong>
                  HOD Details
                </strong>

                <small>
                  View department heads
                </small>

              </span>

              <span className="quick-action-arrow">
                →
              </span>

            </button>

            {/* PUBLICATIONS */}

            <button
              className="quick-action-card"
              onClick={() =>
                handleNavigation(
                  "published-papers"
                )
              }
            >

              <span className="quick-action-icon blue">
                📚
              </span>

              <span className="quick-action-text">

                <strong>
                  Published <br/> Research Papers
                </strong>

                <small>
                  Explore institutional publications
                </small>

              </span>

              <span className="quick-action-arrow">
                →
              </span>

            </button>

            {/* ANALYTICS */}

            <button
              className="quick-action-card"
              onClick={() =>
                handleNavigation(
                  "analytics"
                )
              }
            >

              <span className="quick-action-icon orange">
                📊
              </span>

              <span className="quick-action-text">

                <strong>
                  Research Analytics
                </strong>

                <small>
                  Compare all departments
                </small>

              </span>

              <span className="quick-action-arrow">
                →
              </span>

            </button>

          </div>

        </section>

        {/* ===================================================
            ANALYTICS GRID
        =================================================== */}

        <section className="hod-analytics-grid">

          {/* RESEARCH OVERVIEW */}

          <div className="hod-panel uid-overview-panel">

            <div className="hod-panel-header">

              <div>

                <h2>
                  Institutional Research
                </h2>

                <p>
                  Overall research activity
                  across the institution
                </p>

              </div>

              <span className="panel-icon">
                📊
              </span>

            </div>

            <div className="uid-overview-content">

              <div className="approval-circle">

                <div
                  className="approval-circle-progress"
                  style={{
                    "--approval": "360deg",
                  }}
                >

                  <div className="approval-circle-inner">

                    <strong>
                      {publicationCount}
                    </strong>

                    <span>
                      Publications
                    </span>

                  </div>

                </div>

              </div>

              <div className="uid-stat-list">

                <div className="uid-stat-item">

                  <div className="uid-stat-label">

                    <span className="status-dot approved-dot"></span>

                    Research Faculty

                  </div>

                  <strong>
                    {facultyCount}
                  </strong>

                </div>

                <div className="uid-stat-item">

                  <div className="uid-stat-label">

                    <span className="status-dot pending-dot"></span>

                    Departments

                  </div>

                  <strong>
                    {departmentCount}
                  </strong>

                </div>

                <div className="uid-stat-item total-stat">

                  <div className="uid-stat-label">
                    Active Departments
                  </div>

                  <strong>
                    {activeDepartmentCount}
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* DEPARTMENT SNAPSHOT */}

          <div className="hod-panel department-snapshot-panel">

            <div className="hod-panel-header">

              <div>

                <h2>
                  Department Snapshot
                </h2>

                <p>
                  Research activity by department
                </p>

              </div>

              <span className="panel-icon">
                🏛️
              </span>

            </div>

            <div className="snapshot-list">

              {departmentData.length === 0 ? (

                <div className="empty-notifications">

                  <div className="empty-notification-icon">
                    📚
                  </div>

                  <h3>
                    No research data
                  </h3>

                  <p>
                    Department research activity
                    will appear here.
                  </p>

                </div>

              ) : (

                departmentData
                  .slice(0, 5)
                  .map(
                    (department) => (

                      <div
                        className="snapshot-item"
                        key={
                          department.department
                        }
                      >

                        <div className="snapshot-icon faculty-bg">
                          🏛️
                        </div>

                        <div className="snapshot-info">

                          <span>
                            {
                              department.department
                            }
                          </span>

                          <small>
                            {
                              department.faculty
                            }{" "}
                            faculty ·{" "}
                            {
                              department.publications
                            }{" "}
                            publications
                          </small>

                        </div>

                        <strong>
                          {
                            department.publications
                          }
                        </strong>

                      </div>

                    )
                  )

              )}

            </div>

            {departmentData.length > 5 && (
              <button
                className="panel-link-button"
                onClick={() =>
                  handleNavigation(
                    "analytics"
                  )
                }
              >
                View Analytics
                <span>→</span>
              </button>
            )}

          </div>

        </section>

        {/* ===================================================
            RESEARCH MANAGEMENT OVERVIEW
        =================================================== */}

        <section className="hod-panel workflow-panel">

          <div className="hod-panel-header">

            <div>

              <h2>
                Institutional Research Management
              </h2>

              <p>
                Overview of the research management
                structure across departments
              </p>

            </div>

            <span className="panel-icon">
              🎓
            </span>

          </div>

          <div className="workflow-container">

            <div className="workflow-step completed">

              <div className="workflow-number">
                1
              </div>

              <div>

                <strong>
                  Faculty Research
                </strong>

                <span>
                  Faculty members contribute
                  research and publications.
                </span>

              </div>

            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step completed">

              <div className="workflow-number">
                2
              </div>

              <div>

                <strong>
                  Department Monitoring
                </strong>

                <span>
                  HODs monitor research within
                  their respective departments.
                </span>

              </div>

            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step completed">

              <div className="workflow-number">
                3
              </div>

              <div>

                <strong>
                  R&D Coordination
                </strong>

                <span>
                  Research activities are coordinated
                  institution-wide.
                </span>

              </div>

            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step active-step">

              <div className="workflow-number">
                4
              </div>

              <div>

                <strong>
                  Principal Oversight
                </strong>

                <span>
                  Institution-wide research progress
                  is monitored by the Principal.
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            RECENT NOTIFICATIONS
        =================================================== */}

        <section className="hod-panel notifications-preview">

          <div className="hod-panel-header">

            <div>

              <h2>
                Recent Notifications
              </h2>

              <p>
                Latest updates related to your account
              </p>

            </div>

            <button
              className="view-all-button"
              onClick={
                handleNotificationClick
              }
            >
              View All →
            </button>

          </div>

          {recentNotifications.length ===
          0 ? (

            <div className="empty-notifications">

              <div className="empty-notification-icon">
                🔔
              </div>

              <h3>
                No recent notifications
              </h3>

              <p>
                You're all caught up.
                New updates will appear here.
              </p>

            </div>

          ) : (

            <div className="recent-notification-list">

              {recentNotifications.map(
                (notification, index) => (

                  <div
                    className={`recent-notification-item ${
                      notification.isRead
                        ? "read"
                        : "unread"
                    }`}
                    key={
                      notification._id ||
                      index
                    }
                  >

                    <div className="notification-status-icon">

                      {notification.isRead
                        ? "✓"
                        : "•"}

                    </div>

                    <div className="notification-content">

                      <p>
                        {notification.message ||
                          notification.title ||
                          "New notification"}
                      </p>

                      <span>
                        {formatNotificationDate(
                          notification.createdAt
                        )}
                      </span>

                    </div>

                    {!notification.isRead && (
                      <span className="new-label">
                        NEW
                      </span>
                    )}

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>
    );
  };
  /* =========================================================
   ANALYTICS CHART DATA
========================================================= */

/* ---------- Monthly publication data ---------- */

const monthlyPublicationData = useMemo(() => {
  const months = {};

  approvedPids.forEach((paper) => {
    const rawDate =
      paper.uploadedAt ||
      paper.publicationDate ||
      paper.submittedAt ||
      paper.createdAt;

    if (!rawDate) return;

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const label = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!months[key]) {
      months[key] = {
        key,
        month: label,
        publications: 0,
      };
    }

    months[key].publications += 1;
  });

  return Object.values(months)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((item, index, arr) => ({
      ...item,
      cumulative:
        arr
          .slice(0, index + 1)
          .reduce(
            (sum, current) =>
              sum + current.publications,
            0
          ),
    }));
}, [approvedPids]);


/* ---------- Publication type data ---------- */

const publicationTypeData = useMemo(() => {
  const types = {
    Journal: 0,
    Conference: 0,
    Book: 0,
    Patent: 0,
  };

  approvedPids.forEach((paper) => {
    const rawType =
      paper.type ||
      paper.publicationType ||
      paper.category;

    if (!rawType) return;

    const type = String(rawType).trim().toLowerCase();

    if (type.includes("journal")) {
      types.Journal += 1;
    } else if (type.includes("conference")) {
      types.Conference += 1;
    } else if (type.includes("book")) {
      types.Book += 1;
    } else if (type.includes("patent")) {
      types.Patent += 1;
    }
  });

  return Object.entries(types).map(
    ([type, count]) => ({
      type,
      count,
    })
  );
}, [approvedPids]);


/* ---------- Department + publication type ---------- */

const departmentTypeData = useMemo(() => {
  const departments = {};

  approvedPids.forEach((paper) => {
    const department =
      paper.department || "Unknown";

    if (!departments[department]) {
      departments[department] = {
        department,
        Journal: 0,
        Conference: 0,
        Book: 0,
        Patent: 0,
      };
    }

    const rawType =
      paper.type ||
      paper.publicationType ||
      paper.category ||
      "";

    const type = String(rawType)
      .toLowerCase();

    if (type.includes("journal")) {
      departments[department].Journal += 1;
    } else if (type.includes("conference")) {
      departments[department].Conference += 1;
    } else if (type.includes("book")) {
      departments[department].Book += 1;
    } else if (type.includes("patent")) {
      departments[department].Patent += 1;
    }
  });

  return Object.values(departments);
}, [approvedPids]);


/* ---------- Radar data ---------- */

const radarData = useMemo(() => {
  return departmentData.map((item) => ({
    department: item.department,
    Publications: item.publications,
    Faculty: item.faculty,
    Activity:
      item.publications + item.faculty,
  }));
}, [departmentData]);


/* ---------- Combined department data ---------- */

const combinedDepartmentData = useMemo(() => {
  return departmentData.map((item) => ({
    department: item.department,
    publications: item.publications,
    faculty: item.faculty,
  }));
}, [departmentData]);


/* ---------- Scatter data ---------- */

const scatterData = useMemo(() => {
  return departmentData.map((item) => ({
    faculty: item.faculty,
    publications: item.publications,
    department: item.department,
  }));
}, [departmentData]);


/* ---------- Publication share ---------- */

const publicationShareData = useMemo(() => {
  return departmentData.map((item) => ({
    department: item.department,
    publications: item.publications,
  }));
}, [departmentData]);


/* ---------- Research activity ---------- */

const researchActivityData = useMemo(() => {
  return departmentData.map((item) => ({
    department: item.department,
    publications: item.publications,
    faculty: item.faculty,
    activity:
      item.publications * 2 +
      item.faculty,
  }));
}, [departmentData]);


/* ---------- Average ---------- */

const analyticsAveragePublications =
  departmentData.length > 0
    ? (
        publicationCount /
        departmentData.length
      ).toFixed(1)
    : "0";


const renderAnalytics = () => {
  return (
    <div className="pa-analytics-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="pa-overview-header">

        <div>
          <div className="pa-overview-eyebrow">
            PRINCIPAL • RESEARCH INTELLIGENCE
          </div>

          <h1>Research Analytics</h1>

          <p>
            Institution-wide research performance, publication activity,
            department productivity and research trends.
          </p>
        </div>

        <div className="pa-live-status">
          <span className="pa-live-dot"></span>
          Live Research Overview
        </div>

      </div>


      {/* =====================================================
          MAIN DASHBOARD GRID
      ===================================================== */}

      <div className="pa-main-dashboard-grid">

        {/* -------------------------------------------------
            LARGE PUBLICATION TREND
        ------------------------------------------------- */}

        <div className="pa-dashboard-card pa-trend-card">

          <div className="pa-card-heading">

            <div>
              <span className="pa-card-kicker">
                RESEARCH ACTIVITY
              </span>

              <h2>Publication Trend</h2>

              <p>
                Monthly research publication activity across
                the institution.
              </p>
            </div>

            <div className="pa-card-mini-stat">
              <span>Total</span>
              <strong>{publicationCount}</strong>
            </div>

          </div>

          <div className="pa-main-chart">

            {monthlyPublicationData.length > 0 ? (

              <AreaChart
                width={760}
                height={320}
                data={monthlyPublicationData}
              >

                <defs>

                  <linearGradient
                    id="paPublicationGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#6366f1"
                      stopOpacity={0.42}
                    />

                    <stop
                      offset="100%"
                      stopColor="#6366f1"
                      stopOpacity={0.03}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="4 5"
                  vertical={false}
                  stroke="#e8edf5"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="publications"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#paPublicationGradient)"
                  dot={{
                    r: 4,
                    fill: "#6366f1",
                    strokeWidth: 2,
                    stroke: "#ffffff",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              </AreaChart>

            ) : (

              <div className="pa-empty-state">
                No publication trend data available.
              </div>

            )}

          </div>

        </div>


        {/* =================================================
            KPI STACK
        ================================================= */}

        <div className="pa-kpi-stack">

          {/* TOTAL PUBLICATIONS */}

          <div className="pa-kpi-card pa-kpi-purple">

            <div className="pa-kpi-top">

              <div className="pa-kpi-icon">
                📚
              </div>

              <span className="pa-kpi-label">
                TOTAL PUBLICATIONS
              </span>

            </div>

            <strong>{publicationCount}</strong>

            <p>
              Approved research publications
            </p>

            <div className="pa-kpi-decoration"></div>

          </div>


          {/* RESEARCH FACULTY */}

          <div className="pa-kpi-card pa-kpi-blue">

            <div className="pa-kpi-top">

              <div className="pa-kpi-icon">
                👨‍🏫
              </div>

              <span className="pa-kpi-label">
                RESEARCH FACULTY
              </span>

            </div>

            <strong>{facultyCount}</strong>

            <p>
              Faculty with approved publications
            </p>

            <div className="pa-kpi-decoration"></div>

          </div>


          {/* DEPARTMENTS */}

          <div className="pa-kpi-card pa-kpi-cyan">

            <div className="pa-kpi-top">

              <div className="pa-kpi-icon">
                🏢
              </div>

              <span className="pa-kpi-label">
                ACTIVE DEPARTMENTS
              </span>

            </div>

            <strong>{activeDepartmentCount}</strong>

            <p>
              Departments with research activity
            </p>

            <div className="pa-kpi-decoration"></div>

          </div>


          {/* AVERAGE */}

          <div className="pa-kpi-card pa-kpi-orange">

            <div className="pa-kpi-top">

              <div className="pa-kpi-icon">
                📈
              </div>

              <span className="pa-kpi-label">
                AVG. PUBLICATIONS
              </span>

            </div>

            <strong>{analyticsAveragePublications}</strong>

            <p>
              Average publications per department
            </p>

            <div className="pa-kpi-decoration"></div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SECOND ROW
      ===================================================== */}

      <div className="pa-two-column-grid">

        {/* =================================================
            DEPARTMENT PERFORMANCE
        ================================================= */}

        <div className="pa-dashboard-card">

          <div className="pa-card-heading">

            <div>
              <span className="pa-card-kicker">
                DEPARTMENT ANALYSIS
              </span>

              <h2>Department Performance</h2>

              <p>
                Publications and research faculty by department.
              </p>
            </div>

          </div>


          <div className="pa-department-list">

            {departmentData.length > 0 ? (

              departmentData.map((department, index) => {

                const maxPublication =
                  departmentData[0]?.publications || 1;

                const percentage =
                  (department.publications /
                    maxPublication) *
                  100;

                return (
                  <div
                    className="pa-department-row"
                    key={department.department}
                  >

                    <div className="pa-department-info">

                      <div className="pa-department-rank">
                        {index + 1}
                      </div>

                      <div>
                        <strong>
                          {department.department}
                        </strong>

                        <span>
                          {department.faculty} research faculty
                        </span>
                      </div>

                    </div>


                    <div className="pa-department-progress">

                      <div className="pa-progress-track">

                        <div
                          className="pa-progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>


                    <div className="pa-department-total">
                      {department.publications}
                    </div>

                  </div>
                );
              })

            ) : (

              <div className="pa-empty-small">
                No department data available.
              </div>

            )}

          </div>

        </div>


        {/* =================================================
            PUBLICATION DISTRIBUTION
        ================================================= */}

        <div className="pa-dashboard-card pa-distribution-card">

          <div className="pa-card-heading">

            <div>
              <span className="pa-card-kicker">
                PUBLICATION MIX
              </span>

              <h2>Publication Distribution</h2>

              <p>
                Distribution of approved publications
                across departments.
              </p>
            </div>

          </div>


          <div className="pa-donut-area">

            {publicationShareData.length > 0 ? (

              <PieChart
                width={390}
                height={290}
              >

                <Pie
                  data={publicationShareData}
                  dataKey="publications"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={105}
                  paddingAngle={3}
                  stroke="#ffffff"
                  strokeWidth={3}
                >

                  {publicationShareData.map(
                    (entry, index) => (

                      <Cell
                        key={`pa-cell-${index}`}
                        fill={
                          [
                            "#6366f1",
                            "#06b6d4",
                            "#8b5cf6",
                            "#f59e0b",
                            "#10b981",
                            "#ec4899",
                            "#3b82f6",
                            "#14b8a6",
                          ][index % 8]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />

              </PieChart>

            ) : (

              <div className="pa-empty-state">
                No distribution data available.
              </div>

            )}

          </div>

        </div>

      </div>

{/* =====================================================
    TOP RESEARCH FACULTY
===================================================== */}

<div className="pa-dashboard-card pa-top-faculty-card">

  <div className="pa-card-heading">

    <div>
      <span className="pa-card-kicker">
        RESEARCH LEADERS
      </span>

      <h2>Top Research Faculty</h2>

      <p>
        Faculty with the highest number of approved
        research publications.
      </p>
    </div>

    <div className="pa-top-faculty-count">
      TOP {topResearchFaculty.length}
    </div>

  </div>


  <div className="pa-top-faculty-list">

   {topResearchFaculty.length > 0 ? (

  topResearchFaculty.map((faculty, index) => {
    console.log("FACULTY DATA:", faculty);
console.log("PROFILE PIC:", faculty.profilePic);

    const rankClass =
      index === 0
        ? "pa-rank-first"
        : index === 1
        ? "pa-rank-second"
        : index === 2
        ? "pa-rank-third"
        : "";

    const topPublications =
      topResearchFaculty[0]?.publications || 1;

    const percentage = Math.min(
      (faculty.publications / topPublications) * 100,
      100
    );

    let activityStatus = "CONTRIBUTOR";
    let activityClass = "pa-status-contributor";

    if (percentage >= 80) {
      activityStatus = "HIGH ACTIVITY";
      activityClass = "pa-status-high";
    } else if (percentage >= 40) {
      activityStatus = "ACTIVE";
      activityClass = "pa-status-active";
    }

    return (
      <div
        className={`pa-top-faculty-row ${rankClass}`}
        key={faculty.userId}
      >

        {/* =========================
            RANK
        ========================= */}

        <div className="pa-faculty-rank">
          {String(index + 1).padStart(2, "0")}
        </div>


        {/* =========================
            PROFILE IMAGE
        ========================= */}

       <div className="pa-faculty-avatar">

  {faculty.profilePic ? (
    <img
     src={
  faculty.profilePic.startsWith("http")
    ? faculty.profilePic
    : faculty.profilePic
}
      alt={faculty.name}
      onError={(e) => {
        e.currentTarget.style.display = "none";

        if (e.currentTarget.nextElementSibling) {
          e.currentTarget.nextElementSibling.style.display = "flex";
        }
      }}
    />
  ) : null}

  <span
    style={{
      display: faculty.profilePic ? "none" : "flex",
    }}
  >
    {faculty.name?.charAt(0)?.toUpperCase() || "F"}
  </span>

</div>


        {/* =========================
            FACULTY INFORMATION
        ========================= */}

        <div className="pa-faculty-info">

          <strong>
            {faculty.name}
          </strong>

          <div className="pa-faculty-id">
            ID: {faculty.userId}
          </div>

          <span>
            {faculty.department}
          </span>

        </div>


        {/* =========================
            PUBLICATIONS
        ========================= */}

        <div className="pa-faculty-publications">

          <strong>
            {String(faculty.publications).padStart(2, "0")}
          </strong>

          <span>
            APPROVED
          </span>

        </div>


        {/* =========================
            ACTIVITY
        ========================= */}

        <div className="pa-faculty-progress">

          <div className="pa-faculty-progress-header">

            <span>
              Research contribution
            </span>

            <strong>
              {Math.round(percentage)}%
            </strong>

          </div>


          <div className="pa-faculty-progress-track">

            <div
              className="pa-faculty-progress-fill"
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>


          <div
            className={`pa-faculty-status ${activityClass}`}
          >
            <span className="pa-status-dot"></span>

            {activityStatus}

          </div>

        </div>

      </div>
    );
  })

) : (

  <div className="pa-empty-small">
    No research faculty data available.
  </div>

)}

  </div>

</div>
      {/* =====================================================
          THIRD ROW
      ===================================================== */}

      <div className="pa-two-column-grid">

        {/* =================================================
            PUBLICATION TYPES
        ================================================= */}

        <div className="pa-dashboard-card">

          <div className="pa-card-heading">

            <div>
              <span className="pa-card-kicker">
                PUBLICATION TYPES
              </span>

              <h2>Research Output Mix</h2>

              <p>
                Approved publications grouped by research type.
              </p>
            </div>

          </div>


          <div className="pa-type-chart">

            <BarChart
              width={600}
              height={300}
              data={publicationTypeData}
            >

              <CartesianGrid
                strokeDasharray="4 5"
                vertical={false}
                stroke="#e8edf5"
              />

              <XAxis
                dataKey="type"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
              />

              <Tooltip />

              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                barSize={42}
                fill="#6366f1"
              />

            </BarChart>

          </div>

        </div>


        {/* =================================================
            FACULTY / PUBLICATIONS COMPARISON
        ================================================= */}

        <div className="pa-dashboard-card">

          <div className="pa-card-heading">

            <div>
              <span className="pa-card-kicker">
                RESEARCH CAPACITY
              </span>

              <h2>Faculty vs Publications</h2>

              <p>
                Comparison of research faculty and publication
                output by department.
              </p>
            </div>

          </div>


          <div className="pa-type-chart">

            <BarChart
              width={600}
              height={300}
              data={combinedDepartmentData}
            >

              <CartesianGrid
                strokeDasharray="4 5"
                vertical={false}
                stroke="#e8edf5"
              />

              <XAxis
                dataKey="department"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
              />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="faculty"
                name="Faculty"
                fill="#06b6d4"
                radius={[7, 7, 0, 0]}
                barSize={24}
              />

              <Bar
                dataKey="publications"
                name="Publications"
                fill="#8b5cf6"
                radius={[7, 7, 0, 0]}
                barSize={24}
              />

            </BarChart>

          </div>

        </div>

      </div>


      {/* =====================================================
          RESEARCH ACTIVITY TABLE
      ===================================================== */}

      <div className="pa-dashboard-card pa-activity-card">

        <div className="pa-card-heading">

          <div>
            <span className="pa-card-kicker">
              RESEARCH PERFORMANCE
            </span>

            <h2>Department Research Activity</h2>

            <p>
              Research activity overview across active departments.
            </p>
          </div>

          <div className="pa-total-badge">
            {departmentCount} Departments
          </div>

        </div>


        <div className="pa-activity-table">

          <div className="pa-activity-header">
            <span>Department</span>
            <span>Research Faculty</span>
            <span>Publications</span>
            <span>Activity</span>
          </div>


          {researchActivityData.map(
            (item, index) => {

              const maxActivity =
                Math.max(
                  ...researchActivityData.map(
                    (x) => x.activity
                  ),
                  1
                );

              const activityWidth =
                (item.activity /
                  maxActivity) *
                100;

              return (
                <div
                  className="pa-activity-row"
                  key={item.department}
                >

                  <div className="pa-activity-dept">

                    <span className="pa-activity-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <strong>
                      {item.department}
                    </strong>

                  </div>


                  <span className="pa-table-number">
                    {item.faculty}
                  </span>


                  <span className="pa-table-number">
                    {item.publications}
                  </span>


                  <div className="pa-activity-bar-area">

                    <div className="pa-activity-track">

                      <div
                        className="pa-activity-fill"
                        style={{
                          width: `${activityWidth}%`,
                        }}
                      />

                    </div>

                    <span>
                      {item.activity}
                    </span>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* =====================================================
          BOTTOM INSIGHTS
      ===================================================== */}

      <div className="pa-bottom-grid">

        <div className="pa-highlight-card pa-highlight-purple">

          <div className="pa-highlight-icon">
            📊
          </div>

          <div>
            <span>PUBLICATION DENSITY</span>

            <strong>
              {analyticsAveragePublications}
            </strong>

            <p>
              Average publications per active department
            </p>
          </div>

        </div>


        <div className="pa-highlight-card pa-highlight-blue">

          <div className="pa-highlight-icon">
            👥
          </div>

          <div>
            <span>RESEARCH COMMUNITY</span>

            <strong>
              {facultyCount}
            </strong>

            <p>
              Faculty contributing to approved research
            </p>
          </div>

        </div>


        <div className="pa-highlight-card pa-highlight-orange">

          <div className="pa-highlight-icon">
            🏆
          </div>

          <div>
            <span>LEADING DEPARTMENT</span>

            <strong>
              {departmentData[0]?.department || "—"}
            </strong>

            <p>
              Highest approved publication count
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
  return (
    <div className="hod-dashboard">

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        ></div>
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "open"
            : ""
        }`}
      >

        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="sidebar-brand-icon">
            RP
          </div>

          <div>

            <strong>
              RPMS
            </strong>

            <span>
              Research Management
            </span>

          </div>

        </div>

        {/* ROLE */}

        <div className="sidebar-role">

          <span className="role-dot"></span>

          Principal Portal

        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-navigation">

          <p className="nav-section-title">
            MAIN
          </p>

          {/* DASHBOARD */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "dashboard"
              )
            }
          >

            <span className="sidebar-icon">
              ▣
            </span>

            <span>
              Dashboard
            </span>

          </button>

          {/* UID APPROVAL */}

          <button
            className={`sidebar-item ${
              activeSection === "uid-approval"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("uid-approval")
            }
          >
            <span className="sidebar-icon">
              <FiCheckCircle />
            </span>

            <span>
              UID Approval
            </span>
          </button>

          {/* PUBLISHED RESEARCH */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "published-papers"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "published-papers"
              )
            }
          >

            <span className="sidebar-icon">
              📚
            </span>

            <span>
              Published Research Papers
            </span>

            {publicationCount >
              0 && (
              <span className="sidebar-count">
                {publicationCount}
              </span>
            )}

          </button>

          {/* FACULTY */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "faculty-details"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "faculty-details"
              )
            }
          >

            <span className="sidebar-icon">
              👥
            </span>

            <span>
              Faculty
            </span>

          </button>

          {/* HOD DETAILS */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "hod-details"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "hod-details"
              )
            }
          >

            <span className="sidebar-icon">
              👨‍💼
            </span>

            <span>
              HOD Details
            </span>

          </button>

          {/* ANALYTICS */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "analytics"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "analytics"
              )
            }
          >

            <span className="sidebar-icon">
              📊
            </span>

            <span>
              Analytics
            </span>

          </button>

          <p className="nav-section-title account-title">
            ACCOUNT
          </p>

          {/* NOTIFICATIONS */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "notifications"
                ? "active"
                : ""
            }`}
            onClick={
              handleNotificationClick
            }
          >

            <span className="sidebar-icon">
              🔔
            </span>

            <span>
              Notifications
            </span>

            {notifCount >
              0 && (
              <span className="sidebar-count notification-count">
                {notifCount >
                9
                  ? "9+"
                  : notifCount}
              </span>
            )}

          </button>

          {/* PROFILE */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "profile"
              )
            }
          >

            <span className="sidebar-icon">
              👤
            </span>

            <span>
              Profile
            </span>

          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <img
              src={profileImage}
              alt="Principal"
              onError={(e) => {
                e.target.src =
                  "/default-profile.png";
              }}
            />

            <div>

              <strong>
                {principalProfile?.fullName ||
                  "Principal"}
              </strong>

              <span>
                Principal
              </span>

            </div>

          </div>

          <button
            className="sidebar-logout"
            onClick={() =>
              handleNavigation(
                "logout"
              )
            }
          >

            <span>
              ↪
            </span>

            Logout

          </button>

        </div>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="hod-main">

        {/* TOP HEADER */}

        <header className="hod-top-header">

          <button
            className="mobile-menu-btn"
            onClick={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className="header-title-area">

            <span className="header-page-label">

              {activeSection ===
              "dashboard"
                ? "Dashboard"
                 : activeSection ===
                "uid-approval"
              ? "UID Approval"
                : activeSection ===
                  "published-papers"
                ? "Published Research"
                : activeSection ===
                  "faculty-details"
                ? "Faculty"
                : activeSection ===
                  "hod-details"
                ? "HOD Details"
                : activeSection ===
                  "analytics"
                ? "Analytics"
                : activeSection ===
                  "notifications"
                ? "Notifications"
                : "Profile"}

            </span>

            <span className="header-separator">
              /
            </span>

            <span className="header-department">
              All Departments
            </span>

          </div>

          <div className="header-actions">

            {/* NOTIFICATION */}

            <button
              className="header-notification-button"
              onClick={
                handleNotificationClick
              }
              aria-label="Notifications"
            >

              🔔

              {notifCount >
                0 && (
                <span className="header-notification-badge">

                  {notifCount >
                  9
                    ? "9+"
                    : notifCount}

                </span>
              )}

            </button>

            {/* PROFILE */}

            <button
              className="header-profile-button"
              onClick={() =>
                handleNavigation(
                  "profile"
                )
              }
            >

              <img
                src={profileImage}
                alt="Profile"
                onError={(e) => {
                  e.target.src =
                    "/default-profile.png";
                }}
              />

              <div className="header-profile-info">

                <strong>
                  {principalProfile?.fullName ||
                    "Principal"}
                </strong>

                <span>
                  Principal
                </span>

              </div>

              <span className="profile-chevron">
                ▾
              </span>

            </button>

          </div>

        </header>

        {/* CONTENT */}

        <div className="hod-content">

          {loadingProfile &&
          !principalProfile ? (

            <div className="hod-loading">

              <div className="loading-spinner"></div>

              <p>
                Loading Principal dashboard...
              </p>

            </div>

          ) : profileError &&
            !principalProfile ? (

            <div className="hod-error">

              <div>
                ⚠️
              </div>

              <h3>
                Unable to load dashboard
              </h3>

              <p>
                {profileError}
              </p>

            </div>

          ) : (

            <>

              {/* DASHBOARD */}

              {activeSection ===
                "dashboard" &&
                renderDashboard()}

              {activeSection === "uid-approval" && (
  <PrincipalUidApproval />
)}

              {/* PUBLISHED RESEARCH */}

              {activeSection ===
                "published-papers" && (
                <PrincipalPublishedPapers
                  approvedPids={
                    approvedPids
                  }
                />
              )}

              {/* FACULTY */}

              {activeSection ===
                "faculty-details" && (
                <PrincipalFacultyHodSection
                  type="faculty"
                />
              )}

              {/* HOD */}

              {activeSection ===
                "hod-details" && (
                <PrincipalFacultyHodSection
                  type="hod"
                />
              )}

              {/* ANALYTICS */}

              {activeSection ===
                "analytics" &&
                renderAnalytics()}

              {/* NOTIFICATIONS */}

              {activeSection ===
                "notifications" && (
                <NotificationsSection
                  userId={userId}
                />
              )}

              {/* PROFILE */}

              {activeSection ===
                "profile" &&
                principalProfile && (
                  <ProfileSection
                    facultyDetails={
                      principalProfile
                    }
                  />
                )}

            </>

          )}

        </div>

      </main>

    </div>
  );
}