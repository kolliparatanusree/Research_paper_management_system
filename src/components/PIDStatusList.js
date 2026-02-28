import React, { useEffect, useState } from 'react';
import './FacultyDashboard.css';
import Swal from 'sweetalert2';
export default function PIDStatusList({ facultyId }) {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('approved'); // 'approved' | 'pending' | 'rejected'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchSubmissions = async () => {
Swal.fire({
  title: 'Loading...',
  html: `
    <div class="custom-spinner">
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
    <p>Fetching PID details, please wait...</p>
  `,
  showConfirmButton: false,
  allowOutsideClick: false,
  customClass: {
    popup: 'swal-loading-popup'
  }
});



//     Swal.fire({
//   title: 'Loading...',
//   html: `<div class="swal-loader">
//            Fetching PID details<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
//          </div>`,
//   allowOutsideClick: false,
//   didOpen: () => {
//     Swal.showLoading();
//   },
//   customClass: {
//     popup: 'swal-loading-popup',
//     title: 'swal-loading-title',
//     htmlContainer: 'swal-loading-text'
//   }
// });



    try {
      const res = await fetch(`http://localhost:5000/api/faculty/pid-status/${facultyId}`);
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching PID status:', err);
      Swal.fire({
  icon: 'error',
  title: 'Oops!',
  text: 'Failed to load PID details. Please try again.',
  confirmButtonText: 'OK',
  confirmButtonColor: '#e11d48', // red
  background: '#fff',
  color: '#111',
});

      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'Failed to load PID Details.'
      // });
    } finally {
      Swal.close(); // ✅ CLOSE LOADING
      setLoading(false);
    }
  };

  if (facultyId) {
    fetchSubmissions();
  }
}, [facultyId]);


  // useEffect(() => {
  //   const fetchSubmissions = async () => {
  //     setLoading(true); // Start loading
  //     try {
  //       const res = await fetch(`http://localhost:5000/api/faculty/pid-status/${facultyId}`);
  //       const data = await res.json();
  //       setSubmissions(data);
  //     } catch (err) {
  //       console.error('Error fetching PID status:', err);
  //     } finally {
  //       setLoading(false); // Done loading
  //     }
  //   };

  //   if (facultyId) {
  //     fetchSubmissions();
  //   }
  // }, [facultyId]);

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
          <p className="loading-text">
  
  <span className="dot one"></span>
  <span className="dot two"></span>
  <span className="dot three"></span>
</p>

          // <p className="loading-text">🌀 Loading.....<span className="dots"></span></p>
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
                <p style={{ color: 'orange' }}><strong>Status:</strong> Waiting for R&D dean review</p>
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
