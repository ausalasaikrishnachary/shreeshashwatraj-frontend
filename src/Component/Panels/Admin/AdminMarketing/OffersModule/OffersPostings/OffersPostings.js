import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../../../Shared/AdminSidebar/AdminHeader";
import "./OffersPostings.css";

function OffersPostings() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerType, setOfferType] = useState("global");
  const offersPerPage = 5;

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

  const categories = [
    "Electronics", "Clothing", "Groceries", "Home & Kitchen", 
    "Beauty", "Sports", "Books", "Automotive"
  ];

  useEffect(() => {
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
    setOffers(sampleOffers);
  }, []);

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

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || offer.offerType === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = filteredOffers.slice(indexOfFirstOffer, indexOfLastOffer);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="offers-postings-page">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`offers-postings-main ${isCollapsed ? "sidebar-collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="offers-postings-container">
          {/* Header Section */}
          <div className="offers-postings-header">
            <div className="offers-header-left">
              <button className="offers-back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <h1 className="offers-main-title">Offers Management</h1>
            </div>
            <button 
              className="offers-add-btn"
              onClick={() => setShowModal(true)}
            >
              + Add New Offer
            </button>
          </div>

          {/* Filters Section */}
          <div className="offers-filters-section">
            <div className="offers-search-box">
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="offers-search-input"
              />
              <span className="offers-search-icon">🔍</span>
            </div>
            
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="offers-filter-select"
            >
              <option value="All">All Offers</option>
              <option value="global">Global Offers</option>
              <option value="category">Category Specific</option>
            </select>
          </div>

          {/* Offers Grid */}
          <div className="offers-cards-grid">
            {currentOffers.map(offer => (
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
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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

        {/* Add/Edit Offer Modal */}
        {showModal && (
          <div className="offers-modal-overlay">
            <div className="offers-modal-content">
              <div className="offers-modal-header">
                <h2 className="offers-modal-title">
                  {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                </h2>
                <button className="offers-close-btn" onClick={handleCloseModal}>×</button>
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
                  <button 
                    type="button" 
                    onClick={handleCloseModal} 
                    className="offers-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="offers-btn-submit"
                  >
                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OffersPostings;