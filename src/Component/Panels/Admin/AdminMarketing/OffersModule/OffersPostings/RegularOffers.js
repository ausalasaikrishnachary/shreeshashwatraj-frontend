import React, { useState } from 'react';

const RegularOffers = ({ onSubmit, onCancel, categories, editingOffer = null }) => {
  const [offerType, setOfferType] = useState(editingOffer?.offerType || 'global');
  const [formData, setFormData] = useState({
    title: editingOffer?.title || '',
    description: editingOffer?.description || '',
    discountValue: editingOffer?.discountValue || '',
    validFrom: editingOffer?.validFrom || '',
    validUntil: editingOffer?.validUntil || '',
    image: editingOffer?.image || null,
    category: editingOffer?.category || '',
    productName: editingOffer?.productName || '',
    minimumAmount: editingOffer?.minimumAmount || '0',
  });

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
    const offerData = {
      ...formData,
      offerType
    };
    
    if (editingOffer) {
      onSubmit({ ...offerData, id: editingOffer.id });
    } else {
      onSubmit(offerData);
    }
  };

  return (
    <div className="offers-form-container">
      <div className="offers-form-header">
        <h2>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>
        <button className="offers-back-btn" onClick={onCancel}>
          ← Back to Offers
        </button>
      </div>

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
              placeholder="Enter offer title"
            />
          </div>
          
          <div className="offers-form-group">
            <label className="offers-form-label">Discount Percentage *</label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleInputChange}
              className="offers-form-input"
              min="0"
              max="100"
              required
              placeholder="e.g., 15"
            />
          </div>
        </div>

        {/* Minimum Amount */}
        <div className="offers-form-group">
          <label className="offers-form-label">Minimum Amount</label>
          <input
            type="number"
            name="minimumAmount"
            value={formData.minimumAmount}
            onChange={handleInputChange}
            className="offers-form-input"
            min="0"
            placeholder="Minimum purchase amount (default: 0)"
          />
        </div>

        {/* Category Specific Fields */}
        {offerType === 'category' && (
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

        {/* Description */}
        <div className="offers-form-group">
          <label className="offers-form-label">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="offers-form-textarea"
            rows="3"
            required
            placeholder="Describe the offer..."
          />
        </div>

        {/* Image Upload */}
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
          <button type="button" onClick={onCancel} className="offers-btn-cancel">
            Cancel
          </button>
          <button type="submit" className="offers-btn-submit">
            {editingOffer ? 'Update Offer' : 'Create Offer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegularOffers;