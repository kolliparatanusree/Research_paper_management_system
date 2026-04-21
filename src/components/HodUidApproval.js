import React, { useEffect, useState } from 'react';
import './HodUidApproval.css';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function HodUidApproval({ hodId: propHodId }){
  const [requests, setRequests] = useState([]);
  const [department, setDepartment] = useState('hod');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
const [filterType, setFilterType] = useState("all");
const [sortOrder, setSortOrder] = useState("latest");
  const hodId = propHodId || JSON.parse(localStorage.getItem("user"))?.userId;
  


  useEffect(() => {
  const fetchHodAndRequests = async () => {
    if (!hodId) {
      alert('HoD not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 🔹 Fetch HOD details
      const hodRes = await fetch(`http://localhost:5000/api/hod/profile/${hodId}`);
      const hodData = await hodRes.json();
      setDepartment(hodData.department);

      // 🔹 Fetch UID Requests
      const requestRes = await fetch(
        `http://localhost:5000/api/hod/uid-requests/${hodId}`
      );

      if (!requestRes.ok) {
        throw new Error('Failed to fetch UID requests');
      }

      const deptRequests = await requestRes.json();

      // 🔥 MAIN DATA
      setRequests(deptRequests);

      // 🔥 IMPORTANT (for search / filter / sort)
      // setFilteredRequests(deptRequests);

    } catch (err) {
      console.error('Error fetching UID requests:', err);
      alert('Failed to load UID requests');
    } finally {
      setLoading(false);
    }
  };

  fetchHodAndRequests();
}, [hodId]);


  const handleAction = async (id, status) => {
  try {
    let url = `http://localhost:5000/api/hod/uid-request/${id}/accept/${hodId}`;
    // let url = `http://localhost:5000/api/hod/uid-request/${id}/${status}`;
    let body = null;

    if (status === 'reject') {
      const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
      if (!finalReason) return Swal.fire('Error', 'Please provide a reason', 'error');
        url = `http://localhost:5000/api/hod/uid-request/${id}/reject/${hodId}`;
      // url = `http://localhost:5000/api/hod/uid-request/${id}/reject`;
      body = JSON.stringify({ reason: finalReason });
    }

    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
    const data = await res.json();

    Swal.fire('Success', data.message, 'success');
    setRequests(prev => prev.filter(r => r._id !== id));
    setRejectingId(null);
    setRejectReason('');
    setCustomReason('');
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Action failed', 'error');
  }
};

  const rejectionOptions = [
    'Insufficient Details',
    'Not Relevant to Department',
    'Duplicate Submission',
    'Unclear Abstract',
    'Other'
  ];

  const filteredRequests = requests
  .filter((req) => {
    const searchMatch =
      req.paperTitle?.toLowerCase().includes(search.toLowerCase()) ||
      req.facultyName?.toLowerCase().includes(search.toLowerCase());

    const typeMatch =
      filterType === "all" || req.type === filterType;

    return searchMatch && typeMatch;
  })
  .sort((a, b) => {
    if (sortOrder === "latest") {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    } else {
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    }
  });


const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("UID Requests");

  // 🔥 HEADERS
  sheet.columns = [
    { header: "Paper Title", key: "paperTitle", width: 30 },
    { header: "Faculty Name", key: "facultyName", width: 25 },
    { header: "Faculty ID", key: "facultyId", width: 20 },
    { header: "Department", key: "department", width: 20 },
    { header: "Type", key: "type", width: 15 },
    { header: "Target", key: "target", width: 20 },
    { header: "Submitted Date", key: "submittedAt", width: 20 },
  ];

  // 🔥 STYLE HEADER ROW
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1F4E79" }, // dark blue
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // 🔥 ADD DATA
  filteredRequests.forEach((req) => {
    sheet.addRow({
      paperTitle: req.paperTitle,
      facultyName: req.facultyName,
      facultyId: req.facultyId,
      department: req.department,
      type: req.type,
      target: req.target,
      submittedAt: new Date(req.submittedAt).toLocaleDateString(),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `UID_Requests_${department}.xlsx`);
};

const exportPDF = () => {
  const doc = new jsPDF();

  doc.text(`UID REQUEST REPORT - ${department}`, 14, 10);

  const tableData = filteredRequests.map((req) => [
    req.paperTitle,
    req.facultyName,
    req.facultyId,
    req.type,
    req.target,
    new Date(req.submittedAt).toLocaleDateString(),
  ]);

  autoTable(doc, {
  head: [["Title", "Faculty", "ID", "Type", "Target", "Date"]],
  body: tableData,
  startY: 20,
  styles: { fontSize: 8 },
  headStyles: { fillColor: [31, 78, 121] },
});

  doc.save(`UID_Report_${department}.pdf`);
};

const sendReportToHod = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const email = user?.email || "hod@gmail.com"; // fallback if needed
     const userId = user?.userId;
    const res = await fetch("http://localhost:5000/api/hod/send-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        userId,
        reportData: filteredRequests, // sends current filtered table
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire("Success", "Report sent to email 📧", "success");
    } else {
      Swal.fire("Error", data.message || "Failed to send email", "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Server error while sending email", "error");
  }
};

return (
  <div className="uid-requests-container">

    {/* ===== STATS ===== */}
    <div className="stats-bar">
      <div className="stat-card">
        <p>Total Requests</p>
        <h3>{requests.length}</h3>
      </div>

      <div className="stat-card">
        <p>Journals</p>
        <h3>{requests.filter(r => r.type === "Journal").length}</h3>
      </div>

      <div className="stat-card">
        <p>Conferences</p>
        <h3>{requests.filter(r => r.type === "Conference").length}</h3>
      </div>

      <div className="stat-card">
        <p>Today</p>
        <h3>
          {requests.filter(r =>
            new Date(r.submittedAt).toDateString() === new Date().toDateString()
          ).length}
        </h3>
      </div>
    </div>
         
    {/* ===== TOOLBAR ===== */}
    <div className="toolbar">

      <input
        type="text"
        placeholder="🔍 Search by title or faculty..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
        <option value="all">All Types</option>
        <option value="Journal">Journal</option>
        <option value="Conference">Conference</option>
        <option value="Book Chapter">Book Chapter</option>
        <option value="Book">Book</option>
        <option value="Patent">Patent</option>
      </select>

      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="latest">Latest First</option>
        <option value="oldest">Oldest First</option>
      </select>

      <button className="export-btn" onClick={exportToExcel}>
  ⬇ Export Excel
</button>
<button className="pdf-btn" onClick={exportPDF}>
    📄 Export PDF
  </button>
<button
  className="email-btn"
  onClick={sendReportToHod}
>
  📧 Send Report
</button>
    </div>

    <h2>Pending UID Requests ({department})</h2>

    {loading ? (
      <p>Loading...</p>
    ) : filteredRequests.length === 0 ? (
      <p>No UID requests pending from {department}.</p>
    ) : (
      filteredRequests.map(req => (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="uid-request-card"
          key={req._id}
        >

          {/* ===== HEADER ===== */}
          <div className="card-header">

            <div
              className="title-section"
              onClick={() =>
                setExpandedId(expandedId === req._id ? null : req._id)
              }
            >
              <div className="title-row">
                <h4>{req.paperTitle}</h4>

                {/* NEW BADGE */}
                {Date.now() - new Date(req.submittedAt).getTime() < 86400000 && (
                  <span className="priority-badge">NEW</span>
                )}
              </div>

              <p className="faculty-name">{req.facultyName}</p>
            </div>

            {/* 🔥 TOGGLE BUTTON (arrow) */}
            <button
              className="expand-btn"
              onClick={() =>
                setExpandedId(expandedId === req._id ? null : req._id)
              }
            >
              {expandedId === req._id ? "▲" : "▼"}
            </button>

          </div>

          {/* ===== BODY ===== */}
          <AnimatePresence>
            {expandedId === req._id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="card-body"
              >

                <div className="info-grid">
                  <p><strong>Faculty ID:</strong> {req.facultyId}</p>
                  <p><strong>Department:</strong> {req.department}</p>
                  <p><strong>Type:</strong> {req.type}</p>
                  <p><strong>Target:</strong> {req.target}</p>
                  <p><strong>Date:</strong> {new Date(req.submittedAt).toLocaleDateString()}</p>
                </div>

                <div className="abstract-box">
                  <strong>Abstract:</strong>
                  <p>{req.abstract}</p>
                </div>

                {/* ===== ACTIONS ===== */}
                <div className="actions">
                  <button
                    className="accept"
                    onClick={() => handleAction(req._id, 'accept')}
                  >
                    Accept
                  </button>

                  {rejectingId === req._id ? (
                    <>
                      <select
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      >
                        <option value="">Select reason</option>
                        {rejectionOptions.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>

                      {rejectReason === "Other" && (
                        <input
                          type="text"
                          placeholder="Custom reason"
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                        />
                      )}

                      <button onClick={() => handleAction(req._id, 'reject')}>
                        Confirm Reject
                      </button>

                      <button onClick={() => setRejectingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setRejectingId(req._id)}>
                      Reject
                    </button>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      ))
    )}
  </div>
);
}

// import React, { useEffect, useState } from 'react';
// import './HodDashboard.css';
// import Swal from 'sweetalert2';


// export default function HodUidApproval({ hodId: propHodId }){
//   const [requests, setRequests] = useState([]);
//   const [department, setDepartment] = useState('hod');
//   const [loading, setLoading] = useState(true);
//   const [rejectingId, setRejectingId] = useState(null);
//   const [rejectReason, setRejectReason] = useState('');
//   const [customReason, setCustomReason] = useState('');
//   const [expandedId, setExpandedId] = useState(null);
// const hodId = propHodId || JSON.parse(localStorage.getItem("user"))?.userId;

// useEffect(() => {
//   const fetchHodAndRequests = async () => {
//     if (!hodId) {
//       alert('HoD not logged in');
//       setLoading(false);
//       return;
//     }

//     try {
//       const hodRes = await fetch(`http://localhost:5000/api/hod/${hodId}`);
//       const hodData = await hodRes.json();
//       setDepartment(hodData.department);

//       const requestRes = await fetch(
//   `http://localhost:5000/api/hod/uid-requests/${hodId}`
// );

// if (!requestRes.ok) throw new Error('Failed to fetch UID requests');

// const deptRequests = await requestRes.json();
// setRequests(deptRequests);

// // const requestRes = await fetch('http://localhost:5000/api/hod/uid-requests');
// // if (!requestRes.ok) throw new Error('Failed to fetch UID requests');

// // const allRequests = await requestRes.json();
// // if (!Array.isArray(allRequests)) throw new Error('UID requests should be an array');


// //       // const requestRes = await fetch('http://localhost:5000/api/hod/uid-requests');
// //       // const allRequests = await requestRes.json();

// //       const filtered = allRequests.filter(
// //   req => req.department?.toLowerCase() === hodData.department?.toLowerCase() && req.hodAccept !== true
// // );

// // setRequests(filtered);

//     } catch (err) {
//       console.error('Error fetching UID requests:', err);
//       alert('Failed to load UID requests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchHodAndRequests();
// }, [hodId]);


//   const handleAction = async (id, status) => {
//   try {
//     let url = `http://localhost:5000/api/hod/uid-request/${id}/accept/${hodId}`;
//     // let url = `http://localhost:5000/api/hod/uid-request/${id}/${status}`;
//     let body = null;

//     if (status === 'reject') {
//       const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
//       if (!finalReason) return Swal.fire('Error', 'Please provide a reason', 'error');
//         url = `http://localhost:5000/api/hod/uid-request/${id}/reject/${hodId}`;
//       // url = `http://localhost:5000/api/hod/uid-request/${id}/reject`;
//       body = JSON.stringify({ reason: finalReason });
//     }

//     const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
//     const data = await res.json();

//     Swal.fire('Success', data.message, 'success');
//     setRequests(prev => prev.filter(r => r._id !== id));
//     setRejectingId(null);
//     setRejectReason('');
//     setCustomReason('');
//   } catch (err) {
//     console.error(err);
//     Swal.fire('Error', 'Action failed', 'error');
//   }
// };


//   // const handleAction = async (id, status) => {
//   //   try {
//   //     let url = `http://localhost:5000/api/hod/uid-request/${id}/${status}`;
//   //     let body = null;

//   //     if (status === 'reject') {
//   //       const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
//   //       if (!finalReason) return alert('Please provide a reason for rejection.');
//   //       url = `http://localhost:5000/api/hod/uid-request/${id}/reject`;
//   //       body = JSON.stringify({ reason: finalReason });
//   //     }

//   //     const res = await fetch(url, {
//   //       method: 'PUT',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: body,
//   //     });

//   //     const data = await res.json();
//   //     alert(data.message);
//   //     setRequests(prev => prev.filter(r => r._id !== id));
//   //     setRejectingId(null);
//   //     setRejectReason('');
//   //     setCustomReason('');
//   //   } catch (err) {
//   //     console.error(err);
//   //     alert('Action failed');
//   //   }
//   // };

//   const rejectionOptions = [
//     'Insufficient Details',
//     'Not Relevant to Department',
//     'Duplicate Submission',
//     'Unclear Abstract',
//     'Other'
//   ];

//   return (
//     <div className="uid-requests-container">
//       <h2>Pending UID Requests ({department})</h2>

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

//               {rejectingId === req._id ? (
//                 <>
//                   <select
//                     className="reason-select"
//                     value={rejectReason}
//                     onChange={(e) => setRejectReason(e.target.value)}
//                   >
//                     <option value="">Select reason</option>
//                     {rejectionOptions.map((opt, idx) => (
//                       <option key={idx} value={opt}>{opt}</option>
//                     ))}
//                   </select>

//                   {rejectReason === 'Other' && (
//                     <input
//                       type="text"
//                       placeholder="Enter custom reason"
//                       value={customReason}
//                       onChange={(e) => setCustomReason(e.target.value)}
//                       className="custom-reason-input"
//                     />
//                   )}

//                   <button className="confirm-reject" onClick={() => handleAction(req._id, 'reject')}>
//                     Confirm Reject
//                   </button>
//                   <button className="cancel-reject" onClick={() => {
//                     setRejectingId(null);
//                     setRejectReason('');
//                     setCustomReason('');
//                   }}>
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <button className="reject" onClick={() => setRejectingId(req._id)}>Reject</button>
//               )}
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }