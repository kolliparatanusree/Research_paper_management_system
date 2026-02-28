import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardCounts() {
  const [counts, setCounts] = useState({
    approvedUIDs: 0,
    pendingUIDs: 0,
    approvedPIDs: 0,
    pendingPIDs: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await axios.get('/api/dashboard/counts');
        setCounts(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
      <div className="card">
        <h3>Approved UIDs</h3>
        <p>{counts.approvedUIDs}</p>
      </div>
      <div className="card">
        <h3>Pending UIDs</h3>
        <p>{counts.pendingUIDs}</p>
      </div>
      <div className="card">
        <h3>Approved PIDs</h3>
        <p>{counts.approvedPIDs}</p>
      </div>
      <div className="card">
        <h3>Pending PIDs</h3>
        <p>{counts.pendingPIDs}</p>
      </div>
    </div>
  );
}