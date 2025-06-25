// src/pages/FacultyLogin.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomNavbar from './CustomNavbar';

export default function FacultyLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Dummy check - Replace with backend auth logic
    if (username === 'admin' && password === 'admin123') {
      navigate('/mainAdmin-dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div>
      <CustomNavbar></CustomNavbar>
    
    <div style={styles.container}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Log in</button>
        <div style={styles.options}>
          <label>
            <input type="checkbox" /> Remember Me
          </label>
          <Link to="#" style={styles.link}>Forgot Password?</Link>
        </div>
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
  options: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  },
  link: {
    textDecoration: 'none'
  }
};
