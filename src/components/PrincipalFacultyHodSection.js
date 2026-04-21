import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PrincipalFacultyHodSection.css";
export default function PrincipalFacultyHodSection({ type }) {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [department, setDepartment] = useState("");
const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          type === "faculty"
            ? "http://localhost:5000/api/principal/faculty"
            : "http://localhost:5000/api/principal/hod";
        const res = await axios.get(url);
        setList(res.data);
        setFilteredList(res.data);
      } catch (err) {
        console.error(err);
        setError(`Failed to load ${type} data`);
      }
    };
    fetchData();
  }, [type]);


  useEffect(() => {
  const fetchData = async () => {
    try {
      const url =
        type === "faculty"
          ? "http://localhost:5000/api/principal/faculty"
          : "http://localhost:5000/api/principal/hod";

      const res = await axios.get(url);

      setList(res.data);
      setFilteredList(res.data);

      // 🔹 Extract unique departments
      const deptList = [...new Set(res.data.map(p => p.department))];
      setDepartments(deptList);

    } catch (err) {
      console.error(err);
      setError(`Failed to load ${type} data`);
    }
  };
  fetchData();
}, [type]);

useEffect(() => {
  let filtered = list.filter(
    p =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.userId.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Department filter
  if (department !== "") {
    filtered = filtered.filter(p => p.department === department);
  }

  setFilteredList(filtered);

}, [search, department, list]);

  // useEffect(() => {
  //   setFilteredList(
  //     list.filter(
  //       p =>
  //         p.fullName.toLowerCase().includes(search.toLowerCase()) ||
  //         p.userId.toLowerCase().includes(search.toLowerCase()) ||
  //         p.email.toLowerCase().includes(search.toLowerCase())
  //     )
  //   );
  // }, [search, list]);

  const viewDetails = async (userId) => {
    try {
      const url =
        type === "faculty"
          ? `http://localhost:5000/api/principal/faculty-details/${userId}`
          : `http://localhost:5000/api/principal/hod-details/${userId}`;
      const res = await axios.get(url);
      setSelectedPerson(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch details");
    }
  };

  const closeModal = () => setSelectedPerson(null);

  return (
    <div className="faculty-hod-page">
      {error && <p style={{ color: "red" }}>{error}</p>}
     <div className="filter-container">

  <input
    type="text"
    placeholder={`Search ${type} by name, ID, email...`}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="search-input"
  />

  <select
    value={department}
    onChange={(e) => setDepartment(e.target.value)}
    className="department-dropdown"
  >
    <option value="">All Departments</option>
    {departments.map((dept, index) => (
      <option key={index} value={dept}>
        {dept}
      </option>
    ))}
  </select>

</div>

      <div className="card-container">
        {/* {filteredList.length === 0 && <p>No {type} found.</p>} */}
        {filteredList.length === 0 && (
  <div style={{ textAlign: "center", width: "100%", marginTop: "50px" }}>
    <h3>No {type} found 😕</h3>
    <p>Try adjusting search or filters</p>
  </div>
)}
        {filteredList.map(p => (
          <div key={p.userId} className="profile-card">
            <img
  src={`http://localhost:5000/${p.profilePic}`}
  alt="profile"
  className="profile-img"
/>
{/* <div
  key={p.userId}
  className="profile-card"
  onClick={() => viewDetails(p.userId)}
>      */}
<h4>{p.fullName}</h4>
            <h5>ID: {p.userId}</h5>
            <button className="view-btn" onClick={() => viewDetails(p.userId)}>
  View Details
</button>
          </div>
        ))}
      </div>

      {selectedPerson && (
        <div className="details-modal">
         <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>
              ✖
            </button>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {/* <img
  src={`http://localhost:5000/${selectedPerson.profilePic}`}
  alt="profile"
  className="modal-profile-img"
/> */}<img
  src={`http://localhost:5000/${selectedPerson.profilePic}`}
  alt="profile"
  className="modal-profile-img"
  onError={(e) => (e.target.src = "/default-avatar.png")}
/>
              <h3>{selectedPerson.fullName}</h3>
            </div>
            <p><strong>ID:</strong> {selectedPerson.userId}</p>
            <p><strong>Email:</strong> {selectedPerson.email}</p>
            <p><strong>Phone:</strong> {selectedPerson.phoneNumber}</p>
            {/* <p><strong>Gender:</strong> {selectedPerson.gender}</p> */}
            <p><strong>Department:</strong> {selectedPerson.department}</p>
            {selectedPerson.educationDetails && (
              <p><strong>Education:</strong> {selectedPerson.educationDetails}</p>
            )}
            {/* {selectedPerson.experienceDetails && (
              <p><strong>Experience:</strong> {selectedPerson.experienceDetails}</p>
            )} */}
            {/* {type === "faculty" && selectedPerson.publications?.length > 0 && (
              <>
                <h4>Publications:</h4>
                <ul>
                  {selectedPerson.publications.map((pub, idx) => (
                    <li key={idx}>{pub.title}</li>
                  ))}
                </ul>
              </>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}