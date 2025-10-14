import React from "react";
import { Modal } from "react-bootstrap";

const StockDetailsModal = ({ show, onClose, stockData, context = "purchase" }) => {
  if (!stockData) return null;

  // Common fields for both contexts
  const {
    name = "N/A",
    opening_stock = "0",
    balance_stock = "0",
    price = "0",
    gst = "0%",
    description = "N/A"
  } = stockData;

  // Context-specific fields and labels
  const getContextDetails = () => {
    if (context === "purchase") {
      return {
        title: "Purchase Stock Details",
        fields: [
          { label: "Stock In", value: stockData.stock_in || "0" },
          { label: "Stock Out", value: stockData.stock_out || "0" }
        ]
      };
    } else {
      return {
        title: "Sales Stock Details",
        fields: [
          { label: "Stock In", value: stockData.stock_in || "0" },
          { label: "Stock Out", value: stockData.stock_out || "0" }
        ]
      };
    }
  };

  const contextDetails = getContextDetails();

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{contextDetails.title} - {name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="stock-details-grid">
          <div><strong>Product Name:</strong> {name}</div>
          <div><strong>Price:</strong> ₹{price}</div>
          <div><strong>GST Rate:</strong> {gst}</div>
          <div><strong>Description:</strong> {description}</div>
          <div><strong>Opening Stock:</strong> {opening_stock}</div>
          
          {contextDetails.fields.map((field, index) => (
            <div key={index}>
              <strong>{field.label}:</strong> {field.value}
            </div>
          ))}
          
          <div><strong>Available Stock:</strong> {balance_stock}</div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default StockDetailsModal;