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

const RemoveHOD = () => {
  const [hods, setHods] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredHods, setFilteredHods] = useState([]);

  useEffect(() => {
    const fetchHods = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/main-admin/hods`
        );

        const data = await response.json();

        setHods(data);
        setFilteredHods(data);
      } catch (err) {
        console.error("Error fetching HODs:", err);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch HODs",
        });
      }
    };

    fetchHods();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();

    const filtered = hods.filter((hod) =>
      Object.values(hod).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );

    setFilteredHods(filtered);
  }, [search, hods]);

  const handleRemove = async (userId) => {
    const result = await Swal.fire({
      title: "Remove HOD?",
      text: "This HOD account will be permanently removed.",
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
          title: "HOD Removed",
          text: "The HOD account was removed successfully.",
          timer: 2000,
          showConfirmButton: false,
        });

        setHods((prev) =>
          prev.filter((hod) => hod.userId !== userId)
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Removal Failed",
          text: data.message || "Failed to remove HOD",
        });
      }
    } catch (err) {
      console.error("Error removing HOD:", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while removing HOD.",
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
              HOD MANAGEMENT
            </span>

            <h2 className="remove-faculty-title">
              HOD Directory
            </h2>

            <p className="remove-faculty-description">
              View registered Heads of Department and manage
              their administrative accounts within RPMS.
            </p>

          </div>

        </div>

        <div className="remove-faculty-count">

          <span className="remove-faculty-count-icon">
            <FiUsers />
          </span>

          <div>
            <strong>{hods.length}</strong>
            <span>HOD Members</span>
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
            placeholder="Search by name, email, HOD ID, phone or department..."
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

          <span>Showing</span>

          <strong>
            {filteredHods.length}
          </strong>

          <span>
            {filteredHods.length === 1
              ? "HOD"
              : "HODs"}
          </span>

        </div>

      </div>


      {/* =====================================================
          HOD LIST
      ===================================================== */}

      {filteredHods.length > 0 ? (

        <div className="remove-faculty-card-list">

          {filteredHods.map((hod) => (

            <div
              key={hod._id}
              className="remove-faculty-card"
            >

              {/* Card Top */}

              <div className="remove-faculty-card-top">

                <div className="remove-faculty-profile">

                  <div className="remove-faculty-avatar">
                    {getInitials(hod.fullName)}
                  </div>

                  <div className="remove-faculty-identity">

                    <h4>
                      {hod.fullName || "Unnamed HOD"}
                    </h4>

                    <span>
                      <FiHash />
                      {hod.userId || "No ID"}
                    </span>

                  </div>

                </div>

                <div className="remove-faculty-department-badge">
                  <FiBriefcase />
                  {hod.department || "Not Assigned"}
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
                      {hod.email || "Not Available"}
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
                      {hod.phoneNumber || "Not Available"}
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
                      {hod.gender || "Not Available"}
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
                      {hod.department || "Not Available"}
                    </strong>
                  </div>

                </div>

              </div>


              {/* Footer */}

              <div className="remove-faculty-card-footer">

                <span className="remove-faculty-account-status">
                  <span className="remove-faculty-status-dot" />
                  Registered HOD Account
                </span>

                <button
                  className="remove-faculty-remove-btn"
                  onClick={() =>
                    handleRemove(hod.userId)
                  }
                >
                  <FiTrash2 />
                  <span>Remove HOD</span>
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
            No HOD Found
          </h3>

          <p>
            {search
              ? `No HODs match "${search}". Try a different search term.`
              : "There are currently no HOD accounts available."}
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

export default RemoveHOD;