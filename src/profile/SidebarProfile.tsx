import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProfileProps {
  className?: string;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({ className = "" }) => {
  const location = useLocation();
  
  // Function để kiểm tra active state
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <div className={`card border-0 shadow-sm ${className}`}>
      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          <Link 
            className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${isActive('/profile') ? 'active' : ''}`} 
            to="/profile"
          >
            <i className="fas fa-user me-3 text-muted"></i>
            Account overview
          </Link>
          <Link 
            className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${isActive('/profile/address') ? 'active' : ''}`} 
            to="/profile/address"
          >
            <i className="fas fa-map-marker-alt me-3 text-muted"></i>
            My Address
          </Link>
          <Link 
            className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${isActive('/profile/orders') ? 'active' : ''}`} 
            to="/profile/orders"
          >
            <i className="fas fa-shopping-bag me-3 text-muted"></i>
            My Orders
          </Link>
          <Link 
            className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${isActive('/profile/wishlist') ? 'active' : ''}`} 
            to="/profile/wishlist"
          >
            <i className="fas fa-heart me-3 text-muted"></i>
            My wishlist
          </Link>
          <Link 
            className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${isActive('/profile/seller') ? 'active' : ''}`} 
            to="/profile/seller"
          >
            <i className="fas fa-store me-3 text-muted"></i>
            My Selling Items
          </Link>
          <Link 
            className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${isActive('/profile/settings') ? 'active' : ''}`} 
            to="/profile/settings"
          >
            <i className="fas fa-cog me-3 text-muted"></i>
            Settings
          </Link>
          <Link 
            className="list-group-item list-group-item-action d-flex align-items-center py-3 text-danger" 
            to="/logout"
          >
            <i className="fas fa-sign-out-alt me-3"></i>
            Log out
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SidebarProfile;