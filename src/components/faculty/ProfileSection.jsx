/* File: src/components/faculty/ProfileSection.jsx */
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './ProfileSection.css';

export default function ProfileSection({ facultyDetails, refreshProfile }) {
  const [editSection, setEditSection] = useState(null); // 'experience', 'publications', 'awards'
  const [tempData, setTempData] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
const [phoneNumber, setPhoneNumber] = useState(facultyDetails.phoneNumber || '');
const [newProfilePic, setNewProfilePic] = useState(null);
 const parseEducationString = (eduStr) => {
  if (!eduStr) return [{ degree: '', institution: '', year: '' }];

  return eduStr.split(';').map(item => {
    const match = item.match(/(.*?) - (.*?) \((.*?)\)/);
    return match
      ? {
          degree: match[1]?.trim() || '',
          institution: match[2]?.trim() || '',
          year: match[3]?.trim() || ''
        }
      : { degree: '', institution: '', year: '' };
  });
};

const [publicationsList, setPublicationsList] = useState(
  facultyDetails?.publications || []
);
const [educationList, setEducationList] = useState(
  parseEducationString(facultyDetails.educationDetails)
);

const [experienceDetails, setExperienceDetails] = useState(
  facultyDetails.experienceDetails || ''
);
  const profilePicUrl = facultyDetails?.profilePic
  ? `http://localhost:5000/${facultyDetails.profilePic}`
  : null;
  if (!facultyDetails) {
    return (
      <div className="profile-section">
        <h3>My Profile</h3>
        <p>Loading profile...</p>
      </div>
    );
  }

  const handleEducationChange = (index, field, value) => {
  const list = [...educationList];
  list[index][field] = value;
  setEducationList(list);
};

const handleAddEducation = () => {
  setEducationList([...educationList, { degree: '', institution: '', year: '' }]);
};

const handleRemoveEducation = (idx) => {
  setEducationList(educationList.filter((_, i) => i !== idx));
};

 

const formatEducationString = (list) => {
  return list
    .map(e => `${e.degree} - ${e.institution} (${e.year})`)
    .join('; ');
};

  const handleProfileSave = async () => {
  try {
    const formData = new FormData();
    formData.append('phoneNumber', phoneNumber);
    const eduString = formatEducationString(educationList);
formData.append('educationDetails', eduString);
    formData.append('experienceDetails', experienceDetails);
formData.append('publications', JSON.stringify(publicationsList));
    if (newProfilePic) {
      formData.append('profilePic', newProfilePic);
    }

    const res = await fetch(
      `http://localhost:5000/api/auth/update-profile/${facultyDetails.userId}`,
      {
        method: 'PUT',
        body: formData
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    Swal.fire('Success', 'Profile updated successfully', 'success');

    setIsEditingProfile(false);
    refreshProfile?.();

  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  }
};

  const handleChangePassword = () => {
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

        try {
          const res = await fetch('http://localhost:5000/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: facultyDetails.userId,
              currentPassword: oldPwd,
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

  const handlePublicationChange = (index, field, value) => {
  const list = [...publicationsList];
  list[index][field] = value;
  setPublicationsList(list);
};

const handleAddPublication = () => {
  setPublicationsList([
    ...publicationsList,
    { title: '', journal: '', year: '' }
  ]);
};

const handleRemovePublication = (idx) => {
  setPublicationsList(publicationsList.filter((_, i) => i !== idx));
};

  const handleEditClick = (section, currentArray) => {
    setEditSection(section);
    setTempData(currentArray || []);
  };

  const handleSave = async (section) => {
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/update-${section}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: facultyDetails.userId,
          data: tempData
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      Swal.fire('Success', `${section} updated successfully!`, 'success');
      setEditSection(null);

      // Refresh parent profile if passed
      if (refreshProfile) refreshProfile();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };
  

  const renderArraySection = (label, sectionKey, arrayData) => {
    if (!Array.isArray(arrayData) || arrayData.length === 0) return null;

    return (
      <div>
        <strong>{label}:</strong>
        {editSection === sectionKey ? (
          <div>
            {tempData.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                {Object.keys(item).map((k) => (
                  <input
                    key={k}
                    type="text"
                    value={item[k] || ''}
                    placeholder={k}
                    onChange={(e) => {
                      const newData = [...tempData];
                      newData[idx][k] = e.target.value;
                      setTempData(newData);
                    }}
                    style={{ marginRight: '5px', marginBottom: '5px' }}
                  />
                ))}
              </div>
            ))}
            <button onClick={() => setTempData([...tempData, {}])}>+ Add</button>
            <button onClick={() => handleSave(sectionKey)} style={{ marginLeft: '10px' }}>Save</button>
            <button onClick={() => setEditSection(null)} style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}>Cancel</button>
          </div>
        ) : (
          <ul>
            {arrayData.map((item) => (
              <li key={item._id || item.title || Math.random()}>
                {sectionKey === 'experience' ? `${item.role} at ${item.organization} (${item.years})` :
                 sectionKey === 'publications' ? `${item.title} — ${item.journal} (${item.year})` :
                 sectionKey === 'awards' ? `${item.name} (${item.year})` : JSON.stringify(item)}
              </li>
            ))}
            <button onClick={() => handleEditClick(sectionKey, arrayData)} style={{ marginTop: '5px' }}>Edit</button>
          </ul>
        )}
      </div>
    );
  };

  return (
  <div className="profile-page">
    <div className="profile-card">

    <h3>My Profile</h3>
        <button
      onClick={() => setIsEditingProfile(!isEditingProfile)}
      style={{
        marginBottom: '15px',
        padding: '6px 14px',
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      {isEditingProfile ? 'Cancel Edit' : '✏️ Edit Profile'}
    </button>

    {/* 🟢 CARD 1 — BASIC INFO */}
    <div className="profile-card">
      <h4>Basic Information</h4>

      {profilePicUrl && (
        <div className="profile-pic-wrapper">
          <img
            src={profilePicUrl}
            alt="Profile"
            className="profile-pic"
          />
          {isEditingProfile && (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setNewProfilePic(e.target.files[0])}
      style={{ marginTop: '10px' }}
    />
  )}
          
        </div>
      )}

      <p><strong>Name:</strong> {facultyDetails.fullName || 'N/A'}</p>
      <p><strong>Faculty ID:</strong> {facultyDetails.userId || 'N/A'}</p>
      <p><strong>Department:</strong> {facultyDetails.department || 'N/A'}</p>
      <p><strong>Email:</strong> {facultyDetails.email || 'N/A'}</p>
      <p><strong>Phone Number:</strong></p>

{isEditingProfile ? (
  <input
    type="text"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
    style={{ marginBottom: '10px', padding: '6px', width: '250px' }}
  />
) : (
  <p>{facultyDetails.phoneNumber || 'N/A'}</p>
)}
      {/* <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber || 'N/A'}</p> */}
    </div>
  {/* 🟣 CARD — EDUCATION */}
<div className="profile-card">
  <h4>Education</h4>
{isEditingProfile ? (
  <>
    {educationList.map((edu, idx) => (
      <div key={idx} className="entry-block">

        <label>Education Level *</label>
        <select
          value={edu.degree}
          onChange={(e) =>
            handleEducationChange(idx, 'degree', e.target.value)
          }
        >
          <option value="">-- Select Education Level --</option>
          <option value="Ph.D">Ph.D</option>
          <option value="Post Doctorate">Post Doctorate</option>
          <option value="M.Tech">M.Tech</option>
          <option value="M.E">M.E</option>
          <option value="M.Sc">M.Sc</option>
          <option value="MBA">MBA</option>
          <option value="B.Tech">B.Tech</option>
          <option value="B.E">B.E</option>
          <option value="B.Sc">B.Sc</option>
          <option value="Intermediate">Intermediate (12th)</option>
          <option value="SSC">SSC (10th)</option>
        </select>

        <label>Institution *</label>
        <input
          type="text"
          value={edu.institution}
          onChange={(e) =>
            handleEducationChange(idx, 'institution', e.target.value)
          }
        />

        <label>Year *</label>
        <input
          type="text"
          value={edu.year}
          onChange={(e) =>
            handleEducationChange(idx, 'year', e.target.value)
          }
        />

        {educationList.length > 1 && (
          <button
            type="button"
            className="remove-btn"
            onClick={() => handleRemoveEducation(idx)}
          >
            🗑️ Remove
          </button>
        )}
      </div>
    ))}

    <button type="button" onClick={handleAddEducation}>
      + Add Education
    </button>
  </>
) : (
  <p>{facultyDetails.educationDetails || 'N/A'}</p>
)}
  {/* {isEditingProfile ? (
    <textarea
      value={educationDetails}
      onChange={(e) => setEducationDetails(e.target.value)}
      rows={3}
      style={{ width: '100%', marginTop: '6px' }}
      placeholder="Enter education details"
    />
  ) : (
    <p>{facultyDetails.educationDetails || 'N/A'}</p>
  )} */}
</div>
    {/* 🟣 CARD 2 — EDUCATION */}
    {/* {facultyDetails.educationDetails && (
      <div className="profile-card">
        <h4>Education</h4>
        <p>{facultyDetails.educationDetails}</p>
      </div>
    )} */}

    {/* 🔵 CARD 3 — EXPERIENCE */}
    {/* {Array.isArray(facultyDetails.experienceDetails) &&
      facultyDetails.experienceDetails.length > 0 && (
        <div className="profile-card">
          <h4>Experience</h4>
          {renderArraySection(
            '',
            'experience',
            facultyDetails.experienceDetails
          )}
        </div>
      )} */}
{/* 🔵 CARD — EXPERIENCE */}
<div className="profile-card">
  <h4>Experience</h4>

  {isEditingProfile ? (
    <textarea
      value={experienceDetails}
      onChange={(e) => setExperienceDetails(e.target.value)}
      rows={3}
      style={{ width: '100%', marginTop: '6px' }}
      placeholder="Enter experience details"
    />
  ) : (
    <p>{facultyDetails.experienceDetails || 'N/A'}</p>
  )}
</div>
    {/* 🟡 CARD 4 — PUBLICATIONS */}
    {/* 🟡 CARD — PUBLICATIONS */}
<div className="profile-card">
  <h4>Publications</h4>
  <p style={{ fontSize: '16px', fontWeight: '600' }}>
    Total Publications:{' '}
    {Array.isArray(facultyDetails?.publications)
      ? facultyDetails.publications.length
      : 0}
  </p>

  
</div> {isEditingProfile && (
  <button
    onClick={handleProfileSave}
    style={{
      marginTop: '15px',
      padding: '10px 20px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }}
  >
    💾 Save Profile
  </button>
)}<br />

    {/* 🔐 PASSWORD BUTTON */}
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
      onClick={handleChangePassword}
    >
      Change Password
    </button>
   
      </div>
  </div>
);
}

// /* File: src/components/faculty/ProfileSection.jsx */
// import React from 'react';
// import Swal from 'sweetalert2';

// export default function ProfileSection({ facultyDetails }) {
//   if (!facultyDetails) {
//     return (
//       <div className="profile-section">
//         <h3>My Profile</h3>
//         <p>Loading profile...</p>
//       </div>
//     );
//   }

//   const showChangePasswordPopup = () => {
//     Swal.fire({
//       title: 'Change Password',
//       html:
//         `<input type="password" id="oldPwd" class="swal2-input" placeholder="Old Password">` +
//         `<input type="password" id="newPwd" class="swal2-input" placeholder="New Password">` +
//         `<input type="password" id="confirmPwd" class="swal2-input" placeholder="Confirm Password">`,
//       focusConfirm: false,
//       showCancelButton: true,
//       confirmButtonText: 'Change Password',
//       preConfirm: async () => {
//         const oldPwd = document.getElementById('oldPwd').value;
//         const newPwd = document.getElementById('newPwd').value;
//         const confirmPwd = document.getElementById('confirmPwd').value;

//         if (!oldPwd || !newPwd || !confirmPwd) {
//           Swal.showValidationMessage('All fields are required');
//           return false;
//         }

//         if (newPwd !== confirmPwd) {
//           Swal.showValidationMessage('New password and Confirm password do not match');
//           return false;
//         }

//         // ✅ Send request with correct field names
//         try {
//           const res = await fetch('http://localhost:5000/api/auth/change-password', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               userId: facultyDetails.userId,       // matches backend
//               currentPassword: oldPwd,             // matches backend
//               newPassword: newPwd
//             }),
//           });

//           const data = await res.json();

//           if (!res.ok) throw new Error(data.message || 'Password change failed');
//           return data;
//         } catch (err) {
//           Swal.showValidationMessage(`Request failed: ${err.message}`);
//         }
//       }
//     }).then((result) => {
//       if (result.isConfirmed) {
//         Swal.fire('Success', 'Password changed successfully!', 'success');
//       }
//     });
//   };

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

// // /* File: src/components/faculty/ProfileSection.jsx */
// // import React, { useState } from 'react';
// // import Swal from 'sweetalert2';

// // export default function ProfileSection({ facultyDetails }) {
// //   const [oldPassword, setOldPassword] = useState('');
// //   const [newPassword, setNewPassword] = useState('');
// //   const [confirmPassword, setConfirmPassword] = useState('');

// //   if (!facultyDetails) {
// //     return (
// //       <div className="profile-section">
// //         <h3>My Profile</h3>
// //         <p>Loading profile...</p>
// //       </div>
// //     );
// //   }

// //   const showChangePasswordPopup = () => {
// //   Swal.fire({
// //     title: 'Change Password',
// //     html:
// //       `<input type="password" id="oldPwd" class="swal2-input" placeholder="Old Password">` +
// //       `<input type="password" id="newPwd" class="swal2-input" placeholder="New Password">` +
// //       `<input type="password" id="confirmPwd" class="swal2-input" placeholder="Confirm Password">`,
// //     focusConfirm: false,
// //     showCancelButton: true,
// //     confirmButtonText: 'Change Password',
// //     preConfirm: () => {
// //       const oldPwd = document.getElementById('oldPwd').value;
// //       const newPwd = document.getElementById('newPwd').value;
// //       const confirmPwd = document.getElementById('confirmPwd').value;

// //       if (!oldPwd || !newPwd || !confirmPwd) {
// //         Swal.showValidationMessage('All fields are required');
// //         return false;
// //       }

// //       if (newPwd !== confirmPwd) {
// //         Swal.showValidationMessage('New password and Confirm password do not match');
// //         return false;
// //       }

// //       // send request directly here
// //       return fetch('http://localhost:5000/api/auth/change-password', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           facultyId: facultyDetails.userId,
// //           oldPassword: oldPwd,
// //           newPassword: newPwd
// //         }),
// //       })
// //         .then(async (res) => {
// //           const data = await res.json();
// //           if (!res.ok) throw new Error(data.message || 'Password change failed');
// //           return data;
// //         })
// //         .catch((err) => {
// //           Swal.showValidationMessage(`Request failed: ${err.message}`);
// //         });
// //     }
// //   }).then((result) => {
// //     if (result.isConfirmed) {
// //       Swal.fire('Success', 'Password changed successfully!', 'success');
// //     }
// //   });
// // };

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

// //       <button
// //         style={{
// //           marginTop: '20px',
// //           padding: '10px 20px',
// //           backgroundColor: '#10b981',
// //           color: 'white',
// //           border: 'none',
// //           borderRadius: '5px',
// //           cursor: 'pointer',
// //         }}
// //         onClick={showChangePasswordPopup}
// //       >
// //         Change Password
// //       </button>
// //     </div>
// //   );
// // }

// // /* File: src/components/faculty/ProfileSection.jsx */
// // import React from 'react';
// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import Swal from 'sweetalert2';

// // export default function ProfileSection({ facultyDetails }) {
// //   const [currentPassword, setCurrentPassword] = useState('');
// //   const [newPassword, setNewPassword] = useState('');
// //   const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  
// //   if (!facultyDetails) {
// //     return (
// //       <div className="profile-section">
// //         <h3>My Profile</h3>
// //         <p>Loading profile...</p>
// //       </div>
// //     );
// //   }

// //   // Function to handle change password popup
// // const handleChangePassword = async () => {
// //   if (!oldPassword || !newPassword || !confirmPassword) {
// //     Swal.fire('Error', 'Please fill all fields', 'error');
// //     return;
// //   }

// //   if (newPassword !== confirmPassword) {
// //     Swal.fire('Error', 'New password and confirm password do not match', 'error');
// //     return;
// //   }

// //   try {
// //     const facultyId = localStorage.getItem('userId'); // make sure this exists

// //     const res = await fetch('http://localhost:5000/api/faculty/change-password', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({
// //         facultyId,      // must include this
// //         oldPassword,    // must match backend field name
// //         newPassword     // must match backend field name
// //       }),
// //     });

// //     const data = await res.json();
// //     if (!res.ok) throw new Error(data.message || 'Something went wrong');

// //     Swal.fire('Success', data.message, 'success');
// //     setOldPassword('');
// //     setNewPassword('');
// //     setConfirmPassword('');
// //   } catch (err) {
// //     Swal.fire('Error', err.message, 'error');
// //   }
// // };

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

// //       <button
// //         onClick={handleChangePassword}
// //         style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
// //       >
// //         Change Password
// //       </button>
// //     </div>
// //   );
// // }


// // // /* File: src/components/faculty/ProfileSection.jsx */
// // // import React from 'react';
// // // import ChangePasswordForm from '../ChangePasswordForm'; // import it

// // // export default function ProfileSection({ facultyDetails }) {
// // //   if (!facultyDetails) {
// // //     return (
// // //       <div className="profile-section">
// // //         <h3>My Profile</h3>
// // //         <p>Loading profile...</p>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="profile-section">
// // //       <h3>My Profile</h3>

// // //       <div className="profile-details">
// // //         <p><strong>Name:</strong> {facultyDetails.fullName}</p>
// // //         <p><strong>Faculty ID:</strong> {facultyDetails.userId}</p>
// // //         <p><strong>Department:</strong> {facultyDetails.department}</p>
// // //         <p><strong>Email:</strong> {facultyDetails.email}</p>
// // //         <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber}</p>
// // //       </div>

// // //       {/* ✅ Add Change Password Form below the profile info */}
// // //       <div style={{ marginTop: '20px' }}>
// // //         <ChangePasswordForm userId={facultyDetails.userId} />
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // // // import React, { useEffect, useState } from 'react';
// // // // import ProfileSection from './ProfileSection';
// // // // import axios from 'axios';

// // // // export default function FacultyDashboard() {
// // // //     const [facultyDetails, setFacultyDetails] = useState(null);

// // // //     useEffect(() => {
// // // //         const fetchProfile = async () => {
// // // //             try {
// // // //                 const res = await axios.get('http://localhost:5000/api/faculty/profile', {
// // // //                     headers: {
// // // //                         Authorization: `Bearer ${localStorage.getItem('token')}`
// // // //                     }
// // // //                 });
// // // //                 setFacultyDetails(res.data);
// // // //             } catch (err) {
// // // //                 console.error(err);
// // // //             }
// // // //         };

// // // //         fetchProfile();
// // // //     }, []);

// // // //     return (
// // // //         <ProfileSection facultyDetails={facultyDetails} />
// // // //     );
// // // // }

// // // /* File: src/components/faculty/ProfileSection.jsx */
// // // import React from 'react';

// // // export default function ProfileSection({ facultyDetails }) {
// // //   if (!facultyDetails) {
// // //     return (
// // //       <div className="profile-section">
// // //         <h3>My Profile</h3>
// // //         <p>Loading profile...</p>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="profile-section">
// // //       <h3>My Profile</h3>

// // //       <div className="profile-details">
// // //         <p><strong>Name:</strong> {facultyDetails.fullName}</p>
// // //         <p><strong>Faculty ID:</strong> {facultyDetails.userId}</p>
// // //         <p><strong>Department:</strong> {facultyDetails.department}</p>
// // //         <p><strong>Email:</strong> {facultyDetails.email}</p>
// // //         <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber}</p>
// // //       </div>
// // //     </div>
// // //   );
// // // }
