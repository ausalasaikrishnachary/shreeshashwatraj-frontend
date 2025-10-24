import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import './InvoicePDFPreview.css';
import { FaPrint, FaFilePdf, FaEdit, FaSave, FaTimes, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import html2pdf from 'html2pdf.js';

const InvoicePDFPreview = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    // Load invoice data from localStorage
    const savedData = localStorage.getItem('previewInvoice');
    if (savedData) {
      const data = JSON.parse(savedData);
      setInvoiceData(data);
      setEditedData(data);
      
      // Extract invoice number from the data
      if (data.invoiceNumber) {
        setInvoiceNumber(data.invoiceNumber);
      } else {
        // Fallback: try to get from localStorage or generate default
        const draftData = localStorage.getItem('draftInvoice');
        if (draftData) {
          const draft = JSON.parse(draftData);
          setInvoiceNumber(draft.invoiceNumber || 'INV001');
        } else {
          setInvoiceNumber('INV001');
        }
      }
    } else {
      // If no data, try to load from draft
      const draftData = localStorage.getItem('draftInvoice');
      if (draftData) {
        const draft = JSON.parse(draftData);
        setInvoiceData(draft);
        setEditedData(draft);
        setInvoiceNumber(draft.invoiceNumber || 'INV001');
        // Also save to preview for consistency
        localStorage.setItem('previewInvoice', draftData);
      } else {
        // If no data, redirect back to create invoice
        window.location.href = '/sales/create-invoice';
      }
    }
  }, [navigate]);

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
      const filename = `Invoice_${displayInvoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // PDF configuration
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
          height: element.scrollHeight
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Create a clone of the element to avoid affecting the original
      const clone = element.cloneNode(true);
      
      // Remove edit mode elements and action buttons from clone
      const editElements = clone.querySelectorAll('.d-print-none, .btn, .alert, .action-bar, .tax-indicator');
      editElements.forEach(el => el.remove());
      
      // Ensure all content is visible for PDF
      const hiddenElements = clone.querySelectorAll('[style*="display: none"], .d-none');
      hiddenElements.forEach(el => {
        el.style.display = 'block';
      });
      
      // Add print-specific styles
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          .invoice-pdf-preview {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          .table-dark {
            background-color: #343a40 !important;
            color: white !important;
          }
          .bg-light {
            background-color: #f8f9fa !important;
          }
          .text-primary {
            color: #007bff !important;
          }
          .text-danger {
            color: #dc3545 !important;
          }
          .text-success {
            color: #28a745 !important;
          }
          .border {
            border: 1px solid #dee2e6 !important;
          }
        }
        body {
          font-family: Arial, sans-serif;
        }
        .invoice-pdf-preview {
          width: 100%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .text-end {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
      `;
      clone.appendChild(style);

      // Generate PDF
      await html2pdf().set(opt).from(clone).save();
      
      setDownloading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again or use the Print option.');
      setDownloading(false);
    }
  };

  // Alternative PDF download method using window.print for fallback
  const handleDownloadPDFFallback = () => {
    const printWindow = window.open('', '_blank');
    const element = invoiceRef.current;
    
    if (!element) {
      alert("Invoice content not found.");
      return;
    }

    const clone = element.cloneNode(true);
    
    // Remove edit mode elements
    const editElements = clone.querySelectorAll('.d-print-none, .btn, .alert, .action-bar, .tax-indicator');
    editElements.forEach(el => el.remove());
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${displayInvoiceNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #000;
          }
          .invoice-pdf-preview {
            max-width: 100%;
          }
          .header { 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 20px; 
          }
          .company-name { 
            color: #007bff; 
            margin-bottom: 5px; 
          }
          .invoice-title { 
            color: #dc3545; 
            margin-bottom: 10px; 
          }
          .invoice-meta { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
          }
          .bg-light { 
            background-color: #f8f9fa !important; 
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
          }
          .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          .table th { 
            background-color: #343a40 !important; 
            color: white; 
          }
          .table-dark th {
            background-color: #343a40 !important;
            color: white;
          }
          .text-end { text-align: right; }
          .text-center { text-align: center; }
          .border { border: 1px solid #dee2e6; }
          .rounded { border-radius: 5px; }
          .p-2 { padding: 10px; }
          .p-3 { padding: 15px; }
          .p-4 { padding: 20px; }
          .mb-1 { margin-bottom: 5px; }
          .mb-2 { margin-bottom: 10px; }
          .mb-3 { margin-bottom: 15px; }
          .mb-4 { margin-bottom: 20px; }
          .mt-2 { margin-top: 10px; }
          .mt-3 { margin-top: 15px; }
          .pb-2 { padding-bottom: 10px; }
          .pt-2 { padding-top: 10px; }
          .pt-3 { padding-top: 15px; }
          .border-top { border-top: 1px solid #dee2e6; }
          .border-bottom { border-bottom: 1px solid #dee2e6; }
          .fw-bold { font-weight: bold; }
          .text-primary { color: #007bff; }
          .text-danger { color: #dc3545; }
          .text-success { color: #28a745; }
          .text-muted { color: #6c757d; }
          .small { font-size: 0.875em; }
          .row { display: flex; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; }
          .col-md-6 { flex: 0 0 50%; max-width: 50%; padding: 0 15px; }
          .col-md-7 { flex: 0 0 58.333333%; max-width: 58.333333%; padding: 0 15px; }
          .col-md-5 { flex: 0 0 41.666667%; max-width: 41.666667%; padding: 0 15px; }
          .col-md-8 { flex: 0 0 66.666667%; max-width: 66.666667%; padding: 0 15px; }
          .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; padding: 0 15px; }
          @media print {
            body { margin: 0; }
            .invoice-pdf-preview { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Save changes
      setInvoiceData(editedData);
      localStorage.setItem('previewInvoice', JSON.stringify(editedData));
      localStorage.setItem('draftInvoice', JSON.stringify(editedData));
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
    
    // Update invoice number separately if it's being changed
    if (field === 'invoiceNumber') {
      setInvoiceNumber(value);
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
    
    // Recalculate item total
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
    
    // Recalculate totals
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

  const handleBackToCreate = () => {
    // Save current edits back to draft
    localStorage.setItem('draftInvoice', JSON.stringify(editedData));
    // Close this tab and return to create invoice
    window.close();
  };

  // Calculate CGST and SGST totals from items
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
          <p className="mt-3">Loading invoice data...</p>
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

  // Get the current invoice number to display
  const displayInvoiceNumber = currentData.invoiceNumber || invoiceNumber || 'INV001';

  return (
    <div className="invoice-preview-page">
      {/* Action Bar */}
      <div className="action-bar bg-white shadow-sm p-3 mb-3 sticky-top d-print-none">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Invoice Preview - {displayInvoiceNumber}</h4>
            <div>
              {!isEditMode ? (
                <>
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
                  <Button variant="secondary" onClick={handleBackToCreate}>
                    <FaArrowLeft className="me-1" /> Back to Create
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
        <div className="tax-indicator mb-3 d-print-none">
          <Container fluid>
            <div className={`alert ${isSameState ? 'alert-success' : 'alert-warning'} mb-0`}>
              <strong>Tax Type: </strong>
              {isSameState ? (
                <>CGST & SGST (Same State - {currentData.companyInfo.state} to {currentData.supplierInfo.state})</>
              ) : (
                <>IGST (Inter-State: {currentData.companyInfo.state} to {currentData.supplierInfo.state})</>
              )}
            </div>
          </Container>
        </div>
      )}

      {/* Invoice Content */}
      <Container fluid className="invoice-preview-container">
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
                  <>
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
                  </>
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
                <h3 className="invoice-title text-danger mb-2">TAX INVOICE</h3>
                <div className="invoice-meta bg-light p-2 rounded">
                  {isEditMode ? (
                    <>
                      <div className="mb-1">
                        <strong>Invoice No:</strong>
                        <Form.Control 
                          size="sm"
                          value={displayInvoiceNumber}
                          onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                        />
                      </div>
                      <div className="mb-1">
                        <strong>Invoice Date:</strong>
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
                    </>
                  ) : (
                    <>
                      <p className="mb-1"><strong>Invoice No:</strong> {displayInvoiceNumber}</p>
                      <p className="mb-1"><strong>Invoice Date:</strong> {new Date(currentData.invoiceDate).toLocaleDateString()}</p>
                      <p className="mb-0"><strong>Due Date:</strong> {new Date(currentData.validityDate).toLocaleDateString()}</p>
                    </>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* Rest of your invoice content remains exactly the same */}
          {/* Supplier and Address Details */}
          <div className="address-section mb-4">
            <Row>
              <Col md={6}>
                <div className="billing-address bg-light p-3 rounded">
                  <h5 className="text-primary mb-2">Bill To:</h5>
                  {isEditMode ? (
                    <>
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
                    </>
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
                  <h5 className="text-primary mb-2">Ship To:</h5>
                  {isEditMode ? (
                    <>
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
                    </>
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
            <h6 className="text-primary mb-2">Items Details</h6>
            {isEditMode ? (
              <Table bordered responsive size="sm">
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
                    />
                  ) : (
                    <p className="bg-light p-2 rounded min-h-100">
                      {currentData.note || 'Thank you for your business! We appreciate your timely payment.'}
                    </p>
                  )}
                  
                  <h6 className="text-primary mt-3">Transportation Details:</h6>
                  {isEditMode ? (
                    <Form.Control 
                      as="textarea"
                      rows={2}
                      value={currentData.transportDetails || ''}
                      onChange={(e) => handleInputChange('transportDetails', e.target.value)}
                    />
                  ) : (
                    <p className="bg-light p-2 rounded">
                      {currentData.transportDetails || 'Standard delivery. Contact us for tracking information.'}
                    </p>
                  )}
                </div>
              </Col>
              <Col md={5}>
                <div className="amount-breakdown bg-light p-3 rounded">
                  <h6 className="text-primary mb-3">Amount Summary</h6>
                  <table className="amount-table w-100">
                    <tbody>
                      <tr>
                        <td className="pb-2">Taxable Amount:</td>
                        <td className="text-end pb-2">₹{parseFloat(currentData.taxableAmount || 0).toFixed(2)}</td>
                      </tr>
                      
                      {/* Show CGST/SGST for same state, IGST for different state */}
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
                  
                  {/* Tax Type Summary */}
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

          {/* Footer */}
          <div className="invoice-footer border-top pt-3">
            <Row>
              <Col md={6}>
                <div className="bank-details">
                  <h6 className="text-primary">Bank Details:</h6>
                  <div className="bg-light p-2 rounded">
                    <p className="mb-1">Account Name: {currentData.companyInfo.name}</p>
                    <p className="mb-1">Account Number: XXXX XXXX XXXX</p>
                    <p className="mb-1">IFSC Code: XXXX0123456</p>
                    <p className="mb-0">Bank Name: Sample Bank</p>
                  </div>
                </div>
              </Col>
              <Col md={6} className="text-end">
                <div className="signature-section">
                  <p className="mb-2">For {currentData.companyInfo.name}</p>
                  <div className="signature-space border-bottom mx-auto" style={{width: '200px', height: '40px'}}></div>
                  <p className="mt-2">Authorized Signatory</p>
                </div>
              </Col>
            </Row>
            <div className="terms-section mt-3 pt-2 border-top">
              <p><strong className="text-primary">Terms & Conditions:</strong></p>
              <ul className="small text-muted mb-0">
                <li>Payment due within 30 days of invoice date</li>
                <li>Late payment interest @ 1.5% per month</li>
                <li>Goods once sold will not be taken back</li>
                <li>All disputes subject to local jurisdiction</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default InvoicePDFPreview;