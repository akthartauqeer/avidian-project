import React, { useState, useEffect } from 'react';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResetPassword.css'

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [oobCode, setOobCode] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('oobCode'); // Get the oobCode from the URL
        if (!code) {
            setError('Invalid password reset link.');
            return;
        }
        setOobCode(code);
    }, [location]);

    const handleResetPassword = async () => {
        setMessage('');
        setError('');
        setIsLoading(true); // Set loading state

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false); // Reset loading state
            return;
        }

        const auth = getAuth();
        try {
            // Verify the password reset code
            await verifyPasswordResetCode(auth, oobCode);
            // Confirm the password reset with the new password
            await confirmPasswordReset(auth, oobCode, newPassword);
            setMessage('Password has been reset successfully. You can now log in.');
            // Optionally, redirect the user to the login page after successful reset
            navigate('/login'); // Adjust this path to your login route
        } catch (error) {
            console.error('Error resetting password:', error);
            setError('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    return (
        <div>
            <h2>Reset Your Password</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                <label>
                    New Password:
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength={6} // Example minimum length requirement
                    />
                </label>
                <label>
                    Confirm New Password:
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                    />
                </label>
                <button type="submit" disabled={isLoading}>{isLoading ? 'Resetting...' : 'Reset Password'}</button>
                {message && <p className="success-message" aria-live="polite">{message}</p>}
                {error && <p className="error-message" aria-live="assertive">{error}</p>}
            </form>
        </div>
    );
};

export default ResetPassword;
