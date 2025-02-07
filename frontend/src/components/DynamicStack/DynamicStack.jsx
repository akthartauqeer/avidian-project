import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components, including ChartDataLabels plugin
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend, ChartDataLabels);

const DynamicStack = ({ query,apiAddress, barColors, maxYValue, xAxis, yAxis, xAxisLabel, yAxisLabelAxis, size }) => {
    const [barData, setBarData] = useState(null);
    const [initialMaxY, setInitialMaxY] = useState(null); // State to store the initial maxYValue
    const [isInitialMaxSet, setIsInitialMaxSet] = useState(false); // Flag to track if initial max has been set
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // State to track errors

    useEffect(() => {
        const fetchBarData = async () => {
            try {
                const response = await fetch(apiAddress, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query }),
                });

                if (!response.ok) {
                    throw new Error(`Please check your SQL query`);
                }

                const data = await response.json();
                setBarData(data);
            } catch (error) {
                console.error('Failed to fetch bar data:', error);
                setError(error.message); // Set error message
            } finally {
                setIsLoading(false);
            }
        };

        fetchBarData();
    }, [query]);

    useEffect(() => {
        // Calculate the initial maxY when the data is first loaded
        if (barData && barData.length > 0 && !isInitialMaxSet) {
            const initialMax = Math.max(...barData.flatMap(item => yAxis.map(yCol => item[yCol])));
            setInitialMaxY(initialMax);
            setIsInitialMaxSet(true); // Set the flag to true after calculating initial max
        }
    }, [barData, isInitialMaxSet, yAxis]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>; // Display error message
    }

    if (!barData || barData.length === 0) {
        return <p>No data available for this bar chart.</p>;
    }

    // Parsing the data for the chart
    const xValues = barData.map(item => item[xAxis]);
    const datasets = yAxis.map(yCol => {
        const color = barColors[yCol] || '#000';
        return {
            label: yCol,
            data: barData.map(item => item[yCol]),
            backgroundColor: color,
            stack: 'Stack 0', // Specify the stack name
        };
    });

    const currentMaxValue = Math.max(...datasets.flatMap(dataset => dataset.data));

    // Calculate maxY based on the provided logic
    let maxY;
    if (maxYValue !== null && initialMaxY !== null) {
        maxY = Math.ceil((maxYValue / initialMaxY) * currentMaxValue); // Ensure maxY is an integer
        console.log(maxYValue);
        console.log(initialMaxY);
        console.log(currentMaxValue);
    }

    const chartData = {
        labels: xValues,
        datasets: datasets,
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true, // Enable stacking on the x-axis
                title: {
                    display: true,
                    text: xAxisLabel || xAxis,
                    font: {
                        weight: 'bold',
                    },
                },
                ticks: {
                    font: {
                        weight: 'bold',
                    },
                },
                grid: {
                    display: false,
                },
            },
            y: {
                stacked: true, // Enable stacking on the y-axis
                title: {
                    display: true,
                    text: yAxisLabelAxis || 'Value',
                    font: {
                        weight: 'bold',
                    },
                },
                ticks: {
                    font: {
                        weight: 'bold',
                    },
                },
                grid: {
                    display: true,
                },
                max: maxY !== null ? maxY : undefined, // Set max Y value or default to undefined
            },
        },
        plugins: {
            datalabels: {
                display: true,
                color: '#333', // Set the color of the label text
            }
        },
        datasets: {
            bar: {
                barPercentage: Math.min(0.5, 5 / (chartData.labels.length)), // Adjust based on label count
                categoryPercentage: 0.8, // Set the spacing between categories
            },
        },
    };

    const heightClass = size === 'small' ? 'line-chart-small-height' : 'line-chart-large-height';

    return (
        <div className={`dynamic-line-chart ${heightClass}`}>
            <Bar data={chartData} options={chartOptions} />
        </div>
    );
};

export default DynamicStack;
