import React, { useState } from "react";
import "./AddUserForm.css";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../config.js";
import {
  FiUserPlus,
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiBriefcase,
  FiUsers,
  FiHash,
  FiCheckCircle,
  FiShield,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";

const AddUserForm = () => {
  const [form, setForm] = useState({
    role: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userId: "",
    phoneNumber: "",
    gender: "",
    department: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getIdLabel = () => {
    switch (form.role) {
      case "faculty":
        return "Faculty ID";
      case "hod":
        return "HOD ID";
      case "rdCoordinator":
        return "R&D Coordinator ID";
      case "rdDean":
        return "R&D Dean ID";
      default:
        return "User ID";
    }
  };

  const getRoleDetails = () => {
    switch (form.role) {
      case "faculty":
        return {
          title: "Faculty Account",
          description:
            "Create an academic account for a faculty member.",
        };

      case "hod":
        return {
          title: "HOD Account",
          description:
            "Create a department-level HOD account.",
        };

      case "rdCoordinator":
        return {
          title: "R&D Coordinator",
          description:
            "Create an account for research administration.",
        };

      case "rdDean":
        return {
          title: "R&D Dean",
          description:
            "Create an account for R&D Dean access.",
        };

      default:
        return {
          title: "Select a Role",
          description:
            "Choose the account role to continue.",
        };
    }
  };

  const roleDetails = getRoleDetails();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      return Swal.fire({
        icon: "error",
        title: "Role Required",
        text: "Please select a role",
        confirmButtonColor: "#4f46e5",
      });
    }

    if (form.password !== form.confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match",
        confirmButtonColor: "#4f46e5",
      });
    }

    if (!/^\d{10}$/.test(form.phoneNumber)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Phone number must be 10 digits",
        confirmButtonColor: "#4f46e5",
      });
    }

    const body = { ...form };

    try {
      const res = await fetch(`${API_BASE_URL}/api/main-admin/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "User Created Successfully",
          text: "The new account has been added to RPMS.",
          confirmButtonColor: "#4f46e5",
        });

        setForm({
          role: "",
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          userId: "",
          phoneNumber: "",
          gender: "",
          department: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Unable to Add User",
          text: data.message || "Failed to add user",
          confirmButtonColor: "#4f46e5",
        });
      }
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        text: "Please try again.",
        confirmButtonColor: "#4f46e5",
      });
    }
  };

  return (
    <div className="add-user-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="add-user-header">

        <div className="add-user-header-content">

          <div className="add-user-header-icon">
            <FiUserPlus />
          </div>

          <div className="add-user-header-text">

            <span className="add-user-eyebrow">
              ACCOUNT MANAGEMENT
            </span>

            <h2 className="add-user-title">
              Create New User
            </h2>

            <p className="add-user-description">
              Add a new academic or research administration
              account to the Research Paper Management System.
            </p>

          </div>

        </div>

        <div className="add-user-security-badge">
          <FiShield />
          <span>Secure Admin Action</span>
        </div>

      </div>


      {/* =====================================================
          ROLE PREVIEW
      ===================================================== */}

      <div className="add-user-role-preview">

        <div className="add-user-role-preview-icon">
          {form.role ? <FiUser /> : <FiInfo />}
        </div>

        <div className="add-user-role-preview-content">

          <span className="add-user-role-preview-label">
            ACCOUNT ROLE
          </span>

          <strong className="add-user-role-preview-title">
            {roleDetails.title}
          </strong>

          <small className="add-user-role-preview-description">
            {roleDetails.description}
          </small>

        </div>

        <div
          className={`add-user-role-preview-status ${
            form.role
              ? "add-user-role-selected"
              : "add-user-role-pending"
          }`}
        >
          {form.role ? (
            <>
              <FiCheckCircle />
              <span>Role Selected</span>
            </>
          ) : (
            <>
              <FiInfo />
              <span>Selection Required</span>
            </>
          )}
        </div>

      </div>


      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="add-user-form"
      >

        {/* ===================================================
            PERSONAL INFORMATION
        =================================================== */}

        <section className="add-user-form-section">

          <div className="add-user-section-header">

            <div className="add-user-section-icon">
              <FiUser />
            </div>

            <div className="add-user-section-heading">

              <span className="add-user-section-number">
                01
              </span>

              <h3 className="add-user-section-title">
                Personal Information
              </h3>

              <p className="add-user-section-description">
                Enter the basic details of the new user.
              </p>

            </div>

          </div>


          <div className="add-user-form-grid">

            {/* Full Name */}

            <div className="add-user-form-group">

              <label
                htmlFor="fullName"
                className="add-user-form-label"
              >
                Full Name
                <span>*</span>
              </label>

              <div className="add-user-input-container">

                <FiUser className="add-user-input-icon" />

                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  className="add-user-form-input"
                  placeholder="Enter full name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Email */}

            <div className="add-user-form-group">

              <label
                htmlFor="email"
                className="add-user-form-label"
              >
                Email Address
                <span>*</span>
              </label>

              <div className="add-user-input-container">

                <FiMail className="add-user-input-icon" />

                <input
                  type="email"
                  name="email"
                  id="email"
                  className="add-user-form-input"
                  placeholder="example@institution.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Phone */}

            <div className="add-user-form-group">

              <label
                htmlFor="phoneNumber"
                className="add-user-form-label"
              >
                Phone Number
                <span>*</span>
              </label>

              <div className="add-user-input-container">

                <FiPhone className="add-user-input-icon" />

                <input
                  type="text"
                  name="phoneNumber"
                  id="phoneNumber"
                  className="add-user-form-input"
                  placeholder="10 digit mobile number"
                  maxLength="10"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                />

              </div>

              <small className="add-user-field-hint">
                Enter exactly 10 digits.
              </small>

            </div>


            {/* Gender */}

            <div className="add-user-form-group">

              <label
                htmlFor="gender"
                className="add-user-form-label"
              >
                Gender
                <span>*</span>
              </label>

              <div className="add-user-select-container">

                <FiUsers className="add-user-select-icon" />

                <select
                  name="gender"
                  id="gender"
                  className="add-user-form-select"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            ACCOUNT ACCESS
        =================================================== */}

        <section className="add-user-form-section">

          <div className="add-user-section-header">

            <div className="add-user-section-icon">
              <FiShield />
            </div>

            <div className="add-user-section-heading">

              <span className="add-user-section-number">
                02
              </span>

              <h3 className="add-user-section-title">
                Account Access
              </h3>

              <p className="add-user-section-description">
                Configure the user's role and login credentials.
              </p>

            </div>

          </div>


          <div className="add-user-form-grid">

            {/* Role */}

            <div className="add-user-form-group add-user-form-group-full">

              <label
                htmlFor="role"
                className="add-user-form-label"
              >
                Account Role
                <span>*</span>
              </label>

              <div className="add-user-select-container">

                <FiBriefcase className="add-user-select-icon" />

                <select
                  name="role"
                  id="role"
                  className="add-user-form-select"
                  value={form.role}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select account role
                  </option>

                  <option value="faculty">
                    Faculty
                  </option>

                  <option value="hod">
                    HOD
                  </option>

                  <option value="rdCoordinator">
                    R&D Coordinator
                  </option>

                  <option value="rdDean">
                    R&D Dean
                  </option>

                </select>

              </div>

            </div>


            {/* User ID */}

            {form.role && (
              <div className="add-user-form-group add-user-form-group-full">

                <label
                  htmlFor="userId"
                  className="add-user-form-label"
                >
                  {getIdLabel()}
                  <span>*</span>
                </label>

                <div className="add-user-input-container">

                  <FiHash className="add-user-input-icon" />

                  <input
                    type="text"
                    name="userId"
                    id="userId"
                    className="add-user-form-input"
                    placeholder={`Enter ${getIdLabel()}`}
                    value={form.userId}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>
            )}


            {/* Password */}

            <div className="add-user-form-group">

              <label
                htmlFor="password"
                className="add-user-form-label"
              >
                Password
                <span>*</span>
              </label>

              <div className="add-user-input-container">

                <FiLock className="add-user-input-icon" />

                <input
                  type="password"
                  name="password"
                  id="password"
                  className="add-user-form-input"
                  placeholder="Create password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Confirm Password */}

            <div className="add-user-form-group">

              <label
                htmlFor="confirmPassword"
                className="add-user-form-label"
              >
                Confirm Password
                <span>*</span>
              </label>

              <div className="add-user-input-container">

                <FiLock className="add-user-input-icon" />

                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className="add-user-form-input"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            ORGANIZATION DETAILS
        =================================================== */}

        <section className="add-user-form-section">

          <div className="add-user-section-header">

            <div className="add-user-section-icon">
              <FiBriefcase />
            </div>

            <div className="add-user-section-heading">

              <span className="add-user-section-number">
                03
              </span>

              <h3 className="add-user-section-title">
                Organization Details
              </h3>

              <p className="add-user-section-description">
                Assign the user's academic department.
              </p>

            </div>

          </div>


          <div className="add-user-form-grid">

            <div className="add-user-form-group add-user-form-group-full">

              <label
                htmlFor="department"
                className="add-user-form-label"
              >
                Department
                <span>*</span>
              </label>

              <div className="add-user-select-container">

                <FiBriefcase className="add-user-select-icon" />

                <select
                  name="department"
                  id="department"
                  className="add-user-form-select"
                  value={form.department}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select department
                  </option>

                  <option value="CSE">
                    Computer Science & Engineering
                  </option>

                  <option value="ECE">
                    Electronics & Communication Engineering
                  </option>

                  <option value="EEE">
                    Electrical & Electronics Engineering
                  </option>

                  <option value="IT">
                    Information Technology
                  </option>

                  <option value="MECH">
                    Mechanical Engineering
                  </option>

                  <option value="CIVIL">
                    Civil Engineering
                  </option>

                </select>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            SUBMIT AREA
        =================================================== */}

        <div className="add-user-submit-area">

          <div className="add-user-submit-information">

            <FiShield className="add-user-submit-information-icon" />

            <div>

              <strong>
                Ready to create this account?
              </strong>

              <small>
                Verify the entered information before submitting.
              </small>

            </div>

          </div>


          <button
            type="submit"
            className="add-user-submit-button"
          >

            <span className="add-user-submit-icon">
              <FiUserPlus />
            </span>

            <span className="add-user-submit-text">
              Create User Account
            </span>

            <FiArrowRight className="add-user-submit-arrow" />

          </button>

        </div>

      </form>

    </div>
  );
};

export default AddUserForm;