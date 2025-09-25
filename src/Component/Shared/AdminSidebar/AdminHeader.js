import React from "react";
import { useLocation } from "react-router-dom";
import "./AdminHeader.css";

function AdminHeader({ isCollapsed }) {
  const location = useLocation();

  // Map routes to page titles
  const pageTitles = {
    "/admindashboard": "Dashboard",
    "/retailers": "Retailers",
    "/staff": "Staff",
    "/sales": "Sales",
    "/products": "Products",
    "/marketing": "Offers & Marketing",
    "/expenses": "Expenses",
    "/reports": "Reports",
    "/roleaccess": "Role Access",
  };

  // If pathname starts with a key, use that title
  let title = "Dashboard";

  for (const path in pageTitles) {
    if (location.pathname.startsWith(path)) {
      title = pageTitles[path];
      break;
    }
  }


  return (
    <div className={`admin-header ${isCollapsed ? "collapsed" : ""}`}>
      <h3>{title}</h3>
      <span className="welcome">Welcome back, Admin User</span>
    </div>
  );
}

export default AdminHeader;
