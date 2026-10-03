// src/pages/AdminDashboard.js

import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBarChart2,
  FiUserPlus,
  FiUsers,
  FiUserCheck,
  FiShield,
  FiLogOut,
  FiChevronRight,
  FiRefreshCw,
  FiTrendingUp,
  FiPieChart,
  FiLayers,
  FiActivity,
  FiDatabase,
  FiBriefcase,
  FiGrid,
} from "react-icons/fi";

import AddUserForm from "./AddUserForm";
import RemoveFaculty from "./RemoveFaculty";
import RemoveHOD from "./RemoveHOD";
import RemoveRDCoordinator from "./RemoveRDCoordinator";

import { API_BASE_URL } from "../config.js";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");

  const [faculties, setFaculties] = useState([]);
  const [hods, setHods] = useState([]);
  const [rdCoordinators, setRdCoordinators] = useState([]);

  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  /* =========================================================
     MANAGEMENT MODULES
  ========================================================= */

  const managementModules = [
    {
      id: "addUser",
      label: "User Accounts",
      description: "Create user accounts",
      icon: FiUserPlus,
      accent: "violet",
    },
    {
      id: "viewFaculty",
      label: "Faculty",
      description: "Faculty management",
      icon: FiUsers,
      accent: "blue",
    },
    {
      id: "viewHod",
      label: "HOD",
      description: "HOD management",
      icon: FiUserCheck,
      accent: "cyan",
    },
    {
      id: "viewRdCoordinators",
      label: "R&D Coordinators",
      description: "Research administration",
      icon: FiShield,
      accent: "purple",
    },
  ];

  /* =========================================================
     FETCH ANALYTICS DATA
  ========================================================= */

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);

      const [facultyResponse, hodResponse, rdResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/main-admin/faculties`),
          fetch(`${API_BASE_URL}/api/main-admin/hods`),
          fetch(`${API_BASE_URL}/api/main-admin/rdcoordinators`),
        ]);

      if (!facultyResponse.ok) {
        throw new Error("Failed to fetch faculty data");
      }

      if (!hodResponse.ok) {
        throw new Error("Failed to fetch HOD data");
      }

      if (!rdResponse.ok) {
        throw new Error("Failed to fetch R&D Coordinator data");
      }

      const facultyData = await facultyResponse.json();
      const hodData = await hodResponse.json();
      const rdData = await rdResponse.json();

      setFaculties(Array.isArray(facultyData) ? facultyData : []);
      setHods(Array.isArray(hodData) ? hodData : []);
      setRdCoordinators(Array.isArray(rdData) ? rdData : []);
    } catch (error) {
      console.error("Analytics fetch error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Analytics",
        text: "Could not retrieve the current account statistics.",
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  /* =========================================================
     COMBINED USERS
  ========================================================= */

  const allUsers = useMemo(() => {
    return [
      ...faculties.map((user) => ({
        ...user,
        analyticsRole: "Faculty",
      })),

      ...hods.map((user) => ({
        ...user,
        analyticsRole: "HOD",
      })),

      ...rdCoordinators.map((user) => ({
        ...user,
        analyticsRole: "R&D Coordinator",
      })),
    ];
  }, [faculties, hods, rdCoordinators]);

  /* =========================================================
     ROLE ANALYTICS
  ========================================================= */

  const roleAnalytics = useMemo(() => {
    return [
      {
        label: "Faculty",
        count: faculties.length,
        icon: FiUsers,
        className: "faculty",
      },
      {
        label: "HOD",
        count: hods.length,
        icon: FiUserCheck,
        className: "hod",
      },
      {
        label: "R&D Coordinators",
        count: rdCoordinators.length,
        icon: FiShield,
        className: "coordinator",
      },
    ];
  }, [faculties, hods, rdCoordinators]);

  /* =========================================================
     DEPARTMENT ANALYTICS
  ========================================================= */

  const departmentAnalytics = useMemo(() => {
    const departmentMap = {};

    allUsers.forEach((user) => {
      const department =
        user.department?.trim() || "Not Assigned";

      if (!departmentMap[department]) {
        departmentMap[department] = {
          department,
          total: 0,
          faculty: 0,
          hod: 0,
          coordinator: 0,
        };
      }

      departmentMap[department].total++;

      if (user.analyticsRole === "Faculty") {
        departmentMap[department].faculty++;
      }

      if (user.analyticsRole === "HOD") {
        departmentMap[department].hod++;
      }

      if (user.analyticsRole === "R&D Coordinator") {
        departmentMap[department].coordinator++;
      }
    });

    return Object.values(departmentMap).sort(
      (a, b) => b.total - a.total
    );
  }, [allUsers]);

  /* =========================================================
     GENDER ANALYTICS
  ========================================================= */

  const genderAnalytics = useMemo(() => {
    const genderMap = {};

    allUsers.forEach((user) => {
      const gender = user.gender?.trim() || "Not Specified";

      genderMap[gender] = (genderMap[gender] || 0) + 1;
    });

    return Object.entries(genderMap)
      .map(([gender, count]) => ({
        gender,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [allUsers]);

  /* =========================================================
     TOP DEPARTMENT
  ========================================================= */

  const topDepartment = useMemo(() => {
    if (!departmentAnalytics.length) {
      return {
        department: "—",
        total: 0,
      };
    }

    return departmentAnalytics[0];
  }, [departmentAnalytics]);

  /* =========================================================
     ROLE PERCENTAGE
  ========================================================= */

  const getPercentage = (count) => {
    if (!allUsers.length) return 0;

    return Math.round((count / allUsers.length) * 100);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      localStorage.clear();
      navigate("/login");
    }
  };

  /* =========================================================
     MODULE RENDERING
  ========================================================= */

  const renderActiveModule = () => {
    switch (activeSection) {
      case "addUser":
        return <AddUserForm />;

      case "viewFaculty":
        return <RemoveFaculty />;

      case "viewHod":
        return <RemoveHOD />;

      case "viewRdCoordinators":
        return <RemoveRDCoordinator />;

      default:
        return null;
    }
  };

  /* =========================================================
     DASHBOARD OVERVIEW
  ========================================================= */

  const renderDashboard = () => {
    return (
      <div className="admin-overview">

        {/* HEADER */}
        <div className="admin-overview-header">

          <div>
            <span className="admin-eyebrow">
              ADMINISTRATOR PANEL
            </span>

            <h1>Dashboard Overview</h1>

            <p>
              Monitor users, departments and research administration
              accounts from one place.
            </p>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={fetchAnalyticsData}
            disabled={analyticsLoading}
          >
            <FiRefreshCw
              className={analyticsLoading ? "admin-spin" : ""}
            />
            Refresh
          </button>

        </div>

        {/* SUMMARY CARDS */}
        <div className="admin-summary-grid">

          <div className="admin-summary-card violet">
            <div className="admin-summary-icon">
              <FiDatabase />
            </div>

            <div>
              <span>Total Accounts</span>
              <strong>{allUsers.length}</strong>
              <small>Registered users</small>
            </div>
          </div>

          <div className="admin-summary-card blue">
            <div className="admin-summary-icon">
              <FiUsers />
            </div>

            <div>
              <span>Faculty</span>
              <strong>{faculties.length}</strong>
              <small>
                {getPercentage(faculties.length)}% of accounts
              </small>
            </div>
          </div>

          <div className="admin-summary-card cyan">
            <div className="admin-summary-icon">
              <FiUserCheck />
            </div>

            <div>
              <span>HODs</span>
              <strong>{hods.length}</strong>
              <small>
                {getPercentage(hods.length)}% of accounts
              </small>
            </div>
          </div>

          <div className="admin-summary-card purple">
            <div className="admin-summary-icon">
              <FiShield />
            </div>

            <div>
              <span>R&D Coordinators</span>
              <strong>{rdCoordinators.length}</strong>
              <small>
                {getPercentage(rdCoordinators.length)}% of accounts
              </small>
            </div>
          </div>

        </div>

        {/* QUICK INSIGHTS */}
        <div className="admin-section-heading">
          <div>
            <span>QUICK INSIGHTS</span>
            <h2>Organization Snapshot</h2>
          </div>
        </div>

        <div className="admin-insights-grid">

          <div className="admin-insight-card">
            <div className="admin-insight-icon">
              <FiLayers />
            </div>

            <div>
              <span>Departments</span>
              <strong>{departmentAnalytics.length}</strong>
              <p>Departments represented</p>
            </div>
          </div>

          <div className="admin-insight-card">
            <div className="admin-insight-icon">
              <FiTrendingUp />
            </div>

            <div>
              <span>Largest Department</span>
              <strong>
                {topDepartment.department}
              </strong>
              <p>
                {topDepartment.total} registered account
                {topDepartment.total === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="admin-insight-card">
            <div className="admin-insight-icon">
              <FiActivity />
            </div>

            <div>
              <span>Active User Base</span>
              <strong>{allUsers.length}</strong>
              <p>Accounts currently registered</p>
            </div>
          </div>

        </div>

        {/* ROLE BREAKDOWN */}
        <div className="admin-section-heading">
          <div>
            <span>ACCOUNT DISTRIBUTION</span>
            <h2>User Role Breakdown</h2>
          </div>
        </div>

        <div className="admin-role-breakdown">

          {roleAnalytics.map((role) => {
            const Icon = role.icon;
            const percentage = getPercentage(role.count);

            return (
              <div
                key={role.label}
                className={`admin-role-card ${role.className}`}
              >

                <div className="admin-role-card-top">

                  <div className="admin-role-icon">
                    <Icon />
                  </div>

                  <span>{percentage}%</span>

                </div>

                <div className="admin-role-info">
                  <h3>{role.label}</h3>

                  <strong>{role.count}</strong>

                  <p>registered accounts</p>
                </div>

                <div className="admin-progress-track">
                  <div
                    className="admin-progress-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

              </div>
            );
          })}

        </div>

      </div>
    );
  };

  /* =========================================================
     ANALYTICS
  ========================================================= */

  const renderAnalytics = () => {
    return (
      <div className="admin-analytics">

        {/* ANALYTICS HEADER */}
        <div className="admin-analytics-header">

          <div>
            <span className="admin-eyebrow">
              ADMIN ANALYTICS
            </span>

            <h1>Account Analytics</h1>

            <p>
              Real-time insights generated from faculty, HOD and
              R&D Coordinator account data.
            </p>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={fetchAnalyticsData}
            disabled={analyticsLoading}
          >
            <FiRefreshCw
              className={analyticsLoading ? "admin-spin" : ""}
            />
            Refresh Data
          </button>

        </div>

        {/* ANALYTICS KPI */}
        <div className="analytics-kpi-grid">

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon violet">
              <FiDatabase />
            </div>

            <div>
              <span>Total Accounts</span>
              <strong>{allUsers.length}</strong>
            </div>

            <div className="analytics-kpi-badge">
              100%
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon blue">
              <FiUsers />
            </div>

            <div>
              <span>Faculty</span>
              <strong>{faculties.length}</strong>
            </div>

            <div className="analytics-kpi-badge">
              {getPercentage(faculties.length)}%
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon cyan">
              <FiUserCheck />
            </div>

            <div>
              <span>HODs</span>
              <strong>{hods.length}</strong>
            </div>

            <div className="analytics-kpi-badge">
              {getPercentage(hods.length)}%
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon purple">
              <FiShield />
            </div>

            <div>
              <span>R&D Coordinators</span>
              <strong>{rdCoordinators.length}</strong>
            </div>

            <div className="analytics-kpi-badge">
              {getPercentage(rdCoordinators.length)}%
            </div>
          </div>

        </div>

        {/* ROLE DISTRIBUTION */}
        <div className="analytics-panel">

          <div className="analytics-panel-header">
            <div>
              <span>ROLE DISTRIBUTION</span>
              <h2>Accounts by Role</h2>
            </div>

            <FiPieChart />
          </div>

          <div className="analytics-role-bars">

            {roleAnalytics.map((role) => {
              const Icon = role.icon;
              const percentage = getPercentage(role.count);

              return (
                <div
                  className="analytics-role-row"
                  key={role.label}
                >

                  <div className="analytics-role-label">

                    <div
                      className={`analytics-role-small-icon ${role.className}`}
                    >
                      <Icon />
                    </div>

                    <div>
                      <strong>{role.label}</strong>
                      <span>{role.count} accounts</span>
                    </div>

                  </div>

                  <div className="analytics-bar-area">

                    <div className="analytics-bar-track">
                      <div
                        className={`analytics-bar-fill ${role.className}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <strong>{percentage}%</strong>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* DEPARTMENT ANALYTICS */}
        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <span>DEPARTMENT ANALYTICS</span>
              <h2>Department-wise Accounts</h2>
            </div>

            <FiGrid />

          </div>

          {departmentAnalytics.length === 0 ? (
            <div className="analytics-empty">
              <FiGrid />
              <p>No department data available.</p>
            </div>
          ) : (
            <div className="department-table-wrapper">

              <table className="department-table">

                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total</th>
                    <th>Faculty</th>
                    <th>HOD</th>
                    <th>R&D Coordinator</th>
                    <th>Share</th>
                  </tr>
                </thead>

                <tbody>

                  {departmentAnalytics.map((department) => (

                    <tr key={department.department}>

                      <td>
                        <div className="department-name">
                          <span className="department-dot" />
                          <strong>
                            {department.department}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {department.total}
                        </strong>
                      </td>

                      <td>
                        <span className="table-badge faculty">
                          {department.faculty}
                        </span>
                      </td>

                      <td>
                        <span className="table-badge hod">
                          {department.hod}
                        </span>
                      </td>

                      <td>
                        <span className="table-badge coordinator">
                          {department.coordinator}
                        </span>
                      </td>

                      <td>
                        <div className="table-share">

                          <div className="table-share-track">
                            <div
                              className="table-share-fill"
                              style={{
                                width: `${getPercentage(
                                  department.total
                                )}%`,
                              }}
                            />
                          </div>

                          <span>
                            {getPercentage(
                              department.total
                            )}%
                          </span>

                        </div>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* GENDER + TOP DEPARTMENT */}
        <div className="analytics-two-column">

          {/* GENDER */}
          <div className="analytics-panel">

            <div className="analytics-panel-header">

              <div>
                <span>DEMOGRAPHICS</span>
                <h2>Gender Distribution</h2>
              </div>

              <FiUsers />

            </div>

            <div className="gender-list">

              {genderAnalytics.length === 0 ? (
                <div className="analytics-empty">
                  <p>No gender data available.</p>
                </div>
              ) : (
                genderAnalytics.map((item) => {

                  const percentage =
                    getPercentage(item.count);

                  return (
                    <div
                      className="gender-row"
                      key={item.gender}
                    >

                      <div className="gender-info">

                        <span className="gender-name">
                          {item.gender}
                        </span>

                        <strong>
                          {item.count}
                        </strong>

                      </div>

                      <div className="gender-progress">

                        <div className="gender-track">
                          <div
                            className="gender-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span>{percentage}%</span>

                      </div>

                    </div>
                  );
                })
              )}

            </div>

          </div>

          {/* TOP DEPARTMENT */}
          <div className="analytics-panel top-department-panel">

            <div className="analytics-panel-header">

              <div>
                <span>TOP PERFORMING GROUP</span>
                <h2>Largest Department</h2>
              </div>

              <FiTrendingUp />

            </div>

            <div className="top-department-content">

              <div className="top-department-icon">
                <FiBriefcase />
              </div>

              <span>Highest Account Concentration</span>

              <h3>
                {topDepartment.department}
              </h3>

              <strong>
                {topDepartment.total}
              </strong>

              <p>
                registered account
                {topDepartment.total === 1
                  ? ""
                  : "s"} in this department
              </p>

              <div className="top-department-breakdown">

                <div>
                  <span>Faculty</span>
                  <strong>
                    {topDepartment.faculty}
                  </strong>
                </div>

                <div>
                  <span>HOD</span>
                  <strong>
                    {topDepartment.hod}
                  </strong>
                </div>

                <div>
                  <span>R&D</span>
                  <strong>
                    {topDepartment.coordinator}
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  };

  /* =========================================================
     MAIN RETURN
  ========================================================= */

  return (
    <div className="admin-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-brand">

          <div className="admin-brand-icon">
            <FiShield />
          </div>

          <div>
            <strong>RPMS</strong>
            <span>Administration</span>
          </div>

        </div>

        <div className="admin-sidebar-divider" />

        <nav className="admin-sidebar-nav">

          {/* DASHBOARD */}
          <button
            className={`admin-nav-item ${
              activeSection === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            <FiHome />

            <div>
              <strong>Dashboard</strong>
              <span>Overview</span>
            </div>

            {activeSection === "dashboard" && (
              <FiChevronRight className="admin-nav-arrow" />
            )}
          </button>

          {/* ANALYTICS */}
          <button
            className={`admin-nav-item ${
              activeSection === "analytics"
                ? "active"
                : ""
            }`}
            onClick={() => setActiveSection("analytics")}
          >
            <FiBarChart2 />

            <div>
              <strong>Analytics</strong>
              <span>Account insights</span>
            </div>

            {activeSection === "analytics" && (
              <FiChevronRight className="admin-nav-arrow" />
            )}
          </button>

          <div className="admin-nav-section-label">
            MANAGEMENT
          </div>

          {/* MANAGEMENT MODULES */}
          {managementModules.map((module) => {

            const Icon = module.icon;

            return (
              <button
                key={module.id}
                className={`admin-nav-item ${
                  activeSection === module.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(module.id)
                }
              >

                <Icon />

                <div>
                  <strong>{module.label}</strong>
                  <span>{module.description}</span>
                </div>

                {activeSection === module.id && (
                  <FiChevronRight className="admin-nav-arrow" />
                )}

              </button>
            );
          })}

        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="admin-sidebar-footer">

          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut />

            <div>
              <strong>Logout</strong>
              <span>End admin session</span>
            </div>
          </button>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="admin-main">

        {activeSection === "dashboard" &&
          renderDashboard()}

        {activeSection === "analytics" &&
          renderAnalytics()}

        {activeSection !== "dashboard" &&
          activeSection !== "analytics" && (
            <div className="admin-module-wrapper">

              {managementModules.find(
                (item) => item.id === activeSection
              ) && (
                <div className="admin-module-heading">

                  <div>
                    <span>ADMIN MANAGEMENT</span>

                    <h1>
                      {
                        managementModules.find(
                          (item) =>
                            item.id === activeSection
                        )?.label
                      }
                    </h1>
                  </div>

                  <FiChevronRight />

                </div>
              )}

              {renderActiveModule()}

            </div>
          )}

      </main>

    </div>
  );
};

export default AdminDashboard;
// // File: src/pages/AdminDashboard.jsx

// import React, { useState } from "react";
// import AddUserForm from "./AddUserForm";
// import RemoveFaculty from "./RemoveFaculty";
// import RemoveHod from "./RemoveHOD";
// import RemoveRdCoordinator from "./RemoveRDCoordinator";
// import "./AdminDashboard.css";
// import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";

// import {
//   FiUserPlus,
//   FiUsers,
//   FiUserCheck,
//   FiLogOut,
//   FiShield,
//   FiChevronRight,
//   FiChevronDown,
//   FiGrid,
//   FiActivity,
//   FiLock,
//   FiCheckCircle,
//   FiArrowRight,
//   FiInfo,
//   FiLayers,
//   FiCommand,
//   FiKey,
//   FiDatabase,
// } from "react-icons/fi";

// const AdminDashboard = () => {

//   /* =========================================================
//      ACTIVE SECTION

//      Dashboard is shown by default.
//   ========================================================= */

//   const [activeSection, setActiveSection] =
//     useState("dashboard");

//   const navigate = useNavigate();


//   /* =========================================================
//      MANAGEMENT MODULES
//   ========================================================= */

//   const managementModules = [
//     {
//       id: "addUser",
//       title: "User Accounts",
//       shortTitle: "Account Management",
//       description:
//         "Create new Faculty and HOD accounts and configure their access.",
//       icon: FiUserPlus,
//       accent: "violet",
//     },
//     {
//       id: "viewFaculty",
//       title: "Faculty",
//       shortTitle: "Faculty Management",
//       description:
//         "View and manage registered faculty members within RPMS.",
//       icon: FiUsers,
//       accent: "blue",
//     },
//     {
//       id: "viewHod",
//       title: "HOD",
//       shortTitle: "HOD Management",
//       description:
//         "View and manage Heads of Department and their accounts.",
//       icon: FiUserCheck,
//       accent: "cyan",
//     },
//     {
//       id: "viewRdCoordinators",
//       title: "R&D Coordinators",
//       shortTitle: "Research Administration",
//       description:
//         "Manage R&D Coordinator accounts and administrative access.",
//       icon: FiShield,
//       accent: "purple",
//     },
//   ];


//   /* =========================================================
//      ACTIVE MODULE

//      Dashboard does not belong to managementModules,
//      so it will have no active module header.
//   ========================================================= */

//   const activeItem =
//     managementModules.find(
//       (item) => item.id === activeSection
//     ) || null;

//   const ActiveIcon = activeItem?.icon || null;


//   /* =========================================================
//      SECTION CHANGE
//   ========================================================= */

//   const handleSectionChange = (section) => {
//     setActiveSection(section);
//   };


//   /* =========================================================
//      LOGOUT
//   ========================================================= */

//   const handleLogout = () => {
//     Swal.fire({
//       title: "Logout?",
//       text: "Do you really want to logout?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, Logout",
//       cancelButtonText: "Cancel",
//       confirmButtonColor: "#dc2626",
//       cancelButtonColor: "#64748b",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         localStorage.clear();

//         Swal.fire({
//           icon: "success",
//           title: "Logged Out",
//           text: "You have successfully logged out!",
//           timer: 1500,
//           showConfirmButton: false,
//         }).then(() => navigate("/login"));
//       }
//     });
//   };


//   /* =========================================================
//      RENDER
//   ========================================================= */

//   return (
//     <div className="admin-page">

//       <div className="admin-layout">

//         {/* ===================================================
//             SIDEBAR
//         =================================================== */}

//         <aside className="admin-sidebar">

//           <div className="sidebar-glow sidebar-glow-one" />
//           <div className="sidebar-glow sidebar-glow-two" />


//           {/* =================================================
//               BRAND
//           ================================================= */}

//           <div className="admin-brand">

//             <div className="admin-brand-icon">
//               <FiShield />
//             </div>

//             <div className="admin-brand-text">
//               <h2>Admin Portal</h2>
//               <span>RPMS Administration</span>
//             </div>

//           </div>


//           {/* =================================================
//               ADMINISTRATOR PROFILE
//           ================================================= */}

//           <div className="admin-profile-card">

//             <div className="admin-avatar">
//               A
//             </div>

//             <div className="admin-profile-info">
//               <strong>Administrator</strong>
//               <span>System Administrator</span>
//             </div>

//             <span className="admin-status-dot" />

//           </div>


//           {/* =================================================
//               NAVIGATION
//           ================================================= */}

//           <div className="admin-nav-section">

//             <div className="admin-nav-heading">
//               NAVIGATION
//             </div>

//             <nav className="admin-navigation">

//               {/* =================================================
//                   DASHBOARD
//               ================================================= */}

//               <button
//                 className={`admin-nav-item ${
//                   activeSection === "dashboard"
//                     ? "active"
//                     : ""
//                 }`}
//                 onClick={() =>
//                   handleSectionChange("dashboard")
//                 }
//               >

//                 <span className="admin-nav-icon">
//                   <FiGrid />
//                 </span>

//                 <span className="admin-nav-text">

//                   <strong>
//                     Dashboard
//                   </strong>

//                   <small>
//                     Administration Overview
//                   </small>

//                 </span>

//                 <FiChevronRight
//                   className="admin-nav-arrow"
//                 />

//               </button>


//               {/* =================================================
//                   MANAGEMENT
//               ================================================= */}

//               <div className="admin-nav-heading admin-management-heading">
//                 MANAGEMENT
//               </div>


//               {managementModules.map((item) => {

//                 const Icon = item.icon;

//                 const isActive =
//                   activeSection === item.id;

//                 return (
//                   <button
//                     key={item.id}
//                     className={`admin-nav-item ${
//                       isActive ? "active" : ""
//                     }`}
//                     onClick={() =>
//                       handleSectionChange(item.id)
//                     }
//                   >

//                     <span className="admin-nav-icon">
//                       <Icon />
//                     </span>

//                     <span className="admin-nav-text">

//                       <strong>
//                         {item.title}
//                       </strong>

//                       <small>
//                         {item.shortTitle}
//                       </small>

//                     </span>

//                     <FiChevronRight
//                       className="admin-nav-arrow"
//                     />

//                   </button>
//                 );
//               })}

//             </nav>

//           </div>


//           {/* =================================================
//               SIDEBAR FOOTER
//           ================================================= */}

//           <div className="admin-sidebar-bottom">

//             <div className="admin-system-status">

//               <span className="status-indicator" />

//               <div>

//                 <strong>
//                   System Online
//                 </strong>

//                 <small>
//                   Administration services active
//                 </small>

//               </div>

//             </div>


//             <button
//               className="admin-logout"
//               onClick={handleLogout}
//             >
//               <FiLogOut />
//               <span>Logout</span>
//             </button>

//           </div>

//         </aside>


//         {/* ===================================================
//             MAIN CONTENT
//         =================================================== */}

//         <main className="admin-main">


//           {/* =================================================
//               DASHBOARD VIEW

//               Everything inside this block is visible ONLY
//               when Dashboard is selected.
//           ================================================= */}

//           {activeSection === "dashboard" && (
//             <>


//               {/* =================================================
//                   COMMAND CENTER HERO
//               ================================================= */}

//               <section className="admin-command-center">

//                 <div className="command-background-shape shape-one" />
//                 <div className="command-background-shape shape-two" />

//                 <div className="command-center-content">

//                   <div className="command-badge">
//                     <span />
//                     SYSTEM ADMINISTRATION
//                   </div>

//                   <h1>
//                     Welcome back,
//                     <strong> Administrator</strong>
//                   </h1>

//                   <p>
//                     Your centralized workspace for managing
//                     user accounts, academic roles, and
//                     administrative access across the
//                     Research Paper Management System.
//                   </p>


//                   {/* Hero Actions */}

//                   <div className="command-actions">

//                     <button
//                       className="command-secondary"
//                       onClick={() =>
//                         handleSectionChange(
//                           "viewFaculty"
//                         )
//                       }
//                     >
//                       <FiUsers />
//                       Manage Faculty
//                     </button>

//                   </div>


//                   {/* Hero Meta */}

//                   <div className="command-meta">

//                     <div>
//                       <FiShield />

//                       <span>
//                         Secure Administration
//                       </span>
//                     </div>

//                     <div>
//                       <FiLock />

//                       <span>
//                         Authorized Access
//                       </span>
//                     </div>

//                     <div>
//                       <FiCheckCircle />

//                       <span>
//                         System Active
//                       </span>
//                     </div>

//                   </div>

//                 </div>


//                 {/* Hero Visual */}

//                 <div className="command-visual">

//                   <div className="command-glow" />

//                   <div className="command-orbit orbit-a" />
//                   <div className="command-orbit orbit-b" />

//                   <div className="command-core">

//                     <FiShield />

//                     <strong>
//                       RPMS
//                     </strong>

//                     <small>
//                       ADMIN
//                     </small>

//                   </div>


//                   <div className="floating-role role-one">

//                     <FiUsers />

//                     <span>
//                       Faculty
//                     </span>

//                   </div>


//                   <div className="floating-role role-two">

//                     <FiUserCheck />

//                     <span>
//                       HOD
//                     </span>

//                   </div>


//                   <div className="floating-role role-three">

//                     <FiActivity />

//                     <span>
//                       R&D
//                     </span>

//                   </div>

//                 </div>

//               </section>


//               {/* =================================================
//                   PAGE TITLE
//               ================================================= */}

//               <div className="admin-page-heading">

//                 <div>

//                   <div className="admin-breadcrumb">

//                     <FiGrid />

//                     <span>
//                       Administration
//                     </span>

//                     <FiChevronRight />

//                     <strong>
//                       Dashboard
//                     </strong>

//                   </div>

//                   <h2>
//                     Administration Center
//                   </h2>

//                   <p>
//                     Monitor and manage your RPMS
//                     administration from one centralized
//                     workspace.
//                   </p>

//                 </div>


//                 <div className="admin-access-badge">

//                   <div>
//                     <FiShield />
//                   </div>

//                   <span>
//                     Administrator Access
//                   </span>

//                 </div>

//               </div>


//               {/* =================================================
//                   MANAGEMENT MODULES TITLE
//               ================================================= */}

//               <section className="management-section">

//                 <div className="section-title-row">

//                   <div>

//                     <span className="section-kicker">
//                       CONTROL CENTER
//                     </span>

//                     <h2>
//                       Management Modules
//                     </h2>

//                     <p>
//                       Use the sidebar to open an
//                       administrative module.
//                     </p>

//                   </div>


//                   <div className="module-count">

//                     <FiLayers />

//                     <span>
//                       {managementModules.length}
//                     </span>

//                     Modules

//                   </div>

//                 </div>

//               </section>


//               {/* =================================================
//                   INFORMATION GRID
//               ================================================= */}

//               <section className="admin-information-grid">


//                 {/* Quick Actions */}

//                 <div className="admin-info-card">

//                   <div className="admin-info-card-header">

//                     <div>

//                       <span>
//                         QUICK ACCESS
//                       </span>

//                       <h3>
//                         Administrative Actions
//                       </h3>

//                     </div>

//                     <div className="panel-icon">
//                       <FiCommand />
//                     </div>

//                   </div>


//                   <div className="admin-action-list">

//                     {managementModules.map(
//                       (module) => {

//                         const Icon = module.icon;

//                         return (
//                           <button
//                             key={module.id}
//                             className="admin-action-item"
//                             onClick={() =>
//                               handleSectionChange(
//                                 module.id
//                               )
//                             }
//                           >

//                             <div className="action-icon">
//                               <Icon />
//                             </div>

//                             <div className="action-text">

//                               <strong>
//                                 {module.title}
//                               </strong>

//                               <small>
//                                 {module.shortTitle}
//                               </small>

//                             </div>

//                             <FiChevronRight />

//                           </button>
//                         );
//                       }
//                     )}

//                   </div>

//                 </div>


//                 {/* Workflow */}

//                 <div className="admin-info-card">

//                   <div className="admin-info-card-header">

//                     <div>

//                       <span>
//                         SYSTEM STRUCTURE
//                       </span>

//                       <h3>
//                         Administration Workflow
//                       </h3>

//                     </div>

//                     <div className="panel-icon">
//                       <FiActivity />
//                     </div>

//                   </div>


//                   <div className="admin-workflow">

//                     <div className="workflow-step">

//                       <div className="workflow-number">
//                         01
//                       </div>

//                       <div>

//                         <strong>
//                           Administrator
//                         </strong>

//                         <small>
//                           Central account management
//                         </small>

//                       </div>

//                     </div>


//                     <div className="workflow-connector">
//                       <span />
//                       <FiChevronDown />
//                       <span />
//                     </div>


//                     <div className="workflow-step">

//                       <div className="workflow-number">
//                         02
//                       </div>

//                       <div>

//                         <strong>
//                           User Accounts
//                         </strong>

//                         <small>
//                           Create and maintain accounts
//                         </small>

//                       </div>

//                     </div>


//                     <div className="workflow-connector">
//                       <span />
//                       <FiChevronDown />
//                       <span />
//                     </div>


//                     <div className="workflow-step">

//                       <div className="workflow-number">
//                         03
//                       </div>

//                       <div>

//                         <strong>
//                           Academic Roles
//                         </strong>

//                         <small>
//                           Faculty · HOD · R&D
//                         </small>

//                       </div>

//                     </div>

//                   </div>

//                 </div>

//               </section>


//               {/* =================================================
//                   SECURITY + ROLE CENTER
//               ================================================= */}

//               <section className="admin-security-grid">


//                 {/* Security */}

//                 <div className="security-panel">

//                   <div className="panel-heading">

//                     <div className="panel-heading-icon">
//                       <FiShield />
//                     </div>

//                     <div>

//                       <span>
//                         SECURITY CENTER
//                       </span>

//                       <h3>
//                         Administration Security
//                       </h3>

//                     </div>

//                   </div>


//                   <div className="security-items">

//                     <div className="security-item">

//                       <div className="security-check">
//                         <FiCheckCircle />
//                       </div>

//                       <div>

//                         <strong>
//                           Authorized Administration
//                         </strong>

//                         <small>
//                           Administrative controls are
//                           available within the protected
//                           Admin workspace.
//                         </small>

//                       </div>

//                     </div>


//                     <div className="security-item">

//                       <div className="security-check">
//                         <FiKey />
//                       </div>

//                       <div>

//                         <strong>
//                           Role-Based Management
//                         </strong>

//                         <small>
//                           Academic accounts are organized
//                           according to their system roles.
//                         </small>

//                       </div>

//                     </div>


//                     <div className="security-item">

//                       <div className="security-check">
//                         <FiDatabase />
//                       </div>

//                       <div>

//                         <strong>
//                           Centralized Control
//                         </strong>

//                         <small>
//                           Account administration is
//                           maintained from one workspace.
//                         </small>

//                       </div>

//                     </div>

//                   </div>

//                 </div>


//                 {/* Role Structure */}

//                 <div className="access-panel">

//                   <div className="panel-heading">

//                     <div className="panel-heading-icon">
//                       <FiLayers />
//                     </div>

//                     <div>

//                       <span>
//                         ACCESS STRUCTURE
//                       </span>

//                       <h3>
//                         Role Management
//                       </h3>

//                     </div>

//                   </div>


//                   <div className="role-visual">

//                     <div className="role-node admin-role">

//                       <FiShield />

//                       <strong>
//                         Admin
//                       </strong>

//                       <small>
//                         Control
//                       </small>

//                     </div>


//                     <div className="role-line">
//                       <span />
//                       <FiArrowRight />
//                       <span />
//                     </div>


//                     <div className="role-node faculty-role">

//                       <FiUsers />

//                       <strong>
//                         Faculty
//                       </strong>

//                       <small>
//                         Academic
//                       </small>

//                     </div>


//                     <div className="role-node hod-role">

//                       <FiUserCheck />

//                       <strong>
//                         HOD
//                       </strong>

//                       <small>
//                         Department
//                       </small>

//                     </div>


//                     <div className="role-node rd-role">

//                       <FiActivity />

//                       <strong>
//                         R&D
//                       </strong>

//                       <small>
//                         Research
//                       </small>

//                     </div>

//                   </div>

//                 </div>

//               </section>


//               {/* =================================================
//                   ADMINISTRATOR GUIDANCE
//               ================================================= */}

//               <section className="admin-guidance">

//                 <div className="guidance-icon">
//                   <FiInfo />
//                 </div>

//                 <div className="guidance-content">

//                   <span>
//                     ADMINISTRATOR GUIDANCE
//                   </span>

//                   <h3>
//                     Keep account management organized
//                   </h3>

//                   <p>
//                     Use the management modules from the
//                     sidebar to maintain authorized
//                     academic accounts and administrative
//                     roles within RPMS.
//                   </p>

//                 </div>

//                 <div className="guidance-status">
//                   <FiCheckCircle />
//                   Administration Ready
//                 </div>

//               </section>

//             </>
//           )}


//           {/* =================================================
//               INDIVIDUAL MANAGEMENT MODULE VIEW

//               Dashboard content is completely hidden when
//               one of these modules is selected.
//           ================================================= */}

//           {activeSection !== "dashboard" &&
//             activeItem &&
//             ActiveIcon && (

//               <section className="admin-content-wrapper">

//                 {/* =================================================
//                     ACTIVE MODULE HEADER
//                 ================================================= */}

//                 <div className="admin-content-header">

//                   <div className="content-heading">

//                     <div className="content-heading-icon">
//                       <ActiveIcon />
//                     </div>

//                     <div>

//                       <span>
//                         ACTIVE MODULE
//                       </span>

//                       <h2>
//                         {activeItem.title}
//                       </h2>

//                       <p>
//                         {activeItem.description}
//                       </p>

//                     </div>

//                   </div>


//                   <div className="content-live-status">

//                     <span />

//                     Active

//                   </div>

//                 </div>


//                 {/* =================================================
//                     MODULE CONTENT
//                 ================================================= */}

//                 <div className="admin-section-content">

//                   {activeSection === "addUser" && (
//                     <AddUserForm />
//                   )}

//                   {activeSection === "viewFaculty" && (
//                     <RemoveFaculty />
//                   )}

//                   {activeSection === "viewHod" && (
//                     <RemoveHod />
//                   )}

//                   {activeSection ===
//                     "viewRdCoordinators" && (
//                     <RemoveRdCoordinator />
//                   )}

//                 </div>

//               </section>
//             )}

//         </main>

//       </div>

//     </div>
//   );
// };

// export default AdminDashboard;