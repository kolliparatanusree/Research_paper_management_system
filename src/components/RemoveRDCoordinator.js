// File: src/components/admin/RemoveRDCoordinator.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./RemoveFaculty.css";
import { API_BASE_URL } from "../config.js";

import {
  FiShield,
  FiSearch,
  FiX,
  FiMail,
  FiPhone,
  FiUser,
  FiBriefcase,
  FiTrash2,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";

const RemoveRDCoordinator = () => {
  const [rdCoordinators, setRdCoordinators] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredCoordinators, setFilteredCoordinators] = useState([]);

  // Fetch RD Coordinators
  useEffect(() => {
    const fetchRDCoordinators = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/main-admin/rdcoordinators`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch RD Coordinators");
        }

        const data = await response.json();

        setRdCoordinators(data);
        setFilteredCoordinators(data);
      } catch (err) {
        console.error("Error fetching RD Coordinators:", err);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch RD Coordinators",
        });
      }
    };

    fetchRDCoordinators();
  }, []);

  // Search / Filter
  useEffect(() => {
    const lowerSearch = search.toLowerCase().trim();

    const filtered = rdCoordinators.filter((rd) =>
      Object.values(rd).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );

    setFilteredCoordinators(filtered);
  }, [search, rdCoordinators]);

  // Remove RD Coordinator
  const handleRemove = async (userId) => {
    const result = await Swal.fire({
      title: "Remove RD Coordinator?",
      text: "This account will be permanently removed.",
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
        `${API_BASE_URL}/api/main-admin/remove-rdcoordinator/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Removed Successfully",
          text: "RD Coordinator has been removed.",
          confirmButtonColor: "#2563eb",
        });

        setRdCoordinators((prev) =>
          prev.filter((rd) => rd.userId !== userId)
        );

        setFilteredCoordinators((prev) =>
          prev.filter((rd) => rd.userId !== userId)
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Removal Failed",
          text: data.message || "Failed to remove RD Coordinator.",
        });
      }
    } catch (err) {
      console.error("Error removing RD Coordinator:", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while removing RD Coordinator.",
      });
    }
  };

  return (
    <div className="remove-faculty-page">

      {/* ================= HEADER ================= */}
      <div className="remove-faculty-header">

        <div className="remove-faculty-header-left">

          <div className="remove-faculty-header-icon">
            <FiShield />
          </div>

          <div className="remove-faculty-header-content">
            <span className="remove-faculty-eyebrow">
              R&D COORDINATOR MANAGEMENT
            </span>

            <h1 className="remove-faculty-title">
              R&D Coordinator Directory
            </h1>

            <p className="remove-faculty-description">
              Manage registered R&D Coordinator accounts and remove
              coordinator access when required.
            </p>
          </div>

        </div>

        <div className="remove-faculty-count">
          <div className="remove-faculty-count-icon">
            <FiUsers />
          </div>

          <div>
            <strong>{rdCoordinators.length}</strong>
            <span>R&D Coordinators</span>
          </div>
        </div>

      </div>

      {/* ================= SEARCH TOOLBAR ================= */}
      <div className="remove-faculty-toolbar">

        <div className="remove-faculty-search-wrapper">

          <FiSearch className="remove-faculty-search-icon" />

          <input
            type="text"
            placeholder="Search by name, email, coordinator ID, department..."
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
          <FiCheckCircle />
          <span>
            {filteredCoordinators.length}{" "}
            {filteredCoordinators.length === 1
              ? "Coordinator"
              : "Coordinators"}{" "}
            found
          </span>
        </div>

      </div>

      {/* ================= COORDINATOR CARDS ================= */}
      <div className="remove-faculty-card-list">

        {filteredCoordinators.length === 0 ? (
          <div className="remove-faculty-empty">

            <div className="remove-faculty-empty-icon">
              <FiUsers />
            </div>

            <h3>No R&D Coordinators Found</h3>

            <p>
              {search
                ? "No coordinator matches your search criteria."
                : "There are currently no registered R&D Coordinators."}
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
        ) : (
          filteredCoordinators.map((rd) => {

            const initials = rd.fullName
              ? rd.fullName
                  .split(" ")
                  .map((name) => name.charAt(0))
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "RC";

            return (
              <div key={rd._id} className="remove-faculty-card">

                {/* CARD TOP */}
                <div className="remove-faculty-card-top">

                  <div className="remove-faculty-profile">

                    <div className="remove-faculty-avatar">
                      {initials}
                    </div>

                    <div className="remove-faculty-identity">

                      <h3>{rd.fullName || "Unnamed Coordinator"}</h3>

                      <span>
                        R&D Coordinator ID:{" "}
                        <strong>{rd.userId}</strong>
                      </span>

                    </div>

                  </div>

                  <div className="remove-faculty-department-badge">
                    <FiShield />
                    {rd.department || "Research Administration"}
                  </div>

                </div>

                <div className="remove-faculty-divider" />

                {/* DETAILS */}
                <div className="remove-faculty-details">

                  <div className="remove-faculty-detail">
                    <FiMail className="remove-faculty-detail-icon" />
                    <div>
                      <span>Email</span>
                      <strong>{rd.email || "Not Available"}</strong>
                    </div>
                  </div>

                  <div className="remove-faculty-detail">
                    <FiPhone className="remove-faculty-detail-icon" />
                    <div>
                      <span>Phone</span>
                      <strong>
                        {rd.phoneNumber || "Not Available"}
                      </strong>
                    </div>
                  </div>

                  <div className="remove-faculty-detail">
                    <FiUser className="remove-faculty-detail-icon" />
                    <div>
                      <span>Gender</span>
                      <strong>{rd.gender || "Not Available"}</strong>
                    </div>
                  </div>

                  <div className="remove-faculty-detail">
                    <FiBriefcase className="remove-faculty-detail-icon" />
                    <div>
                      <span>Role</span>
                      <strong>R&D Coordinator</strong>
                    </div>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="remove-faculty-card-footer">

                  <div className="remove-faculty-account-status">
                    <span className="remove-faculty-status-dot" />
                    <span>Registered Coordinator Account</span>
                  </div>

                  <button
                    className="remove-faculty-remove-btn"
                    onClick={() => handleRemove(rd.userId)}
                  >
                    <FiTrash2 />
                    <span>Remove Coordinator</span>
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>
    </div>
  );
};

export default RemoveRDCoordinator;