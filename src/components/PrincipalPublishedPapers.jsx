import React, { useState } from "react";

export default function PrincipalPublishedPapers({ approvedPids }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedPaper, setSelectedPaper] = useState(null);

  // Departments for filter
  const departments = ["All", ...new Set(approvedPids.map(p => p.department))];


console.log("Approved PIDs:", approvedPids);

  const filteredPids = approvedPids
  .filter(doc => {
    if (selectedDept !== "All" && doc.department !== selectedDept) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();

    return (
      (doc.paperTitle && doc.paperTitle.toLowerCase().includes(term)) ||
      (doc.userId && doc.userId.toLowerCase().includes(term)) ||
      (doc.uid && doc.uid.toLowerCase().includes(term)) ||
      (doc.pid && doc.pid.toLowerCase().includes(term))
    );
  })
  .sort((a, b) => (a.department || "").localeCompare(b.department || ""));

  const viewDetails = (paper) => setSelectedPaper(paper);
  const closeDetails = () => setSelectedPaper(null);

  // Download CSV
  const downloadCSV = () => {
    if (filteredPids.length === 0) return;

    const headers = [
      "Faculty ID",
      "Faculty Name",
      "Department",
      "Paper Title",
      "UID",
      "PID",
      "Type",
      "Target",
      "Uploaded At"
    ];

    const rows = filteredPids.map(p => [
      p.userId || "",
      p.facultyName || "",
      p.department || "",
      p.paperTitle || "",
      p.uid || "",
      p.pid || "",
      p.type || "",
      p.target || "",
      new Date(p.uploadedAt).toLocaleDateString()
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "published_papers.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Published Papers / Approved PIDs</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>

        <input
          type="text"
          placeholder="Search by Faculty, Paper Title, UID or PID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 250px", padding: "0.5rem" }}
        />

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{ padding: "0.5rem" }}
        >
          {departments.map((dept, i) => (
            <option key={i} value={dept}>{dept}</option>
          ))}
        </select>

        <button
          onClick={downloadCSV}
          style={{
            background: "#10b981",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: 5,
            cursor: "pointer"
          }}
        >
          📥 Download Publication Details
        </button>

      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>

        {filteredPids.length === 0 && <p>No published papers found.</p>}

        {filteredPids.map((doc) => (

          <div
            key={doc._id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              width: 250,
              borderRadius: 8,
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
            }}
          >

            <h4 style={{ fontSize: "15px", lineHeight: "1.4" }}>
  {doc.paperTitle?.trim()}
</h4>
{/* <h4>{doc.paperTitle || "No Title Available"}</h4> */}
            <p><strong>Faculty ID:</strong> {doc.facultyId}</p>

            <p><strong>Department:</strong> {doc.department}</p>

            <button
              onClick={() => viewDetails(doc)}
              style={{
                marginTop: 5,
                padding: "5px 10px",
                borderRadius: 5,
                cursor: "pointer"
              }}
            >
              View Details
            </button>

          </div>

        ))}

      </div>

      {/* Modal */}
      {selectedPaper && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999
          }}
        >

          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              maxWidth: 500,
              width: "90%",
              maxHeight: "90%",
              overflowY: "auto",
              position: "relative"
            }}
          >

            <button
              onClick={closeDetails}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: 18,
                cursor: "pointer",
                background: "transparent",
                border: "none"
              }}
            >
              ✖
            </button>

            <h3>{selectedPaper.paperTitle?.trim()}</h3>

            <p><strong>Faculty ID:</strong> {selectedPaper.facultyId}</p>

            <p><strong>Faculty Name:</strong> {selectedPaper.facultyName}</p>

            <p><strong>Department:</strong> {selectedPaper.department}</p>

            <p><strong>UID:</strong> {selectedPaper.uid}</p>

            <p><strong>PID:</strong> {selectedPaper.pid}</p>

            <p><strong>Type:</strong> {selectedPaper.type}</p>

            <p><strong>Target:</strong> {selectedPaper.target}</p>

            {/* <p>
              <strong>Uploaded:</strong>{" "}
              {new Date(selectedPaper.uploadedAt).toLocaleDateString()}
            </p> */}

          </div>

        </div>

      )}

    </div>
  );
}