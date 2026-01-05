import React, { useEffect, useState } from 'react';
import './HodDashboard.css';

export default function HodUidApproval() {
  const [requests, setRequests] = useState([]);
  const [department, setDepartment] = useState('hod');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const hodId = localStorage.getItem('hodId');

  useEffect(() => {
    const fetchHodAndRequests = async () => {
      try {
        const hodRes = await fetch(`http://localhost:5000/api/hod/${hodId}`);
        const hodData = await hodRes.json();
        setDepartment(hodData.department);

        const requestRes = await fetch('http://localhost:5000/api/hod/uid-requests');
        const allRequests = await requestRes.json();

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
        const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
        if (!finalReason) return alert('Please provide a reason for rejection.');
        url = `http://localhost:5000/api/hod/uid-request/${id}/reject`;
        body = JSON.stringify({ reason: finalReason });
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      const data = await res.json();
      alert(data.message);
      setRequests(prev => prev.filter(r => r._id !== id));
      setRejectingId(null);
      setRejectReason('');
      setCustomReason('');
    } catch (err) {
      console.error(err);
      alert('Action failed');
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


// import React, { useEffect, useState } from 'react';
// import './HodDashboard.css';

// export default function HodUidApproval() {
//   const [requests, setRequests] = useState([]);
//   const [department, setDepartment] = useState('hod');
//   const [loading, setLoading] = useState(true);

//   const hodId = localStorage.getItem('hodId');

//   useEffect(() => {
//     const fetchHodAndRequests = async () => {
//       try {
//         // Step 1: Get HoD department
//         const hodRes = await fetch(`http://localhost:5000/api/hod/${hodId}`);
//         const hodData = await hodRes.json();
//         setDepartment(hodData.department);

//         // Step 2: Get all UID requests
//         const requestRes = await fetch('http://localhost:5000/api/hod/uid-requests');
//         const allRequests = await requestRes.json();

//         // Step 3: Filter by HoD's department (case-insensitive match)
//         const filtered = allRequests.filter(
//           req => req.department?.toLowerCase() === hodData.department?.toLowerCase() && req.hodAccept !== true
//         );

//         setRequests(filtered);
//       } catch (err) {
//         console.error('Error:', err);
//         alert('Failed to load data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (hodId) fetchHodAndRequests();
//     else alert('HoD not logged in');
//   }, [hodId]);

//  const handleAction = async (id, status) => {
//   try {
//     let url = `http://localhost:5000/api/hod/uid-request/${id}/${status}`;
//     let body = null;

//     if (status === 'reject') {
//       const reason = prompt('Please enter a reason for rejection:');
//       if (!reason) return alert('Rejection cancelled');

//       url = `http://localhost:5000/api/hod/uid-request/${id}/reject`;
//       body = JSON.stringify({ reason });
//     }

//     const res = await fetch(url, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: body,
//     });

//     const data = await res.json();
//     alert(data.message);
//     setRequests(prev => prev.filter(r => r._id !== id));
//   } catch (err) {
//     console.error(err);
//     alert('Action failed');
//   }
// };

//   return (
//     <div className="uid-requests-container">
//       <h2>Pending UID Requests </h2>
//       {/* <h2>Pending UID Requests ({department})</h2> */}

//       {loading ? (
//         <p>Loading...</p>
//       ) : requests.length === 0 ? (
//         <p>No UID requests pending from {department}.</p>
//       ) : (
//         requests.map(req => (
//           <div className="uid-request-card" key={req._id}>
//             <h4>{req.paperTitle}</h4>
//             <p><strong>Faculty Name:</strong> {req.facultyName}</p>
//             <p><strong>Faculty ID:</strong> {req.facultyId}</p>
//             <p><strong>Department:</strong> {req.department}</p>
//             <p><strong>Type:</strong> {req.type}</p>
//             <p><strong>Target:</strong> {req.target}</p>
//             <p><strong>Abstract:</strong> {req.abstract}</p>
//             <p><strong>Submitted At:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>

//             <div className="actions">
//               <button className="accept" onClick={() => handleAction(req._id, 'accept')}>Accept</button>
//               <button className="reject" onClick={() => handleAction(req._id, 'reject')}>Reject</button>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }
