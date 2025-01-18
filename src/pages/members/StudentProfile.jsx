import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const StudentProfile = () => {
    const location = useLocation();
    const studentId = location.state?.studentId;
    const [studentData, setStudentData] = useState(null);
    const [studentName, setStudentName] = useState('');
    const [email, setEmail] = useState('');
    const [image, setImage] = useState('');
    const [aadhaarCard, setAadhaarCard] = useState('');
    const [resume, setResume] = useState('');
    const [panCard, setPanCard] = useState('');
    const [studentForms, setStudentForms] = useState([]);
    const [loadingStatus, setLoadingStatus] = useState(null);

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getFormTypeName = (formType) => {
        const formTypes = {
            form1: 'Admission Form',
            form2: 'Scholarship Form',
            form3: 'Leave Application',
            form4: 'Hostel Application',
            form5: 'Library Card Request',
            form6: 'ID Card Request',
            form7: 'Exam Registration',
            form8: 'Club Registration',
            form9: 'Certificate Request'
        };
        return formTypes[formType] || formType;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-success';
            case 'rejected':
                return 'bg-danger';
            default:
                return 'bg-warning';
        }
    };

    const handleStatusUpdate = async (formId, newStatus) => {
        try {
            setLoadingStatus(formId);
            const response = await axios.patch(
                `${import.meta.env.VITE_BASE_URL}api/students-forms/${formId}`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.success) {
                setStudentForms(prevForms =>
                    prevForms.map(form =>
                        form._id === formId ? { ...form, status: newStatus } : form
                    )
                );

                toast.success(`Form status updated to ${newStatus}`, {
                    style: {
                        backgroundColor: "#0d6efd",
                        color: "white",
                    },
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            }
        } catch (error) {
            console.error('Error updating form status:', error);
            toast.error(error.response?.data?.message || 'Error updating form status', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setLoadingStatus(null);
        }
    };

    const handleDeleteForm = async (formId) => {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}api/students-forms/${formId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                setStudentForms(prevForms => prevForms.filter(form => form._id !== formId));
                toast.success("Form deleted successfully!", {
                    style: {
                        backgroundColor: "#0d6efd",
                        color: "white",
                    },
                });
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                alert('Failed to delete form');
            }
        } catch (error) {
            console.error('Error deleting form:', error);
            alert(error.response?.data?.message || 'Error deleting form');
        }
    };

    const handleFormUpdate = async (formId, updatedData) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}api/students-forms/${formId}`,
                updatedData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                setStudentForms(prevForms =>
                    prevForms.map(form =>
                        form._id === formId ? { ...form, ...updatedData } : form
                    )
                );
                toast.success("Form updated successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            }
        } catch (error) {
            console.error('Error updating form:', error);
            toast.error(error.response?.data?.message || 'Error updating form', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const calculateProfileCompletion = () => {
        if (!studentData) return 0;

        const fields = [
            studentData.studentName,
            studentData.emailid,
            studentData.phone,
            studentData.studentImage,
            studentData.resume,
            studentData.aadhaarCard,
            studentData.bankDetails?.accountNumber,
            studentData.bankDetails?.ifscCode,
            studentData.bankDetails?.bankName,
            studentData.bankDetails?.accountHolderName,
            studentData.bankDetails?.upiId,
            studentData.bankDetails?.qrCode,
            studentData.socialLinks?.linkedin,
            studentData.socialLinks?.github,
        ];

        const filledFields = fields.filter(field => field && field !== 'default.jpeg').length;
        return Math.round((filledFields / fields.length) * 100);
    };

    const handleFileClick = (e, url, type) => {
        e.preventDefault();
        if (type === 'pdf') {
            window.open(url, '_blank');
        } else {
            const image = new Image();
            image.src = url;
            const w = window.open('');
            w.document.write(image.outerHTML);
        }
    };

    const handleDownload = async (fileUrl, fileName) => {
        try {
            const response = await axios.get(fileUrl, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/students/${studentId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const student = await response.json();
                setStudentData(student);
                setStudentName(student.studentName);
                setEmail(student.emailid);
                setImage(student.studentImage);
                setAadhaarCard(student.aadhaarCard);
                setResume(student.resume);
                setPanCard(student.panCard);
            } catch (error) {
                console.error('Error fetching student data:', error);
            }
        };

        const fetchStudentForms = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}api/students-forms/student/${studentId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                setStudentForms(response.data.data);
            } catch (error) {
                console.error('Error fetching student forms:', error);
            }
        };

        if (studentId) {
            fetchStudentData();
            fetchStudentForms();
        }
    }, [studentId]);

    return (
        <div id="mytask-layout">
            <Sidebar />
            <div className="main px-lg-4 px-md-4">
                <Header />
                <div className="body d-flex py-lg-3 py-md-2">
                    <div className="container-xxl">
                        <div className="col-12">
                            <div className=" mb-3">
                                <div className="text-center">
                                    <div style={{ height: "10rem" }}>
                                        <img
                                            src="Images/IndiaEducatesLogo.png"
                                            className="img-fluid"
                                            alt="No Data"
                                            style={{
                                                height: window.innerWidth <= 768 ? "5rem" : "8rem",
                                                maxHeight: "100%",
                                                width: "auto"
                                            }}
                                        />
                                    </div>

                                    <div className="profile-section p-3 bg-white rounded-4 shadow-sm mb-4">
                                        <div className="row g-3 align-items-center">
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="profile-image-container me-3">
                                                        <img
                                                            className="avatar rounded-circle border border-2 border-primary p-1"
                                                            src={`${import.meta.env.VITE_BASE_URL}${image?.replace('uploads/', '')}`}
                                                            alt="profile"
                                                            style={{
                                                                transition: 'all 0.3s ease-in-out',
                                                                width: '100px',
                                                                height: '100px',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="profile-details">
                                                        <h5 className="mb-1 fw-bold text-primary text-start">{studentName}</h5>
                                                        <p className="text-muted mb-1 small text-nowrap text-start" title={email}>
                                                            <i className="bi bi-envelope-fill me-2"></i>
                                                            {email.length > 20 ? `${email.substring(0, 15)}...` : email}
                                                        </p>
                                                        <p className="text-muted mb-1 small text-nowrap text-start">
                                                            <i className="bi bi-telephone-fill me-2"></i>
                                                            {studentData?.phone}
                                                        </p>
                                                        <p className="text-muted mb-1 small text-nowrap text-start">
                                                            <i className="bi bi-calendar-date me-2"></i>
                                                            {studentData?.joiningDate && new Date(studentData.joiningDate).toLocaleDateString()}
                                                        </p>
                                                        {studentData?.course && (
                                                            <p className="text-muted mb-1 small text-nowrap text-start">
                                                                <i className="bi bi-book-fill me-2"></i>
                                                                {studentData.course}
                                                            </p>
                                                        )}
                                                        {studentData?.batch && (
                                                            <p className="text-muted mb-1 small text-nowrap text-start">
                                                                <i className="bi bi-people-fill me-2"></i>
                                                                {studentData.batch}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-8">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="documents-section p-2 rounded-3">
                                                            <h6 className="mb-2 fw-bold">
                                                                <i className="bi bi-file-earmark-text me-2 text-secondary"></i>
                                                                Documents
                                                            </h6>
                                                            <div className="row g-2 mt-2">
                                                                <div className="col-12">
                                                                    <div className="document-card p-2 border rounded-3 bg-white">
                                                                        <div className="d-flex align-items-center justify-content-between">
                                                                            <strong className="small">
                                                                                <i className="bi bi-file-person text-secondary me-1"></i>
                                                                                Resume
                                                                            </strong>
                                                                            {resume ? (
                                                                                <div className="d-flex gap-1">
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-primary py-0 px-1"
                                                                                        onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${resume}`, 'pdf')}
                                                                                    >
                                                                                        <i className="bi bi-eye small"></i>
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-success py-0 px-1"
                                                                                        onClick={() => handleDownload(`${import.meta.env.VITE_BASE_URL}${resume}`, `${studentName}_resume.pdf`)}
                                                                                    >
                                                                                        <i className="bi bi-download small"></i>
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-danger small">
                                                                                    <i className="bi bi-x-circle"></i>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12">
                                                                    <div className="document-card p-2 border rounded-3 bg-white">
                                                                        <div className="d-flex align-items-center justify-content-between">
                                                                            <strong className="small">
                                                                                <i className="bi bi-card-text text-secondary me-1"></i>
                                                                                Aadhaar Card
                                                                            </strong>
                                                                            {aadhaarCard ? (
                                                                                <div className="d-flex gap-1">
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-primary py-0 px-1"
                                                                                        onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${aadhaarCard}`, aadhaarCard.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')}
                                                                                    >
                                                                                        <i className="bi bi-eye small"></i>
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-success py-0 px-1"
                                                                                        onClick={() => handleDownload(`${import.meta.env.VITE_BASE_URL}${aadhaarCard}`, `${studentName}_aadhaar${aadhaarCard.substr(aadhaarCard.lastIndexOf('.'))}`)}
                                                                                    >
                                                                                        <i className="bi bi-download small"></i>
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-danger small">
                                                                                    <i className="bi bi-x-circle"></i>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="col-12">
                                                                    <div className="document-card p-2 border rounded-3 bg-white">
                                                                        <div className="d-flex align-items-center justify-content-between">
                                                                            <strong className="small">
                                                                                <i className="bi bi-card-heading text-secondary me-1"></i>
                                                                                PAN Card
                                                                            </strong>
                                                                            {panCard ? (
                                                                                <div className="d-flex gap-1">
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-primary py-0 px-1"
                                                                                        onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${panCard}`, 'pdf')}
                                                                                    >
                                                                                        <i className="bi bi-eye small"></i>
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-success py-0 px-1"
                                                                                        onClick={() => handleDownload(`${import.meta.env.VITE_BASE_URL}${panCard}`, `${studentName}_pan.pdf`)}
                                                                                    >
                                                                                        <i className="bi bi-download small"></i>
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-danger small">
                                                                                    <i className="bi bi-x-circle"></i>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            className="btn btn-sm btn-outline-primary mt-3 w-100"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#bankDetailsModal"
                                                        >
                                                            <i className="bi bi-bank me-2"></i>
                                                            View Bank Details
                                                        </button>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="social-links-section p-2">
                                                            <h6 className="mb-2 fw-bold">
                                                                <i className="bi bi-share me-2 text-secondary"></i>
                                                                Social Links
                                                            </h6>
                                                            <div className="row g-2 mt-2">
                                                                {studentData?.socialLinks?.linkedin && (
                                                                    <div className="col-2">
                                                                        <a href={studentData.socialLinks.linkedin}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-outline-primary btn-sm">
                                                                            <i className="bi bi-linkedin"></i>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {studentData?.socialLinks?.github && (
                                                                    <div className="col-2">
                                                                        <a href={studentData.socialLinks.github}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-outline-dark btn-sm">
                                                                            <i className="bi bi-github"></i>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {studentData?.socialLinks?.instagram && (
                                                                    <div className="col-2">
                                                                        <a href={studentData.socialLinks.instagram}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-outline-danger btn-sm">
                                                                            <i className="bi bi-instagram"></i>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {studentData?.socialLinks?.youtube && (
                                                                    <div className="col-2">
                                                                        <a href={studentData.socialLinks.youtube}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-outline-danger btn-sm">
                                                                            <i className="bi bi-youtube"></i>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {studentData?.socialLinks?.facebook && (
                                                                    <div className="col-2">
                                                                        <a href={studentData.socialLinks.facebook}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-outline-primary btn-sm">
                                                                            <i className="bi bi-facebook"></i>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {studentData?.socialLinks?.website && (
                                                                    <div className="col-2">
                                                                        <a href={studentData.socialLinks.website}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-outline-info btn-sm">
                                                                            <i className="bi bi-globe"></i>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="profile-completion mt-3 px-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="mb-0">Profile Completion</h6>
                                            <span className="text-primary fw-bold">{calculateProfileCompletion()}%</span>
                                        </div>
                                        <div className="progress" style={{ height: "10px" }}>
                                            <div
                                                className="progress-bar progress-bar-striped progress-bar-animated"
                                                role="progressbar"
                                                style={{
                                                    width: `${calculateProfileCompletion()}%`,
                                                    backgroundColor: calculateProfileCompletion() < 50 ? '#dc3545' :
                                                        calculateProfileCompletion() < 80 ? '#ffc107' : '#198754'
                                                }}
                                                aria-valuenow={calculateProfileCompletion()}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="student-forms mt-4">
                                        <h4 className="mb-3">{studentName}'s Forms</h4>
                                        {studentForms.length > 0 ? (
                                            <div className="">
                                                <table className="table table-hover align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="text-center" style={{ width: '60px' }}>Sr.No.</th>
                                                            <th>Form Type</th>
                                                            <th className="text-start">Student Details</th>
                                                            <th className="text-start">Academic Info</th>
                                                            <th className="text-start">Submission Date</th>
                                                            <th className="text-center">Status</th>
                                                            <th className="text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {studentForms.map((form, index) => (
                                                            <tr key={form._id} className="align-middle">
                                                                <td className="text-center fw-bold">{index + 1}.</td>
                                                                <td>
                                                                    <div className="d-flex align-items-center">

                                                                        <span className="fw-bold">{getFormTypeName(form.formType)}</span>

                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column text-start">
                                                                        <span className="fw-bold">{form.fullName}</span>
                                                                        <small className="text-muted">
                                                                            <i className="bi bi-envelope-fill me-1"></i>
                                                                            {form.email}
                                                                        </small>
                                                                        {form.phoneNumber && (
                                                                            <small className="text-muted">
                                                                                <i className="bi bi-telephone-fill me-1"></i>
                                                                                {form.phoneNumber}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column text-start">
                                                                        <small>
                                                                            <i className="bi bi-card-text me-1"></i>
                                                                            ID: {form.studentId}
                                                                        </small>
                                                                        {form.course && (
                                                                            <small>
                                                                                <i className="bi bi-book me-1"></i>
                                                                                {form.course}
                                                                            </small>
                                                                        )}
                                                                        {form.semester && (
                                                                            <small>
                                                                                <i className="bi bi-calendar3 me-1"></i>
                                                                                Sem: {form.semester}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column text-start">
                                                                        <small className="fw-bold">
                                                                            <i className="bi bi-clock-history me-1"></i>
                                                                            {formatDate(form.submittedAt)}
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td className="text-center">
                                                                    <div className="dropdown">
                                                                        <button
                                                                            className={`btn btn-sm dropdown-toggle text-white ${getStatusBadgeClass(form.status)}`}
                                                                            type="button"
                                                                            data-bs-toggle="dropdown"
                                                                            disabled={loadingStatus === form._id}
                                                                        >
                                                                            {loadingStatus === form._id ? (
                                                                                <>
                                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                                    Updating...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <i className={`bi ${form.status === 'approved' ? 'bi-check-circle' :
                                                                                        form.status === 'rejected' ? 'bi-x-circle' :
                                                                                            'bi-hourglass-split'} me-1`}></i>
                                                                                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                        <ul className="dropdown-menu">
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item"
                                                                                    onClick={() => handleStatusUpdate(form._id, 'pending')}
                                                                                    disabled={loadingStatus === form._id}
                                                                                >
                                                                                    <i className="bi bi-hourglass-split me-2"></i>
                                                                                    Pending
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item"
                                                                                    onClick={() => handleStatusUpdate(form._id, 'approved')}
                                                                                    disabled={loadingStatus === form._id}
                                                                                >
                                                                                    <i className="bi bi-check-circle me-2"></i>
                                                                                    Approve
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item"
                                                                                    onClick={() => handleStatusUpdate(form._id, 'rejected')}
                                                                                    disabled={loadingStatus === form._id}
                                                                                >
                                                                                    <i className="bi bi-x-circle me-2"></i>
                                                                                    Reject
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target={`#formModal-${form._id}`}
                                                                        >
                                                                            <i className="bi bi-eye small"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-success"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target={`#editFormModal-${form._id}`}
                                                                        >
                                                                            <i className="icofont-edit text-success" />

                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                const modal = document.getElementById('deleteFormModal');
                                                                                modal.setAttribute('data-form-id', form._id);
                                                                                new bootstrap.Modal(modal).show();
                                                                            }}
                                                                        >
                                                                            <i className="icofont-ui-delete text-danger" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5">
                                                <i className="bi bi-folder-x display-1 text-muted"></i>
                                                <p className="mt-3 text-muted">No forms submitted yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="bankDetailsModal" tabIndex="-1" aria-hidden="true" style={{ zIndex: 9998 }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content" style={{ marginLeft: "100px" }}>
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">
                                {studentName}'s Bank Details
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-bank fs-4 text-primary me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Bank Name</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{studentData?.bankDetails?.bankName || 'Not provided'}</span>
                                                {studentData?.bankDetails?.bankName && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(studentData.bankDetails?.bankName || '');
                                                        }}
                                                        title="Copy Bank Name"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-person fs-4 text-success me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Account Holder</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{studentData?.bankDetails?.accountHolderName || 'Not provided'}</span>
                                                {studentData?.bankDetails?.accountHolderName && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(studentData.bankDetails?.accountHolderName || '');
                                                        }}
                                                        title="Copy Account Holder Name"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-credit-card fs-4 text-info me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Account Number</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{studentData?.bankDetails?.accountNumber || 'Not provided'}</span>
                                                {studentData?.bankDetails?.accountNumber && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(studentData.bankDetails?.accountNumber || '');
                                                        }}
                                                        title="Copy Account Number"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-building fs-4 text-warning me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">IFSC Code</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{studentData?.bankDetails?.ifscCode || 'Not provided'}</span>
                                                {studentData?.bankDetails?.ifscCode && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(studentData.bankDetails?.ifscCode || '');
                                                        }}
                                                        title="Copy IFSC Code"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-wallet2 fs-4 text-danger me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Account Type</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{studentData?.bankDetails?.accountType || 'Not provided'}</span>
                                                {studentData?.bankDetails?.accountType && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(studentData.bankDetails?.accountType || '');
                                                        }}
                                                        title="Copy Account Type"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-phone fs-4 text-success me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">UPI ID</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{studentData?.bankDetails?.upiId || 'Not provided'}</span>
                                                {studentData?.bankDetails?.upiId && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(studentData.bankDetails?.upiId || '');
                                                        }}
                                                        title="Copy UPI ID"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-app fs-4 text-primary me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Payment App</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{studentData?.bankDetails?.paymentApp || 'Not provided'}</span>
                                                {studentData?.bankDetails?.paymentApp && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(studentData.bankDetails?.paymentApp || '');
                                                        }}
                                                        title="Copy Payment App"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-qr-code fs-4 text-dark me-2"></i>
                                        <div>
                                            <div className="fw-bold">QR Code</div>
                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                {studentData?.bankDetails?.qrCode && (
                                                    <>
                                                        <img
                                                            src={`${import.meta.env.VITE_BASE_URL}${studentData.bankDetails.qrCode}`}
                                                            alt="QR Code"
                                                            style={{ width: '100px', height: '100px', objectFit: 'contain', cursor: 'pointer' }}
                                                            onClick={(e) => handleFileClick(
                                                                e,
                                                                `${import.meta.env.VITE_BASE_URL}${studentData.bankDetails.qrCode}`,
                                                                'image'
                                                            )}
                                                        />
                                                        <i
                                                            className="bi bi-download fs-4 text-primary"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleDownload(
                                                                `${import.meta.env.VITE_BASE_URL}${studentData.bankDetails.qrCode}`,
                                                                `qr_code${studentData.bankDetails.qrCode.substring(studentData.bankDetails.qrCode.lastIndexOf('.'))}`
                                                            )}
                                                            title="Download QR Code"
                                                        ></i>
                                                    </>
                                                )}
                                                {!studentData?.bankDetails?.qrCode && (
                                                    <span>Not provided</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-section {
                    transition: all 0.3s ease;
                    background: linear-gradient(145deg, #ffffff, #f5f7fa);
                    position: relative;
                    min-height: 160px;
                }
                
                .profile-section:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
                }
                
                .document-card {
                    transition: all 0.3s ease;
                }
                
                .document-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                
                .btn {
                    transition: all 0.3s ease;
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                }
                
                .cursor-pointer {
                    cursor: pointer;
                }
                
                .bank-info-item {
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: start;
                }
                
                .bank-info-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }

                .table-hover tbody tr:hover {
                    background-color: rgba(0, 123, 255, 0.05) !important;
                }

                .table-responsive {
                    border-radius: 0.5rem;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                }

                .table > :not(caption) > * > * {
                    padding: 1rem 0.75rem;
                }

                .btn-group .btn {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.875rem;
                }

                .dropdown-menu {
                    min-width: 8rem;
                    padding: 0.5rem 0;
                }

                .dropdown-item {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                }

                .dropdown-item:hover {
                    background-color: rgba(0, 123, 255, 0.1);
                }

                .bi {
                    font-size: 0.9rem;
                }
            `}</style>

            {studentForms.map((form) => (
                <div
                    key={form._id}
                    className="modal fade"
                    id={`formModal-${form._id}`}
                    tabIndex="-1"
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content" style={{ marginLeft: "10rem" }}>
                            <div className="modal-header">
                                <h5 className="modal-title">{getFormTypeName(form.formType)} Details</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                {form.profileImage && (
                                    <div className="text-center mb-4">
                                        <img
                                            src={`${import.meta.env.VITE_BASE_URL}${form.profileImage.replace('uploads\\', '').replace('\\', '/')}`}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                <div className="card mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Personal Information</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><strong>Full Name:</strong> {form.fullName}</p>
                                                <p><strong>Date of Birth:</strong> {formatDate(form.dateOfBirth)}</p>
                                                <p><strong>Gender:</strong> {form.gender}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Blood Group:</strong> {form.bloodGroup}</p>
                                                <p><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(form.status)}`}>{form.status}</span></p>
                                                <p><strong>Submitted:</strong> {formatDate(form.submittedAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Contact Information</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><strong>Email:</strong> {form.email}</p>
                                                <p><strong>Phone Number:</strong> {form.phoneNumber}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Address:</strong> {form.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Academic Information</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><strong>Student ID:</strong> {form.studentId}</p>
                                                <p><strong>Course:</strong> {form.course}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Semester:</strong> {form.semester}</p>
                                                <p><strong>Previous School:</strong> {form.previousSchool}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">Emergency Contact</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><strong>Parent/Guardian Name:</strong> {form.parentName}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Parent/Guardian Contact:</strong> {form.parentContact}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">Form Specific Details</h6>
                                    </div>
                                    <div className="card-body">
                                        {form.formType === 'form1' && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <p><strong>Previous GPA:</strong> {form.previousGPA}</p>
                                                </div>
                                                <div className="col-md-6">
                                                    <p><strong>Desired Major:</strong> {form.desiredMajor}</p>
                                                </div>
                                            </div>
                                        )}

                                        {form.formType === 'form2' && (
                                            <div>
                                                <p><strong>Family Income:</strong> {form.familyIncome}</p>
                                                <p><strong>Scholarship Type:</strong> {form.scholarshipType}</p>
                                                <p><strong>Achievements:</strong> {form.achievements}</p>
                                            </div>
                                        )}

                                        {form.formType === 'form3' && (
                                            <div>
                                                <p><strong>Leave Period:</strong> {formatDate(form.leaveStart)} to {formatDate(form.leaveEnd)}</p>
                                                <p><strong>Leave Type:</strong> {form.leaveType}</p>
                                                <p><strong>Reason:</strong> {form.leaveReason}</p>
                                            </div>
                                        )}

                                        {form.formType === 'form4' && (
                                            <div>
                                                <p><strong>Room Type:</strong> {form.roomType}</p>
                                                <p><strong>Duration (months):</strong> {form.duration}</p>
                                                <p><strong>Meal Plan:</strong> {form.mealPlan}</p>
                                            </div>
                                        )}

                                        {form.formType === 'form5' && (
                                            <div>
                                                <p><strong>Card Type:</strong> {form.cardType}</p>
                                                <p><strong>Department:</strong> {form.department}</p>
                                            </div>
                                        )}

                                        {form.formType === 'form6' && (
                                            <div>
                                                <p><strong>ID Type:</strong> {form.idType}</p>
                                                {form.replacementReason && (
                                                    <p><strong>Replacement Reason:</strong> {form.replacementReason}</p>
                                                )}
                                            </div>
                                        )}

                                        {form.formType === 'form7' && (
                                            <div>
                                                <p><strong>Exam Type:</strong> {form.examType}</p>
                                                <p><strong>Number of Subjects:</strong> {form.subjectCount}</p>
                                                {form.specialRequirements && (
                                                    <p><strong>Special Requirements:</strong> {form.specialRequirements}</p>
                                                )}
                                            </div>
                                        )}

                                        {form.formType === 'form8' && (
                                            <div>
                                                <p><strong>Club Name:</strong> {form.clubName}</p>
                                                <p><strong>Position:</strong> {form.position}</p>
                                                {form.experience && (
                                                    <p><strong>Previous Experience:</strong> {form.experience}</p>
                                                )}
                                            </div>
                                        )}

                                        {form.formType === 'form9' && (
                                            <div>
                                                <p><strong>Certificate Type:</strong> {form.certificateType}</p>
                                                <p><strong>Number of Copies:</strong> {form.copies}</p>
                                                <p><strong>Purpose:</strong> {form.purpose}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {studentForms.map((form) => (
                <div
                    key={`edit-${form._id}`}
                    className="modal fade"
                    id={`editFormModal-${form._id}`}
                    tabIndex="-1"
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content" style={{ marginLeft: "10rem" }}>
                            <div className="modal-header">
                                <h5 className="modal-title">Edit {getFormTypeName(form.formType)}</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const updatedData = Object.fromEntries(formData.entries());
                                    handleFormUpdate(form._id, updatedData);
                                    bootstrap.Modal.getInstance(document.getElementById(`editFormModal-${form._id}`)).hide();
                                }}>
                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h6 className="mb-0">Personal Information</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Full Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="fullName"
                                                        defaultValue={form.fullName}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Date of Birth</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        name="dateOfBirth"
                                                        defaultValue={form.dateOfBirth?.split('T')[0]}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Gender</label>
                                                    <select
                                                        className="form-select"
                                                        name="gender"
                                                        defaultValue={form.gender}
                                                        required
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Blood Group</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="bloodGroup"
                                                        defaultValue={form.bloodGroup}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h6 className="mb-0">Contact Information</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="email"
                                                        defaultValue={form.email}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        name="phoneNumber"
                                                        defaultValue={form.phoneNumber}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">Address</label>
                                                    <textarea
                                                        className="form-control"
                                                        name="address"
                                                        defaultValue={form.address}
                                                        required
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h6 className="mb-0">Academic Information</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Student ID</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="studentId"
                                                        defaultValue={form.studentId}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Previous School</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="previousSchool"
                                                        defaultValue={form.previousSchool}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Course</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="course"
                                                        defaultValue={form.course}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Semester</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="semester"
                                                        defaultValue={form.semester}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h6 className="mb-0">Emergency Contact</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Parent/Guardian Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="parentName"
                                                        defaultValue={form.parentName}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Parent/Guardian Contact</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="parentContact"
                                                        defaultValue={form.parentContact}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {form.formType === 'form1' && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">Admission Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Previous GPA</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="form-control"
                                                            name="previousGPA"
                                                            defaultValue={form.previousGPA}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Desired Major</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="desiredMajor"
                                                            defaultValue={form.desiredMajor}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {form.formType === 'form2' && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">Scholarship Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Family Income</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="familyIncome"
                                                            defaultValue={form.familyIncome}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Scholarship Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="scholarshipType"
                                                            defaultValue={form.scholarshipType}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Achievements</label>
                                                        <textarea
                                                            className="form-control"
                                                            name="achievements"
                                                            defaultValue={form.achievements}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {form.formType === 'form3' && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">Leave Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Leave Start Date</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            name="leaveStart"
                                                            defaultValue={form.leaveStart?.split('T')[0]}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Leave End Date</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            name="leaveEnd"
                                                            defaultValue={form.leaveEnd?.split('T')[0]}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Leave Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="leaveType"
                                                            defaultValue={form.leaveType}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Leave Reason</label>
                                                        <textarea
                                                            className="form-control"
                                                            name="leaveReason"
                                                            defaultValue={form.leaveReason}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {form.formType === 'form4' && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">Hostel Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Room Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="roomType"
                                                            defaultValue={form.roomType}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Duration (months)</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="duration"
                                                            defaultValue={form.duration}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Meal Plan</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="mealPlan"
                                                            defaultValue={form.mealPlan}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {form.formType === 'form5' && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">Library Card Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Card Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="cardType"
                                                            defaultValue={form.cardType}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Department</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="department"
                                                            defaultValue={form.department}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {form.formType === 'form6' && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">ID Card Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">ID Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="idType"
                                                            defaultValue={form.idType}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Replacement Reason</label>
                                                        <textarea
                                                            className="form-control"
                                                            name="replacementReason"
                                                            defaultValue={form.replacementReason}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {form.formType === 'form7' && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">Exam Registration Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Exam Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="examType"
                                                            defaultValue={form.examType}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Number of Subjects</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="subjectCount"
                                                            defaultValue={form.subjectCount}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Special Requirements</label>
                                                        <textarea
                                                            className="form-control"
                                                            name="specialRequirements"
                                                            defaultValue={form.specialRequirements}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {form.formType === 'form8' && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">Club Registration Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Club Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="clubName"
                                                            defaultValue={form.clubName}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Position</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="position"
                                                            defaultValue={form.position}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Experience</label>
                                                        <textarea
                                                            className="form-control"
                                                            name="experience"
                                                            defaultValue={form.experience}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {form.formType === 'form9' && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">Certificate Request Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Certificate Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="certificateType"
                                                            defaultValue={form.certificateType}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Number of Copies</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="copies"
                                                            defaultValue={form.copies}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Purpose</label>
                                                        <textarea
                                                            className="form-control"
                                                            name="purpose"
                                                            defaultValue={form.purpose}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-end mt-3">
                                        <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div
                className="modal fade"
                id="deleteFormModal"
                tabIndex={-1}
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">
                                Delete Form Permanently?
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body justify-content-center flex-column d-flex">
                            <i className="bi bi-trash text-danger display-2 text-center mt-2"></i>
                            <p className="mt-4 fs-5 text-center">
                                You can only delete this form Permanently
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => {
                                    const modal = document.getElementById('deleteFormModal');
                                    const bsModal = bootstrap.Modal.getInstance(modal);
                                    bsModal.hide();
                                    handleDeleteForm(modal.getAttribute('data-form-id'));
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default StudentProfile;