import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import 'chart.js/auto';

const LineGraph = ({ queryResult,
    representationName,
    handleNameChange,
    barColors,
    handleBarColorChange,
    setBarColors, xAxis, setXAxis, yAxis, setYAxis, selectedRepresentation, setRepresentationName, yAxisLabel, xAxisLabel, setYAxisLabel, setXAxisLabel, maxYValue, setMaxYValue, minY, setMinY,size,handleSizeChange
}) => {

    const [error, setError] = useState('');

    const defaultColors = ['orange', 'blue', 'green', 'red', 'purple', 'yellow'];


    const isValidColor = (color) => {
        const s = new Option().style;
        s.color = color;
        return s.color !== ''; // Returns true if it's a valid CSS color
    };
    

    const calculateMaxYValue = () => {
        if (yAxis.length === 0) return 0;

        return Math.max(
            ...yAxis.map((yKey) => Math.max(...queryResult.map(row => row[yKey]))),
            0 // Ensure at least 0 is considered
        );
    };
    const calculateMinYValue = () => {
        if (yAxis.length === 0) return 0;

        return Math.min(
            ...yAxis.map((yKey) => Math.min(...queryResult.map(row => row[yKey]))),
            0 // Ensure at least 0 is considered
        );
    };



    const getLineGraphData = () => {
        if (!xAxis || yAxis.length === 0) return null;

        const labels = queryResult.map(row => row[xAxis]);

        // Create datasets for each Y-axis value
        const datasets = yAxis.map((yKey, index) => {
            const color = barColors[yKey] && isValidColor(barColors[yKey]) ? barColors[yKey] : defaultColors[index % defaultColors.length];
            return {
                label: yKey,
                data: queryResult.map(row => row[yKey]),
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1,
            };
        });

        return {
            labels: labels,
            datasets: datasets,
        };
    };

    const handleLineGraphSubmit = () => {
        if (!xAxis || yAxis.length === 0) {
            setError('Please select both X-axis and at least one Y-axis column.');
        } else {
            setError('');
        }
    };

    const handleYAxisChange = (yKey) => {
        setYAxis(prevYAxis => {
            const newYAxis = prevYAxis.includes(yKey)
                ? prevYAxis.filter(key => key !== yKey)
                : [...prevYAxis, yKey];

            // Update barColors state when new Y-axis column is added or removed
            const updatedBarColors = { ...barColors };

            if (newYAxis.includes(yKey)) {
                // When adding a new Y-axis, ensure a color is assigned
                if (!updatedBarColors[yKey]) {
                    updatedBarColors[yKey] = defaultColors[newYAxis.length % defaultColors.length]; // Assign default color
                }
            } else {
                // When removing a Y-axis, delete the corresponding color
                delete updatedBarColors[yKey];
            }

            setBarColors(updatedBarColors); // Update state with new barColors

            return newYAxis;
        });
    };
    const handleMaxYValueChange = (e) => {
        setMaxYValue(e.target.value ? parseFloat(e.target.value) : null);
    };
    const handleMinYValueChange = (e) => {
        setMinY(e.target.value ? parseFloat(e.target.value) : null);
    };


    const handleYAxisLabelChange = (e) => {
        setYAxisLabel(e.target.value);
    };

    // Handle custom X-axis label change
    const handleXAxisLabelChange = (e) => {
        setXAxisLabel(e.target.value);
    };

    return (
        <div>
            <h3>Multi Line Graph Configuration</h3>
            <div><label>
                Graph Name:
                <input
                    type="text"
                    value={representationName}
                    onChange={handleNameChange}
                    placeholder="Enter a name for the graph"
                />
            </label></div>

            {/* X-axis selection */}
            <label>
                X-axis:
                <select value={xAxis} onChange={e => setXAxis(e.target.value)}>
                    <option value="">Select column for X-axis</option>
                    {Object.keys(queryResult[0]).map((key, index) => (
                        <option key={index} value={key}>
                            {key}
                        </option>
                    ))}
                </select>
            </label>
            <div>
                <label>
                    Custom X-axis Label:
                    <input
                        type="text"
                        value={xAxisLabel}
                        onChange={handleXAxisLabelChange}
                        placeholder="Enter a label for the X-axis"
                    />
                </label>
            </div>

            {/* Y-axes selection using checkboxes */}
            <div>
                <h4>Select Y-axis columns:</h4>
                {Object.keys(queryResult[0]).map((key, index) => (
                    <div key={index}>
                        <label>
                            <input
                                type="checkbox"
                                value={key}
                                checked={yAxis.includes(key)}
                                onChange={() => handleYAxisChange(key)}
                            />
                            {key}
                        </label>
                    </div>
                ))}
            </div>
            <div>
                <label>
                    Custom Y-axis Label:
                    <input
                        type="text"
                        value={yAxisLabel}
                        onChange={handleYAxisLabelChange}
                        placeholder="Enter a label for the Y-axis"
                    />
                </label>
            </div>

            {/* Color input for each selected Y-axis column */}
            {yAxis.length > 0 && yAxis.map((yKey, index) => {

                const color = barColors[yKey] || defaultColors[index % defaultColors.length];
                return (
                    <div key={index}>
                        <label>
                            Color for {yKey}:
                            <input
                                type="text"
                                placeholder={`Enter a color for ${yKey}`}
                                value={color || ''} // Prefill with the default or selected color
                                onChange={(e) => handleBarColorChange(yKey, e.target.value)}
                            />
                        </label>
                    </div>
                );
            })}

            {/* Min and Max Y-axis inputs */}
            <div>
                <label>
                    Minimum Y-axis Value:
                    <input
                        type="text"
                        value={minY || ''}  // Use minY, defaulting to empty string if not set
                        onChange={handleMinYValueChange}  // Parse input as a number
                        placeholder={`Default: ${calculateMinYValue()}`}  // Use calculateMinYValue() here
                    />
                </label>
            </div>


            <div>
                <label>
                    Manual Max Y-axis Value:
                    <input
                        type="text"
                        value={maxYValue || ''}
                        onChange={handleMaxYValueChange}
                        placeholder={`Default: ${calculateMaxYValue()}`}
                    />
                </label>
            </div>
            <h2>Select Size</h2>
            <select
            value={size}
            onChange={handleSizeChange}> 
            <option value="">Select Size</option>
            <option value="small">Small</option>
            <option value="large">Large</option></select>

            <button type="button" onClick={handleLineGraphSubmit}>
                Generate Line Graph
            </button>

            {error && <div className="error-message">{error}</div>}

            {xAxis && yAxis.length > 0 && !error && (
                <div className="line-graph-container" style={{ width: '800px', height: '500px' }}>
                    {representationName && <h3>{representationName}</h3>}
                    <Line
                        data={getLineGraphData()}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: xAxisLabel || xAxis // Label for X-axis
                                    }
                                },
                                y: {
                                    title: {
                                        display: true, text: yAxisLabel || 'Values'
                                    },
                                    min: minY || calculateMinYValue(),  // Now calculate minYValue if not manually set
                                    max: maxYValue || calculateMaxYValue()
                                }
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default LineGraph;
