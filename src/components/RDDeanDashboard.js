import React, { useEffect, useState } from 'react';
import './RDDeanDashboard.css'; // Reuse styles
import logo from './logo2.jpeg';  // Adjust path as needed
import { useNavigate } from 'react-router-dom';
import CustomNavbar from './CustomNavbar'; // Import the custom navbar
import Swal from 'sweetalert2';
export default function RDDeanDashboard() {
  const [activeSection, setActiveSection] = useState('faculty-uid');
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [approvedPids, setApprovedPids] = useState([]);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');


  const [counts, setCounts] = useState({
  approvedUIDs: 0,
  pendingUIDs: 0,
  totalUIDs: 0,
  approvedPIDs: 0,
  pendingPIDs: 0,
  totalPIDs: 0,
});

useEffect(() => {
  const fetchCounts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/rddean-counts');
      const data = await res.json();
      setCounts(data);
    } catch (err) {
      console.error('Error fetching system-wide counts:', err);
    }
  };

  fetchCounts();
  const interval = setInterval(fetchCounts, 30000); // refresh every 30s
  return () => clearInterval(interval);
}, []);
  // Fetch Profile data (mock or API)
  useEffect(() => {
    // Replace with real API call if needed
    setProfile({
      name: 'R&D Admin',
      email: 'admin@rnd.com',
      phoneNumber:'6304702811',
    });
  }, []);

  useEffect(() => {
    if (activeSection === 'approved-pids') {
      fetch('http://localhost:5000/api/admin/approved-pids')
        .then(res => res.json())
        .then(data => setApprovedPids(data))
       .catch(err => {
  console.error(err);
  setApprovedPids([]);
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: 'Failed to load approved PIDs.'
  });
});

       
        // .catch(err => {
        //   console.error(err);
        //   setApprovedPids([]);
        //   alert('Failed to load approved PIDs.');
        // });
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'faculty-uid') {
      fetch('http://localhost:5000/api/hod/uid-requests')
        .then(res => res.json())
        .then(data => {
          const filtered = Array.isArray(data) ? data.filter(row => row.hodAccept && row.principalAccept && !row.adminAccept) : [];
          setApprovedRequests(filtered);
        })
        .catch(err => {
          console.error(err);
          Swal.fire('Error', 'Failed to load UID requests.', 'error');
        });
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'paper-submission') {
      fetch('http://localhost:5000/api/admin/all-submitted-documents')
        .then(res => res.json())
        .then(data => {
          setSubmissions(data);
        })
        .catch(err => {
          console.error(err);
          setSubmissions([]);
        });
    }
  }, [activeSection]);

  const handleDocumentAction = async (id, status) => {
    // if (status === 'reject') {
    //   const reason = prompt('Enter reason for rejection:');
    //   if (!reason?.trim()) return alert('Rejection reason is required.');
    if (status === 'reject') {
  const { value: reason } = await Swal.fire({
    title: 'Reject Document',
    input: 'text',
    inputLabel: 'Enter reason for rejection',
    inputPlaceholder: 'Type reason here...',
    showCancelButton: true,
  });

  if (!reason) {
    return Swal.fire('Error', 'Rejection reason is required.', 'error');
  }


      try {
        const res = await fetch(`http://localhost:5000/api/admin/document-submission/${id}/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        });

        const data = await res.json();
        Swal.fire('Success', data.message, 'success');

        setSubmissions(prev => prev.filter(doc => doc._id !== id));
      } catch (err) {
        console.error(err);
        alert('Failed to reject the document.');
      }

      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/document-submission/${id}/accept`, {
        method: 'PUT'
      });

      const data = await res.json();

// Show SweetAlert with message + PID
Swal.fire({
  icon: 'success',
  title: 'Submission Accepted!',
  html: `<p>${data.message}</p><p><strong>PID:</strong> ${data.pid}</p>`,
  showConfirmButton: true,
  confirmButtonText: 'OK'
});

// Remove accepted document from the list
setSubmissions(prev => prev.filter(doc => doc._id !== id));


      // const data = await res.json();
      // alert(`${data.message} PID: ${data.pid}`);
      setSubmissions(prev => prev.filter(doc => doc._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to process the document.');
    }
  };

  const handleAction = async (id, status) => {
    try {
      let body = null;
      // let body = null;
if (status === 'reject') {
  const { value: reason } = await Swal.fire({
    title: 'Reject UID Request',
    input: 'text',
    inputLabel: 'Enter reason for rejection',
    inputPlaceholder: 'Type reason here...',
    showCancelButton: true,
  });

  if (!reason) {
    return Swal.fire('Error', 'Rejection reason is required.', 'error');
  }
  body = JSON.stringify({ reason });
}

const res = await fetch(`http://localhost:5000/api/admin/uid-request/${id}/${status}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body
});

const data = await res.json();
Swal.fire('Success', data.message, 'success');

      // if (status === 'reject') {
      //   const reason = prompt('Enter reason for rejection:');
      //   if (!reason?.trim()) return alert('Rejection reason is required.');
      //   body = JSON.stringify({ reason });
      // }

      // const res = await fetch(`http://localhost:5000/api/admin/uid-request/${id}/${status}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body
      // });

      // const data = await res.json();
      // alert(data.message);
      setApprovedRequests(prev => prev.filter(r => r._id !== id));
    } 
    catch (err) {
  console.error(err);
  Swal.fire({
    icon: 'error',
    title: 'Action Failed',
    text: 'Something went wrong while performing this action.'
  });
}

    // catch (err) {
    //   console.error(err);
    //   alert('Action failed');
    // }
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

      {/* <div className="dashboard-counts">
  <div className="count-card"><h4>Total UIDs</h4><p>{counts.totalUIDs}</p></div>
  <div className="count-card"><h4>Approved UIDs</h4><p>{counts.approvedUIDs}</p></div>
  <div className="count-card"><h4>Pending UIDs</h4><p>{counts.pendingUIDs}</p></div>
  <div className="count-card"><h4>Total PIDs</h4><p>{counts.totalPIDs}</p></div>
  <div className="count-card"><h4>Approved PIDs</h4><p>{counts.approvedPIDs}</p></div>
  <div className="count-card"><h4>Pending PIDs</h4><p>{counts.pendingPIDs}</p></div>
</div> */}
    <div className="dashboard-container">
      <div className="sidebar">
       <div className="logo-section">
          {/* <img src={logo} alt="Logo" className="logo" /> */}
        </div>
        <h2>R&D Dean Dashboard</h2>
        <ul className="menu">
          <li className={activeSection === 'dashboard' ? 'active' : ''} onClick={() => setActiveSection('dashboard')}>
            🧾 Dashboard
          </li>
          <li className={activeSection === 'faculty-uid' ? 'active' : ''} onClick={() => setActiveSection('faculty-uid')}>
            🧾 Faculty UID Requests
          </li>
          <li className={activeSection === 'paper-submission' ? 'active' : ''} onClick={() => setActiveSection('paper-submission')}>
            📝 Documents Submissions
          </li>
          <li className={activeSection === 'approved-pids' ? 'active' : ''} onClick={() => setActiveSection('approved-pids')}>
            ✅ Approved PIDs
          </li>
          <li className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>
            👤 Profile
          </li>
          <li onClick={handleLogout} style={{ cursor: 'pointer', color: 'white', marginTop: 'auto' }}>
            🔚  Logout
          </li>
        </ul>
      </div>

      <div className="main-content">
         {activeSection === 'dashboard' && (
  <div className="dashboard-counts">
    {[
      { title: 'Total UIDs', value: counts.totalUIDs, bg: 'linear-gradient(145deg, #10b981, #34d399)' },
      { title: 'Approved UIDs', value: counts.approvedUIDs, bg: 'linear-gradient(145deg, #3b82f6, #60a5fa)' },
      { title: 'Pending UIDs', value: counts.pendingUIDs, bg: 'linear-gradient(145deg, #dba00b, #e4bb17)' },
      { title: 'Total PIDs', value: counts.totalPIDs, bg: 'linear-gradient(145deg, #ef4444, #f87171)' },
      { title: 'Approved PIDs', value: counts.approvedPIDs, bg: 'linear-gradient(145deg, #6366f1, #a5b4fc)' },
      { title: 'Pending PIDs', value: counts.pendingPIDs, bg: 'linear-gradient(145deg, #1e40af, #3b82f6)' },
    ].map((card, index) => (
      <div
        key={index}
        className="count-card"
        style={{ background: card.bg }}
      >
        <h4>{card.title}</h4>
        <p>{card.value}</p>
      </div>
    ))}
  </div>
)}

        {activeSection === 'faculty-uid' && (
          <div className="uid-requests-container">
            <h2>Pending UID Requests</h2>
            {approvedRequests.length === 0 ? (
              <p>No UID requests pending approval.</p>
            ) : (
              approvedRequests.map(req => (
                <div className="uid-request-card" key={req._id}>
                  <h4>{req.paperTitle}</h4>
                  <p><strong>Faculty:</strong> {req.facultyName} ({req.facultyId})</p>
                  <p><strong>Dept:</strong> {req.department}</p>
                  <p><strong>Type:</strong> {req.type}</p>
                  <p><strong>Target:</strong> {req.target}</p>
                  <p><strong>Abstract:</strong> {req.abstract}</p>
                  <p><strong>Submitted:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>
                  <div className="actions">
                    <button className="accept" onClick={() => handleAction(req._id, 'accept')}>Accept</button>
                    <button className="reject" onClick={() => handleAction(req._id, 'reject')}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeSection === 'paper-submission' && (
          <div className="uid-requests-container">
            <h2>Submitted Documents</h2>
            {submissions.length === 0 ? (
              <p>No document submissions found.</p>
            ) : (
              submissions.map(doc => (
                <div className="uid-request-card" key={doc._id}>
                  <h4>{doc.paperTitle}</h4>
                  <p><strong>UID:</strong> {doc.uid}</p>
                  <p><strong>Type:</strong> {doc.type}</p>
                  <p><strong>Target:</strong> {doc.target}</p>
                  <p><strong>Abstract:</strong>{doc.abstract}</p>
                  <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  <p><strong>Faculty: </strong> faculty2</p>
                  {/* <p><strong>Acceptance Letter:</strong> {doc.acceptanceLetter?.filename || "--"}</p> */}
                  {/* {doc.acceptanceLetter && doc.acceptanceLetter.filename && (
  <a
    href={`data:${doc.acceptanceLetter.contentType};base64,${doc.acceptanceLetter.base64}`}
    download={doc.acceptanceLetter.filename}
  >
    📥 Download Acceptance Letter
  </a>
)} */}
<p><strong>Indexing Proof</strong>
{doc.indexingProof && doc.indexingProof.filename && (
  <a
    href={`data:${doc.indexingProof.contentType};base64,${doc.indexingProof.base64}`}
    download={doc.indexingProof.filename}
  >
    📥 Download Indexing Proof
  </a>
)}</p>

{/* {doc.paymentReceipt && doc.paymentReceipt.filename && (
  <a
    href={`data:${doc.paymentReceipt.contentType};base64,${doc.paymentReceipt.base64}`}
    download={doc.paymentReceipt.filename}
  >
    📥 Download Payment Receipt
  </a>
)} */}



        <p><strong>ISSN:</strong> {doc.issn || 'N/A'}</p>

        <p>
          <strong>Scopus Link:</strong>{' '}
          {doc.scopusLink && doc.scopusLink.trim() !== '' ? (
            <a href={doc.scopusLink} target="_blank" rel="noopener noreferrer">
              🔗 View Scopus Link
            </a>
          ) : (
            'N/A'
          )}
        </p>




                  <div className="actions">
                    <button className="accept" onClick={() => handleDocumentAction(doc._id, 'accept')}>Accept</button>
                    <button className="reject" onClick={() => handleDocumentAction(doc._id, 'reject')}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      {activeSection === 'approved-pids' && (
  <div className="uid-requests-container">
    <h2>Approved PIDs</h2>
        <div className="search-bar">
  <input
    type="text"
    placeholder="Search by Faculty, Paper Title, UID or PID"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
    {/* Date range selectors */}
   
 <div className="date-range">
    <h7>
      From:
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
    </h7>
    <h7>
      To:
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </h7>
  </div>

    {/* Filter PIDs based on selected date range */}
    {(() => {
      // const filteredPids = approvedPids.filter(doc => {
      //   if (!startDate || !endDate) return true; // no filter if dates not selected
      //   const uploaded = new Date(doc.uploadedAt);
      //   return uploaded >= new Date(startDate) && uploaded <= new Date(endDate);

        const filteredPids = approvedPids.filter(doc => {
  // 1️⃣ Date filter
  const uploaded = new Date(doc.uploadedAt);
  if (startDate && endDate) {
    if (uploaded < new Date(startDate) || uploaded > new Date(endDate)) {
      return false;
    }
  }

  // 2️⃣ Search filter
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    if (
      !(doc.facultyId?.toLowerCase().includes(term) ||
        doc.paperTitle?.toLowerCase().includes(term) ||
        doc.uid?.toLowerCase().includes(term) ||
        doc.pid?.toLowerCase().includes(term))
    ) {
      return false;
    }
  }

  // 3️⃣ If it passed both filters
  return true;
});
      

      

      if (filteredPids.length === 0) {
        return <p>No approved documents found in this date range.</p>;
      }

      return filteredPids.map(doc => (
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
              📥 Download Acceptance Letter
            </a>
          </p>

          <p><strong>Indexing Proof:</strong>
            <a
              href={doc.indexingProof?.base64 ? `data:${doc.indexingProof?.contentType};base64,${doc.indexingProof?.base64}` : '#'}
              download={doc.indexingProof?.filename || "--"}
            >
              📥 Download Indexing Proof
            </a>
          </p>
        </div>
      ));
    })()}
  </div>
)}
        

        {/* {activeSection === 'approved-pids' && (
          <div className="uid-requests-container">
            <h2>Approved PIDs</h2>
            {approvedPids.length === 0 ? (
              <p>No approved documents found.</p>
            ) : (
              approvedPids.map(doc => (
                <div className="uid-request-card" key={doc._id}>
                  <h4>{doc.paperTitle}</h4>
                  <p><strong>Faculty:</strong> {doc.facultyId}</p>
                  <p><strong>PID:</strong> {doc.pid}</p>
                  <p><strong>UID:</strong> {doc.uid}</p>
                  <p><strong>Type:</strong> {doc.type}</p>
                  <p><strong>Abstract:</strong>{doc.abstract}</p>
                  <p><strong>Target:</strong> {doc.target}</p>
                  <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  
                  <p><strong>Acceptance Letter:</strong>
                  <a
                    href={doc.acceptanceLetter?.base64 ? `data:${doc.acceptanceLetter?.contentType};base64,${doc.acceptanceLetter?.base64}` : '#'}
                    download={doc.acceptanceLetter?.filename || "--"}
                  >
                    📥 Download Acceptance Letter
                  </a></p>

                <p><strong>Indexing Proof:</strong> 
                <a
                  href={doc.indexingProof?.base64 ? `data:${doc.indexingProof?.contentType};base64,${doc.indexingProof?.base64}` : '#'}
                  download={doc.indexingProof?.filename || "--"}
                >
                  📥 Download Indexing Proof
                </a></p>                  
                </div>
              ))
            )}
          </div>
        )} */}

        {activeSection === 'profile' && profile && (
          <div className="profile-section">
            <h2>Profile</h2>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone Number:</strong>{profile.phoneNumber}</p>
          </div>
        )}

        {activeSection === 'incentives' && <p>Incentives Pending Section</p>}
      </div>
    </div>
    </>
  );
}

// import React, { useEffect, useState } from 'react';
// import './HodDashboard.css'; // Reuse styles
// import logo from './logo2.jpeg';  // Adjust path as needed
// import { useNavigate } from 'react-router-dom';
// import CustomNavbar from './CustomNavbar'; // Import the custom navbar

// export default function RDDeanDashboard() {
//   const [activeSection, setActiveSection] = useState('faculty-uid');
//   const [approvedRequests, setApprovedRequests] = useState([]);
//   const [submissions, setSubmissions] = useState([]);
//   const [approvedPids, setApprovedPids] = useState([]);
//   const [profile, setProfile] = useState(null);
//   const navigate = useNavigate();

//   // Fetch Profile data (mock or API)
//   useEffect(() => {
//     // Replace with real API call if needed
//     setProfile({
//       name: 'R&D Admin',
//       email: 'admin@rnd.com',
//       phoneNumber:'6304702811',
//     });
//   }, []);

//   useEffect(() => {
//     if (activeSection === 'approved-pids') {
//       fetch('http://localhost:5000/api/admin/approved-pids')
//         .then(res => res.json())
//         .then(data => setApprovedPids(data))
//         .catch(err => {
//           console.error(err);
//           setApprovedPids([]);
//           alert('Failed to load approved PIDs.');
//         });
//     }
//   }, [activeSection]);

//   useEffect(() => {
//     if (activeSection === 'faculty-uid') {
//       fetch('http://localhost:5000/api/hod/uid-requests')
//         .then(res => res.json())
//         .then(data => {
//           const filtered = Array.isArray(data) ? data.filter(row => row.hodAccept && row.principalAccept && !row.adminAccept) : [];
//           setApprovedRequests(filtered);
//         })
//         .catch(err => {
//           console.error(err);
//           alert('Failed to load UID requests.');
//         });
//     }
//   }, [activeSection]);

//   useEffect(() => {
//     if (activeSection === 'paper-submission') {
//       fetch('http://localhost:5000/api/admin/all-submitted-documents')
//         .then(res => res.json())
//         .then(data => {
//           setSubmissions(data);
//         })
//         .catch(err => {
//           console.error(err);
//           setSubmissions([]);
//         });
//     }
//   }, [activeSection]);

//   const handleDocumentAction = async (id, status) => {
//     if (status === 'reject') {
//       const reason = prompt('Enter reason for rejection:');
//       if (!reason?.trim()) return alert('Rejection reason is required.');

//       try {
//         const res = await fetch(`http://localhost:5000/api/admin/document-submission/${id}/reject`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ reason })
//         });

//         const data = await res.json();
//         alert(data.message);
//         setSubmissions(prev => prev.filter(doc => doc._id !== id));
//       } catch (err) {
//         console.error(err);
//         alert('Failed to reject the document.');
//       }

//       return;
//     }

//     try {
//       const res = await fetch(`http://localhost:5000/api/admin/document-submission/${id}/accept`, {
//         method: 'PUT'
//       });

//       const data = await res.json();
//       alert(`${data.message} PID: ${data.pid}`);
//       setSubmissions(prev => prev.filter(doc => doc._id !== id));
//     } catch (err) {
//       console.error(err);
//       alert('Failed to process the document.');
//     }
//   };

//   const handleAction = async (id, status) => {
//     try {
//       let body = null;

//       if (status === 'reject') {
//         const reason = prompt('Enter reason for rejection:');
//         if (!reason?.trim()) return alert('Rejection reason is required.');
//         body = JSON.stringify({ reason });
//       }

//       const res = await fetch(`http://localhost:5000/api/admin/uid-request/${id}/${status}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body
//       });

//       const data = await res.json();
//       alert(data.message);
//       setApprovedRequests(prev => prev.filter(r => r._id !== id));
//     } catch (err) {
//       console.error(err);
//       alert('Action failed');
//     }
//   };

//   const handleLogout = () => {
//     // Clear any auth tokens/localStorage if used
//     // localStorage.removeItem('admin');
//     navigate('/login');
//   };

//   return (
//     <>
//       <CustomNavbar />
//     <div className="dashboard-container">
//       <div className="sidebar">
//        <div className="logo-section">
//           <img src={logo} alt="Logo" className="logo" />
//         </div>
//         <ul className="menu">
//           <li className={activeSection === 'faculty-uid' ? 'active' : ''} onClick={() => setActiveSection('faculty-uid')}>
//             🧾 Faculty UID Requests
//           </li>
//           <li className={activeSection === 'paper-submission' ? 'active' : ''} onClick={() => setActiveSection('paper-submission')}>
//             📝 Documents Submissions
//           </li>
//           <li className={activeSection === 'approved-pids' ? 'active' : ''} onClick={() => setActiveSection('approved-pids')}>
//             ✅ Approved PIDs
//           </li>
//           <li className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>
//             👤 Profile
//           </li>
//           <li onClick={handleLogout} style={{ cursor: 'pointer', color: 'white', marginTop: 'auto' }}>
//             🔚  Logout
//           </li>
//         </ul>
//       </div>

//       <div className="main-content">
//         {activeSection === 'faculty-uid' && (
//           <div className="uid-requests-container">
//             <h2>Pending UID Requests</h2>
//             {approvedRequests.length === 0 ? (
//               <p>No UID requests pending approval.</p>
//             ) : (
//               approvedRequests.map(req => (
//                 <div className="uid-request-card" key={req._id}>
//                   <h4>{req.paperTitle}</h4>
//                   <p><strong>Faculty:</strong> {req.facultyName} ({req.facultyId})</p>
//                   <p><strong>Dept:</strong> {req.department}</p>
//                   <p><strong>Type:</strong> {req.type}</p>
//                   <p><strong>Target:</strong> {req.target}</p>
//                   <p><strong>Abstract:</strong> {req.abstract}</p>
//                   <p><strong>Submitted:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>
//                   <div className="actions">
//                     <button className="accept" onClick={() => handleAction(req._id, 'accept')}>Accept</button>
//                     <button className="reject" onClick={() => handleAction(req._id, 'reject')}>Reject</button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         )}

//         {activeSection === 'paper-submission' && (
//           <div className="uid-requests-container">
//             <h2>Submitted Documents</h2>
//             {submissions.length === 0 ? (
//               <p>No document submissions found.</p>
//             ) : (
//               submissions.map(doc => (
//                 <div className="uid-request-card" key={doc._id}>
//                   <h4>{doc.paperTitle}</h4>
//                   <p><strong>UID:</strong> {doc.uid}</p>
//                   <p><strong>Type:</strong> {doc.type}</p>
//                   <p><strong>Target:</strong> {doc.target}</p>
//                   <p><strong>Abstract:</strong>{doc.abstract}</p>
//                   <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
//                   <p><strong>Faculty:</strong> {doc.facultyId}</p>
//                   <p><strong>Acceptance Letter:</strong> {doc.acceptanceLetter?.filename || "--"}</p>
//                   {doc.acceptanceLetter && doc.acceptanceLetter.filename && (
//   <a
//     href={`data:${doc.acceptanceLetter.contentType};base64,${doc.acceptanceLetter.base64}`}
//     download={doc.acceptanceLetter.filename}
//   >
//     📥 Download Acceptance Letter
//   </a>
// )}

// {doc.indexingProof && doc.indexingProof.filename && (
//   <a
//     href={`data:${doc.indexingProof.contentType};base64,${doc.indexingProof.base64}`}
//     download={doc.indexingProof.filename}
//   >
//     📥 Download Indexing Proof
//   </a>
// )}

// {doc.paymentReceipt && doc.paymentReceipt.filename && (
//   <a
//     href={`data:${doc.paymentReceipt.contentType};base64,${doc.paymentReceipt.base64}`}
//     download={doc.paymentReceipt.filename}
//   >
//     📥 Download Payment Receipt
//   </a>
// )}



// <p><strong>ISSN:</strong> {doc.issn || 'N/A'}</p>

// <p>
//   <strong>Scopus Link:</strong>{' '}
//   {doc.scopusLink && doc.scopusLink.trim() !== '' ? (
//     <a href={doc.scopusLink} target="_blank" rel="noopener noreferrer">
//       🔗 View Scopus Link
//     </a>
//   ) : (
//     'N/A'
//   )}
// </p>




//                   <div className="actions">
//                     <button className="accept" onClick={() => handleDocumentAction(doc._id, 'accept')}>Accept</button>
//                     <button className="reject" onClick={() => handleDocumentAction(doc._id, 'reject')}>Reject</button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         )}

//         {activeSection === 'approved-pids' && (
//           <div className="uid-requests-container">
//             <h2>Approved PIDs</h2>
//             {approvedPids.length === 0 ? (
//               <p>No approved documents found.</p>
//             ) : (
//               approvedPids.map(doc => (
//                 <div className="uid-request-card" key={doc._id}>
//                   <h4>{doc.paperTitle}</h4>
//                   <p><strong>PID:</strong> {doc.pid}</p>
//                   <p><strong>UID:</strong> {doc.uid}</p>
//                   <p><strong>Type:</strong> {doc.type}</p>
//                   <p><strong>Abstract:</strong>{doc.abstract}</p>
//                   <p><strong>Target:</strong> {doc.target}</p>
//                   <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
//                   <p><strong>Faculty:</strong> {doc.facultyId}</p>
//                   <p><strong>Acceptance Letter:</strong> {doc.acceptanceLetter?.filename || "--"}</p>
// <a
//   href={doc.acceptanceLetter?.base64 ? `data:${doc.acceptanceLetter?.contentType};base64,${doc.acceptanceLetter?.base64}` : '#'}
//   download={doc.acceptanceLetter?.filename || "--"}
// >
//   📥 Download Acceptance Letter
// </a>

// <p><strong>Indexing Proof:</strong> {doc.indexingProof?.filename || "--"}</p>
// <a
//   href={doc.indexingProof?.base64 ? `data:${doc.indexingProof?.contentType};base64,${doc.indexingProof?.base64}` : '#'}
//   download={doc.indexingProof?.filename || "--"}
// >
//   📥 Download Indexing Proof
// </a>

// <p><strong>Payment Receipt:</strong> {doc.paymentReceipt?.filename || 'N/A'}</p>
// {doc.paymentReceipt?.base64 && (
//   <a
//     href={`data:${doc.paymentReceipt?.contentType};base64,${doc.paymentReceipt?.base64}`}
//     download={doc.paymentReceipt?.filename || "--"}
//   >
//     📥 Download Payment Receipt
//   </a>
// )}

//                   {/* <p><strong>Acceptance Letter:</strong> {doc.acceptanceLetter.filename || "--"}</p>
//                   <a
//                     href={`data:${doc.acceptanceLetter.contentType};base64,${doc.acceptanceLetter.base64}`}
//                     download={doc.acceptanceLetter.filename || "--"}
//                   >
//                     📥 Download Acceptance Letter
//                   </a>

//                   <p><strong>Indexing Proof:</strong> {doc.indexingProof.filename || "--"}</p>
//                   <a
//                     href={`data:${doc.indexingProof.contentType};base64,${doc.indexingProof.base64}`}
//                     download={doc.indexingProof.filename || "--"

                    
//                     }
//                   >
//                     📥 Download Indexing Proof
//                   </a> */}
//                 </div>
//               ))
//             )}
//           </div>
//         )}

//         {activeSection === 'profile' && profile && (
//           <div className="profile-section">
//             <h2>Profile</h2>
//             <p><strong>Name:</strong> {profile.name}</p>
//             <p><strong>Email:</strong> {profile.email}</p>
//             <p><strong>Phone Number:</strong>{profile.phoneNumber}</p>
//           </div>
//         )}

//         {activeSection === 'incentives' && <p>Incentives Pending Section</p>}
//       </div>
//     </div>
//     </>
//   );
// }
