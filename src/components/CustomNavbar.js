
import "./CustomNavbar.css";
import logo from "./logo2.jpeg";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiLogIn,
} from "react-icons/fi";

const CustomNavbar = () => {
  const location = useLocation();

  const showLoginButton =
    location.pathname === "/" ||
    location.pathname === "/instructions";

  return (
    <header className="navbar-header">

      <div className="navbar-container">

        {/* ================= TOP SECTION ================= */}
        <div className="navbar-top">

          {/* Logo + Branding */}
          <Link to="/" className="navbar-brand">

            <div className="navbar-logo-box">
              <img
                src={logo}
                alt="RPMS Logo"
                className="navbar-logo"
              />
            </div>

            <div className="brand-content">

              <div className="system-title">
                Smart Research Paper Management System
              </div>

              <div className="system-subtitle">
                Research • Publications • Innovation
              </div>

            </div>

          </Link>


          {/* Login */}
          {showLoginButton && (
            <Link to="/login" className="navbar-login">

              <FiLogIn className="login-icon" />

              <span>Login</span>

            </Link>
          )}

        </div>


        {/* ================= NAVIGATION ================= */}
        <div className="navbar-navigation">

          <nav className="nav-links">

            <Link
              to="/"
              className={`nav-link ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              <FiHome />
              <span>Home</span>
            </Link>


            <Link
              to="/instructions"
              className={`nav-link ${
                location.pathname === "/instructions"
                  ? "active"
                  : ""
              }`}
            >
              <FiFileText />
              <span>Instructions</span>
            </Link>

          </nav>

        </div>

      </div>

    </header>
  );
};

export default CustomNavbar;



// import './CustomNavbar.css';
// import logo from './logo2.jpeg';
// import { Link, useLocation } from 'react-router-dom';
// import { useState } from 'react';
// import { useNavigate } from "react-router-dom";



// const CustomNavbar = () => {
//   const [showDropdown, setShowDropdown] = useState(false);
//    const location = useLocation();

//   const showLoginButton =
//     location.pathname === "/" ||
//     location.pathname === "/instructions";


//   const toggleDropdown = () => {
//     setShowDropdown(!showDropdown);
//   };
//   const navigate = useNavigate();

//   return (
//     <header className="navbar-header">
//       <div className="logo-line-wrapper">
//         <img src={logo} alt="Logo" className="navbar-logo" />

//         <div className="line-with-title">
//           <div className="system-title">Smart Research Paper Management System</div>
//           <hr className="horizontal-line-only" />

//           <div className="nav-bar-row">
//             {/* Navigation links on left */}
//             <nav className="nav-links">
//               <Link to="/">🏠 Home</Link>
//               <Link to="/instructions">📄 Instructions</Link>
//             </nav>
//             {showLoginButton && (
//         <div className="dropdown-menu">
//           <Link to="/login" className="login-btn">
//             🔑 Login
//           </Link>
//         </div>
//       )}

//             {/* Login dropdown on right */}
//             {/* <div className="login-dropdown">
//               <button className="login-button" onClick={toggleDropdown}>🔑 Login</button>
//               {showDropdown && (
//                 <div className="dropdown-menu">
//                   <Link to="/login">Admin</Link>
//                   <Link to="/admin-login">R&D Admin</Link>
//                   <Link to="/principal-login">Principal</Link>
//                   <Link to="/hod-login">HOD</Link>
//                   <Link to="/faculty-login">Faculty</Link>
//                 </div>
//               )}
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default CustomNavbar;
