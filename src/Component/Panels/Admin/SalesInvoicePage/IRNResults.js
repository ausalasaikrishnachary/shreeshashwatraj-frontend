import React from 'react';
import QRImage from './QRImage';

const IRNResults = ({ invoiceData }) => {
  if (!invoiceData) return null;

  return (
    <div className="irn-results">
      <h2>IRN Generation Results</h2>
      <div className="table-responsive">
        <table className="results-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>IRN No</th>
              <th>Acknowledgment No</th>
              <th>Acknowledgment Date</th>
              <th>QR Image</th>
              <th>E-way Bill No</th>
              <th>E-way Bill Date</th>
              <th>E-way Bill Valid Till</th>
              <th>Signed QR Code</th>
              <th>Signed Invoice</th>
              <th>IRN Status</th>
            </tr>
          </thead>
          <tbody>
  <tr>
    <td data-label="Invoice ID">
      {invoiceData?.qrImage?.fileName || 'N/A'}
    </td>

    <td data-label="IRN No" className="irn-number">
      {invoiceData?.result?.Irn || 'N/A'}
    </td>

    <td data-label="Acknowledgment No">
      {invoiceData?.result?.AckNo || 'N/A'}
    </td>

    <td data-label="Acknowledgment Date">
      {invoiceData?.result?.AckDt || 'N/A'}
    </td>

    <td data-label="QR Image">
  {invoiceData?.qrImage?.imageUrl ? (
    <img
      src={invoiceData.qrImage.imageUrl}
      alt="QR Code"
      width="150"
      onLoad={() => console.log("QR Loaded")}
      onError={(e) => {
        console.log("QR Failed:", invoiceData.qrImage.imageUrl);
        e.target.style.display = "none";
      }}
    />
  ) : (
    "N/A"
  )}
</td>

    <td data-label="E-way Bill No">
      {invoiceData?.result?.EwbNo || 'N/A'}
    </td>

    <td data-label="E-way Bill Date">
      {invoiceData?.result?.EwbDt || 'N/A'}
    </td>

    <td data-label="E-way Bill Valid Till">
      {invoiceData?.result?.EwbValidTill || 'N/A'}
    </td>

    <td data-label="Signed QR Code">
      {invoiceData?.result?.SignedQRCode ? (
        <span style={{ color: 'green' }}>
          Available
        </span>
      ) : (
        'N/A'
      )}
    </td>

    <td data-label="Signed Invoice">
      {invoiceData?.result?.SignedInvoice ? (
        <span style={{ color: 'green' }}>
          Available
        </span>
      ) : (
        'N/A'
      )}
    </td>

    <td data-label="IRN Status">
      <span className="status-badge status-success">
        Generated
      </span>
    </td>
  </tr>
</tbody>
        </table>
      </div>
    </div>
  );
};

export default IRNResults;