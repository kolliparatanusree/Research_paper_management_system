import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './RequestUIDForm.css';
import { API_BASE_URL } from "../../config";
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
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        if (isSubmitting) return;

        const abstractWords = formValues.abstract
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (abstractWords.length > 150) {
            Swal.fire({
                title: 'Abstract Too Long',
                text: 'Please keep the abstract within 150 words.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (hasCoAuthors) {
            const invalidCoAuthor = coAuthors.some(
                (author) =>
                    !author.name?.trim() ||
                    !author.affiliation?.trim() ||
                    (
                        author.affiliation === "Other" &&
                        !author.otherAffiliation?.trim()
                    )
            );

            if (invalidCoAuthor) {
                Swal.fire({
                    title: 'Incomplete Co-author Details',
                    text: 'Please complete all co-author details before submitting.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }
        }

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
            }
        };

        console.log("facultyDetails:", facultyDetails);

        try {
            setIsSubmitting(true);

            const res = await fetch(
                `${API_BASE_URL}/api/faculty/uid-request`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || 'Failed to submit UID request.'
                );
            }

            Swal.fire({
                title: 'UID Request Submitted!',
                text:
                    data.message ||
                    'Your UID request has been submitted to HoD.',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            setFormValues({
                paperTitle: '',
                type: '',
                abstract: '',
                target: ''
            });

            setHasCoAuthors(false);
            setCoAuthorCount(0);
            setCoAuthors([]);

        } catch (err) {
            console.error(err);

            Swal.fire({
                title: 'Submission Failed',
                text:
                    err?.message ||
                    'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonText: 'Retry'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const abstractWordCount = formValues.abstract
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    return (
        <div className="request-uid-page">

            <div className="uid-form-card">

                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="uid-page-header">

                    <div className="uid-header-left">

                        <div className="uid-header-icon">
                            <span>+</span>
                        </div>

                        <div>
                            <div className="header-eyebrow">
                                RESEARCH PUBLICATION
                            </div>

                            <h2>Request UID</h2>

                            <p>
                                Submit your research details for HoD review
                                and UID approval.
                            </p>
                        </div>

                    </div>

                    <div className="header-status">
                        <span className="status-dot"></span>
                        New Request
                    </div>

                </div>


                {/* =====================================================
                    STEP INDICATOR
                ===================================================== */}

                <div className="uid-steps">

                    <div className="uid-step active">

                        <div className="step-circle">
                            01
                        </div>

                        <div>
                            <strong>Faculty</strong>
                            <span>Information</span>
                        </div>

                    </div>


                    <div className="step-line"></div>


                    <div className="uid-step">

                        <div className="step-circle">
                            02
                        </div>

                        <div>
                            <strong>Paper</strong>
                            <span>Details</span>
                        </div>

                    </div>


                    <div className="step-line"></div>


                    <div className="uid-step">

                        <div className="step-circle">
                            03
                        </div>

                        <div>
                            <strong>Co-authors</strong>
                            <span>Details</span>
                        </div>

                    </div>

                </div>


                {/* =====================================================
                    FORM
                ===================================================== */}

                <form
                    onSubmit={handleFormSubmit}
                    className="uid-form"
                >

                    {/* =================================================
                        FACULTY INFORMATION
                    ================================================= */}

                    <div className="form-section">

                        <div className="section-heading">

                            <div className="section-title-area">

                                <span className="section-kicker">
                                    STEP 01
                                </span>

                                <h3>Faculty Information</h3>

                                <p>
                                    Your registered faculty details
                                </p>

                            </div>

                            <div className="section-check">
                                ✓
                            </div>

                        </div>


                        <div className="faculty-profile-card">

                            <div className="faculty-avatar">
                                {(facultyDetails?.fullName || "F")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="faculty-profile-details">

                                <div className="faculty-profile-name">
                                    {facultyDetails?.fullName || "Faculty"}
                                </div>

                                <div className="faculty-profile-role">
                                    Faculty Member
                                </div>

                            </div>

                        </div>


                        <div className="faculty-info-grid">

                            <div className="form-field">

                                <label>
                                    Faculty Name
                                </label>

                                <div className="readonly-input">

                                    <span className="field-symbol">
                                        FN
                                    </span>

                                    <input
                                        type="text"
                                        value={
                                            facultyDetails?.fullName || ""
                                        }
                                        readOnly
                                    />

                                    <span className="readonly-badge">
                                        Read only
                                    </span>

                                </div>

                            </div>


                            <div className="form-field">

                                <label>
                                    Faculty ID
                                </label>

                                <div className="readonly-input">

                                    <span className="field-symbol">
                                        ID
                                    </span>

                                    <input
                                        type="text"
                                        value={
                                            facultyDetails?.userId || ""
                                        }
                                        readOnly
                                    />

                                    <span className="readonly-badge">
                                        Read only
                                    </span>

                                </div>

                            </div>


                            <div className="form-field full-width">

                                <label>
                                    Department
                                </label>

                                <div className="readonly-input">

                                    <span className="field-symbol">
                                        DP
                                    </span>

                                    <input
                                        type="text"
                                        value={
                                            facultyDetails?.department || ""
                                        }
                                        readOnly
                                    />

                                    <span className="readonly-badge">
                                        Read only
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        PAPER INFORMATION
                    ================================================= */}

                    <div className="form-section">

                        <div className="section-heading">

                            <div className="section-title-area">

                                <span className="section-kicker">
                                    STEP 02
                                </span>

                                <h3>Paper Information</h3>

                                <p>
                                    Provide the details of your proposed
                                    publication
                                </p>

                            </div>

                            <div className="section-number">
                                02
                            </div>

                        </div>


                        {/* Paper title */}

                        <div className="form-field">

                            <label>
                                Tentative Paper Title
                                <span className="required-star">*</span>
                            </label>

                            <div className="input-shell">

                                <input
                                    type="text"
                                    name="paperTitle"
                                    placeholder="Enter your tentative research paper title"
                                    value={formValues.paperTitle}
                                    onChange={handleFormChange}
                                    required
                                />

                            </div>

                            <small className="field-hint">
                                Use a clear working title. You can refine
                                the title later.
                            </small>

                        </div>


                        {/* Publication type + Target */}

                        <div className="two-column-fields">

                            <div className="form-field">

                                <label>
                                    Type of Publication
                                    <span className="required-star">*</span>
                                </label>

                                <select
                                    name="type"
                                    value={formValues.type}
                                    onChange={handleFormChange}
                                    required
                                >

                                    <option value="">
                                        Select publication type
                                    </option>

                                    <option value="Journal">
                                        Journal
                                    </option>

                                    <option value="Conference">
                                        Conference
                                    </option>

                                    <option value="Book Chapter">
                                        Book Chapter
                                    </option>

                                    <option value="Book">
                                        Book
                                    </option>

                                    <option value="Patent">
                                        Patent
                                    </option>

                                </select>

                            </div>


                            <div className="form-field">

                                <label>
                                    Target
                                    <span className="required-star">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="target"
                                    placeholder="Journal / Conference / Publisher"
                                    value={formValues.target}
                                    onChange={handleFormChange}
                                    required
                                />

                            </div>

                        </div>


                        {/* Abstract */}

                        <div className="form-field abstract-field">

                            <div className="label-with-counter">

                                <label>
                                    Abstract
                                    <span className="required-star">*</span>
                                </label>

                                <span
                                    className={
                                        abstractWordCount > 150
                                            ? "word-counter danger"
                                            : "word-counter"
                                    }
                                >
                                    {abstractWordCount}
                                    <span>/150 words</span>
                                </span>

                            </div>


                            <div className="abstract-wrapper">

                                <textarea
                                    name="abstract"
                                    rows="7"
                                    placeholder="Write a concise summary of your proposed research, methodology, and expected contribution..."
                                    value={formValues.abstract}
                                    onChange={handleFormChange}
                                    required
                                />

                                <div className="abstract-footer">

                                    <span>
                                        Keep the abstract within
                                        150 words.
                                    </span>

                                    <span>
                                        {abstractWordCount <= 150
                                            ? "Within limit"
                                            : "Over limit"}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        CO-AUTHORS
                    ================================================= */}

                    <div className="form-section">

                        <div className="section-heading">

                            <div className="section-title-area">

                                <span className="section-kicker">
                                    STEP 03
                                </span>

                                <h3>Co-authors</h3>

                                <p>
                                    Add researchers involved in this
                                    publication
                                </p>

                            </div>

                            <div className="section-number">
                                03
                            </div>

                        </div>


                        <div className="coauthor-question">

                            <div className="coauthor-question-text">

                                <strong>
                                    Does this paper have any co-authors?
                                </strong>

                                <span>
                                    Select yes if other researchers are
                                    contributing to this publication.
                                </span>

                            </div>


                            <div className="author-toggle">

                                <button
                                    type="button"
                                    className={
                                        hasCoAuthors
                                            ? "toggle-option active"
                                            : "toggle-option"
                                    }
                                    onClick={() =>
                                        setHasCoAuthors(true)
                                    }
                                >
                                    <span className="toggle-check">
                                        ✓
                                    </span>
                                    Yes
                                </button>


                                <button
                                    type="button"
                                    className={
                                        !hasCoAuthors
                                            ? "toggle-option active"
                                            : "toggle-option"
                                    }
                                    onClick={() => {

                                        setHasCoAuthors(false);
                                        setCoAuthorCount(0);
                                        setCoAuthors([]);

                                    }}
                                >
                                    No
                                </button>

                            </div>

                        </div>


                        {hasCoAuthors && (

                            <div className="coauthor-content">

                                <div className="coauthor-count-row">

                                    <div>

                                        <label>
                                            Number of Co-authors
                                            <span className="required-star">
                                                *
                                            </span>
                                        </label>

                                        <p>
                                            You can add up to 10
                                            co-authors.
                                        </p>

                                    </div>


                                    <input
                                        className="coauthor-count-input"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={coAuthorCount}
                                        onChange={(e) => {

                                            const count = Math.min(
                                                10,
                                                Math.max(
                                                    0,
                                                    Number(e.target.value)
                                                )
                                            );

                                            setCoAuthorCount(count);

                                            setCoAuthors(
                                                Array.from(
                                                    { length: count },
                                                    (_, i) =>
                                                        coAuthors[i] || {
                                                            name: "",
                                                            affiliation: ""
                                                        }
                                                )
                                            );

                                        }}
                                        required
                                    />

                                </div>


                                {coAuthors.length > 0 && (

                                    <div className="coauthor-list">

                                        {coAuthors.map(
                                            (coAuthor, index) => (

                                                <div
                                                    key={index}
                                                    className="coauthor-card"
                                                >

                                                    <div className="coauthor-card-header">

                                                        <div className="coauthor-number">
                                                            {String(
                                                                index + 1
                                                            ).padStart(2, "0")}
                                                        </div>

                                                        <div>

                                                            <h4>
                                                                Co-author{" "}
                                                                {index + 1}
                                                            </h4>

                                                            <span>
                                                                Researcher
                                                                details
                                                            </span>

                                                        </div>

                                                    </div>


                                                    <div className="two-column-fields">

                                                        <div className="form-field">

                                                            <label>
                                                                Name
                                                            </label>

                                                            <input
                                                                type="text"
                                                                placeholder="Enter co-author name"
                                                                value={
                                                                    coAuthor.name
                                                                }
                                                                onChange={(e) =>
                                                                    handleCoAuthorChange(
                                                                        index,
                                                                        "name",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                required
                                                            />

                                                        </div>


                                                        <div className="form-field">

                                                            <label>
                                                                Affiliation
                                                            </label>

                                                            <select
                                                                value={
                                                                    coAuthor.affiliation
                                                                }
                                                                onChange={(e) =>
                                                                    handleCoAuthorChange(
                                                                        index,
                                                                        "affiliation",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                required
                                                            >

                                                                <option value="">
                                                                    Select affiliation
                                                                </option>

                                                                <option value="SVECW">
                                                                    SVECW
                                                                </option>

                                                                <option value="BVRITN">
                                                                    BVRITN
                                                                </option>

                                                                <option value="BVRITH">
                                                                    BVRITH
                                                                </option>

                                                                <option value="VIT">
                                                                    VIT
                                                                </option>

                                                                <option value="Other">
                                                                    Other
                                                                </option>

                                                            </select>

                                                        </div>

                                                    </div>


                                                    {coAuthor.affiliation ===
                                                        "Other" && (

                                                        <div className="form-field">

                                                            <label>
                                                                College /
                                                                Institution Name
                                                            </label>

                                                            <input
                                                                type="text"
                                                                placeholder="Enter college or institution name"
                                                                value={
                                                                    coAuthor.otherAffiliation ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleCoAuthorChange(
                                                                        index,
                                                                        "otherAffiliation",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                required
                                                            />

                                                        </div>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        FINAL REVIEW
                    ================================================= */}

                    <div className="review-card">

                        <div className="review-icon">
                            ✓
                        </div>

                        <div className="review-content">

                            <strong>
                                Ready to submit?
                            </strong>

                            <p>
                                Please verify your paper title, publication
                                type, target, abstract, and co-author details
                                before sending the request to the HoD.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        SUBMIT
                    ================================================= */}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >

                        {isSubmitting ? (
                            <>
                                <span className="submit-spinner"></span>
                                Submitting request...
                            </>
                        ) : (
                            <>
                                <span>
                                    Submit UID Request
                                </span>

                                <span className="submit-arrow">
                                    →
                                </span>
                            </>
                        )}

                    </button>


                    <div className="form-footer">
                        Your request will be reviewed by the HoD before
                        a UID is assigned.
                    </div>

                </form>

            </div>

        </div>
    );
}
