//C:\WorkTasks\sai_krishna\shreeshashwatraj-frontend\src\Component\Panels\Admin\AdminReports\GstReport.js

import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileExcel, FaFilter } from "react-icons/fa";
import * as XLSX from 'xlsx';
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import GSTReportNavya from "./Gstreportb3";
import "./GstReport.css";

// ══════════════════════════════════════════════════════════════════════════════
// SegmentedControl — pill-style tab switcher, top-right aligned
// ══════════════════════════════════════════════════════════════════════════════
function SegmentedControl({ activeTab, onTabChange }) {
  return (
    <div className="gst-report-seg-control">
      {/* GSTR-1: active when activeTab === "gstr1" */}
      <button
        className={`gst-report-seg-btn${activeTab === "gstr1" ? " gst-report-seg-btn--active" : ""}`}
        type="button"
        aria-current={activeTab === "gstr1" ? "page" : undefined}
        onClick={() => onTabChange("gstr1")}
      >
        GSTR-1
      </button>

      {/* GSTR-3B: active when activeTab === "gstr3b" */}
      <button
        className={`gst-report-seg-btn${activeTab === "gstr3b" ? " gst-report-seg-btn--active" : ""}`}
        type="button"
        aria-current={activeTab === "gstr3b" ? "page" : undefined}
        onClick={() => onTabChange("gstr3b")}
      >
        GSTR-3B
      </button>
    </div>
  );
}

const GstReport = () => {
  const [activeTab, setActiveTab] = useState("gstr1");

  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tempFromDate, setTempFromDate] = useState("");
  const [tempToDate, setTempToDate] = useState("");
  const [gstData, setGstData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [applyDateFilter, setApplyDateFilter] = useState(true);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFirstDayOfCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  useEffect(() => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setFromDate(firstDay);
    setToDate(currentDate);
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
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

      // Get HSN Code from items array
      let hsnCode = 'N/A';
      if (voucher.items && voucher.items.length > 0) {
        const hsnCodes = voucher.items
          .map(item => item.hsn_code)
          .filter(code => code && code !== 'N/A' && code !== null);
        
        if (hsnCodes.length > 0) {
          const uniqueHsnCodes = [...new Set(hsnCodes)];
          hsnCode = uniqueHsnCodes.join(', ');
        }
      }

      // Get GST percentage from items
      let gstPercentage = 'N/A';
      if (voucher.items && voucher.items.length > 0) {
        const gstRates = voucher.items
          .map(item => item.gst)
          .filter(rate => rate && rate !== 'N/A' && rate !== null);
        
        if (gstRates.length > 0) {
          const uniqueGstRates = [...new Set(gstRates)];
          gstPercentage = uniqueGstRates.map(rate => `${rate}%`).join(', ');
        }
      }

      return {
        id: voucher.VoucherID || index,
        billNo: voucher.VchNo || `N/A`,
        date: formattedDate,
        rawDate: voucher.Date,
        party: voucher.PartyName || voucher.business_name || 'N/A',
        gstNo: voucher.gstin || 'N/A',
        bb_bc: voucher.bb_bc || 'N/A',
        hsnCode: hsnCode,
        gstPercentage: gstPercentage,
        billAmt: totalAmount,
        taxableAmt: subtotal,
        sgstAmt: sgstAmount,
        cgstAmt: cgstAmount,
        igstAmt: igstAmount,
        transactionType: voucher.TransactionType || '',
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

  const formatDateForComparison = (dateString) => {
    if (!dateString) return null;
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const applyDateFilterHandler = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setApplyDateFilter(true);
  };

  const filteredData = gstData.filter((item) => {
    const matchesSearch = !searchTerm.trim() ||
      item.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gstNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bb_bc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gstPercentage?.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply date filter only when applyDateFilter is true and dates are set
    let matchesDate = true;
    if (applyDateFilter && fromDate && toDate) {
      let itemDateFormatted = null;
      
      if (item.rawDate) {
        const rawDate = new Date(item.rawDate);
        if (!isNaN(rawDate.getTime())) {
          itemDateFormatted = rawDate.toISOString().split('T')[0];
        }
      }
      
      if (!itemDateFormatted) {
        itemDateFormatted = formatDateForComparison(item.date);
      }
      
      if (itemDateFormatted) {
        matchesDate = itemDateFormatted >= fromDate && itemDateFormatted <= toDate;
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const processedTableData = filteredData.map((item) => ({
    ...item,
    billAmt: `₹${(item.billAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    taxableAmt: `₹${(item.taxableAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    sgstAmt: `₹${(item.sgstAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cgstAmt: `₹${(item.cgstAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    igstAmt: `₹${(item.igstAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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

      const displayFromDate = fromDate ? formatDateForDisplay(fromDate) : formatDateForDisplay(getCurrentDate());
      const displayToDate = toDate ? formatDateForDisplay(toDate) : formatDateForDisplay(getCurrentDate());

      const wsData = [
        [companyName],
        [`GST REGISTER REPORT FROM ${displayFromDate} To ${displayToDate}`],
        [],
        [
          "Bill No.", "Date", "Party", "GST No.", "BB/BC", "HSN Code", 
          "Bill Amt", "Taxable Amt","GST", "SGST Amt", "CGST Amt", "IGST Amt"
        ],
        ...filteredData.map((item) => [
          item.billNo || "",
          item.date || "",
          item.party || "",
          item.gstNo || "",
          item.bb_bc || "",
          item.hsnCode || "",
        
          Number(item.billAmt || 0),
          Number(item.taxableAmt || 0),
            item.gstPercentage || "",
          Number(item.sgstAmt || 0),
          Number(item.cgstAmt || 0),
          Number(item.igstAmt || 0)
        ]),
        [],
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws["!cols"] = [
        { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 10 },
        { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }
      ];

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, 
        { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GST Register");
      XLSX.writeFile(wb, `GST_Register_${displayFromDate}_to_${displayToDate}.xlsx`, { bookSST: true, cellStyles: true });

    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Failed to generate Excel file");
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setSearchTerm("");
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    setApplyDateFilter(true);
  };

  const clearDateFilters = () => {
    const firstDay = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    setApplyDateFilter(true);
  };

  const gstColumns = [
    { key: "sl_no", title: "S.No", style: { textAlign: "center", width: "60px" }, render: (value, record, index) => index + 1 },
    { key: "billNo", title: "Bill No.", style: { textAlign: "center", width: "100px" } },
    { key: "date", title: "Date", style: { textAlign: "center", width: "100px" } },
    { key: "party", title: "Party", style: { textAlign: "center" } },
    { key: "gstNo", title: "GST No.", style: { textAlign: "center", width: "250px" } },
    { key: "bb_bc", title: "BB/BC", style: { textAlign: "center", width: "100px" } },
    { key: "hsnCode", title: "HSN Code", style: { textAlign: "center", width: "110px" } },
    { key: "billAmt", title: "Bill Amt", style: { textAlign: "center", width: "120px" } },
    { key: "taxableAmt", title: "Taxable Amt", style: { textAlign: "center", width: "120px" } },
        { key: "gstPercentage", title: "GST", style: { textAlign: "center", width: "100px" } },

    { key: "sgstAmt", title: "SGST Amt", style: { textAlign: "center", width: "100px" } },
    { key: "cgstAmt", title: "CGST Amt", style: { textAlign: "center", width: "100px" } },
    { key: "igstAmt", title: "IGST Amt", style: { textAlign: "center", width: "100px" } },
  ];

  const totals = filteredData.reduce((acc, item) => ({
    billAmt: acc.billAmt + item.billAmt,
    taxableAmt: acc.taxableAmt + item.taxableAmt,
    sgstAmt: acc.sgstAmt + item.sgstAmt,
    cgstAmt: acc.cgstAmt + item.cgstAmt,
    igstAmt: acc.igstAmt + item.igstAmt
  }), { billAmt: 0, taxableAmt: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 });

  // ── If GSTR-3B tab is active, render Gstreportnavya inline ──────────────────
  if (activeTab === "gstr3b") {
    return <GSTReportNavya onTabChange={setActiveTab} activeTab={activeTab} />;
  }

  // ── GSTR-1 tab ──────────────────────────────────────────────────────────────
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
          <button onClick={fetchGstData} className="gst-report-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="gst-report-container">

      {/* ── Page header: title left, segmented control right ── */}
      <div className="gst-report-page-header">
        <h1 className="gst-report-page-title">Business Reports</h1>
        <SegmentedControl activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="gst-report-filters-section">
        <div className="gst-report-filters-wrapper">

          {/* Search */}
          <div className="gst-report-search-wrapper">
            <div className="gst-report-search-input-group">
              <FaSearch className="gst-report-search-icon" />
              <input
                type="text"
                placeholder="Search by Bill No., Party, GST No., BB/BC, HSN Code, GST %..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="gst-report-search-input"
              />
              {searchTerm && (
                <button className="gst-report-clear-btn" onClick={() => setSearchTerm("")} title="Clear search">×</button>
              )}
            </div>
          </div>

          {/* Date Filters - With Apply Button */}
          <div className="gst-report-date-filters">
            <div className="gst-report-date-input-wrapper">
              <label htmlFor="from-date" className="gst-report-date-label">From Date</label>
              <input 
                id="from-date" 
                type="date" 
                value={tempFromDate} 
                onChange={(e) => setTempFromDate(e.target.value)} 
                className="gst-report-date-input" 
              />
            </div>
            <div className="gst-report-date-input-wrapper">
              <label htmlFor="to-date" className="gst-report-date-label">To Date</label>
              <input 
                id="to-date" 
                type="date" 
                value={tempToDate} 
                onChange={(e) => setTempToDate(e.target.value)} 
                className="gst-report-date-input" 
              />
            </div>
            
            {/* Apply Date Filter Button */}
            <button 
              className="gst-report-apply-date-btn"
              onClick={applyDateFilterHandler}
            >
              Add Filter
            </button>
            
            {/* Reset Dates Button */}
            {(tempFromDate !== getFirstDayOfCurrentMonth() || tempToDate !== getCurrentDate()) && (
              <button 
                className="gst-report-reset-dates-btn"
                onClick={clearDateFilters}
                title="Reset to current month"
              >
                Clear Dates
              </button>
            )}
          </div>

          {/* Export Excel */}
          <button
            onClick={exportToExcel}
            disabled={exportLoading || filteredData.length === 0}
            className={`gst-report-export-btn ${exportLoading ? 'gst-report-export-btn--loading' : ''}`}
          >
            {exportLoading ? (
              <><span className="gst-report-spinner-small"></span>Exporting...</>
            ) : (
              <><FaFileExcel className="gst-report-export-icon" />Export Excel</>
            )}
          </button>

          {searchTerm && (
            <button className="gst-report-clear-all-btn" onClick={clearFilters}>Clear All</button>
          )}

        </div>
      </div>

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