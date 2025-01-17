import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentHeader from '../studentCompt/StudentHeader';
import StudentSidebar from '../studentCompt/StudentSidebar';

const YourForms = () => {
  const [forms, setForms] = useState([]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    fetchStudentForms();
  }, []);

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
      // console.log(data.data);
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
                  <div className="">
                    <h3 className="mb-3 fw-bold">Your Submitted Forms</h3>
                  </div>
                  <div className="card-body">
                    {forms.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Form Type</th>
                              <th>Submission Date</th>
                              <th>Status</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {forms.map((form) => (
                              <tr key={form._id}>
                                <td>{getFormTypeName(form.formType)}</td>
                                <td>{formatDate(form.submittedAt)}</td>
                                <td>
                                  <span className={`badge ${getStatusBadgeClass(form.status)}`}>
                                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    data-bs-toggle="modal" 
                                    data-bs-target={`#formModal-${form._id}`}
                                  >
                                    View Details
                                  </button>

                                  {/* Modal for form details */}
                                  <div className="modal fade" id={`formModal-${form._id}`} tabIndex="-1">
                                    <div className="modal-dialog modal-lg">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h5 className="modal-title">{getFormTypeName(form.formType)} Details</h5>
                                          <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                        </div>
                                        <div className="modal-body">
                                          {/* Profile Image */}
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

                                          {/* Personal Information */}
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

                                          {/* Contact Information */}
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

                                          {/* Academic Information */}
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

                                          {/* Emergency Contact */}
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

                                          {/* Form Specific Fields */}
                                          <div className="card">
                                            <div className="card-header">
                                              <h6 className="mb-0">Form Specific Details</h6>
                                            </div>
                                            <div className="card-body">
                                              {/* Admission Form Fields */}
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

                                              {/* Scholarship Form Fields */}
                                              {form.formType === 'form2' && (
                                                <div>
                                                  <p><strong>Family Income:</strong> {form.familyIncome}</p>
                                                  <p><strong>Scholarship Type:</strong> {form.scholarshipType}</p>
                                                  <p><strong>Achievements:</strong> {form.achievements}</p>
                                                </div>
                                              )}

                                              {/* Leave Application Fields */}
                                              {form.formType === 'form3' && (
                                                <div>
                                                  <p><strong>Leave Period:</strong> {formatDate(form.leaveStart)} to {formatDate(form.leaveEnd)}</p>
                                                  <p><strong>Leave Type:</strong> {form.leaveType}</p>
                                                  <p><strong>Reason:</strong> {form.leaveReason}</p>
                                                </div>
                                              )}

                                              {/* Hostel Application Fields */}
                                              {form.formType === 'form4' && (
                                                <div>
                                                  <p><strong>Room Type:</strong> {form.roomType}</p>
                                                  <p><strong>Duration (months):</strong> {form.duration}</p>
                                                  <p><strong>Meal Plan:</strong> {form.mealPlan}</p>
                                                </div>
                                              )}

                                              {/* Library Card Fields */}
                                              {form.formType === 'form5' && (
                                                <div>
                                                  <p><strong>Card Type:</strong> {form.cardType}</p>
                                                  <p><strong>Department:</strong> {form.department}</p>
                                                </div>
                                              )}

                                              {/* ID Card Fields */}
                                              {form.formType === 'form6' && (
                                                <div>
                                                  <p><strong>ID Type:</strong> {form.idType}</p>
                                                  {form.replacementReason && (
                                                    <p><strong>Replacement Reason:</strong> {form.replacementReason}</p>
                                                  )}
                                                </div>
                                              )}

                                              {/* Exam Registration Fields */}
                                              {form.formType === 'form7' && (
                                                <div>
                                                  <p><strong>Exam Type:</strong> {form.examType}</p>
                                                  <p><strong>Number of Subjects:</strong> {form.subjectCount}</p>
                                                  {form.specialRequirements && (
                                                    <p><strong>Special Requirements:</strong> {form.specialRequirements}</p>
                                                  )}
                                                </div>
                                              )}

                                              {/* Club Registration Fields */}
                                              {form.formType === 'form8' && (
                                                <div>
                                                  <p><strong>Club Name:</strong> {form.clubName}</p>
                                                  <p><strong>Position:</strong> {form.position}</p>
                                                  {form.experience && (
                                                    <p><strong>Previous Experience:</strong> {form.experience}</p>
                                                  )}
                                                </div>
                                              )}

                                              {/* Certificate Request Fields */}
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
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <h5>No forms submitted yet</h5>
                        <p>Go to the Forms section to submit a new form</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourForms;
