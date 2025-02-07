import { StrictMode } from 'react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from "react-router-dom";
import Modal from 'react-modal';

// Bind react-modal to the app root element for accessibility
Modal.setAppElement('#root');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
