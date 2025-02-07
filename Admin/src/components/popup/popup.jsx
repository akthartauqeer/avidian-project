import React, { useState } from "react";
import 'chart.js/auto';
import LineGraph from "../popup_line_chart/popup_line";
import BarGraph from "../popup_bar_graph/popup_bar";
import HorizontalBar from "../horizontal_bar/Horizontal_bar";
import PieGraph from "../PiePopup/PiePopup";
import StackedBarGraph from "../Stack_bar_pop/stack_pop";
import DonutGraph from "../Doughnut/Doughnut";
import './popup.css'; // Create this file for popup-specific styles if needed

const Popup = ({
    isPopupOpen,
    selectedRepresentation,
    handleRepresentationChange,
    handlePopupSubmit,
    handlePopupClose,
    queryResult,
    representationName, setRepresentationName,
    handleNameChange, color, handleColorChange, setColors, barColors, handleBarColorChange, setBarColors,
    valueColumn, labelColumn, setLabelColumn, setValueColumn,
    xAxis, setXAxis, yAxis, setYAxis, yAxisLabel, xAxisLabel, setYAxisLabel, setXAxisLabel, maxYValue, setMaxYValue, minY, setMinY, cardInfo, setCardInfo, size, handleSizeChange,setSize
}) => {
    React.useEffect(() => {
        if (!isPopupOpen) {
            // Reset fields only when the popup is closed
            setRepresentationName("");
            setColors([]);
            setBarColors({});
            setXAxis("");
            setYAxis([]);
            setYAxisLabel("Values");
            setXAxisLabel("");
            setMaxYValue(null);
            setMinY(null);
            setCardInfo("");
            setValueColumn("");
            setLabelColumn("");
            setSize("");
        }
    }, [isPopupOpen]);

    // Handle the input change for card/table name
     

    // Handle the submit logic for card or table when saved
    const handlePopupSubmitWithValidation = () => {
        if (!representationName.trim()) {
            alert("Please enter a name for the card or table.");
        } else {
            handlePopupSubmit(); // Call the parent submit handler (you may want to pass queryResult here if needed)
        }
    };


    if (!isPopupOpen) return null;

    return (
        <div className="popup">
            <div className="popup-content">
                <h2>SQL Query Result</h2>
                {queryResult ? (
                    queryResult.error ? (
                        <div className="error-message">{queryResult.error}</div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        {Object.keys(queryResult[0]).map((key, index) => (
                                            <th key={index}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {queryResult.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {Object.values(row).map((value, colIndex) => (
                                                <td key={colIndex}>{value}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <p>No result to display</p>
                )}

                <h2>Select Representation</h2>
                <select
                    value={selectedRepresentation}
                    onChange={handleRepresentationChange}
                >
                    <option value="">Select Representation</option>
                    <option value="card">Card</option>
                    <option value="table">Table</option>
                    <option value="bargraph">Bar Graph</option>
                    <option value="pie-chart">Pie Chart</option>
                    <option value="linegraph">Line Graph</option>
                    <option value="stack">Stack</option>
                    <option value="donut">Donut</option>
                    <option value="horizontal-bargraph">Horizontal Bar Graph</option>
                </select>

                {/* Render input for card or table name when either is selected */}
                {(selectedRepresentation === "card" || selectedRepresentation === "table") && (
                    <div className="name-input">
                        <label htmlFor="name">
                            Enter a name for the {selectedRepresentation === "card" ? "Card" : "Table"}:
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={representationName}
                            onChange={handleNameChange}
                            placeholder={`Enter ${selectedRepresentation === "card" ? "Card" : "Table"} name`}
                        />
                    </div>
                )}
                {selectedRepresentation === "card" && (
                    <div className="card-info-inputs">
                        <label htmlFor="card-info">
                            Enter additional information for the Card:
                        </label>
                        <input
                            type="text"
                            id="card-info"
                            value={cardInfo} // Assuming cardInfo is a string
                            onChange={(e) => setCardInfo(e.target.value)}
                            placeholder="Enter card information"
                        />
                    </div>
                )}
                {selectedRepresentation === "table" && (
                    <div className="card-info-inputs">
                        <select
                            value={size}
                            onChange={handleSizeChange}>
                            <option value="">Select Size</option>
                            <option value="small">Small</option>
                            <option value="large">Large</option></select>
                    </div>
                )}
                {/* Render appropriate graph or component based on selected representation */}
                {selectedRepresentation === "horizontal-bargraph" && <HorizontalBar queryResult={queryResult} representationName={representationName} handleNameChange={handleNameChange} barColors={barColors} handleBarColorChange={handleBarColorChange} setBarColors={setBarColors} xAxis={xAxis} setXAxis={setXAxis} yAxis={yAxis} setYAxis={setYAxis} selectedRepresentation={selectedRepresentation} setRepresentationName={setRepresentationName} yAxisLabel={yAxisLabel} xAxisLabel={xAxisLabel} setYAxisLabel={setYAxisLabel} setXAxisLabel={setXAxisLabel} maxYValue={maxYValue} setMaxYValue={setMaxYValue} size={size} handleSizeChange={handleSizeChange} />}
                {selectedRepresentation === "bargraph" && <BarGraph queryResult={queryResult} representationName={representationName} handleNameChange={handleNameChange} barColors={barColors} handleBarColorChange={handleBarColorChange} setBarColors={setBarColors} xAxis={xAxis} setXAxis={setXAxis} yAxis={yAxis} setYAxis={setYAxis} selectedRepresentation={selectedRepresentation} setRepresentationName={setRepresentationName} yAxisLabel={yAxisLabel} xAxisLabel={xAxisLabel} setYAxisLabel={setYAxisLabel} setXAxisLabel={setXAxisLabel} maxYValue={maxYValue} setMaxYValue={setMaxYValue} size={size} handleSizeChange={handleSizeChange} />}
                {selectedRepresentation === "linegraph" && <LineGraph queryResult={queryResult} representationName={representationName} handleNameChange={handleNameChange} barColors={barColors} handleBarColorChange={handleBarColorChange} setBarColors={setBarColors} xAxis={xAxis} setXAxis={setXAxis} yAxis={yAxis} setYAxis={setYAxis} selectedRepresentation={selectedRepresentation} setRepresentationName={setRepresentationName} yAxisLabel={yAxisLabel} xAxisLabel={xAxisLabel} setYAxisLabel={setYAxisLabel} setXAxisLabel={setXAxisLabel} maxYValue={maxYValue} setMaxYValue={setMaxYValue} minY={minY} setMinY={setMinY} size={size} handleSizeChange={handleSizeChange} />}
                {selectedRepresentation === "stack" && <StackedBarGraph queryResult={queryResult} representationName={representationName} handleNameChange={handleNameChange} barColors={barColors} handleBarColorChange={handleBarColorChange} setBarColors={setBarColors} xAxis={xAxis} setXAxis={setXAxis} yAxis={yAxis} setYAxis={setYAxis} selectedRepresentation={selectedRepresentation} setRepresentationName={setRepresentationName} yAxisLabel={yAxisLabel} xAxisLabel={xAxisLabel} setYAxisLabel={setYAxisLabel} setXAxisLabel={setXAxisLabel} maxYValue={maxYValue} setMaxYValue={setMaxYValue} size={size} handleSizeChange={handleSizeChange} />}
                {selectedRepresentation === "donut" && <DonutGraph queryResult={queryResult} representationName={representationName} handleNameChange={handleNameChange} color={color} setColors={setColors} handleColorChange={handleColorChange} valueColumn={valueColumn} labelColumn={labelColumn} setLabelColumn={setLabelColumn} setValueColumn={setValueColumn} setRepresentationName={setRepresentationName} />}
                {selectedRepresentation === "pie-chart" && <PieGraph queryResult={queryResult} representationName={representationName} handleNameChange={handleNameChange} color={color} setColors={setColors} handleColorChange={handleColorChange} valueColumn={valueColumn} labelColumn={labelColumn} setLabelColumn={setLabelColumn} setValueColumn={setValueColumn} setRepresentationName={setRepresentationName} />}

                <div className="button-container">
                    <button type="button" onClick={handlePopupSubmitWithValidation}>
                        Save
                    </button>
                    <button type="button" onClick={handlePopupClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
