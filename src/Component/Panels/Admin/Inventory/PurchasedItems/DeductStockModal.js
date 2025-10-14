import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const DeductStockModal = ({ show, onClose, currentStock = 0, onSave }) => {
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
      if (parseInt(quantity) > currentStock) {
        alert("Deduction amount cannot exceed current stock");
        return;
      }
      onSave({ 
        quantity: parseInt(quantity), 
        remark,
        date
      });
      setQuantity("");
      setRemark("");
      onClose();
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Deduct Stock</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col>
            <strong>Current Stock</strong>
            <div>{currentStock}</div>
          </Col>
          <Col>
            <strong>Date</strong>
            <div>{date}</div>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Quantity to Deduct *</Form.Label>
          <Form.Control
            type="number"
            min="1"
            max={currentStock}
            placeholder="Enter Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <Form.Text className="text-muted">
            Maximum: {currentStock}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Reason for Deduction *</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Enter reason for stock deduction"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            required
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleSave}>
          Confirm Deduction
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeductStockModal;