import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./Ledger.css";

const Ledger = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

    if (entry.DC === "D") {
      acc[key].totalDebit += amount;
    } else if (entry.DC === "C") {
      acc[key].totalCredit += amount;
    }

    acc[key].balance = acc[key].totalCredit - acc[key].totalDebit;

    return acc;
  }, {});

  const groupedArray = Object.values(groupedLedger);

  // Apply search filter
  const filteredLedger = searchTerm === ""
    ? groupedArray
    : groupedArray.filter((item) => 
        item.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partyID.toString().includes(searchTerm)
      );

  return (
    <div className="ledger-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`ledger-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="ledger-container">
          {/* Search Filter */}
          <div className="ledger-filter">
            <label>Search : </label>
            <input
              type="text"
              placeholder="Search by Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "5px 10px",
                fontSize: "14px",
                width: "300px",
                borderRadius: "4px",
                border: "1px solid #ccc"
              }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Loading or Empty */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="loading-text">Loading ledger...</p>
            </div>
          ) : filteredLedger.length === 0 ? (
            <p>
              {searchTerm 
                ? `No parties found matching "${searchTerm}"`
                : "No ledger entries found."
              }
            </p>
          ) : (
            filteredLedger.map((ledger, index) => {
              // Determine Dr/Cr based on balance
              const balanceType = ledger.balance >= 0 ? "Cr" : "Dr";
              const balanceDisplay = Math.abs(ledger.balance).toFixed(2);
              
              return (
                <div key={`${ledger.partyID}-${index}`} className="ledger-section">
                  {/* Header with Balance */}
                  <div className="ledger-header">
                    {ledger.partyName} (ID: {ledger.partyID}) — Balance:{" "}
                    {balanceDisplay} {balanceType}
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
                            <td>
                              {tx.date 
                                ? new Date(tx.date).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })
                                : "-"
                              }
                            </td>
                            <td>{tx.trantype || "-"}</td>
                            <td>{tx.AccountName || "-"}</td>
                            <td>{dc || "-"}</td>
                            <td>
                              {dc === "C" ? (
                                <span style={{ color: "green", fontWeight: "bold" }}>
                                  {tx.Amount || "0.00"}
                                </span>
                              ) : "-"}
                            </td>
                            <td>
                              {dc === "D" ? (
                                <span style={{ color: "red", fontWeight: "bold" }}>
                                  {tx.Amount || "0.00"}
                                </span>
                              ) : "-"}
                            </td>
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;