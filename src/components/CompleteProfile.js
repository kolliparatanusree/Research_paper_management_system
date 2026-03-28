import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './CompleteProfile.css';
import CustomNavbar from './CustomNavbar';
export default function CompleteProfile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?.userId;

  const degreeOptions = [
  'Ph.D',
  'M.Phil',
  'Post Doctoral',
  'M.Tech / M.E',
  'M.Sc',
  'MCA',
  'MBA',
  'B.Tech / B.E',
  'B.Sc',
  'BCA',
  'Diploma',
  'Intermediate / 12th',
  'SSC / 10th'
];

  const [currentStep, setCurrentStep] = useState(1);

  const [educationList, setEducationList] = useState([
    { degree: '', institution: '', year: '' }
  ]);

  const [experienceList, setExperienceList] = useState([
    { title: '', organization: '', years: '' }
  ]);

  const [publications, setPublications] = useState([
    { title: '', journal: '', year: '' }
  ]);

  const [profilePic, setProfilePic] = useState(null);

  // ================= VALIDATIONS =================

  const validateEducation = () => {
    for (let edu of educationList) {
      if (!edu.degree || !edu.institution || !edu.year) {
        Swal.fire('Required', 'Please fill all education fields', 'warning');
        return false;
      }
    }
    return true;
  };

  const validateProfilePic = () => {
    if (!profilePic) {
      Swal.fire('Required', 'Profile picture is mandatory', 'warning');
      return false;
    }
    return true;
  };

  // ================= ADD FUNCTIONS =================

  const handleAddEducation = () =>
    setEducationList([...educationList, { degree: '', institution: '', year: '' }]);

  const handleAddExperience = () =>
    setExperienceList([...experienceList, { title: '', organization: '', years: '' }]);

  const handleAddPublication = () =>
    setPublications([...publications, { title: '', journal: '', year: '' }]);

  const handleRemoveEducation = (idx) => {
  const list = educationList.filter((_, i) => i !== idx);
  setEducationList(list);
};

const handleRemovePublication = (idx) => {
  const list = publications.filter((_, i) => i !== idx);
  setPublications(list);
};
  const handleRemoveExperience = (idx) => {
    const list = experienceList.filter((_, i) => i !== idx);
    setExperienceList(list);
  };

  // ================= CHANGE HANDLERS =================

  const handleEducationChange = (index, field, value) => {
    const list = [...educationList];
    list[index][field] = value;
    setEducationList(list);
  };

  const handleExperienceChange = (index, field, value) => {
    const list = [...experienceList];
    list[index][field] = value;
    setExperienceList(list);
  };

  const handlePublicationChange = (index, field, value) => {
    const list = [...publications];
    list[index][field] = value;
    setPublications(list);
  };

  // ================= ROUTE =================

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'faculty': return '/faculty-dashboard';
      case 'hod': return '/hod-dashboard';
      case 'principal': return '/principal-dashboard';
      case 'rdCoordinator': return '/rd-dashboard';
      case 'rdDean': return '/rd-dean-dashboard';
      case 'admin': return '/mainAdmin-dashboard';
      default: return '/';
    }
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfilePic()) return;

    try {
      const filteredPublications = publications.filter(
        (p) => p.title || p.journal || p.year
      );

      const eduStr = educationList
        .map((e) => `${e.degree} - ${e.institution} (${e.year})`)
        .join('; ');

      const expStr = experienceList
        .map((e) => `${e.title} - ${e.organization} (${e.years} years)`)
        .join('; ');

      const formData = new FormData();
      formData.append('educationDetails', eduStr);
      formData.append('experienceDetails', expStr);
      formData.append('publications', JSON.stringify(filteredPublications));
      formData.append('isProfileCompleted', true);
      formData.append('profilePic', profilePic);

      await axios.put(
        `http://localhost:5000/api/auth/complete-profile/${userId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      Swal.fire('Success', 'Profile saved successfully', 'success').then(() => {
        const role = localStorage.getItem('role');
        navigate(getDashboardRoute(role));
      });

    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Profile update failed', 'error');
    }
  };

  // ================= UI =================

  return (
    <>
      <CustomNavbar />
    <div className="complete-profile-wrapper">
      <h2>Complete Your Profile</h2>

      {/* ===== STEPPER ===== */}
      <div className="stepper">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="stepper-item">
            <div className={`circle ${currentStep >= step ? 'active' : ''}`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`line ${currentStep > step ? 'active' : ''}`} />
            )}
          </div>
        ))}
      </div>

      <div className="step-labels">
        <span>Education</span>
        <span>Experience</span>
        <span>Publications</span>
        <span>Profile</span>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ========= EDUCATION ========= */}
        {currentStep === 1 && (
          <div className="step-section">
            <h3>Education</h3>

            {educationList.map((edu, idx) => (
  <div key={idx} className="entry-block">

    {/* <label>Degree *</label>
    <input
      type="text"
      value={edu.degree}
      onChange={(e) =>
        handleEducationChange(idx, 'degree', e.target.value)
      }
    /> */}

    <label>Degree *</label>
<select
  value={edu.degree}
  onChange={(e) =>
    handleEducationChange(idx, 'degree', e.target.value)
  }
>
  <option value="">-- Select Degree --</option>
  {degreeOptions.map((deg, i) => (
    <option key={i} value={deg}>
      {deg}
    </option>
  ))}
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
  type="number"
  value={edu.year}
  onChange={(e) =>
    handleEducationChange(idx, 'year', e.target.value)
  }
/>

    {/* 🗑️ REMOVE BUTTON */}
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

            <button
              type="button"
              onClick={() => {
                if (validateEducation()) setCurrentStep(2);
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ========= EXPERIENCE ========= */}
        {currentStep === 2 && (
          <div className="step-section">
            <h3>Experience</h3>

            {experienceList.map((exp, idx) => (
              <div key={idx} className="entry-block">
                <label>Title</label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) =>
                    handleExperienceChange(idx, 'title', e.target.value)
                  }
                />

                <label>Organization</label>
                <input
                  type="text"
                  value={exp.organization}
                  onChange={(e) =>
                    handleExperienceChange(idx, 'organization', e.target.value)
                  }
                />

                <label>Years</label>
                <input
                  type="text"
                  value={exp.years}
                  onChange={(e) =>
                    handleExperienceChange(idx, 'years', e.target.value)
                  }
                />

                {experienceList.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveExperience(idx)}
                  >
                    ❌ Remove
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={handleAddExperience}>
              + Add Experience
            </button>

            <div className="nav-buttons">
              <button type="button" onClick={() => setCurrentStep(1)}>
                ← Back
              </button>
              <button type="button" onClick={() => setCurrentStep(3)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ========= PUBLICATIONS (OPTIONAL) ========= */}
        {currentStep === 3 && (
          <div className="step-section">
            <h3>Publications (Optional)</h3>

            {publications.map((pub, idx) => (
  <div key={idx} className="entry-block">

    <label>Title</label>
    <input
      type="text"
      value={pub.title}
      onChange={(e) =>
        handlePublicationChange(idx, 'title', e.target.value)
      }
    />

    <label>Journal</label>
    <input
      type="text"
      value={pub.journal}
      onChange={(e) =>
        handlePublicationChange(idx, 'journal', e.target.value)
      }
    />

    <label>Year</label>
    <input
      type="text"
      value={pub.year}
      onChange={(e) =>
        handlePublicationChange(idx, 'year', e.target.value)
      }
    />

    {/* 🗑️ REMOVE BUTTON */}
    {publications.length > 1 && (
      <button
        type="button"
        className="remove-btn"
        onClick={() => handleRemovePublication(idx)}
      >
        🗑️ Remove
      </button>
    )}

  </div>
))}

            <button type="button" onClick={handleAddPublication}>
              + Add Publication
            </button>

            <div className="nav-buttons">
              <button type="button" onClick={() => setCurrentStep(2)}>
                ← Back
              </button>
              <button type="button" onClick={() => setCurrentStep(4)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ========= PROFILE PIC ========= */}
        {currentStep === 4 && (
          <div className="step-section">
            <h3>Profile Picture *</h3>

            <label>Upload Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
            />

            <div className="nav-buttons">
              <button type="button" onClick={() => setCurrentStep(3)}>
                ← Back
              </button>
              <button type="submit">Submit Profile</button>
            </div>
          </div>
        )}
      </form>
    </div>
    </ >
  );
}

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import './CompleteProfile.css';
// import CustomNavbar from './CustomNavbar';

// export default function CompleteProfile() {
//   const navigate = useNavigate();
//   const storedUser = JSON.parse(localStorage.getItem('user'));
//   const userId = storedUser?.userId;

//   const [step, setStep] = useState(1);
//   const [profilePic, setProfilePic] = useState(null);

//   const [educationList, setEducationList] = useState([
//     { degree: '', institution: '', year: '' }
//   ]);

//   const [experienceList, setExperienceList] = useState([
//     { title: '', organization: '', years: '' }
//   ]);

//   const [publications, setPublications] = useState([
//     { title: '', journal: '', year: '' }
//   ]);

//   // ================= HANDLERS =================

//   const handleAddEducation = () =>
//     setEducationList([...educationList, { degree: '', institution: '', year: '' }]);

//   const handleAddExperience = () =>
//     setExperienceList([...experienceList, { title: '', organization: '', years: '' }]);

//   const handleAddPublication = () =>
//     setPublications([...publications, { title: '', journal: '', year: '' }]);

//   const handleEducationChange = (index, field, value) => {
//     const list = [...educationList];
//     list[index][field] = value;
//     setEducationList(list);
//   };

//   const handleExperienceChange = (index, field, value) => {
//     const list = [...experienceList];
//     list[index][field] = value;
//     setExperienceList(list);
//   };

//   const handlePublicationChange = (index, field, value) => {
//     const list = [...publications];
//     list[index][field] = value;
//     setPublications(list);
//   };

//   const handleRemoveEducation = (index) => {
//   const list = educationList.filter((_, i) => i !== index);
//   setEducationList(list.length ? list : [{ degree: '', institution: '', year: '' }]);
// };

// const handleRemoveExperience = (index) => {
//   const list = experienceList.filter((_, i) => i !== index);
//   setExperienceList(list.length ? list : [{ title: '', organization: '', years: '' }]);
// };

// const handleRemovePublication = (index) => {
//   const list = publications.filter((_, i) => i !== index);
//   setPublications(list.length ? list : [{ title: '', journal: '', year: '' }]);
// };

//   const handleNext = () => setStep(prev => prev + 1);
//   const handleBack = () => setStep(prev => prev - 1);

//   const getDashboardRoute = (role) => {
//     switch (role) {
//       case 'faculty': return '/faculty-dashboard';
//       case 'hod': return '/hod-dashboard';
//       case 'principal': return '/principal-dashboard';
//       case 'rdCoordinator': return '/rd-dashboard';
//       case 'rdDean': return '/rd-dean-dashboard';
//       case 'admin': return '/mainAdmin-dashboard';
//       default: return '/';
//     }
//   };

//   // ================= SUBMIT =================

//   const handleSubmit = async () => {
//     try {
//       const eduStr = educationList
//         .map(e => `${e.degree} - ${e.institution} (${e.year})`)
//         .join('; ');

//       const expStr = experienceList
//         .map(e => `${e.title} - ${e.organization} (${e.years} years)`)
//         .join('; ');

//       const formData = new FormData();
//       formData.append('educationDetails', eduStr);
//       formData.append('experienceDetails', expStr);
//       formData.append('publications', JSON.stringify(publications));
//       formData.append('isProfileCompleted', true);

//       if (profilePic) {
//         formData.append('profilePic', profilePic);
//       }

//       await axios.put(
//         `http://localhost:5000/api/auth/complete-profile/${userId}`,
//         formData
//       );

//       Swal.fire('Success', 'Profile saved successfully', 'success').then(() => {
//         const role = localStorage.getItem('role');
//         navigate(getDashboardRoute(role));
//       });

//     } catch (err) {
//       Swal.fire('Error', err.response?.data?.message || 'Profile update failed', 'error');
//     }
//   };

//   // ================= UI =================

//   return (
//    <>
//     <CustomNavbar />
//     <div className="complete-profile-wrapper">
//       <div className="profile-card">
//         <h2>Complete Your Profile</h2>

//         {/* ===== STEP 1 EDUCATION ===== */}
//         {step === 1 && (
//           <>
//             <h3>Education</h3>
//             {educationList.map((edu, idx) => (
//   <div key={idx} className="entry-row">
//     <input
//       type="text"
//       placeholder="Degree"
//       value={edu.degree}
//       onChange={e => handleEducationChange(idx, 'degree', e.target.value)}
//       required
//     />
//     <input
//       type="text"
//       placeholder="Institution"
//       value={edu.institution}
//       onChange={e => handleEducationChange(idx, 'institution', e.target.value)}
//       required
//     />
//     <input
//       type="text"
//       placeholder="Year"
//       value={edu.year}
//       onChange={e => handleEducationChange(idx, 'year', e.target.value)}
//       required
//     />

//     {educationList.length > 1 && (
//       <button
//         type="button"
//         className="remove-btn"
//         onClick={() => handleRemoveEducation(idx)}
//       >
//         ❌
//       </button>
//     )}
//   </div>
// ))}
//             <button type="button" onClick={handleAddEducation}>
//               + Add Education
//             </button>

//             <div className="nav-buttons">
//               <button onClick={handleNext}>Next →</button>
//             </div>
//           </>
//         )}

//         {/* ===== STEP 2 EXPERIENCE ===== */}
//         {step === 2 && (
//           <>
//             <h3>Experience</h3>
//             {experienceList.map((exp, idx) => (
//               <div key={idx} className="entry-row">
//                 <input
//                   type="text"
//                   placeholder="Title"
//                   value={exp.title}
//                   onChange={e => handleExperienceChange(idx, 'title', e.target.value)}
//                   required
//                 />
//                 <input
//                   type="text"
//                   placeholder="Organization"
//                   value={exp.organization}
//                   onChange={e => handleExperienceChange(idx, 'organization', e.target.value)}
//                   required
//                 />
//                 <input
//                   type="text"
//                   placeholder="Years"
//                   value={exp.years}
//                   onChange={e => handleExperienceChange(idx, 'years', e.target.value)}
//                   required
//                 />
//                 {experienceList.length > 1 && (
//   <button
//     type="button"
//     className="remove-btn"
//     onClick={() => handleRemoveExperience(idx)}
//   >
//     ❌
//   </button>
// )}
//               </div>
//             ))}
//             <button type="button" onClick={handleAddExperience}>
//               + Add Experience
//             </button>

//             <div className="nav-buttons">
//               <button onClick={handleBack}>← Back</button>
//               <button onClick={handleNext}>Next →</button>
//             </div>
//           </>
//         )}

//         {/* ===== STEP 3 PUBLICATIONS (OPTIONAL) ===== */}
//         {step === 3 && (
//           <>
//             <h3>Publications (Optional)</h3>
//             {publications.map((pub, idx) => (
//               <div key={idx} className="entry-row">
//                 <input
//                   type="text"
//                   placeholder="Title"
//                   value={pub.title}
//                   onChange={e => handlePublicationChange(idx, 'title', e.target.value)}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Journal"
//                   value={pub.journal}
//                   onChange={e => handlePublicationChange(idx, 'journal', e.target.value)}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Year"
//                   value={pub.year}
//                   onChange={e => handlePublicationChange(idx, 'year', e.target.value)}
//                 />
//                 {publications.length > 1 && (
//   <button
//     type="button"
//     className="remove-btn"
//     onClick={() => handleRemovePublication(idx)}
//   >
//     ❌
//   </button>
// )}
//               </div>
//             ))}
//             <button type="button" onClick={handleAddPublication}>
//               + Add Publication
//             </button>

//             <div className="nav-buttons">
//               <button onClick={handleBack}>← Back</button>
//               <button onClick={handleNext}>Next →</button>
//             </div>
//           </>
//         )}

//         {/* ===== STEP 4 PROFILE PIC ===== */}
//         {step === 4 && (
//           <>
//             <h3>Upload Profile Picture</h3>

//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => setProfilePic(e.target.files[0])}
//             />

//             <div className="nav-buttons">
//               <button onClick={handleBack}>← Back</button>
//               <button onClick={handleNext}>Review</button>
//             </div>
//           </>
//         )}

//         {/* ===== STEP 5 REVIEW ===== */}
//         {step === 5 && (
//           <>
//             <h3>Review Your Details</h3>

//             <p><strong>Education:</strong> {educationList.length} entries</p>
//             <p><strong>Experience:</strong> {experienceList.length} entries</p>
//             <p><strong>Publications:</strong> {publications.length} entries</p>
//             <p><strong>Profile Pic:</strong> {profilePic ? profilePic.name : 'Not uploaded'}</p>

//             <div className="nav-buttons">
//               <button onClick={handleBack}>← Back</button>
//               <button onClick={handleSubmit}>Submit Profile ✅</button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//     </>
//   );
// }

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import './CompleteProfile.css'; // optional for styling

// export default function CompleteProfile() {
//   const navigate = useNavigate();
//   const storedUser = JSON.parse(localStorage.getItem('user'));
//   const userId = storedUser?.userId;

//   const [educationList, setEducationList] = useState([{ degree: '', institution: '', year: '' }]);
//   const [experienceList, setExperienceList] = useState([{ title: '', organization: '', years: '' }]);
//   const [publications, setPublications] = useState([{ title: '', journal: '', year: '' }]);

//   const handleAddEducation = () => setEducationList([...educationList, { degree: '', institution: '', year: '' }]);
//   const handleAddExperience = () => setExperienceList([...experienceList, { title: '', organization: '', years: '' }]);
//   const handleAddPublication = () => setPublications([...publications, { title: '', journal: '', year: '' }]);

//   const handleEducationChange = (index, field, value) => {
//     const list = [...educationList];
//     list[index][field] = value;
//     setEducationList(list);
//   };

//   const handleExperienceChange = (index, field, value) => {
//     const list = [...experienceList];
//     list[index][field] = value;
//     setExperienceList(list);
//   };

//   const handlePublicationChange = (index, field, value) => {
//     const list = [...publications];
//     list[index][field] = value;
//     setPublications(list);
//   };


//   const getDashboardRoute = (role) => {
//   switch (role) {
//     case 'faculty': return '/faculty-dashboard';
//     case 'hod': return '/hod-dashboard';
//     case 'principal': return '/principal-dashboard';
//     case 'rdCoordinator': return '/rd-dashboard';
//     case 'rdDean': return '/rd-dean-dashboard';
//     case 'admin': return '/mainAdmin-dashboard';
//     default: return '/';
//   }
// };


// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     // Convert arrays to string for backend if needed
//     const eduStr = educationList.map(
//       (e) => `${e.degree} - ${e.institution} (${e.year})`
//     ).join('; ');

//     const expStr = experienceList.map(
//       (e) => `${e.title} - ${e.organization} (${e.years} years)`
//     ).join('; ');

//     const response = await axios.put(
//       `http://localhost:5000/api/auth/complete-profile/${userId}`,
//       {
//         educationDetails: eduStr,
//         experienceDetails: expStr,
//         publications,
//         isProfileCompleted: true
//       }
//     );

//     Swal.fire('Success', 'Profile saved successfully', 'success').then(() => {
//       const role = localStorage.getItem('role'); // ✅ get role
//       navigate(getDashboardRoute(role));
//     });

//   } catch (err) {
//     console.error(err);
//     Swal.fire('Error', err.response?.data?.message || 'Profile update failed', 'error');
//   }
// };
// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       await axios.put(`http://localhost:5000/api/auth/complete-profile/${userId}`, {
// //         educationDetails: educationList,
// //         experienceDetails: experienceList,
// //         publications,
// //         isProfileCompleted: true
// //       });

// //       Swal.fire('Success', 'Profile completed successfully!', 'success').then(() => {
// //         // navigate based on role
// //         const role = storedUser.role;
// //         switch (role) {
// //           case 'faculty':
// //             navigate('/faculty-dashboard');
// //             break;
// //           case 'hod':
// //             navigate('/hod-dashboard');
// //             break;
// //           case 'principal':
// //             navigate('/principal-dashboard');
// //             break;
// //           case 'rdDean':
// //             navigate('/rd-dean-dashboard');
// //             break;
// //           default:
// //             navigate('/');
// //         }
// //       });
// //     } catch (err) {
// //       Swal.fire('Error', err.response?.data?.message || 'Failed to complete profile', 'error');
// //     }
// //   };

//   return (
//     <div className="complete-profile-wrapper">
//       <h2>Complete Your Profile</h2>
//       <form onSubmit={handleSubmit}>
//         {/* Education */}
//         <h3>Education</h3>
//         {educationList.map((edu, idx) => (
//           <div key={idx} className="entry-row">
//             <input type="text" placeholder="Degree" value={edu.degree} onChange={e => handleEducationChange(idx, 'degree', e.target.value)} required />
//             <input type="text" placeholder="Institution" value={edu.institution} onChange={e => handleEducationChange(idx, 'institution', e.target.value)} required />
//             <input type="text" placeholder="Year" value={edu.year} onChange={e => handleEducationChange(idx, 'year', e.target.value)} required />
//           </div>
//         ))}
//         <button type="button" onClick={handleAddEducation}>+ Add Education</button>

//         {/* Experience */}
//         <h3>Experience</h3>
//         {experienceList.map((exp, idx) => (
//           <div key={idx} className="entry-row">
//             <input type="text" placeholder="Title" value={exp.title} onChange={e => handleExperienceChange(idx, 'title', e.target.value)} required />
//             <input type="text" placeholder="Organization" value={exp.organization} onChange={e => handleExperienceChange(idx, 'organization', e.target.value)} required />
//             <input type="text" placeholder="Years" value={exp.years} onChange={e => handleExperienceChange(idx, 'years', e.target.value)} required />
//           </div>
//         ))}
//         <button type="button" onClick={handleAddExperience}>+ Add Experience</button>

//         {/* Publications */}
//         <h3>Publications</h3>
//         {publications.map((pub, idx) => (
//           <div key={idx} className="entry-row">
//             <input type="text" placeholder="Title" value={pub.title} onChange={e => handlePublicationChange(idx, 'title', e.target.value)} required />
//             <input type="text" placeholder="Journal" value={pub.journal} onChange={e => handlePublicationChange(idx, 'journal', e.target.value)} required />
//             <input type="text" placeholder="Year" value={pub.year} onChange={e => handlePublicationChange(idx, 'year', e.target.value)} required />
//           </div>
//         ))}
//         <button type="button" onClick={handleAddPublication}>+ Add Publication</button>

//         <button type="submit">Submit Profile</button>
//       </form>
//     </div>
//   );
// }