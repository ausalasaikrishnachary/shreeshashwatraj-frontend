import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./SalesVisits.css";

function SalesVisits() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Sales Visits");
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = ["Sales Visits", "Transactions"];

  const salesVisitsData = [
    {
      id: "SV001",
      retailer: "Sharma Electronics",
      retailerId: "R001",
      date: "2024-01-15",
      type: "Routine",
      outcome: "Successful",
      salesAmount: "¥ 45,000",
      transactionType: "Paikka",
      staff: "Ravi Kumar"
    },
    {
      id: "SV002",
      retailer: "Gupta General Store",
      retailerId: "R002",
      date: "2024-01-14",
      type: "Follow Up",
      outcome: "Pending",
      salesAmount: "¥ 12,000",
      transactionType: "Kaccha",
      staff: "Priya Singh"
    }
  ];

  const transactionsData = [
    {
      id: "TXN001",
      retailer: "Sharma Electronics",
      amount: "¥ 45,000",
      type: "Psikka",
      description: "Electronics bulk order - smartphones and accessories",
      date: "2024-01-15",
      dueDate: "2024-02-15",
      status: "Complete"
    },
    {
      id: "TXN002",
      retailer: "Khan Textiles",
      amount: "¥ 28,000",
      type: "Kaccha",
      description: "Cash payment for textile inventory",
      date: "2024-01-14",
      dueDate: "N/A",
      status: "Complete"
    },
    {
      id: "TXN003",
      retailer: "Verma Groceries",
      amount: "¥ 15,000",
      type: "Psikka",
      description: "Grocery supplies - payment overdue",
      date: "2024-01-10",
      dueDate: "2024-01-25",
      status: "Overdue"
    }
  ];

  const filteredSalesVisits = salesVisitsData.filter(visit =>
    visit.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.staff.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactionsData.filter(transaction =>
    transaction.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogVisit = () => {
    navigate("/staff/log-visit");
  };

  return (
    <StaffMobileLayout>
      <div className="sales-visits-mobile">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Sales Visits ({salesVisitsData.length})</h1>
              <p>Track your retailer visits and outcomes</p>
            </div>
            <button className="log-visit-btn" onClick={handleLogVisit}>
              + Log Visit
            </button>
          </div>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder={activeTab === "Sales Visits" ? "Search visits..." : "Search transactions..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="tabs-section">
          <div className="tabs-container">
            {tabs.map(tab => (
              <div
                key={tab}
                className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab} {tab === "Transactions" && `(${transactionsData.length})`}
              </div>
            ))}
          </div>
        </div>

        {activeTab === "Sales Visits" ? (
          <div className="sales-visits-list">
            {filteredSalesVisits.map(visit => (
              <div key={visit.id} className="visit-card">
                <div className="visit-header">
                  <div className="visit-id">{visit.id}</div>
                  <span className={`outcome-badge ${visit.outcome.toLowerCase()}`}>
                    {visit.outcome}
                  </span>
                </div>
                
                <div className="visit-retailer">
                  <div className="retailer-name">{visit.retailer}</div>
                  <div className="retailer-id">ID: {visit.retailerId}</div>
                </div>

                <div className="visit-details">
                  <div className="detail-row">
                    <span className="detail-label">Date & Type:</span>
                    <span className="detail-value">{visit.date} • {visit.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Sales Amount:</span>
                    <span className="detail-value">{visit.salesAmount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Transaction Type:</span>
                    <span className="detail-value">{visit.transactionType}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Staff:</span>
                    <span className="detail-value">{visit.staff}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="transactions-section">
            <div className="section-header">
              <h2>Transactions ({transactionsData.length})</h2>
              <p>All retailer transactions and payment status</p>
            </div>

            <div className="transactions-list">
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} className="transaction-card">
                  <div className="transaction-header">
                    <div className="transaction-id">{transaction.id}</div>
                    <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                      {transaction.status}
                    </span>
                  </div>
                  
                  <div className="transaction-retailer">
                    <div className="retailer-name">{transaction.retailer}</div>
                  </div>

                  <div className="transaction-amount-type">
                    <div className="amount">{transaction.amount}</div>
                    <div className="type-badge">{transaction.type}</div>
                  </div>

                  <div className="transaction-description">
                    {transaction.description}
                  </div>

                  <div className="transaction-dates">
                    <div className="date-row">
                      <span className="date-label">Date:</span>
                      <span className="date-value">{transaction.date}</span>
                    </div>
                    <div className="date-row">
                      <span className="date-label">Due Date:</span>
                      <span className={`date-value ${transaction.status === 'Overdue' ? 'overdue' : ''}`}>
                        {transaction.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffMobileLayout>
  );
}

export default SalesVisits;