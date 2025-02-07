import React, { useState } from 'react';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('changePassword'); // Default state set to 'changePassword'
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user && user.email === email) {
      const credential = EmailAuthProvider.credential(email, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        
        // Sign out the user from all devices
        await signOut(auth); 
        localStorage.removeItem("isLoggedin"); // Remove login state from localStorage
        setMessage('Password updated successfully! You have been logged out of all devices.');
        navigate('/login'); // Redirect to login page
      } catch (error) {
        console.error('Error updating password:', error);
        setError('Failed to update password. Please check your current password.');
      }
    } else {
      setError('Incorrect email. Please enter your logged-in email.');
    }
  };

  const handleForgotPassword = async () => {
    setMessage('');
    setError('');
    
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      
      // Sign out the user from all devices
      await signOut(auth); 
      localStorage.removeItem("isLoggedin"); // Remove login state from localStorage
      setMessage('Password reset email sent. Please check your inbox. You have been logged out of all devices.');
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error sending password reset email:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No user found with this email address. Please check and try again.');
      } else if (error.code === 'auth/invalid-email') {
        setError('The email address is not valid. Please enter a valid email.');
      } else {
        setError('Failed to send password reset email. Please check your email address.');
      }
    }
  };

  const handleAdminRedirect = () => {
    window.location.href = 'http://localhost:3002'; // Redirect to local admin panel
  };

  return (
    <div className="settings-container">
      <div className="settings-menu">
        <button onClick={() => setActiveSection('changePassword')}>Change Password</button>
        <button onClick={() => setActiveSection('forgotPassword')}>Forgot Password</button>
      </div>

      {activeSection === 'changePassword' && (
        <div className="change-password-form">
          <label className="label">
            Confirm Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </label>
          <label className="label">
            Current Password:
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </label>
          <label className="label">
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </label>
          <label className="label">
            Confirm New Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </label>
          <button onClick={handleChangePassword}>Change Password</button>
        </div>
      )}

      {activeSection === 'forgotPassword' && (
        <div className="forgot-password-form">
          <label className="label">
            Enter your email to reset password:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </label>
          <button onClick={handleForgotPassword}>Send Reset Email</button>
        </div>
      )}

      <div className="icon-container">
        <span className="admin-panel-link" onClick={handleAdminRedirect}>
          Go to Admin Panel
        </span>
        <FaArrowRight onClick={handleAdminRedirect} className="admin-icon" />
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Settings;
