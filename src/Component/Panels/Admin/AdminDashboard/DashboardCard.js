import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

const DashboardCharts = () => {
  // Pie Chart Data
  const regionalData = {
    labels: ["Delhi", "Mumbai", "Bangalore", "Chennai", "Others"],
    datasets: [
      {
        label: "Retailers",
        data: [67, 54, 43, 38, 45],
        backgroundColor: ["#4F81FF", "#28A745", "#FF9800", "#E53935", "#9C27B0"],
        borderWidth: 1,
      },
    ],
  };

  const regionalOptions = {
    responsive: false, // disable auto-resize
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: "Regional Distribution",
        font: { size: 18, weight: "bold" },
      },
    },
  };

  // Bar Chart Data
  const categoryData = {
    labels: ["Electronics", "General Store", "Textiles", "Groceries", "Medical"],
    datasets: [
      {
        label: "Retailers",
        data: [100, 75, 50, 35, 15],
        backgroundColor: "#4F81FF",
        borderRadius: 5,
      },
    ],
  };

  const categoryOptions = {
    responsive: false, // disable auto-resize
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Category Distribution",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 14 } },
      },
      y: {
        ticks: { font: { size: 14 } },
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "20px",
      }}
    >
      {/* Regional Distribution */}
      <div style={{ width: "500px", height: "500px" }}>
        <Pie data={regionalData} options={regionalOptions} width={500} height={500} />
      </div>

      {/* Category Distribution */}
      <div style={{ width: "500px", height: "500px" }}>
        <Bar data={categoryData} options={categoryOptions} width={500} height={500} />
      </div>
    </div>
  );
};

export default DashboardCharts;
