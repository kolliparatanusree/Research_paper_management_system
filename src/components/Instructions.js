// src/pages/InstructionsPage.js
import React from 'react';
// import CustomNavbar from './CustomNavbar';
import './InstructionPage.css';
import CustomNavbar from './CustomNavbar';
export default function Instructions() {
  return (
    <div><CustomNavbar></CustomNavbar>
    <div className="instructions-container">
      {/* <CustomNavbar /> */}
      <div className="instructions-content">
        <h1 className="instructions-title">Instructions for Using the Research Publication Management System (RPMS)</h1>
        
        <ol className="instructions-list">
          <li>
            <strong>Login:</strong> Use your Faculty ID and password to log in. Default password is provided by the admin; change it after first login.
          </li>
          <li>
            <strong>Dashboard Overview:</strong> View your total publications, pending approvals, and research activity summary at a glance.
          </li>
          <li>
            <strong>Submit New Research:</strong> Go to the "Add Publication" section to submit new journal or conference publications. Fill in all mandatory fields.
          </li>
          <li>
            <strong>Upload Documents:</strong> Upload supporting documents (e.g., publication certificate, journal copy) in PDF format. File size should not exceed 5MB.
          </li>
          <li>
            <strong>Approval Flow:</strong> Submissions will be reviewed sequentially by:
            <ul className="nested-list">
              <li>Head of Department (HOD)</li>
              <li>Principal</li>
              <li>R&D Dean</li>
            </ul>
          </li>
          <li>
            <strong>Track Status:</strong> You can track the approval status under the "My Submissions" section.
          </li>
          
        </ol>

        <p className="note">
          <strong>Note:</strong> Ensure all details are accurate before submission. Incomplete or incorrect entries may be rejected.
        </p>
      </div>
    </div>
    </div>
  );
}