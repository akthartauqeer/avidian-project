import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './Specific.css';
import DynamicCard from '../DynamicCard/DynamicCard';
import DynamicTable from '../DynamicTable/DynamicTable';
import DynamicPie from '../DynamicPie/DynamicPie';
import DynamicBar from '../DynamicBar/DynamicBar';
import DynamicLine from '../DynamicLine/DynamicLine';
import ModifiedQuery from '../ModifiedQuery';
import DynamicHorizontal from '../DynamicHorizontal/DynamicHorizontal';
import DynamicDonut from '../DynamicDonut/DynamicDonut';
import DynamicStack from '../DynamicStack/DynamicStack';
import PopupData from '../PopupData/PopupData'; // Assuming you have this component

function Specific({ docId, selectedValues, setSelectedValues, apiAddress }) {
    const [selectedOption, setSelectedOption] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState([]);
    const [programData, setProgramData] = useState([]);
    const [headingsData, setHeadingsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    useEffect(() => {
        const fetchHeadingsAndPrograms = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, 'Programs', `${docId}_specific`);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const headings = data.headings;

                    setHeadingsData(headings);

                    const options = headings.map((heading) => heading.heading);
                    options.push("Data Report and Download"); // Add new option
                    setDropdownOptions(options);

                    if (options.length > 0) {
                        setSelectedOption(options[0]);
                        updateProgramData(headings[0].programs);
                    }
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                setError('Error fetching data.');
                console.error('Error fetching data: ', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHeadingsAndPrograms();
    }, [docId]);

    const handleOptionChange = (e) => {
        const selectedHeading = e.target.value;
        setSelectedOption(selectedHeading);
        
        // Reset selectedValues to an empty object
        setSelectedValues({}); 

        if (selectedHeading === "Data Report and Download") {
            setIsPopupOpen(true); // Open the popup when this option is selected
            return;
        }

        const selectedData = headingsData.find(heading => heading.heading === selectedHeading);
        if (selectedData) {
            updateProgramData(selectedData.programs);
        }
    };

    const updateProgramData = (programs) => {
        const data = programs.map((program) => ({
            programHeading: program.programHeading,
            filteredQueries: program.queries
                ? program.queries.map((query) => {
                    const { representation, representationName, cardInfo, barColors, color, labelColumn, valueColumn, maxYValue, minYValue, xAxis, yAxis, xAxisLabel, yAxisLabelAxis, size } = query;

                    // Use ModifiedQuery to construct the query based on selectedValues
                    const modifiedQuery = Object.keys(selectedValues).length === 0
                        ? query.query
                        : ModifiedQuery(query.query, selectedValues);

                    if (representation === 'card') {
                        return { type: 'card', representationName, query: modifiedQuery, cardInfo };
                    } else if (representation === 'table') {
                        return { type: 'table', representationName, query: modifiedQuery, size };
                    } else if (representation === 'pie-chart') {
                        return {
                            type: 'pie-chart',
                            representationName,
                            query: modifiedQuery,
                            color,
                            labelColumn,
                            valueColumn
                        };
                    } else if (representation === 'donut') {
                        return {
                            type: 'donut',
                            representationName,
                            query: modifiedQuery,
                            color,
                            labelColumn,
                            valueColumn
                        };
                    } else if (representation === 'bargraph') {
                        return {
                            type: 'bargraph',
                            representationName,
                            query: modifiedQuery,
                            barColors,
                            maxYValue,
                            xAxis,
                            xAxisLabel,
                            yAxis,
                            yAxisLabelAxis, size
                        };
                    } else if (representation === 'horizontal-bargraph') {
                        return {
                            type: 'horizontal-bargraph',
                            representationName,
                            query: modifiedQuery,
                            barColors,
                            maxYValue,
                            xAxis,
                            xAxisLabel,
                            yAxis,
                            yAxisLabelAxis, size
                        };
                    } else if (representation === 'stack') {
                        return {
                            type: 'stack',
                            representationName,
                            query: modifiedQuery,
                            barColors,
                            maxYValue,
                            xAxis,
                            xAxisLabel,
                            yAxis,
                            yAxisLabelAxis, size
                        };
                    } else if (representation === 'linegraph') {
                        return {
                            type: 'linegraph',
                            representationName,
                            query: modifiedQuery,
                            barColors,
                            maxYValue,
                            minYValue,
                            xAxis,
                            xAxisLabel,
                            yAxis,
                            yAxisLabelAxis, size
                        };
                    } else {
                        return { type: 'default', representationName, query: modifiedQuery };
                    }
                })
                : []
        }));
        setProgramData(data);
    };

    useEffect(() => {
        console.log("Selected Values:", selectedValues);
        if (selectedValues) {
            programData.forEach((program) => {
                program.filteredQueries.forEach((queryDetail) => {
                    console.log(queryDetail.representationName, ":\n", queryDetail.query);
                });
            });
        }
    }, [selectedValues, programData]);

    useEffect(() => {
        updateProgramData(headingsData.find(heading => heading.heading === selectedOption)?.programs || []);
    }, [selectedValues, selectedOption, headingsData]);

    const closePopup = () => {
        setIsPopupOpen(false); // Function to close the popup
    };

    return (
        <div className="programme-summary">
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <>
                    <div className="summary-header">
                        <select
                            className="option-select"
                            value={selectedOption}
                            onChange={handleOptionChange}
                        >
                            {dropdownOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="program-headings">
                        {programData.length > 0 ? (
                            programData.map((program, index) => (
                                <div key={index} className="program-section">
                                    <div className="program-heading">
                                        <h3>{program.programHeading}</h3>
                                    </div>
                                    <div className="representation-details">
                                        {program.filteredQueries.map((queryDetail, qIndex) => {
                                            if (queryDetail.type === 'card') {
                                                return (
                                                    <div key={qIndex} className="query-card">
                                                        <DynamicCard
                                                            representationName={queryDetail.representationName}
                                                            query={queryDetail.query}
                                                            apiAddress={apiAddress}
                                                            cardInfo={queryDetail.cardInfo} />
                                                    </div>
                                                );
                                            } else if (queryDetail.type === 'table') {
                                                return (
                                                    <div key={qIndex} className="query-table">
                                                        <h4 style={{ marginTop: 10 }}>{queryDetail.representationName}</h4>
                                                        <DynamicTable
                                                            query={queryDetail.query}
                                                            representationName={queryDetail.representationName}
                                                            apiAddress={apiAddress}
                                                            size={queryDetail.size} />
                                                    </div>
                                                );
                                            } else if (queryDetail.type === 'pie-chart') {
                                                return (
                                                    <div key={qIndex} className="query-pie">
                                                        <DynamicPie
                                                            representationName={queryDetail.representationName}
                                                            color={queryDetail.color}
 labelColumn={queryDetail.labelColumn}
                                                            query={queryDetail.query}
                                                            apiAddress={apiAddress}
                                                            valueColumn={queryDetail.valueColumn} />
                                                    </div>
                                                );
                                            } else if (queryDetail.type === 'donut') {
                                                return (
                                                    <div key={qIndex} className="query-pie">
                                                        <DynamicDonut
                                                            representationName={queryDetail.representationName}
                                                            apiAddress={apiAddress}
                                                            color={queryDetail.color}
                                                            labelColumn={queryDetail.labelColumn}
                                                            query={queryDetail.query}
                                                            valueColumn={queryDetail.valueColumn} />
                                                    </div>
                                                );
                                            } else if (queryDetail.type === 'linegraph') {
                                                return (
                                                    <div key={qIndex} className={`query-line ${queryDetail.size === 'small' ? 'query-line-small' : 'query-line-large'}`}>
                                                        <h4>{queryDetail.representationName}</h4>
                                                        <DynamicLine
                                                            representationName={queryDetail.representationName}
                                                            query={queryDetail.query}
                                                            apiAddress={apiAddress}
                                                            barColors={queryDetail.barColors}
                                                            maxYValue={queryDetail.maxYValue}
                                                            minYValue={queryDetail.minYValue}
                                                            xAxis={queryDetail.xAxis}
                                                            yAxis={queryDetail.yAxis}
                                                            xAxisLabel={queryDetail.xAxisLabel}
                                                            yAxisLabelAxis={queryDetail.yAxisLabelAxis}
                                                            size={queryDetail.size}
                                                            heightClass="custom-height"
                                                            widthClass="custom-width"
                                                        />
                                                    </div>
                                                );
                                            } else if (queryDetail.type === 'bargraph') {
                                                return (
                                                    <div key={qIndex} className={`query-line ${queryDetail.size === 'small' ? 'query-line-small' : 'query-line-large'}`}>
                                                        <h4>{queryDetail.representationName}</h4>
                                                        <DynamicBar
                                                            representationName={queryDetail.representationName}
                                                            query={queryDetail.query}
                                                            apiAddress={apiAddress}
                                                            barColors={queryDetail.barColors}
                                                            maxYValue={queryDetail.maxYValue}
                                                            xAxis={queryDetail.xAxis}
                                                            yAxis={queryDetail.yAxis}
                                                            xAxisLabel={queryDetail.xAxisLabel}
                                                            yAxisLabelAxis={queryDetail.yAxisLabelAxis}
                                                            size={queryDetail.size}
                                                            heightClass="custom-height"
                                                            widthClass="custom-width" />
                                                    </div>
                                                );
                                            } else if (queryDetail.type === 'horizontal-bargraph') {
                                                return (
                                                    <div key={qIndex} className={`query-line ${queryDetail.size === 'small' ? 'query-line-small' : 'query-line-large'}`}>
                                                        <h4>{queryDetail.representationName}</h4>
                                                        <DynamicHorizontal
                                                            representationName={queryDetail.representationName}
                                                            query={queryDetail.query}
                                                            apiAddress={apiAddress}
                                                            barColors={queryDetail.barColors}
                                                            maxYValue={queryDetail.maxYValue}
                                                            xAxis={queryDetail.xAxis}
                                                            yAxis={queryDetail.yAxis}
                                                            xAxisLabel={queryDetail.xAxisLabel}
                                                            yAxisLabelAxis={queryDetail.yAxisLabelAxis}
                                                            size={queryDetail.size}
                                                            heightClass="custom-height"
                                                            widthClass="custom-width" />
                                                    </div>
                                                );
                                            } else if (queryDetail.type === 'stack') {
                                                return (
                                                    <div key={qIndex} className={`query-line ${queryDetail.size === 'small' ? 'query-line-small' : 'query-line-large'}`}>
                                                        <h4>{queryDetail.representationName}</h4>
                                                        <DynamicStack
                                                            representationName={queryDetail.representationName}
                                                            query={queryDetail.query}
                                                            apiAddress={apiAddress}
                                                            barColors={queryDetail.barColors}
                                                            maxYValue={queryDetail.maxYValue}
                                                            xAxis={queryDetail.xAxis}
                                                            yAxis={queryDetail.yAxis}
                                                            xAxisLabel={queryDetail.xAxisLabel}
                                                            yAxisLabelAxis={queryDetail.yAxisLabelAxis}
                                                            size={queryDetail.size}
                                                            heightClass="custom-height"
                                                            widthClass="custom-width" />
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div key={qIndex} className="query-representation">
                                                        <h4>{queryDetail.representationName} - {queryDetail.type}</h4>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p></p>
                        )}
                    </div>

                    {/* Popup for Data Report and Download */}
                    {isPopupOpen && (
                        <div className="popup-overlay" onClick={closePopup}>
                            <div className="popup -content" onClick={(e) => e.stopPropagation()}>
                            <PopupData docId={docId} /> {/* Pass docId as a prop here */}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Specific;