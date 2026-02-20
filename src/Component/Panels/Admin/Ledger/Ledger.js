import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import LedgerPDF from "./LedgerPDF";
import html2pdf from "html2pdf.js";
import "./Ledger.css";

const Ledger = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [voucherList, setVoucherList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const pdfContentRef = useRef(null);
  const [orderModeFilter, setOrderModeFilter] = useState("ALL"); 

  useEffect(() => {
    fetchLedger();
    fetchVoucherList();
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await axios.get(`${baseurl}/ledger`);
      setLedgerData(res.data);
    } catch (err) {
      console.error("Error fetching ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherList = async () => {
    try {
      const res = await axios.get(`${baseurl}/voucher-list`);
      setVoucherList(res.data);
    } catch (err) {
      console.error("Error fetching voucher list:", err);
    }
  };

  const findVoucherByNumber = (voucherNumber) => {
    return voucherList.find(voucher => 
      voucher.InvoiceNumber === voucherNumber || 
      voucher.VchNo === voucherNumber
    );
  };

const handleVoucherClick = (voucherNumber, ledgerTransactionType, transaction) => {
  const transType = ledgerTransactionType?.toLowerCase() || "";
  
  if (transType === "debitnote" || transType === "creditnote") {
    const dbId = transaction.id; 
    
    if (transType === "debitnote") {
      if (transaction.data_type?.toLowerCase() === "purchase") {
        navigate(`/debitnote_view/${dbId}`);  
      } else if (transaction.data_type?.toLowerCase() === "stock inward") {
        navigate(`/kachadebitenoteview/${dbId}`); 
      }
    } else if (transType === "creditnote") {
      if (transaction.data_type?.toLowerCase() === "sales") {
        navigate(`/creditview/${dbId}`);  
      } else if (transaction.data_type?.toLowerCase() === "stock transfer") {
        navigate(`/kachacreditview/${dbId}`);  
      }
    }
    return;
  }

  // For other transaction types, find voucher in voucherList
  const voucher = findVoucherByNumber(voucherNumber);
  
  if (!voucher) {
    console.error("Voucher not found:", voucherNumber);
    return;
  }

  const transactionType = voucher.TransactionType?.toLowerCase() || "";
  const dataType = voucher.data_type?.toLowerCase() || "";
  const voucherId = voucher.VoucherID;
  const ledgerTransType = ledgerTransactionType?.toLowerCase() || "";

  console.log("Voucher clicked:", { transactionType, dataType, voucherId, ledgerTransType });

  // Handle Receipt and Purchase Voucher
  if (ledgerTransType === "receipt" || ledgerTransType === "purchase voucher") {
    if (dataType === "sales") {
      navigate(`/receipts_view/${voucherId}`);
    }
    else if (dataType === "purchase") {
      navigate(`/voucher_view/${voucherId}`);
    }
    else if (dataType === "stock transfer") {
      navigate(`/kachareceipts_view/${voucherId}`);
    }
    else if (dataType === "stock inward") {
      navigate(`/kachaPurchasevoucherview/${voucherId}`);
    }
    else {
      // Default for purchase voucher without specific dataType
      navigate(`/voucher_view/${voucherId}`);
    }
    return;
  }

  // For all other ledger entry types, use invoice paths
  if (transactionType === "stock transfer" || ledgerTransType === "stock transfer") {
    navigate(`/kachainvoicepdf/${voucherId}`);
  } 
  else if (transactionType === "stock inward" || ledgerTransType === "stock inward") {
    navigate(`/kachapurchasepdf/${voucherId}`);
  } 
  else if (transactionType === "sales" || ledgerTransType === "sales") {
    navigate(`/sales/invoice-preview/${voucherId}`);
  } 
  else if (transactionType === "purchase" || ledgerTransType === "purchase") {
    navigate(`/purchase/invoice-preview/${voucherId}`);
  }
};
const getVoucherDisplay = (voucherNumber, transactionType, transaction) => {
  const voucher = findVoucherByNumber(voucherNumber);
  
  const transType = transactionType?.toLowerCase() || "";
  
  if (transType === "debitnote" || transType === "creditnote") {
    return voucherNumber;
  }
  
  if (!voucher) return voucherNumber;
  
  // For receipt and purchase voucher, show VchNo
  if (transType === "receipt" || transType === "purchase voucher") {
    return voucher.VchNo || voucherNumber;
  }
  
  return voucher.InvoiceNumber || voucher.VchNo || voucherNumber;
};

const matchesOrderMode = (transaction) => {
  if (orderModeFilter === "ALL") return true;
  
  const trantype = transaction.trantype?.toLowerCase() || "";
  const dataType = transaction.data_type?.toLowerCase() || "";
  
  if (orderModeFilter === "PAKKA") {
    return (
      trantype === "purchase" || 
      trantype === "sales" ||
      trantype === "credit note" ||
      trantype === "debit note" ||
      dataType === "sales" ||
      dataType === "purchase"
    );
  } else if (orderModeFilter === "KACHA") {
    return (
      trantype === "stock inward" || 
      trantype === "stock transfer" ||
      trantype === "credit note" ||
      trantype === "debit note" ||
      dataType === "stock inward" ||
      dataType === "stock transfer"
    );
  }
  return true;
};

const groupedLedger = ledgerData.reduce((acc, entry) => {
  const key = entry.PartyID || "Unknown";
  
  if (!matchesOrderMode(entry)) {
    return acc;
  }
  
  if (!acc[key]) {
    acc[key] = {
      partyID: entry.PartyID || "Unknown",
      partyName: entry.PartyName || "Unknown Party",
      transactions: [],
      totalDebit: 0,
      totalCredit: 0,
      balance: 0,
    };
  }

  acc[key].transactions.push(entry);

  // NEW: Sort transactions in descending order by date (latest first)
  acc[key].transactions.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA; // Descending order (newest first)
  });

  const amount = parseFloat(entry.Amount || 0);

  if (entry.DC === "D") {
    acc[key].totalDebit += amount;
  } else if (entry.DC === "C") {
    acc[key].totalCredit += amount;
  }

  acc[key].balance = acc[key].totalCredit - acc[key].totalDebit;

  return acc;
}, {});

  const groupedArray = Object.values(groupedLedger);

  const filteredLedger = groupedArray.filter((item) => {
    const matchesSearch = searchTerm === "" || 
      item.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partyID.toString().includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    // Apply date filter if both dates are provided
    if (startDate && endDate) {
      const hasTransactionInDateRange = item.transactions.some(tx => {
        if (!tx.created_at) return false;
        
        const txDate = new Date(tx.created_at).toISOString().split('T')[0];
        return txDate >= startDate && txDate <= endDate;
      });
      
      return hasTransactionInDateRange;
    }
    
    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setOrderModeFilter("ALL");
  };

  // Export to PDF function
  const exportToPDF = async () => {
    if (filteredLedger.length === 0) {
      alert("No data to export");
      return;
    }

    setExportLoading(true);

    try {
      const element = pdfContentRef.current;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `ledger_report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          letterRendering: true,
          useCORS: true,
          logging: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'landscape'
        },
        pagebreak: { 
          mode: ['css', 'legacy'],
          before: '.pdf-party-section',
          after: ['pdf-summary-page', 'pdf-details-page']
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="ledger-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`ledger-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="ledger-container">
          {/* Search Filters - Top Row */}
          <div className="ledger-filters" style={{ 
            marginBottom: "20px", 
            padding: "15px", 
            backgroundColor: "#f8f9fa", 
            borderRadius: "5px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
              {/* Search Field */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontWeight: "bold" }}>Search:</label>
                <input
                  type="text"
                  placeholder="Search by Name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    width: "220px",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                  }}
                />
              </div>

              {/* From Date */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontWeight: "bold" }}>From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                  }}
                />
              </div>

              {/* To Date */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontWeight: "bold" }}>To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                  }}
                />
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || startDate || endDate || orderModeFilter !== "ALL") && (
                <button 
                  onClick={clearFilters}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={exportToPDF}
              disabled={exportLoading || filteredLedger.length === 0}
              style={{
                padding: "10px 20px",
                backgroundColor: exportLoading ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: exportLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginLeft: "auto"
              }}
            >
              {exportLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          </div>

          {/* KACHA/PAKKA Filter Buttons - Middle Row */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "25px",
            padding: "10px"
          }}>
            <button
              onClick={() => setOrderModeFilter("ALL")}
              style={{
                padding: "12px 40px",
                backgroundColor: orderModeFilter === "ALL" ? "#007bff" : "#e0e0e0",
                color: orderModeFilter === "ALL" ? "white" : "#333",
                border: "none",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                transition: "all 0.3s ease"
              }}
            >
              ALL
            </button>

            <button
              onClick={() => setOrderModeFilter("PAKKA")}
              style={{
                padding: "12px 40px",
                backgroundColor: orderModeFilter === "PAKKA" ? "#007bff" : "#e0e0e0",
                color: orderModeFilter === "PAKKA" ? "white" : "#333",
                border: "none",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                transition: "all 0.3s ease"
              }}
            >
              PAKKA
            </button>

            <button
              onClick={() => setOrderModeFilter("KACHA")}
              style={{
                padding: "12px 40px",
                backgroundColor: orderModeFilter === "KACHA" ? "#007bff" : "#e0e0e0",
                color: orderModeFilter === "KACHA" ? "white" : "#333",
                border: "none",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                transition: "all 0.3s ease"
              }}
            >
              KACHA
            </button>
          </div>

          {/* Hidden PDF Content */}
          <div style={{ display: 'none' }}>
            <LedgerPDF 
              ref={pdfContentRef}
              filteredLedger={filteredLedger}
              startDate={startDate}
              endDate={endDate}
            />
          </div>

          {/* Loading or Empty */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="loading-text">Loading ledger...</p>
            </div>
          ) : filteredLedger.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ fontSize: "16px", color: "#666" }}>
                {searchTerm || startDate || endDate || orderModeFilter !== "ALL"
                  ? "No parties found matching the applied filters."
                  : "No ledger entries found."
                }
              </p>
            </div>
          ) : (
            filteredLedger.map((ledger, index) => {
              const balanceType = ledger.balance >= 0 ? "Cr" : "Dr";
              const balanceDisplay = Math.abs(ledger.balance).toFixed(2);
              
              return (
                <div key={`${ledger.partyID}-${index}`} className="ledger-section">
                  {/* Header with Balance */}
                  <div className="ledger-header">
                    {ledger.partyName} (ID: {ledger.partyID}) — Balance:{" "}
                    {balanceDisplay} {balanceType}
                  </div>

<table className="ledger-table">
  <thead>
    <tr>
      <th>Transaction Date</th>
      <th>Transaction Type</th>
      <th>Rec/Vou No</th>
      <th>Credit</th>
      <th>Debit</th>
      <th>Balance</th> 
      <th>Created On</th>
    </tr>
  </thead>
  <tbody>
    {ledger.transactions.map((tx, idx) => {
      const dc = tx?.DC?.trim()?.charAt(0)?.toUpperCase();
      const voucherId = tx.voucherID;
      const voucherDisplay = getVoucherDisplay(voucherId, tx.trantype);
      
      const amount = parseFloat(tx.Amount || 0);
      const amountDisplay = amount.toFixed(2);
      
      const transactionType = (tx.trantype || "").toLowerCase();
      const showAmountInsteadOfBalance = 
        transactionType === "stock transfer" || 
        transactionType === "stock inward" || 
        transactionType === "sales" || 
        transactionType === "purchase";
      
      let balanceDisplay;
      if (showAmountInsteadOfBalance) {
        balanceDisplay = amountDisplay;
      } else {
        balanceDisplay = tx.balance_amount 
          ? parseFloat(tx.balance_amount).toFixed(2)
          : amountDisplay; 
      }

      return (
        <tr key={tx.id || idx}>
          <td>
            {tx.date 
              ? new Date(tx.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              : "-"
            }
          </td>
          <td>{tx.trantype || "-"}</td>
          <td>
            {voucherId ? (
              <span 
                onClick={() => handleVoucherClick(voucherId, tx.trantype, tx)}
                style={{
                  color: "#007bff",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: "500"
                }}
                title="Click to view invoice"
              >
                {voucherDisplay}
              </span>
            ) : "-"}
          </td>
          <td>
            {dc === "C" ? (
              <span style={{ color: "green", fontWeight: "bold" }}>
                {amountDisplay}
              </span>
            ) : "-"}
          </td>
          <td>
            {dc === "D" ? (
              <span style={{ color: "red", fontWeight: "bold" }}>
                {amountDisplay}
              </span>
            ) : "-"}
          </td>
          <td>
            <span style={{ 
              fontWeight: "bold",
              color: "#6c757d" 
            }}>
              {balanceDisplay}
            </span>
          </td>
          <td>
            {tx.created_at
              ? new Date(tx.created_at).toLocaleString("en-IN", {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : "-"}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;