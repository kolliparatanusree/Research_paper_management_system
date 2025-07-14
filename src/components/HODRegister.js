import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function HodRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    hodId: '',
    phoneNumber: '',
    gender: '',
    department: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const { confirmPassword, ...payload } = formData;
      const res = await axios.post('http://localhost:5000/api/hod/register', payload);
      alert(res.data.message);
      navigate('/hod-login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2>HoD Registration</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required style={styles.input} />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={styles.input} />
        <input name="hodId" placeholder="HoD ID" value={formData.hodId} onChange={handleChange} required style={styles.input} />
        <input name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required style={styles.input} />
        <select name="gender" value={formData.gender} onChange={handleChange} required style={styles.input}>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
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
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={styles.input} />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required style={styles.input} />
        <button type="submit" style={styles.button}>Register</button>
        <p style={{ marginTop: '10px' }}>Already registered? <Link to="/hod-login">Login</Link></p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px', margin: '40px auto', padding: '20px',
    border: '1px solid #ccc', borderRadius: '10px', textAlign: 'center'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '10px', fontSize: '16px' },
  button: { padding: '10px', backgroundColor: '#007BFF', color: '#fff', fontWeight: 'bold', border: 'none' }
};
