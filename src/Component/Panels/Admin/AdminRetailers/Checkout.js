import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./CheckOut.css";

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
    creditPeriods
  } = location.state || {};

  const discountPercentage = discount || userDiscountPercentage || 0;

  console.log("DisplayName:", displayName);
  console.log("customerName:", customerName);

  const [assignedStaffInfo, setAssignedStaffInfo] = useState({ id: null, name: null });
  const [retailerDetails, setRetailerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderMode, setOrderMode] = useState('KACHA'); // Default to KACHA
  const [cartItems, setCartItems] = useState(initialCartItems || []);
  const [orderTotals, setOrderTotals] = useState(initialOrderTotals || initialTotals || {});
  const [retailerInfo, setRetailerInfo] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  // Check for mobile view on resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Handle mobile toggle
  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Get logged-in staff info from localStorage and fetch retailer info
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

  // Fetch retailer details from accounts endpoint - ADDED FROM REFERENCE CODE
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

  // Fetch retailer info
  useEffect(() => {
    if (!retailerId) return;

    const fetchRetailerInfo = async () => {
      try {
        // Get staff ID from localStorage
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
          // Fallback to state data
          setRetailerInfo({
            name: customerName,
            discount: discount,
            displayName: displayName || ""
          });
        }
      } catch (err) {
        console.error("Error fetching retailer info:", err);
        // Fallback to state data
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
            id: result.staffid, // Note: lowercase 'staffid'
            name: result.assigned_staff
          });
        }
      } catch (err) {
        console.error("Error fetching assigned staff info:", err);
        // Fallback to state data
        setAssignedStaffInfo({
          id: initialStaffId,
          name: "Staff"
        });
      }
    };

    fetchAssignedStaffInfo();
  }, [retailerId, initialStaffId, baseurl]);

  // Enhanced place order function with all calculations - UPDATED TO MATCH REFERENCE CODE
  const handlePlaceOrder = async () => {
    if (!retailerId || !cartItems || cartItems.length === 0) {
      alert("Missing required information");
      return;
    }

    // Get staff info from localStorage
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

        // Extract user information
        staffName = loggedInUser.name || "Staff Member";
        staffIdFromStorage = loggedInUser.id;
        assignedStaff = loggedInUser.assigned_staff || loggedInUser.supervisor_name || staffName;

        // Use staff ID from localStorage if not provided in state
        if (!actualStaffId && staffIdFromStorage) {
          actualStaffId = staffIdFromStorage;
          console.log("Using staff ID from localStorage:", actualStaffId);
        }

        console.log("Staff Name:", staffName);
        console.log("Assigned Staff:", assignedStaff);

      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    if (!actualStaffId) {
      alert("Staff ID is required. Please log in again.");
      return;
    }

    setLoading(true);

    // ---------------------------------------------------------
    // 1. Fetch Staff Details From Backend (accounts/:id) - FROM REFERENCE CODE
    // ---------------------------------------------------------
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

    // Generate order number
    const orderNumber = `ORD${Date.now()}`;

    // Calculate total credit charges from all items - FROM REFERENCE CODE
    const totalCreditCharges = cartItems.reduce((sum, item) => {
      const breakdown = item.breakdown?.perUnit || {};
      return sum + ((breakdown.credit_charge || 0) * (item.quantity || 1));
    }, 0);

    // Prepare order data using the breakdown from cart - UPDATED TO MATCH REFERENCE CODE
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
        credit_period: totalCreditCharges, // This should be the total credit charges amount - FROM REFERENCE CODE
        estimated_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        order_placed_by: actualStaffId,
        order_mode: orderMode,
        approval_status: "Pending",
        ordered_by: staffName,
        order_status: "Pending",
        staffid: actualStaffId,
        assigned_staff: assignedStaffName,
        staff_incentive: staffIncentive.toString(), // Convert to string - FROM REFERENCE CODE
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

          // Use the pre-calculated breakdown values from cart - FROM REFERENCE CODE
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

        // Set order placed to show popup
        setOrderPlaced(true);

        // Show success popup
        setTimeout(() => {
          // You can use your preferred popup method
          // Option 1: Using a custom popup component
          if (typeof setShowSuccessPopup === 'function') {
            setShowSuccessPopup(true);
          }

          // Option 2: Using alert with better formatting
          const successMessage = `
          ✅ Order Placed Successfully!
          
          Order Number: ${result.order_number || orderData.order.order_number}
          Customer: ${customerName || retailerDetails?.name || "Customer"}
          Total Amount: ₹${orderData.order.net_payable.toFixed(2)}
          Order Mode: ${orderMode}
          
          Thank you for your order!
        `;
          alert(successMessage);

          // Option 3: Navigate after popup
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

  const handleBackToCart = () => {
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
    // Success content
    const successContent = (
      <div className="checkout-page">
        <div className="order-success-container">
          <div className="success-icon">✅</div>
          <h2>Order Placed Successfully!</h2>

          <div className="order-details-card">
            <h3>Order Details</h3>
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
          </div>

          {/* Order Summary Breakdown - UPDATED */}
          <div className="breakdown-card">
            <h4>Payment Breakdown</h4>
            {orderTotals.totalCreditCharges > 0 && (
              <div className="breakdown-row credit">
                <span>Credit Charges:</span>
                <span>+₹{orderTotals.totalCreditCharges.toLocaleString()}</span>
              </div>
            )}
            {orderTotals.totalDiscount > 0 && (
              <div className="breakdown-row discount">
                <span>Discount ({orderTotals.userDiscount || discountPercentage}%):</span>
                <span>-₹{orderTotals.totalDiscount.toLocaleString()}</span>
              </div>
            )}
            {orderTotals.totalTax > 0 && (
              <>
                <div className="breakdown-row">
                  <span>Total Taxable Amount:</span>
                  <span>₹{orderTotals.totalTaxableAmount.toLocaleString()}</span>
                </div>
                <div className="breakdown-row tax">
                  <span>Total GST:</span>
                  <span>+₹{orderTotals.totalTax.toLocaleString()}</span>
                </div>
              </>
            )}
            <div className="breakdown-row total">
              <span>Final Total:</span>
              <strong>₹{orderTotals.finalTotal.toLocaleString()}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="order-actions">
            <button onClick={handleBackToRetailers} className="new-order-btn">
              Back to Retailers
            </button>
          </div>
        </div>
      </div>
    );

    // Return with layout for desktop, without layout for mobile
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

  // Main checkout content
  const mainContent = (
    <div className="checkout-page">
      {/* Desktop Header */}
      {!isMobileView && (
        <div className="checkout-desktop-header">
          <div className="desktop-header-content">
            <div className="desktop-header-left">
              <button
                className="desktop-back-btn"
                onClick={handleBackToRetailers}
              >
                ← Back to Retailers
              </button>
              <div className="desktop-header-text">
                <h1>
                  Checkout
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
                  <h3>Order Summary</h3>
                  <Link
                    to="/cart"
                    state={{
                      retailerId,
                      customerName: retailerInfo.name,
                      displayName: retailerInfo.displayName,
                      discount
                    }}
                    className="desktop-cart-link"
                  >
                    Edit Cart
                  </Link>
                </div>

                {cartItems.length === 0 ? (
                  <div className="empty-summary">
                    <p>No items in cart</p>
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
                      {cartItems.length > 3 && (
                        <div className="more-items-preview">
                          +{cartItems.length - 3} more items
                        </div>
                      )}
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

      {/* Mobile Header */}
      {isMobileView && (
        <div className="checkout-mobile-header">
          <div className="mobile-header-content">
            <div className="mobile-header-main">
              <button
                className="mobile-back-btn"
                onClick={handleBackToCart}
              >
                ← Back to Cart
              </button>
              <div className="mobile-header-text">
                <h1>Checkout</h1>
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

      {/* Main Content Area */}
      <div className="checkout-main-content">
        {/* Order Mode Selection */}
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

        {/* Order Summary - UPDATED TO MATCH REFERENCE CODE */}
        <div className="order-summary-section">
          <h2>Order Summary ({orderTotals.itemCount || cartItems.length} items)</h2>

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

          {/* Order Mode Display - ADDED FROM REFERENCE CODE */}
          <div className="summary-row mode-display">
            <span>Order Mode:</span>
            <span className={`order-mode-indicator ${orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
              {orderMode} {orderMode === 'PAKKA' ? '✓' : '⏳'}
            </span>
          </div>

          {orderTotals.totalDiscount > 0 && (
            <div className="savings-note">
              🎉 Customer saved ₹{orderTotals.totalDiscount?.toLocaleString() || '0'} with {orderTotals.userDiscount || discountPercentage}% discount!
            </div>
          )}
        </div>

        {/* Place Order Button */}
        <div className="place-order-section">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !cartItems || cartItems.length === 0}
            className={`place-order-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? "Processing..." : `Place ${orderMode} Order - ₹${orderTotals.finalTotal?.toLocaleString() || '0'}`}
          </button>
        </div>
      </div>
    </div>
  );

  // Return with layout for desktop, without layout for mobile
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