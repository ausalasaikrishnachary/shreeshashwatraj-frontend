import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Link } from "react-router-dom";
import { FaChartLine } from "react-icons/fa";

const SalesReport = () => {
  // Sales trend data
  const salesData = [
    { month: 'Oct', sales: 850000 },
    { month: 'Nov', sales: 920000 },
    { month: 'Dec', sales: 1234567 },
    { month: 'Jan', sales: 1150000 }
  ];

  // Staff performance data
  const staffData = [
    { name: 'Ravi Kumar', sales: 360000 },
    { name: 'Priya Singh', sales: 280000 },
    { name: 'Anik Verma', sales: 180000 },
    { name: 'Neha Sharma', sales: 90000 }
  ];

  // Colors for the staff performance bars
  const staffColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <div className="sales-report">
      {/* <div className="sales-report-header">
        <h1>Sales Report</h1>
        <p>Updated: January 2024</p>
      </div> */}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <div className="stat-value">1,234,567</div>
        </div>
        
        <div className="stat-card">
          <h3>Monthly Growth</h3>
          <div className="stat-value positive">+8.2%</div>
        </div>
        
        <div className="stat-card">
          <h3>K Sales</h3>
          <div className="stat-value">567,890</div>
        </div>
        
        <div className="stat-card">
          <h3>P Sales</h3>
          <div className="stat-value">666,677</div>
        </div>

<Link to="/reports/sales-report-page" className="stat-card">
  <div className="icon-container">
    <FaChartLine className="icon" />   {/* ✅ new icon */}
  </div>
  <h4 className="mt-3">View Sales Report</h4>
</Link>

      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Sales Trend</h3>
          <p>Monthly sales performance</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  domain={[0, 1400000]} 
                  tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
                />
                <Tooltip 
                  formatter={(value) => value.toLocaleString()}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Staff Performance</h3>
          <p>Sales by team members</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  domain={[0, 360000]} 
                  tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
                />
                <Tooltip 
                  formatter={(value) => value.toLocaleString()}
                  labelFormatter={(label) => `Staff: ${label}`}
                />
                <Bar dataKey="sales">
                  {staffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={staffColors[index % staffColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sales-report {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }
        
        .sales-report-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .sales-report-header h1 {
          margin: 0;
          font-size: 2rem;
          color: #2c3e50;
        }
        
        .sales-report-header p {
          margin: 5px 0 0;
          color: #7f8c8d;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          text-align: center;
        }
        
        .stat-card h3 {
          margin: 0 0 10px;
          font-size: 0.9rem;
          color: #7f8c8d;
          font-weight: 500;
        }
        
        .stat-value {
          font-size: 1.8rem;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .stat-value.positive {
          color: #27ae60;
        }
        
        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
        }
        
        .chart-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .chart-card h3 {
          margin: 0 0 5px;
          font-size: 1.2rem;
          color: #2c3e50;
        }
        
        .chart-card p {
          margin: 0 0 20px;
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .chart-wrapper {
          width: 100%;
          height: 300px;
        }
        
        @media (max-width: 768px) {
          .sales-report {
            padding: 10px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          
          .charts-container {
            grid-template-columns: 1fr;
          }
          
          .stat-value {
            font-size: 1.4rem;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .sales-report-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesReport;