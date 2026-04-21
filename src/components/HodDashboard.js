// src/pages/HodDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HodDashboard.css';
import HodUidApproval from './HodUidApproval';
import CustomNavbar from './CustomNavbar';
import logo from './logo2.jpeg';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProfileSection from './faculty/ProfileSection';
import DepartmentPublicationsSection from './DepartmentPublicationsSection';
import HodFacultySection from './HodFacultySection';
import NotificationsSection from './NotificationsSection';
export default function HodDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [hodProfile, setHodProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // read HOD ID
const [facultyCount, setFacultyCount] = useState(0);
const [pendingUidCount, setPendingUidCount] = useState(0);
const [approvedUidCount, setApprovedUidCount] = useState(0);
const [notifCount, setNotifCount] = useState(0);
  useEffect(() => {

     const userId = localStorage.getItem("userId");
  if (!userId) return;

  fetch(`http://localhost:5000/api/notifications/${userId}`)
    .then(res => res.json())
    .then(data => setNotifications(data))
    .catch(err => console.error(err));

}, []);

useEffect(() => {
  const userId = localStorage.getItem("userId");

  fetch(`http://localhost:5000/api/auth/notifications/unread-count/${userId}`)
    .then(res => res.json())
    .then(data => setNotifCount(data.count))
    .catch(err => console.error(err));
}, []);

useEffect(() => {

  if (!hodProfile?.department) return;

  const department = hodProfile.department;

  axios.get(`http://localhost:5000/api/faculty/count/${department}`)
       .then(res => setFacultyCount(res.data.count));

  axios.get(`http://localhost:5000/api/hod/uid/pending/${department}`)
       .then(res => setPendingUidCount(res.data.count));

  axios.get(`http://localhost:5000/api/hod/uid/approved/${department}`)
       .then(res => setApprovedUidCount(res.data.count));

}, [hodProfile]);

  useEffect(() => {
    if (!userId) {
      console.error('No HOD ID found in localStorage');
      setError('No HOD ID found. Please login again.');
      setLoadingProfile(false);
      return;
    }

    const fetchHodProfile = async () => {
  try {
    // 🔵 SHOW LOADING POPUP
    Swal.fire({
      title: 'Loading Profile...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setLoadingProfile(true);

    const res = await axios.get(`http://localhost:5000/api/faculty/${userId}`);
    const data = res.data;

    setHodProfile({
  fullName: data.fullName,
  userId: data.userId,       // ProfileSection expects userId
  department: data.department,
  email: data.email,
  phoneNumber: data.phoneNumber,
  gender: data.gender
});

    Swal.close(); // ✅ CLOSE LOADER after success
  } catch (err) {
    console.error('Error fetching HOD profile:', err);

    Swal.close(); // close loader if error

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch HOD profile'
    });

    setError('Failed to fetch HOD profile.');
  } finally {
    setLoadingProfile(false);
  }
};


    // const fetchHodProfile = async () => {
    //   try {
    //     setLoadingProfile(true);
    //     const res = await axios.get(`http://localhost:5000/api/hod/${hodId}`);
    //     setHodProfile(res.data);
    //   } catch (err) {
    //     console.error('Error fetching HOD profile:', err);
    //     setError('Failed to fetch HOD profile. Please try again.');
    //   } finally {
    //     setLoadingProfile(false);
    //   }
    // };

    fetchHodProfile();
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
    confirmButtonColor: '#10b981', // green
    cancelButtonColor: '#f87171',  // red
  }).then((result) => {
    if (result.isConfirmed) {
      // ✅ User confirmed logout
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have successfully logged out!',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate('/login'); // Redirect after success message
      });
    }
});


    return;
  }
  setActiveSection(section);
};

// const handleNotificationClick = async () => {

//   const userId = localStorage.getItem("userId");

//   setShowNotifications(!showNotifications);

//   if (!showNotifications) {
//     await axios.put(`http://localhost:5000/api/auth/notifications/mark-read/${userId}`);
//   }
// };

  // const handleNavigation = (section) => {
  //   if (section === 'logout') {
  //     localStorage.clear();
  //     navigate('/login');
  //     return;
  //   }
  //   setActiveSection(section);
  // };

  return (
    <>
      {/* <CustomNavbar /> */}
      <div className="hod-dashboard">
        
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            {/* <img src={logo} alt="Logo" className="logo" /> */}
          </div>
          <h2>HOD Dashboard</h2>
         
          <ul>
            <li onClick={() => setActiveSection('dashboard')}>
  📊 Dashboard
</li>
            <li
              className={activeSection === 'requests' ? 'active' : ''}
              onClick={() => handleNavigation('requests')}
            >
              📨 Requesting UIDs
            </li>
            <li
  className={activeSection === 'publications' ? 'active' : ''}
  onClick={() => handleNavigation('publications')}
>
  📚 Department Publications
</li>
<li
  className={activeSection === 'faculty' ? 'active' : ''}
  onClick={() => handleNavigation('faculty')}
>
  👥 View Faculty Details
</li>
            <li
              className={activeSection === 'profile' ? 'active' : ''}
              onClick={() => handleNavigation('profile')}
            >
              👤 Profile
            </li>
            <li
              onClick={() => handleNavigation('logout')}
              style={{ cursor: 'pointer', color: 'white', marginTop: 'auto' }}
            >
              🔚 Logout
            </li>
          </ul>
        </div>

        <div className="dashboard-cards">



</div>

        {/* Main Content */}
        <div className="main-content">
          <div className="top-header">
  <p className="welcome-text">
    Welcome, {hodProfile?.fullName || "HOD"}
  </p>

  <div className="right-section">
    {/* Notification Button */}
    <button
  className="notification-btn"
  onClick={async () => {
    setActiveSection("notifications");

    const userId = localStorage.getItem("userId");
    await axios.put(`http://localhost:5000/api/auth/notifications/mark-read/${userId}`);

    setNotifCount(0); // reset badge
  }}
>
  🔔
  {notifCount > 0 && (
    <span className="notif-badge">{notifCount}</span>
  )}
</button>
    {/* Profile Image */}
    <img
      src={
        hodProfile?.profilePic
          ? `http://localhost:5000/${hodProfile.profilePic}`
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

<div className="top-bar">

{/* <button
className="notification-btn"
onClick={handleNotificationClick}
>
🔔 Notifications ({notifications.filter(n => !n.isRead).length})
</button> */}

{/* {showNotifications && (

<div className="notification-popup">

<div className="notification-header">
<h4>Notifications</h4>

<button
className="close-btn"
onClick={() => setShowNotifications(false)}
>
❌
</button>

</div>

{notifications.filter(note => !note.isRead).length === 0 ? (
  <p>No notifications</p>
) : (
  notifications
    .filter(note => !note.isRead)
    .map((note) => (
      <div key={note._id} className="notification-item">
        <p>{note.message}</p>
        <small>{new Date(note.createdAt).toLocaleString()}</small>
      </div>
    ))
)}

</div>

)} */}

</div>

</div>

)}



     
          {activeSection === 'publications' && hodProfile && (
  <DepartmentPublicationsSection department={hodProfile.department} />
)}
{/* // In HodDashboard.js */}
{activeSection === "faculty" && hodProfile && (
  <HodFacultySection hodProfile={hodProfile} />
)}
          {activeSection === 'requests' && <HodUidApproval />}
          {activeSection === 'profile' && hodProfile && (
  <ProfileSection facultyDetails={hodProfile} />
)}
          {/* {activeSection === 'profile' && (
            <div className="profile-section">
              <h2>HOD Profile</h2>


              {error && <p style={{ color: 'red' }}>{error}</p>}

              {!loadingProfile && !error && hodProfile && (
                <div className="profile-card">
                  <p><strong>Name:</strong> {hodProfile.fullName}</p>
                  <p><strong>Employee ID:</strong> {hodProfile.userId}</p>
                  <p><strong>Department:</strong> {hodProfile.department}</p>
                  <p><strong>Email:</strong> {hodProfile.email}</p>
                  <p><strong>Phone:</strong> {hodProfile.phoneNumber}</p>
                  <p><strong>Gender:</strong> {hodProfile.gender}</p>
                </div>
              )}
            </div>
          )} */}
        </div>
      </div>
    </>
  );
}



// // src/pages/HodDashboard.js
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './HodDashboard.css';
// import HodUidApproval from './HodUidApproval';
// import CustomNavbar from './CustomNavbar'; 
// import logo from './logo2.jpeg';

// export default function HodDashboard() {
//   const [activeSection, setActiveSection] = useState('requests');
//   const [hodProfile, setHodProfile] = useState(null);
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));
//   const hodId = user?.hodId;

//   // ✅ Define this BEFORE JSX
//   const handleNavigation = (section) => {
//     if (section === 'logout') {
//       localStorage.clear(); // Clear stored data
//       navigate('/hod-login');
//       return;
//     }
//     setActiveSection(section);
//   };

//   useEffect(() => {
//   const fetchHodProfile = async () => {
//     if (!hodId) {
//       console.error("No HOD ID found in localStorage");
//       return;
//     }

//     try {
//       const res = await fetch(`http://localhost:5000/api/hod/${hodId}`);
//       if (!res.ok) {
//         throw new Error(`HTTP error! Status: ${res.status}`);
//       }
//       const data = await res.json();
//       console.log("Fetched HOD profile:", data); // 🔥 check this in browser console
//       setHodProfile(data);
//     } catch (err) {
//       console.error('Error fetching HOD profile:', err);
//     }
//   };

//   fetchHodProfile();
// }, [hodId]);



//   // useEffect(() => {
//   //   const fetchHodProfile = async () => {
//   //     try {
//   //       const res = await fetch(`http://localhost:5000/api/hod/${hodId}`);
//   //       if (!res.ok) {
//   //         throw new Error('Failed to fetch HOD profile');
//   //       }
//   //       const data = await res.json();
//   //       setHodProfile(data);
//   //     } catch (err) {
//   //       console.error('Error fetching HOD profile:', err);
//   //     }
//   //   };

//   //   if (hodId) {
//   //     fetchHodProfile();
//   //   }
//   // }, [hodId]);

//   // const handleNavigation = (section) => {
//   //   if (section === 'logout') {
//   //     localStorage.clear(); // Clear stored data
//   //     navigate('/hod-login');
//   //     return;
//   //   }
//   //   setActiveSection(section);
//   // };

//   return (
//     <>
//       <CustomNavbar />
//     <div className="hod-dashboard">
//       {/* Sidebar */}
//       <div className="sidebar">
//         <div className="logo-container">
//           {/* <img src={logo} alt="Logo" className="logo" /> */}
//         </div>
//         <h2>HOD Dashboard</h2>
//         <ul>
//           <li
//             className={activeSection === 'requests' ? 'active' : ''}
//             onClick={() => handleNavigation('requests')}
//           >
//             📨 Requesting UIDs
//           </li>
//           <li
//             className={activeSection === 'profile' ? 'active' : ''}
//             onClick={() => handleNavigation('profile')}
//           >
//             👤 Profile
//           </li>
//           <li
//             onClick={() => handleNavigation('logout')}
//             style={{ cursor: 'pointer', color: 'white', marginTop: 'auto' }}
//           >
//             🔚 Logout
//           </li>
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="main-content">
//         {activeSection === 'requests' && <HodUidApproval hodId={hodId} />
// }

//         {activeSection === 'profile' && (
//           <div className="profile-section">
//             <h2>HOD Profile</h2>
//             {hodProfile ? (
//               <div className="profile-card">
//                 <p><strong>Name:</strong> {hodProfile.fullName}</p>
//                 <p><strong>Employee ID:</strong> {hodProfile.hodId}</p>
//                 <p><strong>Department:</strong> {hodProfile.department}</p>
//                 <p><strong>Email:</strong> {hodProfile.email}</p>
//                 <p><strong>Phone:</strong> {hodProfile.phoneNumber}</p>
//               </div>
//             ) : (
//               <p>Loading profile...</p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//     </>
//   );
// }
