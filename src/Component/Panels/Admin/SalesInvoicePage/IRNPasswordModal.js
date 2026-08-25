// IRNPasswordModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaLock, FaUser } from 'react-icons/fa';

const IRNPasswordModal = ({ show, onClose, onVerify, loading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      await onVerify(username, password);
      // Reset form on success
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaLock className="me-2" />
          Authentication Required
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-3">
          <p className="mb-0">
            <strong>🔐 Secure Access</strong><br />
            Please enter your credentials to generate the e-invoice.
          </p>
        </Alert>

        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaUser className="me-2" />
              Username
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <FaLock className="me-2" />
              Password
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                variant="link"
                className="position-absolute end-0 top-0 text-decoration-none"
                onClick={() => setShowPassword(!showPassword)}
                style={{ padding: '0.375rem 0.75rem' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </div>
            <Form.Text className="text-muted">
              Password must be at least 6 characters
            </Form.Text>
          </Form.Group>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="py-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </span>
                  Verifying...
                </>
              ) : (
                <>
                  <FaLock className="me-2" />
                  Verify & Generate E-Invoice
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default IRNPasswordModal;