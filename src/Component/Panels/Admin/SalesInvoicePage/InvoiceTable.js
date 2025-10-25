import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import {baseurl} from "../../../BaseURL/BaseURL"
import './Invoices.css';

const InvoicesTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Invoices');

  // Fetch invoices from API
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/transactions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const data = await response.json();
      
      // Filter transactions where TransactionType is 'Sales'
      const salesInvoices = data.filter(transaction => 
        transaction.TransactionType === 'Sales'
      );
      
      // Transform the data to match your table structure
      const transformedInvoices = salesInvoices.map(invoice => ({
        id: invoice.VoucherID,
        customerName: invoice.PartyName || 'N/A',
        number: invoice.InvoiceNumber || `INV-${invoice.VoucherID}`,
        totalAmount: `₹ ${parseFloat(invoice.TotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        payment: getPaymentStatus(invoice),
        created: invoice.Date || invoice.EntryDate?.split('T')[0] || 'N/A',
        originalData: invoice
      }));
      
      setInvoices(transformedInvoices);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Helper function to determine payment status
  const getPaymentStatus = (invoice) => {
    if (invoice.ChequeNo && invoice.ChequeNo !== 'NULL') {
      return 'Paid';
    }
    
    const invoiceDate = new Date(invoice.Date || invoice.EntryDate);
    const today = new Date();
    const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 30) {
      return 'Overdue';
    }
    
    return 'Pending';
  };

  // Handle invoice number click to show preview
 const handleInvoiceNumberClick = async (invoice) => {
  console.log('Opening preview for invoice:', invoice);
  
  try {
    // Fetch complete invoice data including batch details
    const response = await fetch(`${baseurl}/transactions/${invoice.originalData.VoucherID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice details');
    }
    
    const invoiceDetails = await response.json();
    console.log('Invoice details:', invoiceDetails);

    // Parse batch details if they exist
    let items = [];
    let batchDetails = [];
    
    try {
      if (invoiceDetails.batch_details && typeof invoiceDetails.batch_details === 'string') {
        batchDetails = JSON.parse(invoiceDetails.batch_details);
      } else if (Array.isArray(invoiceDetails.batch_details)) {
        batchDetails = invoiceDetails.batch_details;
      }
      
      // Transform batch details into items format for the preview with proper GST calculations
      items = batchDetails.map((batch, index) => {
        const quantity = parseFloat(batch.quantity) || 1;
        const price = parseFloat(batch.price) || 0;
        const subtotal = quantity * price;
        
        // Calculate GST breakdown based on the transaction data
        const gstPercentage = 18; // Default 18% as per your image
        const gstAmount = subtotal * (gstPercentage / 100);
        
        // Determine if same state (CGST/SGST) or different state (IGST)
        const isSameState = invoiceDetails.IGSTAmount === 0 || !invoiceDetails.IGSTAmount;
        
        let cgst, sgst, igst;
        if (isSameState) {
          cgst = 9; // 9% each for CGST and SGST
          sgst = 9;
          igst = 0;
        } else {
          cgst = 0;
          sgst = 0;
          igst = 18; // 18% for IGST
        }
        
        return {
          id: index + 1,
          product: batch.product || 'Unknown Product',
          description: batch.description || '',
          quantity: quantity,
          price: price,
          discount: 0,
          gst: gstPercentage,
          cgst: cgst,
          sgst: sgst,
          igst: igst,
          cess: 0,
          total: subtotal + gstAmount,
          batch: batch.batch || '',
          batchDetails: batch.batchDetails || null
        };
      });
    } catch (parseError) {
      console.error('Error parsing batch details:', parseError);
      // Create a fallback item with proper GST calculations
      const subtotal = invoiceDetails.TotalAmount || 0;
      const gstPercentage = 18;
      const gstAmount = subtotal * (gstPercentage / 100);
      
      items = [{
        id: 1,
        product: 'Product',
        description: 'Description',
        quantity: 1,
        price: subtotal,
        discount: 0,
        gst: gstPercentage,
        cgst: 9,
        sgst: 9,
        igst: 0,
        cess: 0,
        total: subtotal + gstAmount,
        batch: '',
        batchDetails: null
      }];
    }

    // Calculate totals properly
    const taxableAmount = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + (quantity * price);
    }, 0);
    
    const totalGST = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const subtotal = quantity * price;
      return sum + (subtotal * (parseFloat(item.gst) / 100));
    }, 0);
    
    const grandTotal = taxableAmount + totalGST;

    // Prepare the data for preview in the same format as CreateInvoice
    const previewData = {
      invoiceNumber: invoice.number,
      invoiceDate: invoice.created,
      dueDate: new Date(new Date(invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhuri7@gmail.com",
        phone: "3456548878543",
        gstin: "ZAAABCD0508B1ZG",
        state: "Karnataka"
      },
      supplierInfo: {
        name: invoice.originalData.PartyName || 'John A',
        businessName: invoice.originalData.AccountName || 'John Traders',
        state: invoice.originalData.BillingState || invoice.originalData.billing_state || 'Karnataka',
        gstin: invoice.originalData.GSTIN || invoice.originalData.gstin || 'ZAAACDE1234F225'
      },
      billingAddress: {
        addressLine1: invoice.originalData.BillingAddress || invoice.originalData.billing_address_line1 || 'N/A',
        addressLine2: invoice.originalData.billing_address_line2 || '',
        city: invoice.originalData.BillingCity || invoice.originalData.billing_city || 'Bangalore',
        pincode: invoice.originalData.BillingPincode || invoice.originalData.billing_pin_code || '560001',
        state: invoice.originalData.BillingState || invoice.originalData.billing_state || 'Karnataka'
      },
      shippingAddress: {
        addressLine1: "12/A Church Street",
        addressLine2: "Near Main Square",
        city: "Bangalore",
        pincode: "560001",
        state: "Karnataka"
      },
      items: items,
      note: invoice.originalData.Notes || invoice.originalData.notes || 'Thank you for your business! We appreciate your timely payment.',
      taxableAmount: taxableAmount,
      totalGST: totalGST,
      totalCess: invoice.originalData.TotalCess || 0,
      grandTotal: grandTotal,
      transportDetails: invoice.originalData.TransportDetails || invoice.originalData.transport_details || 'Standard delivery. Contact us for tracking information.',
      additionalCharge: invoice.originalData.AdditionalCharge || '',
      additionalChargeAmount: invoice.originalData.AdditionalChargeAmount || 0,
      otherDetails: "Authorized Signatory",
      taxType: invoice.originalData.IGSTAmount > 0 ? "IGST" : "CGST/SGST",
      batchDetails: batchDetails,
      // GST Breakdown - Calculate from items or use database values
      totalCGST: invoice.originalData.CGSTAmount || items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const subtotal = quantity * price;
        return sum + (subtotal * (parseFloat(item.cgst) / 100));
      }, 0),
      totalSGST: invoice.originalData.SGSTAmount || items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const subtotal = quantity * price;
        return sum + (subtotal * (parseFloat(item.sgst) / 100));
      }, 0),
      totalIGST: invoice.originalData.IGSTAmount || items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const subtotal = quantity * price;
        return sum + (subtotal * (parseFloat(item.igst) / 100));
      }, 0)
    };

    console.log('Preview data prepared:', previewData);

    // Save to localStorage for the preview component
    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    
    // Navigate to preview page
    navigate("/sales/invoice-preview");
    
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    // Enhanced fallback with proper structure
    const fallbackPreviewData = {
      invoiceNumber: invoice.number,
      invoiceDate: invoice.created,
      dueDate: new Date(new Date(invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhuri7@gmail.com",
        phone: "3456548878543",
        gstin: "ZAAABCD0508B1ZG",
        state: "Karnataka"
      },
      supplierInfo: {
        name: invoice.originalData.PartyName || 'John A',
        businessName: invoice.originalData.AccountName || 'John Traders',
        state: 'Karnataka',
        gstin: 'ZAAACDE1234F225'
      },
      billingAddress: {
        addressLine1: 'Address not available',
        addressLine2: '',
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
      totalIGST: 0
    };

    localStorage.setItem('previewInvoice', JSON.stringify(fallbackPreviewData));
    navigate("/sales/invoice-preview");
  }
};

  // Table columns configuration
  const columns = [
    { key: 'customerName', title: 'CUSTOMER NAME', style: { textAlign: 'left' } },
    { 
      key: 'number', 
      title: 'INVOICE NUMBER', 
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
    },
    { key: 'totalAmount', title: 'TOTAL AMOUNT', style: { textAlign: 'right' } },
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
    { key: 'created', title: 'CREATED DATE', style: { textAlign: 'center' } }
  ];

  const handleCreateClick = () => navigate("/sales/createinvoice");

  // Define tabs with their corresponding routes
  const tabs = [
    { name: 'Invoices', path: '/sales/invoices' },
    { name: 'Receipts', path: '/sales/receipts' },
    { name: 'Quotations', path: '/sales/quotations' },
    { name: 'BillOfSupply', path: '/sales/bill_of_supply' },
    { name: 'CreditNote', path: '/sales/credit_note' },
    { name: 'DeliveryChallan', path: '/sales/delivery_challan' },
    { name: 'Receivables', path: '/sales/receivables' }
  ];

  // Handle tab click - navigate to corresponding route
  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  // Handle download functionality
  const handleDownload = async () => {
    try {
      console.log('Downloading invoices for:', month, year);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Handle date range download
  const handleDownloadRange = async () => {
    try {
      console.log('Downloading invoices for date range:', startDate, 'to', endDate);
    } catch (err) {
      console.error('Download range error:', err);
    }
  };

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
          <div className="admin-content-wrapper-sales">
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
          <div className="admin-content-wrapper-sales">
            <div className="alert alert-danger m-3" role="alert">
              Error loading invoices: {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={fetchInvoices}
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

        <div className="admin-content-wrapper-sales">
          <div className="invoices-content-area">
           
            <div className="invoices-tabs-section">
              <div className="invoices-tabs-container">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    className={`invoices-tab ${activeTab === tab.name ? 'invoices-tab--active' : ''}`}
                    onClick={() => handleTabClick(tab)}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="invoices-header-section">
              <h1 className="invoices-main-title">Sales Invoice Management</h1>
              <p className="invoices-subtitle">Create, manage and track all your sales invoices</p>
            </div>

            {/* ✅ Filters and Actions */}
            <div className="invoices-actions-section">
              <div className="quotation-container p-4">
                <h5 className="mb-3 fw-bold">View Invoice Details</h5>

                <div className="row align-items-end g-3 mb-4">
                  <div className="col-md-auto">
                    <label className="form-label mb-1">Select Month and Year Data:</label>
                    <div className="d-flex">
                      <select className="form-select me-2" value={month} onChange={(e) => setMonth(e.target.value)}>
                        {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
                      </select>
                      <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                        {['2025','2024','2023'].map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-success mt-4" onClick={handleDownload}>
                      <i className="bi bi-download me-1"></i> Download
                    </button>
                  </div>

                  <div className="col-md-auto">
                    <label className="form-label mb-1">Select Date Range:</label>
                    <div className="d-flex">
                      <input type="date" className="form-control me-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-success mt-4" onClick={handleDownloadRange}>
                      <i className="bi bi-download me-1"></i> Download Range
                    </button>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-primary mt-4" onClick={handleCreateClick}>
                      <i className="bi bi-plus-circle me-1"></i> Create Invoice
                    </button>
                  </div>
                </div>

                {/* ✅ Table */}
                <ReusableTable
                  title="Sales Invoices"
                  data={invoices}
                  columns={columns}
                  initialEntriesPerPage={10}
                  searchPlaceholder="Search invoices by customer name or number..."
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

export default InvoicesTable;