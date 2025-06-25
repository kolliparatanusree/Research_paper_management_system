// src/pages/FacultyLogin.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomNavbar from './CustomNavbar';

export default function FacultyLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Dummy check - Replace with backend auth logic
    if (username === 'principal' && password === 'svecw123') {
      navigate('/principal-dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div>
      <CustomNavbar></CustomNavbar>
    <div style={styles.container}>
      <h2>Principal Login</h2>
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
          type={showPassword ? 'text' : 'password'} // ⬅️ Toggle type
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <label style={{ fontSize: '14px', textAlign: 'left' }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((prev) => !prev)}
          />{' '}
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
  options: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  },
  link: {
    textDecoration: 'none'
  }
};
