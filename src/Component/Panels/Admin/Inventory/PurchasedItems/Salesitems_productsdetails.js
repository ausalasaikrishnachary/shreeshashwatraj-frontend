import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "./../../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "./../../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "./../../../../BaseURL/BaseURL";
import "./Salesitems_productsdetails.css";

const Salesitems_productsdetails = ({ user }) => {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [productData, setProductData] = useState(null);
  const [voucherData, setVoucherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voucherError, setVoucherError] = useState(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/products/${id}/with-batches`);
      console.log("API Response:", response.data);
      setProductData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError("Failed to load product details. Please try again.");
      setLoading(false);
    }
  };

  const fetchVouchersByProduct = async (productId) => {
    try {
      setVoucherLoading(true);
      setVoucherError(null);
      const response = await axios.get(`${baseurl}/vouchers/by-product/${productId}`);
      console.log("Vouchers API Response:", response.data);
      setVoucherData(response.data);
      setVoucherLoading(false);
    } catch (error) {
      console.error("Error fetching voucher data:", error);
      setVoucherError("Failed to load sales transactions.");
      setVoucherLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (productData && productData.id) {
      fetchVouchersByProduct(productData.id);
    }
  }, [productData]);


  const calculateBatchStock = (batchObj) => {
    console.log("==== Calculating stock for batch ====");
    console.log("Batch Object:", batchObj);

    const batchNumber = (batchObj.batch_number || '').toString().trim();
    console.log("Batch Number:", batchNumber);

    // Filter stock records if available
    const batchStocks = (productData.stock || []).filter(
      stock => (stock.batch_number || '').toString().trim() === batchNumber
    );

    console.log("Matching stock records:", batchStocks);

    let opening_stock = parseFloat(batchObj.opening_stock) || parseFloat(batchObj.quantity) || 0;
    let stock_in = 0;
    let stock_out = 0;
    let balance_stock = opening_stock;
    let latest_date = batchObj.updated_at || batchObj.created_at;

    if (batchStocks.length > 0) {
      const sortedStocks = batchStocks.sort(
        (a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at)
      );

      sortedStocks.forEach((stock, index) => {
        if (index === 0 && stock.opening_stock != null) {
          opening_stock = parseFloat(stock.opening_stock) || opening_stock;
        }
        stock_in += parseFloat(stock.stock_in) || 0;
        stock_out += parseFloat(stock.stock_out) || 0;
        balance_stock = parseFloat(stock.balance_stock) || (opening_stock + stock_in - stock_out);
        latest_date = stock.date || stock.created_at || latest_date;
      });

      balance_stock = opening_stock + stock_in - stock_out;
    } else {
      console.log("No stock records found for this batch, using batch properties");
      stock_in = parseFloat(batchObj.stock_in) || 0;
      stock_out = parseFloat(batchObj.stock_out) || 0;
      balance_stock = parseFloat(batchObj.quantity) || 0;
    }

    console.log(`Batch ${batchNumber} Stock Calculated:`, { opening_stock, stock_in, stock_out, balance_stock, latest_date });
    console.log("==== Finished calculating stock for batch ====");

    return {
      opening_stock,
      stock_in,
      stock_out,
      balance_stock,
      latest_date,
    };
  };







  // Function to get product-level stock data
  const getProductStockData = () => {
    return {
      opening_stock: parseFloat(productData.opening_stock) || 0,
      stock_in: parseFloat(productData.stock_in) || 0,
      stock_out: parseFloat(productData.stock_out) || 0,
      balance_stock: parseFloat(productData.balance_stock) || 0,
      latest_date: productData.opening_stock_date || productData.created_at
    };
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="salesitems-wrapper">
        <div className={`admin-sidebar-container ${sidebarCollapsed ? "collapsed" : ""}`}>
          <AdminSidebar user={user} collapsed={sidebarCollapsed} />
        </div>
        <div className={`salesitems-content-area ${sidebarCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            user={user}
            toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div className="salesitems-main-content">
            <div className="salesitems-loading">Loading product details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="salesitems-wrapper">
        <div className={`admin-sidebar-container ${sidebarCollapsed ? "collapsed" : ""}`}>
          <AdminSidebar user={user} collapsed={sidebarCollapsed} />
        </div>
        <div className={`salesitems-content-area ${sidebarCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            user={user}
            toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div className="salesitems-main-content">
            <div className="salesitems-error">
              <p>{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchProduct();
                }}
                className="salesitems-retry-btn"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="salesitems-wrapper">
      <div className={`admin-sidebar-container ${sidebarCollapsed ? "collapsed" : ""}`}>
        <AdminSidebar user={user} collapsed={sidebarCollapsed} />
      </div>
      <div className={`salesitems-content-area ${sidebarCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          user={user}
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="salesitems-main-content">
          <div className="container-fluid mt-3">
            <div className="card p-3">
              <h1 className="mb-4 fw-bold text-primary">{productData.goods_name}</h1>

              <div className="row">
                {/* LEFT COLUMN: PRODUCT DETAILS */}
                <div className="col-md-4">
                  <div className="card mb-3 p-3 bg-light shadow-sm border-0">
                    <h4 className="text-secondary">Product Details</h4>
                    <hr className="my-2" />
                    <p><strong>Units:</strong> {productData.unit}</p>
                    <p><strong>HSN:</strong> {productData.hsn_code}</p>
                    <p><strong>GST:</strong> {productData.gst_rate}%</p>
                    <p><strong>Cess:</strong> {productData.cess_rate}%</p>
                    <p><strong>SKU:</strong> {productData.sku}</p>
                    <p><strong>Description:</strong> {productData.description}</p>
                    <p><strong>Non-Taxable:</strong> {productData.non_taxable ? "Yes" : "No"}</p>
                    <p><strong>Price:</strong> ₹{productData.price}</p>
                    <p><strong>Net Price:</strong> ₹{productData.net_price}</p>
                    <p><strong>Cess Amount:</strong> ₹{productData.cess_amount}</p>
                    <p><strong>Maintain Batch:</strong> {productData.maintain_batch ? "Yes" : "No"}</p>
                    <p><strong>Can Be Sold:</strong> {productData.can_be_sold ? "Yes" : "No"}</p>
                    <p><strong>Opening Stock:</strong> {productData.opening_stock}</p>
                    <p><strong>Current Stock:</strong> {productData.balance_stock}</p>
                    <p><strong>Min Stock Alert:</strong> {productData.min_stock_alert}</p>
                    <p><strong>Max Stock Alert:</strong> {productData.max_stock_alert}</p>
                    <p><strong>Created By:</strong> N/A</p>
                    <p>
                      <strong>Created On:</strong>{" "}
                      {new Date(productData.opening_stock_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p><strong>Last Updated By:</strong> N/A</p>
                    <p>
                      <strong>Last Updated On:</strong>{" "}
                      {new Date(productData.updated_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="col-md-8">
                  {/* Product Stock Details */}
                  <div className="card mb-4 p-3 shadow-sm border-0">
                    <h5 className="fw-semibold text-secondary">
                      {productData.maintain_batch ? "Product Batch Stock Details" : "Product Stock Details"}
                    </h5>
                    <hr className="my-2" />
                    <div className="table-responsive">
                      <table className="salesitems-table">
                        <thead className="table-light">
                         <tr>
    <th>Product Name</th>
    <th>Price</th>
    <th>Batch Number</th>
    <th>Opening Stock</th>
    <th>Stock In</th>
    <th>Stock Out</th>
    <th>Balance Stock</th>
    <th>Date</th>
  </tr>
                        </thead>
                        <tbody>
  {productData.batches && productData.batches.length > 0 ? (
    productData.batches.map((batch) => {
      const batchStock = calculateBatchStock(batch);

      console.log(`Batch ${batch.batch_number} Stock:`, batchStock);

      return (
        <tr key={batch.id}>
          <td>{productData.goods_name}</td>
          <td>₹{batch.selling_price || productData.price}</td>
          <td>{batch.batch_number}</td>
          <td>{batchStock.opening_stock}</td>
          <td style={{ color: 'green', fontWeight: '600' }}>
            {batchStock.stock_in}
          </td>
          <td style={{ color: 'red', fontWeight: '600' }}>
            {batchStock.stock_out}
          </td>
          <td style={{ fontWeight: '600' }}>
            {batchStock.balance_stock}
          </td>
          <td>
            {batchStock.latest_date
              ? new Date(batchStock.latest_date).toLocaleDateString("en-IN")
              : new Date(batch.created_at).toLocaleDateString("en-IN")}
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="9" className="text-center text-muted">
        No batches found for this product.
      </td>
    </tr>
  )}
</tbody>

                      </table>
                    </div>
                  </div>

                  {/* Recent Sales Section */}
                  <div className="card mb-4 p-3 shadow-sm border-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-semibold text-secondary mb-0">Recent Sales</h5>
                      {voucherData && (
                        <span className="badge bg-primary">
                          Total Transactions: {voucherData.totalVouchers || 0}
                        </span>
                      )}
                    </div>
                    <hr className="my-2" />

                    {voucherLoading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading sales data...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading sales transactions...</p>
                      </div>
                    ) : voucherError ? (
                      <div className="text-center py-3 text-danger">
                        <p>{voucherError}</p>
                        <button
                          onClick={() => fetchVouchersByProduct(productData.id)}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Retry
                        </button>
                      </div>
                    ) : voucherData && voucherData.vouchers && voucherData.vouchers.length > 0 ? (
                      <div className="table-responsive">
                        <table className="salesitems-table">
                          <thead className="table-light">
                            <tr>
                              <th>Invoice No</th>
                              <th>Date</th>
                              <th>Customer</th>
                              <th>Quantity</th>
                              <th>Total Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {voucherData.vouchers.map((voucher) => (
                              <tr key={voucher.VoucherID}>
                                <td>
                                  <strong>{voucher.InvoiceNumber || 'N/A'}</strong>
                                </td>
                                <td>{formatDate(voucher.Date)}</td>
                                <td>{voucher.PartyName || voucher.AccountName || 'N/A'}</td>
                                <td>
                                  <span className="badge bg-secondary">
                                    {voucher.TotalQty || voucher.totalQuantity || 0}
                                  </span>
                                </td>
                                <td>
                                  <strong>{formatCurrency(voucher.TotalAmount || voucher.totalAmount)}</strong>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${voucher.status === 'Paid'
                                        ? 'bg-success'
                                        : voucher.status === 'Pending'
                                          ? 'bg-warning'
                                          : 'bg-secondary'
                                      }`}
                                  >
                                    {voucher.status || 'Pending'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <p>No sales transactions found for this product.</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Purchases */}
                  <div className="card mb-4 p-3 shadow-sm border-0">
                    <h5 className="fw-semibold text-secondary">Recent Purchases</h5>
                    <hr className="my-2" />
                    <div className="table-responsive">
                      <table className="salesitems-table">
                        <thead className="table-light">
                          <tr>
                            <th>Purchase Invoice</th>
                            <th>Invoice Date</th>
                            <th>Supplier Name</th>
                            <th>Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>01/01/1970</td>
                            <td>—</td>
                            <td>—</td>
                            <td>{productData.unit}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salesitems_productsdetails;