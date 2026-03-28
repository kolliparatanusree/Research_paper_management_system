import React, { useState, useEffect } from "react";
import axios from "axios";
import "./HodFacultySection.css";

export default function HodFacultySection({ hodProfile }) {
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const dept = hodProfile?.department;

  // Fetch faculty list
  useEffect(() => {
    if (!dept) return;

    const fetchFaculty = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/hod/faculty?dept=${dept}`
        );
        setFacultyList(res.data);
        setFilteredFaculty(res.data);
      } catch (err) {
        console.error("Error fetching faculty list:", err);
        setError("Failed to fetch faculty list.");
      }
    };

    fetchFaculty();
  }, [dept]);

  // Filter faculty as user types
  useEffect(() => {
    const filtered = facultyList.filter(
      (f) =>
        f.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        f.userId.toLowerCase().includes(searchText.toLowerCase()) ||
        f.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredFaculty(filtered);
  }, [searchText, facultyList]);

  // Fetch single faculty details
  const viewDetails = async (facultyUserId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/hod/faculty-details/${facultyUserId}`
      );
      setSelectedFaculty(res.data);
    } catch (err) {
      console.error("Error fetching faculty details:", err);
      setError("Failed to fetch faculty details.");
    }
  };

  const closeModal = () => setSelectedFaculty(null);

  if (!dept) return <p>Loading HOD info...</p>;

  return (
    <div className="hod-faculty-section">
      <h2>Faculty List</h2>
      {error && <p className="error-text">{error}</p>}

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by name, ID, or email..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="faculty-search"
      />

      <div className="faculty-container">
        {filteredFaculty.length === 0 && <p>No faculty found.</p>}
        {filteredFaculty.map((faculty) => (
          <div key={faculty.userId} className="faculty-card">
            <img
              src={`http://localhost:5000/${faculty.profilePic}`}
              alt="profile"
            />
            <h4>{faculty.fullName}</h4>
            <h5>ID: {faculty.userId}</h5>
            <button
              className="view-details-btn"
              onClick={() => viewDetails(faculty.userId)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedFaculty && (
        <div className="faculty-modal-overlay">
          <div className="faculty-modal">
            <button className="close-btn" onClick={closeModal}>
              ✖
            </button>
            <div className="modal-header">
              <img
                src={`http://localhost:5000/${selectedFaculty.profilePic}`}
                alt="profile"
              />
              <h3>{selectedFaculty.fullName}</h3>
            </div>
            <p>
              <strong>Faculty ID:</strong> {selectedFaculty.userId}
            </p>
            <p>
              <strong>Email:</strong> {selectedFaculty.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedFaculty.phoneNumber}
            </p>
            <p>
              <strong>Gender:</strong> {selectedFaculty.gender}
            </p>
            <p>
              <strong>Department:</strong> {selectedFaculty.department}
            </p>
            <p>
              <strong>Education:</strong> {selectedFaculty.educationDetails}
            </p>
            <p>
              <strong>Experience:</strong> {selectedFaculty.experienceDetails}
            </p>
            <h4>Publications:</h4>
            {selectedFaculty.publications?.length === 0 ? (
              <p>No publications found.</p>
            ) : (
              <ul>
                {selectedFaculty.publications.map((pub, idx) => (
                  <li key={idx}>{pub.title}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}