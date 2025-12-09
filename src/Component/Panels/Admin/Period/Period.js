import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import './Period.css';
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaFilePdf, FaTrash, FaDownload } from 'react-icons/fa';


const Period = () => {
  const [openRow, setOpenRow] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
    const [downloading, setDownloading] = useState({});
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [selectedItems, setSelectedItems] = useState({});
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchNextInvoiceNumber();
  }, []);

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


  const handleDownloadPDF = async (invoice) => {
    const voucherId = invoice.originalData?.VoucherID || invoice.id;
    
    try {
      setDownloading(prev => ({ ...prev, [voucherId]: true }));
      
      const downloadResponse = await fetch(`${baseurl}/transactions/${voucherId}/download-pdf`);
      
      if (downloadResponse.ok) {
        const pdfBlob = await downloadResponse.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from response headers or use default
        const contentDisposition = downloadResponse.headers.get('content-disposition');
        let filename = `Invoice_${invoice.number}.pdf`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('PDF downloaded successfully');
        
      } else if (downloadResponse.status === 404) {
        // PDF doesn't exist, generate it first
        console.log('PDF not found, generating new PDF...');
        
        const generateResponse = await fetch(`${baseurl}/transactions/${voucherId}/store-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (generateResponse.ok) {
          const result = await generateResponse.json();
          console.log('PDF generated successfully:', result);
          
          // After generation, try downloading again
          const retryDownload = await fetch(`${baseurl}/transactions/${voucherId}/download-pdf`);
          
          if (retryDownload.ok) {
            const pdfBlob = await retryDownload.blob();
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Invoice_${invoice.number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('PDF downloaded after generation');
          } else {
            throw new Error('Failed to download PDF after generation');
          }
        } else {
          throw new Error('Failed to generate PDF');
        }
      } else {
        throw new Error(`Failed to download PDF: ${downloadResponse.status}`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF: ' + error.message);
    } finally {
      setDownloading(prev => ({ ...prev, [voucherId]: false }));
    }
  };



const fetchOrders = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${baseurl}/orders/all-orders`);
    const ordersData = response.data;
    console.log("Raw API ordersData:", ordersData);

    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        try {
          // Fetch order items
          const itemsRes = await axios.get(`${baseurl}/orders/details/${order.order_number}`);
          const itemsData = itemsRes.data.items || [];
          const orderMode = order.order_mode || "Pakka";

          // Fetch account details by customer ID
          let accountDetails = null;
          try {
            const accountRes = await axios.get(`${baseurl}/accounts/${order.customer_id}`);
            accountDetails = accountRes.data;
          } catch (accountErr) {
            console.warn(`Could not fetch account details for customer ID ${order.customer_id}:`, accountErr.message);
            accountDetails = null;
          }

          const items = itemsData.map(item => ({
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
            staff_id: item.staff_id ?? order.staff_id ?? 0,
            assigned_staff: item.assigned_staff ?? order.assigned_staff ?? null,
            // Remove staff_incentive from items since it's not in order_items table
            invoice_date: item.invoce_date ?? 0,
            credit_percentage: item.credit_percentage ?? 0,
            sgst_percentage: item.sgst_percentage ?? 0,
            sgst_amount: item.sgst_amount ?? 0,
            cgst_percentage: item.cgst_percentage ?? 0,
            cgst_amount: item.cgst_amount ?? 0,
            discount_applied_scheme: item.discount_applied_scheme ?? "N/A"
          }));

          const assignedStaff = order.assigned_staff || "N/A";
          const staffId = order.staff_id || "N/A";
          const orderStatus = order.order_status || "N/A";

          // FIX: Get staff_incentive directly from order data
          const staffIncentive = order.staff_incentive ? 
            (typeof order.staff_incentive === 'string' ? 
              parseFloat(order.staff_incentive) : 
              order.staff_incentive) : 0;

          console.log(`Order ${order.order_number} staff_incentive:`, staffIncentive);

          return {
            ...order,
            items: items,
            assigned_staff: assignedStaff,
            staff_id: staffId,
            order_status: orderStatus,
            staff_incentive: staffIncentive, // This comes from the order data
            account_details: accountDetails,
            order_mode: orderMode
          };
        } catch (error) {
          console.error(`Error processing order ${order.order_number}:`, error);
          return {
            ...order,
            items: [],
            assigned_staff: order.assigned_staff || "N/A",
            staff_id: order.staff_id || "N/A",
            order_status: order.order_status || "N/A",
            staff_incentive: order.staff_incentive || 0, // Keep staff_incentive
            account_details: null,
            order_mode: order.order_mode || "Pakka"
          };
        }
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



  const handleItemSelect = (orderId, itemId, isSelected, itemCreditPeriod) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      const currentSelectedIds = newSelected[orderId] || [];
      const order = orders.find(o => o.id === orderId);
      
      if (!order || !order.items) return prev;
      
      if (isSelected) {
        // Auto-select all eligible items with the same credit period
        if (currentSelectedIds.length === 0) {
          // No items selected yet - select all eligible with this credit period
          const eligibleItems = order.items.filter(item => 
            item.credit_period === itemCreditPeriod && 
            item.invoice_status !== 1
          );
          newSelected[orderId] = eligibleItems.map(item => item.id);
        } else {
          // Some items already selected - check if credit period matches
          const firstSelectedItemId = currentSelectedIds[0];
          const firstSelectedItem = order.items.find(item => item.id === firstSelectedItemId);
          
          if (firstSelectedItem && firstSelectedItem.credit_period === itemCreditPeriod) {
            // Same credit period - add all remaining eligible items with this credit period
            const eligibleItems = order.items.filter(item => 
              item.credit_period === itemCreditPeriod && 
              item.invoice_status !== 1 && 
              !currentSelectedIds.includes(item.id)
            );
            newSelected[orderId] = [...currentSelectedIds, ...eligibleItems.map(item => item.id)];
          } else {
            // Different credit period - alert and don't select
            alert(`Cannot select items with different credit periods. Selected items have ${firstSelectedItem?.credit_period} days, this item has ${itemCreditPeriod} days.`);
            return prev;
          }
        }
      } else {
        // Deselecting - remove only this specific item
        if (currentSelectedIds.includes(itemId)) {
          newSelected[orderId] = currentSelectedIds.filter(id => id !== itemId);
          if (newSelected[orderId].length === 0) {
            delete newSelected[orderId];
          }
        }
      }
      return newSelected;
    });
  };

  const handleSelectAll = (orderId, items) => {
    const currentSelectedIds = selectedItems[orderId] || [];
    const isAllSelected = currentSelectedIds.length === items.length;
    
    if (isAllSelected) {
      // Deselect all
      setSelectedItems(prev => {
        const newSelected = { ...prev };
        delete newSelected[orderId];
        return newSelected;
      });
    } else {
      // Check if all items have the same credit period
      const creditPeriods = [...new Set(items.map(item => item.credit_period))];
      if (creditPeriods.length > 1) {
        alert(`Cannot select all items because they have different credit periods: ${creditPeriods.join(', ')} days. Please select items with the same credit period.`);
        return;
      }
      
      // Select all (all have same credit period)
      setSelectedItems(prev => ({
        ...prev,
        [orderId]: items.map(item => item.id)
      }));
    }
  };

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

      const orderSelectedItems = selectedItems[order.id] || [];
      if (orderSelectedItems.length === 0) {
        alert("Please select at least one item to generate invoice!");
        setGeneratingInvoice(false);
        return;
      }

      const selectedItemsData = order.items.filter(item =>
        orderSelectedItems.includes(item.id)
      );

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

      // Use account_details if available, otherwise fallback to order data
      const accountDetails = order.account_details;

      // Get staff_id from the first selected item or order
      const staffId = selectedItemsData[0]?.staff_id || order.staff_id || 0;

      const invoiceData = {
        orderNumber: order.order_number,
        invoiceNumber: invoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0],
        validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

        originalOrder: {
          ...order,
          items: undefined
        },

        // Pass only selected items
        selectedItems: selectedItemsData,
        selectedItemIds: orderSelectedItems,

        selectedItemsTotal: {
          taxableAmount: selectedItemsData.reduce((sum, item) => sum + (item.taxable_amount || 0), 0),
          taxAmount: selectedItemsData.reduce((sum, item) => sum + (item.tax_amount || 0), 0),
          discountAmount: selectedItemsData.reduce((sum, item) => sum + (item.discount_amount || 0), 0),
          grandTotal: selectedItemsData.reduce((sum, item) => sum + (item.item_total || 0), 0)
        },

        companyInfo: {
          name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
          address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
          email: "sumukhusr7@gmail.com",
          phone: "3456549876543",
          gstin: "29AABCD0503B1ZG",
          state: "Karnataka"
        },

        customerInfo: {
          name: accountDetails?.name || order.customer_name,
          businessName: accountDetails?.business_name || order.customer_name,
          state: accountDetails?.billing_state || order.billing_state || "Karnataka",
          gstin: accountDetails?.gstin || order.gstin || "29AABCD0503B1ZG",
          id: order.customer_id,
          // Add all account details
          account_details: accountDetails
        },

        // Billing address from account details
        billingAddress: accountDetails ? {
          addressLine1: accountDetails.billing_address_line1 || "Address not specified",
          addressLine2: accountDetails.billing_address_line2 || "",
          city: accountDetails.billing_city || "City not specified",
          pincode: accountDetails.billing_pin_code || "000000",
          state: accountDetails.billing_state || "Karnataka",
          gstin: accountDetails.billing_gstin || accountDetails.gstin || "",
          country: accountDetails.billing_country || "India"
        } : {
          addressLine1: order.billing_address || "Address not specified",
          addressLine2: "",
          city: order.billing_city || "City not specified",
          pincode: order.billing_pincode || "000000",
          state: order.billing_state || "Karnataka"
        },

        // Shipping address from account details
        shippingAddress: accountDetails ? {
          addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1 || "Address not specified",
          addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || "",
          city: accountDetails.shipping_city || accountDetails.billing_city || "City not specified",
          pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code || "000000",
          state: accountDetails.shipping_state || accountDetails.billing_state || "Karnataka",
          gstin: accountDetails.shipping_gstin || accountDetails.gstin || "",
          country: accountDetails.shipping_country || "India"
        } : {
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
        isMultiSelect: orderSelectedItems.length > 1,

        // Add staff_id to invoice data
        staff_id: staffId,
  order_mode: order.order_mode || "Pakka",
         staff_incentive: order.staff_incentive || 0, // Add this line
        fullAccountDetails: accountDetails
      };

      console.log("📋 Invoice data being passed:", invoiceData);
      console.log("📋 Staff ID in invoice:", staffId);
      console.log("📋 Account details:", accountDetails);

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

          <div className="p-table-container">
            <table className="p-customers-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Order Number</th>
                  <th>Customer Name</th>
                  <th>Order Total</th>
                  <th>Discount Amount</th>
                  <th>Assigned Staff</th>
                  <th>Order Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                  <th>Download Invoice</th>
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
                        <td>{order.assigned_staff || "N/A"}</td>
                        <td>{order.order_status || "N/A"}</td> 
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
                    <td>
  <button
    className={`p-btn p-btn-pdf ${order.hasPDF ? 'p-btn-success' : 'p-btn-warning'}`}
    onClick={() => handleDownloadPDF(order)}
    disabled={downloading[order.id]}
    title={order.hasPDF ? 'Download PDF' : 'Generate and Download PDF'}
  >
    {downloading[order.id] ? (
      <span className="p-download-spinner">Loading...</span>
    ) : order.hasPDF ? (
      <>
        <FaDownload className="p-icon" />
        Download
      </>
    ) : (
      <>
        <FaFilePdf className="p-icon" />
        Generate PDF
      </>
    )}
  </button>
</td>
                      </tr>

                      {isOrderOpen && (
                        <tr className="p-invoices-row">
                          <td colSpan={10}>
                            <div className="p-invoices-section">
                              <div className="p-items-header">
                                <h4>Order Items</h4>
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
                                        disabled={(() => {
                                          const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
                                          return creditPeriods.length > 1;
                                        })()}
                                        title={(() => {
                                          const creditPeriods = [...new Set(order.items.map(item => item.credit_period))];
                                          if (creditPeriods.length > 1) {
                                            return `Cannot select all items because they have different credit periods: ${creditPeriods.join(', ')} days`;
                                          }
                                          return allItemsSelected ? "Deselect all items" : "Select all items";
                                        })()}
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
                                            (() => {
                                              const currentSelectedIds = selectedItems[order.id] || [];
                                              
                                              if (currentSelectedIds.length === 0) {
                                                return (
                                                  <input
                                                    type="checkbox"
                                                    checked={isItemSelected}
                                                    onChange={(e) =>
                                                      handleItemSelect(order.id, item.id, e.target.checked, item.credit_period)
                                                    }
                                                    className="p-item-checkbox"
                                                    title="Select for invoice generation"
                                                  />
                                                );
                                              }
                                              
                                              const firstSelectedId = currentSelectedIds[0];
                                              const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
                                              const selectedCreditPeriod = firstSelectedItem?.credit_period;
                                              
                                              const isSelectable = selectedCreditPeriod === item.credit_period;
                                              
                                              return (
                                                <input
                                                  type="checkbox"
                                                  checked={isItemSelected}
                                                  onChange={(e) =>
                                                    handleItemSelect(order.id, item.id, e.target.checked, item.credit_period)
                                                  }
                                                  className="p-item-checkbox"
                                                  disabled={!isSelectable}
                                                  title={!isSelectable ? 
                                                    `Items with different credit periods cannot be selected together. Selected items have ${selectedCreditPeriod} days, this item has ${item.credit_period} days.` : 
                                                    "Select for invoice generation"}
                                                />
                                              );
                                            })()
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
                                          ) : (() => {
                                            const currentSelectedIds = selectedItems[order.id] || [];
                                            if (currentSelectedIds.length > 0) {
                                              const firstSelectedId = currentSelectedIds[0];
                                              const firstSelectedItem = order.items.find(it => it.id === firstSelectedId);
                                              if (firstSelectedItem && firstSelectedItem.credit_period !== item.credit_period) {
                                                return (
                                                  <span className="p-different-period-text" 
                                                        title={`Different credit period (${item.credit_period} days vs selected ${firstSelectedItem.credit_period} days)`}>
                                                    Different Period
                                                  </span>
                                                );
                                              }
                                            }
                                            return (
                                              <span className="p-select-prompt-text" title="Select this item to generate invoice">
                                                Available 
                                              </span>
                                            );
                                          })()}
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
                    <span className="p-detail-label">Staff ID:</span> 
                    <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
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

              <div className="p-staff-info-section">
                <div className="p-three-column-grid">
                  <div className="p-column">
                    <div className="p-detail-row">
                      <span className="p-detail-label">Assigned Staff:</span>
                      <span className="p-detail-value staff-highlight">
                        {modalData.assigned_staff || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="p-column">
                    <div className="p-detail-row">
                      <span className="p-detail-label">Staff ID:</span>
                      <span className="p-detail-value">
                        {modalData.staff_id || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="p-column">
        <div className="p-detail-row">
        <span className="p-detail-label">Staff Incentive:</span>
        <span className="p-detail-value incentive-highlight">
          {modalData.staff_incentive || 0}%
        </span>
      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <span className="p-detail-label">Staff ID:</span> {/* New Field */}
                    <span className="p-detail-value">{modalData.staff_id || "N/A"}</span>
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
                    <span className="p-detail-value">{modalData.invoice_number || "N/A"}</span>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Period;