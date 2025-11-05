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
  const [retailerDetails, setRetailerDetails] = useState(null);

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


  useEffect(() => {
  if (receipt && receipt.retailer_id) {
    fetchRetailerDetails(receipt.retailer_id);
  }
}, [receipt]);

  const fetchRetailerDetails = async (retailerId) => {
  try {
    const response = await fetch(`${baseurl}/accounts/${retailerId}`);
    if (response.ok) {
      const retailerData = await response.json();
      setRetailerDetails(retailerData);
    }
  } catch (err) {
    console.error('Error fetching retailer details:', err);
  }
};

// Convert numbers to words (Indian format)
const numberToWords = (num) => {
  if (!num) return "Zero Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const numToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
  };

  return numToWords(parseInt(num)) + " Only";
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
         {/* Company Information */}
<div className="receipt-company-info">
  <h3 className="company-name">
    {retailerDetails?.business_name || receipt.retailer_business_name || 'Market Experts'}
  </h3>
  <div className="company-details">
    <p><strong>Phone:</strong> {retailerDetails?.mobile_number || receipt.retailer_mobile || '91 7360705070'}</p>
    <p><strong>Email:</strong> {retailerDetails?.email || receipt.retailer_email || 'sales.taa@apache.com'}</p>
    <p><strong>GST:</strong> {retailerDetails?.gstin || receipt.retailer_gstin || '29A4JCC420501ZX'}</p>
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
                  <td>Received from {receipt.payee_name || 'N/A'} of {numberToWords(receipt.amount)}</td>
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
              <p className="computer-generated"> Thank you!</p>
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