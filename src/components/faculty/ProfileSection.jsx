// import React, { useEffect, useState } from 'react';
// import ProfileSection from './ProfileSection';
// import axios from 'axios';

// export default function FacultyDashboard() {
//     const [facultyDetails, setFacultyDetails] = useState(null);

//     useEffect(() => {
//         const fetchProfile = async () => {
//             try {
//                 const res = await axios.get('http://localhost:5000/api/faculty/profile', {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem('token')}`
//                     }
//                 });
//                 setFacultyDetails(res.data);
//             } catch (err) {
//                 console.error(err);
//             }
//         };

//         fetchProfile();
//     }, []);

//     return (
//         <ProfileSection facultyDetails={facultyDetails} />
//     );
// }

/* File: src/components/faculty/ProfileSection.jsx */
import React from 'react';

export default function ProfileSection({ facultyDetails }) {
  if (!facultyDetails) {
    return (
      <div className="profile-section">
        <h3>My Profile</h3>
        <p>Loading profile...</p>
      </div>
    );
  }

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
    </div>
  );
}
