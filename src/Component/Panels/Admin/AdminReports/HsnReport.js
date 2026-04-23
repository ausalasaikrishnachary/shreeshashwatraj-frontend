import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx';
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./HsnReport.css";

const getCurrentDate = () => {
  const today = new Date();
  const year  = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day   = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFirstDayOfCurrentMonth = () => {
  const today = new Date();
  const year  = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

const HsnReport = () => {
  const [searchTerm, setSearchTerm]           = useState("");
  const [fromDate, setFromDate]               = useState(getFirstDayOfCurrentMonth());
  const [toDate, setToDate]                   = useState(getCurrentDate());
  const [tempFromDate, setTempFromDate]       = useState(getFirstDayOfCurrentMonth());
  const [tempToDate, setTempToDate]           = useState(getCurrentDate());
  const [transactionType, setTransactionType] = useState("");
  const [gstData, setGstData]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [exportLoading, setExportLoading]     = useState(false);

const fetchGstData = async (from = fromDate, to = toDate) => {
  setLoading(true);
  setError("");
  try {
    const response = await axios.get(`${baseurl}/hsnreport`);
    const vouchers = response.data;

    // Filter by Date column here
    const filteredVouchers = vouchers.filter((voucher) => {
      if (!voucher.Date) return false;
      const voucherDate = new Date(voucher.Date).toISOString().split('T')[0];
      if (from && voucherDate < from) return false;
      if (to && voucherDate > to) return false;
      return true;
    });

    const groupedMap = {};
    filteredVouchers.forEach((voucher) => {
      const items = voucher.items || [];
      items.forEach((item) => {
        const hsnCode = item.hsn_code || voucher.hsn_code || 'N/A';
        const gstRate = item.gst || 0;
        const txnType = voucher.TransactionType || '';
        // Key now includes HSN code AND GST rate
        const key = `${hsnCode}_${gstRate}_${txnType}`;

        if (!groupedMap[key]) {
          groupedMap[key] = {
            id: key,
            hsnCode: hsnCode,
            gstRate: gstRate,
            goods_name: item.goods_name || '',
            transactionType: txnType,
            totalQty: 0,
            billAmt: 0,
            taxableAmt: 0,
            sgstAmt: 0,
            cgstAmt: 0,
            igstAmt: 0,
          };
        }

        // Calculate item's share of GST based on item total / voucher total
        const itemTotal = parseFloat(item.total) || 0;
        const voucherTotal = parseFloat(voucher.TotalAmount) || 0;
        const voucherGSTTotal = (parseFloat(voucher.SGSTAmount) || 0) + 
                                (parseFloat(voucher.CGSTAmount) || 0) + 
                                (parseFloat(voucher.IGSTAmount) || 0);
        
        let itemSGST = 0;
        let itemCGST = 0;
        let itemIGST = 0;
        let itemTaxable = 0;

        if (voucherTotal > 0) {
          const ratio = itemTotal / voucherTotal;
          itemSGST = (parseFloat(voucher.SGSTAmount) || 0) * ratio;
          itemCGST = (parseFloat(voucher.CGSTAmount) || 0) * ratio;
          itemIGST = (parseFloat(voucher.IGSTAmount) || 0) * ratio;
          itemTaxable = (parseFloat(voucher.Subtotal) || 0) * ratio;
        }

        groupedMap[key].totalQty += parseFloat(item.quantity) || 0;
        groupedMap[key].billAmt += itemTotal;
        groupedMap[key].taxableAmt += itemTaxable;
        groupedMap[key].sgstAmt += itemSGST;
        groupedMap[key].cgstAmt += itemCGST;
        groupedMap[key].igstAmt += itemIGST;
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

  useEffect(() => {
    const firstDay    = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    fetchGstData(firstDay, currentDate);
  }, []);

  const applyDateFilterHandler = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    fetchGstData(tempFromDate, tempToDate);
  };

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
    gstDisplay: `${item.gstRate}%`,
    sgstAmt:    `₹${(item.sgstAmt    || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cgstAmt:    `₹${(item.cgstAmt    || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    igstAmt:    `₹${(item.igstAmt    || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
      const displayToDate   = toDate   ? formatDateForDisplay(toDate)   : formatDateForDisplay(getCurrentDate());
      const txnLabel        = transactionType ? ` | ${transactionType}` : "";

      const wsData = [
        [companyName],
        [`HSN REPORT FROM ${displayFromDate} To ${displayToDate}${txnLabel}`],
        [],
        ["S.No", "HSN Code", "Goods Name", "Total Qty",  "GST Rate", "Total Amount", "Taxable Amt", "SGST Amt", "CGST Amt", "IGST Amt"],
        ...filteredData.map((item, index) => [
          index + 1,
          item.hsnCode         || "",
         
          item.goods_name      || "",
          Number(item.totalQty   || 0),
           `${item.gstRate}%`   || "",
          Number(item.billAmt    || 0),
          Number(item.taxableAmt || 0),
          Number(item.sgstAmt    || 0),
          Number(item.cgstAmt    || 0),
          Number(item.igstAmt    || 0),
        ]),
        [],
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"]   = [{ wch: 8 }, { wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      ];
      ws["A1"] = { v: companyName, t: "s", s: { font: { bold: true, sz: 13 }, alignment: { horizontal: "center" } } };
      ws["A2"] = { v: `HSN REPORT FROM ${displayFromDate} To ${displayToDate}${txnLabel}`, t: "s", s: { font: { bold: true, sz: 11 }, alignment: { horizontal: "center" } } };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "HSN Report");
      XLSX.writeFile(wb, `HSN_Report_${displayFromDate}_to_${displayToDate}.xlsx`, { bookSST: true, cellStyles: true });
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Failed to generate Excel file");
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => {
    const firstDay    = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setSearchTerm("");
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    setTransactionType("");
    fetchGstData(firstDay, currentDate);
  };

  const clearDateFilters = () => {
    const firstDay    = getFirstDayOfCurrentMonth();
    const currentDate = getCurrentDate();
    setTempFromDate(firstDay);
    setTempToDate(currentDate);
    setFromDate(firstDay);
    setToDate(currentDate);
    fetchGstData(firstDay, currentDate);
  };

  const hsnColumns = [
    { key: "sl_no",      title: "S.No",         style: { textAlign: "center", width: "60px"  }, render: (value, record, index) => index + 1 },
    { key: "hsnCode",    title: "HSN Code",     style: { textAlign: "left",   width: "110px" } },
    { key: "goods_name", title: "Goods Name",   style: { textAlign: "left",   width: "200px" } },
    { key: "totalQty",   title: "Total Qty",    style: { textAlign: "right",  width: "100px" } },
        { key: "gstDisplay", title: "GST Rate",     style: { textAlign: "right",  width: "80px"  } },

    { key: "billAmt",    title: "Total Amount", style: { textAlign: "right",  width: "130px" } },
    { key: "taxableAmt", title: "Taxable Amt",  style: { textAlign: "right",  width: "130px" } },
    { key: "sgstAmt",    title: "SGST Amt",     style: { textAlign: "right",  width: "110px" } },
    { key: "cgstAmt",    title: "CGST Amt",     style: { textAlign: "right",  width: "110px" } },
    { key: "igstAmt",    title: "IGST Amt",     style: { textAlign: "right",  width: "110px" } },
  ];

  if (loading) return (
    <div className="hsn-report-container">
      <div className="hsn-report-loading">
        <div className="hsn-report-spinner"></div>
        <p>Loading HSN report data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="hsn-report-container">
      <div className="hsn-report-error">
        <p>{error}</p>
        <button onClick={() => fetchGstData()} className="hsn-report-retry-btn">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="hsn-report-container">
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
                <button className="hsn-report-clear-btn" onClick={() => setSearchTerm("")}>×</button>
              )}
            </div>
          </div>

          {/* Transaction Type */}
          <div className="hsn-report-date-input-wrapper">
            <label htmlFor="txn-type" className="hsn-report-date-label">Transaction Type</label>
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

          {/* Date Filters */}
          <div className="hsn-report-date-filters">
            <div className="hsn-report-date-input-wrapper">
              <label htmlFor="from-date" className="hsn-report-date-label">From Date</label>
              <input
                id="from-date"
                type="date"
                value={tempFromDate}
                onChange={(e) => setTempFromDate(e.target.value)}
                className="hsn-report-date-input"
              />
            </div>
            <div className="hsn-report-date-input-wrapper">
              <label htmlFor="to-date" className="hsn-report-date-label">To Date</label>
              <input
                id="to-date"
                type="date"
                value={tempToDate}
                onChange={(e) => setTempToDate(e.target.value)}
                className="hsn-report-date-input"
              />
            </div>
            <button
              className="hsn-report-apply-date-btn"
              onClick={applyDateFilterHandler}
              disabled={!tempFromDate || !tempToDate}
            >
              Add Filter
            </button>
            {(tempFromDate !== getFirstDayOfCurrentMonth() || tempToDate !== getCurrentDate()) && (
              <button className="hsn-report-reset-dates-btn" onClick={clearDateFilters}>
                Reset Dates
              </button>
            )}
          </div>

          {/* Export */}
          <button
            onClick={exportToExcel}
            disabled={exportLoading || filteredData.length === 0}
            className={`hsn-report-export-btn ${exportLoading ? 'hsn-report-export-btn--loading' : ''}`}
          >
            {exportLoading
              ? <><span className="hsn-report-spinner-small"></span>Exporting...</>
              : <><FaFileExcel className="hsn-report-export-icon" />Export Excel</>
            }
          </button>

          {/* Clear All */}
          {(searchTerm || transactionType) && (
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