import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const AddStockModal = ({ show, onClose, currentStock = 0, onSave }) => {
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
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
        <Modal.Title>Add Stock</Modal.Title>
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
          <Form.Label>Quantity to Add *</Form.Label>
          <Form.Control
            type="number"
            min="1"
            placeholder="Enter Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Remark (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Reason for adding stock"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Confirm Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddStockModal;