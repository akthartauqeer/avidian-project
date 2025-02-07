import React, { useState, useEffect } from 'react';
import './sidebar.css';
import { FaBars, FaHome, FaCog, FaClipboardList, FaInfoCircle, FaBook, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function Sidebar({ selectedOption, setSelectedOption }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [allowedPages, setAllowedPages] = useState([]);
  const [Pages, setPages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAllowedPages = JSON.parse(localStorage.getItem('allowedPages'));
    if (storedAllowedPages) {
      setAllowedPages(storedAllowedPages);
    }
  }, []);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Programs"));
        const documentNames = [];

        querySnapshot.forEach((doc) => {
          let docName = doc.id;
          if (docName.endsWith('_common')) {
            docName = docName.replace('_common', '');
            documentNames.push(docName);
          }
        });

        setPages(documentNames);
      } catch (error) {
        console.error("Error fetching allowed pages: ", error);
      }
    };

    fetchPages();
  }, []);

  const handleNavigation = (option, path) => {
    setSelectedOption(option);
    localStorage.setItem('selectedOption', option);

    // Navigate to the homepage first
    navigate('/', { replace: true });

    // Delay the navigation to the selected option
    setTimeout(() => {
      if (path.startsWith('http')) {
        // Open external link in a new tab
        window.open(path, '_blank');
      } else {
        navigate(path, { state: { docName: option } });
      }
    }, 1); // Delay for 1000 milliseconds (1 second)
  };

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const isSelected = (option) => option === selectedOption;

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="hamburger-icon" onClick={toggleSidebar}>
        <FaBars />
      </div>

      <div className="menu-items">
        <div
          className={`menu-item ${isSelected('') ? 'active' : ''}`}
          onClick={() => handleNavigation('', '/')}
        >
          <FaHome className="menu-icon" />
          {isExpanded && <span className="menu-label">Homepage</span>}
        </div>

      

        <div className="menu-header">
          <FaClipboardList className="menu-icon" />
          {isExpanded && <span className="menu-label">Programs</span>}
        </div>

        <div className="scrollable-pages">
          {Pages.map((page, index) => (
            allowedPages.includes(page.toLowerCase()) && (
              <div
                key={index}
                className={`submenu-item ${isSelected(page) ? 'active' : ''}`}
                onClick={() => handleNavigation(page, `/${page.toLowerCase()}`)}
              >
                <FaBook className="menu-icon" />
                {isExpanded && <span className="submenu-label">{page}</span>}
              </div>
            )
          ))}
        </div>

        <div
          className={`menu-item ${isSelected('About') ? 'active' : ''}`}
          onClick={() => handleNavigation('About', 'https://www.avidian.com/')}
        >
          <FaInfoCircle className="menu-icon" />
          {isExpanded && <span className="menu-label">About</span>}
        </div>
      </div>

      <div
        className={`settings-item ${isSelected('Settings') ? 'active' : ''}`}
        onClick={() => handleNavigation('Settings', '/settings')}
      >
        <FaCog className="menu-icon" />
        {isExpanded && <span className="menu-label">Settings</span>}
      </div>
    </div>
  );
}

export default Sidebar;
