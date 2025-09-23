import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import "./AddRetailer.css";

const RetailerForm = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    email: "contact@business.com",
    phone: "+91 98765 43210",
    businessType: "",
    location: "",
    notes: ""
  });

  const businessTypes = [
    "Select business type",
    "Retail Store",
    "E-commerce",
    "Wholesale",
    "Franchise",
    "Other"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    navigate("/admindashboard/retailers");
  };

  const handleCancel = () => {
    navigate("/admindashboard/retailers");
  };

  return (
    <>
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`form-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="form-wrapper">
          <div className="formHeader">
            <h1 className="title">Add New Retailer</h1>
            <p className="subtitle">
              Fill in the retailer details for onboarding approval
            </p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="formGroup">
                <label htmlFor="businessName" className="label">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter business name"
                  className="input"
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="email" className="label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@business.com"
                  className="input"
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="phone" className="label">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="formGroup">
                <label htmlFor="businessType" className="label">
                  Business Type
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="select"
                >
                  {businessTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formGroup">
                <label htmlFor="location" className="label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                  className="input"
                />
              </div>

              <div className="formGroup spacer">
                {/* Empty spacer to maintain 3-column layout */}
              </div>
            </div>

            <div className="formGroup full-width">
              <label htmlFor="notes" className="label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes or comments"
                rows="4"
                className="textarea"
              />
            </div>

            <div className="buttonGroup">
              <button
                type="button"
                className="cancelButton"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" className="submitButton">
                Add Retailer
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RetailerForm;