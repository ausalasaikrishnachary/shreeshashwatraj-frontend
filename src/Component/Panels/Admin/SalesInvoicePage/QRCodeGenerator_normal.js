import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { FaQrcode } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import './QRCodeGenerator_normal.css';

const QRCodeGenerator_normal = ({ invoiceData, onQrDataGenerated }) => {
  
  const [qrValue, setQrValue] = useState('');
  const [displayAmount, setDisplayAmount] = useState(0);

  const calculateGrandTotal = () => {
    if (!invoiceData || !invoiceData.items) {
      console.log('❌ No invoice data or items for QR calculation');
      return 0;
    }
    
    let totalFromItems = 0;
    invoiceData.items.forEach((item, index) => {
      const itemTotal = parseFloat(item.total) || 0;
      totalFromItems += itemTotal;
      console.log(`Item ${index + 1}: ${item.product} - Total: ${itemTotal}`);
    });
    
    const grandTotalFromInvoice = parseFloat(invoiceData.grandTotal) || 0;
    
    let finalTotal = totalFromItems;
    if (grandTotalFromInvoice > 0 && Math.abs(grandTotalFromInvoice - totalFromItems) < 1) {
      finalTotal = grandTotalFromInvoice;
    }
    
    console.log('💰 Grand Total Calculation:', {
      totalFromItems,
      grandTotalFromInvoice,
      finalTotal
    });
    
    return finalTotal;
  };

  const generateQRCodeData = () => {
    if (!invoiceData) {
      console.log('❌ No invoice data available for QR code');
      return '';
    }
    
    try {
      const amount = calculateGrandTotal();
      setDisplayAmount(amount);
      
      // Format amount with 2 decimal places
      const formattedAmount = amount.toFixed(2);
      
      console.log('📊 QR Code Amount:', formattedAmount);
      
      // UPI ID - you can change this
      const upiId = 'bharathsiripuram98@okicici';
      
      // Merchant name from invoice
      const merchantName = invoiceData.companyInfo?.name?.replace(/[^a-zA-Z0-9 ]/g, '') || 'Business';
      
      // Invoice number
      const invoiceNumber = invoiceData.invoiceNumber || `INV${Date.now().toString().slice(-6)}`;
      
      // Transaction note
      const transactionNote = `Payment for Invoice ${invoiceNumber}`;
      
      // Create UPI URL
      const upiParams = new URLSearchParams({
        pa: upiId,
        pn: merchantName,
        am: formattedAmount,
        tn: transactionNote,
        cu: 'INR'
      });
      
      const upiUrl = `upi://pay?${upiParams.toString()}`;
      
      console.log('✅ Generated UPI URL:', upiUrl);
      
      // Callback to parent
      if (onQrDataGenerated) {
        onQrDataGenerated(upiUrl);
      }
      
      return upiUrl;
      
    } catch (error) {
      console.error('❌ Error generating QR code data:', error);
      return '';
    }
  };

  useEffect(() => {
    if (invoiceData && invoiceData.items) {
      const amount = calculateGrandTotal();
      setDisplayAmount(amount);
      
      const timer = setTimeout(() => {
        const qrData = generateQRCodeData();
        setQrValue(qrData);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [invoiceData]);

  if (!invoiceData) return null;

  // Get the display amount
  const grandTotal = displayAmount > 0 ? displayAmount : calculateGrandTotal();

  return (
    <Card className="shadow-sm border-0 mb-3 qr-code-card">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><FaQrcode className="me-2" /> Scan to Pay</h5>
      </Card.Header>
      <Card.Body className="qr-code-body">
        <div className="text-center mb-3">
          <div className="qr-code-box d-inline-block">
            {qrValue ? (
              <QRCodeCanvas 
                value={qrValue}
                size={180}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="p-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Generating QR...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <h3 className="text-success fw-bold">₹{grandTotal.toFixed(2)}</h3>
          
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QRCodeGenerator_normal;