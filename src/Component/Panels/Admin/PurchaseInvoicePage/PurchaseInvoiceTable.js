import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './PurchaseInvoice.css';

const PurchaseInvoiceTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');

  // Sample purchase invoice data
  const purchaseInvoiceData = [
    // Add your purchase invoice data here
  ];

  // Purchase invoice stats data
  const purchaseInvoiceStats = [
    { label: "Total Purchase Invoices", value: "₹ 2,50,000", change: "+18%", type: "total" },
    { label: "Paid Invoices", value: "₹ 1,80,000", change: "+15%", type: "paid" },
    { label: "Pending Invoices", value: "₹ 45,000", change: "+8%", type: "pending" },
    { label: "Overdue Payments", value: "₹ 25,000", change: "-5%", type: "overdue" }
  ];

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
      style: { textAlign: 'center' }
    },
    {
      key: 'created',
      title: 'CREATED DATE',
      style: { textAlign: 'center' }
    }
  ];

  const handleCreateClick = () => {
    navigate("/purchase/create-purchase-invoice");
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
        
        <div className="admin-content-wrapper">
          <div className="purchase-invoice-content-area">
            <div className="purchase-invoice-header-section">
              <div className="purchase-invoice-header-top">
                <div className="purchase-invoice-title-section">
                  <h1 className="purchase-invoice-main-title">Purchase Invoice Management</h1>
                  <p className="purchase-invoice-subtitle">Create, manage and track all your purchase invoices</p>
                </div>
              </div>
            </div>

            {/* Purchase Invoice Stats */}
            <div className="purchase-invoice-stats-grid">
              {purchaseInvoiceStats.map((stat, index) => (
                <div key={index} className={`purchase-invoice-stat-card purchase-invoice-stat-card--${stat.type}`}>
                  <h3 className="purchase-invoice-stat-label">{stat.label}</h3>
                  <div className="purchase-invoice-stat-value">{stat.value}</div>
                  <div className={`purchase-invoice-stat-change ${stat.change.startsWith("+") ? "purchase-invoice-stat-change--positive" : "purchase-invoice-stat-change--negative"}`}>
                    {stat.change} from last month
                  </div>
                </div>
              ))}
            </div>

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
                        <option>January</option>
                        <option>February</option>
                        <option>March</option>
                        <option>April</option>
                        <option>May</option>
                        <option>June</option>
                        <option>July</option>
                        <option>August</option>
                        <option>September</option>
                        <option>October</option>
                        <option>November</option>
                        <option>December</option>
                      </select>
                      <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-auto">
                    <button className="btn btn-success mt-4">
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
                    <button className="btn btn-success mt-4">
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
                  data={purchaseInvoiceData}
                  columns={columns}
                  initialEntriesPerPage={10}
                  searchPlaceholder="Search purchase invoices..."
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