import React from "react";
import { useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import "./AdminHeader.css";

function AdminHeader({ isCollapsed, onToggleSidebar, isMobile }) {
  const location = useLocation();

  const pageTitles = {
    "/admindashboard": "Dashboard",
    "/retailers": "Contact",
    "/retailers/add": "Add Contact",
    "/staff": "Staff",
    "/sales": "Sale Catalogue",
    "/AddProductPage":"Purchase Catalogue",
    "/products": "Products",
    "/add-product": "Add Product",
    "/marketing": "Offers & Marketing",
    "/add-marketing": "Add Marketing",
    "/expenses": "Expenses",
    "/reports": "Reports",
    "/roleaccess": "Role Access",
    "/sales_visit": "Sales Visit",
    "/sale_items": "Sales Catalogue",
    "/purchased_items": "Purchased Items",
    "/purchased_items": "Purchase Items",
    "/sale_items": "Sales Items",
    "/admin_expensive" : "Expense Requests",
    "/ledger": "Ledger",
    "/sales/create_note": "Credit Note",
    "/purchase/debit-note": "Debit Note",
    "/purchase/create_note": "Debit Note",
    "/purchase/debit-note/edit":"Debit Note",
    "/purchase/create-purchase-invoice": "Purchase Invoice",
    "/kacha_sales" : "kacha Sales",
    "/period": "Order",
    "/credit-period" : "Credit Period"
  };

  const getPageTitle = () => {
    // Exact match first
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    
    // Then check for partial matches
    for (const path in pageTitles) {
      if (location.pathname.startsWith(path)) {
        return pageTitles[path];
      }
    }
    
    return "Dashboard";
  };

  return (
    <header className={`admin-header ${isCollapsed ? "collapsed" : ""}`}>
      <div className="admin-header-content">
        <div className="header-left">
          {/* Mobile toggle button - show on mobile and tablet */}
          {(isMobile || window.innerWidth <= 1024) && (
            <button
              className="header-toggle-btn"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <FaBars />
            </button>
          )}
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>
        
        <div className="header-right">
          <span className="welcome-text">Welcome back, Admin User</span>
          {/* Add user avatar or other header elements here */}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;