// Gstreportnavya.js — GSTR-3B report with dynamic API integration

import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { FaSearch, FaFileExcel } from "react-icons/fa";
import "./GSTReportb3.css";
import { baseurl } from "../../../BaseURL/BaseURL";

// ─── Constants ────────────────────────────────────────────────────────────────

const CHIPS = [
  { label: "All",        key: "all"       },
  { label: "B2B only",   key: "b2b"       },
  { label: "B2C only",   key: "b2c"       },
  { label: "5% GST",     key: "5gst"      },
  { label: "0% GST",     key: "0gst"      },
  { label: "With GSTIN", key: "withGstin" },
  { label: "No GSTIN",   key: "noGstin"   },
];

// const API_BASE = "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getCurrentDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};
const getFirstDayOfCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
};
const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

// ── TransactionType badge helper ──────────────────────────────────────────────
function TxTypeBadge({ type }) {
  const t = (type || "").toLowerCase();
  let cls = "gst-txtype-badge";
  if (t === "sales")        cls += " gst-txtype-badge--sales";
  else if (t === "receipt") cls += " gst-txtype-badge--receipt";
  else if (t === "payment") cls += " gst-txtype-badge--payment";
  else if (t === "contra")  cls += " gst-txtype-badge--contra";
  else if (t === "journal") cls += " gst-txtype-badge--journal";
  else if (t === "purchase")cls += " gst-txtype-badge--purchase";
  else                      cls += " gst-txtype-badge--other";
  return <span className={cls}>{type || "—"}</span>;
}

// ══════════════════════════════════════════════════════════════════════════════
// TRANSACTION HISTORY PAGE
// mode="party"  → fetches all line items for the party (existing /transactions)
// mode="bill"   → fetches line items for a single invoice (/bill-transactions)
// ══════════════════════════════════════════════════════════════════════════════

function TransactionHistoryPage({ bill, mode, onBack }) {
  const firstDay    = getFirstDayOfCurrentMonth();
  const currentDate = getCurrentDate();

  const [search,      setSearch]      = useState("");
  const [fromDate,    setFromDate]    = useState(firstDay);
  const [toDate,      setToDate]      = useState(currentDate);
  const [appliedFrom, setAppliedFrom] = useState(firstDay);
  const [appliedTo,   setAppliedTo]   = useState(currentDate);
  const [txData,      setTxData]      = useState([]);
  const [txLoading,   setTxLoading]   = useState(true);
  const [txError,     setTxError]     = useState("");

  // Summary KPI state
  const [kpi, setKpi] = useState({
    totalSales: 0, totalTransactions: 0,
    totalProductsSold: 0, avgTransactionValue: 0,
  });

  // ── Fetch logic — branches on mode ─────────────────────────────────────────
  const fetchTx = useCallback(async () => {
    setTxLoading(true);
    setTxError("");
    try {
      let url;
      if (mode === "bill") {
        // Single invoice: use voucherId (b.id) for exact lookup — avoids
        // invoice-number ambiguity when multiple TransactionTypes share the same billNo
        const params = new URLSearchParams({ billNo: bill.billNo });
        if (bill.id) params.set("voucherId", bill.id);
        url = `${baseurl}/api/gstr3b/bill-transactions?${params}`;
      } else {
        // Party: all invoices for the party (existing behaviour)
        const params = new URLSearchParams({ billNo: bill.billNo });
        if (appliedFrom) params.set("fromDate", appliedFrom);
        if (appliedTo)   params.set("toDate",   appliedTo);
        url = `${baseurl}/api/gstr3b/transactions?${params}`;
      }

      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rows = data.transactions || data.data || [];
      setTxData(rows);

      if (data.summary) {
        setKpi({
          totalSales:          data.summary.totalSales          || 0,
          totalTransactions:   data.summary.totalTransactions   || 0,
          totalProductsSold:   data.summary.totalProductsSold   || 0,
          avgTransactionValue: data.summary.avgTransactionValue || 0,
        });
      } else {
        const totalSales = rows.reduce((s, r) => s + (Number(r.amount)   || 0), 0);
        const totalQty   = rows.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
        setKpi({
          totalSales,
          totalTransactions:   rows.length,
          totalProductsSold:   totalQty,
          avgTransactionValue: rows.length > 0 ? totalSales / rows.length : 0,
        });
      }
    } catch (err) {
      setTxError(err.message);
      const fallback = [{
        id:              bill.id,
        partyName:       bill.party,
        date:            bill.date,
        invoiceNo:       bill.billNo,
        transactionType: bill.transactionType || "Sales",
        productName:     "—",
        ratePerUnit:     bill.taxableAmt,
        quantity:        1,
        amount:          bill.billAmt,
      }];
      setTxData(fallback);
      setKpi({
        totalSales:           bill.billAmt,
        totalTransactions:    1,
        totalProductsSold:    1,
        avgTransactionValue:  bill.billAmt,
      });
    } finally {
      setTxLoading(false);
    }
  }, [bill, mode, appliedFrom, appliedTo]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const handleApply = () => { setAppliedFrom(fromDate); setAppliedTo(toDate); };

  const handleClearDates = () => {
    setFromDate(firstDay); setToDate(currentDate);
    setAppliedFrom(firstDay); setAppliedTo(currentDate);
  };

  // Date filter controls are only meaningful in party mode
  const showDateFilter  = mode === "party";
  const showClearDates  = showDateFilter && (fromDate !== firstDay || toDate !== currentDate);

  // Page title: party name for party mode, invoice number for bill mode
  const pageTitle = mode === "bill" ? bill.billNo : (bill.party || bill.billNo);

  // Client-side search filter
  const filtered = txData.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(r.invoiceNo       || "").toLowerCase().includes(q) ||
      String(r.partyName       || "").toLowerCase().includes(q) ||
      String(r.productName     || "").toLowerCase().includes(q) ||
      String(r.hsnCode         || "").toLowerCase().includes(q) ||
      String(r.transactionType || "").toLowerCase().includes(q)
    );
  });

  // Excel export — includes TransactionType column when in bill mode
  const handleExport = () => {
    if (!filtered.length) { alert("No data to export"); return; }
    const displayFrom = formatDateForDisplay(appliedFrom);
    const displayTo   = formatDateForDisplay(appliedTo);
    const titleLine   = mode === "bill"
      ? `BILL TRANSACTIONS — ${bill.billNo}`
      : `TRANSACTION HISTORY — ${bill.party} — ${displayFrom} to ${displayTo}`;

    const headers = mode === "bill"
      ? ["S.No", "Party Name", "Date", "Invoice No", "Transaction Type", "Product Name", "HSN Code", "Rate Per Unit", "Quantity", "GST %", "Amount"]
      : ["S.No", "Party Name", "Date", "Invoice No", "Product Name", "HSN Code", "Rate Per Unit", "Quantity", "GST %", "Amount"];

    const rows = filtered.map((r, i) =>
      mode === "bill"
        ? [
            i + 1,
            r.partyName       || "",
            r.date            || "",
            r.invoiceNo       || "",
            r.transactionType || "",
            r.productName     || "",
            r.hsnCode         || "",
            Number(r.ratePerUnit || 0),
            Number(r.quantity    || 0),
            r.gstPct != null ? `${r.gstPct}%` : "",
            Number(r.amount      || 0),
          ]
        : [
            i + 1,
            r.partyName   || "",
            r.date        || "",
            r.invoiceNo   || "",
            r.productName || "",
            r.hsnCode     || "",
            Number(r.ratePerUnit || 0),
            Number(r.quantity    || 0),
            r.gstPct != null ? `${r.gstPct}%` : "",
            Number(r.amount      || 0),
          ]
    );

    const colCount = headers.length;
    const wsData = [
      ["SHREE SHASHWAT RAJ AGRO PVT.LTD."],
      [titleLine],
      [],
      headers,
      ...rows,
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = mode === "bill"
      ? [{ wch: 6 }, { wch: 25 }, { wch: 12 }, { wch: 22 }, { wch: 16 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 8 }, { wch: 14 }]
      : [{ wch: 6 }, { wch: 25 }, { wch: 12 }, { wch: 22 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 8 }, { wch: 14 }];
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const fileName = mode === "bill"
      ? `Transactions_Bill_${bill.billNo}.xlsx`
      : `Transactions_${bill.party}_${displayFrom}_to_${displayTo}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ── bill mode: 11 columns (adds Transaction Type) | party mode: 10 columns ──
  const colSpan = mode === "bill" ? 11 : 10;

  return (
    <div className="txh-page">

      {/* ── Gradient header: ← Back  |  Title ── */}
      <div className="txh-header">
        <button className="txh-back-btn" onClick={onBack}>
          <span className="txh-back-arrow">←</span> Back
        </button>
        <h2 className="txh-header-title">{pageTitle}</h2>
        <div className="txh-header-spacer" />
      </div>

      {/* ── KPI cards ── */}
      <div className="txh-kpi-grid">
        <div className="txh-kpi-card">
          <p className="txh-kpi-label">TOTAL SALES</p>
          <p className="txh-kpi-value">{fmt(kpi.totalSales)}</p>
          <p className="txh-kpi-sub">{mode === "bill" ? "This Invoice" : "All time"}</p>
        </div>
        <div className="txh-kpi-card">
          <p className="txh-kpi-label">TOTAL TRANSACTIONS</p>
          <p className="txh-kpi-value">{kpi.totalTransactions}</p>
          <p className="txh-kpi-sub">&nbsp;</p>
        </div>
        <div className="txh-kpi-card">
          <p className="txh-kpi-label">TOTAL PRODUCTS SOLD</p>
          <p className="txh-kpi-value">{kpi.totalProductsSold}</p>
          <p className="txh-kpi-sub">Quantity</p>
        </div>
        <div className="txh-kpi-card">
          <p className="txh-kpi-label">AVERAGE TRANSACTION VALUE</p>
          <p className="txh-kpi-value">{fmt(kpi.avgTransactionValue)}</p>
          <p className="txh-kpi-sub">Per Voucher</p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="txh-filter-bar">
        {/* Search */}
        <div className="txh-search-wrap">
          <FaSearch className="txh-search-icon" />
          <input
            type="text"
            className="txh-search-input"
            placeholder="Search by Invoice No, Party, Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="txh-search-clear" onClick={() => setSearch("")}>×</button>
          )}
        </div>

        {/* Date pickers — only shown in party mode */}
        {showDateFilter && (
          <>
            <div className="txh-date-group">
              <span className="txh-date-lbl">From Date</span>
              <input type="date" className="txh-date-inp" value={fromDate}
                onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="txh-date-group">
              <span className="txh-date-lbl">To Date</span>
              <input type="date" className="txh-date-inp" value={toDate}
                onChange={(e) => setToDate(e.target.value)} />
            </div>
            <button className="txh-btn txh-btn--apply" onClick={handleApply}>
              Apply Date Filter
            </button>
            {showClearDates && (
              <button className="txh-btn txh-btn--clear" onClick={handleClearDates}>
                Clear Dates
              </button>
            )}
          </>
        )}

        {/* Generate Report */}
        <button className="txh-btn txh-btn--generate" onClick={handleExport}
          disabled={!filtered.length}>
          <FaFileExcel style={{ marginRight: 6 }} />
          Generate Report
        </button>
      </div>

      {/* ── Table ── */}
      <div className="txh-tbl-card">
        <div className="txh-tbl-scroll">
          <table className="txh-tbl">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>PARTY NAME</th>
                <th>DATE</th>
                <th>INVOICE NO</th>
                {/* TransactionType column — only in bill mode */}
                {mode === "bill" && <th>TRANSACTION TYPE</th>}
                <th>PRODUCT NAME</th>
                <th>HSN CODE</th>
                <th>RATE PER UNIT</th>
                <th>QUANTITY</th>
                <th>GST %</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {txLoading ? (
                <tr><td colSpan={colSpan} className="txh-tbl-empty">Loading...</td></tr>
              ) : txError && filtered.length === 0 ? (
                <tr><td colSpan={colSpan} className="txh-tbl-empty" style={{ color: "#dc2626" }}>{txError}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={colSpan} className="txh-tbl-empty">No transactions found.</td></tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{r.partyName    || "—"}</td>
                    <td>{r.date        || "—"}</td>
                    <td>{r.invoiceNo   || "—"}</td>
                    {mode === "bill" && (
                      <td><TxTypeBadge type={r.transactionType} /></td>
                    )}
                    <td>{r.productName || "—"}</td>
                    <td>{r.hsnCode     || "—"}</td>
                    <td>{fmt(r.ratePerUnit || 0)}</td>
                    <td>{Number(r.quantity || 0).toFixed(2)}</td>
                    <td>{r.gstPct != null ? `${r.gstPct}%` : "—"}</td>
                    <td>{fmt(r.amount  || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {!txLoading && filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={mode === "bill" ? 8 : 7} className="txh-tfoot-label">
                    Total ({filtered.length} records)
                  </td>
                  <td className="txh-tfoot-val">
                    {filtered.reduce((s, r) => s + (Number(r.quantity) || 0), 0).toFixed(2)}
                  </td>
                  <td className="txh-tfoot-val"></td>
                  <td className="txh-tfoot-val">
                    {fmt(filtered.reduce((s, r) => s + (Number(r.amount) || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN GSTR-3B REPORT PAGE
// ══════════════════════════════════════════════════════════════════════════════

function SummaryCard({ label, value, sub, valueColor }) {
  return (
    <div className="gst-kpi-card">
      <p className="gst-kpi-label">{label}</p>
      <p className="gst-kpi-value" style={{ color: valueColor }}>{value}</p>
      <p className="gst-kpi-sub">{sub}</p>
    </div>
  );
}

function SearchFilterSection({
  search, onSearch, fromDate, onFromDate, toDate, onToDate,
  onApply, onClearDates, showClearDates, onGenerateReport, exportLoading, hasData,
}) {
  return (
    <div className="gst3b-filter-section">
      <div className="gst3b-filters-wrapper">
        <div className="gst3b-search-wrapper">
          <div className="gst3b-search-input-group">
            <FaSearch className="gst3b-search-icon" />
            <input type="text" className="gst3b-search-input"
              placeholder="Search Product, Retailer, Staff..."
              value={search} onChange={(e) => onSearch(e.target.value)} />
            {search && (
              <button className="gst3b-clear-btn" onClick={() => onSearch("")} title="Clear search">×</button>
            )}
          </div>
        </div>

        <div className="gst3b-date-filters">
          <div className="gst3b-date-input-wrapper">
            <label className="gst3b-date-label">From Date</label>
            <input type="date" className="gst3b-date-input" value={fromDate}
              onChange={(e) => onFromDate(e.target.value)} />
          </div>
          <div className="gst3b-date-input-wrapper">
            <label className="gst3b-date-label">To Date</label>
            <input type="date" className="gst3b-date-input" value={toDate}
              onChange={(e) => onToDate(e.target.value)} />
          </div>
          <button className="gst3b-apply-date-btn" onClick={onApply}>Apply Filter</button>
          {showClearDates && (
            <button className="gst3b-reset-dates-btn" onClick={onClearDates}>Clear Dates</button>
          )}
        </div>

        <button
          className={`gst3b-export-btn${exportLoading ? " gst3b-export-btn--loading" : ""}`}
          onClick={onGenerateReport} disabled={exportLoading || !hasData}>
          {exportLoading
            ? <><span className="gst3b-spinner-small"></span>Exporting...</>
            : <><FaFileExcel className="gst3b-export-icon" />Generate Report</>}
        </button>
      </div>
    </div>
  );
}

function FilterChips({ active, onChange }) {
  return (
    <div className="gst-chips-row">
      {CHIPS.map((c) => (
        <button key={c.key}
          className={`gst-chip${active === c.key ? " gst-chip--on" : ""}`}
          onClick={() => onChange(c.key)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

// ── GSTTable — Bill No. click opens bill detail, Party click opens party detail
// ── NOW includes TRANSACTION TYPE column (14 columns total)
function GSTTable({ bills, startIdx, loading, error, onBillClick, onPartyClick }) {
  const totalBillAmt = bills.reduce((s, b) => s + b.billAmt,    0);
  const totalTaxable = bills.reduce((s, b) => s + b.taxableAmt, 0);
  const totalSgst    = bills.reduce((s, b) => s + b.sgst,       0);
  const totalCgst    = bills.reduce((s, b) => s + b.cgst,       0);
  const totalIgst    = bills.reduce((s, b) => s + b.igst,       0);

  return (
    <div className="gst-tbl-scroll">
      <table className="gst-tbl">
        <thead>
          <tr>
            <th>S.NO</th>
            <th>BILL NO.</th>
            <th>DATE</th>
            <th>PARTY</th>
            <th>GST NO.</th>
            <th>BB/BC</th>
            <th>TRANSACTION TYPE</th>
            <th>HSN CODE</th>
            <th>BILL AMT</th>
            <th>TAXABLE AMT</th>
            <th>GST %</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>IGST</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={14} className="gst-tbl-empty">Loading...</td></tr>
          ) : error ? (
            <tr><td colSpan={14} className="gst-tbl-empty" style={{ color: "#dc2626" }}>{error}</td></tr>
          ) : bills.length === 0 ? (
            <tr><td colSpan={14} className="gst-tbl-empty">No bills found for the selected filters.</td></tr>
          ) : (
            bills.map((b, idx) => (
              <tr key={b.id}>
                <td>{startIdx + idx + 1}</td>
                <td>
                  {/* Clickable Bill No → opens bill-level line items */}
                  <span className="gst-bill-link" onClick={() => onBillClick(b)}>
                    {b.billNo}
                  </span>
                </td>
                <td>{b.date}</td>
                <td>
                  {/* Clickable Party Name → opens all party transactions */}
                  <span className="gst-party-link" onClick={() => onPartyClick(b)}>
                    {b.party}
                  </span>
                </td>
                <td className={b.gstNo === "N/A" ? "gst-na" : ""}>{b.gstNo}</td>
                <td><span className={`gst-badge gst-badge--${b.bbbc}`}>{b.bbbc}</span></td>
                {/* ── NEW: Transaction Type badge ── */}
                <td><TxTypeBadge type={b.transactionType} /></td>
                <td>{b.hsnCode}</td>
                <td>{fmt(b.billAmt)}</td>
                <td>{fmt(b.taxableAmt)}</td>
                <td className={b.gst && b.gst.startsWith("0") ? "gst-rate-zero" : "gst-rate-pos"}>{b.gst}</td>
                <td>{fmt(b.sgst)}</td>
                <td>{fmt(b.cgst)}</td>
                <td>{fmt(b.igst)}</td>
              </tr>
            ))
          )}
        </tbody>
        {!loading && !error && bills.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan={8} className="gst-tfoot-label">Total ({bills.length} bills shown)</td>
              <td className="gst-tfoot-val">{fmt(totalBillAmt)}</td>
              <td className="gst-tfoot-val">{fmt(totalTaxable)}</td>
              <td></td>
              <td className="gst-tfoot-val">{fmt(totalSgst)}</td>
              <td className="gst-tfoot-val">{fmt(totalCgst)}</td>
              <td className="gst-tfoot-val">{fmt(totalIgst)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function Pagination({ page, totalPages, totalItems, pageSize, onPageChange, onSizeChange }) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, totalItems);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="gst-pagination">
      <span className="gst-pg-info">Showing {start} to {end} of {totalItems} entries</span>
      <div className="gst-pg-right">
        <span className="gst-pg-show">Show</span>
        <select className="gst-pg-select" value={pageSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}>
          {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="gst-pg-show">entries</span>
        <div className="gst-pg-btns">
          <button className="gst-pg-btn" onClick={() => onPageChange(1)} disabled={page === 1}>«</button>
          {pages.map((p) => (
            <button key={p}
              className={`gst-pg-btn${p === page ? " gst-pg-btn--active" : ""}`}
              onClick={() => onPageChange(p)}>{p}</button>
          ))}
          <button className="gst-pg-btn" onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      </div>
    </div>
  );
}

function SegmentedControl({ onTabChange, activeTab }) {
  return (
    <div className="gst-seg-control">
      <button
        className={`gst-seg-btn${activeTab === "gstr1" ? " gst-seg-btn--active" : ""}`}
        type="button" aria-current={activeTab === "gstr1" ? "page" : undefined}
        onClick={() => onTabChange("gstr1")}>
        GSTR-1
      </button>
      <button
        className={`gst-seg-btn${activeTab === "gstr3b" ? " gst-seg-btn--active" : ""}`}
        type="button" aria-current={activeTab === "gstr3b" ? "page" : undefined}>
        GSTR-3B
      </button>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function GSTReport({ onTabChange, activeTab }) {
  const firstDay    = getFirstDayOfCurrentMonth();
  const currentDate = getCurrentDate();

  // ── drill-down state ──────────────────────────────────────────────────────
  // drillMode: null = list view | "party" = party transactions | "bill" = bill line items
  const [selectedBill, setSelectedBill] = useState(null);
  const [drillMode,    setDrillMode]    = useState(null); // "party" | "bill"

  // ── filter state ──────────────────────────────────────────────────────────
  const [search,        setSearch]        = useState("");
  const [fromDate,      setFromDate]      = useState(firstDay);
  const [toDate,        setToDate]        = useState(currentDate);
  const [appliedFrom,   setAppliedFrom]   = useState(firstDay);
  const [appliedTo,     setAppliedTo]     = useState(currentDate);
  const [chip,          setChip]          = useState("all");
  const [page,          setPage]          = useState(1);
  const [pageSize,      setPageSize]      = useState(10);
  const [exportLoading, setExportLoading] = useState(false);

  // ── API data state ────────────────────────────────────────────────────────
  const [summary, setSummary] = useState({
    totalBillAmount: 0, taxableAmount: 0,
    totalTransactions: 0, totalGSTCollected: 0,
  });
  const [bills,          setBills]          = useState([]);
  const [totalRecords,   setTotalRecords]   = useState(0);
  const [totalPages,     setTotalPages]     = useState(1);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [tableLoading,   setTableLoading]   = useState(false);
  const [summaryError,   setSummaryError]   = useState("");
  const [tableError,     setTableError]     = useState("");

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true); setSummaryError("");
    try {
      const params = new URLSearchParams();
      if (appliedFrom) params.set("fromDate", appliedFrom);
      if (appliedTo)   params.set("toDate",   appliedTo);
      const res = await fetch(`${baseurl}/api/gstr3b/summary?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      setSummary(await res.json());
    } catch (err) { setSummaryError(err.message); }
    finally { setSummaryLoading(false); }
  }, [appliedFrom, appliedTo]);

  const fetchList = useCallback(async () => {
    setTableLoading(true); setTableError("");
    try {
      const params = new URLSearchParams({ page, limit: pageSize, search, filterType: chip });
      if (appliedFrom) params.set("fromDate", appliedFrom);
      if (appliedTo)   params.set("toDate",   appliedTo);
      const res  = await fetch(`${baseurl}/api/gstr3b/list?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setBills(data.data || []);
      setTotalRecords(data.totalRecords || 0);
      setTotalPages(data.totalPages     || 1);
    } catch (err) {
      setTableError(`Failed to load bill list. (${err.message})`);
      setBills([]);
    } finally { setTableLoading(false); }
  }, [page, pageSize, search, chip, appliedFrom, appliedTo]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchList();    }, [fetchList]);

  const handleChip   = (key) => { setChip(key);   setPage(1); };
  const handleSearch = (v)   => { setSearch(v);   setPage(1); };
  const handleSize   = (n)   => { setPageSize(n); setPage(1); };

  const handleApplyDate = () => { setAppliedFrom(fromDate); setAppliedTo(toDate); setPage(1); };

  const handleClearDates = () => {
    setFromDate(firstDay); setToDate(currentDate);
    setAppliedFrom(firstDay); setAppliedTo(currentDate); setPage(1);
  };

  const showClearDates = fromDate !== firstDay || toDate !== currentDate;

  // ── Drill-down handlers ───────────────────────────────────────────────────
  // Bill No. click → bill mode (single invoice line items)
  const handleBillClick = (b) => {
    setSelectedBill(b);
    setDrillMode("bill");
  };

  // Party name click → party mode (all transactions for the party)
  const handlePartyClick = (b) => {
    setSelectedBill(b);
    setDrillMode("party");
  };

  const handleBack = () => {
    setSelectedBill(null);
    setDrillMode(null);
  };

  const handleGenerateReport = () => {
    if (!bills || bills.length === 0) { alert("No data to export"); return; }
    setExportLoading(true);
    try {
      const displayFrom = formatDateForDisplay(appliedFrom);
      const displayTo   = formatDateForDisplay(appliedTo);
      const wsData = [
        ["SHREE SHASHWAT RAJ AGRO PVT.LTD."],
        [`GSTR-3B REPORT FROM ${displayFrom} To ${displayTo}`],
        [],
        ["S.No","Bill No.","Date","Party","GST No.","BB/BC","Transaction Type","HSN Code",
         "Bill Amt","Taxable Amt","GST %","SGST","CGST","IGST"],
        ...bills.map((b, idx) => [
          idx + 1, b.billNo||"", b.date||"", b.party||"", b.gstNo||"",
          b.bbbc||"", b.transactionType||"", b.hsnCode||"",
          Number(b.billAmt||0), Number(b.taxableAmt||0), b.gst||"",
          Number(b.sgst||0), Number(b.cgst||0), Number(b.igst||0),
        ]),
        [],
        ["","","","","","","","TOTALS",
          bills.reduce((s,b)=>s+(b.billAmt||0),0),
          bills.reduce((s,b)=>s+(b.taxableAmt||0),0),"",
          bills.reduce((s,b)=>s+(b.sgst||0),0),
          bills.reduce((s,b)=>s+(b.cgst||0),0),
          bills.reduce((s,b)=>s+(b.igst||0),0)],
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [
        {wch:6},{wch:18},{wch:12},{wch:25},{wch:20},
        {wch:8},{wch:16},{wch:12},{wch:14},{wch:14},
        {wch:10},{wch:14},{wch:14},{wch:14},
      ];
      ws["!merges"] = [
        {s:{r:0,c:0},e:{r:0,c:13}},
        {s:{r:1,c:0},e:{r:1,c:13}},
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GSTR-3B");
      XLSX.writeFile(wb, `GSTR3B_${displayFrom}_to_${displayTo}.xlsx`);
    } catch (err) {
      console.error("Error generating Excel:", err);
      alert("Failed to generate Excel file");
    } finally { setExportLoading(false); }
  };

  const startIdx  = (page - 1) * pageSize;
  const dateLabel = appliedFrom && appliedTo ? `${appliedFrom} to ${appliedTo}` : "All dates";

  // ── Drill-down page ───────────────────────────────────────────────────────
  if (selectedBill && drillMode) {
    return (
      <TransactionHistoryPage
        bill={selectedBill}
        mode={drillMode}
        onBack={handleBack}
      />
    );
  }

  // ── Main GSTR-3B list page ────────────────────────────────────────────────
  return (
    <div className="gst-page">

      <div className="gst-page-header">
        <h1 className="gst-page-title">Business Reports</h1>
        <SegmentedControl onTabChange={onTabChange} activeTab={activeTab} />
      </div>

      <div className="gst-kpi-grid">
        <SummaryCard label="TOTAL BILL AMOUNT"
          value={summaryLoading ? "Loading…" : summaryError ? "—" : fmt(summary.totalBillAmount)}
          sub={dateLabel} valueColor="#111827" />
        <SummaryCard label="TAXABLE AMOUNT"
          value={summaryLoading ? "Loading…" : summaryError ? "—" : fmt(summary.taxableAmount)}
          sub="Before GST" valueColor="#16a34a" />
        <SummaryCard label="TOTAL TRANSACTIONS"
          value={summaryLoading ? "Loading…" : summaryError ? "—" : summary.totalTransactions}
          sub="GST Bill Records" valueColor="#111827" />
        <SummaryCard label="TOTAL GST COLLECTED"
          value={summaryLoading ? "Loading…" : summaryError ? "—" : fmt(summary.totalGSTCollected)}
          sub="IGST + CGST + SGST" valueColor="#111827" />
      </div>

      <SearchFilterSection
        search={search}           onSearch={handleSearch}
        fromDate={fromDate}       onFromDate={setFromDate}
        toDate={toDate}           onToDate={setToDate}
        onApply={handleApplyDate} onClearDates={handleClearDates}
        showClearDates={showClearDates}
        onGenerateReport={handleGenerateReport}
        exportLoading={exportLoading} hasData={bills.length > 0}
      />

      <FilterChips active={chip} onChange={handleChip} />

      <div className="gst-tbl-card">
        <GSTTable
          bills={bills} startIdx={startIdx}
          loading={tableLoading} error={tableError}
          onBillClick={handleBillClick}
          onPartyClick={handlePartyClick}
        />
        <Pagination
          page={page} totalPages={totalPages} totalItems={totalRecords}
          pageSize={pageSize} onPageChange={setPage} onSizeChange={handleSize}
        />
      </div>

    </div>
  );
}