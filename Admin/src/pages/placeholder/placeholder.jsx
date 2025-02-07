import React, { useState, useEffect } from 'react';
import './placeholder.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios'; // For API requests
import Modal from 'react-modal';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore methods
import { getAuth } from 'firebase/auth'; // Firebase Auth for user authentication
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles


const Placeholder = () => {
  const [users, setUsers] = useState([]); // Users list
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state for editing
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false); // Modal state for delete confirmation
  const [currentUser, setCurrentUser] = useState(null); // Currently selected user
  const [userToDelete, setUserToDelete] = useState(null); // User selected for deletion
  const [totalPages, setTotalPages] = useState([]); // All pages from the Programs collection
  const [userAllowedPages, setUserAllowedPages] = useState([]); // Allowed pages for the user being edited

  const db = getFirestore(); // Initialize Firestore
  const auth = getAuth(); // Initialize Firebase Auth

  // Fetch users from the backend when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5045/api/api/firebase-users');
        setUsers(response.data.map(user => ({
          uid: user.uid,
          email: user.email,
        })));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch all pages from the Programs collection in Firestore
  // Fetch all pages from the Programs collection in Firestore, including an "admin" option
const fetchAllPages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Programs"));
    const Pages = [];

    querySnapshot.forEach((doc) => {
      let docName = doc.id;

      // If the document name ends with '_common', remove the suffix and convert to lowercase
      if (docName.endsWith('_common')) {
        docName = docName.replace('_common', '').toLowerCase();
         Pages.push(docName); // Add to the list
      }
     
    });

    // Add "admin" to the pages array manually
    Pages.push("admin");
    Pages.push("org-goals");

    setTotalPages(Pages); // Set allowed pages state with fetched data
  } catch (error) {
    console.error("Error fetching allowed pages: ", error);
  }
};


  // Fetch the user's allowed pages
  const fetchUserAllowedPages = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid); // Reference the user's document by UID
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserAllowedPages(docSnap.data().allowedPages || []); // Set the user's allowed pages (pre-ticked)
      } else {
        console.error('No such document for this user!');
      }
    } catch (error) {
      console.error('Error fetching user allowed pages:', error);
    }
  };

  // Handle the delete button click
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await axios.delete(`http://localhost:5045/api/api/delete-user/${userToDelete.uid}`);
      console.log('User deleted:', response.data);
      setUsers(users.filter(user => user.uid !== userToDelete.uid)); // Remove the user from the list after deletion
      toast.success('User successfully deleted!'); // Show success notification

      setConfirmationModalIsOpen(false); // Close the confirmation modal after deletion
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error Deleting User!'); // Show error notification

    }
  };

  // Open confirmation modal for deletion
  const openDeleteConfirmation = (user) => {
    setUserToDelete(user); // Set the user to be deleted
    setConfirmationModalIsOpen(true); // Open confirmation modal
  };

  // Handle the edit button click
  const handleEdit = async (user) => {
    setCurrentUser(user); // Set the user being edited
    await fetchAllPages(); // Fetch all pages from the Programs collection

    // Fetch allowed pages for this user
    await fetchUserAllowedPages(user.uid); // Use the fetched UID directly

    setModalIsOpen(true); // Open the modal for editing
  };

  // Save the updated allowed pages for the user
  const handleSave = async () => {
    try {
      const docRef = doc(db, 'users', currentUser.uid); // Reference the user's document by UID
      await setDoc(docRef, { allowedPages: userAllowedPages }, { merge: true }); // Update allowed pages
      setModalIsOpen(false); // Close the modal
      setCurrentUser(null); // Reset the current user
    } catch (error) {
      console.error('Error saving user allowed pages:', error);
    }
  };

  // Toggle access to pages for the user
  const togglePageAccess = (page) => {
    if (userAllowedPages.includes(page)) {
      setUserAllowedPages(userAllowedPages.filter(p => p !== page)); // Remove page if already allowed
    } else {
      setUserAllowedPages([...userAllowedPages, page]); // Add page if not already allowed
    }
  };

  return (
    <div className="placeholder-container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <h2 className="placeholder-heading">User Database</h2>
      <div className="table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{user.email}</td>
              <td>
                <button className="action-button" onClick={() => handleEdit(user)}>
                  <FaEdit />
                </button>
                <button className="action-button" onClick={() => openDeleteConfirmation(user)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Modal for editing allowed pages */}
      <Modal 
  isOpen={modalIsOpen} 
  onRequestClose={() => setModalIsOpen(false)} 
  contentLabel="Edit Allowed Pages"
  className="modal-content"
>
  <h2 className="modal-header">Edit Allowed Pages for {currentUser?.email}</h2>
  <ul className="modal-list">
    {totalPages.map((page) => (
      <li key={page}>
        <label>
          <input
            type="checkbox"
            checked={userAllowedPages.includes(page)} // Pre-tick the allowed pages for the user
            onChange={() => togglePageAccess(page)}
            className="modal-checkbox"
          />
          {page}
        </label>
      </li>
    ))}
  </ul>
  <div className="modal-buttons">
    <button onClick={handleSave} className="save-button">Save</button>
    <button onClick={() => setModalIsOpen(false)} className="save-button cancel-button">Cancel</button>
  </div>
</Modal>

<Modal 
  isOpen={confirmationModalIsOpen} 
  onRequestClose={() => setConfirmationModalIsOpen(false)} 
  contentLabel="Delete Confirmation"
  className="modal-content"
>
  <h2 className="modal-header">Are you sure you want to delete {userToDelete?.email}?</h2>
  <div className="modal-buttons">
    <button onClick={handleDelete} className="save-button delete-confirm">Yes, Delete</button>
    <button onClick={() => setConfirmationModalIsOpen(false)} className="save-button cancel-button">Cancel</button>
  </div>
</Modal>

    </div>
  );
};

export default Placeholder;
