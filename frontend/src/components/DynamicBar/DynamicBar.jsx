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

import './DynamicBar.css';

// Register Chart.js components, including ChartDataLabels plugin
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend, ChartDataLabels);

const DynamicBar = ({ query,apiAddress, barColors, maxYValue, xAxis, yAxis, xAxisLabel, yAxisLabelAxis, size }) => {
    const [barData, setBarData] = useState(null);
    const [initialMaxY, setInitialMaxY] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialMaxSet, setIsInitialMaxSet] = useState(false);
    const [error, setError] = useState(null); // State to track error messages

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
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setBarData(data);
                setError(null); // Clear any previous error
            } catch (error) {
                console.error('Failed to fetch bar data:', error);
                setError('Failed to load data. Please check your query or try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBarData();
    }, [query]);

    useEffect(() => {
        if (barData && barData.length > 0 && !isInitialMaxSet) {
            const initialMax = Math.max(...barData.flatMap(item => yAxis.map(yCol => item[yCol])));
            setInitialMaxY(initialMax);
            setIsInitialMaxSet(true);
        }
    }, [barData, isInitialMaxSet, yAxis]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!barData || barData.length === 0) {
        return <p>No data available for this bar chart.</p>;
    }

    const xValues = barData.map(item => item[xAxis]);
    const datasets = yAxis.map(yCol => {
        const color = barColors[yCol] || '#000';
        return {
            label: yCol,
            data: barData.map(item => item[yCol]),
            backgroundColor: color,
        };
    });

    const currentMaxValue = Math.max(...datasets.flatMap(dataset => dataset.data));
    let maxY;

    if (maxYValue !== null && initialMaxY !== null) {
        maxY = Math.ceil((maxYValue / initialMaxY) * currentMaxValue);
    } else {
        const scaleStep = Math.pow(10, Math.floor(Math.log10(currentMaxValue)));
        maxY = Math.ceil(currentMaxValue / scaleStep) * scaleStep;
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
                max: maxY,
            },
        },
        plugins: {
            datalabels: {
                display: true,
                color: '#333',
            },
        },
        datasets: {
            bar: {
                barPercentage: Math.min(0.5, 5 / (chartData.labels.length)),
                categoryPercentage: 0.8,
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

export default DynamicBar;
