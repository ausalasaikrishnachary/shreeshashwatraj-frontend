import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import './Period.css';
import { baseurl } from "../../../BaseURL/BaseURL";

const Period = () => {
  const [openRow, setOpenRow] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Selected items state
  const [selectedItems, setSelectedItems] = useState({});
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchNextInvoiceNumber();
  }, []);

  // Fetch next invoice number
  const fetchNextInvoiceNumber = async () => {
    try {
      console.log('Fetching next invoice number...');
      const response = await fetch(`${baseurl}/next-invoice-number`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received next invoice number:', data.nextInvoiceNumber);
        setNextInvoiceNumber(data.nextInvoiceNumber);
      } else {
        console.error('Failed to fetch next invoice number');
        generateFallbackInvoiceNumber();
      }
    } catch (err) {
      console.error('Error fetching next invoice number:', err);
      generateFallbackInvoiceNumber();
    }
  };

  // Fallback invoice number generation
  const generateFallbackInvoiceNumber = async () => {
    try {
      const response = await fetch(`${baseurl}/last-invoice`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastInvoiceNumber) {
          const lastNumber = data.lastInvoiceNumber;
          const numberMatch = lastNumber.match(/INV(\d+)/);
          if (numberMatch) {
            const nextNum = parseInt(numberMatch[1]) + 1;
            const fallbackInvoiceNumber = `INV${nextNum.toString().padStart(3, '0')}`;
            setNextInvoiceNumber(fallbackInvoiceNumber);
            return;
          }
        }
      }
      setNextInvoiceNumber('INV001');
    } catch (err) {
      console.error('Error in fallback invoice number generation:', err);
      setNextInvoiceNumber('INV001');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/orders/all-orders`);
      const ordersData = response.data;

      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const itemsRes = await axios.get(`${baseurl}/orders/details/${order.order_number}`);
          const itemsData = itemsRes.data.items || [];

          return {
            ...order,
            items: itemsData.map(item => ({
              id: item.id,
              order_number: item.order_number,
              item_name: item.item_name ?? "N/A",
              product_id: item.product_id,
              mrp: item.mrp ?? 0,
              sale_price: item.sale_price ?? 0,
              price: item.price ?? 0,
              quantity: item.quantity ?? 0,
              total_amount: item.total_amount ?? 0,
              discount_percentage: item.discount_percentage ?? 0,
              discount_amount: item.discount_amount ?? 0,
              taxable_amount: item.taxable_amount ?? 0,
              tax_percentage: item.tax_percentage ?? 0,
              tax_amount: item.tax_amount ?? 0,
              item_total: item.item_total ?? 0,
              credit_period: item.credit_period ?? 0,
              invoice_number: item.invoice_number ?? 0,
              invoice_status: item.invoice_status ?? 0,
               staff_id: item.staff_id ?? 0,
                assigned_staff: item.assigned_staff ?? 0,
                 staff_incentive: item.staff_incentive ?? 0,
              invoice_date: item.invoce_date ?? 0,
              credit_percentage: item.credit_percentage ?? 0,
              sgst_percentage: item.sgst_percentage ?? 0,
              sgst_amount: item.sgst_amount ?? 0,
              cgst_percentage: item.cgst_percentage ?? 0,
              cgst_amount: item.cgst_amount ?? 0,
              discount_applied_scheme: item.discount_applied_scheme ?? "N/A"
            }))
          };
        })
      );

      setOrders(ordersWithItems);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  // Handle item selection
  const handleItemSelect = (orderId, itemId, isSelected) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      
      if (isSelected) {
        if (!newSelected[orderId]) {
          newSelected[orderId] = [];
        }
        if (!newSelected[orderId].includes(itemId)) {
          newSelected[orderId] = [...newSelected[orderId], itemId];
        }
      } else {
        if (newSelected[orderId]) {
          newSelected[orderId] = newSelected[orderId].filter(id => id !== itemId);
          if (newSelected[orderId].length === 0) {
            delete newSelected[orderId];
          }
        }
      }
      
      return newSelected;
    });
  };

  // Select all items in an order
  const handleSelectAll = (orderId, items) => {
    const allItemIds = items.map(item => item.id);
    const isAllSelected = selectedItems[orderId] && 
                         selectedItems[orderId].length === items.length;
    
    if (isAllSelected) {
      // Deselect all
      setSelectedItems(prev => {
        const newSelected = { ...prev };
        delete newSelected[orderId];
        return newSelected;
      });
    } else {
      // Select all
      setSelectedItems(prev => ({
        ...prev,
        [orderId]: allItemIds
      }));
    }
  };

  // Open Order Modal with existing data
  const openOrderModal = (orderId) => {
    const orderData = orders.find(order => order.id === orderId);
    if (orderData) {
      setModalData(orderData);
      setShowOrderModal(true);
    }
  };

  // Open Item Modal with existing data
  const openItemModal = (orderNumber, itemId) => {
    const order = orders.find(order => order.order_number === orderNumber);
    if (order && order.items) {
      const itemData = order.items.find(item => item.id === itemId);
      if (itemData) {
        setModalData(itemData);
        setShowItemModal(true);
      }
    }
  };

  // Close modals
  const closeModals = () => {
    setShowOrderModal(false);
    setShowItemModal(false);
    setModalData(null);
  };
const handleGenerateInvoice = (order) => {
  try {
    setGeneratingInvoice(true);
    
    // Get all selected items for this order
    const orderSelectedItems = selectedItems[order.id] || [];
    
    // Check if any items are selected
    if (orderSelectedItems.length === 0) {
      alert("Please select at least one item to generate invoice!");
      setGeneratingInvoice(false);
      return;
    }
    
    // Filter items to only include selected ones
    const selectedItemsData = order.items.filter(item => 
      orderSelectedItems.includes(item.id)
    );
    
    // Check if any selected item already has an invoice generated
    const itemsWithInvoice = selectedItemsData.filter(item => item.invoice_status === 1);
    if (itemsWithInvoice.length > 0) {
      alert(`Some selected items already have invoices generated: ${itemsWithInvoice.map(i => i.item_name).join(', ')}`);
      setGeneratingInvoice(false);
      return;
    }
    
    let invoiceNumber = nextInvoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = `INV${order.order_number.replace('ORD', '')}`;
    }
    
    // Prepare invoice data - ONLY SELECTED ITEMS
    const invoiceData = {
      orderNumber: order.order_number,
      invoiceNumber: invoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      // Original order data
      originalOrder: {
        ...order,
        items: undefined // Remove the full items array
      },
      
      // Pass only selected items
      selectedItems: selectedItemsData,
      
      // Track which items were selected by their IDs
      selectedItemIds: orderSelectedItems,
      
      // Calculate totals based on selected items
      selectedItemsTotal: {
        taxableAmount: selectedItemsData.reduce((sum, item) => sum + (item.taxable_amount || 0), 0),
        taxAmount: selectedItemsData.reduce((sum, item) => sum + (item.tax_amount || 0), 0),
        discountAmount: selectedItemsData.reduce((sum, item) => sum + (item.discount_amount || 0), 0),
        grandTotal: selectedItemsData.reduce((sum, item) => sum + (item.item_total || 0), 0)
      },
      
      // Company info
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhusr7@gmail.com",
        phone: "3456549876543",
        gstin: "29AABCD0503B1ZG",
        state: "Karnataka"
      },
      
      // Customer info from order
      customerInfo: {
        name: order.customer_name,
        businessName: order.customer_name,
        state: order.billing_state || "Karnataka",
        gstin: order.gstin || "29AABCD0503B1ZG",
        id: order.customer_id
      },
      
      // Billing address
      billingAddress: {
        addressLine1: order.billing_address || "Address not specified",
        addressLine2: "",
        city: order.billing_city || "City not specified",
        pincode: order.billing_pincode || "000000",
        state: order.billing_state || "Karnataka"
      },
      
      // Shipping address
      shippingAddress: {
        addressLine1: order.shipping_address || order.billing_address || "Address not specified",
        addressLine2: "",
        city: order.shipping_city || order.billing_city || "City not specified",
        pincode: order.shipping_pincode || order.billing_pincode || "000000",
        state: order.shipping_state || order.billing_state || "Karnataka"
      },
      
      note: "Thank you for your business!",
      transportDetails: "Standard delivery",
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      
      type: 'sales',
      selectedSupplierId: order.customer_id,
      PartyID: order.customer_id,
      AccountID: order.customer_id,
      PartyName: order.customer_name,
      AccountName: order.customer_name,
      
      isSingleItemInvoice: orderSelectedItems.length === 1,
      selectedItemId: orderSelectedItems.length === 1 ? orderSelectedItems[0] : null,
      originalOrderId: order.id,
      isMultiSelect: orderSelectedItems.length > 1
    };
    
    console.log("📋 Selected items being passed to preview:", selectedItemsData.length);
    console.log("📋 Selected item IDs:", orderSelectedItems);
    
    // Navigate to preview page with the data
    navigate(`/periodinvoicepreviewpdf/${order.id}`, {
      state: { 
        invoiceData,
        selectedItemIds: orderSelectedItems 
      }
    });
    
  } catch (error) {
    console.error("Error preparing invoice:", error);
    alert("Failed to prepare invoice data. Please try again.");
    setGeneratingInvoice(false);
  }
};

// Helper function to generate invoice with selected items
const generateInvoiceWithSelectedItems = (order, selectedItemIds) => {
  // Filter items to only include selected ones
  const selectedItemsData = order.items.filter(item => 
    selectedItemIds.includes(item.id)
  );
  
  // Check if any selected item already has an invoice generated
  const itemsWithInvoice = selectedItemsData.filter(item => item.invoice_status === 1);
  if (itemsWithInvoice.length > 0) {
    alert(`Some selected items already have invoices generated: ${itemsWithInvoice.map(i => i.item_name).join(', ')}`);
    setGeneratingInvoice(false);
    return;
  }
  
  let invoiceNumber = nextInvoiceNumber;
  if (!invoiceNumber) {
    invoiceNumber = `INV${order.order_number.replace('ORD', '')}`;
  }
  
  // Prepare invoice data - ONLY SELECTED ITEMS
  const invoiceData = {
    orderNumber: order.order_number,
    invoiceNumber: invoiceNumber,
    invoiceDate: new Date().toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Original order data
    originalOrder: {
      ...order,
      items: undefined // Remove the full items array
    },
    
    // Pass only selected items
    selectedItems: selectedItemsData,
    
    // Track which items were selected by their IDs
    selectedItemIds: selectedItemIds,
    
    // Calculate totals based on selected items
    selectedItemsTotal: {
      taxableAmount: selectedItemsData.reduce((sum, item) => sum + (item.taxable_amount || 0), 0),
      taxAmount: selectedItemsData.reduce((sum, item) => sum + (item.tax_amount || 0), 0),
      discountAmount: selectedItemsData.reduce((sum, item) => sum + (item.discount_amount || 0), 0),
      grandTotal: selectedItemsData.reduce((sum, item) => sum + (item.item_total || 0), 0)
    },
    
    // Company info
    companyInfo: {
      name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
      address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
      email: "sumukhusr7@gmail.com",
      phone: "3456549876543",
      gstin: "29AABCD0503B1ZG",
      state: "Karnataka"
    },
    
    // Customer info from order
    customerInfo: {
      name: order.customer_name,
      businessName: order.customer_name,
      state: order.billing_state || "Karnataka",
      gstin: order.gstin || "29AABCD0503B1ZG",
      id: order.customer_id
    },
    
    // Billing address
    billingAddress: {
      addressLine1: order.billing_address || "Address not specified",
      addressLine2: "",
      city: order.billing_city || "City not specified",
      pincode: order.billing_pincode || "000000",
      state: order.billing_state || "Karnataka"
    },
    
    // Shipping address
    shippingAddress: {
      addressLine1: order.shipping_address || order.billing_address || "Address not specified",
      addressLine2: "",
      city: order.shipping_city || order.billing_city || "City not specified",
      pincode: order.shipping_pincode || order.billing_pincode || "000000",
      state: order.shipping_state || order.billing_state || "Karnataka"
    },
    
    note: "Thank you for your business!",
    transportDetails: "Standard delivery",
    otherDetails: "Authorized Signatory",
    taxType: "CGST/SGST",
    
    type: 'sales',
    selectedSupplierId: order.customer_id,
    PartyID: order.customer_id,
    AccountID: order.customer_id,
    PartyName: order.customer_name,
    AccountName: order.customer_name,
    
    isSingleItemInvoice: selectedItemIds.length === 1,
    selectedItemId: selectedItemIds.length === 1 ? selectedItemIds[0] : null,
    originalOrderId: order.id,
    isMultiSelect: selectedItemIds.length > 1
  };
  
  console.log("📋 Selected items being passed to preview:", selectedItemsData.length);
  console.log("📋 Selected item IDs:", selectedItemIds);
  
  // Navigate to preview page with the data
  navigate(`/periodinvoicepreviewpdf/${order.id}`, {
    state: { 
      invoiceData,
      selectedItemIds 
    }
  });
};

  // Filter orders by search and date
  const filteredOrders = orders.filter(order => {
    const customerMatch = order.customer_name.toLowerCase().includes(search.toLowerCase());
    let startMatch = true;
    let endMatch = true;
    
    if (startDate) startMatch = new Date(order.created_at) >= new Date(startDate);
    if (endDate) endMatch = new Date(order.created_at) <= new Date(endDate);
    
    return customerMatch && startMatch && endMatch;
  });

  if (loading) return <div className="p-admin-layout">Loading orders...</div>;

  return (
    <div className="p-admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`p-admin-main ${isCollapsed ? 'p-sidebar-collapsed' : ''}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="p-period-page">
 
          
          {/* Filters Section */}
          <div className="p-filters-section">
            <div className="p-filter-row">
              <div className="p-filter-group">
                <input
                  type="text"
                  className="p-form-control"
                  placeholder="Search Customer Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="p-filter-group">
                <input
                  type="date"
                  className="p-form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="p-filter-group">
                <input
                  type="date"
                  className="p-form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="p-filter-group">
                <button className="p-btn p-btn-primary" onClick={() => { }}>Search</button>
              </div>
            </div>
          </div>
          
          {/* Orders Table */}
          <div className="p-table-section">
            <div className="p-table-card">
              <div className="p-table-header">
                <h3>Order Records</h3>
                <span className="p-badge">{filteredOrders.length} Order(s)</span>
              </div>
              
              <div className="p-table-container">
                <table className="p-customers-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Order Number</th>
                      <th>Customer Name</th>
                      <th>Order Total</th>
                      <th>Discount Amount</th>
                      <th>Created At</th>
                     
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const isOrderOpen = openRow === order.id;
                      const orderSelectedItems = selectedItems[order.id] || [];
                      const allItemsSelected = order.items && 
                                               orderSelectedItems.length === order.items.length;
                      
                      return (
                        <React.Fragment key={order.id}>
                          <tr className="p-customer-row">
                            <td>
                              <button className="p-toggle-btn" onClick={() => toggleRow(order.id)}>
                                <span className={isOrderOpen ? "p-arrow-up" : "p-arrow-down"}></span>
                              </button>
                            </td>
                            <td>{order.order_number}</td>
                            <td>{order.customer_name}</td>
                            <td>₹{(order.order_total ?? 0).toLocaleString()}</td>
                            <td>₹{(order.discount_amount ?? 0).toLocaleString()}</td>
                            <td>
                              {new Date(order.created_at).toLocaleDateString('en-GB')}
                            </td>
                         
                            <td>
                              <div className="p-action-buttons">
                                <button
                                  className="p-eye-btn"
                                  onClick={() => openOrderModal(order.id)}
                                  title="View Order Details"
                                >
                                  👁️
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                        {isOrderOpen && (
  <tr className="p-invoices-row">
    <td colSpan={9}>
      <div className="p-invoices-section">
        <div className="p-items-header">
          <h4>Order Items</h4>
          {/* Show Generate Invoice button when items are selected */}
          {orderSelectedItems.length > 0 && (
            <button
              className="p-generate-invoice-btn p-bulk-btn"
              onClick={() => handleGenerateInvoice(order)}
              disabled={generatingInvoice}
              title={`Generate invoice for ${orderSelectedItems.length} selected item(s)`}
            >
              {generatingInvoice ? "Preparing..." : `Generate Invoice for ${orderSelectedItems.length} Item(s)`}
            </button>
          )}
        </div>
        <table className="p-invoices-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  checked={allItemsSelected}
                  onChange={() => handleSelectAll(order.id, order.items)}
                  className="p-item-checkbox"
                />
              </th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Sale Price</th>
              <th>Price</th>
              <th>Discount Amount</th>
              <th>Credit Period</th>
              <th>Invoice Number</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => {
              const isItemSelected = orderSelectedItems.includes(item.id);
              const hasInvoiceGenerated = item.invoice_status === 1;
              
              return (
                <tr key={item.id}>
                  <td>
                    {hasInvoiceGenerated ? (
                      <span title="Invoice Already Generated">✅</span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={isItemSelected}
                        onChange={(e) => 
                          handleItemSelect(order.id, item.id, e.target.checked)
                        }
                        className="p-item-checkbox"
                      />
                    )}
                  </td>
                  <td>{item.item_name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.sale_price.toLocaleString()}</td>
                  <td>₹{item.price.toLocaleString()}</td>
                  <td>₹{item.discount_amount.toLocaleString()}</td>
                  <td>{item.credit_period}</td>
                  <td>{item.invoice_number || "N/A"}</td>
                  <td>
                    <button
                      className="p-eye-btn"
                      onClick={() => openItemModal(order.order_number, item.id)}
                      title="View Item Details"
                    >
                      👁️
                    </button>
                  </td>
                  <td>
                    {hasInvoiceGenerated ? (
                      <span className="p-invoice-generated-text" title="Invoice Already Generated">
                        Invoice Generated
                      </span>
                    ) : isItemSelected ? (
                      <span className="p-selected-text" title="Selected for invoice">
                        Selected ✓
                      </span>
                    ) : (
                      <span className="p-select-prompt-text" title="Select this item to generate invoice">
                        Available
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </td>
  </tr>
)}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
 

      {/* Order Details Modal */}
      {showOrderModal && modalData && (
        <div className="p-modal-overlay" onClick={closeModals}>
          <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>Order Details - {modalData.order_number}</h3>
              <button className="p-modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="p-modal-body">
              <div className="p-three-column-grid">
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Number:</span>
                    <span className="p-detail-value">{modalData.order_number}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Customer Name:</span>
                    <span className="p-detail-value">{modalData.customer_name}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Customer ID:</span>
                    <span className="p-detail-value">{modalData.customer_id}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Total:</span>
                    <span className="p-detail-value">₹{(modalData.order_total ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount Amount:</span>
                    <span className="p-detail-value">₹{(modalData.discount_amount ?? 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Taxable Amount:</span>
                    <span className="p-detail-value">₹{(modalData.taxable_amount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Tax Amount:</span>
                    <span className="p-detail-value">₹{(modalData.tax_amount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Net Payable:</span>
                    <span className="p-detail-value">₹{(modalData.net_payable ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Period:</span>
                    <span className="p-detail-value">{modalData.credit_period} days</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Estimated Delivery:</span>
                    <span className="p-detail-value">
                      {modalData.estimated_delivery_date ? new Date(modalData.estimated_delivery_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Invoice Number:</span>
                    <span className="p-detail-value">{modalData.invoice_number}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Invoice Date:</span>
                    <span className="p-detail-value">
                      {modalData.invoice_date ? new Date(modalData.invoice_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Date:</span>
                    <span className="p-detail-value">
                      {modalData.created_at ? new Date(modalData.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Last Updated:</span>
                    <span className="p-detail-value">
                      {modalData.updated_at ? new Date(modalData.updated_at).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Mode:</span>
                    <span className="p-detail-value">{modalData.order_mode || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {showItemModal && modalData && (
        <div className="p-modal-overlay" onClick={closeModals}>
          <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>Item Details - {modalData.item_name}</h3>
              <button className="p-modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="p-modal-body">
              <div className="p-three-column-grid">
                <div className="p-column">
                  <div className="p-detail-row">
               

                    <span className="p-detail-label">Item Name:</span>
                    <span className="p-detail-value">{modalData.item_name}</span>
                  </div>

                  <div className="p-detail-row">
                    <span className="p-detail-label">Product ID:</span>
                    <span className="p-detail-value">{modalData.product_id}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Number:</span>
                    <span className="p-detail-value">{modalData.order_number}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">MRP:</span>
                    <span className="p-detail-value">₹{modalData.mrp.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Sale Price:</span>
                    <span className="p-detail-value">₹{modalData.sale_price.toLocaleString()}</span>
                  </div>
                    <div className="p-detail-row">
                    <span className="p-detail-label">Invoice Number:</span>
                    <span className="p-detail-value">₹{modalData.invoice_number.toLocaleString()}</span>
                  </div>

                
                  <div className="p-detail-row">
                    <span className="p-detail-label">Price:</span>
                    <span className="p-detail-value">₹{modalData.price.toLocaleString()}</span>
                  </div>
            
                  
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Total Amount:</span>
                    <span className="p-detail-value">₹{modalData.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount %:</span>
                    <span className="p-detail-value">{modalData.discount_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount Amount:</span>
                    <span className="p-detail-value">₹{modalData.discount_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Taxable Amount:</span>
                    <span className="p-detail-value">₹{modalData.taxable_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Tax %:</span>
                    <span className="p-detail-value">{modalData.tax_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Tax Amount:</span>
                    <span className="p-detail-value">₹{modalData.tax_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Item Total:</span>
                    <span className="p-detail-value">₹{modalData.item_total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Period:</span>
                    <span className="p-detail-value">{modalData.credit_period} days</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Percentage:</span>
                    <span className="p-detail-value">{modalData.credit_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">SGST %:</span>
                    <span className="p-detail-value">{modalData.sgst_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">SGST Amount:</span>
                    <span className="p-detail-value">₹{modalData.sgst_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">CGST %:</span>
                    <span className="p-detail-value">{modalData.cgst_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">CGST Amount:</span>
                    <span className="p-detail-value">₹{modalData.cgst_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount Scheme:</span>
                    <span className="p-detail-value">{modalData.discount_applied_scheme}</span>
                  </div>
                </div>
                     <div className="p-detail-row">
                    <span className="p-detail-label">Staff Id :</span>
                    <span className="p-detail-value">₹{modalData.staff_id}</span>
                  </div>
                     <div className="p-detail-row">
                    <span className="p-detail-label">Assigned Staff :</span>
                    <span className="p-detail-value">₹{modalData.assigned_staff}</span>
                  </div>
                     <div className="p-detail-row">
                    <span className="p-detail-label">Staff Incentive:</span>
                    <span className="p-detail-value">₹{modalData.staff_incentive}</span>
                  </div>
                        <div className="p-detail-row">
                    <span className="p-detail-label">Quantity:</span>
                    <span className="p-detail-value">{modalData.quantity}</span>
                  </div>
                  </div>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Period;