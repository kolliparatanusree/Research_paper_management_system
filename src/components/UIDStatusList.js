import React, { useEffect, useState } from 'react';
import './FacultyDashboard.css';

export default function UIDStatusList({ facultyId }) {
  const [allRequests, setAllRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [filter, setFilter] = useState('approved'); // 'approved' | 'pending' | 'rejected'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {
        const res = await fetch('http://localhost:5000/api/hod/uid-requests');
        const data = await res.json();
        setAllRequests(data.filter(req => req.facultyId === facultyId));

        const rejRes = await fetch(`http://localhost:5000/api/faculty/rejected-uids/${facultyId}`);
        const rejectedData = await rejRes.json();
        setRejectedRequests(rejectedData);
      } catch (err) {
        console.error('Error fetching UID status:', err);
      } finally {
        setLoading(false); // Done loading
      }
    };

    fetchData();
  }, [facultyId]);

  const filteredRequests = () => {
    if (filter === 'approved') {
      return allRequests.filter(req => req.hodAccept && req.principalAccept && req.adminAccept && req.uid);
    }
    if (filter === 'pending') {
      return allRequests.filter(req =>
        !(req.hodAccept && req.principalAccept && req.adminAccept && req.uid)
      );
    }
    if (filter === 'rejected') {
      return rejectedRequests;
    }
    return [];
  };

  const getStatusLabel = (value) => {
    return value ? <span style={{ color: 'green' }}>✅ Approved</span> : <span style={{ color: 'orange' }}>⌛ Pending</span>;
  };

  const filtered = filteredRequests();

  return (
    <div>
      <div className="filter-buttons">
        <button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'active' : ''}>✅Approved UIDs</button>
        <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>⌛Pending UIDs</button>
        <button onClick={() => setFilter('rejected')} className={filter === 'rejected' ? 'active' : ''}>❌Rejected UIDs</button>
      </div>

      <div className="uid-status-list">
        {loading ? (
          <p className="loading-text">🌀 Loading......<span className="dots"></span></p>
        ) : filtered.length === 0 ? (
          <p>No {filter} requests found.</p>
        ) : (
          filtered.map(req => (
            <div key={req._id} className="uid-status-card">
              <p style={{ color: 'blue', fontSize: '23px' }}>{req.paperTitle}</p>
              <p><strong>Type:</strong> {req.type}</p>
              <p><strong>Target:</strong> {req.target}</p>
              <p><strong>Abstract:</strong> {req.abstract}</p>
              <p><strong>Submitted:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>

              {/* Approved UID */}
              {req.uid && <p><strong>UID:</strong> {req.uid}</p>}

              {/* Pending Section */}
              {filter === 'pending' && (
                <div style={{ marginTop: '10px' }}>
                  <p><strong>HOD Status:</strong> {getStatusLabel(req.hodAccept)}</p>
                  <p><strong>Principal Status:</strong> {getStatusLabel(req.principalAccept)}</p>
                  <p><strong>Admin Status:</strong> {getStatusLabel(req.adminAccept)}</p>
                </div>
              )}

              {/* Rejected Section */}
              {filter === 'rejected' && (
                <>
                  <p style={{ color: 'red' }}><strong>Reason:</strong> {req.reason}</p>
                  <p><strong>Rejected By:</strong> {req.rejectedBy?.toUpperCase()}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
