import React, { useState } from 'react';
import './AddFacultyForm.css';

const AddUserForm = () => {
  const [form, setForm] = useState({
    role: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userId: '',
    phoneNumber: '',
    gender: '',
    department: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getIdLabel = () => {
    switch (form.role) {
      case 'faculty':
        return 'Faculty ID';
      case 'hod':
        return 'HOD ID';
      case 'rdCoordinator':
        return 'R&D Coordinator ID';
      case 'rdDean':
        return 'R&D Dean ID';
      default:
        return 'User ID';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      alert('Please select a role');
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!/^\d{10}$/.test(form.phoneNumber)) {
      alert('Phone number must be exactly 10 digits');
      return;
    }

    const body = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: form.role,
      userId: form.userId,
      phoneNumber: form.phoneNumber,
      gender: form.gender,
      department: form.department
    };

    try {
      const response = await fetch(
        'http://localhost:5000/api/main-admin/add-user',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('User added successfully');
        setForm({
          role: '',
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          userId: '',
          phoneNumber: '',
          gender: '',
          department: ''
        });
      } else {
        alert(data.message || 'Failed to add user');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="x">
      <h3 className="form-title">Add User</h3>

      <form onSubmit={handleSubmit} className="faculty-form">

        {/* Role */}
        <select name="role" value={form.role} onChange={handleChange} required>
          <option value="">Select Role</option>
          <option value="faculty">Faculty</option>
          <option value="hod">HOD</option>
          <option value="rdCoordinator">R&D Coordinator</option>
          <option value="rdDean">R&D Dean</option>
        </select><br />

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        /><br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        /><br />

        {/* Single ID Field */}
        {form.role && (
          <>
            <input
              type="text"
              name="userId"
              placeholder={getIdLabel()}
              value={form.userId}
              onChange={handleChange}
              required
            />
            <br />
          </>
        )}

        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={handleChange}
          required
        /><br />

        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select><br />

        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="IT">IT</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select><br />

        <button type="submit" className="submit-btn">Add User</button>
      </form>
    </div>
  );
};

export default AddUserForm;



// import React, { useState } from 'react';
// import './AddFacultyForm.css';

// const AddUserForm = () => {
//   const [form, setForm] = useState({
//     role: '',
//     fullName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     idValue: '',
//     phoneNumber: '',
//     gender: '',
//     department: ''
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const getIdLabel = () => {
//     switch (form.role) {
//       case 'faculty':
//         return 'Faculty ID';
//       case 'hod':
//         return 'HOD ID';
//       case 'rdCoordinator':
//         return 'R&D Coordinator ID';
//       case 'rdDean':
//         return 'R&D Dean ID';
//       default:
//         return 'ID';
//     }
//   };

//   const getApiUrl = () => {
//     switch (form.role) {
//       case 'faculty':
//         return 'http://localhost:5000/api/main-admin/add-faculty';
//       case 'hod':
//         return 'http://localhost:5000/api/main-admin/add-hod';
//       case 'rdCoordinator':
//         return 'http://localhost:5000/api/main-admin/add-rd-coordinator';
//       case 'rdDean':
//         return 'http://localhost:5000/api/main-admin/add-rd-dean';
//       default:
//         return '';
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (form.password !== form.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }

//     if (!/^\d{10}$/.test(form.phoneNumber)) {
//       alert('Phone number must be exactly 10 digits');
//       return;
//     }

//     if (!form.role) {
//       alert('Please select a role');
//       return;
//     }

//     const body = {
//       fullName: form.fullName,
//       email: form.email,
//       password: form.password,
//       phoneNumber: form.phoneNumber,
//       gender: form.gender,
//       department: form.department
//     };

//     // attach correct ID field
//     if (form.role === 'faculty') body.facultyId = form.idValue;
//     if (form.role === 'hod') body.hodId = form.idValue;
//     if (form.role === 'rdCoordinator') body.rdCoordinatorId = form.idValue;
//     if (form.role === 'rdDean') body.rdDeanId = form.idValue;

//     try {
//       const response = await fetch(getApiUrl(), {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('User added successfully');
//         setForm({
//           role: '',
//           fullName: '',
//           email: '',
//           password: '',
//           confirmPassword: '',
//           idValue: '',
//           phoneNumber: '',
//           gender: '',
//           department: ''
//         });
//       } else {
//         alert(data.message || 'Failed to add user');
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Something went wrong. Please try again.');
//     }
//   };

//   return (
//     <div className="x">
//       <h3 className="form-title">Add User</h3>

//       <form onSubmit={handleSubmit} className="faculty-form">
        
//         {/* Role Dropdown */}
//         <select name="role" value={form.role} onChange={handleChange} required>
//           <option value="">Select Role</option>
//           <option value="faculty">Faculty</option>
//           <option value="hod">HOD</option>
//           <option value="rdCoordinator">R&D Coordinator</option>
//           <option value="rdDean">R&D Dean</option>
//         </select><br />

//         <input type="text" name="fullName" placeholder="Full Name"
//           value={form.fullName} onChange={handleChange} required /><br />

//         <input type="email" name="email" placeholder="Email"
//           value={form.email} onChange={handleChange} required /><br />

//         <input type="password" name="password" placeholder="Password"
//           value={form.password} onChange={handleChange} required /><br />

//         <input type="password" name="confirmPassword" placeholder="Confirm Password"
//           value={form.confirmPassword} onChange={handleChange} required /><br />

//         {/* Role-specific ID */}
//         {form.role && (
//           <input
//             type="text"
//             name="idValue"
//             placeholder={getIdLabel()}
//             value={form.idValue}
//             onChange={handleChange}
//             required
//           />
//         )}
//         <br />

//         <input type="text" name="phoneNumber" placeholder="Phone Number"
//           value={form.phoneNumber} onChange={handleChange} required /><br />

//         <select name="gender" value={form.gender} onChange={handleChange} required>
//           <option value="">Select Gender</option>
//           <option value="Male">Male</option>
//           <option value="Female">Female</option>
//           <option value="Other">Other</option>
//         </select><br />

//         <select name="department" value={form.department} onChange={handleChange} required>
//           <option value="">Select Department</option>
//           <option value="CSE">CSE</option>
//           <option value="ECE">ECE</option>
//           <option value="EEE">EEE</option>
//           <option value="IT">IT</option>
//           <option value="MECH">MECH</option>
//           <option value="CIVIL">CIVIL</option>
//         </select><br />

//         <button type="submit" className="submit-btn">Add User</button>
//       </form>
//     </div>
//   );
// };

// export default AddUserForm;
