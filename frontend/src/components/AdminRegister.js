import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    adminId: '',
    gender: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/admin/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        adminId: formData.adminId,
        gender: formData.gender
      });

      alert(response.data.message);
      navigate('/admin-login');
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
      <h2>R&D ADMIN REGISTER</h2>
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
        <input
          type="text"
          name="adminId"
          placeholder="Admin ID"
          value={formData.adminId}
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
          or <Link to="/admin-login">Log in</Link>
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
