import React, { useState, useEffect } from "react";

function CreateFlashSale({ editingFlashSale, onBack, onSuccess }) {
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

  const flashSaleTypes = [
    { value: "bogo", label: "Buy One Get One", description: "Buy X get Y free" },
    { value: "expiry", label: "Near Expiry", description: "Discounts on expiring products" },
    { value: "clearance", label: "Clearance Sale", description: "Stock clearance discounts" },
    { value: "seasonal", label: "Seasonal Flash", description: "Seasonal product discounts" },
    { value: "hourly", label: "Hourly Deal", description: "Limited time hourly discounts" },
    { value: "limited_stock", label: "Limited Stock", description: "Limited quantity offers" }
  ];

  const sampleProducts = [
    { id: 1, name: "Premium Olive Oil", category: "Groceries", expiryDate: "2024-12-31", currentStock: 150 },
    { id: 2, name: "Organic Milk", category: "Groceries", expiryDate: "2024-06-15", currentStock: 45 },
    { id: 3, name: "Wireless Headphones", category: "Electronics", expiryDate: null, currentStock: 200 },
    { id: 4, name: "Yoga Mat", category: "Sports", expiryDate: null, currentStock: 75 },
    { id: 5, name: "Face Cream", category: "Beauty", expiryDate: "2024-08-20", currentStock: 120 }
  ];

  useEffect(() => {
    if (editingFlashSale) {
      setFlashSaleData({
        title: editingFlashSale.title,
        description: editingFlashSale.description,
        flashSaleType: editingFlashSale.flashSaleType,
        products: editingFlashSale.products || [],
        validFrom: editingFlashSale.validFrom,
        validUntil: editingFlashSale.validUntil,
        startTime: editingFlashSale.startTime,
        endTime: editingFlashSale.endTime,
        image: editingFlashSale.image,
        discountValue: editingFlashSale.discountValue || "",
        buyQuantity: editingFlashSale.buyQuantity || 1,
        getQuantity: editingFlashSale.getQuantity || 1,
        expiryThreshold: editingFlashSale.expiryThreshold || 7,
        stockLimit: editingFlashSale.stockLimit || "",
        purchaseLimit: editingFlashSale.purchaseLimit || 1,
        termsConditions: editingFlashSale.termsConditions || ""
      });
    }
  }, [editingFlashSale]);

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
    
    // Here you would typically make an API call to save the flash sale
    console.log("Flash sale data:", flashSaleData);
    
    // For now, just call onSuccess to go back to list
    onSuccess();
  };

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
                className={`offers-flash-type-card ${flashSaleData.flashSaleType === type.value ? 'offers-flash-type-active' : ''}`}
                onClick={() => {
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
            {flashSaleData.flashSaleType === 'expiry' && nearExpiryProducts.length > 0 && (
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
          {flashSaleData.flashSaleType === 'bogo' && (
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

          {flashSaleData.flashSaleType === 'expiry' && (
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

          {(flashSaleData.flashSaleType === 'clearance' || flashSaleData.flashSaleType === 'seasonal' || flashSaleData.flashSaleType === 'hourly') && (
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

          {flashSaleData.flashSaleType === 'limited_stock' && (
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
            onClick={onBack} 
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

  return (
    <div className="offers-create-container">
      {renderFlashSaleForm()}
    </div>
  );
}

export default CreateFlashSale;