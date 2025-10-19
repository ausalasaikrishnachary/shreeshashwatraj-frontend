// ReceiptsTable.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './Receipts.css';

const ReceiptsTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Receipts');

  // Sample receipt data
  const receiptData = [
    // Add your receipt data here
    // Example:
    // {
    //   payee: "John Doe",
    //   number: "RCP-001",
    //   amount: "$1,000.00",
    //   accounting: "Cash",
    //   date: "2025-07-01"
    // }
  ];

  // Receipt stats data
  const receiptStats = [
    { label: "Total Receipts", value: "₹ 2,50,000", change: "+18%", type: "total" },
    { label: "Cash Receipts", value: "₹ 1,50,000", change: "+15%", type: "cash" },
    { label: "Bank Receipts", value: "₹ 80,000", change: "+20%", type: "bank" },
    { label: "Digital Receipts", value: "₹ 20,000", change: "+25%", type: "digital" }
  ];

  const columns = [
    {
      key: 'payee',
      title: 'PAYEE',
      style: { textAlign: 'left' }
    },
    {
      key: 'number',
      title: 'RECEIPT NUMBER',
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
      key: 'date',
      title: 'DATE',
      style: { textAlign: 'center' }
    }
  ];

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

//   const handleCreateClick = () => {
//     navigate("/createreceipt");
//   };

  return (
    <div className="receipts-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`receipts-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="receipts-content-area">
          {/* ✅ Tabs Section */}
          <div className="receipts-tabs-section">
            <div className="receipts-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`receipts-tab ${activeTab === tab.name ? 'receipts-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="receipts-header-section">
            <div className="receipts-header-top">
              <div className="receipts-title-section">
                <h1 className="receipts-main-title">Receipt Management</h1>
                <p className="receipts-subtitle">Create, manage and track all your payment receipts</p>
              </div>
            </div>
          </div>

          {/* Receipt Stats */}
          <div className="receipts-stats-grid">
            {receiptStats.map((stat, index) => (
              <div key={index} className={`receipts-stat-card receipts-stat-card--${stat.type}`}>
                <h3 className="receipts-stat-label">{stat.label}</h3>
                <div className="receipts-stat-value">{stat.value}</div>
                <div className={`receipts-stat-change ${stat.change.startsWith("+") ? "receipts-stat-change--positive" : "receipts-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Actions Section */}
          <div className="receipts-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Receipts</h5>

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
                    // onClick={handleCreateClick}
                  >
                    Create Receipt
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <ReusableTable
                title="Receipts"
                data={receiptData}
                columns={columns}
                initialEntriesPerPage={10}
                searchPlaceholder="Search receipts..."
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

export default ReceiptsTable;