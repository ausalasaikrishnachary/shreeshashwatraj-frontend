// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from './Component/Panels/Admin/AdminDashboard/AdminDashboard';
import StaffDashboard from './Component/Panels/Staff/StaffDashboard/StaffDashboard';
import RetailerDashboard from './Component/Panels/Retailer/RetailerDashboard/RetailerDashboard';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/staffdashboard" element={<StaffDashboard />} />
          <Route path="/retailerdashboard" element={<RetailerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;