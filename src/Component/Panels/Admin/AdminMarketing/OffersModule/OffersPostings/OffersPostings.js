import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../../../Shared/AdminSidebar/AdminHeader";
import "./OffersPostings.css";

function OffersPostings() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("regular"); // "regular" or "flash"
  const [offers, setOffers] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [editingFlashSale, setEditingFlashSale] = useState(null);
  const [offerType, setOfferType] = useState("global");
  const [flashSaleType, setFlashSaleType] = useState("bogo");
  const offersPerPage = 5;

  // Regular Offers Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    validFrom: "",
    validUntil: "",
    image: null,
    category: "",
    productName: "",
    minimumPurchase: "",
    maxDiscount: "",
    termsConditions: ""
  });

  // Flash Sales Form State
  const [flashSaleData, setFlashSaleData] = useState({
    title: "",
    description: "",
    flashSaleType: "bogo",
    products: [],
    validFrom: "",
    validUntil: "",
    startTime: "",
    endTime: "",
    image: null,
    discountValue: "",
    buyQuantity: 1,
    getQuantity: 1,
    expiryThreshold: 7,
    stockLimit: "",
    purchaseLimit: 1,
    termsConditions: ""
  });

  const categories = [
    "Electronics", "Clothing", "Groceries", "Home & Kitchen", 
    "Beauty", "Sports", "Books", "Automotive"
  ];

  const flashSaleTypes = [
    { value: "bogo", label: "Buy One Get One", description: "Buy X get Y free" },
    { value: "expiry", label: "Near Expiry", description: "Discounts on expiring products" },
    { value: "clearance", label: "Clearance Sale", description: "Stock clearance discounts" },
    { value: "seasonal", label: "Seasonal Flash", description: "Seasonal product discounts" },
    { value: "hourly", label: "Hourly Deal", description: "Limited time hourly discounts" },
    { value: "limited_stock", label: "Limited Stock", description: "Limited quantity offers" }
  ];

  // Sample products data
  const sampleProducts = [
    { id: 1, name: "Premium Olive Oil", category: "Groceries", expiryDate: "2024-12-31", currentStock: 150 },
    { id: 2, name: "Organic Milk", category: "Groceries", expiryDate: "2024-06-15", currentStock: 45 },
    { id: 3, name: "Wireless Headphones", category: "Electronics", expiryDate: null, currentStock: 200 },
    { id: 4, name: "Yoga Mat", category: "Sports", expiryDate: null, currentStock: 75 },
    { id: 5, name: "Face Cream", category: "Beauty", expiryDate: "2024-08-20", currentStock: 120 }
  ];

  useEffect(() => {
    // Sample regular offers
    const sampleOffers = [
      {
        id: 1,
        title: "Summer Sale",
        description: "Get amazing discounts on all products",
        discountType: "percentage",
        discountValue: 15,
        validFrom: "2024-06-01",
        validUntil: "2024-06-30",
        image: "summer-sale.jpg",
        offerType: "global",
        status: "active",
        createdAt: "2024-05-20"
      },
      {
        id: 2,
        title: "Electronics Special",
        description: "Special discount on electronics category",
        discountType: "fixed",
        discountValue: 500,
        validFrom: "2024-06-01",
        validUntil: "2024-06-15",
        image: "electronics-offer.jpg",
        offerType: "category",
        category: "Electronics",
        productName: "All Electronics",
        minimumPurchase: 1000,
        maxDiscount: 1000,
        termsConditions: "Valid on purchases above ₹1000",
        status: "active",
        createdAt: "2024-05-25"
      }
    ];

    // Sample flash sales
    const sampleFlashSales = [
      {
        id: 1,
        title: "Buy 1 Get 1 Free - Dairy",
        description: "Get free dairy products on purchase",
        flashSaleType: "bogo",
        products: [2],
        validFrom: "2024-06-01",
        validUntil: "2024-06-03",
        startTime: "09:00",
        endTime: "18:00",
        discountValue: "100",
        buyQuantity: 1,
        getQuantity: 1,
        status: "active",
        purchaseLimit: 2,
        createdAt: "2024-05-25"
      },
      {
        id: 2,
        title: "Near Expiry Discounts",
        description: "Special discounts on products expiring soon",
        flashSaleType: "expiry",
        products: [2, 5],
        validFrom: "2024-06-01",
        validUntil: "2024-06-05",
        startTime: "00:00",
        endTime: "23:59",
        discountValue: "30",
        expiryThreshold: 30,
        status: "active",
        createdAt: "2024-05-26"
      }
    ];

    setOffers(sampleOffers);
    setFlashSales(sampleFlashSales);
  }, []);

  // Regular Offers Handlers
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newOffer = {
      id: editingOffer ? editingOffer.id : Date.now(),
      ...formData,
      offerType,
      status: "active",
      createdAt: editingOffer ? editingOffer.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingOffer) {
      setOffers(offers.map(offer => offer.id === editingOffer.id ? newOffer : offer));
    } else {
      setOffers([...offers, newOffer]);
    }

    handleCloseModal();
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setOfferType(offer.offerType);
    setFormData({
      title: offer.title,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      validFrom: offer.validFrom,
      validUntil: offer.validUntil,
      image: offer.image,
      category: offer.category || "",
      productName: offer.productName || "",
      minimumPurchase: offer.minimumPurchase || "",
      maxDiscount: offer.maxDiscount || "",
      termsConditions: offer.termsConditions || ""
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      setOffers(offers.filter(offer => offer.id !== id));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOffer(null);
    setFormData({
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      validFrom: "",
      validUntil: "",
      image: null,
      category: "",
      productName: "",
      minimumPurchase: "",
      maxDiscount: "",
      termsConditions: ""
    });
  };

  const toggleOfferStatus = (id) => {
    setOffers(offers.map(offer => 
      offer.id === id 
        ? { ...offer, status: offer.status === "active" ? "inactive" : "active" }
        : offer
    ));
  };

  // Flash Sales Handlers
  const handleFlashSaleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFlashSaleData(prev => ({ ...prev, image: files[0] }));
    } else if (name === "products") {
      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setFlashSaleData(prev => ({ ...prev, products: selectedOptions }));
    } else {
      setFlashSaleData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFlashSaleSubmit = (e) => {
    e.preventDefault();
    
    const newFlashSale = {
      id: editingFlashSale ? editingFlashSale.id : Date.now(),
      ...flashSaleData,
      status: "active",
      createdAt: editingFlashSale ? editingFlashSale.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingFlashSale) {
      setFlashSales(flashSales.map(sale => sale.id === editingFlashSale.id ? newFlashSale : sale));
    } else {
      setFlashSales([...flashSales, newFlashSale]);
    }

    handleCloseFlashSaleModal();
  };

  const handleEditFlashSale = (sale) => {
    setEditingFlashSale(sale);
    setFlashSaleType(sale.flashSaleType);
    setFlashSaleData({
      title: sale.title,
      description: sale.description,
      flashSaleType: sale.flashSaleType,
      products: sale.products || [],
      validFrom: sale.validFrom,
      validUntil: sale.validUntil,
      startTime: sale.startTime,
      endTime: sale.endTime,
      image: sale.image,
      discountValue: sale.discountValue || "",
      buyQuantity: sale.buyQuantity || 1,
      getQuantity: sale.getQuantity || 1,
      expiryThreshold: sale.expiryThreshold || 7,
      stockLimit: sale.stockLimit || "",
      purchaseLimit: sale.purchaseLimit || 1,
      termsConditions: sale.termsConditions || ""
    });
    setShowFlashSaleModal(true);
  };

  const handleDeleteFlashSale = (id) => {
    if (window.confirm("Are you sure you want to delete this flash sale?")) {
      setFlashSales(flashSales.filter(sale => sale.id !== id));
    }
  };

  const handleCloseFlashSaleModal = () => {
    setShowFlashSaleModal(false);
    setEditingFlashSale(null);
    setFlashSaleData({
      title: "",
      description: "",
      flashSaleType: "bogo",
      products: [],
      validFrom: "",
      validUntil: "",
      startTime: "",
      endTime: "",
      image: null,
      discountValue: "",
      buyQuantity: 1,
      getQuantity: 1,
      expiryThreshold: 7,
      stockLimit: "",
      purchaseLimit: 1,
      termsConditions: ""
    });
  };

  const toggleFlashSaleStatus = (id) => {
    setFlashSales(flashSales.map(sale => 
      sale.id === id 
        ? { ...sale, status: sale.status === "active" ? "inactive" : "active" }
        : sale
    ));
  };

  // Get products near expiry for suggestions
  const getNearExpiryProducts = () => {
    const threshold = parseInt(flashSaleData.expiryThreshold) || 7;
    const today = new Date();
    return sampleProducts.filter(product => {
      if (!product.expiryDate) return false;
      const expiryDate = new Date(product.expiryDate);
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= threshold && diffDays >= 0;
    });
  };

  // Filter and Pagination Logic
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || offer.offerType === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredFlashSales = flashSales.filter((sale) => {
    return sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           sale.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const currentItems = activeTab === "regular" ? filteredOffers : filteredFlashSales;
  const totalPages = Math.ceil(currentItems.length / offersPerPage);
  const indexOfLastItem = currentPage * offersPerPage;
  const indexOfFirstItem = indexOfLastItem - offersPerPage;
  const currentItemsPage = currentItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Render Flash Sale Form
  const renderFlashSaleForm = () => {
    const nearExpiryProducts = getNearExpiryProducts();
    
    return (
      <form onSubmit={handleFlashSaleSubmit} className="offers-form">
        {/* Flash Sale Type */}
        <div className="offers-form-group">
          <label className="offers-form-label">Flash Sale Type *</label>
          <div className="offers-flash-types-grid">
            {flashSaleTypes.map(type => (
              <div
                key={type.value}
                className={`offers-flash-type-card ${flashSaleType === type.value ? 'offers-flash-type-active' : ''}`}
                onClick={() => {
                  setFlashSaleType(type.value);
                  setFlashSaleData(prev => ({ ...prev, flashSaleType: type.value }));
                }}
              >
                <div className="offers-flash-type-icon">
                  {type.value === 'bogo' && '🎁'}
                  {type.value === 'expiry' && '⏰'}
                  {type.value === 'clearance' && '🏷️'}
                  {type.value === 'seasonal' && '🌞'}
                  {type.value === 'hourly' && '🕒'}
                  {type.value === 'limited_stock' && '📦'}
                </div>
                <div className="offers-flash-type-info">
                  <div className="offers-flash-type-title">{type.label}</div>
                  <div className="offers-flash-type-desc">{type.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="offers-form-row">
          <div className="offers-form-group">
            <label className="offers-form-label">Flash Sale Title *</label>
            <input
              type="text"
              name="title"
              value={flashSaleData.title}
              onChange={handleFlashSaleInputChange}
              className="offers-form-input"
              required
              placeholder="e.g., Weekend BOGO Sale"
            />
          </div>
        </div>

        <div className="offers-form-group">
          <label className="offers-form-label">Description *</label>
          <textarea
            name="description"
            value={flashSaleData.description}
            onChange={handleFlashSaleInputChange}
            className="offers-form-textarea"
            rows="2"
            required
            placeholder="Describe the flash sale..."
          />
        </div>

        {/* Products Selection */}
        <div className="offers-form-group">
          <label className="offers-form-label">
            Select Products *
            {flashSaleType === 'expiry' && nearExpiryProducts.length > 0 && (
              <span className="offers-suggestion-note">
                ({nearExpiryProducts.length} products expiring within {flashSaleData.expiryThreshold} days)
              </span>
            )}
          </label>
          <select
            name="products"
            multiple
            value={flashSaleData.products}
            onChange={handleFlashSaleInputChange}
            className="offers-form-select offers-form-multiselect"
            required
            size="4"
          >
            {sampleProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.category}
                {product.expiryDate && ` (Expires: ${product.expiryDate})`}
                {product.currentStock && ` - Stock: ${product.currentStock}`}
              </option>
            ))}
          </select>
          <div className="offers-selected-count">
            {flashSaleData.products.length} product(s) selected
          </div>
        </div>

        {/* Flash Sale Specific Fields */}
        <div className="offers-form-row">
          {flashSaleType === 'bogo' && (
            <>
              <div className="offers-form-group">
                <label className="offers-form-label">Buy Quantity *</label>
                <input
                  type="number"
                  name="buyQuantity"
                  value={flashSaleData.buyQuantity}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  required
                />
              </div>
              <div className="offers-form-group">
                <label className="offers-form-label">Get Quantity Free *</label>
                <input
                  type="number"
                  name="getQuantity"
                  value={flashSaleData.getQuantity}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  required
                />
              </div>
            </>
          )}

          {flashSaleType === 'expiry' && (
            <>
              <div className="offers-form-group">
                <label className="offers-form-label">Discount Percentage *</label>
                <input
                  type="number"
                  name="discountValue"
                  value={flashSaleData.discountValue}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  max="100"
                  required
                  placeholder="e.g., 30"
                />
              </div>
              <div className="offers-form-group">
                <label className="offers-form-label">Expiry Threshold (Days) *</label>
                <input
                  type="number"
                  name="expiryThreshold"
                  value={flashSaleData.expiryThreshold}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  max="365"
                  required
                />
              </div>
            </>
          )}

          {(flashSaleType === 'clearance' || flashSaleType === 'seasonal' || flashSaleType === 'hourly') && (
            <div className="offers-form-group">
              <label className="offers-form-label">Discount Percentage *</label>
              <input
                type="number"
                name="discountValue"
                value={flashSaleData.discountValue}
                onChange={handleFlashSaleInputChange}
                className="offers-form-input"
                min="1"
                max="100"
                required
              />
            </div>
          )}

          {flashSaleType === 'limited_stock' && (
            <>
              <div className="offers-form-group">
                <label className="offers-form-label">Discount Percentage *</label>
                <input
                  type="number"
                  name="discountValue"
                  value={flashSaleData.discountValue}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div className="offers-form-group">
                <label className="offers-form-label">Stock Limit</label>
                <input
                  type="number"
                  name="stockLimit"
                  value={flashSaleData.stockLimit}
                  onChange={handleFlashSaleInputChange}
                  className="offers-form-input"
                  min="1"
                  placeholder="Leave empty for no limit"
                />
              </div>
            </>
          )}
        </div>

        {/* Date & Time */}
        <div className="offers-form-row">
          <div className="offers-form-group">
            <label className="offers-form-label">Start Date *</label>
            <input
              type="date"
              name="validFrom"
              value={flashSaleData.validFrom}
              onChange={handleFlashSaleInputChange}
              className="offers-form-input"
              required
            />
          </div>
          <div className="offers-form-group">
            <label className="offers-form-label">End Date *</label>
            <input
              type="date"
              name="validUntil"
              value={flashSaleData.validUntil}
              onChange={handleFlashSaleInputChange}
              className="offers-form-input"
              required
            />
          </div>
        </div>

        <div className="offers-form-row">
          <div className="offers-form-group">
            <label className="offers-form-label">Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={flashSaleData.startTime}
              onChange={handleFlashSaleInputChange}
              className="offers-form-input"
              required
            />
          </div>
          <div className="offers-form-group">
            <label className="offers-form-label">End Time *</label>
            <input
              type="time"
              name="endTime"
              value={flashSaleData.endTime}
              onChange={handleFlashSaleInputChange}
              className="offers-form-input"
              required
            />
          </div>
        </div>

        {/* Purchase Limit */}
        <div className="offers-form-group">
          <label className="offers-form-label">Purchase Limit per Customer</label>
          <input
            type="number"
            name="purchaseLimit"
            value={flashSaleData.purchaseLimit}
            onChange={handleFlashSaleInputChange}
            className="offers-form-input"
            min="1"
            placeholder="Maximum quantity a customer can purchase"
          />
        </div>

        {/* Additional Fields */}
        <div className="offers-form-group">
          <label className="offers-form-label">Terms & Conditions</label>
          <textarea
            name="termsConditions"
            value={flashSaleData.termsConditions}
            onChange={handleFlashSaleInputChange}
            className="offers-form-textarea"
            rows="2"
            placeholder="Enter terms and conditions for this flash sale..."
          />
        </div>

        <div className="offers-form-group">
          <label className="offers-form-label">Flash Sale Image</label>
          <input
            type="file"
            name="image"
            onChange={handleFlashSaleInputChange}
            className="offers-form-file"
            accept="image/*"
          />
        </div>

        <div className="offers-form-actions">
          <button 
            type="button" 
            onClick={handleCloseFlashSaleModal} 
            className="offers-btn-cancel"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="offers-btn-submit"
          >
            {editingFlashSale ? 'Update Flash Sale' : 'Create Flash Sale'}
          </button>
        </div>
      </form>
    );
  };

  // Render Regular Offer Form
  const renderRegularOfferForm = () => (
    <form onSubmit={handleSubmit} className="offers-form">
      {/* Offer Type Selection */}
      <div className="offers-form-group">
        <label className="offers-form-label">Offer Type *</label>
        <div className="offers-type-selector">
          <button
            type="button"
            className={`offers-type-btn ${offerType === 'global' ? 'offers-type-active' : ''}`}
            onClick={() => setOfferType('global')}
          >
            Global Offer (All Products)
          </button>
          <button
            type="button"
            className={`offers-type-btn ${offerType === 'category' ? 'offers-type-active' : ''}`}
            onClick={() => setOfferType('category')}
          >
            Category Specific
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="offers-form-row">
        <div className="offers-form-group">
          <label className="offers-form-label">Offer Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="offers-form-input"
            required
          />
        </div>
        
        <div className="offers-form-group">
          <label className="offers-form-label">Discount Type *</label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleInputChange}
            className="offers-form-select"
            required
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
        </div>
      </div>

      <div className="offers-form-row">
        <div className="offers-form-group">
          <label className="offers-form-label">
            {formData.discountType === 'percentage' 
              ? 'Discount Percentage *' 
              : 'Discount Amount (₹) *'}
          </label>
          <input
            type="number"
            name="discountValue"
            value={formData.discountValue}
            onChange={handleInputChange}
            className="offers-form-input"
            min="0"
            max={formData.discountType === 'percentage' ? '100' : ''}
            required
          />
        </div>

        {formData.discountType === 'percentage' && (
          <div className="offers-form-group">
            <label className="offers-form-label">Maximum Discount (₹)</label>
            <input
              type="number"
              name="maxDiscount"
              value={formData.maxDiscount}
              onChange={handleInputChange}
              className="offers-form-input"
              min="0"
            />
          </div>
        )}
      </div>

      {/* Category Specific Fields */}
      {offerType === 'category' && (
        <>
          <div className="offers-form-row">
            <div className="offers-form-group">
              <label className="offers-form-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="offers-form-select"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="offers-form-group">
              <label className="offers-form-label">Product Name</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="offers-form-input"
                placeholder="Specific product or 'All products in category'"
              />
            </div>
          </div>

          <div className="offers-form-group">
            <label className="offers-form-label">Minimum Purchase Amount (₹)</label>
            <input
              type="number"
              name="minimumPurchase"
              value={formData.minimumPurchase}
              onChange={handleInputChange}
              className="offers-form-input"
              min="0"
            />
          </div>
        </>
      )}

      {/* Validity Period */}
      <div className="offers-form-row">
        <div className="offers-form-group">
          <label className="offers-form-label">Valid From *</label>
          <input
            type="date"
            name="validFrom"
            value={formData.validFrom}
            onChange={handleInputChange}
            className="offers-form-input"
            required
          />
        </div>
        
        <div className="offers-form-group">
          <label className="offers-form-label">Valid Until *</label>
          <input
            type="date"
            name="validUntil"
            value={formData.validUntil}
            onChange={handleInputChange}
            className="offers-form-input"
            required
          />
        </div>
      </div>

      {/* Additional Fields */}
      <div className="offers-form-group">
        <label className="offers-form-label">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="offers-form-textarea"
          rows="3"
          required
        />
      </div>

      <div className="offers-form-group">
        <label className="offers-form-label">Terms & Conditions</label>
        <textarea
          name="termsConditions"
          value={formData.termsConditions}
          onChange={handleInputChange}
          className="offers-form-textarea"
          rows="2"
          placeholder="Enter terms and conditions for this offer..."
        />
      </div>

      <div className="offers-form-group">
        <label className="offers-form-label">Offer Image</label>
        <input
          type="file"
          name="image"
          onChange={handleInputChange}
          className="offers-form-file"
          accept="image/*"
        />
      </div>

      <div className="offers-form-actions">
        <button type="button" onClick={handleCloseModal} className="offers-btn-cancel">
          Cancel
        </button>
        <button type="submit" className="offers-btn-submit">
          {editingOffer ? 'Update Offer' : 'Create Offer'}
        </button>
      </div>
    </form>
  );

  // Render Flash Sale Card
  const renderFlashSaleCard = (sale) => {
    const getFlashSaleDescription = () => {
      switch (sale.flashSaleType) {
        case 'bogo':
          return `Buy ${sale.buyQuantity} Get ${sale.getQuantity} Free`;
        case 'expiry':
          return `${sale.discountValue}% off - Expiring within ${sale.expiryThreshold} days`;
        case 'clearance':
          return `${sale.discountValue}% off - Clearance Sale`;
        case 'seasonal':
          return `${sale.discountValue}% off - Seasonal Offer`;
        case 'hourly':
          return `${sale.discountValue}% off - Hourly Deal`;
        case 'limited_stock':
          return `${sale.discountValue}% off - Limited Stock`;
        default:
          return sale.description;
      }
    };

    return (
      <div key={sale.id} className={`offers-card-item offers-flash-sale-card ${sale.status}`}>
        <div className="offers-flash-badge">FLASH SALE</div>
        <div className="offers-card-image">
          {sale.image ? (
            <img src={sale.image} alt={sale.title} />
          ) : (
            <div className="offers-no-image">Flash Sale</div>
          )}
        </div>
        
        <div className="offers-card-content">
          <div className="offers-card-header">
            <h3 className="offers-card-title">{sale.title}</h3>
            <span className={`offers-status-badge ${sale.status}`}>
              {sale.status}
            </span>
          </div>
          
          <p className="offers-card-desc">{sale.description}</p>
          
          <div className="offers-details-list">
            <div className="offers-detail-item">
              <strong>Type:</strong> 
              {flashSaleTypes.find(t => t.value === sale.flashSaleType)?.label}
            </div>
            
            <div className="offers-detail-item">
              <strong>Offer:</strong> {getFlashSaleDescription()}
            </div>
            
            <div className="offers-detail-item">
              <strong>Timing:</strong> {sale.startTime} - {sale.endTime}
            </div>
            
            <div className="offers-detail-item">
              <strong>Valid:</strong> {sale.validFrom} to {sale.validUntil}
            </div>

            {sale.purchaseLimit > 1 && (
              <div className="offers-detail-item">
                <strong>Limit:</strong> {sale.purchaseLimit} per customer
              </div>
            )}
          </div>

          <div className="offers-card-actions">
            <button 
              className="offers-btn-edit"
              onClick={() => handleEditFlashSale(sale)}
            >
              Edit
            </button>
            <button 
              className="offers-btn-delete"
              onClick={() => handleDeleteFlashSale(sale.id)}
            >
              Delete
            </button>
            <button 
              className={`offers-btn-status ${sale.status}`}
              onClick={() => toggleFlashSaleStatus(sale.id)}
            >
              {sale.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Regular Offer Card
  const renderRegularOfferCard = (offer) => (
    <div key={offer.id} className={`offers-card-item ${offer.status}`}>
      <div className="offers-card-image">
        {offer.image ? (
          <img src={offer.image} alt={offer.title} />
        ) : (
          <div className="offers-no-image">No Image</div>
        )}
      </div>
      
      <div className="offers-card-content">
        <div className="offers-card-header">
          <h3 className="offers-card-title">{offer.title}</h3>
          <span className={`offers-status-badge ${offer.status}`}>
            {offer.status}
          </span>
        </div>
        
        <p className="offers-card-desc">{offer.description}</p>
        
        <div className="offers-details-list">
          <div className="offers-detail-item">
            <strong>Discount:</strong> 
            {offer.discountType === 'percentage' 
              ? `${offer.discountValue}%` 
              : `₹${offer.discountValue}`}
          </div>
          
          {offer.offerType === 'category' && (
            <>
              <div className="offers-detail-item">
                <strong>Category:</strong> {offer.category}
              </div>
              {offer.minimumPurchase && (
                <div className="offers-detail-item">
                  <strong>Min Purchase:</strong> ₹{offer.minimumPurchase}
                </div>
              )}
            </>
          )}
          
          <div className="offers-detail-item">
            <strong>Valid:</strong> {offer.validFrom} to {offer.validUntil}
          </div>
        </div>

        <div className="offers-card-actions">
          <button 
            className="offers-btn-edit"
            onClick={() => handleEdit(offer)}
          >
            Edit
          </button>
          <button 
            className="offers-btn-delete"
            onClick={() => handleDelete(offer.id)}
          >
            Delete
          </button>
          <button 
            className={`offers-btn-status ${offer.status}`}
            onClick={() => toggleOfferStatus(offer.id)}
          >
            {offer.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="offers-postings-page">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`offers-postings-main ${isCollapsed ? "sidebar-collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="offers-postings-container">
          {/* Header Section */}
          <div className="offers-postings-header">
            <div className="offers-header-left">
              {/* <button className="offers-back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button> */}
              <h1 className="offers-main-title">Offers & Flash Sales</h1>
            </div>
            <button 
              className="offers-add-btn"
              onClick={() => activeTab === "regular" ? setShowModal(true) : setShowFlashSaleModal(true)}
            >
              + Add {activeTab === "regular" ? "Offer" : "Flash Sale"}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="offers-tab-navigation">
            <button 
              className={`offers-tab-btn ${activeTab === "regular" ? "offers-tab-active" : ""}`}
              onClick={() => setActiveTab("regular")}
            >
              Regular Offers
            </button>
            <button 
              className={`offers-tab-btn ${activeTab === "flash" ? "offers-tab-active" : ""}`}
              onClick={() => setActiveTab("flash")}
            >
              Flash Sales
            </button>
          </div>

          {/* Filters Section */}
          <div className="offers-filters-section">
            <div className="offers-search-box">
              <input
                type="text"
                placeholder={`Search ${activeTab === "regular" ? "offers" : "flash sales"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="offers-search-input"
              />
              <span className="offers-search-icon">🔍</span>
            </div>
            
            {activeTab === "regular" && (
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="offers-filter-select"
              >
                <option value="All">All Offers</option>
                <option value="global">Global Offers</option>
                <option value="category">Category Specific</option>
              </select>
            )}
          </div>

          {/* Content based on active tab */}
          <div className="offers-cards-grid">
            {currentItemsPage.length > 0 ? (
              currentItemsPage.map(item => 
                activeTab === "regular" 
                  ? renderRegularOfferCard(item)
                  : renderFlashSaleCard(item)
              )
            ) : (
              <div className="offers-empty-state">
                <div className="offers-empty-icon">📋</div>
                <h3>No {activeTab === "regular" ? "offers" : "flash sales"} found</h3>
                <p>
                  {searchTerm 
                    ? `No ${activeTab === "regular" ? "offers" : "flash sales"} match your search criteria.`
                    : `Get started by creating your first ${activeTab === "regular" ? "offer" : "flash sale"}.`
                  }
                </p>
                <button 
                  className="offers-add-btn"
                  onClick={() => activeTab === "regular" ? setShowModal(true) : setShowFlashSaleModal(true)}
                >
                  + Add {activeTab === "regular" ? "Offer" : "Flash Sale"}
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && currentItems.length > 0 && (
            <div className="offers-pagination">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="offers-pagination-btn"
              >
                Previous
              </button>
              <span className="offers-pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="offers-pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Regular Offer Modal */}
        {showModal && (
          <div className="offers-modal-overlay">
            <div className="offers-modal-content">
              <div className="offers-modal-header">
                <h2 className="offers-modal-title">
                  {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                </h2>
                <button className="offers-close-btn" onClick={handleCloseModal}>×</button>
              </div>
              {renderRegularOfferForm()}
            </div>
          </div>
        )}

        {/* Flash Sale Modal */}
        {showFlashSaleModal && (
          <div className="offers-modal-overlay">
            <div className="offers-modal-content offers-flash-modal">
              <div className="offers-modal-header">
                <h2 className="offers-modal-title">
                  {editingFlashSale ? 'Edit Flash Sale' : 'Create Flash Sale'}
                </h2>
                <button className="offers-close-btn" onClick={handleCloseFlashSaleModal}>×</button>
              </div>
              {renderFlashSaleForm()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OffersPostings;