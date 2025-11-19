import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaFilePdf, FaTrash, FaDownload } from 'react-icons/fa';
import './PurchaseInvoice.css';

const PurchaseInvoiceTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Purchase Invoice');
  const navigate = useNavigate();
  
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
    const [deleting, setDeleting] = useState({});

  // Fetch purchase invoices from API
  useEffect(() => {
    fetchPurchaseInvoices();
  }, []);

  // Enhanced fetch function with better error handling and filtering
const fetchPurchaseInvoices = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${baseurl}/transactions`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch purchase invoices: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter transactions where TransactionType is 'Purchase'
    const purchaseInvoicesData = data.filter(transaction => 
      transaction.TransactionType === 'Purchase'
    );
    
    console.log('Raw purchase data:', purchaseInvoicesData);
    
    // Transform the data to match your table structure
    const transformedInvoices = purchaseInvoicesData.map(invoice => ({
      id: invoice.VoucherID,
      supplier: invoice.PartyName || invoice.AccountName || 'N/A',
      pinvoice: invoice.InvoiceNumber || `PUR-${invoice.VchNo || invoice.VoucherID}`,
      totalAmount: `₹ ${parseFloat(invoice.TotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      payment: getPaymentStatus(invoice),
      created: formatDate(invoice.Date || invoice.EntryDate),
      originalData: invoice // Keep original data for reference
    }));
    
    setPurchaseInvoices(transformedInvoices);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching purchase invoices:', err);
    setError(err.message);
    setLoading(false);
  }
};

const handleInvoiceNumberClick = async (invoice) => {
  console.log('Opening preview for invoice:', invoice);
  
  try {
    // Get the VoucherID from the correct location
    const voucherId = invoice.originalData?.VoucherID || invoice.VoucherID;
    
    if (!voucherId) {
      throw new Error('VoucherID not found in invoice data');
    }
    
    console.log('Fetching details for VoucherID:', voucherId);
    
    // Fetch complete invoice data including batch details
    const response = await fetch(`${baseurl}/transactions/${voucherId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice details');
    }
    
    const invoiceDetails = await response.json();
    console.log('Complete invoice details:', invoiceDetails);

    // Parse batch details if they exist
    let items = [];
    let batchDetails = [];
    
  // Function to get invoice by invoice number
  const getInvoiceByNumber = async (invoiceNumber) => {
    try {
      console.log('Fetching invoice by number:', invoiceNumber);
      
      // Get all transactions to find the one with matching invoice number
      const response = await fetch(`${baseurl}/transactions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const allTransactions = await response.json();
      
      // Find the transaction with matching invoice number
      const targetTransaction = allTransactions.find(transaction => 
        transaction.InvoiceNumber === invoiceNumber || 
        transaction.VchNo === invoiceNumber
      );
      
      if (!targetTransaction) {
        throw new Error(`Invoice with number ${invoiceNumber} not found`);
      }
      
      console.log('Found transaction by invoice number:', targetTransaction);
      
      // Now fetch the complete details using the VoucherID
      const detailResponse = await fetch(`${baseurl}/transactions/${targetTransaction.VoucherID}`);
      
      if (!detailResponse.ok) {
        throw new Error('Failed to fetch invoice details');
      }
      
      const invoiceDetails = await detailResponse.json();
      
      if (!invoiceDetails.success) {
        throw new Error('Failed to fetch invoice details');
      }
      
      return invoiceDetails.data;
      
    } catch (error) {
      console.error('Error fetching invoice by number:', error);
      throw error;
    }
  };

    // Calculate GST breakdown
    const totalCGST = parseFloat(invoiceDetails.CGSTAmount) || 0;
    const totalSGST = parseFloat(invoiceDetails.SGSTAmount) || 0;
    const totalIGST = parseFloat(invoiceDetails.IGSTAmount) || 0;
    const totalGST = totalCGST + totalSGST + totalIGST;
    const taxableAmount = parseFloat(invoiceDetails.BasicAmount) || parseFloat(invoiceDetails.Subtotal) || 0;
    const grandTotal = parseFloat(invoiceDetails.TotalAmount) || 0;

    // Prepare the data for preview in the same format as CreateInvoice
    const previewData = {
      invoiceNumber: invoiceDetails.InvoiceNumber || invoiceDetails.VchNo || invoice.number,
      invoiceDate: invoiceDetails.Date || invoice.created,
      validityDate: new Date(new Date(invoiceDetails.Date || invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhuri7@gmail.com",
        phone: "3456548878543",
        gstin: "ZAAABCD0508B1ZG",
        state: "Karnataka"
      },
      supplierInfo: {
        name: invoiceDetails.PartyName || 'N/A',
        businessName: invoiceDetails.AccountName || 'N/A',
        state: invoiceDetails.BillingState || invoiceDetails.billing_state || 'Karnataka',
        gstin: invoiceDetails.GSTIN || invoiceDetails.gstin || 'ZAAACDE1234F225'
      },
      billingAddress: {
        addressLine1: invoiceDetails.BillingAddress || invoiceDetails.billing_address_line1 || '12/A Church Street',
        addressLine2: invoiceDetails.billing_address_line2 || 'Near Main Square',
        city: invoiceDetails.BillingCity || invoiceDetails.billing_city || 'Bangalore',
        pincode: invoiceDetails.BillingPincode || invoiceDetails.billing_pin_code || '560001',
        state: invoiceDetails.BillingState || invoiceDetails.billing_state || 'Karnataka'
      },
      shippingAddress: {
        addressLine1: invoiceDetails.ShippingAddress || invoiceDetails.shipping_address_line1 || invoiceDetails.BillingAddress || invoiceDetails.billing_address_line1 || '12/A Church Street',
        addressLine2: invoiceDetails.shipping_address_line2 || invoiceDetails.billing_address_line2 || 'Near Main Square',
        city: invoiceDetails.ShippingCity || invoiceDetails.shipping_city || invoiceDetails.BillingCity || invoiceDetails.billing_city || 'Bangalore',
        pincode: invoiceDetails.ShippingPincode || invoiceDetails.shipping_pin_code || invoiceDetails.BillingPincode || invoiceDetails.billing_pin_code || '560001',
        state: invoiceDetails.ShippingState || invoiceDetails.shipping_state || invoiceDetails.BillingState || invoiceDetails.billing_state || 'Karnataka'
      },
      items: items,
      note: invoiceDetails.Notes || invoiceDetails.notes || 'Thank you for your business! We appreciate your timely payment.',
      taxableAmount: taxableAmount,
      totalGST: totalGST,
      totalCess: invoiceDetails.TotalCess || 0,
      grandTotal: grandTotal,
      transportDetails: invoiceDetails.TransportDetails || invoiceDetails.transport_details || 'Standard delivery. Contact us for tracking information.',
      additionalCharge: invoiceDetails.AdditionalCharge || '',
      additionalChargeAmount: invoiceDetails.AdditionalChargeAmount || 0,
      otherDetails: "Authorized Signatory",
      taxType: totalIGST > 0 ? "IGST" : "CGST/SGST",
      batchDetails: batchDetails,
      // GST Breakdown
      totalCGST: totalCGST,
      totalSGST: totalSGST,
      totalIGST: totalIGST,
      // Store the VoucherID for the preview page
      voucherId: voucherId
    };

    console.log('Preview data prepared:', previewData);

    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    
    // Navigate to preview page WITH the ID
    navigate(`/purchase/invoice-preview/${voucherId}`);
    
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    const fallbackPreviewData = {
      invoiceNumber: invoice.number,
      invoiceDate: invoice.created,
      validityDate: new Date(new Date(invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhuri7@gmail.com",
        phone: "3456548878543",
        gstin: "ZAAABCD0508B1ZG",
        state: "Karnataka"
      },
      supplierInfo: {
        name: invoice.originalData?.PartyName || 'John A',
        businessName: invoice.originalData?.AccountName || 'John Traders',
        state: 'Karnataka',
        gstin: 'ZAAACDE1234F225'
      },
      billingAddress: {
        addressLine1: '12/A Church Street',
        addressLine2: 'Near Main Square',
        city: 'Bangalore',
        pincode: '560001',
        state: 'Karnataka'
      },
      shippingAddress: {
        addressLine1: '12/A Church Street',
        addressLine2: 'Near Main Square',
        city: 'Bangalore',
        pincode: '560001',
        state: 'Karnataka'
      },
      items: [{
        id: 1,
        product: 'Oppo',
        description: '',
        quantity: 2,
        price: 47200.00,
        discount: 0,
        gst: 18,
        cgst: 9,
        sgst: 9,
        igst: 0,
        cess: 0,
        total: 111392.00,
        batch: '',
        batchDetails: null
      }],
      note: 'Thank you for your business! We appreciate your timely payment.',
      taxableAmount: 94400.00,
      totalGST: 16992.00,
      totalCess: 0,
      grandTotal: 111392.00,
      transportDetails: 'Standard delivery. Contact us for tracking information.',
      additionalCharge: '',
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      batchDetails: [],
      totalCGST: 8496.00,
      totalSGST: 8496.00,
      totalIGST: 0,
      voucherId: invoice.originalData?.VoucherID || 'fallback'
    };

    localStorage.setItem('previewInvoice', JSON.stringify(fallbackPreviewData));
    
    const fallbackId = invoice.originalData?.VoucherID || 'fallback';
    navigate(`/purchase/invoice-preview/${fallbackId}`);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; 
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

  const getPaymentStatus = (invoice) => {
    if (invoice.ChequeNo && invoice.ChequeNo !== 'NULL') {
      return 'Paid';
    }
    
    const invoiceDate = new Date(invoice.Date || invoice.EntryDate);
    const today = new Date();
    const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 45) { 
      return 'Overdue';
    }
    
    return 'Pending';
  };

  const calculatePurchaseStats = () => {
    const totalInvoices = purchaseInvoices.reduce((sum, invoice) => {
      const amount = parseFloat(invoice.originalData?.TotalAmount || 0);
      return sum + amount;
    }, 0);

    const paidInvoices = purchaseInvoices.filter(inv => inv.payment === 'Paid')
      .reduce((sum, invoice) => {
        const amount = parseFloat(invoice.originalData?.TotalAmount || 0);
        return sum + amount;
      }, 0);

    const pendingInvoices = purchaseInvoices.filter(inv => inv.payment === 'Pending')
      .reduce((sum, invoice) => {
        const amount = parseFloat(invoice.originalData?.TotalAmount || 0);
        return sum + amount;
      }, 0);

    const overdueInvoices = purchaseInvoices.filter(inv => inv.payment === 'Overdue')
      .reduce((sum, invoice) => {
        const amount = parseFloat(invoice.originalData?.TotalAmount || 0);
        return sum + amount;
      }, 0);

    return [
      { 
        label: "Total Purchase Invoices", 
        value: `₹ ${totalInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
        change: "+18%", 
        type: "total" 
      },
      { 
        label: "Paid Invoices", 
        value: `₹ ${paidInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
        change: "+15%", 
        type: "paid" 
      },
      { 
        label: "Pending Invoices", 
        value: `₹ ${pendingInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
        change: "+8%", 
        type: "pending" 
      },
      { 
        label: "Overdue Payments", 
        value: `₹ ${overdueInvoices.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
        change: "-5%", 
        type: "overdue" 
      }
    ];
  };

    // Handle Delete Invoice
    // const handleDeleteInvoice = async (invoice) => {
    //   const voucherId = invoice.originalData?.VoucherID || invoice.id;
    //   const invoiceNumber = invoice.number;
      
    //   if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone and will update stock values.`)) {
    //     return;
    //   }
      
    //   try {
    //     setDeleting(prev => ({ ...prev, [voucherId]: true }));
        
    //     const response = await fetch(`${baseurl}/transactions/${voucherId}`, {
    //       method: 'DELETE',
    //     });
        
    //     if (!response.ok) {
    //       throw new Error('Failed to delete invoice');
    //     }
        
    //     const result = await response.json();
        
    //     // Remove from local state
    //     setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
        
    //     alert('Invoice deleted successfully!');
        
    //   } catch (error) {
    //     console.error('Error deleting invoice:', error);
    //     alert('Error deleting invoice: ' + error.message);
    //   } finally {
    //     setDeleting(prev => ({ ...prev, [voucherId]: false }));
    //   }
    // };

    // Handle Delete Invoice
const handleDeleteInvoice = async (invoice) => {
  const voucherId = invoice.originalData?.VoucherID || invoice.id;
  const invoiceNumber = invoice.pinvoice || invoice.originalData?.InvoiceNumber;
  
  if (!window.confirm(`Are you sure you want to delete purchase invoice ${invoiceNumber}? This action cannot be undone and will update stock values.`)) {
    return;
  }
  
  try {
    setDeleting(prev => ({ ...prev, [voucherId]: true }));
    
    const response = await fetch(`${baseurl}/transactions/${voucherId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionType: 'Purchase', // Important: Specify this is a Purchase transaction
        invoiceNumber: invoiceNumber
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete invoice');
    }
    
    const result = await response.json();
    
    // Remove from local state
    setPurchaseInvoices(prev => prev.filter(inv => {
      const invVoucherId = inv.originalData?.VoucherID || inv.id;
      return invVoucherId !== voucherId;
    }));
    
    alert('Purchase invoice deleted successfully! Stock has been updated accordingly.');
    
  } catch (error) {
    console.error('Error deleting purchase invoice:', error);
    alert('Error deleting purchase invoice: ' + error.message);
  } finally {
    setDeleting(prev => ({ ...prev, [voucherId]: false }));
  }
};

  const purchaseInvoiceStats = calculatePurchaseStats();

  const tabs = [
    { name: 'Purchase Invoice', path: '/purchase/purchase-invoice' },
    { name: 'Purchase Order', path: '/purchase/purchase-order' },
    { name: 'Voucher', path: '/purchase/voucher' },
    { name: 'Debit Note', path: '/purchase/debit-note' },
    { name: 'Payables', path: '/purchase/payables' }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  const columns = [
    {
      key: 'supplier',
      title: 'SUPPLIER',
      style: { textAlign: 'left' }
    },
  {
  key: 'pinvoice',
  title: 'PURCHASE INVOICE',
  style: { textAlign: 'center' },
  render: (value, row) => (
    <button 
      className="btn btn-link p-0 text-primary text-decoration-none"
      onClick={() => handleInvoiceNumberClick(row)}
      title="Click to view invoice preview"
    >
      {value}
    </button>
  )
}
,
    {
      key: 'totalAmount',
      title: 'TOTAL AMOUNT',
      style: { textAlign: 'right' }
    },
    {
      key: 'payment',
      title: 'PAYMENT STATUS',
      style: { textAlign: 'center' },
      render: (value) => {
        if (typeof value !== 'string') return '';
        let badgeClass = '';
        if (value === 'Paid') badgeClass = 'status-badge status-paid';
        else if (value === 'Pending') badgeClass = 'status-badge status-pending';
        else if (value === 'Overdue') badgeClass = 'status-badge status-overdue';
        return <span className={badgeClass}>{value}</span>;
      }
    },
    {
  key: 'created',
  title: 'CREATED DATE',
  style: { textAlign: 'center' },
  render: (value, row) => {
    if (!row?.created) return "-"; 
    const date = new Date(row.created);
    return date.toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    });
  }
},
 {
    key: 'actions',
    title: 'ACTIONS',
    style: { textAlign: 'center' },
    render: (value, row) => (
      <div className="d-flex justify-content-center gap-2">
        
        {/* <button
          className={`btn btn-sm ${row.hasPDF ? 'btn-success' : 'btn-outline-warning'}`}
          onClick={() => handleDownloadPDF(row)}
          disabled={downloading[row.id]}
          title={row.hasPDF ? 'Download PDF' : 'Generate and Download PDF'}
        >
          {downloading[row.id] ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : row.hasPDF ? (
            <>
              <FaDownload className="me-1" />
              
            </>
          ) : (
            <>
              <FaFilePdf className="me-1" />
              Generate PDF
            </>
          )}
        </button> */}
        
        {/* Delete Button */}
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDeleteInvoice(row)}
          disabled={deleting[row.id]}
          title="Delete Invoice"
        >
          {deleting[row.id] ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <FaTrash />
          )}
        </button>
      </div>
    )
  },
    // {
    //   key: 'action',
    //   title: 'ACTION',
    //   style: { textAlign: 'center' },
    //   render: (item, index) => (
    //     <button 
    //       className="btn btn-primary btn-sm"
    //       onClick={() => handleViewClick(item)}
    //     >
    //       View
    //     </button>
    //   )
    // }
  ];

  const handleCreateClick = () => {
    navigate("/purchase/create-purchase-invoice");
  };

  const handleViewClick = (invoice) => {
    // Handle view action - you can navigate to detailed view
    console.log('View purchase invoice:', invoice);
    // navigate(`/purchase/purchase-invoice/${invoice.id}`);
  };

  const handleDownloadMonth = () => {
    // Handle month download
    console.log('Download month data:', month, year);
    // Implement download logic here
  };

  const handleDownloadRange = () => {
    // Handle date range download
    console.log('Download range data:', startDate, endDate);
    // Implement download logic here
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`admin-main-content ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader 
            isCollapsed={isCollapsed} 
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            isMobile={window.innerWidth <= 768}
          />
          <div className="admin-content-wrapper">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`admin-main-content ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader 
            isCollapsed={isCollapsed} 
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            isMobile={window.innerWidth <= 768}
          />
          <div className="admin-content-wrapper">
            <div className="alert alert-danger m-3" role="alert">
              Error loading purchase invoices: {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={fetchPurchaseInvoices}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`admin-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader 
          isCollapsed={isCollapsed} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          isMobile={window.innerWidth <= 768}
        />
        
        <div className="admin-content-wrapper">
          <div className="purchase-invoice-content-area">
            {/* ✅ Purchase Navigation Tabs Section */}
            <div className="purchase-invoice-tabs-section">
              <div className="purchase-invoice-tabs-container">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    className={`purchase-invoice-tab ${activeTab === tab.name ? 'purchase-invoice-tab--active' : ''}`}
                    onClick={() => handleTabClick(tab)}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="purchase-invoice-header-section">
              <div className="purchase-invoice-header-top">
                <div className="purchase-invoice-title-section">
                  <h1 className="purchase-invoice-main-title">Purchase Invoice Management</h1>
                  <p className="purchase-invoice-subtitle">Create, manage and track all your purchase invoices</p>
                </div>
              </div>
            </div>

            {/* Purchase Invoice Stats */}
            {/* <div className="purchase-invoice-stats-grid">
              {purchaseInvoiceStats.map((stat, index) => (
                <div key={index} className={`purchase-invoice-stat-card purchase-invoice-stat-card--${stat.type}`}>
                  <h3 className="purchase-invoice-stat-label">{stat.label}</h3>
                  <div className="purchase-invoice-stat-value">{stat.value}</div>
                  <div className={`purchase-invoice-stat-change ${stat.change.startsWith("+") ? "purchase-invoice-stat-change--positive" : "purchase-invoice-stat-change--negative"}`}>
                    {stat.change} from last month
                  </div>
                </div>
              ))}
            </div> */}

            {/* Filters and Actions Section */}
            <div className="purchase-invoice-actions-section">
              <div className="quotation-container p-3">
                <h5 className="mb-3 fw-bold">View Purchase Invoice Details</h5>

                {/* Filters Section */}
                <div className="row align-items-end g-3 mb-3">
                  <div className="col-md-auto">
                    <label className="form-label mb-1">Select Month and Year Data:</label>
                    <div className="d-flex">
                      <select className="form-select me-2" value={month} onChange={(e) => setMonth(e.target.value)}>
                        {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => 
                          <option key={m}>{m}</option>
                        )}
                      </select>
                      <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                        {['2025','2024','2023'].map(y => 
                          <option key={y}>{y}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-success mt-4" onClick={handleDownloadMonth}>
                      <i className="bi bi-download me-1"></i> Download
                    </button>
                  </div>

                  <div className="col-md-auto">
                    <label className="form-label mb-1">Select Date Range:</label>
                    <div className="d-flex">
                      <input 
                        type="date" 
                        className="form-control me-2" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                      />
                      <input 
                        type="date" 
                        className="form-control" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-success mt-4" onClick={handleDownloadRange}>
                      <i className="bi bi-download me-1"></i> Download Range
                    </button>
                  </div>

                  <div className="col-md-auto">
                    <button 
                      className="btn btn-info text-white mt-4"
                      onClick={handleCreateClick}
                    >
                      Create Purchase Invoice
                    </button>
                  </div>
                </div>

                {/* Table Section */}
                <ReusableTable
                  title="Purchase Invoices"
                  data={purchaseInvoices}
                  columns={columns}
                  initialEntriesPerPage={10}
                  searchPlaceholder="Search purchase invoices by supplier or invoice number..."
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoiceTable;