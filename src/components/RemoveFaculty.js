import React, { useEffect, useState } from "react";
import "./RemoveFaculty.css";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../config.js";

import {
  FiSearch,
  FiX,
  FiUsers,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiHash,
  FiTrash2,
  FiUser,
  FiChevronRight,
} from "react-icons/fi";

const RemoveFaculty = () => {
  const [faculties, setFaculties] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredFaculties, setFilteredFaculties] = useState([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/main-admin/faculties`
        );

        const data = await response.json();

        setFaculties(data);
        setFilteredFaculties(data);
      } catch (err) {
        console.error("Error fetching faculties:", err);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load faculty list",
        });
      }
    };

    fetchFaculties();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();

    const filtered = faculties.filter((faculty) =>
      Object.values(faculty).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );

    setFilteredFaculties(filtered);
  }, [search, faculties]);

  const handleRemove = async (userId) => {
    const result = await Swal.fire({
      title: "Remove Faculty?",
      text: "This faculty account will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/main-admin/remove-faculty/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Faculty Removed",
          text: "The faculty account was removed successfully.",
          timer: 2000,
          showConfirmButton: false,
        });

        setFaculties((prev) =>
          prev.filter((faculty) => faculty.userId !== userId)
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Removal Failed",
          text: data.message || "Failed to remove faculty",
        });
      }
    } catch (err) {
      console.error("Error removing faculty:", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while removing faculty.",
      });
    }
  };

  const getInitials = (name = "") => {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="remove-faculty-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="remove-faculty-header">

        <div className="remove-faculty-header-left">

          <div className="remove-faculty-header-icon">
            <FiUsers />
          </div>

          <div className="remove-faculty-header-content">

            <span className="remove-faculty-eyebrow">
              FACULTY MANAGEMENT
            </span>

            <h2 className="remove-faculty-title">
              Faculty Directory
            </h2>

            <p className="remove-faculty-description">
              View registered faculty accounts and manage their
              access within the Research Paper Management System.
            </p>

          </div>

        </div>

        <div className="remove-faculty-count">

          <span className="remove-faculty-count-icon">
            <FiUsers />
          </span>

          <div>
            <strong>{faculties.length}</strong>
            <span>Faculty Members</span>
          </div>

        </div>

      </div>


      {/* =====================================================
          SEARCH TOOLBAR
      ===================================================== */}

      <div className="remove-faculty-toolbar">

        <div className="remove-faculty-search-wrapper">

          <FiSearch className="remove-faculty-search-icon" />

          <input
            type="text"
            placeholder="Search by name, email, faculty ID, phone or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="remove-faculty-search-input"
          />

          {search && (
            <button
              type="button"
              className="remove-faculty-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}

        </div>

        <div className="remove-faculty-result-info">

          <span>
            Showing
          </span>

          <strong>
            {filteredFaculties.length}
          </strong>

          <span>
            {filteredFaculties.length === 1
              ? "faculty"
              : "faculty members"}
          </span>

        </div>

      </div>


      {/* =====================================================
          FACULTY LIST
      ===================================================== */}

      {filteredFaculties.length > 0 ? (

        <div className="remove-faculty-card-list">

          {filteredFaculties.map((faculty) => (

            <div
              key={faculty._id}
              className="remove-faculty-card"
            >

              {/* Card Top */}

              <div className="remove-faculty-card-top">

                <div className="remove-faculty-profile">

                  <div className="remove-faculty-avatar">
                    {getInitials(faculty.fullName)}
                  </div>

                  <div className="remove-faculty-identity">

                    <h4>
                      {faculty.fullName || "Unnamed Faculty"}
                    </h4>

                    <span>
                      <FiHash />
                      {faculty.userId || "No ID"}
                    </span>

                  </div>

                </div>

                <div className="remove-faculty-department-badge">
                  <FiBriefcase />
                  {faculty.department || "Not Assigned"}
                </div>

              </div>


              {/* Divider */}

              <div className="remove-faculty-divider" />


              {/* Information */}

              <div className="remove-faculty-details">

                <div className="remove-faculty-detail">

                  <div className="remove-faculty-detail-icon">
                    <FiMail />
                  </div>

                  <div>
                    <span>Email Address</span>
                    <strong>
                      {faculty.email || "Not Available"}
                    </strong>
                  </div>

                </div>


                <div className="remove-faculty-detail">

                  <div className="remove-faculty-detail-icon">
                    <FiPhone />
                  </div>

                  <div>
                    <span>Phone Number</span>
                    <strong>
                      {faculty.phoneNumber || "Not Available"}
                    </strong>
                  </div>

                </div>


                <div className="remove-faculty-detail">

                  <div className="remove-faculty-detail-icon">
                    <FiUser />
                  </div>

                  <div>
                    <span>Gender</span>
                    <strong>
                      {faculty.gender || "Not Available"}
                    </strong>
                  </div>

                </div>


                <div className="remove-faculty-detail">

                  <div className="remove-faculty-detail-icon">
                    <FiBriefcase />
                  </div>

                  <div>
                    <span>Department</span>
                    <strong>
                      {faculty.department || "Not Available"}
                    </strong>
                  </div>

                </div>

              </div>


              {/* Card Footer */}

              <div className="remove-faculty-card-footer">

                <span className="remove-faculty-account-status">
                  <span className="remove-faculty-status-dot" />
                  Registered Account
                </span>

                <button
                  className="remove-faculty-remove-btn"
                  onClick={() =>
                    handleRemove(faculty.userId)
                  }
                >
                  <FiTrash2 />
                  <span>Remove Faculty</span>
                  <FiChevronRight />
                </button>

              </div>

            </div>

          ))}

        </div>

      ) : (

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        <div className="remove-faculty-empty">

          <div className="remove-faculty-empty-icon">
            <FiSearch />
          </div>

          <h3>
            No Faculty Found
          </h3>

          <p>
            {search
              ? `No faculty members match "${search}". Try a different search term.`
              : "There are currently no faculty accounts available."}
          </p>

          {search && (
            <button
              className="remove-faculty-empty-btn"
              onClick={() => setSearch("")}
            >
              Clear Search
            </button>
          )}

        </div>

      )}

    </div>
  );
};

export default RemoveFaculty;