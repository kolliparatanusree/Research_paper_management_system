import React, { useEffect, useState } from 'react';
import './FacultyDashboard.css';
import Swal from 'sweetalert2';

export default function UIDStatusList({ facultyId }) {
  const [allRequests, setAllRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [filter, setFilter] = useState('approved'); // 'approved' | 'pending' | 'rejected'
  const [loading, setLoading] = useState(true);
  const [editingRequest, setEditingRequest] = useState(null);
const handleEdit = (req) => {
  console.log("EDIT CLICKED");
  setEditingRequest(req);
};

const handleUpdate = async () => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/faculty/uid-request/${editingRequest._id}/edit/${facultyId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRequest)
      }
    );

    const data = await res.json();

    Swal.fire('Success', data.message, 'success');

    setEditingRequest(null);

    // 🔥 refresh list
    setAllRequests(prev =>
      prev.map(r => (r._id === editingRequest._id ? editingRequest : r))
    );

  } catch (err) {
    Swal.fire('Error', 'Update failed', 'error');
  }
};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {
        // const res = await fetch('http://localhost:5000/api/hod/uid-requests');
        // const data = await res.json();
        // setAllRequests(data.filter(req => req.facultyId === facultyId));
        const res = await fetch(
  `http://localhost:5000/api/faculty/uid-requests/${facultyId}`
);
const data = await res.json();
setAllRequests(Array.isArray(data) ? data : []);



        const rejRes = await fetch(`http://localhost:5000/api/faculty/rejected-uids/${facultyId}`);
        const rejectedData = await rejRes.json();
        setRejectedRequests(rejectedData);
      } catch (err) {
  console.error('Error fetching UID status:', err);
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: 'Failed to load UID status. Please try again later.'
  });
}
finally {
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

              {/* ✏️ EDIT BUTTON — only before HOD accepts */}
{filter === 'pending' && !req.hodAccept && (
  <button
    className="edit-btn"
    onClick={() => handleEdit(req)}
    style={{ marginTop: '10px' }}
  >
    ✏️ Edit
  </button>
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
      {editingRequest && (
  <div className="modal-overlay">
    <div className="edit-modal-card">
      <h3>Edit UID Request</h3>

      <label>Paper Title</label>
      <input
        value={editingRequest.paperTitle}
        onChange={(e) =>
          setEditingRequest({
            ...editingRequest,
            paperTitle: e.target.value
          })
        }
      />

      <label>Abstract</label>
      <textarea
        value={editingRequest.abstract}
        onChange={(e) =>
          setEditingRequest({
            ...editingRequest,
            abstract: e.target.value
          })
        }
      />

      <label>Type</label>
      <input
        value={editingRequest.type || ""}
        onChange={(e) =>
          setEditingRequest({
            ...editingRequest,
            type: e.target.value
          })
        }
      />

      <label>Target</label>
      <input
        value={editingRequest.target || ""}
        onChange={(e) =>
          setEditingRequest({
            ...editingRequest,
            target: e.target.value
          })
        }
      />

      <div className="modal-actions">
        <button className="update-btn" onClick={handleUpdate}>
          ✅ Update
        </button>

        <button
          className="cancel-btn"
          onClick={() => setEditingRequest(null)}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
