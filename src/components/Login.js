import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomNavbar from './CustomNavbar';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (userId === 'admin' && password === 'admin123') {
    localStorage.setItem('userId', 'admin');
    localStorage.setItem('role', 'admin');
    alert('Login successful');
    navigate('/mainAdmin-dashboard');
    return;
  }

  if (userId === 'principal' && password === 'principal123') {
    localStorage.setItem('userId', 'principal');
    localStorage.setItem('role', 'principal');
    alert('Login successful');
    navigate('/principal-dashboard');
    return;
  }

  if (userId === 'rddean' && password === 'rddean123') {
    localStorage.setItem('userId', 'rddean');
    localStorage.setItem('role', 'rddean');
    alert('Login successful');
    navigate('/rd-dean-dashboard');
    return;
  }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        userId,
        password
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      const { role, userId: id } = res.data.user;

// 🔥 STORE THESE FOR ALL ROLES
localStorage.setItem('userId', id);
localStorage.setItem('role', role);

// optional role-based ids
if (role === 'hod') localStorage.setItem('hodId', id);
if (role === 'faculty') localStorage.setItem('facultyId', id);

      // const { role, userId: id } = res.data.user;


      //  if (role === 'hod') localStorage.setItem('hodId', id);
      // 🔥 store complete user object
// localStorage.setItem("user", JSON.stringify(res.data.user));

      // localStorage.setItem('userId', id);
      // localStorage.setItem('role', role);

      alert(res.data.message);

      // 🔁 Role-based redirect
      switch (role) {
        case 'faculty':
          navigate('/faculty-dashboard');
          break;
        case 'hod':
          navigate('/hod-dashboard');
          break;
        case 'rdCoordinator':
          navigate('/rd-dashboard');
          break;
        case 'rdDean':
          navigate('/rd-dean-dashboard');
          break;
        case 'principal':
          navigate('/principal-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          alert('Invalid role');
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <CustomNavbar />
      <div style={styles.container}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
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

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(prev => !prev)}
            />
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



// // src/pages/FacultyLogin.js
// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import CustomNavbar from './CustomNavbar';

// export default function FacultyLogin() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();

//     // Dummy check - Replace with backend auth logic
//     if (username === 'admin' && password === 'admin123') {
//       navigate('/mainAdmin-dashboard');
//     } else {
//       alert('Invalid credentials');
//     }
//   };

//   return (
//     <div>
//       <CustomNavbar></CustomNavbar>
    
//     <div style={styles.container}>
//       <h2>Admin Login</h2>
//       <form onSubmit={handleLogin} style={styles.form}>
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//           style={styles.input}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           style={styles.input}
//         />
//         <button type="submit" style={styles.button}>Log in</button>
//         <div style={styles.options}>
//           <label>
//             <input type="checkbox" /> Remember Me
//           </label>
//           <Link to="#" style={styles.link}>Forgot Password?</Link>
//         </div>
//       </form>
//     </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     maxWidth: '400px',
//     margin: '50px auto',
//     textAlign: 'center',
//     padding: '20px',
//     border: '1px solid #ccc',
//     borderRadius: '10px'
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '15px'
//   },
//   input: {
//     padding: '10px',
//     fontSize: '16px'
//   },
//   button: {
//     padding: '10px',
//     backgroundColor: '#007BFF',
//     color: 'white',
//     fontWeight: 'bold',
//     border: 'none',
//     cursor: 'pointer'
//   },
//   options: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     fontSize: '14px'
//   },
//   link: {
//     textDecoration: 'none'
//   }
// };
