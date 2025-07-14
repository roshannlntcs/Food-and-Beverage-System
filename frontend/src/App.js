import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPanel from "./pages/AdminPanel"; 
import UserLoginPage from './pages/UserLoginPage';
import UserPanel from './pages/UserPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/roles" element={<RoleSelection />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPanel />} /> 
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/user" element={<UserPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
