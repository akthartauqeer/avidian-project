import React, { useState } from 'react';
import './navbar.css';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation hook

function Navbar({ selectedOption }) {
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    window.localStorage.removeItem('isLoggedin');
    console.log('User logged out');
    setLogoutModalVisible(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  const handleLogoClick = () => {
    // Check if we are already on the home page
    if (location.pathname === '/') {
      // Open the external site in a new tab
      window.open('https://www.avidian.com/', '_blank');
    } 
  };
  const isRootPath = location.pathname === "/";

  return (
    <div className="navbar">
      <div className="navbar-logo" onClick={handleLogoClick}>
<h3>Avidian </h3>
      </div>
      <div className="navbar-center">
      {isRootPath ? "Homepage" : selectedOption}
      </div>
      <div className="navbar-options">
        <div className="profile-icon" onClick={handleLogout}>
          <FaUserCircle />
          <div className="logout">Logout</div>
        </div>
      </div>

      {/* Modal for logout confirmation */}
      {isLogoutModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Are you sure you want to logout?</h2>
            <div className="modal-actions">
              <button onClick={confirmLogout}>Yes</button>
              <button onClick={cancelLogout}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
