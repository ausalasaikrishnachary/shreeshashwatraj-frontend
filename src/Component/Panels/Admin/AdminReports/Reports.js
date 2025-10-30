import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import DashboardCharts from "../../../Panels/Admin/AdminDashboard/DashboardCard";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import SalesReport from "./SalesReport";
import ExpenseReport from "./ExpenseReport";
import OfferReport from "./OfferReports";
import "./Reports.css";
import { FaChartBar } from "react-icons/fa";
import { Link } from "react-router-dom";

function Reports() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timeFilter, setTimeFilter] = useState("30 days");
  const [activeReport, setActiveReport] = useState("retailers"); // State to track active report

  // Top Performing Retailers data
  const topRetailersData = [
    {
      retailer: "Khan Textiles",
      performance: "8.1/10",
      sales: "₹156,000",
      rating: "★★★★☆",
      region: "Mumbai",
      category: "Textiles",
    },
    {
      retailer: "Sharma Electronics",
      performance: "8.5/10",
      sales: "₹125,000",
      rating: "★★★★☆",
      region: "Delhi",
      category: "Electronics",
    },
    {
      retailer: "Gupta General Store",
      performance: "7.2/10",
      sales: "₹89,000",
      rating: "★★★★☆",
      region: "Bangalore",
      category: "General Store",
    },
    {
      retailer: "Patel Medicals",
      performance: "7.8/10",
      sales: "₹112,000",
      rating: "★★★★☆",
      region: "Chennai",
      category: "Medical",
    },
    {
      retailer: "Singh Groceries",
      performance: "7.5/10",
      sales: "₹95,000",
      rating: "★★★☆☆",
      region: "Delhi",
      category: "Groceries",
    },
  ];

  const topRetailersColumns = [
    { key: "retailer", title: "Retailer Name", style: { fontWeight: "bold" } },
    { key: "performance", title: "Performance Score" },
    { key: "sales", title: "Total Sales" },
    { key: "rating", title: "Rating" },
    { key: "region", title: "Region" },
    { key: "category", title: "Category" },
  ];

  // Export handlers
  const handleCSVExport = () => {
    console.log("Exporting as CSV");
    // Add your CSV export logic here
  };

  const handleExcelExport = () => {
    console.log("Exporting as Excel");
    // Add your Excel export logic here
  };

  // Render content based on active report
  const renderReportContent = () => {
    switch (activeReport) {
      case "sales":
        return <SalesReport />;
      case "expense":
        return <ExpenseReport />;
      case "offer":
        return <OfferReport />;
      case "retailers":
      default:
        return (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Retailers</h4>
                <div className="stat-number">247</div>
              </div>
              <div className="stat-card">
                <h4>Active</h4>
                <div className="stat-number">234</div>
              </div>
              <div className="stat-card">
                <h4>New This Month</h4>
                <div className="stat-number">12</div>
              </div>
              <div className="stat-card">
                <h4>Growth Rate</h4>
                <div className="stat-number positive">+5.1%</div>
              </div>
             <Link to="/reports/retailer-report-page" className="stat-card">
      <div className="icon-container">
        <FaChartBar className="icon" />
      </div>
      <h4 className="mt-3">View Retailer Report</h4>
    </Link>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              <h2>Regional Distribution</h2>
              <p>Retailers by region</p>
              <DashboardCharts />
            </div>

            {/* Retailers Table */}
            <div className="table-section">
              <h2>All Retailers</h2>
              <ReusableTable
                title="Retailers"
                data={topRetailersData}
                columns={topRetailersColumns}
                initialEntriesPerPage={5}
                searchPlaceholder="Search retailers..."
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      {/* <AdminHeader isCollapsed={isCollapsed} /> */}
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="reports-container">
          {/* Header Section with Controls */}
          <div className="reports-header">
            <div className="header-content">
              <div className="header-text">
                <h1>Business Reports</h1>
                <p>Comprehensive analytics and insights for your business</p>
              </div>
              <div className="header-controls">
                <div className="time-filter">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="time-select"
                  >
                    <option value="7 days">Last 7 days</option>
                    <option value="30 days">Last 30 days</option>
                    <option value="90 days">Last 90 days</option>
                    <option value="1 year">Last 1 year</option>
                  </select>
                </div>
                <div className="export-buttons">
                  <button
                    className="export-btn csv-btn"
                    onClick={handleCSVExport}
                  >
                    CSV
                  </button>
                  <button
                    className="export-btn excel-btn"
                    onClick={handleExcelExport}
                  >
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Navigation */}
          <div className="reports-nav-section">
            <div className="reports-nav-content">
              <div className="report-links-grid">
                <div
                  className="report-link-item"
                  onClick={() => setActiveReport("retailers")}
                >
                  <span
                    className={`report-link-text ${
                      activeReport === "retailers" ? "active" : ""
                    }`}
                  >
                    Retailers Reports
                  </span>
                </div>
                <div
                  className="report-link-item"
                  onClick={() => setActiveReport("sales")}
                >
                  <span
                    className={`report-link-text ${
                      activeReport === "sales" ? "active" : ""
                    }`}
                  >
                    Sales Reports
                  </span>
                </div>
                <div
                  className="report-link-item"
                  onClick={() => setActiveReport("expense")}
                >
                  <span
                    className={`report-link-text ${
                      activeReport === "expense" ? "active" : ""
                    }`}
                  >
                    Expense Reports
                  </span>
                </div>
                <div
                  className="report-link-item"
                  onClick={() => setActiveReport("offer")}
                >
                  <span
                    className={`report-link-text ${
                      activeReport === "offer" ? "active" : ""
                    }`}
                  >
                    Offer Reports
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content Based on Active Report */}
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
}

export default Reports;
