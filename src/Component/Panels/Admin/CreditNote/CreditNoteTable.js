// CreditNoteTable.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './CreditNote.css';

const CreditNoteTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('CreditNote');




    const handleCreateClick = () => navigate("/sales/create_note");


  // Sample credit note data
  const creditNoteData = [
    // Add your credit note data here
    // Example:
    // {
    //   customerName: "John Doe",
    //   noteNumber: "CN-001",
    //   document: "INV-001",
    //   creditAmount: "$500.00",
    //   created: "2025-07-01",
    //   status: "Active"
    // }
  ];

  // Credit Note stats data
  // const creditNoteStats = [
  //   { label: "Total Credit Notes", value: "₹ 75,000", change: "+8%", type: "total" },
  //   { label: "Active Credit Notes", value: "₹ 50,000", change: "+12%", type: "active" },
  //   { label: "Used Credit Notes", value: "₹ 20,000", change: "+5%", type: "used" },
  //   { label: "Expired Credit Notes", value: "₹ 5,000", change: "-3%", type: "expired" }
  // ];

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

  // Custom renderers
  const renderDocument = (item) => (
    <div className="credit-note-table__document-cell">
      <span className="credit-note-table__document-number">{item.document}</span>
      {item.documentType && (
        <span className="credit-note-table__document-type">{item.documentType}</span>
      )}
    </div>
  );

  const renderCreditAmount = (item) => (
    <div className="credit-note-table__amount-cell">
      <div className="credit-note-table__amount">{item.creditAmount}</div>
      <div className={`credit-note-table__status credit-note-table__status--${item.status?.toLowerCase() || 'active'}`}>
        {item.status || 'Active'}
      </div>
    </div>
  );

  const renderAction = (item) => (
    <div className="credit-note-table__actions">
      <button 
        className="btn btn-sm btn-outline-primary me-1"
        onClick={() => handleView(item)}
        title="View Credit Note"
      >
        <i className="bi bi-eye"></i>
      </button>
      <button 
        className="btn btn-sm btn-outline-success me-1"
        onClick={() => handleEdit(item)}
        title="Edit Credit Note"
      >
        <i className="bi bi-pencil"></i>
      </button>
      <button 
        className="btn btn-sm btn-outline-danger"
        onClick={() => handleDelete(item)}
        title="Delete Credit Note"
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  );

  const columns = [
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
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
      render: (item) => renderDocument(item),
      style: { textAlign: 'center' }
    },
    {
      key: 'creditAmount',
      title: 'CREDIT AMOUNT',
      render: (item) => renderCreditAmount(item),
      style: { textAlign: 'right' }
    },
    {
      key: 'created',
      title: 'CREATED DATE',
      style: { textAlign: 'center' }
    },
    {
      key: 'action',
      title: 'ACTION',
      render: (item) => renderAction(item),
      style: { textAlign: 'center', width: '150px' }
    }
  ];

//   const handleCreateClick = () => {
//     navigate("/create-credit-note");
//   };

  const handleView = (item) => {
    console.log('View credit note:', item);
    // Navigate to view details page or show modal
  };

  const handleEdit = (item) => {
    console.log('Edit credit note:', item);
    // Navigate to edit page
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete credit note ${item.noteNumber}?`)) {
      console.log('Delete credit note:', item);
      // Handle delete logic
    }
  };

  return (
    <div className="credit-note-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`credit-note-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="credit-note-content-area">
          {/* ✅ Tabs Section */}
          <div className="credit-note-tabs-section">
            <div className="credit-note-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`credit-note-tab ${activeTab === tab.name ? 'credit-note-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="credit-note-header-section">
            <div className="credit-note-header-top">
              <div className="credit-note-title-section">
                <h1 className="credit-note-main-title">Credit Note Management</h1>
                <p className="credit-note-subtitle">Create, manage and track all your credit notes</p>
              </div>
            </div>
          </div>

          {/* Credit Note Stats */}
          {/* <div className="credit-note-stats-grid">
            {creditNoteStats.map((stat, index) => (
              <div key={index} className={`credit-note-stat-card credit-note-stat-card--${stat.type}`}>
                <h3 className="credit-note-stat-label">{stat.label}</h3>
                <div className="credit-note-stat-value">{stat.value}</div>
                <div className={`credit-note-stat-change ${stat.change.startsWith("+") ? "credit-note-stat-change--positive" : "credit-note-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div> */}

          {/* Filters and Actions Section */}
          <div className="credit-note-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Credit Note Details</h5>

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
                    Create Credit Note
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <ReusableTable
                title="Credit Notes"
                data={creditNoteData}
                columns={columns}
                initialEntriesPerPage={10}
                searchPlaceholder="Search credit notes..."
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

export default CreditNoteTable;