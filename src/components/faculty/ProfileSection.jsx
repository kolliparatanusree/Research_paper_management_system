// src/components/faculty/ProfileSection.jsx

import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../config.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import jsPDF from "jspdf";
import Swal from "sweetalert2";

import "./ProfileSection.css";

export default function ProfileSection({
  facultyDetails,
  refreshProfile
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [publications, setPublications] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const safeProfile = facultyDetails || {};

  const isFaculty =
  String(safeProfile.role || "").trim().toLowerCase() === "faculty";

const publicationData = useMemo(() => {
  if (!Array.isArray(publications) || publications.length === 0) {
    console.log("No publications available");
    return [];
  }

  const countByYear = {};

  publications.forEach((publication, index) => {
    console.log(`Publication ${index}:`, publication);

    let year =
      publication?.year ??
      publication?.publicationYear ??
      publication?.publishedYear;

    // If year is inside a date field
    if (
      year === undefined ||
      year === null ||
      String(year).trim() === ""
    ) {
      const dateValue =
        publication?.publicationDate ??
        publication?.publishedDate ??
        publication?.uploadedAt ??
        publication?.createdAt;

      if (dateValue) {
        const date = new Date(dateValue);

        if (!Number.isNaN(date.getTime())) {
          year = date.getFullYear();
        }
      }
    }

    // Convert values like "2024", "2024-01-15", etc.
    if (typeof year === "string") {
      const match = year.match(/\b(19|20)\d{2}\b/);

      if (match) {
        year = Number(match[0]);
      }
    }

    year = Number(year);

    if (
      !Number.isFinite(year) ||
      year < 1900 ||
      year > 2100
    ) {
      console.log(
        "Skipping publication because year is invalid:",
        publication
      );
      return;
    }

    countByYear[year] =
      (countByYear[year] || 0) + 1;
  });

  const result = Object.entries(countByYear)
    .sort(
      ([yearA], [yearB]) =>
        Number(yearA) - Number(yearB)
    )
    .map(([year, count]) => ({
      year: Number(year),
      count: Number(count)
    }));

  console.log("FINAL PUBLICATION DATA:", result);

  return result;
}, [publications]);
  /* ============================================================
     PHONE
  ============================================================ */

  useEffect(() => {
    setPhone(facultyDetails?.phoneNumber || "");
  }, [facultyDetails?.phoneNumber]);

  /* ============================================================
     PUBLICATIONS
  ============================================================ */

  useEffect(() => {
    if (!facultyDetails?.userId) {
      setPublications([]);
      return;
    }

    const fetchPublications = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/faculty/all-publications/${facultyDetails.userId}`
        );

        const data = await response.json();
        console.log("PUBLICATIONS:", data);
console.log("ROLE:", facultyDetails?.role);

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to fetch publications"
          );
        }

        setPublications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Publication fetch error:", error);
        setPublications([]);
      }
      
    };
    

    fetchPublications();
  }, [facultyDetails?.userId]);

  /* ============================================================
     PROFILE COMPLETION
  ============================================================ */

  const profileCompletion = useMemo(() => {
    const fields = [
      safeProfile.fullName,
      safeProfile.email,
      safeProfile.phoneNumber,
      safeProfile.department,
      safeProfile.educationDetails,
      safeProfile.experienceDetails
    ];

    const completed = fields.filter(
      (field) =>
        field !== undefined &&
        field !== null &&
        String(field).trim() !== ""
    ).length;

    return Math.round((completed / fields.length) * 100);
  }, [
    safeProfile.fullName,
    safeProfile.email,
    safeProfile.phoneNumber,
    safeProfile.department,
    safeProfile.educationDetails,
    safeProfile.experienceDetails
  ]);

{/* ======================================================
    PUBLICATION TREND
====================================================== */}

// {String(safeProfile.role || "").toLowerCase() === "faculty" && (
//   <section className="profile-section-card publication-section">

//     <div className="section-heading publication-heading">

//       <div>
//         <span>RESEARCH ACTIVITY</span>

//         <h3>Publication Trend</h3>

//         <p>
//           Your publication activity across the years.
//         </p>
//       </div>

//       <div className="publication-count">
//         <strong>{publications.length}</strong>
//         <span>Publications</span>
//       </div>

//     </div>

//     {publicationData.length > 0 ? (

//       <div className="publication-chart-container">

//         <ResponsiveContainer
//           width="100%"
//           height={320}
//         >
//           <LineChart
//             data={publicationData}
//             margin={{
//               top: 20,
//               right: 30,
//               left: 10,
//               bottom: 20
//             }}
//           >

//             <CartesianGrid
//               strokeDasharray="3 3"
//               stroke="#e2e8f0"
//             />

//             <XAxis
//               dataKey="year"
//               tick={{
//                 fill: "#475569",
//                 fontSize: 13
//               }}
//             />

//             <YAxis
//               allowDecimals={false}
//               domain={[0, "dataMax + 1"]}
//               tick={{
//                 fill: "#475569",
//                 fontSize: 13
//               }}
//             />

//             <ChartTooltip
//               contentStyle={{
//                 background: "#ffffff",
//                 border: "1px solid #e2e8f0",
//                 borderRadius: "10px",
//                 boxShadow:
//                   "0 8px 25px rgba(15, 23, 42, 0.12)"
//               }}
//             />

//             <Line
//               type="monotone"
//               dataKey="count"
//               name="Publications"
//               stroke="#2563eb"
//               strokeWidth={4}
//               dot={{
//                 r: 6,
//                 strokeWidth: 3,
//                 fill: "#ffffff"
//               }}
//               activeDot={{
//                 r: 8
//               }}
//             />

//           </LineChart>
//         </ResponsiveContainer>

//       </div>

//     ) : (

//       <div className="publication-empty">

//         <MenuBookOutlinedIcon />

//         <h4>No publication trend available</h4>

//         <p>
//           Publication activity will appear here
//           once research publications are added.
//         </p>

//       </div>

//     )}

//   </section>
// )}


  // const publicationData = useMemo(() => {
  //   if (!publications.length) return [];

  //   const countByYear = {};

  //   publications.forEach((publication) => {
  //     let year = publication?.year;

  //     if (
  //       typeof year === "string" &&
  //       year.trim() !== ""
  //     ) {
  //       year = parseInt(year, 10);
  //     }

  //     if (
  //       (!year || Number.isNaN(year)) &&
  //       publication?.publicationYear
  //     ) {
  //       year =
  //         typeof publication.publicationYear === "string"
  //           ? parseInt(publication.publicationYear, 10)
  //           : publication.publicationYear;
  //     }

  //     if (
  //       (!year || Number.isNaN(year)) &&
  //       publication?.uploadedAt
  //     ) {
  //       const date = new Date(publication.uploadedAt);

  //       if (!Number.isNaN(date.getTime())) {
  //         year = date.getFullYear();
  //       }
  //     }

  //     if (!year || Number.isNaN(year)) return;

  //     countByYear[year] =
  //       (countByYear[year] || 0) + 1;
  //   });

  //   return Object.keys(countByYear)
  //     .sort((a, b) => Number(a) - Number(b))
  //     .map((year) => ({
  //       year: Number(year),
  //       count: countByYear[year]
  //     }));
  // }, [publications]);

  /* ============================================================
     BADGES
  ============================================================ */

  const badges = useMemo(() => {
    const result = [];

    if (publications.length >= 5) {
      result.push("Researcher");
    }

    if (publications.length >= 10) {
      result.push("Top Author");
    }

    if (safeProfile.experienceDetails) {
      result.push("Experienced");
    }

    if (profileCompletion === 100) {
      result.push("Profile Complete");
    }

    return result;
  }, [
    publications.length,
    safeProfile.experienceDetails,
    profileCompletion
  ]);

  /* ============================================================
     SMART SUGGESTIONS
  ============================================================ */

  const suggestions = useMemo(() => {
    const result = [];

    if (!safeProfile.phoneNumber) {
      result.push("Add your phone number");
    }

    if (!safeProfile.educationDetails) {
      result.push("Add your education details");
    }

    if (!safeProfile.experienceDetails) {
      result.push("Add your professional experience");
    }

    if (isFaculty && publications.length === 0) {
      result.push("Add your first publication");
    }

    return result;
  }, [
    safeProfile.phoneNumber,
    safeProfile.educationDetails,
    safeProfile.experienceDetails,
    isFaculty,
    publications.length
  ]);

  /* ============================================================
     PROFILE IMAGE
  ============================================================ */

  // const profileImageSrc =
  //   previewImage ||
  //   (safeProfile.profilePic
  //     ? `/${safeProfile.profilePic}`
  //     : "/default-profile.png");

  const profileImageSrc =
  previewImage ||
  (safeProfile.profilePic
    ? safeProfile.profilePic.startsWith("http")
      ? safeProfile.profilePic
      : `${API_BASE_URL}/${safeProfile.profilePic.replace(/^\/+/, "")}`
    : "/default-profile.png");
  /* ============================================================
     IMAGE CHANGE
  ============================================================ */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Image",
        text: "Please select a valid image file."
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Image Too Large",
        text: "Please select an image smaller than 5 MB."
      });
      return;
    }

    if (previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    const imageUrl = URL.createObjectURL(file);

    setProfileImage(file);
    setPreviewImage(imageUrl);
  };

  /* ============================================================
     CANCEL EDITING
  ============================================================ */

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPhone(safeProfile.phoneNumber || "");
    setProfileImage(null);

    if (previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setPreviewImage("");
  };

  /* ============================================================
     SAVE PROFILE
  ============================================================ */

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("phoneNumber", phone.trim());

      if (profileImage) {
        formData.append("profilePic", profileImage);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/auth/update-profile/${safeProfile.userId}`,
        {
          method: "PUT",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to update profile"
        );
      }

      // if (data.profilePic) {
      //   setPreviewImage(`/${data.profilePic}`);
      // }
      if (data.profilePic) {
  setPreviewImage(
    data.profilePic.startsWith("http")
      ? data.profilePic
      : `${API_BASE_URL}/${data.profilePic.replace(/^\/+/, "")}`
  );
}

      setProfileImage(null);
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        confirmButtonColor: "#2563eb"
      });

      refreshProfile?.();
    } catch (error) {
      console.error("Profile update error:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.message ||
          "Unable to update your profile.",
        confirmButtonColor: "#dc2626"
      });
    }
  };

  /* ============================================================
     DOWNLOAD PROFILE
  ============================================================ */

  const downloadCV = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("Faculty Profile", 20, 20);

      doc.setFontSize(11);

      let y = 38;

      const addField = (label, value) => {
        if (
          value === undefined ||
          value === null ||
          String(value).trim() === ""
        ) {
          return;
        }

        const lines = doc.splitTextToSize(
          `${label}: ${value}`,
          170
        );

        doc.text(lines, 20, y);
        y += lines.length * 7 + 5;
      };

      addField("Name", safeProfile.fullName);
      addField("Email", safeProfile.email);
      addField("Department", safeProfile.department);
      addField("Phone", safeProfile.phoneNumber);
      addField("Role", safeProfile.role);

      if (safeProfile.educationDetails) {
        y += 5;

        doc.setFontSize(14);
        doc.text("Education", 20, y);

        y += 8;
        doc.setFontSize(11);

        const lines = doc.splitTextToSize(
          safeProfile.educationDetails,
          170
        );

        doc.text(lines, 20, y);

        y += lines.length * 6 + 10;
      }

      if (safeProfile.experienceDetails) {
        doc.setFontSize(14);
        doc.text("Professional Experience", 20, y);

        y += 8;
        doc.setFontSize(11);

        const lines = doc.splitTextToSize(
          safeProfile.experienceDetails,
          170
        );

        doc.text(lines, 20, y);
      }

      doc.save("Faculty_Profile.pdf");
    } catch (error) {
      console.error("PDF error:", error);

      Swal.fire({
        icon: "error",
        title: "PDF Error",
        text: "Unable to generate the profile PDF."
      });
    }
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (!facultyDetails) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }
  const renderPublicationChart = () => {
  const width = 900;
  const height = 320;
  const padding = {
    top: 30,
    right: 40,
    bottom: 50,
    left: 60
  };

  const maxCount = Math.max(
    ...publicationData.map((item) => item.count),
    2
  );

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = publicationData.map((item, index) => {
    const x =
      publicationData.length === 1
        ? padding.left + chartWidth / 2
        : padding.left +
          (index / (publicationData.length - 1)) *
            chartWidth;

    const y =
      padding.top +
      chartHeight -
      (item.count / maxCount) * chartHeight;

    return {
      ...item,
      x,
      y
    };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="320"
      style={{ display: "block" }}
    >
      {/* Grid */}
      {[0, 1, 2].map((value) => {
        const y =
          padding.top +
          chartHeight -
          (value / maxCount) * chartHeight;

        return (
          <line
            key={value}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
        );
      })}

      {/* Y axis */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="#cbd5e1"
      />

      {/* X axis */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="#cbd5e1"
      />

      {/* Y labels */}
      <text
        x={padding.left - 15}
        y={height - padding.bottom + 5}
        textAnchor="end"
        fontSize="13"
        fill="#64748b"
      >
        0
      </text>

      <text
        x={padding.left - 15}
        y={
          padding.top +
          chartHeight / 2 +
          5
        }
        textAnchor="end"
        fontSize="13"
        fill="#64748b"
      >
        {Math.round(maxCount / 2)}
      </text>

      <text
        x={padding.left - 15}
        y={padding.top + 5}
        textAnchor="end"
        fontSize="13"
        fill="#64748b"
      >
        {maxCount}
      </text>

      {/* Line */}
      {points.length > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke="#2563eb"
          strokeWidth="4"
        />
      )}

      {/* Points */}
      {points.map((point) => (
        <g key={point.year}>
          <circle
            cx={point.x}
            cy={point.y}
            r="8"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="3"
          />

          <text
            x={point.x}
            y={point.y - 18}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#1e293b"
          >
            {point.count}
          </text>

          <text
            x={point.x}
            y={height - padding.bottom + 30}
            textAnchor="middle"
            fontSize="14"
            fill="#64748b"
          >
            {point.year}
          </text>
        </g>
      ))}
    </svg>
  );
};

  return (
    <div className="professional-profile">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="profile-page-header">

        <div className="profile-header-content">

          <span className="profile-eyebrow">
            FACULTY PROFILE
          </span>

          <h1>Professional Profile</h1>

          <p>
            Manage your academic information,
            professional details and research activity.
          </p>

        </div>

        <div className="profile-header-actions">

          <button
            type="button"
            className="profile-secondary-btn"
            onClick={downloadCV}
          >
            <DownloadIcon />
            Download Profile
          </button>

          <button
            type="button"
            className="profile-primary-btn"
            onClick={() =>
              isEditing
                ? handleCancelEdit()
                : setIsEditing(true)
            }
          >
            <EditIcon />

            {isEditing
              ? "Cancel"
              : "Edit Profile"}
          </button>

        </div>

      </div>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="profile-hero">

        <div className="profile-hero-main">

          <div className="profile-avatar-wrapper">

            <img
              src={profileImageSrc}
              alt={
                safeProfile.fullName ||
                "Faculty"
              }
              className="profile-avatar"
              onError={(event) => {
                event.currentTarget.src =
                  "/default-profile.png";
              }}
            />

            {isEditing && (
              <label
                className="profile-photo-button"
                title="Change profile photo"
              >
                <PhotoCameraIcon />

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                />
              </label>
            )}

          </div>

          <div className="profile-identity">

            <div className="profile-role">
              {isFaculty
                ? "FACULTY"
                : safeProfile.role ||
                  "ACADEMIC"}
            </div>

            <h2>
              {safeProfile.fullName ||
                "Faculty Member"}
            </h2>

            {safeProfile.department && (
              <div className="profile-department">
                <BusinessOutlinedIcon />
                <span>
                  {safeProfile.department}
                </span>
              </div>
            )}

            {safeProfile.email && (
              <div className="profile-email">
                <EmailOutlinedIcon />
                <span>
                  {safeProfile.email}
                </span>
              </div>
            )}

            <div className="profile-status">
              <span className="status-dot" />
              Active Profile
            </div>

          </div>

        </div>

        <div className="profile-completion">

          <div className="completion-header">
            <span>
              Profile Completion
            </span>

            <strong>
              {profileCompletion}%
            </strong>
          </div>

          <div className="completion-track">
            <div
              className="completion-value"
              style={{
                width: `${profileCompletion}%`
              }}
            />
          </div>

          <small>
            {profileCompletion === 100
              ? "Your profile is complete."
              : "Complete your profile to maintain an updated academic record."}
          </small>

        </div>

      </section>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <section className="profile-stat-grid">

        <div className="profile-stat-card">

          <div className="stat-icon blue">
            <MenuBookOutlinedIcon />
          </div>

          <div>
            <span>Publications</span>

            <strong>
              {publications.length}
            </strong>
          </div>

        </div>

        <div className="profile-stat-card">

          <div className="stat-icon purple">
            <SchoolIcon />
          </div>

          <div>
            <span>Academic Role</span>

            <strong className="stat-text">
              {safeProfile.role ||
                "Faculty"}
            </strong>
          </div>

        </div>

        <div className="profile-stat-card">

          <div className="stat-icon green">
            <TrendingUpIcon />
          </div>

          <div>
            <span>Profile Status</span>

            <strong className="stat-text">
              {profileCompletion === 100
                ? "Complete"
                : "In Progress"}
            </strong>
          </div>

        </div>

        <div className="profile-stat-card">

          <div className="stat-icon orange">
            <EmojiEventsOutlinedIcon />
          </div>

          <div>
            <span>Achievements</span>

            <strong>
              {badges.length}
            </strong>
          </div>

        </div>

      </section>

      {/* ======================================================
          EDIT PANEL
      ====================================================== */}

      {isEditing && (
        <section className="profile-edit-panel">

          <div className="section-heading">
            <div>
              <span>PROFILE SETTINGS</span>

              <h3>Update Profile</h3>
            </div>
          </div>

          <div className="edit-grid">

            {safeProfile.fullName && (
              <div className="edit-field">
                <label>Full Name</label>

                <input
                  value={safeProfile.fullName}
                  disabled
                  readOnly
                />
              </div>
            )}

            {safeProfile.email && (
              <div className="edit-field">
                <label>Email</label>

                <input
                  value={safeProfile.email}
                  disabled
                  readOnly
                />
              </div>
            )}

            <div className="edit-field">
              <label>Phone Number</label>

              <input
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Enter phone number"
              />
            </div>

            {safeProfile.department && (
              <div className="edit-field">
                <label>Department</label>

                <input
                  value={safeProfile.department}
                  disabled
                  readOnly
                />
              </div>
            )}

          </div>

          <div className="edit-actions">

            <button
              type="button"
              className="cancel-profile-btn"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-profile-btn"
              onClick={handleSave}
            >
              <SaveIcon />
              Save Changes
            </button>

          </div>

        </section>
      )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="profile-content-grid">

        {/* ACADEMIC DETAILS */}

        <section className="profile-section-card">

          <div className="section-heading">

            <div>
              <span>ACADEMIC INFORMATION</span>

              <h3>Professional Details</h3>
            </div>

          </div>

          <div className="academic-details">

            {safeProfile.email && (
              <div className="academic-detail">

                <div className="detail-icon">
                  <EmailOutlinedIcon />
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {safeProfile.email}
                  </strong>
                </div>

              </div>
            )}

            {safeProfile.phoneNumber && (
              <div className="academic-detail">

                <div className="detail-icon">
                  <PhoneOutlinedIcon />
                </div>

                <div>
                  <span>Phone</span>

                  <strong>
                    {safeProfile.phoneNumber}
                  </strong>
                </div>

              </div>
            )}

            {safeProfile.department && (
              <div className="academic-detail">

                <div className="detail-icon">
                  <BusinessOutlinedIcon />
                </div>

                <div>
                  <span>Department</span>

                  <strong>
                    {safeProfile.department}
                  </strong>
                </div>

              </div>
            )}

          </div>

          {safeProfile.educationDetails && (
            <div className="profile-text-block">

              <div className="text-block-title">
                <SchoolIcon />

                <span>
                  Education
                </span>
              </div>

              <p>
                {safeProfile.educationDetails}
              </p>

            </div>
          )}

          {safeProfile.experienceDetails && (
            <div className="profile-text-block">

              <div className="text-block-title">
                <WorkIcon />

                <span>
                  Professional Experience
                </span>
              </div>

              <p>
                {safeProfile.experienceDetails}
              </p>

            </div>
          )}

          {!safeProfile.email &&
            !safeProfile.phoneNumber &&
            !safeProfile.department &&
            !safeProfile.educationDetails &&
            !safeProfile.experienceDetails && (
              <div className="profile-empty-state">
                <p>
                  No professional information
                  has been added yet.
                </p>
              </div>
            )}

        </section>

        {/* ACHIEVEMENTS */}

        {badges.length > 0 && (
          <section className="profile-section-card">

            <div className="section-heading">

              <div>
                <span>RECOGNITION</span>

                <h3>Achievements</h3>
              </div>

            </div>

            <div className="achievement-list">

              {badges.map(
                (badge, index) => (
                  <div
                    className="achievement-item"
                    key={`${badge}-${index}`}
                  >

                    <div className="achievement-icon">
                      <EmojiEventsOutlinedIcon />
                    </div>

                    <div>
                      <strong>
                        {badge}
                      </strong>

                      <span>
                        Academic profile achievement
                      </span>
                    </div>

                  </div>
                )
              )}

            </div>

          </section>
        )}

      </div>

      {/* ======================================================
          PUBLICATION TREND
      ====================================================== */}
{/* ======================================================
    PUBLICATION TREND
====================================================== */}

{/* ======================================================
    PUBLICATION TREND
====================================================== */}

{isFaculty && (
  <section className="profile-section-card publication-section">

    <div className="section-heading publication-heading">

      <div>
        <span>RESEARCH ACTIVITY</span>

        <h3>Publication Trend</h3>

        <p>
          Your publication activity across the years.
        </p>
      </div>

      <div className="publication-count">
        <strong>{publications.length}</strong>
        <span>Publications</span>
      </div>

    </div>

   {publicationData.length > 0 ? (

<div
  className="publication-chart"
  style={{
    width: "100%",
    height: "320px",
    minWidth: "300px",
    minHeight: "320px",
    display: "block"
  }}
>
  <LineChart
    width={800}
    height={320}
    data={publicationData}
    margin={{
      top: 20,
      right: 30,
      left: 40,
      bottom: 30
    }}
  >
    <CartesianGrid
      strokeDasharray="3 3"
      stroke="#e2e8f0"
    />

    <XAxis
      dataKey="year"
      tick={{
        fill: "#64748b",
        fontSize: 13
      }}
    />

    <YAxis
      allowDecimals={false}
      domain={[0, 3]}
      tick={{
        fill: "#64748b",
        fontSize: 13
      }}
    />

    <ChartTooltip
      formatter={(value) => [
        `${value} publication${Number(value) === 1 ? "" : "s"}`,
        "Publications"
      ]}
      labelFormatter={(label) => `Year: ${label}`}
    />

    <Line
      type="monotone"
      dataKey="count"
      name="Publications"
      stroke="#2563eb"
      strokeWidth={4}
      dot={{
        r: 7,
        fill: "#2563eb",
        stroke: "#ffffff",
        strokeWidth: 3
      }}
      activeDot={{
        r: 9
      }}
    />
  </LineChart>
</div>
) : (

  <div className="publication-empty">

    <MenuBookOutlinedIcon />

    <h4>No publication trend available</h4>

    <p>
      Publication activity across years will appear here
      once publication data is available.
    </p>

  </div>

)}

  </section>
)}
     
      {/* ======================================================
          SMART SUGGESTIONS
      ====================================================== */}

      {suggestions.length > 0 && (
        <section className="profile-section-card suggestions-section">

          <div className="section-heading">

            <div>
              <span>PROFILE IMPROVEMENT</span>

              <h3>Recommended Actions</h3>
            </div>

          </div>

          <div className="suggestion-list">

            {suggestions.map(
              (suggestion, index) => (
                <div
                  className="suggestion-item"
                  key={`${suggestion}-${index}`}
                >

                  <span className="suggestion-number">
                    {index + 1}
                  </span>

                  <span>
                    {suggestion}
                  </span>

                </div>
              )
            )}

          </div>

        </section>
      )}

      {/* COMPLETE PROFILE */}

      {suggestions.length === 0 && (
        <section className="profile-complete-card">

          <div className="complete-icon">
            <EmojiEventsOutlinedIcon />
          </div>

          <div>
            <strong>
              Your profile is complete
            </strong>

            <span>
              All available profile information
              has been provided.
            </span>
          </div>

        </section>
      )}

    </div>
  );
}
