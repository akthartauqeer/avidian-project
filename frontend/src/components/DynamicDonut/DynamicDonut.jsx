import React, { useEffect, useState } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary components with ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

const DynamicDonut = ({ representationName, color, labelColumn, query, valueColumn,apiAddress }) => {
    const [tableData, setTableData] = useState([]); // State to store fetched data
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // State to track errors

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                setIsLoading(true);
                setError(null); // Reset error state before each fetch

                const response = await fetch(apiAddress, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query }), // Send the query from props
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setTableData(data); // Store table data
            } catch (error) {
                console.error('Failed to fetch table data:', error);
                setError('Failed to load data. Check your SQL query or please try again later.');
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
                <p className="error-message">{error}</p>
            ) : (
                <>
                    {/* Header */}
                    <h4 className="pie-chart-header">{representationName}</h4>

                    {/* Pie Chart */}
                    <div className="pie">
                        <Doughnut data={chartData} />
                    </div>
                </>
            )}
        </div>
    );
};

export default DynamicDonut;
