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

const DynamicHorizontal = ({ query,apiAddress, barColors, maxYValue, xAxis, yAxis, xAxisLabel, yAxisLabelAxis, size }) => {
    const [hbarData, setHBarData] = useState(null); // Data state
    const [initialMaxY, setInitialMaxY] = useState(null); // State to store initial maxYValue
    const [isInitialMaxSet, setIsInitialMaxSet] = useState(false); // Flag for initial max calculation
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // State to track errors

    useEffect(() => {
        const fetchBarData = async () => {
            try {
                setIsLoading(true);
                setError(null); // Reset error state before fetching

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
                setHBarData(data);
            } catch (error) {
                console.error('Failed to fetch bar data:', error);
                setError('Failed to load data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBarData();
    }, [query]);

    useEffect(() => {
        // Calculate the initial maxY when data is first loaded
        if (hbarData && hbarData.length > 0 && !isInitialMaxSet) {
            const initialMax = Math.max(...hbarData.flatMap(item => yAxis.map(yCol => item[yCol])));
            setInitialMaxY(initialMax);
            setIsInitialMaxSet(true);
        }
    }, [hbarData, isInitialMaxSet, yAxis]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!hbarData || hbarData.length === 0) {
        return <p>No data available for this bar chart.</p>;
    }

    // Parsing the data for the chart
    const xValues = hbarData.map(item => item[xAxis]);
    const datasets = yAxis.map(yCol => {
        const color = barColors[yCol] || '#000';
        return {
            label: yCol,
            data: hbarData.map(item => item[yCol]),
            backgroundColor: color,
        };
    });

    const currentMaxValue = Math.max(...datasets.flatMap(dataset => dataset.data));
    let maxY;
    if (maxYValue !== null && initialMaxY !== null) {
        maxY = Math.ceil((maxYValue / initialMaxY) * currentMaxValue);
    } else {
        maxY = currentMaxValue;
    }

    const chartData = {
        labels: xValues,
        datasets: datasets,
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: {
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
            y: {
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
        },
        plugins: {
            datalabels: {
                display: true,
                color: '#333',
            },
        },
        datasets: {
            bar: {
                barPercentage: Math.min(0.7, 7 / chartData.labels.length),
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

export default DynamicHorizontal;
