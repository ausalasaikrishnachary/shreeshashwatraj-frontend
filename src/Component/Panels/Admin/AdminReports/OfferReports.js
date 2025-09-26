import React from "react";
import { FaBullseye, FaChartLine, FaChartBar } from "react-icons/fa";
import "./OfferReports.css";

const OffersDashboard = () => {
  const offers = [
    {
      title: "Electronics Mega Sale",
      usage: 47,
      conversion: "34.2 %",
      conversionColor: "green",
      rating: 3,
    },
    {
      title: "Flash Sale - Textiles",
      usage: 23,
      conversion: "45.6 %",
      conversionColor: "green",
      rating: 4,
    },
    {
      title: "New Year Global Offer",
      usage: 0,
      conversion: "0 %",
      conversionColor: "orange",
      rating: 1,
    },
  ];

  return (
    <div className="offers-dashboard">
      {/* Summary Cards */}
      <div className="cards">
        <div className="card">
          <div className="text">
            <h4>Active Offers</h4>
            <p className="value">5</p>
          </div>
          <FaBullseye className="icon red" />
        </div>
        <div className="card">
          <div className="text">
            <h4>Total Usage</h4>
            <p className="value green">147</p>
          </div>
          <FaChartLine className="icon green" />
        </div>
        <div className="card">
          <div className="text">
            <h4>Conversion Rate</h4>
            <p className="value blue">23.5 %</p>
          </div>
          <FaChartBar className="icon blue" />
        </div>
        <div className="card">
          <div className="text">
            <h4>Avg. Engagement</h4>
            <p className="value orange">67%</p>
          </div>
          <FaChartBar className="icon orange" />
        </div>
      </div>

      {/* Top Performing Offers Table */}
      <div className="table-box">
        <h3>Top Performing Offers</h3>
        <p className="subtitle">Most successful marketing campaigns</p>

        <table>
          <thead>
            <tr>
              <th>Offer Title</th>
              <th>Total Usage</th>
              <th>Conversion Rate</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer, index) => (
              <tr key={index}>
                <td>{offer.title}</td>
                <td>{offer.usage}</td>
                <td>
                  <span className={`badge ${offer.conversionColor}`}>
                    {offer.conversion}
                  </span>
                </td>
                <td>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`star ${i < offer.rating ? "filled" : ""}`}
                    >
                      ★
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OffersDashboard;
