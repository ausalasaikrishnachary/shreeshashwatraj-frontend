import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./Marketing.css";

function Marketing() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("offers");
  const [currentView, setCurrentView] = useState("marketing");
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    discountType: "",
    discountValue: "",
    minimumAmount: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: ""
  });
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: "Electronics Mega Sale",
      status: "active",
      category: "Electronics",
      description: "Flat 20% off on all electronics items above ₹10,000",
      discount: "20%",
      validFrom: "2024-01-15",
      validTill: "2024-01-31",
      minOrder: "₹10,000",
      maxDiscount: "₹5,000",
      usage: { current: 47, total: 200 }
    },
    {
      id: 2,
      title: "Flash Sale - Textiles",
      status: "expired",
      category: "Flash: Textiles",
      description: "Buy 2 Get 1 Free on textile inventory",
      discount: "Buy 2 Get 1",
      validFrom: "2024-01-16",
      validTill: "2024-01-16",
      usage: { current: 23, total: 50 }
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    
    // Create a new offer object
    const newOffer = {
      id: offers.length + 1,
      title: formData.title,
      status: "active",
      category: formData.type ? formData.type.charAt(0).toUpperCase() + formData.type.slice(1) : "General",
      description: formData.description,
      discount: formData.discountType === "percentage" 
        ? `${formData.discountValue}%` 
        : `₹${formData.discountValue}`,
      validFrom: formData.startDate,
      validTill: formData.endDate || "N/A",
      minOrder: formData.minimumAmount ? `₹${formData.minimumAmount}` : "None",
      maxDiscount: formData.maxDiscount ? `₹${formData.maxDiscount}` : "None",
      usage: { current: 0, total: parseInt(formData.usageLimit) || 999 }
    };
    
    // Add the new offer to the list
    setOffers(prevOffers => [newOffer, ...prevOffers]);
    
    // Reset form data
    setFormData({
      title: "",
      type: "",
      description: "",
      discountType: "",
      discountValue: "",
      minimumAmount: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      usageLimit: ""
    });
    
    // Go back to marketing view
    setCurrentView("marketing");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      description: "",
      discountType: "",
      discountValue: "",
      minimumAmount: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      usageLimit: ""
    });
    setCurrentView("marketing");
  };

  // Render Create Offer view
  if (currentView === "createOffer") {
    return (
      <div>
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <AdminHeader isCollapsed={isCollapsed} />
        <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
          <div className="marketing-container">
            <div className="create-offer-page">
              <div className="create-offer-form-container centered-form">
                <form onSubmit={handleCreateOffer} className="create-offer-form">
                  <h2 className="form-title">Create New Offer</h2>
                  <p className="form-subtitle">Create special offers and discounts for retailers</p>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="title">Offer Title *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter offer title"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="type">Offer Type *</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select offer type</option>
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="bogo">Buy One Get One</option>
                        <option value="free_shipping">Free Shipping</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter offer description"
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="discountType">Discount Type *</label>
                      <select
                        id="discountType"
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select discount type</option>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="discountValue">Discount Value *</label>
                      <input
                        type="number"
                        id="discountValue"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter discount value"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="minimumAmount">Minimum Amount (₹)</label>
                      <input
                        type="number"
                        id="minimumAmount"
                        name="minimumAmount"
                        value={formData.minimumAmount}
                        onChange={handleInputChange}
                        placeholder="Enter minimum amount"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="maxDiscount">Max Discount (₹)</label>
                      <input
                        type="number"
                        id="maxDiscount"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        placeholder="Enter maximum discount"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="startDate">Start Date *</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="endDate">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="usageLimit">Usage Limit</label>
                      <input
                        type="number"
                        id="usageLimit"
                        name="usageLimit"
                        value={formData.usageLimit}
                        onChange={handleInputChange}
                        placeholder="Enter usage limit"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={resetForm} className="cancel-button">
                      Cancel
                    </button>
                    <button type="submit" className="create-button">
                      Create Offer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main Marketing view
  return (
    <div>
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <AdminHeader isCollapsed={isCollapsed} />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="marketing-container">
          <div className="marketing-header">
            <h1>{activeTab === "offers" ? "Offers & Discounts" : "Marketing Campaigns"}</h1>
            <p>
              {activeTab === "offers" 
                ? "Create and manage special offers and discounts for retailers" 
                : "Manage communication campaigns to retailers"
              }
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="tabs-navigation">
            <button 
              className={`tab-button ${activeTab === "offers" ? "active" : ""}`}
              onClick={() => setActiveTab("offers")}
            >
              Offers & Discounts
            </button>
            <button 
              className={`tab-button ${activeTab === "campaigns" ? "active" : ""}`}
              onClick={() => setActiveTab("campaigns")}
            >
              Marketing Campaigns
            </button>
          </div>

          {/* Offers & Discounts Tab Content */}
          {activeTab === "offers" && (
            <div className="tab-content">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-content">
                    <h3>Active Offers</h3>
                    <div className="metric-value">{offers.filter(o => o.status === "active").length}</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-content">
                    <h3>Total Usage</h3>
                    <div className="metric-value">{offers.reduce((sum, offer) => sum + offer.usage.current, 0)}</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-content">
                    <h3>Scheduled</h3>
                    <div className="metric-value">1</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-content">
                    <h3>Campaigns Sent</h3>
                    <div className="metric-value">2</div>
                  </div>
                </div>
              </div>

              <div className="offers-section">
                <div className="section-header">
                  <button 
                    className="create-offer-btn"
                    onClick={() => setCurrentView("createOffer")}
                  >
                    + Create Offer
                  </button>
                </div>

                <div className="offers-table-container">
                  <table className="offers-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Category</th>
                        <th>Discount</th>
                        <th>Valid From</th>
                        <th>Valid Till</th>
                        <th>Min Order</th>
                        <th>Max Discount</th>
                        <th>Usage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map(offer => (
                        <tr key={offer.id}>
                          <td>
                            <div className="offer-title-cell">
                              <strong>{offer.title}</strong>
                              <span className="offer-description">{offer.description}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`offer-status ${offer.status}`}>
                              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                            </span>
                          </td>
                          <td>{offer.category}</td>
                          <td><strong>{offer.discount}</strong></td>
                          <td>{offer.validFrom}</td>
                          <td>{offer.validTill}</td>
                          <td>{offer.minOrder}</td>
                          <td>{offer.maxDiscount}</td>
                          <td>
                            <div className="usage-cell">
                              <div className="usage-text">
                                {offer.usage.current} / {offer.usage.total}
                              </div>
                              <div className="usage-bar">
                                <div 
                                  className="usage-progress" 
                                  style={{width: `${(offer.usage.current / offer.usage.total) * 100}%`}}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Marketing Campaigns Tab Content */}
          {activeTab === "campaigns" && (
            <div className="tab-content">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-content">
                    <h3>Active Offers</h3>
                    <div className="metric-value">1</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-content">
                    <h3>Total Usage</h3>
                    <div className="metric-value">70</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-content">
                    <h3>Scheduled</h3>
                    <div className="metric-value">1</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-content">
                    <h3>Campaigns Sent</h3>
                    <div className="metric-value">2</div>
                  </div>
                </div>
              </div>

              <div className="campaigns-section">
                <div className="section-header">
                  <span className="calendar-icon">📅</span>
                  <h2>Marketing Campaigns (3)</h2>
                </div>

                <div className="campaigns-table-container">
                  <table className="campaigns-table">
                    <thead>
                      <tr>
                        <th>Campaign Name</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Metrics</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Electronics Sale Announcement</strong>
                        </td>
                        <td>
                          <span className="campaign-status sent-email">Sent Email</span>
                        </td>
                        <td>Email campaign for electronics mega sale launch</td>
                        <td>Open: 68.5% • Click: 12.3%</td>
                        <td>2024-01-15</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Flash Sale Alert</strong>
                        </td>
                        <td>
                          <span className="campaign-status sent-sms">Sent SMS</span>
                        </td>
                        <td>SMS alert for textile flash sale</td>
                        <td>Open: 95.2% • Click: 34.8%</td>
                        <td>2024-01-16</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>New Year Offer Teaser</strong>
                        </td>
                        <td>
                          <span className="campaign-status scheduled-whatsapp">Scheduled WhatsApp</span>
                        </td>
                        <td>WhatsApp message for upcoming new year offer</td>
                        <td>Recipients: 156</td>
                        <td>2024-01-19</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Marketing;