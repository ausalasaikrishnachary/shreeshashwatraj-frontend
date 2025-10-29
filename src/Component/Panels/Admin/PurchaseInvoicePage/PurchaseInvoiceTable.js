import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from "../../../BaseURL/BaseURL";
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

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

  // Helper function to determine payment status for purchase invoices
  const getPaymentStatus = (invoice) => {
    // For purchase invoices, you might have different logic
    // For now, let's assume if ChequeNo is provided, it's paid
    if (invoice.ChequeNo && invoice.ChequeNo !== 'NULL') {
      return 'Paid';
    }
    
    const invoiceDate = new Date(invoice.Date || invoice.EntryDate);
    const today = new Date();
    const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
    
    // For purchase, overdue might be different criteria
    if (daysDiff > 45) { // 45 days credit period for purchases
      return 'Overdue';
    }
    
    return 'Pending';
  };

  // Calculate stats from actual purchase data
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

  const purchaseInvoiceStats = calculatePurchaseStats();

  // Define tabs with their corresponding routes
  const tabs = [
    { name: 'Purchase Invoice', path: '/purchase/purchase-invoice' },
    { name: 'Purchase Order', path: '/purchase/purchase-order' },
    { name: 'Voucher', path: '/purchase/voucher' },
    { name: 'Debit Note', path: '/purchase/debit-note' },
    { name: 'Payables', path: '/purchase/payables' }
  ];

  // Handle tab click - navigate to corresponding route
  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  // Table columns configuration for purchase invoices
  const columns = [
    {
      key: 'supplier',
      title: 'SUPPLIER',
      style: { textAlign: 'left' }
    },
    {
      key: 'pinvoice',
      title: 'PURCHASE INVOICE',
      style: { textAlign: 'center' }
    },
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
    if (!row?.created) return "-"; // fallback if no date
    const date = new Date(row.created);
    return date.toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    });
  }
}
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