import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    if (!token) {
      navigate('/studentsignin');
    } else {
      fetchStudentData();
    }
  }, [navigate]);

  const fetchStudentData = async () => {
    try {
      // Add your API endpoint to fetch student data
      const response = await fetch('/api/student/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('student_token')}`
        }
      });
      const data = await response.json();
      setStudentData(data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  return (
    <div className="container-fluid px-4">
      {/* Profile Section */}
      <div className="profile-section p-4 rounded shadow-sm mb-4">
        <div className="row">
          <div className="col-md-2 text-center">
            <img
              src={studentData?.studentImage ? `${import.meta.env.VITE_BASE_URL}${studentData.studentImage}` : '/default-avatar.png'}
              alt="Profile"
              className="rounded-circle img-thumbnail mb-3"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
          </div>
          <div className="col-md-10">
            <h2>{studentData?.studentName}</h2>
            <p className="text-muted">{studentData?.course}</p>
            <div className="row mt-3">
              <div className="col-md-6">
                <p><i className="bi bi-envelope me-2"></i>{studentData?.emailid}</p>
                <p><i className="bi bi-phone me-2"></i>{studentData?.phone}</p>
              </div>
              <div className="col-md-6">
                <p><i className="bi bi-geo-alt me-2"></i>{studentData?.address}</p>
                <p><i className="bi bi-calendar me-2"></i>Joined: {new Date(studentData?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Documents</h5>
              <div className="row g-3">
                {/* Resume */}
                <div className="col-md-4">
                  <div className="document-card p-3 border rounded">
                    <strong className="small">
                      <i className="bi bi-file-text text-primary me-1"></i>
                      Resume
                    </strong>
                    {studentData?.resume && (
                      <div className="d-flex gap-1 mt-2">
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye small"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-download small"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aadhaar Card */}
                <div className="col-md-4">
                  <div className="document-card p-3 border rounded">
                    <strong className="small">
                      <i className="bi bi-card-text text-secondary me-1"></i>
                      Aadhaar Card
                    </strong>
                    {studentData?.aadhaarCard && (
                      <div className="d-flex gap-1 mt-2">
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye small"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-download small"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Bank Details</h5>
              <div className="row g-3">
                {/* Bank Account Details */}
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-bank fs-4 text-primary me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">Account Details</div>
                      <div>{studentData?.bankDetails?.bankName || 'Not provided'}</div>
                      <div>{studentData?.bankDetails?.accountNumber || 'Not provided'}</div>
                    </div>
                  </div>
                </div>

                {/* UPI Details */}
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-phone fs-4 text-success me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">UPI ID</div>
                      <div>{studentData?.bankDetails?.upiId || 'Not provided'}</div>
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
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .btn {
          transition: all 0.3s ease;
        }
        
        .btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
