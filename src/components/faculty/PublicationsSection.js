

import React, { useEffect, useState } from "react";
import "./PublicationsSection.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PublicationsSection({ userId }) {
  const [publications, setPublications] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);
  const [search, setSearch] = useState("");

  /* 🔥 Download FULL history */
  const downloadAllPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Publication History of ${userId}`, 14, 15);

    const tableData = publications.map((pub, index) => [
      index + 1,
      pub.title,
      pub.journal,
      pub.year,
      pub.pid || "-"
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["S.No", "Title", "Journal/Conference", "Year", "PID"]],
      body: tableData
    });

    doc.save("Publication_History.pdf");
  };

  /* 🔥 Download SINGLE publication */
  const downloadSinglePDF = (pub) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Publication Details", 14, 15);

    doc.setFontSize(12);
    doc.text(`Title: ${pub.title}`, 14, 30);
    doc.text(`Journal/Conference: ${pub.journal}`, 14, 40);
    doc.text(`Year: ${pub.year}`, 14, 50);

    if (pub.pid) doc.text(`PID: ${pub.pid}`, 14, 60);

    if (pub.abstract) {
      doc.text("Abstract:", 14, 75);
      doc.text(pub.abstract, 14, 85, { maxWidth: 180 });
    }

    doc.save(`${pub.title}.pdf`);
  };

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/faculty/publication-history/${userId}`
        );
        const data = await res.json();
        setPublications(data.publicationHistory || []);
      } catch (err) {
        console.error("Error fetching publications:", err);
      }
    };

    if (userId) fetchPublications();
  }, [userId]);

  /* 🔎 Filtered publications */
  const filteredPubs = publications.filter((pub) =>
    `${pub.title} ${pub.journal} ${pub.year} ${pub.pid || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="publications-container">

      <h2>📚 Publication History</h2>

      {/* 🔎 SEARCH BAR */}
      <input
        type="text"
        placeholder="Search publications..."
        className="search-box"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ⬇️ FULL DOWNLOAD */}
      <button className="download-btn" onClick={downloadAllPDF}>
        ⬇️ Download Full History
      </button>

      {filteredPubs.length === 0 ? (
        <p>No publications found.</p>
      ) : (
        <ul className="publication-list">
          {filteredPubs.map((pub, index) => (
            <li key={index} className="publication-item">

              <span className="pub-title">{pub.title}</span>

              <div className="pub-actions">

                <button
                  className="view-btn"
                  onClick={() => setSelectedPub(pub)}
                >
                  View 
                </button>

                <button
                  className="download-single-btn"
                  onClick={() => downloadSinglePDF(pub)}
                >
                  ⬇️ 
                </button>

              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 🔥 POPUP */}
      {selectedPub && (
        <div className="popup-overlay">
          <div className="popup-card">

            <button
              className="close-btn"
              onClick={() => setSelectedPub(null)}
            >
              ✖
            </button>

            <h3>{selectedPub.title}</h3>

            <p><strong>Journal / Conference:</strong> {selectedPub.journal}</p>
            <p><strong>Year:</strong> {selectedPub.year}</p>

            {selectedPub.pid && (
              <p><strong>PID:</strong> {selectedPub.pid}</p>
            )}

            {selectedPub.abstract && (
              <p><strong>Abstract:</strong> {selectedPub.abstract}</p>
            )}

            {selectedPub.uploadedAt && (
              <p>
                <strong>Uploaded Date:</strong>{" "}
                {new Date(selectedPub.uploadedAt).toLocaleDateString()}
              </p>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import "./PublicationsSection.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export default function PublicationsSection({ userId }) {
//   const [publications, setPublications] = useState([]);
//   const [selectedPub, setSelectedPub] = useState(null);
//   const downloadPDF = () => {
//   const doc = new jsPDF();

//   doc.setFontSize(16);
//   // doc.text(`Faculty ID: ${userId}`, 14, 22);
//   doc.text(`Publication History of ${userId}`, 14, 15);

//   const tableData = publications.map((pub, index) => [
//     index + 1,
//     pub.title,
//     pub.journal,
//     pub.year,
//     pub.pid || "-"
//   ]);

//   autoTable(doc, {
//     startY: 25,
//     head: [["S.No", "Title", "Journal/Conference", "Year", "PID"]],
//     body: tableData
//   });

//   doc.save("Publication_History.pdf");
// };
//   useEffect(() => {
//     const fetchPublications = async () => {
//       try {
//         const res = await fetch(
//           `http://localhost:5000/api/faculty/publication-history/${userId}`
//         );
//         const data = await res.json();
//         setPublications(data.publicationHistory || []);
//       } catch (err) {
//         console.error("Error fetching publications:", err);
//       }
//     };

//     if (userId) fetchPublications();
//   }, [userId]);

//   return (
//     <div className="publications-container">
//       <h2>📚 Publication History</h2>
//       <button className="download-btn" onClick={downloadPDF}>
//   Download Publication History
// </button>
//       {publications.length === 0 ? (
//         <p>No published papers yet.</p>
//       ) : (
//         <ul className="publication-list">
//           {publications.map((pub, index) => (
//             <li key={index} className="publication-item">
//               <span className="pub-title">{pub.title}</span>

//               <button
//                 className="view-btn"
//                 onClick={() => setSelectedPub(pub)}
//               >
//                 View
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* Popup */}
//       {selectedPub && (
//         <div className="popup-overlay">
//           <div className="popup-card">
//             <button
//               className="close-btn"
//               onClick={() => setSelectedPub(null)}
//             >
//               ✖
//             </button>

//             <h3>{selectedPub.title}</h3>

//             <p>
//               <strong>Journal / Conference:</strong> {selectedPub.journal}
//             </p>

//             <p>
//               <strong>Year:</strong> {selectedPub.year}
//             </p>

//             {selectedPub.pid && (
//               <p>
//                 <strong>PID:</strong> {selectedPub.pid}
//               </p>
//             )}

//             {selectedPub.abstract && (
//               <p>
//                 <strong>Abstract:</strong> {selectedPub.abstract}
//               </p>
//             )}

//             {selectedPub.uploadedAt && (
//               <p>
//                 <strong>Uploaded Date:</strong>{" "}
//                 {new Date(selectedPub.uploadedAt).toLocaleDateString()}
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import './PulicationsSection.css';
// // export default function PublicationsSection({ userId }) {
// //   const [publications, setPublications] = useState([]);

// //   useEffect(() => {
// //     const fetchPublications = async () => {
// //       try {
// //         const res = await axios.get(
// //           `http://localhost:5000/api/faculty/publication-history/${userId}`
// //         );

// //         console.log("API RESPONSE:", res.data);

// //         setPublications(res.data.publicationHistory || []);
// //       } catch (error) {
// //         console.error("Error fetching publications:", error);
// //       }
// //     };

// //     if (userId) fetchPublications();
// //   }, [userId]);

// //   return (
// //     <div>
// //       <h2>Publication History</h2>

// //       {publications.length === 0 ? (
// //         <p>No published papers yet.</p>
// //       ) : (
// //         publications.map((pub, index) => (
// //           <div
// //             key={index}
// //             style={{
// //               border: "1px solid #ddd",
// //               padding: "10px",
// //               marginBottom: "10px",
// //               borderRadius: "6px",
// //             }}
// //           >
// //             <strong>
// //               {pub.title} — {pub.journal} ({pub.year})
// //             </strong>

// //             {pub.pid && (
// //               <p>
// //                 <b>PID:</b> {pub.pid}
// //               </p>
// //             )}
// //           </div>
// //         ))
// //       )}
// //     </div>
// //   );
// // }