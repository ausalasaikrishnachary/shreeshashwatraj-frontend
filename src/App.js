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
import Login from "./Component/Panels/Auth/Login";

//Retailer pages

import RetailerHome from "./Component/Panels/Retailer/RetailerHome/RetailerHomeWrapper";
import RetailerHistory from "./Component/Panels/Retailer/RetailerHistory/RetailerHistoryWrapper";
import RetailerOffers from "./Component/Panels/Retailer/RetailerOffers/RetailerOffersWrapper";
import RetailerProfile from "./Component/Panels/Retailer/RetailerProfile/RetailerProfileWrapper";



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
import AddExpenses from "./Component/Panels/Admin/AdminExpenses/AddExpenses";
import AdminReports from "./Component/Panels/Admin/AdminReports/Reports";
import AdminRoleAccess from "./Component/Panels/Admin/AdminRoleAccess/RoleAccess";
import DashboardCard from "./Component/Panels/Admin/AdminDashboard/DashboardCard"

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
        <Route path="/dashboard" element={<DashboardCard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/staffdashboard" element={<StaffDashboard />} />


        {/* Retailers */}
        <Route path="/retailer-home" element={<RetailerHome />} />
        <Route path="/retailer-history" element={<RetailerHistory />} />
        <Route path="/retailer-offers" element={<RetailerOffers />} />
        <Route path="/retailer-profile" element={<RetailerProfile />} />




        {/* Staff Mobile Pages */}
        <Route path="/staff/retailers" element={<MyRetailers />} />
        <Route path="/staff/add-retailer" element={<AddRetailer />} />
        <Route path="/staff/sales-visits" element={<SalesVisits />} />
        <Route path="/staff/log-visit" element={<LogVisit />} />
        <Route path="/staff/expences" element={<StaffExpenses />} />
        <Route path="/staff/add-expense" element={<AddExpense />} />

        {/* Admin  Pages */}
        <Route path="/staff/offers" element={<StaffOffers />} />
    
        <Route path="/staff" element={<AdminStaff />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/sales" element={<AdminSales />} />
        <Route path="/sales/add" element={<AddSales />} />
        <Route path="/staff/edit/:id" element={<AddStaff />} />
        <Route path="/products" element={<AdminProducts />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/marketing" element={<AdminMarketing />} />
        <Route path="/add-marketing" element={<AddMarketing />} />
 
        <Route path="/retailers" element={<AdminRetailers />} />
        <Route path="/retailers/add" element={<AddRetailerForm mode="add" />} />
        <Route path="/retailers/edit/:id" element={<AddRetailerForm mode="edit" />} />
        <Route path="/retailers/view/:id" element={<AddRetailerForm mode="view" />} />

        <Route path="/expenses" element={<AdminExpenses />} />
        <Route path="/expenses/add" element={<AddExpenses />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/roleaccess" element={<AdminRoleAccess />} />
      </Routes>
    </Router>
  );
}

export default App;

