import React from 'react';
import './BillByBillModal.css';

const BillByBillModal = ({ show, onClose, billData, partyName, loading, onViewBill }) => {
  if (!show) return null;

  const formatCurrency = (amount) => {
    return `₹ ${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return '#28a745';
      case 'Partially Paid': return '#ffc107';
      case 'Pending': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return '✓';
      case 'Partially Paid': return '⚠';
      case 'Pending': return '⏰';
      default: return '•';
    }
  };

  const getAgingColor = (bucket) => {
    if (bucket?.includes('0-30')) return '#ffc107';
    if (bucket?.includes('31-60')) return '#fd7e14';
    if (bucket?.includes('61-90')) return '#dc3545';
    if (bucket?.includes('90+')) return '#721c24';
    return '#28a745';
  };

  const calculateTotals = () => {
    const totals = billData.reduce((acc, bill) => {
      acc.totalBill += parseFloat(bill.originalamount || 0);
      acc.totalPaid += parseFloat(bill.totalpaid || 0);
      acc.totalPending += parseFloat(bill.pendingamount || 0);
      return acc;
    }, { totalBill: 0, totalPaid: 0, totalPending: 0 });
    
    return totals;
  };

  const totals = calculateTotals();

  return (
    <div className="bill-by-bill-modal-overlay" onClick={onClose}>
      <div className="bill-by-bill-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="bill-by-bill-modal-header">
          <h3>
            📋 Bill by Bill Report - {partyName || 'Customer'}
          </h3>
          <button className="bill-by-bill-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="bill-by-bill-modal-body">
          {loading ? (
            <div className="bill-by-bill-loading">
              <div className="bill-by-bill-spinner"></div>
              <p>Loading bill details...</p>
            </div>
          ) : billData.length === 0 ? (
            <div className="bill-by-bill-empty">
              <p>No bill by bill data available for this party</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="bill-by-bill-summary">
                <div className="bill-by-bill-summary-card">
                  <div className="summary-label">Total Bills</div>
                  <div className="summary-value">{billData.length}</div>
                </div>
                <div className="bill-by-bill-summary-card">
                  <div className="summary-label">Total Bill Amount</div>
                  <div className="summary-value">{formatCurrency(totals.totalBill)}</div>
                </div>
                <div className="bill-by-bill-summary-card">
                  <div className="summary-label">Total Paid</div>
                  <div className="summary-value" style={{ color: '#28a745' }}>{formatCurrency(totals.totalPaid)}</div>
                </div>
                <div className="bill-by-bill-summary-card">
                  <div className="summary-label">Total Pending</div>
                  <div className="summary-value" style={{ color: '#dc3545' }}>{formatCurrency(totals.totalPending)}</div>
                </div>
              </div>

              {/* Bills Table */}
              <div className="bill-by-bill-table-wrapper">
                <table className="bill-by-bill-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Invoice No.</th>
                      <th>Invoice Date</th>
                      <th>Due Date</th>
                      <th>Bill Amount</th>
                      <th>Paid Amount</th>
                      <th>Pending Amount</th>
                      <th>Status</th>
                      <th>Aging</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billData.map((bill, index) => (
                      <tr key={bill.VoucherID || index}>
                        <td>{index + 1}</td>
                        <td>
                          <button
                            onClick={() => onViewBill && onViewBill(bill.VoucherID)}
                            className="invoice-link"
                          >
                            {bill.vchno || '-'}
                          </button>
                        </td>
                        <td>{bill.invoicedate ? new Date(bill.invoicedate).toLocaleDateString('en-IN') : '-'}</td>
                        <td>{bill.duedate ? new Date(bill.duedate).toLocaleDateString('en-IN') : '-'}</td>
                        <td className="amount-cell">{formatCurrency(bill.originalamount)}</td>
                        <td className="amount-cell paid-amount">{formatCurrency(bill.totalpaid)}</td>
                        <td className="amount-cell pending-amount">{formatCurrency(bill.pendingamount)}</td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(bill.status_text) }}
                          >
                            {getStatusIcon(bill.status_text)} {bill.status_text}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="aging-badge"
                            style={{ backgroundColor: getAgingColor(bill.agingbucket) }}
                          >
                            {bill.agingbucket || 'Not Due'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => onViewBill && onViewBill(bill.VoucherID)}
                            className="view-details-btn"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="totals-row">
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                      <td className="amount-cell" style={{ fontWeight: 'bold' }}>{formatCurrency(totals.totalBill)}</td>
                      <td className="amount-cell" style={{ fontWeight: 'bold' }}>{formatCurrency(totals.totalPaid)}</td>
                      <td className="amount-cell" style={{ fontWeight: 'bold' }}>{formatCurrency(totals.totalPending)}</td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
        
        <div className="bill-by-bill-modal-footer">
          <button onClick={onClose} className="close-modal-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillByBillModal;