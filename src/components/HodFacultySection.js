import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import "./HodFacultySection.css";
// import CoAuthorNetwork from "./CoAuthorNetwork";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";


export default function HodFacultySection({ hodProfile }) {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [visibleCount, setVisibleCount] = useState(8);
  const [hovered, setHovered] = useState(null);

  const loadMoreRef = useRef(null);

  const dept = hodProfile?.department;

  // ---------------- FETCH ----------------
  useEffect(() => {
    if (!dept) return;

    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/hod/faculty?dept=${dept}`
        );
        setFacultyList(res.data || []);
      } catch {
        setError("Failed to load faculty list");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [dept]);

  // ---------------- INSTANT SEARCH ----------------
  const filteredFaculty = useMemo(() => {
    if (!searchText) return facultyList;

    const q = searchText.toLowerCase();

    return facultyList.filter(
      (f) =>
        f.fullName?.toLowerCase().includes(q) ||
        f.userId?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q)
    );
  }, [searchText, facultyList]);

  // ---------------- INFINITE SCROLL ----------------
  const visibleFaculty = filteredFaculty.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 6);
      }
    });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, []);

  // ---------------- BADGE LOGIC ----------------
  const getBadge = (count) => {
    if (count >= 20) return "🥇 Elite Researcher";
    if (count >= 10) return "🥈 Active Researcher";
    if (count >= 5) return "🥉 Emerging Researcher";
    return "⚪ Beginner";
  };

  // ---------------- DETAILS ----------------
  const viewDetails = async (facultyUserId) => {
  try {
    const [facultyRes, pubRes, coRes] = await Promise.all([
      axios.get(`http://localhost:5000/api/hod/faculty-details/${facultyUserId}`),
      axios.get(`http://localhost:5000/api/faculty/publications/${facultyUserId}`),
      axios.get(`http://localhost:5000/api/faculty/coauthors/${facultyUserId}`)
    ]);

    setSelectedFaculty({
      ...facultyRes.data,
      publications: pubRes.data || [],
      coAuthors: coRes.data || []
    });

  } catch (err) {
    setError("Failed to fetch faculty details");
  }
};
  // const viewDetails = async (facultyUserId) => {
  //   try {
  //     const res = await axios.get(
  //       `http://localhost:5000/api/hod/faculty-details/${facultyUserId}`
  //     );
  //     setSelectedFaculty(res.data);
  //   } catch {
  //     setError("Failed to fetch faculty details");
  //   }
  // };

  const closeModal = () => setSelectedFaculty(null);

  if (!dept) return <p>Loading HOD info...</p>;

  return (
    <div className="hod-faculty-section">

      <h2>Faculty Directory</h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search faculty..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="faculty-search"
      />

      {loading && <p>Loading faculty...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* FACULTY LIST */}
      <div className="faculty-container">

        {visibleFaculty.map((faculty) => (
          <motion.div
            key={faculty.userId}
            className="faculty-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            onMouseEnter={() => setHovered(faculty)}
            onMouseLeave={() => setHovered(null)}
          >

            <img
              src={
                faculty.profilePic
                  ? `http://localhost:5000/${faculty.profilePic}`
                  : "/default-profile.png"
              }
              alt=""
            />

            <h4>{faculty.fullName}</h4>
            <p>ID: {faculty.userId}</p>

            {/* AI BADGE */}
            <span className="badge">
              {getBadge(faculty.publicationCount || 0)}
            </span>

            <button onClick={() => viewDetails(faculty.userId)}>
              View Profile
            </button>
          </motion.div>
        ))}

      </div>

      {/* INFINITE SCROLL TRIGGER */}
      <div ref={loadMoreRef} style={{ height: "50px" }} />

      {/* HOVER PREVIEW */}
      {hovered && (
        <div className="hover-preview">
          <img
            src={
              hovered.profilePic
                ? `http://localhost:5000/${hovered.profilePic}`
                : "/default-profile.png"
            }
          />
          <h4>{hovered.fullName}</h4>
          <p>{hovered.email}</p>
          
        </div>
      )}

      {/* MODAL */}
      {selectedFaculty && (
        <div className="faculty-modal-overlay">
          <div className="faculty-modal">

            <button className="close-btn" onClick={closeModal}>
              <IoClose size={22} />
            </button>

            <div className="modal-header">
              <img
                src={
                  selectedFaculty.profilePic
                    ? `http://localhost:5000/${selectedFaculty.profilePic}`
                    : "/default-profile.png"
                }
              />
              <h3>{selectedFaculty.fullName}</h3>
            </div>

            <p><strong>ID:</strong> {selectedFaculty.userId}</p>
            <p><strong>Email:</strong> {selectedFaculty.email}</p>
            <p><strong>Department:</strong> {selectedFaculty.department}</p>
             <p>
               <strong>Phone:</strong> {selectedFaculty.phoneNumber}
             </p>

             <p>
               <strong>Education:</strong> {selectedFaculty.educationDetails}
             </p>
          </div>
        </div>
      )}

    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./HodFacultySection.css";

// export default function HodFacultySection({ hodProfile }) {
//   const [facultyList, setFacultyList] = useState([]);
//   const [filteredFaculty, setFilteredFaculty] = useState([]);
//   const [selectedFaculty, setSelectedFaculty] = useState(null);
//   const [error, setError] = useState("");
//   const [searchText, setSearchText] = useState("");

//   const dept = hodProfile?.department;

//   // Fetch faculty list
//   useEffect(() => {
//     if (!dept) return;

//     const fetchFaculty = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/hod/faculty?dept=${dept}`
//         );
//         setFacultyList(res.data);
//         setFilteredFaculty(res.data);
//       } catch (err) {
//         console.error("Error fetching faculty list:", err);
//         setError("Failed to fetch faculty list.");
//       }
//     };

//     fetchFaculty();
//   }, [dept]);

//   // Filter faculty as user types
//   useEffect(() => {
//     const filtered = facultyList.filter(
//       (f) =>
//         f.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
//         f.userId.toLowerCase().includes(searchText.toLowerCase()) ||
//         f.email.toLowerCase().includes(searchText.toLowerCase())
//     );
//     setFilteredFaculty(filtered);
//   }, [searchText, facultyList]);

//   // Fetch single faculty details
//   const viewDetails = async (facultyUserId) => {
//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/hod/faculty-details/${facultyUserId}`
//       );
//       setSelectedFaculty(res.data);
//     } catch (err) {
//       console.error("Error fetching faculty details:", err);
//       setError("Failed to fetch faculty details.");
//     }
//   };

//   const closeModal = () => setSelectedFaculty(null);

//   if (!dept) return <p>Loading HOD info...</p>;

//   return (
//     <div className="hod-faculty-section">
//       <h2>Faculty List</h2>
//       {error && <p className="error-text">{error}</p>}

//       {/* Search bar */}
//       <input
//         type="text"
//         placeholder="Search by name, ID, or email..."
//         value={searchText}
//         onChange={(e) => setSearchText(e.target.value)}
//         className="faculty-search"
//       />

//       <div className="faculty-container">
//         {filteredFaculty.length === 0 && <p>No faculty found.</p>}
//         {filteredFaculty.map((faculty) => (
//           <div key={faculty.userId} className="faculty-card">
//             <img
//               src={`http://localhost:5000/${faculty.profilePic}`}
//               alt="profile"
//             />
//             <h4>{faculty.fullName}</h4>
//             <h5>ID: {faculty.userId}</h5>
//             <button
//               className="view-details-btn"
//               onClick={() => viewDetails(faculty.userId)}
//             >
//               View Details
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Popup Modal */}
//       {selectedFaculty && (
//         <div className="faculty-modal-overlay">
//           <div className="faculty-modal">
//             <button className="close-btn" onClick={closeModal}>
//               ✖
//             </button>
//             <div className="modal-header">
//               <img
//                 src={`http://localhost:5000/${selectedFaculty.profilePic}`}
//                 alt="profile"
//               />
//               <h3>{selectedFaculty.fullName}</h3>
//             </div>
//             <p>
//               <strong>Faculty ID:</strong> {selectedFaculty.userId}
//             </p>
//             <p>
//               <strong>Email:</strong> {selectedFaculty.email}
//             </p>
//             <p>
//               <strong>Phone:</strong> {selectedFaculty.phoneNumber}
//             </p>
//             <p>
//               <strong>Gender:</strong> {selectedFaculty.gender}
//             </p>
//             <p>
//               <strong>Department:</strong> {selectedFaculty.department}
//             </p>
//             <p>
//               <strong>Education:</strong> {selectedFaculty.educationDetails}
//             </p>
//             <p>
//               <strong>Experience:</strong> {selectedFaculty.experienceDetails}
//             </p>
//             <h4>Publications:</h4>
//             {selectedFaculty.publications?.length === 0 ? (
//               <p>No publications found.</p>
//             ) : (
//               <ul>
//                 {selectedFaculty.publications.map((pub, idx) => (
//                   <li key={idx}>{pub.title}</li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }