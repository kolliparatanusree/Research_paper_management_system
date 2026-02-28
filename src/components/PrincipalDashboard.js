import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RDDeanDashboard.css';
import logo from './logo2.jpeg';
import CustomNavbar from './CustomNavbar';
import Swal from 'sweetalert2';

export default function PrincipalDashboard() {
  const [requests, setRequests] = useState([]);
  const [activeSection, setActiveSection] = useState('uid-approval');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const navigate = useNavigate();

  const [approvedPids, setApprovedPids] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

const filteredPids = approvedPids.filter(doc => {
  // Filter by date range
  if (startDate && endDate) {
    const uploaded = new Date(doc.uploadedAt);
    if (!(uploaded >= new Date(startDate) && uploaded <= new Date(endDate))) return false;
  }

  // Filter by search term
  if (searchTerm.trim() === '') return true;

  const term = searchTerm.toLowerCase();
  return (
    (doc.facultyId && doc.facultyId.toLowerCase().includes(term)) ||
    (doc.paperTitle && doc.paperTitle.toLowerCase().includes(term)) ||
    (doc.uid && doc.uid.toLowerCase().includes(term)) ||
    (doc.pid && doc.pid.toLowerCase().includes(term))
  );
});

useEffect(() => {
  fetch('http://localhost:5000/api/admin/approved-pids')
    .then(res => res.json())
    .then(data => setApprovedPids(data))
    .catch(err => {
      console.error(err);
      setApprovedPids([]);
      Swal.fire('Error', 'Failed to load approved PIDs.', 'error');
    });
}, []);


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
        return Swal.fire('Error', 'Please provide a reason for rejection.', 'error');
        
        // alert('Please provide a reason for rejection.');
        // return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/principal/uid-request/${id}/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: finalReason }),
        });

        const data = await res.json();
        
        Swal.fire('Rejected',  'success');
        // alert(data.message);
        setRequests(prev => prev.filter(r => r._id !== id));
        setRejectingId(null);
        setRejectReason('');
        setCustomReason('');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Rejection failed', 'error');
       // alert('Rejection failed');
      }
    } else {
      try {
        const res = await fetch(`http://localhost:5000/api/principal/uid-request/${id}/accept`, {
          method: 'PUT',
        });
        const data = await res.json();
        Swal.fire('Accepted', data.message, 'success');
        // alert(data.message);
        setRequests(prev => prev.filter(r => r._id !== id));
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Acceptance failed', 'error');
        // alert('Acceptance failed');
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
    localStorage.clear();
  
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to log out?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log me out',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981', // green
      cancelButtonColor: '#f87171',  // red
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ User confirmed logout
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have successfully logged out!',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate('/login'); // Redirect after success message
        });
      }
    });
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
  className={activeSection === 'approved-pids' ? 'active' : ''}
  onClick={() => setActiveSection('approved-pids')}
  style={{ cursor: 'pointer' }}
>
  ✅ Approved PIDs
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
            <h2>Pending UID Requests</h2>
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

       {activeSection === 'approved-pids' && (
  <div className="uid-requests-container">
    <h2>Approved PIDs</h2>

    {/* Search + Date Filters */}
    <div className="filters-container" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Search by Faculty, Paper Title, UID or PID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ flex: '1 1 300px', padding: '0.5rem', fontSize: '1rem' }}
      />

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <label>
          From:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ marginLeft: '0.25rem', padding: '0.25rem' }}
          />
        </label>
        <label>
          To:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ marginLeft: '0.25rem', padding: '0.25rem' }}
          />
        </label>
      </div>
    </div>

    {/* Display filtered PIDs */}
    {filteredPids.length === 0 ? (
      <p>No approved documents found.</p>
    ) : (
      filteredPids.map(doc => (
        <div className="uid-request-card" key={doc._id}>
          <h4>{doc.paperTitle}</h4>
          <p><strong>Faculty:</strong> {doc.facultyId}</p>
          <p><strong>PID:</strong> {doc.pid}</p>
          <p><strong>UID:</strong> {doc.uid}</p>
          <p><strong>Type:</strong> {doc.type}</p>
          <p><strong>Abstract:</strong> {doc.abstract}</p>
          <p><strong>Target:</strong> {doc.target}</p>
          <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>

          <p><strong>Acceptance Letter:</strong>
            <a
              href={doc.acceptanceLetter?.base64 ? `data:${doc.acceptanceLetter?.contentType};base64,${doc.acceptanceLetter?.base64}` : '#'}
              download={doc.acceptanceLetter?.filename || "--"}
            >
              📥 Download
            </a>
          </p>

          <p><strong>Indexing Proof:</strong>
            <a
              href={doc.indexingProof?.base64 ? `data:${doc.indexingProof?.contentType};base64,${doc.indexingProof?.base64}` : '#'}
              download={doc.indexingProof?.filename || "--"}
            >
              📥 Download
            </a>
          </p>
        </div>
      ))
    )}
  </div>
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