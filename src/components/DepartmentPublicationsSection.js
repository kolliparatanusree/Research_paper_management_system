import React, { useEffect, useState } from "react";
import "./faculty/PublicationsSection.css"; 
import jsPDF from "jspdf";
// import "jspdf-autotable";
import autoTable from "jspdf-autotable"; 

export default function DepartmentPublicationsSection({ department }) {
  const [publications, setPublications] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchText, setSearchText] = useState("");

  const fetchPublications = async () => {
    try {
      let url = `http://localhost:5000/api/faculty/department-publications/${department}?`;

      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
      if (searchText) url += `search=${encodeURIComponent(searchText)}&`;

      const res = await fetch(url);
      const data = await res.json();
      setPublications(data.publicationHistory || []);
    } catch (error) {
      console.error("Error fetching department publications:", error);
      setPublications([]);
    }
  };

  useEffect(() => {
    if (department) fetchPublications();
  }, [department]);

  // -------------------
  // Download PDF
  // -------------------
  const downloadPDF = () => {
  if (!publications || publications.length === 0) return;

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Department Publications: ${department}`, 14, 22);

  const tableColumn = ["S.No", "Title", "Faculty ID", "Journal / Conference", "Year", "PID"];
  const tableRows = publications.map((pub, index) => [
    index + 1,
    pub.title,
    pub.userId || "Unknown",
    pub.journal || "Unknown",
    pub.year || "N/A",
    pub.pid || "Not Assigned",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  doc.save(`Department_Publications_${department}.pdf`);
};


  return (
    <div className="publications-container">
      <h2>📚 Department Publication History</h2>

      {/* Search + Date filters */}
      <div className="filter-container">
  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
  />
  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
  />
  <input
    type="text"
    placeholder="Search by Faculty ID, Title, or Journal"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />
  <button className="download-btn" onClick={downloadPDF}>
    Download HIstory
  </button>
</div>

      {publications.length === 0 ? (
        <p>No publications yet.</p>
      ) : (
        <ul className="publication-list">
          {publications.map((pub, index) => (
            <li key={index} className="publication-item">
              <span className="pub-title">{pub.title}</span>
              <p><strong>Faculty ID:</strong> {pub.userId || "Unknown"}</p>
              <button className="view-btn" onClick={() => setSelectedPub(pub)}>
                View
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Popup Card */}
      {selectedPub && (
        <div className="popup-overlay">
          <div className="popup-card">
            <button className="close-btn" onClick={() => setSelectedPub(null)}>✖</button>
            <h3>{selectedPub.title}</h3>
            <p><strong>Faculty ID:</strong> {selectedPub.userId || "Unknown"}</p>
            <p><strong>Journal / Conference:</strong> {selectedPub.journal}</p>
            <p><strong>Year:</strong> {selectedPub.year}</p>
            <p><strong>PID:</strong> {selectedPub.pid || "Not Assigned"}</p>
            {selectedPub.uploadedAt && (
              <p><strong>Uploaded Date:</strong> {new Date(selectedPub.uploadedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import "./faculty/PublicationsSection.css";

// export default function DepartmentPublicationsSection({ department }) {
//   const [publications, setPublications] = useState([]);
//   const [selectedPub, setSelectedPub] = useState(null);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [searchText, setSearchText] = useState("");

//   const fetchPublications = async () => {
//     try {
//       let url = `http://localhost:5000/api/faculty/department-publications/${department}?`;

//       if (startDate) url += `startDate=${startDate}&`;
//       if (endDate) url += `endDate=${endDate}&`;
//       if (searchText) url += `search=${encodeURIComponent(searchText)}&`;

//       const res = await fetch(url);
//       const data = await res.json();
//       setPublications(data.publicationHistory || []);
//     } catch (error) {
//       console.error("Error fetching department publications:", error);
//       setPublications([]);
//     }
//   };

//   useEffect(() => {
//     if (department) fetchPublications();
//   }, [department]);

//   return (
//     <div className="publications-container">
//       <h2>📚 Department Publication History</h2>

//       {/* Search + Date filters */}
//       <div style={{ marginBottom: "15px" }}>
//         <input
//           type="text"
//           placeholder="Search by Faculty ID, PID, Title, Abstract, Journal"
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//           style={{ marginRight: "5px" }}
//         />
//         <input
//           type="date"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//         />
//         <input
//           type="date"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//         />
//         <button onClick={fetchPublications}>Search</button>
//       </div>

//       {publications.length === 0 ? (
//         <p>No publications yet.</p>
//       ) : (
//         <ul className="publication-list">
//           {publications.map((pub, index) => (
//             <li key={index} className="publication-item">
//               <span className="pub-title">{pub.title}</span>
//               <p><strong>Faculty ID:</strong> {pub.userId || "Unknown"}</p>
//               <button className="view-btn" onClick={() => setSelectedPub(pub)}>
//                 View
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* Popup Card */}
//       {selectedPub && (
//         <div className="popup-overlay">
//           <div className="popup-card">
//             <button className="close-btn" onClick={() => setSelectedPub(null)}>✖</button>
//             <h3>{selectedPub.title}</h3>
//             <p><strong>Faculty ID:</strong> {selectedPub.userId || "Unknown"}</p>
//             <p><strong>Journal / Conference:</strong> {selectedPub.journal}</p>
//             <p><strong>Year:</strong> {selectedPub.year}</p>
//             <p><strong>PID:</strong> {selectedPub.pid || "Not Assigned"}</p>
//             {selectedPub.abstract && <p><strong>Abstract:</strong> {selectedPub.abstract}</p>}
//             {selectedPub.uploadedAt && (
//               <p><strong>Uploaded Date:</strong> {new Date(selectedPub.uploadedAt).toLocaleDateString()}</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }