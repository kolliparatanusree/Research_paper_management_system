import React, { useEffect, useState } from 'react';
import './FacultyDashboard.css';
import CustomNavbar from './CustomNavbar';
import { useNavigate } from 'react-router-dom';
import UIDStatusList from '../components/UIDStatusList';
import PIDStatusList from '../components/PIDStatusList';
import RequestUIDForm from './faculty/RequestUIDForm';
import DocumentUploadSection from './faculty/DocumentUploadSection';
import ProfileSection from './faculty/ProfileSection';
import DashboardCounts from '../components/faculty/DashboardCounts';
import NotificationsSection from './NotificationsSection';
import Swal from 'sweetalert2';
import FacultyAnalytics from "./FacultyAnalytics";
import PublicationsSection from './faculty/PublicationsSection';
import logo from "./logo2.jpeg";
import { API_BASE_URL } from '../config';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function FacultyDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [facultyDetails, setFacultyDetails] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [counts, setCounts] = useState({
    approvedUIDs: 0,
    pendingUIDs: 0,
    approvedPIDs: 0,
    pendingPIDs: 0,
  });

  const facultyId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // ================= DASHBOARD CALCULATIONS =================

const totalUIDs =
  counts.approvedUIDs + counts.pendingUIDs;

const totalPIDs =
  counts.approvedPIDs + counts.pendingPIDs;

const totalApproved =
  counts.approvedUIDs + counts.approvedPIDs;

const totalPending =
  counts.pendingUIDs + counts.pendingPIDs;

const totalResearchItems =
  totalUIDs + totalPIDs;

const approvalRate =
  totalResearchItems > 0
    ? Math.round((totalApproved / totalResearchItems) * 100)
    : 0;

    const [pendingPage, setPendingPage] = useState(1);

const pendingActions = [
  ...(counts.pendingUIDs > 0
    ? [{
        type: 'uid',
        title: `${counts.pendingUIDs} UID${counts.pendingUIDs > 1 ? 's' : ''} pending`,
        description: `Your UID request${counts.pendingUIDs > 1 ? 's are' : ' is'} currently awaiting processing.`,
        icon: '⏳',
        className: 'warning',
        section: 'uid-status'
      }]
    : []),

  ...(counts.pendingPIDs > 0
    ? [{
        type: 'pid',
        title: `${counts.pendingPIDs} PID${counts.pendingPIDs > 1 ? 's' : ''} pending`,
        description: `Your research submission${counts.pendingPIDs > 1 ? 's are' : ' is'} awaiting processing.`,
        icon: '📄',
        className: 'danger',
        section: 'my-submissions'
      }]
    : [])
];

const pendingItemsPerPage = 5;

const totalPendingPages = Math.ceil(
  pendingActions.length / pendingItemsPerPage
);

const currentPendingActions = pendingActions.slice(
  (pendingPage - 1) * pendingItemsPerPage,
  pendingPage * pendingItemsPerPage
);


// Progress values
const uidProgress =
  totalUIDs > 0
    ? Math.round((counts.approvedUIDs / totalUIDs) * 100)
    : 0;

const pidProgress =
  totalPIDs > 0
    ? Math.round((counts.approvedPIDs / totalPIDs) * 100)
    : 0;

const overallProgress =
  totalResearchItems > 0
    ? Math.round((totalApproved / totalResearchItems) * 100)
    : 0;

  // fetch counts
  const fetchCounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/counts/${facultyId}`);
      const data = await res.json();
      setCounts(data);
    } catch (err) {
      console.error('Error fetching dashboard counts:', err);
    }
  };

  useEffect(() => {
  fetch(`${API_BASE_URL}/api/auth/notifications/unread-count/${facultyId}`)
    .then(res => res.json())
    .then(data => setNotifCount(data.count))
    .catch(err => console.error(err));
}, [facultyId]);

  // fetch faculty details
  useEffect(() => {
    const fetchDetails = async () => {
      const res = await fetch(`${API_BASE_URL}/api/faculty/${facultyId}`);
      const data = await res.json();
      setFacultyDetails({ ...data, facultyId: data.userId });
    };
    if (facultyId) fetchDetails();
  }, [facultyId]);

  // fetch counts on mount and refresh every 30s
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to log out?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log me out',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#f87171',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have successfully logged out!',
          timer: 2000,
          showConfirmButton: false
        }).then(() => navigate('/login'));
      }
    });
  };

  return (
    <>
      {/* <CustomNavbar /> */}
      <div className="dashboard1-container">
        {/* <div className={`sidebar1 ${sidebarOpen ? 'open' : ''}`}>
          <nav className="menu">
            <ul>
              <img src={logo} alt="Logo" className="logo1" />
              <li 
                className={activeSection === 'dashboard' ? 'active' : ''} 
                onClick={() => {setActiveSection('dashboard'); setSidebarOpen(false);
  }}
              >
                📊 Dashboard
              </li>
             
              <li className={activeSection === 'request-uid' ? 'active' : ''} onClick={() => {setActiveSection('request-uid'); setSidebarOpen(false);
  }}>📄 Request UID</li>
              <li className={activeSection === 'uid-status' ? 'active' : ''} onClick={() => {setActiveSection('uid-status'); setSidebarOpen(false);
  }}>🔄 UID Status</li>
              <li className={activeSection === 'indexing' ? 'active' : ''} onClick={() => {setActiveSection('indexing'); setSidebarOpen(false);
  }}>📤 Submit Documents</li>
              <li className={activeSection === 'my-submissions' ? 'active' : ''} onClick={() => {setActiveSection('my-submissions'); setSidebarOpen(false);
  }}>🔄 PID Status</li>
              <li
  className={activeSection === 'publications' ? 'active' : ''}
  onClick={() => {setActiveSection('publications'); setSidebarOpen(false);
  }}
>
  📚 Publications
</li>
 <li
  className={activeSection === 'notifications' ? 'active' : ''}
  onClick={() => {setActiveSection('notifications'); setSidebarOpen(false);}}
>
  🔔 Notifications
</li>
              <li className={activeSection === 'profile' ? 'active' : ''}  onClick={() => {setActiveSection('profile'); setSidebarOpen(false);
  }}>👤 Profile</li>
              <li className="btn" onClick={() => {handleLogout(); setSidebarOpen(false);}} style={{ color: 'white', marginTop: '0px', cursor: 'pointer', fontSize: '20px' }}>🔚 Logout</li>
            </ul>
          </nav>
        </div> */}
        {/* =====================================================
    FACULTY SIDEBAR
===================================================== */}

<div className={`sidebar1 ${sidebarOpen ? 'open' : ''}`}>

  <nav className="menu">

    {/* ---------- BRAND ---------- */}
    <div className="sidebar1-brand">

      <div className="sidebar1-logo-wrapper">
        <img
          src={logo}
          alt="RPMS"
          className="logo1"
        />
      </div>

      <div className="sidebar1-brand-text">
        <strong>RPMS</strong>
        <span>Research Management</span>
      </div>

    </div>


    {/* ---------- ROLE ---------- */}
    <div className="sidebar1-role">
      <span className="sidebar1-role-dot"></span>
      Faculty Portal
    </div>


    {/* ---------- MAIN ---------- */}
    <div className="sidebar1-section-title">
      MAIN
    </div>


    <ul className="sidebar1-menu">

      {/* Dashboard */}
      <li
        className={activeSection === 'dashboard' ? 'active' : ''}
        onClick={() => {
          setActiveSection('dashboard');
          setSidebarOpen(false);
        }}
      >
        <span className="sidebar1-icon">📊</span>
        <span className="sidebar1-label">Dashboard</span>
      </li>


      {/* Request UID */}
      <li
        className={activeSection === 'request-uid' ? 'active' : ''}
        onClick={() => {
          setActiveSection('request-uid');
          setSidebarOpen(false);
        }}
      >
        <span className="sidebar1-icon">📄</span>
        <span className="sidebar1-label">Request UID</span>
      </li>


      {/* UID Status */}
      <li
        className={activeSection === 'uid-status' ? 'active' : ''}
        onClick={() => {
          setActiveSection('uid-status');
          setSidebarOpen(false);
        }}
      >
        <span className="sidebar1-icon">🔄</span>
        <span className="sidebar1-label">UID Status</span>
      </li>


      {/* Submit Documents */}
      <li
        className={activeSection === 'indexing' ? 'active' : ''}
        onClick={() => {
          setActiveSection('indexing');
          setSidebarOpen(false);
        }}
      >
        <span className="sidebar1-icon">📤</span>
        <span className="sidebar1-label">Submit Documents</span>
      </li>


      {/* PID Status */}
      <li
        className={activeSection === 'my-submissions' ? 'active' : ''}
        onClick={() => {
          setActiveSection('my-submissions');
          setSidebarOpen(false);
        }}
      >
        <span className="sidebar1-icon">📋</span>
        <span className="sidebar1-label">PID Status</span>
      </li>


      {/* Publications */}
      <li
        className={activeSection === 'publications' ? 'active' : ''}
        onClick={() => {
          setActiveSection('publications');
          setSidebarOpen(false);
        }}
      >
        <span className="sidebar1-icon">📚</span>
        <span className="sidebar1-label">Publications</span>
      </li>
      <li
  className={activeSection === 'analytics' ? 'active' : ''}
  onClick={() => {
    setActiveSection('analytics');
    setSidebarOpen(false);
  }}
>
  <span className="sidebar1-icon">📊</span>
  <span className="sidebar1-label">Analytics</span>
</li>

    </ul>


    {/* ---------- ACCOUNT ---------- */}
    <div className="sidebar1-section-title sidebar1-account-title">
      ACCOUNT
    </div>


    <ul className="sidebar1-menu sidebar1-account-menu">

      {/* Notifications */}
      <li
        className={activeSection === 'notifications' ? 'active' : ''}
        onClick={() => {
          setActiveSection('notifications');
          setNotifCount(0);
          setSidebarOpen(false);
        }}
      >
        <span className="sidebar1-icon">🔔</span>

        <span className="sidebar1-label">
          Notifications
        </span>

        {notifCount > 0 && (
          <span className="sidebar1-count">
            {notifCount}
          </span>
        )}
      </li>


      {/* Profile */}
      <li
        className={activeSection === 'profile' ? 'active' : ''}
        onClick={() => {
          setActiveSection('profile');
          setSidebarOpen(false);
        }}
      >
        <span className="sidebar1-icon">👤</span>
        <span className="sidebar1-label">Profile</span>
      </li>

    </ul>


    {/* ---------- SIDEBAR BOTTOM ---------- */}
    <div className="sidebar1-bottom">

      {facultyDetails && (
        <div className="sidebar1-user">

          <img
            src={
  facultyDetails?.profilePic
    ? facultyDetails.profilePic.startsWith("http")
      ? facultyDetails.profilePic
      : `${API_BASE_URL}/${facultyDetails.profilePic.replace(/^\/+/, "")}`
    : "/default-profile.png"
}
            alt="Faculty"
            onError={(e) => {
              e.target.src = "/default-profile.png";
            }}
          />

          <div className="sidebar1-user-info">

            <strong>
              {facultyDetails.fullName || "Faculty"}
            </strong>

            <span>
              {facultyDetails.department || "Faculty"}
            </span>

          </div>

        </div>
      )}


      {/* Logout */}
      <div
        className="sidebar1-logout"
        onClick={() => {
          handleLogout();
          setSidebarOpen(false);
        }}
      >
        <span className="sidebar1-icon">↪</span>
        <span className="sidebar1-label">Logout</span>
      </div>

    </div>

  </nav>

</div>
          
              <button
  className="mobile-menu-btn"
  onClick={() => setSidebarOpen(!sidebarOpen)}
  aria-label="Toggle menu"
>
  ☰
</button>

        <div className="main1-content">
          {/* <p style={{ color: 'purple', fontSize: '25px' }}>Welcome, {facultyDetails?.fullName || 'Faculty'}</p> */}
 <div className="top1-header">
  <p className="welcome1-text">
    Welcome, {facultyDetails?.fullName || "Faculty"}
  </p>

  <div className="right1-section">
    {/* Notification */}
    <button
  className="notification1-btn"
  onClick={() => {
  setActiveSection("notifications");
  setNotifCount(0); // optional immediate reset
}}
>
  🔔
   {notifCount > 0 && (
    <span className="notif1-badge">{notifCount}</span>
  )}
</button>

    {/* Small Profile Pic */}
  <img
  src={
    facultyDetails?.profilePic
      ? facultyDetails.profilePic.startsWith("http")
        ? facultyDetails.profilePic
        : `${API_BASE_URL}/${facultyDetails.profilePic.replace(/^\/+/, "")}`
      : "/default-profile.png"
  }
  alt="Profile"
  className="profile1-small"
  onClick={() => setActiveSection("profile")}
  onError={(e) => {
    e.target.src = "/default-profile.png";
  }}
/>
  </div>
</div>
{activeSection === 'notifications' && (
  <NotificationsSection userId={facultyId} />
)}
          {/* ✅ Dashboard counts panel */}
         {activeSection === 'publications' && facultyDetails && (
  <PublicationsSection userId={facultyId} />
)}
{activeSection === "analytics" && (
  <FacultyAnalytics userId={facultyId} />
)}
       {activeSection === 'dashboard' && (
  <div className="faculty1-dashboard">

        {/* ================= QUICK ACTIONS ================= */}
    <div className="dashboard1-panel quick-actions-panel">

      <div className="panel1-header">
        <div>
          <h3>Quick Actions</h3>
          <p>Frequently used research functions</p>
        </div>
      </div>

      <div className="quick1-actions">

        <button
          className="quick1-action-btn"
          onClick={() => setActiveSection('request-uid')}
        >
          <span>📄</span>
          <div>
            <strong>Request UID</strong>
            <small>Request a new UID</small>
          </div>
        </button>


        <button
          className="quick1-action-btn"
          onClick={() => setActiveSection('indexing')}
        >
          <span>📤</span>
          <div>
            <strong>Submit Documents</strong>
            <small>Upload research documents</small>
          </div>
        </button>


        <button
          className="quick1-action-btn"
          onClick={() => setActiveSection('uid-status')}
        >
          <span>🔄</span>
          <div>
            <strong>UID Status</strong>
            <small>Track your UID requests</small>
          </div>
        </button>


        <button
          className="quick1-action-btn"
          onClick={() => setActiveSection('my-submissions')}
        >
          <span>📊</span>
          <div>
            <strong>PID Status</strong>
            <small>Track your submissions</small>
          </div>
        </button>


        <button
          className="quick1-action-btn"
          onClick={() => setActiveSection('publications')}
        >
          <span>📚</span>
          <div>
            <strong>Publications</strong>
            <small>View your publications</small>
          </div>
        </button>

      </div>

    </div>

    {/* ================= SUMMARY CARDS ================= */}
    <div className="dashboard1-summary">

      <div className="summary1-card total-uid">
        <div className="summary1-icon">📄</div>
        <div>
          <h4>Total UIDs</h4>
          <p>{counts.approvedUIDs + counts.pendingUIDs}</p>
        </div>
      </div>

      <div className="summary1-card total-pid">
        <div className="summary1-icon">📚</div>
        <div>
          <h4>Total PIDs</h4>
          <p>{counts.approvedPIDs + counts.pendingPIDs}</p>
        </div>
      </div>

      <div className="summary1-card pending-card1">
        <div className="summary1-icon">⏳</div>
        <div>
          <h4>Pending UIDs</h4>
          <p>{counts.pendingUIDs}</p>
        </div>
      </div>

      <div className="summary1-card pending-pid-card">
        <div className="summary1-icon">🔄</div>
        <div>
          <h4>Pending PIDs</h4>
          <p>{counts.pendingPIDs}</p>
        </div>
      </div>

    </div>


    {/* ================= CHART + ACTIVITY ================= */}
    <div className="dashboard1-middle">

      {/* UID/PID STATUS */}
      <div className="dashboard1-panel status-panel neon-chart-panel">

        <div className="panel1-header">
          <div>
            <h3>UID / PID Status</h3>
            <p>Overview of your research submissions</p>
          </div>
        </div>

        <div className="chart1-container neon-chart-container">

          <Doughnut
            data={{
              labels: [
                'Approved UIDs',
                'Pending UIDs',
                'Approved PIDs',
                'Pending PIDs'
              ],
              datasets: [
                {
                  data: [
                    counts.approvedUIDs,
                    counts.pendingUIDs,
                    counts.approvedPIDs,
                    counts.pendingPIDs
                  ],
                  backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#3b82f6',
                    '#ef4444'
                  ],
                  borderWidth: 0
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />

        </div>

      </div>


      {/* RESEARCH OVERVIEW */}
      <div className="dashboard1-panel activity-panel">

        <div className="panel1-header">
          <div>
            <h3>Research Overview</h3>
            <p>Your current research activity</p>
          </div>
        </div>

        <div className="activity1-list">

          <div className="activity1-item">
            <div className="activity1-icon uid-icon">
              📄
            </div>

            <div className="activity1-info">
              <span>UID Requests</span>
              <strong>
                {counts.approvedUIDs + counts.pendingUIDs}
              </strong>
            </div>
          </div>


          <div className="activity1-item">
            <div className="activity1-icon pid-icon">
              📚
            </div>

            <div className="activity1-info">
              <span>Research Papers</span>
              <strong>
                {counts.approvedPIDs + counts.pendingPIDs}
              </strong>
            </div>
          </div>


          <div className="activity1-item">
            <div className="activity1-icon approved-icon">
              ✅
            </div>

            <div className="activity1-info">
              <span>Approved Submissions</span>
              <strong>
                {counts.approvedUIDs + counts.approvedPIDs}
              </strong>
            </div>
          </div>


          <div className="activity1-item">
            <div className="activity1-icon pending-icon">
              ⏳
            </div>

            <div className="activity1-info">
              <span>Pending Submissions</span>
              <strong>
                {counts.pendingUIDs + counts.pendingPIDs}
              </strong>
            </div>
          </div>

        </div>

      </div>

    </div>
            {/* =====================================================
    RESEARCH SUMMARY
===================================================== */}

<div className="research1-summary-panel dashboard-panel">

  <div className="panel-header">
    <div>
      <h3>Research Summary</h3>
      <p>Overview of your research activities</p>
    </div>

    <div className="approval1-rate">
      <span>{approvalRate}%</span>
      <small>Approval Rate</small>
    </div>
  </div>


  <div className="research1-summary-grid">

    <div className="research1-summary-item">
      <div className="summary1-small-icon green">
        📄
      </div>

      <div>
        <span>Total UID Requests</span>
        <strong>{totalUIDs}</strong>
      </div>
    </div>


    <div className="research1-summary-item">
      <div className="summary1-small-icon blue">
        📚
      </div>

      <div>
        <span>Total Research Papers</span>
        <strong>{totalPIDs}</strong>
      </div>
    </div>


    <div className="research1-summary-item">
      <div className="summary1-small-icon success">
        ✅
      </div>

      <div>
        <span>Approved</span>
        <strong>{totalApproved}</strong>
      </div>
    </div>


    <div className="research1-summary-item">
      <div className="summary1-small-icon orange">
        ⏳
      </div>

      <div>
        <span>Pending</span>
        <strong>{totalPending}</strong>
      </div>
    </div>

  </div>

</div>

<div className="research1-bottom-grid">
{/* =====================================================
    RESEARCH PROGRESS
===================================================== */}

    <div className="dashboard1-panel progress-panel">

      <div className="panel1-header">
        <div>
          <h3>Research Progress</h3>
          <p>Track your current research workflow</p>
        </div>
      </div>


      <div className="progress1-list">

        {/* UID PROGRESS */}
        <div className="progress1-item">

          <div className="progress1-title">
            <span>
              📄 UID Processing
            </span>

            <strong>
              {uidProgress}%
            </strong>
          </div>

          <div className="progress1-bar">
            <div
              className="progress1-fill uid-progress"
              style={{
                width: `${uidProgress}%`
              }}
            />
          </div>

          <small>
            {counts.approvedUIDs} approved out of {totalUIDs}
          </small>

        </div>


        {/* PID PROGRESS */}
        <div className="progress1-item">

          <div className="progress1-title">
            <span>
              📚 Research Paper Processing
            </span>

            <strong>
              {pidProgress}%
            </strong>
          </div>

          <div className="progress1-bar">
            <div
              className="progress1-fill pid-progress"
              style={{
                width: `${pidProgress}%`
              }}
            />
          </div>

          <small>
            {counts.approvedPIDs} approved out of {totalPIDs}
          </small>

        </div>


        {/* OVERALL PROGRESS */}
        <div className="progress1-item">

          <div className="progress1-title">
            <span>
              🎯 Overall Research Progress
            </span>

            <strong>
              {overallProgress}%
            </strong>
          </div>

          <div className="progress1-bar">
            <div
              className="progress1-fill overall-progress"
              style={{
                width: `${overallProgress}%`
              }}
            />
          </div>

          <small>
            {totalApproved} approved out of {totalResearchItems} research items
          </small>

        </div>

      </div>

    </div>



    {/* =====================================================
        RECENT ACTIVITY
    ===================================================== */}

    <div className="dashboard1-panel recent-activity-panel">

      <div className="panel1-header">

        <div>
          <h3>Research Activity</h3>
          <p>Your recent research workflow</p>
        </div>

      </div>


      <div className="timeline1">

        <div className="timeline1-item">

          <div className="timeline1-dot green-dot">
            ✓
          </div>

          <div className="timeline1-content">

            <strong>
              UID requests approved
            </strong>

            <p>
              {counts.approvedUIDs} UID
              {counts.approvedUIDs !== 1 ? 's have' : ' has'}
              been approved.
            </p>

          </div>

        </div>


        <div className="timeline1-item">

          <div className="timeline1-dot blue-dot">
            📚
          </div>

          <div className="timeline1-content">

            <strong>
              Research papers processed
            </strong>

            <p>
              {counts.approvedPIDs} research paper
              {counts.approvedPIDs !== 1 ? 's have' : ' has'}
              been approved.
            </p>

          </div>

        </div>


        <div className="timeline1-item">

          <div className="timeline1-dot orange-dot">
            ⏳
          </div>

          <div className="timeline1-content">

            <strong>
              Pending research items
            </strong>

            <p>
              {totalPending} item
              {totalPending !== 1 ? 's are' : ' is'}
              currently pending.
            </p>

          </div>

        </div>


        <div className="timeline1-item">

          <div className="timeline1-dot purple-dot">
            🎯
          </div>

          <div className="timeline1-content">

            <strong>
              Overall progress
            </strong>

            <p>
              Your current approval rate is {approvalRate}%.
            </p>

          </div>

        </div>

      </div>

    </div>

</div>

{/* ================= PENDING ACTIONS ================= */}
<div className="dashboard1-panel pending-actions-panel">

  <div className="panel1-header">
    <div>
      <h3>Pending Actions</h3>
      <p>Items that may require your attention</p>
    </div>

    {pendingActions.length > 0 && (
      <span className="pending1-page-info">
        {pendingPage} / {totalPendingPages}
      </span>
    )}
  </div>


  {pendingActions.length > 0 ? (

    <>
      <div className="pending1-actions">

        {currentPendingActions.map((action) => (

          <div
            key={action.type}
            className={`pending1-action ${action.className}`}
          >

            <span className="pending1-action-icon">
              {action.icon}
            </span>


            <div>
              <strong>
                {action.title}
              </strong>

              <p>
                {action.description}
              </p>
            </div>


            <button
              onClick={() => setActiveSection(action.section)}
            >
              View
            </button>

          </div>

        ))}

      </div>


      {/* PAGINATION */}
      {totalPendingPages > 1 && (

        <div className="pending1-pagination">

          <button
            disabled={pendingPage === 1}
            onClick={() =>
              setPendingPage(prev => prev - 1)
            }
          >
            ← Previous
          </button>


          <div className="pending1-page-numbers">

            {Array.from(
              { length: totalPendingPages },
              (_, index) => index + 1
            ).map((page) => (

              <button
                key={page}
                className={
                  pendingPage === page
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setPendingPage(page)
                }
              >
                {page}
              </button>

            ))}

          </div>


          <button
            disabled={pendingPage === totalPendingPages}
            onClick={() =>
              setPendingPage(prev => prev + 1)
            }
          >
            Next →
          </button>

        </div>

      )}

    </>

  ) : (

    <div className="no1-pending">

      <span>✅</span>

      <div>
        <strong>
          No pending actions
        </strong>

        <p>
          All your research requests and submissions
          have been processed.
        </p>
      </div>

    </div>

  )}

</div>
  </div>
)}
       
       
          {activeSection === 'profile' && <ProfileSection facultyDetails={facultyDetails} />}
          {activeSection === 'request-uid' && <RequestUIDForm facultyDetails={facultyDetails} />}
          {activeSection === 'uid-status' && facultyDetails && <UIDStatusList facultyId={facultyId} />}
          {activeSection === 'indexing' && facultyDetails && <DocumentUploadSection userId={facultyId} />}
          {activeSection === 'my-submissions' && facultyDetails && <PIDStatusList facultyId={facultyDetails.userId} />}
          {/* {activeSection === 'profile' && <ProfileSection facultyDetails={facultyDetails} />} */}
        </div>
      </div>
    </>
  );
}
