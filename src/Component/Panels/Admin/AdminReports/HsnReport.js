import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx';
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./HsnReport.css";

const HsnReport = () => {
  const [searchTerm, setSearchTerm]           = useState("");
  const [fromDate, setFromDate]               = useState("");
  const [toDate, setToDate]                   = useState("");
  const [transactionType, setTransactionType] = useState("");  // "" = All
  const [gstData, setGstData]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [exportLoading, setExportLoading]     = useState(false);
const [appliedFromDate, setAppliedFromDate] = useState("");
const [appliedToDate, setAppliedToDate] = useState("");
const [isFiltered, setIsFiltered] = useState(false);
  const getCurrentDate = () => {
    const today = new Date();
    const year  = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day   = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Re-fetch whenever dates change
useEffect(() => {
  fetchGstData(); // only initial load
}, []);

  const fetchGstData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
     if (appliedFromDate) params.fromDate = appliedFromDate;
if (appliedToDate)   params.toDate   = appliedToDate;

      const response = await axios.get(`${baseurl}/hsnreport`, { params });
      const vouchers = response.data;

      // Group by hsn_code only — keep TransactionType on each voucher for filtering
      const groupedMap = {};

      vouchers.forEach((voucher) => {
        const items = voucher.items || [];

        items.forEach((item) => {
          const hsnCode = item.hsn_code || voucher.hsn_code || 'N/A';
          const txnType = voucher.TransactionType || '';
          // key includes txnType so Sales and Purchase with same HSN stay separate
          const key = `${hsnCode}_${txnType}`;

          if (!groupedMap[key]) {
            groupedMap[key] = {
              id:              key,
              hsnCode:         hsnCode,
              goods_name:      item.goods_name || '',
              transactionType: txnType,
              totalQty:        0,
              billAmt:         0,
              taxableAmt:      0,
              sgstAmt:         0,
              cgstAmt:         0,
              igstAmt:         0,
            };
          }

          groupedMap[key].totalQty   += parseFloat(item.quantity)      || 0;
          groupedMap[key].billAmt    += parseFloat(voucher.TotalAmount) || 0;
          groupedMap[key].taxableAmt += parseFloat(voucher.Subtotal)    || 0;
          groupedMap[key].sgstAmt    += parseFloat(voucher.SGSTAmount)  || 0;
          groupedMap[key].cgstAmt    += parseFloat(voucher.CGSTAmount)  || 0;
          groupedMap[key].igstAmt    += parseFloat(voucher.IGSTAmount)  || 0;
        });
      });

      setGstData(Object.values(groupedMap));
    } catch (err) {
      console.error("Error fetching GST data:", err);
      setError("Failed to fetch GST report data");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filters: search + transaction type
  const filteredData = gstData.filter((item) => {
    const matchesSearch =
      !searchTerm.trim() ||
      item.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.goods_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      !transactionType ||
      item.transactionType?.toLowerCase() === transactionType.toLowerCase();

    return matchesSearch && matchesType;
  });

  const processedTableData = filteredData.map((item) => ({
    ...item,
    totalQty:   item.totalQty || 0,
    billAmt:    `₹${(item.billAmt    || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    taxableAmt: `₹${(item.taxableAmt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    sgstAmt:    `₹${(item.sgstAmt    || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cgstAmt:    `₹${(item.cgstAmt    || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    igstAmt:    `₹${(item.igstAmt    || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  }));

  const totals = filteredData.reduce(
    (acc, item) => ({
      totalQty:   acc.totalQty   + (Number(item.totalQty)   || 0),
      billAmt:    acc.billAmt    + (Number(item.billAmt)     || 0),
      taxableAmt: acc.taxableAmt + (Number(item.taxableAmt)  || 0),
      sgstAmt:    acc.sgstAmt    + (Number(item.sgstAmt)     || 0),
      cgstAmt:    acc.cgstAmt    + (Number(item.cgstAmt)     || 0),
      igstAmt:    acc.igstAmt    + (Number(item.igstAmt)     || 0),
    }),
    { totalQty: 0, billAmt: 0, taxableAmt: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 }
  );


  const handleFilterClick = () => {
  if (isFiltered) {
    // 🔄 CLEAR FILTER
    setFromDate("");
    setToDate("");
    setAppliedFromDate("");
    setAppliedToDate("");
    setIsFiltered(false);
    fetchGstData(); // reload all data
  } else {
    // ✅ APPLY FILTER
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setIsFiltered(true);
    fetchGstData(); // fetch filtered data
  }
};
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
      const displayToDate   = toDate   ? formatDateForDisplay(toDate)   : formatDateForDisplay(getCurrentDate());
      const txnLabel        = transactionType ? ` | ${transactionType}` : "";

      const wsData = [
        [companyName],
        [`HSN REPORT FROM ${displayFromDate} To ${displayToDate}${txnLabel}`],
        [],
        ["S.No", "HSN Code",  "Total Qty", "Total Amount", "Taxable Amt", "SGST Amt", "CGST Amt", "IGST Amt"],
        ...filteredData.map((item, index) => [
          index + 1,
          item.hsnCode         || "",
        
          Number(item.totalQty   || 0),
          Number(item.billAmt    || 0),
          Number(item.taxableAmt || 0),
          Number(item.sgstAmt    || 0),
          Number(item.cgstAmt    || 0),
          Number(item.igstAmt    || 0),
        ]),
        [],
     
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws["!cols"] = [
        { wch: 8  },
        { wch: 15 },
        { wch: 18 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
      ];

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      ];

      ws["A1"] = {
        v: companyName,
        t: "s",
        s: { font: { bold: true, sz: 13 }, alignment: { horizontal: "center", vertical: "center" } },
      };
      ws["A2"] = {
        v: `HSN REPORT FROM ${displayFromDate} To ${displayToDate}${txnLabel}`,
        t: "s",
        s: { font: { bold: true, sz: 11 }, alignment: { horizontal: "center", vertical: "center" } },
      };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "HSN Report");
      XLSX.writeFile(wb, `HSN_Report_${displayFromDate}_to_${displayToDate}.xlsx`, {
        bookSST: true,
        cellStyles: true,
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Failed to generate Excel file");
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setTransactionType("");
  };

  const clearDateFilters = () => {
    setFromDate("");
    setToDate("");
  };

  const hsnColumns = [
    {
      key: "sl_no",
      title: "S.No",
      style: { textAlign: "center", width: "60px" },
      render: (value, record, index) => index + 1,
    },
    { key: "hsnCode",         title: "HSN Code",         style: { textAlign: "left",   width: "110px" } },
    { key: "totalQty",        title: "Total Qty",         style: { textAlign: "right",  width: "100px" } },
    { key: "billAmt",         title: "Total Amount",      style: { textAlign: "right",  width: "130px" } },
    { key: "taxableAmt",      title: "Taxable Amt",       style: { textAlign: "right",  width: "130px" } },
    { key: "sgstAmt",         title: "SGST Amt",          style: { textAlign: "right",  width: "110px" } },
    { key: "cgstAmt",         title: "CGST Amt",          style: { textAlign: "right",  width: "110px" } },
    { key: "igstAmt",         title: "IGST Amt",          style: { textAlign: "right",  width: "110px" } },
  ];

  if (loading) {
    return (
      <div className="hsn-report-container">
        <div className="hsn-report-loading">
          <div className="hsn-report-spinner"></div>
          <p>Loading HSN report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hsn-report-container">
        <div className="hsn-report-error">
          <p>{error}</p>
          <button onClick={fetchGstData} className="hsn-report-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hsn-report-container">

      {/* Filters */}
      <div className="hsn-report-filters-section">
        <div className="hsn-report-filters-wrapper">

          {/* Search */}
          <div className="hsn-report-search-wrapper">
            <div className="hsn-report-search-input-group">
              <FaSearch className="hsn-report-search-icon" />
              <input
                type="text"
                placeholder="Search by HSN Code or Product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hsn-report-search-input"
              />
              {searchTerm && (
                <button
                  className="hsn-report-clear-btn"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* ── Transaction Type Dropdown ── */}
          <div className="hsn-report-date-input-wrapper">
            <label htmlFor="txn-type" className="hsn-report-date-label">
              Transaction Type
            </label>
            <select
              id="txn-type"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="hsn-report-date-input"
            >
              <option value="">All</option>
              <option value="Sales">Sales</option>
              <option value="Purchase">Purchase</option>
            </select>
          </div>

          {/* Date filters */}
          <div className="hsn-report-date-filters">
            <div className="hsn-report-date-input-wrapper">
              <label htmlFor="from-date" className="hsn-report-date-label">
                From Date
              </label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="hsn-report-date-input"
                max={toDate || undefined}
              />
            </div>
            <div className="hsn-report-date-input-wrapper">
              <label htmlFor="to-date" className="hsn-report-date-label">
                To Date
              </label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="hsn-report-date-input"
                min={fromDate || undefined}
              />
            </div>
     {(fromDate || toDate || isFiltered) && (
  <button
    className={`hsn-report-filter-btn ${isFiltered ? 'clear' : ''}`}
    onClick={handleFilterClick}
  >
    {isFiltered ? "Clear Filter" : "Apply Filter"}
  </button>
)}
          </div>

          {/* Export */}
          <button
            onClick={exportToExcel}
            disabled={exportLoading || filteredData.length === 0}
            className={`hsn-report-export-btn ${exportLoading ? 'hsn-report-export-btn--loading' : ''}`}
          >
            {exportLoading ? (
              <><span className="hsn-report-spinner-small"></span>Exporting...</>
            ) : (
              <><FaFileExcel className="hsn-report-export-icon" />Export Excel</>
            )}
          </button>

          {/* Clear all */}
          {(searchTerm || fromDate || toDate || transactionType) && (
            <button className="hsn-report-clear-all-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}

        </div>
      </div>

      {/* Table */}
      <div className="hsn-report-table-section">
        <ReusableTable
          data={processedTableData}
          columns={hsnColumns}
          initialEntriesPerPage={10}
          showSearch={false}
          showEntries={true}
          showPagination={true}
        />
      </div>

    </div>
  );
};

export default HsnReport;