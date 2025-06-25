import React, { useEffect, useState } from 'react';
import './FacultyDashboard.css';
import UIDStatusList from '../components/UIDStatusList';
import PIDStatusList from '../components/PIDStatusList';
import logo from './logo2.jpeg';
import { useNavigate } from 'react-router-dom';

export default function FacultyDashboard() {
  const [activeSection, setActiveSection] = useState('request-uid');
  const [facultyDetails, setFacultyDetails] = useState(null);
  const [formValues, setFormValues] = useState({
    paperTitle: '',
    type: '',
    abstract: '',
    target: '',
  });
  const [approvedUIDs, setApprovedUIDs] = useState([]);
  const [documents, setDocuments] = useState({});
  const [loadingUid, setLoadingUid] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const facultyId = localStorage.getItem('facultyId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/faculty/${facultyId}`);
        const data = await res.json();
        setFacultyDetails(data);
      } catch (err) {
        console.error('Error fetching faculty data:', err);
      }
    };

    if (facultyId) fetchDetails();
  }, [facultyId]);

  useEffect(() => {
    const fetchApprovedUIDs = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/faculty/approved-uid-requests/${facultyId}`);
        const data = await res.json();
        setApprovedUIDs(data);
      } catch (err) {
        console.error('Error fetching approved UID requests:', err);
      }
    };

    if (activeSection === 'indexing') {
      fetchApprovedUIDs();
    }
  }, [activeSection, facultyId]);

  const handleFormChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const requestData = {
      facultyId: facultyDetails?.facultyId,
      facultyName: facultyDetails?.fullName,
      department: facultyDetails?.department,
      ...formValues
    };

    try {
      const res = await fetch('http://localhost:5000/api/hod/uid-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await res.json();
      alert(data.message);
      setFormValues({ paperTitle: '', type: '', abstract: '', target: '' });
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  const handleFileChange = (uid, field, file) => {
    setDocuments((prev) => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        [field]: file
      }
    }));
  };

  const handleDocumentUpload = async (uid) => {
    setLoadingUid(uid);

    const formData = new FormData();
    formData.append('facultyId', facultyId);
    formData.append('uid', uid);

    if (documents[uid]?.acceptanceLetter) {
      formData.append('acceptanceLetter', documents[uid].acceptanceLetter);
    }
    if (documents[uid]?.indexingProof) {
      formData.append('indexingProof', documents[uid].indexingProof);
    }

    try {
      const res = await fetch('http://localhost:5000/api/faculty/upload-documents', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        alert('Something went wrong. Please try again.');
        return;
      }

      const data = await res.json();
      alert(data?.message || 'No response from server.');

      setApprovedUIDs((prev) => prev.filter(request => request.uid !== uid));
      setDocuments((prev) => ({
        ...prev,
        [uid]: { acceptanceLetter: null, indexingProof: null }
      }));
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please check your connection.');
    } finally {
      setLoadingUid(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/faculty-login');
  };

  const filteredApprovedUIDs = approvedUIDs.filter((uid) => {
    const query = searchQuery.toLowerCase();
    return (
      uid.uid?.toLowerCase().includes(query) ||
      uid.paperTitle?.toLowerCase().includes(query) ||
      uid.type?.toLowerCase().includes(query) ||
      uid.target?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="logo-section">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <nav className="menu">
          <ul>
            <li className={activeSection === 'request-uid' ? 'active' : ''} onClick={() => setActiveSection('request-uid')}>📄 Request UID</li>
            <li className={activeSection === 'uid-status' ? 'active' : ''} onClick={() => setActiveSection('uid-status')}>🔄 UID Status</li>
            <li className={activeSection === 'indexing' ? 'active' : ''} onClick={() => setActiveSection('indexing')}>📤 Submit Documents</li>
            <li className={activeSection === 'my-submissions' ? 'active' : ''} onClick={() => setActiveSection('my-submissions')}>🔄 PID Status</li>
            <li className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>👤 Profile</li>
            <li onClick={handleLogout} style={{ color: 'white', marginTop: '0px', cursor: 'pointer', fontSize: '20px' }}>🔚 Logout</li>
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <p style={{ color: 'purple', fontSize: '25px' }}>Welcome, {facultyDetails?.fullName || 'Faculty'}</p>

        {/* UID Request Form */}
        {activeSection === 'request-uid' && (
          <div className="centered-form-container">
            <div className="uid-form-card">
              <h3>Request UID</h3>
              <form onSubmit={handleFormSubmit}>
                <input type="text" value={`Faculty Name: ${facultyDetails?.fullName || ''}`} readOnly />
                <input type="text" value={`Faculty ID: ${facultyDetails?.facultyId || ''}`} readOnly />
                <input type="text" value={`Department: ${facultyDetails?.department || ''}`} readOnly />
                <input type="text" name="paperTitle" placeholder="Tentative Paper Title" value={formValues.paperTitle} onChange={handleFormChange} required />
                <select name="type" value={formValues.type} onChange={handleFormChange} required>
                  <option value="">Type (Conference/Journal)</option>
                  <option value="Conference">Conference</option>
                  <option value="Journal">Journal</option>
                </select>
                <textarea name="abstract" placeholder="Abstract (max 150 words)" rows="3" value={formValues.abstract} onChange={handleFormChange} required />
                <input type="text" name="target" placeholder="Target Journal/Conference" value={formValues.target} onChange={handleFormChange} required />
                <button type="submit">Submit to HoD</button>
              </form>
            </div>
          </div>
        )}

        {/* UID Status Section */}
        {activeSection === 'uid-status' && (
          <div className="uid-status-section">
            <h3>Your UID Requests</h3>
            {!facultyDetails ? <p>Loading...</p> : <UIDStatusList facultyId={facultyDetails.facultyId} />}
          </div>
        )}

        {/* Submit Documents Section */}
        {activeSection === 'indexing' && (
          <div className="approved-uid-section">
            {approvedUIDs.length > 0 && (
              <input
                type="text"
                placeholder="Search UID by UID, title, type, target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '20px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
            )}

            {filteredApprovedUIDs.length === 0 ? (
              <p>No approved UID requests found.</p>
            ) : (
              filteredApprovedUIDs.map((uid) => (
                <div key={uid._id} className="uid-card">
                  <p><strong>Paper Title:</strong> {uid.paperTitle}</p>
                  <p><strong>UID:</strong> {uid.uid}</p>
                  <p><strong>Type:</strong> {uid.type}</p>
                  <p><strong>Abstract:</strong> {uid.abstract}</p>
                  <p><strong>Target:</strong> {uid.target}</p>
                  <div className="form-group">
                    <label>📄 Acceptance Letter (PDF/DOC)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(uid.uid, 'acceptanceLetter', e.target.files[0])}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>📑 Indexing Proof (PDF/DOC)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(uid.uid, 'indexingProof', e.target.files[0])}
                      required
                    />
                  </div>
                  <button onClick={() => handleDocumentUpload(uid.uid)} disabled={loadingUid === uid.uid}>
                    {loadingUid === uid.uid ? 'Uploading...' : 'Submit Documents'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* PID Status Section */}
        {activeSection === 'my-submissions' && (
          <div className="submission-placeholder">
            <h3>PID Status</h3>
            {facultyDetails?.facultyId && <PIDStatusList facultyId={facultyDetails.facultyId} />}
          </div>
        )}

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="profile-section">
            <h3>My Profile</h3>
            {facultyDetails ? (
              <div className="profile-details">
                <p><strong>Name:</strong> {facultyDetails.fullName}</p>
                <p><strong>Faculty ID:</strong> {facultyDetails.facultyId}</p>
                <p><strong>Department:</strong> {facultyDetails.department}</p>
                <p><strong>Email:</strong> {facultyDetails.email || 'N/A'}</p>
                <p><strong>Phone Number:</strong> {facultyDetails.phoneNumber}</p>
              </div>
            ) : (
              <p>Loading profile...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
