import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
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

    // Calculate profile completion percentage
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

    // Handle file click for viewing documents
    const handleFileClick = (e, url, type) => {
        e.preventDefault();
        if (type === 'pdf') {
            window.open(url, '_blank');
        } else {
            // Handle image view
            const image = new Image();
            image.src = url;
            const w = window.open('');
            w.document.write(image.outerHTML);
        }
    };

    // Handle file download
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

        if (studentId) {
            fetchStudentData();
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
                            <div className="card mb-3">
                                <div className="card-body text-center p-5">
                                    {/* Logo Section */}
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

                                    {/* Profile Section */}
                                    <div className="profile-section p-3 bg-white rounded-4 shadow-sm mb-4">
                                        <div className="row g-3 align-items-center">
                                            {/* Profile Image & Details Column */}
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
                                                        <p className="text-muted mb-1 small text-nowrap text-start">
                                                            <i className="bi bi-envelope-fill me-2"></i>
                                                            {email}
                                                        </p>
                                                        <p className="text-muted mb-1 small text-nowrap text-start">
                                                            <i className="bi bi-telephone-fill me-2"></i>
                                                            {studentData?.phone}
                                                        </p>
                                                        <p className="text-muted mb-1 small text-nowrap text-start">
                                                            <i className="bi bi-calendar-date me-2"></i>
                                                            {studentData?.joiningDate && new Date(studentData.joiningDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Documents and Social Links */}
                                            <div className="col-md-8">
                                                <div className="row">
                                                    {/* Documents Column */}
                                                    <div className="col-md-6">
                                                        <div className="documents-section p-2 rounded-3">
                                                            <h6 className="mb-2 fw-bold">
                                                                <i className="bi bi-file-earmark-text me-2 text-secondary"></i>
                                                                Documents
                                                            </h6>
                                                            <div className="row g-2 mt-2">
                                                                {/* Resume */}
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

                                                                {/* Aadhaar Card */}
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

                                                                {/* PAN Card */}
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

                                                        {/* Bank Details Button */}
                                                        <button
                                                            className="btn btn-sm btn-outline-primary mt-3 w-100"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#bankDetailsModal"
                                                        >
                                                            <i className="bi bi-bank me-2"></i>
                                                            View Bank Details
                                                        </button>
                                                    </div>

                                                    {/* Social Links Column */}
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

                                    {/* Profile Completion */}
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bank Details Modal */}
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
                                {/* Bank Name */}
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

                                {/* Account Holder */}
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

                                {/* Account Number */}
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

                                {/* IFSC Code */}
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

                                {/* Account Type */}
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

                                {/* UPI ID */}
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

                                {/* Payment App */}
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

                                {/* QR Code */}
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

            {/* Styles */}
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
            `}</style>
        </div>
    );
};

export default StudentProfile;