import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Popup from "../../components/popup/popup"; // Import your Popup component
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import './FetchAndEditSpecificInputs.css'
const FetchAndEditSpecificInput = () => {
    const { programName } = useParams();
    const [mainHeadings, setMainHeadings] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentQuery, setCurrentQuery] = useState(null);
    const [queryResult, setQueryResult] = useState(null);
    const [selectedRepresentation, setSelectedRepresentation] = useState("");
    const [representationName, setRepresentationName] = useState("");
    const [cardInfo, setCardInfo] = useState("");
    const [size, setSize] = useState("");
    const [color, setColors] = useState([]);
    const [barColors, setBarColors] = useState({});
    const [yAxisLabel, setYAxisLabel] = useState('Values');
    const [xAxisLabel, setXAxisLabel] = useState('');
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState([]);
    const [minYValue, setMinYValue] = useState(null);
    const [maxYValue, setMaxYValue] = useState(null);
    const [labelColumn, setLabelColumn] = useState('');
    const [valueColumn, setValueColumn] = useState('');
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



    useEffect(() => {
        const fetchProgramData = async () => {
            try {
                const docRef = doc(db, "Programs", `${programName}_specific`);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMainHeadings(data.headings || []);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };

        fetchProgramData();
    }, [programName]);

    const handleMainHeadingChange = (e, mainIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].heading = e.target.value;
        setMainHeadings(newMainHeadings);
    };
    const handleSizeChange = (e) => {
        setSize(e.target.value)
    }
    const handleProgramHeadingChange = (e, mainIndex, programIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs[programIndex].programHeading = e.target.value;
        setMainHeadings(newMainHeadings);
    };
    const removeQuery = (mainIndex, programIndex, queryIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs[programIndex].queries.splice(queryIndex, 1); // Remove the query at the specified index
        setMainHeadings(newMainHeadings);
    };


    const handleQueryChange = (e, mainIndex, programIndex, queryIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].query = e.target.value;
        setMainHeadings(newMainHeadings);
    };

    const handleRunQuery = async (mainIndex, programIndex, queryIndex) => {
        const queryDetails = mainHeadings[mainIndex].programs[programIndex].queries[queryIndex];
        const query = queryDetails.query;

        try {
            const response = await fetch('http://localhost:5045/api/api/run-sql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();

            if (response.ok) {
                setQueryResult(data);
            } else {
                setQueryResult({ error: data.error || 'Query failed' });
            }
        } catch (error) {
            setQueryResult({ error: 'Failed to run query' });
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
        setLabelColumn(queryDetails.labelColumn || "");
        setValueColumn(queryDetails.valueColumn || "");
        setIsPopupOpen(true);
    };

    const handlePopupSubmit = () => {
        if (currentQuery) {
            const { mainIndex, programIndex, queryIndex } = currentQuery;
            const newMainHeadings = [...mainHeadings];

            newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].representation = selectedRepresentation;
            newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].representationName = representationName;

            if (selectedRepresentation === 'card') {
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].cardInfo = cardInfo;
            }
            if (selectedRepresentation === 'table') {
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].size = size;
            }

            if (selectedRepresentation === "pie-chart" || selectedRepresentation === "donut") {
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].color = color;
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].labelColumn = labelColumn;
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].valueColumn = valueColumn;
            } else {
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].barColors = barColors;
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].xAxis = xAxis;
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].yAxis = yAxis;
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].xAxisLabel = xAxisLabel;
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].yAxisLabelAxis = yAxisLabel;
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].maxYValue = maxYValue;
                newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].size = size;
                if (selectedRepresentation === "linegraph") {
                    newMainHeadings[mainIndex].programs[programIndex].queries[queryIndex].minYValue = minYValue;
                }
            }

            setMainHeadings(newMainHeadings);
        }
        setIsPopupOpen(false);
    };

    const handlePopupClose = () => {
        setIsPopupOpen(false);
        setSelectedRepresentation("");
        setRepresentationName("");
        setColors([]);
        setBarColors({});
        setXAxis("");
        setYAxis([]);
        setYAxisLabel("Values");
        setXAxisLabel("");
        setMaxYValue(null);
        setMinYValue(null);
        setCardInfo("");
        setValueColumn("");
        setLabelColumn("");
        setSize("");
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmation(true); // Open confirmation modal
    };

    const confirmSave = async (e) => {
        e.preventDefault();
        const sanitizedHeadings = mainHeadings.map((mainHeading) => ({
            ...mainHeading,
            programs: mainHeading.programs.map((program) => ({
                ...program,
                queries: program.queries.map((query) => {
                    if (query.representation === "card") {
                        const { query: queryText, representation, representationName, cardInfo } = query;
                        return { query: queryText, representation, representationName, cardInfo };
                    }
                    if (query.representation === "table") {
                        const { query: queryText, representation, representationName, size } = query;
                        return { query: queryText, representation, representationName, size };
                    }
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
            }))
        }));

        try {
            await updateDoc(doc(db, "Programs", `${programName}_specific`), {
                headings: sanitizedHeadings,
            });
            console.log('Document successfully updated in Firestore!');
            toast.success('Data successfully edited!'); // Show success notification

        } catch (error) {
            console.error("Error updating document in Firestore: ", error);
            toast.error('Error updating data!'); // Show error notification

        }
        setShowConfirmation(false); // Close the confirmation modal

    };

    const addMainHeading = () => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings.push({ heading: '', programs: [{ programHeading: '', queries: [{ query: '', representation: '', colors: [] }] }] });
        setMainHeadings(newMainHeadings);
    };
    const removeMainHeading = (mainIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings.splice(mainIndex, 1); // Remove the main heading at the specified index
        setMainHeadings(newMainHeadings);
    };
    const addProgramHeading = (mainIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs.push({ programHeading: '', queries: [{ query: '', representation: '', colors: [] }] });
        setMainHeadings(newMainHeadings);
    };


    const removeProgramHeading = (mainIndex, programIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs.splice(programIndex, 1); // Remove the program heading at the specified index
        setMainHeadings(newMainHeadings);
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

    const addQuery = (mainIndex, programIndex) => {
        const newMainHeadings = [...mainHeadings];
        newMainHeadings[mainIndex].programs[programIndex].queries.push({ query: '', representation: '', colors: [] }); // Add colors
        setMainHeadings(newMainHeadings);
    };

    return (
        <div className='adddprogram-container'>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className='addprogram-content'>
                <h2>Edit Your {programName} Specific Pages</h2>
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

                                                <span className="tick-sign"> {queryObj.representationName} - {queryObj.representation}</span>
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
                            <button type="button" onClick={() => addProgramHeading(mainIndex)} className="add-program-btn">
                                Add Program Heading
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
                    <button type="button" onClick={addMainHeading} className="add-main-btn">
                        Add Main Heading
                    </button>
                    <button type="submit" className="push-btn">Save Changes</button>
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

            {/* Popup for selecting representation */}
            <Popup
                isPopupOpen={isPopupOpen}
                selectedRepresentation={selectedRepresentation}
                handleRepresentationChange={(e) => setSelectedRepresentation(e.target.value)}
                handlePopupSubmit={handlePopupSubmit}
                handlePopupClose={handlePopupClose}
                queryResult={queryResult}
                representationName={representationName}
                setRepresentationName={setRepresentationName}
                handleNameChange={(e) => setRepresentationName(e.target.value)}
                color={color}
                handleColorChange={(colorValue, index) => {
                    const newColors = [...color];
                    newColors[index] = colorValue;
                    setColors(newColors);
                }}
                setColors={setColors}
                barColors={barColors}
                handleBarColorChange={(yKey, color) => {
                    setBarColors(prevColors => ({ ...prevColors, [yKey]: color }));
                }}
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
                size={size}
                setSize={setSize}
                handleSizeChange={handleSizeChange}
            />
        </div>
    );
};

export default FetchAndEditSpecificInput;