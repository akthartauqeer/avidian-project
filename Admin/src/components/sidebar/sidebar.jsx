// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink
import './sidebar.css'; // Import the CSS file

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="sidebar-options">
        
          <NavLink 
            to="/addprogram" style={{marginTop:5}}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            Add Program
          </NavLink>
      
          <NavLink 
            to="/adduser" 
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            Add New User
          </NavLink>
          <NavLink 
            to="/programdatabase" 
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            Program Database
          </NavLink>
          <NavLink 
            to="/placeholder" 
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            User Database
          </NavLink>
          
        
      </ul>
    </div>
  );
};

export default Sidebar;
