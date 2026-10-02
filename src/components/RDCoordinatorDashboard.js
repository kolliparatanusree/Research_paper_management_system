// src/pages/RDCoordinatorDashboard.js

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HodDashboard.css";
import HODUIDStatusList from "./HODUIDStatusList";

import axios from "axios";
import Swal from "sweetalert2";

import ProfileSection from "./faculty/ProfileSection";
import DepartmentPublicationsSection from "./DepartmentPublicationsSection";
import HodFacultySection from "./HodFacultySection";
import NotificationsSection from "./NotificationsSection";
import HodAnalytics from "./HodAnalytics";

import RDcoordinatorUidApproval from "./RDcoordinatorUidApproval";

// If you have an RD-specific UID status component,
// import it here and replace HODUIDStatusList below.
// import RDCoordinatorUIDStatusList from "./RDCoordinatorUIDStatusList";


export default function RDCoordinatorDashboard() {

  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [rdProfile, setRdProfile] = useState(null);
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

    fetch(`/api/notifications/${userId}`)
      .then((res) => res.json())
      .then((data) => {

        if (Array.isArray(data)) {
          setNotifications(data);
        }

      })
      .catch((err) =>
        console.error(
          "Notification fetch error:",
          err
        )
      );

  }, [userId]);


  /* =========================================================
     FETCH UNREAD NOTIFICATION COUNT
  ========================================================= */

  const fetchNotificationCount = async () => {

    if (!userId) return;

    try {

      const res = await fetch(
        `/api/auth/notifications/unread-count/${userId}`
      );

      const data = await res.json();

      setNotifCount(data.count || 0);

    } catch (err) {

      console.error(
        "Unread notification count error:",
        err
      );

    }

  };


  useEffect(() => {

    fetchNotificationCount();

  }, [userId]);


  /* =========================================================
     FETCH RD COORDINATOR PROFILE
  ========================================================= */

  useEffect(() => {

    if (!userId) {

      console.error(
        "No RD Coordinator ID found in localStorage"
      );

      setError(
        "No RD Coordinator ID found. Please login again."
      );

      setLoadingProfile(false);

      return;
    }


    const fetchRdProfile = async () => {

      try {

        setLoadingProfile(true);

        const res = await axios.get(
          `/api/faculty/${userId}`
        );

        const data = res.data;

        setRdProfile({

          fullName: data.fullName,

          userId: data.userId,

          department: data.department,

          email: data.email,

          phoneNumber: data.phoneNumber,

          gender: data.gender,

          profilePic: data.profilePic,

        });

      } catch (err) {

        console.error(
          "Error fetching RD Coordinator profile:",
          err
        );

        setError(
          "Failed to fetch RD Coordinator profile."
        );

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch RD Coordinator profile",
        });

      } finally {

        setLoadingProfile(false);

      }

    };


    fetchRdProfile();

  }, [userId]);


  /* =========================================================
     FETCH DEPARTMENT COUNTS
  ========================================================= */

  useEffect(() => {

    if (!rdProfile?.department) return;

    const department = rdProfile.department;


    const fetchCounts = async () => {

      try {

        const [
          facultyRes,
          pendingRes,
          approvedRes
        ] = await Promise.all([

          // Same faculty count as HOD
          axios.get(
            `/api/faculty/count/${department}`
          ),

          // RD COORDINATOR pending UID
          axios.get(
            `/api/rdcoordinator/uid/pending/${department}`
          ),

          // RD COORDINATOR approved UID
          axios.get(
            `/api/rdcoordinator/uid/approved/${department}`
          ),

        ]);


        setFacultyCount(
          facultyRes.data.count || 0
        );

        setPendingUidCount(
          pendingRes.data.count || 0
        );

        setApprovedUidCount(
          approvedRes.data.count || 0
        );

      } catch (err) {

        console.error(
          "RD Coordinator dashboard count error:",
          err
        );

      }

    };


    fetchCounts();

  }, [rdProfile]);


  /* =========================================================
     UID APPROVAL CALCULATIONS
  ========================================================= */

  const totalUidRequests =
    pendingUidCount +
    approvedUidCount;


  const pendingRate =
    totalUidRequests > 0
      ? Math.round(
          (pendingUidCount /
            totalUidRequests) *
            100
        )
      : 0;


  /* =========================================================
     RECENT NOTIFICATIONS
  ========================================================= */

  const recentNotifications = useMemo(() => {

    return [...notifications]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 4);

  }, [notifications]);


  /* =========================================================
     TIME BASED GREETING
  ========================================================= */

  const greeting = useMemo(() => {

    const hour = new Date().getHours();

    if (hour < 12)
      return "Good Morning";

    if (hour < 17)
      return "Good Afternoon";

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

          text:
            "You have successfully logged out!",

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

      await axios.put(
        `/api/auth/notifications/mark-read/${userId}`
      );

      setNotifCount(0);

    } catch (err) {

      console.error(
        "Unable to mark notifications as read:",
        err
      );

    }

  };


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatNotificationDate = (date) => {

    if (!date) return "";

    const notificationDate =
      new Date(date);


    if (
      Number.isNaN(
        notificationDate.getTime()
      )
    ) {

      return "";

    }


    return notificationDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  /* =========================================================
     CHART DATA
     SAME AS HOD
  ========================================================= */

  const uidChartData = [

    {
      name: "Approved",
      value: approvedUidCount || 0,
    },

    {
      name: "Pending",
      value: pendingUidCount || 0,
    },

  ];


  const departmentChartData = [

    {
      name: "Faculty",
      value: facultyCount || 0,
    },

    {
      name: "Approved UID",
      value: approvedUidCount || 0,
    },

    {
      name: "Pending UID",
      value: pendingUidCount || 0,
    },

  ];


  const totalUid =
    (approvedUidCount || 0) +
    (pendingUidCount || 0);


  const approvalRate =
    totalUid > 0
      ? Math.round(
          ((approvedUidCount || 0) /
            totalUid) *
            100
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

                {rdProfile?.fullName ||
                  "RD Coordinator"}

                {" "}

                <span className="wave">
                  👋
                </span>

              </h1>

              <p className="hod-welcome-subtitle">

                Here's an overview of your
                department's research activities
                and UID workflow.

              </p>

            </div>


            <div className="department-badge">

              <span className="department-icon">
                🏛️
              </span>

              <div>

                <small>
                  Department
                </small>

                <strong>
                  {rdProfile?.department ||
                    "Department"}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <section className="hod-summary-grid">


          {/* FACULTY */}

          <div
            className="hod-summary-card faculty1-card"
            onClick={() =>
              handleNavigation("faculty")
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
              Faculty
            </div>

            <div className="summary-value">
              {facultyCount}
            </div>

            <div className="summary-description">
              Department faculty members
            </div>

          </div>


          {/* PENDING */}

          <div
            className="hod-summary-card pending-card"
            onClick={() =>
              handleNavigation("requests")
            }
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


          {/* APPROVED */}

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


          {/* RESEARCH */}

          <div
            className="hod-summary-card research-card"
            onClick={() =>
              handleNavigation("publications")
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

              <h2>
                Quick Actions
              </h2>

              <p>
                Access frequently used department
                functions
              </p>

            </div>

          </div>


          <div className="hod-quick-actions">


            {/* UID */}

            <button
              className="quick-action-card"
              onClick={() =>
                handleNavigation("requests")
              }
            >

              <span className="quick-action-icon blue">
                📨
              </span>

              <span className="quick-action-text">

                <strong>
                  Review UID Requests
                </strong>

                <small>

                  {pendingUidCount} request
                  {pendingUidCount !== 1
                    ? "s"
                    : ""}{" "}
                  pending

                </small>

              </span>

              <span className="quick-action-arrow">
                →
              </span>

            </button>


            {/* FACULTY */}

            <button
              className="quick-action-card"
              onClick={() =>
                handleNavigation("faculty")
              }
            >

              <span className="quick-action-icon purple">
                👥
              </span>

              <span className="quick-action-text">

                <strong>
                  View Faculty
                </strong>

                <small>
                  Manage department faculty
                  information
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
                handleNavigation("publications")
              }
            >

              <span className="quick-action-icon green">
                📚
              </span>

              <span className="quick-action-text">

                <strong>
                  Department <br/> Publications
                </strong>

                <small>
                  Explore research publications
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
                handleNavigation("analytics")
              }
            >

              <span className="quick-action-icon blue">
                📊
              </span>

              <span className="quick-action-text">

                <strong>
                  Research <br/> Analytics
                </strong>

                <small>
                  View department research
                  insights and statistics
                </small>

              </span>

              <span className="quick-action-arrow">
                →
              </span>

            </button>


            {/* NOTIFICATIONS */}

            <button
              className="quick-action-card"
              onClick={
                handleNotificationClick
              }
            >

              <span className="quick-action-icon orange">
                🔔
              </span>

              <span className="quick-action-text">

                <strong>
                  Notifications
                </strong>

                <small>

                  {notifCount > 0

                    ? `${notifCount} unread notification${
                        notifCount !== 1
                          ? "s"
                          : ""
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


        {/* =====================================================
            ANALYTICS
        ===================================================== */}

        <section className="hod-analytics-grid">


          {/* UID WORKFLOW */}

          <div className="hod-panel uid-overview-panel">

            <div className="hod-panel-header">

              <div>

                <h2>
                  UID Approval Overview
                </h2>

                <p>
                  Current department approval
                  workflow
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
                    "--approval":
                      `${approvalRate * 3.6}deg`,
                  }}
                >

                  <div className="approval-circle-inner">

                    <strong>
                      {approvalRate}%
                    </strong>

                    <span>
                      Approved
                    </span>

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

                <span>
                  Approval progress
                </span>

                <strong>
                  {approvalRate}%
                </strong>

              </div>


              <div className="approval-progress">

                <div
                  className="approval-progress-fill"
                  style={{
                    width:
                      `${approvalRate}%`,
                  }}
                ></div>

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

                  <span>
                    Faculty Members
                  </span>

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

                  <span>
                    Pending Requests
                  </span>

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

                  <span>
                    Approved Requests
                  </span>

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
              onClick={() =>
                handleNavigation("requests")
              }
            >

              Open UID Management

              <span>
                →
              </span>

            </button>

          </div>

        </section>


        {/* =====================================================
            UID WORKFLOW
        ===================================================== */}

        <section className="hod-panel workflow-panel">

          <div className="hod-panel-header">

            <div>

              <h2>
                UID Workflow
              </h2>

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

                <strong>
                  Faculty Submission
                </strong>

                <span>
                  Researcher submits UID request
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
                  HOD Review
                </strong>

                <span>
                  Department-level verification
                </span>

              </div>

            </div>


            <div className="workflow-line"></div>


            <div className="workflow-step active-step">

              <div className="workflow-number">
                3
              </div>

              <div>

                <strong>
                  RD Coordinator Review
                </strong>

                <span>
                  Research-level verification
                </span>

              </div>

            </div>


            <div className="workflow-line"></div>


            <div className="workflow-step">

              <div className="workflow-number">
                4
              </div>

              <div>

                <strong>
                  Further Approval
                </strong>

                <span>
                  Request moves through workflow
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

              <h2>
                Recent Notifications
              </h2>

              <p>
                Latest updates related to your
                account
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


          {recentNotifications.length === 0 ? (

            <div className="empty-notifications">

              <div className="empty-notification-icon">
                🔔
              </div>

              <h3>
                No recent notifications
              </h3>

              <p>
                You're all caught up. New updates
                will appear here.
              </p>

            </div>

          ) : (

            <div className="recent-notification-list">

              {recentNotifications.map(
                (notification) => (

                  <div
                    className={`recent-notification-item ${
                      notification.isRead
                        ? "read"
                        : "unread"
                    }`}
                    key={notification._id}
                  >

                    <div className="notification-status-icon">

                      {notification.isRead
                        ? "✓"
                        : "•"}

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

                )
              )}

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
          onClick={() =>
            setSidebarOpen(false)
          }
        ></div>

      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "open"
            : ""
        }`}
      >


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


        <div className="sidebar-role">

          <span className="role-dot"></span>

          RD Coordinator Portal

        </div>


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


          {/* REQUESTS */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "requests"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "requests"
              )
            }
          >

            <span className="sidebar-icon">
              📨
            </span>

            <span>
              Pending UID Requests
            </span>


            {pendingUidCount > 0 && (

              <span className="sidebar-count">
                {pendingUidCount}
              </span>

            )}

          </button>


          {/* UID STATUS */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "uid-status"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "uid-status"
              )
            }
          >

            <span className="sidebar-icon">
              📋
            </span>

            <span>
              UID Status
            </span>

          </button>


          {/* PUBLICATIONS */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "publications"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "publications"
              )
            }
          >

            <span className="sidebar-icon">
              📚
            </span>

            <span>
              Department Publications
            </span>

          </button>


          {/* FACULTY */}

          <button
            className={`sidebar-item ${
              activeSection ===
              "faculty"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "faculty"
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


            {notifCount > 0 && (

              <span className="sidebar-count notification-count">

                {notifCount}

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


        {/* ===================================================
            SIDEBAR BOTTOM
        =================================================== */}

        <div className="sidebar-bottom">


          <div className="sidebar-user">

            <img
              src={
                rdProfile?.profilePic
                  ? `/${rdProfile.profilePic}`
                  : "/default-profile.png"
              }
              alt="RD Coordinator"
              onError={(e) => {

                e.target.src =
                  "/default-profile.png";

              }}
            />


            <div>

              <strong>

                {rdProfile?.fullName ||
                  "RD Coordinator"}

              </strong>


              <span>

                {rdProfile?.department ||
                  "Department"}

              </span>

            </div>

          </div>


          <button
            className="sidebar-logout"
            onClick={() =>
              handleNavigation("logout")
            }
          >

            <span>
              ↪
            </span>

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
                  "requests"

                ? "UID Requests"

                : activeSection ===
                  "uid-status"

                ? "UID Status"

                : activeSection ===
                  "publications"

                ? "Department Publications"

                : activeSection ===
                  "faculty"

                ? "Faculty"

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

              {rdProfile?.department ||
                "Department"}

            </span>

          </div>


          <div className="header-actions">


            <button
              className="header-notification-button"
              onClick={
                handleNotificationClick
              }
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
                handleNavigation(
                  "profile"
                )
              }
            >

              <img
                src={
                  rdProfile?.profilePic
                    ? `/${rdProfile.profilePic}`
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

                  {rdProfile?.fullName ||
                    "RD Coordinator"}

                </strong>


                <span>
                  RD Coordinator
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


          {loadingProfile &&
          !rdProfile ? (

            <div className="hod-loading">

              <div className="loading-spinner"></div>

              <p>
                Loading dashboard...
              </p>

            </div>

          ) : error &&
            !rdProfile ? (

            <div className="hod-error">

              <div>
                ⚠️
              </div>

              <h3>
                Unable to load dashboard
              </h3>

              <p>
                {error}
              </p>

            </div>

          ) : (

            <>


              {/* DASHBOARD */}

              {activeSection ===
                "dashboard" &&
                renderDashboard()}


              {/* NOTIFICATIONS */}

              {activeSection ===
                "notifications" && (

                <NotificationsSection
                  userId={userId}
                />

              )}


              {/* PUBLICATIONS */}

              {activeSection ===
                "publications" &&
                rdProfile && (

                  <DepartmentPublicationsSection
                    department={
                      rdProfile.department
                    }
                  />

                )}


              {/* FACULTY */}

              {activeSection ===
                "faculty" &&
                rdProfile && (

                  <HodFacultySection
                    hodProfile={
                      rdProfile
                    }
                  />

                )}


              {/* ANALYTICS */}

              {activeSection ===
                "analytics" &&
                rdProfile && (

                  <HodAnalytics

                    facultyCount={
                      facultyCount
                    }

                    pendingUidCount={
                      pendingUidCount
                    }

                    approvedUidCount={
                      approvedUidCount
                    }

                    department={
                      rdProfile.department
                    }

                  />

                )}


              {/* RD UID REQUESTS */}

              {activeSection ===
                "requests" && (

                <RDcoordinatorUidApproval />

              )}


              {/* UID STATUS */}

              {activeSection ===
                "uid-status" && (
                  <HODUIDStatusList
    userId={userId}
    department={rdProfile?.department}
  />

              )}


              {/* PROFILE */}

              {activeSection ===
                "profile" &&
                rdProfile && (

                  <ProfileSection
                    facultyDetails={
                      rdProfile
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

// // src/pages/RDCoordinatorDashboard.js
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './HodDashboard.css'; // reuse the same CSS
// import CustomNavbar from './CustomNavbar';
// import ProfileSection from './faculty/ProfileSection';
// import DepartmentPublicationsSection from './DepartmentPublicationsSection';
// import HodFacultySection from './HodFacultySection';
// import Swal from 'sweetalert2';
// import axios from 'axios';
// import NotificationsSection from './NotificationsSection';
// import RDcoordinatorUidApproval from './RDcoordinatorUidApproval'; // RD Coordinator version of UID approval

// export default function RDCoordinatorDashboard() {
//   const [activeSection, setActiveSection] = useState('dashboard');
//   const [profile, setProfile] = useState(null);
//   const [loadingProfile, setLoadingProfile] = useState(true);
//   const [error, setError] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const navigate = useNavigate();
//   const userId = localStorage.getItem('userId');
//   const [notifCount, setNotifCount] = useState(0);

//   const [facultyCount, setFacultyCount] = useState(0);
//   const [pendingUidCount, setPendingUidCount] = useState(0);
//   const [approvedUidCount, setApprovedUidCount] = useState(0);

//  useEffect(() => {
//   const interval = setInterval(() => {
//     if (!userId) return;

//     axios
//       .get(`/api/auth/notifications/unread-count/${userId}`)
//       .then((res) => setNotifCount(res.data.count))
//       .catch((err) => console.error(err));
//   }, 10000);

//   return () => clearInterval(interval);
// }, [userId]);
//   // Fetch notifications
//   // useEffect(() => {
//   //   if (!userId) return;
//   //   axios.get(`/api/notifications/${userId}`)
//   //     .then(res => setNotifications(res.data))
//   //     .catch(err => console.error(err));
//   // }, []);

//   // Fetch department-wise counts
//   useEffect(() => {
//     if (!profile?.department) return;
//     const department = profile.department;

//     axios.get(`/api/faculty/count/${department}`)
//       .then(res => setFacultyCount(res.data.count));

//     // Pending UID requests for RD Coordinator (after HOD approval)
//     axios.get(`/api/rdcoordinator/uid/pending/${department}`)
//       .then(res => setPendingUidCount(res.data.count));

//     axios.get(`/api/rdcoordinator/uid/approved/${department}`)
//       .then(res => setApprovedUidCount(res.data.count));

//   }, [profile]);

//   // Fetch RD Coordinator profile
//   useEffect(() => {
//     if (!userId) {
//       setError('No RD Coordinator ID found. Please login again.');
//       setLoadingProfile(false);
//       return;
//     }

//     const fetchProfile = async () => {
//       try {
//         Swal.fire({
//           title: 'Loading Profile...',
//           text: 'Please wait',
//           allowOutsideClick: false,
//           didOpen: () => Swal.showLoading(),
//         });

//         setLoadingProfile(true);
//         const res = await axios.get(`/api/faculty/${userId}`);
//         const data = res.data;

//         setProfile({
//           fullName: data.fullName,
//           userId: data.userId,
//           department: data.department,
//           email: data.email,
//           phoneNumber: data.phoneNumber,
//           gender: data.gender
//         });

//         Swal.close();
//       } catch (err) {
//         console.error('Error fetching profile:', err);
//         Swal.close();
//         Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch profile' });
//         setError('Failed to fetch profile.');
//       } finally {
//         setLoadingProfile(false);
//       }
//     };

//     fetchProfile();
//   }, [userId]);

//   const handleNavigation = (section) => {
//     if (section === 'logout') {
//       localStorage.clear();
//       Swal.fire({
//         title: 'Are you sure?',
//         text: "Do you really want to log out?",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonText: 'Yes, log me out',
//         cancelButtonText: 'Cancel',
//         confirmButtonColor: '#10b981',
//         cancelButtonColor: '#f87171',
//       }).then((result) => {
//         if (result.isConfirmed) {
//           Swal.fire({
//             icon: 'success',
//             title: 'Logged Out',
//             text: 'You have successfully logged out!',
//             timer: 2000,
//             showConfirmButton: false
//           }).then(() => navigate('/login'));
//         }
//       });
//       return;
//     }
//     setActiveSection(section);
//   };

//   return (
//     <>
//       {/* <CustomNavbar /> */}
//       <div className="hod-dashboard">
//         {/* Sidebar */}
//         <div className="sidebar">
//           <h2>RD Coordinator Dashboard</h2>
//           <ul>
//             <li onClick={() => setActiveSection('dashboard')}>📊 Dashboard</li>
//             <li className={activeSection === 'requests' ? 'active' : ''} onClick={() => handleNavigation('requests')}>📨 UID Approvals</li>
//             <li className={activeSection === 'publications' ? 'active' : ''} onClick={() => handleNavigation('publications')}>📚 Department Publications</li>
//             <li className={activeSection === 'faculty' ? 'active' : ''} onClick={() => handleNavigation('faculty')}>👥 View Faculty Details</li>
//             <li className={activeSection === 'profile' ? 'active' : ''} onClick={() => handleNavigation('profile')}>👤 Profile</li>
//             <li onClick={() => handleNavigation('logout')} style={{ cursor: 'pointer', color: 'white', marginTop: 'auto' }}>🔚 Logout</li>
//           </ul>
//         </div>

//         {/* Main Content */}
//         <div className="main-content">
//           <div className="top-header">
//   <p className="welcome-text">
//     Welcome, {profile?.fullName || "RD Coordinator"}
//   </p>

//   <div className="right-section">
//     {/* Notification */}
//     <button
//       className="notification-btn"
//       onClick={async () => {
//   setActiveSection("notifications");
//   setNotifCount(0);

//   try {
//     await axios.put(`/api/auth/notifications/mark-read/${userId}`);
//   } catch (err) {
//     console.error(err);
//   }
// }}
//     >
//       🔔
//       {notifCount > 0 && (
//         <span className="notif-badge">{notifCount}</span>
//       )}
//     </button>

//     {/* Profile Pic */}
//     <img
//       src={
//         profile?.profilePic
//           ? `/${profile.profilePic}`
//           : "/default-profile.png"
//       }
//       alt="Profile"
//       className="profile-small"
//       onClick={() => setActiveSection("profile")}
//       onError={(e) => {
//         e.target.src = "/default-profile.png";
//       }}
//     />
//   </div>
// </div>
//           {activeSection === 'notifications' && (
//   <NotificationsSection userId={userId} />
// )}
//           {activeSection === 'dashboard' && (
//             <div className="dashboard-cards">
//               <div className="dashboard-card">
//                 <h3>👨‍🏫 Faculty</h3>
//                 <p>{facultyCount}</p>
//               </div>
//               <div className="dashboard-card">
//                 <h3>📨 Pending UID</h3>
//                 <p>{pendingUidCount}</p>
//               </div>
//               <div className="dashboard-card">
//                 <h3>✅ Approved UID</h3>
//                 <p>{approvedUidCount}</p>
//               </div>

//               {/* <div className="top-bar">
//                 <button className="notification-btn" onClick={handleNotificationClick}>
//                   🔔 Notifications ({notifications.filter(n => !n.isRead).length})
//                 </button>

//                 {showNotifications && (
//                   <div className="notification-popup">
//                     <div className="notification-header">
//                       <h4>Notifications</h4>
//                       <button className="close-btn" onClick={() => setShowNotifications(false)}>❌</button>
//                     </div>
//                     {notifications.filter(note => !note.isRead).length === 0 ? (
//                       <p>No notifications</p>
//                     ) : (
//                       notifications.filter(note => !note.isRead).map(note => (
//                         <div key={note._id} className="notification-item">
//                           <p>{note.message}</p>
//                           <small>{new Date(note.createdAt).toLocaleString()}</small>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 )}
//               </div> */}
//             </div>
//           )}

//           {activeSection === 'publications' && profile && (
//             <DepartmentPublicationsSection department={profile.department} />
//           )}

//           {activeSection === 'faculty' && profile && (
//             <HodFacultySection hodProfile={profile} />
//           )}

//           {activeSection === 'requests' && <RDcoordinatorUidApproval department={profile?.department} />}

//           {activeSection === 'profile' && profile && (
//             <ProfileSection facultyDetails={profile} />
//           )}
//         </div>
//       </div>
//     </>
//   );
// }