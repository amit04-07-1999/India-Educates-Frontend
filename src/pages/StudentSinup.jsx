import React, { useState } from "react";
import { Link, Navigate } from 'react-router-dom';
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    emailid: "",
    password: "",
    phone: "+91 ",
  });
  const [isSignIn, setIsSignIn] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      for (let key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      formDataToSend.append('studentImage', 'default.jpeg');

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/students`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      alert("Signup successful!");
      setIsSignIn(true);
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Signup failed!");
    }
  };

  if (isSignIn) {
    return <Navigate to="/studentsignin" />;
  }

  return (
    <>
      <div id="mytask-layout">
        <div className="main p-2 py-3 p-xl-5" style={{ 
          backgroundImage: `url('../Images/Indiaeducates.jpg')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundColor: '#ffffff63',
          backgroundBlendMode: 'overlay'
        }}>
          <div className="body d-flex p-0 p-xl-5">
            <div className="container-xxl">
              <div className="row g-0">
                <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center rounded-lg auth-h100">
                  <div style={{ maxWidth: "50rem" }}>
                    <img
                      src="../Images/IndiaEducatesLogo.png"
                      className="mb-4"
                      style={{ width: "-webkit-fill-available" }}
                    />
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-center align-items-center border-0 rounded-lg auth-h100">
                  <div
                    className="w-100 p-3 p-md-5 card border-0 bg-dark text-light"
                    style={{ maxWidth: "32rem" }}
                  >
                    <form className="row g-1 p-3 p-md-4">
                      <div className="col-12 text-center mb-1 mb-lg-5">
                        <h1>Student SignUp</h1>
                        <span>Create your account as a student</span>
                      </div>
                      <div className="col-12">
                        <div className="mb-2">
                          <label className="form-label">Full name</label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="John"
                            name="studentName"
                            value={formData.studentName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-2">
                          <label className="form-label">Email address</label>
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            placeholder="name@example.com"
                            name="emailid"
                            value={formData.emailid}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-2">
                          <label className="form-label">Phone Number</label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="+91 1234567890"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            maxLength={14}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-2">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control form-control-lg"
                            placeholder="8+ characters required"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 text-center mt-4">
                        <button
                          type="submit"
                          className="btn btn-lg text-uppercase"
                          style={{ backgroundColor: '#0A9400', color: 'white' }}
                          onClick={handleSubmit}
                        >
                          SIGN UP
                        </button>
                      </div>
                      <div className="col-12 text-center mt-4">
                        <span className="d-flex justify-content-center align-items-center">
                          <span className="me-2">Already have an account?</span>
                          <Link to="/studentsignin" className="me-2" style={{ color: '#005bab', textDecoration: 'underline' }}>
                            SIGN IN 
                          </Link>
                          here
                        </span>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
