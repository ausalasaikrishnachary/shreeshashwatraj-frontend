import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Link } from "react-router-dom";
import { FaChartLine, FaSearch, FaFilePdf, FaFileExcel } from "react-icons/fa";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./SalesReport.css";

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    monthlyGrowth: 0,
    kachaSales: 0,
    pakkaSales: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State for date filtering and search
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);

  // Filtered data based on dates and search
  const [filteredVoucherData, setFilteredVoucherData] = useState([]);

  // Fetch all data initially
  const fetchSalesData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${baseurl}/api/reports/sales-report`);
      if (response.data.success) {
        const data = response.data.data;
        setVoucherDetails(data);
        // Initially, show all data
        setFilteredVoucherData(data);
        processData(data);
      } else {
        setError("Failed to fetch sales data");
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Error fetching sales data");
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts and summary
  const processData = (data) => {
    // Calculate summary
    const totals = data.reduce((acc, item) => {
      const total = parseFloat(item.total) || 0;
      const orderMode = (item.order_mode || "").toLowerCase();
      
      acc.totalSales += total;
      
      if (orderMode === "kacha") {
        acc.kachaSales += total;
      } else if (orderMode === "pakka") {
        acc.pakkaSales += total;
      }
      
      return acc;
    }, { totalSales: 0, kachaSales: 0, pakkaSales: 0 });

    setSummary({
      totalSales: totals.totalSales,
      monthlyGrowth: 0,
      kachaSales: totals.kachaSales,
      pakkaSales: totals.pakkaSales
    });

    // Prepare monthly data
    const monthlyMap = {};
    data.forEach(item => {
      if (item.invoice_date) {
        try {
          // Parse the date (it might be in DD/MM/YYYY format from the API)
          const dateParts = item.invoice_date.split('/');
          if (dateParts.length === 3) {
            const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            const month = date.toLocaleString('default', { month: 'short' });
            const total = parseFloat(item.total) || 0;
            
            if (!monthlyMap[month]) {
              monthlyMap[month] = 0;
            }
            monthlyMap[month] += total;
          }
        } catch (err) {
          console.error("Error parsing date:", item.invoice_date);
        }
      }
    });

    const monthlyArray = Object.keys(monthlyMap).map(key => ({
      month: key,
      sales: monthlyMap[key]
    })).slice(-4);

    setSalesData(monthlyArray);

    // Prepare staff data
    const staffMap = {};
    data.forEach(item => {
      const staffName = item.assigned_staff || "Unassigned";
      const total = parseFloat(item.total) || 0;
      
      if (!staffMap[staffName]) {
        staffMap[staffName] = 0;
      }
      staffMap[staffName] += total;
    });

    const staffArray = Object.keys(staffMap)
      .map(name => ({ name, sales: staffMap[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);

    setStaffData(staffArray);
  };

  // Filter data based on selected dates and search term
  useEffect(() => {
    if (!voucherDetails.length) {
      setFilteredVoucherData([]);
      return;
    }

    let filtered = [...voucherDetails];

    // Apply date filter if dates are selected
    if (fromDate || toDate) {
      filtered = filtered.filter((item) => {
        const itemDate = item.invoice_date;
        if (!itemDate) return false;

        try {
          // Parse DD/MM/YYYY format
          const dateParts = itemDate.split('/');
          if (dateParts.length === 3) {
            const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            const itemDateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

            // Check if date is within range
            if (fromDate && toDate) {
              return itemDateStr >= fromDate && itemDateStr <= toDate;
            } else if (fromDate) {
              return itemDateStr >= fromDate;
            } else if (toDate) {
              return itemDateStr <= toDate;
            }
          }
        } catch (err) {
          console.error("Error parsing date for filter:", itemDate);
          return false;
        }
        return true;
      });
    }

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          (item.product && item.product.toLowerCase().includes(searchLower)) ||
          (item.retailer && item.retailer.toLowerCase().includes(searchLower)) ||
          (item.assigned_staff && item.assigned_staff.toLowerCase().includes(searchLower)) ||
          (item.staff_address && item.staff_address.toLowerCase().includes(searchLower)) ||
          (item.invoice_numbers && String(item.invoice_numbers).toLowerCase().includes(searchLower)) ||
          (item.batch && String(item.batch).toLowerCase().includes(searchLower)) ||
          (item.total && String(item.total).toLowerCase().includes(searchLower))
        );
      });
    }

    // Update filtered data
    setFilteredVoucherData(filtered);
    
    // Recalculate summary for filtered data
    if (filtered.length > 0) {
      processData(filtered);
    }
  }, [voucherDetails, fromDate, toDate, searchTerm]);

  // Initial fetch
  useEffect(() => {
    fetchSalesData();
  }, []);

  // Generate report function
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await axios.post(
        `${baseurl}/api/reports/sales-report/download`,
        { 
          fromDate: fromDate || null, 
          toDate: toDate || null, 
          format: reportFormat 
        },
        { responseType: "blob" }
      );

      const name = `Sales_Report_${fromDate || "ALL"}_${toDate || "ALL"}.${
        reportFormat === "pdf" ? "pdf" : "xlsx"
      }`;
      const blob =
        reportFormat === "pdf"
          ? new Blob([res.data], { type: "application/pdf" })
          : new Blob([res.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      setShowGenerateModal(false);
    } catch (e) {
      console.error("❌ Download error:", e);
      setError("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Clear date filters
  const clearDateFilters = () => {
    setFromDate("");
    setToDate("");
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const dateParts = dateString.split('/');
      if (dateParts.length === 3) {
        const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        return date.toLocaleDateString('en-IN');
      }
    } catch (err) {
      console.error("Error formatting date:", dateString);
    }
    return dateString;
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  // Process voucher details data for table
  const processedVoucherDetails = filteredVoucherData.map((item, index) => ({
    ...item,
    index: index + 1,
    invoice_date: formatDate(item.invoice_date),
    price: formatCurrency(item.price),
    discount: formatCurrency(item.discount),
    gst: formatCurrency(item.gst),
    cgst: formatCurrency(item.cgst),
    sgst: formatCurrency(item.sgst),
    igst: formatCurrency(item.igst),
    cess: formatCurrency(item.cess),
    total: formatCurrency(item.total),
    Subtotal: formatCurrency(item.Subtotal),
    assigned_staff: item.assigned_staff || "Not Assigned",
    staff_address: item.staff_address || "Not Available",
    order_mode: item.order_mode || "-",
    retailer: item.retailer || "N/A"
  }));

  const staffColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  if (loading) {
    return <div className="text-center">Loading sales data...</div>;
  }

  return (
    <div className="sales-report">
      {/* Header with date filters and generate button */}
      <div className="sales-report-header">
        <div className="sales-report-header-left">
          <h2 className="sales-report-title">Sales Report Dashboard</h2>
          <p className="sales-report-subtitle">Comprehensive sales analysis and reporting</p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <div className="stat-value">{formatCurrency(summary.totalSales)}</div>
          <p className="stat-period">
            {fromDate && toDate ? `${fromDate} to ${toDate}` : 'All time'}
          </p>
        </div>
        
        <div className="stat-card">
          <h3>Monthly Growth</h3>
          <div className="stat-value positive">+{summary.monthlyGrowth}%</div>
          <p className="stat-period">Current month</p>
        </div>
        
        <div className="stat-card">
          <h3>Kacha Sales</h3>
          <div className="stat-value">{formatCurrency(summary.kachaSales)}</div>
          <p className="stat-period">Provisional orders</p>
        </div>
        
        <div className="stat-card">
          <h3>Pakka Sales</h3>
          <div className="stat-value">{formatCurrency(summary.pakkaSales)}</div>
          <p className="stat-period">Confirmed orders</p>
        </div>

        <Link to="/reports/sales-report-page" className="stat-card link-card">
          <div className="icon-container">
            <FaChartLine className="icon" />
          </div>
          <h4 className="mt-3">View Detailed Report</h4>
          <p className="stat-period">Full transaction details</p>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Sales Trend</h3>
          <p>Monthly sales performance</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  domain={[0, dataMax => Math.max(dataMax, 1000000)]}
                  tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Sales']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Staff Performance</h3>
          <p>Sales by team members</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  domain={[0, dataMax => Math.max(dataMax, 100000)]}
                  tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Sales']}
                  labelFormatter={(label) => `Staff: ${label}`}
                />
                <Bar dataKey="sales">
                  {staffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={staffColors[index % staffColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Voucher Table Section */}
      <div className="voucher-table-section">
<div className="filter-controls-section">
  <div className="filter-header">
    <h3>Sales Transactions</h3>
    <div className="results-count">
      Showing {filteredVoucherData.length} of {voucherDetails.length} records
      {(fromDate || toDate) && " (filtered by date)"}
    </div>
  </div>
  
  <div className="filters-row">
    {/* Left side: Date filters and Generate button */}
    <div className="left-controls-group">
      <div className="date-filters-container">
        <div className="date-input-pair">
          <div className="date-input-wrapper">
            <label htmlFor="from-date">From Date</label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          <div className="date-input-wrapper">
            <label htmlFor="to-date">To Date</label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          {(fromDate || toDate) && (
            <button
              className="clear-date-btn"
              onClick={clearDateFilters}
              title="Clear date filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      <button
        className="generate-report-btn"
        onClick={() => setShowGenerateModal(true)}
      >
        <FaFilePdf className="btn-icon" />
        <span>Generate Report</span>
      </button>
    </div>
    
    {/* Right side: Search field */}
       <div className="right-search">
              <div className="search-filter">
                <div className="search-input-group">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search Product, Name, staff, address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-field"
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search-btn" 
                      onClick={() => setSearchTerm("")}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
            
              </div>
            </div>
  </div>
</div>

        {/* Voucher Details Table */}
        <div className="table-section">
          {error ? (
            <div className="text-center text-danger">{error}</div>
          ) : (
            <ReusableTable
              title=""
              data={processedVoucherDetails}
              columns={voucherDetailsColumns}
              initialEntriesPerPage={5}
              searchPlaceholder=""
              showEntries={true}
              showSearch={false}
              showPagination={true}
            />
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="generate-report-modal">
          <div className="generate-report-modal-content">
            <button
              className="close-modal-btn"
              onClick={() => setShowGenerateModal(false)}
            >
              ✖
            </button>
            <div className="modal-title">Generate Sales Report</div>
            <div className="modal-subtitle">
              {fromDate && toDate ? `Period: ${fromDate} to ${toDate}` : 'All sales data'}
            </div>

            <div className="format-options">
              <label className={`format-option ${reportFormat === 'pdf' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={reportFormat === "pdf"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <FaFilePdf className="format-icon" />
                <span>PDF Format</span>
              </label>
              <label className={`format-option ${reportFormat === 'excel' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={reportFormat === "excel"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <FaFileExcel className="format-icon" />
                <span>Excel Format</span>
              </label>
            </div>

            <button 
              className="generate-btn"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </button>
            
            <div className="modal-footer">
              <p>Report will include all filtered data and statistics</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UPDATED Voucher details columns - Show Subtotal instead of price and invoice_date
const voucherDetailsColumns = [
  { 
    key: "sl_no",
    title: "S.No",
    style: { textAlign: "center" },
    render: (value, record, index) => index + 1
  },
  { 
    key: "product", 
    title: "Product", 
    style: { textAlign: "center" } 
  },
  { 
    key: "quantity", 
    title: "Quantity", 
    style: { textAlign: "center" } 
  },
  { 
    key: "Subtotal", 
    title: "Taxable Amount", 
    style: { textAlign: "center" } 
  },
  { 
    key: "total", 
    title: "Total Amount", 
    style: { textAlign: "center" } 
  },
  { 
    key: "assigned_staff", 
    title: "Staff", 
    style: { textAlign: "center" } 
  },
  { 
    key: "staff_address", 
    title: "Address", 
    style: { textAlign: "center" } 
  },
  {
    key: "invoice_date",
    title: "Date",
    style: { textAlign: "center" },
    render: (value) => {
      if (!value) return "-";
      return value;
    }
  },
];

export default SalesReport;