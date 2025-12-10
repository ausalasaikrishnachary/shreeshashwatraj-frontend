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
  const [localOrderMode, setLocalOrderMode] = useState("PAKKA");

  useEffect(() => {
    if (invoiceData && invoiceData.order_mode) {
      const mode = invoiceData.order_mode.toUpperCase();
      setLocalOrderMode(mode === "KACHA" ? "KACHA" : "PAKKA");
    }
  }, [invoiceData]);

  const calculateItemTaxableAmount = (item) => {
    if (item.taxable_amount !== undefined && item.taxable_amount !== null) {
      return parseFloat(item.taxable_amount) || 0;
    }
    
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };

  // Use actual CGST/SGST amounts from database
  const getItemCGSTAmount = (item) => {
    // First try to use actual value from database
    if (item.cgst_amount !== undefined && item.cgst_amount !== null) {
      return parseFloat(item.cgst_amount) || 0;
    }
    
    // Fallback: use percentage calculation if amount not available
    const taxableAmount = calculateItemTaxableAmount(item);
    const cgstRate = parseFloat(item.cgst) || 0;
    return taxableAmount * (cgstRate / 100);
  };

  const getItemSGSTAmount = (item) => {
    // First try to use actual value from database
    if (item.sgst_amount !== undefined && item.sgst_amount !== null) {
      return parseFloat(item.sgst_amount) || 0;
    }
    
    // Fallback: use percentage calculation if amount not available
    const taxableAmount = calculateItemTaxableAmount(item);
    const sgstRate = parseFloat(item.sgst) || 0;
    return taxableAmount * (sgstRate / 100);
  };

  const getItemGSTAmount = (item) => {
    // For KACHA mode, no GST
    if (localOrderMode === "KACHA") {
      return 0;
    }
    
    // Try to get actual tax_amount from database
    if (item.tax_amount !== undefined && item.tax_amount !== null) {
      return parseFloat(item.tax_amount) || 0;
    }
    
    // Fallback: calculate from CGST + SGST
    const cgstAmount = getItemCGSTAmount(item);
    const sgstAmount = getItemSGSTAmount(item);
    return cgstAmount + sgstAmount;
  };

  const calculateItemTotal = (item) => {
    const taxableAmount = calculateItemTaxableAmount(item);
    
    if (localOrderMode === "KACHA") {
      return taxableAmount;
    } else {
      const gst = parseFloat(item.gst) || 0;
      const taxAmount = taxableAmount * (gst / 100);
      return taxableAmount + taxAmount;
    }
  };
// Replace the existing calculateAdjustedGSTBreakdown function with this:
const calculateAdjustedGSTBreakdown = () => {
  if (!invoiceData || !invoiceData.items) return {
    totalTaxableAmount: "0.00",
    totalCGST: "0.00",
    totalSGST: "0.00", 
    totalIGST: "0.00",
    totalGST: "0.00"
  };
  
  let totalTaxableAmount = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalGST = 0;
  
  // Calculate from all items
  invoiceData.items.forEach(item => {
    // Calculate taxable amount for this item
    const taxableAmount = calculateItemTaxableAmount(item);
    totalTaxableAmount += taxableAmount;
    
    // Calculate GST for this item (only for PAKKA mode)
    if (localOrderMode === "PAKKA") {
      const cgstAmount = getItemCGSTAmount(item);
      const sgstAmount = getItemSGSTAmount(item);
      const gstAmount = getItemGSTAmount(item);
      
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
      totalGST += gstAmount;
    }
  });
  
  return {
    totalTaxableAmount: totalTaxableAmount.toFixed(2),
    totalCGST: localOrderMode === "PAKKA" ? totalCGST.toFixed(2) : "0.00",
    totalSGST: localOrderMode === "PAKKA" ? totalSGST.toFixed(2) : "0.00",
    totalIGST: "0.00",
    totalGST: localOrderMode === "PAKKA" ? totalGST.toFixed(2) : "0.00"
  };
};



  const adjustedGstBreakdown = calculateAdjustedGSTBreakdown();
  
  const getAdjustedTotals = () => {
    if (!invoiceData || !invoiceData.items) return {
      taxableAmount: "0.00",
      totalGST: "0.00",
      grandTotal: "0.00"
    };
    
    let totalTaxableAmount = 0;
    let totalGSTAmount = 0;
    let totalGrandTotal = 0;
    
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

  const handleOrderModeChange = (value) => {
    const normalizedValue = value.toUpperCase();
    setLocalOrderMode(normalizedValue);
    
    if (onOrderModeChange) {
      onOrderModeChange(normalizedValue);
    }
  };

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

      {/* Items Table - With GST Amount, CGST and SGST columns using DB values */}
      <div className="items-section mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="text-primary mb-0">Items Details</h6>
        </div>
        <div className="table-responsive">
          <table className="items-table table table-bordered mb-0">
            <thead className="table-dark">
              <tr>
                <th className="text-center" style={{ width: '3%' }}>#</th>
                <th style={{ width: '13%' }}>Product</th>
                <th style={{ width: '18%' }}>Description</th>
                <th className="text-center" style={{ width: '5%' }}>Qty</th>
                <th className="text-end" style={{ width: '9%' }}>Price</th>
                <th className="text-center" style={{ width: '6%' }}>GST %</th>
                <th className="text-end" style={{ width: '8%' }}>GST Amt</th>
                
                {/* CGST and SGST columns */}
                <th className="text-end" style={{ width: '8%' }}>CGST Amt</th>
                <th className="text-end" style={{ width: '8%' }}>SGST Amt</th>
                
                <th className="text-end" style={{ width: '10%' }}>Taxable Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => {
                const taxableAmount = calculateItemTaxableAmount(item);
                const gstAmount = getItemGSTAmount(item);
                const gstPercentage = localOrderMode === "KACHA" ? 0 : (parseFloat(item.gst) || 0);
                const cgstAmount = getItemCGSTAmount(item);
                const sgstAmount = getItemSGSTAmount(item);
                
                return (
                  <tr key={index}>
                    <td className="text-center align-middle">{index + 1}</td>
                    <td className="align-middle">
                      <div className="fw-medium">{item.product}</div>
                    </td>
                    <td className="align-middle">
                      {isEditing ? (
                        <Form.Control
                          as="textarea"
                          rows={1}
                          value={editableDescriptions[item.id || index] || item.description || ''}
                          onChange={(e) => onDescriptionChange(item.id || index, e.target.value)}
                          placeholder="Enter description..."
                          className="form-control-sm"
                        />
                      ) : (
                        <div className="small text-muted">{item.description || 'No description'}</div>
                      )}
                    </td>
                    <td className="text-center align-middle">{item.quantity}</td>
                    <td className="text-end align-middle">
                      <div className="fw-medium">₹{parseFloat(item.price).toFixed(2)}</div>
                    </td>
                    <td className="text-center align-middle">
                      <span className={`badge ${localOrderMode === "KACHA" ? "bg-secondary" : "bg-primary"}`}>
                        {localOrderMode === "KACHA" ? "0%" : `${gstPercentage}%`}
                      </span>
                    </td>
                    
                    {/* GST Amount Column - Using database value */}
                    <td className="text-end align-middle">
                      <div className="fw-medium">
                        {localOrderMode === "KACHA" ? "₹0.00" : `₹${gstAmount.toFixed(2)}`}
                      </div>
                    </td>
                    
                    {/* CGST Column - Using database value */}
                    <td className="text-end align-middle">
                      <div className="fw-medium">
                        {localOrderMode === "KACHA" ? "₹0.00" : `₹${cgstAmount.toFixed(2)}`}
                      </div>
                      {item.cgst && item.cgst > 0 && (
                        <div className="text-muted small">
                          {item.cgst}%
                        </div>
                      )}
                    </td>
                    
                    {/* SGST Column - Using database value */}
                    <td className="text-end align-middle">
                      <div className="fw-medium">
                        {localOrderMode === "KACHA" ? "₹0.00" : `₹${sgstAmount.toFixed(2)}`}
                      </div>
                      {item.sgst && item.sgst > 0 && (
                        <div className="text-muted small">
                          {item.sgst}%
                        </div>
                      )}
                    </td>
                    
                    <td className="text-end align-middle">
                      <div className="fw-bold text-primary">₹{taxableAmount.toFixed(2)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="table-active">
            
              {/* Add Total GST Row */}
              <tr>
                <td colSpan={9} className="text-end fw-bold">
                  Total GST:
                </td>
                <td className="text-end fw-bold text-success">
                  ₹{adjustedGstBreakdown.totalGST}
                </td>
              </tr>
              {/* Add Grand Total Row */}
              <tr>
                <td colSpan={9} className="text-end fw-bold">
                  Grand Total:
                </td>
                <td className="text-end fw-bold text-danger fs-5">
                  ₹{adjustedTotals.grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Totals Section */}
   {/* Totals Section */}
<div className="totals-section mb-4">
  <Row>
    <Col md={7}>
      {/* Notes section remains the same */}
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
          <div className="bg-light p-3 rounded min-h-100" style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
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
      <div className="amount-breakdown bg-light p-3 rounded border">
        <h6 className="text-primary mb-3 border-bottom pb-2">Amount Summary</h6>
        
     
        
        <table className="amount-table w-100">
          <tbody>
            {/* 1. Taxable Amount */}
            <tr>
              <td className="pb-2 pt-1">
                <strong>Taxable Amount:</strong>
              </td>
              <td className="text-end pb-2 pt-1">
                <strong>₹{adjustedGstBreakdown.totalTaxableAmount}</strong>
              </td>
            </tr>
            
            {/* 2. GST Breakdown - only show for PAKKA */}
            {localOrderMode === "PAKKA" && (
              <>
                {/* CGST */}
                <tr>
                  <td className="pb-1">
                    <span className="text-muted">CGST:</span>
                  </td>
                  <td className="text-end pb-1">
                    <span className="text-muted">₹{adjustedGstBreakdown.totalCGST}</span>
                  </td>
                </tr>
                
                {/* SGST */}
                <tr>
                  <td className="pb-2">
                    <span className="text-muted">SGST:</span>
                  </td>
                  <td className="text-end pb-2">
                    <span className="text-muted">₹{adjustedGstBreakdown.totalSGST}</span>
                  </td>
                </tr>
                
                {/* Total GST */}
                <tr>
                  <td className="pb-2 pt-1">
                    <strong>Total GST:</strong>
                  </td>
                  <td className="text-end pb-2 pt-1">
                    <strong className="text-success">₹{adjustedGstBreakdown.totalGST}</strong>
                  </td>
                </tr>
              </>
            )}
            
            {/* 3. Grand Total with clear separation */}
            <tr className="border-top">
              <td className="pt-3">
                <strong className="fs-5">Grand Total:</strong>
              </td>
              <td className="text-end pt-3">
                <strong className={`fs-5 ${localOrderMode === "KACHA" ? "text-primary" : "text-success"}`}>
                  ₹{adjustedTotals.grandTotal}
                </strong>
              </td>
            </tr>
            
            {/* Show calculation breakdown in small text */}
            <tr>
              <td colSpan={2} className="pt-1">
                <small className="text-muted">
                  {localOrderMode === "KACHA" ? 
                    "Taxable Amount = Grand Total (No GST)" : 
                    `Taxable Amount (₹${adjustedGstBreakdown.totalTaxableAmount}) + GST (₹${adjustedGstBreakdown.totalGST}) = Grand Total`
                  }
                </small>
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