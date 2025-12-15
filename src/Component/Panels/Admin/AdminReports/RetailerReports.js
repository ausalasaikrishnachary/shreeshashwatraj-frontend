import React, { useState, useEffect } from "react";
import axios from "axios";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { FaChartBar, FaChartPie, FaSearch, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { Link } from "react-router-dom";
import { baseurl } from "../../../BaseURL/BaseURL";
import { Bar, Pie } from "react-chartjs-2";
import "./RetailerReport.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function RetailerReports({ loading, setLoading }) {
  const [retailerData, setRetailerData] = useState([]);
  const [stats, setStats] = useState({
    totalRetailers: 0,
    activeRetailers: 0,
    newThisMonth: 0,
    growthRate: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  
  // New state for date filtering and report generation
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);

  // Static pie chart data
  const [pieChartData] = useState({
    labels: ["Active Retailers", "Inactive Retailers", "New Retailers"],
    datasets: [
      {
        data: [65, 20, 15],
        backgroundColor: ["#4F81FF", "#FF6384", "#36A2EB"],
        hoverBackgroundColor: ["#3A6DE0", "#FF4D6D", "#2B8CD9"],
        borderWidth: 1,
      },
    ],
  });

  // Bar chart state
  const [barChartData, setBarChartData] = useState(null);

  // Fetch retailers data with date filters
  const fetchRetailersData = async () => {
    try {
      setLoading(true);
      const url = `${baseurl}/api/reports/retailer-report`;
      const params = {};
      if (fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
      }
      
      console.log("📌 Fetching Retailers:", url);
      const res = await axios.get(url, { params });

      if (res.data && Array.isArray(res.data)) {
        setRetailerData(res.data);

        const totalRetailers = res.data.length;
        const activeRetailers = totalRetailers;
        const newThisMonth = Math.floor(Math.random() * 10) + 1;
        const growthRate =
          totalRetailers > 0
            ? ((newThisMonth / totalRetailers) * 100).toFixed(1)
            : 0;

        setStats({
          totalRetailers,
          activeRetailers,
          newThisMonth,
          growthRate,
        });

        prepareBarChartData(res.data);
      } else {
        setRetailerData([]);
        setBarChartData(null);
      }
    } catch (err) {
      console.error("❌ Error fetching Retailers:", err);
      setRetailerData([]);
      setBarChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRetailersData();
  }, [setLoading]);

  // Fetch when date changes
  useEffect(() => {
    fetchRetailersData();
  }, [fromDate, toDate]);

  // Prepare bar chart data
  const prepareBarChartData = (data) => {
    const businessCount = {};
    data.forEach((retailer) => {
      const businessName = retailer.business_name || "Unknown";
      businessCount[businessName] = (businessCount[businessName] || 0) + 1;
    });

    const sortedEntries = Object.entries(businessCount).sort(
      (a, b) => b[1] - a[1]
    );
    const topEntries = sortedEntries.slice(0, 8);

    const labels = topEntries.map(([name]) => name);
    const counts = topEntries.map(([, count]) => count);

    const barChartConfig = {
      labels: labels,
      datasets: [
        {
          label: "Number of Retailers",
          data: counts,
          backgroundColor: "#4F81FF",
          borderColor: "#3A6DE0",
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
      ],
    };

    setBarChartData(barChartConfig);
  };

  // Format retailer data for table
  const formatRetailerData = (data) => {
    return data.map((retailer) => ({
      id: retailer.id || Math.random().toString(),
      name: retailer.name || "N/A",
      mobile: retailer.mobile_number || "N/A",
      email: retailer.email || "N/A",
      business_name: retailer.business_name || "N/A",
      gstin: retailer.gstin || "N/A",
      gst_registered_name: retailer.gst_registered_name || "N/A",
    }));
  };

  // Filtered data
  const filteredRetailerData = searchTerm
    ? formatRetailerData(retailerData).filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.gst_registered_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : formatRetailerData(retailerData);

  // Table columns
  const topRetailersColumns = [
    { 
      key: "index",
      title: "S.No",
      style: { textAlign: "center" },
      render: (value, record, index) => index + 1
    },
    { key: "name", title: "Name", style: { textAlign: "center" } },
    { key: "mobile", title: "Mobile", style: { textAlign: "center" } },
    { key: "email", title: "Email", style: { textAlign: "center" } },
    { key: "business_name", title: "Business Name", style: { textAlign: "center" } },
    { key: "gstin", title: "GSTIN", style: { textAlign: "center" } },
    { key: "gst_registered_name", title: "GST Registered Name", style: { textAlign: "center" } },
  ];

  // Generate report function
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await axios.post(
        `${baseurl}/api/reports/retailer-report/download`,
        { 
          fromDate: fromDate || null, 
          toDate: toDate || null, 
          format: reportFormat 
        },
        { responseType: "blob" }
      );

      const name = `Retailer_Report_${fromDate || "ALL"}_${toDate || "ALL"}.${
        reportFormat === "pdf" ? "pdf" : "xlsx"
      }`;
      const blob =
        reportFormat === "pdf"
          ? new Blob([res.data], { type: "application/pdf" })
          : new Blob([res.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      setShowGenerateModal(false);
    } catch (e) {
      console.error("❌ Download error:", e);
      alert("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Pie chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: {
        position: "right",
        align: "center",
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) label += ": ";
            label += context.parsed + "%";
            return label;
          },
        },
      },
    },
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Retailers: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Retailers",
          font: { size: 12, weight: "bold" },
        },
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      x: {
        title: {
          display: true,
          text: "Business Type",
          font: { size: 12, weight: "bold" },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { size: 10 },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="ret-rep">
      {/* Stats Cards */}
      <div className="ret-rep-stats-grid">
        <div className="ret-rep-stat-card">
          <h4>Total Retailers</h4>
          <div className="ret-rep-stat-number">{stats.totalRetailers}</div>
          <div className="ret-rep-stat-period">
            {fromDate && toDate ? `${fromDate} to ${toDate}` : 'All time'}
          </div>
        </div>
        <div className="ret-rep-stat-card">
          <h4>Active</h4>
          <div className="ret-rep-stat-number">{stats.activeRetailers}</div>
          <div className="ret-rep-stat-period">Currently active</div>
        </div>
        <div className="ret-rep-stat-card">
          <h4>New This Month</h4>
          <div className="ret-rep-stat-number">{stats.newThisMonth}</div>
          <div className="ret-rep-stat-period">Recent additions</div>
        </div>
        <div className="ret-rep-stat-card">
          <h4>Growth Rate</h4>
          <div className="ret-rep-stat-number ret-rep-positive">+{stats.growthRate}%</div>
          <div className="ret-rep-stat-period">Monthly growth</div>
        </div>
        <Link to="/reports/retailer-report-page" className="ret-rep-stat-card">
          <div className="ret-rep-icon-container">
            <FaChartBar className="ret-rep-icon" />
          </div>
          <h4 className="ret-rep-mt-3">View Retailer Report</h4>
          <div className="ret-rep-stat-period">Full detailed report</div>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="ret-rep-charts-section">
        <div className="ret-rep-charts-container">
          {/* Pie Chart */}
          <div className="ret-rep-chart-card">
            <div className="ret-rep-chart-header">
              <FaChartPie className="ret-rep-chart-icon" />
              <h3>Retailer Status Distribution</h3>
              <span className="ret-rep-chart-subtitle">Static Overview</span>
            </div>
            <div className="ret-rep-chart-wrapper">
              <Pie data={pieChartData} options={pieOptions} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="ret-rep-chart-card">
            <div className="ret-rep-chart-header">
              <FaChartBar className="ret-rep-chart-icon" />
              <h3>Retailers by Business Type</h3>
              <span className="ret-rep-chart-subtitle">
                Dynamic based on {retailerData.length} retailers
              </span>
            </div>
            <div className="ret-rep-chart-wrapper">
              {loading ? (
                <div className="ret-rep-chart-loading">Loading chart data...</div>
              ) : barChartData ? (
                <Bar data={barChartData} options={barOptions} />
              ) : (
                <div className="ret-rep-chart-no-data">
                  No business data available for chart
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Retailers Table Section */}
      <div className="ret-rep-table-section">
        <div className="ret-rep-table-header">
          <h2>All Retailers</h2>
        </div>
        
        {/* Search and Filter Row */}
        <div className="ret-rep-filter-row">
          {/* Search on left */}
          <div className="ret-rep-search-left">
            <div className="ret-rep-search-box">
              <FaSearch className="ret-rep-search-icon" />
              <input
                type="text"
                placeholder="Search by name, mobile, email, business, GSTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ret-rep-search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="ret-rep-search-clear"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {/* Date filters and generate button on right */}
          <div className="ret-rep-date-right">
            <div className="ret-rep-date-group">
              <div className="ret-rep-date-field">
                <label>From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="ret-rep-date-input"
                />
              </div>
              <div className="ret-rep-date-field">
                <label>To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="ret-rep-date-input"
                />
              </div>
              <button
                className="ret-rep-generate-btn"
                onClick={() => setShowGenerateModal(true)}
              >
                <FaFilePdf className="ret-rep-generate-icon" />
                Generate
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="ret-rep-loading">Loading retailers data...</div>
        ) : filteredRetailerData.length > 0 ? (
          <ReusableTable
            title=""
            data={filteredRetailerData}
            columns={topRetailersColumns}
            initialEntriesPerPage={5}
            searchPlaceholder=""
            showEntries={true}
            showSearch={false}
            showPagination={true}
          />
        ) : searchTerm ? (
          <div className="ret-rep-no-data">
            No retailers found for "{searchTerm}". Try a different search term.
          </div>
        ) : (
          <div className="ret-rep-no-data">No retailer data available.</div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="ret-rep-modal">
          <div className="ret-rep-modal-content">
            <button
              className="ret-rep-close-modal"
              onClick={() => setShowGenerateModal(false)}
            >
              ✖
            </button>
            <div className="ret-rep-modal-title">Generate Retailer Report</div>
            <div className="ret-rep-modal-subtitle">
              {fromDate && toDate ? `Period: ${fromDate} to ${toDate}` : 'All retailer data'}
            </div>

            <div className="ret-rep-format-options">
              <label className={`ret-rep-format-option ${reportFormat === 'pdf' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={reportFormat === "pdf"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <FaFilePdf className="ret-rep-format-icon" />
                <span>PDF Format</span>
              </label>
              <label className={`ret-rep-format-option ${reportFormat === 'excel' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={reportFormat === "excel"}
                  onChange={(e) => setReportFormat(e.target.value)}
                />
                <FaFileExcel className="ret-rep-format-icon" />
                <span>Excel Format</span>
              </label>
            </div>

            <button 
              className="ret-rep-generate-modal-btn"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </button>
            
            <div className="ret-rep-modal-footer">
              <p>Report will include all filtered data and statistics</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RetailerReports;