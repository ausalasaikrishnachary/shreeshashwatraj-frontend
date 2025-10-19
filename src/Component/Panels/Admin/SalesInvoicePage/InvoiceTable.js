import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './Invoices.css';

const InvoicesTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Invoices');

  // ✅ Simple flat data (no nested objects)
  const invoiceData = [
    { 
      customerName: "Rajesh Kumar", 
      number: "INV-001", 
      totalAmount: "₹ 15,000.00", 
      payment: "Paid", 
      created: "2025-07-01" 
    },
    { 
      customerName: "Priya Sharma", 
      number: "INV-002", 
      totalAmount: "₹ 25,000.00", 
      payment: "Pending", 
      created: "2025-07-02" 
    },
    { 
      customerName: "Amit Patel", 
      number: "INV-003", 
      totalAmount: "₹ 18,500.00", 
      payment: "Paid", 
      created: "2025-07-03" 
    },
    { 
      customerName: "Sneha Reddy", 
      number: "INV-004", 
      totalAmount: "₹ 32,000.00", 
      payment: "Overdue", 
      created: "2025-07-04" 
    }
  ];

  const invoiceStats = [
    { label: "Total Invoices", value: "₹ 1,50,000", change: "+15%", type: "total" },
    { label: "Paid Invoices", value: "₹ 1,20,000", change: "+12%", type: "paid" },
    { label: "Pending Invoices", value: "₹ 25,000", change: "+5%", type: "pending" },
    { label: "Overdue Invoices", value: "₹ 5,000", change: "-3%", type: "overdue" }
  ];

  // ✅ Columns must map directly to string values, not objects
  const columns = [
    { key: 'customerName', title: 'CUSTOMER NAME', style: { textAlign: 'left' } },
    { key: 'number', title: 'INVOICE NUMBER', style: { textAlign: 'center' } },
    { key: 'totalAmount', title: 'TOTAL AMOUNT', style: { textAlign: 'right' } },
    {
      key: 'payment',
      title: 'PAYMENT STATUS',
      style: { textAlign: 'center' },
      render: (value) => {
        if (typeof value !== 'string') return ''; // ✅ Prevent object rendering
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
            
            {/* ✅ Tabs Section */}
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

            {/* ✅ Stats Section */}
            <div className="invoices-stats-grid">
              {invoiceStats.map((stat, index) => (
                <div key={index} className={`invoices-stat-card invoices-stat-card--${stat.type}`}>
                  <h3 className="invoices-stat-label">{stat.label}</h3>
                  <div className="invoices-stat-value">{stat.value}</div>
                  <div className={`invoices-stat-change ${stat.change.startsWith("+") ? "invoices-stat-change--positive" : "invoices-stat-change--negative"}`}>
                    {stat.change} from last month
                  </div>
                </div>
              ))}
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
                    <button className="btn btn-success mt-4"><i className="bi bi-download me-1"></i> Download</button>
                  </div>

                  <div className="col-md-auto">
                    <label className="form-label mb-1">Select Date Range:</label>
                    <div className="d-flex">
                      <input type="date" className="form-control me-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-success mt-4"><i className="bi bi-download me-1"></i> Download Range</button>
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
                  data={invoiceData}
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