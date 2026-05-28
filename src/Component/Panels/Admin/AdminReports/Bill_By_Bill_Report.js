import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { baseurl } from "../../../BaseURL/BaseURL";
import './Bill_By_Bill_Report.css';

// Advanced Searchable Dropdown Component with Categories
const AdvancedSearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Search and select account...",
  onSearch 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Group and filter options
  const getGroupedAndFilteredOptions = () => {
    if (!searchTerm) {
      // Group by role/entity_type when no search
      const grouped = {};
      options.forEach(option => {
        const role = option.role || option.entity_type || 'other';
        if (!grouped[role]) grouped[role] = [];
        grouped[role].push(option);
      });
      return { grouped, totalCount: options.length, isSearching: false };
    } else {
      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      const filtered = options.filter(option => {
        return (
          (option.name && option.name.toLowerCase().includes(searchLower)) ||
          (option.business_name && option.business_name.toLowerCase().includes(searchLower)) ||
          (option.role && option.role.toLowerCase().includes(searchLower)) ||
          (option.email && option.email.toLowerCase().includes(searchLower)) ||
          (option.phone && option.phone.toLowerCase().includes(searchLower))
        );
      });
      
      // Group filtered results
      const grouped = {};
      filtered.forEach(option => {
        const role = option.role || option.entity_type || 'other';
        if (!grouped[role]) grouped[role] = [];
        grouped[role].push(option);
      });
      
      return { grouped, totalCount: filtered.length, isSearching: true };
    }
  };

  const { grouped, totalCount, isSearching } = getGroupedAndFilteredOptions();
  
  // Flatten options for keyboard navigation
  const flattenedOptions = [];
  Object.keys(grouped).forEach(role => {
    grouped[role].forEach(option => {
      flattenedOptions.push({ ...option, role });
    });
  });

  const selectedOption = options.find(opt => opt.id === value);
  const displayValue = selectedOption 
    ? `${selectedOption.name}${selectedOption.business_name ? ` - ${selectedOption.business_name}` : ''}`
    : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex(prev => 
          prev < flattenedOptions.length - 1 ? prev + 1 : prev
        );
        e.preventDefault();
        break;
      case 'ArrowUp':
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        e.preventDefault();
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && flattenedOptions[highlightedIndex]) {
          handleSelect(flattenedOptions[highlightedIndex]);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelect = (option) => {
    onChange({ target: { value: option.id } });
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
    if (onSearch) onSearch(option);
  };

  const getRoleIcon = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return '👑';
      case 'retailer': return '🏪';
      case 'customer': return '👤';
      default: return '📋';
    }
  };

  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return '#6f42c1';
      case 'retailer': return '#fd7e14';
      case 'customer': return '#0d6efd';
      default: return '#6c757d';
    }
  };

  return (
    <div className="advanced-searchable-dropdown" ref={dropdownRef}>
      <div className="dropdown-input-container">
        <input
          type="text"
          className="dropdown-search-input"
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            if (isOpen) {
              setSearchTerm(e.target.value);
              setHighlightedIndex(-1);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          ref={searchInputRef}
        />
        <span className="dropdown-icons">
          <span className="dropdown-arrow">
            {isOpen ? '▲' : '▼'}
          </span>
          {value && !isOpen && (
            <button 
              className="dropdown-clear"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ target: { value: '' } });
                setSearchTerm("");
              }}
            >
              ×
            </button>
          )}
        </span>
      </div>
      
      {isOpen && (
        <div className="advanced-dropdown-menu">
          {/* <div className="dropdown-header">
            <span className="dropdown-title">Select Account</span>
            <span className="dropdown-count">({totalCount} found)</span>
          </div> */}
          
          {/* <div className="dropdown-search-hint">
            <span className="hint-icon">🔍</span>
            <span className="hint-text">Search by name or role...</span>
          </div> */}
          
          <div className="dropdown-options-container">
            {totalCount > 0 ? (
              Object.keys(grouped).map(role => (
                <div key={role} className="dropdown-group">
                  {/* <div className="dropdown-group-header">
                    <span className="group-icon">{getRoleIcon(role)}</span>
                    <span className="group-name">
                      {role.charAt(0).toUpperCase() + role.slice(1)}s
                    </span>
                    <span className="group-count">({grouped[role].length})</span>
                  </div> */}
                  <div className="dropdown-group-options">
                    {grouped[role].map((option, idx) => {
                      const globalIndex = flattenedOptions.findIndex(fo => fo.id === option.id);
                      return (
                        <div
                          key={option.id}
                          className={`dropdown-option ${value === option.id ? 'selected' : ''} ${highlightedIndex === globalIndex ? 'highlighted' : ''}`}
                          onClick={() => handleSelect(option)}
                          onMouseEnter={() => setHighlightedIndex(globalIndex)}
                        >
                          {/* <div className="option-avatar">
                            {getRoleIcon(role)}
                          </div> */}
                          <div className="option-content">
                            <div className="option-main">
                              <span className="option-name">{option.name}</span>
                              {/* {option.role && (
                                <span 
                                  className="option-role"
                                  style={{ backgroundColor: getRoleColor(role) }}
                                >
                                  {option.role}
                                </span>
                              )} */}
                            </div>
                            <div className="option-details">
                              {option.business_name && (
                                <span className="detail-item">
                                  {/* <span className="detail-icon">🏢</span> */}
                                  Business: {option.business_name}
                                </span>
                              )}
                              {/* {option.email && (
                                <span className="detail-item">
                                  <span className="detail-icon">📧</span>
                                  {option.email}
                                </span>
                              )} */}
                              {/* {option.phone && (
                                <span className="detail-item">
                                  <span className="detail-icon">📞</span>
                                  {option.phone}
                                </span>
                              )} */}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="dropdown-no-results">
                <span className="no-results-icon">🔍</span>
                <span>No accounts found matching "{searchTerm}"</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function Bill_By_Bill_Report() {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [billTransactions, setBillTransactions] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
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
      // Include all account types (admin, retailer, customer)
      const accountList = data.filter(acc => 
        acc.id > 1 // Exclude system accounts if needed
      );
      setCustomers(accountList);
    } catch (error) {
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

  // Fetch detailed bill transactions
  const fetchBillDetails = async (voucherId) => {
    setTransactionLoading(true);
    try {
      const response = await axios.get(`${baseurl}/api/reports/bill-details/${voucherId}`);
      if (response.data.success) {
        setBillTransactions(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching bill details:', error);
      alert('Error fetching bill details: ' + (error.response?.data?.error || error.message));
    } finally {
      setTransactionLoading(false);
    }
  };

  // Toggle row expansion
  const toggleRowExpand = (voucherId) => {
    setExpandedRows(prev => ({
      ...prev,
      [voucherId]: !prev[voucherId]
    }));
  };

  useEffect(() => {
    fetchCustomers();
    fetchReport();
  }, []);

  // Transform data for ReusableTable with expand functionality
  const getProcessedTableData = () => {
    const processedData = [];
    
    reportData.forEach(row => {
      // Add the main row
      processedData.push({
        ...row,
        isExpanded: expandedRows[row.VoucherID] || false,
        rowType: 'main'
      });
      
      // If expanded, add the payment rows as child data
      if (expandedRows[row.VoucherID] && row.payments && row.payments.length > 0) {
        row.payments.forEach(payment => {
          processedData.push({
            ...payment,
            rowType: 'child',
            parentVoucherId: row.VoucherID,
            partyname: '',
            vchno: '',
            invoicedate: '',
            duedate: '',
            originalamount: '',
            totalpaid: '',
            pendingamount: '',
            status_text: '',
            agingbucket: ''
          });
        });
      }
    });
    
    return processedData;
  };

  // Columns for ReusableTable (same as before)
  const Columns = [
    {
      key: "expand",
      title: "",
      style: { textAlign: "center", width: "50px" },
      render: (value, row) => {
        if (row.rowType === 'child') return null;
        return (
          <button 
            onClick={() => toggleRowExpand(row.VoucherID)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#0d6efd',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e7f1ff'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {expandedRows[row.VoucherID] ? '▼' : '▶'}
          </button>
        );
      }
    },
    {
      key: "partyname",
      title: "Customer Name",
      style: { textAlign: "left", minWidth: "180px" },
      render: (value, row) => {
        if (row.rowType === 'child') {
          return (
            <div style={{ paddingLeft: '30px', fontSize: '13px', color: '#6c757d' }}>
              └─ Payment Transaction
            </div>
          );
        }
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#1a2b4c' }}>{row.partyname}</div>
            {row.business_name && (
              <div style={{ fontSize: "11px", color: "#6c757d", marginTop: "2px" }}>
                {row.business_name}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: "vchno",
      title: "Invoice No.",
      style: { textAlign: "center", width: "140px" },
      render: (value, row) => {
        if (row.rowType === 'child') {
          return (
            <div style={{ fontSize: '13px', color: '#6c757d' }}>
              {row.receipt_no || '-'}
            </div>
          );
        }
        return (
          <button
            onClick={() => fetchBillDetails(row.VoucherID)}
            style={{
              color: '#0d6efd',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 500,
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e7f1ff'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {value || "-"}
          </button>
        );
      }
    },
    {
      key: "invoicedate",
      title: "Invoice Date",
      style: { textAlign: "center", width: "110px" },
      render: (value, row) => {
        if (row.rowType === 'child') {
          return <div style={{ fontSize: '13px', color: '#6c757d' }}>{row.payment_date || '-'}</div>;
        }
        return value || "-";
      }
    },
    // {
    //   key: "duedate",
    //   title: "Due Date",
    //   style: { textAlign: "center", width: "110px" },
    //   render: (value, row) => {
    //     if (row.rowType === 'child') return null;
    //     if (!value) return "-";
    //     const dueDate = new Date(value);
    //     const today = new Date();
    //     const isOverdue = dueDate < today && parseFloat(row.pendingamount) > 0;
    //     return (
    //       <span style={{ 
    //         color: isOverdue ? '#dc3545' : '#333', 
    //         fontWeight: isOverdue ? 'bold' : 'normal',
    //         position: 'relative'
    //       }}>
    //         {value}
    //         {isOverdue && (
    //           <span style={{ 
    //             fontSize: "10px", 
    //             display: "block",
    //             color: '#dc3545',
    //             marginTop: '2px'
    //           }}>
    //             ⚠️ Overdue
    //           </span>
    //         )}
    //       </span>
    //     );
    //   }
    // },
    {
      key: "originalamount",
      title: "Bill Amount (₹)",
      style: { textAlign: "right", width: "130px" },
      render: (value, row) => {
        if (row.rowType === 'child') {
          return (
            <div style={{ textAlign: 'right', fontSize: '13px', color: '#6c757d' }}>
              ₹ {parseFloat(row.payment_amount || 0).toLocaleString('en-IN')}
            </div>
          );
        }
        return (
          <span style={{ fontWeight: 500 }}>
            ₹ {parseFloat(value || 0).toLocaleString('en-IN')}
          </span>
        );
      }
    },
    // {
    //   key: "totalpaid",
    //   title: "Paid Amount (₹)",
    //   style: { textAlign: "right", width: "130px" },
    //   render: (value, row) => {
    //     if (row.rowType === 'child') return null;
    //     return (
    //       <span style={{ color: '#28a745', fontWeight: 500 }}>
    //         ₹ {parseFloat(value || 0).toLocaleString('en-IN')}
    //       </span>
    //     );
    //   }
    // },
    {
      key: "pendingamount",
      title: "Pending Amount (₹)",
      style: { textAlign: "right", width: "140px" },
      render: (value, row) => {
        if (row.rowType === 'child') return null;
        return (
          <span style={{ 
            color: parseFloat(value || 0) > 0 ? '#dc3545' : '#28a745',
            fontWeight: 'bold',
            fontSize: '15px'
          }}>
            ₹ {parseFloat(value || 0).toLocaleString('en-IN')}
          </span>
        );
      }
    },
    {
      key: "status_text",
      title: "Status",
      style: { textAlign: "center", width: "120px" },
      render: (value, row) => {
        if (row.rowType === 'child') return null;
        const statusColors = {
          'Paid': { bg: '#d4edda', color: '#155724', icon: '✓' },
          'Partially Paid': { bg: '#fff3cd', color: '#856404', icon: '⚠' },
          'Pending': { bg: '#f8d7da', color: '#721c24', icon: '⏰' },
          'Overdue': { bg: '#f8d7da', color: '#dc3545', icon: '!' }
        };
        const style = statusColors[value] || { bg: '#e9ecef', color: '#495057', icon: '•' };
        return (
          <span style={{
            backgroundColor: style.bg,
            color: style.color,
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>{style.icon}</span>
            {value || 'Pending'}
          </span>
        );
      }
    },
    // {
    //   key: "agingbucket",
    //   title: "Aging",
    //   style: { textAlign: "center", width: "100px" },
    //   render: (value, row) => {
    //     if (row.rowType === 'child') return null;
    //     const agingColors = {
    //       '0-30 Days': '#ffc107',
    //       '31-60 Days': '#fd7e14',
    //       '61-90 Days': '#dc3545',
    //       '90+ Days': '#721c24',
    //       'Not Due': '#28a745',
    //       'Paid': '#6c757d'
    //     };
    //     return (
    //       <span style={{
    //         backgroundColor: agingColors[value] || '#6c757d',
    //         color: 'white',
    //         padding: '4px 10px',
    //         borderRadius: '20px',
    //         fontSize: '11px',
    //         fontWeight: 600,
    //         display: 'inline-block'
    //       }}>
    //         {value || 'Not Due'}
    //       </span>
    //     );
    //   }
    // }
  ];

  // Combine columns based on row type
  const getTableColumns = () => {
    const baseColumns = [...Columns];
    
    // baseColumns.push({
    //   key: "payment_method_display",
    //   title: "Payment Method",
    //   style: { textAlign: "left", width: "120px" },
    //   render: (value, row) => {
    //     if (row.rowType === 'child') {
    //       return (
    //         <span style={{ fontSize: '13px' }}>
    //           {row.payment_method || '-'}
    //         </span>
    //       );
    //     }
    //     return null;
    //   }
    // });
    
    // baseColumns.push({
    //   key: "reference_display",
    //   title: "Reference",
    //   style: { textAlign: "left", width: "120px" },
    //   render: (value, row) => {
    //     if (row.rowType === 'child') {
    //       return (
    //         <span style={{ fontSize: '12px', color: '#6c757d' }}>
    //           {row.cheque_no || row.bank_name || '-'}
    //         </span>
    //       );
    //     }
    //     return null;
    //   }
    // });
    
    return baseColumns;
  };

  return (
    <div className="bill-by-bill-report">
      {/* <div className="report-header">
        <h2>Bill by Bill Balance Report - Customers</h2>
        <p className="text-muted">Detailed customer outstanding report with aging analysis and payment tracking</p>
      </div> */}

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Customer</label>
            <AdvancedSearchableDropdown
              options={customers}
              value={filters.customer_id}
              onChange={(e) => setFilters({...filters, customer_id: e.target.value})}
              placeholder="Search and select account..."
            />
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

          {/* <div className="filter-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={filters.show_only_pending} 
                onChange={(e) => setFilters({...filters, show_only_pending: e.target.checked})}
                style={{ cursor: 'pointer' }}
              />
              Show Only Pending Bills
            </label>
          </div> */}

          <div className="filter-group">
            <button onClick={fetchReport} className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Loading...
                </>
              ) : (
                'Generate Report'
              )}
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
      {/* {summary && summary.aging_summary && (
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
      )} */}

      {/* Table Section with ReusableTable */}
      <div className="report-table-section">
        <ReusableTable
          data={getProcessedTableData()}
          columns={getTableColumns()}
          initialEntriesPerPage={10}
          showSearch={true}
          searchPlaceholder="Search by Customer, Invoice No, or Reference..."
          showEntries={true}
          showPagination={true}
          isLoading={loading}
          customRowClass={(row) => row.rowType === 'child' ? 'child-row' : 'main-row'}
        />
      </div>

      {/* Bill Details Modal (same as before) */}
      {showModal && billTransactions && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                📄 Bill Details - {billTransactions.bill?.invoice_number}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {transactionLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
                  <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading transactions...</p>
                </div>
              ) : (
                <>
                  <div className="bill-summary">
                    <div className="summary-item">
                      <strong>Customer:</strong>
                      <span>{billTransactions.bill?.PartyName}</span>
                    </div>
                    <div className="summary-item">
                      <strong>Invoice Date:</strong>
                      <span>{billTransactions.bill?.invoice_date}</span>
                    </div>
                    <div className="summary-item">
                      <strong>Due Date:</strong>
                      <span>{billTransactions.bill?.due_date || 'N/A'}</span>
                    </div>
                    <div className="summary-item">
                      <strong>Total Amount:</strong>
                      <span style={{ color: '#0d6efd' }}>
                        ₹ {parseFloat(billTransactions.bill?.total_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="summary-item">
                      <strong>Paid Amount:</strong>
                      <span style={{ color: '#28a745' }}>
                        ₹ {parseFloat(billTransactions.bill?.paid_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="summary-item">
                      <strong>Balance:</strong>
                      <span style={{ color: parseFloat(billTransactions.bill?.balance_amount) > 0 ? '#dc3545' : '#28a745' }}>
                        ₹ {parseFloat(billTransactions.bill?.balance_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="summary-item">
                      <strong>Status:</strong>
                      <span>{billTransactions.bill?.status}</span>
                    </div>
                  </div>

                  <h4 style={{ marginTop: '24px', marginBottom: '16px', color: '#1a2b4c' }}>
                    Transaction History
                  </h4>
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Reference No</th>
                        <th>Transaction Type</th>
                        <th>Amount (₹)</th>
                        <th>Payment Method</th>
                        <th>Running Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billTransactions.transactions?.map((transaction, idx) => (
                        <tr 
                          key={idx}
                          style={{
                            backgroundColor: transaction.transaction_type === 'Invoice' ? '#f8f9fa' : 'white'
                          }}
                        >
                          <td>{transaction.date}</td>
                          <td>
                            <strong>{transaction.reference_no}</strong>
                          </td>
                          <td>
                            <span className={`transaction-type-badge ${transaction.transaction_type.toLowerCase().replace(' ', '-')}`}>
                              {transaction.transaction_type === 'Invoice' ? '📄' : 
                               transaction.transaction_type === 'Payment' ? '💰' : '📝'}
                              {transaction.transaction_type}
                            </span>
                          </td>
                          <td className={transaction.transaction_type === 'Invoice' ? 'amount-positive' : 'amount-negative'}>
                            {transaction.transaction_type === 'Invoice' 
                              ? `₹ ${Math.abs(transaction.amount).toLocaleString('en-IN')}`
                              : `- ₹ ${Math.abs(transaction.amount).toLocaleString('en-IN')}`}
                           </td>
                          <td>{transaction.payment_method || '-'}</td>
                          <td style={{ fontWeight: 'bold' }}>
                            ₹ {Math.abs(transaction.running_balance).toLocaleString('en-IN')}
                            {transaction.running_balance < 0 && (
                              <span style={{ color: '#dc3545', fontSize: '11px', display: 'block' }}>
                                (Overpaid)
                              </span>
                            )}
                           </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                        <td colSpan="5" style={{ textAlign: 'right', padding: '12px' }}>
                          Final Balance:
                        </td>
                        <td style={{
                          color: parseFloat(billTransactions.bill?.balance_amount) > 0 ? '#dc3545' : '#28a745',
                          padding: '12px'
                        }}>
                          ₹ {parseFloat(billTransactions.bill?.balance_amount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bill_By_Bill_Report;