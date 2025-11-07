import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { FaClipboard, FaCalendarAlt, FaCheckSquare, FaTimesCircle } from "react-icons/fa";
import "./ExpenseReports.css";
import { Link } from "react-router-dom";
import { FaMoneyBillAlt } from "react-icons/fa";

const Dashboard = () => {
  // Data for Pie Chart
  const categoryData = [
    { name: "Travel", value: 18500, color: "#4A90E2" },
    { name: "Meals", value: 8900, color: "#27AE60" },
    { name: "Communication", value: 4500, color: "#F39C12" },
    { name: "Accommodation", value: 7800, color: "#E74C3C" },
    { name: "Others", value: 5970, color: "#9B59B6" },
  ];

  // Data for Bar Chart
  const staffData = [
    { name: "Ravi Kumar", expense: 12500 },
    { name: "Priya Singh", expense: 9800 },
    { name: "Amit Verma", expense: 11000 },
    { name: "Neha Sharma", expense: 8700 },
  ];

  return (
    <div className="dashboard">
      {/* Top Summary Cards */}
      <div className="cards">
        <div className="card">
          <FaClipboard className="icon blue" />
          <div>
            <h4>Total Expenses</h4>
            <p className="value">₹ 45,670</p>
          </div>
        </div>
        <div className="card">
          <FaCalendarAlt className="icon orange" />
          <div>
            <h4>Pending Approvals</h4>
            <p className="value orange-text">8</p>
          </div>
        </div>
        <div className="card">
          <FaCheckSquare className="icon green" />
          <div>
            <h4>Approved Amount</h4>
            <p className="value green-text">₹ 34,500</p>
          </div>
        </div>
        <div className="card">
          <FaTimesCircle className="icon red" />
          <div>
            <h4>Rejected Claims</h4>
            <p className="value red-text">3</p>
          </div>
        </div>
  <Link to="/reports/expense-report-page" className="stat-card">
  <div className="icon-container">
    <FaMoneyBillAlt className="icon" />
  </div>
  <h4 className="mt-3">View Expense Report</h4>
</Link>
                   
      </div>

      {/* Charts Section */}
      <div className="charts">
        {/* Pie Chart */}
        <div className="chart-box">
          <h3>Expenses by Category</h3>
          <p className="subtitle">Breakdown of expense categories</p>
          <div className="chart-container">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ₹${entry.value}`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="chart-box">
          <h3>Expenses by Staff</h3>
          <p className="subtitle">Individual expense claims</p>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={staffData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Bar dataKey="expense" fill="#F39C12" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
