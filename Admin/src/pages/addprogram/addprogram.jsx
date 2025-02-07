import React, { useState } from 'react';
import './addprogram.css'; // Import the CSS file
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'; // Import necessary components

const AddProgram = () => {
    const navigate = useNavigate(); // Hook for navigation

    const handleCardClickCommon = () => {
        navigate('/commoninputs'); // Redirect to /commoninputs on card click
    };

    const handleCardClickSpecific = () => {
        navigate('/specificinputs'); // Redirect to /specificinputs on card click
    };
    const handleData = () => {
        navigate('/dataupload'); // Redirect to /commoninputs on card click
    };
    return (
        <div className="program-container"><div>
        <h1 className='custom'>Add Program</h1>
        <div className="add-program-container">
            
            <div className="card-container">
                <div className="card" onClick={handleCardClickCommon}>
                    {/* Common Inputs Card */}
                </div>
                <div className="card-title">Common Inputs</div>
            </div>
            <div className="card-container">
                <div className="card" onClick={handleCardClickSpecific}>
                    {/* Specific Inputs Card */}
                </div>
                <div className="card-title">Specific Inputs</div>
            </div>
            <div className="card-container">
                <div className="card" onClick={handleData}>
                    {/* Specific Inputs Card */}
                </div>
                <div className="card-title">Data Upload</div>
            </div>
        </div></div></div>
    );
};

export default AddProgram;
