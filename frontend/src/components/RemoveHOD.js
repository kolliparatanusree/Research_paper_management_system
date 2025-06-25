import React, { useEffect, useState } from 'react';
import './RemoveFaculty.css';

const RemoveHOD = () => {
  const [hods, setHods] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredHods, setFilteredHods] = useState([]);

  useEffect(() => {
    const fetchHods = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/main-admin/hods');
        const data = await response.json();
        setHods(data);
        setFilteredHods(data);
      } catch (err) {
        console.error('Error fetching HODs:', err);
      }
    };

    fetchHods();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = hods.filter(hod =>
      Object.values(hod).some(value =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
    setFilteredHods(filtered);
  }, [search, hods]);

  const handleRemove = async (hodId) => {
    if (!window.confirm('Are you sure you want to remove this HOD?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/main-admin/remove-hod/${hodId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        alert('HOD removed successfully');
        setHods(prev => prev.filter(hod => hod._id !== hodId));
      } else {
        alert(data.message || 'Failed to remove HOD');
      }
    } catch (err) {
      console.error('Error removing HOD:', err);
      alert('Something went wrong while removing HOD.');
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
        {filteredHods.map(hod => (
          <div key={hod._id} className="hod-card">
            <h4>{hod.fullName}</h4>
            <p><strong>Email:</strong> {hod.email}</p>
            <p><strong>HOD ID:</strong> {hod.hodId}</p>
            <p><strong>Phone:</strong> {hod.phoneNumber}</p>
            <p><strong>Gender:</strong> {hod.gender}</p>
            <p><strong>Department:</strong> {hod.department}</p>

            <button
              className="remove-btn"
              onClick={() => handleRemove(hod._id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemoveHOD;
