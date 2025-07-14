// 📄 src/components/Profile.js
import React from 'react';

export default function DeanProfile({ profile }) {
  return (
    <div className="profile-section">
      <h2>Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone Number:</strong> {profile.phoneNumber}</p>
    </div>
  );
}
