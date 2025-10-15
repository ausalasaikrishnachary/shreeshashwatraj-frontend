import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import DashboardCharts from "./DashboardCard";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Add mobile state

  // Mock data
  const dashboardData = {
    totalRetailers: 247,
    retailersChange: "+12%",
    monthlySales: "₹ 12,34,567",
    salesChange: "+8.7%",
    activeStaff: 18,
    staffChange: "+2",
    avgScore: 7.8,
    scoreChange: "+0.3",
  };

  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="admin-dashboard-wrapper">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        onToggleMobile={isMobileOpen} // Pass mobile state
      />

      <div
        className={`admin-dashboard-content-area ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <AdminHeader 
          isCollapsed={isCollapsed} 
          onToggleSidebar={handleToggleMobile} // Pass toggle function
        />

        <div
          className={`admin-dashboard-main-content ${
            isCollapsed ? "collapsed" : ""
          }`}
        >
          {/* Welcome Section */}
          <div className="admin-dashboard-welcome-section">
            <h1 className="admin-dashboard-greeting">
              Good morning, Admin User! 💤
            </h1>
            <p className="admin-dashboard-subtitle">
              Here's what's happening across your retail network today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="admin-dashboard-stats-grid">
            <div className="admin-dashboard-stat-card">
              <h3 className="admin-dashboard-stat-label">Total Retailers</h3>
              <div className="admin-dashboard-stat-value">
                {dashboardData.totalRetailers}
              </div>
              <div className="admin-dashboard-stat-change positive">
                {dashboardData.retailersChange} from last month
              </div>
            </div>

            <div className="admin-dashboard-stat-card">
              <h3 className="admin-dashboard-stat-label">Monthly Sales</h3>
              <div className="admin-dashboard-stat-value">
                {dashboardData.monthlySales}
              </div>
              <div className="admin-dashboard-stat-change positive">
                {dashboardData.salesChange} from last month
              </div>
            </div>

            <div className="admin-dashboard-stat-card">
              <h3 className="admin-dashboard-stat-label">Active Staff</h3>
              <div className="admin-dashboard-stat-value">
                {dashboardData.activeStaff}
              </div>
              <div className="admin-dashboard-stat-change positive">
                {dashboardData.staffChange} from last month
              </div>
            </div>

            <div className="admin-dashboard-stat-card">
              <h3 className="admin-dashboard-stat-label">
                Avg. Retailer Score
              </h3>
              <div className="admin-dashboard-stat-value">
                {dashboardData.avgScore}/10
              </div>
              <div className="admin-dashboard-stat-change positive">
                {dashboardData.scoreChange} from last month
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="admin-dashboard-charts-section">
            <DashboardCharts />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;