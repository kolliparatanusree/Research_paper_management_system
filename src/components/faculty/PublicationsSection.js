import React, { useEffect, useMemo, useState } from "react";
import "./PublicationsSection.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_BASE_URL } from "../../config.js";
export default function PublicationsSection({ userId }) {
  const [publications, setPublications] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Default sorting
  const [sortBy, setSortBy] = useState("newest");

  /* =====================================================
     FETCH PUBLICATIONS
  ===================================================== */
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/api/faculty/publication-history/${userId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch publications");
        }

        const data = await res.json();

        setPublications(data.publicationHistory || []);
      } catch (err) {
        console.error("Error fetching publications:", err);
        setPublications([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPublications();
    }
  }, [userId]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalPublications = publications.length;

  const publicationsWithPID = publications.filter(
    (pub) => pub.pid
  ).length;

  const validYears = publications
    .map((pub) => Number(pub.year))
    .filter((year) => !isNaN(year));

  const latestYear =
    validYears.length > 0
      ? Math.max(...validYears)
      : "-";

  /* =====================================================
     SEARCH + SORT + TYPE FILTER
  ===================================================== */

  const filteredPubs = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    // First apply search
    let result = publications.filter((pub) => {
      const searchableText = `
        ${pub.title || ""}
        ${pub.journal || ""}
        ${pub.year || ""}
        ${pub.pid || ""}
        ${pub.type || ""}
      `.toLowerCase();

      return searchableText.includes(searchText);
    });

    /* =================================================
       SORT / TYPE FILTER
    ================================================= */

    if (sortBy === "newest") {
      result.sort((a, b) => {
        const dateA = new Date(
          a.submittedAt || a.uploadedAt || 0
        );

        const dateB = new Date(
          b.submittedAt || b.uploadedAt || 0
        );

        return dateB - dateA;
      });
    }

    else if (sortBy === "oldest") {
      result.sort((a, b) => {
        const dateA = new Date(
          a.submittedAt || a.uploadedAt || 0
        );

        const dateB = new Date(
          b.submittedAt || b.uploadedAt || 0
        );

        return dateA - dateB;
      });
    }

    else if (sortBy === "title-asc") {
      result.sort((a, b) =>
        (a.title || "").localeCompare(
          b.title || "",
          undefined,
          { sensitivity: "base" }
        )
      );
    }

    else if (sortBy === "title-desc") {
      result.sort((a, b) =>
        (b.title || "").localeCompare(
          a.title || "",
          undefined,
          { sensitivity: "base" }
        )
      );
    }

    else if (sortBy === "conference") {
      result = result.filter(
        (pub) =>
          String(pub.type || "")
            .trim()
            .toLowerCase() === "conference"
      );
    }

    else if (sortBy === "journal") {
      result = result.filter(
        (pub) =>
          String(pub.type || "")
            .trim()
            .toLowerCase() === "journal"
      );
    }

    else if (sortBy === "book") {
      result = result.filter(
        (pub) =>
          String(pub.type || "")
            .trim()
            .toLowerCase() === "book"
      );
    }

    return result;
  }, [publications, search, sortBy]);

  /* =====================================================
     SAFE PDF FILE NAME
  ===================================================== */

  const safeFileName = (title) => {
    const cleanTitle = (title || "Publication")
      .replace(/[<>:"/\\|?*]+/g, "")
      .trim()
      .substring(0, 100);

    return `${cleanTitle || "Publication"}.pdf`;
  };

  /* =====================================================
     DOWNLOAD FULL HISTORY
  ===================================================== */

  const downloadAllPDF = () => {
    if (publications.length === 0) {
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");

    doc.text("Publication History", 14, 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Faculty ID: ${userId}`, 14, 23);

    doc.text(
      `Total Publications: ${publications.length}`,
      14,
      29
    );

    const tableData = publications.map((pub, index) => [
      index + 1,
      pub.title || "-",
      pub.type || "-",
      pub.journal || "-",
      pub.year || "-",
      pub.pid || "-"
    ]);

    autoTable(doc, {
      startY: 36,

      head: [
        [
          "S.No",
          "Title",
          "Type",
          "Journal / Conference",
          "Year",
          "PID"
        ]
      ],

      body: tableData,

      styles: {
        fontSize: 7.5,
        cellPadding: 3,
        overflow: "linebreak",
        valign: "middle"
      },

      headStyles: {
        fontSize: 7.5,
        fontStyle: "bold"
      },

      columnStyles: {
        0: {
          cellWidth: 11
        },

        1: {
          cellWidth: 48
        },

        2: {
          cellWidth: 25
        },

        3: {
          cellWidth: 48
        },

        4: {
          cellWidth: 18
        },

        5: {
          cellWidth: 30
        }
      },

      margin: {
        left: 8,
        right: 8
      }
    });

    doc.save("Publication_History.pdf");
  };

  /* =====================================================
     DOWNLOAD SINGLE PUBLICATION
  ===================================================== */

  const downloadSinglePDF = (pub) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");

    doc.text("Publication Details", 14, 18);

    /* TITLE */

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    doc.text("Title", 14, 34);

    doc.setFont("helvetica", "normal");

    const titleLines = doc.splitTextToSize(
      pub.title || "-",
      180
    );

    doc.text(titleLines, 14, 41);

    let currentY =
      41 + titleLines.length * 7;

    /* TYPE */

    if (pub.type) {
      doc.setFont("helvetica", "bold");

      doc.text(
        "Type",
        14,
        currentY + 5
      );

      doc.setFont("helvetica", "normal");

      doc.text(
        String(pub.type),
        14,
        currentY + 12
      );

      currentY += 20;
    }

    /* JOURNAL */

    doc.setFont("helvetica", "bold");

    doc.text(
      "Journal / Conference",
      14,
      currentY + 5
    );

    doc.setFont("helvetica", "normal");

    const journalLines = doc.splitTextToSize(
      pub.journal || "-",
      180
    );

    doc.text(
      journalLines,
      14,
      currentY + 12
    );

    currentY +=
      12 + journalLines.length * 6;

    /* YEAR */

    doc.setFont("helvetica", "bold");

    doc.text(
      "Year",
      14,
      currentY + 5
    );

    doc.setFont("helvetica", "normal");

    doc.text(
      String(pub.year || "-"),
      14,
      currentY + 12
    );

    currentY += 20;

    /* PID */

    if (pub.pid) {
      doc.setFont("helvetica", "bold");

      doc.text(
        "PID",
        14,
        currentY
      );

      doc.setFont("helvetica", "normal");

      doc.text(
        String(pub.pid),
        14,
        currentY + 7
      );

      currentY += 18;
    }

    /* SUBMITTED / UPLOADED DATE */

    const publicationDate =
      pub.submittedAt || pub.uploadedAt;

    if (publicationDate) {
      doc.setFont("helvetica", "bold");

      doc.text(
        "Submitted Date",
        14,
        currentY
      );

      doc.setFont("helvetica", "normal");

      doc.text(
        new Date(
          publicationDate
        ).toLocaleDateString(),
        14,
        currentY + 7
      );

      currentY += 18;
    }

    /* ABSTRACT */

    if (pub.abstract) {
      doc.setFont("helvetica", "bold");

      doc.text(
        "Abstract",
        14,
        currentY
      );

      const abstractLines =
        doc.splitTextToSize(
          pub.abstract,
          180
        );

      doc.setFont("helvetica", "normal");

      doc.text(
        abstractLines,
        14,
        currentY + 8
      );
    }

    doc.save(
      safeFileName(pub.title)
    );
  };

  /* =====================================================
     CLOSE POPUP WITH ESCAPE
  ===================================================== */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedPub(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =====================================================
     JSX
  ===================================================== */

  return (
    <div className="publications-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="publications-header">

        <div className="publications-heading">

          <div className="publications-icon">
            📚
          </div>

          <div>
            <h2>
              Publication History
            </h2>

            <p>
              View and manage your published research papers
            </p>
          </div>

        </div>

        <button
          className="download-all-btn"
          onClick={downloadAllPDF}
          disabled={
            publications.length === 0
          }
        >
          <span>⬇</span>

          Download Full History
        </button>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="publication-stats">

        {/* TOTAL */}

        <div className="publication-stat-card">

          <div className="stat-icon total-icon">
            📚
          </div>

          <div>
            <span className="stat-label">
              Total Publications
            </span>

            <strong>
              {totalPublications}
            </strong>
          </div>

        </div>

        {/* PID */}

        <div className="publication-stat-card">

          <div className="stat-icon pid-icon">
            🆔
          </div>

          <div>
            <span className="stat-label">
              Publications with PID
            </span>

            <strong>
              {publicationsWithPID}
            </strong>
          </div>

        </div>

        {/* LATEST YEAR */}

        <div className="publication-stat-card">

          <div className="stat-icon year-icon">
            📅
          </div>

          <div>
            <span className="stat-label">
              Latest Publication
            </span>

            <strong>
              {latestYear}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          SEARCH + SORT
      ================================================= */}

      <div className="publication-toolbar">

        {/* SEARCH */}

        <div className="search-wrapper">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search by title, journal, year, PID or type..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="clear-search"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

        {/* SORT */}

        <div className="sort-wrapper">

          <label htmlFor="publication-sort">
            Sort:
          </label>

          <select
            id="publication-sort"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >

            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="title-asc">
              Title A–Z
            </option>

            <option value="title-desc">
              Title Z–A
            </option>

            <option value="conference">
              Conference
            </option>

            <option value="journal">
              Journal
            </option>

            <option value="book">
              Book
            </option>

          </select>

        </div>

      </div>

      {/* =================================================
          RESULT INFO
      ================================================= */}

      {!loading &&
        publications.length > 0 && (

          <div className="publication-result-info">

            <span>

              Showing{" "}

              <strong>
                {filteredPubs.length}
              </strong>

              {" "}of{" "}

              <strong>
                {publications.length}
              </strong>

              {" "}publications

            </span>

          </div>

        )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="publication-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading publications...
          </p>

        </div>

      )}

      {/* =================================================
          NO PUBLICATIONS
      ================================================= */}

      {!loading &&
        publications.length === 0 && (

          <div className="publication-empty">

            <div className="empty-icon">
              📚
            </div>

            <h3>
              No Publications Yet
            </h3>

            <p>
              Your published research papers will appear here.
            </p>

          </div>

        )}

      {/* =================================================
          NO RESULTS
      ================================================= */}

      {!loading &&
        publications.length > 0 &&
        filteredPubs.length === 0 && (

          <div className="publication-empty">

            <div className="empty-icon">
              🔍
            </div>

            <h3>
              No Publications Found
            </h3>

            <p>
              Try changing your search or selected filter.
            </p>

            <button
              className="reset-search-btn"
              onClick={() => {
                setSearch("");
                setSortBy("newest");
              }}
            >
              Clear Search & Filter
            </button>

          </div>

        )}

      {/* =================================================
          PUBLICATION CARDS
      ================================================= */}

      {!loading &&
        filteredPubs.length > 0 && (

          <div className="publication-list">

            {filteredPubs.map(
              (pub, index) => (

                <div
                  key={
                    pub._id ||
                    pub.id ||
                    index
                  }
                  className="publication-card"
                >

                  {/* CARD MAIN */}

                  <div className="publication-card-main">

                    <div className="publication-number">
                      {index + 1}
                    </div>

                    <div className="publication-content">

                      {/* TITLE + YEAR */}

                      <div className="publication-title-row">

                        <h3>
                          {pub.title ||
                            "Untitled Publication"}
                        </h3>

                        {pub.year && (
                          <span className="year-badge">
                            {pub.year}
                          </span>
                        )}

                      </div>

                      {/* JOURNAL */}

                      <p className="publication-journal">

                        <span>
                          📖
                        </span>

                        {pub.journal ||
                          "Journal / Conference not specified"}

                      </p>

                      {/* META */}

                      <div className="publication-meta">

                        {/* TYPE */}

                        {pub.type && (
                          <span className="type-badge">
                            {pub.type}
                          </span>
                        )}

                        {/* PID */}

                        {pub.pid ? (

                          <span className="pid-badge">

                            <span>
                              PID:
                            </span>

                            {" "}

                            {pub.pid}

                          </span>

                        ) : (

                          <span className="no-pid-badge">
                            PID not assigned
                          </span>

                        )}

                        {/* DATE */}

                        {(pub.submittedAt ||
                          pub.uploadedAt) && (

                          <span className="uploaded-date">

                            📅{" "}

                            {new Date(
                              pub.submittedAt ||
                                pub.uploadedAt
                            ).toLocaleDateString()}

                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="publication-actions">

                    <button
                      className="view-btn"
                      onClick={() =>
                        setSelectedPub(pub)
                      }
                    >
                      <span>
                        👁
                      </span>

                      View Details
                    </button>

                    <button
                      className="download-single-btn"
                      onClick={() =>
                        downloadSinglePDF(pub)
                      }
                      title="Download publication"
                    >
                      <span>
                        ⬇
                      </span>

                      Download
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      {/* =================================================
          POPUP
      ================================================= */}

      {selectedPub && (

        <div
          className="popup-overlay"
          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedPub(null);
            }

          }}
        >

          <div className="popup-card">

            {/* POPUP HEADER */}

            <div className="popup-header">

              <div className="popup-header-title">

                <span className="popup-icon">
                  📄
                </span>

                <div>

                  <span className="popup-label">
                    Publication Details
                  </span>

                  <h3>
                    {selectedPub.title ||
                      "Untitled Publication"}
                  </h3>

                </div>

              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedPub(null)
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* POPUP BODY */}

            <div className="popup-body">

              <div className="detail-grid">

                {/* TYPE */}

                <div className="detail-item">

                  <span className="detail-label">
                    Type
                  </span>

                  <span className="detail-value">
                    {selectedPub.type ||
                      "-"}
                  </span>

                </div>

                {/* JOURNAL */}

                <div className="detail-item">

                  <span className="detail-label">
                    Journal / Conference
                  </span>

                  <span className="detail-value">
                    {selectedPub.journal ||
                      "-"}
                  </span>

                </div>

                {/* YEAR */}

                <div className="detail-item">

                  <span className="detail-label">
                    Publication Year
                  </span>

                  <span className="detail-value">
                    {selectedPub.year ||
                      "-"}
                  </span>

                </div>

                {/* PID */}

                <div className="detail-item">

                  <span className="detail-label">
                    PID
                  </span>

                  <span className="detail-value">
                    {selectedPub.pid ||
                      "Not assigned"}
                  </span>

                </div>

                {/* DATE */}

                {(selectedPub.submittedAt ||
                  selectedPub.uploadedAt) && (

                  <div className="detail-item">

                    <span className="detail-label">
                      Submitted Date
                    </span>

                    <span className="detail-value">

                      {new Date(
                        selectedPub.submittedAt ||
                          selectedPub.uploadedAt
                      ).toLocaleDateString()}

                    </span>

                  </div>

                )}

              </div>

              {/* ABSTRACT */}

              {selectedPub.abstract && (

                <div className="abstract-section">

                  <h4>
                    Abstract
                  </h4>

                  <p>
                    {selectedPub.abstract}
                  </p>

                </div>

              )}

            </div>

            {/* POPUP FOOTER */}

            <div className="popup-footer">

              <button
                className="popup-close-btn"
                onClick={() =>
                  setSelectedPub(null)
                }
              >
                Close
              </button>

              <button
                className="popup-download-btn"
                onClick={() =>
                  downloadSinglePDF(
                    selectedPub
                  )
                }
              >
                ⬇ Download PDF
              </button>

            </div>

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
//   const [search, setSearch] = useState("");

//   /* 🔥 Download FULL history */
//   const downloadAllPDF = () => {
//     const doc = new jsPDF();

//     doc.setFontSize(16);
//     doc.text(`Publication History of ${userId}`, 14, 15);

//     const tableData = publications.map((pub, index) => [
//       index + 1,
//       pub.title,
//       pub.journal,
//       pub.year,
//       pub.pid || "-"
//     ]);

//     autoTable(doc, {
//       startY: 25,
//       head: [["S.No", "Title", "Journal/Conference", "Year", "PID"]],
//       body: tableData
//     });

//     doc.save("Publication_History.pdf");
//   };

//   /* 🔥 Download SINGLE publication */
//   const downloadSinglePDF = (pub) => {
//     const doc = new jsPDF();

//     doc.setFontSize(16);
//     doc.text("Publication Details", 14, 15);

//     doc.setFontSize(12);
//     doc.text(`Title: ${pub.title}`, 14, 30);
//     doc.text(`Journal/Conference: ${pub.journal}`, 14, 40);
//     doc.text(`Year: ${pub.year}`, 14, 50);

//     if (pub.pid) doc.text(`PID: ${pub.pid}`, 14, 60);

//     if (pub.abstract) {
//       doc.text("Abstract:", 14, 75);
//       doc.text(pub.abstract, 14, 85, { maxWidth: 180 });
//     }

//     doc.save(`${pub.title}.pdf`);
//   };

//   useEffect(() => {
//     const fetchPublications = async () => {
//       try {
//         const res = await fetch(
//           `${API_BASE_URL}/api/faculty/publication-history/${userId}`
//         );
//         const data = await res.json();
//         setPublications(data.publicationHistory || []);
//       } catch (err) {
//         console.error("Error fetching publications:", err);
//       }
//     };

//     if (userId) fetchPublications();
//   }, [userId]);

//   /* 🔎 Filtered publications */
//   const filteredPubs = publications.filter((pub) =>
//     `${pub.title} ${pub.journal} ${pub.year} ${pub.pid || ""}`
//       .toLowerCase()
//       .includes(search.toLowerCase())
//   );

//   return (
//     <div className="publications-container">

//       <h2>📚 Publication History</h2>

//       {/* 🔎 SEARCH BAR */}
//       <input
//         type="text"
//         placeholder="Search publications..."
//         className="search-box"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {/* ⬇️ FULL DOWNLOAD */}
//       <button className="download-btn" onClick={downloadAllPDF}>
//         ⬇️ Download Full History
//       </button>

//       {filteredPubs.length === 0 ? (
//         <p>No publications found.</p>
//       ) : (
//         <ul className="publication-list">
//           {filteredPubs.map((pub, index) => (
//             <li key={index} className="publication-item">

//               <span className="pub-title">{pub.title}</span>

//               <div className="pub-actions">

//                 <button
//                   className="view-btn"
//                   onClick={() => setSelectedPub(pub)}
//                 >
//                   View 
//                 </button>

//                 <button
//                   className="download-single-btn"
//                   onClick={() => downloadSinglePDF(pub)}
//                 >
//                   ⬇️ 
//                 </button>

//               </div>
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* 🔥 POPUP */}
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

//             <p><strong>Journal / Conference:</strong> {selectedPub.journal}</p>
//             <p><strong>Year:</strong> {selectedPub.year}</p>

//             {selectedPub.pid && (
//               <p><strong>PID:</strong> {selectedPub.pid}</p>
//             )}

//             {selectedPub.abstract && (
//               <p><strong>Abstract:</strong> {selectedPub.abstract}</p>
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
// // import "./PublicationsSection.css";
// // import jsPDF from "jspdf";
// // import autoTable from "jspdf-autotable";

// // export default function PublicationsSection({ userId }) {
// //   const [publications, setPublications] = useState([]);
// //   const [selectedPub, setSelectedPub] = useState(null);
// //   const downloadPDF = () => {
// //   const doc = new jsPDF();

// //   doc.setFontSize(16);
// //   // doc.text(`Faculty ID: ${userId}`, 14, 22);
// //   doc.text(`Publication History of ${userId}`, 14, 15);

// //   const tableData = publications.map((pub, index) => [
// //     index + 1,
// //     pub.title,
// //     pub.journal,
// //     pub.year,
// //     pub.pid || "-"
// //   ]);

// //   autoTable(doc, {
// //     startY: 25,
// //     head: [["S.No", "Title", "Journal/Conference", "Year", "PID"]],
// //     body: tableData
// //   });

// //   doc.save("Publication_History.pdf");
// // };
// //   useEffect(() => {
// //     const fetchPublications = async () => {
// //       try {
// //         const res = await fetch(
// //           `${API_BASE_URL}/api/faculty/publication-history/${userId}`
// //         );
// //         const data = await res.json();
// //         setPublications(data.publicationHistory || []);
// //       } catch (err) {
// //         console.error("Error fetching publications:", err);
// //       }
// //     };

// //     if (userId) fetchPublications();
// //   }, [userId]);

// //   return (
// //     <div className="publications-container">
// //       <h2>📚 Publication History</h2>
// //       <button className="download-btn" onClick={downloadPDF}>
// //   Download Publication History
// // </button>
// //       {publications.length === 0 ? (
// //         <p>No published papers yet.</p>
// //       ) : (
// //         <ul className="publication-list">
// //           {publications.map((pub, index) => (
// //             <li key={index} className="publication-item">
// //               <span className="pub-title">{pub.title}</span>

// //               <button
// //                 className="view-btn"
// //                 onClick={() => setSelectedPub(pub)}
// //               >
// //                 View
// //               </button>
// //             </li>
// //           ))}
// //         </ul>
// //       )}

// //       {/* Popup */}
// //       {selectedPub && (
// //         <div className="popup-overlay">
// //           <div className="popup-card">
// //             <button
// //               className="close-btn"
// //               onClick={() => setSelectedPub(null)}
// //             >
// //               ✖
// //             </button>

// //             <h3>{selectedPub.title}</h3>

// //             <p>
// //               <strong>Journal / Conference:</strong> {selectedPub.journal}
// //             </p>

// //             <p>
// //               <strong>Year:</strong> {selectedPub.year}
// //             </p>

// //             {selectedPub.pid && (
// //               <p>
// //                 <strong>PID:</strong> {selectedPub.pid}
// //               </p>
// //             )}

// //             {selectedPub.abstract && (
// //               <p>
// //                 <strong>Abstract:</strong> {selectedPub.abstract}
// //               </p>
// //             )}

// //             {selectedPub.uploadedAt && (
// //               <p>
// //                 <strong>Uploaded Date:</strong>{" "}
// //                 {new Date(selectedPub.uploadedAt).toLocaleDateString()}
// //               </p>
// //             )}
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }



// // // import React, { useEffect, useState } from "react";
// // // import axios from "axios";
// // // import './PulicationsSection.css';
// // // export default function PublicationsSection({ userId }) {
// // //   const [publications, setPublications] = useState([]);

// // //   useEffect(() => {
// // //     const fetchPublications = async () => {
// // //       try {
// // //         const res = await axios.get(
// // //           `${API_BASE_URL}/api/faculty/publication-history/${userId}`
// // //         );

// // //         console.log("API RESPONSE:", res.data);

// // //         setPublications(res.data.publicationHistory || []);
// // //       } catch (error) {
// // //         console.error("Error fetching publications:", error);
// // //       }
// // //     };

// // //     if (userId) fetchPublications();
// // //   }, [userId]);

// // //   return (
// // //     <div>
// // //       <h2>Publication History</h2>

// // //       {publications.length === 0 ? (
// // //         <p>No published papers yet.</p>
// // //       ) : (
// // //         publications.map((pub, index) => (
// // //           <div
// // //             key={index}
// // //             style={{
// // //               border: "1px solid #ddd",
// // //               padding: "10px",
// // //               marginBottom: "10px",
// // //               borderRadius: "6px",
// // //             }}
// // //           >
// // //             <strong>
// // //               {pub.title} — {pub.journal} ({pub.year})
// // //             </strong>

// // //             {pub.pid && (
// // //               <p>
// // //                 <b>PID:</b> {pub.pid}
// // //               </p>
// // //             )}
// // //           </div>
// // //         ))
// // //       )}
// // //     </div>
// // //   );
// // // }