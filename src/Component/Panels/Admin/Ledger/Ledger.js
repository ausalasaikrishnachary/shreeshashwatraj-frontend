import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./Ledger.css";

const Ledger = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await axios.get(`${baseurl}/ledger`);
      setLedgerData(res.data);
    } catch (err) {
      console.error("Error fetching ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group ledger strictly by AccountID
  const groupedLedger = ledgerData.reduce((acc, entry) => {
    const key = entry.AccountID; // group only by AccountID
    if (!acc[key]) {
      acc[key] = {
        customer: entry.AccountName, // latest name for display
        account: entry.AccountID,
        balance: entry.balance_amount, // latest balance
        transactions: [],
      };
    }
    acc[key].transactions.push(entry);
    return acc;
  }, {});

  const groupedArray = Object.values(groupedLedger);

  // Apply filter
  const filteredLedger =
    filter === "All"
      ? groupedArray
      : groupedArray.filter((item) => item.account === filter);

  return (
    <div className="ledger-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`ledger-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="ledger-container">
          {/* Filter */}
          <div className="ledger-filter">
            <label>Filter by Customer/Supplier: </label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All</option>
              {groupedArray.map((item) => (
                <option key={item.account} value={item.account}>
                  {item.customer} ({item.account})
                </option>
              ))}
            </select>
          </div>

          {/* Loading or Empty */}
          {loading ? (
            <p>Loading ledger data...</p>
          ) : filteredLedger.length === 0 ? (
            <p>No ledger entries found.</p>
          ) : (
            filteredLedger.map((ledger) => (
              <div key={ledger.account} className="ledger-section">
                {/* Header with Balance */}
                <div className="ledger-header">
                  {ledger.customer} | {ledger.account} (Balance: {ledger.balance}{" "}
                  {ledger.balance >= 0 ? "Dr" : "Cr"})
                </div>

                {/* Table */}
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th>Transaction Date</th>
                      <th>Transaction Type</th>
                      <th>Account Name</th>
                      <th>Credit/Debit</th>
                      <th>Credit</th>
                      <th>Debit</th>
                      <th>Rec/Vou No</th>
                      <th>Created On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.transactions.map((tx, idx) => (
                      <tr key={idx}>
                        <td>{new Date(tx.date).toLocaleDateString()}</td>
                        <td>{tx.trantype}</td>
                        <td>{tx.AccountName}</td>
                        <td>{tx.DC}</td>
                        <td>{tx.DC === "C" ? tx.Amount : "-"}</td>
                        <td>{tx.DC === "D" ? tx.Amount : "-"}</td>
                        <td>{tx.voucherID}</td>
                        <td>
                          {new Date(tx.created_at).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;
