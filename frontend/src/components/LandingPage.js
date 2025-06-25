// src/pages/LandingPage.js
import CustomNavbar from './CustomNavbar';
import './LandingPage.css';
import logo from './logo2.jpeg';
export default function LandingPage() {
  return (
    <>
      <CustomNavbar />
      <div className="landing-wrapper">
        <div className="card-1">
          <div className="logo-section">
              <img src={logo} alt="Logo" className="logo" />
            </div>
          <p className="welcome">Welcome to Faculty Research Dashboard</p>
          <h1 className="title">Track, Manage, and Document Research Publications</h1>
          <p className="description">
            A centralized platform for faculty members and the Research & Development (R&D) cell to streamline research submissions, monitor publications, and manage academic outputs efficiently.
          </p>
        </div>
      </div>
    </>
  );
}
