import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const Register = () => {
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [repeatPasswordError, setRepeatPasswordError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [agree, setAgree] = useState(true); // state quản lý checkbox

  const navigate = useNavigate();

  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/\d/.test(password)) return "Password must contain at least one number";
    return ""; // Hợp lệ
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "F",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:8080/customer/search/existsByEmail?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const exists = await response.json();
        if (exists === true) {
          setEmailError("Email already exists");
        } else {
          setEmailError("");
        }
      } else {
        setEmailError("Error checking email");
      }
    } catch (err) {
      console.error("Failed to check email:", err);
      setEmailError("Server error while checking email");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    if (name === "email") {
      checkEmailExists(value);
    }

    if (name === "password") {
      const errorMsg = validatePassword(value);
      setPasswordError(errorMsg);

      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setRepeatPasswordError("Passwords do not match");
      } else {
        setRepeatPasswordError("");
      }
    }

    if (name === "password" || name === "confirmPassword") {
      if (name === "confirmPassword" && value !== updatedFormData.password) {
        setRepeatPasswordError("Passwords do not match");
      } else if (name === "password" && updatedFormData.confirmPassword !== value) {
        setRepeatPasswordError("Passwords do not match");
      } else {
        setRepeatPasswordError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agree) {
      setError("You must agree to the terms and conditions");
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      setError("Please fix the password before submitting");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (emailError) {
      setError("Please fix the email before submitting");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          gender: formData.gender === "M" ? "M" : "F",
          user_name: formData.username,
          password_hash: formData.password,
        }),
      });

      if (response.ok) {
        alert("Đăng Ký Thành Công");
        navigate("/login");
      } else {
        const errorData = await response.json();
        alert("Registration failed: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while registering");
    }
  };

  return (
    <div>
      <section className="section-content padding-y">
        <div className="card mx-auto" style={{ maxWidth: "520px", marginTop: "40px" }}>
          <article className="card-body">
            <header className="mb-4">
              <h4 className="card-title">Sign up</h4>
            </header>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="col form-group">
                  <label>First name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col form-group">
                  <label>Last name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className={`form-control ${emailError ? "is-invalid" : ""}`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <small className="form-text text-muted">We'll never share your email.</small>
                {emailError && <div className="text-danger">{emailError}</div>}
              </div>
              <div className="form-group">
                <label className="custom-control custom-radio custom-control-inline">
                  <input
                    className="custom-control-input"
                    type="radio"
                    name="gender"
                    value="M"
                    checked={formData.gender === "M"}
                    onChange={handleChange}
                  />
                  <span className="custom-control-label"> Male </span>
                </label>
                <label className="custom-control custom-radio custom-control-inline">
                  <input
                    className="custom-control-input"
                    type="radio"
                    name="gender"
                    value="F"
                    checked={formData.gender === "F"}
                    onChange={handleChange}
                  />
                  <span className="custom-control-label"> Female </span>
                </label>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>User Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>Create password</label>
                  <input
                    className={`form-control ${passwordError ? "is-invalid" : ""}`}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {passwordError && (
                    <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      {passwordError}
                    </div>
                  )}
                </div>

                <div className="form-group col-md-6">
                  <label>Repeat password</label>
                  <input
                    className={`form-control ${repeatPasswordError ? "is-invalid" : ""}`}
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {repeatPasswordError && (
                    <div className="text-danger" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      {repeatPasswordError}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <div className="custom-control-label">
                    I agree with <a href="#!">terms and conditions</a>
                  </div>
                </label>
              </div>

              {error && <div className="text-danger mb-3">{error}</div>}

              <div className="form-group">
                <button type="submit" className="btn btn-primary btn-block">
                  Register
                </button>
              </div>
            </form>
          </article>
        </div>
        <p className="text-center mt-4">
          Have an account? <Link to="/login">Log In</Link>
        </p>
      </section>
    </div>
  );
};

export default Register;
