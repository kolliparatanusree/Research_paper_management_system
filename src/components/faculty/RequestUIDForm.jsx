import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './RequestUIDForm.css';

const facultyDetails = JSON.parse(localStorage.getItem("user"));

export default function RequestUIDForm() {
    const [formValues, setFormValues] = useState({
        paperTitle: '',
        type: '',
        abstract: '',
        target: ''
    });

    const [hasCoAuthors, setHasCoAuthors] = useState(false);
    const [coAuthorCount, setCoAuthorCount] = useState(0);
    const [coAuthors, setCoAuthors] = useState([]);

    const handleFormChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    const handleCoAuthorChange = (index, field, value) => {
        const updated = [...coAuthors];
        updated[index] = { ...updated[index], [field]: value };
        setCoAuthors(updated);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const requestData = {
            // facultyId: facultyDetails?._id,

            facultyId: facultyDetails?.userId,
            facultyName: facultyDetails?.fullName,
            department: facultyDetails?.department || '',
            ...formValues,
            coAuthors: {
        hasCoAuthors,
          authors: hasCoAuthors
    ? coAuthors.map((a) => ({
        name: a.name,
        affiliation:
          a.affiliation === "Other"
            ? a.otherAffiliation
            : a.affiliation
      }))
    : []
        // authors: hasCoAuthors ? coAuthors : []
    }
        };
        console.log("facultyDetails:", facultyDetails);


        try {
            const res = await fetch('http://localhost:5000/api/faculty/uid-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            const data = await res.json();
            // alert(data.message);
            Swal.fire({
            title: 'UID Request Submitted!',
            text: data.message || 'Your UID request has been submitted to HoD.',
            icon: 'success',
            confirmButtonText: 'OK'
        });
            setFormValues({ paperTitle: '', type: '', abstract: '', target: '' });
            setHasCoAuthors(false);
            setCoAuthorCount(0);
            setCoAuthors([]);
        } catch (err) {
            console.error(err);
             Swal.fire({
            title: 'Submission Failed',
            text: err?.message || 'Something went wrong. Please try again.',
            icon: 'error',
            confirmButtonText: 'Retry'
        });
            // alert('Submission failed');
        }
    };

    return (
        <div className="centered-form-container">
            <div className="uid-form-card">
                {/* <h3>Request UID</h3> */}
                <form onSubmit={handleFormSubmit} className="uid-form">

  <h3 className="form-title">Request UID</h3>

  <label>Faculty Name</label>
  <input
    type="text"
    value={facultyDetails?.fullName || ""}
    readOnly
  />

  <label>Faculty ID</label>
  <input
    type="text"
    value={facultyDetails?.userId || ""}
    readOnly
  />

  <label>Department</label>
  <input
    type="text"
    value={facultyDetails?.department || ""}
    readOnly
  />

  <label>Tentative Paper Title</label>
  <input
    type="text"
    name="paperTitle"
    placeholder="Enter tentative paper title"
    value={formValues.paperTitle}
    onChange={handleFormChange}
    required
  />

  <label>Type of Publication</label>
  <select
    name="type"
    value={formValues.type}
    onChange={handleFormChange}
    required
  >
    <option value="">Select Type</option>
    <option value="Journal">Journal</option>
    <option value="Conference">Conference</option>
    <option value="Book Chapter">Book Chapter</option>
    <option value="Book">Book</option>
    <option value="Patent">Patent</option>
  </select>

  <label>Abstract (max 150 words)</label>
  <textarea
    name="abstract"
    rows="3"
    placeholder="Enter abstract"
    value={formValues.abstract}
    onChange={handleFormChange}
    required
  />

  <label>Target</label>
  <input
    type="text"
    name="target"
    placeholder="Enter target journal / conference / book / patent office"
    value={formValues.target}
    onChange={handleFormChange}
    required
  />

  <label>Any Co-authors?</label>
  <div className="radio-group">
    <label>
      <input
        type="radio"
        checked={hasCoAuthors}
        onChange={() => setHasCoAuthors(true)}
      /> Yes
    </label>

    <label>
      <input
        type="radio"
        checked={!hasCoAuthors}
        onChange={() => {
          setHasCoAuthors(false);
          setCoAuthorCount(0);
          setCoAuthors([]);
        }}
      /> No
    </label>
  </div>

  {hasCoAuthors && (
    <>
      <label>Number of Co-authors</label>
      <input
        type="number"
        min="1"
        max="10"
        value={coAuthorCount}
        onChange={(e) => {
          const count = Math.min(10, Math.max(0, Number(e.target.value)));
          setCoAuthorCount(count);
          setCoAuthors(
            Array.from({ length: count }, (_, i) =>
              coAuthors[i] || { name: "", affiliation: "" }
            )
          );
        }}
        required
      />

      <h4 className="coauthor-title">Co-author Details</h4>

      {coAuthors.map((coAuthor, index) => (
        <div key={index} className="coauthor-block">
          <input
            type="text"
            placeholder={`Co-author ${index + 1} Name`}
            value={coAuthor.name}
            onChange={(e) =>
              handleCoAuthorChange(index, "name", e.target.value)
            }
            required
          />

          <select
            value={coAuthor.affiliation}
            onChange={(e) =>
              handleCoAuthorChange(index, "affiliation", e.target.value)
            }
            required
          >
            <option value="">Select Affiliation</option>
            <option value="SVECW">SVECW</option>
            <option value="BVRITN">BVRITN</option>
            <option value="BVRITH">BVRITH</option>
            <option value="VIT">VIT</option>
            <option value="Other">Other</option>
          </select>
          {coAuthor.affiliation === "Other" && (
    <input
      type="text"
      placeholder="Enter College Name"
      value={coAuthor.otherAffiliation || ""}
      onChange={(e) =>
        handleCoAuthorChange(index, "otherAffiliation", e.target.value)
      }
      required
    />
  )}
        </div>
      ))}
    </>
  )}

  <button type="submit" className="submit-btn">
    Submit to HoD
  </button>

</form>
            </div>
        </div>
    );
}



// /* File: src/components/faculty/RequestUIDForm.jsx */
// import React, { useState } from 'react';

// export default function RequestUIDForm({ facultyDetails }) {
//     const [formValues, setFormValues] = useState({
//         paperTitle: '',
//         type: '',
//         abstract: '',
//         target: ''
//     });

//     const handleFormChange = (e) => {
//         setFormValues({ ...formValues, [e.target.name]: e.target.value });
//     };

//     const handleFormSubmit = async (e) => {
//         e.preventDefault();
//         const requestData = {
//             facultyId: facultyDetails?.facultyId,
//             facultyName: facultyDetails?.fullName,
//             department: facultyDetails?.department,
//             ...formValues
//         };

//         try {
//             const res = await fetch('http://localhost:5000/api/hod/uid-request', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(requestData)
//             });
//             const data = await res.json();
//             alert(data.message);
//             setFormValues({ paperTitle: '', type: '', abstract: '', target: '' });
//         } catch (err) {
//             console.error(err);
//             alert('Submission failed');
//         }
//     };

//     return (
//         <div className="centered-form-container">
//             <div className="uid-form-card">
//                 <h3>Request UID</h3>
//                 <form onSubmit={handleFormSubmit}>
//                     <input type="text" value={`Faculty Name: ${facultyDetails?.fullName || ''}`} readOnly />
//                     <input type="text" value={`Faculty ID: ${facultyDetails?.facultyId || ''}`} readOnly />
//                     <input type="text" value={`Department: ${facultyDetails?.department || ''}`} readOnly />
//                     <input type="text" name="paperTitle" placeholder="Tentative Paper Title" value={formValues.paperTitle} onChange={handleFormChange} required />
//                     <select name="type" value={formValues.type} onChange={handleFormChange} required>
//                         <option value="">Type (Conference/Journal)</option>
//                         <option value="Conference">Conference</option>
//                         <option value="Journal">Journal</option>
//                     </select>
//                     <textarea name="abstract" placeholder="Abstract (max 150 words)" rows="3" value={formValues.abstract} onChange={handleFormChange} required />
//                     <input type="text" name="target" placeholder="Target Journal/Conference" value={formValues.target} onChange={handleFormChange} required />
//                     <button type="submit">Submit to HoD</button>
//                 </form>
//             </div>
//         </div>
//     );
// }
