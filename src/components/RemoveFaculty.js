import React, { useEffect, useState } from 'react';
import './RemoveFaculty.css';
import Swal from 'sweetalert2'; // ✅ import

const RemoveFaculty = () => {
  const [faculties, setFaculties] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredFaculties, setFilteredFaculties] = useState([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/main-admin/faculties');
        const data = await response.json();
        setFaculties(data);
        setFilteredFaculties(data);
      } catch (err) {
        console.error('Error fetching faculties:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load faculty list'
        });
      }
    };

    fetchFaculties();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = faculties.filter(faculty =>
      Object.values(faculty).some(value =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
    setFilteredFaculties(filtered);
  }, [search, faculties]);

  const handleRemove = async (userId) => {
    // ✅ SweetAlert confirmation
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This faculty will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/main-admin/remove-faculty/${userId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Faculty removed successfully',
          timer: 2000,
          showConfirmButton: false
        });

        setFaculties(prev =>
          prev.filter(faculty => faculty.userId !== userId)
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.message || 'Failed to remove faculty'
        });
      }
    } catch (err) {
      console.error('Error removing faculty:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while removing faculty.'
      });
    }
  };

  return (
    <div className="remove-faculty-container">
      <input
        type="text"
        placeholder="Search by any detail (name, email, ID...)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="faculty-card-list">
        {filteredFaculties.map((faculty) => (
          <div key={faculty._id} className="faculty-card">
            <h4 className="faculty-name">{faculty.fullName}</h4>
            <p><strong>Email:</strong> {faculty.email}</p>
            <p><strong>Faculty ID:</strong> {faculty.userId}</p>
            <p><strong>Phone:</strong> {faculty.phoneNumber}</p>
            <p><strong>Gender:</strong> {faculty.gender}</p>
            <p><strong>Department:</strong> {faculty.department}</p>

            <button
              className="remove-btn"
              onClick={() => handleRemove(faculty.userId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemoveFaculty;


// import React, { useEffect, useState } from 'react';
// import './RemoveFaculty.css';

// const RemoveFaculty = () => {
//   const [faculties, setFaculties] = useState([]);
//   const [search, setSearch] = useState('');
//   const [filteredFaculties, setFilteredFaculties] = useState([]);

//   useEffect(() => {
//     const fetchFaculties = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/main-admin/faculties');
//         const data = await response.json();
//         setFaculties(data);
//         setFilteredFaculties(data);
//       } catch (err) {
//         console.error('Error fetching faculties:', err);
//       }
//     };

//     fetchFaculties();
//   }, []);

//   useEffect(() => {
//     const lowerSearch = search.toLowerCase();
//     const filtered = faculties.filter(faculty =>
//       Object.values(faculty).some(value =>
//         String(value).toLowerCase().includes(lowerSearch)
//       )
//     );
//     setFilteredFaculties(filtered);
//   }, [search, faculties]);

//   const handleRemove = async (facultyId) => {
//     if (!window.confirm('Are you sure you want to remove this faculty?')) return;

//     try {
//       const response = await fetch(`http://localhost:5000/api/main-admin/remove-faculty/${facultyId}`, {
//         method: 'DELETE',
//       });
//       const data = await response.json();

//       if (response.ok) {
//         alert('Faculty removed successfully');
//         // Remove faculty from local state to update UI
//         setFaculties(prev => prev.filter(faculty => faculty._id !== facultyId));
//       } else {
//         alert(data.message || 'Failed to remove faculty');
//       }
//     } catch (err) {
//       console.error('Error removing faculty:', err);
//       alert('Something went wrong while removing faculty.');
//     }
//   };

//   return (
//     <div className="remove-faculty-container">

//       <input
//         type="text"
//         placeholder="Search by any detail (name, email, ID...)"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="search-input"
//       />

//       <div className="faculty-card-list">
//         {filteredFaculties.map((faculty) => (
//           <div key={faculty._id} className="faculty-card">
//             <h4 className="faculty-name">{faculty.fullName}</h4>
//             <p><strong>Email:</strong> {faculty.email}</p>
//             <p><strong>Faculty ID:</strong> {faculty.facultyId}</p>
//             <p><strong>Phone:</strong> {faculty.phoneNumber}</p>
//             <p><strong>Gender:</strong> {faculty.gender}</p>
//             <p><strong>Department:</strong> {faculty.department}</p>

//             <button 
//               className="remove-btn"
//               onClick={() => handleRemove(faculty._id)}
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RemoveFaculty;
