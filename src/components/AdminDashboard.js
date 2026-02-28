// File: src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import AddUserForm from './AddUserForm';
import RemoveFaculty from './RemoveFaculty';
import RemoveHod from './RemoveHOD';
import './AdminDashboard.css';
import CustomNavbar from './CustomNavbar';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('addUser');
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Do you really want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have successfully logged out!',
          timer: 1500,
          showConfirmButton: false
        }).then(() => navigate('/login'));
      }
    });
  };

  return (
    <>
      <CustomNavbar />

      <div className="admin-dashboard">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="sidebar-title">Admin Dashboard</h2>

          <button
            className={`sidebar-btn ${activeSection === 'addUser' ? 'active' : ''}`}
            onClick={() => setActiveSection('addUser')}
          >
            ➕ Add User
            <span className="sidebar-label">Create new Faculty / HOD accounts</span>
          </button>

          <button
            className={`sidebar-btn ${activeSection === 'viewFaculty' ? 'active' : ''}`}
            onClick={() => setActiveSection('viewFaculty')}
          >
            👨‍🏫 View Faculty
            <span className="sidebar-label">See and remove faculty members</span>
          </button>

          <button
            className={`sidebar-btn ${activeSection === 'viewHod' ? 'active' : ''}`}
            onClick={() => setActiveSection('viewHod')}
          >
            🧑‍💼 View HOD
            <span className="sidebar-label">See and remove HODs</span>
          </button>

          <button
            className="sidebar-btn logout-btn"
            onClick={handleLogout}
          >
            🔚 Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activeSection === 'addUser' && <AddUserForm />}
          {activeSection === 'viewFaculty' && <RemoveFaculty />}
          {activeSection === 'viewHod' && <RemoveHod />}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;

// import React, { useState } from 'react';
// import AddUserForm from './AddUserForm';
// import RemoveFaculty from './RemoveFaculty';
// import RemoveHod from './RemoveHOD';
// import './AdminDashboard.css';
// import CustomNavbar from './CustomNavbar';
// import { useNavigate } from "react-router-dom";
// import Swal from 'sweetalert2';

// const AdminDashboard = () => {
//   const [activeSection, setActiveSection] = useState('addUser');
//   const navigate = useNavigate(); // ✅ DEFINE navigate HERE

//   const handleLogout = () => {
//     Swal.fire({
//       title: 'Logout?',
//       text: 'Do you really want to logout?',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, Logout',
//       cancelButtonText: 'Cancel'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         localStorage.clear();

//         Swal.fire({
//           icon: 'success',
//           title: 'Logged Out',
//           text: 'You have successfully logged out!',
//           timer: 1500,
//           showConfirmButton: false
//         }).then(() => {
//           navigate('/login'); // ✅ NOW IT WORKS
//         });
//       }
//     });
//   };

//   return (
//     <>
//       <CustomNavbar />

//       <div className="admin-dashboard">
//         {/* Sidebar */}
//         <aside className="sidebar">
//           <h2 className="sidebar-title">Admin Dashboard</h2>

//           <button
//             onClick={() => setActiveSection('addUser')}
//             className={`sidebar-btn ${activeSection === 'addUser' ? 'active' : ''}`}
//           >
//             ➕ Add User
//           </button>

//           <button
//             onClick={() => setActiveSection('viewFaculty')}
//             className={`sidebar-btn ${activeSection === 'viewFaculty' ? 'active' : ''}`}
//           >
//             👨‍🏫 View Faculty Details
//           </button>

//           <button
//             onClick={() => setActiveSection('viewHod')}
//             className={`sidebar-btn ${activeSection === 'viewHod' ? 'active' : ''}`}
//           >
//             🧑‍💼 View HOD Details
//           </button>

//           <li
//             className="btn"
//             onClick={handleLogout}
//             style={{ color: 'white', cursor: 'pointer', fontSize: '20px' }}
//           >
//             🔚 Logout
//           </li>
//         </aside>

//         {/* Main Content */}
//         <main className="main-content">
//           {activeSection === 'addUser' && <AddUserForm />}
//           {activeSection === 'viewFaculty' && <RemoveFaculty />}
//           {activeSection === 'viewHod' && <RemoveHod />}
//         </main>
//       </div>
//     </>
//   );
// };

// export default AdminDashboard;



// // import React, { useState } from 'react';
// // import AddUserForm from './AddUserForm';
// // import RemoveFaculty from './RemoveFaculty';
// // import RemoveHod from './RemoveHOD';
// // import './AdminDashboard.css';
// // import CustomNavbar from './CustomNavbar';
// // import { useNavigate } from "react-router-dom";
// // import Swal from 'sweetalert2';

// // const handleLogout = () => {
// //   Swal.fire({
// //     icon: 'success',
// //     title: 'Logged Out',
// //     text: 'You have successfully logged out!',
// //     timer: 2000,
// //     showConfirmButton: false
// //   }).then(() => {
// //     navigate('/login');
// //   });
// // };

// // const AdminDashboard = () => {
// //   const [activeSection, setActiveSection] = useState('addUser');
// //   const handleLogout = () => {
// //     navigate('/login');
// //   };

// //   return (
// //     <>
// //       <CustomNavbar />

// //       <div className="admin-dashboard">
// //         {/* Sidebar */}
// //         <aside className="sidebar">
// //           <h2 className="sidebar-title">Admin Dashboard</h2>

// //           <button
// //             onClick={() => setActiveSection('addUser')}
// //             className={`sidebar-btn ${activeSection === 'addUser' ? 'active' : ''}`}
// //           >
// //             ➕ Add User
// //           </button>

// //           <button
// //             onClick={() => setActiveSection('viewFaculty')}
// //             className={`sidebar-btn ${activeSection === 'viewFaculty' ? 'active' : ''}`}
// //           >
// //             👨‍🏫 View Faculty Details
// //           </button>

// //           <button
// //             onClick={() => setActiveSection('viewHod')}
// //             className={`sidebar-btn ${activeSection === 'viewHod' ? 'active' : ''}`}
// //           >
// //             🧑‍💼 View HOD Details
// //           </button>
// //           <li className="btn" onClick={handleLogout} style={{ color: 'white', marginTop: '0px', cursor: 'pointer', fontSize: '20px' }}>🔚 Logout</li>
// //         </aside>

// //         {/* Main Content */}
// //         <main className="main-content">
// //           {activeSection === 'addUser' && <AddUserForm />}
// //           {activeSection === 'viewFaculty' && <RemoveFaculty />}
// //           {activeSection === 'viewHod' && <RemoveHod />}
// //         </main>
// //       </div>
// //     </>
// //   );
// // };

// // export default AdminDashboard;



// // // import React, { useState } from 'react';
// // // import AddFacultyForm from './AddFacultyForm';
// // // import RemoveFaculty from './RemoveFaculty';
// // // import AddHodForm from './AddHOD';        // Import your AddHodForm component
// // // import RemoveHod from './RemoveHOD';          // Import your RemoveHod component
// // // import './AdminDashboard.css';
// // // import CustomNavbar from './CustomNavbar'; // Import the custom navbar
// // // import AddUserForm from './AddUserForm';

// // // const AdminDashboard = () => {
// // //   const [activeSection, setActiveSection] = useState('addFaculty');

// // //   return (
// // //     <>
// // //       <CustomNavbar />
// // //     <div className="admin-dashboard">
// // //       {/* Sidebar */}
// // //       <aside className="sidebar">
// // //         <h2 className="sidebar-title">Admin Dashboard</h2>

// // //         <button
// // //           onClick={() => setActiveSection('addFaculty')}
// // //           className={`sidebar-btn ${activeSection === 'addFaculty' ? 'active' : ''}`}
// // //         >
// // //           ➕ Add Faculty
// // //         </button>

// // //         <button
// // //           onClick={() => setActiveSection('removeFaculty')}
// // //           className={`sidebar-btn ${activeSection === 'removeFaculty' ? 'active' : ''}`}
// // //         >
// // //           View Faculty Details
// // //         </button>

// // //         <button
// // //           onClick={() => setActiveSection('addHod')}
// // //           className={`sidebar-btn ${activeSection === 'addHod' ? 'active' : ''}`}
// // //         >
// // //           ➕ Add HOD
// // //         </button>

// // //         <button
// // //           onClick={() => setActiveSection('removeHod')}
// // //           className={`sidebar-btn ${activeSection === 'removeHod' ? 'active' : ''}`}
// // //         >
// // //           View HOD Details
// // //         </button>
// // //       </aside>

// // //       {/* Main Content */}
// // //       <main className="main-content">
// // //         {activeSection === 'addFaculty' && <AddFacultyForm />}
// // //         {activeSection === 'removeFaculty' && <RemoveFaculty />}
// // //         {activeSection === 'addHod' && <AddHodForm />}
// // //         {activeSection === 'removeHod' && <RemoveHod />}
// // //       </main>
// // //     </div></>
// // //   );
// // // };

// // // export default AdminDashboard;
