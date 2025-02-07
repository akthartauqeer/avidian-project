import React, { useState, useEffect } from 'react';
import './DynamicTable.css';

const DynamicTable = ({ query, apiAddress }) => {
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1); // For pagination
    const [originalData, setOriginalData] = useState([]); // To store original unsorted data
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' }); // For sorting
    const [error, setError] = useState(null); // For error message
    const rowsPerPage = 10; // Display 10 rows per page

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                const response = await fetch(apiAddress, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query }),
                });

                if (!response.ok) {
                    // Handle non-200 responses
                    throw new Error(`Error: ${response.status} - ${response.statusText} Please check your SQL query`);
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    // Ensure the response is in the expected format
                    throw new Error('Unexpected response format. Please check your SQL query.');
                }

                setTableData(data); // Store table data
                setOriginalData(data); // Store the original data
                setError(null); // Clear any previous errors
            } catch (error) {
                console.error('Failed to fetch table data:', error);
                setError(error.message); // Update error state
            } finally {
                setIsLoading(false);
            }
        };

        fetchTableData();
    }, [query]);

    // Sort table data when a column header is clicked
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedData = [...tableData].sort((a, b) => {
            const aValue = a[key];
            const bValue = b[key];

            // Handle numerical sorting for numbers in strings
            const regex = /\d+/;
            const aMatches = aValue.toString().match(regex);
            const bMatches = bValue.toString().match(regex);

            if (aMatches && bMatches) {
                const aNum = parseInt(aMatches[0], 10);
                const bNum = parseInt(bMatches[0], 10);
                return direction === 'ascending' ? aNum - bNum : bNum - aNum;
            }

            // Normal string comparison for non-numeric cases
            if (aValue < bValue) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setTableData(sortedData);
    };

    // Sort the table based on serial number (reset to original order)
    const handleSortBySerial = () => {
        setTableData([...originalData]); // Reset table data to original
        setSortConfig({ key: 'Serial No', direction: 'ascending' });
        setCurrentPage(1); // Reset to first page if needed
    };

    // Calculate the data to be displayed for the current page
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentTableData = tableData.slice(indexOfFirstRow, indexOfLastRow);

    // Calculate total pages
    const totalPages = Math.ceil(tableData.length / rowsPerPage);

    const handlePrevPage = () => {
        setCurrentPage(prevPage => (prevPage > 1 ? prevPage - 1 : prevPage));
    };

    const handleNextPage = () => {
        setCurrentPage(prevPage => (prevPage < totalPages ? prevPage + 1 : prevPage));
    };

    // Function to determine cell alignment based on value type
    const getCellAlignment = (value) => {
        // Check if the value is a number
        if (typeof value === 'number' || !isNaN(value)) {
            return 'center'; // Center align for numbers
        }
        return 'left'; // Left align for text
    };

    return (
        <div className="table-container">
            {isLoading ? (
                <p>Loading table data...</p>
            ) : error ? (
                <p className="error-message">{error}</p> // Display error message if there's an error
            ) : (
                <>
                    <div className="table-scroll"> {/* Added this wrapper */}
                        <table>
                            <thead>
                                <tr>
                                    <th className="serial-number" onClick={handleSortBySerial}>Serial No</th>
                                    {tableData.length > 0 &&
                                        Object.keys(tableData[0]).map((key, index) => (
                                            <th key={index} onClick={() => handleSort(key)}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>{key}</span>
                                                    {sortConfig.key === key && (
                                                        <span>
                                                            {sortConfig.direction === 'ascending' ? '🔼' : '🔽'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                </tr>
                            </thead>

                            <tbody>
                                {currentTableData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td className="serial-number">
                                            {indexOfFirstRow + rowIndex + 1}
                                        </td>
                                        {Object.values(row).map((value, colIndex) => (
                                            <td key={colIndex} style={{ textAlign: getCellAlignment(value) }}>
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="pagination-controls">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DynamicTable;
