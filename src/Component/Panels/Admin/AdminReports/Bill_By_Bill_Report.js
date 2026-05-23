import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { baseurl } from "../../../BaseURL/BaseURL";
import './Bill_By_Bill_Report.css';

function Bill_By_Bill_Report() {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    customer_id: '',
    start_date: '',
    end_date: '',
    show_only_pending: false
  });
  const [customers, setCustomers] = useState([]);

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${baseurl}/accounts`);
          const data = await res.json();
        setCustomers(data);
      }
     catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch bill by bill report
  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.customer_id) params.customer_id = filters.customer_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.show_only_pending) params.show_only_pending = 'true';
      
      const response = await axios.get(`${baseurl}/api/reports/bill-by-bill`, { params });
      
      if (response.data.success) {
        setReportData(response.data.data);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Error fetching report: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchReport();
  }, []);

  // Columns for the table
  const Columns = [
    {
      key: "partyname",
      title: "Customer Name",
      style: { textAlign: "left", minWidth: "150px" },
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.partyname}</div>
          <div style={{ fontSize: "11px", color: "#666" }}>{row.business_name}</div>
        </div>
      )
    },
    {
      key: "vchno",
      title: "Invoice No.",
      style: { textAlign: "center" },
      render: (value) => value || "-"
    },
    {
      key: "invoicedate",
      title: "Invoice Date",
      style: { textAlign: "center" }
    },
    {
      key: "duedate",
      title: "Due Date",
      style: { textAlign: "center" },
      render: (value, row) => {
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today && row.pendingamount > 0;
        return (
          <span style={{ color: isOverdue ? '#dc3545' : '#333', fontWeight: isOverdue ? 'bold' : 'normal' }}>
            {value || "-"}
            {isOverdue && <span style={{ fontSize: "10px", display: "block" }}>(Overdue)</span>}
          </span>
        );
      }
    },
    {
      key: "originalamount",
      title: "Bill Amount (₹)",
      style: { textAlign: "right" },
      render: (value) => `₹ ${parseFloat(value).toLocaleString('en-IN')}`
    },
    {
      key: "totalpaid",
      title: "Paid Amount (₹)",
      style: { textAlign: "right" },
      render: (value) => `₹ ${parseFloat(value).toLocaleString('en-IN')}`
    },
    {
      key: "pendingamount",
      title: "Pending Amount (₹)",
      style: { textAlign: "right" },
      render: (value, row) => (
        <span style={{ 
          color: parseFloat(value) > 0 ? '#dc3545' : '#28a745',
          fontWeight: 'bold'
        }}>
          ₹ ${parseFloat(value).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: "status",
      title: "Status",
      style: { textAlign: "center" },
      render: (value, row) => {
        const statusColors = {
          'Paid': '#28a745',
          'Partially Paid': '#ffc107',
          'Pending': '#dc3545',
          'Overdue': '#dc3545'
        };
        return (
          <span style={{
            backgroundColor: statusColors[value] || '#6c757d',
            color: 'white',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            display: 'inline-block'
          }}>
            {value}
          </span>
        );
      }
    },
    {
      key: "agingbucket",
      title: "Aging",
      style: { textAlign: "center" },
      render: (value) => {
        const agingColors = {
          '0-30 Days': '#ffc107',
          '31-60 Days': '#fd7e14',
          '61-90 Days': '#dc3545',
          '90+ Days': '#721c24',
          'Not Due': '#28a745'
        };
        return (
          <span style={{
            backgroundColor: agingColors[value] || '#6c757d',
            color: 'white',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            display: 'inline-block'
          }}>
            {value}
          </span>
        );
      }
    },
    {
      key: "receiptnumbers",
      title: "Receipt References",
      style: { textAlign: "left" },
      render: (value) => value || "-"
    }
  ];

  return (
    <div className="bill-by-bill-report">
      <div className="report-header">
        <h2>Bill by Bill Balance Report - Customers</h2>
        <p className="text-muted">Detailed customer outstanding report with aging analysis</p>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Customer</label>
            <select 
              value={filters.customer_id} 
              onChange={(e) => setFilters({...filters, customer_id: e.target.value})}
              className="form-control"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer.partyid} value={customer.partyid}>
                  {customer.partyname} - {customer.business_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input 
              type="date" 
              value={filters.start_date} 
              onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              className="form-control"
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input 
              type="date" 
              value={filters.end_date} 
              onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              className="form-control"
            />
          </div>

          <div className="filter-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={filters.show_only_pending} 
                onChange={(e) => setFilters({...filters, show_only_pending: e.target.checked})}
              />
              Show Only Pending Bills
            </label>
          </div>

          <div className="filter-group">
            <button onClick={fetchReport} className="btn btn-primary" disabled={loading}>
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Total Customers</div>
            <div className="summary-value">{summary.total_customers}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Invoices</div>
            <div className="summary-value">{summary.total_invoices}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Bill Amount</div>
            <div className="summary-value">₹ {summary.total_bill_amount?.toLocaleString('en-IN')}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Paid</div>
            <div className="summary-value">₹ {summary.total_paid_amount?.toLocaleString('en-IN')}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Pending</div>
            <div className="summary-value text-danger">₹ {summary.total_pending_amount?.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      {/* Aging Summary */}
      {summary && summary.aging_summary && (
        <div className="aging-summary">
          <h5>Aging Summary</h5>
          <div className="aging-buckets">
            {Object.entries(summary.aging_summary).map(([bucket, amount]) => (
              <div key={bucket} className="aging-bucket">
                <span className="bucket-label">{bucket}</span>
                <span className="bucket-amount">₹ {amount?.toLocaleString('en-IN') || '0'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="report-table-section">
        <ReusableTable
          data={reportData}
          columns={Columns}
          initialEntriesPerPage={10}
          showSearch={true}
          searchPlaceholder="Search by Customer, Invoice No..."
          showEntries={true}
          showPagination={true}
          isLoading={loading}
        />
      </div>
    </div>
  );
}

export default Bill_By_Bill_Report;