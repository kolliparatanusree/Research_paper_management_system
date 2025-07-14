import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomNavbar from './CustomNavbar';

export default function HodLogin() {
  const [hodId, setHodId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ⬅️ New state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/hod/login', { hodId, password });
      alert(res.data.message);
      localStorage.setItem('hodId', res.data.hod.hodId);
      navigate('/hod-dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <CustomNavbar></CustomNavbar>
    
    <div style={styles.container}>
      <h2>HoD Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="HoD ID"
          value={hodId}
          onChange={(e) => setHodId(e.target.value)}
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
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '40px auto',
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
    color: '#fff',
    fontWeight: 'bold',
    border: 'none'
  }
};
