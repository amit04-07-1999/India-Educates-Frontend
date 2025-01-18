import React, { useState } from "react";
import { Link, useNavigate, Navigate } from 'react-router-dom';
import axios from "axios";

const Signin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/studentlogin`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("student_token", token);
        localStorage.setItem("student_user", JSON.stringify(user));
        localStorage.setItem("student_user_id", user._id);
        setIsAuthenticated(true);
        navigate("/student-dashboard");
      } else {
        setError("Incorrect email or password");
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Incorrect email or password");
      } else {
        setError("An error occurred. Please try again.");
      }
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // This component handles the redirect when authentication state changes
  if (isAuthenticated) {
    return <Navigate to="/student-dashboard" />;
  }

  return (
    <div id="mytask-layout">
      {/* main body area */}
      <div className="main p-2 py-3 p-xl-5 " style={{
        backgroundImage: `url('../Images/Indiaeducates.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#ffffff63',
        backgroundBlendMode: 'overlay'
      }}>
        {/* Body: Body */}
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
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="row g-1 p-3 p-md-4">
                    <div className="col-12 text-center mb-1 mb-lg-5">
                      <h1>Student SignIn</h1>
                      <span>Student Panel</span>
                    </div>
                    <div className="col-12">
                      <div className="mb-2">
                        <label className="form-label">Email address</label>
                        <input
                          type="email"
                          name="email"
                          onChange={handleChange}
                          value={formData.email}
                          className="form-control form-control-lg"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-2">
                        <div className="form-label">
                          <span className="d-flex justify-content-between align-items-center">
                            Password
                            {/* <a
                              className="text-secondary"
                              href="auth-password-reset.html"
                            >
                              Forgot Password?
                            </a> */}
                          </span>
                        </div>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"} // Toggle input type
                            name="password"
                            onChange={handleChange}
                            value={formData.password}
                            className="form-control form-control-lg"
                            placeholder="***************"
                          />
                          <div className="d-flex" style={{ position: "absolute", color: "black", marginLeft: "20rem" }}>
                            <i onClick={toggleShowPassword} className={`bi mt-2 form-control ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 text-center mt-4">
                      <button
                        type="submit"
                        className="btn btn-lg text-uppercase"
                        style={{ backgroundColor: '#0A9400', color: 'white' }}
                        disabled={isLoading} // Disable button while loading
                        alt="signin"
                      >
                        {isLoading ? "Signing in..." : "SIGN IN"} {/* Show loading text */}
                      </button>
                    </div>
                    {error && <p className="text-danger mt-3 text-center">{error}</p>}
                  </form>
                  <div className="col-12 text-center mt-4">
                    <span className="d-flex justify-content-center align-items-center">
                      <span className="me-2">Don't have an account yet?</span>
                      <Link to="/studentsignup" className="me-2" style={{ color: '#005bab', textDecoration: 'underline' }}>
                        SIGN UP 
                      </Link>
                      here
                    </span>
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

export default Signin;
