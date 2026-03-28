// src/pages/RDcoordinatorUidApproval.jsx
import React, { useEffect, useState } from 'react';
import './HodDashboard.css';
import Swal from 'sweetalert2';

export default function RDcoordinatorUidApproval({ department: propDepartment }) {
  const [requests, setRequests] = useState([]);
  const [department, setDepartment] = useState(propDepartment || '');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const rdCoordinatorId = JSON.parse(localStorage.getItem("user"))?.userId;

  useEffect(() => {
    const fetchRequests = async () => {
      if (!rdCoordinatorId) {
        alert('RD Coordinator not logged in');
        setLoading(false);
        return;
      }

      try {
        // If department not passed as prop, fetch from RD Coordinator profile
        if (!department) {
          const profileRes = await fetch(`http://localhost:5000/api/faculty/${rdCoordinatorId}`);
          const profileData = await profileRes.json();
          setDepartment(profileData.department);
        }

        // Fetch pending UID requests for this department
        const requestRes = await fetch(
          `http://localhost:5000/api/rdcoordinator/uid-requests/${rdCoordinatorId}`
        );

        if (!requestRes.ok) throw new Error('Failed to fetch UID requests');

        const deptRequests = await requestRes.json();
        setRequests(deptRequests);
      } catch (err) {
        console.error('Error fetching UID requests:', err);
        alert('Failed to load UID requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [rdCoordinatorId, department]);

  const handleAction = async (id, status) => {
    try {
      let url = `http://localhost:5000/api/rdcoordinator/uid-request/${id}/accept/${rdCoordinatorId}`;
      let body = null;

      if (status === 'reject') {
        const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
        if (!finalReason) return Swal.fire('Error', 'Please provide a reason', 'error');

        url = `http://localhost:5000/api/rdcoordinator/uid-request/${id}/reject/${rdCoordinatorId}`;
        body = JSON.stringify({ reason: finalReason });
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const data = await res.json();

      Swal.fire('Success', data.message, 'success');
      setRequests(prev => prev.filter(r => r._id !== id));
      setRejectingId(null);
      setRejectReason('');
      setCustomReason('');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Action failed', 'error');
    }
  };

  const rejectionOptions = [
    'Insufficient Details',
    'Not Relevant to Department',
    'Duplicate Submission',
    'Unclear Abstract',
    'Other'
  ];

  return (
    <div className="uid-requests-container">
      <h2>Pending UID Requests ({department})</h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No UID requests pending from {department}.</p>
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
            <p><strong>Submitted At:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>

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
                    {rejectionOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>

                  {rejectReason === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom reason"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="custom-reason-input"
                    />
                  )}

                  <button className="confirm-reject" onClick={() => handleAction(req._id, 'reject')}>
                    Confirm Reject
                  </button>
                  <button className="cancel-reject" onClick={() => {
                    setRejectingId(null);
                    setRejectReason('');
                    setCustomReason('');
                  }}>
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
    </div>
  );
}