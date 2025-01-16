import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css"
import { useNavigate } from "react-router-dom";
import FloatingMenu from '../Chats/FloatingMenu'


const Student = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [deletableId, setDeletableId] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    studentName: "",
    studentImage: null,
    resume: null,
    aadhaarCard: null,
    emailid: "",
    password: "",
    phone: "+91 ",
    course: "",
    batch: "",
    description: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    facebook: "",
    github: "",
    website: "",
    other: "",
    // Bank Details
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "",
    upiId: "",
    qrCode: null,
    paymentApp: ""
  });

  // Add this new state for student data
  const [studentData, setStudentData] = useState({
    studentName: "",
    studentId: "",
    joiningDate: "",
    emailid: "",
    password: "",
    phone: "+91 ",
    course: "",
    batch: "",
    description: "",
    // Social Links
    linkedin: "",
    instagram: "",
    youtube: "",
    facebook: "",
    github: "",
    website: "",
    other: "",
    // Bank Details
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "",
    upiId: "",
    paymentApp: ""
  });

  // Add these new state variables
  const [pdfUrl, setPdfUrl] = useState(null);
  const [selectedImageDetails, setSelectedImageDetails] = useState({ url: '', name: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'studentImage' || key === 'resume' || key === 'aadhaarCard' || key === 'qrCode') {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/students`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        // Handle success (e.g., show notification, reset form, etc.)
        fetchStudents(); // Refresh the students list
      } else {
        // Handle error
        console.error('Failed to create student');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add search handling function
  const handleSearch = useCallback((query) => {
    if (!query.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) =>
      student.studentName.toLowerCase().includes(query.toLowerCase()) ||
      student.emailid.toLowerCase().includes(query.toLowerCase()) ||
      student.phone.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students]);

  // Update useEffect to initialize filteredStudents
  useEffect(() => {
    fetchStudents();
    
    // Handle window resize for mobile view
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add another useEffect to update filteredStudents when students change
  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  // Add these handlers for managing student data
  const handleEditClick = (student) => {
    setStudentData({
      ...student,
      // Extract social links
      linkedin: student.socialLinks?.linkedin || "",
      instagram: student.socialLinks?.instagram || "",
      youtube: student.socialLinks?.youtube || "",
      facebook: student.socialLinks?.facebook || "",
      github: student.socialLinks?.github || "",
      website: student.socialLinks?.website || "",
      other: student.socialLinks?.other || "",
      // Extract bank details
      bankName: student.bankDetails?.bankName || "",
      accountHolderName: student.bankDetails?.accountHolderName || "",
      accountNumber: student.bankDetails?.accountNumber || "",
      ifscCode: student.bankDetails?.ifscCode || "",
      accountType: student.bankDetails?.accountType || "",
      upiId: student.bankDetails?.upiId || "",
      paymentApp: student.bankDetails?.paymentApp || ""
    });
  };

  const updateChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setStudentData({
        ...studentData,
        [name]: files[0]
      });
    } else {
      setStudentData({
        ...studentData,
        [name]: value
      });
    }
  };

  const updateSubmit = async () => {
    try {
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(studentData).forEach(key => {
        if (key === 'studentImage' || key === 'resume' || key === 'aadhaarCard' || key === 'qrCode') {
          if (studentData[key] instanceof File) {
            formData.append(key, studentData[key]);
          }
        } else {
          formData.append(key, studentData[key]);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/students/${studentData._id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        toast.success('Student updated successfully');
        fetchStudents(); // Refresh the students list
      } else {
        toast.error('Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Error updating student');
    }
  };

  const handleDelete = async () => {
    if (!deletableId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/students/${deletableId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Student deleted successfully');
        fetchStudents(); // Refresh the students list
        // Close the modal
        const modal = document.getElementById('deleteproject');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
      } else {
        toast.error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Error deleting student');
    } finally {
      setDeletableId(null);
    }
  };

  // Add these handler functions
  const handleFileClick = (e, url, type, name) => {
    e.preventDefault();
    if (type === 'pdf') {
      setPdfUrl(url);
    } else {
      setSelectedImageDetails({ url, name });
    }
  };

  const handlePdfModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closePdfViewer();
    }
  };

  const handleImageModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeImageModal();
    }
  };

  const closePdfViewer = () => {
    setPdfUrl(null);
  };

  const closeImageModal = () => {
    setSelectedImageDetails({ url: '', name: '' });
  };

  const handleImageClick = (url, name) => {
    setSelectedImageDetails({ url, name });
  };

  // Add download handler
  const handleDownload = async (filePath, fileName) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}${filePath}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };

  // Add document delete handler
  const handleDocumentDelete = async (studentId, documentType) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/students/${studentId}/document/${documentType}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${documentType} deleted successfully`);
        fetchStudents(); // Refresh the students list
      } else {
        toast.error(`Failed to delete ${documentType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${documentType}:`, error);
      toast.error(`Error deleting ${documentType}`);
    }
  };

  // Add this function to handle student click
  const handleStudentClick = (student) => {
    navigate('/student-profile', { state: { studentId: student._id } });
  };

  return (
    <>
    <div id="mytask-layout">
      <Sidebar />
      {/* main body area */}
      <div className="main px-lg-4 px-md-4">
        {/* Body: Header */}
        <Header />
        <>
          {/* Body: Body */}
          <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
              <div className="row clearfix">
                <div className="col-md-12">
                  <div className="card border-0 mb-4 no-bg">
                    <div className="card-header py-3 px-0 d-sm-flex align-items-center  justify-content-between border-bottom">
                      <h3 className=" fw-bold flex-fill mb-0 mt-sm-0">
                        STUDENTS
                      </h3>
                      <button
                        type="button"
                        className="btn btn-dark me-1 mt-1 w-sm-100"
                        data-bs-toggle="modal"
                        data-bs-target="#createemp"
                      >
                        <i className="icofont-plus-circle me-2 fs-6" />
                        Add Student
                      </button>

                    </div>

                    <div className="d-flex justify-content-between mt-3 border-bottom">
                      <div className="d-flex mb-3">
                        {viewMode === 'grid' ? (
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setViewMode('list')}
                            title="Switch to List View"
                          >
                            <i className="bi bi-list-task"></i>
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setViewMode('grid')}
                            title="Switch to Grid View"
                          >
                            <i className="bi bi-grid-3x3-gap-fill"></i>
                          </button>
                        )}
                      </div>
                      <div className="order-0 col-lg-4 col-md-4 col-sm-12 col-12 mb-3 mb-md-0 ">
                        <div className="input-group">
                          <input
                            type="search"
                            className="form-control"
                            aria-label="search"
                            aria-describedby="addon-wrapping"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              handleSearch(e.target.value);
                            }}
                            placeholder="Enter Student Name"
                          />
                          <button
                            type="button"
                            className="input-group-text"
                            id="addon-wrapping"
                            onClick={() => handleSearch(searchQuery)}
                          >
                            <i className="fa fa-search" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row End */}
              {loading ? (
                <div className="custom-loader"></div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center mt-4">
                  <h1 className="text-muted">No students available. Please add a student.</h1>
                </div>
              ) : (viewMode === 'grid' ? (
                <div className="row g-3 row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2 row-deck py-1 pb-4">
                  {filteredStudents.map((student) => {
                    const newDate = new Date(student?.joiningDate);
                    const date = newDate.getDate();
                    const month = newDate.getMonth() + 1; // months are 0-indexed
                    const year = newDate.getFullYear();
                    return (
                      <div className="col" key={student.studentId}>
                        <div className="card teacher-card">
                          <div className="card-body d-flex">

                            <div className="profile-av pe-xl-4 pe-md-2 pe-sm-4 pe-4 text-center w-75">
                              <div className="position-relative d-inline-block">
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${student.studentImage}`}
                                  alt=""
                                  className="avatar xl rounded-circle img-thumbnail shadow-sm"
                                  style={{
                                    transition: 'transform 0.3s ease-in-out',
                                    cursor: 'pointer',
                                    objectFit: 'cover',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(2.5)';
                                    e.target.style.zIndex = '100';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.zIndex = '1';
                                  }}
                                  onClick={() => handleImageClick(
                                    `${import.meta.env.VITE_BASE_URL}${student.studentImage}`,
                                    student.studentName
                                  )}
                                />
                              </div>

                              <div className="about-info mt-3">
                                <div className="followers me-2">
                                </div>
                                <div className="own-video">
                                  <i className="bi bi-telephone-fill text-success fs-6 me-2" />
                                  <span>{student.phone}</span>
                                </div>
                                <p className="rounded-1 d-inline-block fw-bold small-11 mb-1 d-flex justify-content-center">
                                  <i className="bi bi-envelope-at-fill text-primary fs-6 me-1" />
                                  {student.emailid}
                                </p>
                              </div>

                              <div className="mt-2 text-start border-top pt-2">
                                {/* Aadhaar Card Row */}
                                <div className="row border-bottom pb-2 mb-2">
                                  <div className="col-md-6 d-flex align-items-center">
                                    <strong>Aadhaar -</strong>
                                  </div>
                                  <div className="col-md-6">
                                    {student.aadhaarCard ? (
                                      <div className="row align-items-center g-2">
                                        <div className="col-6">
                                          {student.aadhaarCard.toLowerCase().endsWith('.pdf') ? (
                                            <a href="#" onClick={(e) => handleFileClick(
                                              e,
                                              `${import.meta.env.VITE_BASE_URL}${student.aadhaarCard.replace('uploads/', '')}`,
                                              'pdf',
                                              student.studentName
                                            )}>View</a>
                                          ) : (
                                            <img
                                              src={`${import.meta.env.VITE_BASE_URL}${student.aadhaarCard.replace('uploads/', '')}`}
                                              alt=""
                                              className="avatar sm img-thumbnail shadow-sm"
                                              onClick={(e) => handleFileClick(
                                                e,
                                                `${import.meta.env.VITE_BASE_URL}${student.aadhaarCard.replace('uploads/', '')}`,
                                                'image',
                                                student.studentName
                                              )}
                                              style={{ cursor: 'pointer' }}
                                            />
                                          )}
                                        </div>
                                        <div className="col-3 text-center">
                                          <i
                                            className="bi bi-download text-primary"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleDownload(student.aadhaarCard, `${student.studentName}_aadhaar${student.aadhaarCard.substr(student.aadhaarCard.lastIndexOf('.'))}`)}
                                            title="Download Aadhaar Card"
                                          ></i>
                                        </div>
                                        <div className="col-3 text-center">
                                          <i
                                            className="bi bi-trash text-danger"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleDocumentDelete(student._id, 'aadhaarCard')}
                                            title="Delete Aadhaar Card"
                                          ></i>
                                        </div>
                                      </div>
                                    ) : (
                                      <i className="bi bi-x-lg text-danger"></i>
                                    )}
                                  </div>
                                </div>

                                {/* PAN Card Row */}
                                <div className="row border-bottom pb-2 mb-2">
                                  <div className="col-md-6 d-flex align-items-center">
                                    <strong>Pan -</strong>
                                  </div>
                                  <div className="col-md-6">
                                    {student.panCard ? (
                                      <div className="row align-items-center g-2">
                                        <div className="col-6">
                                          {student.panCard.toLowerCase().endsWith('.pdf') ? (
                                            <a href="#" onClick={(e) => handleFileClick(
                                              e,
                                              `${import.meta.env.VITE_BASE_URL}${student.panCard.replace('uploads/', '')}`,
                                              'pdf',
                                              student.studentName
                                            )}>View</a>
                                          ) : (
                                            <img
                                              src={`${import.meta.env.VITE_BASE_URL}${student.panCard.replace('uploads/', '')}`}
                                              alt=""
                                              className="avatar sm img-thumbnail shadow-sm"
                                              onClick={(e) => handleFileClick(
                                                e,
                                                `${import.meta.env.VITE_BASE_URL}${student.panCard.replace('uploads/', '')}`,
                                                'image',
                                                student.studentName
                                              )}
                                              style={{ cursor: 'pointer' }}
                                            />
                                          )}
                                        </div>
                                        <div className="col-3 text-center">
                                          <i
                                            className="bi bi-download text-primary"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleDownload(student.panCard, `${student.studentName}_pan${student.panCard.substr(student.panCard.lastIndexOf('.'))}`)}
                                            title="Download Pan Card"
                                          ></i>
                                        </div>
                                        <div className="col-3 text-center">
                                          <i
                                            className="bi bi-trash text-danger"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleDocumentDelete(student._id, 'panCard')}
                                            title="Delete Pan Card"
                                          ></i>
                                        </div>
                                      </div>
                                    ) : (
                                      <i className="bi bi-x-lg text-danger"></i>
                                    )}
                                  </div>
                                </div>

                                {/* Resume Row */}
                                <div className="row border-bottom pb-2 mb-2">
                                  <div className="col-md-6 d-flex align-items-center">
                                    <strong>Resume -</strong>
                                  </div>
                                  <div className="col-md-6">
                                    {student.resume ? (
                                      <div className="row align-items-center g-2">
                                        <div className="col-6">
                                          {student.resume.toLowerCase().endsWith('.pdf') ? (
                                            <a href="#" onClick={(e) => handleFileClick(
                                              e,
                                              `${import.meta.env.VITE_BASE_URL}${student.resume.replace('uploads/', '')}`,
                                              'pdf',
                                              student.studentName
                                            )}><i className="bi bi-filetype-pdf"></i></a>
                                          ) : (
                                            <img
                                              src={`${import.meta.env.VITE_BASE_URL}${student.resume.replace('uploads/', '')}`}
                                              alt=""
                                              className="avatar sm img-thumbnail shadow-sm"
                                              onClick={(e) => handleFileClick(
                                                e,
                                                `${import.meta.env.VITE_BASE_URL}${student.resume.replace('uploads/', '')}`,
                                                'image',
                                                student.studentName
                                              )}
                                              style={{ cursor: 'pointer' }}
                                            />
                                          )}
                                        </div>
                                        <div className="col-3 text-center">
                                          <i
                                            className="bi bi-download text-primary"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleDownload(student.resume, `${student.studentName}_resume${student.resume.substr(student.resume.lastIndexOf('.'))}`)}
                                            title="Download Resume"
                                          ></i>
                                        </div>
                                        <div className="col-3 text-center">
                                          <i
                                            className="bi bi-trash text-danger"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleDocumentDelete(student._id, 'resume')}
                                            title="Delete Resume"
                                          ></i>
                                        </div>
                                      </div>
                                    ) : (
                                      <i className="bi bi-x-lg text-danger"></i>
                                    )}
                                  </div>
                                </div>

                              </div>

                            </div>

                            <div className="teacher-info border-start ps-xl-4 ps-md-3 ps-sm-4 ps-4 w-100">
                              <div>
                                <div className="d-flex justify-content-between">

                                  <div>
                                    <h6
                                      className="mb-0 mt-2 fw-bold d-block fs-6"
                                      onClick={() => handleStudentClick(student)}
                                      style={{ cursor: 'pointer' }}
                                      title="Click to View Student Profile"
                                    >
                                      {student.studentName}
                                    </h6>
                                    <div className="followers me-2">
                                      <i className="bi bi-person-vcard-fill text-danger fs-6 me-2" />
                                      <span>{student.studentId}</span>
                                    </div>
                                  </div>

                                  <div>
                                    <div
                                      className="btn-group"
                                      role="group"
                                      aria-label="Basic outlined example"
                                    >
                                      <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#editemp"
                                        onClick={() => handleEditClick(student)}
                                      >
                                        <i className="icofont-edit text-success" />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#deleteproject"
                                        onClick={() => setDeletableId(student._id)}
                                      >
                                        <i className="icofont-ui-delete text-danger" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <span className="light-info-bg py-1 px-2 rounded-1 d-inline-block fw-bold small-11 mb-0 mt-1">
                                    <i className="bi bi-calendar-check-fill text-primary fs-6 me-2" />
                                    {date}/{month}/{year}
                                  </span>
                                  <span className="light-info-bg p-2 rounded-1 d-inline-block fw-bold small-11 mb-0 mt-1">
                                    {student.course} - {student.batch}
                                  </span>
                                </div>
                              </div>
                              <div className="video-setting-icon mt-2 pt-2 border-top">
                                <p>{student.description}</p>
                              </div>
                              {/* <div className="mt-2">
                                <div className="d-flex gap-2 fw-bold">
                                  Projects :
                                  <span className="text-primary">
                                    {studentProjects[student._id] || 0}
                                  </span>
                                  <Link
                                    to="/projects"
                                    state={{ studentName: student.studentName }}
                                    className="arrow-link"
                                    title={`Click to View Projects of ${student.studentName}`}
                                  >
                                    <i className="bi bi-arrow-right" />
                                  </Link>
                                </div>
                                <div className="d-flex gap-2 fw-bold">
                                  Tasks :
                                  <span className="text-success">
                                    {studentTasks[student._id] || 0}
                                  </span>
                                  <Link
                                    to="/tasks"
                                    state={{ studentName: student.studentName }}
                                    className="arrow-link"
                                    title={`Click to View Tasks of ${student.studentName}`}
                                  >
                                    <i className="bi bi-arrow-right" />
                                  </Link>
                                </div>
                              </div> */}

                              {/* bank details */}
                              <button
                                className="btn btn-sm btn-outline-primary mt-2"
                                data-bs-toggle="modal"
                                data-bs-target="#bankDetailsModal"
                                onClick={() => setSelectedStudent(student)}
                              >
                                <i className="bi bi-bank me-2"></i>
                                View Bank Details
                              </button>

                              {/* social links */}
                              <div className="social-links mt-3">
                                <div className="d-flex flex-wrap gap-2">
                                  {student.socialLinks?.linkedin && (
                                    <a href={student.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-primary">
                                      <i className="bi bi-linkedin"></i>
                                    </a>
                                  )}
                                  {student.socialLinks?.instagram && (
                                    <a href={student.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-danger">
                                      <i className="bi bi-instagram"></i>
                                    </a>
                                  )}
                                  {student.socialLinks?.youtube && (
                                    <a href={student.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-danger">
                                      <i className="bi bi-youtube"></i>
                                    </a>
                                  )}
                                  {student.socialLinks?.facebook && (
                                    <a href={student.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-primary">
                                      <i className="bi bi-facebook"></i>
                                    </a>
                                  )}
                                  {student.socialLinks?.github && (
                                    <a href={student.socialLinks.github} target="_blank" rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-dark">
                                      <i className="bi bi-github"></i>
                                    </a>
                                  )}
                                  {student.socialLinks?.website && (
                                    <a href={student.socialLinks.website} target="_blank" rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-info">
                                      <i className="bi bi-globe"></i>
                                    </a>
                                  )}
                                  {student.socialLinks?.other && (
                                    <a href={student.socialLinks.other} target="_blank" rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-secondary">
                                      <i className="bi bi-link-45deg"></i>
                                    </a>
                                  )}
                                </div>
                              </div>



                              {/* <button
                                  className="btn btn-sm btn-outline-secondary mt-2 ms-2"
                                  data-bs-toggle="modal"
                                  data-bs-target="#viewDocumentsModal"
                                  onClick={() => setSelectedstudent(student)}
                                >
                                  <i className="bi bi-file-earmark-text me-2"></i>
                                  View Documents
                                </button> */}





                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="row clearfix">
                  <div className="col-md-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0">
                            <thead>
                              <tr>
                                <th>student</th>
                                <th>Contact</th>
                                <th>Course</th>
                                {/* <th>Projects</th> */}
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStudents.map((student) => {
                                const newDate = new Date(student?.joiningDate);
                                const date = newDate.getDate();
                                const month = newDate.getMonth() + 1; // months are 0-indexed
                                const year = newDate.getFullYear();
                                return (
                                  <tr key={student.studentId}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <img
                                          src={`${import.meta.env.VITE_BASE_URL}${student.studentImage}`}
                                          alt=""
                                          className="avatar rounded-circle me-2"
                                          style={{
                                            width: '40px',
                                            height: '40px',
                                            objectFit: 'cover',
                                            cursor: 'pointer'
                                          }}
                                          onClick={() => handleImageClick(
                                            `${import.meta.env.VITE_BASE_URL}${student.studentImage}`,
                                            student.studentName
                                          )}
                                        />
                                        <div>
                                          <h6  className="mb-0 mt-2 fw-bold d-block fs-6"
                                          onClick={() => handleStudentClick(student)}
                                          style={{ cursor: 'pointer' }}
                                          title="Click to View Student Profile"
                                        >
                                          {student.studentName}
                                        </h6>
                                        <small>{student.studentId}</small>
                                      </div>
                                    </div>
                                    </td>
                                    <td>
                                      <div>{student.phone}</div>
                                      <small>{student.emailid}</small>
                                      <div> <i className="bi bi-calendar-check-fill text-primary fs-6 me-2" />
                                        {date}/{month}/{year}</div>
                                    </td>
                                    <td>
                                      <div>{student.course}</div>
                                      <small>{student.batch}</small>
                                    </td>
                                    {/* <td>
                                      <div className="d-flex flex-column gap-1">
                                        <Link
                                          to="/projects"
                                          state={{ studentName: student.studentName }}
                                          title={`Click to View Projects of ${student.studentName}`}
                                        >
                                          <span className="badge bg-primary px-3">
                                            Projects: {studentProjects[student._id] || 0}
                                          </span>
                                        </Link>
                                        <Link
                                          to="/tasks"
                                          state={{ studentName: student.studentName }}
                                          title={`Click to View Tasks of ${student.studentName}`}
                                        >
                                          <span className="badge bg-success px-3">
                                            Tasks: {studentTasks[student._id] || 0}
                                          </span>
                                        </Link>
                                      </div>
                                    </td> */}
                                    <td>
                                      <div className="btn-group" role="group">
                                        <button
                                          className="btn btn-sm btn-outline-secondary"
                                          data-bs-toggle="modal"
                                          data-bs-target="#editemp"
                                          onClick={() => handleEditClick(student)}
                                        >
                                          <i className="icofont-edit text-success"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-secondary"
                                          data-bs-toggle="modal"
                                          data-bs-target="#deleteproject"
                                          onClick={() => setDeletableId(student._id)}
                                        >
                                          <i className="icofont-ui-delete text-danger"></i>
                                        </button>
                                      </div>
                                      <div className="mt-2">
                                        <div className="btn-group" role="group">
                                          {/* DOCUMENTS */}
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#viewDocumentsModal"
                                            onClick={() => setSelectedStudent(student)}
                                            title="Click to View Documents of student"
                                          >
                                            <i className="bi bi-file-earmark-text"></i>

                                          </button>
                                          {/* BANK DETAILS */}
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#bankDetailsModal"
                                            onClick={() => setSelectedStudent(student)}
                                            title="Click to View Bank Details of student"
                                          >
                                            <i className="bi bi-bank"></i>
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
              )}
            </div>
          </div>

          {/* Update student*/}
          <div
            className="modal fade"
            id="editemp"
            tabIndex={-1}
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5
                    className="modal-title  fw-bold"
                    id="createprojectlLabel"
                  >
                    {" "}
                    Edit Student
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label
                      htmlFor="exampleFormControlInput877"
                      className="form-label"
                    >
                      Student Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput877"
                      placeholder="Explain what the Project Name"
                      name="studentName"
                      value={studentData.studentName}
                      onChange={updateChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="updatestudentImage"
                      className="form-label"
                    >
                      Student Image
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="updatestudentImage"
                      name="studentImage"
                      onChange={updateChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="updateResume"
                      className="form-label"
                    >
                      Resume
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="updateResume"
                      name="resume"
                      onChange={updateChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="updateAadhaar"
                      className="form-label"
                    >
                      Aadhaar Card
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="updateAadhaar"
                      name="aadhaarCard"
                      onChange={updateChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="updatePan"
                      className="form-label"
                    >
                      PAN Card
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="updatePan"
                      name="panCard"
                      onChange={updateChange}
                    />
                  </div>
                  <div className="deadline-form">
                    <form>
                      <div className="row g-3 mb-3">
                        <div className="col-sm-6">
                          <label
                            htmlFor="exampleFormControlInput1778"
                            className="form-label"
                          >
                            Student ID
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="exampleFormControlInput1778"
                            placeholder="User Name"
                            name="studentId"
                            value={studentData.studentId}
                            onChange={updateChange}
                          />
                        </div>
                        <div className="col-sm-6">
                          <label
                            htmlFor="exampleFormControlInput2778"
                            className="form-label"
                          >
                            Joining Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            id="exampleFormControlInput2778"
                            name="joiningDate"
                            value={studentData.joiningDate}
                            onChange={updateChange}
                          />
                        </div>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput477"
                            className="form-label"
                          >
                            Email ID
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="exampleFormControlInput477"
                            placeholder="User Name"
                            name="emailid"
                            value={studentData.emailid}
                            onChange={updateChange}
                          />
                        </div>
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput277"
                            className="form-label"
                          >
                            Password
                          </label>
                          <input
                            type="Password"
                            className="form-control"
                            id="exampleFormControlInput277"
                            placeholder="Password"
                            name="password"
                            value={studentData.password}
                            onChange={updateChange}
                          />
                        </div>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput777"
                            className="form-label"
                          >
                            Phone
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="exampleFormControlInput777"
                            placeholder="phone"
                            maxLength={14}
                            name="phone"
                            value={studentData.phone}
                            onChange={updateChange}
                          />
                        </div>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col">
                          <label className="form-label">Course</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter course"
                            name="course"
                            value={studentData.course}
                            onChange={updateChange}
                          />
                        </div>
                        <div className="col">
                          <label className="form-label">Batch</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter batch"
                            name="batch"
                            value={studentData.batch}
                            onChange={updateChange}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Social Media & Website Links</label>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-linkedin"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="LinkedIn Profile URL"
                                name="linkedin"
                                value={studentData.linkedin || ''}
                                onChange={updateChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-instagram"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="Instagram Profile URL"
                                name="instagram"
                                value={studentData.instagram || studentData.socialLinks?.instagram || ''}
                                onChange={updateChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-youtube"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="YouTube Channel URL"
                                name="youtube"
                                value={studentData.youtube || studentData.socialLinks?.youtube || ''}
                                onChange={updateChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-facebook"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="Facebook Profile URL"
                                name="facebook"
                                value={studentData.facebook || studentData.socialLinks?.facebook || ''}
                                onChange={updateChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-github"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="GitHub Profile URL"
                                name="github"
                                value={studentData.github || studentData.socialLinks?.github || ''}
                                onChange={updateChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-globe"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="Personal Website URL"
                                name="website"
                                value={studentData.website || studentData.socialLinks?.website || ''}
                                onChange={updateChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="Other URL"
                                name="other"
                                value={studentData.other || studentData.socialLinks?.other || ''}
                                onChange={updateChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Bank Details</label>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-bank"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Bank Name"
                                name="bankName"
                                value={studentData.bankName || ''} // Use studentData for edit form
                                onChange={updateChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-person"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Account Holder Name"
                                name="accountHolderName"
                                value={studentData.accountHolderName || ''} // Use studentData for edit form
                                onChange={updateChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Account Number"
                                name="accountNumber"
                                value={studentData.accountNumber || ''} // Use studentData for edit form
                                onChange={updateChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-building"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="IFSC Code"
                                name="ifscCode"
                                value={studentData.ifscCode || ''} // Use studentData for edit form
                                onChange={updateChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                              <select
                                className="form-select"
                                name="accountType"
                                value={studentData.accountType || ''} // Use studentData for edit form
                                onChange={updateChange} // Use updateChange for edit form
                              >
                                <option value="">Select Account Type</option>
                                <option value="Savings">Savings</option>
                                <option value="Current">Current</option>
                                <option value="Salary">Salary</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-phone"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="UPI ID"
                                name="upiId"
                                value={studentData.upiId || ''} // Use studentData for edit form
                                onChange={updateChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-qr-code"></i></span>
                              <input
                                type="file"
                                className="form-control"
                                name="qrCode"
                                onChange={updateChange} // Use updateChange for edit form
                                accept="image/*"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-app"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Payment App (e.g., PayTM, PhonePe)"
                                name="paymentApp"
                                value={studentData.paymentApp || ''} // Use studentData for edit form
                                onChange={updateChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="exampleFormControlTextarea78"
                      className="form-label"
                    >
                      Description (optional)
                    </label>
                    <textarea
                      className="form-control"
                      id="exampleFormControlTextarea78"
                      rows={3}
                      placeholder="Add any extra details about the request"
                      defaultValue={""}
                      name="description"
                      value={studentData.description}
                      onChange={updateChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="btn close text-white"
                    style={{ backgroundColor: "#0a9400" }}
                    onClick={updateSubmit}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Create student*/}
          <div
            className="modal fade"
            id="createemp"
            tabIndex={-1}
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5
                    className="modal-title  fw-bold"
                    id="createprojectlLabel"
                  >
                    {" "}
                    Add Student
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label
                      htmlFor="exampleFormControlInput877"
                      className="form-label"
                    >
                      Student Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleFormControlInput877"
                      placeholder="Student Name"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="formFileMultipleoneone"
                      className="form-label"
                    >
                      Student Image <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="formFileMultipleoneone"
                      name="studentImage"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="resumeUpload"
                      className="form-label"
                    >
                      Resume
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="resumeUpload"
                      name="resume"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="aadhaarUpload"
                      className="form-label"
                    >
                      Aadhaar Card
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="aadhaarUpload"
                      name="aadhaarCard"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="panUpload"
                      className="form-label"
                    >
                      PAN Card
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="panUpload"
                      name="panCard"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="deadline-form">
                    <form>
                      <div className="row g-3 mb-3">
                        <div className="col-sm-6">
                          <label
                            htmlFor="exampleFormControlInput1778"
                            className="form-label"
                          >
                            Student ID <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="exampleFormControlInput1778"
                            placeholder="Student ID"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                            
                          />
                        </div>
                        <div className="col-sm-6">
                          <label
                            htmlFor="exampleFormControlInput2778"
                            className="form-label"
                          >
                            Joining Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            id="exampleFormControlInput2778"
                            name="joiningDate"
                            value={formData.joiningDate}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="row g-3 mb-3">

                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput477"
                            className="form-label"
                          >
                            Email ID <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="exampleFormControlInput477"
                            placeholder="Email ID"
                            name="emailid"
                            value={formData.emailid}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput277"
                            className="form-label"
                          >
                            Password <span className="text-danger">*</span>
                          </label>
                          <input
                            type="Password"
                            className="form-control"
                            id="exampleFormControlInput277"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col">
                          <label
                            htmlFor="exampleFormControlInput777"
                            className="form-label"
                          >
                            Phone
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="exampleFormControlInput777"
                            placeholder="Phone"
                            maxLength={14}
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col">
                          <label className="form-label">Course</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter course"
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col">
                          <label className="form-label">Batch</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter batch"
                            name="batch"
                            value={formData.batch}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Social Media & Website Links</label>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-linkedin"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="LinkedIn Profile URL"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-instagram"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="Instagram Profile URL"
                                name="instagram"
                                value={formData.instagram}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-youtube"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="YouTube Channel URL"
                                name="youtube"
                                value={formData.youtube}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-facebook"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="Facebook Profile URL"
                                name="facebook"
                                value={formData.facebook}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-github"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="GitHub Profile URL"
                                name="github"
                                value={formData.github}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-globe"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="Personal Website URL"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                              <input
                                type="url"
                                className="form-control"
                                placeholder="Other URL"
                                name="other"
                                value={formData.other}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Bank Details</label>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-bank"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Bank Name"
                                name="bankName"
                                value={formData.bankName || ''} // Use studentData for edit form
                                onChange={handleChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-person"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Account Holder Name"
                                name="accountHolderName"
                                value={formData.accountHolderName || ''} // Use studentData for edit form
                                onChange={handleChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Account Number"
                                name="accountNumber"
                                value={formData.accountNumber || ''} // Use studentData for edit form
                                onChange={handleChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-building"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="IFSC Code"
                                name="ifscCode"
                                value={formData.ifscCode || ''} // Use studentData for edit form
                                onChange={handleChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                              <select
                                className="form-select"
                                name="accountType"
                                value={formData.accountType || ''} // Use studentData for edit form
                                onChange={handleChange} // Use updateChange for edit form
                              >
                                <option value="">Select Account Type</option>
                                <option value="Savings">Savings</option>
                                <option value="Current">Current</option>
                                <option value="Salary">Salary</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-phone"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="UPI ID"
                                name="upiId"
                                value={formData.upiId || ''} // Use studentData for edit form
                                onChange={handleChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-qr-code"></i></span>
                              <input
                                type="file"
                                className="form-control"
                                name="qrCode"
                                onChange={handleFileChange} // Use updateChange for edit form
                                accept="image/*"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group mb-3">
                              <span className="input-group-text"><i className="bi bi-app"></i></span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Payment App (e.g., PayTM, PhonePe)"
                                name="paymentApp"
                                value={formData.paymentApp || ''} // Use studentData for edit form
                                onChange={handleChange} // Use updateChange for edit form
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                    </form>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="exampleFormControlTextarea78"
                      className="form-label"
                    >
                      Description (optional)
                    </label>
                    <textarea
                      className="form-control"
                      id="exampleFormControlTextarea78"
                      rows={3}
                      placeholder="Add any extra details about the request"
                      defaultValue={""}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="btn close text-white"
                    style={{ backgroundColor: "#0a9400" }}
                    onClick={handleSubmit}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Modal  Delete Folder/ File*/}
          <div
            className="modal fade"
            id="deleteproject"
            tabIndex={-1}
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5
                    className="modal-title  fw-bold"
                    id="deleteprojectLabel"
                  >
                    {" "}
                    Delete item Permanently?
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body justify-content-center flex-column d-flex">
                  <i className="icofont-ui-delete text-danger display-2 text-center mt-2" />
                  <p className="mt-4 fs-5 text-center">
                    You can only delete this item Permanently
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
                    className="btn btn-danger color-fff"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* PDF Viewer Modal */}
          {pdfUrl && (
            <div
              className="modal"
              style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={handlePdfModalBackdropClick}
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{selectedImageDetails.name}</h5>
                    <button type="button" className="btn-close" onClick={closePdfViewer}></button>
                  </div>
                  <div className="modal-body">
                    <iframe src={pdfUrl} style={{ width: '100%', height: '500px' }} title="PDF Viewer"></iframe>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Viewer Modal */}
          {selectedImageDetails.url && !pdfUrl && (
            <div
              className="modal"
              style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
              onClick={handleImageModalBackdropClick}
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content" style={{ marginLeft: '5rem' }}>
                  <div className="modal-header">
                    <h5 className="modal-title">{selectedImageDetails.name}</h5>
                    <button type="button" className="btn-close" onClick={closeImageModal}></button>
                  </div>
                  <div className="modal-body">
                    <img src={selectedImageDetails.url} alt="Enlarged view" style={{ width: '100%', height: '500px', objectFit: 'contain' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Details Modal */}
          <div
            className="modal fade"
            id="bankDetailsModal"
            tabIndex={-1}
            aria-hidden="true"
            style={{ zIndex: 9998 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {selectedStudent?.studentName || 'Student'}'s Bank Details
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
                            <span className="me-2">{selectedStudent?.bankDetails?.bankName || 'Not provided'}</span>
                            {selectedStudent?.bankDetails?.bankName && (
                              <i
                                className="bi bi-clipboard cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedStudent.bankDetails.bankName);
                                  toast.success('Bank Name copied!');
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
                            <span className="me-2">{selectedStudent?.bankDetails?.accountHolderName || 'Not provided'}</span>
                            {selectedStudent?.bankDetails?.accountHolderName && (
                              <i
                                className="bi bi-clipboard cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedStudent.bankDetails.accountHolderName);
                                  toast.success('Account Holder Name copied!');
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
                            <span className="me-2">{selectedStudent?.bankDetails?.accountNumber || 'Not provided'}</span>
                            {selectedStudent?.bankDetails?.accountNumber && (
                              <i
                                className="bi bi-clipboard cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedStudent.bankDetails.accountNumber);
                                  toast.success('Account Number copied!');
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
                            <span className="me-2">{selectedStudent?.bankDetails?.ifscCode || 'Not provided'}</span>
                            {selectedStudent?.bankDetails?.ifscCode && (
                              <i
                                className="bi bi-clipboard cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedStudent.bankDetails.ifscCode);
                                  toast.success('IFSC Code copied!');
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
                            <span className="me-2">{selectedStudent?.bankDetails?.accountType || 'Not provided'}</span>
                            {selectedStudent?.bankDetails?.accountType && (
                              <i
                                className="bi bi-clipboard cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedStudent.bankDetails.accountType);
                                  toast.success('Account Type copied!');
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
                            <span className="me-2">{selectedStudent?.bankDetails?.upiId || 'Not provided'}</span>
                            {selectedStudent?.bankDetails?.upiId && (
                              <i
                                className="bi bi-clipboard cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedStudent.bankDetails.upiId);
                                  toast.success('UPI ID copied!');
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
                            <span className="me-2">{selectedStudent?.bankDetails?.paymentApp || 'Not provided'}</span>
                            {selectedStudent?.bankDetails?.paymentApp && (
                              <i
                                className="bi bi-clipboard cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedStudent.bankDetails.paymentApp);
                                  toast.success('Payment App copied!');
                                }}
                                title="Copy Payment App"
                              ></i>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedStudent?.bankDetails?.qrCode && (
                      <div className="col-md-6">
                        <div className="bank-info-item p-3 border rounded h-100">
                          <i className="bi bi-qr-code fs-4 text-dark me-2"></i>
                          <div>
                            <div className="fw-bold">QR Code</div>
                            <div className="d-flex align-items-center gap-2 mt-2">
                              <img
                                src={`${import.meta.env.VITE_BASE_URL}${selectedStudent.bankDetails.qrCode.replace('uploads/', '')}`}
                                alt="QR Code"
                                style={{ width: '100px', height: '100px', objectFit: 'contain', cursor: 'pointer' }}
                                onClick={(e) => handleFileClick(
                                  e,
                                  `${import.meta.env.VITE_BASE_URL}${selectedStudent.bankDetails.qrCode.replace('uploads/', '')}`,
                                  'image',
                                  `${selectedStudent.studentName} - QR Code`
                                )}

                              />
                              <i
                                className="bi bi-download fs-4 text-primary"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleDownload(
                                  selectedStudent.bankDetails.qrCode,
                                  `${selectedStudent.studentName}_qr_code${selectedStudent.bankDetails.qrCode.substr(selectedStudent.bankDetails.qrCode.lastIndexOf('.'))}`
                                )}
                                title="Download QR Code"
                              ></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Documents Modal */}
          <div className="modal fade" id="viewDocumentsModal" tabIndex={-1} aria-hidden="true" style={{ zIndex: 9998 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">student Documents</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                </div>
                <div className="modal-body">
                  {selectedStudent && (
                    <div className="row g-3">
                      <div className="col-12">
                        <h6 className="border-bottom pb-2">Resume</h6>
                        {selectedStudent.resume ? (
                          <div className="d-flex align-items-center gap-3">
                            {selectedStudent.resume.toLowerCase().endsWith('.pdf') ? (
                              <a href="#" onClick={(e) => handleFileClick(
                                e,
                                `${import.meta.env.VITE_BASE_URL}${selectedStudent.resume}`,
                                'pdf',
                                selectedStudent.studentName
                              )}>View PDF</a>
                            ) : (
                              <img
                                src={`${import.meta.env.VITE_BASE_URL}${selectedStudent.resume}`}
                                alt="Resume"
                                className="img-thumbnail"
                                style={{ maxWidth: '100px', cursor: 'pointer' }}
                                onClick={(e) => handleFileClick(
                                  e,
                                  `${import.meta.env.VITE_BASE_URL}${selectedStudent.resume}`,
                                  'image',
                                  selectedStudent.studentName
                                )}
                              />
                            )}
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleDownload(selectedStudent.resume, `${selectedStudent.studentName}_resume${selectedStudent.resume.substr(selectedStudent.resume.lastIndexOf('.'))}`)}
                              >
                                <i className="bi bi-download"></i> Download
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDocumentDelete(selectedStudent._id, 'resume')}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted">No resume uploaded</p>
                        )}
                      </div>

                      <div className="col-12">
                        <h6 className="border-bottom pb-2">Aadhaar Card</h6>
                        {selectedStudent.aadhaarCard ? (
                          <div className="row align-items-center g-2">
                            <div className="col-6">
                              {selectedStudent.aadhaarCard.toLowerCase().endsWith('.pdf') ? (
                                <a href="#" onClick={(e) => handleFileClick(
                                  e,
                                  `${import.meta.env.VITE_BASE_URL}${selectedStudent.aadhaarCard.replace('uploads/', '')}`,
                                  'pdf',
                                  selectedStudent.studentName
                                )}>View</a>
                              ) : (
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${selectedStudent.aadhaarCard.replace('uploads/', '')}`}
                                  alt=""
                                  className="avatar sm img-thumbnail shadow-sm"
                                  onClick={(e) => handleFileClick(
                                    e,
                                    `${import.meta.env.VITE_BASE_URL}${selectedStudent.aadhaarCard.replace('uploads/', '')}`,
                                    'image',
                                    selectedStudent.studentName
                                  )}
                                  style={{ cursor: 'pointer' }}
                                />
                              )}
                            </div>
                            <div className="col-3 text-center">
                              <i
                                className="bi bi-download text-primary"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleDownload(selectedStudent.aadhaarCard, `${selectedStudent.studentName}_aadhaar${selectedStudent.aadhaarCard.substr(selectedStudent.aadhaarCard.lastIndexOf('.'))}`)}
                                title="Download Aadhaar Card"
                              ></i>
                            </div>
                            <div className="col-3 text-center">
                              <i
                                className="bi bi-trash text-danger"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleDocumentDelete(selectedStudent._id, 'aadhaarCard')}
                                title="Delete Aadhaar Card"
                              ></i>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted">No Aadhaar card uploaded</p>
                        )}
                      </div>

                      <div className="col-12">
                        <h6 className="border-bottom pb-2">PAN Card</h6>
                        {selectedStudent.panCard ? (
                          <div className="row align-items-center g-2">
                            <div className="col-6">
                              {selectedStudent.panCard.toLowerCase().endsWith('.pdf') ? (
                                <a href="#" onClick={(e) => handleFileClick(
                                  e,
                                  `${import.meta.env.VITE_BASE_URL}${selectedStudent.panCard.replace('uploads/', '')}`,
                                  'pdf',
                                  selectedStudent.studentName
                                )}>View</a>
                              ) : (
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${selectedStudent.panCard.replace('uploads/', '')}`}
                                  alt=""
                                  className="avatar sm img-thumbnail shadow-sm"
                                  onClick={(e) => handleFileClick(
                                    e,
                                    `${import.meta.env.VITE_BASE_URL}${selectedStudent.panCard.replace('uploads/', '')}`,
                                    'image',
                                    selectedStudent.studentName
                                  )}
                                  style={{ cursor: 'pointer' }}
                                />
                              )}
                            </div>
                            <div className="col-3 text-center">
                              <i
                                className="bi bi-download text-primary"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleDownload(selectedStudent.panCard, `${selectedStudent.studentName}_pan${selectedStudent.panCard.substr(selectedStudent.panCard.lastIndexOf('.'))}`)}
                                title="Download Pan Card"
                              ></i>
                            </div>
                            <div className="col-3 text-center">
                              <i
                                className="bi bi-trash text-danger"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleDocumentDelete(selectedStudent._id, 'panCard')}
                                title="Delete Pan Card"
                              ></i>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted">No PAN card uploaded</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>

        </>
      </div>
      <ToastContainer />
      <FloatingMenu userType="admin" isMobile={isMobile} />
    </div>
    <style>
      {`
        .arrow-link {
display: inline-block;
transition: transform 0.2s ease;
}

.arrow-link:hover {
transform: translateX(5px);
}

.bank-info-item {
display: flex;
align-items: flex-start;
gap: 10px;
}

.bank-info-item:hover {
background-color: #f8f9fa;
}
      `}
    </style>
  </>
  );
};

export default Student;
