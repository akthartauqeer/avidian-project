import React from 'react';
import './homeHeader.css';
import { FaInfoCircle, FaCalendarAlt, FaUser } from 'react-icons/fa';

const HomeHeader = () => {
    return (
        <div className="home-header">
            <div className="header-left">
                {/* Replace the src with your actual image path */}
                Tauqeer's Avidian Project
                {/* <img src="/LFER.png" alt="Header Logo" className="header-image" /> */}
            </div>
            <div className="header-middle">
                <FaInfoCircle />
                <span className="description-text">
            This project was developed as a technical home assignment by Tauqeer Akthar
                </span>
            </div>
            <div className="header-right">
                <div className="section">
                    <FaCalendarAlt className="icon" />
                    <span>Submitted on: 6 February 2025</span>
                </div>
                <div className="section">
                    <FaUser className="icon" />
                    <span>Avidian full stack developer</span>
                </div>
            </div>
        </div>
    );
}

export default HomeHeader;
