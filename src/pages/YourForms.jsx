import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentHeader from '../studentCompt/StudentHeader';
import StudentSidebar from '../studentCompt/StudentSidebar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const FormDetailsModal = ({ form, formatDate, getFormTypeName, getStatusBadgeClass }) => {
  return (
    <div className="modal fade" id={`formModal-${form._id}`} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{getFormTypeName(form.formType)} Details</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body">
            <div className="card mb-3">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">Form Type: {getFormTypeName(form.formType)}</h6>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-8">
                <div className="card">
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
              </div>
              <div className="col-md-4">
                {form.profileImage ? (
                  <div className="card">
                    <div className="card-body text-center">
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${form.profileImage.replace('uploads\\', '').replace('\\', '/')}`}
                        alt="Profile"
                        className="img-fluid"
                        style={{ 
                          width: '200px', 
                          height: '200px', 
                          objectFit: 'cover',
                          border: '2px solid #ddd',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-body text-center">
                      <div 
                        className="d-flex align-items-center justify-content-center bg-light"
                        style={{ 
                          width: '200px', 
                          height: '200px',
                          margin: '0 auto',
                          border: '2px solid #ddd',
                          borderRadius: '8px'
                        }}
                      >
                        <i className="bi bi-person" style={{ fontSize: '4rem' }}></i>
                      </div>
                    </div>
                  </div>
                )}
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
  );
};

const YourForms = () => {
  const [forms, setForms] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredForms, setFilteredForms] = useState([]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    fetchStudentForms();
  }, []);

  const handleSearch = useCallback((query) => {
    if (!query.trim()) {
      setFilteredForms(forms);
      return;
    }

    const filtered = forms.filter((form) =>
      form.fullName?.toLowerCase().includes(query.toLowerCase()) ||
      form.email?.toLowerCase().includes(query.toLowerCase()) ||
      form.formType?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredForms(filtered);
  }, [forms]);

  const fetchStudentForms = async () => {
    try {
      const token = localStorage.getItem('student_token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/student/my-forms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }

      const data = await response.json();
      setForms(data.data);
      setFilteredForms(data.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
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

  const downloadFormAsPDF = async (form) => {
    try {
      // Get the modal element
      const modalElement = document.getElementById(`formModal-${form._id}`);
      
      // Create a clone of the modal body to avoid visibility issues
      const modalBody = modalElement.querySelector('.modal-body').cloneNode(true);
      
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.appendChild(modalBody);
      document.body.appendChild(tempContainer);
      
      // Set styles for proper rendering
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      modalBody.style.transform = 'none';
      modalBody.style.width = '800px'; // Set fixed width for better PDF quality
      
      // Wait for images to load
      const images = modalBody.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      // Generate PDF
      const canvas = await html2canvas(modalBody, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${getFormTypeName(form.formType)}_${form.fullName}.pdf`);

      // Clean up
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div id="mytask-layout">
      <StudentSidebar />
      <div className="main px-lg-4 px-md-4">
        <StudentHeader />
        <div className="body d-flex py-lg-3 py-md-2">
          <div className="container-xxl">
            <div className="row">
              <div className="col-12">
                <div className="">
                  <div className="d-flex justify-content-between align-items-center mb-3 border-bottom">
                    <h3 className="mb-3 fw-bold">Your Submitted Forms</h3>
                
                  </div>
                  <div className="d-flex justify-content-between align-items-center  border-bottom">
                      <div className="d-flex me-2 mb-3">
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
                      <div className="input-group mb-3" style={{ width: '300px' }}>
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Search forms..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch(e.target.value);
                          }}
                        />
                        <button
                          type="button"
                          className="input-group-text"
                          onClick={() => handleSearch(searchQuery)}
                        >
                          <i className="fa fa-search" />
                        </button>
                      </div>
                    </div>

                  <div className="card-body">
                    {filteredForms.length > 0 ? (
                      viewMode === 'list' ? (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle">
                            <thead className="table-light">
                              <tr>
                                <th className="text-center" style={{ width: '60px' }}>Sr.No.</th>
                                <th style={{ width: '80px' }}>Photo</th>
                                <th >Form Type</th>
                                <th>Student Details</th>
                                <th>Academic Info</th>
                                <th>Submission Date</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredForms.map((form, index) => (
                                <tr key={form._id} className="align-middle">
                                  <td className="text-center fw-bold">{index + 1}.</td>
                                  <td>
                                    {form.profileImage ? (
                                      <img
                                        src={`${import.meta.env.VITE_BASE_URL}${form.profileImage.replace('uploads\\', '').replace('\\', '/')}`}
                                        alt="Profile"
                                        className="rounded-circle"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div 
                                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                        style={{ width: '40px', height: '40px' }}
                                      >
                                        <i className="bi bi-person text-secondary"></i>
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      {/*    */}
                                      <div>
                                        <span className="fw-bold">{getFormTypeName(form.formType)}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex flex-column">
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
                                    <div className="d-flex flex-column">
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
                                    <div className="d-flex flex-column">
                                      <small className="fw-bold">
                                        <i className="bi bi-clock-history me-1"></i>
                                        {formatDate(form.submittedAt)}
                                      </small>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    <span className={`badge ${getStatusBadgeClass(form.status)} px-3 py-2`}>
                                      <i className={`bi ${form.status === 'approved' ? 'bi-check-circle' : 
                                                    form.status === 'rejected' ? 'bi-x-circle' : 
                                                    'bi-hourglass-split'} me-1`}></i>
                                      {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <div className="btn-group">
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target={`#formModal-${form._id}`}
                                      >
                                        <i className="bi bi-eye me-1"></i>
                  
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => downloadFormAsPDF(form)}
                                      >
                                        <i className="bi bi-download me-1"></i>
                                        
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="row g-3 mt-3">
                          {filteredForms.map((form, index) => (
                            <div key={form._id} className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-6">
                              <div className="card h-100 shadow-sm hover-shadow">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">{index + 1}.</span>
                                  <h6 className="card-title mb-0 fw-bold">
                                    {getFormTypeName(form.formType)}
                                  </h6>
                                  <span className={`badge ${getStatusBadgeClass(form.status)}`}>
                                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                                  </span>
                                </div>
                                <div className="card-body">
                                  {form.profileImage && (
                                    <div className="text-center mb-3">
                                      <img
                                        src={`${import.meta.env.VITE_BASE_URL}${form.profileImage.replace('uploads\\', '').replace('\\', '/')}`}
                                        alt="Profile"
                                        className="rounded-circle"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                      />
                                    </div>
                                  )}
                                  <div className="details-container">
                                    <p className="card-text mb-2">
                                      <i className="bi bi-person me-2"></i>
                                      <strong>Name:</strong> {form.fullName}
                                    </p>
                                    <p className="card-text mb-2">
                                      <i className="bi bi-calendar-date me-2"></i>
                                      <strong>Submitted:</strong> {formatDate(form.submittedAt)}
                                    </p>
                                    <p className="card-text mb-2">
                                      <i className="bi bi-envelope me-2"></i>
                                      <strong>Email:</strong> {form.email}
                                    </p>
                                    {form.studentId && (
                                      <p className="card-text mb-2">
                                        <i className="bi bi-card-text me-2"></i>
                                        <strong>Student ID:</strong> {form.studentId}
                                      </p>
                                    )}
                                    {form.course && (
                                      <p className="card-text mb-2">
                                        <i className="bi bi-book me-2"></i>
                                        <strong>Course:</strong> {form.course}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="card-footer bg-light text-center">
                                  <div className="btn-group w-100">
                                    <button
                                      className="btn btn-primary"
                                      data-bs-toggle="modal"
                                      data-bs-target={`#formModal-${form._id}`}
                                    >
                                      <i className="bi bi-eye me-1"></i>
                                    </button>
                                    <button
                                      className="btn"
                                      style={{ backgroundColor: '#0A9400', color: 'white' }}
                                      onClick={() => downloadFormAsPDF(form)}
                                    >
                                      <i className="bi bi-download me-1"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-5">
                        <h5>No forms found</h5>
                        <p>Try adjusting your search or submit a new form</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {filteredForms.map((form) => (
        <FormDetailsModal
          key={`modal-${form._id}`}
          form={form}
          formatDate={formatDate}
          getFormTypeName={getFormTypeName}
          getStatusBadgeClass={getStatusBadgeClass}
        />
      ))}
    </div>
  );
};

export default YourForms;
