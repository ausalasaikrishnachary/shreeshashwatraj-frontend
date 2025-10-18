import React from "react";
import { useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import "./AdminHeader.css";

function AdminHeader({ isCollapsed, onToggleSidebar }) {
  const location = useLocation();

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

  let title = "Dashboard";
  for (const path in pageTitles) {
    if (location.pathname.startsWith(path)) {
      title = pageTitles[path];
      break;
    }
  }

  return (
    <div className={`admin-header ${isCollapsed ? "collapsed" : ""}`}>
      <div className="d-flex align-items-center justify-content-between w-100">
        <h3 className="mb-0">{title}</h3>
        <div className="d-flex align-items-center">
          <span className="welcome me-3">Welcome back, Admin User</span>

          {/* Mobile Hamburger Icon */}
          <button
            className="btn btn-primary d-md-none"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminHeader;
