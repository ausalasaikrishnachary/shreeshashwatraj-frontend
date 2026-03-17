import React from 'react';

const LedgerPDF = React.forwardRef(({ filteredLedger, getPartyOpeningBalance }, ref) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString("en-IN", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format amount
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  // Calculate running balance for each transaction with opening balance
  const calculateRunningBalance = (transactions, openingBalanceNum, openingBalanceType) => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateA - dateB;
    });

    // Initialize running balance based on opening balance type
    let runningBalance = openingBalanceNum;
    
    // Adjust running balance based on opening balance type
    if (openingBalanceType === 'Credit') {
      runningBalance = -openingBalanceNum; // Credit is negative in running balance
    }
    // For Debit, runningBalance stays positive

    return sortedTransactions.map(tx => {
      const amount = parseFloat(tx.Amount || 0);
      const dc = tx?.DC?.trim()?.charAt(0)?.toUpperCase();

      if (openingBalanceType === 'Debit') {
        // Opening is Dr (positive)
        if (dc === "D") {
          runningBalance = runningBalance + amount; // Debit increases Dr
        } else if (dc === "C") {
          runningBalance = runningBalance - amount; // Credit decreases Dr
        }
      } else if (openingBalanceType === 'Credit') {
        // Opening is Cr (negative)
        if (dc === "D") {
          runningBalance = runningBalance + amount; // Debit decreases Cr (adds to negative)
        } else if (dc === "C") {
          runningBalance = runningBalance - amount; // Credit increases Cr (makes more negative)
        }
      } else {
        // No opening balance type specified
        if (dc === "D") {
          runningBalance = runningBalance + amount;
        } else if (dc === "C") {
          runningBalance = runningBalance - amount;
        }
      }

      return {
        ...tx,
        runningBalance
      };
    });
  };

  return (
    <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Report Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        borderBottom: '2px solid #333'
      }}>
        <h1 style={{ margin: '0', fontSize: '24px' }}>Ledger Report</h1>
        <p style={{ margin: '10px 0 0', color: '#666' }}>
          Generated on: {new Date().toLocaleString('en-IN')}
        </p>
      </div>

      {/* Party Sections with Tables */}
      {filteredLedger.map((ledger, index) => {
        // Get opening balance data
        const openingBalanceData = getPartyOpeningBalance(ledger.partyID);
        const openingBalanceNum = openingBalanceData.balance;
        const openingBalanceType = openingBalanceData.type;
        
        const openingBalanceDisplay = openingBalanceType 
          ? `₹${openingBalanceNum.toFixed(2)} ${openingBalanceType === 'Debit' ? 'Dr' : 'Cr'}`
          : `₹${openingBalanceNum.toFixed(2)}`;

        // Calculate running balance with opening balance
        const transactionsWithBalance = calculateRunningBalance(
          ledger.transactions, 
          openingBalanceNum, 
          openingBalanceType
        );
        
        return (
          <div key={index} style={{ 
            marginBottom: '40px',
            pageBreakInside: 'avoid'
          }}>
            {/* Party Header - Added Opening Balance */}
            <div style={{
              backgroundColor: '#f2f2f2',
              padding: '10px 15px',
              marginBottom: '10px',
              fontWeight: 'bold',
              fontSize: '14px',
              borderLeft: '4px solid #007bff',
              color: '#333'
            }}>
              {ledger.partyName} (ID: {ledger.partyID}) — Opening: {openingBalanceDisplay} | Balance:{" "}
              {formatAmount(Math.abs(ledger.balance))}{" "}
              <span style={{ 
                color: ledger.balance >= 0 ? '#28a745' : '#dc3545'
              }}>
                {ledger.balance >= 0 ? 'Cr' : 'Dr'}
              </span>
            </div>

            {/* Transaction Table */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#28a745',
                  borderBottom: '2px solid #ccc',
                  color: 'white'
                }}>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>TRANSACTION DATE</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>TRANSACTION TYPE</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>REC/VOU NO</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>CREDIT</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>DEBIT</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>BALANCE</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>CREATED ON</th>
                </tr>
              </thead>
              <tbody>
                {transactionsWithBalance.map((tx, idx) => {
                  const dc = tx?.DC?.trim()?.charAt(0)?.toUpperCase();
                  const runningBalance = tx.runningBalance || 0;
                  
                  return (
                    <tr key={idx} style={{
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      <td style={{ padding: '8px' }}>
                        {tx.date ? formatDate(tx.date) : "-"}
                      </td>
                      <td style={{ padding: '8px' }}>{tx.trantype || "-"}</td>
                      <td style={{ padding: '8px' }}>{tx.voucherID || "-"}</td>
                      <td style={{ 
                        padding: '8px', 
                        textAlign: 'right',
                        color: dc === "C" ? '#28a745' : '#333',
                        fontWeight: dc === "C" ? 'bold' : 'normal'
                      }}>
                        {dc === "C" ? formatAmount(tx.Amount) : "-"}
                      </td>
                      <td style={{ 
                        padding: '8px', 
                        textAlign: 'right',
                        color: dc === "D" ? '#dc3545' : '#333',
                        fontWeight: dc === "D" ? 'bold' : 'normal'
                      }}>
                        {dc === "D" ? formatAmount(tx.Amount) : "-"}
                      </td>
                      <td style={{ 
                        padding: '8px', 
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: '#333'
                      }}>
                        {formatAmount(Math.abs(runningBalance))} {runningBalance >= 0 ? 'Dr' : 'Cr'}
                      </td>
                      <td style={{ padding: '8px' }}>
                        {tx.created_at ? formatDateTime(tx.created_at) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: '10px',
        color: '#666',
        borderTop: '1px solid #dee2e6',
        marginTop: '40px'
      }}>
      </div>
    </div>
  );
});

export default LedgerPDF;