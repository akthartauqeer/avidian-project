import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import based on your project structure
import './PopupData.css';

const apiAddress = "http://localhost:5045/api/api/run-sql";

const PopupData = ({ docId }) => {
    const [pdfFiles, setPdfFiles] = useState([]);
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocumentData = async () => {
            try {
                const docRef = doc(db, 'Programs', `${docId}_data`);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    if (data.pdfFiles) setPdfFiles(data.pdfFiles);
                    if (data.queries && Array.isArray(data.queries)) {
                        setQueries(data.queries.map(query => ({
                            name: query.queryName,
                            text: query.queryText
                        })));
                    }
                } else {
                    setError('No such report!');
                }
            } catch (error) {
                setError('Error fetching document data.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocumentData();
    }, [docId]);

    const handleQueryClick = async (queryText) => {
        try {
            console.log("Sending query:", queryText);
            const response = await fetch(apiAddress, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: queryText }),
            });
        
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const data = await response.json();
            console.log("Query result:", data);
        
            // Assuming `data` is an array of objects
            if (data && data.length > 0) {
                const defaultFilename = `${queryText.split(' ')[0]}_result.csv`;
                const filename = window.prompt("Enter a filename for the CSV:", defaultFilename) || defaultFilename;
                downloadCSV(data, filename);
            } else {
                alert('No data returned from the query.');
            }
        } catch (error) {
            console.error('Failed to run query:', error);
            alert('Failed to run query. Please try again.');
        }
    };
    
    
    const downloadCSV = (data, filename) => {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    

    if (loading) {
        return <p>Loading data...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="popup-container">
            <h2>Reports</h2>
            {pdfFiles.length > 0 ? (
                <div className="pdf-files-container">
                    {pdfFiles.map((file, index) => (
                        <div key={index} className="pdf-file">
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/281/281760.png"
                                    alt="Document Icon"
                                    className="book-icon"
                                />
                                <div className="file-name">{file.name}</div>
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No PDF files available.</p>
            )}

            <h2>Data Download</h2>
            {queries.length > 0 ? (
                <div className="queries-container">
                    {queries.map((query, index) => (
                        <div key={index} className="query-item" onClick={() => handleQueryClick(query.text)}>
                            <div className="query-icon-wrapper">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
                                    alt="Data Report Icon"
                                    className="query-icon"
                                />
                                <div className="query-name">{query.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No queries available.</p>
            )}
        </div>
    );
};

export default PopupData;