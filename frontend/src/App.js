// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// General Pages
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import POSMain from './pages/pos/POSMain';

// Customer view component (new)
import CustomerView from './components/CustomerView';

// Admin Pages
import HomeDashboard from './pages/pos/HomeDashboard';
import Inventory from './pages/pos/Inventory';
import POSMonitoring from './pages/pos/POSMonitoring';
import SupplierRecords from './pages/pos/SupplierRecords';
import VoidLogs from './pages/pos/VoidLogs';
import SuperAdmin from './pages/pos/SuperAdmin'; // adjust path if needed
import SalesReport from "./pages/pos/SalesReport"; // <-- Import it

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/roles" element={<RoleSelection />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/register" element={<UserRegisterPage />} />
        <Route path="/user" element={<POSMain />} />
        <Route path="/customer-view" element={<CustomerView />} />

        {/* Admin Pages */}
        <Route path="/admin/home" element={<HomeDashboard />} />
        <Route path="/admin/inventory" element={<Inventory />} />
        <Route path="/admin/pos-monitoring" element={<POSMonitoring />} />
        <Route path="/admin/supplier-records" element={<SupplierRecords />} />
        <Route path="/admin/void-logs" element={<VoidLogs />} />
       <Route path="/admin/super-admin" element={<SuperAdmin />} />
        
<Route path="/pos/sales-report" element={<SalesReport />} /> {/* <-- Add this */}
      </Routes>
    </Router>
  );
}

export default App;
