import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement, // Import LineElement here
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

import './DynamicLine.css';

// Register necessary elements
ChartJS.register(LineElement, BarElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const DynamicLine = ({ query,apiAddress, barColors, maxYValue, minYValue, xAxis, yAxis, xAxisLabel, yAxisLabelAxis, size }) => {
    const [lineData, setLineData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Add state for error handling

    useEffect(() => {
        const fetchLineData = async () => {
            try {
                const response = await fetch(apiAddress, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query }),
                });

                if (!response.ok) {
                    throw new Error(` Please check your SQL Query`);
                }

                const data = await response.json();
                setLineData(data);
            } catch (error) {
                console.error('Failed to fetch line data:', error);
                setError(error.message); // Set error message
            } finally {
                setIsLoading(false);
            }
        };

        fetchLineData();
    }, [query]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>; // Display error message
    }

    if (!lineData || lineData.length === 0) {
        return <p>No data available for this line chart.</p>;
    }

    const xValues = lineData.map(item => item[xAxis]);
    const datasets = yAxis.map(yCol => {
        const color = barColors[yCol] || '#000';
        return {
            label: yCol,
            data: lineData.map(item => item[yCol]),
            borderColor: color,
            fill: false,
        };
    });

    const highestValue = Math.max(...datasets.flatMap(dataset => dataset.data));
    const lowestValue = Math.min(...datasets.flatMap(dataset => dataset.data));
    const maxY = maxYValue !== undefined ? maxYValue : highestValue; 
    const minY = minYValue !== undefined ? minYValue : 0;

    const chartData = {
        labels: xValues,
        datasets: datasets,
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: xAxisLabel || xAxis,
                    font: {
                        weight: 'bold',
                    }
                },
                ticks: {
                    font: {
                        weight: 'bold',
                    }
                },
                grid: {
                    display: false,
                }
            },
            y: {
                title: {
                    display: true,
                    text: yAxisLabelAxis || 'Value',
                    font: {
                        weight: 'bold',
                    }
                },
                ticks: {
                    font: {
                        weight: 'bold',
                    }
                },
                grid: {
                    display: true,
                },
                max: maxY,
                min: minY,
            },
        },
    };

    const heightClass = size === 'small' ? 'line-chart-small-height' : 'line-chart-large-height';

    return (
        <div className={`dynamic-line-chart ${heightClass}`}>
            <Line data={chartData} options={chartOptions} />
        </div>
    );
};

export default DynamicLine;
