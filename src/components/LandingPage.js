import "./LandingPage.css";
import CustomNavbar from "./CustomNavbar";
import { API_BASE_URL } from "../config.js";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

import "react-vertical-timeline-component/style.min.css";
import React, { useEffect, useState } from "react";
import {
  FaFileAlt,
  FaUserCheck,
  FaCheckCircle,
  FaUpload,
  FaDollarSign,
  FaProjectDiagram,
  FaLock,
  FaBell,
  FaChartLine,
  FaDatabase,
  FaClipboardCheck,
  FaUniversity,
  FaUsers,
  FaShieldAlt,
  FaSearch,
  FaArrowRight,
  FaCogs,
} from "react-icons/fa";

export default function LandingPage() {
   const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalResearchPapers: 0,
    approvedPapers: 0,
    publishedPapers: 0,
    currentYear: new Date().getFullYear(),
    monthlySubmissions: []
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {

    const fetchAnalytics = async () => {

      try {

        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/landing-analytics`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();

        setAnalytics(data);

      } catch (error) {

        console.error(
          "Landing analytics error:",
          error
        );

      } finally {

        setAnalyticsLoading(false);

      }

    };

    fetchAnalytics();

    const interval = setInterval(
      fetchAnalytics,
      60000
    );

    return () => clearInterval(interval);

  }, []);
  return (
    <div className="landing-container">

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <CustomNavbar />


      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="home-section alternate-bg hero-section">

        <div className="hero-text">

          <span className="hero-badge">
            Research • Publications • Innovation
          </span>

          <h1>
            Research Paper
            <br />
            Management System
          </h1>

          <p>
            A centralized digital platform designed to simplify research
            paper submission, approval, document management, publication
            tracking, and research administration.
          </p>

          <div className="hero-actions">

            <a
              href="#instructions"
              className="cta-button"
            >
              Get Started
              <FaArrowRight />
            </a>

            <a
              href="#workflow"
              className="secondary-button"
            >
              View Workflow
            </a>

          </div>

        </div>


        <div className="hero-image">

          <div className="hero-image-glow"></div>

          <img
            src="https://play-lh.googleusercontent.com/ltjak6wyekUfzFGPi7hs5AHyApkJbHXylN-Woc7zBZmq9pfZcRzPGKtic_HMIZZKZdE"
            alt="Research Paper Management System"
          />

        </div>

      </section>



      {/* =====================================================
          QUICK HIGHLIGHTS
      ===================================================== */}
      <section className="stats-section">

        <div className="stat-card">

          <div className="stat-icon">
            <FaFileAlt />
          </div>

          <div>
            <strong>Research Papers</strong>
            <span>Centralized management</span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            <FaClipboardCheck />
          </div>

          <div>
            <strong>Structured Approval</strong>
            <span>Multi-level workflow</span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            <FaChartLine />
          </div>

          <div>
            <strong>Real-Time Tracking</strong>
            <span>Monitor every request</span>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            <FaLock />
          </div>

          <div>
            <strong>Secure Documents</strong>
            <span>Controlled access</span>
          </div>

        </div>

      </section>
        {/* ================= ANALYTICS SECTION ================= */}
<section className="analytics-section">
  <div className="section-intro">
    <span className="section-tag">Platform Analytics</span>
    <h2>Research Activity at a Glance</h2>
    <p>
      Get a quick overview of users, research submissions, approvals,
      and publication activity across the institution.
    </p>
  </div>

  <div className="analytics-layout">

    {/* LEFT - STAT SUMMARY */}
    <div className="analytics-stats">

      <div className="analytics-card analytics-blue">
        <div className="analytics-icon">
          <FaUsers />
        </div>
        <div>
          <span>Total Users</span>
          <h3>{analytics.totalUsers}</h3>
          <small>Active platform users</small>
        </div>
      </div>

      <div className="analytics-card analytics-purple">
        <div className="analytics-icon">
          <FaFileAlt />
        </div>
        <div>
          <span>Research Papers</span>
          <h3>{analytics.totalResearchPapers}</h3>
          <small>Total submissions</small>
        </div>
      </div>

      <div className="analytics-card analytics-green">
        <div className="analytics-icon">
          <FaCheckCircle />
        </div>
        <div>
          <span>Approved Papers</span>
          <h3>{analytics.approvedPapers}</h3>
          <small>Successfully approved</small>
        </div>
      </div>

      <div className="analytics-card analytics-orange">
        <div className="analytics-icon">
          <FaUpload />
        </div>
        <div>
          <span>Published Papers</span>
          <h3>{analytics.publishedPapers}</h3>
          <small>Successfully published</small>
        </div>
      </div>

    </div>

    {/* RIGHT - GRAPH */}
    <div className="analytics-chart-card">

      <div className="chart-header">
        <div>
          <span className="chart-label">Research Activity</span>
          <h3>Monthly Submissions</h3>
        </div>

        <span className="chart-period">2026</span>
      </div>

      {/* <div className="chart-wrapper">
        <svg viewBox="0 0 700 300" preserveAspectRatio="none">

          <line x1="50" y1="50" x2="680" y2="50" />
          <line x1="50" y1="110" x2="680" y2="110" />
          <line x1="50" y1="170" x2="680" y2="170" />
          <line x1="50" y1="230" x2="680" y2="230" />

          <path
            className="chart-area"
            d="
              M50 215
              L105 190
              L160 200
              L215 155
              L270 170
              L325 125
              L380 140
              L435 105
              L490 120
              L545 80
              L600 95
              L655 55
              L655 250
              L50 250
              Z
            "
          />

          <polyline
            className="chart-line"
            points="
              50,215
              105,190
              160,200
              215,155
              270,170
              325,125
              380,140
              435,105
              490,120
              545,80
              600,95
              655,55
            "
          />

          <circle cx="50" cy="215" r="5" />
          <circle cx="105" cy="190" r="5" />
          <circle cx="160" cy="200" r="5" />
          <circle cx="215" cy="155" r="5" />
          <circle cx="270" cy="170" r="5" />
          <circle cx="325" cy="125" r="5" />
          <circle cx="380" cy="140" r="5" />
          <circle cx="435" cy="105" r="5" />
          <circle cx="490" cy="120" r="5" />
          <circle cx="545" cy="80" r="5" />
          <circle cx="600" cy="95" r="5" />
          <circle cx="655" cy="55" r="5" />

        </svg>

        <div className="chart-months">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div> */}
      <div className="chart-wrapper">
  {!analyticsLoading && analytics.monthlySubmissions?.length > 0 ? (
    <>
      <svg viewBox="0 0 700 300" preserveAspectRatio="none">

        {/* Grid */}
        <line x1="50" y1="50" x2="680" y2="50" />
        <line x1="50" y1="110" x2="680" y2="110" />
        <line x1="50" y1="170" x2="680" y2="170" />
        <line x1="50" y1="230" x2="680" y2="230" />

        {/* Area */}
        <path
          className="chart-area"
          d={`
            M50 250
            ${analytics.monthlySubmissions
              .map((item, index) => {
                const x = 50 + index * (605 / 11);

                const maxValue =
                  Math.max(
                    ...analytics.monthlySubmissions.map(
                      item => item.submissions
                    ),
                    1
                  );

                const y =
                  230 -
                  (item.submissions / maxValue) * 175;

                return `L${x} ${y}`;
              })
              .join(" ")}

            L655 250
            Z
          `}
        />

        {/* Line */}
        <polyline
          className="chart-line"
          points={analytics.monthlySubmissions
            .map((item, index) => {
              const x = 50 + index * (605 / 11);

              const maxValue =
                Math.max(
                  ...analytics.monthlySubmissions.map(
                    item => item.submissions
                  ),
                  1
                );

              const y =
                230 -
                (item.submissions / maxValue) * 175;

              return `${x},${y}`;
            })
            .join(" ")}
        />

        {/* Points */}
        {analytics.monthlySubmissions.map(
          (item, index) => {
            const x =
              50 + index * (605 / 11);

            const maxValue =
              Math.max(
                ...analytics.monthlySubmissions.map(
                  item => item.submissions
                ),
                1
              );

            const y =
              230 -
              (item.submissions / maxValue) * 175;

            return (
              <circle
                key={item.month}
                cx={x}
                cy={y}
                r="5"
              />
            );
          }
        )}

      </svg>

      <div className="chart-months">
        {analytics.monthlySubmissions.map(item => (
          <span key={item.month}>
            {item.month}
          </span>
        ))}
      </div>
    </>
  ) : (
    <div className="analytics-loading">
      Loading research activity...
    </div>
  )}
</div>

    </div>

  </div>
</section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section
        className="instructions-section"
        id="instructions"
      >

        <div className="section-intro">

          <span className="section-label">
            SIMPLE & STRUCTURED
          </span>

          <h2>
            How It Works
          </h2>

          <p>
            RPMS simplifies research administration by bringing paper
            submission, approvals, document management, and tracking
            into one centralized platform.
          </p>

        </div>


        <div className="instruction-cards">

          <div className="card">

            <div className="card-icon">
              <FaFileAlt />
            </div>

            <h3>
              Submit Paper
            </h3>

            <p>
              Faculty can submit research paper details, abstracts,
              target information, co-authors, and required information
              through the system.
            </p>

          </div>


          <div className="card">

            <div className="card-icon">
              <FaUserCheck />
            </div>

            <h3>
              Approval Process
            </h3>

            <p>
              Research requests move through the designated
              institutional approval stages with status visibility
              throughout the process.
            </p>

          </div>


          <div className="card">

            <div className="card-icon">
              <FaChartLine />
            </div>

            <h3>
              Track Progress
            </h3>

            <p>
              Faculty can monitor research requests, publication
              submissions, approvals, and pending actions from
              their dashboard.
            </p>

          </div>

        </div>

      </section>



      {/* =====================================================
          WORKFLOW INTRO
      ===================================================== */}
      <section
        className="workflow-intro-section"
        id="workflow"
      >

        <div className="section-intro">

          <span className="section-label">
            RESEARCH ADMINISTRATION
          </span>

          <h2>
            Paper Submission Workflow
          </h2>

          <p>
            A structured workflow helps research submissions move
            through the required institutional review and documentation
            stages.
          </p>

        </div>

      </section>



      {/* =====================================================
          TIMELINE WORKFLOW
      ===================================================== */}
      <section className="home-section alternate-bg timeline-section">

        <VerticalTimeline>

          {/* STEP 1 */}
          <VerticalTimelineElement
            date="Step 1"
            icon={<FaFileAlt />}
          >

            <h3>
              UID Request
            </h3>

            <p>
              Faculty submits the research request with the required
              paper details, abstract, target information, and
              co-author details.
            </p>

          </VerticalTimelineElement>


          {/* STEP 2 */}
          <VerticalTimelineElement
            date="Step 2"
            icon={<FaUserCheck />}
          >

            <h3>
              Department Review
            </h3>

            <p>
              The submitted research request is reviewed through the
              designated departmental approval process before moving
              to the next institutional stage.
            </p>

          </VerticalTimelineElement>


          {/* STEP 3 */}
          <VerticalTimelineElement
            date="Step 3"
            icon={<FaProjectDiagram />}
          >

            <h3>
              Institutional Review
            </h3>

            <p>
              The request proceeds through the required institutional
              review stages before the research request is finalized.
            </p>

          </VerticalTimelineElement>


          {/* STEP 4 */}
          <VerticalTimelineElement
            date="Step 4"
            icon={<FaCheckCircle />}
          >

            <h3>
              Approval Completion
            </h3>

            <p>
              Once the required approvals are completed, the research
              request can proceed to the next stage of research
              documentation.
            </p>

          </VerticalTimelineElement>


          {/* STEP 5 */}
          <VerticalTimelineElement
            date="Step 5"
            icon={<FaUniversity />}
          >

            <h3>
              UID Generation
            </h3>

            <p>
              The approved research request is assigned its UID,
              providing a unique reference for subsequent research
              activities.
            </p>

          </VerticalTimelineElement>


          {/* STEP 6 */}
          <VerticalTimelineElement
            date="Step 6"
            icon={<FaUpload />}
          >

            <h3>
              Paper Document Submission
            </h3>

            <p>
              Faculty submits the required publication documents,
              including the research paper and supporting documents
              such as indexing proof and payment details.
            </p>

          </VerticalTimelineElement>


          {/* STEP 7 */}
          <VerticalTimelineElement
            date="Step 7"
            icon={<FaClipboardCheck />}
          >

            <h3>
              PID Approval & Generation
            </h3>

            <p>
              The publication submission is reviewed and the
              corresponding PID is generated after completion of
              the required approval process.
            </p>

          </VerticalTimelineElement>


          {/* STEP 8 */}
          <VerticalTimelineElement
            date="Step 8"
            icon={<FaDollarSign />}
          >

            <h3>
              Incentive Processing
            </h3>

            <p>
              Eligible research publications can proceed through the
              applicable incentive processing after the required
              documentation and approvals are completed.
            </p>

          </VerticalTimelineElement>

        </VerticalTimeline>

      </section>



      {/* =====================================================
          BUILT FOR EVERY ROLE
      ===================================================== */}
      <section className="roles-section">

        <div className="section-intro">

          <span className="section-label">
            ONE PLATFORM • MULTIPLE ROLES
          </span>

          <h2>
            Built for Every Role
          </h2>

          <p>
            RPMS provides role-based access so each user can focus
            on the research activities relevant to their responsibility.
          </p>

        </div>


        <div className="roles-grid">

          {/* FACULTY */}
          <div className="role-card">

            <div className="role-icon blue">
              <FaUsers />
            </div>

            <div>

              <span className="role-label">
                FACULTY
              </span>

              <h3>
                Research Submission
              </h3>

              <p>
                Submit research requests, upload publication documents,
                monitor approvals, and maintain publication records.
              </p>

            </div>

          </div>


          {/* HOD */}
          <div className="role-card">

            <div className="role-icon purple">
              <FaUserCheck />
            </div>

            <div>

              <span className="role-label">
                DEPARTMENT
              </span>

              <h3>
                Department Review
              </h3>

              <p>
                Review research requests, monitor department activity,
                and manage research-related information.
              </p>

            </div>

          </div>


          {/* PRINCIPAL */}
          <div className="role-card">

            <div className="role-icon green">
              <FaUniversity />
            </div>

            <div>

              <span className="role-label">
                ADMINISTRATION
              </span>

              <h3>
                Institutional Oversight
              </h3>

              <p>
                Review research activities and monitor institutional
                research information through dedicated dashboards.
              </p>

            </div>

          </div>


          {/* R&D */}
          <div className="role-card">

            <div className="role-icon orange">
              <FaProjectDiagram />
            </div>

            <div>

              <span className="role-label">
                R&D ADMINISTRATION
              </span>

              <h3>
                Research Management
              </h3>

              <p>
                Manage research workflows, publication information,
                approvals, and institutional research records.
              </p>

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          WHY RPMS
      ===================================================== */}
      <section className="why-rpms-section">

        <div className="section-intro">

          <span className="section-label">
            BUILT FOR RESEARCH MANAGEMENT
          </span>

          <h2>
            Why Use RPMS?
          </h2>

          <p>
            RPMS brings essential research administration activities
            together into one organized digital environment.
          </p>

        </div>


        <div className="why-rpms-grid">

          {/* CARD 1 */}
          <div className="why-card">

            <div className="why-icon blue">
              <FaDatabase />
            </div>

            <div>

              <h3>
                Centralized Management
              </h3>

              <p>
                Manage research requests, publications, documents,
                and records from one platform.
              </p>

            </div>

          </div>


          {/* CARD 2 */}
          <div className="why-card">

            <div className="why-icon purple">
              <FaProjectDiagram />
            </div>

            <div>

              <h3>
                Structured Workflow
              </h3>

              <p>
                Follow clearly defined research administration
                processes across the institution.
              </p>

            </div>

          </div>


          {/* CARD 3 */}
          <div className="why-card">

            <div className="why-icon green">
              <FaBell />
            </div>

            <div>

              <h3>
                Instant Notifications
              </h3>

              <p>
                Stay informed about approvals, requests, updates,
                and pending research activities.
              </p>

            </div>

          </div>


          {/* CARD 4 */}
          <div className="why-card">

            <div className="why-icon cyan">
              <FaLock />
            </div>

            <div>

              <h3>
                Controlled Access
              </h3>

              <p>
                Provide users with access to features and information
                according to their responsibilities.
              </p>

            </div>

          </div>


          {/* CARD 5 */}
          <div className="why-card">

            <div className="why-icon orange">
              <FaChartLine />
            </div>

            <div>

              <h3>
                Research Insights
              </h3>

              <p>
                View publication information, research activity,
                trends, and department-level records.
              </p>

            </div>

          </div>


          {/* CARD 6 */}
          <div className="why-card">

            <div className="why-icon indigo">
              <FaClipboardCheck />
            </div>

            <div>

              <h3>
                Complete Traceability
              </h3>

              <p>
                Track research requests and publication records
                throughout their lifecycle.
              </p>

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          SECURITY & ACCESS
      ===================================================== */}
      <section className="security-section">

        <div className="security-content">

          <div className="security-icon">
            <FaShieldAlt />
          </div>

          <div className="security-text">

            <span className="section-label">
              SECURITY & ACCESS
            </span>

            <h2>
              Designed for Controlled Research Administration
            </h2>

            <p>
              RPMS organizes research information according to user
              responsibilities, helping provide appropriate access
              to research requests, documents, approvals, and
              publication records.
            </p>

            <div className="security-points">

              <div>
                <FaCheckCircle />
                <span>
                  Role-based access
                </span>
              </div>

              <div>
                <FaCheckCircle />
                <span>
                  Controlled document management
                </span>
              </div>

              <div>
                <FaCheckCircle />
                <span>
                  Approval status visibility
                </span>
              </div>

              <div>
                <FaCheckCircle />
                <span>
                  Organized research records
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          KEY FEATURES
      ===================================================== */}
      <section className="features-section">

        <div className="section-intro">

          <span className="section-label">
            PLATFORM CAPABILITIES
          </span>

          <h2>
            Key Features
          </h2>

          <p>
            Designed to simplify research administration while
            providing clear visibility into research activities.
          </p>

        </div>


        <div className="features-cards">

          {/* FEATURE 1 */}
          <div className="feature-card">

            <div className="feature-icon">
              <FaUpload />
            </div>

            <h3>
              Secure Upload
            </h3>

            <p>
              Research papers and supporting documents can be
              uploaded and managed through the system.
            </p>

            <span className="feature-line"></span>

          </div>


          {/* FEATURE 2 */}
          <div className="feature-card">

            <div className="feature-icon">
              <FaChartLine />
            </div>

            <h3>
              Real-Time Tracking
            </h3>

            <p>
              Track research requests, publication submissions,
              approval progress, and important updates.
            </p>

            <span className="feature-line"></span>

          </div>


          {/* FEATURE 3 */}
          <div className="feature-card">

            <div className="feature-icon">
              <FaBell />
            </div>

            <h3>
              Notifications
            </h3>

            <p>
              Receive important updates about research activities,
              requests, approvals, and pending actions.
            </p>

            <span className="feature-line"></span>

          </div>


          {/* FEATURE 4 */}
          <div className="feature-card">

            <div className="feature-icon">
              <FaDatabase />
            </div>

            <h3>
              Publication Records
            </h3>

            <p>
              Maintain organized publication information for
              faculty and research administration.
            </p>

            <span className="feature-line"></span>

          </div>

        </div>

      </section>



      {/* =====================================================
          FINAL CTA / INSTITUTION BANNER
      ===================================================== */}
      <section className="institution-banner">

        <div className="institution-content">

          <div className="institution-icon">
            <FaUniversity />
          </div>

          <div>

            <span>
              RESEARCH ADMINISTRATION PLATFORM
            </span>

            <h2>
              From Research Submission to Publication Record
            </h2>

            <p>
              A unified environment for faculty, departments,
              and research administration to manage research
              activities efficiently.
            </p>

          </div>

        </div>


        <a
          href="#instructions"
          className="banner-button"
        >
          Explore RPMS
          <FaArrowRight />
        </a>

      </section>



      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer>

        <div className="footer-content">

          <div className="footer-brand">

            <FaUniversity />

            <div>

              <strong>
                Research Paper Management System
              </strong>

              <span>
                Research • Publications • Innovation
              </span>

            </div>

          </div>


          <div className="footer-divider"></div>


          <p>
            © 2026 Research Paper Management System
            <br />
            Designed for Faculty & Research Administration
          </p>

        </div>

      </footer>

    </div>
  );
}

// import React from 'react';
// import './LandingPage.css';
// import CustomNavbar from './CustomNavbar';
// import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
// import 'react-vertical-timeline-component/style.min.css';
// import { FaFileAlt, FaUserCheck, FaCheckCircle, FaUpload, FaDollarSign } from 'react-icons/fa';
// import './LandingPage.css';
// // import researchimg from "./research.j"

// export default function LandingPage() {
//   return (
    
//     <div className="landing-container">
//       <CustomNavbar />
//       {/* Hero Section */}
//       <section className="home-section alternate-bg">
//         <div className="hero-text">
//           <h1>Research Paper Management System</h1>
//           <p>Efficiently track, submit, and approve research papers in your department.</p>
//           <a href="#instructions" className="cta-button">Get Started</a>
//         </div>
//         <div className="hero-image">
//           <img src= "https://play-lh.googleusercontent.com/ltjak6wyekUfzFGPi7hs5AHyApkJbHXylN-Woc7zBZmq9pfZcRzPGKtic_HMIZZKZdE" alt="Research" />
//         </div>
//       </section>

//       {/* Instructions Section */}
//       <section className="instructions-section" id="instructions">
//         <h2>How It Works</h2>
//         <div className="instruction-cards">
//           <div className="card">
//             <h3>Submit Paper</h3>
//             <p>Faculty can submit their papers with all required details and attachments.</p>
//           </div>
//           <div className="card">
//             <h3>Approval Process</h3>
//             <p>HOD and Principal can approve or reject submissions with reasons.</p>
//           </div>
//           <div className="card">
//             <h3>Track Progress</h3>
//             <p>Check the status of your UID/PID requests anytime in the dashboard.</p>
//           </div>
//         </div>
//       </section>

//        {/* Timeline Section */}
//       <section className="home-section alternate-bg">
//         <h2>Paper Submission Process</h2>
//         <VerticalTimeline lineColor="#3b82f6">
          
//           <VerticalTimelineElement
//             contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
//             contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
//             date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 1</span>}
//             iconStyle={{ background: '#3b82f6', color: '#fff' }}
//             icon={<FaFileAlt />}
//           >
//             <h3>UID Request</h3>
//             <p>Faculty submits UID request for their paper.</p>
//           </VerticalTimelineElement>

//           <VerticalTimelineElement
//             contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
//             contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
//              date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 2</span>}
//             iconStyle={{ background: '#3b82f6', color: '#fff' }}
//             icon={<FaUserCheck />}
//           >
//             <h3>HOD & Principal Approval</h3>
//             <p>Head of Department and Principal approve UID request.</p>
//           </VerticalTimelineElement>

//           <VerticalTimelineElement
//             contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
//             contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
//              date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 3</span>}
//             iconStyle={{ background: '#3b82f6', color: '#fff' }}
//             icon={<FaCheckCircle />}
//           >
//             <h3>R&D Dean Approval</h3>
//             <p>R&D Dean approves and UID is generated.</p>
//           </VerticalTimelineElement>

//           <VerticalTimelineElement
//             contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
//             contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
//              date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 4</span>}
//             iconStyle={{ background: '#3b82f6', color: '#fff' }}
//             icon={<FaUpload />}
//           >
//             <h3>Paper Document Submission</h3>
//             <p>Faculty uploads the research paper and supporting documents.</p>
//           </VerticalTimelineElement>

//           <VerticalTimelineElement
//             contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
//             contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
//             date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 5</span>}
//             iconStyle={{ background: '#3b82f6', color: '#fff' }}
//             icon={<FaCheckCircle />}
//           >
//             <h3>R&D Dean Approval & PID</h3>
//             <p>R&D Dean approves the submission and PID is generated.</p>
//           </VerticalTimelineElement>

//           <VerticalTimelineElement
//             contentStyle={{ background: '#1f2937', color: '#e0e0e0' }}
//             contentArrowStyle={{ borderRight: '7px solid #3b82f6' }}
//              date={<span style={{ color: '#000', fontWeight: 'bold' }}>Step 6</span>}
//             iconStyle={{ background: '#3b82f6', color: '#fff' }}
//             icon={<FaDollarSign />}
//           >
//             <h3>Incentive Release</h3>
//             <p>Faculty receives incentives for approved paper.</p>
//           </VerticalTimelineElement>

//         </VerticalTimeline>
//       </section>


//       {/* Features Section */}
//       <section className="features-section">
//         <h2>Key Features</h2>
//         <div className="features-cards">
//           <div className="feature-card">
//             <h3>Secure Upload</h3>
//             <p>All submissions are securely stored and accessible to authorized personnel only.</p>
//           </div>
//           <div className="feature-card">
//             <h3>Real-time Tracking</h3>
//             <p>Track the status of papers and UID requests in real time with instant notifications.</p>
//           </div>
//           {/* <div className="feature-card">
//             <h3>Export Reports</h3>
//             <p>Generate reports of approved/rejected papers for departments and management.</p>
//           </div> */}
//         </div>
//       </section>

//       {/* Footer */}
//       <footer>
//         <p>&copy; 2026 Research Paper Management System | Designed for Faculty & Admins</p>
//       </footer>
//     </div>
//   );
// }