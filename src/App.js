// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminDashboard from './Component/Panels/Admin/AdminDashboard/AdminDashboard';
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
// import AdminDashboard from "./Component/Panels/Admin/AdminDashboard/AdminDashboard";
// import StaffDashboard from "./Component/Panels/Staff/StaffDashboard/StaffDashboard";
// import RetailerDashboard from "./Component/Panels/Retailer/RetailerDashboard/RetailerDashboard";
// import Login from "./Component/Panels/Auth/Login";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/admindashboard" element={<AdminDashboard />} />
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
import AdminSales from "./Component/Panels/Admin/AdminSales/Sales";
import AddSales from "./Component/Panels/Admin/AdminSales/AddSales"
import AdminProducts from "./Component/Panels/Admin/AdminProducts/Products";
import AdminMarketing from "./Component/Panels/Admin/AdminMarketing/Marketing";
import AdminExpenses from "./Component/Panels/Admin/AdminExpenses/Expenses";
import AdminReports from "./Component/Panels/Admin/AdminReports/Reports";
import AdminRoleAccess from "./Component/Panels/Admin/AdminRoleAccess/RoleAccess";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Dashboards */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/staffdashboard" element={<StaffDashboard />} />
        <Route path="/retailerdashboard" element={<RetailerDashboard />} />

        {/* Admin Sub Pages */}
        <Route path="/admindashboard/retailers" element={<AdminRetailers />} />
        <Route path="/admindashboard/retailers/add" element={<AddRetailerForm />} /> 
        <Route path="/admindashboard/staff" element={<AdminStaff />} />
        <Route path="/admindashboard/sales" element={<AdminSales />} />
        <Route path="/admindashboard/sales/add" element={<AddSales />} />
        <Route path="/admindashboard/products" element={<AdminProducts />} />
        <Route path="/admindashboard/marketing" element={<AdminMarketing />} />
        <Route path="/admindashboard/expenses" element={<AdminExpenses />} />
        <Route path="/admindashboard/reports" element={<AdminReports />} />
        <Route path="/admindashboard/roleaccess" element={<AdminRoleAccess />} />
      </Routes>
    </Router>
  );
}

export default App;

