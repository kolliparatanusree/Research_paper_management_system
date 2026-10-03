
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomNavbar from './CustomNavbar';
import Swal from 'sweetalert2';
import './Login.css';
import { API_BASE_URL } from '../config';
import { LuEye, LuEyeOff } from "react-icons/lu";
export default function Login() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const navigate = useNavigate();

  /* =========================================================
     ROLE BASED ROUTING
  ========================================================= */

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'faculty':
        return '/faculty-dashboard';

      case 'hod':
        return '/hod-dashboard';

      case 'principal':
        return '/principal-dashboard';

      case 'rdCoordinator':
        return '/rd-dashboard';

      case 'rdDean':
        return '/rd-dean-dashboard';

      case 'admin':
        return '/mainAdmin-dashboard';

      default:
        return '/';
    }
  };

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email
      });

      Swal.fire({
        title: 'OTP Sent',
        text: 'OTP has been sent to your registered email.',
        icon: 'success',
        timer: 1600,
        showConfirmButton: false,
        allowOutsideClick: false
      }).then(() => {
        navigate('/reset-password', {
          state: { email }
        });
      });

    } catch (err) {
       console.log("FORGOT PASSWORD ERROR:", err);
  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);
      Swal.fire({
        title: 'Error',
        text:
          err.response?.data?.message ||
          'Failed to send OTP',
        icon: 'error'
      });
    }
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          userId,
          password
        }
      );

      const {
        user,
        isProfileCompleted
      } = res.data;

      const {
        role,
        userId: id
      } = user;

      /* Store session */

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );

      localStorage.setItem(
        'userId',
        id
      );

      localStorage.setItem(
        'role',
        role
      );

      /* Success message */

      Swal.fire({
        title: 'Login Successful',
        text: `Welcome, ${role}!`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false
      }).then(() => {

        /* First login profile completion */

        if (
          role !== 'admin' &&
          !isProfileCompleted
        ) {
          navigate('/complete-profile');
          return;
        }

        /* Dashboard routing */

        navigate(
          getDashboardRoute(role)
        );
      });

    } catch (err) {
console.log("FORGOT PASSWORD ERROR:", err);
  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);
      Swal.fire({
        title: 'Login Failed',
        text:
          err.response?.data?.message ||
          'Invalid credentials',
        icon: 'error'
      });
    }
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="rpms-login-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <CustomNavbar />

      {/* =====================================================
          MAIN LOGIN AREA
      ===================================================== */}

      <main className="rpms-login-main">

        <div className="rpms-login-wrapper">

          {/* =================================================
              LEFT BRANDING PANEL
          ================================================= */}

          <section className="rpms-login-brand">

            <div className="rpms-login-brand-overlay"></div>

            <div className="rpms-login-brand-content">

              {/* Logo / Icon */}

              <div className="rpms-login-brand-icon">
                <span>📚</span>
              </div>

              {/* Brand */}

              <div className="rpms-login-brand-title">

                <span className="rpms-login-brand-small">
                  SMART
                </span>

                <h1>
                  Research Paper
                  <br />
                  Management System
                </h1>

              </div>

              <p className="rpms-login-brand-description">
                A centralized platform for managing
                research papers, approvals, publications,
                and academic research activities.
              </p>

              {/* Features */}

              <div className="rpms-login-feature-list">

                <div className="rpms-login-feature">
                  <span className="rpms-login-feature-icon">
                    ✓
                  </span>

                  <span>
                    Research Paper Management
                  </span>
                </div>

                <div className="rpms-login-feature">
                  <span className="rpms-login-feature-icon">
                    ✓
                  </span>

                  <span>
                    UID &amp; PID Tracking
                  </span>
                </div>

                <div className="rpms-login-feature">
                  <span className="rpms-login-feature-icon">
                    ✓
                  </span>

                  <span>
                    Multi-Level Approval Workflow
                  </span>
                </div>

                <div className="rpms-login-feature">
                  <span className="rpms-login-feature-icon">
                    ✓
                  </span>

                  <span>
                    Research Publication Analytics
                  </span>
                </div>

              </div>

            </div>

            {/* Decorative Circles */}

            <div className="rpms-login-decoration rpms-login-decoration-one"></div>
            <div className="rpms-login-decoration rpms-login-decoration-two"></div>
            <div className="rpms-login-decoration rpms-login-decoration-three"></div>

          </section>

          {/* =================================================
              RIGHT LOGIN PANEL
          ================================================= */}

          <section className="rpms-login-form-area">

            <div className="rpms-login-card">

              {/* =================================================
                  LOGIN HEADER
              ================================================= */}

              <div className="rpms-login-header">

                <div className="rpms-login-header-icon">
                  🔐
                </div>

                <h2>
                  Welcome Back
                </h2>

                <p>
                  Sign in to access your research dashboard
                </p>

              </div>

              {/* =================================================
                  LOGIN FORM
              ================================================= */}

              <form
                onSubmit={handleLogin}
                className="rpms-login-form"
              >

                {/* USER ID */}

                <div className="rpms-login-field">

                  <label htmlFor="rpms-user-id">
                    User ID
                  </label>

                  <div className="rpms-login-input-box">

                    <span className="rpms-login-input-icon">
                      👤
                    </span>

                    <input
                      id="rpms-user-id"
                      type="text"
                      placeholder="Enter your User ID"
                      value={userId}
                      onChange={(e) =>
                        setUserId(e.target.value)
                      }
                      autoComplete="username"
                      required
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div className="rpms-login-field">

                  <label htmlFor="rpms-password">
                    Password
                  </label>

                  <div className="rpms-login-input-box">

                    <span className="rpms-login-input-icon">
                      🔒
                    </span>

                    <input
                      id="rpms-password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="rpms-login-password-toggle"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {/* {showPassword
                        ? '🙈'
                        : '👁️'} */}
                         {showPassword ? <LuEyeOff /> : <LuEye />}
                    </button>

                  </div>

                </div>

                {/* OPTIONS */}

                <div className="rpms-login-options">

                  

                  <button
                    type="button"
                    className="rpms-login-forgot-link"
                    onClick={() =>
                      setShowForgot(true)
                    }
                  >
                    Forgot Password?
                  </button>

                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  className="rpms-login-submit"
                >

                  <span>
                    Login
                  </span>

                  <span className="rpms-login-submit-arrow">
                    →
                  </span>

                </button>

              </form>

              {/* =================================================
                  FORGOT PASSWORD SECTION
              ================================================= */}

              {showForgot && (

                <div className="rpms-login-forgot-panel">

                  <div className="rpms-login-forgot-heading">

                    <div className="rpms-login-forgot-icon">
                      🔑
                    </div>

                    <div>

                      <h3>
                        Reset Password
                      </h3>

                      <p>
                        Enter your registered email
                        to receive an OTP
                      </p>

                    </div>

                  </div>

                  <form
                    onSubmit={handleForgotPassword}
                    className="rpms-login-forgot-form"
                  >

                    <div className="rpms-login-field">

                      <label htmlFor="rpms-email">
                        Email Address
                      </label>

                      <div className="rpms-login-input-box">

                        <span className="rpms-login-input-icon">
                          ✉️
                        </span>

                        <input
                          id="rpms-email"
                          type="email"
                          placeholder="Enter your registered email"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target.value
                            )
                          }
                          autoComplete="email"
                          required
                        />

                      </div>

                    </div>

                    <button
                      type="submit"
                      className="rpms-login-otp-button"
                    >
                      Send OTP
                    </button>

                    <button
                      type="button"
                      className="rpms-login-cancel-button"
                      onClick={() =>
                        setShowForgot(false)
                      }
                    >
                      Cancel
                    </button>

                  </form>

                </div>

              )}

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="rpms-login-footer">

              <span className="rpms-login-footer-dot"></span>

              <span>
                Secure Research Management System
              </span>

              <span className="rpms-login-footer-dot"></span>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}