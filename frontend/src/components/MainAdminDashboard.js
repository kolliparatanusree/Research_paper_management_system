import React, { useState } from 'react';
import AddFacultyForm from './AddFacultyForm';
import RemoveFaculty from './RemoveFaculty';
import AddHodForm from './AddHOD';        // Import your AddHodForm component
import RemoveHod from './RemoveHOD';          // Import your RemoveHod component
import './MainAdminDashboard.css';

const MainAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('addFaculty');

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin Dashboard</h2>

        <button
          onClick={() => setActiveSection('addFaculty')}
          className={`sidebar-btn ${activeSection === 'addFaculty' ? 'active' : ''}`}
        >
          ➕ Add Faculty
        </button>

        <button
          onClick={() => setActiveSection('removeFaculty')}
          className={`sidebar-btn ${activeSection === 'removeFaculty' ? 'active' : ''}`}
        >
          View Faculty Details
        </button>

        <button
          onClick={() => setActiveSection('addHod')}
          className={`sidebar-btn ${activeSection === 'addHod' ? 'active' : ''}`}
        >
          ➕ Add HOD
        </button>

        <button
          onClick={() => setActiveSection('removeHod')}
          className={`sidebar-btn ${activeSection === 'removeHod' ? 'active' : ''}`}
        >
          View HOD Details
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeSection === 'addFaculty' && <AddFacultyForm />}
        {activeSection === 'removeFaculty' && <RemoveFaculty />}
        {activeSection === 'addHod' && <AddHodForm />}
        {activeSection === 'removeHod' && <RemoveHod />}
      </main>
    </div>
  );
};

export default MainAdminDashboard;
