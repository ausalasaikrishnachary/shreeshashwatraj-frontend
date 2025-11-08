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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/products/${id}/with-batches`);
      console.log("API Response:", response.data); // Debug log
      setProductData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError("Failed to load product details. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Function to calculate stock data for a specific batch
  const calculateBatchStock = (batch) => {
    // If we have stock data for this batch, use it
    const batchStocks = productData.stock?.filter(stock => stock.batch_number === batch.batch_number) || [];
    
    if (batchStocks.length > 0) {
      // Calculate from stock transactions
      let opening_stock = 0;
      let stock_in = 0;
      let stock_out = 0;
      let balance_stock = 0;
      let latest_date = null;

      // Sort by date to process in chronological order
      const sortedStocks = batchStocks.sort((a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at));
      
      sortedStocks.forEach((stock, index) => {
        if (index === 0) {
          opening_stock = parseFloat(stock.opening_stock) || 0;
        }
        
        stock_in += parseFloat(stock.stock_in) || 0;
        stock_out += parseFloat(stock.stock_out) || 0;
        balance_stock = parseFloat(stock.balance_stock) || 0;
        
        if (stock.date || stock.created_at) {
          latest_date = stock.date || stock.created_at;
        }
      });

      return {
        opening_stock,
        stock_in,
        stock_out,
        balance_stock,
        latest_date
      };
    } else {
      // If no stock transactions, use batch quantity as balance stock
      // and product data for other fields
      const batchQuantity = parseFloat(batch.quantity) || 0;
      
      return {
        opening_stock: parseFloat(batch.quantity) || 0, // Use batch quantity as opening for batch view
        stock_in: 0, // Default to 0 for batches without specific stock data
        stock_out: 0, // Default to 0 for batches without specific stock data
        balance_stock: batchQuantity, // Use batch quantity as balance stock
        latest_date: batch.created_at
      };
    }
  };

  // Function to get product-level stock data (for non-batch view)
  const getProductStockData = () => {
    return {
      opening_stock: parseFloat(productData.opening_stock) || 0,
      stock_in: parseFloat(productData.stock_in) || 0,
      stock_out: parseFloat(productData.stock_out) || 0,
      balance_stock: parseFloat(productData.balance_stock) || 0,
      latest_date: productData.opening_stock_date || productData.created_at
    };
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
                            {productData.maintain_batch ? (
                              <>
                                <th>Batch Number</th>
                                {/* <th>Batch Quantity</th> */}
                              </>
                            ) : null}
                            <th>Opening Stock</th>
                            <th>Stock In</th>
                            <th>Stock Out</th>
                            <th>Balance Stock</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productData.maintain_batch ? (
                            // BATCH VIEW - Use batch data
                            productData.batches && productData.batches.length > 0 ? (
                              productData.batches.map((batch) => {
                                const batchStock = calculateBatchStock(batch);
                                
                                console.log(`Batch ${batch.batch_number} Stock:`, batchStock); // Debug log
                                
                                return (
                                  <tr key={batch.id}>
                                    <td>{productData.goods_name}</td>
                                    <td>₹{batch.selling_price || productData.price}</td>
                                    <td>{batch.batch_number}</td>
                                    {/* <td>{batch.quantity}</td> */}
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
                            )
                          ) : (
                            // NON-BATCH VIEW - Use product data
                            (() => {
                              const productStock = getProductStockData();
                              return (
                                <tr>
                                  <td>{productData.goods_name}</td>
                                  <td>₹{productData.price}</td>
                                  <td>{productStock.opening_stock}</td>
                                  <td style={{ color: 'green', fontWeight: '600' }}>
                                    {productStock.stock_in}
                                  </td>
                                  <td style={{ color: 'red', fontWeight: '600' }}>
                                    {productStock.stock_out}
                                  </td>
                                  <td style={{ fontWeight: '600' }}>
                                    {productStock.balance_stock}
                                  </td>
                                  <td>
                                    {new Date(productStock.latest_date).toLocaleDateString("en-IN")}
                                  </td>
                                </tr>
                              );
                            })()
                          )}
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