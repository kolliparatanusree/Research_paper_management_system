// src/components/faculty/ProfileSection.jsx
// import React, { useState, useMemo, useEffect } from "react";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Chip,
  Stack,
  Divider
} from "@mui/material";
import { LinearProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DownloadIcon from "@mui/icons-material/Download";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import jsPDF from "jspdf";
import Swal from "sweetalert2";

export default function ProfileSection({ facultyDetails, refreshProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(facultyDetails?.phoneNumber || "");
const [publications, setPublications] = useState([]);
  const safeProfile = facultyDetails || {};
  const [profileImage, setProfileImage] = useState(null);
const [previewImage, setPreviewImage] = useState("");
//   useEffect(() => {
//   if (!facultyDetails?.userId) return;

//   fetch(`http://localhost:5000/api/faculty/all-publications/${facultyDetails.userId}`)
//     .then(res => res.json())
//     .then(data => setPublications(data))
//     .catch(err => console.error(err));
// }, [facultyDetails]);

useEffect(() => {
  if (!facultyDetails?.userId) return;

  fetch(`http://localhost:5000/api/faculty/all-publications/${facultyDetails.userId}`)
    .then(res => res.json())
    .then(data => {
      console.log("🔥 PUBLICATIONS API RESPONSE:", data);
      setPublications(Array.isArray(data) ? data : []);
    })
    .catch(err => console.error(err));
}, [facultyDetails?.userId]);
  // ================= PROFILE COMPLETION =================
  const profileCompletion = useMemo(() => {
    let total = 6;
    let filled = 0;

    if (safeProfile.fullName) filled++;
    if (safeProfile.email) filled++;
    if (safeProfile.phoneNumber) filled++;
    if (safeProfile.department) filled++;
    if (safeProfile.educationDetails) filled++;
    if (safeProfile.experienceDetails) filled++;

    return Math.round((filled / total) * 100);
  }, [safeProfile]);

  // ================= BADGES =================
  const badges = useMemo(() => {
    const list = [];

    if (publications.length >= 5) list.push("Researcher");
if (publications.length >= 10) list.push("Top Author");
    if (safeProfile?.experienceDetails) list.push("Experienced");
    if (profileCompletion === 100) list.push("Profile Complete");

    return list;
  }, [profileCompletion, publications.length]);


  const publicationData = useMemo(() => {
  if (!publications || publications.length === 0) return [];

  const countByYear = {};

  publications.forEach((pub) => {
    let year = pub.year;

    // If year is string like "2026"
    if (typeof year === "string") {
      year = parseInt(year);
    }

    // If year is from uploadedAt fallback
    if (!year && pub.uploadedAt) {
      const d = new Date(pub.uploadedAt);
      if (!isNaN(d.getTime())) {
        year = d.getFullYear();
      }
    }

    // Final validation
    if (!year || isNaN(year)) return;

    countByYear[year] = (countByYear[year] || 0) + 1;
  });

  return Object.keys(countByYear)
    .sort((a, b) => Number(a) - Number(b))
    .map((year) => ({
      year: Number(year),
      count: countByYear[year]
    }));
}, [publications]);
  // ================= GRAPH =================
//   const publicationData = useMemo(() => {
//     if (!publications.length) return [];

//     const countByYear = {};

//    publications.forEach((pub) => {
//   const year = pub.year || pub.publicationYear || "Unknown";
//   countByYear[year] = (countByYear[year] || 0) + 1;
// });

//     return Object.keys(countByYear)
//       .sort()
//       .map((year) => ({
//         year,
//         count: countByYear[year]
//       }));
// }, [publications]);

  // ================= SUGGESTIONS =================
  // ================= SUGGESTIONS =================
const suggestions = useMemo(() => {
  const list = [];

  if (!safeProfile.educationDetails)
    list.push("Add your education details");

  if (!safeProfile.experienceDetails)
    list.push("Add your experience");

  // 🔥 Only show this for faculty
  if (safeProfile?.role === "faculty" && !publications.length)
    list.push("Add your publications");

  return list;
}, [safeProfile, publications]);

  // ================= SAVE =================
  const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append("phoneNumber", phone);

    if (profileImage) {
      formData.append("profilePic", profileImage);
    }

    const res = await fetch(
      `http://localhost:5000/api/auth/update-profile/${safeProfile.userId}`,
      {
        method: "PUT",
        body: formData
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // 🔥 CRITICAL FIX
    if (data.profilePic) {
      setPreviewImage(`http://localhost:5000/${data.profilePic}`);
    }

    Swal.fire("Success", "Profile updated successfully", "success");
    setIsEditing(false);

    refreshProfile?.();

  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
};
//   const handleSave = async () => {
//   try {
//     const formData = new FormData();
//     formData.append("phoneNumber", phone);

//     if (profileImage) {
//       formData.append("profilePic", profileImage);
//     }

//     const res = await fetch(
//       `http://localhost:5000/api/auth/update-profile/${safeProfile.userId}`,
//       {
//         method: "PUT",
//         body: formData
//       }
//     );

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);

//     Swal.fire("Success", "Profile updated successfully", "success");
//     setIsEditing(false);
//     setPreviewImage("");
//     refreshProfile?.();
//   } catch (err) {
//     Swal.fire("Error", err.message, "error");
//   }
// };

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file)); // preview
  }
};

  // ================= PDF =================
  const downloadCV = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Faculty Profile", 20, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${safeProfile.fullName}`, 20, 40);
    doc.text(`Email: ${safeProfile.email}`, 20, 50);
    doc.text(`Department: ${safeProfile.department}`, 20, 60);
    doc.text(`Phone: ${safeProfile.phoneNumber}`, 20, 70);

    doc.text("Education:", 20, 90);
    doc.text(safeProfile.educationDetails || "N/A", 20, 100);

    doc.text("Experience:", 20, 120);
    doc.text(safeProfile.experienceDetails || "N/A", 20, 130);

    doc.save("Profile.pdf");
  };

  if (!facultyDetails) {
    return <Typography>Loading profile...</Typography>;
  }
 

  return (
    <Box p={3} 
  sx={{
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef2ff, #f0f9ff, #ecfeff)"
  }}
>

  {/* 🔥 CENTERED PROFILE CARD */}
  <Box display="flex" justifyContent="center" mb={3}>
    <Box width={{ xs: "100%", sm: "70%", md: "35%" }}>

        {/* LEFT PANEL */}
        <Grid
  item
  xs={12}
  md={4}
  sx={{ display: "flex", justifyContent: "center" }}
>
          <Card
           sx={{
  width: "100%",
  maxWidth: 350,
  borderRadius: 5,
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px) scale(1.02)",
    boxShadow: "0 25px 60px rgba(59,130,246,0.25)"
  }
}}
          >
            <CardContent sx={{ textAlign: "center" }}>

              <Avatar
               src={
  previewImage
    ? previewImage
    : safeProfile?.profilePic
    ? `http://localhost:5000/${safeProfile.profilePic}`
    : "/default-profile.png"
}
                // src={
                //   previewImage
                //     ? previewImage
                //     : safeProfile?.profilePic
                //     ? `http://localhost:5000/${safeProfile.profilePic}`
                //     : "/default-profile.png"
                // }
                sx={{
                  width: 110,
                  height: 110,
                  margin: "auto",
                  border: "4px solid rgba(193, 208, 233, 0.5)",
  boxShadow: "0 0 25px rgba(59,130,246,0.5)"
                }}
              />{isEditing && (
  <Button
    variant="outlined"
    component="label"
    size="small"
    sx={{ mt: 1 }}
  >
    Change Photo
    <input
      type="file"
      hidden
      accept="image/*"
      onChange={handleImageChange}
    />
  </Button>
)}

              <Typography variant="h6" mt={2} fontWeight="bold">
                {safeProfile.fullName}
              </Typography>

              <Typography color="text.secondary">
                {safeProfile.department}
              </Typography>

              {/* PROGRESS */}
              {/* ================= ADVANCED PROFILE PROGRESS ================= */}

{/* ================= SIMPLE PROFILE PROGRESS ================= */}
<Box mt={3}>

  <Box display="flex" justifyContent="space-between" mb={0.5}>
    <Typography fontWeight="bold">
      Profile Completion
    </Typography>
    <Typography fontWeight="bold">
      {profileCompletion}%
    </Typography>
  </Box>

  <LinearProgress
    variant="determinate"
    value={profileCompletion}
    sx={{
      height: 10,
      borderRadius: 5,
      backgroundColor: "#e5e7eb",
      overflow: "hidden",
      "& .MuiLinearProgress-bar": {
        borderRadius: 5,
        background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
        transition: "transform 1s ease"
      }
    }}
  />

</Box>
<br></br>
    
              {/* BADGES */}
              <Stack mt={2} direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                {badges.map((b, i) => (
                  <Chip
                    key={i}
                    label={b}
                    icon={<EmojiEventsIcon />}
                    sx={{
  background: "linear-gradient(135deg, #dbeafe, #ecfeff)",
  color: "#1e3a8a",
  fontWeight: "bold",
  border: "1px solid #bfdbfe"
}}
                  />
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Button
                startIcon={<EditIcon />}
                variant="contained"
                fullWidth
                onClick={() => setIsEditing(!isEditing)}

                sx={{
  background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
  fontWeight: "bold",
  "&:hover": {
    background: "linear-gradient(135deg, #2563eb, #0891b2)"
  }
}}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
              <br/><br/>
              <Button
                startIcon={<DownloadIcon />}
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                sx={{
  borderColor: "#3b82f6",
  color: "#3b82f6",
  "&:hover": {
    background: "#eff6ff"
  }
}}
                onClick={downloadCV}
              >
                Download CV
              </Button>
            </CardContent>
          </Card>
        </Grid>
            </Box>
  </Box>
  <br/>
        {/* RIGHT PANEL */}
        <Grid container spacing={3}>
  <Grid item xs={12}>
          <Card sx={{
  borderRadius: 5,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
}}>
            <CardContent>

              <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e293b" }}>
                Profile Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Name" value={safeProfile.fullName} fullWidth disabled />
                </Grid>

                <Grid item xs={6}>
                  <TextField label="Email" value={safeProfile.email} fullWidth disabled />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Phone"
                    value={phone}
                    fullWidth
                    disabled={!isEditing}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField label="Department" value={safeProfile.department} fullWidth disabled />
                </Grid>

                <Grid item xs={12}>
                  <TextField label="Education" value={safeProfile.educationDetails || ""} fullWidth multiline disabled />
                </Grid>

                <Grid item xs={12}>
                  <TextField label="Experience" value={safeProfile.experienceDetails || ""} fullWidth multiline disabled />
                </Grid>
              </Grid>

              {isEditing && (
                <Button
                  startIcon={<SaveIcon />}
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* GRAPH */}
          {/* GRAPH - Only for Faculty */}
{safeProfile?.role === "faculty" && (
  <Card sx={{ mt: 3, borderRadius: 4 }}>
    <CardContent>
      <Typography variant="h6" fontWeight="bold">
        Publications Trend ({publications.length})
      </Typography>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={publicationData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)}
          {/* <Card sx={{ mt: 3, borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Publications Trend ({publications.length})
              </Typography>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={publicationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          {/* SUGGESTIONS */}
          <Card sx={{ mt: 3, borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Smart Suggestions
              </Typography>

              {suggestions.length === 0 ? (
                <Typography color="green">Profile looks perfect 👌</Typography>
              ) : (
                suggestions.map((s, i) => (
                  <Chip
                    key={i}
                    label={s}
                    sx={{ m: 0.5 }}
                  />
                ))
              )}
            </CardContent>
          </Card>

        </Grid>
      </Grid>
    </Box>
  );
}