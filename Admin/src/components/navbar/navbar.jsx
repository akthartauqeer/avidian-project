import React, { useState } from 'react';
import './navbar.css';
import { FaUserCircle, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // For navigation after logout
import { auth } from '../../firebase'; // Make sure Firebase is properly initialized

const Navbar = () => {
  const [isLogoutVisible, setLogoutVisible] = useState(false);
  const [isConfirmLogoutVisible, setConfirmLogoutVisible] = useState(false); // State for confirmation popup
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Logs the user out from Firebase
      navigate('/login');   // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out:', error); // Optional error handling
    }
  };

  const handleConfirmLogout = () => {
    setConfirmLogoutVisible(true); // Show confirmation popup
  };

  const confirmLogout = () => {
    handleLogout(); // Call the logout function
    setConfirmLogoutVisible(false); // Hide the confirmation popup
  };

  const cancelLogout = () => {
    setConfirmLogoutVisible(false); // Hide the confirmation popup
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
      <h2>Avidian</h2>
      </div>
      <div className="navbar-middle">
        <h2>Admin Panel</h2>
      </div>
      <div className="navbar-right">
        <div
          className="profile-container"
          onMouseEnter={() => setLogoutVisible(true)}
          onMouseLeave={() => setLogoutVisible(false)}
        >
          <FaUserCircle Circle className="profile-icon" />
          {isLogoutVisible && (
            <div className="logout-option" onClick={handleConfirmLogout}>
              Logout
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Popup */}
      {isConfirmLogoutVisible && (
        <div className="modal-content">
          <div className="modal-header">
            Are you sure you want to log out?
          </div>
          <div className='modal-buttons'>
            <button onClick={confirmLogout} className="save-button delete-confirm">Yes</button>
            <button onClick={cancelLogout} className="save-button cancel-button">No</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;