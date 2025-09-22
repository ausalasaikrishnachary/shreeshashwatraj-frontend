import React from "react";
import { useLocation } from "react-router-dom";
import "./AdminHeader.css";

function AdminHeader({ isCollapsed }) {
  const location = useLocation();

  // Map routes to page titles
  const pageTitles = {
    "/admindashboard": "Dashboard",
    "/admindashboard/retailers": "Retailers",
    "/admindashboard/staff": "Staff",
    "/admindashboard/sales": "Sales",
    "/admindashboard/products": "Products",
    "/admindashboard/marketing": "Offers & Marketing",
    "/admindashboard/expenses": "Expenses",
    "/admindashboard/reports": "Reports",
    "/admindashboard/roleaccess": "Role Access",
  };

  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className={`admin-header ${isCollapsed ? "collapsed" : ""}`}>
      <h3>{title}</h3>
      <span className="welcome">Welcome back, Admin User</span>
    </div>
  );
}

export default AdminHeader;
