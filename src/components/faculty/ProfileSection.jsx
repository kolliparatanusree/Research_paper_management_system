/* File: src/components/faculty/ProfileSection.jsx */
import React from 'react';

export default function ProfileSection({ facultyDetails }) {
    return (
        <div className="profile-section">
            <h3>My Profile</h3>
            {facultyDetails ? (
                <div className="profile-details">
                    <p><strong>Name:</strong> {facultyDetails.fullName}</p>
                    <p><strong>Faculty ID:</strong> {facultyDetails.facultyId}</p>
                    <p><strong>Department:</strong> {facultyDetails.department}</p>
                    <p><strong>Email:</strong> {facultyDetails.email || 'N/A'}</p>
                    <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber}</p>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
}
