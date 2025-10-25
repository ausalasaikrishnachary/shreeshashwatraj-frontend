// frontend/src/components/Sales/Receipts/ReceiptView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { baseurl } from '../../../BaseURL/BaseURL';
import './Receiptsview.css';

const ReceiptView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseurl}/api/receipts/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setReceipt(data);
      } else {
        setError('Failed to load receipt');
      }
    } catch (err) {
      console.error('Error fetching receipt:', err);
      setError('Error loading receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/sales/receipts');
  };

  if (isLoading) {
    return (
      <div className="receipt-view-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receipt-view-container">
        <div className="alert alert-danger text-center">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Receipts
          </button>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="receipt-view-container">
        <div className="alert alert-warning text-center">
          <h4>Receipt Not Found</h4>
          <p>The requested receipt could not be found.</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Receipts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-view-container">
      {/* Header Actions */}
      <div className="receipt-view-header">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i> Back to Receipts
        </button>
        <div className="receipt-view-actions">
          <button className="btn btn-outline-primary me-2" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i> Print
          </button>
          {/* <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <i className="bi bi-download me-2"></i> Download PDF
          </button> */}
        </div>
      </div>

      {/* Receipt Container */}
      <div className="receipt-container">
        {/* Receipt Paper */}
        <div className="receipt-paper">
          {/* Header Section */}
          <div className="receipt-header">
            <h1 className="receipt-main-title">View Receipt</h1>
            <div className="receipt-customer-section">
              <h2 className="receipt-customer-title">Customer: {receipt.payee_name || 'N/A'}</h2>
            </div>
            <hr className="receipt-divider" />
          </div>

          {/* Company Information */}
          <div className="receipt-company-info">
            <h3 className="company-name">Market Experts</h3>
            <div className="company-details">
              <p><strong>Phone:</strong> 91 7360705070</p>
              <p><strong>Email:</strong> sales.taa@apache.com</p>
              <p><strong>GST:</strong> 29A4JCC420501ZX</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="receipt-payment-info">
            <div className="payup-section">
              <strong>Payup:</strong>
              <span className="payup-amount">₹ {parseFloat(receipt.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <hr className="receipt-divider" />

          {/* Receipt Details */}
          <div className="receipt-details">
            <div className="receipt-meta">
           
             
              <p><strong>RECEPT Date:</strong> {receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString('en-IN') : 'N/A'}</p>
              <p><strong>Created by:</strong> IIIQ bets</p>
            </div>
          </div>

          {/* Product Description */}
          <div className="receipt-product-section">
            <h4>Product Description:</h4>
            <table className="receipt-product-table">
              <thead>
                <tr>
                  <th className="text-start">Product Name</th>
                  <th className="text-start">Product Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Received from {receipt.payee_name || 'N/A'} of RFL 2016 (or two hundred) through</td>
                  <td>TOTAL</td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <strong>₹ {parseFloat(receipt.amount || 0).toLocaleString('en-IN')}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          <div className="receipt-footer">
            <div className="authorized-signatory">
              <p>For NBRRA MIND CORPORATION PRIVATE LIMITED</p>
              <p className="signature-line">Authorized Signatory</p>
            </div>
            <div className="receipt-note">
              <p className="computer-generated">This is a computer generated record. Thank you!</p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="receipt-additional-info">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Payment Method:</strong> {receipt.payment_method || 'N/A'}</p>
                {receipt.bank_name && <p><strong>Bank Name:</strong> {receipt.bank_name}</p>}
                {receipt.transaction_date && (
                  <p><strong>Transaction Date:</strong> {new Date(receipt.transaction_date).toLocaleDateString('en-IN')}</p>
                )}
              </div>
              <div className="col-md-6">
                <p><strong>Currency:</strong> {receipt.currency || 'INR'}</p>
                <p><strong>Receipt Number:</strong> {receipt.receipt_number || 'N/A'}</p>
              </div>
            </div>
            {receipt.note && (
              <div className="receipt-notes">
                <p><strong>Notes:</strong> {receipt.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;