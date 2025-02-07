import React, { useEffect, useState } from "react";
import { useLocation, Navigate, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/navbar";
import Sidebar from "./components/sidebar/sidebar";
import AddProgram from "./pages/addprogram/addprogram";
import AddUser from "./pages/adduser/adduser";
import Placeholder from "./pages/placeholder/placeholder";
import CommonInputss from "./pages/CommonInput2/commoninput2";
import SpecificInputss from "./pages/SpecificInput/specificinput";
import FetchAndEditCommonInputs from "./pages/FetchAndEditCommonInputs/FetchAndEditCommonInputs";
import Login from "./pages/Login/Login";
import FetchAndEditSpecificInputs from "./pages/FecthAndEditSpecificInputs/FetchAnd EditSpecificInputs";
import ProgramDatabase from "./pages/ProgramDatabase/ProgramDatabase";
import DataUpload from "./pages/dataUpload/dataUpload";
import { auth } from './firebase'; // Ensure Firebase is initialized here
import Footer from "./components/Footer/Footer";
import './App.css';
import DataEdit from "./pages/DataEdit/DataEdit";

const App = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(user ? true : false);
    });
    return unsubscribe;
  }, []);

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated === null ? null : isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  const isLoginPage = location.pathname === "/login";
  const hideSidebarRoutes = ["/commoninputs", "/specificinputs","/dataupload"];
  const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <div className={isLoginPage ? "login-container" : "app-container"}>
      {!isLoginPage && <Navbar />}
      <div className={`main-layout ${shouldShowSidebar ? '' : 'full-screen'}`}>
        {shouldShowSidebar && !isLoginPage && <Sidebar />}
        <div className={`content-area ${shouldShowSidebar ? '' : 'full-screen'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/addprogram" replace />} />
            <Route path="/login" element={isAuthenticated === true ? <Navigate to="/addprogram" replace /> : <Login />} />
            <Route path="/addprogram/*" element={<ProtectedRoute element={<AddProgram />} />} />
            <Route path="/adduser" element={<ProtectedRoute element={<AddUser />} />} />
            <Route path="/placeholder" element={<ProtectedRoute element={<Placeholder />} />} />
            <Route path="/programdatabase" element={<ProtectedRoute element={<ProgramDatabase />} />} />
            
            {/* Initial input components */}
            <Route path="/commoninputs" element={<ProtectedRoute element={<CommonInputss />} />} />
            <Route path="/specificinputs" element={<ProtectedRoute element={<SpecificInputss  />} />} />
            <Route path="/dataupload" element={<ProtectedRoute element={<  DataUpload/>} />} />

            {/* Fetch and edit components */}
            <Route path="/commoninputs/edit/:programName" element={<ProtectedRoute element={<FetchAndEditCommonInputs />} />} />
            <Route path="/specificinputs/edit/:programName" element={<ProtectedRoute element={<FetchAndEditSpecificInputs />} />} />
            <Route path="/data/edit/:programName" element={<ProtectedRoute element={<DataEdit />} />} />

          </Routes>
        </div>
        <Footer/>
      </div>
    </div>
  );
};

export default App;
