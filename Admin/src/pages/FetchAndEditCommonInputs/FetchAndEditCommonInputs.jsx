import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import './FetchAndEditCommonInputs.css';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const FetchAndEditCommonInputs = () => {
    const { programName } = useParams();
    const [programData, setProgramData] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newImage, setNewImage] = useState(null); // For new header image selection
    const [previewImage, setPreviewImage] = useState(null); // For header image preview
    const [newCardImage, setNewCardImage] = useState(null); // For new card image selection
    const [previewCardImage, setPreviewCardImage] = useState(null); // For card image preview
    const [uploading, setUploading] = useState(false);
    const [newFilter, setNewFilter] = useState({ databasename: '', sheetname: '', name: '' });

    const ensureFilterFields = (filters) => {
        return filters.map(filter => ({
            databasename: filter.databasename || '',
            sheetname: filter.sheetname || '',
            name: filter.name || '',
            ...filter,
        }));
    };

    useEffect(() => {
        const fetchProgramData = async () => {
            try {
                const docRef = doc(db, "Programs", `${programName}_common`);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let data = docSnap.data();

                    if (Array.isArray(data.filters)) {
                        data.filters = ensureFilterFields(data.filters);
                    } else {
                        data.filters = [];
                    }

                    setProgramData(data);
                    setEditedData(data);
                    setPreviewCardImage(data.cardImage); // Set initial preview for card image
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };

        fetchProgramData();
    }, [programName]);

    const handleInputChange = (field, value, index = null, subField = null) => {
        setEditedData((prevData) => {
            const newData = { ...prevData };
            if (index !== null && subField) {
                if (Array.isArray(newData[field])) {
                    newData[field][index][subField] = value;
                }
            } else if (index !== null) {
                newData[field][index] = value;
            } else {
                newData[field] = value;
            }
            return newData;
        });
    };

    const handleAddArrayElement = () => {
        setEditedData((prevData) => ({
            ...prevData,
            filters: [...(prevData.filters || []), newFilter]
        }));
        setNewFilter({ databasename: '', sheetname: '', name: '' });
    };

    const handleRemoveArrayElement = (index) => {
        setEditedData((prevData) => {
            const newFilters = prevData.filters.filter((_, i) => i !== index);
            return { ...prevData, filters: newFilters };
        });
    };

    const handleSave = () => {
        setShowConfirmation(true);
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setNewImage(selectedImage);

        // Update preview image to show the selected image
        const previewURL = URL.createObjectURL(selectedImage);
        setPreviewImage(previewURL);
    };

    const handleCardImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setNewCardImage(selectedImage);

        // Update preview image to show the selected image
        const previewURL = URL.createObjectURL(selectedImage);
        setPreviewCardImage(previewURL);
    };

    const confirmSave = async () => {
        setUploading(true);
        let headerImageUrl = editedData.headerImage;
        let cardImageUrl = editedData.cardImage; // New variable for card image URL

        // Handle header image upload
        if (newImage) {
            const imageRef = ref(storage, `images/${programName}/${newImage.name}`);

            try {
                if (headerImageUrl) {
                    const oldImageRef = ref(storage, headerImageUrl);
                    await deleteObject(oldImageRef);
                }

                await uploadBytes(imageRef, newImage);
                headerImageUrl = await getDownloadURL(imageRef);
                setEditedData((prevData) => ({ ...prevData, headerImage: headerImageUrl }));

                // Clear the preview after successful upload
                setPreviewImage(null);
            } catch (error) {
                console.error("Error handling image upload:", error);
            }
        }

        // Handle card image upload
        if (newCardImage) {
            const cardImageRef = ref(storage, `images/${programName}/cardImages/${newCardImage.name}`);

            try {
                if (cardImageUrl) {
                    const oldCardImageRef = ref(storage, cardImageUrl);
                    await deleteObject(oldCardImageRef);
                }

                await uploadBytes(cardImageRef, newCardImage);
                cardImageUrl = await getDownloadURL(cardImageRef);
                setEditedData((prevData) => ({ ...prevData, cardImage: cardImageUrl }));

                // Clear the preview after successful upload
                setPreviewCardImage(null);
            } catch (error) {
                console.error("Error handling card image upload:", error);
            }
        }

        try {
            const docRef = doc(db, "Programs", `${programName}_common`);
            await updateDoc(docRef, { ...editedData, headerImage: headerImageUrl, cardImage: cardImageUrl });
            console.log("Document updated successfully!");
            toast.success('Data successfully edited!'); // Show success notification
        } catch (error) {
            console.error("Error updating document:", error);
            toast.error('Error updating data!'); // Show error notification
        }

        setShowConfirmation(false);
        setUploading(false);
        setNewImage(null);
        setNewCardImage(null); // Clear card image selection
    };

    if (!programData) return <div>Loading...</div>;

    // Define the desired order of fields
    const fieldOrder = [
        'programName',
        'headerLeft',
        'headerImage',
        'cardImage', // Include card image in the field order
        'headerMiddle',
        'headerRightStartDate',
        'headerRightEndDate',
        'headerRightBelow',
        'filters'
    ];

    return (
        <div className="expandable-container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <h2>{programData.programName} - Edit Common Inputs</h2>

            {fieldOrder.map((field) => (
                <div key={field} className="field-section">
                    <label>{field}</label>

                    {field === 'headerImage' ? (
                        <div className="image-field">
                            {previewImage ? (
                                <img src={previewImage} alt="New Header Preview" style={{ maxWidth: '200px', marginBottom: '10px' }} />
                            ) : programData.headerImage ? (
                                <img src={programData.headerImage} alt="Current Header" style={{ maxWidth: '200px', marginBottom: '10px' }} />
                            ) : null}
                            <label className="custom-file-upload">
                                <span>Change Header Image</span>
                                <input type="file" onChange={handleImageChange} />
                            </label>
                        </div>
                    ) : field === 'cardImage' ? (
                        <div className="image-field">
                            {previewCardImage ? (
                                <img src={previewCardImage} alt="New Card Preview" style={{ maxWidth: '200px', marginBottom: '10px' }} />
                            ) : programData.cardImage ? (
                                <img src={programData.cardImage} alt="Current Card" style={{ maxWidth: '200px', marginBottom: ' 10px' }} />
                            ) : null}
                            <label className="custom-file-upload">
                                <span>Change Card Image</span>
                                <input type="file" onChange={handleCardImageChange} />
                            </label>
                        </div>
                    ) : field === 'filters' ? (
                        <div className="array-field">
                            {editedData.filters.map((item, index) => (
                                <div key={index} className="object-item">
                                    <h5>{`${index + 1}. Item`}</h5>
                                    <div>
                                        <label>Database Name</label>
                                        <input
                                            type="text"
                                            value={item.databasename || ''}
                                            onChange={(e) => handleInputChange(field, e.target.value, index, 'databasename')}
                                        />
                                    </div>
                                    <div>
                                        <label>Sheet Name</label>
                                        <input
                                            type="text"
                                            value={item.sheetname || ''}
                                            onChange={(e) => handleInputChange(field, e.target.value, index, 'sheetname')}
                                        />
                                    </div>
                                    <div>
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            value={item.name || ''}
                                            onChange={(e) => handleInputChange(field, e.target.value, index, 'name')}
                                        />
                                    </div>
                                    <button onClick={() => handleRemoveArrayElement(index)}>Remove</button>
                                </div>
                            ))}
                            <h5>Add New Filter</h5>
                            <div>
                                <label>Database Name</label>
                                <input
                                    type="text"
                                    value={newFilter.databasename}
                                    onChange={(e) => setNewFilter({ ...newFilter, databasename: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Sheet Name</label>
                                <input
                                    type="text"
                                    value={newFilter.sheetname}
                                    onChange={(e) => setNewFilter({ ...newFilter, sheetname: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={newFilter.name}
                                    onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
                                />
                            </div>
                            <button onClick={handleAddArrayElement}>Add Element</button>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={editedData[field] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                        />
                    )}
                </div>
            ))}
            <div className='Submit-button'>
                <button onClick={handleSave} disabled={uploading}>Save Changes</button>
            </div>

            {showConfirmation && (
                <div className="modal-content">
                    <div className="modal-header">Are you sure you want to proceed with changes?</div>
                    <div className="modal-buttons">
                        <button onClick={confirmSave} className="save-button delete-confirm">
                            Yes
                        </button>
                        <button onClick={() => setShowConfirmation(false)} className="save-button cancel-button" disabled={uploading}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FetchAndEditCommonInputs;