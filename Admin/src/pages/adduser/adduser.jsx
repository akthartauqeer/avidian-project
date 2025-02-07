import React, { useState, useEffect, useRef } from 'react';
import './adduser.css'; // Add relevant styling
import { auth } from "../../firebase"; // Ensure you import your firebase configuration
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore'; // Import Firestore methods
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const AddUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [allowedPages, setAllowedPages] = useState([]); // For dynamically fetched pages
  const [selectedPages, setSelectedPages] = useState([]); // To manage selected allowed pages
  const [dropdownOpen, setDropdownOpen] = useState(false); // To control the visibility of the dropdown
  const [error, setError] = useState(''); // For error messages

  const dropdownRef = useRef(null);
  const db = getFirestore(); // Initialize Firestore

  // Fetch allowed pages from Firestore under "Programs" collection
  const fetchAllowedPages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Programs"));
      const programPages = [];

      querySnapshot.forEach((doc) => {
        let docName = doc.id;

        // If the document name ends with '_common', remove the suffix and convert to lowercase
        if (docName.endsWith('_common')) {
          docName = docName.replace('_common', '').toLowerCase();
          programPages.push(docName); // Add to the list
        }
      });

      setAllowedPages(programPages); // Set allowed pages state with fetched data
    } catch (error) {
      console.error("Error fetching allowed pages: ", error);
    }
  };

  // Fetch allowed pages when the component mounts
  useEffect(() => {
    fetchAllowedPages();
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Handle the selection of allowed pages
  const handleAllowedPageChange = (event) => {
    const value = event.target.value;
    setSelectedPages((prev) =>
      prev.includes(value) ? prev.filter((page) => page !== value) : [...prev, value]
    );
  };

  // Handle user creation and Firestore document update
  const handleAddUser = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validation check for all fields
    if (!email || !password) {
      setError('Please fill in all required fields: email and password.');
      return;
    }

    if (selectedPages.length === 0) {
      setError('Please select at least one allowed page.');
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get user information (includes UID)

      // Create a new document in Firestore with the user's UID and update allowedPages
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        allowedPages: selectedPages // Store selected allowed pages as an array
      });


      // Reset form fields
      setEmail('');
      setPassword('');
      setSelectedPages([]); // Reset selected pages
      setError(''); // Clear any previous errors
      toast.success('User successfully Added!'); // Show success notification

    } catch (error) {
      setError(error.message); // Set error message to be displayed
      toast.error('Error submitting data!'); // Show error notification

    }
  };

  return (
    <div className="adduser-container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <div className="adduser-content">
        <h1 className="adduser-heading">Add User</h1>

        {/* Error Message */}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleAddUser}>
          {/* Email Field */}
          <div className="input-section">
            <label htmlFor="email">Enter the Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="input-section">
            <label htmlFor="password">Enter the Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter user password"
              required
            />
          </div>

          {/* Custom Dropdown for Allowed Pages */}
          <div className="input-section">
            <label htmlFor="allowed-pages">Allowed Pages</label>
            <div className="custom-dropdown" ref={dropdownRef}>
              <div className="dropdown-header" onClick={toggleDropdown}>
                {selectedPages.length > 0 ? selectedPages.join(', ') : 'Select Allowed Pages'}
              </div>
              {dropdownOpen && (
                <div className="dropdown-options">
                  {/* "Admin" Hardcoded Option */}
                  <label>
                    <input
                      type="checkbox"
                      value="admin"
                      checked={selectedPages.includes("admin")}
                      onChange={handleAllowedPageChange}
                    />
                    admin
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="org-goals"
                      checked={selectedPages.includes("org-goals")}
                      onChange={handleAllowedPageChange}
                    />
                    org-goals
                  </label>
                  {/* Dynamically Fetched Options */}
                  {allowedPages.map((page, index) => (
                    <label key={index}>
                      <input
                        type="checkbox"
                        value={page}
                        checked={selectedPages.includes(page)}
                        onChange={handleAllowedPageChange}
                      />
                      {page}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button">Save</button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
