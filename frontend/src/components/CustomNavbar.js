import { Link } from 'react-router-dom';
import './CustomNavbar.css';

const CustomNavbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        <Link to="/instructions">Instructions</Link>
      </div>
      <div className="navbar-right">
        <div className="dropdown">
          <button className="dropbtn">Login As</button>
          <div className="dropdown-content">
            <Link to="/login">Admin</Link>
            <Link to="/admin-login">R&D Admin</Link>
            <Link to="/principal-login">Principal</Link>
            <Link to="/hod-login">HOD</Link>
            <Link to="/faculty-login">Faculty</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default CustomNavbar;
