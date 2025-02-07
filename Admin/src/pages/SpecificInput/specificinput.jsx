import React, { useState } from "react";
import './specificinput.css';
import Popup from "../../components/popup/popup";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Import Firestore
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify style

const SpecificInputss = () => {
    const [mainHeadings, setMainHeadings] = useState([{
        heading: '',
        programs: [{
            programHeading: '',
            queries: [{ query: '', representation: '' }] // Added colors array for each query
        }]
    }]);
    const [programName, setProgramName] = useState('');
    const [cardInfo, setCardInfo] = useState("")
    const [size, setSize] = useState("")
    const [savedQueries, setSavedQueries] = useState(new Set()); // Use a Set to store saved query indices

    const [color, setColors] = useState([]); // For each query's color
    const [yAxisLabel, setYAxisLabel] = useState('Values');
    const [minYValue, setMinYValue] = useState(null); // Minimum Y-axis value
    const [maxYValue, setMaxYValue] = useState(null);
    const [xAxisLabel, setXAxisLabel] = useState('');
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState([]);
    const [barColors, setBarColors] = useState({}); // Store colors for each Y-axis
    const [labelColumn, setLabelColumn] = useState(''); // State for label column (X-axis equivalent)
    const [valueColumn, setValueColumn] = useState('');
    const [representationName, setRepresentationName] = useState(""); // For representation name
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentQuery, setCurrentQuery] = useState(null); // Track the current query object with all relevant indices
    const [selectedRepresentation, setSelectedRepresentation] = useState("");
    const [queryResult, setQueryResult] = useState(null); // To store the SQL query result
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isChangeOrderPopupOpen, setIsChangeOrderPopupOpen] = useState(false);
    const [currentProgramIndex, setCurrentProgramIndex] = useState(null);

    const openChangeOrderPopup = (mainIndex, programIndex) => {
        setCurrentProgramIndex({ mainIndex, programIndex });
        setIsChangeOrderPopupOpen(true);
    };
    const handleChangeMainOrder = (mainIndex, direction) => {
        const newMainHeadings = [...mainHeadings];
        if (direction === 'up' && mainIndex > 0) {
            // Swap with the previous main heading
            [newMainHeadings[mainIndex], newMainHeadings[mainIndex - 1]] =
                [newMainHeadings[mainIndex - 1], newMainHeadings[mainIndex]];
        } else if (direction === 'down' && mainIndex < newMainHeadings.length - 1) {
            // Swap with the next main heading
            [newMainHeadings[mainIndex], newMainHeadings[mainIndex + 1]] =
                [newMainHeadings[mainIndex + 1], newMainHeadings[mainIndex]];
        }
        setMainHeadings(newMainHeadings);
    };
    const ChangeOrderPopup = ({ isOpen, onClose, queries, onUpdate }) => {
        const [localQueries, setLocalQueries] = useState(queries);

        const handleChangeOrder = (index, direction, event) => {
            event.preventDefault(); // Prevent the default form submission
            const newQueries = [...localQueries];
            if (direction === 'up' && index > 0) {
                [newQueries[index], newQueries[index - 1]] = [newQueries[index - 1], newQueries[index]];
            } else if (direction === 'down' && index < newQueries.length - 1) {
                [newQueries[index], newQueries[index + 1]] = [newQueries[index + 1], newQueries[index]];
            }
            setLocalQueries(newQueries);
        };

        const handleSave = () => {
            onUpdate(localQueries);
            onClose();
        };

        return (
            isOpen && (
                <div className="modal-content">i
                    <div className="modal-header">Change Query Order</div>
                    {localQueries.map((query, index) => (
                        <div key={index} className="query-item">
                            <div className="name-box">
                                <span>{query.representationName}</span>
                            </div>
                            <button onClick={(e) => handleChangeOrder(index, 'up', e)} disabled={index === 0} style={{ marginLeft: '5px' }}>↑</button>
                            <button onClick={(e) => handleChangeOrder(index, 'down', e)} disabled={index === localQueries.length - 1} style={{ marginLeft: '5px' }}>↓</button>
                        </div>
                    ))}
                    <div className="modal-buttons">
                        <button onClick={handleSave} className="save-button delete-confirm">Save Order</button>
                        <button onClick={onClose} className="save-button cancel-button">Close</button>
                    </div>
                </div>
            )
        );
    };


    // Handle changes in main headings, programs, and queries
    const handleMainHeadingChange = (e, mainIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].heading = e.target.value;
        setMainHeadings(newMainHeadings);
    };


    const handleBarColorChange = (yKey, color) => {
        setBarColors(prevColors => ({ ...prevColors, [yKey]: color }));
    };
    const handleChange = (e) => {
        if (e.target.value.length <= 30) {
            setProgramName(e.target.value);
        }
    };
    const removeQuery = (mainIndex, programIndex, queryIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs[programIndex].queries.splice(queryIndex, 1); // Remove the query at the specified index
        setMainHeadings(newMainHeadings);
    };

    const handleProgramHeadingChange = (e, mainIndex, programIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs[programIndex].programHeading = e.target.value;
        setMainHeadings(newMainHeadings);
    };

    const handleQueryChange = (e, mainIndex, programIndex, queryIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].query = e.target.value;
        setMainHeadings(newMainHeadings);
    };

    // Open popup and send the query to the backend, and store the result
    const handleRunQuery = async (mainIndex, programIndex, queryIndex) => {
        const queryDetails = mainHeadings[mainIndex].programs[programIndex].queries[queryIndex];
        const query = queryDetails.query;

        try {
            const response = await fetch('https://api-4xns5palna-uc.a.run.app/api/run-sql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();

            if (response.ok) {
                setQueryResult(data); // Set the query result in the state
            } else {
                setQueryResult({ error: data.error || 'Query failed' }); // Handle error response
            }
        } catch (error) {
            setQueryResult({ error: 'Failed to run query' }); // Handle request failure
        }

        // Set the current query and its details for editing
        setCurrentQuery({ mainIndex, programIndex, queryIndex });
        setSelectedRepresentation(queryDetails.representation);
        setRepresentationName(queryDetails.representationName || "");
        setCardInfo(queryDetails.cardInfo || "");
        setSize(queryDetails.size || "");
        setColors(queryDetails.color || []);
        setBarColors(queryDetails.barColors || {});
        setXAxis(queryDetails.xAxis || "");
        setYAxis(queryDetails.yAxis || []);
        setYAxisLabel(queryDetails.yAxisLabelAxis || "Values");
        setXAxisLabel(queryDetails.xAxisLabel || "");
        setMaxYValue(queryDetails.maxYValue || null);
        setMinYValue(queryDetails.minYValue || null);
        setLabelColumn(queryDetails.labelColumn || "")
        setValueColumn(queryDetails.valueColumn || "")
        setIsPopupOpen(true);
    };

    // Handle the representation selection in the popup
    const handleRepresentationChange = (e) => {
        setSelectedRepresentation(e.target.value);
    };
    const handleSizeChange = (e) => {
        setSize(e.target.value)
    }

    const handleNameChange = (e) => {
        setRepresentationName(e.target.value);
    };

    // Handle color changes for each query
    const handleColorChange = (colorValue, index) => {
        const newColors = [...color]; // Clone the current colors array
        newColors[index] = colorValue; // Update color at the specific index
        setColors(newColors); // Set the updated colors array
    };



    // Save the selected representation and color back to the query when submitting the popup
    // Save the selected representation and color back to the query when submitting the popup
    const handlePopupSubmit = () => {
        if (currentQuery) {
            const { mainIndex, programIndex, queryIndex } = currentQuery;
            const newMainHeadings = [...mainHeadings];


            // Save the selected representation
            newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].representation = selectedRepresentation;
            newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].representationName = representationName;
            if (selectedRepresentation === 'card') {
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].cardInfo = cardInfo;

            }
            if (selectedRepresentation === 'table') {
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].size = size;

            }


            // If the selected representation is a pie chart, save the pie colors; otherwise, save bar colors
            if (selectedRepresentation === "pie-chart" || selectedRepresentation === "donut") {
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].color = color; // Save pie chart colors
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].labelColumn = labelColumn;
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].valueColumn = valueColumn;

            } else {
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].barColors = barColors; // Save bar chart colors
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].xAxis = xAxis; // Save bar chart colors
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].yAxis = yAxis; // Save bar chart colors
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].xAxisLabel = xAxisLabel; // Save bar chart colors
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].yAxisLabelAxis = yAxisLabel; // Save bar chart colors
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].maxYValue = maxYValue; // Save bar chart colors
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].size = size; // Save bar chart colors
                if (selectedRepresentation === "linegraph") {
                    newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].minYValue = minYValue;
                } // Save bar chart colors



            }
            setSavedQueries(prev => new Set(prev).add(`${mainIndex}-${programIndex}-${queryIndex}`));

            setMainHeadings(newMainHeadings);
        }
        setIsPopupOpen(false);
    };


    const handlePopupClose = () => {
        setIsPopupOpen(false);
        setSelectedRepresentation(""); // Reset the selected representation
        setRepresentationName(""); // Reset the card/table name
        setColors([]); // Reset the colors
    };

    // Functions to add new query, program, and main headings
    const addQuery = (mainIndex, programIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs[programIndex].queries.push({ query: '', representation: '', colors: [] }); // Add colors
        setMainHeadings(newMainHeadings);
    };

    const addProgramHeading = (mainIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs.push({ programHeading: '', queries: [{ query: '', representation: '', colors: [] }] });
        setMainHeadings(newMainHeadings);
    };
    const removeMainHeading = (mainIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings.splice(mainIndex, 1); // Remove the main heading at the specified index
        setMainHeadings(newMainHeadings);
    };


    const addMainHeading = () => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings.push({ heading: '', programs: [{ programHeading: '', queries: [{ query: '', representation: '', colors: [] }] }] });
        setMainHeadings(newMainHeadings);
    };
    const removeProgramHeading = (mainIndex, programIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs.splice(programIndex, 1); // Remove the program heading at the specified index
        setMainHeadings(newMainHeadings);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmation(true); // Open confirmation modal
    };
    const handleChangeProgramOrder = (mainIndex, programIndex, direction) => {
        const newMainHeadings = [...mainHeadings];
        if (direction === 'up' && programIndex > 0) {
            // Swap with the previous program heading
            [newMainHeadings[mainIndex].programs[programIndex], newMainHeadings[mainIndex].programs[programIndex - 1]] =
                [newMainHeadings[mainIndex].programs[programIndex - 1], newMainHeadings[mainIndex].programs[programIndex]];
        } else if (direction === 'down' && programIndex < newMainHeadings[mainIndex].programs.length - 1) {
            // Swap with the next program heading
            [newMainHeadings[mainIndex].programs[programIndex], newMainHeadings[mainIndex].programs[programIndex + 1]] =
                [newMainHeadings[mainIndex].programs[programIndex + 1], newMainHeadings[mainIndex].programs[programIndex]];
        }
        setMainHeadings(newMainHeadings);
    };

    const confirmSave = async (e) => {
        e.preventDefault();

        // Create a deep copy of the mainHeadings to avoid mutating state directly
        const sanitizedHeadings = mainHeadings.map((mainHeading) => {
            return {
                ...mainHeading,
                programs: mainHeading.programs.map((program) => {
                    return {
                        ...program,
                        queries: program.queries.map((query) => {
                            // If the representation is either 'table' or 'card', include 'query', 'representation', and 'representationName'
                            if (query.representation === "card") {
                                const { query: queryText, representation, representationName, cardInfo } = query;
                                return { query: queryText, representation, representationName, cardInfo };
                            }
                            if (query.representation === "table") {
                                const { query: queryText, representation, representationName, size } = query;
                                return { query: queryText, representation, representationName, size };
                            }
                            // Remove 'colors' if the representation is not 'pie-chart' or 'donut'
                            if (query.representation !== "pie-chart" && query.representation !== "donut") {
                                // If it's not a 'line-graph', remove 'minY' as well
                                if (query.representation !== "linegraph") {
                                    const { colors, labelColumn, valueColumn, minYValue, cardInfo, ...filteredQuery } = query;
                                    return filteredQuery;
                                } else {
                                    const { colors, labelColumn, valueColumn, ...filteredQuery } = query;
                                    return filteredQuery;
                                }
                            }

                            // Remove 'barColors' if the representation is 'pie-chart' or 'donut'
                            else {
                                const { query: queryText, representation, representationName, labelColumn, valueColumn, color } = query;
                                return { query: queryText, representation, representationName, labelColumn, valueColumn, color };
                            }
                        })
                    };
                })
            };
        });

        console.log('ProgramName', programName);
        console.log('Form submitted with sanitized values:', sanitizedHeadings);

        const db = getFirestore();

        try {
            await setDoc(doc(db, "Programs", `${programName}_specific`), {
                headings: sanitizedHeadings, // Save the sanitized headings into Firestore
            });
            console.log('Document successfully written to Firestore!');
            toast.success('Submission successful!'); // Show success notification

        } catch (error) {
            console.error("Error writing document to Firestore: ", error);
            toast.error('Error submitting data!'); // Show error notification

        }
        setShowConfirmation(false); // Close the confirmation modal
    };
    return (
        <div className='addprogram-container'>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className='addprogram-content'>
                <h1>Add Your Pages</h1>
                <div className="add-program-page">
                    <div className="input-groupp"> {/* Wrapper for label and input */}
                        <label htmlFor="program-name" className="section-heading">
                            Program Name:
                        </label>
                        <input
                            type="text"
                            id="program-name"
                            className="form-input"
                            value={programName}
                            onChange={handleChange}
                            placeholder="Enter program name"
                            maxLength={30}
                        />
                    </div>
                    <form className="add-query-form" onSubmit={handleSubmit}>
                        {mainHeadings.map((mainHeading, mainIndex) => (
                            <div key={mainIndex} className="main-heading-container">
                                <h3>Main Heading {mainIndex + 1}</h3>
                                <input
                                    type="text"
                                    placeholder="Enter Main Heading"
                                    value={mainHeading.heading}
                                    onChange={(e) => handleMainHeadingChange(e, mainIndex)}
                                />
                                <button type="button" onClick={() => removeMainHeading(mainIndex)} className="remove-btn">
                                    Remove Main Heading
                                </button>
                                <button type="button" onClick={() => handleChangeMainOrder(mainIndex, 'up')} style={{ marginLeft: '5px' }} disabled={mainIndex === 0}>↑</button>
                                <button type="button" onClick={() => handleChangeMainOrder(mainIndex, 'down')} style={{ marginLeft: '5px' }} disabled={mainIndex === mainHeadings.length - 1}>↓</button>


                                {mainHeading.programs.map((program, programIndex) => (
                                    <div key={programIndex} className="program-heading-container">
                                        <label>Program Heading {programIndex + 1}:</label>
                                        <input
                                            type="text"
                                            name="program-heading"
                                            placeholder="Enter Program Heading"
                                            value={program.programHeading}
                                            onChange={(e) => handleProgramHeadingChange(e, mainIndex, programIndex)}
                                        />
                                        <button type="button" onClick={() => removeProgramHeading(mainIndex, programIndex)} className="remove-btn">
                                            Remove Program
                                        </button>
                                        <button type="button" onClick={() => handleChangeProgramOrder(mainIndex, programIndex, 'up')} style={{ marginLeft: '5px' }} disabled={programIndex === 0}>↑</button>
                                        <button type="button" onClick={() => handleChangeProgramOrder(mainIndex, programIndex, 'down')} style={{ marginLeft: '5px' }} disabled={programIndex === mainHeading.programs.length - 1}>↓</button>
                                        

                                        {program.queries.map((queryObj, queryIndex) => (
                                            <div key={queryIndex} className="query-container">
                                                <label>SQL Query {queryIndex + 1}:</label>
                                                <textarea
                                                    value={queryObj.query}
                                                    onChange={(e) => handleQueryChange(e, mainIndex, programIndex, queryIndex)}
                                                    placeholder="Enter your SQL query"
                                                />

                                                <div className="representation-container">
                                                    <button type="button" onClick={() => handleRunQuery(mainIndex, programIndex, queryIndex)}>
                                                        Run Query
                                                    </button>

                                                    {savedQueries.has(`${mainIndex}-${programIndex}-${queryIndex}`) && (
                                                        <span className="tick-sign">✔️ {queryObj.representationName}</span> // Render tick sign
                                                    )}
                                                    <button type="button" onClick={() => removeQuery(mainIndex, programIndex, queryIndex)} className="remove-btn">
                                                        Remove Query
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addQuery(mainIndex, programIndex)} className="add-query-btn">
                                            Add SQL Query
                                        </button>
                                        <button type="button" onClick={() => openChangeOrderPopup(mainIndex, programIndex)} className="remove-btn">
                                            Change Query Order
                                        </button>

                                    </div>
                                ))}
                                <ChangeOrderPopup
                                    isOpen={isChangeOrderPopupOpen}
                                    onClose={() => setIsChangeOrderPopupOpen(false)}
                                    queries={currentProgramIndex ? mainHeadings[currentProgramIndex.mainIndex].programs[currentProgramIndex.programIndex].queries : []}
                                    onUpdate={(updatedQueries) => {
                                        if (currentProgramIndex) {
                                            const newMainHeadings = [...mainHeadings];
                                            newMainHeadings[currentProgramIndex.mainIndex].programs[currentProgramIndex.programIndex].queries = updatedQueries;
                                            setMainHeadings(newMainHeadings);
                                        }
                                    }}
                                />

                                <button type="button" onClick={() => addProgramHeading(mainIndex)} className="add-program-btn">
                                    Add Program Heading
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addMainHeading} className="add-main-btn">
                            Add Main Heading
                        </button>

                        <button type="submit" className="push-btn">Push</button>
                    </form>
                    {showConfirmation && (
                        <div className="modal-content">
                            <div className="modal-header">Are you sure you want to proceed with changes?</div>
                            <div className="modal-buttons">
                                <button onClick={confirmSave} className="save-button delete-confirm">Yes</button>
                                <button onClick={() => setShowConfirmation(false)} className="save-button cancel-button">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Popup for selecting representation */}
            <Popup
                isPopupOpen={isPopupOpen}
                selectedRepresentation={selectedRepresentation}
                size={size}
                handleSizeChange={handleSizeChange}
                handleRepresentationChange={handleRepresentationChange}
                handlePopupSubmit={handlePopupSubmit}
                handlePopupClose={handlePopupClose}
                queryResult={queryResult} // Pass the SQL result to the Popup
                representationName={representationName} // Add this to allow naming
                setRepresentationName={setRepresentationName}
                handleNameChange={handleNameChange}
                color={color} // Pass color array to Popup
                handleColorChange={handleColorChange}
                setColors={setColors} // Function to change colors
                barColors={barColors}
                handleBarColorChange={handleBarColorChange}
                setBarColors={setBarColors}
                valueColumn={valueColumn}
                labelColumn={labelColumn}
                setLabelColumn={setLabelColumn}
                setValueColumn={setValueColumn}
                xAxis={xAxis}
                setXAxis={setXAxis}
                yAxis={yAxis}
                setYAxis={setYAxis}
                yAxisLabel={yAxisLabel}
                xAxisLabel={xAxisLabel}
                setYAxisLabel={setYAxisLabel}
                setXAxisLabel={setXAxisLabel}
                maxYValue={maxYValue}
                setMaxYValue={setMaxYValue}
                minY={minYValue}
                setMinY={setMinYValue}
                cardInfo={cardInfo}
                setCardInfo={setCardInfo}
                setSize={setSize}

            />
        </div>
    );
};

export default SpecificInputss;
