import { useState, useMemo } from "react";
import "./GSTReportnavya.css";

// ─── Dummy Data ────────────────────────────────────────────────────────────────
const ALL_BILLS = [
  { id: 1,  billNo: "SSA/000016/26-27", date: "04/06/2026", party: "Sai",       gstNo: "N/A",             bbbc: "b2b", hsnCode: "111",       billAmt: 2730,  taxableAmt: 2600,  gst: "5.00%",      sgst: 0,    cgst: 130,  igst: 0   },
  { id: 2,  billNo: "SSA/000015/26-27", date: "04/06/2026", party: "John Doe",  gstNo: "29ABCDE1234F2Z5", bbbc: "b2b", hsnCode: "1111",      billAmt: 2400,  taxableAmt: 2400,  gst: "0.00%",      sgst: 0,    cgst: 0,    igst: 0   },
  { id: 3,  billNo: "SSA/000014/26-27", date: "04/06/2026", party: "John Doe",  gstNo: "29ABCDE1234F2Z5", bbbc: "b2b", hsnCode: "111, 1111", billAmt: 5130,  taxableAmt: 5000,  gst: "5.00%, 0%",  sgst: 0,    cgst: 130,  igst: 0   },
  { id: 4,  billNo: "SSA/000013/26-27", date: "04/06/2026", party: "Pavan",     gstNo: "36AAACI4798L2ZY", bbbc: "b2b", hsnCode: "1111",      billAmt: 1200,  taxableAmt: 1200,  gst: "0.00%",      sgst: 0,    cgst: 0,    igst: 0   },
  { id: 5,  billNo: "SSA/000012/26-27", date: "04/06/2026", party: "Pavan",     gstNo: "24EJIPP8401D1ZC", bbbc: "b2c", hsnCode: "1111",      billAmt: 4800,  taxableAmt: 4800,  gst: "0.00%",      sgst: 0,    cgst: 0,    igst: 0   },
  { id: 6,  billNo: "SSA/000011/26-27", date: "03/06/2026", party: "Mahesh",    gstNo: "36BBBCD5678G3H7", bbbc: "b2b", hsnCode: "2222",      billAmt: 3600,  taxableAmt: 3200,  gst: "12.50%",     sgst: 200,  cgst: 200,  igst: 0   },
  { id: 7,  billNo: "SSA/000010/26-27", date: "03/06/2026", party: "Suresh",    gstNo: "N/A",             bbbc: "b2c", hsnCode: "3333",      billAmt: 1800,  taxableAmt: 1800,  gst: "0.00%",      sgst: 0,    cgst: 0,    igst: 0   },
  { id: 8,  billNo: "SSA/000009/26-27", date: "02/06/2026", party: "Ramesh",    gstNo: "29XYZAB9012C4D8", bbbc: "b2b", hsnCode: "111",       billAmt: 5250,  taxableAmt: 5000,  gst: "5.00%",      sgst: 0,    cgst: 250,  igst: 0   },
  { id: 9,  billNo: "SSA/000008/26-27", date: "02/06/2026", party: "Anitha",    gstNo: "36CCCDE6789F5G9", bbbc: "b2b", hsnCode: "4444",      billAmt: 2100,  taxableAmt: 2100,  gst: "0.00%",      sgst: 0,    cgst: 0,    igst: 0   },
  { id: 10, billNo: "SSA/000007/26-27", date: "01/06/2026", party: "Venkat",    gstNo: "N/A",             bbbc: "b2c", hsnCode: "1111",      billAmt: 960,   taxableAmt: 960,   gst: "0.00%",      sgst: 0,    cgst: 0,    igst: 0   },
  { id: 11, billNo: "SSA/000006/26-27", date: "01/06/2026", party: "Sai Reddy", gstNo: "29PQRST7654U8V2", bbbc: "b2b", hsnCode: "111",       billAmt: 2100,  taxableAmt: 2000,  gst: "5.00%",      sgst: 0,    cgst: 100,  igst: 0   },
  { id: 12, billNo: "SSA/000005/26-27", date: "01/06/2026", party: "Kiran",     gstNo: "36DDDEE1234K5L6", bbbc: "b2b", hsnCode: "2222",      billAmt: 4200,  taxableAmt: 4000,  gst: "5.00%",      sgst: 0,    cgst: 200,  igst: 0   },
  { id: 13, billNo: "SSA/000004/26-27", date: "01/06/2026", party: "Priya",     gstNo: "N/A",             bbbc: "b2c", hsnCode: "3333",      billAmt: 990,   taxableAmt: 990,   gst: "0.00%",      sgst: 0,    cgst: 0,    igst: 0   },
  { id: 14, billNo: "SSA/000003/26-27", date: "01/06/2026", party: "Arjun",     gstNo: "29MNOPQ5432R6S1", bbbc: "b2b", hsnCode: "1111",      billAmt: 3300,  taxableAmt: 3300,  gst: "0.00%",      sgst: 0,    cgst: 0,    igst: 0   },
  { id: 15, billNo: "SSA/000002/26-27", date: "01/06/2026", party: "Deepa",     gstNo: "36EEEEF2345M7N8", bbbc: "b2b", hsnCode: "111",       billAmt: 5250,  taxableAmt: 5000,  gst: "5.00%",      sgst: 0,    cgst: 250,  igst: 0   },
  { id: 16, billNo: "SSA/000001/26-27", date: "01/06/2026", party: "Ravi",      gstNo: "N/A",             bbbc: "b2c", hsnCode: "4444",      billAmt: 2150,  taxableAmt: 2150,  gst: "0.00%",      sgst: 0,    cgst: 0,    igst: 0   },
];

const CHIPS = [
  { label: "All",        key: "all" },
  { label: "B2B only",   key: "b2b" },
  { label: "B2C only",   key: "b2c" },
  { label: "5% GST",     key: "5gst" },
  { label: "0% GST",     key: "0gst" },
  { label: "With GSTIN", key: "withGstin" },
  { label: "No GSTIN",   key: "noGstin" },
];

const PAGE_SIZE = 5;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, subColor, borderColor }) {
  return (
    <div className="summary-card" style={{ borderTopColor: borderColor }}>
      <div className="summary-card__label">{label}</div>
      <div className="summary-card__value">{value}</div>
      <div className="summary-card__sub" style={{ color: subColor }}>{sub}</div>
    </div>
  );
}

function SearchFilterSection({
  search, onSearch,
  fromDate, onFromDate,
  toDate, onToDate,
}) {
  return (
    <div className="filter-section">
      <div className="filter-section__row1">
        <div className="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by Bill No., Party, GST No., BB/BC, HSN Code, GST %..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="date-group">
          <span className="date-label">From</span>
          <input type="date" className="date-input" value={fromDate} onChange={(e) => onFromDate(e.target.value)} />
        </div>
        <div className="date-group">
          <span className="date-label">To</span>
          <input type="date" className="date-input" value={toDate} onChange={(e) => onToDate(e.target.value)} />
        </div>
      </div>
      <div className="filter-section__row2">
        <button className="btn btn--outline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filter
        </button>
        <button className="btn btn--blue">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          GSTR-3B
        </button>
        <button className="btn btn--red">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Excel
        </button>
      </div>
    </div>
  );
}

function FilterChips({ active, onChange }) {
  return (
    <div className="chip-row">
      <span className="chip-row__label">Filter:</span>
      {CHIPS.map((c) => (
        <button
          key={c.key}
          className={`chip${active === c.key ? " chip--active" : ""}`}
          onClick={() => onChange(c.key)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function GSTTable({ bills }) {
  const totalBillAmt    = bills.reduce((s, b) => s + b.billAmt, 0);
  const totalTaxable    = bills.reduce((s, b) => s + b.taxableAmt, 0);
  const totalSgst       = bills.reduce((s, b) => s + b.sgst, 0);
  const totalCgst       = bills.reduce((s, b) => s + b.cgst, 0);
  const totalIgst       = bills.reduce((s, b) => s + b.igst, 0);

  return (
    <div className="table-wrap">
      <div style={{ overflowX: "auto" }}>
        <table className="gst-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Bill no.</th>
              <th>Date</th>
              <th>Party</th>
              <th>GST no.</th>
              <th>BB/BC</th>
              <th>HSN code</th>
              <th className="right">Bill amt</th>
              <th className="right">Taxable amt</th>
              <th>GST %</th>
              <th className="right">SGST</th>
              <th className="right">CGST</th>
              <th className="right">IGST</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                  No bills found for the selected filters.
                </td>
              </tr>
            ) : (
              bills.map((b, idx) => (
                <tr key={b.id}>
                  <td className="muted">{idx + 1}</td>
                  <td><span className="bill-link">{b.billNo}</span></td>
                  <td className="muted">{b.date}</td>
                  <td>{b.party}</td>
                  <td className={b.gstNo === "N/A" ? "na" : "gstin"}>{b.gstNo}</td>
                  <td>
                    <span className={`badge badge--${b.bbbc}`}>{b.bbbc}</span>
                  </td>
                  <td className="muted">{b.hsnCode}</td>
                  <td className="right">{fmt(b.billAmt)}</td>
                  <td className="right">{fmt(b.taxableAmt)}</td>
                  <td className={b.gst.startsWith("0") ? "gst-zero" : "gst-pos"}>{b.gst}</td>
                  <td className="right muted">{fmt(b.sgst)}</td>
                  <td className="right muted">{fmt(b.cgst)}</td>
                  <td className="right muted">{fmt(b.igst)}</td>
                </tr>
              ))
            )}
          </tbody>
          {bills.length > 0 && (
            <tfoot>
              <tr className="tfoot-row">
                <td colSpan={7}>Total ({bills.length} bills shown)</td>
                <td className="right">{fmt(totalBillAmt)}</td>
                <td className="right">{fmt(totalTaxable)}</td>
                <td></td>
                <td className="right">{fmt(totalSgst)}</td>
                <td className="right">{fmt(totalCgst)}</td>
                <td className="right">{fmt(totalIgst)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination">
      <span className="pagination__info">Page {page} of {totalPages}</span>
      <div className="pagination__btns">
        <button className="btn btn--outline btn--sm" onClick={onPrev} disabled={page === 1}>← Prev</button>
        <button className="btn btn--outline btn--sm" onClick={onNext} disabled={page === totalPages}>Next →</button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GSTReport() {
  const [search, setSearch]       = useState("");
  const [fromDate, setFromDate]   = useState("2026-06-01");
  const [toDate, setToDate]       = useState("2026-06-05");
  const [chip, setChip]           = useState("all");
  const [page, setPage]           = useState(1);

  // Filter logic
  const filtered = useMemo(() => {
    return ALL_BILLS.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.billNo.toLowerCase().includes(q) ||
        b.party.toLowerCase().includes(q) ||
        b.gstNo.toLowerCase().includes(q) ||
        b.bbbc.toLowerCase().includes(q) ||
        b.hsnCode.toLowerCase().includes(q) ||
        b.gst.toLowerCase().includes(q);

      const matchChip =
        chip === "all"      ? true :
        chip === "b2b"      ? b.bbbc === "b2b" :
        chip === "b2c"      ? b.bbbc === "b2c" :
        chip === "5gst"     ? b.gst.includes("5") :
        chip === "0gst"     ? b.gst === "0.00%" :
        chip === "withGstin"? b.gstNo !== "N/A" :
        chip === "noGstin"  ? b.gstNo === "N/A" : true;

      return matchSearch && matchChip;
    });
  }, [search, chip]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleChipChange = (key) => { setChip(key); setPage(1); };
  const handleSearch     = (v)   => { setSearch(v); setPage(1); };

  // Summary stats (from ALL_BILLS for the period)
  const totalBills   = ALL_BILLS.length;
  const totalBillAmt = ALL_BILLS.reduce((s, b) => s + b.billAmt, 0);
  const taxableAmt   = ALL_BILLS.reduce((s, b) => s + b.taxableAmt, 0);
  const totalGST     = ALL_BILLS.reduce((s, b) => s + b.sgst + b.cgst + b.igst, 0);

  return (
    <div className="gst-root">
      {/* Page heading */}
      <div className="page-heading">
        <div className="page-heading__left">
          <h1 className="page-title">GST Report</h1>
          <span className="page-fy">FY 2026-27</span>
        </div>
        <span className="badge-ready">GSTR-3B ready</span>
      </div>

      {/* Summary cards */}
      <div className="summary-grid">
        <SummaryCard
          label="Total bills"
          value={totalBills}
          sub="Jun 01 – Jun 05"
          subColor="#185FA5"
          borderColor="#185FA5"
        />
        <SummaryCard
          label="Total bill amt"
          value={fmt(totalBillAmt)}
          sub="All invoices"
          subColor="#3B6D11"
          borderColor="#3B6D11"
        />
        <SummaryCard
          label="Taxable amt"
          value={fmt(taxableAmt)}
          sub="Before tax"
          subColor="#BA7517"
          borderColor="#BA7517"
        />
        <SummaryCard
          label="Total GST"
          value={fmt(totalGST)}
          sub="IGST+CGST+SGST"
          subColor="#A32D2D"
          borderColor="#A32D2D"
        />
      </div>

      {/* Search + Filters */}
      <SearchFilterSection
        search={search}       onSearch={handleSearch}
        fromDate={fromDate}   onFromDate={setFromDate}
        toDate={toDate}       onToDate={setToDate}
      />

      {/* Filter chips */}
      <FilterChips active={chip} onChange={handleChipChange} />

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-header__title">Bill-wise GST details</span>
          <span className="table-header__count">
            Showing {paginated.length} of {filtered.length} bills
          </span>
        </div>
        <GSTTable bills={paginated} />
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>
    </div>
  );
}