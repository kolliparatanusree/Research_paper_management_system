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


export default function HodDashboard() {
  const [activeSection, setActiveSection] = useState('requests');
  const [hodProfile, setHodProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // read HOD ID

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
      <CustomNavbar />
      <div className="hod-dashboard">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            {/* <img src={logo} alt="Logo" className="logo" /> */}
          </div>
          <h2>HOD Dashboard</h2>
          <ul>
            <li
              className={activeSection === 'requests' ? 'active' : ''}
              onClick={() => handleNavigation('requests')}
            >
              📨 Requesting UIDs
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

        {/* Main Content */}
        <div className="main-content">
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
