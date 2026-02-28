import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ MUST be inside component

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return Swal.fire('Error', 'Passwords do not match', 'error');
    }

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });

      Swal.fire('Success', 'Password reset successful', 'success')
        .then(() => navigate('/login'));

    } catch (err) {
      Swal.fire(
        'Error',
        err.response?.data?.message || 'Reset failed',
        'error'
      );
    }
  };

  return (
    <div style={styles.container}>
      <h2>Reset Password</h2>

      <form onSubmit={handleReset} style={styles.form}>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
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
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Reset Password
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '80px auto',
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
    border: 'none',
    cursor: 'pointer'
  }
};

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import { useLocation } from 'react-router-dom';

// export default function ResetPassword() {
//   const navigate = useNavigate();
// const location = useLocation();
// const [email, setEmail] = useState(location.state?.email || '');  const [otp, setOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const handleReset = async (e) => {
//     e.preventDefault();

//     if (newPassword !== confirmPassword) {
//       return Swal.fire('Error', 'Passwords do not match', 'error');
//     }

//     try {
//       await axios.post('http://localhost:5000/api/auth/reset-password', {
//         email,
//         otp,
//         newPassword
//       });

//       Swal.fire('Success', 'Password reset successful', 'success')
//         .then(() => navigate('/login'));
//     } catch (err) {
//       Swal.fire(
//         'Error',
//         err.response?.data?.message || 'Reset failed',
//         'error'
//       );
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h2>Reset Password</h2>

//       <form onSubmit={handleReset} style={styles.form}>
//         <input
//           type="email"
//           placeholder="Enter Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           style={styles.input}
//         />

//         <input
//           type="text"
//           placeholder="Enter OTP"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           required
//           style={styles.input}
//         />

//         <input
//           type="password"
//           placeholder="New Password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//           style={styles.input}
//         />

//         <input
//           type="password"
//           placeholder="Confirm Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           required
//           style={styles.input}
//         />

//         <button type="submit" style={styles.button}>
//           Reset Password
//         </button>
//       </form>
//     </div>
//   );
// }
// const styles = {
//   container: {
//     maxWidth: '400px',
//     margin: '80px auto',
//     padding: '20px',
//     border: '1px solid #ccc',
//     borderRadius: '10px',
//     textAlign: 'center'
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
//     backgroundColor: '#28a745',
//     color: '#fff',
//     border: 'none',
//     cursor: 'pointer'
//   }
// };

// // import { useState } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import Swal from 'sweetalert2';

// // export default function ResetPassword() {
// //   const { userId, token } = useParams();
// //   const navigate = useNavigate();

// //   const [newPassword, setNewPassword] = useState('');
// //   const [confirmPassword, setConfirmPassword] = useState('');

// //   const handleReset = async (e) => {
// //     e.preventDefault();

// //     if (newPassword !== confirmPassword) {
// //       return Swal.fire('Error', 'Passwords do not match', 'error');
// //     }

// //     try {
// //       await axios.post('http://localhost:5000/api/auth/reset-password', {
// //         userId,
// //         token,
// //         newPassword
// //       });

// //       Swal.fire('Success', 'Password reset successful', 'success')
// //         .then(() => navigate('/login'));
// //     } catch (err) {
// //       Swal.fire(
// //         'Error',
// //         err.response?.data?.message || 'Reset failed',
// //         'error'
// //       );
// //     }
// //   };

// //   return (
// //     <div style={styles.container}>
// //       <h2>Reset Password</h2>

// //       <form onSubmit={handleReset} style={styles.form}>
// //         <input
// //           type="password"
// //           placeholder="New Password"
// //           value={newPassword}
// //           onChange={(e) => setNewPassword(e.target.value)}
// //           required
// //           style={styles.input}
// //         />

// //         <input
// //           type="password"
// //           placeholder="Confirm Password"
// //           value={confirmPassword}
// //           onChange={(e) => setConfirmPassword(e.target.value)}
// //           required
// //           style={styles.input}
// //         />

// //         <button type="submit" style={styles.button}>
// //           Reset Password
// //         </button>
// //       </form>
// //     </div>
// //   );
// // }

// // const styles = {
// //   container: {
// //     maxWidth: '400px',
// //     margin: '80px auto',
// //     padding: '20px',
// //     border: '1px solid #ccc',
// //     borderRadius: '10px',
// //     textAlign: 'center'
// //   },
// //   form: {
// //     display: 'flex',
// //     flexDirection: 'column',
// //     gap: '15px'
// //   },
// //   input: {
// //     padding: '10px',
// //     fontSize: '16px'
// //   },
// //   button: {
// //     padding: '10px',
// //     backgroundColor: '#28a745',
// //     color: '#fff',
// //     border: 'none',
// //     cursor: 'pointer'
// //   }
// // };
