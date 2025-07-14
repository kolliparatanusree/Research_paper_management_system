// 📄 src/components/UidRequests.js
import React from 'react';

export default function UidRequests({ uidRequests }) {
  return (
    <div className="uid-requests-container">
      <h2>Pending UID Requests</h2>
      {uidRequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        uidRequests.map(request => (
          <div className="uid-request-card" key={request._id}>
            <h4>{request.paperTitle}</h4>
            <p><strong>Author:</strong> {request.facultyId}</p>
            <p><strong>Type:</strong> {request.type}</p>
            <p><strong>Target:</strong> {request.target}</p>
            <p><strong>Abstract:</strong> {request.abstract}</p>
            <button>Accept</button>
            <button>Reject</button>
          </div>
        ))
      )}
    </div>
  );
}
