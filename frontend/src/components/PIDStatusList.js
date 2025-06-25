import React, { useEffect, useState } from 'react';
import './FacultyDashboard.css';

export default function PIDStatusList({ facultyId }) {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('approved'); // 'approved' | 'pending' | 'rejected'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true); // Start loading
      try {
        const res = await fetch(`http://localhost:5000/api/faculty/pid-status/${facultyId}`);
        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        console.error('Error fetching PID status:', err);
      } finally {
        setLoading(false); // Done loading
      }
    };

    if (facultyId) {
      fetchSubmissions();
    }
  }, [facultyId]);

  const filteredSubmissions = () => {
    if (filter === 'approved') {
      return submissions.filter(sub => sub.adminAccept === true && sub.isRejected === false);
    }
    if (filter === 'rejected') {
      return submissions.filter(sub => sub.isRejected === true);
    }
    if (filter === 'pending') {
      return submissions.filter(sub => sub.adminAccept === false && sub.isRejected === false);
    }
    return [];
  };

  const filtered = filteredSubmissions();

  return (
    <div>
      <div className="filter-buttons">
        <button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'active' : ''}>✅ Approved</button>
        <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>⌛ Pending</button>
        <button onClick={() => setFilter('rejected')} className={filter === 'rejected' ? 'active' : ''}>❌ Rejected</button>
      </div>

      <div className="uid-status-list">
        {loading ? (
          <p className="loading-text">🌀 Loading.....<span className="dots"></span></p>
        ) : filtered.length === 0 ? (
          <p>No {filter} documents found.</p>
        ) : (
          filtered.map((doc) => (
            <div key={doc._id} className="uid-status-card">
              <p style={{ color: 'blue', fontSize: '23px' }}>{doc.paperTitle}</p>
              <p><strong>UID:</strong> {doc.uid}</p>
              <p><strong>PID:</strong> {doc.pid}</p>
              <p><strong>Type:</strong> {doc.type}</p>
              <p><strong>Abstract:</strong> {doc.abstract}</p>
              <p><strong>Target:</strong> {doc.target}</p>
              <p><strong>Uploaded At:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>

              {filter === 'rejected' && (
                <p style={{ color: 'red' }}><strong>Reason:</strong> {doc.rejectionReason || 'Not provided'}</p>
              )}

              {filter === 'pending' && (
                <p style={{ color: 'orange' }}><strong>Status:</strong> Waiting for admin review</p>
              )}

              {filter === 'approved' && (
                <p style={{ color: 'green' }}><strong>Status:</strong> ✅ Approved by Admin</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
