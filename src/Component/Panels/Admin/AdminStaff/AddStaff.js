import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { useNavigate } from "react-router-dom";
import "./AddStaff.css";

function AddStaff() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    password: "",
    email: "",
    role: "",
    status: "Active"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Staff data:", formData);
    // You can add API call here
  };

  const handleCancel = () => {
    navigate("/staff");
  };

  return (
    <div className="add-staff-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area */}
      <div className={`add-staff-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="add-staff-container">
          
          {/* Page Header */}
          <div className="page-header-section">
            <h1 className="page-title">Add New Staff</h1>
          </div>

          {/* Add Staff Form */}
          <div className="add-staff-form-section">
            <form onSubmit={handleSubmit} className="staff-form">
              
              {/* First Row - Two Fields */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Second Row - Two Fields */}
              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="mobileNumber" className="form-label">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                
                <div className="form-group half-width">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              {/* Third Row - Two Fields */}
              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div className="form-group half-width">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select role</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>

              {/* Fourth Row - Two Fields */}
              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="form-group half-width">
                  {/* Empty field for alignment - you can add another field here if needed */}
                  <label className="form-label invisible">Spacer</label>
                  <div className="spacer-field"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="save-staff-btn">
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStaff;