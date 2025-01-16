import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from '../context/ThemeContext';


const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const navigation = useNavigate();

  const [studentData, setStudentData] = useState({
    studentName: "",
    studentImage: null,
    studentId: "",
    joiningDate: "",
    username: "",
    password: "",
    emailid: "",
    phone: "",
    course: "",
    batch: "",
    description: "",
    socialLinks: {
      linkedin: "",
      instagram: "",
      youtube: "",
      facebook: "",
      github: "",
      website: "",
      other: ""
    },
    bankDetails: {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      accountType: "",
      upiId: "",
      qrCode: null,
      paymentApp: ""
    }
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const dropdownRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (!token) {
      navigation("/");
    }
    const user = JSON.parse(localStorage.getItem("student_user"));
    if (user) {
      setStudentData({
        studentName: user.studentName || "",
        studentId: user.studentId || "",
        joiningDate: user.joiningDate || "",
        emailid: user.emailid || "",
        password: user.password || "",
        phone: user.phone || "",
        description: user.description || "",
        course: user.course || "",
        batch: user.batch || "",
        // Add social links
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || "",
          instagram: user.socialLinks?.instagram || "",
          youtube: user.socialLinks?.youtube || "",
          facebook: user.socialLinks?.facebook || "",
          github: user.socialLinks?.github || "",
          website: user.socialLinks?.website || "",
          other: user.socialLinks?.other || ""
        },
        bankDetails: {
          bankName: user.bankDetails?.bankName || "",
          accountHolderName: user.bankDetails?.accountHolderName || "",
          accountNumber: user.bankDetails?.accountNumber || "",
          ifscCode: user.bankDetails?.ifscCode || "",
          accountType: user.bankDetails?.accountType || "",
          upiId: user.bankDetails?.upiId || "",
          paymentApp: user.bankDetails?.paymentApp || ""
        }
      });
      setStudentName(user.studentName);
      setEmail(user.emailid);
      setImage(user.studentImage);
    }
  }, [navigation]);

  useEffect(() => {
    const positionDropdown = () => {
      if (dropdownRef.current) {
        const dropdown = dropdownRef.current;
        const rect = dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        if (rect.right > viewportWidth) {
          dropdown.style.left = 'auto';
          dropdown.style.right = '0';
        } else {
          dropdown.style.left = '';
          dropdown.style.right = '';
        }
      }
    };

    window.addEventListener('resize', positionDropdown);
    positionDropdown(); // Initial positioning

    return () => window.removeEventListener('resize', positionDropdown);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("student_token");
    localStorage.removeItem("student_user");
    navigation("/studentsignin");
  };

  //   GET studentS
//   const [students, setstudents] = useState([]);
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/students`);
//         setstudents(response.data);
//       } catch (error) {
//         console.error("Error:", error);
//       }
//     };

//     fetchData();
//   }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const updateSubmit = async () => {
    const formData = new FormData();

    // Add basic fields
    formData.append("studentName", studentData.studentName);
    formData.append("joiningDate", studentData.joiningDate);
    formData.append("emailid", studentData.emailid);
    formData.append("password", studentData.password);
    formData.append("phone", studentData.phone);
    formData.append("description", studentData.description);
    formData.append("course", studentData.course);
    formData.append("batch", studentData.batch);

    // Add social links
    Object.entries(studentData.socialLinks || {}).forEach(([key, value]) => {
      formData.append(key, value || '');
    });

    // Add bank details
    Object.entries(studentData.bankDetails || {}).forEach(([key, value]) => {
      formData.append(key, value || '');
    });

    if (selectedFile) {
      formData.append("studentImage", selectedFile);
    }

    // Add document files if they exist
    if (studentData.aadhaarCard instanceof File) {
      formData.append("aadhaarCard", studentData.aadhaarCard);
    }
    if (studentData.panCard instanceof File) {
      formData.append("panCard", studentData.panCard);
    }
    if (studentData.resume instanceof File) {
      formData.append("resume", studentData.resume);
    }
    if (studentData.qrCode instanceof File) {
      formData.append("qrCode", studentData.qrCode);
    }

    try {
      const token = localStorage.getItem("student_token");
      const studentId = JSON.parse(localStorage.getItem("student_user"))._id;

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/students/${studentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      if (response.status === 200) {
        localStorage.setItem("student_user", JSON.stringify(response.data));
        toast.success("Profile updated successfully!");

        // Close modal
        const modalElement = document.getElementById("editstudent");
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        // Reload after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleImageClick = useCallback((imageUrl) => {
    window.open(imageUrl, '_blank');
  }, []);

  const [selectedImage, setSelectedImage] = useState(null);

  const handleFileClick = useCallback((e, fileUrl, fileType) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Stop event propagation
    if (fileType === 'pdf') {
      setPdfUrl(fileUrl);
    } else {
      setSelectedImage(fileUrl);
    }
  }, []);

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const closePdfViewer = () => {
    setPdfUrl(null);
  };

  useEffect(() => {
    // Check if this is a fresh login or page refresh
    const isNewSession = sessionStorage.getItem('toastShown') !== 'true';
    
    if (isNewSession) {
      // Check for missing documents
      const user = JSON.parse(localStorage.getItem("student_user"));
      if (user && (!user.aadhaarCard || !user.panCard || !user.resume)) {
        toast.error("Please update your profile with missing documents.", {
          style: {
            backgroundColor: "#0d6efd",
            color: "white",
          },
        });
        
        // Mark that we've shown the toast in this session
        sessionStorage.setItem('toastShown', 'true');
      }
    }
    
    // No need for interval anymore
    // Clean up function is also not needed since we're not setting up an interval
  }, []); // Empty dependency array means this runs once on mount

  return (
    <>
      <div className="header">
        <nav className="navbar py-4">
          <div className="container-xxl">
            {/* header rightbar icon */}
            <div className="h-right d-flex gap-3 align-items-center mr-5 mr-lg-0 order-1">
              <button onClick={toggleTheme} className="border-0 bg-transparent">
                {isDarkMode ? <i className="bi bi-brightness-high text-light fs-5" /> : <i className="bi bi-moon-fill fs-5" />}
              </button>
              <div className="dropdown user-profile ml-2 ml-sm-3 d-flex align-items-center zindex-popover">
                <div className="u-info me-2">
                  <p className="mb-0 text-end line-height-sm ">
                    <span className="font-weight-bold">{studentName}</span>
                  </p>
                  <small>Student Profile</small>
                </div>
                <a
                  className="nav-link dropdown-toggle pulse p-0"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  data-bs-display="static"
                >
                  <img
                    className="avatar lg rounded-circle img-thumbnail"
                    src={`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`}
                    alt="profile"
                  />
                </a>
                <div className="dropdown-menu rounded-lg shadow border-0 dropdown-animation dropdown-menu-end p-0 m-0"
                  ref={dropdownRef}>
                  <div className="card border-0 w280">
                    <div className="card-body pb-0">
                      <div className="d-flex py-1">
                        <img
                          className="avatar rounded-circle"
                          src={`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`}
                          alt="profile"
                          style={{
                            transition: 'transform 0.3s ease-in-out',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(8)';
                            e.target.style.zIndex = '100';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.zIndex = '1';
                          }}
                          onClick={() => handleImageClick(`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`)}
                        />
                        <div className="flex-fill ms-3">
                          <p className="mb-0">
                            <span className="font-weight-bold">
                              {studentName}
                            </span>
                          </p>
                          <p style={{ width: "210px", fontSize: "small" }}>{email}</p>

                          {/* <div style={{ marginTop: "-18px" }}>
                            <strong>Aadhaar Card - </strong>
                            {aadhaarCard ? (
                              aadhaarCard.toLowerCase().endsWith('.pdf') ? (
                                <a href="#" onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`, 'pdf')}>View PDF</a>
                              ) : (
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`}
                                  alt="Aadhaar Card"
                                  className="avatar sm img-thumbnail shadow-sm"
                                  onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`, 'image')}
                                  style={{ cursor: 'pointer' }}
                                />
                              )
                            ) : (
                              <i className="bi bi-x-lg text-danger"></i>
                            )}
                          </div>

                          <div>
                            <strong>Pan Card - </strong>
                            {panCard ? (
                              panCard.toLowerCase().endsWith('.pdf') ? (
                                <a href="#" onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`, 'pdf')}>View PDF</a>
                              ) : (
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`}
                                  alt="Pan Card"
                                  className="avatar sm img-thumbnail shadow-sm"
                                  onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`, 'image')}
                                  style={{ cursor: 'pointer' }}
                                />
                              )
                            ) : (
                              <i className="bi bi-x-lg text-danger"></i>
                            )}
                          </div>

                          <div>
                            <strong>Resume - </strong>
                            {resume ? (
                              resume.toLowerCase().endsWith('.pdf') ? (
                                <a href="#" onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`, 'pdf')}>View PDF</a>
                              ) : (
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`}
                                  alt="Resume"
                                  className="avatar sm img-thumbnail shadow-sm"
                                  onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`, 'image')}
                                  style={{ cursor: 'pointer' }}
                                />
                              )
                            ) : (
                              <i className="bi bi-x-lg text-danger"></i>
                            )}
                          </div> */}

                        </div>
                      </div>
                      <div>
                        <hr className="dropdown-divider border-dark" />
                      </div>
                      {/* Add this after the student info in the dropdown */}
                      {/* <div className="social-links mt-3">
                        <div className="d-flex flex-wrap gap-2">
                          {studentData.socialLinks?.linkedin && (
                            <a href={studentData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-linkedin"></i>
                            </a>
                          )}
                          {studentData.socialLinks?.instagram && (
                            <a href={studentData.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-danger">
                              <i className="bi bi-instagram"></i>
                            </a>
                          )}
                          {studentData.socialLinks?.youtube && (
                            <a href={studentData.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-danger">
                              <i className="bi bi-youtube"></i>
                            </a>
                          )}
                          {studentData.socialLinks?.facebook && (
                            <a href={studentData.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-facebook"></i>
                            </a>
                          )}
                          {studentData.socialLinks?.github && (
                            <a href={studentData.socialLinks.github} target="_blank" rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-dark">
                              <i className="bi bi-github"></i>
                            </a>
                          )}
                          {studentData.socialLinks?.website && (
                            <a href={studentData.socialLinks.website} target="_blank" rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-info">
                              <i className="bi bi-globe"></i>
                            </a>
                          )}
                          {studentData.socialLinks?.other && (
                            <a href={studentData.socialLinks.other} target="_blank" rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-link-45deg"></i>
                            </a>
                          )}
                        </div>
                      </div> */}

                    </div>
                    <div className="list-group m-2 ">
                      <Link
                        type=""
                        className="list-group-item list-group-item-action border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#editstudent"
                      // onClick={() => setToEdit(students._id)}
                      >
                        <i className="icofont-ui-user-group fs-6 me-3" /> Edit
                        Profile
                      </Link>
                      {/* <Link
                        type=""
                        className="list-group-item list-group-item-action border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#taskMessage"
                      >
                        <i className="icofont-ui-message fs-6 me-3" /> Message
                      </Link> */}
                      <button
                        onClick={handleSignOut}
                        className="list-group-item list-group-item-action border-0 "
                      >
                        <i className="icofont-logout fs-6 me-3" />
                        Signout
                      </button>
                      <div>
                        <hr className="dropdown-divider border-dark" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* menu toggler */}
            <button
              className="navbar-toggler p-0 border-0 menu-toggle order-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainHeader"
            >
              <span className="fa fa-bars" />
            </button>
            <div className="order-0 col-lg-4 col-md-4 col-sm-12 col-12 mb-3 mb-md-0 ">
            </div>

            {/* Edit student*/}
            <div
              className="modal fade"
              id="editstudent"
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
                      Edit student
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
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="formFileMultipleoneone"
                        className="form-label"
                      >
                        Student Profile
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultipleoneone"
                        name="studentImage"
                        onChange={handleFileChange}
                      />
                    </div>
                    {/* New file upload fields */}
                    <div className="mb-3">
                      <label htmlFor="aadhaarCardUpload" className="form-label">Aadhaar Card</label>
                      <input
                        type="file"
                        className="form-control"
                        id="aadhaarCardUpload"
                        name="aadhaarCard"
                        onChange={(e) => setStudentData({ ...studentData, aadhaarCard: e.target.files[0] })}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="panCardUpload" className="form-label">PAN Card</label>
                      <input
                        type="file"
                        className="form-control"
                        id="panCardUpload"
                        name="panCard"
                        onChange={(e) => setStudentData({ ...studentData, panCard: e.target.files[0] })}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="resumeUpload" className="form-label">Resume</label>
                      <input
                        type="file"
                        className="form-control"
                        id="resumeUpload"
                        name="resume"
                        onChange={(e) => setStudentData({ ...studentData, resume: e.target.files[0] })}
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
                              onChange={handleChange}
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
                              onChange={handleChange} />
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
                              id="exampleFormControlInput777"
                              placeholder="Course"
                              name="course"
                              value={studentData.course}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col">
                            <label className="form-label">Batch</label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput777"
                              placeholder="Batch"
                              name="batch"
                              value={studentData.batch}
                              onChange={handleChange}
                            />
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
                        onChange={handleChange}
                      />
                    </div>
                    <div className="border-top pt-3 mt-3">
                      <h6 className="mb-3">Social Links</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="linkedin" className="form-label">
                            <i className="bi bi-linkedin me-2"></i>LinkedIn
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            id="linkedin"
                            name="linkedin"
                            value={studentData.socialLinks?.linkedin || ''}
                            onChange={(e) => setStudentData({
                              ...studentData,
                              socialLinks: {
                                ...studentData.socialLinks,
                                linkedin: e.target.value
                              }
                            })}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="instagram" className="form-label">
                            <i className="bi bi-instagram me-2"></i>Instagram
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            id="instagram"
                            name="instagram"
                            value={studentData.socialLinks?.instagram || ''}
                            onChange={(e) => setStudentData({
                              ...studentData,
                              socialLinks: {
                                ...studentData.socialLinks,
                                instagram: e.target.value
                              }
                            })}
                            placeholder="https://instagram.com/username"
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="youtube" className="form-label">
                            <i className="bi bi-youtube me-2"></i>YouTube
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            id="youtube"
                            name="youtube"
                            value={studentData.socialLinks?.youtube || ''}
                            onChange={(e) => setStudentData({
                              ...studentData,
                              socialLinks: {
                                ...studentData.socialLinks,
                                youtube: e.target.value
                              }
                            })}
                            placeholder="https://youtube.com/c/username"
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="facebook" className="form-label">
                            <i className="bi bi-facebook me-2"></i>Facebook
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            id="facebook"
                            name="facebook"
                            value={studentData.socialLinks?.facebook || ''}
                            onChange={(e) => setStudentData({
                              ...studentData,
                              socialLinks: {
                                ...studentData.socialLinks,
                                facebook: e.target.value
                              }
                            })}
                            placeholder="https://facebook.com/username"
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="github" className="form-label">
                            <i className="bi bi-github me-2"></i>GitHub
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            id="github"
                            name="github"
                            value={studentData.socialLinks?.github || ''}
                            onChange={(e) => setStudentData({
                              ...studentData,
                              socialLinks: {
                                ...studentData.socialLinks,
                                github: e.target.value
                              }
                            })}
                            placeholder="https://github.com/username"
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="website" className="form-label">
                            <i className="bi bi-globe me-2"></i>Website
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            id="website"
                            name="website"
                            value={studentData.socialLinks?.website || ''}
                            onChange={(e) => setStudentData({
                              ...studentData,
                              socialLinks: {
                                ...studentData.socialLinks,
                                website: e.target.value
                              }
                            })}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="other" className="form-label">
                            <i className="bi bi-link-45deg me-2"></i>Other
                          </label>
                          <input
                            type="url"
                            className="form-control"
                            id="other"
                            name="other"
                            value={studentData.socialLinks?.other || ''}
                            onChange={(e) => setStudentData({
                              ...studentData,
                              socialLinks: {
                                ...studentData.socialLinks,
                                other: e.target.value
                              }
                            })}
                            placeholder="https://other-link.com"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border-top pt-3 mt-3">
                      <h6 className="mb-3">Bank Details</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-bank"></i></span>
                            <input type="text"
                              className="form-control"
                              id="bankName"
                              name="bankName"
                              value={studentData.bankDetails?.bankName || ""}
                              onChange={(e) => setStudentData({
                                ...studentData,
                                bankDetails: {
                                  ...studentData.bankDetails,
                                  bankName: e.target.value
                                }
                              })}
                              placeholder="Bank Name" />
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
                              value={studentData.bankDetails?.accountHolderName || ''}
                              onChange={(e) => setStudentData({
                                ...studentData,
                                bankDetails: {
                                  ...studentData.bankDetails,
                                  accountHolderName: e.target.value
                                }
                              })}
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
                              value={studentData.bankDetails?.accountNumber || ''}
                              onChange={(e) => setStudentData({
                                ...studentData,
                                bankDetails: {
                                  ...studentData.bankDetails,
                                  accountNumber: e.target.value
                                }
                              })}
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
                              value={studentData.bankDetails?.ifscCode || ''}
                              onChange={(e) => setStudentData({
                                ...studentData,
                                bankDetails: {
                                  ...studentData.bankDetails,
                                  ifscCode: e.target.value
                                }
                              })}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                            <select
                              className="form-select"
                              name="accountType"
                              value={studentData.bankDetails?.accountType || ''}
                              onChange={(e) => setStudentData({
                                ...studentData,
                                bankDetails: {
                                  ...studentData.bankDetails,
                                  accountType: e.target.value
                                }
                              })}
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
                              value={studentData.bankDetails?.upiId || ''}
                              onChange={(e) => setStudentData({
                                ...studentData,
                                bankDetails: {
                                  ...studentData.bankDetails,
                                  upiId: e.target.value
                                }
                              })}
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
                              onChange={(e) => setStudentData({
                                ...studentData,
                                bankDetails: {
                                  ...studentData.bankDetails,
                                  qrCode: e.target.value
                                }
                              })} // Use updateChange for edit form
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
                              value={studentData.bankDetails?.paymentApp || ''}
                              onChange={(e) => setStudentData({
                                ...studentData,
                                bankDetails: {
                                  ...studentData.bankDetails,
                                  paymentApp: e.target.value
                                }
                              })}
                            />
                          </div>
                        </div>
                      </div>
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
                      className="btn btn-primary"
                      onClick={updateSubmit}                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Modal */}
            <div
              className="modal fade"
              id="taskMessage"
              tabIndex={-1}
              aria-labelledby="taskMessageLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="addUserLabel">Task Messages</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <ul className="list-group">

                      <li className="list-group-item">
                        <div className="d-flex border-bottom py-1">
                          <span className="px-3 text-break">
                            {/* message content */}
                          </span>
                        </div>
                      </li>

                    </ul>
                    <form>
                      <div className="mb-3">
                        <label htmlFor="currentMessage" className="form-label">Add Message</label>
                        <textarea
                          className="form-control"
                          id="currentMessage"
                          name="message"
                          rows="3"
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-dark">Submit</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Viewer Modal */}
            {pdfUrl && (
              <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">PDF Viewer</h5>
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
            {selectedImage && !pdfUrl && (
              <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Image Viewer</h5>
                      <button type="button" className="btn-close" onClick={closeImageModal}></button>
                    </div>
                    <div className="modal-body">
                      <img src={selectedImage} alt="Enlarged view" style={{ width: '100%', height: 'auto' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </nav >
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div >
      <style jsx>{`
        .dropdown-menu {
          position: absolute !important;
        }
        @media (max-width: 767px) {
          .zindex-popover {
            position: static !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
