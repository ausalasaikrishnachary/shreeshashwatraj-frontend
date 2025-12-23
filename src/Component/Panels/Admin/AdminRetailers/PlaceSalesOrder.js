import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./PlaceSalesOrder.css";

function PlaceSalesOrder() {
    const navigate = useNavigate();
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [retailerInfo, setRetailerInfo] = useState({});
    const [categoriesList, setCategoriesList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    // Get retailer data from navigation state
    const retailerId = location.state?.retailerId;
    const retailerDiscount = location.state?.retailerDiscount || 0;
    const retailerName = location.state?.retailerName || "";
    const displayName = location.state?.displayName || "";

    // Get logged-in user
    const storedData = localStorage.getItem("user");
    const user = storedData ? JSON.parse(storedData) : null;
    const staffId = user?.id || null;

    console.log("displayName:", displayName);
    // Handle mobile toggle
    const handleToggleMobile = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    // Check for mobile view on resize
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        checkMobileView();
        window.addEventListener('resize', checkMobileView);

        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const response = await fetch(`${baseurl}/categories`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                const mappedCategories = data.map((category) => ({
                    id: category.id.toString(),
                    name: category.category_name,
                    discount: category.discount,
                    discountEndDate: category.discount_end_date,
                    icon: getCategoryIcon(category.category_name),
                }));

                setCategoriesList(mappedCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoriesList([]);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Helper function to assign icons based on category names
    const getCategoryIcon = (categoryName) => {
        const iconMap = {
            'Home Accessories': '🏠',
            'Snacks': '🍪',
            'Kitchen': '🔪',
            'Laptops': '💻',
            'Mobile': '📱',
            'Rice': '🍚',
            'Pulses': '🫘',
            'Oils': '🛢️',
            'Grains': '🌾',
            'Spices': '🌶️',
            'Sugar': '🧂',
            'Beverages': '☕',
        };

        return iconMap[categoryName] || '📦';
    };

    // Fetch cart items on load
    useEffect(() => {
        if (!retailerId) return;

        const fetchCartItems = async () => {
            try {
                const response = await fetch(`${baseurl}/api/cart/customer-cart/${retailerId}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const cartItems = await response.json();
                setCart(cartItems || []);
            } catch (err) {
                console.error("Error fetching cart:", err);
            }
        };

        fetchCartItems();
    }, [retailerId]);

    // Fetch retailer info
    useEffect(() => {
        if (!retailerId) return;

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
                    name: retailerName,
                    discount: retailerDiscount,
                    displayName: displayName || ""
                });
            }
        };

        if (staffId) {
            fetchRetailerInfo();
        } else {
            // Fallback to state data
            setRetailerInfo({
                name: retailerName,
                discount: retailerDiscount,
                displayName: displayName || ""
            });
        }
    }, [retailerId, staffId, retailerName, retailerDiscount, displayName]);

    // Fetch sales products
    useEffect(() => {
        const fetchSalesProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${baseurl}/get-sales-products`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();

                if (Array.isArray(result)) {
                    setProducts(result);
                } else if (result.data && Array.isArray(result.data)) {
                    setProducts(result.data);
                } else {
                    throw new Error("Invalid products data format");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSalesProducts();
    }, []);

    // Filter products based on search AND category
    const filteredProducts = products.filter(product => {
        // Filter by category
        const matchesCategory = selectedCategory === 'all' ||
            (product.category_id && product.category_id.toString() === selectedCategory) ||
            (product.category && product.category.toLowerCase() === categoriesList.find(cat => cat.id === selectedCategory)?.name?.toLowerCase());

        // If no search term, only filter by category
        if (!searchTerm.trim()) return matchesCategory;

        // Filter by search term
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch =
            product.name?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.supplier?.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    // Add product to cart via backend - SAME AS REFERENCE CODE
    const addToCart = async (product) => {
        try {
            // First check if product is already in cart
            const existingItem = cart.find(item => item.product_id === product.id);
            
            // Get logged-in user info
            const storedData = localStorage.getItem("user");
            const user = storedData ? JSON.parse(storedData) : null;
            
            // Format price to ensure it's a number - ADDED FROM REFERENCE CODE
            const productPrice = parseFloat(product.price) || 0;
            
            if (existingItem) {
                // Update quantity
                const response = await fetch(`${baseurl}/api/cart/update-cart-quantity/${existingItem.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantity: existingItem.quantity + 1
                    }),
                });

                if (!response.ok) throw new Error("Failed to update quantity");
            } else {
                // Add new item with price - UPDATED FROM REFERENCE CODE
                const requestBody = {
                    customer_id: retailerId,
                    product_id: product.id,
                    quantity: 1,
                    price: productPrice,  // Add the product price here - FROM REFERENCE CODE
                    credit_period: 0,
                    credit_percentage: 0
                };

                // Add staff_id if the user is a staff member
                if (user?.role === 'staff') {
                    requestBody.staff_id = user.id;
                }

                const response = await fetch(`${baseurl}/api/cart/add-to-cart`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    const errorData = await response.json(); // FROM REFERENCE CODE
                    throw new Error(errorData.message || "Failed to add to cart"); // FROM REFERENCE CODE
                }
            }

            // Refresh cart from backend
            const cartResponse = await fetch(`${baseurl}/api/cart/customer-cart/${retailerId}`);
            const refreshedCart = await cartResponse.json();
            setCart(refreshedCart || []);

        } catch (err) {
            console.error("Error adding to cart:", err);
            alert(err.message || "Failed to add item to cart"); // UPDATED FROM REFERENCE CODE
        }
    };

    // Cart count - SAME AS REFERENCE CODE
    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // REMOVED the detailed cart total calculations to match reference code
    // Reference code only uses cartCount, not cartTotal or discountedTotal

    if (!retailerId) {
        return (
            <div className="place-sales-order-wrapper">
                <AdminSidebar
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    onToggleMobile={isMobileOpen}
                />
                <div className={`place-sales-order-content-area ${isCollapsed ? "collapsed" : ""}`}>
                    <AdminHeader
                        isCollapsed={isCollapsed}
                        onToggleSidebar={handleToggleMobile}
                    />
                    <div className="place-sales-order-main-content">
                        <div className="place-sales-order">
                            <div className="place-order-error-container">
                                <h2>Retailer Not Found</h2>
                                <p>Please go back and select a retailer to place an order.</p>
                                <button
                                    className="back-retailers-btn"
                                    onClick={() => navigate("/retailers")}
                                >
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
        <div className="place-sales-order">
            {/* Desktop Header - Only shown on desktop */}
            {!isMobileView && (
                <div className="place-order-desktop-header">
                    <div className="desktop-header-content">
                        <div className="desktop-header-left">
                            <button
                                className="desktop-back-btn"
                                onClick={() => navigate("/retailers")}
                            >
                                ← Back to Retailers
                            </button>
                            <div className="desktop-header-text">
                                <h1>
                                    Place Sales Order
                                    {displayName && <span className="display-name-header"> for {displayName}</span>}
                                </h1>
                                {retailerInfo.name && (
                                    <div className="desktop-retailer-info">
                                        <p className="retailer-name">For: {retailerInfo.name}</p>
                                        {/* Display the display name from retailers table */}
                                        {displayName && (
                                            <p className="retailer-display-name">
                                                <strong>Display Name:</strong> {displayName}
                                            </p>
                                        )}
                                        {retailerInfo.business && (
                                            <p className="retailer-business">Business: {retailerInfo.business}</p>
                                        )}
                                        {retailerInfo.location && (
                                            <p className="retailer-location">Location: {retailerInfo.location}</p>
                                        )}
                                        {retailerInfo.discount > 0 && (
                                            <p className="retailer-discount">Discount: {retailerInfo.discount}%</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="desktop-header-right">
                            <div className="desktop-cart-summary">
                                <div className="cart-summary-header">
                                    <h3>Order Summary</h3>
                                    <Link
                                        to="/retailers/cart"
                                        state={{
                                            retailerId,
                                            discount: retailerInfo.discount,
                                            customerName: retailerInfo.name,
                                            displayName: retailerInfo.displayName || displayName
                                        }}
                                        className="desktop-cart-link"
                                    >
                                        View Cart ({cartCount}) {/* Only show count like reference code */}
                                    </Link>
                                </div>

                                {cartCount === 0 ? (
                                    <div className="empty-cart-summary">
                                        <p>No items in cart</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Simplified cart items display - similar to reference code approach */}
                                        <div className="cart-summary-items">
                                            {cart.slice(0, 3).map(item => (
                                                <div key={item.id} className="summary-item">
                                                    <span className="item-name">{item.product_name || 'Product'}</span>
                                                    <span className="item-qty">x{item.quantity || 1}</span>
                                                </div>
                                            ))}
                                            {cart.length > 3 && (
                                                <div className="more-items">
                                                    +{cart.length - 3} more items
                                                </div>
                                            )}
                                        </div>

                                        {/* REMOVED detailed total calculations to match reference code */}
                                        {/* Reference code doesn't show subtotal/discount/total in the header */}

                                        <Link
                                            to="/retailers/cart"
                                            state={{
                                                retailerId,
                                                discount: retailerInfo.discount,
                                                customerName: retailerInfo.name,
                                                displayName: retailerInfo.displayName || displayName
                                            }}
                                            className="desktop-place-order-btn"
                                        >
                                            Proceed to Checkout
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Header - Only shown on mobile */}
            {isMobileView && (
                <div className="place-order-mobile-header">
                    <div className="mobile-header-content">
                        <div className="mobile-header-main">
                            <button
                                className="mobile-back-btn"
                                onClick={() => navigate("/retailers")}
                            >
                                ← Back
                            </button>
                            <div className="mobile-header-text">
                                <h1>Place Sales Order</h1>
                                {retailerInfo.name && (
                                    <div>
                                        <p className="mobile-retailer-name">For: {retailerInfo.name}</p>
                                        {/* Display display name in mobile view too */}
                                        {displayName && (
                                            <p className="mobile-retailer-display-name">
                                                (Display: {displayName})
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Link
                            to="/retailers/cart"
                            state={{
                                retailerId,
                                discount: retailerInfo.discount,
                                customerName: retailerInfo.name,
                                displayName: retailerInfo.displayName || displayName
                            }}
                            className="mobile-cart-btn"
                        >
                            🛒
                            {cartCount > 0 && (
                                <span className="mobile-cart-count">{cartCount}</span>
                            )}
                        </Link>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="place-order-main-content">
                {/* Category Slider */}
                <div className="category-slider-container">
                    <div className="category-slider">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`category-chip ${selectedCategory === 'all'
                                    ? 'category-chip-active'
                                    : 'category-chip-inactive'
                                }`}
                        >
                            All
                        </button>

                        {categoriesLoading ? (
                            <div className="categories-loading">
                                {[1, 2, 3, 4].map((item) => (
                                    <div
                                        key={item}
                                        className="category-chip category-chip-loading"
                                    >
                                        <span className="invisible">Loading...</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            categoriesList.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`category-chip ${selectedCategory === category.id
                                            ? 'category-chip-active'
                                            : 'category-chip-inactive'
                                        }`}
                                >
                                    {category.icon} {category.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Search Section */}
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Search products by name, category, or supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    {searchTerm && (
                        <div className="search-results-summary">
                            <div className="search-summary-content">
                                <p className="search-results-count">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} for "{searchTerm}"
                                </p>
                                {filteredProducts.length === 0 && products.length > 0 && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="clear-search-btn"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Products Section */}
                <div className="products-section">
                    <div className="section-header">
                        <h2>
                            Available Products ({filteredProducts.length})
                            {selectedCategory !== 'all' && (
                                <span className="category-filter-indicator">
                                    in {categoriesList.find(cat => cat.id === selectedCategory)?.name || selectedCategory}
                                </span>
                            )}
                        </h2>
                    </div>

                    {loading && <div className="loading-state">Loading products...</div>}
                    {error && <div className="error-state">{error}</div>}

                    <div className="products-grid">
                        {!loading && filteredProducts.length === 0 && !error && (
                            <div className="no-products">
                                <p>No products found</p>
                                {searchTerm ? (
                                    <p className="no-results-detail">
                                        No results for "{searchTerm}" in {selectedCategory === 'all' ? 'all categories' : 'this category'}
                                    </p>
                                ) : (
                                    <p className="no-results-detail">Try selecting a different category</p>
                                )}
                                <div className="no-results-actions">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className="action-btn primary-action"
                                    >
                                        View All Products
                                    </button>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="action-btn secondary-action"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {!loading && filteredProducts.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="product-category">{product.category}</p>
                                    <p className="product-price">₹{parseFloat(product.price || 0).toLocaleString()} / {product.unit || 'unit'}</p>
                                    <div className="product-stock-info">
                                        <p className="product-gst">GST: {product.gst_rate || 0}%</p>
                                        {product.balance_stock && (
                                            <p className="stock-indicator">
                                                Stock: {product.balance_stock}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => addToCart(product)}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // Return with layout for desktop, without layout for mobile
    if (isMobileView) {
        return mainContent;
    } else {
        return (
            <div className="place-sales-order-wrapper">
                <AdminSidebar
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    onToggleMobile={isMobileOpen}
                />
                <div className={`place-sales-order-content-area ${isCollapsed ? "collapsed" : ""}`}>
                    <AdminHeader
                        isCollapsed={isCollapsed}
                        onToggleSidebar={handleToggleMobile}
                    />
                    <div className="place-sales-order-main-content">
                        {mainContent}
                    </div>
                </div>
            </div>
        );
    }
}

export default PlaceSalesOrder;