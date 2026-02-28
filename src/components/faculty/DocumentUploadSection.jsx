/* File: src/components/faculty/DocumentUploadSection.jsx */
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function DocumentUploadSection({ userId }) {
    const [approvedUIDs, setApprovedUIDs] = useState([]);
    const [uploadedUIDs, setUploadedUIDs] = useState([]);
    const [documents, setDocuments] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingUid, setLoadingUid] = useState(null);
    const [publishedPaperPdf, setPublishedPaperPdf] = useState(null);


//     useEffect(() => {
//   if (!userId) {
//     console.warn("userId not available yet");
//     return;
//   }

//   fetchApprovedUIDs();
//   fetchUploadedUIDs();
// }, [userId]);


    useEffect(() => {
        const fetchApprovedUIDs = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/faculty/approved-uid-requests/${userId}`);
                const data = await res.json();
                setApprovedUIDs(data);
            } catch (err) {
                console.error('Error fetching approved UID requests:', err);
            }
        };

        const fetchUploadedUIDs = async () => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/faculty/uploaded-uids/${userId}`
    );
    const data = await response.json();

    // Backend returns an array of uploaded documents
    setUploadedUIDs(data || []); 
  } catch (error) {
    console.error('Error fetching uploaded UIDs:', error);
  }
};


        fetchApprovedUIDs();
        fetchUploadedUIDs();
    }, [userId]);

    const handleFileChange = (uid, field, value) => {
        setDocuments((prev) => ({
            ...prev,
            [uid]: {
                ...prev[uid],
                [field]: value
            }
        }));
    };

    const handleDocumentUpload = async (uid) => {
        setLoadingUid(uid);
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('uid', uid);

        const docData = documents[uid] || {};
        if (docData?.indexingProof) formData.append('indexingProof', docData.indexingProof);
        if (docData?.paymentReceipt) formData.append('paymentReceipt', docData.paymentReceipt);
        formData.append('scopusLink', docData?.scopusLink || '');
        formData.append('issn', docData?.issn || '');
        formData.append('doi', docData?.doi || '');
        // formData.append("publishedPaperPdf", publishedPaperPdf);
        if (docData?.publishedPaperPdf) {
  formData.append('publishedPaperPdf', docData.publishedPaperPdf);
}


        try {
            const res = await fetch('http://localhost:5000/api/faculty/upload-documents', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            
             Swal.fire({
            title: 'Upload Successful!',
            text: data?.message || 'Your documents have been uploaded.',
            icon: 'success',
            confirmButtonText: 'OK'
        });
            // alert(data?.message || 'Upload successful');
            setDocuments((prev) => ({
                ...prev,
                [uid]: { issn: '', scopusLink: '', doi: '', acceptanceLetter: null, indexingProof: null, paymentReceipt: null }
            }));
            setApprovedUIDs((prev) => prev.filter((r) => r.uid !== uid));
        } catch (err) {
            console.error(err);
            Swal.fire({
            title: 'Upload Failed',
            text: err?.message || 'Something went wrong while uploading documents.',
            icon: 'error',
            confirmButtonText: 'Retry'
        });
            // alert('Upload failed');
        } finally {
            setLoadingUid(null);
        }
    };

   console.log("DocumentUploadSection userId:", userId);

// Map uploadedUIDs to just UID strings
const uploadedUIDStrings = uploadedUIDs.map((u) => u.uid);

const filteredApprovedUIDs = approvedUIDs
    .filter((uid) => !uploadedUIDStrings.includes(uid.uid)) // exclude uploaded
    .filter((uid) => {
        const q = searchQuery.toLowerCase();
        return (
            uid.uid?.toLowerCase().includes(q) ||
            uid.paperTitle?.toLowerCase().includes(q) ||
            uid.type?.toLowerCase().includes(q) ||
            uid.target?.toLowerCase().includes(q)
        );
    });

console.log("Uploaded UIDs:", uploadedUIDs);

    return (
        <div className="approved-uid-section">
            {approvedUIDs.length > 0 && (
                <input
                    type="text"
                    placeholder="Search UID by UID, title, type, target..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', fontSize: '16px' }}
                />
            )}

            {filteredApprovedUIDs.length === 0 ? (
                <p>No approved UID requests found.</p>
            ) : (
                filteredApprovedUIDs.map((uid) => (
                    <div key={uid._id} className="uid-card">
                        <p><strong>Paper Title:</strong> {uid.paperTitle}</p>
                        <p><strong>UID:</strong> {uid.uid}</p>
                        <p><strong>Type:</strong> {uid.type}</p>
                        <p><strong>Abstract:</strong> {uid.abstract}</p>
                        <p><strong>Target:</strong> {uid.target}</p>
                        <label>ISSN</label>
                        <input
                            type="text"
                            placeholder="Enter ISSN"
                            value={documents[uid.uid]?.issn || ''}
                            onChange={(e) => handleFileChange(uid.uid, 'issn', e.target.value)}
                        />
                        <div>
                        <label>Scopus link</label>
                        <input
                            type="text"
                            placeholder="Enter Scopus Link"
                            value={documents[uid.uid]?.scopusLink || ''}
                            onChange={(e) => handleFileChange(uid.uid, 'scopusLink', e.target.value)}
                        />
                        </div>
                        <label>DOI</label>
                        <input
                            type="text"
                            placeholder="Enter DOI"
                            value={documents[uid.uid]?.doi || ''}
                            onChange={(e) => handleFileChange(uid.uid, 'doi', e.target.value)}
                        />

                        <div className="form-group">
                            <label>💳 Payment Receipt (PDF only)</label>
                            <input type="file" accept=".pdf" onChange={(e) => handleFileChange(uid.uid, 'paymentReceipt', e.target.files[0])} />
                        </div>


                        <div className="form-group">
                            <label>📑 Indexing Proof (PDF only)</label>
                            <input type="file" accept=".pdf" onChange={(e) => handleFileChange(uid.uid, 'indexingProof', e.target.files[0])} />
                        </div>
                        <div>
                        <label>📄 Published Paper PDF (PDF only)</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => handleFileChange(uid.uid, 'publishedPaperPdf', e.target.files[0])}
                            />

                        </div>

                        <button onClick={() => handleDocumentUpload(uid.uid)} disabled={loadingUid === uid.uid}>
                            {loadingUid === uid.uid ? 'Uploading...' : 'Submit Documents'}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}



// /* File: src/components/faculty/DocumentUploadSection.jsx */
// import React, { useEffect, useState } from 'react';

// export default function DocumentUploadSection({ facultyId }) {
//     const [approvedUIDs, setApprovedUIDs] = useState([]);
//     const [uploadedUIDs, setUploadedUIDs] = useState([]);
//     const [documents, setDocuments] = useState({});
//     const [searchQuery, setSearchQuery] = useState('');
//     const [loadingUid, setLoadingUid] = useState(null);

//     useEffect(() => {
//         const fetchApprovedUIDs = async () => {
//             try {
//                 const res = await fetch(`http://localhost:5000/api/faculty/approved-uid-requests/${facultyId}`);
//                 const data = await res.json();
//                 setApprovedUIDs(data);
//             } catch (err) {
//                 console.error('Error fetching approved UID requests:', err);
//             }
//         };

//         const fetchUploadedUIDs = async () => {
//             try {
//                 const response = await fetch(`/api/faculty/fetch-uploads/${facultyId}`);
//                 const data = await response.json();
//                 setUploadedUIDs(data.uploadedUIDs || []);
//             } catch (error) {
//                 console.error('Error fetching uploaded UIDs:', error);
//             }
//         };

//         fetchApprovedUIDs();
//         fetchUploadedUIDs();
//     }, [facultyId]);

//     const handleFileChange = (uid, field, value) => {
//         setDocuments((prev) => ({
//             ...prev,
//             [uid]: {
//                 ...prev[uid],
//                 [field]: value
//             }
//         }));
//     };

//     const handleDocumentUpload = async (uid) => {
//         setLoadingUid(uid);
//         const formData = new FormData();
//         formData.append('facultyId', facultyId);
//         formData.append('uid', uid);

//         const docData = documents[uid] || {};
//         if (docData?.acceptanceLetter) formData.append('acceptanceLetter', docData.acceptanceLetter);
//         if (docData?.indexingProof) formData.append('indexingProof', docData.indexingProof);
//         if (docData?.paymentReceipt) formData.append('paymentReceipt', docData.paymentReceipt);
//         formData.append('scopusLink', docData?.scopusLink || '');
//         formData.append('issn', docData?.issn || '');

//         try {
//             const res = await fetch('http://localhost:5000/api/faculty/upload-documents', {
//                 method: 'POST',
//                 body: formData
//             });

//             const data = await res.json();
//             alert(data?.message || 'Upload successful');
//             setDocuments((prev) => ({
//                 ...prev,
//                 [uid]: { issn: '', scopusLink: '', acceptanceLetter: null, indexingProof: null, paymentReceipt: null }
//             }));
//             setApprovedUIDs((prev) => prev.filter((r) => r.uid !== uid));
//         } catch (err) {
//             console.error(err);
//             alert('Upload failed');
//         } finally {
//             setLoadingUid(null);
//         }
//     };

//     const filteredApprovedUIDs = approvedUIDs
//         .filter((uid) => !uploadedUIDs.includes(uid.uid))
//         .filter((uid) => {
//             const q = searchQuery.toLowerCase();
//             return (
//                 uid.uid?.toLowerCase().includes(q) ||
//                 uid.paperTitle?.toLowerCase().includes(q) ||
//                 uid.type?.toLowerCase().includes(q) ||
//                 uid.target?.toLowerCase().includes(q)
//             );
//         });

//     return (
//         <div className="approved-uid-section">
//             {approvedUIDs.length > 0 && (
//                 <input
//                     type="text"
//                     placeholder="Search UID by UID, title, type, target..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', fontSize: '16px' }}
//                 />
//             )}

//             {filteredApprovedUIDs.length === 0 ? (
//                 <p>No approved UID requests found.</p>
//             ) : (
//                 filteredApprovedUIDs.map((uid) => (
//                     <div key={uid._id} className="uid-card">
//                         <p><strong>Paper Title:</strong> {uid.paperTitle}</p>
//                         <p><strong>UID:</strong> {uid.uid}</p>
//                         <p><strong>Type:</strong> {uid.type}</p>
//                         <p><strong>Abstract:</strong> {uid.abstract}</p>
//                         <p><strong>Target:</strong> {uid.target}</p>

//                         <input type="text" placeholder="Enter ISSN" value={documents[uid.uid]?.issn || ''} onChange={(e) => handleFileChange(uid.uid, 'issn', e.target.value)} />
//                         <input type="text" placeholder="Enter Scopus Link" value={documents[uid.uid]?.scopusLink || ''} onChange={(e) => handleFileChange(uid.uid, 'scopusLink', e.target.value)} />

//                         <div className="form-group">
//                             <label>💳 Payment Receipt</label>
//                             <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(uid.uid, 'paymentReceipt', e.target.files[0])} />
//                         </div>

//                         <div className="form-group">
//                             <label>📄 Acceptance Letter</label>
//                             <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(uid.uid, 'acceptanceLetter', e.target.files[0])} />
//                         </div>

//                         <div className="form-group">
//                             <label>📑 Indexing Proof</label>
//                             <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(uid.uid, 'indexingProof', e.target.files[0])} />
//                         </div>

//                         <button onClick={() => handleDocumentUpload(uid.uid)} disabled={loadingUid === uid.uid}>
//                             {loadingUid === uid.uid ? 'Uploading...' : 'Submit Documents'}
//                         </button>
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// }
