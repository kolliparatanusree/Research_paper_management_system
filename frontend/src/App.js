// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage.js';
import FacultyLogin from './components/FacultyLogin';
import AdminLogin from './components/AdminLogin';
import AdminRegister from './components/AdminRegister';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';
import Register from './components/Register.js';
import Login from './components/Login.js';
import HODLogin from './components/HODLogin.js';
import HODRegister from './components/HODRegister.js';
import HodDashboard from './components/HodDashboard.js';
// import CustomNavbar from './components/CustomNavbar.js';
import UIDRequestsPage from './components/UIDRequestsPage.js';
import PrincipalLogin from './components/PrincipalLogin.js';
import PrincipalDashboard from './components/PrincipalDashboard.js';
import MainAdminDashboard from './components/MainAdminDashboard.js';
import Instructions from './components/Instructions.js';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
         <Route path="/principal-login" element={<PrincipalLogin/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/hod-login" element={<HODLogin/>} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/principal-dashboard" element={<PrincipalDashboard />} />  
        <Route path="/hod-register" element={<HODRegister />} />
        <Route path="/faculty-login" element={<FacultyLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/hod-dashboard" element={<HodDashboard/>} />
        <Route path="/hod-uid-requests" element={<UIDRequestsPage/>} />
        <Route path="/mainAdmin-dashboard" element={<MainAdminDashboard/>} />
        <Route path="/instructions" element={<Instructions/>} />
      </Routes>
    </Router>
  );
}

export default App;

// import React from "react";

// const userTypes = [
//   { label: "Student", icon: "🎓" },
//   { label: "University / Institution (TPO)", icon: "🏛️" },
//   { label: "ULB/Smart City/Parastatal", icon: "🏢" },
//   { label: "ULB/Smart City-Department", icon: "⚙️" },
//   { label: "Rural Department", icon: "🏘️" },
//   { label: "Employer (MSME, DM, NGO, PSU)", icon: "👥" },
// ];

// const App = () => {
//   return (
//     <div className="min-h-screen bg-white font-sans">
//       {/* Header */}
//       <header className="flex justify-between items-center px-10 py-4 border-b">
//         <div className="text-2xl font-bold text-blue-600">National Internship Portal</div>
//         <div className="space-x-4">
//           <a href="#" className="text-blue-600 font-semibold">Employer/Post Internship</a>
//           <button className="text-blue-600">Login</button>
//           <button className="bg-orange-500 text-white px-4 py-2 rounded">Register</button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="text-center mt-10">
//         <h1 className="text-3xl font-bold">Login</h1>
//         <h2 className="text-2xl text-red-600 mt-2">Select User Type</h2>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-10 mt-10">
//           {userTypes.map((user, index) => (
//             <div
//               key={index}
//               className="bg-gray-100 rounded-lg p-6 shadow hover:shadow-md transition cursor-pointer"
//             >
//               <div className="text-5xl mb-4">{user.icon}</div>
//               <div className="text-lg font-medium">{user.label}</div>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default App;
