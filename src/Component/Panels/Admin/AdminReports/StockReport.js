import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilePdf } from "react-icons/fa";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { pdf } from '@react-pdf/renderer';
import StockReportPDF from './StockreportPDF';
import "./StockReport.css";

const StockReport = () => {
  // State for search and date filters
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [stockData, setStockData] = useState([]);
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

  // Fetch products and their batches
  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all products
      const productsRes = await axios.get(`${baseurl}/products`);
      const products = productsRes.data;
      
      // For each product, fetch its batches
      const stockSummary = [];
      
      for (const product of products) {
        try {
          // Fetch batches for this product
          const batchesRes = await axios.get(`${baseurl}/products/${product.id}/batches`);
          const batches = batchesRes.data;
          
          if (batches && batches.length > 0) {
            // Process each batch - only include Purchaseditems
            batches.forEach(batch => {
              // Skip if group_by is Salescatalog
              if (batch.group_by === "Salescatalog") {
                return;
              }
              
              // Calculate values using purchase_price for Op. Val
              const opQty = parseFloat(batch.opening_stock || 0);
              const opVal = parseFloat(batch.purchase_price || 0) * opQty; 
              
              const prchQty = parseFloat(batch.stock_in || 0);
              const prchVal = parseFloat(batch.purchase_price || 0) * prchQty;
              
              const saleQty = parseFloat(batch.stock_out || 0);
              const saleVal = parseFloat(batch.selling_price || 0) * saleQty; 
              
              // Calculate closing balance value (Prch Val - Sale Val)
              const cloBal = prchVal - saleVal;
              
              stockSummary.push({
                id: batch.id,
                productId: product.id,
                batchNumber: batch.batch_number,
                itemName: product.goods_name,
                opQty: opQty,
                opVal: opVal,
                prchQty: prchQty,
                prchVal: prchVal,
                saleQty: saleQty,
                saleVal: saleVal,
                cloBal: cloBal,
                date: batch.opening_stock_date || batch.created_at,
                groupBy: batch.group_by,
                productType: batch.product_type
              });
            });
          } else {
            // If no batches, only include if product is Purchaseditems
            if (product.group_by === "Purchaseditems") {
              const opQty = parseFloat(product.opening_stock || 0);
              const opVal = parseFloat(product.purchase_price || 0) * opQty;
              
              stockSummary.push({
                id: product.id,
                productId: product.id,
                batchNumber: "DEFAULT",
                itemName: product.goods_name,
                opQty: opQty,
                opVal: opVal,
                prchQty: 0,
                prchVal: 0,
                saleQty: 0,
                saleVal: 0,
                cloBal: opVal,
                date: product.opening_stock_date || product.created_at,
                groupBy: product.group_by,
                productType: product.product_type
              });
            }
          }
        } catch (batchErr) {
          console.error(`Error fetching batches for product ${product.id}:`, batchErr);
          // Only add if product is Purchaseditems
          if (product.group_by === "Purchaseditems") {
            const opQty = parseFloat(product.opening_stock || 0);
            const opVal = parseFloat(product.purchase_price || 0) * opQty;
            
            stockSummary.push({
              id: product.id,
              productId: product.id,
              batchNumber: "DEFAULT",
              itemName: product.goods_name,
              opQty: opQty,
              opVal: opVal,
              prchQty: 0,
              prchVal: 0,
              saleQty: 0,
              saleVal: 0,
              cloBal: opVal,
              date: product.opening_stock_date || product.created_at,
              groupBy: product.group_by,
              productType: product.product_type
            });
          }
        }
      }
      
      setStockData(stockSummary);
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setError("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date for comparison
  const formatDateForComparison = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (err) {
      return null;
    }
  };

  // Format date for display (DD-MM-YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) {
      // If no date provided, use current date
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}-${month}-${year}`;
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If invalid date, return current date
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}-${month}-${year}`;
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      // On error, return current date
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}-${month}-${year}`;
    }
  };

  // Filter data based on search term and date range
  const filteredData = stockData.filter((item) => {
    // Search filter
    const matchesSearch = !searchTerm.trim() || 
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productType?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter
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

    return matchesSearch && matchesDate;
  });

  // Process data for table display
  const processedData = filteredData.map((item) => ({
    ...item,
    opQty: item.opQty?.toFixed(2) || "0.00",
    opVal: `₹${(item.opVal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    prchQty: item.prchQty?.toFixed(2) || "0.00",
    prchVal: `₹${(item.prchVal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    saleQty: item.saleQty?.toFixed(2) || "0.00",
    saleVal: `₹${(item.saleVal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    cloBal: `₹${(item.cloBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    date: item.date ? new Date(item.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) : '-'
  }));

  // Export to PDF function
  const exportToPDF = async () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    setExportLoading(true);
    try {
      // Prepare data for PDF (without ₹ symbol) - use raw values from stockData
      const pdfData = filteredData.map((item) => ({
        itemName: item.itemName,
        opQty: item.opQty || 0,
        opVal: item.opVal || 0,
        prchQty: item.prchQty || 0,
        prchVal: item.prchVal || 0,
        saleQty: item.saleQty || 0,
        saleVal: item.saleVal || 0,
        cloBal: item.cloBal || 0
      }));

      // Get current date for display if dates are not selected
      const displayFromDate = fromDate ? formatDateForDisplay(fromDate) : formatDateForDisplay(getCurrentDate());
      const displayToDate = toDate ? formatDateForDisplay(toDate) : formatDateForDisplay(getCurrentDate());

      // Create PDF document
      const blob = await pdf(
        <StockReportPDF 
          reportData={{
            shopName: "SHREE SHASHWAT RAJ AGRO PVT.LTD",
            fromDate: displayFromDate,
            toDate: displayToDate,
            items: pdfData
          }}
        />
      ).toBlob();

      // Download PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock_report_${displayFromDate}_to_${displayToDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    } finally {
      setExportLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
  };

  // Clear date filters only
  const clearDateFilters = () => {
    setFromDate("");
    setToDate("");
  };

  // Table columns as per requirements
  const stockColumns = [
    {
      key: "sl_no",
      title: "S.No",
      style: { textAlign: "center", width: "60px" },
      render: (value, record, index) => index + 1
    },
    {
      key: "itemName",
      title: "Item Name",
      style: { textAlign: "left" }
    },
    {
      key: "opQty",
      title: "Op. Qty",
      style: { textAlign: "right" }
    },
    {
      key: "opVal",
      title: "Op. Val",
      style: { textAlign: "right" }
    },
    {
      key: "prchQty",
      title: "Prch Qty",
      style: { textAlign: "right" }
    },
    {
      key: "prchVal",
      title: "Prch Val",
      style: { textAlign: "right" }
    },
    {
      key: "saleQty",
      title: "Sale Qty",
      style: { textAlign: "right" }
    },
    {
      key: "saleVal",
      title: "Sale Val",
      style: { textAlign: "right" }
    },
    {
      key: "cloBal",
      title: "Clo. Bal",
      style: { textAlign: "right" }
    },
  ];

  if (loading) {
    return (
      <div className="stock-summary-container">
        <div className="stock-summary-loading">
          <div className="stock-summary-spinner"></div>
          <p>Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-summary-container">
        <div className="stock-summary-error">
          <p>{error}</p>
          <button onClick={fetchStockData} className="stock-summary-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-summary-container">
      {/* Header */}
  
      {/* Filters Section */}
      <div className="stock-summary-filters-section">
        <div className="stock-summary-filters-wrapper">
          {/* Search */}
          <div className="stock-summary-search-wrapper">
            <div className="stock-summary-search-input-group">
              <FaSearch className="stock-summary-search-icon" />
              <input
                type="text"
                placeholder="Search by item name, batch, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="stock-summary-search-input"
              />
              {searchTerm && (
                <button
                  className="stock-summary-clear-btn"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Date Filters */}
          <div className="stock-summary-date-filters">
            <div className="stock-summary-date-input-wrapper">
              <label htmlFor="from-date" className="stock-summary-date-label">From Date</label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="stock-summary-date-input"
                max={toDate || undefined}
              />
            </div>

            <div className="stock-summary-date-input-wrapper">
              <label htmlFor="to-date" className="stock-summary-date-label">To Date</label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="stock-summary-date-input"
                min={fromDate || undefined}
              />
            </div>

            {(fromDate || toDate) && (
              <button
                className="stock-summary-clear-date-btn"
                onClick={clearDateFilters}
                title="Clear date filters"
              >
                Clear Dates
              </button>
            )}
          </div>

          {/* Export PDF Button */}
          <button
            onClick={exportToPDF}
            disabled={exportLoading || filteredData.length === 0}
            className={`stock-summary-export-btn ${exportLoading ? 'stock-summary-export-btn--loading' : ''}`}
          >
            {exportLoading ? (
              <>
                <span className="stock-summary-spinner-small"></span>
                Exporting...
              </>
            ) : (
              <>
                <FaFilePdf className="stock-summary-export-icon" />
                Export PDF
              </>
            )}
          </button>

          {(searchTerm || fromDate || toDate) && (
            <button
              className="stock-summary-clear-all-btn"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          )}
        </div>

             </div>

      <div className="stock-summary-table-section">
        <ReusableTable
          data={processedData}
          columns={stockColumns}
          initialEntriesPerPage={10}
          showSearch={false}
          showEntries={true}
          showPagination={true}
        />
      </div>
    </div>
  );
};

export default StockReport;