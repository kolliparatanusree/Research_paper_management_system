import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HodDashboard.css';
import logo from './logo2.jpeg';
import CustomNavbar from './CustomNavbar';

export default function PrincipalDashboard() {
  const [requests, setRequests] = useState([]);
  const [activeSection, setActiveSection] = useState('uid-approval');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (activeSection === 'uid-approval') {
      fetch('http://localhost:5000/api/hod/uid-requests')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(r => r.hodAccept && !r.principalAccept);
          setRequests(filtered);
        })
        .catch(err => {
          console.error(err);
          alert('Failed to load data.');
        });
    }
  }, [activeSection]);

  const handleAction = async (id, status) => {
    if (status === 'reject') {
      const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
      if (!finalReason.trim()) {
        alert('Please provide a reason for rejection.');
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/principal/uid-request/${id}/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: finalReason }),
        });

        const data = await res.json();
        alert(data.message);
        setRequests(prev => prev.filter(r => r._id !== id));
        setRejectingId(null);
        setRejectReason('');
        setCustomReason('');
      } catch (err) {
        console.error(err);
        alert('Rejection failed');
      }
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/principal/uid-request/${id}/accept`, {
          method: 'PUT',
        });
        const data = await res.json();
        alert(data.message);
        setRequests(prev => prev.filter(r => r._id !== id));
      } catch (err) {
        console.error(err);
        alert('Acceptance failed');
      }
    }
  };

  const handleCancelReject = () => {
    setRejectingId(null);
    setRejectReason('');
    setCustomReason('');
  };

  const rejectionOptions = [
    'Insufficient Details',
    'Not Relevant to Department',
    'Duplicate Submission',
    'Unclear Abstract',
    'Other'
  ];

  const defaultProfile = {
    name: 'Principal Name',
    email: 'principal@example.com',
    phone: '+91 9876543210',
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <>
    <CustomNavbar />
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>
          {/* <img src={logo} alt="Logo" className="sidebar-logo" /> */}
          Principal Panel
        </h3>

        <ul className="menu">
          <li
            className={activeSection === 'uid-approval' ? 'active' : ''}
            onClick={() => setActiveSection('uid-approval')}
            style={{ cursor: 'pointer' }}
          >
            📄 Final UID Approval
          </li>
          <li
            className={activeSection === 'profile' ? 'active' : ''}
            onClick={() => setActiveSection('profile')}
            style={{ cursor: 'pointer' }}
          >
            👤 Profile
          </li>
          <li
            onClick={handleLogout}
            style={{ cursor: 'pointer', color: 'white' }}
          >
            🔚 Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeSection === 'uid-approval' && (
          <>
            <h2>Requests Approved by HoD</h2>
            {requests.length === 0 ? (
              <p>No requests pending final approval.</p>
            ) : (
              requests.map(req => (
                <div className="uid-request-card" key={req._id}>
                  <h4>{req.paperTitle}</h4>
                  <p><strong>Faculty Name:</strong> {req.facultyName}</p>
                  <p><strong>Faculty ID:</strong> {req.facultyId}</p>
                  <p><strong>Department:</strong> {req.department}</p>
                  <p><strong>Type:</strong> {req.type}</p>
                  <p><strong>Target:</strong> {req.target}</p>
                  <p><strong>Abstract:</strong> {req.abstract}</p>
                  <p><strong>Submitted On:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>

                  <div className="actions">
                    <button className="accept" onClick={() => handleAction(req._id, 'accept')}>Accept</button>

                    {rejectingId === req._id ? (
                      <>
                        <select
                          className="reason-select"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        >
                          <option value="">Select reason</option>
                          {rejectionOptions.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>

                        {rejectReason === 'Other' && (
                          <input
                            type="text"
                            placeholder="Enter custom reason"
                            className="custom-reason-input"
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                          />
                        )}

                        <button className="confirm-reject" onClick={() => handleAction(req._id, 'reject')}>
                          Confirm Reject
                        </button>
                        <button className="cancel-reject" onClick={handleCancelReject}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button className="reject" onClick={() => setRejectingId(req._id)}>Reject</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeSection === 'profile' && (
          <div className="profile-view">
            <h2>Profile Details</h2>
            <p><strong>Name:</strong> {defaultProfile.name}</p>
            <p><strong>Email:</strong> {defaultProfile.email}</p>
            <p><strong>Phone:</strong> {defaultProfile.phone}</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}