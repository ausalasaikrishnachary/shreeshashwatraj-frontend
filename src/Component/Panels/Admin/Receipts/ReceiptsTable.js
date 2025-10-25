import React, { useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from '../../../BaseURL/BaseURL';
import './Receipts.css';

const ReceiptsTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);


  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Receipts');

  const receiptData = [];
  const receiptStats = [
    { label: "Total Receipts", value: "₹ 2,50,000", change: "+18%", type: "total" },
    { label: "Cash Receipts", value: "₹ 1,50,000", change: "+15%", type: "cash" },
    { label: "Bank Receipts", value: "₹ 80,000", change: "+20%", type: "bank" },
    { label: "Digital Receipts", value: "₹ 20,000", change: "+25%", type: "digital" }
  ];

  const columns = [
    { key: 'payee', title: 'PAYEE', style: { textAlign: 'left' } },
    { key: 'number', title: 'RECEIPT NUMBER', style: { textAlign: 'center' } },
    { key: 'amount', title: 'AMOUNT', style: { textAlign: 'right' } },
    { key: 'accounting', title: 'ACCOUNTING', style: { textAlign: 'center' } },
    { key: 'date', title: 'DATE', style: { textAlign: 'center' } }
  ];

  const tabs = [
    { name: 'Invoices', path: '/sales/invoices' },
    { name: 'Receipts', path: '/sales/receipts' },
    { name: 'Quotations', path: '/sales/quotations' },
    { name: 'BillOfSupply', path: '/sales/bill_of_supply' },
    { name: 'CreditNote', path: '/sales/credit_note' },
    { name: 'DeliveryChallan', path: '/sales/delivery_challan' },
    { name: 'Receivables', path: '/sales/receivables' }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  const handleCreateClick = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${baseurl}/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  fetchAccounts();
}, []);


  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="receipts-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`receipts-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className="receipts-content-area">
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

          {/* <div className="receipts-stats-grid">
            {receiptStats.map((stat, index) => (
              <div key={index} className={`receipts-stat-card receipts-stat-card--${stat.type}`}>
                <h3 className="receipts-stat-label">{stat.label}</h3>
                <div className="receipts-stat-value">{stat.value}</div>
                <div className={`receipts-stat-change ${stat.change.startsWith("+") ? "receipts-stat-change--positive" : "receipts-stat-change--negative"}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div> */}

          <div className="receipts-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Receipts</h5>

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
                    Create Receipt
                  </button>
                </div>
              </div>

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

        {/* Modal Popup */}
        {isModalOpen && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog" style={{ maxWidth: '800px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create Receipt</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                     <div className="company-info-recepits-table text-center">
  <label className="form-label-recepits-table">Navkar Exports</label>
  <p>NO.63/603 AND 64/604, NEAR JAIN TEMPLE</p>
  <p>1ST MAIN ROAD, T DASARAHALLI</p>
  <p>GST : 29AAAMPC7994B1ZE</p>
  <p>Email: akshay555.ak@gmail.com</p>
  <p>Phone: 09880990431</p>
</div>

                    </div>
                    <div className="col-md-6">
                  <div className="mb-3">
  <input
    type="text"
    className="form-control"
    placeholder="REC0001"
  />
</div>
          
                      <div className="mb-3 ">
                        
                         
                       <input
  type="date"
  className="form-control"
  placeholder="dd-mm-yyyy"
/>

                        <select className="form-select mt-2">
                          <option>Direct Deposit</option>
                          <option>online payment</option>
                                <option>Credit/Debit Card</option>
                                      <option>Demand Draft</option>
                                            <option>Cheque</option>
                                                  <option>Cash</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                    <div className="mb-3">
  <label className="form-label">Retailer</label>
  <select className="form-select" required>
    <option value="">Select Retailer</option>

    {accounts.map((acc) => (
      <option key={acc.id} value={acc.id}>
        {acc.name}
      </option>
    ))}
  </select>
</div>

                    </div>
<div class="col-md-6">
  <label class="form-label">Amount</label>

  <div class="input-group custom-amount-receipts-table">
    <select class="form-select currency-select-receipts-table">
      <option selected>INR</option>
      <option>GHS</option>
      <option>GIP</option>
      <option>GMD</option>
      <option>GNF</option>
      <option>GTQ</option>
      <option>GYD</option>
      <option>HKD</option>
      <option>HNL</option>
      <option>HRK</option>
      <option>HTG</option>
      <option>HUF</option>
      <option>IDR</option>
      <option>IMP</option>
      <option>ILS</option>
    </select>

    <input type="number" class="form-control amount-input-receipts-table" placeholder="Amount" />
  </div>
</div>


                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Note</label>
                        <textarea className="form-control" rows="3"></textarea>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">For</label>
                        <p>Authorised Signatory</p>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Bank Name</label>
                        <input type="text" className="form-control" placeholder="Bank Name" />
                        <label className="form-label mt-2">Transaction Proof Document</label>
                        <input type="file" className="form-control" />
                        <p>No file chosen</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Transaction Date</label>
                        <input type="text" className="form-control" placeholder="dd-mm-yyyy" />
                        <label className="form-label mt-2">Reconciliation Option</label>
                        <select className="form-select">
                          <option>Do Not Reconcile</option>
                             <option>Customer Reconcile</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                  <button type="button" className="btn btn-primary">Create</button>
                 
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsTable;