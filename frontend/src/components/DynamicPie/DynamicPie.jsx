import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './DynamicPie.css'; // Import your CSS for styling

// Register necessary components with ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

const DynamicPie = ({ representationName, color, labelColumn, query,apiAddress, valueColumn }) => {
    const [tableData, setTableData] = useState([]); // State to store fetched data
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                const response = await fetch(apiAddress, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query }), // Send the query from props
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setTableData(data); // Store table data
            } catch (error) {
                console.error('Failed to fetch table data:', error);
                setError(error.message); // Set error message
            } finally {
                setIsLoading(false);
            }
        };

        fetchTableData();
    }, [query]);

    // Prepare data for the pie chart based on the fetched data
    const chartData = {
        labels: tableData.map(item => item[labelColumn]), // Extract labels from labelColumn
        datasets: [
            {
                data: tableData.map(item => item[valueColumn]), // Extract values from valueColumn
                backgroundColor: color, // Use the colors passed in props
                hoverOffset: 4,
            },
        ],
    };

    return (
        <div className="pie-chart-container">
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p> // Display error message
            ) : (
                <>
                    {/* Header */}
                    <h4 className="pie-chart-header">{representationName}</h4>

                    {/* Pie Chart */}
                    <div className="pie">
                        <Pie data={chartData} />
                    </div>
                </>
            )}
        </div>
    );
};

export default DynamicPie;
