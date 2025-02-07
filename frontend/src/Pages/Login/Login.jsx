import React, { useState } from 'react';
import './Login.css';
import { FaUser, FaLock } from "react-icons/fa";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 
import { doc, getDoc } from 'firebase/firestore'; // For Firestore queries
import { auth, db } from "../../firebase";  

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false); // State for showing forgot password form
    const navigate = useNavigate();

    const handleForgotPasswordClick = async (event) => {
        event.preventDefault();
        setIsForgotPassword(true); // Show forgot password form
    };

    const handlePasswordReset = async () => {
        if (!email) {
            toast.error('Please enter your email to reset password.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset link has been sent to your email!');
            setIsForgotPassword(false); // Hide forgot password form after sending email
        } catch (error) {
            toast.error('Failed to send reset email. Please check your email address.');
            console.error(error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
          // Sign in with email and password
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
      
          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', user.uid); // Assuming UID is document ID
          const userDoc = await getDoc(userDocRef);
      
          if (userDoc.exists()) {
            const userData = userDoc.data();
      
            // Save allowedPages to localStorage
            window.localStorage.setItem("allowedPages", JSON.stringify(userData.allowedPages));
            
            // Set isLoggedin flag
            window.localStorage.setItem("isLoggedin", true);
      
            // Redirect to home or any other page
            navigate('/');
          } else {
            toast.error("User data not found");
          }
        } catch (error) {
          toast.error('Invalid username or password');
          console.error(error.message);
        }
    };

    return (
        <div className="login-body">
            <div className="wrapper">
                {isForgotPassword ? (
                   <div className="forgot-password-form">
                   <h2>Reset Your Password</h2>
                   <label>
                       Email:
                       <input
                           type="email"
                           placeholder='Enter your email'
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                       />
                   </label>
                   <div className="forgot-password-buttons">
                       <button onClick={handlePasswordReset}>Send Reset Email</button>
                       <button onClick={() => setIsForgotPassword(false)}>Back to Login</button>
                   </div>
               </div>
                ) : (
                    <form onSubmit={handleSubmit}>
<div className="txt">Tauqeer Avidian Project</div>
                          <div className="input-box">
                            <input
                                type="email" 
                                className='form-control'
                                placeholder='Username' 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                            <FaUser className='icon'/>
                        </div>
                        <div className="input-box">
                            <input
                                type="password" 
                                className='form-control'
                                placeholder='Password' 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />   
                            <FaLock className='icon'/>  
                        </div>

                        <div className='forgot'>
                            <a href="#" onClick={handleForgotPasswordClick}>Forgot password?</a>
                        </div>

                        <button type='submit'>Login</button>            
                    </form>
                )}
            </div>
        </div> 
    );
};

export default Login;
