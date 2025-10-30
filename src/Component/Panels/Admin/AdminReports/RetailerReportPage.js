// import React, { useMemo, useState } from "react";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// import "./RetailerReportPage.css";

// const RetailerReportPage = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // Header filters (wire these to your API later)
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   // Table controls
//   const [entries, setEntries] = useState(10); // Show X entries
//   const [search, setSearch] = useState("");   // Global search
//   const [page, setPage] = useState(1);        // Pagination page (1-indexed)

//   // Demo data (replace with API)
//   const data = [
//     { id: 1, product: "buttons",      quantity: 12, amount: 2542.32 },
//     { id: 2, product: "cargo jeans",  quantity:  9, amount: 2288.16 },
//     { id: 3, product: "Pant",         quantity:  2, amount:  169.50 },
//     { id: 4, product: "zippers",      quantity: 26, amount: 4406.74 },
//     { id: 5, product: "shirt new",    quantity: 14, amount: 3559.36 },
//     { id: 6, product: "joggers pant", quantity: 10, amount: 1694.90 },
//     { id: 7, product: "cargo jeans",  quantity: 10, amount: 1694.90 },
//     { id: 8, product: "shirt new",    quantity: 15, amount: 3813.60 },
//     { id: 9, product: "shirt new",    quantity: 15, amount: 4449.30 },
//     { id:10, product: "jeans pant",   quantity:  5, amount:  847.45 },
//     { id:11, product: "belts",        quantity:  7, amount:  999.10 },
//     { id:12, product: "caps",         quantity:  3, amount:  450.00 },
//   ];

//   // Filter by search
//   const filtered = useMemo(() => {
//     const term = search.trim().toLowerCase();
//     if (!term) return data;
//     return data.filter(r => r.product.toLowerCase().includes(term));
//   }, [data, search]);

//   // Pagination math
//   const total = filtered.length;
//   const totalPages = Math.max(1, Math.ceil(total / entries));
//   const currentPage = Math.min(page, totalPages);
//   const startIdx = (currentPage - 1) * entries;
//   const endIdx = Math.min(startIdx + entries, total);
//   const pageRows = filtered.slice(startIdx, endIdx);

//   const handlePrev = () => setPage(p => Math.max(1, p - 1));
//   const handleNext = () => setPage(p => Math.min(totalPages, p + 1));
//   const handleEntriesChange = (e) => {
//     setEntries(Number(e.target.value));
//     setPage(1);
//   };

//   return (
//     <div className="retailer-report-layout">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

//       <div className={`retailer-report-main ${isCollapsed ? "collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="retailer-report-wrapper">
//           <div className="retailer-report-container">

//             {/* Header Row (Title + Filters in one line) */}
//             <div className="retailer-report-header">
//               <h2 className="retailer-report-title">View Retailers Reports</h2>

//               <div className="retailer-report-filterbar">
//                 <div className="retailer-report-date">
//                   <input
//                     type="date"
//                     value={fromDate}
//                     onChange={(e) => setFromDate(e.target.value)}
//                     aria-label="From Date"
//                     placeholder="From Date"
//                   />
//                 </div>
//                 <div className="retailer-report-date">
//                   <input
//                     type="date"
//                     value={toDate}
//                     onChange={(e) => setToDate(e.target.value)}
//                     aria-label="To Date"
//                     placeholder="To Date"
//                   />
//                 </div>
//                 <button className="retailer-report-btn primary">Reports</button>
//                 <button className="retailer-report-btn success">+ Generate New Report</button>
//               </div>
//             </div>

//             {/* Controls Row (Show entries + Search) */}
//             <div className="retailer-report-controls">
//               <div className="retailer-report-entries">
//                 Show{" "}
//                 <select value={entries} onChange={handleEntriesChange}>
//                   <option value={10}>10</option>
//                   <option value={25}>25</option>
//                   <option value={50}>50</option>
//                 </select>{" "}
//                 entries
//               </div>

//               <div className="retailer-report-search">
//                 <label htmlFor="rr-search">Search:</label>
//                 <input
//                   id="rr-search"
//                   type="text"
//                   value={search}
//                   onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//                   placeholder="Search products..."
//                 />
//               </div>
//             </div>

//             {/* Table */}
//             <table className="retailer-report-table">
//               <thead>
//                 <tr>
//                   <th>SERIAL NO.</th>
//                   <th>PRODUCT NAME</th>
//                   <th>TOTAL QUANTITY</th>
//                   <th>TOTAL AMOUNT</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pageRows.length === 0 ? (
//                   <tr>
//                     <td colSpan={4} className="retailer-report-empty">No matching records found</td>
//                   </tr>
//                 ) : (
//                   pageRows.map((row, idx) => (
//                     <tr key={row.id}>
//                       <td>{startIdx + idx + 1}</td>
//                       <td className="retailer-report-linklike">{row.product}</td>
//                       <td>{row.quantity.toFixed(2)}</td>
//                       <td>{row.amount.toLocaleString()}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             {/* Footer: info + pagination */}
//             <div className="retailer-report-footer">
//               <div className="retailer-report-info">
//                 {total === 0
//                   ? "Showing 0 to 0 of 0 entries"
//                   : `Showing ${startIdx + 1} to ${endIdx} of ${total} entries`}
//               </div>

//               <div className="retailer-report-pagination">
//                 <button
//                   className="retailer-report-pagebtn"
//                   onClick={handlePrev}
//                   disabled={currentPage === 1}
//                 >
//                   Previous
//                 </button>
//                 <span className="retailer-report-pageindex">
//                   {currentPage} / {totalPages}
//                 </span>
//                 <button
//                   className="retailer-report-pagebtn"
//                   onClick={handleNext}
//                   disabled={currentPage === totalPages}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RetailerReportPage;

// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// import "./RetailerReportPage.css";
// import { baseurl } from "../../../BaseURL/BaseURL";

// const RetailerReportPage = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [entries, setEntries] = useState(10);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);

//   // ✅ For modal
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const apiUrl = `${baseurl}/api/reports/retailer-report`;
//         const res = await axios.get(apiUrl);
//         setData(res.data);
//       } catch (err) {
//         console.error("❌ Error fetching report:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Search filter
//   const filtered = useMemo(() => {
//     const term = search.trim().toLowerCase();
//     if (!term) return data;
//     return data.filter((r) => r.retailer?.toLowerCase().includes(term));
//   }, [data, search]);

//   // Pagination
//   const total = filtered.length;
//   const totalPages = Math.max(1, Math.ceil(total / entries));
//   const currentPage = Math.min(page, totalPages);
//   const startIdx = (currentPage - 1) * entries;
//   const endIdx = Math.min(startIdx + entries, total);
//   const pageRows = filtered.slice(startIdx, endIdx);

//   const handlePrev = () => setPage((p) => Math.max(1, p - 1));
//   const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
//   const handleEntriesChange = (e) => {
//     setEntries(Number(e.target.value));
//     setPage(1);
//   };

//   return (
//     <div className="retailer-report-layout">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//       <div className={`retailer-report-main ${isCollapsed ? "collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="retailer-report-wrapper">
//           <div className="retailer-report-container">
//             {/* Header Row */}
//             <div className="retailer-report-header">
//               <h2 className="retailer-report-title">
//                 View Retailers Reports
//               </h2>

//               <div className="retailer-report-filterbar">
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                 />
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                 />
//                 <button
//                   className="retailer-report-btn primary"
//                   onClick={() => setShowModal(true)}
//                 >
//                   Reports
//                 </button>
//                 <button
//                   className="retailer-report-btn success"
//                   onClick={() => setShowModal(true)}
//                 >
//                   + Generate New Report
//                 </button>
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="retailer-report-controls">
//               <div className="retailer-report-entries">
//                 Show{" "}
//                 <select value={entries} onChange={handleEntriesChange}>
//                   <option value={10}>10</option>
//                   <option value={25}>25</option>
//                   <option value={50}>50</option>
//                 </select>{" "}
//                 entries
//               </div>

//               <div className="retailer-report-search">
//                 <label>Search:</label>
//                 <input
//                   type="text"
//                   value={search}
//                   onChange={(e) => {
//                     setSearch(e.target.value);
//                     setPage(1);
//                   }}
//                   placeholder="Search retailers..."
//                 />
//               </div>
//             </div>

//             {/* Table */}
//             {loading ? (
//               <p>Loading data...</p>
//             ) : (
//               <table className="retailer-report-table">
//                 <thead>
//                   <tr>
//                     <th>Serial No.</th>
//                     <th>Retailer</th>
//                     <th>Total Sales</th>
//                     <th>No. of Receipts</th>
//                     <th>First Sale</th>
//                     <th>Last Sale</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {pageRows.length === 0 ? (
//                     <tr>
//                       <td colSpan={6}>No matching records found</td>
//                     </tr>
//                   ) : (
//                     pageRows.map((row, idx) => (
//                       <tr key={idx}>
//                         <td>{startIdx + idx + 1}</td>
//                         <td>{row.retailer}</td>
//                         <td>{row.total_sales}</td>
//                         <td>{row.no_of_receipts}</td>
//                         <td>
//                           {row.first_sale
//                             ? row.first_sale.substring(0, 10)
//                             : "-"}
//                         </td>
//                         <td>
//                           {row.last_sale ? row.last_sale.substring(0, 10) : "-"}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             )}

//             {/* Footer */}
//             <div className="retailer-report-footer">
//               <div className="retailer-report-info">
//                 {total === 0
//                   ? "Showing 0 to 0 of 0 entries"
//                   : `Showing ${startIdx + 1} to ${endIdx} of ${total} entries`}
//               </div>
//               <div className="retailer-report-pagination">
//                 <button onClick={handlePrev} disabled={currentPage === 1}>
//                   Previous
//                 </button>
//                 <span>
//                   {currentPage} / {totalPages}
//                 </span>
//                 <button
//                   onClick={handleNext}
//                   disabled={currentPage === totalPages}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {showModal && (
//           <div className="retailer-report-side-modal">
//             <div className="retailer-report-side-modal-content">
//               <button
//                 className="retailer-report-close-btn"
//                 onClick={() => setShowModal(false)}
//               >
//                 ✖
//               </button>
//               <h3>Reports</h3>
//               <p>Retailer Report</p>

//               <h4>Generate Report</h4>
//               <div className="retailer-report-modal-filters">
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                 />
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                 />
//               </div>
// <div className="retailer-report-modal-options">
//   <label className="retailer-report-option">
//     <input type="radio" name="format" defaultChecked /> PDF
//   </label>
//   <label className="retailer-report-option">
//     <input type="radio" name="format" /> Excel
//   </label>
// </div>

//               <button className="retailer-report-generate-btn">
//                 Generate New Report
//               </button>

//               <h4>Recent Reports</h4>
//               <div className="retailer-report-recent-reports">
//                 <div className="retailer-report-report-item">
//                   <span>📄 Product Sales Report</span>
//                   <button className="retailer-report-download-btn">⬇</button>
//                 </div>
//                 <div className="retailer-report-report-item">
//                   <span>📄 Product Sales Report</span>
//                   <button className="retailer-report-download-btn">⬇</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RetailerReportPage;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./RetailerReportPage.css";
import { baseurl } from "../../../BaseURL/BaseURL"; // ensure baseurl is exported as { baseurl }

const RetailerReportPage = () => {
  // Layout state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Table data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Table controls
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");

  // Recent Reports
  const [recentReports, setRecentReports] = useState([]);

  // ✅ Fetch Retailers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `${baseurl}/api/reports/retailer-report`;
        console.log("📌 Fetching Retailers:", url);
        const res = await axios.get(url);
        setData(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching Retailers:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Search filter
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.mobile_number?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.business_name?.toLowerCase().includes(term) ||
        r.display_name?.toLowerCase().includes(term)
    );
  }, [data, search]);

  // ✅ Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / entries));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * entries;
  const endIdx = Math.min(startIdx + entries, total);
  const pageRows = filtered.slice(startIdx, endIdx);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleEntriesChange = (e) => {
    setEntries(Number(e.target.value));
    setPage(1);
  };

  // ✅ Generate report
  const handleGenerateReport = async () => {
    try {
      const res = await axios.post(
        `${baseurl}/api/reports/retailer-report/download`,
        { format: reportFormat },
        { responseType: "blob" }
      );

      const fileName = `Retailer_Report.${reportFormat === "pdf" ? "pdf" : "xlsx"}`;

      const blob =
        reportFormat === "pdf"
          ? new Blob([res.data], { type: "application/pdf" })
          : new Blob([res.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

      // trigger download
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      // add to Recent
      setRecentReports((prev) => [
        {
          id: Date.now(),
          name: "Retailers Report",
          fileName,
          format: reportFormat,
          timestamp: new Date().toLocaleString(),
          blob,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("❌ Error downloading report:", err);
    }
  };

  // ✅ Download from memory
  const downloadRecent = (r) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(r.blob);
    a.download = r.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="retailer-report-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`retailer-report-main ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="retailer-report-wrapper">
          <div className="retailer-report-container">
            {/* Header */}
            <div className="retailer-report-header">
              <h2 className="retailer-report-title">Retailers Report</h2>
              <button
                className="retailer-report-btn success"
                onClick={() => setShowModal(true)}
              >
                + Generate Report
              </button>
            </div>

            {/* Controls */}
            <div className="retailer-report-controls">
              <div className="retailer-report-entries">
                Show{" "}
                <select value={entries} onChange={handleEntriesChange}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>{" "}
                entries
              </div>
              <div className="retailer-report-search">
                <label>Search:</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search Retailers..."
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <p>Loading data...</p>
            ) : (
              <table className="retailer-report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                        <th>Business Name</th>
                    <th>GSTIN</th>
                    <th>GST Registered Name</th>
                
                    {/* <th>Display Name</th> */}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={8}>No matching records found</td>
                    </tr>
                  ) : (
                    pageRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.name}</td>
                        <td>{row.mobile_number}</td>
                        <td>{row.email}</td>
                          <td>{row.business_name}</td>
                        <td>{row.gstin}</td>
                        <td>{row.gst_registered_name}</td>
                      
                        {/* <td>{row.display_name}</td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            <div className="retailer-report-footer">
              <div className="retailer-report-info">
                {total === 0
                  ? "Showing 0 to 0 of 0 entries"
                  : `Showing ${startIdx + 1} to ${endIdx} of ${total} entries`}
              </div>
              <div className="retailer-report-pagination">
                <button onClick={handlePrev} disabled={currentPage === 1}>
                  Previous
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button onClick={handleNext} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="retailer-report-side-modal">
            <div className="retailer-report-side-modal-content">
              <button
                className="retailer-report-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>
              <h3>Generate Report</h3>
              <div className="retailer-report-modal-options">
                <label>
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={reportFormat === "pdf"}
                    onChange={(e) => setReportFormat(e.target.value)}
                  />{" "}
                  PDF
                </label>
                <label>
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={reportFormat === "excel"}
                    onChange={(e) => setReportFormat(e.target.value)}
                  />{" "}
                  Excel
                </label>
              </div>

              <button
                className="retailer-report-generate-btn"
                onClick={handleGenerateReport}
              >
                Download
              </button>

              {/* Recent Reports */}
              {recentReports.length > 0 && (
                <>
                  <h4>Recent Reports</h4>
                  <div className="retailer-report-recent-reports">
                    {recentReports.map((r) => (
                      <div key={r.id} className="retailer-report-report-item">
                        <span>
                          {r.name} ({r.format.toUpperCase()}) • {r.timestamp}
                        </span>
                        <button onClick={() => downloadRecent(r)}>⬇</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerReportPage;
