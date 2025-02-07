import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import 'chart.js/auto';

const DonutGraph = ({ queryResult, representationName, handleNameChange, color, setColors,handleColorChange, valueColumn,labelColumn,setLabelColumn,setValueColumn,selectedRepresentation,setRepresentationName }) => {
    
    const [error, setError] = useState(''); // State for error handling

    // Helper function to generate a random hex color
    const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Initialize pie colors with random values for each slice when labelColumn or valueColumn changes
    useEffect(() => {
                // Only generate random colors if the color array is empty
        if (color.length === 0) {
            const initialColors = Array(queryResult.length).fill(0).map(() => getRandomColor());
            setColors(initialColors); // Initialize with random colors
        }
    }, [labelColumn, valueColumn, queryResult]);


    const getDoughnutChartData = () => {
        if (!labelColumn || !valueColumn) return null;

        const labels = queryResult.map(row => row[labelColumn]);
        const values = queryResult.map(row => row[valueColumn]);

        // Ensure the correct colors (validated or default)
        const validatedColors = color.map((color, index) => isValidColor(color) ? color : getRandomColor());

        return {
            labels: labels,
            datasets: [
                {
                    label: `Data from ${valueColumn}`,
                    data: values,
                    backgroundColor: validatedColors,  // Assign validated colors here
                    borderWidth: 1,
                },
            ],
        };
    };

    // Helper to validate CSS color
    const isValidColor = (color) => {
        const s = new Option().style;
        s.color = color;
        return s.color !== ''; // Returns true if it's a valid CSS color
    };

    const handleBlur = (index, colorValue) => {
        // Check if the provided color is valid
        if (!isValidColor(colorValue)) {
            // If the color is invalid, revert to the old value
            const oldColors = [...color];
            setColors(oldColors);
        }
    };

    

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <h3>Doughnut Configuration</h3>

            {/* Input for chart title */}
            <label style={{ marginBottom: '20px' }}>
                Enter Doughnut Chart Title:
                <input
                    type="text"
                    value={representationName}
                    onChange={handleNameChange}
                    placeholder="Enter a title for your Doughnut chart"
                    style={{ marginLeft: '10px', padding: '5px', borderRadius: '4px' }}
                />
            </label>

            {/* Label (X-axis) selection */}
            <label>
                Select Label (X-axis) Column:
                <select value={labelColumn} onChange={(e) => setLabelColumn(e.target.value)}>
                    <option value="">Select column for labels</option>
                    {Object.keys(queryResult[0]).map((key, index) => (
                        <option key={index} value={key}>
                            {key}
                        </option>
                    ))}
                </select>
            </label>

            {/* Value (Y-axis) selection */}
            <label>
                Select Value (Y-axis) Column:
                <select value={valueColumn} onChange={(e) => setValueColumn(e.target.value)}>
                    <option value="">Select column for values</option>
                    {Object.keys(queryResult[0]).map((key, index) => (
                        <option key={index} value={key}>
                            {key}
                        </option>
                    ))}
                </select>
            </label>

            {/* Color input for each selected label */}
            {labelColumn && valueColumn && queryResult.map((row, index) => (
                <label key={index} style={{ marginBottom: '10px' }}>
                    Slice Color for {row[labelColumn]}:
                    <input
                        type="text"
                        placeholder={`Enter a color for ${row[labelColumn]} (e.g., 'blue' or '#ff0000')`}
                        value={color[index] || ''} // Pre-fill with the generated random color
                        onChange={e => handleColorChange(e.target.value, index)}
                        onBlur={e => handleBlur(index, e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px', borderRadius: '4px' }}
                    />
                </label>
            ))}

            {error && <div className="error-message">{error}</div>}

            <div className="pie-chart-container" style={{ width: '100%', maxWidth: '600px', height: '400px', padding: '20px' }}>
                {representationName && <h3>{representationName}</h3>}
                {labelColumn && valueColumn && !error && (
                    <Doughnut
                        data={getDoughnutChartData()}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default DonutGraph;
