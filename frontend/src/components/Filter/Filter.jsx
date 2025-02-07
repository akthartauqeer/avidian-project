import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import path as necessary
import './Filter.css';

const Filter = ({ docId, selectedValues, setSelectedValues,apiAddress }) => {
  const [filters, setFilters] = useState([]);
  const [dropdownValues, setDropdownValues] = useState({});
  const [isLoading, setIsLoading] = useState({});
  


  useEffect(() => {
    const documentName = `${docId}_common`;
    const fetchFilters = async () => {
      try {
        const docRef = doc(db, "Programs", documentName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.filters) {
            setFilters(data.filters);
            await fetchInitialDropdownValues(data.filters); // Initial dropdown values fetch
          } else {
            console.warn("No filters found in document!");
          }
        } else {
          console.error("No such document found in Firestore!");
        }
      } catch (error) {
        console.error("Error fetching Firestore document:", error);
      }
    };
    fetchFilters();
  }, [docId]);

  const fetchInitialDropdownValues = async (filters) => {
    for (const filter of filters) {
      if (!filter.dropdownValues || filter.dropdownValues.length === 0) {
        await fetchDropdownValues(filter); // Fetch initial values for each filter
      }
    }
  };

  const fetchDropdownValues = async (filter) => {
    const query = `
      SELECT DISTINCT ${filter.databasename} 
      FROM ${filter.sheetname};
    `;
    try {
      setIsLoading((prev) => ({ ...prev, [filter.databasename]: true }));
      const response = await fetch(apiAddress, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (response.ok) {
        setDropdownValues((prev) => ({
          ...prev,
          [filter.databasename]: data,  // Store the fetched dropdown values for the filter
        }));
      } else {
        console.error(`Failed to fetch data for ${filter.databasename}:`, data);
      }
    } catch (error) {
      console.error("Failed to run query:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [filter.databasename]: false }));  // Clear loading state
    }
  };

  // Trigger fetching updated dropdown values whenever `selectedValues` changes
  useEffect(() => {
    const fetchUpdatedValues = async () => {
      await fetchUpdatedDropdownValues(selectedValues); // Update dropdown values for other filters based on current selections
    };
    console.log("Current selectedValues:", selectedValues); // Log selectedValues to see what's being stored
    fetchUpdatedValues();
  }, [selectedValues]);

  const fetchUpdatedDropdownValues = async (selectedFilters) => {
    for (const filter of filters) {
      const whereClauses = Object.keys(selectedFilters)
        .filter((key) => key !== filter.databasename && selectedFilters[key] !== '')
        .map((key) => {
          const correspondingFilter = filters.find(f => f.databasename === key);
          return `${correspondingFilter.databasename} = '${selectedFilters[key]}'`;
        })
        .join(' AND ');
      const query = `
        SELECT DISTINCT ${filter.databasename} 
        FROM ${filter.sheetname}
        ${whereClauses ? `WHERE ${whereClauses}` : ''};
      `;
      try {
        setIsLoading((prev) => ({ ...prev, [filter.databasename]: true }));
      const response = await fetch(apiAddress, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
        const data = await response.json();
        if (response.ok) {
          setDropdownValues((prev) => ({
            ...prev,
            [filter.databasename]: data,
          }));
        } else {
          console.error(`Failed to fetch updated data for ${filter.databasename}:`, data);
        }
      } catch (error) {
        console.error("Failed to run query:", error);
      } finally {
        setIsLoading((prev) => ({ ...prev, [filter.databasename]: false }));
      }
    }
  };

  const handleDropdownChange = (filter, value) => {
    setSelectedValues((prevValues) => {
      if (value === '') {
        const { [filter.databasename]: removed, ...rest } = prevValues;
        return rest;
      } else {
        return {
          ...prevValues,
          [filter.databasename]: value,
        };
      }
    });
  };

  const clearFilters = () => {
    setSelectedValues({}); // Reset selectedValues to an empty object
  };

  // Prompt user before navigating away with unsaved changes
  

  return (
    <div className="filter-search-container">
      <div className="dropdown-container">
        {filters.length > 0 ? (
          filters.map((filter, index) => (
            <div className="dropdown" key={index}>
              <label htmlFor={filter.databasename}>Enter {filter.name}</label>
              {filter.dropdownValues && filter.dropdownValues.length > 0 ? (
                <select
                  id={filter.databasename}
                  value={selectedValues[filter.databasename] || ''}
                  onChange={(e) => handleDropdownChange(filter, e.target.value)}
                >
                  <option value="">-- Select {filter.name} --</option>
                  {filter.dropdownValues.map((value, idx) => (
                    <option value={value} key={idx}>{value}</option>
                  ))}
                </select>
              ) : (
                <select
                  id={filter.databasename}
                  value={selectedValues[filter.databasename] || ''}
                  onChange={(e) => handleDropdownChange(filter, e.target.value)}
                  disabled={isLoading[filter.databasename]}
                >
                  <option value="">-- Select {filter.name} --</option>
                  {isLoading[filter.databasename] ? (
                    <option>Loading...</option>
                  ) : dropdownValues[filter.databasename] && dropdownValues[filter.databasename].length > 0 ? (
                    dropdownValues[filter.databasename].map((value, idx) => (
                      <option value={value[filter.databasename]} key={idx}>
                        {value[filter.databasename]}
                      </option>
                    ))
                  ) 
                  : (
                    <option>No options available</option>
                  )}
                </select>              
              )}
            </div>
          ))
        ) : (
          <p>Loading filters...</p>
        )}
        <button className="clear-filters-button" onClick={clearFilters}>Clear All</button>
      </div>
    </div>
  );
};

export default Filter;