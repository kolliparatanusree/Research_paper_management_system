/* File: src/components/faculty/DocumentUploadSection.jsx */

import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "./DocumentUploadSection.css";
import { API_BASE_URL } from "../../config.js";
export default function DocumentUploadSection({ userId }) {
  const [approvedUIDs, setApprovedUIDs] = useState([]);
  const [uploadedUIDs, setUploadedUIDs] = useState([]);
  const [documents, setDocuments] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [loadingUid, setLoadingUid] = useState(null);

  const [editingUid, setEditingUid] = useState(null);
  const [editData, setEditData] = useState({});

  const [expandedUid, setExpandedUid] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  /* =====================================================
     FETCH APPROVED + UPLOADED UIDS
  ===================================================== */

  useEffect(() => {
    if (!userId) return;

    const fetchApprovedUIDs = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/faculty/approved-uid-requests/${userId}`
        );

        const data = await res.json();
        setApprovedUIDs(data || []);
      } catch (err) {
        console.error("Error fetching approved UID requests:", err);
      }
    };

    const fetchUploadedUIDs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/faculty/uploaded-uids/${userId}`);

        const data = await res.json();
        setUploadedUIDs(data || []);
      } catch (err) {
        console.error("Error fetching uploaded UIDs:", err);
      }
    };

    fetchApprovedUIDs();
    fetchUploadedUIDs();
  }, [userId]);

  /* =====================================================
     RESET PAGE WHEN SEARCH CHANGES
  ===================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /* =====================================================
     HANDLE DOCUMENT FIELD CHANGE
  ===================================================== */

  const handleFileChange = (uid, field, value) => {
    setDocuments((prev) => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        [field]: value,
      },
    }));
  };

  /* =====================================================
     HANDLE EDIT FIELD CHANGE
  ===================================================== */

  const handleEditChange = (uid, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        [field]: value,
      },
    }));
  };

  /* =====================================================
     START EDITING
  ===================================================== */

  const startEditing = (uid) => {
    setEditingUid(uid.uid);

    setEditData((prev) => ({
      ...prev,
      [uid.uid]: {
        paperTitle: uid.paperTitle,
        target: uid.target,
        abstract: uid.abstract,
        type: uid.type,

        coAuthors: Array.isArray(uid.coAuthors)
          ? uid.coAuthors
          : Array.isArray(uid.coAuthors?.authors)
          ? uid.coAuthors.authors
          : [],
      },
    }));

    setExpandedUid(uid.uid);
  };

  /* =====================================================
     SAVE EDIT
  ===================================================== */

  const handleSave = async (uid) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/update-uid/${uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData[uid]),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update UID");
      }

      Swal.fire({
        title: "Updated!",
        text: data.message || "UID updated successfully",
        icon: "success",
        confirmButtonColor: "#2563eb",
      });

      setEditingUid(null);

      window.location.reload();
    } catch (err) {
      console.error(err);

      Swal.fire({
        title: "Error",
        text: err.message || "Failed to update UID",
        icon: "error",
      });
    }
  };

  /* =====================================================
     ADD CO-AUTHOR
  ===================================================== */

  const addCoAuthor = (uid) => {
    Swal.fire({
      title: "Add Co-Author",

      html: `
        <input 
          type="text" 
          id="coAuthorName" 
          class="swal2-input" 
          placeholder="Enter Name"
        >

        <select 
          id="coAuthorAffiliation" 
          class="swal2-select"
        >
          <option value="">Select Affiliation</option>
          <option value="SVECW">SVECW</option>
          <option value="VIT BVRITN">VIT BVRITN</option>
          <option value="BVRITH">BVRITH</option>
          <option value="Other">Other</option>
        </select>

        <input 
          type="text" 
          id="otherAffiliation" 
          class="swal2-input" 
          placeholder="Enter College Name"
          style="display:none;"
        >
      `,

      didOpen: () => {
        const select =
          Swal.getPopup().querySelector("#coAuthorAffiliation");

        const otherInput =
          Swal.getPopup().querySelector("#otherAffiliation");

        select.addEventListener("change", (e) => {
          otherInput.style.display =
            e.target.value === "Other" ? "block" : "none";
        });
      },

      focusConfirm: false,
      showCancelButton: true,

      confirmButtonText: "Add",
      cancelButtonText: "Cancel",

      preConfirm: () => {
        const name =
          Swal.getPopup().querySelector("#coAuthorName").value.trim();

        const selectValue =
          Swal.getPopup().querySelector("#coAuthorAffiliation").value;

        const otherValue =
          Swal.getPopup().querySelector("#otherAffiliation").value.trim();

        const affiliation =
          selectValue === "Other" ? otherValue : selectValue;

        if (!name || !affiliation) {
          Swal.showValidationMessage(
            "Please enter both name and affiliation"
          );

          return null;
        }

        return {
          name,
          affiliation,
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      const newAuthor = result.value;

      const updated = [
        ...(editData[uid]?.coAuthors || []),
        newAuthor,
      ];

      setEditData((prev) => ({
        ...prev,
        [uid]: {
          ...prev[uid],
          coAuthors: updated,
        },
      }));
    });
  };

  /* =====================================================
     REMOVE CO-AUTHOR
  ===================================================== */

  const removeCoAuthor = (uid, index) => {
    const updated = editData[uid].coAuthors.filter(
      (_, i) => i !== index
    );

    setEditData((prev) => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        coAuthors: updated,
      },
    }));
  };

  /* =====================================================
     DOCUMENT UPLOAD
  ===================================================== */

  const handleDocumentUpload = async (uid) => {
    setLoadingUid(uid);

    const formData = new FormData();

    formData.append("userId", userId);
    formData.append("uid", uid);

    const docData = documents[uid] || {};

    if (docData.indexingProof) {
      formData.append(
        "indexingProof",
        docData.indexingProof
      );
    }

    if (docData.paymentReceipt) {
      formData.append(
        "paymentReceipt",
        docData.paymentReceipt
      );
    }

    if (docData.publishedPaperPdf) {
      formData.append(
        "publishedPaperPdf",
        docData.publishedPaperPdf
      );
    }

    formData.append(
      "journalName",
      docData.journalName || ""
    );

    formData.append(
      "conferenceName",
      docData.conferenceName || ""
    );

    formData.append(
      "bookTitle",
      docData.bookTitle || ""
    );

    formData.append(
      "issn",
      docData.issn || ""
    );

    formData.append(
      "isbn",
      docData.isbn || ""
    );

    formData.append(
      "publisher",
      docData.publisher || ""
    );

    formData.append(
      "indexing",
      docData.indexing || ""
    );

    formData.append(
      "location",
      docData.location || ""
    );

    formData.append(
      "dates",
      docData.dates || ""
    );

    formData.append(
      "patentNumber",
      docData.patentNumber || ""
    );

    formData.append(
      "patentOffice",
      docData.patentOffice || ""
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/faculty/upload-documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Upload failed"
        );
      }

      await Swal.fire({
        title: "Upload Successful!",
        text:
          data?.message ||
          "Your documents have been uploaded.",
        icon: "success",
        confirmButtonColor: "#2563eb",
      });

      setDocuments((prev) => ({
        ...prev,
        [uid]: {},
      }));

      setApprovedUIDs((prev) =>
        prev.filter((r) => r.uid !== uid)
      );

      setExpandedUid(null);
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Upload Failed",
        err?.message || "Something went wrong.",
        "error"
      );
    } finally {
      setLoadingUid(null);
    }
  };

  /* =====================================================
     FILTER DATA
  ===================================================== */

  const uploadedUIDStrings = uploadedUIDs.map(
    (u) => u.uid
  );

  // const filteredApprovedUIDs = useMemo(() => {
  //   const q = searchQuery.toLowerCase().trim();

  //   return approvedUIDs
  //     .filter(
  //       (uid) =>
  //         !uploadedUIDStrings.includes(uid.uid)
  //     )
  //     .filter((uid) => {
  //       if (!q) return true;

  //       return (
  //         uid.uid?.toLowerCase().includes(q) ||
  //         uid.paperTitle?.toLowerCase().includes(q) ||
  //         uid.type?.toLowerCase().includes(q) ||
  //         uid.target?.toLowerCase().includes(q)
  //       );
  //     });
  // }, [
  //   approvedUIDs,
  //   uploadedUIDStrings,
  //   searchQuery,
  // ]);
  const filteredApprovedUIDs = useMemo(() => {
  const q = searchQuery.toLowerCase().trim();

  const filtered = approvedUIDs
    .filter(
      (uid) =>
        !uploadedUIDStrings.includes(uid.uid)
    )
    .filter((uid) => {
      if (!q) return true;

      return (
        uid.uid?.toLowerCase().includes(q) ||
        uid.paperTitle?.toLowerCase().includes(q) ||
        uid.type?.toLowerCase().includes(q) ||
        uid.target?.toLowerCase().includes(q)
      );
    });

  return [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "title-asc":
        return (a.paperTitle || "").localeCompare(
          b.paperTitle || ""
        );

      case "title-desc":
        return (b.paperTitle || "").localeCompare(
          a.paperTitle || ""
        );

      case "type":
        return (a.type || "").localeCompare(
          b.type || ""
        );

      case "target":
        return (a.target || "").localeCompare(
          b.target || ""
        );

      case "uid-asc":
        return (a.uid || "").localeCompare(
          b.uid || ""
        );

      case "uid-desc":
        return (b.uid || "").localeCompare(
          a.uid || ""
        );

      case "newest":
        return (
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
        );

      case "oldest":
        return (
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
        );

      default:
        return 0;
    }
  });
}, [
  approvedUIDs,
  uploadedUIDStrings,
  searchQuery,
  sortOption,
]);
  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.ceil(
    filteredApprovedUIDs.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const paginatedUIDs =
    filteredApprovedUIDs.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  /* =====================================================
     PAGE CHANGE
  ===================================================== */

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     PUBLICATION ICON
  ===================================================== */

  const getTypeIcon = (type) => {
    switch (type) {
      case "Journal":
        return "📰";

      case "Conference":
        return "🎤";

      case "Book":
        return "📚";

      case "Book Chapter":
        return "📖";

      case "Patent":
        return "📜";

      default:
        return "📄";
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="approved-uid-section">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="documents-header">

        <div>
          <h2>Approved UID Requests</h2>

          <p>
            Upload publication documents for your
            approved research papers.
          </p>
        </div>

        <div className="request-count">
          <strong>
            {filteredApprovedUIDs.length}
          </strong>

          <span>
            {filteredApprovedUIDs.length === 1
              ? "Request"
              : "Requests"}
          </span>
        </div>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}
{approvedUIDs.length > 0 && (
  <div className="uid-controls">

    {/* SEARCH */}
    <div className="uid-search-wrapper">

      <span className="search-icon">
        🔍
      </span>

      <input
        type="text"
        placeholder="Search by UID, title, type or target..."
        value={searchQuery}
        onChange={(e) =>
          setSearchQuery(e.target.value)
        }
      />

      {searchQuery && (
        <button
          className="clear-search"
          onClick={() => setSearchQuery("")}
        >
          ✕
        </button>
      )}

    </div>

    {/* SORT */}
    <div className="uid-sort-wrapper">

      <span className="sort-icon">
        ↕️
      </span>

      <select
        value={sortOption}
        onChange={(e) => {
          setSortOption(e.target.value);
          setCurrentPage(1);
        }}
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

        <option value="type">
          Publication Type
        </option>

        <option value="target">
          Target
        </option>

        <option value="uid-asc">
          UID A–Z
        </option>

        <option value="uid-desc">
          UID Z–A
        </option>
      </select>

    </div>

  </div>
)}
   
      {/* {approvedUIDs.length > 0 && (
        <div className="uid-search-wrapper">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search by UID, title, type or target..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
          />


          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}

        </div>
      )} */}

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {filteredApprovedUIDs.length === 0 ? (

        <div className="uid-empty-state">

          <div className="empty-icon">
            📂
          </div>

          <h3>
            {searchQuery
              ? "No matching requests"
              : "No approved UID requests"}
          </h3>

          <p>
            {searchQuery
              ? "Try searching with a different UID, title, type or target."
              : "Approved UID requests will appear here."}
          </p>

          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          )}

        </div>

      ) : (

        <>
          {/* =================================================
              CARDS
          ================================================= */}

          <div className="uid-card-list">

            {paginatedUIDs.map((uid) => {

              const isExpanded =
                expandedUid === uid.uid;

              const isEditing =
                editingUid === uid.uid;

              const currentDocuments =
                documents[uid.uid] || {};

              return (
                <div
                  key={uid._id}
                  className={`uid-card ${
                    isExpanded
                      ? "uid-card-expanded"
                      : ""
                  }`}
                >

                  {/* =========================================
                      CARD HEADER
                  ========================================= */}

                  <div className="uid-card-header">

                    <div className="uid-card-title">

                      {isEditing ? (

                        <input
                          className="edit-title-input"
                          type="text"
                          value={
                            editData[uid.uid]
                              ?.paperTitle || ""
                          }
                          onChange={(e) =>
                            handleEditChange(
                              uid.uid,
                              "paperTitle",
                              e.target.value
                            )
                          }
                        />

                      ) : (

                        <h3>
                          {uid.paperTitle}
                        </h3>

                      )}

                      <div className="uid-meta">

                        <span className="uid-number">
                          UID: {uid.uid}
                        </span>

                        <span
                          className={`type-badge type-${uid.type
                            ?.toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {getTypeIcon(uid.type)}{" "}
                          {uid.type}
                        </span>

                      </div>

                    </div>

                    <button
                      className="edit-btn"
                      onClick={() =>
                        isEditing
                          ? setEditingUid(null)
                          : startEditing(uid)
                      }
                    >
                      {isEditing
                        ? "✕ Cancel Edit"
                        : "📝 Edit"}
                    </button>

                  </div>

                  {/* =========================================
                      QUICK INFO
                  ========================================= */}

                  <div className="uid-quick-info">

                    <div className="quick-info-item">

                      <span>
                        🎯 Target
                      </span>

                      <strong>
                        {uid.target || "Not specified"}
                      </strong>

                    </div>

                    <div className="quick-info-item">

                      <span>
                        📄 Publication
                      </span>

                      <strong>
                        {uid.type}
                      </strong>

                    </div>

                  </div>

                  {/* =========================================
                      SHOW DETAILS BUTTON
                  ========================================= */}

                  <button
                    type="button"
                    className="see-more-btn"
                    onClick={() =>
                      setExpandedUid(
                        isExpanded
                          ? null
                          : uid.uid
                      )
                    }
                  >
                    <span>
                      {isExpanded
                        ? "🔼 Hide Details"
                        : "🔽 Show Details"}
                    </span>
                  </button>

                  {/* =========================================
                      EXPANDED DETAILS
                  ========================================= */}

                  {isExpanded && (

                    <div className="uid-expanded-info">

                      {/* ===================================
                          PUBLICATION DETAILS
                      =================================== */}

                      <div className="section-heading">
                        <div>
                          <h4>
                            Publication Details
                          </h4>

                          <p>
                            Basic information about
                            this research publication.
                          </p>
                        </div>
                      </div>

                      {/* TYPE */}

                      <div className="form-group">

                        <label>
                          Type of Publication
                        </label>

                        {isEditing ? (

                          <select
                            value={
                              editData[uid.uid]?.type ||
                              ""
                            }
                            onChange={(e) =>
                              handleEditChange(
                                uid.uid,
                                "type",
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Select Type
                            </option>

                            <option value="Journal">
                              Journal
                            </option>

                            <option value="Conference">
                              Conference
                            </option>

                            <option value="Book">
                              Book
                            </option>

                            <option value="Book Chapter">
                              Book Chapter
                            </option>

                            <option value="Patent">
                              Patent
                            </option>
                          </select>

                        ) : (

                          <div className="readonly-value">
                            {getTypeIcon(uid.type)}{" "}
                            {uid.type}
                          </div>

                        )}

                      </div>

                      {/* TARGET */}

                      <div className="form-group">

                        <label>
                          Target
                        </label>

                        {isEditing ? (

                          <input
                            type="text"
                            value={
                              editData[uid.uid]?.target ||
                              ""
                            }
                            onChange={(e) =>
                              handleEditChange(
                                uid.uid,
                                "target",
                                e.target.value
                              )
                            }
                          />

                        ) : (

                          <div className="readonly-value">
                            {uid.target ||
                              "Not specified"}
                          </div>

                        )}

                      </div>

                      {/* ABSTRACT */}

                      <div className="form-group">

                        <label>
                          Abstract
                        </label>

                        {isEditing ? (

                          <textarea
                            rows="5"
                            value={
                              editData[uid.uid]
                                ?.abstract || ""
                            }
                            onChange={(e) =>
                              handleEditChange(
                                uid.uid,
                                "abstract",
                                e.target.value
                              )
                            }
                          />

                        ) : (

                          <div className="abstract-box">
                            {uid.abstract ||
                              "No abstract provided."}
                          </div>

                        )}

                      </div>

                      {/* ===================================
                          CO AUTHORS
                      =================================== */}

                      <div className="details-section">

                        <div className="section-heading">

                          <div>
                            <h4>
                              Co-Authors
                            </h4>

                            <p>
                              Authors associated with
                              this publication.
                            </p>
                          </div>

                          {isEditing && (
                            <button
                              className="add-coauthor-btn"
                              onClick={() =>
                                addCoAuthor(uid.uid)
                              }
                            >
                              ➕ Add Co-Author
                            </button>
                          )}

                        </div>

                        {isEditing ? (

                          <div className="coauthor-list">

                            {(
                              editData[uid.uid]
                                ?.coAuthors || []
                            ).length === 0 ? (

                              <div className="no-coauthors">
                                No co-authors added.
                              </div>

                            ) : (

                              (
                                editData[uid.uid]
                                  ?.coAuthors || []
                              ).map(
                                (author, index) => (

                                  <div
                                    key={index}
                                    className="coauthor-row"
                                  >

                                    <input
                                      type="text"
                                      placeholder="Author Name"
                                      value={
                                        author.name ||
                                        ""
                                      }
                                      onChange={(e) => {

                                        const updated =
                                          [
                                            ...editData[
                                              uid.uid
                                            ]
                                              .coAuthors,
                                          ];

                                        updated[
                                          index
                                        ] = {
                                          ...updated[
                                            index
                                          ],
                                          name: e.target
                                            .value,
                                        };

                                        setEditData(
                                          (prev) => ({
                                            ...prev,
                                            [uid.uid]: {
                                              ...prev[
                                                uid.uid
                                              ],
                                              coAuthors:
                                                updated,
                                            },
                                          })
                                        );

                                      }}
                                    />

                                    <input
                                      type="text"
                                      placeholder="Affiliation"
                                      value={
                                        author.affiliation ||
                                        ""
                                      }
                                      onChange={(e) => {

                                        const updated =
                                          [
                                            ...editData[
                                              uid.uid
                                            ]
                                              .coAuthors,
                                          ];

                                        updated[
                                          index
                                        ] = {
                                          ...updated[
                                            index
                                          ],
                                          affiliation:
                                            e.target
                                              .value,
                                        };

                                        setEditData(
                                          (prev) => ({
                                            ...prev,
                                            [uid.uid]: {
                                              ...prev[
                                                uid.uid
                                              ],
                                              coAuthors:
                                                updated,
                                            },
                                          })
                                        );

                                      }}
                                    />

                                    <button
                                      type="button"
                                      className="remove-coauthor-btn"
                                      onClick={() =>
                                        removeCoAuthor(
                                          uid.uid,
                                          index
                                        )
                                      }
                                    >
                                      ❌
                                    </button>

                                  </div>

                                )
                              )

                            )}

                          </div>

                        ) : (

                          <ul className="coauthor-display-list">

                            {Array.isArray(
                              uid.coAuthors
                            ) &&
                            uid.coAuthors.length > 0 ? (

                              uid.coAuthors.map(
                                (
                                  author,
                                  index
                                ) => (

                                  <li key={index}>
                                    <span className="author-avatar">
                                      {author.name
                                        ?.charAt(
                                          0
                                        )
                                        ?.toUpperCase() ||
                                        "A"}
                                    </span>

                                    <div>
                                      <strong>
                                        {author.name}
                                      </strong>

                                      <small>
                                        {
                                          author.affiliation
                                        }
                                      </small>
                                    </div>

                                  </li>

                                )
                              )

                            ) : (

                              <li className="no-coauthors">
                                No co-authors added.
                              </li>

                            )}

                          </ul>

                        )}

                      </div>

                      {/* ===================================
                          SAVE EDIT
                      =================================== */}

                      {isEditing && (

                        <div className="edit-actions">

                          <button
                            className="save-btn"
                            onClick={() =>
                              handleSave(uid.uid)
                            }
                          >
                            💾 Save Changes
                          </button>

                          <button
                            className="cancel-btn"
                            onClick={() =>
                              setEditingUid(null)
                            }
                          >
                            Cancel
                          </button>

                        </div>

                      )}

                      {/* ===================================
                          DOCUMENT UPLOAD
                      =================================== */}

                      <div className="upload-section">

                        <div className="section-heading">

                          <div>
                            <h4>
                              📁 Upload Documents
                            </h4>

                            <p>
                              Upload the required
                              publication documents
                              in PDF format.
                            </p>
                          </div>

                        </div>

                        {/* JOURNAL */}

                        {uid.type === "Journal" && (

                          <div className="publication-fields">

                            <div className="form-group">

                              <label>
                                Journal Name
                              </label>

                              <input
                                type="text"
                                placeholder="Enter Journal Name"
                                value={
                                  currentDocuments
                                    .journalName ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleFileChange(
                                    uid.uid,
                                    "journalName",
                                    e.target.value
                                  )
                                }
                              />

                            </div>

                            <div className="form-group">

                              <label>
                                ISSN
                              </label>

                              <input
                                type="text"
                                placeholder="Enter ISSN"
                                value={
                                  currentDocuments
                                    .issn || ""
                                }
                                onChange={(e) =>
                                  handleFileChange(
                                    uid.uid,
                                    "issn",
                                    e.target.value
                                  )
                                }
                              />

                            </div>

                            <div className="form-group">

                              <label>
                                Publisher
                              </label>

                              <input
                                type="text"
                                placeholder="Enter Publisher"
                                value={
                                  currentDocuments
                                    .publisher || ""
                                }
                                onChange={(e) =>
                                  handleFileChange(
                                    uid.uid,
                                    "publisher",
                                    e.target.value
                                  )
                                }
                              />

                            </div>

                            <div className="form-group">

                              <label>
                                Indexing
                              </label>

                              <select
                                value={
                                  currentDocuments
                                    .indexing || ""
                                }
                                onChange={(e) =>
                                  handleFileChange(
                                    uid.uid,
                                    "indexing",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select Indexing
                                </option>

                                <option value="Scopus">
                                  Scopus
                                </option>

                                <option value="SCI">
                                  SCI
                                </option>

                                <option value="Web of Science">
                                  Web of Science
                                </option>

                                <option value="UGC Care">
                                  UGC Care
                                </option>
                              </select>

                            </div>

                          </div>

                        )}

                        {/* FILE UPLOADS */}

                        <div className="file-upload-grid">

                          {/* PAYMENT */}

                          <div className="file-upload-card">

                            <div className="file-icon">
                              💳
                            </div>

                            <div className="file-info">

                              <h5>
                                Payment Receipt
                              </h5>

                              <p>
                                PDF only
                              </p>

                            </div>

                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) =>
                                handleFileChange(
                                  uid.uid,
                                  "paymentReceipt",
                                  e.target.files[0]
                                )
                              }
                            />

                            {currentDocuments.paymentReceipt && (

                              <span className="selected-file">
                                ✓{" "}
                                {
                                  currentDocuments
                                    .paymentReceipt
                                    .name
                                }
                              </span>

                            )}

                          </div>

                          {/* INDEXING */}

                          {(uid.type === "Journal" ||
                            uid.type ===
                              "Conference") && (

                            <div className="file-upload-card">

                              <div className="file-icon">
                                📑
                              </div>

                              <div className="file-info">

                                <h5>
                                  Indexing Proof
                                </h5>

                                <p>
                                  PDF only
                                </p>

                              </div>

                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) =>
                                  handleFileChange(
                                    uid.uid,
                                    "indexingProof",
                                    e.target
                                      .files[0]
                                  )
                                }
                              />

                              {currentDocuments.indexingProof && (

                                <span className="selected-file">
                                  ✓{" "}
                                  {
                                    currentDocuments
                                      .indexingProof
                                      .name
                                  }
                                </span>

                              )}

                            </div>

                          )}

                          {/* PUBLISHED PAPER */}

                          <div className="file-upload-card">

                            <div className="file-icon">
                              📄
                            </div>

                            <div className="file-info">

                              <h5>
                                Published Paper
                              </h5>

                              <p>
                                PDF only
                              </p>

                            </div>

                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) =>
                                handleFileChange(
                                  uid.uid,
                                  "publishedPaperPdf",
                                  e.target.files[0]
                                )
                              }
                            />

                            {currentDocuments.publishedPaperPdf && (

                              <span className="selected-file">
                                ✓{" "}
                                {
                                  currentDocuments
                                    .publishedPaperPdf
                                    .name
                                }
                              </span>

                            )}

                          </div>

                        </div>

                        {/* SUBMIT */}

                        <div className="upload-submit-area">

                          <button
                            className="submit-documents-btn"
                            onClick={() =>
                              handleDocumentUpload(
                                uid.uid
                              )
                            }
                            disabled={
                              loadingUid === uid.uid
                            }
                          >
                            {loadingUid === uid.uid
                              ? "⏳ Uploading..."
                              : "📤 Submit Documents"}
                          </button>

                        </div>

                      </div>

                    </div>

                  )}

                </div>
              );
            })}

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {filteredApprovedUIDs.length >
            itemsPerPage && (

            <div className="pagination">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  changePage(currentPage - 1)
                }
              >
                ← Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => {

                  const page = i + 1;

                  return (
                    <button
                      key={page}
                      className={
                        currentPage === page
                          ? "active-page"
                          : ""
                      }
                      onClick={() =>
                        changePage(page)
                      }
                    >
                      {page}
                    </button>
                  );

                }
              )}

              <button
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  changePage(currentPage + 1)
                }
              >
                Next →
              </button>

            </div>

          )}

        </>

      )}

    </div>
  );
}


// /* File: src/components/faculty/DocumentUploadSection.jsx */
// import React, { useEffect, useState } from "react";
// import Swal from "sweetalert2";
// import './DocumentUploadSection.css';

// export default function DocumentUploadSection({ userId }) {
//   const [approvedUIDs, setApprovedUIDs] = useState([]);
//   const [uploadedUIDs, setUploadedUIDs] = useState([]);
//   const [documents, setDocuments] = useState({});
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loadingUid, setLoadingUid] = useState(null);
//   const [editingUid, setEditingUid] = useState(null);
//   const [editData, setEditData] = useState({});

//   const [expandedUid, setExpandedUid] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
// const itemsPerPage = 3; // change as needed
//   useEffect(() => {
//     if (!userId) return;

//     const fetchApprovedUIDs = async () => {
//       try {
//         const res = await fetch(
//           `${API_BASE_URL}/api/faculty/approved-uid-requests/${userId}`
//         );
//         const data = await res.json();
//         setApprovedUIDs(data);
//       } catch (err) {
//         console.error("Error fetching approved UID requests:", err);
//       }
//     };

//     const fetchUploadedUIDs = async () => {
//       try {
//         const res = await fetch(
//           `${API_BASE_URL}/api/faculty/uploaded-uids/${userId}`
//         );
//         const data = await res.json();
//         setUploadedUIDs(data || []);
//       } catch (err) {
//         console.error("Error fetching uploaded UIDs:", err);
//       }
//     };

//     fetchApprovedUIDs();
//     fetchUploadedUIDs();
//   }, [userId]);

//   useEffect(() => {
//   setCurrentPage(1);
// }, [searchQuery]);

//   const handleFileChange = (uid, field, value) => {
//     setDocuments((prev) => ({
//       ...prev,
//       [uid]: {
//         ...prev[uid],
//         [field]: value,
//       },
//     }));
//   };

//   const handleEditChange = (uid, field, value) => {
//     setEditData((prev) => ({
//       ...prev,
//       [uid]: {
//         ...prev[uid],
//         [field]: value,
//       },
//     }));
//   };

//   const handleSave = async (uid) => {
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/api/faculty/update-uid/${uid}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(editData[uid]),
//         }
//       );
//       const data = await res.json();
//       Swal.fire("Updated!", data.message || "UID updated successfully", "success");
//       setEditingUid(null);
//       window.location.reload();
//     } catch (err) {
//       console.error(err);
//       Swal.fire("Error", "Failed to update UID", "error");
//     }
//   };

//   const handleDocumentUpload = async (uid) => {
//     setLoadingUid(uid);
//     const formData = new FormData();
//     formData.append("userId", userId);
//     formData.append("uid", uid);

//     const docData = documents[uid] || {};
//     if (docData?.indexingProof) formData.append("indexingProof", docData.indexingProof);
//     if (docData?.paymentReceipt) formData.append("paymentReceipt", docData.paymentReceipt);
//     if (docData?.publishedPaperPdf)
//       formData.append("publishedPaperPdf", docData.publishedPaperPdf);

//     formData.append("journalName", docData?.journalName || "");
//     formData.append("conferenceName", docData?.conferenceName || "");
//     formData.append("bookTitle", docData?.bookTitle || "");
//     formData.append("issn", docData?.issn || "");
//     formData.append("isbn", docData?.isbn || "");
//     formData.append("publisher", docData?.publisher || "");
//     formData.append("indexing", docData?.indexing || "");
//     formData.append("location", docData?.location || "");
//     formData.append("dates", docData?.dates || "");
//     formData.append("patentNumber", docData?.patentNumber || "");
//     formData.append("patentOffice", docData?.patentOffice || "");

//     try {
//       const res = await fetch(`${API_BASE_URL}/api/faculty/upload-documents", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       Swal.fire({
//         title: "Upload Successful!",
//         text: data?.message || "Your documents have been uploaded.",
//         icon: "success",
//       });
//       setDocuments((prev) => ({
//         ...prev,
//         [uid]: {},
//       }));
//       setApprovedUIDs((prev) => prev.filter((r) => r.uid !== uid));
//     } catch (err) {
//       console.error(err);
//       Swal.fire("Upload Failed", err?.message || "Something went wrong.", "error");
//     } finally {
//       setLoadingUid(null);
//     }
//   };

//   const uploadedUIDStrings = uploadedUIDs.map((u) => u.uid);
//   const filteredApprovedUIDs = approvedUIDs
//     .filter((uid) => !uploadedUIDStrings.includes(uid.uid))
//     .filter((uid) => {
//       const q = searchQuery.toLowerCase();
//       return (
//         uid.uid?.toLowerCase().includes(q) ||
//         uid.paperTitle?.toLowerCase().includes(q) ||
//         uid.type?.toLowerCase().includes(q) ||
//         uid.target?.toLowerCase().includes(q)
//       );
//     });
//     // 🔥 Pagination calculations
// const totalPages = Math.ceil(filteredApprovedUIDs.length / itemsPerPage);

// const startIndex = (currentPage - 1) * itemsPerPage;

// const paginatedUIDs = filteredApprovedUIDs.slice(
//   startIndex,
//   startIndex + itemsPerPage
// );

//   return (
//     <div className="approved-uid-section">
//       {approvedUIDs.length > 0 && (
//         <input
//           type="text"
//           placeholder="Search UID by UID, title, type, target..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
          
//         />
//       )}

//       {filteredApprovedUIDs.length === 0 ? (
//         <p>No approved UID requests found.</p>
//       ) : (
//         paginatedUIDs.map((uid) => (
//           <div key={uid._id} className="uid-card">
//             <div >
//               {/* <h4>UID Details</h4> */}
//               {editingUid !== uid.uid && (
//                 <button
//                   onClick={() => {
//                     setEditingUid(uid.uid);
//                     setEditData((prev) => ({
//                       ...prev,
//                       [uid.uid]: {
//                         paperTitle: uid.paperTitle,
//                         target: uid.target,
//                         abstract: uid.abstract,
//                         type: uid.type,
//                         // coAuthors: uid.coAuthors || [],
//                         coAuthors: Array.isArray(uid.coAuthors)
//   ? uid.coAuthors
//   : Array.isArray(uid.coAuthors?.authors)
//   ? uid.coAuthors.authors
//   : [],
//                       },
//                     }));
//                   }}
//                   className="edit-btn"
//                 >
//                  📝 Edit
//                 </button>
//               )}
//             </div>

//             {/* Paper Title */}
//             {/* <p><strong>Paper Title:</strong></p> */}
//             {editingUid === uid.uid ? (
//               <input
//                 type="text"
//                 value={editData[uid.uid]?.paperTitle || ""}
//                 onChange={(e) => handleEditChange(uid.uid, "paperTitle", e.target.value)}
//               />
//             ) : (
//               <h3 style={{ textAlign: "center" }}>{uid.paperTitle}</h3>
//             )}

//             {/* UID */}
//             <p><strong>UID:</strong> {uid.uid}</p>
//           <button
//   type="button"
//   className="see-more-btn"
//   onClick={() =>
//     setExpandedUid(
//       expandedUid === uid.uid ? null : uid.uid
//     )
//   }
// >
//   {expandedUid === uid.uid
//     ? "🔼 Hide Details"
//     : "🔽 Show Details"}
// </button>

// {expandedUid === uid.uid && (
//   <div className="uid-expanded-info">
//             {/* Type */}
//             <p><strong>Type of Publication:</strong></p>
//             {editingUid === uid.uid ? (
//               <select
//                 value={editData[uid.uid]?.type || ""}
//                 onChange={(e) => handleEditChange(uid.uid, "type", e.target.value)}
//               >
//                 <option value="Journal">Journal</option>
//                 <option value="Conference">Conference</option>
//                 <option value="Book">Book</option>
//                 <option value="Book Chapter">Book Chapter</option>
//                 <option value="Patent">Patent</option>
//               </select>
//             ) : (
//               <p>{uid.type}</p>
              
//             )}

//             {/* Co Authors */}
//             <p><strong>Co Authors:</strong></p>
            
//             {editingUid === uid.uid ? (
//               <div>
//                 {(editData[uid.uid]?.coAuthors || []).map((author, index) => (
//                   <div key={index} className="coauthor-row">
//                     <input
//                       type="text"
//                       placeholder="Author Name"
//                       value={author.name}
//                       onChange={(e) => {
//                         const updated = [...editData[uid.uid].coAuthors];
//                         updated[index].name = e.target.value;
//                         setEditData((prev) => ({
//                           ...prev,
//                           [uid.uid]: { ...prev[uid.uid], coAuthors: updated },
//                         }));
//                       }}
//                     />
//                     <input
//                       type="text"
//                       placeholder="Affiliation"
//                       value={author.affiliation}
//                       onChange={(e) => {
//                         const updated = [...editData[uid.uid].coAuthors];
//                         updated[index].affiliation = e.target.value;
//                         setEditData((prev) => ({
//                           ...prev,
//                           [uid.uid]: { ...prev[uid.uid], coAuthors: updated },
//                         }));
//                       }}
//                     />
//                     <button
//                       onClick={() => {
//                         const updated = editData[uid.uid].coAuthors.filter((_, i) => i !== index);
//                         setEditData((prev) => ({
//                           ...prev,
//                           [uid.uid]: { ...prev[uid.uid], coAuthors: updated },
//                         }));
//                       }}
                     
//                     >
//                       ❌
//                     </button>
//                   </div>
//                 ))}

//               <button
//   onClick={() => {
//     Swal.fire({
//       title: 'Add Co-Author',
//       html: `
//         <input type="text" id="coAuthorName" class="swal2-input" placeholder="Enter Name">
//         <select id="coAuthorAffiliation" class="swal2-select">
//           <option value="">Select Affiliation</option>
//           <option value="SVECW">SVECW</option>
//           <option value="VIT BVRITN">VIT BVRITN</option>
//           <option value="BVRITH">BVRITH</option>
//           <option value="Other">Other</option>
//         </select>
//         <input type="text" id="otherAffiliation" class="swal2-input" placeholder="Enter College Name" style="display:none;">
//       `,
//       didOpen: () => {
//         const select = Swal.getPopup().querySelector('#coAuthorAffiliation');
//         const otherInput = Swal.getPopup().querySelector('#otherAffiliation');
//         select.addEventListener('change', (e) => {
//           if (e.target.value === 'Other') {
//             otherInput.style.display = 'block';
//           } else {
//             otherInput.style.display = 'none';
//           }
//         });
//       },
//       focusConfirm: false,
//       showCancelButton: true,
//       preConfirm: () => {
//         const name = Swal.getPopup().querySelector('#coAuthorName').value;
//         const selectValue = Swal.getPopup().querySelector('#coAuthorAffiliation').value;
//         const otherValue = Swal.getPopup().querySelector('#otherAffiliation').value;

//         const affiliation = selectValue === 'Other' ? otherValue : selectValue;

//         if (!name || !affiliation) {
//           Swal.showValidationMessage(`Please enter both name and affiliation`);
//           return null;
//         }

//         return { name, affiliation };
//       },
//     }).then((result) => {
//       if (result.isConfirmed) {
//         const newAuthor = result.value;
//         const updated = [...(editData[uid.uid]?.coAuthors || []), newAuthor];
//         setEditData((prev) => ({
//           ...prev,
//           [uid.uid]: { ...prev[uid.uid], coAuthors: updated },
//         }));

//         // Optional: show confirmation
//         const list = updated.map((a, i) => `${i + 1}. ${a.name} (${a.affiliation})`).join('<br>');
//         Swal.fire({
//           title: 'Co-Authors Updated',
//           html: list,
//           icon: 'success',
//         });
//       }
//     });
//   }}
// className="add-coauthor-btn"
// >
//   ➕ Add Co Author
// </button>
//               </div>
//             ) : (
//             //   <ul>
//  <ul>
//     {Array.isArray(uid.coAuthors)
//       ? uid.coAuthors.map((author, index) => (
//           <li key={index}>{author.name} ({author.affiliation})</li>
//         ))
//       : null
//     }
//   </ul>
//             )}

//             {/* Abstract */}
//             <p><strong>Abstract:</strong></p>
//             {editingUid === uid.uid ? (
//               <textarea
//                 value={editData[uid.uid]?.abstract || ""}
//                 onChange={(e) => handleEditChange(uid.uid, "abstract", e.target.value)}
//               />
//             ) : (
//               <p>{uid.abstract}</p>
//             )}

//             {/* Target */}
//             <p><strong>Target:</strong></p>
//             {editingUid === uid.uid ? (
//               <input
//                 type="text"
//                 value={editData[uid.uid]?.target || ""}
//                 onChange={(e) => handleEditChange(uid.uid, "target", e.target.value)}
//               />
//             ) : (
//               <p>{uid.target}</p>
              
//             )}

//             {/* Save / Cancel */}
//             {editingUid === uid.uid && (
//               <div>
//                 <button
//                   onClick={() => handleSave(uid.uid)}
                 
//                 >
//                   Save
//                 </button>
//                 <button
//                   onClick={() => setEditingUid(null)}
//                   className="cancel-btn"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}

//             {/* Document Uploads */}
//             {/* ... Here include your type-based input forms like Journal, Conference, Book, Patent ... */}
//             {/* Example for Journal */}
//             {uid.type === "Journal" && (
//               <>
//                 <label>Journal Name</label>
//                 <input
//                   type="text"
//                   placeholder="Enter Journal Name"
//                   value={documents[uid.uid]?.journalName || ""}
//                   onChange={(e) => handleFileChange(uid.uid, "journalName", e.target.value)}
//                 />
//                 <label>ISSN</label>
//                 <input
//                   type="text"
//                   placeholder="Enter ISSN"
//                   value={documents[uid.uid]?.issn || ""}
//                   onChange={(e) => handleFileChange(uid.uid, "issn", e.target.value)}
//                 />
//                 <label>Publisher</label>
//                 <input
//                   type="text"
//                   placeholder="Enter Publisher"
//                   value={documents[uid.uid]?.publisher || ""}
//                   onChange={(e) => handleFileChange(uid.uid, "publisher", e.target.value)}
//                 />
//                 <label>Indexing</label>
//                 <select
//                   value={documents[uid.uid]?.indexing || ""}
//                   onChange={(e) => handleFileChange(uid.uid, "indexing", e.target.value)}
//                 >
//                   <option value="">Select Indexing</option>
//                   <option value="Scopus">Scopus</option>
//                   <option value="SCI">SCI</option>
//                   <option value="Web of Science">Web of Science</option>
//                   <option value="UGC Care">UGC Care</option>
//                 </select>
//               </>
//             )}

//             {/* Payment Receipt */}
//             <div className="form-group">
//               <label>💳 Payment Receipt (PDF only)</label>
//               <input
//                 type="file"
//                 accept=".pdf"
//                 onChange={(e) => handleFileChange(uid.uid, "paymentReceipt", e.target.files[0])}
//               />
//             </div>

//             {/* Indexing Proof */}
//             {(uid.type === "Journal" || uid.type === "Conference") && (
//               <div className="form-group">
//                 <label>📑 Indexing Proof (PDF only)</label>
//                 <input
//                   type="file"
//                   accept=".pdf"
//                   onChange={(e) =>
//                     handleFileChange(uid.uid, "indexingProof", e.target.files[0])
//                   }
//                 />
//               </div>
//             )}

//             {/* Published Paper */}
//             <div>
//               <label>📄 Published Paper PDF (PDF only)</label>
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 onChange={(e) => handleFileChange(uid.uid, "publishedPaperPdf", e.target.files[0])}
//               />
//             </div>

//             <button
//               onClick={() => handleDocumentUpload(uid.uid)}
//               disabled={loadingUid === uid.uid}
//             >
//               {loadingUid === uid.uid ? "Uploading..." : "Submit Documents"}
//             </button>
//               </div>
// )}
//           </div>
//         ))
//       )}
//       {/* 🔥 Pagination */}
// {filteredApprovedUIDs.length > itemsPerPage && (
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

//     </div>
//   );
// }

// /* File: src/components/faculty/DocumentUploadSection.jsx */
// import React, { useEffect, useState } from 'react';
// import Swal from 'sweetalert2';

// export default function DocumentUploadSection({ userId }) {
//     const [approvedUIDs, setApprovedUIDs] = useState([]);
//     const [uploadedUIDs, setUploadedUIDs] = useState([]);
//     const [documents, setDocuments] = useState({});
//     const [searchQuery, setSearchQuery] = useState('');
//     const [loadingUid, setLoadingUid] = useState(null);
//     const [publishedPaperPdf, setPublishedPaperPdf] = useState(null);
//     const [editingUid, setEditingUid] = useState(null);
//     const [editData, setEditData] = useState({});

// //     useEffect(() => {
// //   if (!userId) {
// //     console.warn("userId not available yet");
// //     return;
// //   }

// //   fetchApprovedUIDs();
// //   fetchUploadedUIDs();
// // }, [userId]);


//     useEffect(() => {
//         const fetchApprovedUIDs = async () => {
//             try {
//                 const res = await fetch(`${API_BASE_URL}/api/faculty/approved-uid-requests/${userId}`);
//                 const data = await res.json();
//                 setApprovedUIDs(data);
//             } catch (err) {
//                 console.error('Error fetching approved UID requests:', err);
//             }
//         };

//         const fetchUploadedUIDs = async () => {
//   try {
//     const response = await fetch(
//       `${API_BASE_URL}/api/faculty/uploaded-uids/${userId}`
//     );
//     const data = await response.json();

//     // Backend returns an array of uploaded documents
//     setUploadedUIDs(data || []); 
//   } catch (error) {
//     console.error('Error fetching uploaded UIDs:', error);
//   }
// };


//         fetchApprovedUIDs();
//         fetchUploadedUIDs();
//     }, [userId]);

//     const handleFileChange = (uid, field, value) => {
//         setDocuments((prev) => ({
//             ...prev,
//             [uid]: {
//                 ...prev[uid],
//                 [field]: value
//             }
//         }));
//     };

//     const handleEditChange = (uid, field, value) => {
//     setEditData((prev) => ({
//   ...prev,
//   [uid.uid]: {
//     paperTitle: uid.paperTitle,
//     target: uid.target,
//     abstract: uid.abstract,
//     type: uid.type,
//     coAuthors: uid.coAuthors?.authors || [] // <-- Add this line
//   }
// }));
// };

// const handleSave = async (uid) => {
//     try {
//         const res = await fetch(`${API_BASE_URL}/api/faculty/update-uid/${uid}`, {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(editData[uid])
//         });

//         const data = await res.json();

//         Swal.fire("Updated!", data.message || "UID updated successfully", "success");

//         setEditingUid(null);

//         // refresh list
//         window.location.reload();

//     } catch (error) {
//         console.error(error);
//         Swal.fire("Error", "Failed to update UID", "error");
//     }
// };

//     const handleDocumentUpload = async (uid) => {
//         setLoadingUid(uid);
//         const formData = new FormData();
//         formData.append('userId', userId);
//         formData.append('uid', uid);

//         const docData = documents[uid] || {};
//         if (docData?.indexingProof) formData.append('indexingProof', docData.indexingProof);
//         if (docData?.paymentReceipt) formData.append('paymentReceipt', docData.paymentReceipt);
//         // formData.append('scopusLink', docData?.scopusLink || '');
//         // formData.append('issn', docData?.issn || '');
//         // formData.append('doi', docData?.doi || '');

//         formData.append("journalName", docData?.journalName || "");
// formData.append("conferenceName", docData?.conferenceName || "");
// formData.append("bookTitle", docData?.bookTitle || "");
// formData.append("issn", docData?.issn || "");
// formData.append("isbn", docData?.isbn || "");
// formData.append("publisher", docData?.publisher || "");
// formData.append("indexing", docData?.indexing || "");
// formData.append("location", docData?.location || "");
// formData.append("dates", docData?.dates || "");
// formData.append("patentNumber", docData?.patentNumber || "");
// formData.append("patentOffice", docData?.patentOffice || "");
//         //formData.append("publishedPaperPdf", publishedPaperPdf);
//         if (docData?.publishedPaperPdf) {
//   formData.append('publishedPaperPdf', docData.publishedPaperPdf);
// }


//         try {
//             const res = await fetch('/api/faculty/upload-documents', {
//                 method: 'POST',
//                 body: formData
//             });

//             const data = await res.json();
            
//              Swal.fire({
//             title: 'Upload Successful!',
//             text: data?.message || 'Your documents have been uploaded.',
//             icon: 'success',
//             confirmButtonText: 'OK'
//         });
//             // alert(data?.message || 'Upload successful');
//             setDocuments((prev) => ({
//                 ...prev,
//                 [uid]: { issn: '', scopusLink: '', doi: '', acceptanceLetter: null, indexingProof: null, paymentReceipt: null }
//             }));
//             setApprovedUIDs((prev) => prev.filter((r) => r.uid !== uid));
//         } catch (err) {
//             console.error(err);
//             Swal.fire({
//             title: 'Upload Failed',
//             text: err?.message || 'Something went wrong while uploading documents.',
//             icon: 'error',
//             confirmButtonText: 'Retry'
//         });
//             // alert('Upload failed');
//         } finally {
//             setLoadingUid(null);
//         }
//     };

//    console.log("DocumentUploadSection userId:", userId);

// // Map uploadedUIDs to just UID strings
// const uploadedUIDStrings = uploadedUIDs.map((u) => u.uid);

// const filteredApprovedUIDs = approvedUIDs
//     .filter((uid) => !uploadedUIDStrings.includes(uid.uid)) // exclude uploaded
//     .filter((uid) => {
//         const q = searchQuery.toLowerCase();
//         return (
//             uid.uid?.toLowerCase().includes(q) ||
//             uid.paperTitle?.toLowerCase().includes(q) ||
//             uid.type?.toLowerCase().includes(q) ||
//             uid.target?.toLowerCase().includes(q)
//         );
//     });

// console.log("Uploaded UIDs:", uploadedUIDs);

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
//                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//     <h4>UID Details</h4>

//     {editingUid !== uid.uid && (
//         <button
//     onClick={() => {
//         setEditingUid(uid.uid);
//         setEditData((prev) => ({
//             ...prev,
//             [uid.uid]: {
//                 paperTitle: uid.paperTitle,
//                 target: uid.target,
//                 abstract: uid.abstract,
//                 type: uid.type
//             }
//         }));
//     }}
//     style={{ background: "#007bff", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px" }}
// >
//     Edit
// </button>
//     )}
// </div>
//                         <p><strong>Paper Title:</strong></p>

//                         {editingUid === uid.uid ? (
//                             <input
//                                 type="text"
//                                 value={editData[uid.uid]?.paperTitle || ""}
//                                 onChange={(e) =>
//                                     handleEditChange(uid.uid, "paperTitle", e.target.value)
//                                 }
//                             />
//                         ) : (
//                             <p>{uid.paperTitle}</p>
//                         )}
//                         <p><strong>UID:</strong> {uid.uid}</p>
//                        <p><strong>Type:</strong></p>

// {editingUid === uid.uid ? (
//     <select
//         value={editData[uid.uid]?.type || ""}
//         onChange={(e) =>
//             handleEditChange(uid.uid, "type", e.target.value)
//         }
//     >
//         <option value="Journal">Journal</option>
//         <option value="Conference">Conference</option>
//         <option value="Book">Book</option>
//         <option value="Book Chapter">Book Chapter</option>
//         <option value="Patent">Patent</option>
//     </select>
// ) : (
//     <p>{uid.type}</p>
// )}

// <p><strong>Co Authors:</strong></p>

// {editingUid === uid.uid ? (
//   <div>
//     {(editData[uid.uid]?.coAuthors?.authors || []).map((author, index) => (
//       <div key={index} style={{ marginBottom: "6px" }}>
//         <input
//           type="text"
//           placeholder="Author Name"
//           value={author.name}
//           onChange={(e) => {
//             const updated = [...editData[uid.uid].coAuthors];
//             updated[index].name = e.target.value;
//             handleEditChange(uid.uid, "coAuthors", updated);
//           }}
//         />

//         <input
//           type="text"
//           placeholder="Affiliation"
//           value={author.affiliation}
//           onChange={(e) => {
//             const updated = [...editData[uid.uid].coAuthors];
//             updated[index].affiliation = e.target.value;
//             handleEditChange(uid.uid, "coAuthors", updated);
//           }}
//         />

//         <button
//           onClick={() => {
//             const updated = editData[uid.uid].coAuthors.filter(
//               (_, i) => i !== index
//             );
//             handleEditChange(uid.uid, "coAuthors", updated);
//           }}
//           style={{ marginLeft: "5px" }}
//         >
//           ❌
//         </button>
//       </div>
//     ))}

//     <button
//       onClick={() => {
//         const updated = [
//           ...(editData[uid.uid]?.coAuthors || []),
//           { name: "", affiliation: "" }
//         ];
//         handleEditChange(uid.uid, "coAuthors", updated);
//       }}
//       style={{ marginTop: "5px" }}
//     >
//       ➕ Add Co Author
//     </button>
//   </div>
// ) : (
//   <ul>
//   {(uid.coAuthors?.authors || []).map((author, index) => (
//     <li key={index}>
//       {author.name} ({author.affiliation})
//     </li>
//   ))}
// </ul>
// )}
//                         <p><strong>Abstract:</strong> {uid.abstract}</p>
//                         {editingUid === uid.uid ? (
//     <textarea
//         value={editData[uid.uid]?.abstract || ""}
//         onChange={(e) =>
//             handleEditChange(uid.uid, "abstract", e.target.value)
//         }
//     />
// ) : (
//     <p>{uid.abstract}</p>
// )}
//                         <p><strong>Target:</strong> {uid.target}</p>
//                         {editingUid === uid.uid ? (
//     <input
//         type="text"
//         value={editData[uid.uid]?.target || ""}
//         onChange={(e) =>
//             handleEditChange(uid.uid, "target", e.target.value)
//         }
//     />
// ) : (
//     <p>{uid.target}</p>
// )}
// {editingUid === uid.uid && (
//     <div style={{ marginTop: "10px" }}>
//         <button
//             onClick={() => handleSave(uid.uid)}
//             style={{ marginRight: "10px", background: "green", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px" }}
//         >
//             Save
//         </button>

//         <button
//             onClick={() => setEditingUid(null)}
//             style={{ background: "gray", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px" }}
//         >
//             Cancel
//         </button>
//     </div>
// )}


//                         {uid.type === "Journal" && (
//   <>
//     <label>Journal Name</label>
//     <input
//       type="text"
//       placeholder="Enter Journal Name"
//       value={documents[uid.uid]?.journalName || ""}
      
//       onChange={(e) => handleFileChange(uid.uid, "journalName", e.target.value)}
      
//     />

//     <label>ISSN</label>
//     <input
//       type="text"
//       placeholder="Enter ISSN"
//       value={documents[uid.uid]?.issn || ""}
//       onChange={(e) => handleFileChange(uid.uid, "issn", e.target.value)}
//     />

//     <label>Publisher</label>
//     <input
//       type="text"
//       placeholder="Enter Publisher"
//       value={documents[uid.uid]?.publisher || ""}
//       onChange={(e) => handleFileChange(uid.uid, "publisher", e.target.value)}
//     />

//     <label>DOI</label>
//     <input
//       type="text"
//       placeholder="Enter DOI"
//       value={documents[uid.uid]?.doi || ""}
//       onChange={(e) => handleFileChange(uid.uid, "doi", e.target.value)}
//     />

//     <label>Indexing</label>
//     <select
//       value={documents[uid.uid]?.indexing || ""}
//       onChange={(e) => handleFileChange(uid.uid, "indexing", e.target.value)}
//     >
//       <option value="">Select Indexing</option>
//       <option value="Scopus">Scopus</option>
//       <option value="SCI">SCI</option>
//       <option value="Web of Science">Web of Science</option>
//       <option value="UGC Care">UGC Care</option>
//     </select>
//   </>
// )}

// {uid.type === "Conference" && (
//   <>
//     <label>Conference Name</label>
//     <input
//       type="text"
//       placeholder="Enter Conference Name"
//       value={documents[uid.uid]?.conferenceName || ""}
//       onChange={(e) =>
//         handleFileChange(uid.uid, "conferenceName", e.target.value)
//       }
//     />

//     <label>Location</label>
//     <input
//       type="text"
//       placeholder="Conference Location"
//       value={documents[uid.uid]?.location || ""}
//       onChange={(e) => handleFileChange(uid.uid, "location", e.target.value)}
//     />

//     <label>Conference Dates</label>
//     <input
//       type="text"
//       placeholder="Conference Dates"
//       value={documents[uid.uid]?.dates || ""}
//       onChange={(e) => handleFileChange(uid.uid, "dates", e.target.value)}
//     />

//     <label>ISBN</label>
//     <input
//       type="text"
//       placeholder="Conference Proceedings ISBN"
//       value={documents[uid.uid]?.isbn || ""}
//       onChange={(e) => handleFileChange(uid.uid, "isbn", e.target.value)}
//     />

//     <label>Publisher</label>
//     <input
//       type="text"
//       placeholder="Publisher"
//       value={documents[uid.uid]?.publisher || ""}
//       onChange={(e) => handleFileChange(uid.uid, "publisher", e.target.value)}
//     />

//     <label>Indexing</label>
//     <select
//       value={documents[uid.uid]?.indexing || ""}
//       onChange={(e) => handleFileChange(uid.uid, "indexing", e.target.value)}
//     >
//       <option value="">Select Indexing</option>
//       <option value="Scopus">Scopus</option>
//       <option value="IEEE">IEEE</option>
//       <option value="Springer">Springer</option>
//       <option value="Web of Science">Web of Science</option>
//     </select>
//   </>
// )}

// {uid.type === "Book Chapter" && (
//   <>
//     <label>Book Title</label>
//     <input
//       type="text"
//       placeholder="Enter Book Title"
//       value={documents[uid.uid]?.bookTitle || ""}
//       onChange={(e) => handleFileChange(uid.uid, "bookTitle", e.target.value)}
//     />

//     <label>ISBN</label>
//     <input
//       type="text"
//       placeholder="Enter ISBN"
//       value={documents[uid.uid]?.isbn || ""}
//       onChange={(e) => handleFileChange(uid.uid, "isbn", e.target.value)}
//     />

//     <label>Publisher</label>
//     <input
//       type="text"
//       placeholder="Enter Publisher"
//       value={documents[uid.uid]?.publisher || ""}
//       onChange={(e) => handleFileChange(uid.uid, "publisher", e.target.value)}
//     />
//   </>
// )}

// {uid.type === "Book" && (
//   <>
//     <label>Book Title</label>
//     <input
//       type="text"
//       placeholder="Enter Book Title"
//       value={documents[uid.uid]?.bookTitle || ""}
//       onChange={(e) => handleFileChange(uid.uid, "bookTitle", e.target.value)}
//     />

//     <label>ISBN</label>
//     <input
//       type="text"
//       placeholder="Enter ISBN"
//       value={documents[uid.uid]?.isbn || ""}
//       onChange={(e) => handleFileChange(uid.uid, "isbn", e.target.value)}
//     />

//     <label>Publisher</label>
//     <input
//       type="text"
//       placeholder="Enter Publisher"
//       value={documents[uid.uid]?.publisher || ""}
//       onChange={(e) => handleFileChange(uid.uid, "publisher", e.target.value)}
//     />
//   </>
// )}


// {uid.type === "Patent" && (
//   <>
//     <label>Patent Number</label>
//     <input
//       type="text"
//       placeholder="Enter Patent Number"
//       value={documents[uid.uid]?.patentNumber || ""}
//       onChange={(e) =>
//         handleFileChange(uid.uid, "patentNumber", e.target.value)
//       }
//     />

//     <label>Patent Office</label>
//     <input
//       type="text"
//       placeholder="Patent Office (Indian / US / EU)"
//       value={documents[uid.uid]?.patentOffice || ""}
//       onChange={(e) =>
//         handleFileChange(uid.uid, "patentOffice", e.target.value)
//       }
//     />
//   </>
// )}







// {/* 
//                         <label>ISSN</label>
//                         <input
//                             type="text"
//                             placeholder="Enter ISSN"
//                             value={documents[uid.uid]?.issn || ''}
//                             onChange={(e) => handleFileChange(uid.uid, 'issn', e.target.value)}
//                         />
//                         <div>
//                         <label>Scopus link</label>
//                         <input
//                             type="text"
//                             placeholder="Enter Scopus Link"
//                             value={documents[uid.uid]?.scopusLink || ''}
//                             onChange={(e) => handleFileChange(uid.uid, 'scopusLink', e.target.value)}
//                         />
//                         </div>
//                         <label>DOI</label>
//                         <input
//                             type="text"
//                             placeholder="Enter DOI"
//                             value={documents[uid.uid]?.doi || ''}
//                             onChange={(e) => handleFileChange(uid.uid, 'doi', e.target.value)}
//                         /> */}

//                         <div className="form-group">
//                             <label>💳 Payment Receipt (PDF only)</label>
//                             <input type="file" accept=".pdf" onChange={(e) => handleFileChange(uid.uid, 'paymentReceipt', e.target.files[0])} />
//                         </div>


//                        {(uid.type === "Journal" || uid.type === "Conference") && (
//   <div className="form-group">
//       <label>📑 Indexing Proof (PDF only)</label>
//       <input
//           type="file"
//           accept=".pdf"
//           onChange={(e) =>
//               handleFileChange(uid.uid, "indexingProof", e.target.files[0])
//           }
//       />
//   </div>
// )}
//                         <div>
//                         <label>📄 Published Paper PDF (PDF only)</label>
//                         <input
//                             type="file"
//                             accept="application/pdf"
//                             onChange={(e) => handleFileChange(uid.uid, 'publishedPaperPdf', e.target.files[0])}
//                             />

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



// // /* File: src/components/faculty/DocumentUploadSection.jsx */
// // import React, { useEffect, useState } from 'react';

// // export default function DocumentUploadSection({ facultyId }) {
// //     const [approvedUIDs, setApprovedUIDs] = useState([]);
// //     const [uploadedUIDs, setUploadedUIDs] = useState([]);
// //     const [documents, setDocuments] = useState({});
// //     const [searchQuery, setSearchQuery] = useState('');
// //     const [loadingUid, setLoadingUid] = useState(null);

// //     useEffect(() => {
// //         const fetchApprovedUIDs = async () => {
// //             try {
// //                 const res = await fetch(`${API_BASE_URL}/api/faculty/approved-uid-requests/${facultyId}`);
// //                 const data = await res.json();
// //                 setApprovedUIDs(data);
// //             } catch (err) {
// //                 console.error('Error fetching approved UID requests:', err);
// //             }
// //         };

// //         const fetchUploadedUIDs = async () => {
// //             try {
// //                 const response = await fetch(`${API_BASE_URL}/api/faculty/fetch-uploads/${facultyId}`);
// //                 const data = await response.json();
// //                 setUploadedUIDs(data.uploadedUIDs || []);
// //             } catch (error) {
// //                 console.error('Error fetching uploaded UIDs:', error);
// //             }
// //         };

// //         fetchApprovedUIDs();
// //         fetchUploadedUIDs();
// //     }, [facultyId]);

// //     const handleFileChange = (uid, field, value) => {
// //         setDocuments((prev) => ({
// //             ...prev,
// //             [uid]: {
// //                 ...prev[uid],
// //                 [field]: value
// //             }
// //         }));
// //     };

// //     const handleDocumentUpload = async (uid) => {
// //         setLoadingUid(uid);
// //         const formData = new FormData();
// //         formData.append('facultyId', facultyId);
// //         formData.append('uid', uid);

// //         const docData = documents[uid] || {};
// //         if (docData?.acceptanceLetter) formData.append('acceptanceLetter', docData.acceptanceLetter);
// //         if (docData?.indexingProof) formData.append('indexingProof', docData.indexingProof);
// //         if (docData?.paymentReceipt) formData.append('paymentReceipt', docData.paymentReceipt);
// //         formData.append('scopusLink', docData?.scopusLink || '');
// //         formData.append('issn', docData?.issn || '');

// //         try {
// //             const res = await fetch('/api/faculty/upload-documents', {
// //                 method: 'POST',
// //                 body: formData
// //             });

// //             const data = await res.json();
// //             alert(data?.message || 'Upload successful');
// //             setDocuments((prev) => ({
// //                 ...prev,
// //                 [uid]: { issn: '', scopusLink: '', acceptanceLetter: null, indexingProof: null, paymentReceipt: null }
// //             }));
// //             setApprovedUIDs((prev) => prev.filter((r) => r.uid !== uid));
// //         } catch (err) {
// //             console.error(err);
// //             alert('Upload failed');
// //         } finally {
// //             setLoadingUid(null);
// //         }
// //     };

// //     const filteredApprovedUIDs = approvedUIDs
// //         .filter((uid) => !uploadedUIDs.includes(uid.uid))
// //         .filter((uid) => {
// //             const q = searchQuery.toLowerCase();
// //             return (
// //                 uid.uid?.toLowerCase().includes(q) ||
// //                 uid.paperTitle?.toLowerCase().includes(q) ||
// //                 uid.type?.toLowerCase().includes(q) ||
// //                 uid.target?.toLowerCase().includes(q)
// //             );
// //         });

// //     return (
// //         <div className="approved-uid-section">
// //             {approvedUIDs.length > 0 && (
// //                 <input
// //                     type="text"
// //                     placeholder="Search UID by UID, title, type, target..."
// //                     value={searchQuery}
// //                     onChange={(e) => setSearchQuery(e.target.value)}
// //                     style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', fontSize: '16px' }}
// //                 />
// //             )}

// //             {filteredApprovedUIDs.length === 0 ? (
// //                 <p>No approved UID requests found.</p>
// //             ) : (
// //                 filteredApprovedUIDs.map((uid) => (
// //                     <div key={uid._id} className="uid-card">
// //                         <p><strong>Paper Title:</strong> {uid.paperTitle}</p>
// //                         <p><strong>UID:</strong> {uid.uid}</p>
// //                         <p><strong>Type:</strong> {uid.type}</p>
// //                         <p><strong>Abstract:</strong> {uid.abstract}</p>
// //                         <p><strong>Target:</strong> {uid.target}</p>

// //                         <input type="text" placeholder="Enter ISSN" value={documents[uid.uid]?.issn || ''} onChange={(e) => handleFileChange(uid.uid, 'issn', e.target.value)} />
// //                         <input type="text" placeholder="Enter Scopus Link" value={documents[uid.uid]?.scopusLink || ''} onChange={(e) => handleFileChange(uid.uid, 'scopusLink', e.target.value)} />

// //                         <div className="form-group">
// //                             <label>💳 Payment Receipt</label>
// //                             <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(uid.uid, 'paymentReceipt', e.target.files[0])} />
// //                         </div>

// //                         <div className="form-group">
// //                             <label>📄 Acceptance Letter</label>
// //                             <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(uid.uid, 'acceptanceLetter', e.target.files[0])} />
// //                         </div>

// //                         <div className="form-group">
// //                             <label>📑 Indexing Proof</label>
// //                             <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(uid.uid, 'indexingProof', e.target.files[0])} />
// //                         </div>

// //                         <button onClick={() => handleDocumentUpload(uid.uid)} disabled={loadingUid === uid.uid}>
// //                             {loadingUid === uid.uid ? 'Uploading...' : 'Submit Documents'}
// //                         </button>
// //                     </div>
// //                 ))
// //             )}
// //         </div>
// //     );
// // }






