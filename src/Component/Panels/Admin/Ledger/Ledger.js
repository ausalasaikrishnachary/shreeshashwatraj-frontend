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

  // Group ledger by PartyID instead of PartyName
  const groupedLedger = ledgerData.reduce((acc, entry) => {
    console.log("data", entry);

    const key = entry.PartyID || "Unknown"; // group by PartyID
    if (!acc[key]) {
      acc[key] = {
        partyID: entry.PartyID || "Unknown",
        partyName: entry.PartyName || "Unknown Party",
        transactions: [],
        totalDebit: 0,
        totalCredit: 0,
        balance: 0,
      };
    }

    // Add transaction to this party
    acc[key].transactions.push(entry);

    // Convert amount safely
    const amount = parseFloat(entry.Amount || 0);

    // 🧾 Use Amount for total — based on DC (Debit or Credit)
    if (entry.DC === "D") {
      acc[key].totalDebit += amount;
    } else if (entry.DC === "C") {
      acc[key].totalCredit += amount;
    }

    // Update balance = totalDebit - totalCredit
    acc[key].balance = acc[key].totalDebit - acc[key].totalCredit;

    return acc;
  }, {});

  const groupedArray = Object.values(groupedLedger);

  // Apply filter
  const filteredLedger =
    filter === "All"
      ? groupedArray
      : groupedArray.filter((item) => item.partyID === filter);

  return (
    <div className="ledger-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`ledger-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="ledger-container">
          {/* Filter */}
          <div className="ledger-filter">
            <label>Filter by Party: </label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All</option>
              {groupedArray.map((item) => (
                <option key={item.partyID} value={item.partyID}>
                  {item.partyName} (ID: {item.partyID})
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
            filteredLedger.map((ledger, index) => (
              <div key={`${ledger.partyID}-${index}`} className="ledger-section">
                {/* Header with Balance */}
                <div className="ledger-header">
                  {ledger.partyName} (ID: {ledger.partyID}) — Balance:{" "}
                  {Math.abs(ledger.balance).toFixed(2)}{" "}
                  {ledger.balance >= 0 ? "Dr" : "Cr"}
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
                    {ledger.transactions.map((tx, idx) => {
                      const dc = tx?.DC?.trim()?.charAt(0)?.toUpperCase();
                      return (
                        <tr key={tx.id || idx}>
                          <td>{tx.date ? new Date(tx.date).toLocaleDateString() : "-"}</td>
                          <td>{tx.trantype || "-"}</td>
                          <td>{tx.PartyName || "-"}</td>
                          <td>{dc || "-"}</td>
                          <td>{dc === "C" ? tx.Amount : "-"}</td>
                          <td>{dc === "D" ? tx.Amount : "-"}</td>
                          <td>{tx.voucherID || "-"}</td>
                          <td>
                            {tx.created_at
                              ? new Date(tx.created_at).toLocaleString("en-IN")
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
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