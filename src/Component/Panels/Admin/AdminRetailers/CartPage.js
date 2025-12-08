import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./Cart.css";

function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [retailerId, setRetailerId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [staffId, setStaffId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [creditPeriods, setCreditPeriods] = useState([]);
  const [creditLoading, setCreditLoading] = useState(true);
  const [productDetails, setProductDetails] = useState({});
  const [retailerInfo, setRetailerInfo] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get logged-in user
  useEffect(() => {
    const storedData = localStorage.getItem("user");
    const user = storedData ? JSON.parse(storedData) : null;
    setStaffId(user?.id || null);
    setUserRole(user?.role || "");
  }, []);

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

  // Get retailer info from location state
  useEffect(() => {
    if (location.state) {
      setRetailerId(location.state.retailerId || "");
      setCustomerName(location.state.customerName || "");
      setDisplayName(location.state.displayName || "");
      setDiscount(location.state.discount || 0);
    }
  }, [location.state]);

  // Fetch retailer info from API
  useEffect(() => {
    if (!retailerId || !staffId) return;

    const fetchRetailerInfo = async () => {
      try {
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
  }, [retailerId, staffId, customerName, displayName, discount]);

  // Fetch product details for cart items
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`${baseurl}/get-sales-products`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        const products = Array.isArray(result) ? result : (result.data || []);
        
        // Create a map of product details
        const productMap = {};
        products.forEach(product => {
          productMap[product.id] = {
            name: product.name,
            unit: product.unit,
            gst_rate: parseFloat(product.gst_rate) || 0,
            price: parseFloat(product.price) || 0,
            inclusive_gst: product.inclusive_gst || "Exclusive"
          };
        });
        
        setProductDetails(productMap);
      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    };

    fetchProductDetails();
  }, []);

  // Fetch credit periods
  useEffect(() => {
    const fetchCreditPeriods = async () => {
      try {
        setCreditLoading(true);
        const response = await fetch(`${baseurl}/api/credit-period-fix/credit`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setCreditPeriods(result.data);
        } else {
          throw new Error("Invalid credit periods data format");
        }
      } catch (err) {
        console.error("Error fetching credit periods:", err);
      } finally {
        setCreditLoading(false);
      }
    };

    fetchCreditPeriods();
  }, []);

  // Fetch cart items from backend
  const fetchCartItems = async () => {
    if (!retailerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${baseurl}/api/cart/customer-cart/${retailerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const items = await response.json();
      setCartItems(items || []);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (retailerId) {
      fetchCartItems();
    }
  }, [retailerId]);

  // Update quantity in cart
  const updateQuantityInCart = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(`${baseurl}/api/cart/update-cart-quantity/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error("Failed to update quantity");
      
      // Refresh cart items
      fetchCartItems();
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity");
    }
  };

  // Update credit period for individual item
  const updateItemCreditPeriod = async (itemId, creditPeriod, creditPercentage) => {
    try {
      const response = await fetch(`${baseurl}/api/cart/update-cart-credit/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          credit_period: creditPeriod,
          credit_percentage: creditPercentage
        }),
      });

      if (!response.ok) throw new Error("Failed to update credit period");
      
      // Refresh cart items
      fetchCartItems();
    } catch (err) {
      console.error("Error updating credit period:", err);
      alert("Failed to update credit period");
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`${baseurl}/api/cart/remove-cart-item/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove item");
      
      // Refresh cart items
      fetchCartItems();
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item");
    }
  };

  // CALCULATION FUNCTIONS
  const calculateItemBreakdown = (item) => {
    const product = productDetails[item.product_id] || {};
    const price = product.price || item.price || 0;
    const gstRate = product.gst_rate || 0;
    const isInclusiveGST = product.inclusive_gst === "Inclusive";
    const quantity = item.quantity || 1;
    const creditMultiplier = item.credit_percentage ? (1 + (item.credit_percentage / 100)) : 1;
    const creditPercentage = item.credit_percentage || 0;
    const userDiscountPercentage = parseFloat(discount) || 0;

    // FOR INCLUSIVE GST
    if (isInclusiveGST) {
      // Step 1: Extract base amount from price (which includes GST)
      const baseAmountPerUnit = price / (1 + (gstRate / 100));
      
      // Step 2: Apply credit charge per unit
      const priceAfterCreditPerUnit = baseAmountPerUnit * creditMultiplier;
      const creditChargePerUnit = priceAfterCreditPerUnit - baseAmountPerUnit;
      
      // Step 3: Calculate total for quantity
      const totalBaseAmount = baseAmountPerUnit * quantity;
      const totalCreditCharges = creditChargePerUnit * quantity;
      const totalAmountAfterCredit = totalBaseAmount + totalCreditCharges;
      
      // Step 4: Apply user discount
      let discountAmount = 0;
      if (userDiscountPercentage > 0) {
        discountAmount = (totalAmountAfterCredit * userDiscountPercentage) / 100;
      }
      
      // Step 5: Calculate taxable amount
      const taxableAmount = totalAmountAfterCredit - discountAmount;
      
      // Step 6: Calculate tax amount on taxable amount
      const taxAmount = (taxableAmount * gstRate) / 100;
      
      // Step 7: Final total
      const finalPayableAmount = taxableAmount + taxAmount;

      return {
        basePrice: price,
        gstRate,
        isInclusiveGST: true,
        quantity,
        creditMultiplier,
        creditPercentage,
        userDiscountPercentage,
        
        perUnit: {
          price: price,
          baseAmount: baseAmountPerUnit,
          creditCharge: creditChargePerUnit,
        },
        
        totalBaseAmount,
        totalCreditCharges,
        discountAmount,
        taxableAmount,
        taxAmount,
        finalPayableAmount
      };
    }
    
    // FOR EXCLUSIVE GST
    else {
      const baseAmountPerUnit = price;
      const priceAfterCreditPerUnit = baseAmountPerUnit * creditMultiplier;
      const creditChargePerUnit = priceAfterCreditPerUnit - baseAmountPerUnit;
      
      const totalBaseAmount = baseAmountPerUnit * quantity;
      const totalCreditCharges = creditChargePerUnit * quantity;
      const totalAmountAfterCredit = totalBaseAmount + totalCreditCharges;
      
      let discountAmount = 0;
      if (userDiscountPercentage > 0) {
        discountAmount = (totalAmountAfterCredit * userDiscountPercentage) / 100;
      }
      
      const taxableAmount = totalAmountAfterCredit - discountAmount;
      const taxAmount = (taxableAmount * gstRate) / 100;
      const finalPayableAmount = taxableAmount + taxAmount;

      return {
        basePrice: price,
        gstRate,
        isInclusiveGST: false,
        quantity,
        creditMultiplier,
        creditPercentage,
        userDiscountPercentage,
        
        perUnit: {
          price: price,
          baseAmount: baseAmountPerUnit,
          creditCharge: creditChargePerUnit,
        },
        
        totalBaseAmount,
        totalCreditCharges,
        discountAmount,
        taxableAmount,
        taxAmount,
        finalPayableAmount
      };
    }
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    const breakdown = calculateItemBreakdown(item);
    return breakdown.finalPayableAmount;
  };

  // Calculate item discount
  const calculateItemDiscount = (item) => {
    const breakdown = calculateItemBreakdown(item);
    return breakdown.discountAmount;
  };

  // Calculate totals for the entire cart
  const calculateCartTotals = () => {
    let subtotal = 0;
    let totalCreditCharges = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let finalTotal = 0;
    let itemCount = 0;

    cartItems.forEach(item => {
      const breakdown = calculateItemBreakdown(item);
      
      subtotal += breakdown.totalBaseAmount;
      totalCreditCharges += breakdown.totalCreditCharges;
      totalDiscount += breakdown.discountAmount;
      totalTax += breakdown.taxAmount;
      finalTotal += breakdown.finalPayableAmount;
      itemCount += breakdown.quantity;
    });

    return {
      subtotal,
      totalCreditCharges,
      totalDiscount,
      totalTax,
      finalTotal,
      itemCount
    };
  };

  const totals = calculateCartTotals();

  // Continue shopping - go back to PlaceSalesOrder page
  const handleContinueShopping = () => {
    navigate("/retailers/place-order", {
      state: {
        retailerId,
        discount,
        customerName: retailerInfo.name,
        displayName: retailerInfo.displayName
      }
    });
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty. Add items before checkout.");
      return;
    }

    // Prepare cart items with full breakdown for checkout
    const checkoutItems = cartItems.map(item => {
      const breakdown = calculateItemBreakdown(item);
      const product = productDetails[item.product_id] || {};
      
      return {
        ...item,
        item_name: product.name || `Product ${item.product_id}`,
        price: product.price || item.price || 0,
        gst_rate: product.gst_rate || 0,
        inclusive_gst: product.inclusive_gst || "Exclusive",
        breakdown: {
          ...breakdown,
          productDetails: product
        }
      };
    });

    navigate("/retailers/checkout", {
      state: {
        retailerId,
        customerName: retailerInfo.name,
        displayName: retailerInfo.displayName,
        discount,
        cartItems: checkoutItems,
        staffId: userRole === 'staff' ? staffId : null,
        userRole,
        totals: totals,
        creditBreakdown: {
          subtotal: totals.subtotal,
          totalCreditCharges: totals.totalCreditCharges,
          totalDiscount: totals.totalDiscount,
          totalTax: totals.totalTax,
          userDiscount: discount,
          finalTotal: totals.finalTotal
        }
      }
    });
  };

  // Go back to retailers page
  const handleBackToRetailers = () => {
    navigate("/retailers");
  };

  // Helper function for credit period display
  const getCreditPeriodDisplay = (item) => {
    if (!item.credit_period && item.credit_period !== 0) return "Select Credit Period";
    
    if (item.credit_period === 0) return "No Credit Period";
    
    const period = creditPeriods.find(cp => 
      cp.credit_period === parseInt(item.credit_period)
    );
    if (period) {
      return `${period.credit_period} days (+${period.credit_percentage}%)`;
    }
    return `${item.credit_period} days`;
  };

  if (!retailerId) {
    return (
      <div className="cart-page-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`cart-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            isCollapsed={isCollapsed}
            onToggleSidebar={handleToggleMobile}
          />
          <div className="cart-page-main-content">
            <div className="cart-page">
              <div className="error-container">
                <h2>Cart Not Found</h2>
                <p>Please select a retailer to view their cart.</p>
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

  // Main content
  const mainContent = (
    <div className="cart-page">
      {/* Desktop Header */}
      {!isMobileView && (
        <div className="cart-desktop-header">
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
                  🛒 Shopping Cart
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
                  <h3>Cart Summary</h3>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="empty-summary">
                    <p>No items in cart</p>
                  </div>
                ) : (
                  <>
                    <div className="summary-items-preview">
                      {cartItems.slice(0, 3).map(item => {
                        const product = productDetails[item.product_id] || {};
                        return (
                          <div key={item.id} className="preview-item">
                            <span className="preview-name">{product.name || `Product ${item.product_id}`}</span>
                            <span className="preview-qty">x{item.quantity || 1}</span>
                            <span className="preview-price">
                              ₹{calculateItemTotal(item).toLocaleString('en-IN')}
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
                        <span className="count">{totals.itemCount}</span>
                      </div>
                      {totals.totalDiscount > 0 && (
                        <div className="summary-row discount-row">
                          <span>Discount ({discount}%):</span>
                          <span>-₹{totals.totalDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="summary-row total-row">
                        <span>Total:</span>
                        <span className="final-total">₹{totals.finalTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleProceedToCheckout}
                      className="desktop-checkout-btn"
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      {isMobileView && (
        <div className="cart-mobile-header">
          <div className="mobile-header-content">
            <div className="mobile-header-main">
              <button
                className="mobile-back-btn"
                onClick={handleContinueShopping}
              >
                ← Continue Shopping
              </button>
              <div className="mobile-header-text">
                <h1>🛒 Shopping Cart</h1>
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

      {/* User Discount Banner */}
      {discount > 0 && (
        <div className="discount-banner">
          <div className="banner-content">
            <span className="banner-icon">🎉</span>
            <span className="banner-text">
              Customer Discount: <strong>{discount}%</strong> off applied to all items
            </span>
          </div>
        </div>
      )}

      {/* Mobile Cart Summary Bar */}
      {isMobileView && cartItems.length > 0 && (
        <div className="cart-summary-bar">
          <div className="summary-item">
            <span>Items:</span>
            <span className="count">{totals.itemCount}</span>
          </div>
          <div className="summary-item">
            <span>Total:</span>
            <span className="price">₹{totals.finalTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <p>Loading cart items...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={fetchCartItems} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Empty Cart */}
      {!loading && cartItems.length === 0 && (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add products from the order page</p>
          <button onClick={handleContinueShopping} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      )}

      {/* Cart Items with Credit Period Selection */}
      {!loading && cartItems.length > 0 && (
        <div className="cart-items-container">
          <h2>Cart Items ({cartItems.length})</h2>
          
          {!creditLoading && creditPeriods.length > 0 && (
            <div className="credit-period-section">
              <h3>Select Credit Period for Items</h3>
              <p className="credit-period-note">You can apply credit period to individual items below</p>
            </div>
          )}
          
          <div className="cart-items-list">
            {cartItems.map(item => {
              const breakdown = calculateItemBreakdown(item);
              const product = productDetails[item.product_id] || {};
              
              return (
                <div key={item.id} className="cart-item-card">
                  <div className="item-main-info">
                    <h4>{product.name || `Product ${item.product_id}`}</h4>
                    <div className="item-details">
                      <span className="price">₹{breakdown.basePrice.toLocaleString('en-IN')}</span>
                      {product.unit && <span className="unit">/{product.unit}</span>}
                      <span className={`gst-badge ${breakdown.isInclusiveGST ? 'inclusive' : 'exclusive'}`}>
                        {breakdown.isInclusiveGST ? 'Incl. GST' : 'Excl. GST'} {breakdown.gstRate}%
                      </span>
                    </div>
                    
                    {/* Credit Period Selector for each item */}
                    <div className="item-credit-control">
                      <label>Credit Period:</label>
                      <select
                        value={item.credit_period || 0}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          if (selectedValue === "0") {
                            updateItemCreditPeriod(item.id, 0, 0);
                          } else {
                            const selectedPeriod = creditPeriods.find(
                              p => p.credit_period?.toString() === selectedValue
                            );
                            if (selectedPeriod) {
                              updateItemCreditPeriod(
                                item.id, 
                                selectedPeriod.credit_period, 
                                selectedPeriod.credit_percentage
                              );
                            }
                          }
                        }}
                        className="credit-period-select"
                      >
                        <option value="0">No Credit Period</option>
                        {creditPeriods.map(period => (
                          <option 
                            key={period.credit_period} 
                            value={period.credit_period?.toString()}
                          >
                            {period.credit_period} days (+{period.credit_percentage}%)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Credit Period Indicator */}
                    {item.credit_period > 0 && (
                      <div className="credit-badge">
                        Credit: {item.credit_period} days (+{item.credit_percentage}%)
                      </div>
                    )}

                    {/* Item Calculation Breakdown */}
                    <div className="calculation-breakdown">
                      <div className="breakdown-row">
                        <span>Base Amount:</span>
                        <span>₹{breakdown.totalBaseAmount.toLocaleString('en-IN')}</span>
                      </div>
                      
                      {breakdown.totalCreditCharges > 0 && (
                        <div className="breakdown-row credit-charge">
                          <span>Credit Charges (+{breakdown.creditPercentage}%):</span>
                          <span>+₹{breakdown.totalCreditCharges.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      
                      {discount > 0 && (
                        <div className="breakdown-row discount">
                          <span>Discount ({discount}%):</span>
                          <span>-₹{breakdown.discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      
                      <div className="breakdown-row">
                        <span>Taxable Amount:</span>
                        <span>₹{breakdown.taxableAmount.toLocaleString('en-IN')}</span>
                      </div>
                      
                      {breakdown.taxAmount > 0 && (
                        <div className="breakdown-row tax">
                          <span>GST ({breakdown.gstRate}%):</span>
                          <span>+₹{breakdown.taxAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      
                      <div className="breakdown-row total">
                        <span>Item Total:</span>
                        <span className="item-total-amount">
                          ₹{breakdown.finalPayableAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantityInCart(item.id, Math.max(1, (item.quantity || 1) - 1))}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span className="quantity-value">{item.quantity || 1}</span>
                      <button
                        onClick={() => updateQuantityInCart(item.id, (item.quantity || 1) + 1)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>

                    <div className="per-unit-price">
                      ₹{(breakdown.finalPayableAmount / breakdown.quantity).toFixed(2)} per unit
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({totals.itemCount} items):</span>
              <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {totals.totalCreditCharges > 0 && (
              <div className="summary-row credit-charges">
                <span>Total Credit Charges:</span>
                <span>+₹{totals.totalCreditCharges.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            {totals.totalDiscount > 0 && (
              <div className="summary-row discount">
                <span>Customer Discount ({discount}%):</span>
                <span>-₹{totals.totalDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            {totals.totalTax > 0 && (
              <div className="summary-row tax">
                <span>Total GST:</span>
                <span>+₹{totals.totalTax.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="summary-row total">
              <span>Final Total:</span>
              <span className="final-total">₹{totals.finalTotal.toLocaleString('en-IN')}</span>
            </div>

            {totals.totalDiscount > 0 && (
              <div className="savings-note">
                🎉 Customer saved ₹{totals.totalDiscount.toLocaleString('en-IN')} with {discount}% discount!
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="cart-actions">
            <button onClick={handleContinueShopping} className="continue-btn">
              ← Add More Items
            </button>
            <button onClick={handleProceedToCheckout} className="checkout-btn">
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Return with layout for desktop, without layout for mobile
  if (isMobileView) {
    return mainContent;
  } else {
    return (
      <div className="cart-page-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`cart-page-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader
            isCollapsed={isCollapsed}
            onToggleSidebar={handleToggleMobile}
          />
          <div className="cart-page-main-content">
            {mainContent}
          </div>
        </div>
      </div>
    );
  }
}

export default CartPage;