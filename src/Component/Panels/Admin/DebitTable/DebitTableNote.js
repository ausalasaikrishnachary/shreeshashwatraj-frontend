import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './DebitNote.css';

const DebitNoteTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Debit Note');
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

  // Sample debit note data
  const debitNoteData = [
    // Add your debit note data here
    // Example:
    // {
    //   supplierName: "ABC Suppliers",
    //   noteNumber: "DN-001",
    //   document: "DN_001.pdf",
    //   debitAmount: "₹ 15,000.00",
    //   created: "2025-07-15",
    //   action: "View"
    // }
  ];

  // Debit note stats data
  const debitNoteStats = [
    { label: "Total Debit Notes", value: "₹ 2,50,000", change: "+18%", type: "total" },
    { label: "This Month", value: "₹ 45,000", change: "+12%", type: "month" },
    { label: "Pending Approval", value: "₹ 75,000", change: "+5%", type: "pending" },
    { label: "Approved", value: "₹ 1,75,000", change: "+22%", type: "approved" }
  ];

  const columns = [
    {
      key: 'supplierName',
      title: 'SUPPLIER NAME',
      style: { textAlign: 'left' }
    },
    {
      key: 'noteNumber',
      title: 'NOTE NUMBER',
      style: { textAlign: 'center' }
    },
    {
      key: 'document',
      title: 'DOCUMENT',
      style: { textAlign: 'center' },
      render: (item) => (
        item.document ? (
          <a href="#" className="document-link" onClick={(e) => handleDocumentClick(e, item.document)}>
            <i className="bi bi-file-earmark-pdf me-1"></i>
            {item.document}
          </a>
        ) : (
          <span className="text-muted">No document</span>
        )
      )
    },
    {
      key: 'debitAmount',
      title: 'DEBIT AMOUNT',
      style: { textAlign: 'right' }
    },
    {
      key: 'created',
      title: 'CREATED',
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
    navigate("/purchase/create-debit-note");
  };

  const handleViewClick = (debitNote) => {
    // Handle view action
    console.log('View debit note:', debitNote);
    // navigate(`/purchase/debit-note/${debitNote.id}`);
  };

  const handleDocumentClick = (e, documentName) => {
    e.preventDefault();
    // Handle document download/view
    console.log('Download document:', documentName);
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
    <div className="debit-note-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`debit-note-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="debit-note-content-area">
          {/* ✅ Purchase Navigation Tabs Section */}
          <div className="debit-note-tabs-section">
            <div className="debit-note-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`debit-note-tab ${activeTab === tab.name ? 'debit-note-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="debit-note-header-section">
            <div className="debit-note-header-top">
              <div className="debit-note-title-section">
                <h1 className="debit-note-main-title">Debit Note Management</h1>
                <p className="debit-note-subtitle">Create, manage and track all your debit notes</p>
              </div>
            </div>
          </div>

          {/* Debit Note Stats */}
          <div className="debit-note-stats-grid">
            {debitNoteStats.map((stat, index) => (
              <div key={index} className={`debit-note-stat-card debit-note-stat-card--${stat.type}`}>
                <h3 className="debit-note-stat-label">{stat.label}</h3>
                <div className="debit-note-stat-value">{stat.value}</div>
                <div className={`debit-note-stat-change ${stat.change.startsWith("+") ? "debit-note-stat-change--positive" : "debit-note-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Actions Section */}
          <div className="debit-note-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Debit Note Details</h5>

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
                title="Debit Notes"
                data={debitNoteData}
                columns={columns}
                initialEntriesPerPage={10}
                searchPlaceholder="Search debit notes..."
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

export default DebitNoteTable;