// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminDashboard from './Component/Panels/Admin';
// import StaffDashboard from './Component/Panels/Staff/StaffDashboard/StaffDashboard';
// import RetailerDashboard from './Component/Panels/Retailer/RetailerDashboard/RetailerDashboard';

// function App() {
//   return (
//     <Router>
//       <div>
//         <Routes>
//           <Route path="/" element={<AdminDashboard />} />
//           <Route path="/staffdashboard" element={<StaffDashboard />} />
//           <Route path="/retailerdashboard" element={<RetailerDashboard />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;


// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminDashboard from "./Component/Panels/Admin";
// import StaffDashboard from "./Component/Panels/Staff/StaffDashboard/StaffDashboard";
// import RetailerDashboard from "./Component/Panels/Retailer/RetailerDashboard/RetailerDashboard";
// import Login from "./Component/Panels/Auth/Login";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="" element={<AdminDashboard />} />
//         <Route path="/staffdashboard" element={<StaffDashboard />} />
//         <Route path="/retailerdashboard" element={<RetailerDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Dashboards
import AdminDashboard from "./Component/Panels/Admin/AdminDashboard/AdminDashboard";
import StaffDashboard from "./Component/Panels/Staff/StaffDashboard/StaffDashboard";
import RetailerDashboard from "./Component/Panels/Retailer/RetailerDashboard/RetailerDashboard";
import Login from "./Component/Panels/Auth/Login";

// Admin Pages
import AdminRetailers from "./Component/Panels/Admin/AdminRetailers/Retailers";
import AddRetailerForm from "./Component/Panels/Admin/AdminRetailers/AddRetailer"
import AdminStaff from "./Component/Panels/Admin/AdminStaff/Staff";
import AddStaff from "./Component/Panels/Admin/AdminStaff/AddStaff"
import AdminSales from "./Component/Panels/Admin/AdminSales/Sales";
import AddSales from "./Component/Panels/Admin/AdminSales/AddSales"
import AdminProducts from "./Component/Panels/Admin/AdminProducts/Products";
import AddProduct from './Component/Panels/Admin/AdminProducts/AddProducts';
import AdminMarketing from "./Component/Panels/Admin/AdminMarketing/Marketing";
import AddMarketing from "./Component/Panels/Admin/AdminMarketing/AddMarketing";
import AdminExpenses from "./Component/Panels/Admin/AdminExpenses/Expenses";
import AdminReports from "./Component/Panels/Admin/AdminReports/Reports";
import AdminRoleAccess from "./Component/Panels/Admin/AdminRoleAccess/RoleAccess";
import DashboardCard from "./Component/Panels/Admin/AdminDashboard/DashboardCard"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Dashboards */}
        <Route path="/dashboard" element={<DashboardCard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/staffdashboard" element={<StaffDashboard />} />
        <Route path="/retailerdashboard" element={<RetailerDashboard />} />

        {/* Admin Sub Pages */}
        <Route path="/retailers" element={<AdminRetailers />} />
        <Route path="/retailers/add" element={<AddRetailerForm />} /> 
        <Route path="/staff" element={<AdminStaff />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/sales" element={<AdminSales />} />
        <Route path="/sales/add" element={<AddSales />} />
        <Route path="/products" element={<AdminProducts />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/marketing" element={<AdminMarketing />} />
        <Route path="/add-marketing" element={<AddMarketing />} />
        <Route path="/expenses" element={<AdminExpenses />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/roleaccess" element={<AdminRoleAccess />} />
      </Routes>
    </Router>
  );
}

export default App;

