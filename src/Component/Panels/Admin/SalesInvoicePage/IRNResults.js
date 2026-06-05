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
              <td data-label="Invoice ID">{invoiceData.id}</td>
              <td data-label="IRN No" className="irn-number">
                {invoiceData.irn_no || 'N/A'}
              </td>
              <td data-label="Acknowledgment No">{invoiceData.ack_no || 'N/A'}</td>
              <td data-label="Acknowledgment Date">{invoiceData.ack_date || 'N/A'}</td>
              <td data-label="QR Image">
                <QRImage src={invoiceData.qr_image} alt="QR Image" />
              </td>
              <td data-label="E-way Bill No">{invoiceData.e_way_bill_no || 'N/A'}</td>
              <td data-label="E-way Bill Date">{invoiceData.e_way_bill_date || 'N/A'}</td>
              <td data-label="E-way Bill Valid Till">{invoiceData.e_way_bill_valid_till || 'N/A'}</td>
              <td data-label="Signed QR Code">
                {invoiceData.signed_qr_code ? (
                  <a href={invoiceData.signed_qr_code} target="_blank" rel="noopener noreferrer" className="view-link">
                    View
                  </a>
                ) : 'N/A'}
              </td>
              <td data-label="Signed Invoice">
                {invoiceData.signed_invoice ? (
                  <a href={invoiceData.signed_invoice} target="_blank" rel="noopener noreferrer" className="view-link">
                    View
                  </a>
                ) : 'N/A'}
              </td>
              <td data-label="IRN Status">
                <span className={`status-badge ${invoiceData.IRNgenerated_status === 'Yes' ? 'status-success' : 'status-pending'}`}>
                  {invoiceData.IRNgenerated_status === 'Yes' ? 'Generated' : 'Pending'}
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