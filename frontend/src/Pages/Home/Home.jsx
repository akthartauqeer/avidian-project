import React, { useEffect, useState } from 'react';
import HomeHeader from '../../components/homeHeader/homeHeader';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore'; // Firestore imports
import { db } from '../../firebase'; // Ensure correct Firebase initialization path
import './Home.css';

const Home = ({ selectedOption, setSelectedOption }) => {
  const navigate = useNavigate();
  const [allowedPages, setAllowedPages] = useState([]);
  const [dynamicCards, setDynamicCards] = useState([]);
  const defaultCardImage = '/testbac.png'; // Default image path

  useEffect(() => {
    const storedAllowedPages = JSON.parse(localStorage.getItem('allowedPages'));
    if (storedAllowedPages) {
      setAllowedPages(storedAllowedPages);
    }
  }, []);

  // Fetch dynamic document names and card images from Firestore
  useEffect(() => {
    const fetchProgramDocuments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Programs"));
        const documentData = [];

        querySnapshot.forEach((doc) => {
          let docName = doc.id; // Get the document ID (name)

          // Check if the document ends with "_common"
          if (docName.endsWith('_common')) {
            // Remove the trailing "_common" from the document name
            docName = docName.replace('_common', '');
            
            // Get the cardImage or use the default
            const cardImage = doc.data().cardImage || defaultCardImage;

            // Add document name and card image
            documentData.push({ name: docName, cardImage });
          }
        });

        setDynamicCards(documentData); // Set dynamic cards to state
      } catch (error) {
        console.error("Error fetching program documents: ", error);
      }
    };

    fetchProgramDocuments();
  }, []);

  const handleNavigation = (option, path) => {
    setSelectedOption(option);
    localStorage.setItem('selectedOption', option); // Store selectedOption in localStorage
    navigate(path, { state: { docName: option } }); // Pass data and docName to the dynamic page
  };

  return (
    <div>
      <HomeHeader />
      <div className="boxes-container">
      

        {/* Dynamically created cards from Firestore */}
        {dynamicCards.map((doc, index) => (
          // Check if the lowercase version of the doc.name is in allowedPages
          allowedPages.includes(doc.name.toLowerCase()) && (
            <div
              key={index}
              className="box"
              onClick={() => handleNavigation(doc.name, `/${doc.name.toLowerCase()}`)}
            >
              <div
                className="box-image"
                style={{ backgroundImage: `url(${doc.cardImage})` }}
              ></div>
              <div className="boxtext">{doc.name}</div>
            </div>
          )
        ))}
      </div>
      <div
        className="settings-button"
        onClick={() => handleNavigation('Settings', '/settings')}
      >
        <div className="setting-button">
          <FaCog className="settings-icon" />
        </div>
      </div>
    </div>
  );
};

export default Home;
