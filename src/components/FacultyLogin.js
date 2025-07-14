import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomNavbar from './CustomNavbar';

export default function FacultyLogin() {
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 for toggling visibility
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/faculty/login', {
        facultyId,
        password
      });

      alert(response.data.message);

      localStorage.setItem('facultyId', response.data.faculty.facultyId);
      navigate('/faculty-dashboard');
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      } else {
        alert('Login failed. Please try again.');
      }
    }
  };

  return (
    <div>
      <CustomNavbar></CustomNavbar>
    <div style={styles.container}>
      <h2>Faculty Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Faculty ID"
          value={facultyId}
          onChange={(e) => setFacultyId(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        {/* 👇 Show Password checkbox */}
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((prev) => !prev)}
          />
          Show Password
        </label>

        <button type="submit" style={styles.button}>Log in</button>
      </form>
    </div>
     </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    textAlign: 'center',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px'
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
    backgroundColor: '#007BFF',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '14px',
    textAlign: 'left'
  }
};
