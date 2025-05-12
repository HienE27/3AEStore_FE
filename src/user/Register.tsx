import React from "react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div>
      <section className="section-content padding-y">
        {/* ============================ COMPONENT REGISTER   ================================= */}
        <div className="card mx-auto" style={{ maxWidth: "520px", marginTop: "40px" }}>
          <article className="card-body">
            <header className="mb-4">
              <h4 className="card-title">Sign up</h4>
            </header>
            <form>
              <div className="form-row">
                <div className="col form-group">
                  <label>First name</label>
                  <input type="text" className="form-control" placeholder="Enter your first name" title="First Name" />
                </div> {/* form-group end.// */}
                <div className="col form-group">
                  <label>Last name</label>
                  <input type="text" className="form-control" placeholder="Enter your last name" title="Last Name" />
                </div> {/* form-group end.// */}
              </div> {/* form-row end.// */}
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" placeholder="Enter your email" title="Email Address" />
                <small className="form-text text-muted">We'll never share your email with anyone else.</small>
              </div> {/* form-group end.// */}
              <div className="form-group">
                <label className="custom-control custom-radio custom-control-inline">
                  <input className="custom-control-input" defaultChecked type="radio" name="gender" value="option1" />
                  <span className="custom-control-label"> Male </span>
                </label>
                <label className="custom-control custom-radio custom-control-inline">
                  <input className="custom-control-input" type="radio" name="gender" value="option2" />
                  <span className="custom-control-label"> Female </span>
                </label>
              </div> {/* form-group end.// */}
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>City</label>
                  <input type="text" className="form-control" title="City" placeholder="Enter your city" />
                </div> {/* form-group end.// */}
                <div className="form-group col-md-6">
                  <label>Country</label>
                  <label htmlFor="inputState">Country</label>
                  <select id="inputState" className="form-control" title="Country">
                    <option> Choose...</option>
                    <option>Uzbekistan</option>
                    <option>Russia</option>
                    <option selected={true}>United States</option>
                    <option>India</option>
                    <option>Afghanistan</option>
                  </select>
                </div> {/* form-group end.// */}
              </div> {/* form-row.// */}
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>Create password</label>
                  <input className="form-control" type="password" title="Create Password" placeholder="Enter your password" />
                </div> {/* form-group end.// */}
                <div className="form-group col-md-6">
                  <label>Repeat password</label>
                  <input className="form-control" type="password" title="Repeat Password" placeholder="Repeat your password" />
                </div> {/* form-group end.// */}
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary btn-block"> Register </button>
              </div> {/* form-group// */}
              <div className="form-group">
                <label className="custom-control custom-checkbox">
                  <input type="checkbox" className="custom-control-input" defaultChecked />
                  <div className="custom-control-label">
                    I am agree with <a href="#">terms and conditions</a>
                  </div>
                </label>
              </div> {/* form-group end.// */}
            </form>
          </article> {/* card-body.// */}
        </div> {/* card .// */}
        <p className="text-center mt-4">
          Have an account? <Link to="/login">Log In</Link>
        </p>
        <br />
        <br />
        {/* ============================ COMPONENT REGISTER END.// ================================= */}
      </section>
    </div>
  );
};

export default Register;
