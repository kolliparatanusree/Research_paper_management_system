import React from "react";
import "./InstructionPage.css";
import CustomNavbar from "./CustomNavbar";

import {
  FaSignInAlt,
  FaTachometerAlt,
  FaFileAlt,
  FaUpload,
  FaSearch,
  FaBell,
  FaUserCircle,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

export default function Instructions() {
  const instructions = [
    {
      icon: <FaSignInAlt />,
      title: "Login & First-Time Setup",
      text: "Use your Faculty ID and password to access RPMS. Your default password is provided by the administrator. Change it after your first login.",
      color: "blue",
      label: "STEP 01",
    },
    {
      icon: <FaTachometerAlt />,
      title: "Dashboard Overview",
      text: "View your research activity, publication statistics, pending actions, notifications, and submission progress from your dashboard.",
      color: "purple",
      label: "STEP 02",
    },
    {
      icon: <FaFileAlt />,
      title: "Submit Research",
      text: 'Use the appropriate research submission section to provide your publication details. Complete all mandatory fields before submitting.',
      color: "cyan",
      label: "STEP 03",
    },
    {
      icon: <FaUpload />,
      title: "Upload Documents",
      text: "Upload the required supporting documents such as publication files, indexing proof, and payment receipts in the requested format.",
      color: "green",
      label: "STEP 04",
    },
    {
      icon: <FaSearch />,
      title: "Track Submission Status",
      text: 'Use the status and submission sections to monitor your requests, approvals, UID/PID information, and publication progress.',
      color: "orange",
      label: "STEP 05",
    },
    {
      icon: <FaBell />,
      title: "Stay Updated",
      text: "Check your notifications regularly for approval updates, requests for changes, important announcements, and other system activity.",
      color: "pink",
      label: "STEP 06",
    },
    {
      icon: <FaUserCircle />,
      title: "Keep Your Profile Updated",
      text: "Make sure your profile information such as contact details and other required information is accurate and up to date.",
      color: "indigo",
      label: "STEP 07",
    },
  ];

  return (
    <>
      <CustomNavbar />

      <div className="instructions-container">

        {/* HEADER */}
        <div className="instructions-header">

          <div className="guide-badge">
            <FaCheckCircle />
            RPMS USER GUIDE
          </div>

          <h1>
            How to Use{" "}
            <span>RPMS</span>
          </h1>

          <p>
            Follow these guidelines to manage your research submissions,
            publications, documents, and approval activities efficiently.
          </p>

        </div>

        {/* QUICK INFO */}
        <div className="guide-highlights">

          <div className="highlight-card">
            <div className="highlight-icon highlight-blue">
              <FaFileAlt />
            </div>

            <div>
              <strong>Research Management</strong>
              <span>Manage your research activities</span>
            </div>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon highlight-purple">
              <FaUpload />
            </div>

            <div>
              <strong>Document Management</strong>
              <span>Upload and manage research documents</span>
            </div>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon highlight-green">
              <FaSearch />
            </div>

            <div>
              <strong>Track Progress</strong>
              <span>Monitor your submissions and approvals</span>
            </div>
          </div>

        </div>

        {/* INSTRUCTIONS */}
        <div className="instructions-content">

          <div className="section-heading">
            <span>GETTING STARTED</span>
            <h2>Follow These Steps</h2>
            <p>
              Everything you need to know for using the Research Paper
              Management System.
            </p>
          </div>

          <div className="instruction-grid">

            {instructions.map((item, index) => (
              <div
                className={`instruction-card ${item.color}`}
                key={index}
              >

                <div className="instruction-top">

                  <div className="instruction-icon">
                    {item.icon}
                  </div>

                  <span className="step-number">
                    {item.label}
                  </span>

                </div>

                <h3>{item.title}</h3>

                <p>{item.text}</p>

                <div className="instruction-line" />

              </div>
            ))}

          </div>

          {/* IMPORTANT NOTE */}
          <div className="important-note">

            <div className="note-icon">
              <FaExclamationTriangle />
            </div>

            <div className="note-content">
              <span>IMPORTANT</span>

              <h3>Before submitting your research</h3>

              <p>
                Ensure that all information and uploaded documents are
                accurate, complete, and readable. Incomplete or incorrect
                information may delay the review process or result in
                rejection.
              </p>
            </div>

          </div>

        </div>

        {/* FOOTER HELP */}
        <div className="guide-footer">

          <div className="footer-check">
            <FaCheckCircle />
          </div>

          <div>
            <h3>Ready to get started?</h3>
            <p>
              Log in to RPMS and begin managing your research activities.
            </p>
          </div>

        </div>

      </div>
    </>
  );
}

// // src/pages/InstructionsPage.js
// import React from 'react';
// // import CustomNavbar from './CustomNavbar';
// import './InstructionPage.css';
// import CustomNavbar from './CustomNavbar';
// export default function Instructions() {
//   return (
//     <div><CustomNavbar></CustomNavbar>
//     <div className="instructions-container">
//       {/* <CustomNavbar /> */}
//       <div className="instructions-content">
//         <h1 className="instructions-title">Instructions</h1>
        
//         <ol className="instructions-list">
//           <li>
//             <strong>Login:</strong> Use your Faculty ID and password to log in. Default password is provided by the admin; change it after first login.
//           </li>
//           <li>
//             <strong>Dashboard Overview:</strong> View your total publications, pending approvals, and research activity summary at a glance.
//           </li>
//           <li>
//             <strong>Submit New Research:</strong> Go to the "Add Publication" section to submit new journal or conference publications. Fill in all mandatory fields.
//           </li>
//           <li>
//             <strong>Upload Documents:</strong> Upload supporting documents (e.g., publication certificate, journal copy) in PDF format. File size should not exceed 5MB.
//           </li>
//           <li>
//             <strong>Approval Flow:</strong> Submissions will be reviewed sequentially by:
//             <ul className="nested-list">
//               <li>Head of Department (HOD)</li>
//               <li>Principal</li>
//               <li>R&D Dean</li>
//             </ul>
//           </li>
//           <li>
//             <strong>Track Status:</strong> You can track the approval status under the "My Submissions" section.
//           </li>
          
//         </ol>

//         <p className="note">
//           <strong>Note:</strong> Ensure all details are accurate before submission. Incomplete or incorrect entries may be rejected.
//         </p>
//       </div>
//     </div>
//     </div>
//   );
// }