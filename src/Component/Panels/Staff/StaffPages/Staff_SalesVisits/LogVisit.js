import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./LogVisit.css";

function LogVisit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    retailerName: "",
    visitType: "",
    visitOutcome: "",
    salesAmount: "",
    transactionType: "",
    notes: ""
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
    console.log("Visit logged:", formData);
    // After successful submission, navigate back
    navigate("/staff/sales-visits");
  };

  const handleCancel = () => {
    navigate("/staff/sales-visits");
  };

  return (
    <StaffMobileLayout>
      <div className="log-visit-mobile">
        <header className="form-header">
          <h1>Log Sales Visit</h1>
          <p>Record details of your retailer visit</p>
        </header>

        <form onSubmit={handleSubmit} className="visit-form">
          <div className="form-group">
            <label htmlFor="retailerName">Retailer Name *</label>
            <select
              id="retailerName"
              name="retailerName"
              value={formData.retailerName}
              onChange={handleInputChange}
              required
            >
              <option value="">Select retailer</option>
              <option value="Sharma Electronics">Sharma Electronics</option>
              <option value="Gupta General Store">Gupta General Store</option>
              <option value="Khan Textiles">Khan Textiles</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="visitType">Visit Type *</label>
            <select
              id="visitType"
              name="visitType"
              value={formData.visitType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select visit type</option>
              <option value="Routine">Routine</option>
              <option value="Follow Up">Follow Up</option>
              <option value="New Retailer">New Retailer</option>
              <option value="Issue Resolution">Issue Resolution</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="visitOutcome">Visit Outcome *</label>
            <select
              id="visitOutcome"
              name="visitOutcome"
              value={formData.visitOutcome}
              onChange={handleInputChange}
              required
            >
              <option value="">Select outcome</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="salesAmount">Sales Amount</label>
            <input
              type="text"
              id="salesAmount"
              name="salesAmount"
              value={formData.salesAmount}
              onChange={handleInputChange}
              placeholder="Enter sales amount (e.g., ¥ 45,000)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="transactionType">Transaction Type</label>
            <select
              id="transactionType"
              name="transactionType"
              value={formData.transactionType}
              onChange={handleInputChange}
            >
              <option value="">Select transaction type</option>
              <option value="Paikka">Paikka</option>
              <option value="Kaccha">Kaccha</option>
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes about the visit (optional)"
              rows="4"
            />
          </div>

          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Log Visit
            </button>
          </div>
        </form>
      </div>
    </StaffMobileLayout>
  );
}

export default LogVisit;