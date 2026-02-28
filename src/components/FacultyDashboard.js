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
import Swal from 'sweetalert2';

export default function FacultyDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [facultyDetails, setFacultyDetails] = useState(null);
  const [counts, setCounts] = useState({
    approvedUIDs: 0,
    pendingUIDs: 0,
    approvedPIDs: 0,
    pendingPIDs: 0,
  });

  const facultyId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // fetch counts
  const fetchCounts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/counts/${facultyId}`);
      const data = await res.json();
      setCounts(data);
    } catch (err) {
      console.error('Error fetching dashboard counts:', err);
    }
  };

  // fetch faculty details
  useEffect(() => {
    const fetchDetails = async () => {
      const res = await fetch(`http://localhost:5000/api/faculty/${facultyId}`);
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
      <CustomNavbar />
      <div className="dashboard-container">
        <div className="sidebar1">
          <nav className="menu">
            <ul>
              <li 
                className={activeSection === 'dashboard' ? 'active' : ''} 
                onClick={() => setActiveSection('dashboard')}
              >
                📊 Dashboard
              </li>
              <li className={activeSection === 'request-uid' ? 'active' : ''} onClick={() => setActiveSection('request-uid')}>📄 Request UID</li>
              <li className={activeSection === 'uid-status' ? 'active' : ''} onClick={() => setActiveSection('uid-status')}>🔄 UID Status</li>
              <li className={activeSection === 'indexing' ? 'active' : ''} onClick={() => setActiveSection('indexing')}>📤 Submit Documents</li>
              <li className={activeSection === 'my-submissions' ? 'active' : ''} onClick={() => setActiveSection('my-submissions')}>🔄 PID Status</li>
              <li className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>👤 Profile</li>
              <li className="btn" onClick={handleLogout} style={{ color: 'white', marginTop: '0px', cursor: 'pointer', fontSize: '20px' }}>🔚 Logout</li>
            </ul>
          </nav>
        </div>

        <div className="main-content">
          <p style={{ color: 'purple', fontSize: '25px' }}>Welcome, {facultyDetails?.fullName || 'Faculty'}</p>

          {/* ✅ Dashboard counts panel */}
          {activeSection === 'dashboard' && (
            <div
              className="dashboard-counts"
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
              }}
            >
              {/* Total UIDs */}
              <div
                className="count-card"
                style={{
                  background: 'linear-gradient(145deg, #10b981, #34d399)',
                  color: 'white',
                  padding: '1rem',
                  height: '150px',
                  borderRadius: '15px',
                  flex: 1,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                <h4>Total UIDs</h4>
                <p style={{ fontSize: '20px' }}>{counts.approvedUIDs + counts.pendingUIDs}</p>
              </div>

              {/* Total PIDs */}
              <div
                className="count-card"
                style={{
                  background: 'linear-gradient(145deg, #3b82f6, #60a5fa)',
                  color: 'white',
                  padding: '1rem',
                  height: '150px',
                  borderRadius: '15px',
                  flex: 1,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                <h4>Total PIDs</h4>
                <p style={{ fontSize: '20px' }}>{counts.approvedPIDs + counts.pendingPIDs}</p>
              </div>

              {/* Approved UIDs */}
              <div
                className="count-card"
                style={{
                  background: 'linear-gradient(145deg, #dba00b, #e4bb17)',
                  color: 'white',
                  padding: '1rem',
                  height: '150px',
                  borderRadius: '15px',
                  flex: 1,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                <h4>Approved UIDs</h4>
                <p style={{ fontSize: '20px' }}>{counts.approvedUIDs}</p>
              </div>

              {/* Pending UIDs */}
              <div
                className="count-card"
                style={{
                  background: 'linear-gradient(145deg, #ef4444, #f87171)',
                  color: 'white',
                  padding: '1rem',
                  height: '150px',
                  borderRadius: '15px',
                  flex: 1,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                <h4>Pending UIDs</h4>
                <p style={{ fontSize: '20px' }}>{counts.pendingUIDs}</p>
              </div>

              {/* Approved PIDs */}
              <div
                className="count-card"
                style={{
                  background: 'linear-gradient(145deg, #6366f1, #a5b4fc)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '15px',
                  height: '150px',
                  flex: 1,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                <h4>Approved PIDs</h4>
                <p style={{ fontSize: '20px' }}>{counts.approvedPIDs}</p>
              </div>

              {/* Pending PIDs */}
              <div
                className="count-card"
                style={{
                  background: 'linear-gradient(145deg, #1e40af, #3b82f6)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '15px',
                  height: '150px',
                  flex: 1,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                <h4>Pending PIDs</h4>
                <p style={{ fontSize: '20px' }}>{counts.pendingPIDs}</p>
              </div>
            </div>
          )}

          {activeSection === 'request-uid' && <RequestUIDForm facultyDetails={facultyDetails} />}
          {activeSection === 'uid-status' && facultyDetails && <UIDStatusList facultyId={facultyId} />}
          {activeSection === 'indexing' && facultyDetails && <DocumentUploadSection userId={facultyId} />}
          {activeSection === 'my-submissions' && facultyDetails && <PIDStatusList facultyId={facultyDetails.userId} />}
          {activeSection === 'profile' && <ProfileSection facultyDetails={facultyDetails} />}
        </div>
      </div>
    </>
  );
}

// import React, { useEffect, useState } from 'react';
// import './FacultyDashboard.css';
// import CustomNavbar from './CustomNavbar';
// import { useNavigate } from 'react-router-dom';
// import UIDStatusList from '../components/UIDStatusList';
// import PIDStatusList from '../components/PIDStatusList';
// import RequestUIDForm from './faculty/RequestUIDForm';
// import DocumentUploadSection from './faculty/DocumentUploadSection';
// import ProfileSection from './faculty/ProfileSection';
// import DashboardCounts from '../components/faculty/DashboardCounts';import Swal from 'sweetalert2';

// export default function FacultyDashboard() {
//   const [activeSection, setActiveSection] = useState('request-uid');
//   const [facultyDetails, setFacultyDetails] = useState(null);
//   const [counts, setCounts] = useState({
//     approvedUIDs: 0,
//     pendingUIDs: 0,
//     approvedPIDs: 0,
//     pendingPIDs: 0,
//   });
//   // const [activeSection, setActiveSection] = useState('dashboard'); // default section
//   const facultyId = localStorage.getItem('userId');
//   const navigate = useNavigate();

//   // ✅ fetchCounts defined at component scope
//   const fetchCounts = async () => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/dashboard/counts/${facultyId}`);
//       const data = await res.json();
//       setCounts(data);
//     } catch (err) {
//       console.error('Error fetching dashboard counts:', err);
//     }
//   };

//   // fetch faculty details
//   useEffect(() => {
//     const fetchDetails = async () => {
//       const res = await fetch(`http://localhost:5000/api/faculty/${facultyId}`);
//       const data = await res.json();
//       setFacultyDetails({ ...data, facultyId: data.userId });
//     };
//     if (facultyId) fetchDetails();
//   }, [facultyId]);

//   // fetch counts on mount
//   useEffect(() => {
//     fetchCounts(); // call on mount

//     // Optional: refresh every 30 seconds
//     const interval = setInterval(fetchCounts, 30000);
//     return () => clearInterval(interval);
//   }, []); // run once

//   // Logout
//   const handleLogout = () => {
//     localStorage.clear();
//     Swal.fire({
//       title: 'Are you sure?',
//       text: "Do you really want to log out?",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, log me out',
//       cancelButtonText: 'Cancel',
//       confirmButtonColor: '#10b981',
//       cancelButtonColor: '#f87171',
//     }).then((result) => {
//       if (result.isConfirmed) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Logged Out',
//           text: 'You have successfully logged out!',
//           timer: 2000,
//           showConfirmButton: false
//         }).then(() => navigate('/login'));
//       }
//     });
//   };

//   return (
//     <>
//       <CustomNavbar />
//       <div className="dashboard-container">
//         <div className="sidebar1">
//           <nav className="menu">
//             <ul>
// <li 
//     className={activeSection === 'dashboard' ? 'active' : ''} 
//     onClick={() => setActiveSection('dashboard')}
//   >
//     📊 Dashboard
//   </li>              <li className={activeSection === 'request-uid' ? 'active' : ''} onClick={() => setActiveSection('request-uid')}>📄 Request UID</li>
//               <li className={activeSection === 'uid-status' ? 'active' : ''} onClick={() => setActiveSection('uid-status')}>🔄 UID Status</li>
//               <li className={activeSection === 'indexing' ? 'active' : ''} onClick={() => setActiveSection('indexing')}>📤 Submit Documents</li>
//               <li className={activeSection === 'my-submissions' ? 'active' : ''} onClick={() => setActiveSection('my-submissions')}>🔄 PID Status</li>
//               <li className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>👤 Profile</li>
//               <li className="btn" onClick={handleLogout} style={{ color: 'white', marginTop: '0px', cursor: 'pointer', fontSize: '20px' }}>🔚 Logout</li>
//             </ul>
//           </nav>
//         </div>

//         <div className="main-content">
//           <p style={{ color: 'purple', fontSize: '25px' }}>Welcome, {facultyDetails?.fullName || 'Faculty'}</p>

//           {/* ✅ Dashboard counts panel */}
//          <div
//   className="dashboard-counts"
//   style={{
//     display: 'flex',
//     gap: '1rem',
//     marginBottom: '1.5rem',
//     flexWrap: 'wrap'
//   }}
// >
//   {/* Total UIDs */}
//   <div
//     className="count-card"
//     style={{
//       background: 'linear-gradient(145deg, #10b981, #34d399)', // shiny gradient green
//       color: 'white',
//       padding: '1rem',
//       borderRadius: '15px',
//       flex: 1,
//       boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)', // shadow + shine
//       textAlign: 'center',
//       fontWeight: 'bold',
//     }}
//   >
//     <h4>Total UIDs</h4>
//     <p style={{ fontSize: '20px' }}>{counts.totalUIDs}</p>
//   </div>

//   {/* Total PIDs */}
//   <div
//     className="count-card"
//     style={{
//       background: 'linear-gradient(145deg, #3b82f6, #60a5fa)', // blue shiny
//       color: 'white',
//       padding: '1rem',
//       borderRadius: '15px',
//       flex: 1,
//       boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
//       textAlign: 'center',
//       fontWeight: 'bold',
//     }}
//   >
//     <h4>Total PIDs</h4>
//     <p style={{ fontSize: '20px' }}>{counts.totalPIDs}</p>
//   </div>

//   {/* Approved UIDs */}
//   <div
//     className="count-card"
//     style={{
//       background: 'linear-gradient(145deg, #dba00b, #e4bb17)', // yellow shiny
//       color: 'white',
//       padding: '1rem',
//       borderRadius: '15px',
//       flex: 1,
//       boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
//       textAlign: 'center',
//       fontWeight: 'bold',
//     }}
//   >
//     <h4>Approved UIDs</h4>
//     <p style={{ fontSize: '20px' }}>{counts.approvedUIDs}</p>
//   </div>

//   {/* Pending UIDs */}
//   <div
//     className="count-card"
//     style={{
//       background: 'linear-gradient(145deg, #ef4444, #f87171)', // red shiny
//       color: 'white',
//       padding: '1rem',
//       borderRadius: '15px',
//       flex: 1,
//       boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
//       textAlign: 'center',
//       fontWeight: 'bold',
//     }}
//   >
//     <h4>Pending UIDs</h4>
//     <p style={{ fontSize: '20px' }}>{counts.pendingUIDs}</p>
//   </div>

//   {/* Approved PIDs */}
//   <div
//     className="count-card"
//     style={{
//       background: 'linear-gradient(145deg, #6366f1, #a5b4fc)', // indigo shiny
//       color: 'white',
//       padding: '1rem',
//       borderRadius: '15px',
//       flex: 1,
//       boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
//       textAlign: 'center',
//       fontWeight: 'bold',
//     }}
//   >
//     <h4>Approved PIDs</h4>
//     <p style={{ fontSize: '20px' }}>{counts.approvedPIDs}</p>
//   </div>

//   {/* Pending PIDs */}
//   <div
//     className="count-card"
//     style={{
//       background: 'linear-gradient(145deg, #1e40af, #3b82f6)', // dark blue shiny
//       color: 'white',
//       padding: '1rem',
//       borderRadius: '15px',
//       flex: 1,
//       boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
//       textAlign: 'center',
//       fontWeight: 'bold',
//     }}
//   >
//     <h4>Pending PIDs</h4>
//     <p style={{ fontSize: '20px' }}>{counts.pendingPIDs}</p>
//   </div>
// </div>
//           {/* {activeSection === 'dashboard' && <DashboardCounts />} */}
//           {activeSection === 'request-uid' && <RequestUIDForm facultyDetails={facultyDetails} />}
//           {activeSection === 'uid-status' && facultyDetails && <UIDStatusList facultyId={facultyId} />}
//           {activeSection === 'indexing' && facultyDetails && <DocumentUploadSection userId={facultyId} />}
//           {activeSection === 'my-submissions' && facultyDetails && <PIDStatusList facultyId={facultyDetails.userId} />}
//           {activeSection === 'profile' && <ProfileSection facultyDetails={facultyDetails} />}
//         </div>
//       </div>
//     </>
//   );
// }
