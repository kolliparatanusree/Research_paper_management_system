/* File: src/components/faculty/ProfileSection.jsx */
import React from 'react';
import Swal from 'sweetalert2';

export default function ProfileSection({ facultyDetails }) {
  if (!facultyDetails) {
    return (
      <div className="profile-section">
        <h3>My Profile</h3>
        <p>Loading profile...</p>
      </div>
    );
  }

  const showChangePasswordPopup = () => {
    Swal.fire({
      title: 'Change Password',
      html:
        `<input type="password" id="oldPwd" class="swal2-input" placeholder="Old Password">` +
        `<input type="password" id="newPwd" class="swal2-input" placeholder="New Password">` +
        `<input type="password" id="confirmPwd" class="swal2-input" placeholder="Confirm Password">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Change Password',
      preConfirm: async () => {
        const oldPwd = document.getElementById('oldPwd').value;
        const newPwd = document.getElementById('newPwd').value;
        const confirmPwd = document.getElementById('confirmPwd').value;

        if (!oldPwd || !newPwd || !confirmPwd) {
          Swal.showValidationMessage('All fields are required');
          return false;
        }

        if (newPwd !== confirmPwd) {
          Swal.showValidationMessage('New password and Confirm password do not match');
          return false;
        }

        // ✅ Send request with correct field names
        try {
          const res = await fetch('http://localhost:5000/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: facultyDetails.userId,       // matches backend
              currentPassword: oldPwd,             // matches backend
              newPassword: newPwd
            }),
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.message || 'Password change failed');
          return data;
        } catch (err) {
          Swal.showValidationMessage(`Request failed: ${err.message}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Success', 'Password changed successfully!', 'success');
      }
    });
  };

  return (
    <div className="profile-section">
      <h3>My Profile</h3>

      <div className="profile-details">
        <p><strong>Name:</strong> {facultyDetails.fullName}</p>
        <p><strong>Faculty ID:</strong> {facultyDetails.userId}</p>
        <p><strong>Department:</strong> {facultyDetails.department}</p>
        <p><strong>Email:</strong> {facultyDetails.email}</p>
        <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber}</p>
      </div>

      <button
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={showChangePasswordPopup}
      >
        Change Password
      </button>
    </div>
  );
}

// /* File: src/components/faculty/ProfileSection.jsx */
// import React, { useState } from 'react';
// import Swal from 'sweetalert2';

// export default function ProfileSection({ facultyDetails }) {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   if (!facultyDetails) {
//     return (
//       <div className="profile-section">
//         <h3>My Profile</h3>
//         <p>Loading profile...</p>
//       </div>
//     );
//   }

//   const showChangePasswordPopup = () => {
//   Swal.fire({
//     title: 'Change Password',
//     html:
//       `<input type="password" id="oldPwd" class="swal2-input" placeholder="Old Password">` +
//       `<input type="password" id="newPwd" class="swal2-input" placeholder="New Password">` +
//       `<input type="password" id="confirmPwd" class="swal2-input" placeholder="Confirm Password">`,
//     focusConfirm: false,
//     showCancelButton: true,
//     confirmButtonText: 'Change Password',
//     preConfirm: () => {
//       const oldPwd = document.getElementById('oldPwd').value;
//       const newPwd = document.getElementById('newPwd').value;
//       const confirmPwd = document.getElementById('confirmPwd').value;

//       if (!oldPwd || !newPwd || !confirmPwd) {
//         Swal.showValidationMessage('All fields are required');
//         return false;
//       }

//       if (newPwd !== confirmPwd) {
//         Swal.showValidationMessage('New password and Confirm password do not match');
//         return false;
//       }

//       // send request directly here
//       return fetch('http://localhost:5000/api/auth/change-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           facultyId: facultyDetails.userId,
//           oldPassword: oldPwd,
//           newPassword: newPwd
//         }),
//       })
//         .then(async (res) => {
//           const data = await res.json();
//           if (!res.ok) throw new Error(data.message || 'Password change failed');
//           return data;
//         })
//         .catch((err) => {
//           Swal.showValidationMessage(`Request failed: ${err.message}`);
//         });
//     }
//   }).then((result) => {
//     if (result.isConfirmed) {
//       Swal.fire('Success', 'Password changed successfully!', 'success');
//     }
//   });
// };

//   return (
//     <div className="profile-section">
//       <h3>My Profile</h3>

//       <div className="profile-details">
//         <p><strong>Name:</strong> {facultyDetails.fullName}</p>
//         <p><strong>Faculty ID:</strong> {facultyDetails.userId}</p>
//         <p><strong>Department:</strong> {facultyDetails.department}</p>
//         <p><strong>Email:</strong> {facultyDetails.email}</p>
//         <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber}</p>
//       </div>

//       <button
//         style={{
//           marginTop: '20px',
//           padding: '10px 20px',
//           backgroundColor: '#10b981',
//           color: 'white',
//           border: 'none',
//           borderRadius: '5px',
//           cursor: 'pointer',
//         }}
//         onClick={showChangePasswordPopup}
//       >
//         Change Password
//       </button>
//     </div>
//   );
// }

// /* File: src/components/faculty/ProfileSection.jsx */
// import React from 'react';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';

// export default function ProfileSection({ facultyDetails }) {
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  
//   if (!facultyDetails) {
//     return (
//       <div className="profile-section">
//         <h3>My Profile</h3>
//         <p>Loading profile...</p>
//       </div>
//     );
//   }

//   // Function to handle change password popup
// const handleChangePassword = async () => {
//   if (!oldPassword || !newPassword || !confirmPassword) {
//     Swal.fire('Error', 'Please fill all fields', 'error');
//     return;
//   }

//   if (newPassword !== confirmPassword) {
//     Swal.fire('Error', 'New password and confirm password do not match', 'error');
//     return;
//   }

//   try {
//     const facultyId = localStorage.getItem('userId'); // make sure this exists

//     const res = await fetch('http://localhost:5000/api/faculty/change-password', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         facultyId,      // must include this
//         oldPassword,    // must match backend field name
//         newPassword     // must match backend field name
//       }),
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || 'Something went wrong');

//     Swal.fire('Success', data.message, 'success');
//     setOldPassword('');
//     setNewPassword('');
//     setConfirmPassword('');
//   } catch (err) {
//     Swal.fire('Error', err.message, 'error');
//   }
// };

//   return (
//     <div className="profile-section">
//       <h3>My Profile</h3>

//       <div className="profile-details">
//         <p><strong>Name:</strong> {facultyDetails.fullName}</p>
//         <p><strong>Faculty ID:</strong> {facultyDetails.userId}</p>
//         <p><strong>Department:</strong> {facultyDetails.department}</p>
//         <p><strong>Email:</strong> {facultyDetails.email}</p>
//         <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber}</p>
//       </div>

//       <button
//         onClick={handleChangePassword}
//         style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
//       >
//         Change Password
//       </button>
//     </div>
//   );
// }


// // /* File: src/components/faculty/ProfileSection.jsx */
// // import React from 'react';
// // import ChangePasswordForm from '../ChangePasswordForm'; // import it

// // export default function ProfileSection({ facultyDetails }) {
// //   if (!facultyDetails) {
// //     return (
// //       <div className="profile-section">
// //         <h3>My Profile</h3>
// //         <p>Loading profile...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="profile-section">
// //       <h3>My Profile</h3>

// //       <div className="profile-details">
// //         <p><strong>Name:</strong> {facultyDetails.fullName}</p>
// //         <p><strong>Faculty ID:</strong> {facultyDetails.userId}</p>
// //         <p><strong>Department:</strong> {facultyDetails.department}</p>
// //         <p><strong>Email:</strong> {facultyDetails.email}</p>
// //         <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber}</p>
// //       </div>

// //       {/* ✅ Add Change Password Form below the profile info */}
// //       <div style={{ marginTop: '20px' }}>
// //         <ChangePasswordForm userId={facultyDetails.userId} />
// //       </div>
// //     </div>
// //   );
// // }


// // // import React, { useEffect, useState } from 'react';
// // // import ProfileSection from './ProfileSection';
// // // import axios from 'axios';

// // // export default function FacultyDashboard() {
// // //     const [facultyDetails, setFacultyDetails] = useState(null);

// // //     useEffect(() => {
// // //         const fetchProfile = async () => {
// // //             try {
// // //                 const res = await axios.get('http://localhost:5000/api/faculty/profile', {
// // //                     headers: {
// // //                         Authorization: `Bearer ${localStorage.getItem('token')}`
// // //                     }
// // //                 });
// // //                 setFacultyDetails(res.data);
// // //             } catch (err) {
// // //                 console.error(err);
// // //             }
// // //         };

// // //         fetchProfile();
// // //     }, []);

// // //     return (
// // //         <ProfileSection facultyDetails={facultyDetails} />
// // //     );
// // // }

// // /* File: src/components/faculty/ProfileSection.jsx */
// // import React from 'react';

// // export default function ProfileSection({ facultyDetails }) {
// //   if (!facultyDetails) {
// //     return (
// //       <div className="profile-section">
// //         <h3>My Profile</h3>
// //         <p>Loading profile...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="profile-section">
// //       <h3>My Profile</h3>

// //       <div className="profile-details">
// //         <p><strong>Name:</strong> {facultyDetails.fullName}</p>
// //         <p><strong>Faculty ID:</strong> {facultyDetails.userId}</p>
// //         <p><strong>Department:</strong> {facultyDetails.department}</p>
// //         <p><strong>Email:</strong> {facultyDetails.email}</p>
// //         <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber}</p>
// //       </div>
// //     </div>
// //   );
// // }
