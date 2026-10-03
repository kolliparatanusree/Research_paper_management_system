// src/pages/HodDashboard.js

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HodDashboard.css";
import HodUidApproval from "./HodUidApproval";
import axios from "axios";
import Swal from "sweetalert2";
import ProfileSection from "./faculty/ProfileSection";
import DepartmentPublicationsSection from "./DepartmentPublicationsSection";
import HodFacultySection from "./HodFacultySection";
import NotificationsSection from "./NotificationsSection";
import HodAnalytics from "./HodAnalytics";
import HODUIDStatusList from "./HODUIDStatusList";
import { API_BASE_URL } from '../config';
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell
// } from "recharts";

export default function HodDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [hodProfile, setHodProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [facultyCount, setFacultyCount] = useState(0);
  const [pendingUidCount, setPendingUidCount] = useState(0);
  const [approvedUidCount, setApprovedUidCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  /* =========================================================
     FETCH NOTIFICATIONS
  ========================================================= */
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE_URL}/api/notifications/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((err) => console.error("Notification fetch error:", err));
  }, [userId]);

  /* =========================================================
     FETCH UNREAD NOTIFICATION COUNT
  ========================================================= */
  const fetchNotificationCount = async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/notifications/unread-count/${userId}`
      );

      const data = await res.json();
      setNotifCount(data.count || 0);
    } catch (err) {
      console.error("Unread notification count error:", err);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
  }, [userId]);

  /* =========================================================
     FETCH HOD PROFILE
  ========================================================= */
  useEffect(() => {
    if (!userId) {
      console.error("No HOD ID found in localStorage");
      setError("No HOD ID found. Please login again.");
      setLoadingProfile(false);
      return;
    }

    const fetchHodProfile = async () => {
      try {
        setLoadingProfile(true);

        const res = await axios.get(`${API_BASE_URL}/api/faculty/${userId}`);
        const data = res.data;

        setHodProfile({
          fullName: data.fullName,
          userId: data.userId,
          department: data.department,
          email: data.email,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          profilePic: data.profilePic,
        });
      } catch (err) {
        console.error("Error fetching HOD profile:", err);

        setError("Failed to fetch HOD profile.");

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch HOD profile",
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchHodProfile();
  }, [userId]);

  /* =========================================================
     FETCH DEPARTMENT COUNTS
  ========================================================= */
  useEffect(() => {
    if (!hodProfile?.department) return;

    const department = hodProfile.department;

    const fetchCounts = async () => {
      try {
        const [facultyRes, pendingRes, approvedRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/faculty/count/${department}`),
          axios.get(`${API_BASE_URL}/api/hod/uid/pending/${department}`),
          axios.get(`${API_BASE_URL}/api/hod/uid/approved/${department}`),
        ]);

        setFacultyCount(facultyRes.data.count || 0);
        setPendingUidCount(pendingRes.data.count || 0);
        setApprovedUidCount(approvedRes.data.count || 0);
      } catch (err) {
        console.error("Dashboard count error:", err);
      }
    };

    fetchCounts();
  }, [hodProfile]);

  /* =========================================================
     UID APPROVAL CALCULATIONS
  ========================================================= */
  const totalUidRequests = pendingUidCount + approvedUidCount;



  const pendingRate =
    totalUidRequests > 0
      ? Math.round((pendingUidCount / totalUidRequests) * 100)
      : 0;

  /* =========================================================
     RECENT NOTIFICATIONS
  ========================================================= */
  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
      .slice(0, 4);
  }, [notifications]);

  /* =========================================================
     TIME BASED GREETING
  ========================================================= */
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */
  const handleNavigation = async (section) => {
    if (section === "logout") {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to log out?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, log me out",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#ef4444",
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
     OPEN NOTIFICATIONS
  ========================================================= */
  const handleNotificationClick = async () => {
    setActiveSection("notifications");
    setSidebarOpen(false);

    try {
      await axios.put(`${API_BASE_URL}/api/auth/notifications/mark-read/${userId}`);
      setNotifCount(0);
    } catch (err) {
      console.error("Unable to mark notifications as read:", err);
    }
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */
  const formatNotificationDate = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    return notificationDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const uidChartData = [
  {
    name: "Approved",
    value: approvedUidCount || 0
  },
  {
    name: "Pending",
    value: pendingUidCount || 0
  }
];

const departmentChartData = [
  {
    name: "Faculty",
    value: facultyCount || 0
  },
  {
    name: "Approved UID",
    value: approvedUidCount || 0
  },
  {
    name: "Pending UID",
    value: pendingUidCount || 0
  }
];

const totalUid =
  (approvedUidCount || 0) +
  (pendingUidCount || 0);

const approvalRate =
  totalUid > 0
    ? Math.round(
        ((approvedUidCount || 0) / totalUid) * 100
      )
    : 0;


  /* =========================================================
     DASHBOARD
  ========================================================= */
  const renderDashboard = () => {
    return (
      <div className="hod-home">

        {/* =====================================================
            WELCOME SECTION
        ===================================================== */}
        <section className="hod-welcome-section">
          <div className="hod-welcome-content">
            <div>
              <p className="hod-eyebrow">
                Department Research Management
              </p>

              <h1>
                {greeting},{" "}
                {hodProfile?.fullName || "HOD"}{" "}
                <span className="wave">👋</span>
              </h1>

              <p className="hod-welcome-subtitle">
                Here's an overview of your department's research
                activities and UID workflow.
              </p>
            </div>

            <div className="department-badge">
              <span className="department-icon">🏛️</span>

              <div>
                <small>Department</small>
                <strong>
                  {hodProfile?.department || "Department"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}
        <section className="hod-summary-grid">

          <div
            className="hod-summary-card faculty1-card"
            onClick={() => handleNavigation("faculty")}
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
              Faculty
            </div>

            <div className="summary-value">
              {facultyCount}
            </div>

            <div className="summary-description">
              Department faculty members
            </div>
          </div>

          <div
            className="hod-summary-card pending-card"
            onClick={() => handleNavigation("requests")}
          >
            <div className="summary-card-top">
              <div className="summary-icon">
                📨
              </div>

              <span className="summary-arrow">
                →
              </span>
            </div>

            <div className="summary-label">
              Pending UID
            </div>

            <div className="summary-value">
              {pendingUidCount}
            </div>

            <div className="summary-description">
              Requests awaiting review
            </div>
          </div>

          <div className="hod-summary-card approved-card">
            <div className="summary-card-top">
              <div className="summary-icon">
                ✓
              </div>

              <span className="summary-status">
                Approved
              </span>
            </div>

            <div className="summary-label">
              Approved UID
            </div>

            <div className="summary-value">
              {approvedUidCount}
            </div>

            <div className="summary-description">
              Department UID approvals
            </div>
          </div>

          <div
            className="hod-summary-card research-card"
            onClick={() => handleNavigation("publications")}
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
              Research
            </div>

            <div className="summary-value">
              —
            </div>

            <div className="summary-description">
              Explore department publications
            </div>
          </div>

        </section>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}
        <section className="hod-section">
          <div className="hod-section-header">
            <div>
              <h2>Quick Actions</h2>
              <p>
                Access frequently used department functions
              </p>
            </div>
          </div>

          <div className="hod-quick-actions">

            <button
              className="quick-action-card"
              onClick={() => handleNavigation("requests")}
            >
              <span className="quick-action-icon blue">
                📨
              </span>

              <span className="quick-action-text">
                <strong>Review UID Requests</strong>
                <small>
                  {pendingUidCount} request
                  {pendingUidCount !== 1 ? "s" : ""} pending
                </small>
              </span>

              <span className="quick-action-arrow">
                →
              </span>
            </button>

            <button
              className="quick-action-card"
              onClick={() => handleNavigation("faculty")}
            >
              <span className="quick-action-icon purple">
                👥
              </span>

              <span className="quick-action-text">
                <strong>View Faculty</strong>
                <small>
                  Manage department faculty information
                </small>
              </span>

              <span className="quick-action-arrow">
                →
              </span>
            </button>

            <button
              className="quick-action-card"
              onClick={() => handleNavigation("publications")}
            >
              <span className="quick-action-icon green">
                📚
              </span>

              <span className="quick-action-text">
                <strong>Department Publications</strong>
                <small>
                  Explore research publications
                </small>
              </span>

              <span className="quick-action-arrow">
                →
              </span>
            </button>
            
            <button
                className="quick-action-card"
                onClick={() => handleNavigation("analytics")}
              >
                <span className="quick-action-icon blue">
                  📊
                </span>

                <span className="quick-action-text">
                  <strong>Research Analytics</strong>
                  <small>
                    View department research insights and statistics
                  </small>
                </span>

                <span className="quick-action-arrow">
                  →
                </span>
            </button>

            <button
              className="quick-action-card"
              onClick={handleNotificationClick}
            >
              <span className="quick-action-icon orange">
                🔔
              </span>

              <span className="quick-action-text">
                <strong>Notifications</strong>
                <small>
                  {notifCount > 0
                    ? `${notifCount} unread notification${
                        notifCount !== 1 ? "s" : ""
                      }`
                    : "You're all caught up"}
                </small>
              </span>

              <span className="quick-action-arrow">
                →
              </span>
            </button>

          </div>
        </section>

    

        <section className="hod-analytics-grid">

          {/* UID WORKFLOW */}
          <div className="hod-panel uid-overview-panel">

            <div className="hod-panel-header">
              <div>
                <h2>UID Approval Overview</h2>
                <p>
                  Current department approval workflow
                </p>
              </div>

              <span className="panel-icon">
                🎯
              </span>
            </div>

            <div className="uid-overview-content">

              <div className="approval-circle">
                <div
                  className="approval-circle-progress"
                  style={{
                    "--approval": `${approvalRate * 3.6}deg`,
                  }}
                >
                  <div className="approval-circle-inner">
                    <strong>{approvalRate}%</strong>
                    <span>Approved</span>
                  </div>
                </div>
              </div>

              <div className="uid-stat-list">

                <div className="uid-stat-item">
                  <div className="uid-stat-label">
                    <span className="status-dot approved-dot"></span>
                    Approved
                  </div>

                  <strong>
                    {approvedUidCount}
                  </strong>
                </div>

                <div className="uid-stat-item">
                  <div className="uid-stat-label">
                    <span className="status-dot pending-dot"></span>
                    Pending
                  </div>

                  <strong>
                    {pendingUidCount}
                  </strong>
                </div>

                <div className="uid-stat-item total-stat">
                  <div className="uid-stat-label">
                    Total Requests
                  </div>

                  <strong>
                    {totalUidRequests}
                  </strong>
                </div>

              </div>

            </div>

            <div className="approval-progress-wrapper">
              <div className="approval-progress-header">
                <span>Approval progress</span>
                <strong>{approvalRate}%</strong>
              </div>

              <div className="approval-progress">
                <div
                  className="approval-progress-fill"
                  style={{
                    width: `${approvalRate}%`,
                  }}
                ></div>
              </div>
            </div>

          </div>

          {/* DEPARTMENT SNAPSHOT */}
          <div className="hod-panel department-snapshot-panel">

            <div className="hod-panel-header">
              <div>
                <h2>Department Snapshot</h2>
                <p>
                  Quick view of your department
                </p>
              </div>

              <span className="panel-icon">
                📊
              </span>
            </div>

            <div className="snapshot-list">

              <div className="snapshot-item">
                <div className="snapshot-icon faculty-bg">
                  👥
                </div>

                <div className="snapshot-info">
                  <span>Faculty Members</span>
                  <small>
                    Registered in department
                  </small>
                </div>

                <strong>
                  {facultyCount}
                </strong>
              </div>

              <div className="snapshot-item">
                <div className="snapshot-icon pending-bg">
                  📨
                </div>

                <div className="snapshot-info">
                  <span>Pending Requests</span>
                  <small>
                    Requires your attention
                  </small>
                </div>

                <strong>
                  {pendingUidCount}
                </strong>
              </div>

              <div className="snapshot-item">
                <div className="snapshot-icon approved-bg">
                  ✓
                </div>

                <div className="snapshot-info">
                  <span>Approved Requests</span>
                  <small>
                    Successfully approved
                  </small>
                </div>

                <strong>
                  {approvedUidCount}
                </strong>
              </div>

            </div>

            <button
              className="panel-link-button"
              onClick={() => handleNavigation("requests")}
            >
              Open UID Management
              <span>→</span>
            </button>

          </div>

        </section>

        {/* =====================================================
            UID WORKFLOW
        ===================================================== */}
        <section className="hod-panel workflow-panel">

          <div className="hod-panel-header">
            <div>
              <h2>UID Workflow</h2>
              <p>
                Understand the current request flow
              </p>
            </div>

            <span className="panel-icon">
              🔄
            </span>
          </div>

          <div className="workflow-container">

            <div className="workflow-step completed">
              <div className="workflow-number">
                1
              </div>

              <div>
                <strong>Faculty Submission</strong>
                <span>
                  Researcher submits UID request
                </span>
              </div>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step active-step">
              <div className="workflow-number">
                2
              </div>

              <div>
                <strong>HOD Review</strong>
                <span>
                  Department-level verification
                </span>
              </div>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <div className="workflow-number">
                3
              </div>

              <div>
                <strong>Further Approval</strong>
                <span>
                  Request moves through workflow
                </span>
              </div>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <div className="workflow-number">
                4
              </div>

              <div>
                <strong>UID Completion</strong>
                <span>
                  Research request completed
                </span>
              </div>
            </div>

          </div>

        </section>

        {/* =====================================================
            RECENT NOTIFICATIONS
        ===================================================== */}
        <section className="hod-panel notifications-preview">

          <div className="hod-panel-header">
            <div>
              <h2>Recent Notifications</h2>
              <p>
                Latest updates related to your account
              </p>
            </div>

            <button
              className="view-all-button"
              onClick={handleNotificationClick}
            >
              View All →
            </button>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="empty-notifications">
              <div className="empty-notification-icon">
                🔔
              </div>

              <h3>No recent notifications</h3>

              <p>
                You're all caught up. New updates will
                appear here.
              </p>
            </div>
          ) : (
            <div className="recent-notification-list">

              {recentNotifications.map((notification) => (
                <div
                  className={`recent-notification-item ${
                    notification.isRead ? "read" : "unread"
                  }`}
                  key={notification._id}
                >
                  <div className="notification-status-icon">
                    {notification.isRead ? "✓" : "•"}
                  </div>

                  <div className="notification-content">
                    <p>
                      {notification.message}
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
              ))}

            </div>
          )}

        </section>

      </div>
    );
  };

  /* =========================================================
     MAIN RENDER
  ========================================================= */
  return (
    <div className="hod-dashboard">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="sidebar-brand-icon">
            RP
          </div>

          <div>
            <strong>RPMS</strong>
            <span>Research Management</span>
          </div>

        </div>

        <div className="sidebar-role">
          <span className="role-dot"></span>
          HOD Portal
        </div>

        <nav className="sidebar-navigation">

          <p className="nav-section-title">
            MAIN
          </p>

          <button
            className={`sidebar-item ${
              activeSection === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => handleNavigation("dashboard")}
          >
            <span className="sidebar-icon">▣</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "requests"
                ? "active"
                : ""
            }`}
            onClick={() => handleNavigation("requests")}
          >
            <span className="sidebar-icon">📨</span>
            <span>Pending UID Requests</span>

            {pendingUidCount > 0 && (
              <span className="sidebar-count">
                {pendingUidCount}
              </span>
            )}
          </button>

          <button
  className={`sidebar-item ${
    activeSection === "uid-status" ? "active" : ""
  }`}
  onClick={() => handleNavigation("uid-status")}
>
  <span className="sidebar-icon">📋</span>
  <span>UID Status</span>
</button>

          <button
            className={`sidebar-item ${
              activeSection === "publications"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("publications")
            }
          >
            <span className="sidebar-icon">📚</span>
            <span>Department Publications</span>
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "faculty"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("faculty")
            }
          >
            <span className="sidebar-icon">👥</span>
            <span>Faculty</span>
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "analytics"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("analytics")
            }
          >
            <span className="sidebar-icon">📊</span>
            <span>Analytics</span>
          </button>

          <p className="nav-section-title account-title">
            ACCOUNT
          </p>

          <button
            className={`sidebar-item ${
              activeSection === "notifications"
                ? "active"
                : ""
            }`}
            onClick={handleNotificationClick}
          >
            <span className="sidebar-icon">🔔</span>
            <span>Notifications</span>

            {notifCount > 0 && (
              <span className="sidebar-count notification-count">
                {notifCount}
              </span>
            )}
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("profile")
            }
          >
            <span className="sidebar-icon">👤</span>
            <span>Profile</span>
          </button>

        </nav>

        {/* ===================================================
            SIDEBAR BOTTOM
        =================================================== */}
        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <img
  src={
    hodProfile?.profilePic
      ? hodProfile.profilePic.startsWith("http")
        ? hodProfile.profilePic
        : `${API_BASE_URL}/${hodProfile.profilePic.replace(/^\/+/, "")}`
      : "/default-profile.png"
  }
  alt="HOD"
              onError={(e) => {
                e.target.src =
                  "/default-profile.png";
              }}
            />

            <div>
              <strong>
                {hodProfile?.fullName || "HOD"}
              </strong>

              <span>
                {hodProfile?.department || "Department"}
              </span>
            </div>

          </div>

          <button
            className="sidebar-logout"
            onClick={() =>
              handleNavigation("logout")
            }
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}
      <main className="hod-main">

        {/* ===================================================
            TOP HEADER
        =================================================== */}
        <header className="hod-top-header">

          <button
            className="mobile-menu-btn"
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className="header-title-area">

            <span className="header-page-label">
              {activeSection === "dashboard"
                ? "Dashboard"
                : activeSection === "requests"
                ? "UID Requests"
                : activeSection === "uid-status"
                ? "UID Status"
                : activeSection === "publications"
                ? "Department Publications"
                : activeSection === "faculty"
                ? "Faculty"
                 : activeSection === "analytics"
                ? "Analytics"
                : activeSection === "notifications"
                ? "Notifications"
                : "Profile"}
            </span>

            <span className="header-separator">
              /
            </span>

            <span className="header-department">
              {hodProfile?.department || "Department"}
            </span>

          </div>

          <div className="header-actions">

            <button
              className="header-notification-button"
              onClick={handleNotificationClick}
              aria-label="Notifications"
            >
              🔔

              {notifCount > 0 && (
                <span className="header-notification-badge">
                  {notifCount > 9
                    ? "9+"
                    : notifCount}
                </span>
              )}
            </button>

            <button
              className="header-profile-button"
              onClick={() =>
                handleNavigation("profile")
              }
            >
              <img
  src={
    hodProfile?.profilePic
      ? hodProfile.profilePic.startsWith("http")
        ? hodProfile.profilePic
        : `${API_BASE_URL}/${hodProfile.profilePic.replace(/^\/+/, "")}`
      : "/default-profile.png"
  }
  alt="Profile"
                onError={(e) => {
                  e.target.src =
                    "/default-profile.png";
                }}
              />

              <div className="header-profile-info">
                <strong>
                  {hodProfile?.fullName || "HOD"}
                </strong>

                <span>
                  Head of Department
                </span>
              </div>

              <span className="profile-chevron">
                ▾
              </span>
            </button>

          </div>

        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}
        <div className="hod-content">

          {loadingProfile && !hodProfile ? (
            <div className="hod-loading">
              <div className="loading-spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          ) : error && !hodProfile ? (
            <div className="hod-error">
              <div>⚠️</div>
              <h3>Unable to load dashboard</h3>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {activeSection === "dashboard" &&
                renderDashboard()}

              {activeSection === "notifications" && (
                <NotificationsSection
                  userId={userId}
                />
              )}

              {activeSection === "publications" &&
                hodProfile && (
                  <DepartmentPublicationsSection
                    department={
                      hodProfile.department
                    }
                  />
                )}

              {activeSection === "faculty" &&
                hodProfile && (
                  <HodFacultySection
                    hodProfile={hodProfile}
                  />
                )}

                {activeSection === "analytics" &&
  hodProfile && (
    <HodAnalytics
    facultyCount={facultyCount}
    pendingUidCount={pendingUidCount}
    approvedUidCount={approvedUidCount}
      department={hodProfile.department}
    />
  )}

              {activeSection === "requests" && (
                <>
                  <HodUidApproval />
                </>
              )}

              {activeSection === "uid-status" && (
  <HODUIDStatusList
  userId={userId}
    department={hodProfile?.department}
  />
)}

              {activeSection === "profile" &&
                hodProfile && (
                  <ProfileSection
                    facultyDetails={hodProfile}
                  />
                )}
            </>
          )}

        </div>

      </main>
    </div>
  );
}