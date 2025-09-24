import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./Marketing.css";

function Marketing() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("offers");
  const navigate = useNavigate();

  // Offers data - updated with usage for second offer
  const offersData = [
    {
      id: 1,
      title: "Electronics Mega Sale",
      status: "Active",
      category: "Electronics",
      description: "Flat 20% off on all electronics items above ₹10,000",
      type: "Discount",
      discount: "20%",
      validFrom: "2024-01-15",
      validTill: "2024-01-31",
      createdBy: "Admin",
      conditions: "Minimum order: ₹ 10,000 • Max discount: ₹ 5,000",
      usage: "47 / 200"
    },
    {
      id: 2,
      title: "Flash Sale - Textiles",
      status: "Expired",
      category: "Textiles",
      flashType: "Flash",
      description: "Buy 2 Get 1 Free on textile inventory",
      type: "Discount",
      discount: "Buy 2 Get 1",
      validFrom: "2024-01-16",
      validTill: "2024-01-16",
      createdBy: "Admin",
      conditions: "",
      usage: "23 / 50"
    }
  ];

  // Campaigns data - updated with new structure
  const campaignsData = [
    {
      id: 1,
      title: "Electronics Sale Announcement",
      description: "Email campaign for electronics mega sale launch",
      status: "Send",
      type: "Email",
      recipients: "247",
      openRate: "68.5 %",
      clickRate: "12.3 %",
      date: "2024-01-15"
    },
    {
      id: 2,
      title: "Flash Sale Alert",
      description: "SMS alert for textile flash sale",
      status: "Send",
      type: "Sms",
      recipients: "89",
      openRate: "95.2 %",
      clickRate: "34.8 %",
      date: "2024-01-16"
    },
    {
      id: 3,
      title: "New Year Offer Teaser",
      description: "WhatsApp message for upcoming new year offer",
      status: "Submitted",
      type: "Whatsapp",
      recipients: "156",
      openRate: "",
      clickRate: "",
      date: "2024-01-19"
    }
  ];

  // Stats data
  const stats = {
    activeOffers: 1,
    totalUsage: 70,
    scheduled: 1,
    campaignsSent: 2
  };

  const handleCreateOffer = () => {
    navigate("/add-marketing");
  };

  return (
    <div>
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <AdminHeader isCollapsed={isCollapsed} />
      <div className={`marketing-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="marketing-container">
          {/* Header with tabs */}
          <div className="marketing-header">
            <div className="tabs">
              <button 
                className={`tab-btn ${activeTab === "offers" ? "active" : ""}`}
                onClick={() => setActiveTab("offers")}
              >
                Offers & Discounts
              </button>
              <button 
                className={`tab-btn ${activeTab === "campaigns" ? "active" : ""}`}
                onClick={() => setActiveTab("campaigns")}
              >
                Marketing Campaigns
              </button>
            </div>
            {activeTab === "offers" && (
              <button className="create-offer-btn" onClick={handleCreateOffer}>
                + Create Offer
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.activeOffers}</div>
              <div className="stat-label">Active Offers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalUsage}</div>
              <div className="stat-label">Total Usage</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.scheduled}</div>
              <div className="stat-label">Scheduled</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.campaignsSent}</div>
              <div className="stat-label">Campaigns Sent</div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "offers" ? (
            <div className="offers-section">
              {offersData.map(offer => (
                <div key={offer.id} className="offer-card">
                  {/* First Card Layout (Electronics Mega Sale) */}
                  {offer.id === 1 ? (
                    <>
                      <div className="offer-header-new">
                        <h3 className="offer-title-new">{offer.title}</h3>
                        <div className="usage-top-new">
                          <span className="usage-label-new">USAGE</span>
                          <span className="usage-value-new">{offer.usage}</span>
                        </div>
                      </div>
                      
                      <div className="offer-category-row">
                        <span className="category-status">{offer.status}</span>
                        <span className="category-label">Category</span>
                        <span className="category-separator">|</span>
                        <span className="category-value">{offer.category}</span>
                      </div>
                      
                      <div className="divider"></div>
                      
                      <p className="offer-description-new">{offer.description}</p>
                      
                      <div className="offer-details-table">
                        <div className="table-row">
                          <span className="table-header">Discount</span>
                          <span className="table-header">Valid From</span>
                          <span className="table-header">Valid Till</span>
                        </div>
                        <div className="table-row">
                          <span className="table-value">{offer.discount}</span>
                          <span className="table-value">{offer.validFrom}</span>
                          <span className="table-value">{offer.validTill}</span>
                        </div>
                      </div>
                      
                      <div className="created-by-new">Created By {offer.createdBy}</div>
                      
                      <div className="offer-conditions-new">
                        {offer.conditions}
                      </div>
                    </>
                  ) : (
                    /* Second Card Layout (Flash Sale - Textiles) */
                    <>
                      <div className="offer-header-compact">
                        <h3 className="offer-title-new">{offer.title}</h3>
                        <div className="status-row-compact">
                          <span className={`status-badge ${offer.status.toLowerCase()}`}>
                            {offer.status}
                          </span>
                          <span className="flash-type">{offer.flashType}</span>
                          <span className="category-compact">{offer.category}</span>
                          <div className="usage-compact">
                            <span className="usage-label-compact">Usage</span>
                            <span className="usage-value-compact">{offer.usage}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="offer-description-compact">{offer.description}</p>
                      
                      <div className="offer-details-compact">
                        <div className="details-row">
                          <span className="detail-label-compact">Discount {offer.discount}</span>
                          <span className="detail-value-compact">Valid From {offer.validFrom}</span>
                          <span className="detail-value-compact">Valid Till {offer.validTill}</span>
                          <span className="detail-value-compact">Created By {offer.createdBy}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="campaigns-section">
              <div className="campaigns-header">
                <div className="campaigns-title">
                  <span className="calendar-icon">📅</span>
                  <h3>Marketing Campaigns (3)</h3>
                </div>
                <p className="campaigns-subtitle">Manage communication campaigns to retailers</p>
              </div>
              
              {campaignsData.map(campaign => (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-main">
                    <div className="campaign-info">
                      <h4 className="campaign-title">{campaign.title}</h4>
                      <p className="campaign-description">{campaign.description}</p>
                      <div className="campaign-buttons">
                        <span className={`campaign-status ${campaign.status.toLowerCase()}`}>
                          {campaign.status}
                        </span>
                        <span className={`campaign-type ${campaign.type.toLowerCase()}`}>
                          {campaign.type}
                        </span>
                      </div>
                    </div>
                    <div className="campaign-stats-right">
                      <div className="campaign-recipients">
                        <span className="recipients-label">Recipients:</span>
                        <span className="recipients-value">{campaign.recipients}</span>
                      </div>
                      {campaign.openRate && (
                        <div className="campaign-metrics">
                          <span className="metric">Open: {campaign.openRate}</span>
                          <span className="metric">Click: {campaign.clickRate}</span>
                        </div>
                      )}
                      <span className="campaign-date">{campaign.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Marketing;