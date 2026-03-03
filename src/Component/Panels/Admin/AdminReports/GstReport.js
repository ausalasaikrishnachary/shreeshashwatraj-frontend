import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx';
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./GstReport.css";

const GstReport = () => {
  // State for search and date filters
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("ALL");
  const [kachaPakkaFilter, setKachaPakkaFilter] = useState("ALL"); // New filter for KACHA/PAKKA
  const [gstData, setGstData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch GST report data
  useEffect(() => {
    fetchGstData();
  }, []);

  const fetchGstData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${baseurl}/gstreport`);
      const vouchers = response.data;
      
      const processedData = vouchers.map((voucher, index) => {
        const formattedDate = voucher.Date ? new Date(voucher.Date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '-';

        const subtotal = parseFloat(voucher.Subtotal) || 
          voucher.items?.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0) || 0;
        
        const sgstAmount = parseFloat(voucher.SGSTAmount) || 
          voucher.items?.reduce((sum, item) => sum + (parseFloat(item.sgst_amount) || 0), 0) || 0;
        
        const cgstAmount = parseFloat(voucher.CGSTAmount) || 
          voucher.items?.reduce((sum, item) => sum + (parseFloat(item.cgst_amount) || 0), 0) || 0;
        
        const igstAmount = parseFloat(voucher.IGSTAmount) || 
          voucher.items?.reduce((sum, item) => sum + (parseFloat(item.igst_amount) || 0), 0) || 0;
        
        const totalAmount = parseFloat(voucher.TotalAmount) || 
          subtotal + sgstAmount + cgstAmount + igstAmount;

        const transactionType = getTransactionType(voucher);
        const specificTransactionType = getSpecificTransactionType(voucher);

        return {
          id: voucher.VoucherID || index,
          billNo: voucher.VchNo || `N/A`,
          date: formattedDate,
          party: voucher.PartyName || voucher.business_name || 'N/A',
          gstNo: voucher.gstin || 'N/A',
          billAmt: totalAmount,
          taxableAmt: subtotal,
          sgstAmt: sgstAmount,
          cgstAmt: cgstAmount,
          igstAmt: igstAmount,
          transactionType: transactionType, // PAKKA/KACHA/UNKNOWN
          specificTransactionType: specificTransactionType, // Specific transaction type
          voucherType: voucher.TransactionType || '',
          dataType: voucher.data_type || '',
          originalData: voucher
        };
      });

      setGstData(processedData);
    } catch (err) {
      console.error("Error fetching GST data:", err);
      setError("Failed to fetch GST report data");
    } finally {
      setLoading(false);
    }
  };

  // Function to determine transaction type (PAKKA or KACHA)
  const getTransactionType = (voucher) => {
    const trantype = (voucher.TransactionType || '').toLowerCase();
    const dataType = (voucher.data_type || '').toLowerCase();
    
    if (trantype === 'purchase' || 
        trantype === 'sales' || 
        trantype === 'credit note' || 
        trantype === 'debit note' ||
        dataType === 'sales' || 
        dataType === 'purchase') {
      return 'PAKKA';
    }
    
    if (trantype === 'stock inward' || 
        trantype === 'stock transfer' || 
        dataType === 'stock inward' || 
        dataType === 'stock transfer') {
      return 'KACHA';
    }
    
    if ((trantype === 'credit note' || trantype === 'debit note') && 
        (dataType === 'sales' || dataType === 'purchase')) {
      return 'PAKKA';
    }
    
    if ((trantype === 'credit note' || trantype === 'debit note') && 
        (dataType === 'stock inward' || dataType === 'stock transfer')) {
      return 'KACHA';
    }
    
    return 'UNKNOWN';
  };

  // Function to get specific transaction type
  const getSpecificTransactionType = (voucher) => {
    const trantype = (voucher.TransactionType || '').toLowerCase();
    const dataType = (voucher.data_type || '').toLowerCase();
    
    // Map to standard transaction types
    if (trantype === 'sales' || dataType === 'sales') return 'Sales';
    if (trantype === 'purchase' || dataType === 'purchase') return 'Purchase';
    if (trantype === 'receipt') return 'Receipt';
    if (trantype === 'credit note') return 'Credit Note';
    if (trantype === 'debit note') return 'Debit Note';
    if (trantype === 'stock inward' || dataType === 'stock inward') return 'Stock Inward';
    if (trantype === 'stock transfer' || dataType === 'stock transfer') return 'Stock Transfer';
    
    // If no match, return the original or Unknown
    return voucher.TransactionType || 'Unknown';
  };

  const formatDateForComparison = (dateString) => {
    if (!dateString) return null;
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return dateString;
    } catch (err) {
      return null;
    }
  };

  const filteredData = gstData.filter((item) => {
    const matchesSearch = !searchTerm.trim() || 
      item.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gstNo?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (fromDate || toDate) {
      const itemDateFormatted = formatDateForComparison(item.date);
      
      if (itemDateFormatted) {
        if (fromDate && toDate) {
          matchesDate = itemDateFormatted >= fromDate && itemDateFormatted <= toDate;
        } else if (fromDate) {
          matchesDate = itemDateFormatted >= fromDate;
        } else if (toDate) {
          matchesDate = itemDateFormatted <= toDate;
        }
      } else {
        matchesDate = false;
      }
    }

    // Filter by specific transaction type (Sales, Purchase, etc.)
    let matchesSpecificTransactionType = true;
    if (transactionTypeFilter !== "ALL") {
      matchesSpecificTransactionType = item.specificTransactionType === transactionTypeFilter;
    }

    // Filter by KACHA/PAKKA
    let matchesKachaPakka = true;
    if (kachaPakkaFilter !== "ALL") {
      matchesKachaPakka = item.transactionType === kachaPakkaFilter;
    }

    return matchesSearch && matchesDate && matchesSpecificTransactionType && matchesKachaPakka;
  });

  // Process data for table display with formatting
  const processedTableData = filteredData.map((item) => ({
    ...item,
    billAmt: `₹${(item.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    taxableAmt: `₹${(item.taxableAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    sgstAmt: `₹${(item.sgstAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cgstAmt: `₹${(item.cgstAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    igstAmt: `₹${(item.igstAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }));

  const exportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    setExportLoading(true);

    try {
      const companyName = "SHREE SHASHWAT RAJ AGRO PVT.LTD.";

      const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
      };

      const displayFromDate = fromDate
        ? formatDateForDisplay(fromDate)
        : formatDateForDisplay(getCurrentDate());

      const displayToDate = toDate
        ? formatDateForDisplay(toDate)
        : formatDateForDisplay(getCurrentDate());

      const wsData = [
        [companyName],
        [`GST REGISTER REPORT FROM ${displayFromDate} To ${displayToDate}`],
        [],
        [
          "Bill No.", "Date", "Party", "GST No.", "Bill Amt",
          "Taxable Amt", "SGST Amt", "CGST Amt", "IGST Amt", "Transaction Type"
        ],
        ...filteredData.map((item) => [
          item.billNo || "",
          item.date || "",
          item.party || "",
          item.gstNo || "",
          Number(item.billAmt || 0),
          Number(item.taxableAmt || 0),
          Number(item.sgstAmt || 0),
          Number(item.cgstAmt || 0),
          Number(item.igstAmt || 0),
          item.specificTransactionType || ""
        ]),
        [],
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Column Widths
      ws["!cols"] = [
        { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 20 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
      ];

      // Merge Company Name and Date Range rows
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      ];

      // Style helper
      const centerBold = {
        font: { bold: true, sz: 13 },
        alignment: { horizontal: "center", vertical: "center" },
      };

      const centerBoldSubtitle = {
        font: { bold: true, sz: 11 },
        alignment: { horizontal: "center", vertical: "center" },
      };

      // Apply bold + center to Company Name (row 0)
      ws["A1"] = {
        v: companyName,
        t: "s",
        s: centerBold,
      };

      // Apply bold + center to Date Range row (row 1)
      ws["A2"] = {
        v: `GST REGISTER REPORT FROM ${displayFromDate} To ${displayToDate}`,
        t: "s",
        s: centerBoldSubtitle,
      };

      // Create Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GST Register");

      const filename = `GST_Register_${displayFromDate}_to_${displayToDate}.xlsx`;

      // Use writeFile with bookSST and cellStyles enabled
      XLSX.writeFile(wb, filename, { bookSST: true, cellStyles: true });

    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Failed to generate Excel file");
    } finally {
      setExportLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setTransactionTypeFilter("ALL");
    setKachaPakkaFilter("ALL");
  };

  // Clear date filters only
  const clearDateFilters = () => {
    setFromDate("");
    setToDate("");
  };

  // Table columns for GST Report
  const gstColumns = [
    {
      key: "sl_no",
      title: "S.No",
      style: { textAlign: "center", width: "60px" },
      render: (value, record, index) => index + 1
    },
    {
      key: "billNo",
      title: "Bill No.",
      style: { textAlign: "left", width: "100px" }
    },
    {
      key: "date",
      title: "Date",
      style: { textAlign: "center", width: "100px" }
    },
    {
      key: "party",
      title: "Party",
      style: { textAlign: "left" }
    },
    {
      key: "gstNo",
      title: "GST No.",
      style: { textAlign: "left", width: "150px" }
    },
    {
      key: "billAmt",
      title: "Bill Amt",
      style: { textAlign: "right", width: "120px" }
    },
    {
      key: "taxableAmt",
      title: "Taxable Amt",
      style: { textAlign: "right", width: "120px" }
    },
    {
      key: "sgstAmt",
      title: "SGST Amt",
      style: { textAlign: "right", width: "100px" }
    },
    {
      key: "cgstAmt",
      title: "CGST Amt",
      style: { textAlign: "right", width: "100px" }
    },
    {
      key: "igstAmt",
      title: "IGST Amt",
      style: { textAlign: "right", width: "100px" }
    },
   
  ];

  // Calculate totals for footer
  const totals = filteredData.reduce((acc, item) => ({
    billAmt: acc.billAmt + item.billAmt,
    taxableAmt: acc.taxableAmt + item.taxableAmt,
    sgstAmt: acc.sgstAmt + item.sgstAmt,
    cgstAmt: acc.cgstAmt + item.cgstAmt,
    igstAmt: acc.igstAmt + item.igstAmt
  }), { billAmt: 0, taxableAmt: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 });

  if (loading) {
    return (
      <div className="gst-report-container">
        <div className="gst-report-loading">
          <div className="gst-report-spinner"></div>
          <p>Loading GST report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gst-report-container">
        <div className="gst-report-error">
          <p>{error}</p>
          <button onClick={fetchGstData} className="gst-report-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gst-report-container">
          <div className="gst-report-kacha-pakka-wrapper">
            <button
              className={`gst-report-kacha-pakka-btn ${kachaPakkaFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setKachaPakkaFilter('ALL')}
            >
              ALL
            </button>
            <button
              className={`gst-report-kacha-pakka-btn pakka-btn ${kachaPakkaFilter === 'PAKKA' ? 'active' : ''}`}
              onClick={() => setKachaPakkaFilter('PAKKA')}
            >
              PAKKA
            </button>
            <button
              className={`gst-report-kacha-pakka-btn kacha-btn ${kachaPakkaFilter === 'KACHA' ? 'active' : ''}`}
              onClick={() => setKachaPakkaFilter('KACHA')}
            >
              KACHA
            </button>
          </div>
      {/* Filters Section */}
      <div className="gst-report-filters-section">
        
        <div className="gst-report-filters-wrapper">

          
          {/* Search */}
          <div className="gst-report-search-wrapper">
            <div className="gst-report-search-input-group">
              <FaSearch className="gst-report-search-icon" />
              <input
                type="text"
                placeholder="Search by Bill No., Party, GST No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="gst-report-search-input"
              />
              {searchTerm && (
                <button
                  className="gst-report-clear-btn"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

   

<div className="gst-report-filter-wrapper">
  <label htmlFor="transaction-type" className="gst-report-filter-label">Transaction Type</label>
  <select
    id="transaction-type"
    value={transactionTypeFilter}
    onChange={(e) => setTransactionTypeFilter(e.target.value)}
    className="gst-report-filter-select"
  >
    <option value="ALL">All Transaction Types</option>
    
    {/* Show different options based on KACHA/PAKKA filter */}
    {kachaPakkaFilter === 'PAKKA' && (
      <>
        <option value="Sales">Sales</option>
        <option value="Purchase">Purchase</option>
        <option value="Receipt">Receipt</option>
        <option value="Credit Note">Credit Note</option>
        <option value="Debit Note">Debit Note</option>
      </>
    )}
    
    {kachaPakkaFilter === 'KACHA' && (
      <>
        <option value="Stock Inward">Stock Inward</option>
        <option value="Stock Transfer">Stock Transfer</option>
        <option value="Credit Note">Credit Note</option>
        <option value="Debit Note">Debit Note</option>
      </>
    )}
    
    {/* Show all options when ALL is selected or no filter */}
    {(kachaPakkaFilter === 'ALL' || !kachaPakkaFilter) && (
      <>
        <option value="Sales">Sales</option>
        <option value="Purchase">Purchase</option>
        <option value="Receipt">Receipt</option>
        <option value="Credit Note">Credit Note</option>
        <option value="Debit Note">Debit Note</option>
        <option value="Stock Inward">Stock Inward</option>
        <option value="Stock Transfer">Stock Transfer</option>
      </>
    )}
  </select>
</div>

          {/* Date Filters */}
          <div className="gst-report-date-filters">
            <div className="gst-report-date-input-wrapper">
              <label htmlFor="from-date" className="gst-report-date-label">From Date</label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="gst-report-date-input"
                max={toDate || undefined}
              />
            </div>

            <div className="gst-report-date-input-wrapper">
              <label htmlFor="to-date" className="gst-report-date-label">To Date</label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="gst-report-date-input"
                min={fromDate || undefined}
              />
            </div>

            {(fromDate || toDate) && (
              <button
                className="gst-report-clear-date-btn"
                onClick={clearDateFilters}
                title="Clear date filters"
              >
                Clear Dates
              </button>
            )}
          </div>

          {/* Export Excel Button */}
          <button
            onClick={exportToExcel}
            disabled={exportLoading || filteredData.length === 0}
            className={`gst-report-export-btn ${exportLoading ? 'gst-report-export-btn--loading' : ''}`}
          >
            {exportLoading ? (
              <>
                <span className="gst-report-spinner-small"></span>
                Exporting...
              </>
            ) : (
              <>
                <FaFileExcel className="gst-report-export-icon" />
                Export Excel
              </>
            )}
          </button>

          {(searchTerm || fromDate || toDate || transactionTypeFilter !== "ALL" || kachaPakkaFilter !== "ALL") && (
            <button
              className="gst-report-clear-all-btn"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="gst-report-table-section">
        <ReusableTable
          data={processedTableData}
          columns={gstColumns}
          initialEntriesPerPage={10}
          showSearch={false}
          showEntries={true}
          showPagination={true}
        />
      </div>

    
    </div>
  );
};

export default GstReport;