import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import './Period.css';

const Period = () => {
  const [openRow, setOpenRow] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/orders/all-orders");
      const ordersData = response.data;

      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const itemsRes = await axios.get(`http://localhost:5000/orders/details/${order.order_number}`);
          const itemsData = itemsRes.data.items || [];

          return {
            ...order,
            items: itemsData.map(item => ({
              id: item.id,
              order_number: item.order_number,
              item_name: item.item_name ?? "N/A",
              product_id: item.product_id,
              mrp: item.mrp ?? 0,
              sale_price: item.sale_price ?? 0,
              price: item.price ?? 0,
              quantity: item.quantity ?? 0,
              total_amount: item.total_amount ?? 0,
              discount_percentage: item.discount_percentage ?? 0,
              discount_amount: item.discount_amount ?? 0,
              taxable_amount: item.taxable_amount ?? 0,
              tax_percentage: item.tax_percentage ?? 0,
              tax_amount: item.tax_amount ?? 0,
              item_total: item.item_total ?? 0,
              credit_period: item.credit_period ?? 0,
              credit_percentage: item.credit_percentage ?? 0,
              sgst_percentage: item.sgst_percentage ?? 0,
              sgst_amount: item.sgst_amount ?? 0,
              cgst_percentage: item.cgst_percentage ?? 0,
              cgst_amount: item.cgst_amount ?? 0,
              discount_applied_scheme: item.discount_applied_scheme ?? "N/A"
            }))
          };
        })
      );

      setOrders(ordersWithItems);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  // Open Order Modal with existing data
  const openOrderModal = (orderId) => {
    const orderData = orders.find(order => order.id === orderId);
    if (orderData) {
      setModalData(orderData);
      setShowOrderModal(true);
    }
  };

  // Open Item Modal with existing data
  const openItemModal = (orderNumber, itemId) => {
    const order = orders.find(order => order.order_number === orderNumber);
    if (order && order.items) {
      const itemData = order.items.find(item => item.id === itemId);
      if (itemData) {
        setModalData(itemData);
        setShowItemModal(true);
      }
    }
  };

  // Close modals
  const closeModals = () => {
    setShowOrderModal(false);
    setShowItemModal(false);
    setModalData(null);
  };

  // Filter orders by search and date
  const filteredOrders = orders.filter(order => {
    const customerMatch = order.customer_name.toLowerCase().includes(search.toLowerCase());
    let startMatch = true;
    let endMatch = true;

    if (startDate) startMatch = new Date(order.created_at) >= new Date(startDate);
    if (endDate) endMatch = new Date(order.created_at) <= new Date(endDate);

    return customerMatch && startMatch && endMatch;
  });

  if (loading) return <div className="p-admin-layout">Loading orders...</div>;

  return (
    <div className="p-admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`p-admin-main ${isCollapsed ? 'p-sidebar-collapsed' : ''}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="p-period-page">

          {/* Filters Section */}
          <div className="p-filters-section">
            <div className="p-filter-row">
              <div className="p-filter-group">
                <input 
                  type="text" 
                  className="p-form-control" 
                  placeholder="Search Customer Name..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
              <div className="p-filter-group">
                <input 
                  type="date" 
                  className="p-form-control" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
              <div className="p-filter-group">
                <input 
                  type="date" 
                  className="p-form-control" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
              <div className="p-filter-group">
                <button className="p-btn p-btn-primary" onClick={() => {}}>Search</button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="p-table-section">
            <div className="p-table-card">
              <div className="p-table-header">
                <h3>Order Records</h3>
                <span className="p-badge">{filteredOrders.length} Order(s)</span>
              </div>

              <div className="p-table-container">
                <table className="p-customers-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Order Number</th>
                      <th>Customer Name</th>
                      <th>Order Total</th>
                      <th>Discount Amount</th>
                      <th>Created At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr className="p-customer-row">
                          <td>
                            <button className="p-toggle-btn" onClick={() => toggleRow(order.id)}>
                              <span className={openRow === order.id ? "p-arrow-up" : "p-arrow-down"}></span>
                            </button>
                          </td>
                          <td>{order.order_number}</td>
                          <td>{order.customer_name}</td>
                          <td>₹{(order.order_total ?? 0).toLocaleString()}</td>
                          <td>₹{(order.discount_amount ?? 0).toLocaleString()}</td>
                          <td>
                            {new Date(order.created_at).toLocaleDateString('en-GB')}
                          </td>
                          <td>
                            <button 
                              className="p-eye-btn"
                              onClick={() => openOrderModal(order.id)}
                              title="View Order Details"
                            >
                              👁️
                            </button>
                          </td>
                        </tr>

                        {openRow === order.id && (
                          <tr className="p-invoices-row">
                            <td colSpan={7}>
                              <div className="p-invoices-section">
                                <h4>Order Details</h4>
                                <table className="p-invoices-table">
                                  <thead>
                                    <tr>
                                      <th>Item Name</th>
                                      <th>Quantity</th>
                                      <th>Sale Price</th>
                                      <th>Price</th>
                                      <th>Discount Amount</th>
                                      <th>Credit Period</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item) => (
                                      <tr key={item.id}>
                                        <td>{item.item_name}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.sale_price.toLocaleString()}</td>
                                        <td>₹{item.price.toLocaleString()}</td>
                                        <td>₹{item.discount_amount.toLocaleString()}</td>
                                        <td>{item.credit_period}</td>
                                        <td>
                                          <button 
                                            className="p-eye-btn"
                                            onClick={() => openItemModal(order.order_number, item.id)}
                                            title="View Item Details"
                                          >
                                            👁️
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Order Details Modal - Showing ALL orders table data */}
      {showOrderModal && modalData && (
        <div className="p-modal-overlay" onClick={closeModals}>
          <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>Order Details - {modalData.order_number}</h3>
              <button className="p-modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="p-modal-body">
              <div className="p-three-column-grid">
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Number:</span>
                    <span className="p-detail-value">{modalData.order_number}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Customer Name:</span>
                    <span className="p-detail-value">{modalData.customer_name}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Customer ID:</span>
                    <span className="p-detail-value">{modalData.customer_id}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Total:</span>
                    <span className="p-detail-value">₹{(modalData.order_total ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount Amount:</span>
                    <span className="p-detail-value">₹{(modalData.discount_amount ?? 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Taxable Amount:</span>
                    <span className="p-detail-value">₹{(modalData.taxable_amount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Tax Amount:</span>
                    <span className="p-detail-value">₹{(modalData.tax_amount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Net Payable:</span>
                    <span className="p-detail-value">₹{(modalData.net_payable ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Period:</span>
                    <span className="p-detail-value">{modalData.credit_period} days</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Estimated Delivery:</span>
                    <span className="p-detail-value">
                      {modalData.estimated_delivery_date ? new Date(modalData.estimated_delivery_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Invoice Number:</span>
                    <span className="p-detail-value">{modalData.invoice_number}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Invoice Date:</span>
                    <span className="p-detail-value">
                      {modalData.invoice_date ? new Date(modalData.invoice_date).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Date:</span>
                    <span className="p-detail-value">
                      {modalData.created_at ? new Date(modalData.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Last Updated:</span>
                    <span className="p-detail-value">
                      {modalData.updated_at ? new Date(modalData.updated_at).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Mode:</span>
                    <span className="p-detail-value">{modalData.order_mode || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal - Showing ALL order_details table data */}
      {showItemModal && modalData && (
        <div className="p-modal-overlay" onClick={closeModals}>
          <div className="p-modal-content p-wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>Item Details - {modalData.item_name}</h3>
              <button className="p-modal-close" onClick={closeModals}>×</button>
            </div>
            <div className="p-modal-body">
              <div className="p-three-column-grid">
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Item Name:</span>
                    <span className="p-detail-value">{modalData.item_name}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Product ID:</span>
                    <span className="p-detail-value">{modalData.product_id}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Order Number:</span>
                    <span className="p-detail-value">{modalData.order_number}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">MRP:</span>
                    <span className="p-detail-value">₹{modalData.mrp.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Sale Price:</span>
                    <span className="p-detail-value">₹{modalData.sale_price.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Price:</span>
                    <span className="p-detail-value">₹{modalData.price.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Quantity:</span>
                    <span className="p-detail-value">{modalData.quantity}</span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Total Amount:</span>
                    <span className="p-detail-value">₹{modalData.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount %:</span>
                    <span className="p-detail-value">{modalData.discount_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount Amount:</span>
                    <span className="p-detail-value">₹{modalData.discount_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Taxable Amount:</span>
                    <span className="p-detail-value">₹{modalData.taxable_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Tax %:</span>
                    <span className="p-detail-value">{modalData.tax_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Tax Amount:</span>
                    <span className="p-detail-value">₹{modalData.tax_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Item Total:</span>
                    <span className="p-detail-value">₹{modalData.item_total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-column">
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Period:</span>
                    <span className="p-detail-value">{modalData.credit_period} days</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Credit Percentage:</span>
                    <span className="p-detail-value">{modalData.credit_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">SGST %:</span>
                    <span className="p-detail-value">{modalData.sgst_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">SGST Amount:</span>
                    <span className="p-detail-value">₹{modalData.sgst_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">CGST %:</span>
                    <span className="p-detail-value">{modalData.cgst_percentage}%</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">CGST Amount:</span>
                    <span className="p-detail-value">₹{modalData.cgst_amount.toLocaleString()}</span>
                  </div>
                  <div className="p-detail-row">
                    <span className="p-detail-label">Discount Scheme:</span>
                    <span className="p-detail-value">{modalData.discount_applied_scheme}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Period;