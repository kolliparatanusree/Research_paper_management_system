import React, { useEffect, useState } from "react";
import "./UIDStatusList.css";
import Swal from "sweetalert2";

export default function UIDStatusList({ facultyId }) {
  const [allRequests, setAllRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [filter, setFilter] = useState("approved");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRequest, setEditingRequest] = useState(null);

  const itemsPerPage = 5;

  /* ---------- SAFE TEXT HELPER ---------- */
  const safeText = (value) => {
    if (!value) return "";
    if (typeof value !== "string") return "";
    // prevent accidental JS expressions stored as string
    if (value.includes("=>") || value.includes("map(")) return "";
    return value;
  };

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/faculty/uid-requests/${facultyId}`
        );
        const data = await res.json();
        setAllRequests(Array.isArray(data) ? data : []);

        const rejRes = await fetch(
          `http://localhost:5000/api/faculty/rejected-uids/${facultyId}`
        );
        const rejectedData = await rejRes.json();
        setRejectedRequests(rejectedData);
      } catch (err) {
        Swal.fire("Error", "Failed to load UID status", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [facultyId]);

  useEffect(() => setCurrentPage(1), [filter]);

  /* ---------- FILTER ---------- */
  const filteredRequests = () => {
    if (filter === "approved")
      return allRequests.filter(
        (r) => r.hodAccept && r.principalAccept && r.adminAccept && r.uid
      );

    if (filter === "pending")
      return allRequests.filter(
        (r) => !(r.hodAccept && r.principalAccept && r.adminAccept && r.uid)
      );

    if (filter === "rejected") return rejectedRequests;

    return [];
  };

  const getStatusLabel = (value) =>
    value ? (
      <span style={{ color: "green" }}>✅ Approved</span>
    ) : (
      <span style={{ color: "orange" }}>⌛ Pending</span>
    );

  const filtered = filteredRequests();

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* ---------- UPDATE ---------- */
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/faculty/uid-request/${editingRequest._id}/edit/${facultyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingRequest),
        }
      );

      const data = await res.json();
      Swal.fire("Success", data.message, "success");

      setAllRequests((prev) =>
        prev.map((r) =>
          r._id === editingRequest._id ? editingRequest : r
        )
      );

      setEditingRequest(null);
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  return (
    <div>
      {/* ---------- FILTER BUTTONS ---------- */}
      <div className="filter-buttons">
        <button
          onClick={() => setFilter("approved")}
          className={filter === "approved" ? "active" : ""}
        >
          ✅ Approved UIDs
        </button>

        <button
          onClick={() => setFilter("pending")}
          className={filter === "pending" ? "active" : ""}
        >
          ⌛ Pending UIDs
        </button>

        <button
          onClick={() => setFilter("rejected")}
          className={filter === "rejected" ? "active" : ""}
        >
          ❌ Rejected UIDs
        </button>
      </div>

      {/* ---------- LIST ---------- */}
      <div className="uid-status-list">
        {loading ? (
          <p className="loading-text">🌀 Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No {filter} requests found.</p>
        ) : (
          paginatedData.map((req) => (
            <div key={req._id} className="uid-status-card">
              
              {/* TITLE */}
              <p className="paper-title">
                {safeText(req.paperTitle) || "Untitled Paper"}
              </p>

              <p>
                <strong>Type:</strong> {safeText(req.type)}
              </p>

              <p>
                <strong>Target:</strong> {safeText(req.target)}
              </p>

              {/* CO AUTHORS */}
              {req.coAuthors?.hasCoAuthors &&
                req.coAuthors.authors?.length > 0 && (
                  <div>
                    <strong>Co Authors:</strong>
                    <ul>
                      {req.coAuthors.authors.map((a, i) => (
                        <li key={i}>
                          {safeText(a.name)} (
                          {a.affiliation === "Other"
                            ? safeText(a.otherAffiliation)
                            : safeText(a.affiliation)}
                          )
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <p>
                <strong>Abstract:</strong>{" "}
                {safeText(req.abstract)}
              </p>

              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(req.submittedAt).toLocaleDateString()}
              </p>

              {req.uid && (
                <p>
                  <strong>UID:</strong> {req.uid}
                </p>
              )}

              {/* STATUS */}
              {filter === "pending" && (
                <>
                  <p>
                    <strong>HOD:</strong>{" "}
                    {getStatusLabel(req.hodAccept)}
                  </p>
                  <p>
                    <strong>Principal:</strong>{" "}
                    {getStatusLabel(req.principalAccept)}
                  </p>
                  <p>
                    <strong>Admin:</strong>{" "}
                    {getStatusLabel(req.adminAccept)}
                  </p>

                  {!req.hodAccept && (
                    <button
                      className="edit-btn1"
                      onClick={() => setEditingRequest(req)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </>
              )}

              {/* REJECTED */}
              {filter === "rejected" && (
                <>
                  <p style={{ color: "red" }}>
                    <strong>Reason:</strong> {req.reason}
                  </p>
                  <p>
                    <strong>Rejected By:</strong>{" "}
                    {req.rejectedBy?.toUpperCase()}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* ---------- PAGINATION ---------- */}
      {!loading && filtered.length > itemsPerPage && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ⬅️ Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active-page" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ➡️
          </button>
        </div>
      )}

      {/* ---------- EDIT MODAL ---------- */}
      {editingRequest && (
        <div className="modal-overlay">
          <div className="edit-modal-card">
            <h3>Edit UID Request</h3>

            <label>Paper Title</label>
            <input
              value={editingRequest.paperTitle || ""}
              onChange={(e) =>
                setEditingRequest({
                  ...editingRequest,
                  paperTitle: e.target.value,
                })
              }
            />

            <label>Abstract</label>
            <textarea
              value={editingRequest.abstract || ""}
              onChange={(e) =>
                setEditingRequest({
                  ...editingRequest,
                  abstract: e.target.value,
                })
              }
            />

            <label>Target</label>
            <input
              value={editingRequest.target || ""}
              onChange={(e) =>
                setEditingRequest({
                  ...editingRequest,
                  target: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button
                className="update-btn"
                onClick={handleUpdate}
              >
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

// import React, { useEffect, useState } from 'react';
// import './UIDStatusList.css';
// import Swal from 'sweetalert2';

// export default function UIDStatusList({ facultyId }) {
//   const [allRequests, setAllRequests] = useState([]);
//   const [rejectedRequests, setRejectedRequests] = useState([]);
//   const [filter, setFilter] = useState('approved'); // 'approved' | 'pending' | 'rejected'
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
// const itemsPerPage = 5; // change as needed
//   const [editingRequest, setEditingRequest] = useState(null);
// const handleEdit = (req) => {
//   console.log("EDIT CLICKED");
//   setEditingRequest(req);
// };

// const handleUpdate = async () => {
//   try {
//     const res = await fetch(
//       `http://localhost:5000/api/faculty/uid-request/${editingRequest._id}/edit/${facultyId}`,
//       {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editingRequest)
//       }
//     );

//     const data = await res.json();

//     Swal.fire('Success', data.message, 'success');

//     setEditingRequest(null);

//     // 🔥 refresh list
//     setAllRequests(prev =>
//       prev.map(r => (r._id === editingRequest._id ? editingRequest : r))
//     );

//   } catch (err) {
//     Swal.fire('Error', 'Update failed', 'error');
//   }
// };

// useEffect(() => {
//   setCurrentPage(1);
// }, [filter]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true); // Start loading
//       try {
//         // const res = await fetch('http://localhost:5000/api/hod/uid-requests');
//         // const data = await res.json();
//         // setAllRequests(data.filter(req => req.facultyId === facultyId));
//         const res = await fetch(
//   `http://localhost:5000/api/faculty/uid-requests/${facultyId}`
// );
// const data = await res.json();
// setAllRequests(Array.isArray(data) ? data : []);



//         const rejRes = await fetch(`http://localhost:5000/api/faculty/rejected-uids/${facultyId}`);
//         const rejectedData = await rejRes.json();
//         setRejectedRequests(rejectedData);
//       } catch (err) {
//   console.error('Error fetching UID status:', err);
//   Swal.fire({
//     icon: 'error',
//     title: 'Error',
//     text: 'Failed to load UID status. Please try again later.'
//   });
// }
// finally {
//         setLoading(false); // Done loading
//       }
//     };

//     fetchData();
//   }, [facultyId]);

//   const filteredRequests = () => {
//     if (filter === 'approved') {
//       return allRequests.filter(req => req.hodAccept && req.principalAccept && req.adminAccept && req.uid);
//     }
//     if (filter === 'pending') {
//       return allRequests.filter(req =>
//         !(req.hodAccept && req.principalAccept && req.adminAccept && req.uid)
//       );
//     }
//     if (filter === 'rejected') {
//       return rejectedRequests;
//     }
//     return [];
//   };

//   const getStatusLabel = (value) => {
//     return value ? <span style={{ color: 'green' }}>✅ Approved</span> : <span style={{ color: 'orange' }}>⌛ Pending</span>;
//   };

//   const filtered = filteredRequests();



// // Pagination calculations
// const totalPages = Math.ceil(filtered.length / itemsPerPage);

// const startIndex = (currentPage - 1) * itemsPerPage;
// const paginatedData = filtered.slice(
//   startIndex,
//   startIndex + itemsPerPage
// );

//   return (
//     <div>
//       <div className="filter-buttons">
//         <button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'active' : ''}>✅Approved UIDs</button>
//         <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>⌛Pending UIDs</button>
//         <button onClick={() => setFilter('rejected')} className={filter === 'rejected' ? 'active' : ''}>❌Rejected UIDs</button>
//       </div>

//       <div className="uid-status-list">
//         {loading ? (
//           <p className="loading-text">🌀 Loading......<span className="dots"></span></p>
//         ) : filtered.length === 0 ? (
//           <p>No {filter} requests found.</p>
//         ) : (
//           paginatedData.map(req => (
//             <div key={req._id} className="uid-status-card">
//               <p style={{ color: 'blue', fontSize: '23px' }}>{req.paperTitle}</p>
//               <p><strong>Type:</strong> {req.type}</p>
//               <p><strong>Target:</strong> {req.target}</p>
//                             {/* Co Authors */}
//               {req.coAuthors?.hasCoAuthors && req.coAuthors.authors.length > 0 && (
//                 <div style={{ marginTop: "8px" }}>
//                   <strong>Co Authors:</strong>
//                   <ul>
//                     {req.coAuthors.authors.map((author, index) => (
//                       // <li key={index}>
//                       //   {author.name} ({author.affiliation})
//                       // </li>

//                       <li key={index}>
//                 {author.name} (
//                 {author.affiliation === "Other"
//                   ? author.otherAffiliation
//                   : author.affiliation}
//                 )
//               </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//               <p><strong>Abstract:</strong> {req.abstract}</p>
//               <p><strong>Submitted:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>

//               {/* Approved UID */}
//               {req.uid && <p><strong>UID:</strong> {req.uid}</p>}

//               {/* Pending Section */}
//               {filter === 'pending' && (
//                 <div style={{ marginTop: '10px' }}>
//                   <p><strong>HOD Status:</strong> {getStatusLabel(req.hodAccept)}</p>
//                   <p><strong>Principal Status:</strong> {getStatusLabel(req.principalAccept)}</p>
//                   <p><strong>Admin Status:</strong> {getStatusLabel(req.adminAccept)}</p>
//                 </div>
//               )}

//               {/* ✏️ EDIT BUTTON — only before HOD accepts */}
//               {filter === 'pending' && !req.hodAccept && (
//                 <button
//                   className="edit-btn"
//                   onClick={() => handleEdit(req)}
//                   style={{ marginTop: '10px' }}
//                 >
//                   ✏️ Edit
//                 </button>
//               )}

//               {/* Rejected Section */}
//               {filter === 'rejected' && (
//                 <>
//                   <p style={{ color: 'red' }}><strong>Reason:</strong> {req.reason}</p>
//                   <p><strong>Rejected By:</strong> {req.rejectedBy?.toUpperCase()}</p>
//                 </>
//               )}
//             </div>
//           ))
//         )}
//       </div>{!loading && filtered.length > itemsPerPage && (
//   <div className="pagination">

//     <button
//       disabled={currentPage === 1}
//       onClick={() => setCurrentPage(prev => prev - 1)}
//     >
//       ⬅️ Previous
//     </button>

//     {Array.from({ length: totalPages }, (_, i) => (
//       <button
//         key={i}
//         className={currentPage === i + 1 ? "active-page" : ""}
//         onClick={() => setCurrentPage(i + 1)}
//       >
//         {i + 1}
//       </button>
//     ))}

//     <button
//       disabled={currentPage === totalPages}
//       onClick={() => setCurrentPage(prev => prev + 1)}
//     >
//       Next ➡️
//     </button>

//   </div>
// )}

//       {editingRequest && (
//   <div className="modal-overlay">
//     <div className="edit-modal-card">
//       <h3>Edit UID Request</h3>

//       <label>Paper Title</label>
//       <input
//         value={editingRequest.paperTitle}
//         onChange={(e) =>
//           setEditingRequest({
//             ...editingRequest,
//             paperTitle: e.target.value
//           })
//         }
//       />

//       <label>Abstract</label>
//       <textarea
//         value={editingRequest.abstract}
//         onChange={(e) =>
//           setEditingRequest({
//             ...editingRequest,
//             abstract: e.target.value
//           })
//         }
//       />

//      <label>Type of Publication</label><br/>
// <select
//   value={editingRequest.type || ""}
//   onChange={(e) =>
//     setEditingRequest({
//       ...editingRequest,
//       type: e.target.value
//     })
//   }
// >
//   <option value="">Type of Publication</option>
//   <option value="Journal">Journal</option>
//   <option value="Conference">Conference</option>
//   <option value="Book Chapter">Book Chapter</option>
//   <option value="Book">Book</option>
//   <option value="Patent">Patent</option>
// </select> <br></br>
      

//       <label>Target</label>
//       <input
//         value={editingRequest.target || ""}
//         onChange={(e) =>
//           setEditingRequest({
//             ...editingRequest,
//             target: e.target.value
//           })
//         }
//       />

//       {/* Co Authors */}
// <label>Co Authors</label>

// {editingRequest.coAuthors?.authors?.map((author, index) => (
//   <div key={index} style={{ marginBottom: "8px" }}>
    
//     <input
//       placeholder="Name"
//       value={author.name}
//       onChange={(e) => {
//         const updatedAuthors = [...editingRequest.coAuthors.authors];
//         updatedAuthors[index].name = e.target.value;

//         setEditingRequest({
//           ...editingRequest,
//           coAuthors: {
//             ...editingRequest.coAuthors,
//             authors: updatedAuthors
//           }
//         });
//       }}
//     />

//     <select
//   value={author.affiliation || ""}
//   onChange={(e) => {
//     const updatedAuthors = [...editingRequest.coAuthors.authors];
//     updatedAuthors[index].affiliation = e.target.value;

//     setEditingRequest({
//       ...editingRequest,
//       coAuthors: {
//         ...editingRequest.coAuthors,
//         authors: updatedAuthors
//       }
//     });
//   }}
// >

//   <option value="">Select Affiliation</option>
//   <option value="SVECW">SVECW</option>
//   <option value="VIT">VIT</option>
//   <option value="BVRITH">BVRITH</option>
//   <option value="BVRITN">BVRITN</option>
//   <option value="Other">Other</option>

// </select>
// {author.affiliation === "Other" && (
//   <input
//     placeholder="Enter College Name"
//     value={author.otherAffiliation || ""}
//     onChange={(e) => {
//       const updatedAuthors = [...editingRequest.coAuthors.authors];
//       updatedAuthors[index].otherAffiliation = e.target.value;

//       setEditingRequest({
//         ...editingRequest,
//         coAuthors: {
//           ...editingRequest.coAuthors,
//           authors: updatedAuthors
//         }
//       });
//     }}
//   />
// )}


//     <button
//       onClick={() => {
//         const updatedAuthors = editingRequest.coAuthors.authors.filter(
//           (_, i) => i !== index
//         );

//         setEditingRequest({
//           ...editingRequest,
//           coAuthors: {
//             ...editingRequest.coAuthors,
//             authors: updatedAuthors
//           }
//         });
//       }}
//     >
//       ❌
//     </button>

//   </div>
// ))}



//       <div className="modal-actions">
//         <button
//   onClick={() => {
//     const updatedAuthors = [
//       ...(editingRequest.coAuthors?.authors || []),
//       { name: "", affiliation: "" }
//     ];

//     setEditingRequest({
//       ...editingRequest,
//       coAuthors: {
//         hasCoAuthors: true,
//         authors: updatedAuthors
//       }
//     });
//   }}
// >
// ➕ Add Co Author
// </button>
//         <button className="update-btn" onClick={handleUpdate}>
//           ✅ Update
//         </button>

//         <button
//           className="cancel-btn"
//           onClick={() => setEditingRequest(null)}
//         >
//           ❌ Cancel
//         </button>
//       </div>
//     </div>
//   </div>
// )}
//     </div>
//   );
// }
