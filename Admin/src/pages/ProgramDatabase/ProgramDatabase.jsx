import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import './ProgramDatabase.css';

const ProgramDatabase = () => {
  const [programs, setPrograms] = useState([]);
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "Programs"));
        const filteredPrograms = querySnapshot.docs
          .map(doc => doc.id)
          .filter(id => id.endsWith('_common'))
          .map(id => id.replace('_common', ''));

        setPrograms(filteredPrograms);
      } catch (error) {
        console.error("Error fetching programs: ", error);
        setError("Could not fetch programs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleExpandProgram = (program) => {
    setExpandedProgram(expandedProgram === program ? null : program);
  };

  const handleEditClick = (program) => {
    setSelectedProgram(program);
    setShowEditPopup(true);
  };

  const handleDeleteClick = (program) => {
    setSelectedProgram(program);
    setShowDeletePopup(true);
  };

  const handleCommonInputs = () => {
    window.location.href = `/commoninputs/edit/${selectedProgram}`;
  };

  const handleSpecificInputs = () => {
    window.location.href = `/specificinputs/edit/${selectedProgram}`;
  };

  const handleData = () => {
    window.location.href = `/data/edit/${selectedProgram}`; // New route for Data option
  };

  const confirmDeleteProgram = async () => {
    try {
      // Delete the _common document
      await deleteDoc(doc(db, "Programs", selectedProgram + '_common'));
  
      // Delete the _specific document if it exists
      const specificDocRef = doc(db, "Programs", selectedProgram + '_specific');
      const specificDoc = await getDoc(specificDocRef);
      if (specificDoc.exists()) {
        await deleteDoc(specificDocRef);
      }
  
      // Delete the _data document if it exists
      const dataDocRef = doc(db, "Programs", selectedProgram + '_data');
      const dataDoc = await getDoc(dataDocRef);
      if (dataDoc.exists()) {
        await deleteDoc(dataDocRef);
      }
  
      // Update the state to remove the deleted program
      setPrograms(programs.filter(prog => prog !== selectedProgram));
      setShowDeletePopup(false);
  
      // Show success notification
      toast.success('Program successfully Deleted!');
    } catch (error) {
      console.error("Error deleting program:", error);
  
      // Show error notification
      toast.error('Could not delete the program. Please try again.');
      setError("Could not delete the program. Please try again.");
    }
  };
  

  const closeEditPopup = () => setShowEditPopup(false);
  const closeDeletePopup = () => setShowDeletePopup(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="program-database-container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <h2 className="program-heading">Program Database</h2>
      <div>
        {programs.map((program, index) => (
          <div key={index} className={`program-wrapper ${expandedProgram === program ? 'expanded' : ''}`}>
            <button
              className="program-button"
              onClick={() => handleExpandProgram(program)}
              aria-haspopup="true"
              aria-expanded={expandedProgram === program}
            >
              <span className="program-icon" role="img" aria-label="Program Icon">📘</span>
              <span className="program-button-text">{program}</span>
            </button>

            {expandedProgram === program && (
              <div className="program-options">
                <button onClick={() => handleEditClick(program)} className="option-button edit-button">Edit</button>
                <button onClick={() => handleDeleteClick(program)} className="option-button delete-button">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showEditPopup && (
        <div className="modal-content">
          <span className="close-button" onClick={closeEditPopup} aria-label="Close">✖️</span>
          <div className="modal-header">What do you want to edit?</div>
          <div className="modal-buttons">
            <button onClick={handleCommonInputs} className="save-button">Common Inputs</button>
            <button onClick={handleSpecificInputs} className="save-button">Specific Inputs</button>
            <button onClick={handleData} className="save-button"> Data</button>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="modal-content">
          <div className="modal-header">Are you sure you want to delete?</div>
          <div className="modal-buttons">
            <button onClick={confirmDeleteProgram} className="save-button delete-confirm">Yes</button>
            <button onClick={closeDeletePopup} className="save-button cancel-button">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDatabase;
