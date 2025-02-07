// src/components/Footer/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <span className="footer-text">
          &copy; Tauqeer Avidian Project.
        </span>
        <a
          href="mailto:akthartauqeer@gmail.com"
          className="contact-link"
        >
          Contact Us
        </a>
      </div>
    </footer>
  );
};

export default Footer;
