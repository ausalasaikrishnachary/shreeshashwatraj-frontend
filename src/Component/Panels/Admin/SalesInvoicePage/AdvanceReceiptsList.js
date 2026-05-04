import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Alert, Form } from 'react-bootstrap';
import { baseurl } from "../../../BaseURL/BaseURL";

const AdvanceReceiptsList = ({ show, onHide, onReceiptLinked }) => {
  const [advanceReceipts, setAdvanceReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (show) {
      fetchAdvanceReceipts();
    }
  }, [show]);

  const fetchAdvanceReceipts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseurl}/api/advance-receipts`);
      const data = await response.json();
      if (data.success) {
        setAdvanceReceipts(data.receipts);
      }
    } catch (error) {
      console.error('Error fetching advance receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkReceipt = async () => {
    if (!selectedReceipt || !invoiceNumber) {
      alert('Please provide invoice number');
      return;
    }

    setLinking(true);
    try {
      const response = await fetch(`${baseurl}/receipts/${selectedReceipt.VoucherID}/link-to-invoice`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          invoice_amount: invoiceAmount
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Receipt successfully linked to invoice!');
        onReceiptLinked && onReceiptLinked();
        fetchAdvanceReceipts();
        setSelectedReceipt(null);
        setInvoiceNumber('');
        setInvoiceAmount('');
      } else {
        alert('Failed to link receipt: ' + data.error);
      }
    } catch (error) {
      console.error('Error linking receipt:', error);
      alert('Error linking receipt to invoice');
    } finally {
      setLinking(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Advance Receipts - Link to Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : advanceReceipts.length === 0 ? (
          <Alert variant="info">No advance receipts found</Alert>
        ) : (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Receipt No.</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Customer</th>
                </tr>
              </thead>
              <tbody>
                {advanceReceipts.map(receipt => (
                  <tr key={receipt.VoucherID}>
                    <td>
                      <Form.Check
                        type="radio"
                        name="selectedReceipt"
                        onChange={() => setSelectedReceipt(receipt)}
                      />
                    </td>
                    <td>{receipt.VchNo}</td>
                    <td>{new Date(receipt.Date).toLocaleDateString()}</td>
                    <td>₹{parseFloat(receipt.TotalAmount).toFixed(2)}</td>
                    <td>{receipt.PartyName}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {selectedReceipt && (
              <div className="mt-3 p-3 border rounded">
                <h6>Link to Invoice</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Invoice Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Enter invoice number"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Invoice Amount (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    placeholder="Enter invoice amount"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={handleLinkReceipt}
                  disabled={linking}
                >
                  {linking ? 'Linking...' : 'Link Receipt to Invoice'}
                </Button>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AdvanceReceiptsList;