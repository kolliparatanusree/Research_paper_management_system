import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HodDashboard.css";
import RDDeanUidApproval from "./RDDeanUidApproval";
import {
  FiCheckCircle,
  FiFileText
} from "react-icons/fi";import axios from "axios";
import Swal from "sweetalert2";
import RDDeanDocumentApproval from "./RDDeanDocumentApproval";
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
  Area
} from "recharts";
import { API_BASE_URL } from "../config";
export default function RDDeanDashboard() {
  const navigate = useNavigate();

  /* =========================================================
     BASIC STATE
  ========================================================= */

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const userId = localStorage.getItem("userId");

  const [topResearchFaculty, setTopResearchFaculty] =
    useState([]);

  /* =========================================================
     PROFILE
  ========================================================= */

  const [rdDeanProfile, setRdDeanProfile] =
    useState(null);

    const getProfileImageUrl = (profilePic) => {
  if (!profilePic) return null;

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

  if (imagePath.startsWith("data:image")) {
    return imagePath;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;

  return `${cleanBase}${cleanPath}`;
};
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
        "No R&D Dean ID found. Please login again."
      );

      setLoadingProfile(false);
      return;
    }

    // const getProfileImageUrl = (profilePic) => {
    //   if (!profilePic) return null;

    //   if (typeof profilePic === "object") {
    //     profilePic =
    //       profilePic.url ||
    //       profilePic.path ||
    //       profilePic.filename ||
    //       profilePic.filePath ||
    //       "";
    //   }

    //   if (!profilePic) return null;

    //   const imagePath = String(profilePic).trim();

    //   if (imagePath.startsWith("data:image")) {
    //     return imagePath;
    //   }

    //   if (
    //     imagePath.startsWith("http://") ||
    //     imagePath.startsWith("https://")
    //   ) {
    //     return imagePath;
    //   }

    //   const baseUrl =
    //     API_BASE_URL;

    //   const cleanBase = baseUrl.replace(/\/$/, "");

    //   const cleanPath = imagePath.startsWith("/")
    //     ? imagePath
    //     : `/${imagePath}`;

    //   return `${cleanBase}${cleanPath}`;
    // };

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const res = await axios.get(
          `${API_BASE_URL}/api/faculty/${userId}`
        );

        const data = res.data;

        setRdDeanProfile({
          fullName:
            data.fullName ||
            data.name ||
            "R&D Dean",

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
            getProfileImageUrl(
              data.profilePic
            ) || "",
        });

        setProfileError(null);
      } catch (error) {
        console.error(
          "R&D Dean profile error:",
          error
        );

        setProfileError(
          "Failed to load R&D Dean profile."
        );

        Swal.fire({
          icon: "error",
          title: "Profile Error",
          text: "Failed to fetch R&D Dean profile.",
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userId]);

  /* =========================================================
     TOP RESEARCH FACULTY
  ========================================================= */

  useEffect(() => {
    const loadTopResearchFaculty = async () => {
      try {
        const facultyMap = {};

        approvedPids.forEach((paper) => {
          let facultyUserId = null;

          let facultyName =
            paper.facultyName ||
            paper.fullName ||
            paper.name ||
            "Faculty";

          if (
            typeof paper.facultyId === "object"
          ) {
            facultyUserId =
              paper.facultyId?.userId ||
              paper.facultyId?._id;

            facultyName =
              paper.facultyId?.fullName ||
              paper.facultyId?.name ||
              facultyName;
          } else {
            facultyUserId =
              paper.facultyId ||
              paper.userId;
          }

          if (!facultyUserId) return;

          const key =
            String(facultyUserId);

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
            facultyList.map(
              async (faculty) => {
                try {
                  const response =
                    await axios.get(
                      `${API_BASE_URL}/api/faculty/${faculty.userId}`
                    );

                  const profile =
                    response.data?.faculty ||
                    response.data?.user ||
                    response.data;

                  return {
                    ...faculty,

                    name:
                      profile?.fullName ||
                      profile?.name ||
                      faculty.name,

                    department:
                      profile?.department ||
                      faculty.department,

                    profilePic: getProfileImageUrl(
  profile?.profilePic ||
  profile?.profilePicture ||
  profile?.profileImage ||
  profile?.avatar ||
  profile?.image ||
  null
),
                  };
                } catch (error) {
                  console.error(
                    `Failed to load profile for ${faculty.userId}`,
                    error
                  );

                  return faculty;
                }
              }
            )
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
        `${API_BASE_URL}/api/notifications/${userId}?role=rdDean`
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
        `${API_BASE_URL}/api/auth/notifications/unread-count/${userId}`
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
        `${API_BASE_URL}/api/principal/approved-papers`
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

  /* =========================================================
     FACULTY COUNT
  ========================================================= */

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
          `${API_BASE_URL}/api/auth/notifications/mark-read/${userId}`
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
    rdDeanProfile?.profilePic
      ? rdDeanProfile.profilePic
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
                {rdDeanProfile?.fullName ||
                  "R&D Dean"}{" "}

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

            <button
              className="quick-action-card"
              onClick={() =>
                handleNavigation(
                  "uid-approval"
                )
              }
            >

              <span className="quick-action-icon purple">
                <FiCheckCircle />
              </span>

              <span className="quick-action-text">

                <strong>
                  Pending <br />
                  UID Approval
                </strong>

                <small>
                  Review and approve UID requests
                </small>

              </span>

              <span className="quick-action-arrow">
                →
              </span>

            </button>

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
                  Published <br />
                  Research Papers
                </strong>

                <small>
                  Explore institutional publications
                </small>

              </span>

              <span className="quick-action-arrow">
                →
              </span>

            </button>

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
                  R&D Dean Oversight
                </strong>

                <span>
                  Institution-wide research progress
                  is monitored by the R&D Dean.
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

      const label =
        date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            year: "numeric",
          }
        );

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
      .sort((a, b) =>
        a.key.localeCompare(b.key)
      )
      .map((item, index, arr) => ({
        ...item,
        cumulative:
          arr
            .slice(0, index + 1)
            .reduce(
              (sum, current) =>
                sum +
                current.publications,
              0
            ),
      }));
  }, [approvedPids]);

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

      const type = String(rawType)
        .trim()
        .toLowerCase();

      if (type.includes("journal")) {
        types.Journal += 1;
      } else if (
        type.includes("conference")
      ) {
        types.Conference += 1;
      } else if (
        type.includes("book")
      ) {
        types.Book += 1;
      } else if (
        type.includes("patent")
      ) {
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

  const departmentTypeData = useMemo(() => {
    const departments = {};

    approvedPids.forEach((paper) => {
      const department =
        paper.department ||
        "Unknown";

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

      const type =
        String(rawType).toLowerCase();

      if (type.includes("journal")) {
        departments[
          department
        ].Journal += 1;
      } else if (
        type.includes("conference")
      ) {
        departments[
          department
        ].Conference += 1;
      } else if (
        type.includes("book")
      ) {
        departments[
          department
        ].Book += 1;
      } else if (
        type.includes("patent")
      ) {
        departments[
          department
        ].Patent += 1;
      }
    });

    return Object.values(departments);
  }, [approvedPids]);

  const radarData = useMemo(() => {
    return departmentData.map(
      (item) => ({
        department:
          item.department,
        Publications:
          item.publications,
        Faculty:
          item.faculty,
        Activity:
          item.publications +
          item.faculty,
      })
    );
  }, [departmentData]);

  const combinedDepartmentData =
    useMemo(() => {
      return departmentData.map(
        (item) => ({
          department:
            item.department,
          publications:
            item.publications,
          faculty:
            item.faculty,
        })
      );
    }, [departmentData]);

  const scatterData = useMemo(() => {
    return departmentData.map(
      (item) => ({
        faculty: item.faculty,
        publications:
          item.publications,
        department:
          item.department,
      })
    );
  }, [departmentData]);

  const publicationShareData =
    useMemo(() => {
      return departmentData.map(
        (item) => ({
          department:
            item.department,
          publications:
            item.publications,
        })
      );
    }, [departmentData]);

  const researchActivityData =
    useMemo(() => {
      return departmentData.map(
        (item) => ({
          department:
            item.department,
          publications:
            item.publications,
          faculty:
            item.faculty,
          activity:
            item.publications * 2 +
            item.faculty,
        })
      );
    }, [departmentData]);

  const analyticsAveragePublications =
    departmentData.length > 0
      ? (
          publicationCount /
          departmentData.length
        ).toFixed(1)
      : "0";

  /* =========================================================
     ANALYTICS
  ========================================================= */

  const renderAnalytics = () => {
    return (
      <div className="pa-analytics-page">

        <div className="pa-overview-header">

          <div>

            <div className="pa-overview-eyebrow">
              R&D DEAN • RESEARCH INTELLIGENCE
            </div>

            <h1>
              Research Analytics
            </h1>

            <p>
              Institution-wide research performance,
              publication activity, department
              productivity and research trends.
            </p>

          </div>

          <div className="pa-live-status">

            <span className="pa-live-dot"></span>

            Live Research Overview

          </div>

        </div>

        <div className="pa-main-dashboard-grid">

          <div className="pa-dashboard-card pa-trend-card">

            <div className="pa-card-heading">

              <div>

                <span className="pa-card-kicker">
                  RESEARCH ACTIVITY
                </span>

                <h2>
                  Publication Trend
                </h2>

                <p>
                  Monthly research publication
                  activity across the institution.
                </p>

              </div>

              <div className="pa-card-mini-stat">

                <span>
                  Total
                </span>

                <strong>
                  {publicationCount}
                </strong>

              </div>

            </div>

            <div className="pa-main-chart">

              {monthlyPublicationData.length >
              0 ? (

                <AreaChart
                  width={760}
                  height={320}
                  data={
                    monthlyPublicationData
                  }
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

          <div className="pa-kpi-stack">

            <div className="pa-kpi-card pa-kpi-purple">

              <div className="pa-kpi-top">

                <div className="pa-kpi-icon">
                  📚
                </div>

                <span className="pa-kpi-label">
                  TOTAL PUBLICATIONS
                </span>

              </div>

              <strong>
                {publicationCount}
              </strong>

              <p>
                Approved research publications
              </p>

              <div className="pa-kpi-decoration"></div>

            </div>

            <div className="pa-kpi-card pa-kpi-blue">

              <div className="pa-kpi-top">

                <div className="pa-kpi-icon">
                  👨‍🏫
                </div>

                <span className="pa-kpi-label">
                  RESEARCH FACULTY
                </span>

              </div>

              <strong>
                {facultyCount}
              </strong>

              <p>
                Faculty with approved publications
              </p>

              <div className="pa-kpi-decoration"></div>

            </div>

            <div className="pa-kpi-card pa-kpi-cyan">

              <div className="pa-kpi-top">

                <div className="pa-kpi-icon">
                  🏢
                </div>

                <span className="pa-kpi-label">
                  ACTIVE DEPARTMENTS
                </span>

              </div>

              <strong>
                {activeDepartmentCount}
              </strong>

              <p>
                Departments with research activity
              </p>

              <div className="pa-kpi-decoration"></div>

            </div>

            <div className="pa-kpi-card pa-kpi-orange">

              <div className="pa-kpi-top">

                <div className="pa-kpi-icon">
                  📈
                </div>

                <span className="pa-kpi-label">
                  AVG. PUBLICATIONS
                </span>

              </div>

              <strong>
                {analyticsAveragePublications}
              </strong>

              <p>
                Average publications per department
              </p>

              <div className="pa-kpi-decoration"></div>

            </div>

          </div>

        </div>

        <div className="pa-two-column-grid">

          <div className="pa-dashboard-card">

            <div className="pa-card-heading">

              <div>

                <span className="pa-card-kicker">
                  DEPARTMENT ANALYSIS
                </span>

                <h2>
                  Department Performance
                </h2>

                <p>
                  Publications and research
                  faculty by department.
                </p>

              </div>

            </div>

            <div className="pa-department-list">

              {departmentData.length > 0 ? (

                departmentData.map(
                  (department, index) => {

                    const maxPublication =
                      departmentData[0]
                        ?.publications || 1;

                    const percentage =
                      (department.publications /
                        maxPublication) *
                      100;

                    return (
                      <div
                        className="pa-department-row"
                        key={
                          department.department
                        }
                      >

                        <div className="pa-department-info">

                          <div className="pa-department-rank">
                            {index + 1}
                          </div>

                          <div>

                            <strong>
                              {
                                department.department
                              }
                            </strong>

                            <span>
                              {
                                department.faculty
                              }{" "}
                              research faculty
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
                          {
                            department.publications
                          }
                        </div>

                      </div>
                    );
                  }
                )

              ) : (

                <div className="pa-empty-small">
                  No department data available.
                </div>

              )}

            </div>

          </div>

          <div className="pa-dashboard-card pa-distribution-card">

            <div className="pa-card-heading">

              <div>

                <span className="pa-card-kicker">
                  PUBLICATION MIX
                </span>

                <h2>
                  Publication Distribution
                </h2>

                <p>
                  Distribution of approved
                  publications across departments.
                </p>

              </div>

            </div>

            <div className="pa-donut-area">

              {publicationShareData.length >
              0 ? (

                <PieChart
                  width={390}
                  height={290}
                >

                  <Pie
                    data={
                      publicationShareData
                    }
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

        {/* TOP RESEARCH FACULTY */}

        <div className="pa-dashboard-card pa-top-faculty-card">

          <div className="pa-card-heading">

            <div>

              <span className="pa-card-kicker">
                RESEARCH LEADERS
              </span>

              <h2>
                Top Research Faculty
              </h2>

              <p>
                Faculty with the highest number
                of approved research publications.
              </p>

            </div>

            <div className="pa-top-faculty-count">
              TOP {topResearchFaculty.length}
            </div>

          </div>

          <div className="pa-top-faculty-list">

            {topResearchFaculty.length > 0 ? (

              topResearchFaculty.map(
                (faculty, index) => {

                  const rankClass =
                    index === 0
                      ? "pa-rank-first"
                      : index === 1
                      ? "pa-rank-second"
                      : index === 2
                      ? "pa-rank-third"
                      : "";

                  const topPublications =
                    topResearchFaculty[0]
                      ?.publications || 1;

                  const percentage =
                    Math.min(
                      (faculty.publications /
                        topPublications) *
                        100,
                      100
                    );

                  let activityStatus =
                    "CONTRIBUTOR";

                  let activityClass =
                    "pa-status-contributor";

                  if (percentage >= 80) {
                    activityStatus =
                      "HIGH ACTIVITY";
                    activityClass =
                      "pa-status-high";
                  } else if (
                    percentage >= 40
                  ) {
                    activityStatus =
                      "ACTIVE";
                    activityClass =
                      "pa-status-active";
                  }

                  return (
                    <div
                      className={`pa-top-faculty-row ${rankClass}`}
                      key={faculty.userId}
                    >

                      <div className="pa-faculty-rank">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      <div className="pa-faculty-avatar">

                        {faculty.profilePic ? (
                          <img
                            src={
                              faculty.profilePic
                            }
                            alt={
                              faculty.name
                            }
                            onError={(
                              e
                            ) => {
                              e.currentTarget.style.display =
                                "none";

                              if (
                                e.currentTarget
                                  .nextElementSibling
                              ) {
                                e.currentTarget.nextElementSibling.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        <span
                          style={{
                            display:
                              faculty.profilePic
                                ? "none"
                                : "flex",
                          }}
                        >
                          {faculty.name
                            ?.charAt(
                              0
                            )
                            ?.toUpperCase() ||
                            "F"}
                        </span>

                      </div>

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

                      <div className="pa-faculty-publications">

                        <strong>
                          {String(
                            faculty.publications
                          ).padStart(
                            2,
                            "0"
                          )}
                        </strong>

                        <span>
                          APPROVED
                        </span>

                      </div>

                      <div className="pa-faculty-progress">

                        <div className="pa-faculty-progress-header">

                          <span>
                            Research contribution
                          </span>

                          <strong>
                            {Math.round(
                              percentage
                            )}
                            %
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
                }
              )

            ) : (

              <div className="pa-empty-small">
                No research faculty data available.
              </div>

            )}

          </div>

        </div>

        {/* THIRD ROW */}

        <div className="pa-two-column-grid">

          <div className="pa-dashboard-card">

            <div className="pa-card-heading">

              <div>

                <span className="pa-card-kicker">
                  PUBLICATION TYPES
                </span>

                <h2>
                  Research Output Mix
                </h2>

                <p>
                  Approved publications grouped
                  by research type.
                </p>

              </div>

            </div>

            <div className="pa-type-chart">

              <BarChart
                width={600}
                height={300}
                data={
                  publicationTypeData
                }
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
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  barSize={42}
                  fill="#6366f1"
                />

              </BarChart>

            </div>

          </div>

          <div className="pa-dashboard-card">

            <div className="pa-card-heading">

              <div>

                <span className="pa-card-kicker">
                  RESEARCH CAPACITY
                </span>

                <h2>
                  Faculty vs Publications
                </h2>

                <p>
                  Comparison of research faculty
                  and publication output by department.
                </p>

              </div>

            </div>

            <div className="pa-type-chart">

              <BarChart
                width={600}
                height={300}
                data={
                  combinedDepartmentData
                }
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
                  radius={[
                    7,
                    7,
                    0,
                    0,
                  ]}
                  barSize={24}
                />

                <Bar
                  dataKey="publications"
                  name="Publications"
                  fill="#8b5cf6"
                  radius={[
                    7,
                    7,
                    0,
                    0,
                  ]}
                  barSize={24}
                />

              </BarChart>

            </div>

          </div>

        </div>

        {/* RESEARCH ACTIVITY TABLE */}

        <div className="pa-dashboard-card pa-activity-card">

          <div className="pa-card-heading">

            <div>

              <span className="pa-card-kicker">
                RESEARCH PERFORMANCE
              </span>

              <h2>
                Department Research Activity
              </h2>

              <p>
                Research activity overview
                across active departments.
              </p>

            </div>

            <div className="pa-total-badge">
              {departmentCount} Departments
            </div>

          </div>

          <div className="pa-activity-table">

            <div className="pa-activity-header">
              <span>
                Department
              </span>

              <span>
                Research Faculty
              </span>

              <span>
                Publications
              </span>

              <span>
                Activity
              </span>
            </div>

            {researchActivityData.map(
              (item, index) => {

                const maxActivity =
                  Math.max(
                    ...researchActivityData.map(
                      (x) =>
                        x.activity
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
                    key={
                      item.department
                    }
                  >

                    <div className="pa-activity-dept">

                      <span className="pa-activity-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
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

        {/* BOTTOM INSIGHTS */}

        <div className="pa-bottom-grid">

          <div className="pa-highlight-card pa-highlight-purple">

            <div className="pa-highlight-icon">
              📊
            </div>

            <div>

              <span>
                PUBLICATION DENSITY
              </span>

              <strong>
                {
                  analyticsAveragePublications
                }
              </strong>

              <p>
                Average publications per
                active department
              </p>

            </div>

          </div>

          <div className="pa-highlight-card pa-highlight-blue">

            <div className="pa-highlight-icon">
              👥
            </div>

            <div>

              <span>
                RESEARCH COMMUNITY
              </span>

              <strong>
                {facultyCount}
              </strong>

              <p>
                Faculty contributing to
                approved research
              </p>

            </div>

          </div>

          <div className="pa-highlight-card pa-highlight-orange">

            <div className="pa-highlight-icon">
              🏆
            </div>

            <div>

              <span>
                LEADING DEPARTMENT
              </span>

              <strong>
                {departmentData[0]
                  ?.department ||
                  "—"}
              </strong>

              <p>
                Highest approved publication
                count
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  };

  /* =========================================================
     RETURN
  ========================================================= */

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

          R&D Dean Portal

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
              activeSection ===
              "uid-approval"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "uid-approval"
              )
            }
          >

            <span className="sidebar-icon">
              <FiCheckCircle />
            </span>

            <span>
              UID Approval
            </span>

          </button>

          <button
  className={`sidebar-item ${
    activeSection ===
    "document-approval"
      ? "active"
      : ""
  }`}
  onClick={() =>
    handleNavigation(
      "document-approval"
    )
  }
>

  <span className="sidebar-icon">
    <FiFileText />
  </span>

  <span>
    Document Approval
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
              alt="R&D Dean"
              onError={(e) => {
                e.target.src =
                  "/default-profile.png";
              }}
            />

            <div>

              <strong>
                {rdDeanProfile?.fullName ||
                  "R&D Dean"}
              </strong>

              <span>
                R&D Dean
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
                  "document-approval"
                ? "Document Approval"
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
                  {rdDeanProfile?.fullName ||
                    "R&D Dean"}
                </strong>

                <span>
                  R&D Dean
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
          !rdDeanProfile ? (

            <div className="hod-loading">

              <div className="loading-spinner"></div>

              <p>
                Loading R&D Dean dashboard...
              </p>

            </div>

          ) : profileError &&
            !rdDeanProfile ? (

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

              {/* =================================================
                  ONLY UID APPROVAL COMPONENT CHANGED
              ================================================= */}

              {activeSection ===
                "uid-approval" && (
                <RDDeanUidApproval />
              )}
              {/* DOCUMENT SUBMISSION APPROVAL */}

{activeSection ===
  "document-approval" && (
  <RDDeanDocumentApproval />
)}
              
              {/* PUBLISHED RESEARCH - SAME */}

              {activeSection ===
                "published-papers" && (
                <PrincipalPublishedPapers
                  approvedPids={
                    approvedPids
                  }
                />
              )}

              {/* FACULTY - SAME */}

              {activeSection ===
                "faculty-details" && (
                <PrincipalFacultyHodSection
                  type="faculty"
                />
              )}

              {/* HOD - SAME */}

              {activeSection ===
                "hod-details" && (
                <PrincipalFacultyHodSection
                  type="hod"
                />
              )}

              {/* ANALYTICS - SAME */}

              {activeSection ===
                "analytics" &&
                renderAnalytics()}

              {/* NOTIFICATIONS - SAME PAGE */}

              {activeSection ===
                "notifications" && (
                <NotificationsSection
                  userId={userId}
                />
              )}

              {/* PROFILE - SAME */}

              {activeSection ===
                "profile" &&
                rdDeanProfile && (
                  <ProfileSection
                    facultyDetails={
                      rdDeanProfile
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

// import React, { useEffect, useState } from 'react';
// import './RDDeanDashboard.css'; 
// import logo from './logo2.jpeg';  // Adjust path as needed
// import { useNavigate } from 'react-router-dom';
// import CustomNavbar from './CustomNavbar'; // Import the custom navbar
// import Swal from 'sweetalert2';
// import NotificationsSection from './NotificationsSection';
// import PrincipalFacultyHodSection from './PrincipalFacultyHodSection';
// import CountUp from "react-countup";
// import { motion } from "framer-motion";
// // import {
// //   LineChart, Line, XAxis, YAxis, Tooltip,
// //   BarChart, Bar,
// //   PieChart, Pie, Cell,
// //   ResponsiveContainer
// // } from "recharts";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell   // ✅ ADD THIS
// } from "recharts";


// export default function RDDeanDashboard() {
//   const [activeSection, setActiveSection] = useState('dashboard');
//   const [approvedRequests, setApprovedRequests] = useState([]);
//   const [submissions, setSubmissions] = useState([]);
//   const [approvedPids, setApprovedPids] = useState([]);
//   const [profile, setProfile] = useState(null);
//   const navigate = useNavigate();
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [notifications, setNotifications] = useState([]);
// const [showNotifications, setShowNotifications] = useState(false);
//   const [profileImage, setProfileImage] = useState("");
//   const [expandedId, setExpandedId] = useState(null);

//   const [monthlyData, setMonthlyData] = useState([]);
// const [deptData, setDeptData] = useState([]);
// const [topFaculty, setTopFaculty] = useState([]);
// const [typeData, setTypeData] = useState([]);

//   const [counts, setCounts] = useState({
//   approvedUIDs: 0,
//   pendingUIDs: 0,
//   totalUIDs: 0,
//   approvedPIDs: 0,
//   pendingPIDs: 0,
//   totalPIDs: 0,
// });
// const handleNotificationClick = async () => {
//   const userId = localStorage.getItem('userId');

//   setShowNotifications(!showNotifications);

//   if (!showNotifications) {
//     await fetch(`${API_BASE_URL}/api/auth/notifications/mark-read/${userId}`, {
//       method: 'PUT'
//     });
//   }
// };

// useEffect(() => {
//   const userId = localStorage.getItem('userId');
//   if (!userId) return;

//   fetch(`${API_BASE_URL}/api/notifications/${userId}`)
//     .then(res => res.json())
//     .then(data => setNotifications(data))
//     .catch(err => console.error(err));
// }, []);

// useEffect(() => {
//   const fetchCounts = async () => {
//     try {
//       const res = await fetch('/api/dashboard/rddean-counts');
//       const data = await res.json();
//       setCounts(data);
//     } catch (err) {
//       console.error('Error fetching system-wide counts:', err);
//     }
//   };

//   fetchCounts();
//   const interval = setInterval(fetchCounts, 30000); // refresh every 30s
//   return () => clearInterval(interval);
// }, []);
//   // Fetch Profile data (mock or API)
//   useEffect(() => {
//     // Replace with real API call if needed
//     setProfile({
//       name: 'R&D Admin',
//       email: 'admin@rnd.com',
//       phoneNumber:'6304702811',
//     });
//   }, []);

//   useEffect(() => {
//     if (activeSection === 'approved-pids') {
//       fetch('/api/admin/approved-pids')
//         .then(res => res.json())
//         .then(data => setApprovedPids(data))
//        .catch(err => {
//   console.error(err);
//   setApprovedPids([]);
//   Swal.fire({
//     icon: 'error',
//     title: 'Error',
//     text: 'Failed to load approved PIDs.'
//   });
// });

       
//         // .catch(err => {
//         //   console.error(err);
//         //   setApprovedPids([]);
//         //   alert('Failed to load approved PIDs.');
//         // });
//     }
//   }, [activeSection]);

//   useEffect(() => {
//     if (activeSection === 'faculty-uid') {
//       fetch('/api/hod/uid-requests')
//         .then(res => res.json())
//         .then(data => {
//           const filtered = Array.isArray(data) ? data.filter(row => row.hodAccept && row.principalAccept && !row.adminAccept) : [];
//           setApprovedRequests(filtered);
//         })
//         .catch(err => {
//           console.error(err);
//           Swal.fire('Error', 'Failed to load UID requests.', 'error');
//         });
//     }
//   }, [activeSection]);

//   useEffect(() => {
//     if (activeSection === 'paper-submission') {
//       fetch('/api/admin/all-submitted-documents')
//         .then(res => res.json())
//         .then(data => {
//           setSubmissions(data);
//         })
//         .catch(err => {
//           console.error(err);
//           setSubmissions([]);
//         });
//     }
//   }, [activeSection]);

//   useEffect(() => {
//   const fetchAnalytics = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/dashboard/analytics");
//       const data = await res.json();

//       setMonthlyData(data.monthly || []);
//       setDeptData(data.departments || []);
//       setTopFaculty(data.topFaculty || []);
//       setTypeData(data.types || []);
//     } catch (err) {
//       console.error("Analytics fetch error:", err);
//     }
//   };

//   fetchAnalytics();
// }, []);


//   const handleDocumentAction = async (id, status) => {
//     // if (status === 'reject') {
//     //   const reason = prompt('Enter reason for rejection:');
//     //   if (!reason?.trim()) return alert('Rejection reason is required.');
//     if (status === 'reject') {
//   // const { value: reason } = await Swal.fire({
//   //   title: 'Reject Document',
//   //   input: 'text',
//   //   inputLabel: 'Enter reason for rejection',
//   //   inputPlaceholder: 'Type reason here...',
//   //   showCancelButton: true,
//   // });
//   const { value: reason } = await Swal.fire({
//   title: "Reject Document",
//   html: `
//     <select id="reasonSelect" class="swal2-select">
//       <option value="">Select reason</option>
//       <option value="Incomplete document">Incomplete document</option>
//       <option value="Invalid journal">Invalid journal</option>
//       <option value="Duplicate submission">Duplicate submission</option>
//       <option value="Incorrect paper details">Incorrect paper details</option>
//       <option value="Other">Other</option>
//     </select>

//     <input id="otherReason"
//       class="swal2-input"
//       placeholder="Enter custom reason"
//       style="display:none">
//   `,
//   showCancelButton: true,

//   didOpen: () => {
//     const select = document.getElementById("reasonSelect");
//     const otherInput = document.getElementById("otherReason");

//     select.addEventListener("change", () => {
//       if (select.value === "Other") {
//         otherInput.style.display = "block";
//       } else {
//         otherInput.style.display = "none";
//       }
//     });
//   },

//   preConfirm: () => {
//     const select = document.getElementById("reasonSelect").value;
//     const other = document.getElementById("otherReason").value;

//     if (!select) {
//       Swal.showValidationMessage("Please select a reason");
//       return false;
//     }

//     if (select === "Other" && !other) {
//       Swal.showValidationMessage("Please enter the reason");
//       return false;
//     }

//     return select === "Other" ? other : select;
//   }
// });

//   if (!reason) {
//     return Swal.fire('Error', 'Rejection reason is required.', 'error');
//   }


//       try {
//         const res = await fetch(`${API_BASE_URL}/api/admin/document-submission/${id}/reject`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ reason })
//         });

//         const data = await res.json();
//         Swal.fire('Success', data.message, 'success');

//         setSubmissions(prev => prev.filter(doc => doc._id !== id));
//       } catch (err) {
//         console.error(err);
//         alert('Failed to reject the document.');
//       }

//       return;
//     }

//     try {
//       const res = await fetch(`${API_BASE_URL}/api/admin/document-submission/${id}/accept`, {
//         method: 'PUT'
//       });

//       const data = await res.json();

// // Show SweetAlert with message + PID
// Swal.fire({
//   icon: 'success',
//   title: 'Submission Accepted!',
//   // html: `<p>${data.message}</p><p><strong>PID</strong> ${data.pid}</p>`,
//   html: `<p><strong>PID</strong> </p>`,
//   showConfirmButton: true,
//   confirmButtonText: 'OK'
// });

// // Remove accepted document from the list
// setSubmissions(prev => prev.filter(doc => doc._id !== id));


//       // const data = await res.json();
//       // alert(`${data.message} PID: ${data.pid}`);
//       setSubmissions(prev => prev.filter(doc => doc._id !== id));
//     } catch (err) {
//       console.error(err);
//       alert('Failed to process the document.');
//     }
//   };

//   const handleAction = async (id, status) => {
//     try {
//       let body = null;
//       // let body = null;
// if (status === 'reject') {
//   const { value: reason } = await Swal.fire({
//     title: "Reject UID Request",
//     html: `
//       <select id="reasonSelect" class="swal2-select">
//         <option value="">Select reason</option>
//         <option value="Incomplete document">Incomplete document</option>
//         <option value="Invalid journal">Invalid journal</option>
//         <option value="Duplicate submission">Duplicate submission</option>
//         <option value="Incorrect paper details">Incorrect paper details</option>
//         <option value="Journal not indexed">Journal not indexed</option>
//         <option value="Other">Other</option>
//       </select>

//       <input id="otherReason"
//         class="swal2-input"
//         placeholder="Enter custom reason"
//         style="display:none">
//     `,
//     showCancelButton: true,

//     didOpen: () => {
//       const select = document.getElementById("reasonSelect");
//       const otherInput = document.getElementById("otherReason");

//       select.addEventListener("change", () => {
//         if (select.value === "Other") {
//           otherInput.style.display = "block";
//         } else {
//           otherInput.style.display = "none";
//         }
//       });
//     },

//     preConfirm: () => {
//       const select = document.getElementById("reasonSelect").value;
//       const other = document.getElementById("otherReason").value;

//       if (!select) {
//         Swal.showValidationMessage("Please select a reason");
//         return false;
//       }

//       if (select === "Other" && !other) {
//         Swal.showValidationMessage("Please enter the reason");
//         return false;
//       }

//       return select === "Other" ? other : select;
//     }
//   });

//   if (!reason) return;

//   body = JSON.stringify({ reason });
// }

// const res = await fetch(`${API_BASE_URL}/api/admin/uid-request/${id}/${status}`, {
//   method: 'PUT',
//   headers: { 'Content-Type': 'application/json' },
//   body
// });

// const data = await res.json();
// Swal.fire('Success', data.message, 'success');

     
//       setApprovedRequests(prev => prev.filter(r => r._id !== id));
//     } 
//     catch (err) {
//   console.error(err);
//   Swal.fire({
//     icon: 'error',
//     title: 'Action Failed',
//     text: 'Something went wrong while performing this action.'
//   });
// }

//   };

//   const handleProfileClick = () => {
//   setActiveSection('profile');
// };
// const handleLogout = () => {
//   Swal.fire({
//     title: 'Are you sure?',
//     text: "Do you really want to log out?",
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonText: 'Yes, log me out',
//     cancelButtonText: 'Cancel',
//     confirmButtonColor: '#10b981',
//     cancelButtonColor: '#f87171',
//   }).then((result) => {
//     if (result.isConfirmed) {
//       localStorage.clear(); // ✅ move here

//       Swal.fire({
//         icon: 'success',
//         title: 'Logged Out',
//         text: 'You have successfully logged out!',
//         timer: 2000,
//         showConfirmButton: false
//       }).then(() => {
//         navigate('/login');
//       });
//     }
//   });
// };

// const approvalRate = counts.totalUIDs
//   ? ((counts.approvedUIDs / counts.totalUIDs) * 100).toFixed(1)
//   : 0;

// const workload =
//   counts.pendingUIDs + counts.pendingPIDs > 20
//     ? "High"
//     : counts.pendingUIDs + counts.pendingPIDs > 10
//     ? "Medium"
//     : "Low";

//   return (
//     <>
     

//     <div className="dashboard-container">
//       <motion.div 
//   className="sidebar"
//   initial={{ x: -200, opacity: 0 }}
//   animate={{ x: 0, opacity: 1 }}
//   transition={{ duration: 0.5 }}
// >
        
//        <div className="logo-section">
//           {/* <img src={logo} alt="Logo" className="logo" /> */}
//         </div>
//         <h2>R&D Dean Dashboard</h2>
//         <ul className="menu">
//                   <motion.li
//           whileHover={{ scale: 1.05, x: 5 }}
//           whileTap={{ scale: 0.95 }}
//           className={activeSection === 'dashboard' ? 'active' : ''}
//           onClick={() => setActiveSection('dashboard')}
//         >
//           🧾 Dashboard
//         </motion.li>
//          <motion.li
//           whileHover={{ scale: 1.05, x: 5 }}
//           whileTap={{ scale: 0.95 }}
//             className={activeSection === 'notifications' ? 'active' : ''}
//             onClick={() => setActiveSection('notifications')}
//             style={{ cursor: 'pointer' }}
//           >
//             🔔 Notifications
//           </motion.li>
//             <motion.li
//           whileHover={{ scale: 1.05, x: 5 }}
//           whileTap={{ scale: 0.95 }} className={activeSection === 'faculty-uid' ? 'active' : ''} onClick={() => setActiveSection('faculty-uid')}>
//                       🧾 Faculty UID Requests
//                     </motion.li>
//           <motion.li
//           whileHover={{ scale: 1.05, x: 5 }}
//           whileTap={{ scale: 0.95 }} className={activeSection === 'paper-submission' ? 'active' : ''} onClick={() => setActiveSection('paper-submission')}>
//                       📝 Documents Submissions
//                     </motion.li>
//           <motion.li
//           whileHover={{ scale: 1.05, x: 5 }}
//           whileTap={{ scale: 0.95 }}className={activeSection === 'approved-pids' ? 'active' : ''} onClick={() => setActiveSection('approved-pids')}>
//                       ✅ Approved PIDs
//                     </motion.li>
//                     <motion.li
//             whileHover={{ scale: 1.05, x: 5 }}
//             whileTap={{ scale: 0.95 }}
//             className={activeSection === 'faculty-details' ? 'active' : ''}
//             onClick={() => setActiveSection('faculty-details')}
//           >
//             🧑‍🏫 Faculty Details
//           </motion.li>

//           <motion.li
//             whileHover={{ scale: 1.05, x: 5 }}
//             whileTap={{ scale: 0.95 }}
//             className={activeSection === 'hod-details' ? 'active' : ''}
//             onClick={() => setActiveSection('hod-details')}
//           >
//             👨‍💼 HOD Details
//           </motion.li>
//           <motion.li
//           whileHover={{ scale: 1.05, x: 5 }}
//           whileTap={{ scale: 0.95 }} className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>
//                       👤 Profile
//                     </motion.li>
//                     <li onClick={handleLogout} style={{ cursor: 'pointer', color: 'white', marginTop: 'auto' }}>
//                       🔚  Logout
//                     </li>
//                   </ul>
//                 </motion.div>

//                 <motion.div
//   className="main-content"
//   initial={{ opacity: 0, y: 20 }}
//   animate={{ opacity: 1, y: 0 }}
//   transition={{ duration: 0.4 }}
// >
//                   <div className="top-bar">
//             <div className="left">
//               <h3>Dashboard</h3>
//               <p>Welcome back, {profile?.name}</p>
//             </div>

//             <div className="right">

//               {/* 🔔 Notification Icon with Badge */}
//               <div
//                 className="notification-wrapper"
//                 onClick={() => setActiveSection("notifications")}
//               >
//                 <span className="bell-icon">🔔</span>

//                 {notifications.filter(n => !n.isRead).length > 0 && (
//                   <span className="notification-badge">
//                     {notifications.filter(n => !n.isRead).length}
//                   </span>
//                 )}
//               </div>

//                 {/* 👤 Profile Image */}
//                 <img
//                   src={
//                     profileImage ||
//                     "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                   }
//                   alt="Profile"
//                   className="profile-img"
//                   onClick={handleProfileClick}
//                 />
//               </div>
//             </div>
    

//         {activeSection === 'notifications' && (
//   <NotificationsSection userId={localStorage.getItem("userId")} />
// )}
//         {activeSection === 'dashboard' && (
//   <>
//     {/* 🔢 COUNT CARDS */}
//     <div className="dashboard-counts">
//       {[
//         { title: 'Total UIDs', value: counts.totalUIDs, bg: 'linear-gradient(145deg, #10b981, #34d399)' },
//         { title: 'Approved UIDs', value: counts.approvedUIDs, bg: 'linear-gradient(145deg, #3b82f6, #60a5fa)' },
//         { title: 'Pending UIDs', value: counts.pendingUIDs, bg: 'linear-gradient(145deg, #f59e0b, #fbbf24)' },
//         { title: 'Total PIDs', value: counts.totalPIDs, bg: 'linear-gradient(145deg, #ef4444, #f87171)' },
//         { title: 'Approved PIDs', value: counts.approvedPIDs, bg: 'linear-gradient(145deg, #6366f1, #a5b4fc)' },
//         { title: 'Pending PIDs', value: counts.pendingPIDs, bg: 'linear-gradient(145deg, #1e40af, #3b82f6)' },
//       ].map((card, index) => (
//         <motion.div
//           key={index}
//           className="count-card"
//           style={{ background: card.bg }}
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: index * 0.1 }}
//         >
//           <h4>{card.title}</h4>
//           <p>
//             <CountUp end={card.value} duration={1.5} />
//           </p>
//         </motion.div>
//       ))}
//     </div>

//     {/* 🔥 EXTRA ANALYTICS CARDS */}
//     <div className="dashboard-counts" style={{ marginTop: "20px" }}>
//       <div className="count-card" style={{ background: "#059669" }}>
//         <h4>Approval Rate</h4>
//         <p>{approvalRate}%</p>
//       </div>

//       <div className="count-card" style={{ background: "#f59e0b" }}>
//         <h4>Workload</h4>
//         <p>{workload}</p>
//       </div>
//     </div>

//     <div className="charts-container">

//   {/* 📈 Monthly Submissions */}
//   <div className="chart-box">
//     <h3>Monthly Submissions</h3>

//     <ResponsiveContainer width="100%" height={300}>
//       <LineChart data={monthlyData}>
//         <XAxis dataKey="month" tick={{ fontSize: 12 }} />
//         <YAxis />
//         <Tooltip />
//         <Line
//           type="monotone"
//           dataKey="count"
//           stroke="#10b981"
//           strokeWidth={3}
//           dot={{ r: 4 }}
//           activeDot={{ r: 6 }}
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   </div>

//   {/* 🏫 Department Publications */}
//   <div className="chart-box">
//     <h3>Department Publications</h3>

//     <ResponsiveContainer width="100%" height={300}>
//   <BarChart data={deptData}>
    
//     {/* 🎨 Gradient Definition */}
//     <defs>
//       <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
//         <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
//         <stop offset="100%" stopColor="#22c55e" stopOpacity={0.8} />
//       </linearGradient>
//     </defs>

//     <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
//     <YAxis />
//     <Tooltip />

//     <Bar
//       dataKey="count"
//       fill="url(#barGradient)"   // 🔥 gradient applied
//       radius={[8, 8, 0, 0]}
//     />
//   </BarChart>
// </ResponsiveContainer>
//   </div>

//   {/* 🥧 Document Types */}
//   <div className="chart-box">
//     <h3>Document Types</h3>

//       <ResponsiveContainer width="100%" height={300}>
//   <PieChart>

//     {/* 🎨 Gradient Colors */}
//     <defs>
//       <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
//         <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
//         <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
//       </linearGradient>

//       <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
//         <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
//         <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
//       </linearGradient>

//       <linearGradient id="grad3" x1="0" y1="0" x2="1" y2="1">
//         <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
//         <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
//       </linearGradient>

//       <linearGradient id="grad4" x1="0" y1="0" x2="1" y2="1">
//         <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
//         <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
//       </linearGradient>
//     </defs>

//     <Pie
//       data={typeData}
//       dataKey="count"
//       nameKey="type"
//       cx="50%"
//       cy="50%"
//       outerRadius={110}
//       innerRadius={60}   // 🔥 makes it DONUT style (premium look)
//       paddingAngle={4}
//       labelLine={false}
//       label={({ name, percent }) =>
//         `${name} ${(percent * 100).toFixed(0)}%`
//       }
//     >
//       {typeData.map((entry, index) => {
//         const colors = [
//           "url(#grad1)",
//           "url(#grad2)",
//           "url(#grad3)",
//           "url(#grad4)",
//         ];
//         return (
//           <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
//         );
//       })}
//     </Pie>

//     <Tooltip
//       contentStyle={{
//         backgroundColor: "#111827",
//         border: "none",
//         borderRadius: "10px",
//         color: "#fff",
//         fontSize: "12px"
//       }}
//     />

//   </PieChart>
// </ResponsiveContainer>
   
//   </div>

// </div>

//             {/* 🏆 TOP FACULTY */}
//             <div className="leaderboard">
//               <h3>Top Faculty</h3>
//               {topFaculty.map((f, i) => (
//                 <p key={i}>{f._id} - {f.count} papers</p>
//               ))}
//             </div>
//           </>
//         )}
        
        

//         {activeSection === 'faculty-uid' && (
//           <div className="uid-requests-container">
//             <h2>Pending UID Requests</h2>
//             {approvedRequests.length === 0 ? (
//               <p>No UID requests pending approval.</p>
//             ) : (
//               approvedRequests.map(req => (
//                 <motion.div
//   className="uid-request-card"
//   key={req._id}
//   initial={{ opacity: 0, y: 30 }}
//   animate={{ opacity: 1, y: 0 }}
//   transition={{ duration: 0.3 }}
//   whileHover={{ scale: 1.02 }}
// >
//                   <h4>{req.paperTitle}</h4>
//                   <p><strong>Faculty:</strong> {req.facultyName} ({req.facultyId})</p>
//                   <p><strong>Dept:</strong> {req.department}</p>
//                   <p><strong>Type:</strong> {req.type}</p>
//                   <p><strong>Target:</strong> {req.target}</p>
//                   <p><strong>Abstract:</strong> {req.abstract}</p>
//                   <p><strong>Submitted:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>
//                   <div className="actions">
//                     <button className="accept" onClick={() => handleAction(req._id, 'accept')}>Accept</button>
//                     <button className="reject" onClick={() => handleAction(req._id, 'reject')}>Reject</button>
//                   </div>
//                 </motion.div>
//               ))
//             )}
//           </div>
//         )}

//         {activeSection === 'paper-submission' && (
//           <div className="uid-requests-container">
//             <h2>Submitted Documents</h2>
//             {submissions.length === 0 ? (
//               <p>No document submissions found.</p>
//             ) : (
//               submissions.map(doc => (
//                 <div className="uid-request-card" key={doc._id}>
//                   <h4>{doc.paperTitle}</h4>
//                   <p><strong>UID:</strong> {doc.uid}</p>
//                   <p><strong>Type:</strong> {doc.type}</p>
//                   <p><strong>Target:</strong> {doc.target}</p>
//                   <p><strong>Abstract:</strong>{doc.abstract}</p>
//                   <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
//                   <p><strong>Faculty: </strong> faculty2</p>
                  
// <p><strong>Indexing Proof</strong>
// {doc.indexingProof && doc.indexingProof.filename && (
//   <a
//     href={`data:${doc.indexingProof.contentType};base64,${doc.indexingProof.base64}`}
//     download={doc.indexingProof.filename}
//   >
//     📥 Download Indexing Proof
//   </a>
// )}</p>




//                   <div className="actions">
//                     <button className="accept" onClick={() => handleDocumentAction(doc._id, 'accept')}>Accept</button>
//                     <button className="reject" onClick={() => handleDocumentAction(doc._id, 'reject')}>Reject</button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       {activeSection === 'approved-pids' && (
//   <div className="uid-requests-container">
//     <h2>Approved PIDs</h2>
//         <div className="search-bar">
//   <input
//     type="text"
//     placeholder="Search by Faculty, Paper Title, UID or PID"
//     value={searchTerm}
//     onChange={(e) => setSearchTerm(e.target.value)}
//   />
// </div>
//     {/* Date range selectors */}
   
//  <div className="date-range">
//     <h7>
//       From:
//       <input
//         type="date"
//         value={startDate}
//         onChange={(e) => setStartDate(e.target.value)}
//       />
//     </h7>
//     <h7>
//       To:
//       <input
//         type="date"
//         value={endDate}
//         onChange={(e) => setEndDate(e.target.value)}
//       />
//     </h7>
//   </div>

//     {/* Filter PIDs based on selected date range */}
//     {(() => {
     
//         const filteredPids = approvedPids.filter(doc => {
//   // 1️⃣ Date filter
//   const uploaded = new Date(doc.uploadedAt);
//   if (startDate && endDate) {
//     if (uploaded < new Date(startDate) || uploaded > new Date(endDate)) {
//       return false;
//     }
//   }

//   // 2️⃣ Search filter
//   if (searchTerm.trim() !== '') {
//     const term = searchTerm.toLowerCase();
//     if (
//       !(doc.facultyId?.toLowerCase().includes(term) ||
//         doc.paperTitle?.toLowerCase().includes(term) ||
//         doc.uid?.toLowerCase().includes(term) ||
//         doc.pid?.toLowerCase().includes(term))
//     ) {
//       return false;
//     }
//   }

//   // 3️⃣ If it passed both filters
//   return true;
// });
      

      

//       if (filteredPids.length === 0) {
//         return <p>No approved documents found in this date range.</p>;
//       }

//       return filteredPids.map(doc => {
//   const isExpanded = expandedId === doc._id;

//   return (
//     <div className="uid-request-card" key={doc._id}>
      
//       <div className="card-header">
//         <h4>{doc.paperTitle}</h4>

//         {/* 🔽 Arrow Button */}
//         <span
//           className={`toggle-arrow ${isExpanded ? "open" : ""}`}
//           onClick={() =>
//             setExpandedId(isExpanded ? null : doc._id)
//           }
//         >
//           ▼
//         </span>
//       </div>

//       {/* ALWAYS VISIBLE */}
//       <p><strong>Faculty:</strong> {doc.facultyId}</p>
//       <p><strong>PID:</strong> {doc.pid}</p>
//       <p><strong>UID:</strong> {doc.uid}</p>

//       {/* COLLAPSIBLE CONTENT */}
//       <div className={`extra-content ${isExpanded ? "show" : ""}`}>
//         <p><strong>Type:</strong> {doc.type}</p>
//         <p><strong>Abstract:</strong> {doc.abstract}</p>
//         <p><strong>Target:</strong> {doc.target}</p>
//         <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>

//         <p><strong>Acceptance Letter:</strong>
//           <a
//             href={doc.acceptanceLetter?.base64 ? `data:${doc.acceptanceLetter?.contentType};base64,${doc.acceptanceLetter?.base64}` : '#'}
//             download={doc.acceptanceLetter?.filename || "--"}
//           >
//             📥 Download
//           </a>
//         </p>

//         <p><strong>Indexing Proof:</strong>
//           <a
//             href={doc.indexingProof?.base64 ? `data:${doc.indexingProof?.contentType};base64,${doc.indexingProof?.base64}` : '#'}
//             download={doc.indexingProof?.filename || "--"}
//           >
//             📥 Download
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// });
      
//     })()}
//   </div>
// )}
        
//         {activeSection === 'faculty-details' && (
//   <PrincipalFacultyHodSection type="faculty" />
// )}

// {activeSection === 'hod-details' && (
//   <PrincipalFacultyHodSection type="hod" />
// )}

        

//         {activeSection === 'profile' && profile && (
//           <div className="profile-section">
//             <h2>Profile</h2>
//             <p><strong>Name:</strong> {profile.name}</p>
//             <p><strong>Email:</strong> {profile.email}</p>
//             <p><strong>Phone Number:</strong>{profile.phoneNumber}</p>
//           </div>
//         )}

//         {activeSection === 'incentives' && <p>Incentives Pending Section</p>}
//       </motion.div>
//     </div>
//     </>
//   );
// }
