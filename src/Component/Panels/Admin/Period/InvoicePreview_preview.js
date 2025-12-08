import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';

const InvoicePreview_preview = ({
  invoiceData,
  isEditing,
  editableNote,
  editableDescriptions,
  onNoteChange,
  onDescriptionChange,
  gstBreakdown,
  isSameState,
  onOrderModeChange
}) => {
  // Use local state for dropdown to make it immediately responsive
  const [localOrderMode, setLocalOrderMode] = useState("PAKKA");

  // Initialize when invoiceData changes
  useEffect(() => {
    if (invoiceData && invoiceData.order_mode) {
      const mode = invoiceData.order_mode.toUpperCase();
      setLocalOrderMode(mode === "KACHA" ? "KACHA" : "PAKKA");
    }
  }, [invoiceData]);

  // Calculate item taxable amount based on database values or calculate it
  const calculateItemTaxableAmount = (item) => {
    // First try to get from item.taxable_amount (from database)
    if (item.taxable_amount !== undefined && item.taxable_amount !== null) {
      return parseFloat(item.taxable_amount) || 0;
    }
    
    // If not available, calculate it
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };

  // Calculate item total based on order mode
  const calculateItemTotal = (item) => {
    const taxableAmount = calculateItemTaxableAmount(item);
    
    if (localOrderMode === "KACHA") {
      // For KACHA mode, GST should be 0, so total = taxable amount
      return taxableAmount;
    } else {
      // For PAKKA mode, use item.total or calculate with GST
      const gst = parseFloat(item.gst) || 0;
      const taxAmount = taxableAmount * (gst / 100);
      return taxableAmount + taxAmount;
    }
  };

  // Calculate GST breakdown based on order mode
  const calculateAdjustedGSTBreakdown = () => {
    if (!invoiceData || !invoiceData.items) return {
      totalCGST: "0.00",
      totalSGST: "0.00", 
      totalIGST: "0.00",
      totalGST: "0.00"
    };
    
    if (localOrderMode === "KACHA") {
      return {
        totalCGST: "0.00",
        totalSGST: "0.00", 
        totalIGST: "0.00",
        totalGST: "0.00"
      };
    }
    
    // Calculate totals from all items
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalGST = 0;
    
    invoiceData.items.forEach(item => {
      const taxableAmount = calculateItemTaxableAmount(item);
      const cgstRate = parseFloat(item.cgst) || 0;
      const sgstRate = parseFloat(item.sgst) || 0;
      const igstRate = parseFloat(item.igst) || 0;
      const gstRate = parseFloat(item.gst) || 0;
      
      totalCGST += taxableAmount * (cgstRate / 100);
      totalSGST += taxableAmount * (sgstRate / 100);
      totalIGST += taxableAmount * (igstRate / 100);
      totalGST += taxableAmount * (gstRate / 100);
    });
    
    return {
      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalIGST: totalIGST.toFixed(2),
      totalGST: totalGST.toFixed(2)
    };
  };

  const adjustedGstBreakdown = calculateAdjustedGSTBreakdown();
  
  // Calculate adjusted totals based on order mode by SUMMING ALL ITEMS
  const getAdjustedTotals = () => {
    if (!invoiceData || !invoiceData.items) return {
      taxableAmount: "0.00",
      totalGST: "0.00",
      grandTotal: "0.00"
    };
    
    let totalTaxableAmount = 0;
    let totalGSTAmount = 0;
    let totalGrandTotal = 0;
    
    // Sum up all items
    invoiceData.items.forEach(item => {
      const taxableAmount = calculateItemTaxableAmount(item);
      const itemTotal = calculateItemTotal(item);
      
      totalTaxableAmount += taxableAmount;
      
      if (localOrderMode === "KACHA") {
        totalGSTAmount += 0;
        totalGrandTotal += taxableAmount;
      } else {
        const gst = parseFloat(item.gst) || 0;
        const taxAmount = taxableAmount * (gst / 100);
        totalGSTAmount += taxAmount;
        totalGrandTotal += itemTotal;
      }
    });
    
    return {
      taxableAmount: totalTaxableAmount.toFixed(2),
      totalGST: totalGSTAmount.toFixed(2),
      grandTotal: totalGrandTotal.toFixed(2)
    };
  };

  const adjustedTotals = getAdjustedTotals();

  // Handle dropdown change
  const handleOrderModeChange = (value) => {
    const normalizedValue = value.toUpperCase();
    setLocalOrderMode(normalizedValue);
    
    // Call parent handler if provided
    if (onOrderModeChange) {
      onOrderModeChange(normalizedValue);
    }
  };

  // Return null if no invoiceData - MUST BE AFTER HOOKS
  if (!invoiceData) return null;

  return (
    <div className="invoice-pdf-preview bg-white p-4 shadow-sm" id="invoice-pdf-content">
      {/* Header */}
      <div className="invoice-header border-bottom pb-3 mb-3">
        <Row>
          <Col md={8}>
            <h2 className="company-name text-primary mb-1">{invoiceData.companyInfo.name}</h2>
            <p className="company-address text-muted mb-1">{invoiceData.companyInfo.address}</p>
            <p className="company-contact text-muted small mb-0">
              Email: {invoiceData.companyInfo.email} | 
              Phone: {invoiceData.companyInfo.phone} | 
              GSTIN: {invoiceData.companyInfo.gstin}
            </p>
          </Col>
          
          <Col md={4} className="text-end">
            <h3 className="invoice-title text-danger mb-2">TAX INVOICE</h3>
            <div className="invoice-meta bg-light p-2 rounded">
              <p className="mb-1"><strong>Invoice No:</strong> {invoiceData.invoiceNumber}</p>
              <p className="mb-1"><strong>Invoice Date:</strong> {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
              <p className="mb-0"><strong>Due Date:</strong> {new Date(invoiceData.validityDate).toLocaleDateString()}</p>
            </div>
          </Col>
        </Row>
      </div>

      {/* Address Section */}
      <div className="address-section mb-4">
        <Row>
          <Col md={6}>
            <div className="billing-address bg-light p-3 rounded">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="text-primary mb-0">Bill To:</h5>
              </div>
              
              <p className="mb-1"><strong>{invoiceData.supplierInfo.name}</strong></p>
              <p className="mb-1 text-muted">{invoiceData.supplierInfo.businessName}</p>
              <p className="mb-1"><small>GSTIN: {invoiceData.supplierInfo.gstin || 'N/A'}</small></p>
              <p className="mb-1"><small>State: {invoiceData.supplierInfo.state || 'N/A'}</small></p>
              <p className="mb-1"><small>Email: {invoiceData.supplierInfo.email || 'N/A'}</small></p>
            </div>
            
            {/* Order Mode Dropdown */}
            <div className="order-mode-section mt-3">
              <div className="order-mode-dropdown" style={{ width: "280px" }}>
                <Form.Group controlId="orderMode" className="mb-0">
                  <div className="d-flex align-items-center">
                    <Form.Label className="mb-0 me-2" style={{ minWidth: "100px" }}>
                      <strong>Order Type:</strong>
                    </Form.Label>
                    <Form.Select 
                      value={localOrderMode}
                      onChange={(e) => handleOrderModeChange(e.target.value)}
                      size="sm"
                      className="flex-grow-1"
                    >
                      <option value="PAKKA">PAKKA</option>
                      <option value="KACHA">KACHA</option>
                    </Form.Select>
                  </div>
                  <div className="mt-1">
                    <small className={localOrderMode === "KACHA" ? "text-danger" : "text-success"}>
                      {localOrderMode === "KACHA" ? "No GST applicable" : "GST applicable as per item rates"}
                    </small>
                  </div>
                </Form.Group>
              </div>
            </div>
          </Col>
          
          <Col md={6}>
            <div className="shipping-address bg-light p-3 rounded">
              <h5 className="text-primary mb-2">Ship To:</h5>
              <p className="mb-1">{invoiceData.shippingAddress.addressLine1 || 'N/A'}</p>
              <p className="mb-1">{invoiceData.shippingAddress.addressLine2 || ''}</p>
              <p className="mb-1">{invoiceData.shippingAddress.city || ''} - {invoiceData.shippingAddress.pincode || ''}</p>
              <p className="mb-0">{invoiceData.shippingAddress.state || ''}, {invoiceData.shippingAddress.country || 'India'}</p>
              {invoiceData.shippingAddress.gstin && (
                <p className="mb-0 mt-1"><small>Shipping GSTIN: {invoiceData.shippingAddress.gstin}</small></p>
              )}
            </div>
            
            {invoiceData.assigned_staff && invoiceData.assigned_staff !== 'N/A' && (
              <div className="assigned-staff-section mt-3 p-2 bg-light rounded flex-start">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Sales Person:</span>
                  <strong className="text-primary">{invoiceData.assigned_staff}</strong>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* Items Table */}
      <div className="items-section mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="text-primary mb-0">Items Details</h6>
        </div>
        <table className="items-table table table-bordered table-sm">
          <thead className="table-dark">
            <tr>
              <th width="5%">#</th>
              <th width="20%">Product</th>
              <th width="25%">Description</th>
              <th width="10%">Qty</th>
              <th width="15%">Price</th>
              <th width="10%">GST %</th>
              <th width="10%">Taxable Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => {
              // Calculate item values
              const taxableAmount = calculateItemTaxableAmount(item);
              const itemTotal = calculateItemTotal(item);
              const gstPercentage = localOrderMode === "KACHA" ? 0 : (parseFloat(item.gst) || 0);
              
              return (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td>{item.product}</td>
                  <td>
                    {isEditing ? (
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={editableDescriptions[item.id || index] || item.description || ''}
                        onChange={(e) => onDescriptionChange(item.id || index, e.target.value)}
                        placeholder="Enter description..."
                      />
                    ) : (
                      item.description || 'No description'
                    )}
                  </td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">₹{parseFloat(item.price).toFixed(2)}</td>
                  <td className="text-center">
                    {localOrderMode === "KACHA" ? "0%" : `${gstPercentage}%`}
                  </td>
                  <td className="text-end fw-bold">
                    ₹{taxableAmount.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Add a total row at the bottom of the table */}
          <tfoot>
            <tr className="table-secondary">
              <td colSpan="6" className="text-end fw-bold">Total Taxable Amount:</td>
              <td className="text-end fw-bold text-primary">
                ₹{adjustedTotals.taxableAmount}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Totals Section */}
      <div className="totals-section mb-4">
        <Row>
          <Col md={7}>
            <div className="notes-section">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-primary">Notes:</h6>
              </div>
              
              {isEditing ? (
                <div className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editableNote}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="Enter note..."
                  />
                </div>
              ) : (
                <div className="bg-light p-3 rounded min-h-100" style={{ whiteSpace: 'pre-wrap' }}>
                  {invoiceData.note || 'No note added'}
                </div>
              )}
              
              <h6 className="text-primary mt-3">Transportation Details:</h6>
              <p className="bg-light p-2 rounded">
                {invoiceData.transportDetails}
              </p>
            </div>
          </Col>
          <Col md={5}>
            <div className="amount-breakdown bg-light p-3 rounded">
              <h6 className="text-primary mb-3">Amount Summary</h6>
              <table className="amount-table w-100">
                <tbody>
                  <tr>
                    <td className="pb-2">Taxable Amount:</td>
                    <td className="text-end pb-2">₹{adjustedTotals.taxableAmount}</td>
                  </tr>
                  
                  {localOrderMode === "KACHA" ? (
                    <tr>
                      <td className="pb-2 text-muted">GST (KACHA):</td>
                      <td className="text-end pb-2 text-muted">₹0.00</td>
                    </tr>
                  ) : isSameState ? (
                    <>
                      <tr>
                        <td className="pb-2">CGST:</td>
                        <td className="text-end pb-2">₹{adjustedGstBreakdown.totalCGST}</td>
                      </tr>
                      <tr>
                        <td className="pb-2">SGST:</td>
                        <td className="text-end pb-2">₹{adjustedGstBreakdown.totalSGST}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td className="pb-2">IGST:</td>
                      <td className="text-end pb-2">₹{adjustedGstBreakdown.totalIGST}</td>
                    </tr>
                  )}
                  
                  {localOrderMode === "KACHA" ? (
                    <tr>
                      <td className="pb-2 text-danger">Total GST (KACHA):</td>
                      <td className="text-end pb-2 text-danger">₹0.00</td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="pb-2">Total GST:</td>
                      <td className="text-end pb-2">₹{adjustedTotals.totalGST}</td>
                    </tr>
                  )}
                  
                  <tr className="grand-total border-top pt-2">
                    <td><strong>Grand Total:</strong></td>
                    <td className="text-end">
                      <strong className={localOrderMode === "KACHA" ? "text-primary" : "text-success"}>
                        ₹{adjustedTotals.grandTotal}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                <p className="mb-1">Account Name: {invoiceData.companyInfo.name}</p>
                <p className="mb-1">Account Number: XXXX XXXX XXXX</p>
                <p className="mb-1">IFSC Code: XXXX0123456</p>
                <p className="mb-0">Bank Name: Sample Bank</p>
              </div>
            </div>
          </Col>
          <Col md={6} className="text-end">
            <div className="signature-section">
              <p className="mb-2">For {invoiceData.companyInfo.name}</p>
              <div className="signature-space border-bottom mx-auto" style={{width: '200px', height: '40px'}}></div>
              <p className="mt-2">Authorized Signatory</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default InvoicePreview_preview;