import React from "react";
import { Link } from "react-router-dom"; // Import Link từ react-router-dom

const Login = () => {
  return (
    <div>
      <section className="section-conten padding-y" style={{ minHeight: "84vh" }}>
        <div className="card mx-auto" style={{ maxWidth: "380px", marginTop: "100px" }}>
          <div className="card-body">
            <h4 className="card-title mb-4">Sign in</h4>
            <form>
              <a href="#" className="btn btn-facebook btn-block mb-2">
                <i className="fab fa-facebook-f"></i> &nbsp; Sign in with Facebook
              </a>
              <a href="#" className="btn btn-google btn-block mb-4">
                <i className="fab fa-google"></i> &nbsp; Sign in with Google
              </a>
              <div className="form-group">
                <input name="" className="form-control" placeholder="Username" type="text" />
              </div> {/* form-group// */}
              <div className="form-group">
                <input name="" className="form-control" placeholder="Password" type="password" />
              </div> {/* form-group// */}
              <div className="form-group">
                <a href="#" className="float-right">Forgot password?</a> 
                <label className="float-left custom-control custom-checkbox"> 
                  <input type="checkbox" className="custom-control-input" checked /> 
                  <div className="custom-control-label"> Remember </div> 
                </label>
              </div> {/* form-group form-check .// */}
              <div className="form-group">
                <button type="submit" className="btn btn-primary btn-block"> Login </button>
              </div> {/* form-group// */}
            </form>
          </div> 
        </div> 
        <p className="text-center mt-4">Don't have an account? <Link to="/register">Sign up</Link></p>
        <br /><br />
      </section>
    </div>
  );
};

export default Login;
