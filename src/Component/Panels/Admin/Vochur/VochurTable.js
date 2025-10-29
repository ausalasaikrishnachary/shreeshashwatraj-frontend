import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './Voucher.css';

const VoucherTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Voucher');
  const navigate = useNavigate();

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');

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

  // Sample voucher data
  const voucherData = [
    // Add your voucher data here
    // Example:
    // {
    //   payee: "John Doe",
    //   number: "VOU-001",
    //   amount: "₹ 10,000.00",
    //   accounting: "Expense",
    //   action: "View"
    // }
  ];

  // Voucher stats data
  const voucherStats = [
    { label: "Total Vouchers", value: "₹ 1,00,000", change: "+12%", type: "total" },
    { label: "Expense Vouchers", value: "₹ 75,000", change: "+8%", type: "expense" },
    { label: "Payment Vouchers", value: "₹ 20,000", change: "+15%", type: "payment" },
    { label: "Receipt Vouchers", value: "₹ 5,000", change: "-3%", type: "receipt" }
  ];

  const columns = [
    {
      key: 'payee',
      title: 'PAYEE',
      style: { textAlign: 'left' }
    },
    {
      key: 'number',
      title: 'NUMBER',
      style: { textAlign: 'center' }
    },
    {
      key: 'amount',
      title: 'AMOUNT',
      style: { textAlign: 'right' }
    },
    {
      key: 'accounting',
      title: 'ACCOUNTING',
      style: { textAlign: 'center' }
    },
    {
      key: 'action',
      title: 'ACTION',
      style: { textAlign: 'center' },
      render: (item, index) => (
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => handleViewClick(item)}
        >
          View
        </button>
      )
    }
  ];

  const handleCreateClick = () => {
    navigate("/purchase/create-voucher");
  };

  const handleViewClick = (voucher) => {
    // Handle view action
    console.log('View voucher:', voucher);
    // navigate(`/purchase/voucher/${voucher.id}`);
  };

  const handleDownloadMonth = () => {
    // Handle month download
    console.log('Download month data:', month, year);
  };

  const handleDownloadRange = () => {
    // Handle date range download
    console.log('Download range data:', startDate, endDate);
  };

  return (
    <div className="voucher-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`voucher-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="voucher-content-area">
          {/* ✅ Purchase Navigation Tabs Section */}
          <div className="voucher-tabs-section">
            <div className="voucher-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`voucher-tab ${activeTab === tab.name ? 'voucher-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="voucher-header-section">
            <div className="voucher-header-top">
              <div className="voucher-title-section">
                <h1 className="voucher-main-title">Voucher Management</h1>
                <p className="voucher-subtitle">Create, manage and track all your vouchers</p>
              </div>
            </div>
          </div>

          {/* Voucher Stats */}
          {/* <div className="voucher-stats-grid">
            {voucherStats.map((stat, index) => (
              <div key={index} className={`voucher-stat-card voucher-stat-card--${stat.type}`}>
                <h3 className="voucher-stat-label">{stat.label}</h3>
                <div className="voucher-stat-value">{stat.value}</div>
                <div className={`voucher-stat-change ${stat.change.startsWith("+") ? "voucher-stat-change--positive" : "voucher-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div> */}

          {/* Filters and Actions Section */}
          <div className="voucher-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Voucher</h5>

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
                    Create
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <ReusableTable
                title="Vouchers"
                data={voucherData}
                columns={columns}
                initialEntriesPerPage={10}
                searchPlaceholder="Search vouchers..."
                showSearch={true}
                showEntriesSelector={true}
                showPagination={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherTable;