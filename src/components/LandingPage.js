import React from 'react';
import './LandingPage.css';
import CustomNavbar from './CustomNavbar';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { FaFileAlt, FaUserCheck, FaCheckCircle, FaUpload, FaDollarSign } from 'react-icons/fa';
import './LandingPage.css';
// import researchimg from "./research.j"

export default function LandingPage() {
  return (
    
    <div className="landing-container">
      <CustomNavbar />
      {/* Hero Section */}
      <section className="home-section alternate-bg">
        <div className="hero-text">
          <h1>Research Paper Management System</h1>
          <p>Efficiently track, submit, and approve research papers in your department.</p>
          <a href="#instructions" className="cta-button">Get Started</a>
        </div>
        <div className="hero-image">
          <img src= "https://play-lh.googleusercontent.com/ltjak6wyekUfzFGPi7hs5AHyApkJbHXylN-Woc7zBZmq9pfZcRzPGKtic_HMIZZKZdE" alt="Research" />
        </div>
      </section>

      {/* Instructions Section */}
      <section className="instructions-section" id="instructions">
        <h2>How It Works</h2>
        <div className="instruction-cards">
          <div className="card">
            <h3>Submit Paper</h3>
            <p>Faculty can submit their papers with all required details and attachments.</p>
          </div>
          <div className="card">
            <h3>Approval Process</h3>
            <p>HOD and Principal can approve or reject submissions with reasons.</p>
          </div>
          <div className="card">
            <h3>Track Progress</h3>
            <p>Check the status of your UID/PID requests anytime in the dashboard.</p>
          </div>
        </div>
      </section>

       {/* Timeline Section */}
      <section className="home-section alternate-bg">
        <h2>Paper Submission Process</h2>
        <VerticalTimeline lineColor="#3b82f6">
          
          <VerticalTimelineElement
            contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
            contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
            date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 1</span>}
            iconStyle={{ background: '#3b82f6', color: '#fff' }}
            icon={<FaFileAlt />}
          >
            <h3>UID Request</h3>
            <p>Faculty submits UID request for their paper.</p>
          </VerticalTimelineElement>

          <VerticalTimelineElement
            contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
            contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
             date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 1</span>}
            iconStyle={{ background: '#3b82f6', color: '#fff' }}
            icon={<FaUserCheck />}
          >
            <h3>HOD & Principal Approval</h3>
            <p>Head of Department and Principal approve UID request.</p>
          </VerticalTimelineElement>

          <VerticalTimelineElement
            contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
            contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
             date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 1</span>}
            iconStyle={{ background: '#3b82f6', color: '#fff' }}
            icon={<FaCheckCircle />}
          >
            <h3>R&D Dean Approval</h3>
            <p>R&D Dean approves and UID is generated.</p>
          </VerticalTimelineElement>

          <VerticalTimelineElement
            contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
            contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
             date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 1</span>}
            iconStyle={{ background: '#3b82f6', color: '#fff' }}
            icon={<FaUpload />}
          >
            <h3>Paper Document Submission</h3>
            <p>Faculty uploads the research paper and supporting documents.</p>
          </VerticalTimelineElement>

          <VerticalTimelineElement
            contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
            contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
            date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 1</span>}
            iconStyle={{ background: '#3b82f6', color: '#fff' }}
            icon={<FaCheckCircle />}
          >
            <h3>R&D Dean Approval & PID</h3>
            <p>R&D Dean approves the submission and PID is generated.</p>
          </VerticalTimelineElement>

          <VerticalTimelineElement
            contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
            contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
             date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 1</span>}
            iconStyle={{ background: '#3b82f6', color: '#fff' }}
            icon={<FaDollarSign />}
          >
            <h3>Incentive Release</h3>
            <p>Faculty receives incentives for approved paper.</p>
          </VerticalTimelineElement>

        </VerticalTimeline>
      </section>


      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-cards">
          <div className="feature-card">
            <h3>Secure Upload</h3>
            <p>All submissions are securely stored and accessible to authorized personnel only.</p>
          </div>
          <div className="feature-card">
            <h3>Real-time Tracking</h3>
            <p>Track the status of papers and UID requests in real time with instant notifications.</p>
          </div>
          {/* <div className="feature-card">
            <h3>Export Reports</h3>
            <p>Generate reports of approved/rejected papers for departments and management.</p>
          </div> */}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; 2026 Research Paper Management System | Designed for Faculty & Admins</p>
      </footer>
    </div>
  );
}