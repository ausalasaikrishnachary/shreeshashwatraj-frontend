import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mock data matching the image
  const dashboardData = {
    totalRetailers: 247,
    retailersChange: "+12%",
    monthlySales: "₹ 12,34,567",
    salesChange: "+8.2%",
    activeStaff: 18,
    staffChange: "+2",
    avgScore: 7.8,
    scoreChange: "+0.3"
  };

  const recentActivities = [
    { type: "New retailer onboarded", details: "Sharma Electronics", time: "2 hours ago" },
    { type: "Large order completed", details: "Pakka transaction ¥45,000", time: "4 hours ago" },
    { type: "Flash sale started", details: "Electronics category", time: "6 hours ago" }
  ];

  const quickActions = [
    { title: "Add New Retailer", description: "Onboard a new retailer to the system" },
    { title: "Create Offer", description: "Launch a new marketing campaign" },
    { title: "View Reports", description: "Generate sales and performance reports" }
  ];

  return (
    <div className="admin-dashboard-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main content area including header */}
      <div className={`admin-dashboard-content-area  ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        
        <div className={`admin-dashboard-main-content ${isCollapsed ? "collapsed" : ""}`}>
          {/* Welcome Section */}
          <div className="admin-dashboard-welcome-section">
            <h1 className="admin-dashboard-greeting">Good morning, Admin User!</h1>
            <p className="admin-dashboard-subtitle">Here's what's happening across your retail network today.</p>
          </div>

          {/* Stats Grid */}
          <div className="admin-dashboard-stats-grid">
            <div className="admin-dashboard-stat-card">
              <h3 className="admin-dashboard-stat-label">Total Retailers</h3>
              <div className="admin-dashboard-stat-value">{dashboardData.totalRetailers}</div>
              <div className="admin-dashboard-stat-change positive">{dashboardData.retailersChange} from last month</div>
            </div>

            <div className="admin-dashboard-stat-card">
              <h3 className="admin-dashboard-stat-label">Monthly Sales</h3>
              <div className="admin-dashboard-stat-value">{dashboardData.monthlySales}</div>
              <div className="admin-dashboard-stat-change positive">{dashboardData.salesChange} from last month</div>
            </div>

            <div className="admin-dashboard-stat-card">
              <h3 className="admin-dashboard-stat-label">Active Staff</h3>
              <div className="admin-dashboard-stat-value">{dashboardData.activeStaff}</div>
              <div className="admin-dashboard-stat-change positive">{dashboardData.staffChange} from last month</div>
            </div>

            <div className="admin-dashboard-stat-card">
              <h3 className="admin-dashboard-stat-label">Avg. Retailer Score</h3>
              <div className="admin-dashboard-stat-value">{dashboardData.avgScore}/10</div>
              <div className="admin-dashboard-stat-change positive">{dashboardData.scoreChange} from last month</div>
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="admin-dashboard-bottom-sections">
            {/* Recent Activity */}
            <div className="admin-dashboard-activity-section">
              <h3 className="admin-dashboard-section-title">Recent Activity</h3>
              <p className="admin-dashboard-section-subtitle">Latest updates from your network</p>
              
              <div className="admin-dashboard-activity-list">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="admin-dashboard-activity-item">
                    <div className="admin-dashboard-activity-content">
                      <strong className="admin-dashboard-activity-type">{activity.type}</strong>
                      <span className="admin-dashboard-activity-details">{activity.details}</span>
                    </div>
                    <span className="admin-dashboard-activity-time">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-dashboard-actions-section">
              <h3 className="admin-dashboard-section-title">Quick Actions</h3>
              <p className="admin-dashboard-section-subtitle">Common tasks and shortcuts</p>
              
              <div className="admin-dashboard-actions-grid">
                {quickActions.map((action, index) => (
                  <button key={index} className="admin-dashboard-action-card">
                    <div className="admin-dashboard-action-content">
                      <span className="admin-dashboard-action-title">{action.title}</span>
                      <span className="admin-dashboard-action-description">{action.description}</span>
                    </div>
                    <span className="admin-dashboard-action-arrow">›</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;