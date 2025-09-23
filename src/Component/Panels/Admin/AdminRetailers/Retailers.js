import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./Retailers.css";

function Retailers() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Mock data matching the image exactly
  const retailersData = [
    {
      id: 1,
      retailer: "Sharma Electronics",
      contact: "+91 98765 43210\nsharma@email.com",
      typeLocation: "Electronics\nDelhi",
      assignedStaff: "Ravi Kumar",
      performance: "8.5/10\n₹ 125,000",
      status: "Active"
    },
    {
      id: 2,
      retailer: "Gupta General Store",
      contact: "+91 98765 43211\ngupta@email.com",
      typeLocation: "General Store\nMumbai",
      assignedStaff: "Priya Singh",
      performance: "7.2/10\n₹ 89,000",
      status: "Active"
    },
    {
      id: 3,
      retailer: "Khan Textiles",
      contact: "+91 98765 43212\nkhan@email.com",
      typeLocation: "Textiles\nBangalore",
      assignedStaff: "Amit Verma",
      performance: "9.1/10\n₹ 156,000",
      status: "Active"
    }
  ];

  // Custom renderers (keep your existing renderers)
  const renderRetailerCell = (item) => (
    <div className="retailers-table__retailer-cell">
      <strong className="retailers-table__retailer-name">{item.retailer}</strong>
      <span className="retailers-table__retailer-id">ID: {item.id}</span>
    </div>
  );

  const renderContactCell = (item) => (
    <div className="retailers-table__contact-cell">
      <div className="retailers-table__contact-item">
        <span className="retailers-table__contact-icon">📞</span>
        {item.contact.split("\n")[0]}
      </div>
      <div className="retailers-table__contact-email">
        {item.contact.split("\n")[1]}
      </div>
    </div>
  );

  const renderTypeLocationCell = (item) => (
    <div className="retailers-table__type-location-cell">
      <strong className="retailers-table__type">
        {item.typeLocation.split("\n")[0]}
      </strong>
      <div className="retailers-table__location">
        <span className="retailers-table__location-icon">📍</span>
        {item.typeLocation.split("\n")[1]}
      </div>
    </div>
  );

  const renderPerformanceCell = (item) => (
    <div className="retailers-table__performance-cell">
      <div className="retailers-table__rating">
        <span className="retailers-table__rating-icon">⭐</span>
        {item.performance.split("\n")[0]}
      </div>
      <div className="retailers-table__revenue">
        {item.performance.split("\n")[1]}
      </div>
    </div>
  );

  const renderStatusCell = (item) => (
    <span
      className={`retailers-table__status retailers-table__status--${item.status.toLowerCase()}`}
    >
      {item.status}
    </span>
  );

  const columns = [
    { key: "retailer", title: "Retailer", render: renderRetailerCell },
    { key: "contact", title: "Contact", render: renderContactCell },
    { key: "typeLocation", title: "Type & Location", render: renderTypeLocationCell },
    { key: "assignedStaff", title: "Assigned Staff" },
    { key: "performance", title: "Performance", render: renderPerformanceCell },
    { key: "status", title: "Status", render: renderStatusCell }
  ];

  const handleAddRetailerClick = () => {
    navigate("/admindashboard/retailers/add");
  };

  return (
    <div className="retailers-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area */}
      <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
        {/* Remove AdminHeader component since we have custom header below */}
        
        <div className="retailers-main-content">
          {/* Header Section - This replaces the AdminHeader */}
          <div className="retailers-page-header">
            <div className="retailers-page-header-content">
              <div className="retailers-header-info">
                <h1 className="retailers-page-title">Retailers</h1>
                <span className="retailers-welcome">Welcome back, Admin User</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="retailers-content-section">
            {/* Page Title and Add Button */}
            <div className="retailers-header-top">
              <div className="retailers-title-section">
                <h1 className="retailers-main-title">All Retailers</h1>
                <p className="retailers-subtitle">
                  Manage retailer relationships and track performance
                </p>
              </div>
              <button
                className="retailers-add-button retailers-add-button--top"
                onClick={handleAddRetailerClick}
              >
                <span className="retailers-add-icon">+</span>
                Add Retailer
              </button>
            </div>

            {/* Search Bar */}
            <div className="retailers-search-container">
              <div className="retailers-search-box">
                <span className="retailers-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search retailers..."
                  className="retailers-search-input"
                />
              </div>
            </div>

            {/* Retailers List Section */}
            <div className="retailers-list-section">
              <div className="retailers-section-header">
                <h2 className="retailers-section-title">
                  Retailers ({retailersData.length})
                </h2>
                <p className="retailers-section-description">
                  Track retailer performance and manage relationships
                </p>
              </div>

              {/* Table Section */}
              <div className="retailers-table-container">
                <ReusableTable
                  data={retailersData}
                  columns={columns}
                  initialEntriesPerPage={2}
                  searchPlaceholder="Search retailers..."
                  showSearch={false}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Retailers;