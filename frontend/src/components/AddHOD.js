import React, { useState } from 'react';
import './AddFacultyForm.css';

const AddHOD = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    hodId: '',
    phoneNumber: '',
    gender: '',
    department: ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!/^\d{10}$/.test(form.phoneNumber)) {
      alert('Phone number must be exactly 10 digits');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/main-admin/add-hod', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          hodId: form.hodId,
          phoneNumber: form.phoneNumber,
          gender: form.gender,
          department: form.department
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('HOD added successfully');
        setForm({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          hodId: '',
          phoneNumber: '',
          gender: '',
          department: ''
        });
      } else {
        alert(data.message || 'Failed to add HOD');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="x">
      <h3 className="form-title">Add HOD</h3>
      <form onSubmit={handleSubmit} className="faculty-form">
        <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required /><br />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required /><br />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required /><br />
        <input type="text" name="hodId" placeholder="HOD ID" value={form.hodId} onChange={handleChange} required /><br />
        <input type="text" name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} required /><br />

        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select><br />

        <select name="department" value={form.department} onChange={handleChange} required>
          <option value="">Select Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="IT">IT</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select><br />

        <button type="submit" className="submit-btn">Add HOD</button>
      </form>
    </div>
  );
};

export default AddHOD;
