import React from 'react';
import { QRCodeCanvas } from "qrcode.react";

const QRCodeGenerator = ({ invoiceData, paymentData }) => {
  if (!invoiceData) return null;

  // Generate UPI payment URL
  const generateUPIUrl = () => {
    const amount = paymentData?.summary?.balanceDue || parseFloat(invoiceData.grandTotal) || 0;
    // Updated UPI ID with correct format
    const businessUPI = 'bharathsiripuram98@okicici'; // Fixed UPI ID
    const invoiceNumber = invoiceData.invoiceNumber || 'INV001';
    const customerName = invoiceData.supplierInfo?.name || 'Customer';
    
    // Properly encoded UPI URL format
    return `upi://pay?pa=${encodeURIComponent(businessUPI)}&pn=${encodeURIComponent('Business Name')}&am=${amount}&tn=${encodeURIComponent(`Payment for Invoice ${invoiceNumber}`)}&cu=INR`;
  };



  return (
    <div className="qr-code-container text-center mt-3">
      <div className="qr-code-box p-3 border rounded bg-white">
        <h6 className="mb-2 fw-bold">Scan to Pay via UPI</h6>
        <QRCodeCanvas   
          value={generateUPIUrl()}
          size={150}
          level="H"
          includeMargin={true}
          renderAs="svg"
        />
        <div className="mt-2">
          <small className="text-muted d-block">UPI ID: bharathsiripuram98@okicici</small>
          <small className="text-muted d-block">
            Amount: ₹{paymentData?.summary?.balanceDue || parseFloat(invoiceData.grandTotal) || 0}
          </small>
          <small className="text-muted">
            Invoice: {invoiceData.invoiceNumber || 'INV001'}
          </small>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;