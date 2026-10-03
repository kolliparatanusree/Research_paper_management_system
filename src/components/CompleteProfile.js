import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './CompleteProfile.css';
import CustomNavbar from './CustomNavbar';
import { API_BASE_URL } from '../config';

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
        Swal.fire(
          'Required',
          'Please fill all education fields',
          'warning'
        );
        return false;
      }
    }
    return true;
  };

  const validateProfilePic = () => {
    if (!profilePic) {
      Swal.fire(
        'Required',
        'Profile picture is mandatory',
        'warning'
      );
      return false;
    }
    return true;
  };

  // ================= ADD FUNCTIONS =================

  const handleAddEducation = () =>
    setEducationList([
      ...educationList,
      { degree: '', institution: '', year: '' }
    ]);

  const handleAddExperience = () =>
    setExperienceList([
      ...experienceList,
      { title: '', organization: '', years: '' }
    ]);

  const handleAddPublication = () =>
    setPublications([
      ...publications,
      { title: '', journal: '', year: '' }
    ]);

  // ================= REMOVE FUNCTIONS =================

  const handleRemoveEducation = (idx) => {
    setEducationList(
      educationList.filter((_, i) => i !== idx)
    );
  };

  const handleRemovePublication = (idx) => {
    setPublications(
      publications.filter((_, i) => i !== idx)
    );
  };

  const handleRemoveExperience = (idx) => {
    setExperienceList(
      experienceList.filter((_, i) => i !== idx)
    );
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
      case 'faculty':
        return '/faculty-dashboard';
      case 'hod':
        return '/hod-dashboard';
      case 'principal':
        return '/principal-dashboard';
      case 'rdCoordinator':
        return '/rd-dashboard';
      case 'rdDean':
        return '/rd-dean-dashboard';
      case 'admin':
        return '/mainAdmin-dashboard';
      default:
        return '/';
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
        .map(
          (e) =>
            `${e.degree} - ${e.institution} (${e.year})`
        )
        .join('; ');

      const expStr = experienceList
        .map(
          (e) =>
            `${e.title} - ${e.organization} (${e.years} years)`
        )
        .join('; ');

      const formData = new FormData();

      formData.append('educationDetails', eduStr);
      formData.append('experienceDetails', expStr);
      formData.append(
        'publications',
        JSON.stringify(filteredPublications)
      );
      formData.append('isProfileCompleted', true);
      formData.append('profilePic', profilePic);

      await axios.put(
        `${API_BASE_URL}/api/auth/complete-profile/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      Swal.fire(
        'Success',
        'Profile saved successfully',
        'success'
      ).then(() => {
        const role = localStorage.getItem('role');
        navigate(getDashboardRoute(role));
      });

    } catch (err) {
      console.error(err);

      Swal.fire(
        'Error',
        err.response?.data?.message ||
          'Profile update failed',
        'error'
      );
    }
  };

  const steps = [
    {
      number: 1,
      icon: '🎓',
      title: 'Education',
      subtitle: 'Academic details'
    },
    {
      number: 2,
      icon: '💼',
      title: 'Experience',
      subtitle: 'Work experience'
    },
    {
      number: 3,
      icon: '📚',
      title: 'Publications',
      subtitle: 'Research work'
    },
    {
      number: 4,
      icon: '👤',
      title: 'Profile',
      subtitle: 'Profile photo'
    }
  ];

  return (
    <>
      <CustomNavbar />

      <div className="complete-profile-wrapper">

        {/* ================= HEADER ================= */}

        <div className="complete-profile-header">

          <div className="complete-profile-header-icon">
            👤
          </div>

          <div className="complete-profile-header-content">

            <span className="complete-profile-eyebrow">
              PROFILE SETUP
            </span>

            <h2>
              Complete Your Profile
            </h2>

            <p>
              Add your professional information to personalize
              your RPMS experience.
            </p>

          </div>

        </div>

        {/* ================= STEPPER ================= */}

        <div className="profile-stepper-card">

          <div className="profile-stepper">

            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`profile-stepper-item ${
                  currentStep >= step.number
                    ? 'completed'
                    : ''
                }`}
              >

                <div className="profile-step-main">

                  <div
                    className={`profile-step-circle ${
                      currentStep >= step.number
                        ? 'active'
                        : ''
                    }`}
                  >
                    {currentStep > step.number ? (
                      '✓'
                    ) : (
                      step.icon
                    )}
                  </div>

                  <div className="profile-step-info">
                    <span>
                      Step {step.number}
                    </span>

                    <strong>
                      {step.title}
                    </strong>

                    <small>
                      {step.subtitle}
                    </small>
                  </div>

                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`profile-step-line ${
                      currentStep > step.number
                        ? 'active'
                        : ''
                    }`}
                  />
                )}

              </div>
            ))}

          </div>

        </div>

        {/* ================= FORM CARD ================= */}

        <div className="complete-profile-card">

          <form onSubmit={handleSubmit}>

            {/* ================= EDUCATION ================= */}

            {currentStep === 1 && (
              <div className="profile-step-section">

                <div className="section-heading">

                  <div className="section-heading-icon">
                    🎓
                  </div>

                  <div>
                    <h3>Educational Background</h3>
                    <p>
                      Add your academic qualifications and
                      institutions.
                    </p>
                  </div>

                </div>

                {educationList.map((edu, idx) => (
                  <div
                    key={idx}
                    className="profile-entry-block"
                  >

                    <div className="entry-header">

                      <div>
                        <span className="entry-number">
                          {String(idx + 1).padStart(2, '0')}
                        </span>

                        <strong>
                          Education {idx + 1}
                        </strong>
                      </div>

                      {educationList.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() =>
                            handleRemoveEducation(idx)
                          }
                        >
                          🗑 Remove
                        </button>
                      )}

                    </div>

                    <div className="profile-form-grid">

                      <div className="profile-field">

                        <label>
                          Degree <span>*</span>
                        </label>

                        <select
                          value={edu.degree}
                          onChange={(e) =>
                            handleEducationChange(
                              idx,
                              'degree',
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Select your degree
                          </option>

                          {degreeOptions.map((deg, i) => (
                            <option
                              key={i}
                              value={deg}
                            >
                              {deg}
                            </option>
                          ))}
                        </select>

                      </div>

                      <div className="profile-field">

                        <label>
                          Institution <span>*</span>
                        </label>

                        <input
                          type="text"
                          placeholder="Enter institution name"
                          value={edu.institution}
                          onChange={(e) =>
                            handleEducationChange(
                              idx,
                              'institution',
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="profile-field">

                        <label>
                          Year <span>*</span>
                        </label>

                        <input
                          type="number"
                          placeholder="e.g. 2024"
                          value={edu.year}
                          onChange={(e) =>
                            handleEducationChange(
                              idx,
                              'year',
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>
                ))}

                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={handleAddEducation}
                >
                  <span>+</span>
                  Add Education
                </button>

                <div className="nav-buttons">

                  <div />

                  <button
                    type="button"
                    className="next-btn"
                    onClick={() => {
                      if (validateEducation()) {
                        setCurrentStep(2);
                      }
                    }}
                  >
                    Continue
                    <span>→</span>
                  </button>

                </div>

              </div>
            )}

            {/* ================= EXPERIENCE ================= */}

            {currentStep === 2 && (
              <div className="profile-step-section">

                <div className="section-heading">

                  <div className="section-heading-icon">
                    💼
                  </div>

                  <div>
                    <h3>Professional Experience</h3>
                    <p>
                      Tell us about your professional journey.
                    </p>
                  </div>

                </div>

                {experienceList.map((exp, idx) => (
                  <div
                    key={idx}
                    className="profile-entry-block"
                  >

                    <div className="entry-header">

                      <div>
                        <span className="entry-number">
                          {String(idx + 1).padStart(2, '0')}
                        </span>

                        <strong>
                          Experience {idx + 1}
                        </strong>
                      </div>

                      {experienceList.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() =>
                            handleRemoveExperience(idx)
                          }
                        >
                          🗑 Remove
                        </button>
                      )}

                    </div>

                    <div className="profile-form-grid">

                      <div className="profile-field">

                        <label>Job Title</label>

                        <input
                          type="text"
                          placeholder="e.g. Assistant Professor"
                          value={exp.title}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              'title',
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="profile-field">

                        <label>Organization</label>

                        <input
                          type="text"
                          placeholder="Enter organization name"
                          value={exp.organization}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              'organization',
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="profile-field">

                        <label>Years of Experience</label>

                        <input
                          type="text"
                          placeholder="e.g. 5"
                          value={exp.years}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              'years',
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>
                ))}

                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={handleAddExperience}
                >
                  <span>+</span>
                  Add Experience
                </button>

                <div className="nav-buttons">

                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    className="next-btn"
                    onClick={() => setCurrentStep(3)}
                  >
                    Continue
                    <span>→</span>
                  </button>

                </div>

              </div>
            )}

            {/* ================= PUBLICATIONS ================= */}

            {currentStep === 3 && (
              <div className="profile-step-section">

                <div className="section-heading">

                  <div className="section-heading-icon">
                    📚
                  </div>

                  <div>
                    <h3>Research Publications</h3>
                    <p>
                      Add your publications if you have any.
                      This section is optional.
                    </p>
                  </div>

                  <span className="optional-badge">
                    Optional
                  </span>

                </div>

                {publications.map((pub, idx) => (
                  <div
                    key={idx}
                    className="profile-entry-block"
                  >

                    <div className="entry-header">

                      <div>
                        <span className="entry-number">
                          {String(idx + 1).padStart(2, '0')}
                        </span>

                        <strong>
                          Publication {idx + 1}
                        </strong>
                      </div>

                      {publications.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() =>
                            handleRemovePublication(idx)
                          }
                        >
                          🗑 Remove
                        </button>
                      )}

                    </div>

                    <div className="profile-form-grid">

                      <div className="profile-field full-width">

                        <label>Publication Title</label>

                        <input
                          type="text"
                          placeholder="Enter publication title"
                          value={pub.title}
                          onChange={(e) =>
                            handlePublicationChange(
                              idx,
                              'title',
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="profile-field">

                        <label>Journal / Venue</label>

                        <input
                          type="text"
                          placeholder="Enter journal or conference"
                          value={pub.journal}
                          onChange={(e) =>
                            handlePublicationChange(
                              idx,
                              'journal',
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="profile-field">

                        <label>Publication Year</label>

                        <input
                          type="text"
                          placeholder="e.g. 2025"
                          value={pub.year}
                          onChange={(e) =>
                            handlePublicationChange(
                              idx,
                              'year',
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>
                ))}

                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={handleAddPublication}
                >
                  <span>+</span>
                  Add Publication
                </button>

                <div className="nav-buttons">

                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => setCurrentStep(2)}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    className="next-btn"
                    onClick={() => setCurrentStep(4)}
                  >
                    Continue
                    <span>→</span>
                  </button>

                </div>

              </div>
            )}

            {/* ================= PROFILE ================= */}

            {currentStep === 4 && (
              <div className="profile-step-section">

                <div className="section-heading">

                  <div className="section-heading-icon">
                    👤
                  </div>

                  <div>
                    <h3>Profile Picture</h3>
                    <p>
                      Upload a professional photo for your
                      RPMS profile.
                    </p>
                  </div>

                  <span className="required-badge">
                    Required
                  </span>

                </div>

                <div className="profile-upload-area">

                  <div className="upload-avatar">
                    {profilePic ? (
                      <img
                        src={URL.createObjectURL(profilePic)}
                        alt="Profile preview"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>

                  <div className="upload-content">

                    <h4>
                      {profilePic
                        ? profilePic.name
                        : 'Upload your profile photo'}
                    </h4>

                    <p>
                      Choose a clear professional image.
                      JPG, JPEG or PNG recommended.
                    </p>

                    <label className="upload-btn">
                      📷 Choose Photo

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setProfilePic(
                            e.target.files[0]
                          )
                        }
                      />
                    </label>

                  </div>

                </div>

                <div className="profile-completion-note">
                  <span>✓</span>
                  <div>
                    <strong>Almost there!</strong>
                    <p>
                      Your profile information is ready.
                      Submit to complete your profile setup.
                    </p>
                  </div>
                </div>

                <div className="nav-buttons">

                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => setCurrentStep(3)}
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    className="submit-btn"
                  >
                    Complete Profile
                    <span>✓</span>
                  </button>

                </div>

              </div>
            )}

          </form>

        </div>

      </div>
    </>
  );
}
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import './CompleteProfile.css';
// import CustomNavbar from './CustomNavbar';
// import { API_BASE_URL } from '../config';
// export default function CompleteProfile() {
//   const navigate = useNavigate();
//   const storedUser = JSON.parse(localStorage.getItem('user'));
//   const userId = storedUser?.userId;

//   const degreeOptions = [
//   'Ph.D',
//   'M.Phil',
//   'Post Doctoral',
//   'M.Tech / M.E',
//   'M.Sc',
//   'MCA',
//   'MBA',
//   'B.Tech / B.E',
//   'B.Sc',
//   'BCA',
//   'Diploma',
//   'Intermediate / 12th',
//   'SSC / 10th'
// ];

//   const [currentStep, setCurrentStep] = useState(1);

//   const [educationList, setEducationList] = useState([
//     { degree: '', institution: '', year: '' }
//   ]);

//   const [experienceList, setExperienceList] = useState([
//     { title: '', organization: '', years: '' }
//   ]);

//   const [publications, setPublications] = useState([
//     { title: '', journal: '', year: '' }
//   ]);

//   const [profilePic, setProfilePic] = useState(null);

//   // ================= VALIDATIONS =================

//   const validateEducation = () => {
//     for (let edu of educationList) {
//       if (!edu.degree || !edu.institution || !edu.year) {
//         Swal.fire('Required', 'Please fill all education fields', 'warning');
//         return false;
//       }
//     }
//     return true;
//   };

//   const validateProfilePic = () => {
//     if (!profilePic) {
//       Swal.fire('Required', 'Profile picture is mandatory', 'warning');
//       return false;
//     }
//     return true;
//   };

//   // ================= ADD FUNCTIONS =================

//   const handleAddEducation = () =>
//     setEducationList([...educationList, { degree: '', institution: '', year: '' }]);

//   const handleAddExperience = () =>
//     setExperienceList([...experienceList, { title: '', organization: '', years: '' }]);

//   const handleAddPublication = () =>
//     setPublications([...publications, { title: '', journal: '', year: '' }]);

//   const handleRemoveEducation = (idx) => {
//   const list = educationList.filter((_, i) => i !== idx);
//   setEducationList(list);
// };

// const handleRemovePublication = (idx) => {
//   const list = publications.filter((_, i) => i !== idx);
//   setPublications(list);
// };
//   const handleRemoveExperience = (idx) => {
//     const list = experienceList.filter((_, i) => i !== idx);
//     setExperienceList(list);
//   };

//   // ================= CHANGE HANDLERS =================

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

//   // ================= ROUTE =================

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

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateProfilePic()) return;

//     try {
//       const filteredPublications = publications.filter(
//         (p) => p.title || p.journal || p.year
//       );

//       const eduStr = educationList
//         .map((e) => `${e.degree} - ${e.institution} (${e.year})`)
//         .join('; ');

//       const expStr = experienceList
//         .map((e) => `${e.title} - ${e.organization} (${e.years} years)`)
//         .join('; ');

//       const formData = new FormData();
//       formData.append('educationDetails', eduStr);
//       formData.append('experienceDetails', expStr);
//       formData.append('publications', JSON.stringify(filteredPublications));
//       formData.append('isProfileCompleted', true);
//       formData.append('profilePic', profilePic);

//       await axios.put(
//         `${API_BASE_URL}/api/auth/complete-profile/${userId}`,
//         formData,
//         { headers: { 'Content-Type': 'multipart/form-data' } }
//       );

//       Swal.fire('Success', 'Profile saved successfully', 'success').then(() => {
//         const role = localStorage.getItem('role');
//         navigate(getDashboardRoute(role));
//       });

//     } catch (err) {
//       console.error(err);
//       Swal.fire('Error', err.response?.data?.message || 'Profile update failed', 'error');
//     }
//   };

//   // ================= UI =================

//   return (
//     <>
//       <CustomNavbar />
//     <div className="complete-profile-wrapper">
//       <h2>Complete Your Profile</h2>

//       {/* ===== STEPPER ===== */}
//       <div className="stepper">
//         {[1, 2, 3, 4].map((step) => (
//           <div key={step} className="stepper-item">
//             <div className={`circle ${currentStep >= step ? 'active' : ''}`}>
//               {step}
//             </div>
//             {step < 4 && (
//               <div className={`line ${currentStep > step ? 'active' : ''}`} />
//             )}
//           </div>
//         ))}
//       </div>

//       <div className="step-labels">
//         <span>Education</span>
//         <span>Experience</span>
//         <span>Publications</span>
//         <span>Profile</span>
//       </div>

//       <form onSubmit={handleSubmit}>

//         {/* ========= EDUCATION ========= */}
//         {currentStep === 1 && (
//           <div className="step-section">
//             <h3>Education</h3>

//             {educationList.map((edu, idx) => (
//   <div key={idx} className="entry-block">

//     {/* <label>Degree *</label>
//     <input
//       type="text"
//       value={edu.degree}
//       onChange={(e) =>
//         handleEducationChange(idx, 'degree', e.target.value)
//       }
//     /> */}

//     <label>Degree *</label>
// <select
//   value={edu.degree}
//   onChange={(e) =>
//     handleEducationChange(idx, 'degree', e.target.value)
//   }
// >
//   <option value="">-- Select Degree --</option>
//   {degreeOptions.map((deg, i) => (
//     <option key={i} value={deg}>
//       {deg}
//     </option>
//   ))}
// </select>

//     <label>Institution *</label>
//     <input
//       type="text"
//       value={edu.institution}
//       onChange={(e) =>
//         handleEducationChange(idx, 'institution', e.target.value)
//       }
//     />

//     <label>Year *</label>
//     <input
//   type="number"
//   value={edu.year}
//   onChange={(e) =>
//     handleEducationChange(idx, 'year', e.target.value)
//   }
// />

//     {/* 🗑️ REMOVE BUTTON */}
//     {educationList.length > 1 && (
//       <button
//         type="button"
//         className="remove-btn"
//         onClick={() => handleRemoveEducation(idx)}
//       >
//         🗑️ Remove
//       </button>
//     )}

//   </div>
// ))}

//             <button type="button" onClick={handleAddEducation}>
//               + Add Education
//             </button>

//             <button
//               type="button"
//               onClick={() => {
//                 if (validateEducation()) setCurrentStep(2);
//               }}
//             >
//               Next →
//             </button>
//           </div>
//         )}

//         {/* ========= EXPERIENCE ========= */}
//         {currentStep === 2 && (
//           <div className="step-section">
//             <h3>Experience</h3>

//             {experienceList.map((exp, idx) => (
//               <div key={idx} className="entry-block">
//                 <label>Title</label>
//                 <input
//                   type="text"
//                   value={exp.title}
//                   onChange={(e) =>
//                     handleExperienceChange(idx, 'title', e.target.value)
//                   }
//                 />

//                 <label>Organization</label>
//                 <input
//                   type="text"
//                   value={exp.organization}
//                   onChange={(e) =>
//                     handleExperienceChange(idx, 'organization', e.target.value)
//                   }
//                 />

//                 <label>Years</label>
//                 <input
//                   type="text"
//                   value={exp.years}
//                   onChange={(e) =>
//                     handleExperienceChange(idx, 'years', e.target.value)
//                   }
//                 />

//                 {experienceList.length > 1 && (
//                   <button
//                     type="button"
//                     className="remove-btn"
//                     onClick={() => handleRemoveExperience(idx)}
//                   >
//                     ❌ Remove
//                   </button>
//                 )}
//               </div>
//             ))}

//             <button type="button" onClick={handleAddExperience}>
//               + Add Experience
//             </button>

//             <div className="nav-buttons">
//               <button type="button" onClick={() => setCurrentStep(1)}>
//                 ← Back
//               </button>
//               <button type="button" onClick={() => setCurrentStep(3)}>
//                 Next →
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ========= PUBLICATIONS (OPTIONAL) ========= */}
//         {currentStep === 3 && (
//           <div className="step-section">
//             <h3>Publications (Optional)</h3>

//             {publications.map((pub, idx) => (
//   <div key={idx} className="entry-block">

//     <label>Title</label>
//     <input
//       type="text"
//       value={pub.title}
//       onChange={(e) =>
//         handlePublicationChange(idx, 'title', e.target.value)
//       }
//     />

//     <label>Journal</label>
//     <input
//       type="text"
//       value={pub.journal}
//       onChange={(e) =>
//         handlePublicationChange(idx, 'journal', e.target.value)
//       }
//     />

//     <label>Year</label>
//     <input
//       type="text"
//       value={pub.year}
//       onChange={(e) =>
//         handlePublicationChange(idx, 'year', e.target.value)
//       }
//     />

//     {/* 🗑️ REMOVE BUTTON */}
//     {publications.length > 1 && (
//       <button
//         type="button"
//         className="remove-btn"
//         onClick={() => handleRemovePublication(idx)}
//       >
//         🗑️ Remove
//       </button>
//     )}

//   </div>
// ))}

//             <button type="button" onClick={handleAddPublication}>
//               + Add Publication
//             </button>

//             <div className="nav-buttons">
//               <button type="button" onClick={() => setCurrentStep(2)}>
//                 ← Back
//               </button>
//               <button type="button" onClick={() => setCurrentStep(4)}>
//                 Next →
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ========= PROFILE PIC ========= */}
//         {currentStep === 4 && (
//           <div className="step-section">
//             <h3>Profile Picture *</h3>

//             <label>Upload Profile Photo</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => setProfilePic(e.target.files[0])}
//             />

//             <div className="nav-buttons">
//               <button type="button" onClick={() => setCurrentStep(3)}>
//                 ← Back
//               </button>
//               <button type="submit">Submit Profile</button>
//             </div>
//           </div>
//         )}
//       </form>
//     </div>
//     </ >
//   );
// }
