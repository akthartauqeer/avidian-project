import React from "react";
import './popup2.css';

const Popup = ({ closePopup, filterName, data }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-contentci">
                <h2>{filterName}</h2>
                {data ? (
                    Array.isArray(data) ? (
                        // Loop through the array once, showing the values only
                        data.map((item, index) => (
                            <div key={index}>
                                {Object.entries(item).map(([key, value]) => (
                                    <div key={key}>
                                        {value.toString()}
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        // For a single object, show the values only
                        <div>
                            {Object.entries(data).map(([key, value]) => (
                                <div key={key}>
                                    <strong>{value.toString()}</strong>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <p>No data available</p>
                )}
               
               <button onClick={closePopup} className="close-btn">X</button>

            </div>
        </div>
    );
};

export default Popup;
