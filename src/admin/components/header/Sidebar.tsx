import React, { useState, useEffect } from 'react';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Hizrian',
    email: 'hello@example.com'
  });

  // Cập nhật CSS variable khi state thay đổi
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isCollapsed ? '80px' : '300px'
    );
  }, [isCollapsed]);

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const getUserInfo = () => {
      try {
        // Kiểm tra localStorage
        const storedUser = localStorage.getItem('userInfo');
        const token = localStorage.getItem('token');
        
        console.log('StoredUser:', storedUser); // Debug
        console.log('Token:', token); // Debug
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          console.log('Parsed user:', user); // Debug
          
          setUserInfo({
            name: user.name || user.username || user.fullName || 'Admin',
            email: user.email || 'admin@example.com'
          });
        } else {
          // Thử lấy từ token hoặc các nguồn khác
          const userFromToken = localStorage.getItem('user');
          const currentUser = localStorage.getItem('currentUser');
          
          if (userFromToken) {
            const user = JSON.parse(userFromToken);
            setUserInfo({
              name: user.name || user.username || user.fullName || 'Admin',
              email: user.email || 'admin@example.com'
            });
          } else if (currentUser) {
            const user = JSON.parse(currentUser);
            setUserInfo({
              name: user.name || user.username || user.fullName || 'Admin',
              email: user.email || 'admin@example.com'
            });
          } else {
            // Fallback mặc định
            setUserInfo({
              name: 'Admin',
              email: 'admin@example.com'
            });
          }
        }
      } catch (error) {
        console.error('Error getting user info:', error);
        // Fallback khi có lỗi
        setUserInfo({
          name: 'Admin',
          email: 'admin@example.com'
        });
      }
    };
    
    getUserInfo();
    
    // Listen for storage changes
    window.addEventListener('storage', getUserInfo);
    return () => window.removeEventListener('storage', getUserInfo);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    
    // Reset user info về mặc định
    setUserInfo({
      name: 'Admin',
      email: 'admin@example.com'
    });
    
    window.location.href = "/login";
  };

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        width: isCollapsed ? '80px' : '300px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Section with Logo and Toggle */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>

        {/* Logo Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginRight: '40px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: isCollapsed ? '0' : '12px',
            transition: 'all 0.3s ease'
          }}>
            <i className="fas fa-cog" style={{ color: 'white', fontSize: '18px' }}></i>
          </div>
          {!isCollapsed && (
            <div>
              <h4 style={{ 
                color: 'white', 
                margin: 0, 
                fontWeight: '600',
                fontSize: '20px'
              }}>Admin</h4>
              <p style={{ 
                color: 'rgba(255,255,255,0.6)', 
                margin: 0, 
                fontSize: '12px'
              }}>Management Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Search Section */}
      {!isCollapsed && (
        <div style={{ padding: '20px 20px 10px 20px' }}>
          <div style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <button 
              type="submit" 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                padding: '12px 15px',
                cursor: 'pointer'
              }}
            >
              <i className="fa fa-search"></i>
            </button>
            <input 
              type="text" 
              placeholder="Search ..." 
              style={{
                flex: 1,
                padding: '12px 15px 12px 0',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '10px 0'
      }}>
        <div>
          <ul className="nav nav-secondary" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {/* Home Button - Nút đầu tiên */}
            <li style={{ margin: '4px 16px' }}>
              <a
                href="/"
                className="nav-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  background: 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '8px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                  e.currentTarget.style.color = '#22c55e';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <i className="fas fa-home" style={{ 
                  marginRight: isCollapsed ? '0' : '12px',
                  fontSize: '16px',
                  width: '20px',
                  textAlign: 'center',
                  color: '#22c55e'
                }}></i>
                {!isCollapsed && (
                  <span style={{ margin: 0, fontWeight: '600' }}>Trang chủ</span>
                )}
              </a>
            </li>

            {/* Divider */}
            {!isCollapsed && (
              <li style={{ margin: '8px 16px' }}>
                <div style={{
                  height: '1px',
                  background: 'rgba(255,255,255,0.1)',
                  margin: '8px 0'
                }}></div>
              </li>
            )}
            
            {/* Other Menu Items */}
            {[
              { to: "/management/product", icon: "fas fa-box", label: "Sản phẩm" },
              { to: "/management/category", icon: "fas fa-tags", label: "Danh mục" },
              { to: "/management/order", icon: "fas fa-shopping-cart", label: "Đơn hàng" },
              { to: "/management/user", icon: "fas fa-users", label: "Người dùng" },
              { to: "/management/news", icon: "fas fa-newspaper", label: "Tin tức" }
            ].map((item, index) => (
              <li key={index} style={{ margin: '4px 16px' }}>
                <a
                  href={item.to}
                  className="nav-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    color: 'rgba(255,255,255,0.7)',
                    background: 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    fontWeight: '500',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <i className={item.icon} style={{ 
                    marginRight: isCollapsed ? '0' : '12px',
                    fontSize: '16px',
                    width: '20px',
                    textAlign: 'center'
                  }}></i>
                  {!isCollapsed && (
                    <span style={{ margin: 0 }}>{item.label}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* User Profile Section */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '12px',
            background: showUserMenu ? 'rgba(255,255,255,0.1)' : 'transparent',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!showUserMenu) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!showUserMenu) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {/* Avatar */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            overflow: 'hidden',
            marginRight: isCollapsed ? '0' : '12px',
            border: '2px solid rgba(255,255,255,0.2)',
            background: '#3b82f6'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              fontWeight: '600'
            }}>
              {userInfo.name.charAt(0).toUpperCase()}
            </div>
          </div>
          
          {!isCollapsed && (
            <>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: 'white', 
                  fontWeight: '600',
                  fontSize: '14px',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Hi, </span>
                  {userInfo.name}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '12px'
                }}>{userInfo.email}</div>
              </div>
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`} 
                 style={{ 
                   color: 'rgba(255,255,255,0.6)', 
                   fontSize: '12px',
                   transition: 'transform 0.3s ease'
                 }}></i>
            </>
          )}
        </div>

        {/* User Dropdown Menu */}
        {showUserMenu && !isCollapsed && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '0',
            marginBottom: '10px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            zIndex: 1001,
            overflow: 'hidden'
          }}>
            {/* User Info Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginRight: '12px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ 
                    color: 'white', 
                    margin: 0, 
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>{userInfo.name}</h4>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    margin: 0, 
                    fontSize: '13px'
                  }}>{userInfo.email}</p>
                  <a href="/profile" style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '4px 12px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  }}>
                    View Profile
                  </a>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '8px 0' }}>
              {[
                { icon: 'fas fa-user', label: 'My Profile', href: '/profile' },
                { icon: 'fas fa-wallet', label: 'My Balance', href: '#' },
                { icon: 'fas fa-inbox', label: 'Inbox', href: '#' },
                { icon: 'fas fa-cog', label: 'Account Setting', href: '#' }
              ].map((item, index) => (
                <a key={index} href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.paddingLeft = '24px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                  e.currentTarget.style.paddingLeft = '20px';
                }}>
                  <i className={item.icon} style={{ 
                    marginRight: '12px', 
                    width: '16px',
                    fontSize: '14px'
                  }}></i>
                  {item.label}
                </a>
              ))}
            </div>

            {/* Logout Button */}
            <div style={{ 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 0'
            }}>
              <button 
                onClick={handleLogout}
                className="nav-link btn btn-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '500',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.paddingLeft = '24px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.paddingLeft = '20px';
                }}
              >
                <i className="fa fa-power-off" style={{ 
                  marginRight: '12px', 
                  width: '16px',
                  fontSize: '14px'
                }}></i>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;