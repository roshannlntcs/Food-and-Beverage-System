// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// General Pages
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import AdminLoginPage from './pages/AdminLoginPage';
import UserLoginPage from './pages/UserLoginPage';
import POSMain from './pages/pos/POSMain';

// Admin Pages
import HomeDashboard from './pages/pos/HomeDashboard';
import Inventory from './pages/pos/Inventory';
import POSMonitoring from './pages/pos/POSMonitoring';
import SupplierRecords from './pages/pos/SupplierRecords';
import VoidLogs from './pages/pos/VoidLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/roles" element={<RoleSelection />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/user" element={<POSMain />} />

        {/* Admin Pages */}
        <Route path="/admin/home" element={<HomeDashboard />} />
        <Route path="/admin/inventory" element={<Inventory />} />
        <Route path="/admin/pos-monitoring" element={<POSMonitoring />} />
        <Route path="/admin/supplier-records" element={<SupplierRecords />} />
        <Route path="/admin/void-logs" element={<VoidLogs />} />
      </Routes>
    </Router>
  );
}

export default App;
