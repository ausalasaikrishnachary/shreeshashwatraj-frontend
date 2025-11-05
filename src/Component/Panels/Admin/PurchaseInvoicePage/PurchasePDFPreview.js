import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, Table, Alert, Card , Modal, Badge} from 'react-bootstrap';
import './InvoicePDFPreview.css';
import { FaPrint, FaFilePdf, FaEdit, FaSave, FaTimes, FaArrowLeft, FaRupeeSign, FaCalendar, FaReceipt , FaRegFileAlt,FaExclamationTriangle, FaCheckCircle} from "react-icons/fa";
import { data, useNavigate } from "react-router-dom";
import html2pdf from 'html2pdf.js';
import { baseurl } from '../../../BaseURL/BaseURL';

const PurchasePDFPreview = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [downloading, setDownloading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const invoiceRef = useRef(null);
const [showVoucherModal, setShowVoucherModal] = useState(false);
const [voucherFormData, setVoucherFormData] = useState({
  voucherNumber: '',
  supplierId: '',
  amount: '',
  currency: 'INR',
  paymentMethod: 'Direct Deposit',
  voucherDate: new Date().toISOString().split('T')[0],
  note: '',
  bankName: '',
  transactionDate: '',
  reconciliationOption: 'Do Not Reconcile',
  supplierMobile: '',
  supplierEmail: '',
  supplierGstin: '',
  supplierBusinessName: '',
  invoiceNumber: ''
});
const [isCreatingVoucher, setIsCreatingVoucher] = useState(false);
  

  useEffect(() => {
    // Load purchase invoice data from localStorage
    const savedData = localStorage.getItem('previewPurchaseInvoice');
    if (savedData) {
      const data = JSON.parse(savedData);
      setInvoiceData(data);
      setEditedData(data);
      
      if (data.invoiceNumber) {
        setInvoiceNumber(data.invoiceNumber);
        fetchPaymentData(data.invoiceNumber);
      } else {
        const draftData = localStorage.getItem('draftPurchaseInvoice');
        if (draftData) {
          const draft = JSON.parse(draftData);
          const invNumber = draft.invoiceNumber || 'PINV001';
          setInvoiceNumber(invNumber);
          fetchPaymentData(invNumber);
        } else {
          setInvoiceNumber('PINV001');
        }
      }
    } else {
      const draftData = localStorage.getItem('draftPurchaseInvoice');
      if (draftData) {
        const draft = JSON.parse(draftData);
        const invNumber = draft.invoiceNumber || 'PINV001';
        setInvoiceData(draft);
        setEditedData(draft);
        setInvoiceNumber(invNumber);
        fetchPaymentData(invNumber);
        localStorage.setItem('previewPurchaseInvoice', draftData);
      } else {
        window.location.href = '/purchase/create-invoice';
      }
    }
  }, [navigate]);
const fetchPaymentData = async (invNumber) => {
  if (!invNumber) {
    console.log('❌ fetchPaymentData: No invoice number provided');
    return;
  }
  
  console.log(`🔍 fetchPaymentData: Fetching payment data for invoice: ${invNumber}`);
  
  try {
    setLoadingPayment(true);
    const response = await fetch(`${baseurl}/api/invoice/${invNumber}`);
    
    console.log(`📡 fetchPaymentData: API Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ fetchPaymentData: API Response data:', result);
      
      if (result.success) {
        console.log('💰 fetchPaymentData: Setting payment data:', result.data);
        setPaymentData(result.data);
        
        // Log detailed payment information
        if (result.data && result.data.allEntries) {
          console.log('📊 fetchPaymentData: All entries found:', result.data.allEntries.length);
          
          result.data.allEntries.forEach((entry, index) => {
            console.log(`   Entry ${index + 1}:`, {
              TransactionType: entry.TransactionType,
              InvoiceNumber: entry.InvoiceNumber,
              TotalAmount: entry.TotalAmount,
              paid_amount: entry.paid_amount,
              balance_amount: entry.balance_amount,
              status: entry.status,
              Date: entry.Date
            });
          });
          
          // Calculate and log payment summary
          const purchaseEntry = result.data.allEntries.find(entry => 
            entry.TransactionType === 'Purchase'
          );
          const voucherEntries = result.data.allEntries.filter(entry => 
            entry.TransactionType === 'Voucher'
          );
          
          if (purchaseEntry) {
            const totalAmount = parseFloat(purchaseEntry.TotalAmount) || 0;
            const totalPaid = voucherEntries.reduce((sum, entry) => 
              sum + (parseFloat(entry.paid_amount) || 0), 0
            );
            const balanceDue = totalAmount - totalPaid;
            
            console.log('🧮 fetchPaymentData: Payment Summary:', {
              totalAmount,
              totalPaid,
              balanceDue,
              purchaseEntries: result.data.allEntries.filter(e => e.TransactionType === 'Purchase').length,
              voucherEntries: voucherEntries.length
            });
          }
        }
      } else {
        console.warn('⚠️ fetchPaymentData: API returned success: false', result);
        setPaymentData(null);
      }
    } else {
      console.error('❌ fetchPaymentData: API request failed with status:', response.status);
      const errorText = await response.text();
      console.error('❌ fetchPaymentData: Error response:', errorText);
      setPaymentData(null);
    }
  } catch (error) {
    console.error('💥 fetchPaymentData: Network error:', error);
    console.error('💥 fetchPaymentData: Error details:', {
      message: error.message,
      stack: error.stack
    });
    setPaymentData(null);
  } finally {
    console.log('🔚 fetchPaymentData: Setting loading to false');
    setLoadingPayment(false);
  }
};
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      alert("Invoice content not found. Please try again.");
      return;
    }

    try {
      setDownloading(true);
      
      const element = invoiceRef.current;
      const filename = `Purchase_Invoice_${displayInvoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create a clone for PDF generation
      const clone = element.cloneNode(true);
      
      // Remove all non-printable elements
      const nonPrintableElements = clone.querySelectorAll(
        '.d-print-none, .btn, .alert, .action-bar, .tax-indicator, .no-print, .edit-control, .payment-sidebar'
      );
      nonPrintableElements.forEach(el => el.remove());
      
      // Ensure all content is visible
      const hiddenElements = clone.querySelectorAll('[style*="display: none"], .d-none');
      hiddenElements.forEach(el => {
        el.style.display = 'block';
      });

      // Add PDF-specific styles
      const style = document.createElement('style');
      style.innerHTML = `
        @media all {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background: white !important;
            color: black !important;
          }
          .invoice-pdf-preview {
            width: 100% !important;
            margin: 0 !important;
            padding: 15px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .table-dark {
            background-color: #343a40 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
          .bg-light {
            background-color: #f8f9fa !important;
            -webkit-print-color-adjust: exact;
          }
          .text-primary { color: #000000 !important; font-weight: bold; }
          .text-danger { color: #000000 !important; font-weight: bold; }
          .text-success { color: #000000 !important; font-weight: bold; }
          .border { border: 1px solid #000000 !important; }
          .border-bottom { border-bottom: 1px solid #000000 !important; }
          .border-top { border-top: 1px solid #000000 !important; }
          .shadow-sm { box-shadow: none !important; }
          .rounded { border-radius: 0 !important; }
          
          /* Ensure table borders are visible */
          table { 
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #000000 !important;
            padding: 6px 8px !important;
          }
          th {
            background-color: #343a40 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
        }
        
        @page {
          margin: 10mm;
          size: A4 portrait;
        }
        
        @media print {
          body { 
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .invoice-preview-page {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .invoice-preview-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .invoice-pdf-preview {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .no-print, .action-bar, .tax-indicator, .btn, .payment-sidebar {
            display: none !important;
          }
        }
      `;
      clone.appendChild(style);

      // PDF configuration optimized for better output
      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          width: element.scrollWidth,
          height: element.scrollHeight,
          backgroundColor: '#FFFFFF',
          scrollX: 0,
          scrollY: 0,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          hotfixes: ["px_scaling"]
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: '.no-break'
        }
      };

      // Generate PDF
      await html2pdf().set(opt).from(clone).save();
      
      setDownloading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print method
      handlePrintFallback();
    }
  };
const PaymentStatus = () => {
  console.log('🎯 PaymentStatus: Rendering with paymentData:', paymentData);
  
  if (loadingPayment) {
    return (
      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaReceipt className="me-2" />
            Payment Status
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading payment status...
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!paymentData || !paymentData.allEntries || paymentData.allEntries.length === 0) {
    console.log('📭 PaymentStatus: No payment data available');
    return (
      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaReceipt className="me-2" />
            Payment Status
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center text-muted">
            <FaExclamationTriangle className="mb-2" />
            <p>No payment data available</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Find the main purchase entry - it should be the one with TransactionType 'Purchase'
  const purchaseEntry = paymentData.allEntries.find(entry => 
    entry.TransactionType === 'Purchase'
  );

  console.log('🔍 PaymentStatus: Purchase entry:', purchaseEntry);

  // Find all voucher entries - changed from 'Purchase Voucher Payment' to 'Voucher'
  const voucherEntries = paymentData.allEntries.filter(entry => 
    entry.TransactionType === 'Voucher'
  );

  console.log('🔍 PaymentStatus: Voucher entries found:', voucherEntries.length, voucherEntries);

  // If no purchase entry found, but we have voucher entries, let's check if we can calculate from vouchers
  if (!purchaseEntry) {
    console.log('⚠️ PaymentStatus: No purchase entry found, checking if we can calculate from vouchers');
    
    // Try to find the original purchase amount from voucher entries
    if (voucherEntries.length > 0) {
      // Get the invoice number from the first voucher entry
      const invoiceNumber = voucherEntries[0].InvoiceNumber;
      console.log('📄 PaymentStatus: Invoice number from vouchers:', invoiceNumber);
      
      return (
        <Card className="shadow-sm mb-3">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <FaReceipt className="me-2" />
              Payment Status
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="text-center text-warning">
              <FaExclamationTriangle className="mb-2" />
              <p>Original purchase data not found</p>
              <small>Showing payment entries only</small>
            </div>
            
            {/* Show voucher payments anyway */}
            <div className="payment-amounts mb-3 mt-3">
              {voucherEntries.map((payment, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2 ps-3 border-start border-success">
                  <span className="text-success">
                    <FaCheckCircle className="me-1" />
                    Payment:
                  </span>
                  <div className="d-flex align-items-center">
                    <small className="text-muted ms-1">
                      (On {new Date(payment.Date).toLocaleDateString()}) – {payment.VchNo}
                    </small>
                    <span className="fw-bold text-success ms-2">
                      ₹{(parseFloat(payment.paid_amount) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      );
    }
    
    return (
      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaReceipt className="me-2" />
            Payment Status
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center text-muted">
            <FaExclamationTriangle className="mb-2" />
            <p>No purchase data found</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Calculate totals
  const totalAmount = parseFloat(purchaseEntry.TotalAmount) || 0;
  const totalPaid = voucherEntries.reduce((sum, entry) => 
    sum + (parseFloat(entry.paid_amount) || 0), 0
  );
  const balanceDue = totalAmount - totalPaid;

  console.log('🧮 PaymentStatus: Calculated amounts:', {
    totalAmount,
    totalPaid,
    balanceDue
  });

  // Determine status
  let status = 'Pending';
  let statusVariant = 'danger';
  
  if (totalPaid >= totalAmount) {
    status = 'Paid';
    statusVariant = 'success';
  } else if (totalPaid > 0) {
    status = 'Partial';
    statusVariant = 'warning';
  }

  const progressPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  return (
    <Card className="shadow-sm mb-3">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <FaReceipt className="me-2" />
          Payment Status
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Status Badge */}
        <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
          <span className="fw-bold">Status:</span>
          <Badge bg={statusVariant}>
            {status}
          </Badge>
        </div>

        {/* Amount Summary */}
        <div className="payment-amounts mb-3">
          {/* Invoiced Amount */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              <FaRupeeSign className="me-1" />
              Invoiced:
            </span>
            <div className="d-flex align-items-center">
              <small className="text-muted ms-1">
                (On {new Date(purchaseEntry.Date).toLocaleDateString()})
              </small>
              <span className="fw-bold text-primary ms-2">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Entries - Now using voucherEntries instead of paymentEntries */}
          {voucherEntries.map((payment, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center mb-2 ps-3 border-start border-success">
              <span className="text-success">
                <FaCheckCircle className="me-1" />
                Paid:
              </span>
              <div className="d-flex align-items-center">
                <small className="text-muted ms-1">
                  (On {new Date(payment.Date || payment.paid_date).toLocaleDateString()}) – {payment.VchNo || payment.receipt_number}
                </small>
                <span className="fw-bold text-success ms-2">
                  ₹{(parseFloat(payment.paid_amount) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          {/* Balance Due */}
          <div className="d-flex justify-content-between align-items-center mb-2 pt-2 border-top">
            <span className="text-danger">
              <FaExclamationTriangle className="me-1" />
              Balance Due:
            </span>
            <span className="fw-bold text-danger">
              ₹{balanceDue.toFixed(2)}
            </span>
          </div>
        </div>


    
      </Card.Body>
    </Card>
  );
};

  const handlePrintFallback = () => {
    const originalContent = document.getElementById('invoice-pdf-content').innerHTML;
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Invoice ${displayInvoiceNumber}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 15px; 
            color: #000;
            background: white;
            font-size: 12px;
            line-height: 1.4;
          }
          .invoice-pdf-preview {
            width: 100%;
            max-width: 100%;
          }
          .header { 
            border-bottom: 2px solid #333; 
            padding-bottom: 15px; 
            margin-bottom: 15px; 
          }
          .company-name { 
            color: #000; 
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 5px; 
          }
          .invoice-title { 
            color: #000; 
            font-weight: bold;
            font-size: 20px;
            margin-bottom: 10px; 
          }
          .invoice-meta { 
            background-color: #f5f5f5; 
            padding: 10px; 
            border: 1px solid #ddd;
          }
          .bg-light { 
            background-color: #f5f5f5 !important; 
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px; 
            font-size: 11px;
          }
          .table th, .table td { 
            border: 1px solid #000; 
            padding: 6px 8px; 
            text-align: left; 
          }
          .table th { 
            background-color: #333 !important; 
            color: white; 
            font-weight: bold;
          }
          .table-dark th {
            background-color: #333 !important;
            color: white;
          }
          .text-end { text-align: right; }
          .text-center { text-align: center; }
          .border { border: 1px solid #000; }
          .p-2 { padding: 8px; }
          .p-3 { padding: 12px; }
          .p-4 { padding: 16px; }
          .mb-1 { margin-bottom: 5px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-2 { margin-top: 8px; }
          .mt-3 { margin-top: 12px; }
          .pb-2 { padding-bottom: 8px; }
          .pt-2 { padding-top: 8px; }
          .pt-3 { padding-top: 12px; }
          .border-top { border-top: 1px solid #000; }
          .border-bottom { border-bottom: 1px solid #000; }
          .fw-bold { font-weight: bold; }
          .text-primary { color: #000; font-weight: bold; }
          .text-danger { color: #000; font-weight: bold; }
          .text-success { color: #000; font-weight: bold; }
          .text-muted { color: #666; }
          .small { font-size: 10px; }
          .row { display: flex; flex-wrap: wrap; margin-right: -10px; margin-left: -10px; }
          .col-md-6 { flex: 0 0 50%; max-width: 50%; padding: 0 10px; }
          .col-md-7 { flex: 0 0 58.333333%; max-width: 58.333333%; padding: 0 10px; }
          .col-md-5 { flex: 0 0 41.666667%; max-width: 41.666667%; padding: 0 10px; }
          .col-md-8 { flex: 0 0 66.666667%; max-width: 66.666667%; padding: 0 10px; }
          .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; padding: 0 10px; }
          .no-print { display: none !important; }
          .payment-sidebar { display: none !important; }
          @media print {
            body { margin: 0; padding: 0; }
            .invoice-pdf-preview { box-shadow: none; border: none; }
            .table th { background-color: #333 !important; -webkit-print-color-adjust: exact; }
            .bg-light { background-color: #f5f5f5 !important; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-pdf-preview">
          ${originalContent
            .replace(/<div[^>]*class="[^"]*d-print-none[^"]*"[^>]*>.*?<\/div>/gs, '')
            .replace(/<div[^>]*class="[^"]*action-bar[^"]*"[^>]*>.*?<\/div>/gs, '')
            .replace(/<div[^>]*class="[^"]*tax-indicator[^"]*"[^>]*>.*?<\/div>/gs, '')
            .replace(/<div[^>]*class="[^"]*payment-sidebar[^"]*"[^>]*>.*?<\/div>/gs, '')
            .replace(/<button[^>]*>.*?<\/button>/gs, '')
            .replace(/<input[^>]*>/gs, '')
            .replace(/<textarea[^>]*>.*?<\/textarea>/gs, '')
            .replace(/<form[^>]*>.*?<\/form>/gs, '')
          }
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => {
              window.close();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      setInvoiceData(editedData);
      localStorage.setItem('previewPurchaseInvoice', JSON.stringify(editedData));
      localStorage.setItem('draftPurchaseInvoice', JSON.stringify(editedData));
    }
    setIsEditMode(!isEditMode);
  };

  const handleCancelEdit = () => {
    setEditedData(invoiceData);
    setIsEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'invoiceNumber') {
      setInvoiceNumber(value);
      fetchPaymentData(value);
    }
  };

  const handleNestedChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...editedData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    const item = newItems[index];
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const gst = parseFloat(item.gst) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const gstAmount = amountAfterDiscount * (gst / 100);
    const total = amountAfterDiscount + gstAmount;
    
    newItems[index].total = total.toFixed(2);
    
    setEditedData(prev => ({
      ...prev,
      items: newItems
    }));
    
    recalculateTotals(newItems);
  };

  const recalculateTotals = (items) => {
    const taxableAmount = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      return sum + (subtotal - discountAmount);
    }, 0);
    
    const totalGST = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const gst = parseFloat(item.gst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      
      return sum + gstAmount;
    }, 0);
    
    const additionalChargeAmount = parseFloat(editedData.additionalChargeAmount) || 0;
    const grandTotal = taxableAmount + totalGST + additionalChargeAmount;
    
    setEditedData(prev => ({
      ...prev,
      taxableAmount: taxableAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }));
  };

  // const handleBackToCreate = () => {
  //   localStorage.setItem('draftPurchaseInvoice', JSON.stringify(editedData));
  //   window.close();
  // };

  const calculateGSTBreakdown = () => {
    if (!currentData || !currentData.items) return { totalCGST: 0, totalSGST: 0, totalIGST: 0 };
    
    const totalCGST = currentData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const cgstRate = parseFloat(item.cgst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const cgstAmount = amountAfterDiscount * (cgstRate / 100);
      
      return sum + cgstAmount;
    }, 0);
    
    const totalSGST = currentData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const sgstRate = parseFloat(item.sgst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const sgstAmount = amountAfterDiscount * (sgstRate / 100);
      
      return sum + sgstAmount;
    }, 0);
    
    const totalIGST = currentData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const igstRate = parseFloat(item.igst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const igstAmount = amountAfterDiscount * (igstRate / 100);
      
      return sum + igstAmount;
    }, 0);
    
    return {
      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalIGST: totalIGST.toFixed(2)
    };
  };

  if (!invoiceData) {
    return (
      <div className="invoice-preview-page">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading purchase invoice data...</p>
          <Button variant="primary" onClick={() => window.close()}>
            Close Window
          </Button>
        </div>
      </div>
    );
  }

  const currentData = isEditMode ? editedData : invoiceData;
  const gstBreakdown = calculateGSTBreakdown();
  const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;
  const displayInvoiceNumber = currentData.invoiceNumber || invoiceNumber || 'PINV001';

  // Calculate payment progress
  const totalAmount = paymentData ? parseFloat(paymentData.TotalAmount) : 0;
  const paidAmount = paymentData ? parseFloat(paymentData.paid_amount) : 0;
  const balanceAmount = paymentData ? parseFloat(paymentData.balance_amount) : 0;
  const paymentProgress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;


const handleOpenVoucherModal = () => {
  if (!invoiceData) return;
  
  // Calculate balance from payment data
  let balanceDue = 0;
  if (paymentData && paymentData.allEntries) {
    const purchaseEntry = paymentData.allEntries.find(entry => 
      entry.TransactionType === 'Purchase'
    );
    const paymentEntries = paymentData.allEntries.filter(entry => 
      entry.TransactionType === 'Purchase Voucher Payment'
    );
    
    const totalAmount = parseFloat(purchaseEntry?.TotalAmount) || 0;
    const totalPaid = paymentEntries.reduce((sum, entry) => 
      sum + (parseFloat(entry.paid_amount) || 0), 0
    );
    balanceDue = totalAmount - totalPaid;
  } else {
    // Fallback to invoice grand total if no payment data
    balanceDue = parseFloat(invoiceData.grandTotal) || 0;
  }
  
  setVoucherFormData(prev => ({
    ...prev,
    supplierBusinessName: invoiceData.supplierInfo.businessName,
    supplierId: invoiceData.supplierInfo.id || '',
    amount: balanceDue,
    invoiceNumber: invoiceData.invoiceNumber
  }));
  
  fetchNextVoucherNumber();
  setShowVoucherModal(true);
};
  // NEW:
const handleCloseVoucherModal = () => {
  setShowVoucherModal(false);
  setIsCreatingVoucher(false);
};
  
    const handleVoucherInputChange = (e) => {
  const { name, value } = e.target;
  setVoucherFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
  
const fetchNextVoucherNumber = async () => {
  try {
    const response = await fetch(`${baseurl}/api/next-purchase-voucher-number`);
    if (response.ok) {
      const data = await response.json();
      setVoucherFormData(prev => ({
        ...prev,
        voucherNumber: data.nextVoucherNumber
      }));
    } else {
      await generateFallbackVoucherNumber();
    }
  } catch (err) {
    console.error('Error fetching next voucher number:', err);
    await generateFallbackVoucherNumber();
  }
};




// REPLACE WITH THIS:
const generateFallbackVoucherNumber = async () => {
  try {
    const response = await fetch(`${baseurl}/api/last-purchase-voucher`);
    if (response.ok) {
      const data = await response.json();
      if (data.lastVoucherNumber) {
        const lastNumber = data.lastVoucherNumber;
        const numberMatch = lastNumber.match(/PV(\d+)/);
        if (numberMatch) {
          const nextNum = parseInt(numberMatch[1], 10) + 1;
          const fallbackVoucherNumber = `PV${nextNum.toString().padStart(3, '0')}`;
          setVoucherFormData(prev => ({
            ...prev,
            voucherNumber: fallbackVoucherNumber
          }));
          return;
        }
      }
    }
    setVoucherFormData(prev => ({
      ...prev,
      voucherNumber: 'PV001'
    }));
  } catch (err) {
    setVoucherFormData(prev => ({
      ...prev,
      voucherNumber: 'PV001'
    }));
  }
};

const handleCreateVoucherFromInvoice = async () => {
  if (!voucherFormData.amount || parseFloat(voucherFormData.amount) <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  try {
    setIsCreatingVoucher(true);

    const voucherPayload = {
      voucher_number: voucherFormData.voucherNumber,
      supplier_id: voucherFormData.supplierId,
      supplier_name: voucherFormData.supplierBusinessName,
      amount: parseFloat(voucherFormData.amount),
      currency: voucherFormData.currency,
      payment_method: voucherFormData.paymentMethod,
      voucher_date: voucherFormData.voucherDate,
      note: voucherFormData.note,
      bank_name: voucherFormData.bankName,
      transaction_date: voucherFormData.transactionDate || null,
      reconciliation_option: voucherFormData.reconciliationOption,
      invoice_number: voucherFormData.invoiceNumber,
      supplier_mobile: voucherFormData.supplierMobile,
      supplier_email: voucherFormData.supplierEmail,
      supplier_gstin: voucherFormData.supplierGstin,
      supplier_business_name: voucherFormData.supplierBusinessName,
      from_invoice: true
    };

    console.log('Creating purchase voucher from invoice:', voucherPayload);

    const response = await fetch(`${baseurl}/api/purchase-vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voucherPayload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Purchase voucher created successfully:', result);
      handleCloseVoucherModal();
      alert('Purchase voucher created successfully!');
      
      // Refresh payment data
      if (invoiceData && invoiceData.invoiceNumber) {
        fetchPaymentData(invoiceData.invoiceNumber);
      }
      
      if (result.id) {
        navigate(`/purchase-vouchers/${result.id}`);
      }
    } else {
      const errorText = await response.text();
      console.error('Failed to create purchase voucher:', errorText);
      let errorMessage = 'Failed to create purchase voucher. ';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage += errorData.error || 'Please try again.';
      } catch {
        errorMessage += 'Please try again.';
      }
      alert(errorMessage);
    }
  } catch (err) {
    console.error('Error creating purchase voucher:', err);
    alert('Network error. Please check your connection and try again.');
  } finally {
    setIsCreatingVoucher(false);
  }
};


  return (
    <div className="invoice-preview-page">
      {/* Action Bar */}
      <div className="action-bar bg-white shadow-sm p-3 mb-3 sticky-top d-print-none no-print">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Purchase Invoice Preview - {displayInvoiceNumber}</h4>
            <div>
              {!isEditMode ? (
                <>
                  <Button
                    variant="info"
                    className="me-2 text-white"
                 onClick={handleOpenVoucherModal}
                  >
                    <FaRegFileAlt className="me-1" /> Create Voucher
                  </Button>
                  <Button variant="warning" onClick={handleEditToggle} className="me-2">
                    <FaEdit className="me-1" /> Edit Invoice
                  </Button>
                  <Button variant="success" onClick={handlePrint} className="me-2">
                    <FaPrint className="me-1" /> Print
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleDownloadPDF} 
                    className="me-2"
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FaFilePdf className="me-1" /> Download PDF
                      </>
                    )}
                  </Button>
                 <Button variant="secondary" onClick={() => window.history.back()}>
                                  Go Back
                                </Button>
                </>
              ) : (
                <>
                  <Button variant="success" onClick={handleEditToggle} className="me-2">
                    <FaSave className="me-1" /> Save Changes
                  </Button>
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    <FaTimes className="me-1" /> Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Tax Type Indicator */}
      {currentData.supplierInfo?.state && (
        <div className="tax-indicator mb-3 d-print-none no-print">
          <Container fluid>
            <Alert variant={isSameState ? 'success' : 'warning'} className="mb-0">
              <strong>Tax Type: </strong>
              {isSameState ? (
                <>CGST & SGST (Same State - {currentData.companyInfo.state} to {currentData.supplierInfo.state})</>
              ) : (
                <>IGST (Inter-State: {currentData.companyInfo.state} to {currentData.supplierInfo.state})</>
              )}
            </Alert>
          </Container>
        </div>
      )}

      {/* Main Content with Sidebar */}
      <Container fluid className="invoice-preview-container">
        <Row>
          {/* Invoice Content - 8 columns */}
          <Col lg={8}>
            <div 
              className="invoice-pdf-preview bg-white p-4 shadow-sm" 
              id="invoice-pdf-content"
              ref={invoiceRef}
            >
              {/* Header */}
              <div className="invoice-header border-bottom pb-3 mb-3">
                <Row>
                  <Col md={8}>
                    {isEditMode ? (
                      <div className="edit-control">
                        <Form.Control 
                          className="mb-2 fw-bold fs-4"
                          value={currentData.companyInfo.name}
                          onChange={(e) => handleNestedChange('companyInfo', 'name', e.target.value)}
                        />
                        <Form.Control 
                          className="mb-2"
                          value={currentData.companyInfo.address}
                          onChange={(e) => handleNestedChange('companyInfo', 'address', e.target.value)}
                        />
                        <Form.Control 
                          className="mb-1"
                          placeholder="Email"
                          value={currentData.companyInfo.email}
                          onChange={(e) => handleNestedChange('companyInfo', 'email', e.target.value)}
                        />
                        <Form.Control 
                          className="mb-1"
                          placeholder="Phone"
                          value={currentData.companyInfo.phone}
                          onChange={(e) => handleNestedChange('companyInfo', 'phone', e.target.value)}
                        />
                        <Form.Control 
                          placeholder="GSTIN"
                          value={currentData.companyInfo.gstin}
                          onChange={(e) => handleNestedChange('companyInfo', 'gstin', e.target.value)}
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="company-name text-primary mb-1">{currentData.companyInfo.name}</h2>
                        <p className="company-address text-muted mb-1">{currentData.companyInfo.address}</p>
                        <p className="company-contact text-muted small mb-0">
                          Email: {currentData.companyInfo.email} | 
                          Phone: {currentData.companyInfo.phone} | 
                          GSTIN: {currentData.companyInfo.gstin}
                        </p>
                      </>
                    )}
                  </Col>
                  <Col md={4} className="text-end">
                    <h3 className="invoice-title text-danger mb-2">PURCHASE INVOICE</h3>
                    <div className="invoice-meta bg-light p-2 rounded">
                      {isEditMode ? (
                        <div className="edit-control">
                          <div className="mb-1">
                            <strong>Invoice No:</strong>
                            <Form.Control 
                              size="sm"
                              value={displayInvoiceNumber}
                              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                            />
                          </div>
                          <div className="mb-1">
                            <strong>Purchase Date:</strong>
                            <Form.Control 
                              type="date"
                              size="sm"
                              value={currentData.invoiceDate}
                              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                            />
                          </div>
                          <div className="mb-0">
                            <strong>Due Date:</strong>
                            <Form.Control 
                              type="date"
                              size="sm"
                              value={currentData.validityDate}
                              onChange={(e) => handleInputChange('validityDate', e.target.value)}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mb-1"><strong>Invoice No:</strong> {displayInvoiceNumber}</p>
                          <p className="mb-1"><strong>Purchase Date:</strong> {new Date(currentData.invoiceDate).toLocaleDateString()}</p>
                          <p className="mb-0"><strong>Due Date:</strong> {new Date(currentData.validityDate).toLocaleDateString()}</p>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Supplier and Address Details */}
              <div className="address-section mb-4">
                <Row>
                  <Col md={6}>
                    <div className="billing-address bg-light p-3 rounded">
                      <h5 className="text-primary mb-2">Supplier:</h5>
                      {isEditMode ? (
                        <div className="edit-control">
                          <Form.Control 
                            className="mb-2"
                            value={currentData.supplierInfo.name}
                            onChange={(e) => handleNestedChange('supplierInfo', 'name', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            value={currentData.supplierInfo.businessName}
                            onChange={(e) => handleNestedChange('supplierInfo', 'businessName', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            placeholder="GSTIN"
                            value={currentData.supplierInfo.gstin || ''}
                            onChange={(e) => handleNestedChange('supplierInfo', 'gstin', e.target.value)}
                          />
                          <Form.Control 
                            placeholder="State"
                            value={currentData.supplierInfo.state || ''}
                            onChange={(e) => handleNestedChange('supplierInfo', 'state', e.target.value)}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="mb-1"><strong>{currentData.supplierInfo.name}</strong></p>
                          <p className="mb-1 text-muted">{currentData.supplierInfo.businessName}</p>
                          <p className="mb-1"><small>GSTIN: {currentData.supplierInfo.gstin || 'N/A'}</small></p>
                          <p className="mb-0"><small>State: {currentData.supplierInfo.state || 'N/A'}</small></p>
                        </>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="shipping-address bg-light p-3 rounded">
                      <h5 className="text-primary mb-2">Delivery Address:</h5>
                      {isEditMode ? (
                        <div className="edit-control">
                          <Form.Control 
                            className="mb-2"
                            placeholder="Address Line 1"
                            value={currentData.shippingAddress.addressLine1 || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'addressLine1', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            placeholder="Address Line 2"
                            value={currentData.shippingAddress.addressLine2 || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'addressLine2', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            placeholder="City"
                            value={currentData.shippingAddress.city || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'city', e.target.value)}
                          />
                          <Form.Control 
                            className="mb-2"
                            placeholder="Pincode"
                            value={currentData.shippingAddress.pincode || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'pincode', e.target.value)}
                          />
                          <Form.Control 
                            placeholder="State"
                            value={currentData.shippingAddress.state || ''}
                            onChange={(e) => handleNestedChange('shippingAddress', 'state', e.target.value)}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="mb-1">{currentData.shippingAddress.addressLine1 || 'N/A'}</p>
                          <p className="mb-1">{currentData.shippingAddress.addressLine2 || ''}</p>
                          <p className="mb-1">{currentData.shippingAddress.city || ''} - {currentData.shippingAddress.pincode || ''}</p>
                          <p className="mb-0">{currentData.shippingAddress.state || ''}</p>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Items Table */}
              <div className="items-section mb-4">
                <h6 className="text-primary mb-2">Purchase Items Details</h6>
                {isEditMode ? (
                  <Table bordered responsive size="sm" className="edit-control">
                    <thead className="table-dark">
                      <tr>
                        <th width="5%">#</th>
                        <th width="15%">Product</th>
                        <th width="20%">Description</th>
                        <th width="8%">Qty</th>
                        <th width="10%">Price</th>
                        <th width="8%">Discount %</th>
                        <th width="8%">GST %</th>
                        <th width="8%">CGST %</th>
                        <th width="8%">SGST %</th>
                        <th width="8%">IGST %</th>
                        <th width="12%">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td>
                            <Form.Control 
                              size="sm"
                              value={item.product}
                              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              size="sm"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.gst}
                              onChange={(e) => handleItemChange(index, 'gst', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.cgst}
                              onChange={(e) => handleItemChange(index, 'cgst', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.sgst}
                              onChange={(e) => handleItemChange(index, 'sgst', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control 
                              type="number"
                              size="sm"
                              value={item.igst}
                              onChange={(e) => handleItemChange(index, 'igst', e.target.value)}
                            />
                          </td>
                          <td className="text-end">₹{parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <table className="items-table table table-bordered table-sm">
                    <thead className="table-dark">
                      <tr>
                        <th width="5%">#</th>
                        <th width="15%">Product</th>
                        <th width="20%">Description</th>
                        <th width="6%">Qty</th>
                        <th width="10%">Price</th>
                        <th width="6%">Discount %</th>
                        <th width="6%">GST %</th>
                        <th width="6%">CGST %</th>
                        <th width="6%">SGST %</th>
                        <th width="6%">IGST %</th>
                        <th width="14%">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td>{item.product}</td>
                          <td>{item.description}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">₹{parseFloat(item.price).toFixed(2)}</td>
                          <td className="text-center">{item.discount}%</td>
                          <td className="text-center">{item.gst}%</td>
                          <td className="text-center">{item.cgst}%</td>
                          <td className="text-center">{item.sgst}%</td>
                          <td className="text-center">{item.igst}%</td>
                          <td className="text-end fw-bold">₹{parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                      {currentData.items.length === 0 && (
                        <tr>
                          <td colSpan="11" className="text-center text-muted py-3">
                            No items added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Totals Section */}
              <div className="totals-section mb-4">
                <Row>
                  <Col md={7}>
                    <div className="notes-section">
                      <h6 className="text-primary">Notes:</h6>
                      {isEditMode ? (
                        <Form.Control 
                          as="textarea"
                          rows={3}
                          value={currentData.note || ''}
                          onChange={(e) => handleInputChange('note', e.target.value)}
                          className="edit-control"
                        />
                      ) : (
                        <p className="bg-light p-2 rounded min-h-100">
                          {currentData.note || 'Purchase order details and special instructions.'}
                        </p>
                      )}
                      
                      <h6 className="text-primary mt-3">Transportation Details:</h6>
                      {isEditMode ? (
                        <Form.Control 
                          as="textarea"
                          rows={2}
                          value={currentData.transportDetails || ''}
                          onChange={(e) => handleInputChange('transportDetails', e.target.value)}
                          className="edit-control"
                        />
                      ) : (
                        <p className="bg-light p-2 rounded">
                          {currentData.transportDetails || 'Standard delivery. Contact supplier for tracking information.'}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col md={5}>
                    <div className="amount-breakdown bg-light p-3 rounded">
                      <h6 className="text-primary mb-3">Purchase Amount Summary</h6>
                      <table className="amount-table w-100">
                        <tbody>
                          <tr>
                            <td className="pb-2">Taxable Amount:</td>
                            <td className="text-end pb-2">₹{parseFloat(currentData.taxableAmount || 0).toFixed(2)}</td>
                          </tr>
                          
                          {isSameState ? (
                            <>
                              <tr>
                                <td className="pb-2">CGST ({gstBreakdown.totalCGST > 0 ? '9%' : '0%'}):</td>
                                <td className="text-end pb-2">₹{gstBreakdown.totalCGST}</td>
                              </tr>
                              <tr>
                                <td className="pb-2">SGST ({gstBreakdown.totalSGST > 0 ? '9%' : '0%'}):</td>
                                <td className="text-end pb-2">₹{gstBreakdown.totalSGST}</td>
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <td className="pb-2">IGST ({gstBreakdown.totalIGST > 0 ? '18%' : '0%'}):</td>
                              <td className="text-end pb-2">₹{gstBreakdown.totalIGST}</td>
                            </tr>
                          )}
                          
                          <tr>
                            <td className="pb-2">Total GST:</td>
                            <td className="text-end pb-2">₹{parseFloat(currentData.totalGST || 0).toFixed(2)}</td>
                          </tr>
                          
                          <tr>
                            <td className="pb-2">Total Cess:</td>
                            <td className="text-end pb-2">₹{parseFloat(currentData.totalCess || 0).toFixed(2)}</td>
                          </tr>
                          
                          {currentData.additionalCharge && (
                            <tr>
                              <td className="pb-2">{currentData.additionalCharge}:</td>
                              <td className="text-end pb-2">₹{parseFloat(currentData.additionalChargeAmount || 0).toFixed(2)}</td>
                            </tr>
                          )}
                          
                          <tr className="grand-total border-top pt-2">
                            <td><strong>Grand Total:</strong></td>
                            <td className="text-end"><strong className="text-success">₹{parseFloat(currentData.grandTotal || 0).toFixed(2)}</strong></td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div className="mt-3 p-2 border rounded">
                        <small className="text-muted">
                          <strong>Tax Summary: </strong>
                          {isSameState 
                            ? `CGST (${gstBreakdown.totalCGST > 0 ? '9%' : '0%'}) + SGST (${gstBreakdown.totalSGST > 0 ? '9%' : '0%'}) = ${parseFloat(currentData.totalGST || 0).toFixed(2)}`
                            : `IGST (${gstBreakdown.totalIGST > 0 ? '18%' : '0%'}) = ${parseFloat(currentData.totalGST || 0).toFixed(2)}`
                          }
                        </small>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

<Modal show={showVoucherModal} onHide={handleCloseVoucherModal} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Create Purchase Voucher</Modal.Title>
  </Modal.Header>
  <Modal.Body>  
    <div className="row mb-4">
      <div className="col-md-6">
        <div className="company-info-recepits-table text-center">
          <label className="form-label-recepits-table">Navkar Exports</label>
          <p>NO.63/603 AND 64/604, NEAR JAIN TEMPLE</p>
          <p>1ST MAIN ROAD, T DASARAHALLI</p>
          <p>GST : 29AAAMPC7994B1ZE</p>
          <p>Email: akshay555.ak@gmail.com</p>
          <p>Phone: 9880990431</p>
        </div>
      </div>
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">Voucher Number</label>
          <input
            type="text"
            className="form-control"
            name="voucherNumber"
            value={voucherFormData.voucherNumber}
            onChange={handleVoucherInputChange}
            placeholder="PV001"
            readOnly
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Voucher Date</label>
          <input
            type="date"
            className="form-control"
            name="voucherDate"
            value={voucherFormData.voucherDate}
            onChange={handleVoucherInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Payment Method</label>
          <select
            className="form-select"
            name="paymentMethod"
            value={voucherFormData.paymentMethod}
            onChange={handleVoucherInputChange}
          >
            <option>Direct Deposit</option>
            <option>Online Payment</option>
            <option>Credit/Debit Card</option>
            <option>Demand Draft</option>
            <option>Cheque</option>
            <option>Cash</option>
          </select>
        </div>
      </div>
    </div>
    <div className="row mb-4">
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">Supplier *</label>
          <input
            type="text"
            className="form-control"
            value={voucherFormData.supplierBusinessName || 'Auto-filled from invoice'}
            readOnly
            disabled
          />
          <small className="text-muted">Auto-filled from invoice</small>
        </div>
      </div>
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">Amount *</label>
          <div className="input-group custom-amount-receipts-table">
            <select
              className="form-select currency-select-receipts-table"
              name="currency"
              value={voucherFormData.currency}
              onChange={handleVoucherInputChange}
            >
              <option>INR</option>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
            <input
              type="number"
              className="form-control amount-input-receipts-table"
              name="amount"
              value={voucherFormData.amount}
              onChange={handleVoucherInputChange}
              placeholder="Amount"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
      </div>
    </div>
    <div className="row mb-4">
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">Note</label>
          <textarea
            className="form-control"
            rows="3"
            name="note"
            value={voucherFormData.note}
            onChange={handleVoucherInputChange}
            placeholder="Additional notes..."
          ></textarea>
        </div>
      </div>
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">For</label>
          <p className="mt-2">Authorised Signatory</p>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">Bank Name</label>
          <input
            type="text"
            className="form-control"
            name="bankName"
            value={voucherFormData.bankName}
            onChange={handleVoucherInputChange}
            placeholder="Bank Name"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Transaction Proof Document</label>
          <input type="file" className="form-control" />
          <small className="text-muted">No file chosen</small>
        </div>
      </div>
      <div className="col-md-6">
        <div className="mb-3">
          <label className="form-label">Transaction Date</label>
          <input
            type="date"
            className="form-control"
            name="transactionDate"
            value={voucherFormData.transactionDate}
            onChange={handleVoucherInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Reconciliation Option</label>
          <select
            className="form-select"
            name="reconciliationOption"
            value={voucherFormData.reconciliationOption}
            onChange={handleVoucherInputChange}
          >
            <option>Do Not Reconcile</option>
            <option>Customer Reconcile</option>
          </select>
        </div>
      </div>
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseVoucherModal}>
      Close
    </Button>
    <Button 
      variant="primary" 
      onClick={handleCreateVoucherFromInvoice}
      disabled={isCreatingVoucher}
    >
      {isCreatingVoucher ? 'Creating...' : 'Create Voucher'}
    </Button>
  </Modal.Footer>
</Modal>

              {/* Footer */}
              <div className="invoice-footer border-top pt-3">
                <Row>
                  <Col md={6}>
                    <div className="bank-details">
                      <h6 className="text-primary">Payment Details:</h6>
                      <div className="bg-light p-2 rounded">
                        <p className="mb-1">Payment Terms: Net 30 Days</p>
                        <p className="mb-1">Payment Method: Bank Transfer</p>
                        <p className="mb-0">Account: As per supplier details</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="text-end">
                    <div className="signature-section">
                      <p className="mb-2">Received By: {currentData.companyInfo.name}</p>
                      <div className="signature-space border-bottom mx-auto" style={{width: '200px', height: '40px'}}></div>
                      <p className="mt-2">Authorized Signatory</p>
                    </div>
                  </Col>
                </Row>
                <div className="terms-section mt-3 pt-2 border-top">
                  <p><strong className="text-primary">Purchase Terms & Conditions:</strong></p>
                  <ul className="small text-muted mb-0">
                    <li>Goods received are subject to quality inspection</li>
                    <li>Payment due within 30 days of invoice date</li>
                    <li>Defective goods will be returned at supplier's cost</li>
                    <li>All disputes subject to local jurisdiction</li>
                  </ul>
                </div>
              </div>
            </div>
          </Col>

       
           <Col lg={4} className="d-print-none no-print">
                      <PaymentStatus />
                    </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PurchasePDFPreview;