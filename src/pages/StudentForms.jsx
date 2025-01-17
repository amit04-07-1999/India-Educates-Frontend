import React, { useState, useEffect } from 'react';
import StudentHeader from '../studentCompt/StudentHeader';
import StudentSidebar from '../studentCompt/StudentSidebar';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentForms = () => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    course: '',
    semester: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    gender: '',
    profileImage: null,
    parentName: '',
    parentContact: '',
    bloodGroup: '',
    previousSchool: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('student_token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/student/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }

        const studentData = await response.json();
        
        setFormData(prevState => ({
          ...prevState,
          fullName: studentData.studentName || '',
          email: studentData.emailid || '',
          studentId: studentData.studentId || '',
          phone: studentData.phone || '',
          course: studentData.course || ''
        }));
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    fetchStudentData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        profileImage: file
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('student_token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'profileImage') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      formDataToSend.append('formType', selectedForm);

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/student/submit-form`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Form submission failed');
      }

      await response.json();
      // console.log('Form submitted successfully:', result);
      toast.success("Form submitted successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });
      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);

      
      // alert('Form submitted successfully!');
      setSelectedForm(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Error submitting form. Please try again.');
    }
  };

  const renderFormFields = () => {
    switch(selectedForm) {
      case 'form1':
        return (
          // Admission Form
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Previous School GPA</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="previousGPA"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Desired Major</label>
              <select className="form-select" name="desiredMajor" onChange={handleChange} required>
                <option value="">Select Major</option>
                <option value="computerScience">Computer Science</option>
                <option value="engineering">Engineering</option>
                <option value="business">Business Administration</option>
                <option value="medicine">Medicine</option>
              </select>
            </div>
          </div>
        );

      case 'form2':
        return (
          // Scholarship Form
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Family Annual Income</label>
              <input
                type="number"
                className="form-control"
                name="familyIncome"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Scholarship Type</label>
              <select className="form-select" name="scholarshipType" onChange={handleChange} required>
                <option value="">Select Type</option>
                <option value="merit">Merit Based</option>
                <option value="needBased">Need Based</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
              </select>
            </div>
            <div className="col-12 mb-3">
              <label className="form-label">Academic Achievements</label>
              <textarea
                className="form-control"
                name="achievements"
                rows="3"
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
        );

      case 'form3':
        return (
          // Leave Application
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Leave Start Date</label>
              <input
                type="date"
                className="form-control"
                name="leaveStart"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Leave End Date</label>
              <input
                type="date"
                className="form-control"
                name="leaveEnd"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Leave Type</label>
              <select className="form-select" name="leaveType" onChange={handleChange} required>
                <option value="">Select Type</option>
                <option value="medical">Medical Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="family">Family Emergency</option>
              </select>
            </div>
            <div className="col-12 mb-3">
              <label className="form-label">Reason for Leave</label>
              <textarea
                className="form-control"
                name="leaveReason"
                rows="3"
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
        );

      case 'form4':
        return (
          // Hostel Application
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Room Type</label>
              <select className="form-select" name="roomType" onChange={handleChange} required>
                <option value="">Select Room Type</option>
                <option value="single">Single Room</option>
                <option value="double">Double Sharing</option>
                <option value="triple">Triple Sharing</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Duration (months)</label>
              <input
                type="number"
                className="form-control"
                name="duration"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Meal Plan</label>
              <select className="form-select" name="mealPlan" onChange={handleChange} required>
                <option value="">Select Meal Plan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="nonVegetarian">Non-Vegetarian</option>
                <option value="none">No Meal Plan</option>
              </select>
            </div>
          </div>
        );

      case 'form5':
        return (
          // Library Card Request
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Card Type</label>
              <select className="form-select" name="cardType" onChange={handleChange} required>
                <option value="">Select Card Type</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-control"
                name="department"
                onChange={handleChange}
                required
              />
            </div>
          </div>
        );

      case 'form6':
        return (
          // ID Card Request
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">ID Card Type</label>
              <select className="form-select" name="idType" onChange={handleChange} required>
                <option value="">Select ID Type</option>
                <option value="new">New Card</option>
                <option value="replacement">Replacement</option>
              </select>
            </div>
            {formData.idType === 'replacement' && (
              <div className="col-md-6 mb-3">
                <label className="form-label">Reason for Replacement</label>
                <input
                  type="text"
                  className="form-control"
                  name="replacementReason"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>
        );

      case 'form7':
        return (
          // Exam Registration
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Exam Type</label>
              <select className="form-select" name="examType" onChange={handleChange} required>
                <option value="">Select Exam Type</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="supplementary">Supplementary</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Number of Subjects</label>
              <input
                type="number"
                className="form-control"
                name="subjectCount"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 mb-3">
              <label className="form-label">Special Requirements</label>
              <textarea
                className="form-control"
                name="specialRequirements"
                rows="3"
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        );

      case 'form8':
        return (
          // Club Registration
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Club Name</label>
              <select className="form-select" name="clubName" onChange={handleChange} required>
                <option value="">Select Club</option>
                <option value="sports">Sports Club</option>
                <option value="drama">Drama Club</option>
                <option value="tech">Tech Club</option>
                <option value="music">Music Club</option>
                <option value="art">Art Club</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Position Interest</label>
              <select className="form-select" name="position" onChange={handleChange} required>
                <option value="">Select Position</option>
                <option value="member">General Member</option>
                <option value="leader">Team Leader</option>
                <option value="coordinator">Event Coordinator</option>
              </select>
            </div>
            <div className="col-12 mb-3">
              <label className="form-label">Previous Experience</label>
              <textarea
                className="form-control"
                name="experience"
                rows="3"
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        );

      case 'form9':
        return (
          // Certificate Request
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Certificate Type</label>
              <select className="form-select" name="certificateType" onChange={handleChange} required>
                <option value="">Select Certificate Type</option>
                <option value="completion">Course Completion</option>
                <option value="enrollment">Enrollment</option>
                <option value="degree">Degree</option>
                <option value="transcript">Transcript</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Number of Copies</label>
              <input
                type="number"
                className="form-control"
                name="copies"
                min="1"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 mb-3">
              <label className="form-label">Purpose</label>
              <textarea
                className="form-control"
                name="purpose"
                rows="3"
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFormContent = () => {
    if (!selectedForm) {
      return (
        <div className="text-center py-5">
          <h2>Please select a form type</h2>
          <div className="mt-4 row g-3">
            <div className="col-md-4">
              <button 
                className="btn btn-primary w-100 p-3" 
                onClick={() => setSelectedForm('form1')}
              >
                <i className="bi bi-person-plus-fill mb-2 fs-3"></i>
                <div>Admission Form</div>
              </button>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-success w-100 p-3" 
                onClick={() => setSelectedForm('form2')}
              >
                <i className="bi bi-award-fill mb-2 fs-3"></i>
                <div>Scholarship Form</div>
              </button>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-info w-100 p-3" 
                onClick={() => setSelectedForm('form3')}
              >
                <i className="bi bi-calendar-check mb-2 fs-3"></i>
                <div>Leave Application</div>
              </button>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-warning w-100 p-3" 
                onClick={() => setSelectedForm('form4')}
              >
                <i className="bi bi-building mb-2 fs-3"></i>
                <div>Hostel Application</div>
              </button>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-danger w-100 p-3" 
                onClick={() => setSelectedForm('form5')}
              >
                <i className="bi bi-book-fill mb-2 fs-3"></i>
                <div>Library Card Request</div>
              </button>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-secondary w-100 p-3" 
                onClick={() => setSelectedForm('form6')}
              >
                <i className="bi bi-card-text mb-2 fs-3"></i>
                <div>ID Card Request</div>
              </button>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-dark w-100 p-3" 
                onClick={() => setSelectedForm('form7')}
              >
                <i className="bi bi-mortarboard-fill mb-2 fs-3"></i>
                <div>Exam Registration</div>
              </button>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-primary w-100 p-3" 
                onClick={() => setSelectedForm('form8')}
              >
                <i className="bi bi-people-fill mb-2 fs-3"></i>
                <div>Club Registration</div>
              </button>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-success w-100 p-3" 
                onClick={() => setSelectedForm('form9')}
              >
                <i className="bi bi-journal-text mb-2 fs-3"></i>
                <div>Certificate Request</div>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>
            <button 
              type="button" 
              className="btn btn-link text-decoration-none p-0 me-2"
              onClick={() => setSelectedForm(null)}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            {selectedForm === 'form1' && 'Admission Form'}
            {selectedForm === 'form2' && 'Scholarship Form'}
            {selectedForm === 'form3' && 'Leave Application Form'}
            {selectedForm === 'form4' && 'Hostel Application Form'}
            {selectedForm === 'form5' && 'Library Card Request Form'}
            {selectedForm === 'form6' && 'ID Card Request Form'}
            {selectedForm === 'form7' && 'Exam Registration Form'}
            {selectedForm === 'form8' && 'Club Registration Form'}
            {selectedForm === 'form9' && 'Certificate Request Form'}
          </h3>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setSelectedForm(null)}
          >
            Back to Form Selection
          </button>
        </div>

        {/* Profile Image Section */}
        <div className="mb-4 text-center">
          <div className="profile-image-wrapper mb-3">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile Preview"
                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className="placeholder-image">
                <i className="bi bi-person-circle" style={{ fontSize: '150px' }}></i>
              </div>
            )}
          </div>
          <input
            type="file"
            className="form-control"
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Rest of the form fields remain the same */}
        {/* Personal Information */}
        <h5 className="card-title mb-3">Personal Information</h5>
        <div className="row">
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              readOnly
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <h5 className="card-title mb-3 mt-4">Contact Information</h5>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            required
          ></textarea>
        </div>

        {/* Academic Information */}
        <h5 className="card-title mb-3 mt-4">Academic Information</h5>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Student ID</label>
            <input
              type="text"
              className="form-control"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              readOnly
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Previous School</label>
            <input
              type="text"
              className="form-control"
              name="previousSchool"
              value={formData.previousSchool}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Course</label>
            <select
              className="form-select"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Medicine">Medicine</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Semester</label>
            <select
              className="form-select"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
            >
              <option value="">Select Semester</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">3rd Semester</option>
              <option value="4">4th Semester</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
              <option value="8">8th Semester</option>
            </select>
          </div>
        </div>

        {/* Emergency Contact */}
        <h5 className="card-title mb-3 mt-4">Emergency Contact</h5>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Parent/Guardian Name</label>
            <input
              type="text"
              className="form-control"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Parent/Guardian Contact</label>
            <input
              type="tel"
              className="form-control"
              name="parentContact"
              value={formData.parentContact}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Blood Group</label>
            <select
              className="form-select"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        {/* Form Specific Fields */}
        {renderFormFields()}

        <div className="mt-4">
          <button type="submit" className="btn btn-primary">Submit</button>
          <button type="reset" className="btn btn-secondary ms-2">Reset</button>
        </div>
      </form>
    );
  };

  return (
    <div id="mytask-layout">
      <StudentSidebar />
      <div className="main px-lg-4 px-md-4">
        <StudentHeader />
        <div className="body d-flex py-lg-3 py-md-2">
          <div className="container-xxl">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  {renderFormContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForms;
