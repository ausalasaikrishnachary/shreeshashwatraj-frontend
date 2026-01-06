import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./CheckOut.css";
import axios from "axios";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    retailerId,
    customerName,
    displayName,
    discount,
    cartItems: initialCartItems,
    staffId: initialStaffId,
    userRole,
    totals: initialTotals,
    orderTotals: initialOrderTotals,
    userDiscountPercentage,
    creditPeriods,
    isEditMode = false,
    editOrderNumber,
    editItemId,
    originalItemData
  } = location.state || {};

  const discountPercentage = discount || userDiscountPercentage || 0;

  console.log("Checkout Mode:", isEditMode ? "Edit Mode" : "New Order");
  console.log("Edit Order Number:", editOrderNumber);
  console.log("Edit Item ID:", editItemId);
  console.log("Original Item Data:", originalItemData);

  const [assignedStaffInfo, setAssignedStaffInfo] = useState({ id: null, name: null });
  const [retailerDetails, setRetailerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderMode, setOrderMode] = useState(isEditMode ? 'KACHA' : 'KACHA');
  const [cartItems, setCartItems] = useState(initialCartItems || []);
  const [orderTotals, setOrderTotals] = useState(initialOrderTotals || initialTotals || {});
  const [retailerInfo, setRetailerInfo] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  useEffect(() => {
    const getStaffInfo = () => {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        try {
          const user = JSON.parse(storedData);
          console.log("Logged in user:", user);
        } catch (err) {
          console.error("Error parsing user data:", err);
        }
      }
    };
    getStaffInfo();
  }, []);

  useEffect(() => {
    const fetchRetailerDetails = async () => {
      if (!retailerId) return;

      try {
        const res = await fetch(`${baseurl}/accounts/${retailerId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Retailer Details:", data);
          setRetailerDetails(data);
        } else {
          console.warn("Failed to fetch retailer details");
        }
      } catch (err) {
        console.error("Error fetching retailer:", err);
      }
    };

    fetchRetailerDetails();
  }, [retailerId]);

  useEffect(() => {
    if (!retailerId) return;

    const fetchRetailerInfo = async () => {
      try {
        const storedData = localStorage.getItem("user");
        const user = storedData ? JSON.parse(storedData) : null;
        const staffId = user?.id || null;

        if (staffId) {
          const response = await fetch(`${baseurl}/get-sales-retailers/${staffId}`);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();

          if (result.success && Array.isArray(result.data)) {
            const retailer = result.data.find(r => r.id === parseInt(retailerId));
            if (retailer) {
              setRetailerInfo({
                name: retailer.name,
                business: retailer.business_name,
                location: retailer.shipping_city,
                discount: retailer.discount || 0,
                displayName: displayName || retailer.display_name || ""
              });
            }
          }
        } else {
          setRetailerInfo({
            name: customerName,
            discount: discount,
            displayName: displayName || ""
          });
        }
      } catch (err) {
        console.error("Error fetching retailer info:", err);
        setRetailerInfo({
          name: customerName,
          discount: discount,
          displayName: displayName || ""
        });
      }
    };

    fetchRetailerInfo();
  }, [retailerId, customerName, displayName, discount]);

  useEffect(() => {
    if (!retailerId) return;

    const fetchAssignedStaffInfo = async () => {
      try {
        const response = await fetch(`${baseurl}/accounts/${retailerId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result) {
          setAssignedStaffInfo({
            id: result.staffid,
            name: result.assigned_staff
          });
        }
      } catch (err) {
        console.error("Error fetching assigned staff info:", err);
        setAssignedStaffInfo({
          id: initialStaffId,
          name: "Staff"
        });
      }
    };

    fetchAssignedStaffInfo();
  }, [retailerId, initialStaffId, baseurl]);

  // NEW: Function to update item price
  const handleUpdateItemPrice = async () => {
    if (cartItems.length === 0 || !editItemId || !editOrderNumber) {
      alert("No item to update or missing edit information");
      return;
    }

    const cartItem = cartItems[0];
    const newEditedPrice = cartItem.edited_sale_price || cartItem.sale_price;
    const minSalePrice = cartItem.min_sale_price || 0;

    // Validate that edited price is at least minimum sale price
    if (newEditedPrice < minSalePrice) {
      alert(`Edited price (₹${newEditedPrice}) cannot be less than minimum sale price (₹${minSalePrice})`);
      return;
    }

    setIsUpdatingItem(true);

    try {
      // Calculate new breakdown based on edited price
      const mrp = cartItem.mrp || 0;
      const quantity = cartItem.quantity || 1;
      const creditPeriod = cartItem.credit_period || 0;
      const discountPercentage = cartItem.discount_percentage || 0;
      
      // Calculate new breakdown
      const customerSalePrice = newEditedPrice;
      const discountAmount = customerSalePrice * (discountPercentage / 100);
      const priceAfterDiscount = customerSalePrice - discountAmount;
      
      // Calculate GST (assuming 18% for example)
      const gstPercentage = 18;
      const taxableAmount = priceAfterDiscount / (1 + gstPercentage/100);
      const taxAmount = priceAfterDiscount - taxableAmount;
      
      // Calculate credit charge if credit period > 0
      let creditCharge = 0;
      if (creditPeriod > 0) {
        const creditPercentage = cartItem.credit_percentage || 2; // 2% per month default
        creditCharge = (customerSalePrice * creditPercentage * creditPeriod) / (30 * 100);
      }
      
      const finalAmount = priceAfterDiscount + creditCharge;
      const itemTotal = finalAmount * quantity;

      const updatedItem = {
        edited_sale_price: newEditedPrice,
        customer_sale_price: customerSalePrice,
        discount_amount: discountAmount,
        taxable_amount: taxableAmount,
        tax_amount: taxAmount,
        final_amount: finalAmount,
        item_total: itemTotal,
        credit_charge: creditCharge,
        total_amount: finalAmount * quantity
      };

      console.log("Updating item with data:", {
        itemId: editItemId,
        orderNumber: editOrderNumber,
        updatedItem
      });

      // Call API to update item
      const response = await axios.put(
        `${baseurl}/orders/items/${editItemId}/update-price`,
        {
          order_number: editOrderNumber,
          ...updatedItem
        }
      );

      if (response.data.success) {
        alert("Item price updated successfully!");
        
        // Navigate back to period page
        setTimeout(() => {
          navigate('/period');
        }, 1000);
      } else {
        throw new Error(response.data.error || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item price:", error);
      alert(`Failed to update item: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUpdatingItem(false);
    }
  };

  // NEW: Handle place order for edit mode
  const handlePlaceOrderForEdit = async () => {
    return handleUpdateItemPrice();
  };

  // Original place order function (for new orders)
  const handlePlaceOrderForNew = async () => {
    if (!retailerId || !cartItems || cartItems.length === 0) {
      alert("Missing required information");
      return;
    }

    const storedData = localStorage.getItem("user");
    let loggedInUser = null;
    let actualStaffId = initialStaffId;
    let staffName = null;
    let assignedStaff = null;
    let staffIdFromStorage = null;

    if (storedData) {
      try {
        loggedInUser = JSON.parse(storedData);
        console.log("Logged in user data:", loggedInUser);

        staffName = loggedInUser.name || "Staff Member";
        staffIdFromStorage = loggedInUser.id;
        assignedStaff = loggedInUser.assigned_staff || loggedInUser.supervisor_name || staffName;

        if (!actualStaffId && staffIdFromStorage) {
          actualStaffId = staffIdFromStorage;
          console.log("Using staff ID from localStorage:", actualStaffId);
        }

      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    if (!actualStaffId) {
      alert("Staff ID is required. Please log in again.");
      return;
    }

    setLoading(true);

    let staffIncentive = 0;
    let assignedStaffName = "Unknown Staff";
    let staffEmail = null;

    try {
      const staffRes = await fetch(`${baseurl}/accounts/${actualStaffId}`);
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        console.log("Fetched Staff Data:", staffData);

        staffIncentive = staffData.incentive_percent || 0;
        assignedStaffName = staffData.name || "Unknown Staff";
        staffEmail = staffData.email || null;
      } else {
        console.warn("Failed to fetch staff details from backend");
      }
    } catch (error) {
      console.error("Error fetching staff details:", error);
    }

    const orderNumber = `ORD${Date.now()}`;
    const totalCreditCharges = cartItems.reduce((sum, item) => {
      const breakdown = item.breakdown?.perUnit || {};
      return sum + ((breakdown.credit_charge || 0) * (item.quantity || 1));
    }, 0);

    const orderData = {
      order: {
        order_number: orderNumber,
        customer_id: retailerId,
        customer_name: customerName || retailerDetails?.name || "Customer",
        order_total: orderTotals.totalCustomerSalePrice || orderTotals.subtotal || 0,
        discount_amount: orderTotals.totalDiscount || 0,
        taxable_amount: orderTotals.totalTaxableAmount || 0,
        tax_amount: orderTotals.totalTax || 0,
        net_payable: orderTotals.finalTotal || 0,
        credit_period: totalCreditCharges,
        estimated_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        order_placed_by: actualStaffId,
        order_mode: orderMode,
        approval_status: "Pending",
        ordered_by: staffName,
        order_status: "Pending",
        staffid: actualStaffId,
        assigned_staff: assignedStaffName,
        staff_incentive: staffIncentive.toString(),
        staff_email: staffEmail,
        retailer_email: retailerDetails?.email || ""
      },
      orderItems: cartItems.map(item => {
        const breakdown = item.breakdown?.perUnit || {};
        const product = item.product_details || {};
        const quantity = item.quantity || 1;
        const creditCharge = breakdown.credit_charge || 0;
        const finalAmount = breakdown.final_amount || 0;

        return {
          order_number: orderNumber,
          item_name: item.item_name || product.name || `Product ${item.product_id}`,
          product_id: item.product_id,
          quantity: quantity,
          mrp: breakdown.mrp || 0,
          sale_price: breakdown.sale_price || 0,
          edited_sale_price: breakdown.edited_sale_price || 0,
          credit_charge: creditCharge,
          credit_period: item.credit_period || 0,
          credit_percentage: (breakdown.credit_percentage || 0).toString(),
          customer_sale_price: breakdown.customer_sale_price || 0,
          discount_percentage: (breakdown.discount_percentage || 0).toString(),
          discount_amount: breakdown.discount_amount || 0,
          item_total: breakdown.item_total || 0,
          taxable_amount: breakdown.taxable_amount || 0,
          tax_percentage: (breakdown.tax_percentage || 0).toString(),
          tax_amount: breakdown.tax_amount || 0,
          sgst_percentage: (breakdown.sgst_percentage || 0).toString(),
          sgst_amount: breakdown.sgst_amount || 0,
          cgst_percentage: (breakdown.cgst_percentage || 0).toString(),
          cgst_amount: breakdown.cgst_amount || 0,
          final_amount: finalAmount,
          total_amount: finalAmount * quantity,
          discount_applied_scheme: breakdown.discount_percentage > 0 ? 'user_discount' : 'none'
        };
      })
    };

    console.log("Sending order data:", JSON.stringify(orderData, null, 2));

    try {
      const response = await fetch(`${baseurl}/orders/create-complete-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log("Order response:", result);

      if (response.ok && result.success) {
        setOrderDetails({
          orderNumber: result.order_number || orderData.order.order_number,
          orderId: result.order_id,
          amount: orderData.order.net_payable,
          customerName: customerName || retailerDetails?.name || "Customer",
          staffId: actualStaffId,
          staffName: staffName,
          date: new Date().toLocaleDateString(),
          orderMode: orderMode,
          breakdown: orderTotals
        });

        setOrderPlaced(true);

        setTimeout(() => {
          const successMessage = `
          ✅ Order Placed Successfully!
          
          Order Number: ${result.order_number || orderData.order.order_number}
          Customer: ${customerName || retailerDetails?.name || "Customer"}
          Total Amount: ₹${orderData.order.net_payable.toFixed(2)}
          Order Mode: ${orderMode}
          
          Thank you for your order!
        `;
          alert(successMessage);

          setTimeout(() => {
            navigate('/period');
          }, 2000);
        }, 500);

      } else {
        throw new Error(result.error || result.details || result.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(`Order failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Main place order function
  const handlePlaceOrder = () => {
    if (isEditMode) {
      handlePlaceOrderForEdit();
    } else {
      handlePlaceOrderForNew();
    }
  };

  const handleBackToCart = () => {
    if (isEditMode) {
      navigate('/period');
    } else {
      navigate("/retailers/cart", {
        state: {
          retailerId,
          customerName: retailerInfo.name,
          displayName: retailerInfo.displayName,
          discount,
          cartItems,
          staffId: initialStaffId,
          userRole,
          orderTotals,
          userDiscountPercentage: discountPercentage
        }
      });
    }
  };

  const handleBackToRetailers = () => {
    navigate("/retailers");
  };

  if (!retailerId) {
    return (
      <div className="checkout-page-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`checkout-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            isCollapsed={isCollapsed}
            onToggleSidebar={handleToggleMobile}
          />
          <div className="checkout-page-main-content">
            <div className="checkout-page">
              <div className="error-container">
                <h2>Checkout Not Found</h2>
                <p>Please select a retailer to proceed to checkout.</p>
                <button onClick={handleBackToRetailers} className="back-retailers-btn">
                  Back to Retailers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced && orderDetails) {
    const successContent = (
      <div className="checkout-page">
        <div className="order-success-container">
          <div className="success-icon">✅</div>
          <h2>{isEditMode ? "Item Updated Successfully!" : "Order Placed Successfully!"}</h2>

          <div className="order-details-card">
            <h3>{isEditMode ? "Update Details" : "Order Details"}</h3>
            {isEditMode ? (
              <>
                <div className="order-detail-row">
                  <span>Order Number:</span>
                  <strong>{editOrderNumber}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Item:</span>
                  <strong>{cartItems[0]?.item_name}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Updated Price:</span>
                  <strong className="total-amount">
                    ₹{(cartItems[0]?.edited_sale_price || cartItems[0]?.sale_price)?.toLocaleString()}
                  </strong>
                </div>
              </>
            ) : (
              <>
                <div className="order-detail-row">
                  <span>Order Number:</span>
                  <strong>{orderDetails.orderNumber}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Order Mode:</span>
                  <strong className={`order-mode-badge ${orderDetails.orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
                    {orderDetails.orderMode}
                  </strong>
                </div>
                <div className="order-detail-row">
                  <span>Customer:</span>
                  <span>{orderDetails.customerName}</span>
                </div>
                <div className="order-detail-row">
                  <span>Placed by Staff ID:</span>
                  <strong>{orderDetails.staffId}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Date:</span>
                  <span>{orderDetails.date}</span>
                </div>
                <div className="order-detail-row">
                  <span>Total Amount:</span>
                  <strong className="total-amount">
                    ₹{orderDetails.amount.toLocaleString()}
                  </strong>
                </div>
              </>
            )}
          </div>

          <div className="order-actions">
            <button onClick={() => navigate('/period')} className="new-order-btn">
              Back to Period
            </button>
          </div>
        </div>
      </div>
    );

    if (isMobileView) {
      return successContent;
    } else {
      return (
        <div className="checkout-page-wrapper">
          <AdminSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            onToggleMobile={isMobileOpen}
          />
          <div className={`checkout-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
            <AdminHeader
              isCollapsed={isCollapsed}
              onToggleSidebar={handleToggleMobile}
            />
            <div className="checkout-page-main-content">
              {successContent}
            </div>
          </div>
        </div>
      );
    }
  }

  const mainContent = (
    <div className="checkout-page">
      {!isMobileView && (
        <div className="checkout-desktop-header">
          <div className="desktop-header-content">
            <div className="desktop-header-left">
              <button
                className="desktop-back-btn"
                onClick={handleBackToCart}
              >
                ← {isEditMode ? "Back to Period" : "Back to Cart"}
              </button>
              <div className="desktop-header-text">
                <h1>
                  {isEditMode ? "Edit Item Price" : "Checkout"}
                  {retailerInfo.displayName && <span className="display-name-header"> for {retailerInfo.displayName}</span>}
                </h1>
                {retailerInfo.name && (
                  <div className="desktop-customer-info">
                    <div className="customer-details">
                      <p className="customer-name">Customer: <strong>{retailerInfo.name}</strong></p>
                      {retailerInfo.displayName && (
                        <p className="customer-display-name">Display Name: <strong>{retailerInfo.displayName}</strong></p>
                      )}
                      {retailerInfo.business && (
                        <p className="customer-business">Business: {retailerInfo.business}</p>
                      )}
                      {retailerInfo.location && (
                        <p className="customer-location">Location: {retailerInfo.location}</p>
                      )}
                      {retailerInfo.discount > 0 && (
                        <p className="customer-discount">Discount: {retailerInfo.discount}%</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="desktop-header-right">
              <div className="desktop-summary-box">
                <div className="summary-header">
                  <h3>{isEditMode ? "Edit Summary" : "Order Summary"}</h3>
                </div>

                {cartItems.length === 0 ? (
                  <div className="empty-summary">
                    <p>No items</p>
                  </div>
                ) : (
                  <>
                    <div className="summary-items-preview">
                      {cartItems.slice(0, 3).map((item, index) => {
                        const breakdown = item.breakdown?.perUnit || {};
                        return (
                          <div key={index} className="preview-item">
                            <span className="preview-name">{item.item_name || `Product ${item.product_id}`}</span>
                            <span className="preview-qty">x{item.quantity || 1}</span>
                            <span className="preview-price">
                              ₹{(breakdown.final_amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="summary-totals">
                      <div className="summary-row">
                        <span>Items:</span>
                        <span className="count">{orderTotals.itemCount || cartItems.length}</span>
                      </div>
                      {orderTotals.totalCreditCharges > 0 && (
                        <div className="summary-row credit">
                          <span>Credit Charges:</span>
                          <span>+₹{orderTotals.totalCreditCharges?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                      )}
                      {orderTotals.totalDiscount > 0 && (
                        <div className="summary-row discount-row">
                          <span>Discount ({orderTotals.userDiscount || discountPercentage}%):</span>
                          <span>-₹{orderTotals.totalDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="summary-row total-row">
                        <span>Total:</span>
                        <span className="final-total">₹{orderTotals.finalTotal?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobileView && (
        <div className="checkout-mobile-header">
          <div className="mobile-header-content">
            <div className="mobile-header-main">
              <button
                className="mobile-back-btn"
                onClick={handleBackToCart}
              >
                ← {isEditMode ? "Back" : "Back to Cart"}
              </button>
              <div className="mobile-header-text">
                <h1>{isEditMode ? "Edit Item" : "Checkout"}</h1>
                {retailerInfo.name && (
                  <div className="mobile-customer-info">
                    <div className="customer-info">
                      Customer: <strong>{retailerInfo.name}</strong>
                      {retailerInfo.displayName && (
                        <span className="display-name-badge"> ({retailerInfo.displayName})</span>
                      )}
                      {discount > 0 && (
                        <span className="discount-badge"> - {discount}% Discount</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="checkout-main-content">
        {isEditMode && cartItems.length > 0 && (
          <div className="edit-item-section">
            <h3>Edit Item Price</h3>
            <div className="edit-item-details">
              <div className="edit-item-row">
                <span className="edit-label">Item Name:</span>
                <span className="edit-value">{cartItems[0].item_name}</span>
              </div>
              <div className="edit-item-row">
                <span className="edit-label">Current Sale Price:</span>
                <span className="edit-value">₹{cartItems[0].sale_price?.toLocaleString()}</span>
              </div>
              <div className="edit-item-row">
                <span className="edit-label">Minimum Sale Price:</span>
                <span className="edit-value warning">₹{cartItems[0].min_sale_price?.toLocaleString()}</span>
              </div>
              <div className="edit-item-row">
                <span className="edit-label">Quantity:</span>
                <span className="edit-value">{cartItems[0].quantity}</span>
              </div>
              
              <div className="edit-price-input">
                <label htmlFor="editedPrice">Enter New Price (must be ≥ ₹{cartItems[0].min_sale_price}):</label>
                <input
                  type="number"
                  id="editedPrice"
                  min={cartItems[0].min_sale_price}
                  defaultValue={cartItems[0].edited_sale_price || cartItems[0].sale_price}
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value);
                    const updatedItems = [...cartItems];
                    updatedItems[0] = {
                      ...updatedItems[0],
                      edited_sale_price: newPrice
                    };
                    setCartItems(updatedItems);
                  }}
                  className="price-input"
                />
                {cartItems[0].edited_sale_price < cartItems[0].min_sale_price && (
                  <p className="error-message">
                    Price must be at least ₹{cartItems[0].min_sale_price}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!isEditMode && (
          <div className="order-mode-section">
            <h3>Order Mode</h3>
            <div className="order-mode-buttons">
              <button
                className={`order-mode-btn ${orderMode === 'KACHA' ? 'active' : ''}`}
                onClick={() => setOrderMode('KACHA')}
              >
                KACHA
              </button>
              <button
                className={`order-mode-btn ${orderMode === 'PAKKA' ? 'active' : ''}`}
                onClick={() => setOrderMode('PAKKA')}
              >
                PAKKA
              </button>
            </div>
            <p className="order-mode-note">
              {orderMode === 'KACHA'
                ? 'KACHA: Temporary order, invoice will be generated later'
                : 'PAKKA: Complete order with immediate invoice'}
            </p>
          </div>
        )}

        <div className="order-summary-section">
          <h2>{isEditMode ? "Price Update Summary" : "Order Summary"} ({orderTotals.itemCount || cartItems.length} items)</h2>

          {orderTotals.totalCreditCharges > 0 && (
            <div className="summary-row credit">
              <span>Credit Charges:</span>
              <span>+₹{orderTotals.totalCreditCharges?.toLocaleString() || '0'}</span>
            </div>
          )}

          {orderTotals.totalDiscount > 0 && (
            <div className="summary-row discount">
              <span>Discount ({orderTotals.userDiscount || discountPercentage}%):</span>
              <span>-₹{orderTotals.totalDiscount?.toLocaleString() || '0'}</span>
            </div>
          )}

          {orderTotals.totalTax > 0 && (
            <>
              <div className="summary-row">
                <span>Taxable Amount:</span>
                <span>₹{orderTotals.totalTaxableAmount?.toLocaleString() || '0'}</span>
              </div>

              <div className="summary-row tax">
                <span>Total GST:</span>
                <span>+₹{orderTotals.totalTax?.toLocaleString() || '0'}</span>
              </div>
            </>
          )}

          <div className="summary-row total">
            <span>Final Total:</span>
            <strong>₹{orderTotals.finalTotal?.toLocaleString() || '0'}</strong>
          </div>

          {!isEditMode && (
            <div className="summary-row mode-display">
              <span>Order Mode:</span>
              <span className={`order-mode-indicator ${orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
                {orderMode} {orderMode === 'PAKKA' ? '✓' : '⏳'}
              </span>
            </div>
          )}

          {orderTotals.totalDiscount > 0 && (
            <div className="savings-note">
              🎉 Customer saved ₹{orderTotals.totalDiscount?.toLocaleString() || '0'} with {orderTotals.userDiscount || discountPercentage}% discount!
            </div>
          )}
        </div>

        <div className="place-order-section">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || isUpdatingItem || !cartItems || cartItems.length === 0 || 
              (isEditMode && cartItems[0].edited_sale_price < cartItems[0].min_sale_price)}
            className={`place-order-btn ${loading || isUpdatingItem ? 'loading' : ''} ${isEditMode ? 'edit-btn' : ''}`}
          >
            {isUpdatingItem ? "Updating..." : 
             loading ? "Processing..." : 
             isEditMode ? `Update Price - ₹${cartItems[0]?.edited_sale_price?.toLocaleString() || '0'}` : 
             `Place ${orderMode} Order - ₹${orderTotals.finalTotal?.toLocaleString() || '0'}`}
          </button>
          
          {isEditMode && cartItems[0].edited_sale_price < cartItems[0].min_sale_price && (
            <p className="validation-error">
              Cannot update: Price is below minimum sale price (₹{cartItems[0].min_sale_price})
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobileView) {
    return mainContent;
  } else {
    return (
      <div className="checkout-page-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`checkout-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            isCollapsed={isCollapsed}
            onToggleSidebar={handleToggleMobile}
          />
          <div className="checkout-page-main-content">
            {mainContent}
          </div>
        </div>
      </div>
    );
  }
}

export default Checkout;