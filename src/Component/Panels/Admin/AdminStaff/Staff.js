import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./Staff.css";

function Staff() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleAddStaff = () => {
    navigate("/staff/add");
  };

  // Sample staff data
  const staffData = [
    {
      id: 1,
      serial: 1,
      name: "Ravi Kumar",
      email: "ravi@example.com",
      mobile: "9876543210",
      role: "Staff",
      status: "Active",
      lastLogin: "18 Sep 2025"
    },
    {
      id: 2,
      serial: 2,
      name: "Abc",
      email: "abc@example.com",
      mobile: "xxxxxxxxxxxx",
      role: "Staff",
      status: "Active",
      lastLogin: "18 Sep 2025"
    }
  ];

  // Columns configuration for reusable table
  const columns = [
    {
      key: "serial",
      title: "#",
      style: { width: "60px", textAlign: "center" }
    },
    {
      key: "name",
      title: "Name",
      render: (item) => <div className="staff-name">{item.name}</div>
    },
    {
      key: "email",
      title: "Email",
      render: (item) => <div className="staff-email">{item.email}</div>
    },
    {
      key: "mobile",
      title: "Mobile",
      render: (item) => <div className="staff-mobile">{item.mobile}</div>
    },
    {
      key: "role",
      title: "Role",
      render: (item) => <span className="role-badge">{item.role}</span>
    },
    {
      key: "status",
      title: "Status",
      render: (item) => (
        <span className={`status-badge status-${item.status.toLowerCase()}`}>
          {item.status}
        </span>
      )
    },
    {
      key: "lastLogin",
      title: "Last Login",
      render: (item) => <div className="last-login">{item.lastLogin}</div>
    },
    {
      key: "actions",
      title: "Actions",
      render: (item) => (
        <div className="action-buttons">
          <button className="action-btn view-btn">View</button>
          <button className="action-btn edit-btn">Edit</button>
          <button className="action-btn delete-btn">Delete</button>
        </div>
      ),
      style: { width: "200px" }
    }
  ];

  return (
    <div className="staff-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area with Header */}
      <div className={`staff-content-with-header ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="staff-main-content">
          <div className="staff-container">
            
            {/* Page Header */}
            <div className="page-header-section">
              <h1 className="page-title">Staff Management</h1>
            </div>

            {/* Controls Section */}
            <div className="staff-controls-section">
              <div className="search-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by name or role"
                    className="search-input"
                  />
                </div>
              </div>
              
              <div className="action-controls">
                <button className="add-staff-btn" onClick={handleAddStaff}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 5v14m-7-7h14" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Add Staff
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="table-section">
              <ReusableTable
                data={staffData}
                columns={columns}
                searchPlaceholder="Search staff..."
                initialEntriesPerPage={10}
                showSearch={false}
                showEntriesSelector={true}
                showPagination={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Staff;