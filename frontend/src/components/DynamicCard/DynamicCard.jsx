import React, { useEffect, useState } from 'react';
import './DynamicCard.css'; // Import your styles

const DynamicCard = ({ representationName, query, cardInfo,apiAddress }) => {
  const [cardValue, setCardValue] = useState(null); // State to hold fetched data
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // State to track errors

  const fetchCardData = async () => {
    const queryString = query; // Access the query property

    try {
      setIsLoading(true);
      setError(null); // Reset error state

      const response = await fetch(apiAddress, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryString }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      const value = data.length > 0 ? Object.values(data[0])[0] : 'No data available';
      setCardValue(value);
    } catch (error) {
      console.error("Failed to run query:", error);
      setError('Error. Please check your query.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCardData(); // Fetch data when the component mounts or query changes
  }, [query]);

  return (
    <div className="card-container">
      <div className="dynamic-card">
        <div className="card-header">
          <strong>{representationName}</strong>
        </div>
        <div className="card-body">
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div>
              <p>{cardValue !== null ? cardValue : 'No data available'}</p>

              {/* Info icon that shows cardInfo on hover */}
              {cardInfo && (
                <div className="info-icon-container">
                  <span className="info-icon">ℹ️</span>
                  <div className="card-info-popup">{cardInfo}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicCard;
