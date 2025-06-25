import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
export default function FacultyRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    facultyId: '',
    phoneNumber: '',
    gender: '',
    department: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Normally, send formData to backend here
    try {
      const response = await axios.post('http://localhost:5000/api/faculty/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        facultyId: formData.facultyId,
        gender: formData.gender,
        department : formData.department
      });

      alert(response.data.message);
      navigate('/faculty-login');
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message || 'Registration failed');
      } else {
        alert('Server error. Please try again.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Faculty Registration</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="facultyId"
          placeholder="Faculty ID"
          value={formData.facultyId}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="IT">IT</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>Create Account</button>
        <p style={{ marginTop: '10px' }}>
          Already have an account? <Link to="/faculty-login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '10px',
    fontSize: '16px'
  },
  button: {
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer'
  }
};
