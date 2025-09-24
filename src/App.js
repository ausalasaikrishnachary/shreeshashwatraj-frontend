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
import StaffDashboard from "./Component/Panels/Staff/StaffPages/StaffDashboard";
import RetailerDashboard from "./Component/Panels/Retailer/RetailersPages/RetailerDashboard";
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

// Staff Pages (Mobile Only)
import MyRetailers from "./Component/Panels/Staff/StaffPages/Staff_MyRetailers/MyRetailers";
import AddRetailer from "./Component/Panels/Staff/StaffPages/Staff_MyRetailers/AddRetailer";
import SalesVisits from "./Component/Panels/Staff/StaffPages/Staff_SalesVisits/SalesVisits";
import LogVisit from "./Component/Panels/Staff/StaffPages/Staff_SalesVisits/LogVisit";
import StaffExpenses from "./Component/Panels/Staff/StaffPages/Staff_Expenses/StaffExpenses";
import AddExpense from "./Component/Panels/Staff/StaffPages/Staff_Expenses/AddExpense";
import StaffOffers from "./Component/Panels/Staff/StaffPages/Staff_Offers/StaffOffers";

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

     


             {/* Staff Mobile Pages */}
        <Route path="/staff/retailers" element={<MyRetailers />} />
        <Route path="/staff/add-retailer" element={<AddRetailer />} />
        <Route path="/staff/sales-visits" element={<SalesVisits />} />
        <Route path="/staff/log-visit" element={<LogVisit />} />
        <Route path="/staff/expences" element={<StaffExpenses />} />
       <Route path="/staff/add-expense" element={<AddExpense />} />

   {/* Admin  Pages */}
        <Route path="/staff/offers" element={<StaffOffers />} />
        <Route path="/retailers" element={<AdminRetailers />} />
        <Route path="/retailers/add" element={<AddRetailerForm />} /> 
        <Route path="/staff" element={<AdminStaff />} />
        <Route path="/sales" element={<AdminSales />} />
        <Route path="/sales/add" element={<AddSales />} />
        <Route path="/products" element={<AdminProducts />} />
        <Route path="/marketing" element={<AdminMarketing />} />
        <Route path="/expenses" element={<AdminExpenses />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/roleaccess" element={<AdminRoleAccess />} />
      </Routes>
    </Router>
  );
}

export default App;

