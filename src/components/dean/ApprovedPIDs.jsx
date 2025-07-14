// 📄 src/components/ApprovedPids.js
import React from 'react';

export default function ApprovedPIDs({ approvedPids }) {
  return (
    <div className="uid-requests-container">
      <h2>Approved PIDs</h2>
      {approvedPids.length === 0 ? (
        <p>No approved documents found.</p>
      ) : (
        approvedPids.map(doc => (
          <div className="uid-request-card" key={doc._id}>
            <h4>{doc.paperTitle}</h4>
            <p><strong>PID:</strong> {doc.pid}</p>
            <p><strong>UID:</strong> {doc.uid}</p>
            <p><strong>Type:</strong> {doc.type}</p>
            <p><strong>Target:</strong> {doc.target}</p>
            <p><strong>Abstract:</strong> {doc.abstract}</p>
            <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
            <p><strong>Faculty:</strong> {doc.facultyId}</p>

            <p><strong>Acceptance Letter:</strong> {doc.acceptanceLetter.filename}</p>
            <a
              href={`data:${doc.acceptanceLetter.contentType};base64,${doc.acceptanceLetter.base64}`}
              download={doc.acceptanceLetter.filename}
            >📥 Download Acceptance Letter</a>

            <p><strong>Indexing Proof:</strong> {doc.indexingProof.filename}</p>
            <a
              href={`data:${doc.indexingProof.contentType};base64,${doc.indexingProof.base64}`}
              download={doc.indexingProof.filename}
            >📥 Download Indexing Proof</a>
          </div>
        ))
      )}
    </div>
  );
}
