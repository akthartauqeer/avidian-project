import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar/navbar';
import Sidebar from './components/Sidebar/sidebar';
import Home from './Pages/Home/Home';
import About from './Pages/About/About';
import Settings from './Pages/Settings/Settings';
import Login from './Pages/Login/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Footer from './components/Footer/Footer';
import DynamicProgramPage from './Pages/DynamicProgramPage/DynamicProgram';
import ResetPassword from './Pages/ResetPassword/ResetPssword';

const App = () => {
  const [selectedOption, setSelectedOption] = useState(() => {
    return localStorage.getItem('selectedOption') || ''; 
  });

  const location = useLocation();
  const navigate = useNavigate();
  const [selectedValues, setSelectedValues] = useState({});

  const hideSidebarRoutes = ['/', '/login', '/reset-password'];
  const hideNavbarRoutes = ['/login', '/reset-password'];

  const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  const loggedIn = window.localStorage.getItem('isLoggedin');

  useEffect(() => {
    if (!loggedIn) {
      if (location.pathname !== '/login' && location.pathname !== '/reset-password') {
        navigate('/login');
      }
    } else if (location.pathname === '/login') {
      navigate('/');
    }
  }, [loggedIn, location.pathname, navigate]);

  return (
    <div className="app-container">
      <ToastContainer />
      {shouldShowSidebar && (
        <Sidebar selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      )}
      <div className="main-content">
        {shouldShowNavbar && <Navbar selectedOption={selectedOption} />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home selectedOption={selectedOption} setSelectedOption={setSelectedOption} />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/:docName"
            element={<DynamicProgramPage setSelectedValues={setSelectedValues} selectedValues={selectedValues} />}
          />

          

        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
