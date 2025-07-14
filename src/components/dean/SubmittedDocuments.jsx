// 📄 src/components/SubmittedDocuments.js
import React from 'react';

export default function SubmittedDocuments({ documents }) {
  return (
    <div className="uid-requests-container">
      <h2>Submitted Documents</h2>
      {documents.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        documents.map(doc => (
          <div className="uid-request-card" key={doc._id}>
            <h4>{doc.paperTitle}</h4>
            <p><strong>UID:</strong> {doc.uid}</p>
            <p><strong>Type:</strong> {doc.type}</p>
            <p><strong>Target:</strong> {doc.target}</p>
            <p><strong>Abstract:</strong> {doc.abstract}</p>
            <p><strong>Faculty:</strong> {doc.facultyId}</p>

            <p><strong>Acceptance Letter:</strong> {doc.acceptanceLetter.filename}</p>
            <a
              href={`data:${doc.acceptanceLetter.contentType};base64,${doc.acceptanceLetter.base64}`}
              download={doc.acceptanceLetter.filename}
            >📥 Download</a>

            <p><strong>Indexing Proof:</strong> {doc.indexingProof.filename}</p>
            <a
              href={`data:${doc.indexingProof.contentType};base64,${doc.indexingProof.base64}`}
              download={doc.indexingProof.filename}
            >📥 Download</a>

            <button>Accept</button>
            <button>Reject</button>
          </div>
        ))
      )}
    </div>
  );
}
