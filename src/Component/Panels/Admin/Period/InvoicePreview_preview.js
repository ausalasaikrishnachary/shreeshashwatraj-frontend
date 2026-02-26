import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { baseurl } from "../../../BaseURL/BaseURL";
import axios from "axios";

const InvoicePreview_preview = ({
  invoiceData,
  isEditing,
  editableNote,
  editableDescriptions,
  onNoteChange,
  onDescriptionChange,
  gstBreakdown,
  isSameState,
  onOrderModeChange,
  periodInvoiceData // Add this prop to get original order items
}) => {
  const [localOrderMode, setLocalOrderMode] = useState("PAKKA");
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [updatedItems, setUpdatedItems] = useState([]);

  // Fetch all products on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await axios.get(`${baseurl}/products`);
        setAllProducts(response.data || []);
        console.log("📦 All products loaded:", response.data?.length);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchAllProducts();
  }, []);

  // Initialize with invoiceData
  useEffect(() => {
    if (invoiceData) {
      const mode = invoiceData.order_mode?.toUpperCase() || "PAKKA";
      setLocalOrderMode(mode);
      
      // Initialize items
      if (invoiceData.items) {
        setUpdatedItems(invoiceData.items);
      }
    }
  }, [invoiceData]);

  // Function to find matching product variant
  const findProductVariant = (currentProductName, targetProductType) => {
    if (!allProducts || allProducts.length === 0) return null;
    
    // Find product by goods_name and product_type
    return allProducts.find(product => 
      product.goods_name === currentProductName && 
      product.product_type?.toUpperCase() === targetProductType.toUpperCase()
    );
  };

  // Function to switch product variant for an item
  const switchItemVariant = (item, newProductType) => {
    if (!item.product) return item;
    
    // Find matching variant
    const variant = findProductVariant(item.product, newProductType);
    
    if (variant) {
      console.log(`🔄 Switching ${item.product} from ${item.product_type || 'N/A'} to ${newProductType}`, {
        oldId: item.product_id,
        newId: variant.id
      });
      
      // Return updated item with new product details
      return {
        ...item,
        product_id: variant.id,
        product_type: variant.product_type,
        ...(newProductType.toUpperCase() === "KACHA" ? {
          gst: 0,
          cgst: 0,
          sgst: 0,
          tax_amount: 0,
          cgst_amount: 0,
          sgst_amount: 0
        } : {})
      };
    }
    
    return item;
  };

// In InvoicePreview_preview component - modify handleOrderModeChange:
const handleOrderModeChange = async (value) => {
  const normalizedValue = value.toUpperCase();
  
  if (normalizedValue !== localOrderMode) {
    console.log(`🔄 Switching order mode from ${localOrderMode} to ${normalizedValue}`);
    
    if (updatedItems.length > 0 && allProducts.length > 0) {
      // Switch product variants for all items
      const newItems = updatedItems.map(item => 
        switchItemVariant(item, normalizedValue)
      );
      
      setUpdatedItems(newItems);
      
      // Notify parent with updated items containing new product_ids
      if (onOrderModeChange) {
        onOrderModeChange({
          orderMode: normalizedValue,
          updatedItems: newItems // Pass items with updated product_ids
        });
      }
    } else {
      // Just pass the order mode
      if (onOrderModeChange) {
        onOrderModeChange({
          orderMode: normalizedValue,
          updatedItems: []
        });
      }
    }
    
    setLocalOrderMode(normalizedValue);
  }
};

  // Get taxable amount PER UNIT from database
  const getTaxableAmountPerUnit = (item) => {
    if (item.taxable_amount !== undefined && item.taxable_amount !== null) {
      return parseFloat(item.taxable_amount) || 0;
    }
    return 0;
  };

const getNetPricePerUnit = (item) => {
  if (item.net_price !== undefined && item.net_price !== null) {
    const netPrice = parseFloat(item.net_price);
    if (!isNaN(netPrice) && netPrice > 0) {
      console.log(`📊 Using net_price: ${netPrice} for ${item.product || item.item_name}`);
      return netPrice;
    } else {
      console.log(`⚠️ net_price found but invalid: ${item.net_price} for ${item.product || item.item_name}`);
    }
  }
  
  console.log(`❌ No valid net_price found for ${item.product || item.item_name}, returning 0`);
  return 0;
};
  // Get total taxable amount (PER UNIT × QUANTITY)
  const getItemTotalTaxableAmount = (item) => {
    const taxablePerUnit = getTaxableAmountPerUnit(item);
    const quantity = parseFloat(item.quantity) || 1;
    return taxablePerUnit * quantity;
  };

  // Get GST amount PER UNIT from database
  const getGSTAmountPerUnit = (item) => {
    if (item.tax_amount !== undefined && item.tax_amount !== null) {
      return parseFloat(item.tax_amount) || 0;
    }
    if (item.gst && item.taxable_amount) {
      const gstPercentage = parseFloat(item.gst) || 0;
      const taxablePerUnit = getTaxableAmountPerUnit(item);
      return (taxablePerUnit * gstPercentage) / 100;
    }
    return 0;
  };

  // Get total GST amount (PER UNIT × QUANTITY)
  const getItemTotalGSTAmount = (item) => {
    if (localOrderMode === "KACHA") {
      return 0;
    }
    
    const gstPerUnit = getGSTAmountPerUnit(item);
    const quantity = parseFloat(item.quantity) || 1;
    return gstPerUnit * quantity;
  };

  // Get CGST amount PER UNIT from database
  const getCGSTAmountPerUnit = (item) => {
    if (item.cgst_amount !== undefined && item.cgst_amount !== null) {
      return parseFloat(item.cgst_amount) || 0;
    }
    const gstPerUnit = getGSTAmountPerUnit(item);
    return gstPerUnit / 2;
  };

  // Get total CGST amount (PER UNIT × QUANTITY)
  const getItemTotalCGSTAmount = (item) => {
    const cgstPerUnit = getCGSTAmountPerUnit(item);
    const quantity = parseFloat(item.quantity) || 1;
    return cgstPerUnit * quantity;
  };

  // Get SGST amount PER UNIT from database
  const getSGSTAmountPerUnit = (item) => {
    if (item.sgst_amount !== undefined && item.sgst_amount !== null) {
      return parseFloat(item.sgst_amount) || 0;
    }
    const gstPerUnit = getGSTAmountPerUnit(item);
    return gstPerUnit / 2;
  };

  // Get total SGST amount (PER UNIT × QUANTITY)
  const getItemTotalSGSTAmount = (item) => {
    const sgstPerUnit = getSGSTAmountPerUnit(item);
    const quantity = parseFloat(item.quantity) || 1;
    return sgstPerUnit * quantity;
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    if (localOrderMode === "KACHA") {
      return getItemTotalTaxableAmount(item);
    } else {
      const taxableAmount = getItemTotalTaxableAmount(item);
      const gstAmount = getItemTotalGSTAmount(item);
      return taxableAmount + gstAmount;
    }
  };

  // Calculate adjusted GST breakdown
  const calculateAdjustedGSTBreakdown = () => {
    const itemsToUse = updatedItems.length > 0 ? updatedItems : (invoiceData?.items || []);
    
    if (!itemsToUse || itemsToUse.length === 0) return {
      totalTaxableAmount: "0.00",
      totalCGST: "0.00",
      totalSGST: "0.00", 
      totalIGST: "0.00",
      totalGST: "0.00",
      totalItemsTotalAmount: "0.00",
      grandTotal: "0.00"
    };
    
    let totalTaxableAmount = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalGST = 0;
    let totalItemsTotalAmount = 0;
    let grandTotal = 0;
    
    itemsToUse.forEach(item => {
      const taxableAmount = getItemTotalTaxableAmount(item);
      const itemTotal = calculateItemTotal(item);
      
      totalTaxableAmount += taxableAmount;
      totalItemsTotalAmount += itemTotal;
      grandTotal += itemTotal;
      
      if (localOrderMode === "PAKKA") {
        const cgstAmount = getItemTotalCGSTAmount(item);
        const sgstAmount = getItemTotalSGSTAmount(item);
        const gstAmount = getItemTotalGSTAmount(item);
        
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
      totalGST: localOrderMode === "PAKKA" ? totalGST.toFixed(2) : "0.00",
      totalItemsTotalAmount: totalItemsTotalAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const adjustedGstBreakdown = calculateAdjustedGSTBreakdown();
  
  // Get adjusted totals
  const getAdjustedTotals = () => {
    const itemsToUse = updatedItems.length > 0 ? updatedItems : (invoiceData?.items || []);
    
    if (!itemsToUse || itemsToUse.length === 0) return {
      taxableAmount: "0.00",
      totalGST: "0.00",
      grandTotal: "0.00",
      totalItemsAmount: "0.00",
      totalCGST: "0.00",
      totalSGST: "0.00"
    };
    
    let totalTaxableAmount = 0;
    let totalGSTAmount = 0;
    let totalGrandTotal = 0;
    let totalItemsAmount = 0;
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    
    itemsToUse.forEach(item => {
      const quantity = parseFloat(item.quantity) || 1;
      const taxablePerUnit = getTaxableAmountPerUnit(item);
      const gstPerUnit = getGSTAmountPerUnit(item);
      const cgstPerUnit = getCGSTAmountPerUnit(item);
      const sgstPerUnit = getSGSTAmountPerUnit(item);
      
      const itemTaxableAmount = taxablePerUnit * quantity;
      const itemGSTAmount = localOrderMode === "KACHA" ? 0 : gstPerUnit * quantity;
      const itemCGSTAmount = localOrderMode === "KACHA" ? 0 : cgstPerUnit * quantity;
      const itemSGSTAmount = localOrderMode === "KACHA" ? 0 : sgstPerUnit * quantity;
      const itemTotal = calculateItemTotal(item);
      
      totalTaxableAmount += itemTaxableAmount;
      totalGSTAmount += itemGSTAmount;
      totalCGSTAmount += itemCGSTAmount;
      totalSGSTAmount += itemSGSTAmount;
      totalItemsAmount += itemTotal;
      totalGrandTotal += itemTotal;
    });
    
    return {
      taxableAmount: totalTaxableAmount.toFixed(2),
      totalGST: totalGSTAmount.toFixed(2),
      totalCGST: totalCGSTAmount.toFixed(2),
      totalSGST: totalSGSTAmount.toFixed(2),
      grandTotal: totalGrandTotal.toFixed(2),
      totalItemsAmount: totalItemsAmount.toFixed(2)
    };
  };

  const adjustedTotals = getAdjustedTotals();

  // Debug: Log product switching and net_price usage
  useEffect(() => {
    if (updatedItems.length > 0) {
      console.log("🔄 Current items with net_price:", updatedItems.map(item => ({
        product: item.product,
        product_id: item.product_id,
        net_price: item.net_price,
        edited_sale_price: item.edited_sale_price,
        using_net_price: !!item.net_price && parseFloat(item.net_price) > 0
      })));
    }
  }, [updatedItems, localOrderMode]);

  // Format date to Indian format
  const formatIndianDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!invoiceData) return null;

  // Use updatedItems or fallback to invoiceData.items
  const displayItems = updatedItems.length > 0 ? updatedItems : invoiceData.items;

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
              <p className="mb-1"><strong>Invoice Date:</strong> {formatIndianDate(invoiceData.invoiceDate)}</p>
              <p className="mb-0"><strong>Due Date:</strong> {formatIndianDate(invoiceData.validityDate)}</p>
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
                      disabled={loadingProducts}
                    >
                      <option value="PAKKA">PAKKA</option>
                      <option value="KACHA">KACHA</option>
                    </Form.Select>
                  </div>
                  <div className="mt-1">
                    <small className={localOrderMode === "KACHA" ? "text-danger" : "text-success"}>
                      {localOrderMode === "KACHA" ? "No GST applicable" : "GST applicable as per item rates"}
                    </small>
                    {loadingProducts && (
                      <small className="text-warning ms-2">Loading products...</small>
                    )}
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
              <div className="assigned-staff-section mt-3 p-2 bg-light rounded">
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
        <div className="table-responsive">
          <table className="items-table table table-bordered mb-0">
            <thead className="table-dark">
              <tr>
                <th className="text-center" style={{ width: '3%' }}>#</th>
                <th style={{ width: '12%' }}>Product</th>
                <th style={{ width: '15%' }}>Description</th>
                <th className="text-center" style={{ width: '4%' }}>Qty</th>
                <th className="text-center" style={{ width: '4%' }}>Free Qty</th>
                <th className="text-end" style={{ width: '7%' }}> Price</th>
                <th className="text-end" style={{ width: '7%' }}>Discount Amt</th>
                <th className="text-end" style={{ width: '7%' }}>Credit Charge</th>
                <th className="text-end" style={{ width: '7%' }}>Taxable Amount</th>
                <th className="text-center" style={{ width: '5%' }}>GST %</th>
                <th className="text-end" style={{ width: '7%' }}>GST Amt</th>
                <th className="text-end" style={{ width: '7%' }}>CGST Amt</th>
                <th className="text-end" style={{ width: '7%' }}>SGST Amt</th>
                <th className="text-end" style={{ width: '7%' }}>Item Total</th>
              </tr>
            </thead>
            <tbody>
              {displayItems?.map((item, index) => {
                const quantity = parseFloat(item.quantity) || 1;
                const flashOffer = parseInt(item.flash_offer) || 0;
                const buyQuantity = parseInt(item.buy_quantity) || 0;
                const getQuantity = parseInt(item.get_quantity) || 0;
                
                const taxablePerUnit = getTaxableAmountPerUnit(item);
                const gstPerUnit = localOrderMode === "KACHA" ? 0 : getGSTAmountPerUnit(item);
                const cgstPerUnit = localOrderMode === "KACHA" ? 0 : getCGSTAmountPerUnit(item);
                const sgstPerUnit = localOrderMode === "KACHA" ? 0 : getSGSTAmountPerUnit(item);
                const discountAmountPerUnit = parseFloat(item.discount_amount) || 0;
                const creditChargePerUnit = parseFloat(item.credit_charge) || 0;
                
                const totalTaxableAmount = taxablePerUnit * quantity;
                const totalGSTAmount = gstPerUnit * quantity;
                const totalCGSTAmount = cgstPerUnit * quantity;
                const totalSGSTAmount = sgstPerUnit * quantity;
                const totalDiscountAmount = discountAmountPerUnit * quantity;
                const totalCreditCharge = creditChargePerUnit * quantity;
                const itemTotal = calculateItemTotal(item);
                
                const gstPercentage = localOrderMode === "KACHA" ? 0 : (parseFloat(item.gst) || 0);
                // REPLACED: edited_sale_price with net_price
                const netPrice = getNetPricePerUnit(item);
                
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
                    
                    <td className="text-center align-middle">
                      {flashOffer === 1 ? (
                        <div className="fw-bold text-primary">{buyQuantity}</div>
                      ) : (
                        <div className="fw-medium text-muted">{quantity}</div>
                      )}
                    </td>
                    
                    <td className="text-center align-middle">
                      {flashOffer === 1 ? (
                        <div className="fw-bold text-success">
                          {getQuantity}
                        </div>
                      ) : (
                        <div className="text-muted">-</div>
                      )}
                    </td>
                    
                    <td className="text-end align-middle">
                      <div className="fw-medium">₹{netPrice.toFixed(2)}</div>
                    </td>
                    
                    <td className="text-end align-middle">
                      <div className="fw-medium text-warning">₹{totalDiscountAmount.toFixed(2)}</div>
                    </td>
                    
                    <td className="text-end align-middle">
                      <div className="fw-medium">₹{totalCreditCharge.toFixed(2)}</div>
                    </td>
                    
                    <td className="text-end align-middle">
                      <div className="fw-bold text-primary">₹{totalTaxableAmount.toFixed(2)}</div>
                    </td>
                    
                    <td className="text-center align-middle">
                      <span className={`badge ${localOrderMode === "KACHA" ? "bg-secondary" : "bg-primary"}`}>
                        {localOrderMode === "KACHA" ? "0%" : `${gstPercentage}%`}
                      </span>
                    </td>
                    
                    <td className="text-end align-middle">
                      <div className="fw-medium">
                        {localOrderMode === "KACHA" ? "₹0.00" : `₹${totalGSTAmount.toFixed(2)}`}
                      </div>
                    </td>
                    
                    <td className="text-end align-middle">
                      <div className="fw-medium">
                        {localOrderMode === "KACHA" ? "₹0.00" : `₹${totalCGSTAmount.toFixed(2)}`}
                      </div>
                    </td>
                    
                    <td className="text-end align-middle">
                      <div className="fw-medium">
                        {localOrderMode === "KACHA" ? "₹0.00" : `₹${totalSGSTAmount.toFixed(2)}`}
                      </div>
                    </td>
                    
                    <td className="text-end align-middle">
                      <div className="fw-bold text-success">₹{itemTotal.toFixed(2)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="table-active">
              <tr className='text-end'>
                <td colSpan={13} className="text-end fw-bold">
                  Total GST:
                </td>
                <td className="text-end fw-bold text-success">
                  ₹{adjustedGstBreakdown.totalGST}
                </td>
              </tr>
              
              <tr>
                <td colSpan={13} className="text-end fw-bold">
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
                <div className="bg-light p-3 rounded min-h-100" style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
                  {invoiceData.note || 'No note added'}
                </div>
              )}
            
              
            </div>
          </Col>
          
          <Col md={5}>
            <div className="amount-breakdown bg-light p-3 rounded border">
              <h6 className="text-primary mb-1 border-bottom pb-2">Amount Summary</h6>
              
              <table className="amount-table w-100">
                <tbody>
                  <tr>
                    <td className="pb-2">
                      <strong>Taxable Amount:</strong>
                    </td>
                    <td className="text-end pb-2 pt-1">
                      <strong>₹{adjustedGstBreakdown.totalTaxableAmount}</strong>
                    </td>
                  </tr>
                  
                  {localOrderMode === "PAKKA" && (
                    <>
                      <tr>
                        <td className="pb-1">
                          <span className="text-muted">CGST:</span>
                        </td>
                        <td className="text-end pb-1">
                          <span className="text-muted">₹{adjustedGstBreakdown.totalCGST}</span>
                        </td>
                      </tr>
                      
                      <tr>
                        <td className="pb-2">
                          <span className="text-muted">SGST:</span>
                        </td>
                        <td className="text-end pb-2">
                          <span className="text-muted">₹{adjustedGstBreakdown.totalSGST}</span>
                        </td>
                      </tr>
                      
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