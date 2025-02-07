
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Adjust to your Firebase setup file
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if the user has admin access in Firestore before attempting login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isAdmin = await checkAdminAccess(email);
      if (isAdmin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User is an admin');
        // Redirect to admin dashboard or grant access
      } else {
        setError('Access denied. You do not have admin privileges.');
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminAccess = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const { allowedPages } = userData;
        return Array.isArray(allowedPages) && allowedPages.includes('admin');
      } else {
        console.log('No user document found in Firestore.');
        return false;
      }
    } catch (error) {
      console.error('Error checking admin access:', error.message);
      return false;
    }
  };

  return (
    <div className="login-page">
      <div className="login-containner">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder='Enter Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>} {/* Moved here */}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;