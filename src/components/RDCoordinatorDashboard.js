// src/pages/RDCoordinatorDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HodDashboard.css'; // reuse the same CSS
import CustomNavbar from './CustomNavbar';
import ProfileSection from './faculty/ProfileSection';
import DepartmentPublicationsSection from './DepartmentPublicationsSection';
import HodFacultySection from './HodFacultySection';
import Swal from 'sweetalert2';
import axios from 'axios';
import NotificationsSection from './NotificationsSection';
import RDcoordinatorUidApproval from './RDcoordinatorUidApproval'; // RD Coordinator version of UID approval

export default function RDCoordinatorDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [notifCount, setNotifCount] = useState(0);

  const [facultyCount, setFacultyCount] = useState(0);
  const [pendingUidCount, setPendingUidCount] = useState(0);
  const [approvedUidCount, setApprovedUidCount] = useState(0);

 useEffect(() => {
  const interval = setInterval(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/api/auth/notifications/unread-count/${userId}`)
      .then((res) => setNotifCount(res.data.count))
      .catch((err) => console.error(err));
  }, 10000);

  return () => clearInterval(interval);
}, [userId]);
  // Fetch notifications
  // useEffect(() => {
  //   if (!userId) return;
  //   axios.get(`http://localhost:5000/api/notifications/${userId}`)
  //     .then(res => setNotifications(res.data))
  //     .catch(err => console.error(err));
  // }, []);

  // Fetch department-wise counts
  useEffect(() => {
    if (!profile?.department) return;
    const department = profile.department;

    axios.get(`http://localhost:5000/api/faculty/count/${department}`)
      .then(res => setFacultyCount(res.data.count));

    // Pending UID requests for RD Coordinator (after HOD approval)
    axios.get(`http://localhost:5000/api/rdcoordinator/uid/pending/${department}`)
      .then(res => setPendingUidCount(res.data.count));

    axios.get(`http://localhost:5000/api/rdcoordinator/uid/approved/${department}`)
      .then(res => setApprovedUidCount(res.data.count));

  }, [profile]);

  // Fetch RD Coordinator profile
  useEffect(() => {
    if (!userId) {
      setError('No RD Coordinator ID found. Please login again.');
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        Swal.fire({
          title: 'Loading Profile...',
          text: 'Please wait',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        setLoadingProfile(true);
        const res = await axios.get(`http://localhost:5000/api/faculty/${userId}`);
        const data = res.data;

        setProfile({
          fullName: data.fullName,
          userId: data.userId,
          department: data.department,
          email: data.email,
          phoneNumber: data.phoneNumber,
          gender: data.gender
        });

        Swal.close();
      } catch (err) {
        console.error('Error fetching profile:', err);
        Swal.close();
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch profile' });
        setError('Failed to fetch profile.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleNavigation = (section) => {
    if (section === 'logout') {
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
      return;
    }
    setActiveSection(section);
  };

  return (
    <>
      {/* <CustomNavbar /> */}
      <div className="hod-dashboard">
        {/* Sidebar */}
        <div className="sidebar">
          <h2>RD Coordinator Dashboard</h2>
          <ul>
            <li onClick={() => setActiveSection('dashboard')}>📊 Dashboard</li>
            <li className={activeSection === 'requests' ? 'active' : ''} onClick={() => handleNavigation('requests')}>📨 UID Approvals</li>
            <li className={activeSection === 'publications' ? 'active' : ''} onClick={() => handleNavigation('publications')}>📚 Department Publications</li>
            <li className={activeSection === 'faculty' ? 'active' : ''} onClick={() => handleNavigation('faculty')}>👥 View Faculty Details</li>
            <li className={activeSection === 'profile' ? 'active' : ''} onClick={() => handleNavigation('profile')}>👤 Profile</li>
            <li onClick={() => handleNavigation('logout')} style={{ cursor: 'pointer', color: 'white', marginTop: 'auto' }}>🔚 Logout</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="top-header">
  <p className="welcome-text">
    Welcome, {profile?.fullName || "RD Coordinator"}
  </p>

  <div className="right-section">
    {/* Notification */}
    <button
      className="notification-btn"
      onClick={async () => {
  setActiveSection("notifications");
  setNotifCount(0);

  try {
    await axios.put(`http://localhost:5000/api/auth/notifications/mark-read/${userId}`);
  } catch (err) {
    console.error(err);
  }
}}
    >
      🔔
      {notifCount > 0 && (
        <span className="notif-badge">{notifCount}</span>
      )}
    </button>

    {/* Profile Pic */}
    <img
      src={
        profile?.profilePic
          ? `http://localhost:5000/${profile.profilePic}`
          : "/default-profile.png"
      }
      alt="Profile"
      className="profile-small"
      onClick={() => setActiveSection("profile")}
      onError={(e) => {
        e.target.src = "/default-profile.png";
      }}
    />
  </div>
</div>
          {activeSection === 'notifications' && (
  <NotificationsSection userId={userId} />
)}
          {activeSection === 'dashboard' && (
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>👨‍🏫 Faculty</h3>
                <p>{facultyCount}</p>
              </div>
              <div className="dashboard-card">
                <h3>📨 Pending UID</h3>
                <p>{pendingUidCount}</p>
              </div>
              <div className="dashboard-card">
                <h3>✅ Approved UID</h3>
                <p>{approvedUidCount}</p>
              </div>

              {/* <div className="top-bar">
                <button className="notification-btn" onClick={handleNotificationClick}>
                  🔔 Notifications ({notifications.filter(n => !n.isRead).length})
                </button>

                {showNotifications && (
                  <div className="notification-popup">
                    <div className="notification-header">
                      <h4>Notifications</h4>
                      <button className="close-btn" onClick={() => setShowNotifications(false)}>❌</button>
                    </div>
                    {notifications.filter(note => !note.isRead).length === 0 ? (
                      <p>No notifications</p>
                    ) : (
                      notifications.filter(note => !note.isRead).map(note => (
                        <div key={note._id} className="notification-item">
                          <p>{note.message}</p>
                          <small>{new Date(note.createdAt).toLocaleString()}</small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div> */}
            </div>
          )}

          {activeSection === 'publications' && profile && (
            <DepartmentPublicationsSection department={profile.department} />
          )}

          {activeSection === 'faculty' && profile && (
            <HodFacultySection hodProfile={profile} />
          )}

          {activeSection === 'requests' && <RDcoordinatorUidApproval department={profile?.department} />}

          {activeSection === 'profile' && profile && (
            <ProfileSection facultyDetails={profile} />
          )}
        </div>
      </div>
    </>
  );
}