import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaSearch, FaRedo, FaArrowUp, FaArrowDown, FaBalanceScale } from "react-icons/fa";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./ProfitLossReport.css";

function ProfitLossReport() {
  // Helper to format date to YYYY-MM-DD
  const formatDateToYMD = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // Default financial year start (April 1st of current FY)
  const getDefaultDates = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (April = 3)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const from = `${fyStartYear}-04-01`;
    const to = formatDateToYMD(today);
    return { from, to };
  };

  const defaultDates = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaultDates.from);
  const [toDate, setToDate] = useState(defaultDates.to);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    fromDate: defaultDates.from,
    toDate: defaultDates.to,
    totalSales: 0,
    totalPurchase: 0,
    totalCOGS: 0,
    totalUnitsSold: 0,
    grossProfit: 0,
    totalExpenses: 0,
    totalSalesReturns: 0,
    totalPurchaseReturns: 0,
    profit: 0,
    loss: 0,
    netProfit: 0,
    resultType: "NO_PROFIT_NO_LOSS",
    countSales: 0,
    countPurchase: 0,
    countExpenses: 0,
    countSalesReturns: 0,
    countPurchaseReturns: 0,
  });

  const fetchProfitLoss = useCallback(async (fDate, tDate) => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (fDate) params.fromDate = fDate;
      if (tDate) params.toDate = tDate;

      const response = await axios.get(`${baseurl}/api/reports/profit-loss`, {
        params,
      });

      if (response.data && response.data.success) {
        setData(response.data);
      } else {
        throw new Error(response.data?.error || "Failed to fetch Profit & Loss report");
      }
    } catch (err) {
      console.error("Error fetching Profit & Loss report:", err);
      setError(err.response?.data?.error || err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfitLoss(defaultDates.from, defaultDates.to);
  }, [fetchProfitLoss]);

  const handleGenerate = (e) => {
    e?.preventDefault();
    fetchProfitLoss(fromDate, toDate);
  };

  const handleReset = () => {
    const defaults = getDefaultDates();
    setFromDate(defaults.from);
    setToDate(defaults.to);
    fetchProfitLoss(defaults.from, defaults.to);
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `₹ ${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDisplayDate = (ymd) => {
    if (!ymd) return "-";
    const parts = ymd.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return ymd;
  };

  // Accounting T-format balancing values
  const totalSalesVal = parseFloat(data.totalSales) || 0;
  const totalCOGSVal = parseFloat(data.totalCOGS) || 0;
  const grossProfitVal = parseFloat(data.grossProfit) || 0;
  const totalExpensesVal = parseFloat(data.totalExpenses) || 0;
  const netProfitVal = parseFloat(data.netProfit) || 0;
  const isProfit = data.resultType === "PROFIT";
  const isLoss = data.resultType === "LOSS";

  // Balancing figures:
  // In classic accounting:
  // Debit side: COGS + Expenses + Net Profit = Balancing Total
  // Credit side: Sales + Net Loss = Balancing Total
  const debitTotal = totalCOGSVal + totalExpensesVal + (isProfit ? netProfitVal : 0);
  const creditTotal = totalSalesVal + (isLoss ? Math.abs(netProfitVal) : 0);
  const balancingTotal = Math.max(debitTotal, creditTotal);

  return (
    <div className="pl-container">
      {/* Header */}
      <div className="pl-header">
        <div className="pl-title-section">
          <div className="pl-company-name">SHREE SHASHWAT RAJ</div>
          <h2 className="pl-title">PROFIT &amp; LOSS ACCOUNT</h2>
          <div className="pl-subtitle">
            For the period from <strong>{formatDisplayDate(data.fromDate || fromDate)}</strong> to{" "}
            <strong>{formatDisplayDate(data.toDate || toDate)}</strong>
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <form className="pl-filter-bar" onSubmit={handleGenerate}>
        <div className="pl-filter-group">
          <label htmlFor="pl-from-date">From Date</label>
          <input
            id="pl-from-date"
            type="date"
            className="pl-date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="pl-filter-group">
          <label htmlFor="pl-to-date">To Date</label>
          <input
            id="pl-to-date"
            type="date"
            className="pl-date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="pl-filter-actions">
          <button
            type="submit"
            className="pl-btn-generate"
            disabled={loading}
          >
            <FaSearch /> {loading ? "Generating..." : "Generate Report"}
          </button>
          <button
            type="button"
            className="pl-btn-reset"
            onClick={handleReset}
            disabled={loading}
          >
            <FaRedo /> Reset
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && <div className="pl-error-banner">{error}</div>}

      {/* Loading Indicator */}
      {loading ? (
        <div className="pl-loading-container">
          <div className="pl-spinner" />
          <span>Calculating Profit &amp; Loss...</span>
        </div>
      ) : (
        <>
          {/* Main Profit / Loss Result Banner */}
          <div
            className={`pl-result-banner ${
              isProfit
                ? "pl-result-profit"
                : isLoss
                ? "pl-result-loss"
                : "pl-result-balanced"
            }`}
          >
            <div className="pl-result-left">
              <span className="pl-result-tag">Net Result</span>
              <div className="pl-result-label">
                {isProfit && (
                  <>
                    <FaArrowUp style={{ marginRight: 8 }} />
                    PROFIT
                  </>
                )}
                {isLoss && (
                  <>
                    <FaArrowDown style={{ marginRight: 8 }} />
                    LOSS
                  </>
                )}
                {!isProfit && !isLoss && (
                  <>
                    <FaBalanceScale style={{ marginRight: 8 }} />
                    NO PROFIT / NO LOSS
                  </>
                )}
              </div>
            </div>

            <div className="pl-result-right">
              <span className="pl-result-amount">
                {isProfit && formatCurrency(data.profit)}
                {isLoss && formatCurrency(data.loss)}
                {!isProfit && !isLoss && formatCurrency(0)}
              </span>
            </div>
          </div>

          {/* Classical T-Account Style Profit & Loss Statement */}
          <div className="pl-account-sheet">
            <div className="pl-sheet-header">
              <span>Dr. (Debit)</span>
              <span>PROFIT &amp; LOSS ACCOUNT</span>
              <span>Cr. (Credit)</span>
            </div>

            <div className="pl-columns-grid">
              {/* DEBIT SIDE (Purchases & Profit) */}
              <div className="pl-debit-side">
                <div className="pl-column-title-row">
                  <span>Particulars</span>
                  <span>Amount</span>
                </div>

                <div className="pl-entries-list">
                  {/* COGS Entry */}
                  <div className="pl-entry-row">
                    <div>
                      <div className="pl-entry-name">To Cost of Goods Sold</div>
                      <div className="pl-entry-sub">
                        ({data.totalUnitsSold || 0} units sold)
                      </div>
                    </div>
                    <div className="pl-entry-amount">{formatCurrency(data.totalCOGS)}</div>
                  </div>

                  {/* Gross Profit Entry */}
                  {grossProfitVal > 0 && (
                    <div className="pl-entry-row">
                      <div>
                        <div className="pl-entry-name">To Gross Profit</div>
                        <div className="pl-entry-sub">(Sales - COGS)</div>
                      </div>
                      <div className="pl-entry-amount">{formatCurrency(grossProfitVal)}</div>
                    </div>
                  )}

                  {/* Operating Expenses */}
                  <div className="pl-entry-row">
                    <div>
                      <div className="pl-entry-name">To Operating Expenses</div>
                      <div className="pl-entry-sub">
                        ({data.countExpenses || 0} transaction{data.countExpenses === 1 ? "" : "s"})
                      </div>
                    </div>
                    <div className="pl-entry-amount">{formatCurrency(data.totalExpenses)}</div>
                  </div>

                  {/* If Net Profit: Appears on Debit side to balance */}
                  {isProfit && (
                    <div className="pl-entry-row highlight-entry">
                      <div>
                        <div className="pl-entry-name">To Net Profit</div>
                        <div className="pl-entry-sub">(Transferred to Capital / Retained Earnings)</div>
                      </div>
                      <div className="pl-entry-amount">{formatCurrency(data.profit)}</div>
                    </div>
                  )}
                </div>

                <div className="pl-column-total-row">
                  <span>Total</span>
                  <span className="pl-column-total-amount">{formatCurrency(balancingTotal)}</span>
                </div>
              </div>

              {/* CREDIT SIDE (Sales & Loss) */}
              <div className="pl-credit-side">
                <div className="pl-column-title-row">
                  <span>Particulars</span>
                  <span>Amount</span>
                </div>

                <div className="pl-entries-list">
                  {/* Sales Entry */}
                  <div className="pl-entry-row">
                    <div>
                      <div className="pl-entry-name">By Sales</div>
                      <div className="pl-entry-sub">
                        ({data.countSales || 0} transaction{data.countSales === 1 ? "" : "s"})
                      </div>
                    </div>
                    <div className="pl-entry-amount">{formatCurrency(data.totalSales)}</div>
                  </div>

                  {/* If Net Loss: Appears on Credit side to balance */}
                  {isLoss && (
                    <div className="pl-entry-row highlight-loss">
                      <div>
                        <div className="pl-entry-name">By Net Loss</div>
                        <div className="pl-entry-sub">(Deducted from Capital)</div>
                      </div>
                      <div className="pl-entry-amount">{formatCurrency(data.loss)}</div>
                    </div>
                  )}
                </div>

                <div className="pl-column-total-row">
                  <span>Total</span>
                  <span className="pl-column-total-amount">{formatCurrency(balancingTotal)}</span>
                </div>
              </div>
            </div>

            <div className="pl-sheet-footer">
              <span>
                Report Filter: From {formatDisplayDate(data.fromDate || fromDate)} to{" "}
                {formatDisplayDate(data.toDate || toDate)}
              </span>
              <span>Calculation: Net Profit = (Sales - COGS) - Expenses</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfitLossReport;
