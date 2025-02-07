import React, { useState } from "react";
import './commoninput2.css'
import Popup from "../../components/Popup2/popup2";
import axios from "axios";
import { db, storage } from '../../firebase'; // Assuming you have this in your firebase.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const CommonInputss = () => {
    const [programName, setProgramName] = useState('');
    const [headerLeft, setHeaderLeft] = useState('');
    const [headerMiddle, setHeaderMiddle] = useState('');
    const [headerrightbelow, setHeaderrightbelow] = useState('');
    const [fileName, setFileName] = useState(''); // New state for file name
    const [isOngoing, setIsOngoing] = useState(false); // Checkbox state
    const [cardImage, setCardImage] = useState(null); // State for card image
    const [cardFileName, setCardFileName] = useState('');
    const [headerRightStartDate, setHeaderRightStartDate] = useState('');
    const [headerRightEndDate, setHeaderRightEndDate] = useState('');
    const [headerImage, setHeaderImage] = useState(null);
    const [filters, setFilters] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupFilterName, setPopupFilterName] = useState('');
    const [queryResult, setQueryResult] = useState(null); // To store the SQL query result
    const [showConfirmation, setShowConfirmation] = useState(false);


    const openPopup = async (filter) => {
        setPopupFilterName(filter.name);

        // Define the SQL query in the frontend
        const query = `
            SELECT DISTINCT ${filter.databasename} 
            FROM ${filter.sheetname};
        `; // Construct the SQL query based on the filter

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
                setQueryResult(data); // Set the query result in the state
                setIsPopupOpen(true); // Open the popup
            } else {
                setQueryResult({ error: data.error || 'Query failed' }); // Handle error response
                setIsPopupOpen(true); // Open the popup even if there's an error
            }
        } catch (error) {
            setQueryResult({ error: 'Failed to run query' }); // Handle request failure
            setIsPopupOpen(true); // Open the popup even if there's an error
        }
    };


    const closePopup = () => {
        setIsPopupOpen(false); // Close the popup
    };

    const [filterMethod, setFilterMethod] = useState({});
    const handleChange = (e) => {
        if (e.target.value.length <= 30) {
            setProgramName(e.target.value);
        }
    };
    const handleHeaderLeftChange = (e) => {
        setHeaderLeft(e.target.value);
    };
    const handleHeaderMiddleChange = (e) => {
        if (e.target.value.length <= 200) {
            setHeaderMiddle(e.target.value);
        }
    };
    const handleheaderrightbelowChange = (e) => {
        if (e.target.value.length <= 200) {
            setHeaderrightbelow(e.target.value);
        }
    };
    const handleImageChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const storageRef = ref(storage, `programs/${file.name}`);

            // Upload the file
            await uploadBytes(storageRef, file);

            // Get the download URL and update the headerImage state
            const downloadURL = await getDownloadURL(storageRef);
            setHeaderImage(downloadURL);
            setFileName(file.name); // Set the filename to display
        }
    };
    const addFilter = () => {
        setFilters([...filters, { name: '', dropdownValues: [''], databasename: '', sheetname: '' }]);
    };

    // Handle changes for filter name
    const handleFilterNameChange = (index, value) => {
        const newFilters = [...filters];
        newFilters[index].name = value;
        setFilters(newFilters);
    };

    // Handle changes for dropdown values
    const addDropdownValue = (filterIndex) => {
        const newFilters = [...filters];
        newFilters[filterIndex].dropdownValues.push('');
        setFilters(newFilters);
    };

    const handleDropdownValueChange = (filterIndex, valueIndex, value) => {
        const newFilters = [...filters];
        newFilters[filterIndex].dropdownValues[valueIndex] = value;
        setFilters(newFilters);
    };

    const handleFilterMethodChange = (filterIndex, method) => {
        setFilterMethod({ ...filterMethod, [filterIndex]: method });
    };
    const handleDatabaseNameChange = (filterIndex, value) => {
        const newFilters = [...filters];
        newFilters[filterIndex].databasename = value;
        setFilters(newFilters);
    };
    const handleCardImageChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const storageRef = ref(storage, `programs/cardImages/${file.name}`); // Store in a separate folder

            // Upload the file
            await uploadBytes(storageRef, file);

            // Get the download URL and update the cardImage state
            const downloadURL = await getDownloadURL(storageRef);
            setCardImage(downloadURL);
            setCardFileName(file.name); // Set the filename to display
        }
    };

    // Handle changes for sheetname
    const handleSheetNameChange = (filterIndex, value) => {
        const newFilters = [...filters];
        newFilters[filterIndex].sheetname = value;
        setFilters(newFilters);
    };
    // Prevent default form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmation(true); // Open confirmation modal
    };

    const confirmSave = async (e) => {
        e.preventDefault();

        const processedFilters = filters.map((filter, index) => {
            if (filterMethod[index] === 'manual') {
                return {
                    name: filter.name,
                    dropdownValues: filter.dropdownValues.filter(value => value !== '') // Filter empty values
                };
            } else {
                return {
                    name: filter.name,
                    databasename: filter.databasename,
                    sheetname: filter.sheetname
                };
            }
        });

        const programData = {
            programName,
            cardImage,
            headerLeft,
            headerMiddle,
            headerRightStartDate,
            headerRightEndDate: isOngoing ? 'ongoing' : headerRightEndDate, // Set to "ongoing" if checked
            headerrightbelow,
            headerImage, // URL stored here after upload
            filters: processedFilters
        };

        try {
            const docName = `${programName}_common`;
            const docRef = doc(collection(db, 'Programs'), docName);
            await setDoc(docRef, programData);
            toast.success('Submission successful!'); // Show success notification


            console.log('Data successfully written to Firestore');
        } catch (error) {
            console.error('Error writing document: ', error);
            toast.error('Error submitting data!'); // Show error notification

        }
        setShowConfirmation(false); // Close the confirmation modal
    };



    return (
        <div className="addprogram-container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className='addprogram-content'>
                <div className="add-program-page">
                    <h1 className='random'>Add a New Program</h1>
                    <form className="add-program-form" onSubmit={handleSubmit}>
                        <div className="input-group"> {/* Wrapper for label and input */}
                            <label htmlFor="program-name" className="section-heading">
                                1. Program Name:
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
                        <div className='input-group'> {/* Wrapper for label and inputs */}
                            <label htmlFor="card-image" className="section-heading">
                                2. Card Image (Optional):
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-input"
                                onChange={handleCardImageChange}
                            />
                            <label className="file-upload-label">{cardFileName}</label> {/* Display file name */}
                        </div>

                        {/* Header Inputs Section */}
                        <label className="section-heading">3. Header Inputs</label>
                        <div className='input-group'> {/* Wrapper for label and inputs */}
                            <label htmlFor="header-left" className="form-label header-left">
                                (i). Header Left (Text or Image):
                            </label>
                            <input
                                type="text"
                                id="header-left"
                                className="form-input"
                                value={headerLeft}
                                onChange={handleHeaderLeftChange}
                                placeholder="Enter header left text"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                className="form-input"
                                onChange={handleImageChange}
                            />
                            <label className="file-upload-label">{fileName}</label> {/* Display file name */}

                        </div>
                        <div className='input-group'> {/* Wrapper for label and input */}
                            <label htmlFor="header-middle" className="form-label">
                                (ii). Header Middle:
                            </label>
                            <input
                                type="text"
                                id="header-middle"
                                className="form-input"
                                value={headerMiddle}
                                onChange={handleHeaderMiddleChange}
                                placeholder="Enter header middle text"
                                maxLength={200}
                            />
                        </div>

                        {/* Header Right Section */}
                        <label className="form-label">(iii). Header Right</label>
                        <div className="header-right-inputs">
                            <div className='date-input-group'> {/* Wrapper for date fields */}
                                <div className='date-input-container'> {/* Flex container for Start Date */}
                                    <label htmlFor="start-date" className="form-label">
                                        Program Start Date:
                                    </label>
                                    <input
                                        type="date"
                                        id="start-date"
                                        className="form-input date-input"
                                        value={headerRightStartDate}
                                        onChange={(e) => setHeaderRightStartDate(e.target.value)}
                                    />
                                </div>

                                <div className='date-input-container'>
                                    <label htmlFor="end-date" className="form-label">
                                        Program End Date:
                                    </label>
                                    <input
                                        type="date"
                                        id="end-date"
                                        className="form-input date-input"
                                        value={isOngoing ? '' : headerRightEndDate} // Clear if ongoing
                                        onChange={(e) => setHeaderRightEndDate(e.target.value)}
                                        disabled={isOngoing} // Disable if ongoing is checked
                                    />
                                </div>

                                {/* Ongoing Checkbox */}
                                <div className='ongoing-checkbox'>
                                    <input
                                        type="checkbox"
                                        id="ongoing"
                                        checked={isOngoing}
                                        onChange={(e) => setIsOngoing(e.target.checked)}
                                    />
                                    <label htmlFor="ongoing"> Ongoing</label>
                                </div>



                            </div>
                            <div className='input-group fare'> {/* Wrapper for label and input */}
                                <label htmlFor="header-right-below" className="form-label">
                                    Header Right Below:
                                </label>
                                <input
                                    type="text"
                                    id="header-right-below"
                                    className="form-input"
                                    value={headerrightbelow}
                                    onChange={handleheaderrightbelowChange}
                                    placeholder="Enter header right below"
                                    maxLength={200}
                                />
                            </div>

                        </div>



                        {/* Filter Search Section */}
                        <label className="section-heading">4. Filter Search</label>
                        {filters.map((filter, filterIndex) => (
                            <div key={filterIndex} className="filter-section">
                                <input
                                    type="text"
                                    placeholder="Enter filter name"
                                    value={filter.name}
                                    onChange={(e) => handleFilterNameChange(filterIndex, e.target.value)}
                                    className="filter-input"
                                />

                                {/* Dropdown to select filter method */}
                                <div>
                                    <label>How do you want to enter dropdown values?</label>
                                    <select
                                        value={filterMethod[filterIndex] || 'database'}
                                        onChange={(e) => handleFilterMethodChange(filterIndex, e.target.value)}
                                    >
                                        <option value="manual">Enter Manually</option>
                                        <option value="database">Load from Database</option>
                                    </select>
                                </div>

                                {/* Conditionally render fields based on user selection */}
                                {filterMethod[filterIndex] === 'manual' ? (
                                    <>
                                        <div>Enter the dropdown value manually</div>
                                        {filter.dropdownValues.map((value, dropdownIndex) => (
                                            <div key={dropdownIndex} className="dropdown-row">
                                                <input
                                                    type="text"
                                                    placeholder="Enter dropdown value"
                                                    value={value}
                                                    onChange={(e) => handleDropdownValueChange(filterIndex, dropdownIndex, e.target.value)}
                                                    className="dropdown-input"
                                                />
                                                <button type="button" onClick={() => addDropdownValue(filterIndex)} className="add-dropdown-btn">
                                                    +
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Enter filter database name"
                                            value={filter.databasename} // Modify this to bind to the database input state
                                            onChange={(e) => handleDatabaseNameChange(filterIndex, e.target.value)}
                                            className="filter-input"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Enter table you want to get filter values from"
                                            value={filter.sheetname} // Modify this to bind to the sheet input state
                                            onChange={(e) => handleSheetNameChange(filterIndex, e.target.value)}
                                            className="filter-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => openPopup(filter)}
                                            className="load-btn"
                                        >
                                            Load
                                        </button>                                    </>
                                )}
                                <hr />
                                <hr />
                            </div>
                        ))}

                        <button type="button" onClick={addFilter} className="add-filter-btn">
                            Add Filter
                        </button>
                        <div className="submit-btn-container">
                            <button type="submit" className="submit-btn">Push</button>
                        </div>                    </form>
                    {showConfirmation && (
                        <div className="modal-content">
                            <div className="modal-header">Are you sure you want to proceed with changes?</div>
                            <div className="modal-buttons">
                                <button onClick={confirmSave} className="save-button delete-confirm">Yes</button>
                                <button onClick={() => setShowConfirmation(false)} className="save-button cancel-button">Cancel</button>
                            </div>
                        </div>
                    )}
                    {isPopupOpen && (
                        <Popup
                            closePopup={closePopup}
                            filterName={popupFilterName}
                            data={queryResult}
                        />
                    )}
                </div>
            </div>

        </div>
    );
};
export default CommonInputss