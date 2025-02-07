import React, { useState,useEffect } from "react";
import { Bar } from "react-chartjs-2";
import 'chart.js/auto';

const BarGraph = ({
    queryResult,
    representationName,
    handleNameChange,
    barColors,
    handleBarColorChange,
    setBarColors,    xAxis,setXAxis,yAxis,setYAxis,selectedRepresentation,setRepresentationName,yAxisLabel,xAxisLabel,setYAxisLabel,setXAxisLabel,maxYValue,setMaxYValue,size,handleSizeChange

}) => {

    const [error, setError] = useState('');
   
    const defaultColors = ['orange', 'blue', 'green', 'red', 'purple', 'yellow'];



    const isBarGraphRepresentable = () => {
        return queryResult && queryResult.length >= 2;

    };

    
    const isValidColor = (color) => {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    };

    const calculateMaxYValue = () => {
        if (yAxis.length === 0) return 0;

        return Math.max(
            ...yAxis.map((yKey) => Math.max(...queryResult.map(row => row[yKey]))),
            0 // Ensure at least 0 is considered
        );
    };

    // Update Bar graph data to handle multiple Y-axis values
    const getBarGraphData = () => {
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

    const handleBarGraphSubmit = () => {
        if (!xAxis || yAxis.length === 0) {
            setError('Please select both x-axis and at least one y-axis column.');
        } else if (!isBarGraphRepresentable()) {
            setError('The data is not representable in a bar graph.');
        } else {
            setError('');
        }
    };

    
    

    const handleMaxYValueChange = (e) => {
        setMaxYValue(e.target.value ? parseFloat(e.target.value) : null);
    };

    const handleYAxisLabelChange = (e) => {
        setYAxisLabel(e.target.value);
    };

    const handleXAxisLabelChange = (e) => {
        setXAxisLabel(e.target.value);
    };

    return (
        <div>
            <h3>Bar Graph Configuration</h3>

            <div>
                <label>
                    Graph Name:
                    <input
                        type="text"
                        value={representationName}
                        onChange={handleNameChange}
                        placeholder="Enter a name for the graph"
                    />
                </label>
            </div>
            Select Size
            <select
            value={size}
            onChange={handleSizeChange}> 
            <option value="">Select Size</option>
            <option value="small">Small</option>
            <option value="large">Large</option></select>
            <label>
                X-axis:
                <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
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

            <div>
                Select Y-axis columns:
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

            <button type="button" onClick={handleBarGraphSubmit}>
                Generate Bar Graph
            </button>

            {error && <div className="error-message">{error}</div>}

            {xAxis && yAxis.length > 0 && !error && (
                <div className="bar-graph-container" style={{ width: '800px', height: '400px' }}>
                    {representationName && <h3>{representationName}</h3>}

                    <Bar
                        data={getBarGraphData()}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: { title: { display: true, text: xAxisLabel || xAxis } },
                                y: {
                                    title: { display: true, text: yAxisLabel || 'Values' },
                                    max: maxYValue || calculateMaxYValue()
                                },
                            },
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default BarGraph;
