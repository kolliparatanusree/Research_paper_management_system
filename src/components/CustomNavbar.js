import './CustomNavbar.css';
import logo from './logo2.jpeg';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";



const CustomNavbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
   const location = useLocation();

  const showLoginButton =
    location.pathname === "/" ||
    location.pathname === "/instructions";


  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  const navigate = useNavigate();

  return (
    <header className="navbar-header">
      <div className="logo-line-wrapper">
        <img src={logo} alt="Logo" className="navbar-logo" />

        <div className="line-with-title">
          <div className="system-title">Smart Research Paper Management System</div>
          <hr className="horizontal-line-only" />

          <div className="nav-bar-row">
            {/* Navigation links on left */}
            <nav className="nav-links">
              <Link to="/">🏠 Home</Link>
              <Link to="/instructions">📄 Instructions</Link>
            </nav>
            {showLoginButton && (
        <div className="dropdown-menu">
          <Link to="/login" className="login-btn">
            Login
          </Link>
        </div>
      )}

            {/* Login dropdown on right */}
            {/* <div className="login-dropdown">
              <button className="login-button" onClick={toggleDropdown}>🔑 Login</button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link to="/login">Admin</Link>
                  <Link to="/admin-login">R&D Admin</Link>
                  <Link to="/principal-login">Principal</Link>
                  <Link to="/hod-login">HOD</Link>
                  <Link to="/faculty-login">Faculty</Link>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomNavbar;

// import { Link, useLocation } from 'react-router-dom';
// import './CustomNavbar.css';

// const CustomNavbar = () => {
//   const location = useLocation();
//   const showLoginAsPaths = [
//     '/',
//     '/login',
//     '/admin-login',
//     '/principal-login',
//     '/hod-login',
//     '/faculty-login',
//     '/instructions'
//   ];

//   return (
//     <nav className="navbar">
//       {/* Left Section */}
//       <div className="navbar-left fixed-width">
//         <Link to="/">Home</Link>
//         <Link to="/instructions">Instructions</Link>
//       </div>

//       {/* Center Section */}
//       <div className="pro_name">Smart Research Paper Management System</div>

//       {/* Right Section */}
//       <div className="navbar-right fixed-width">
//         {showLoginAsPaths.includes(location.pathname) ? (
//           <div className="dropdown">
//             <button className="dropbtn">Login As</button>
//             <div className="dropdown-content">
//               <Link to="/login">Admin</Link>
//               <Link to="/admin-login">R&D Admin</Link>
//               <Link to="/principal-login">Principal</Link>
//               <Link to="/hod-login">HOD</Link>
//               <Link to="/faculty-login">Faculty</Link>
//             </div>
//           </div>
//         ) : (
//           <div style={{ height: '40px' }} /> // Empty block to hold space
//         )}
//       </div>
//     </nav>
//   );
// };

// export default CustomNavbar;



// // import { Link } from 'react-router-dom';
// // import './CustomNavbar.css';


// // const CustomNavbar = () => {
// //   return (
// //     <nav className="navbar">
// //       <div className="navbar-left">
// //         <Link to="/">Home</Link>
// //         <Link to="/instructions">Instructions</Link>
// //       </div>
// //       <div className="pro_name">Smart Research Paper Management System</div>
// //       <div className="navbar-right">
// //         <div className="dropdown">
// //           <button className="dropbtn">Login As</button>
// //           <div className="dropdown-content">
// //             <Link to="/login">Admin</Link>
// //             <Link to="/admin-login">R&D Admin</Link>
// //             <Link to="/principal-login">Principal</Link>
// //             <Link to="/hod-login">HOD</Link>
// //             <Link to="/faculty-login">Faculty</Link>
// //           </div>
// //         </div>
// //       </div>
// //     </nav>
// //   );
// // }

// // export default CustomNavbar;
