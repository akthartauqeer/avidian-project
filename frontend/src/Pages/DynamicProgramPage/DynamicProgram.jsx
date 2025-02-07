import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/header';
import Filter from '../../components/Filter/Filter';
import Specific from '../../components/Specific/Specific';

const DynamicProgramPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const docName = location.state?.docName;

  // Define selectedValues and setSelectedValues here
  const [selectedValues, setSelectedValues] = useState({});
  const apiAddress =  "http://localhost:5045/api/api/run-sql";

 

 

  return (
    <div>
      {docName ? (
        <>
          <Header docId={docName} />
          {/* Pass selectedValues and setSelectedValues to Filter */}
          <Filter docId={docName} selectedValues={selectedValues} apiAddress={apiAddress} setSelectedValues={setSelectedValues} />
          {/* Pass selectedValues to Specific if needed */}
          <Specific docId={docName} selectedValues={selectedValues} apiAddress={apiAddress} setSelectedValues={setSelectedValues} />
          {/* Example of a button to navigate away */}
        </>
      ) : (
        <p>Error: No program data available.</p>
      )}
    </div>
  );
};

export default DynamicProgramPage;