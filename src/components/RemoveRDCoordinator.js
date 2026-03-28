// File: src/components/admin/RemoveRDCoordinator.jsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './RemoveFaculty.css'; // Keep your styling

const RemoveRDCoordinator = () => {
  const [rdCoordinators, setRdCoordinators] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredCoordinators, setFilteredCoordinators] = useState([]);

  // ✅ Fetch all RD Coordinators
  useEffect(() => {
    const fetchRDCoordinators = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/main-admin/rdcoordinators');
        if (!response.ok) throw new Error('Failed to fetch RD Coordinators');
        const data = await response.json();
        setRdCoordinators(data);
        setFilteredCoordinators(data);
      } catch (err) {
        console.error('Error fetching RD Coordinators:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch RD Coordinators'
        });
      }
    };
    fetchRDCoordinators();
  }, []);

  // ✅ Filter RD Coordinators on search
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = rdCoordinators.filter(rd =>
      Object.values(rd).some(value =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
    setFilteredCoordinators(filtered);
  }, [search, rdCoordinators]);

  // ✅ Remove RD Coordinator
  const handleRemove = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently remove the RD Coordinator.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/main-admin/remove-rdcoordinator/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'RD Coordinator removed successfully'
        });
        setRdCoordinators(prev => prev.filter(rd => rd.userId !== userId));
        setFilteredCoordinators(prev => prev.filter(rd => rd.userId !== userId));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: data.message || 'Failed to remove RD Coordinator'
        });
      }
    } catch (err) {
      console.error('Error removing RD Coordinator:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while removing RD Coordinator.'
      });
    }
  };

  return (
    <div className="remove-hod-container">
      <input
        type="text"
        placeholder="Search by any detail (name, email, ID...)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="hod-card-list">
        {filteredCoordinators.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>No RD Coordinators found.</p>
        )}
        {filteredCoordinators.map(rd => (
          <div key={rd._id} className="hod-card">
            <h4>{rd.fullName}</h4>
            <p><strong>Email:</strong> {rd.email}</p>
            <p><strong>RD Coordinator ID:</strong> {rd.userId}</p>
            <p><strong>Phone:</strong> {rd.phoneNumber}</p>
            <p><strong>Gender:</strong> {rd.gender}</p>
            <p><strong>Department:</strong> {rd.department}</p>

            <button
              className="remove-btn"
              onClick={() => handleRemove(rd.userId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemoveRDCoordinator;