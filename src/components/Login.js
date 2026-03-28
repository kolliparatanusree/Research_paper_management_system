import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomNavbar from './CustomNavbar';
import Swal from 'sweetalert2';
import './Login.css';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const navigate = useNavigate();
  // const { role, userId: id } = res.data.user;

  const getDashboardRoute = (role) => {
  switch (role) {
    case 'faculty': return '/faculty-dashboard';
    case 'hod': return '/hod-dashboard';
    case 'principal': return '/principal-dashboard';
    case 'rdCoordinator': return '/rd-dashboard';
    case 'rdDean': return '/rd-dean-dashboard';
    case 'admin': return '/mainAdmin-dashboard';
    default: return '/';
  }
};

  const handleChangePassword = async (e) => {
  e.preventDefault();

  if (newPassword !== confirmNewPassword) {
    return Swal.fire('Error', 'Passwords do not match', 'error');
  }

  try {
    const userId = localStorage.getItem('userId');
if (!userId) {
  return Swal.fire('Error', 'User not logged in', 'error');
}
  console.log({ userId, currentPassword, newPassword });
    await axios.post('http://localhost:5000/api/auth/change-password', {
      userId,
      currentPassword,
      newPassword
    });

    Swal.fire('Success', 'Password updated successfully', 'success');
    setShowChangePwd(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  } catch (err) {
    Swal.fire(
      'Error',
      err.response?.data?.message || 'Password update failed',
      'error'
    );
  }
};
  const handleForgotPassword = async (e) => {
  e.preventDefault();

  try {
    await axios.post('http://localhost:5000/api/auth/forgot-password', { email });

Swal.fire('Success', 'OTP sent to email', 'success')
  .then(() => {
    navigate('/reset-password', { state: { email } });
  });
    // await axios.post('http://localhost:5000/api/auth/forgot-password', {
    //   email
    // });

    // Swal.fire('Success', 'OTP sent to your email', 'success');

    // // ✅ move to reset page
    // navigate('/reset-password', { state: { email } });

  } catch (err) {
    Swal.fire(
      'Error',
      err.response?.data?.message || 'Failed to send OTP',
      'error'
    );
  }
};

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      'http://localhost:5000/api/auth/login',
      { userId, password }
    );

    const { user, isProfileCompleted } = res.data;
    const { role, userId: id } = user;

    // ✅ store session
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', id);
    localStorage.setItem('role', role);

    Swal.fire({
      title: 'Login Successful',
      text: `Welcome, ${role}!`,
      icon: 'success',
      confirmButtonText: 'Continue'
    }).then(() => {

      // 🚨 FIRST LOGIN CHECK (FOR EVERYONE)
      if (role !== 'admin' && !isProfileCompleted) {
    navigate('/complete-profile');
    return;
  }

      // ✅ role-based dashboard routing
      navigate(getDashboardRoute(role));
    });

  } catch (err) {
    Swal.fire({
      title: 'Login Failed',
      text: err.response?.data?.message || 'Invalid credentials',
      icon: 'error'
    });
  }
};

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   if (userId === 'admin' && password === 'admin123') {
  //   localStorage.setItem('userId', 'admin');
  //   localStorage.setItem('role', 'admin');
  //   // alert('Login successful');
  //   Swal.fire({
  //       title: 'Login Successful',
  //       text: 'Welcome, Admin!',
  //       icon: 'success',
  //       confirmButtonText: 'Continue'
  //     }).then(() => {
  //       navigate('/mainAdmin-dashboard');
  //     });
  //   // navigate('/mainAdmin-dashboard');
  //   return;
  // }

  // if (userId === 'principal' && password === 'principal123') {
  //   localStorage.setItem('userId', 'principal');
  //   localStorage.setItem('role', 'principal');
  //   // alert('Login successful');
  //   Swal.fire({
  //       title: 'Login Successful',
  //       text: 'Welcome, Principal!',
  //       icon: 'success',
  //       confirmButtonText: 'Continue'
  //     }).then(() => {
  //       navigate('/principal-dashboard');
  //     });
  //   // navigate('/principal-dashboard');
  //   return;
  // }

  // if (userId === 'rddean' && password === 'rddean123') {
  //   localStorage.setItem('userId', 'rddean');
  //   localStorage.setItem('role', 'rddean');
  //   // alert('Login successful');
  //   // navigate('/rd-dean-dashboard');
  //   Swal.fire({
  //       title: 'Login Successful',
  //       text: 'Welcome, RD Dean!',
  //       icon: 'success',
  //       confirmButtonText: 'Continue'
  //     }).then(() => {
  //       navigate('/rd-dean-dashboard');
  //     });
  //   return;
  // }

  //   try {
  //     const res = await axios.post('http://localhost:5000/api/auth/login', {
  //       userId,
  //       password
  //     });

  //     const { role, userId: id } = res.data.user;

  //     localStorage.setItem('user', JSON.stringify(res.data.user));
  //     localStorage.setItem('userId', id);
  //     localStorage.setItem('role', role);

  //     Swal.fire({
  //       title: 'Login Successful',
  //       text: `Welcome, ${role}!`,
  //       icon: 'success'
  //     }).then(() => {
  //       switch (role) {
  //         case 'faculty':
  //           navigate('/faculty-dashboard');
  //           break;
  //         case 'hod':
  //           navigate('/hod-dashboard');
  //           break;
  //         case 'principal':
  //           navigate('/principal-dashboard');
  //           break;
  //         case 'rdDean':
  //           navigate('/rd-dean-dashboard');
  //           break;
  //         default:
  //           navigate('/');
  //       }
  //     });
  //   } catch (err) {
  //     Swal.fire({
  //       title: 'Login Failed',
  //       text: err.response?.data?.message || 'Invalid credentials',
  //       icon: 'error'
  //     });
  //   }
  // };

  return (
    <div className="login-page-wrapper">
      <CustomNavbar />
      <div className="login-card">
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
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>

          <p
            style={{ color: '#007BFF', cursor: 'pointer', fontSize: '14px' }}
            onClick={() => setShowForgot(true)}
          >
            Forgot Password?
          </p>

          <button type="submit" style={styles.button}>Login</button>
        </form>

        {showForgot && (
          <form onSubmit={handleForgotPassword} style={styles.form}>
  <h4>Forgot Password</h4>

  <input
    type="email"
    placeholder="Enter Email ID"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    style={styles.input}
  />

  <button type="submit" style={styles.button}>
    Send OTP
  </button>

  <button
    type="button"
    style={{ ...styles.button, backgroundColor: '#6c757d' }}
    onClick={() => setShowForgot(false)}
  >
    Cancel
  </button>
</form>
//           <form onSubmit={handleForgotPassword} style={styles.form}>
//             <h4>Forgot Password</h4>

//             <input
//   type="email"
//   placeholder="Enter Email ID"
//   value={email}
//   onChange={(e) => setEmail(e.target.value)}
//   required
//   style={styles.input}
// />

//             <button type="submit" style={styles.button}>
//               Send Reset Link
//             </button>

//             <button
//               type="button"
//               style={{ ...styles.button, backgroundColor: '#6c757d' }}
//               onClick={() => setShowForgot(false)}
//             >
//               Cancel
//             </button>
//           </form>
        )}

        {/* {showChangePwd && (
  <form onSubmit={handleChangePassword} style={styles.form}>
    <h4>Change Password</h4>

    <input
      type="password"
      placeholder="Current Password"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      required
      style={styles.input}
    />

    <input
      type="password"
      placeholder="New Password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      required
      style={styles.input}
    />

    <input
      type="password"
      placeholder="Confirm New Password"
      value={confirmNewPassword}
      onChange={(e) => setConfirmNewPassword(e.target.value)}
      required
      style={styles.input}
    />

    <button type="submit" style={styles.button}>
      Update Password
    </button>

    <button
      type="button"
      style={{ ...styles.button, backgroundColor: '#6c757d' }}
      onClick={() => setShowChangePwd(false)}
    >
      Cancel
    </button>
  </form>
)} */}
      </div>
    </div>
  );
}


const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    textAlign: 'center',
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
    color: '#fff',
    border: 'none',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '14px',
    textAlign: 'left'
  }
};

