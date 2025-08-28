import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token khỏi localStorage
    navigate("/login"); // Chuyển hướng về trang login
  };
  return (
    // <div className="main-header" style={{ marginLeft: '250px' }}>
      <div className="main-header" style={{ marginLeft: 'calc(var(--sidebar-width, 250px) + 0px)' }}>
      <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom w-100">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Search input moved slightly to the right */}
          <nav className="navbar navbar-header-left navbar-expand-lg navbar-form nav-search ps-4">
            <div className="input-group">
              <div className="input-group-prepend">
                <button type="submit" className="btn btn-search pe-1">
                  <i className="fa fa-search search-icon"></i>
                </button>
              </div>
              <input type="text" placeholder="Search ..." className="form-control" />
            </div>
          </nav>

          <ul className="navbar-nav topbar-nav align-items-center">
            <li className="nav-item topbar-user dropdown hidden-caret">
              <a
                className="dropdown-toggle profile-pic"
                data-bs-toggle="dropdown"
                href="#"
                aria-expanded="false"
              >
                <div className="avatar-sm">
                  <img
                    src="/assets/img/profile.jpg"
                    alt="User"
                    className="avatar-img rounded-circle"
                  />
                </div>
                <span className="profile-username">
                  <span className="op-7">Hi,</span>
                  <span className="fw-bold">Hizrian</span>
                </span>
              </a>
              <ul className="dropdown-menu dropdown-user animated fadeIn">
                <div className="dropdown-user-scroll scrollbar-outer">
                  <li>
                    <div className="user-box">
                      <div className="avatar-lg">
                        <img
                          src="/assets/img/profile.jpg"
                          alt="profile"
                          className="avatar-img rounded"
                        />
                      </div>
                      <div className="u-text">
                        <h4>Hizrian</h4>
                        <p className="text-muted">hello@example.com</p>
                        <a href="/profile" className="btn btn-xs btn-secondary btn-sm">View Profile</a>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="#">My Profile</a>
                    <a className="dropdown-item" href="#">My Balance</a>
                    <a className="dropdown-item" href="#">Inbox</a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="#">Account Setting</a>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="nav-link btn btn-link">
                      <i className="fa fa-power-off"></i>
                        Logout
                    </button>
                  </li>
                </div>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Header;
