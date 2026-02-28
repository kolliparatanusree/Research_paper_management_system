// src/pages/DashboardCounts.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardCounts() {
  const [counts, setCounts] = useState({
    totalUIDs: 0,
    approvedUIDs: 0,
    pendingUIDs: 0,
    totalPIDs: 0,
    approvedPIDs: 0,
    pendingPIDs: 0
  });

  useEffect(() => {
  const facultyId = localStorage.getItem('userId');
  fetch(`http://localhost:5000/api/dashboard/counts/${facultyId}`)
    .then(res => res.json())
    .then(data => setCounts(data));
}, []);

//   useEffect(() => {
//     const facultyId = localStorage.getItem('facultyId') || 'faculty123';

//     axios.get(`/api/dashboard/counts/${facultyId}`)
//       .then(res => setCounts(res.data))
//       .catch(err => console.error(err));
//   }, []);

  const cardStyles = (gradient) => ({
    background: gradient,
    color: 'white',
    padding: '1rem',
    borderRadius: '15px',
    flex: 1,
    boxShadow: '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
    textAlign: 'center',
    fontWeight: 'bold',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'default'
  });

  const hoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 25px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.2)'
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Faculty Dashboard</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Total UIDs */}
        <div
          style={cardStyles('linear-gradient(145deg, #10b981, #34d399)')}
          onMouseEnter={e => Object.assign(e.currentTarget.style, hoverStyle)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, cardStyles('linear-gradient(145deg, #10b981, #34d399)'))}
        >
          <h4>Total UIDs</h4>
          <p style={{ fontSize: '20px' }}>{counts.totalUIDs}</p>
        </div>

        {/* Total PIDs */}
        <div
          style={cardStyles('linear-gradient(145deg, #3b82f6, #60a5fa)')}
          onMouseEnter={e => Object.assign(e.currentTarget.style, hoverStyle)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, cardStyles('linear-gradient(145deg, #3b82f6, #60a5fa)'))}
        >
          <h4>Total PIDs</h4>
          <p style={{ fontSize: '20px' }}>{counts.totalPIDs}</p>
        </div>

        {/* Approved UIDs */}
        <div
          style={cardStyles('linear-gradient(145deg, #fbbf24, #fde68a)')}
          onMouseEnter={e => Object.assign(e.currentTarget.style, hoverStyle)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, cardStyles('linear-gradient(145deg, #fbbf24, #fde68a)'))}
        >
          <h4>Approved UIDs</h4>
          <p style={{ fontSize: '20px' }}>{counts.approvedUIDs}</p>
        </div>

        {/* Pending UIDs */}
        <div
          style={cardStyles('linear-gradient(145deg, #ef4444, #f87171)')}
          onMouseEnter={e => Object.assign(e.currentTarget.style, hoverStyle)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, cardStyles('linear-gradient(145deg, #ef4444, #f87171)'))}
        >
          <h4>Pending UIDs</h4>
          <p style={{ fontSize: '20px' }}>{counts.pendingUIDs}</p>
        </div>

        {/* Approved PIDs */}
        <div
          style={cardStyles('linear-gradient(145deg, #6366f1, #a5b4fc)')}
          onMouseEnter={e => Object.assign(e.currentTarget.style, hoverStyle)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, cardStyles('linear-gradient(145deg, #6366f1, #a5b4fc)'))}
        >
          <h4>Approved PIDs</h4>
          <p style={{ fontSize: '20px' }}>{counts.approvedPIDs}</p>
        </div>

        {/* Pending PIDs */}
        <div
          style={cardStyles('linear-gradient(145deg, #1e40af, #3b82f6)')}
          onMouseEnter={e => Object.assign(e.currentTarget.style, hoverStyle)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, cardStyles('linear-gradient(145deg, #1e40af, #3b82f6)'))}
        >
          <h4>Pending PIDs</h4>
          <p style={{ fontSize: '20px' }}>{counts.pendingPIDs}</p>
        </div>
      </div>
    </div>
  );
}