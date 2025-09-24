import React, { useState } from "react";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./StaffOffers.css";

function StaffOffers() {
  const [activeTab, setActiveTab] = useState("Offers & Discounts");

  const tabs = ["Offers & Discounts", "Marketing Campaigns"];

  const statsData = {
    "Offers & Discounts": {
      activeOffers: 1,
      totalUsage: 70,
      scheduled: 1,
      campaignsSent: 2
    },
    "Marketing Campaigns": {
      activeOffers: 3,
      totalUsage: 120,
      scheduled: 2,
      campaignsSent: 5
    }
  };

  const offersData = [
    {
      id: 1,
      title: "Electronics Mega Sale",
      category: "Electronics",
      type: "Category",
      description: "Flat 20% off on all electronics items above ₹10,000",
      discount: "20%",
      validFrom: "2024-01-15",
      validTill: "2024-01-31",
      createdBy: "Admin",
      terms: "Minimum order: ₹10,000 • Max discount: ₹5,000",
      usage: "47 / 200",
      status: "Active"
    },
    {
      id: 2,
      title: "Flash Sale - Textiles",
      category: "Textiles",
      type: "Flash",
      description: "Buy 2 Get 1 Free on textile inventory",
      discount: "Buy 2 Get 1",
      validFrom: "2024-01-16",
      validTill: "2024-01-16",
      createdBy: "Admin",
      terms: "Limited stock • While supplies last",
      usage: "23 / 50",
      status: "Expired"
    },
    {
      id: 3,
      title: "New Year Global Offer",
      category: "All Categories",
      type: "Global",
      description: "$500 off on orders above ₹5000 - Valid for all categories",
      discount: "₹500",
      validFrom: "2024-01-20",
      validTill: "2024-02-20",
      createdBy: "Admin",
      terms: "Minimum order: ₹5,000",
      usage: "70 / 200",
      status: "Active"
    }
  ];

  const campaignsData = [
    {
      id: 1,
      title: "Q1 Product Launch",
      type: "Email Campaign",
      description: "New product lineup announcement to all retailers",
      status: "Scheduled",
      sentDate: "2024-02-01",
      recipients: "All Retailers",
      performance: "78% Open Rate"
    },
    {
      id: 2,
      title: "Seasonal Promotion",
      type: "SMS Campaign",
      description: "Special discounts for spring season",
      status: "Sent",
      sentDate: "2024-01-15",
      recipients: "Premium Retailers",
      performance: "45% Click Rate"
    }
  ];

  const currentStats = statsData[activeTab];
  const displayData = activeTab === "Offers & Discounts" ? offersData : campaignsData;

  return (
    <StaffMobileLayout>
      <div className="staff-offers-mobile">
        <header className="offers-header">
          <h1>Offers & Campaigns</h1>
          <p>Manage your promotional offers and marketing campaigns</p>
        </header>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-item">
            <div className="stat-value">{currentStats.activeOffers}</div>
            <div className="stat-label">Active Offers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{currentStats.totalUsage}</div>
            <div className="stat-label">Total Usage</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{currentStats.scheduled}</div>
            <div className="stat-label">Scheduled</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{currentStats.campaignsSent}</div>
            <div className="stat-label">Campaigns Sent</div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="tabs-section">
          <div className="tabs-container">
            {tabs.map(tab => (
              <div
                key={tab}
                className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="offers-content">
          {activeTab === "Offers & Discounts" ? (
            <div className="offers-list">
              {offersData.map(offer => (
                <div key={offer.id} className="offer-card">
                  <div className="offer-header">
                    <div className="offer-title-section">
                      <h3 className="offer-title">{offer.title}</h3>
                      <div className="offer-category-type">
                        <span className="offer-category">{offer.category}</span>
                        <span className="offer-type">{offer.type}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${offer.status.toLowerCase()}`}>
                      {offer.status}
                    </span>
                  </div>

                  <p className="offer-description">{offer.description}</p>

                  <div className="offer-details">
                    <div className="detail-row">
                      <span className="detail-label">Discount</span>
                      <span className="detail-value discount">{offer.discount}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Valid From</span>
                      <span className="detail-value">{offer.validFrom}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Valid Till</span>
                      <span className="detail-value">{offer.validTill}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Created By</span>
                      <span className="detail-value">{offer.createdBy}</span>
                    </div>
                  </div>

                  <div className="offer-terms">
                    {offer.terms}
                  </div>

                  <div className="offer-usage">
                    <span className="usage-label">Usage</span>
                    <span className="usage-value">{offer.usage}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="campaigns-list">
              {campaignsData.map(campaign => (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-header">
                    <h3 className="campaign-title">{campaign.title}</h3>
                    <span className={`status-badge ${campaign.status.toLowerCase()}`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="campaign-type">
                    {campaign.type}
                  </div>

                  <p className="campaign-description">{campaign.description}</p>

                  <div className="campaign-details">
                    <div className="detail-row">
                      <span className="detail-label">Sent Date</span>
                      <span className="detail-value">{campaign.sentDate}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Recipients</span>
                      <span className="detail-value">{campaign.recipients}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Performance</span>
                      <span className="detail-value performance">{campaign.performance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default StaffOffers;