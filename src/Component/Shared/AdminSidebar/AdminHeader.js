import React from "react";
import { useLocation } from "react-router-dom";
import "./AdminHeader.css";

function AdminHeader({ isCollapsed }) {
  const location = useLocation();

  // Map routes to page titles
  const pageTitles = {
    "/admindashboard": "Dashboard",
    "/retailers": "Retailers",
 "/retailers/add": "Retailers",
     "/staff": "Staff",
    "/sales": "Sales",
    "/products": "Products",
        "/add-product": "Products",

    "/marketing": "Offers & Marketing",
        "/add-marketing": "Offers & Marketing",

    "/expenses": "Expenses",
    "/reports": "Reports",
    "/roleaccess": "Role Access",
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
