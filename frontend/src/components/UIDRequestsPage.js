import React, { useEffect, useState } from 'react';
import './HodDashboard.css';

export default function UIDRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [department, setDepartment] = useState('hod');
  const [loading, setLoading] = useState(true);

  const hodId = localStorage.getItem('hodId');

  useEffect(() => {
    const fetchHodAndRequests = async () => {
      try {
        // Step 1: Get HoD department
        const hodRes = await fetch(`http://localhost:5000/api/hod/${hodId}`);
        const hodData = await hodRes.json();
        setDepartment(hodData.department);

        // Step 2: Get all UID requests
        const requestRes = await fetch('http://localhost:5000/api/hod/uid-requests');
        const allRequests = await requestRes.json();

        // Step 3: Filter by HoD's department (case-insensitive match)
        const filtered = allRequests.filter(
          req => req.department?.toLowerCase() === hodData.department?.toLowerCase() && req.hodAccept !== true
        );

        setRequests(filtered);
      } catch (err) {
        console.error('Error:', err);
        alert('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (hodId) fetchHodAndRequests();
    else alert('HoD not logged in');
  }, [hodId]);

 const handleAction = async (id, status) => {
  try {
    let url = `http://localhost:5000/api/hod/uid-request/${id}/${status}`;
    let body = null;

    if (status === 'reject') {
      const reason = prompt('Please enter a reason for rejection:');
      if (!reason) return alert('Rejection cancelled');

      url = `http://localhost:5000/api/hod/uid-request/${id}/reject`;
      body = JSON.stringify({ reason });
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });

    const data = await res.json();
    alert(data.message);
    setRequests(prev => prev.filter(r => r._id !== id));
  } catch (err) {
    console.error(err);
    alert('Action failed');
  }
};

  return (
    <div className="uid-requests-container">
      <h2>Pending UID Requests ({department})</h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No UID requests pending{department}.</p>
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
              <button className="reject" onClick={() => handleAction(req._id, 'reject')}>Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
