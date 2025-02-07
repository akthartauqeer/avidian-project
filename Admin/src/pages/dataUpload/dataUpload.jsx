import React, { useState } from "react";
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './dataUpload.css';

const DataUpload = () => {
    const [programName, setProgramName] = useState('');
    const [pdfFiles, setPdfFiles] = useState([{ name: '', url: '', pdfName: '' }]);
    const [queries, setQueries] = useState([{ queryName: '', queryText: '' }]);

    const handleProgramNameChange = (e) => setProgramName(e.target.value);

    const handlePdfChange = async (index, e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            const storageRef = ref(storage, `programs/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setPdfFiles(prevFiles => {
                const newFiles = [...prevFiles];
                newFiles[index] = { name: file.name, url: downloadURL, pdfName: '' };
                return newFiles;
            });
        } else {
            toast.error('Please upload a valid PDF file.');
        }
    };

    const handlePdfNameChange = (index, value) => {
        setPdfFiles(prevFiles => {
            const newFiles = [...prevFiles];
            newFiles[index].pdfName = value;
            return newFiles;
        });
    };

    const addPdfUpload = () => setPdfFiles(prevFiles => [...prevFiles, { name: '', url: '', pdfName: '' }]);

    const removePdf = (index) => {
        setPdfFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleQueryChange = (index, field, value) => {
        const newQueries = [...queries];
        newQueries[index][field] = value;
        setQueries(newQueries);
    };

    const addQuery = () => setQueries([...queries, { queryName: '', queryText: '' }]);

    const removeQuery = (index) => {
        setQueries(prevQueries => prevQueries.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!programName || pdfFiles.some(file => !file.pdfName)) {
            toast.error('Please provide a program name, upload at least one PDF file, and name each PDF.');
            return;
        }

        const programData = {
            programName,
            pdfFiles: pdfFiles.map(file => ({ name: file.pdfName, url: file.url })),
            queries
        };

        try {
            const docName = `${programName}_data`;
            const docRef = doc(collection(db, 'Programs'), docName);
            await setDoc(docRef, programData);
            toast.success('Submission successful!');
        } catch (error) {
            console.error('Error writing document: ', error);
            toast.error('Error submitting data!');
        }
    };

    return (
        <div className="container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className="content">
                <div className="page">
                    <h1 className="random" style={{ textAlign: 'left' }}>Add Data</h1>
                    <form className="add-program-form" onSubmit={handleSubmit}>
                        <div className="input">
                            <label htmlFor="program-name" className="program-name-label">
                                Program Name:
                            </label>
                            <input
                                type="text"
                                id="program-name"
                                className="program-name-input"
                                value={programName}
                                onChange={handleProgramNameChange}
                                placeholder="Enter program name"
                                required
                            />
                        </div>

                        <div className="input">
                            <label className="pdf-upload-label">Upload PDF Files:</label>
                            {pdfFiles.map((file, index) => (
                                <div key={index} className="pdf-upload-row">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="pdf-upload-input"
                                        onChange={(e) => handlePdfChange(index, e)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Enter PDF name"
                                        className="pdf-name-input"
                                        value={file.pdfName}
                                        onChange={(e) => handlePdfNameChange(index, e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePdf(index)}
                                        className="remove-pdf-btn"
                                    >
                                        Remove PDF
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addPdfUpload} className="add-pdf-btn-inline">
                                Add PDF
                            </button>
                        </div>

                        <div className="input">
                            <label className="query-label">SQL Queries:</label>
                            {queries.map((query, index) => (
                                <div key={index} className="query-row" style={{ marginBottom: '20px' }}>
                                    <h3 style={{ marginBottom: '10px' }}>Query {index + 1}</h3>
                                    <input
                                        type="text"
                                        placeholder="Enter query name"
                                        className="query-name-input"
                                        value={query.queryName}
                                        onChange={(e) => handleQueryChange(index, 'queryName', e.target.value)}
                                        required
                                    />
                                    <textarea
                                        className="query-input"
                                        value={query.queryText}
                                        onChange={(e) => handleQueryChange(index, 'queryText', e.target.value)}
                                        placeholder="Enter your SQL query here"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeQuery(index)}
                                        className="remove-query-btn"
                                    >
                                        Remove Query
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addQuery} className="add-query-btn">
                                Add Query
                            </button>
                        </div>

                        <div className="submit-btn-container">
                            <button type="submit" className="submit-btn">Submit Program</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DataUpload;
