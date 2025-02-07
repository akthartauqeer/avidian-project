import React, { useState, useEffect } from 'react';
import { FaInfoCircle, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Firestore initialization
import './header.css';

const Header = ({ docId }) => {
    // State to hold Firestore data
    const [headerImage, setHeaderImage] = useState(''); // State for header image URL
    const [headerLeft, setHeaderLeft] = useState(''); // State for header left text
    const [headerMiddle, setHeaderMiddle] = useState('');
    const [headerRightStart, setHeaderRightStart] = useState('');
    const [headerRightEnd, setHeaderRightEnd] = useState('');
    const [headerRightBelow, setHeaderRightBelow] = useState('');
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    // Fetch data from Firestore based on the docId prop
    useEffect(() => {
        const fetchHeaderData = async () => {
            if (!docId) {
                setError('No document ID provided');
                setLoading(false);
                return;
            }

            try {
                const programsCollection = collection(db, "Programs");
                const snapshot = await getDocs(programsCollection);
                let foundData = null;

                // Search for the document with case-insensitive matching
                snapshot.forEach(doc => {
                    if (doc.id.toLowerCase() === `${docId.toLowerCase()}_common`) {
                        foundData = doc.data();
                    }
                });

                if (foundData) {
                    setHeaderImage(foundData.headerImage || ''); // Set header image URL
                    setHeaderLeft(foundData.headerLeft || 'Default Text'); // Set fallback text
                    setHeaderMiddle(foundData.headerMiddle || 'N/A');
                    setHeaderRightStart(foundData.headerRightStartDate || 'N/A');
                    setHeaderRightEnd(foundData.headerRightEndDate || 'N/A');
                    setHeaderRightBelow(foundData.headerrightbelow || 'N/A');
                } else {
                    setError(`No document found with ID: ${docId}_Common`);
                }
            } catch (err) {
                setError('Error fetching document data');
                console.error("Firestore Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHeaderData();
    }, [docId]);

    if (loading) return <div>Loading...</div>; // Show loading state
    if (error) return <div>{error}</div>; // Show error message

    return (
        <div className="home-header">
            <div className="header-left">
                {/* Use headerImage if it exists, otherwise fallback to headerLeft text */}
                {headerImage ? (
                    <img src={headerImage} alt="Header" className="header-image" />
                ) : (
                    <span className="header-left-text">{headerLeft}</span>
                )}
            </div>

            <div className="header-middle">
                <FaInfoCircle />
                <span className="description-text">
                    {headerMiddle}
                </span>
            </div>

            <div className="header-right">
                <div className="section">
                    <FaCalendarAlt className="icon" />
                    <span>Start: {headerRightStart} | End: {headerRightEnd}</span>
                </div>
                <div className="section">
                    <FaUser className="icon" />
                    <span>{headerRightBelow}</span>
                </div>
            </div>
        </div>
    );
}

export default Header;
