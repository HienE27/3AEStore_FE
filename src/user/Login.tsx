// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "./../contexts/AuthContext";


// interface LoginResponse {
//   token: string;
//   id?: string;
// }

// const Login = () => {
//   const [user_name, setUsername] = useState("");
//   const [password_hash, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [remember, setRemember] = useState(false);

//   const navigate = useNavigate();
//   const { setAuth } = useAuth();


//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const port = window.location.port;

//     try {
//       let res;
//       if (port === "3000") {
//         res = await axios.post<LoginResponse>(
//           "http://localhost:8080/api/staff/login",
//           { user_name, password_hash }
//         );
//         console.log("Login response (staff):", res.data);

//         setAuth(res.data.token);
//         if (remember) localStorage.setItem("rememberMe", "true");
//         else localStorage.removeItem("rememberMe");

//         navigate("/management");
//       } else if (port === "3001") {
//         res = await axios.post<LoginResponse>(
//           "http://localhost:8080/api/customers/login",
//           { user_name, password_hash }
//         );
//         console.log("Login response (customer):", res.data);

//         setAuth(res.data.token);

//         if (res.data.id) {
//           localStorage.setItem("customerId", res.data.id);
//         } else {
//           console.warn("Không có customerId trong phản hồi!");
//         }

//         if (remember) localStorage.setItem("rememberMe", "true");
//         else localStorage.removeItem("rememberMe");

//         navigate("/");
//       } else {
//         setError("Ứng dụng không hỗ trợ đăng nhập trên cổng này.");
//       }
//     } catch (err: any) {
//       console.error("Login error:", err.response?.data || err.message);
//       setError("Đăng nhập không thành công. Vui lòng thử lại.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <section className="section-conten padding-y" style={{ minHeight: "84vh" }}>
//         <div className="card mx-auto" style={{ maxWidth: "380px", marginTop: "100px" }}>
//           <div className="card-body">
//             <h4 className="card-title mb-4">Sign in</h4>
//             {error && <div className="alert alert-danger">{error}</div>}

//             <form onSubmit={handleLogin}>
//               <a href="#!" className="btn btn-facebook btn-block mb-2" onClick={(e) => e.preventDefault()}>
//                 <i className="fab fa-facebook-f"></i> Sign in with Facebook
//               </a>
//               <a href="#!" className="btn btn-google btn-block mb-4" onClick={(e) => e.preventDefault()}>
//                 <i className="fab fa-google"></i> Sign in with Google
//               </a>

//               <div className="form-group">
//                 <input
//                   name="username"
//                   className="form-control"
//                   placeholder="Username"
//                   type="text"
//                   value={user_name}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <input
//                   name="password"
//                   className="form-control"
//                   placeholder="Password"
//                   type="password"
//                   value={password_hash}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="form-group d-flex justify-content-between align-items-center">
//                 <Link to="/forgot-password" className="float-right">
//                   Forgot password?
//                 </Link>
//                 <label className="form-check-label">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     checked={remember}
//                     onChange={(e) => setRemember(e.target.checked)}
//                   />
//                   Remember
//                 </label>
//               </div>

//               <div className="form-group">
//                 <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
//                   {loading ? "Đang đăng nhập..." : "Login"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>

//         <p className="text-center mt-4">
//           Don't have an account? <Link to="/register">Sign up</Link>
//         </p>
//         <br />
//         <br />
//       </section>
//     </div>
//   );
// };

// export default Login;



// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../contexts/AuthContext";


// interface LoginResponse {
//   token: string;
//   id?: string;
//   role?: string; // Thêm role để phân biệt
//   user?: {
//     id: string;
//     user_name: string;
//     role: string;
//   };
// }

// const Login = () => {
//   const [user_name, setUsername] = useState("");
//   const [password_hash, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [remember, setRemember] = useState(false);
//   const [loginType, setLoginType] = useState<'auto' | 'staff' | 'customer'>('auto'); // Thêm option chọn loại login

//   const navigate = useNavigate();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const port = window.location.port;

//     try {
//       let res: any;
      
//       if (port === "3000") {
//         // Port 3000: Hỗ trợ cả staff và customer
        
//         if (loginType === 'auto') {
//           // Thử staff trước, nếu fail thì thử customer
//           try {
//             console.log("🔄 Trying staff login first...");
//             res = await axios.post<LoginResponse>(
//               "http://localhost:8080/api/staff/login",
//               { user_name, password_hash }
//             );
//             console.log("✅ Staff login successful:", res.data);
            
//             // Staff login thành công
//             //localStorage.setItem("token", res.data.token);
//             setAuth(res.data.token);

//             localStorage.setItem("userRole", "staff");
//             localStorage.setItem("userId", res.data.id || res.data.user?.id || "");
            
//             if (remember) localStorage.setItem("rememberMe", "true");
//             else localStorage.removeItem("rememberMe");

//             navigate("/management");
//             return;
            
//           } catch (staffError: any) {
//             console.log("❌ Staff login failed, trying customer...");
            
//             // Nếu staff login fail, thử customer
//             try {
//               res = await axios.post<LoginResponse>(
//                 "http://localhost:8080/api/customers/login",
//                 { user_name, password_hash }
//               );
//               console.log("✅ Customer login successful:", res.data);
              
//               // Customer login thành công
//               //localStorage.setItem("token", res.data.token);
//               setAuth(res.data.token);

//               localStorage.setItem("userRole", "customer");
//               localStorage.setItem("customerId", res.data.id || res.data.user?.id || "");
              
//               if (remember) localStorage.setItem("rememberMe", "true");
//               else localStorage.removeItem("rememberMe");

//               navigate("/");
//               return;
              
//             } catch (customerError: any) {
//               console.error("❌ Both staff and customer login failed");
//               throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
//             }
//           }
//         } else if (loginType === 'staff') {
//           // Force staff login
//           res = await axios.post<LoginResponse>(
//             "http://localhost:8080/api/staff/login",
//             { user_name, password_hash }
//           );
//           console.log("✅ Staff login (forced):", res.data);

//           localStorage.setItem("token", res.data.token);
//           localStorage.setItem("userRole", "staff");
//           localStorage.setItem("userId", res.data.id || res.data.user?.id || "");
          
//           if (remember) localStorage.setItem("rememberMe", "true");
//           else localStorage.removeItem("rememberMe");

//           navigate("/management");
//         } else if (loginType === 'customer') {
//           // Force customer login
//           res = await axios.post<LoginResponse>(
//             "http://localhost:8080/api/customers/login",
//             { user_name, password_hash }
//           );
//           console.log("✅ Customer login (forced):", res.data);

//           localStorage.setItem("token", res.data.token);
//           localStorage.setItem("userRole", "customer");
//           localStorage.setItem("customerId", res.data.id || res.data.user?.id || "");
          
//           if (remember) localStorage.setItem("rememberMe", "true");
//           else localStorage.removeItem("rememberMe");

//           navigate("/");
//         }
        
//       } else if (port === "3001") {
//         // Port 3001: Chỉ customer (giữ nguyên logic cũ)
//         res = await axios.post<LoginResponse>(
//           "http://localhost:8080/api/customers/login",
//           { user_name, password_hash }
//         );
//         console.log("✅ Customer login (port 3001):", res.data);

//         localStorage.setItem("token", res.data.token);
//         localStorage.setItem("userRole", "customer");
//         localStorage.setItem("customerId", res.data.id || res.data.user?.id || "");

//         if (remember) localStorage.setItem("rememberMe", "true");
//         else localStorage.removeItem("rememberMe");

//         navigate("/");
//       } else {
//         setError("Ứng dụng không hỗ trợ đăng nhập trên cổng này.");
//       }
//     } catch (err: any) {
//       console.error("❌ Login error:", err.response?.data || err.message);
//       setError(err.message || "Đăng nhập không thành công. Vui lòng thử lại.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <section className="section-conten padding-y" style={{ minHeight: "84vh" }}>
//         <div className="card mx-auto" style={{ maxWidth: "380px", marginTop: "100px" }}>
//           <div className="card-body">
//             <h4 className="card-title mb-4">
//               Sign in
//               {window.location.port === "3000" && (
//                 <small className="text-muted d-block">Staff & Customer Portal</small>
//               )}
//             </h4>
            
//             {error && <div className="alert alert-danger">{error}</div>}

//             <form onSubmit={handleLogin}>
//               {/* Login Type Selector - Chỉ hiện trên port 3000 */}
//               {window.location.port === "3000" && (
//                 <div className="form-group mb-3">
//                   <label className="form-label small">Loại đăng nhập:</label>
//                   <div className="btn-group w-100" role="group">
//                     <input
//                       type="radio"
//                       className="btn-check"
//                       name="loginType"
//                       id="auto"
//                       checked={loginType === 'auto'}
//                       onChange={() => setLoginType('auto')}
//                     />
//                     <label className="btn btn-outline-primary btn-sm" htmlFor="auto">
//                       Tự động
//                     </label>

//                     <input
//                       type="radio"
//                       className="btn-check"
//                       name="loginType"
//                       id="staff"
//                       checked={loginType === 'staff'}
//                       onChange={() => setLoginType('staff')}
//                     />
//                     <label className="btn btn-outline-secondary btn-sm" htmlFor="staff">
//                       Staff
//                     </label>

//                     <input
//                       type="radio"
//                       className="btn-check"
//                       name="loginType"
//                       id="customer"
//                       checked={loginType === 'customer'}
//                       onChange={() => setLoginType('customer')}
//                     />
//                     <label className="btn btn-outline-info btn-sm" htmlFor="customer">
//                       Customer
//                     </label>
//                   </div>
//                   <small className="text-muted">
//                     {loginType === 'auto' && 'Hệ thống sẽ tự động phát hiện loại tài khoản'}
//                     {loginType === 'staff' && 'Chỉ đăng nhập với tài khoản staff'}
//                     {loginType === 'customer' && 'Chỉ đăng nhập với tài khoản customer'}
//                   </small>
//                 </div>
//               )}

//               {/* Social Login Buttons */}
//               <a href="#!" className="btn btn-facebook btn-block mb-2" onClick={(e) => e.preventDefault()}>
//                 <i className="fab fa-facebook-f"></i> Sign in with Facebook
//               </a>
//               <a href="#!" className="btn btn-google btn-block mb-4" onClick={(e) => e.preventDefault()}>
//                 <i className="fab fa-google"></i> Sign in with Google
//               </a>

//               {/* Username Input */}
//               <div className="form-group">
//                 <input
//                   name="username"
//                   className="form-control"
//                   placeholder="Username"
//                   type="text"
//                   value={user_name}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required
//                 />
//               </div>

//               {/* Password Input */}
//               <div className="form-group">
//                 <input
//                   name="password"
//                   className="form-control"
//                   placeholder="Password"
//                   type="password"
//                   value={password_hash}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>

//               {/* Remember & Forgot Password */}
//               <div className="form-group d-flex justify-content-between align-items-center">
//                 <Link to="/forgot-password" className="float-right">
//                   Forgot password?
//                 </Link>
//                 <label className="form-check-label">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     checked={remember}
//                     onChange={(e) => setRemember(e.target.checked)}
//                   />
//                   Remember
//                 </label>
//               </div>

//               {/* Login Button */}
//               <div className="form-group">
//                 <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
//                   {loading ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm me-2" role="status"></span>
//                       Đang đăng nhập...
//                     </>
//                   ) : (
//                     "Login"
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>

//         <p className="text-center mt-4">
//           Don't have an account? <Link to="/register">Sign up</Link>
//         </p>

//         {/* Debug Info - Remove in production */}
//         {process.env.NODE_ENV === 'development' && (
//           <div className="text-center mt-2">
//             <small className="text-muted">
//               Current port: {window.location.port} | 
//               Login type: {loginType}
//             </small>
//           </div>
//         )}
        
//         <br />
//         <br />
//       </section>
//     </div>
//   );
// };

// export default Login;
















import React, { useState, CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./../contexts/AuthContext";

interface LoginResponse {
  token: string;
  id?: string;
}

// Inline styles for social buttons
const facebookButtonStyle: CSSProperties = {
  backgroundColor: '#3b5998',
  color: '#fff',
  border: 'none',
};
const googleButtonStyle: CSSProperties = {
  backgroundColor: '#DB4437',
  color: '#fff',
  border: 'none',
};

const Login = () => {
  const [user_name, setUsername] = useState("");
  const [password_hash, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const port = window.location.port;

    try {
      let res;
      if (port === "3000") {
        res = await axios.post<LoginResponse>(
          "http://localhost:8080/api/staff/login",
          { user_name, password_hash }
        );
        setAuth(res.data.token);
        if (remember) localStorage.setItem("rememberMe", "true");
        else localStorage.removeItem("rememberMe");
        navigate("/management");
      } else if (port === "3001") {
        res = await axios.post<LoginResponse>(
          "http://localhost:8080/api/customers/login",
          { user_name, password_hash }
        );
        setAuth(res.data.token);
        if (res.data.id) localStorage.setItem("customerId", res.data.id);
        if (remember) localStorage.setItem("rememberMe", "true");
        else localStorage.removeItem("rememberMe");
        navigate("/");
      } else {
        setError("Ứng dụng không hỗ trợ đăng nhập trên cổng này.");
        return;
      }
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      setError("Đăng nhập không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="section-content padding-y" style={{ minHeight: "84vh" }}>
        <div className="card mx-auto" style={{ maxWidth: "380px", marginTop: "100px" }}>
          <div className="card-body">
            <h4 className="card-title mb-4">Sign in</h4>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Social login buttons as <button type="button"> */}
            <button
              type="button"
              style={facebookButtonStyle}
              className="btn w-100 mb-2 d-flex align-items-center justify-content-center"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fab fa-facebook-f me-2"></i>
              Sign in with Facebook
            </button>
            <button
              type="button"
              style={googleButtonStyle}
              className="btn w-100 mb-4 d-flex align-items-center justify-content-center"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fab fa-google me-2"></i>
              Sign in with Google
            </button>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  name="username"
                  className="form-control"
                  placeholder="Username"
                  type="text"
                  value={user_name}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  type="password"
                  value={password_hash}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group d-flex justify-content-between align-items-center">
                <Link to="/forgot-password" className="float-right">
                  Forgot password?
                </Link>
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember
                </label>
              </div>

              <div className="form-group">
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? "Đang đăng nhập..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center mt-4">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        <br />
        <br />
      </section>
    </div>
  );
};

export default Login;

