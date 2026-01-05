// 📄 src/components/Sidebar.js
import React from 'react';
import './Sidebar.css';

export default function Sidebar({ setActiveSection, activeSection }) {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <button
        className={activeSection === 'uid' ? 'active' : ''}
        onClick={() => setActiveSection('uid')}
      >
        UID Requests
      </button>
      <button
        className={activeSection === 'submitted' ? 'active' : ''}
        onClick={() => setActiveSection('submitted')}
      >
        Submitted Docs
      </button>
      <button
        className={activeSection === 'approved' ? 'active' : ''}
        onClick={() => setActiveSection('approved')}
      >
        Approved PIDs
      </button>
      <button
        className={activeSection === 'profile' ? 'active' : ''}
        onClick={() => setActiveSection('profile')}
      >
        Profile
      </button>
    </div>
  );
}
