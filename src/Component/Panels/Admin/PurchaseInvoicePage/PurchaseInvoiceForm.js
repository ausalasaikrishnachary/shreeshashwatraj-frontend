import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, InputGroup, Alert } from 'react-bootstrap';
import './PurchaseInvoice.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';

const CreateInvoice = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputName, setInputName] = useState("");
  const [selected, setSelected] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "INV01",
    invoiceDate: "2025-07-26",
    validityDate: "2025-08-26",
    companyInfo: {
      name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
      address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
      email: "sumukhusr7@gmail.com",
      phone: "3456549876543",
      gstin: "29AABCD0503B1ZG"
    },
    supplierInfo: {
      name: "",
      businessName: "",
      state: "",
      gstin: ""
    },
    billingAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      pincode: ""
    },
    shippingAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      pincode: ""
    },
    items: [],
    note: "",
    taxableAmount: 0,
    totalGST: 0,
    totalCess: 0,
    grandTotal: 0,
    transportDetails: "",
    otherDetails: "Authorized Signatory"
  });
  const [itemForm, setItemForm] = useState({
    product: "",
    description: "",
    quantity: 1,
    price: 0,
    discount: 0,
    gst: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSearch = () => {
    if (inputName.trim().toLowerCase() === "dummy") {
      setSelected(true);
      // Update supplier info when found
      setInvoiceData(prev => ({
        ...prev,
        supplierInfo: {
          name: "Vamshi",
          businessName: "business name",
          state: "Telangana",
          gstin: "29AABCD0503B1ZG"
        },
        billingAddress: {
          addressLine1: "5-300001, Jyoti Nagar, chandrampet, Rajanna sircilla",
          addressLine2: "Address Line2",
          city: "Hyderabad-501505",
          pincode: "501505"
        },
        shippingAddress: {
          addressLine1: "5-300001, Jyoti Nagar, chandrampet, Rajanna sircilla",
          addressLine2: "Address Line2",
          city: "Hyderabad-501505",
          pincode: "501505"
        }
      }));
    } else {
      setSelected(false);
      setError("Supplier not found");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateItemTotal = () => {
    const quantity = parseFloat(itemForm.quantity) || 0;
    const price = parseFloat(itemForm.price) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    const gst = parseFloat(itemForm.gst) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const gstAmount = amountAfterDiscount * (gst / 100);
    const total = amountAfterDiscount + gstAmount;
    
    // Split GST into CGST and SGST (assuming 50-50 split)
    const cgst = gst / 2;
    const sgst = gst / 2;
    
    return {
      ...itemForm,
      total: total.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: 0, // Assuming IGST is 0 for same state
      cess: itemForm.cess || 0
    };
  };

  const addItem = () => {
    const calculatedItem = calculateItemTotal();
    
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, calculatedItem]
    }));
    
    // Reset item form
    setItemForm({
      product: "",
      description: "",
      quantity: 1,
      price: 0,
      discount: 0,
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      total: 0
    });
  };

  const removeItem = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const taxableAmount = invoiceData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      return sum + (subtotal - discountAmount);
    }, 0);
    
    const totalGST = invoiceData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const gst = parseFloat(item.gst) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      
      return sum + gstAmount;
    }, 0);
    
    const totalCess = invoiceData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.cess) || 0)
    }, 0);
    
    const grandTotal = taxableAmount + totalGST + totalCess;
    
    setInvoiceData(prev => ({
      ...prev,
      taxableAmount: taxableAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      totalCess: totalCess.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.items]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch(`${baseurl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit invoice');
      }
      
      const data = await response.json();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />
      <div className={`admin-main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={window.innerWidth <= 768}
        />
        
        <div className="admin-content-wrapper">
          <Container fluid className="invoice-container">
            <h3 className="mb-3">Create Invoice</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Invoice submitted successfully!</Alert>}
            <div className="invoice-box p-3">
              <h5 className="section-title">Create Invoice</h5>

              <Row className="mb-3 company-info">
                <Col md={8}>
                  <div>
                    <strong>{invoiceData.companyInfo.name}</strong><br />
                    {invoiceData.companyInfo.address}<br />
                    Email: {invoiceData.companyInfo.email}<br />
                    Phone: {invoiceData.companyInfo.phone}<br />
                    GSTIN: {invoiceData.companyInfo.gstin}
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Control 
                      name="invoiceNumber" 
                      value={invoiceData.invoiceNumber} 
                      onChange={handleInputChange}
                    />
                    <Form.Label>Invoice No</Form.Label>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control 
                      type="date" 
                      name="invoiceDate"
                      value={invoiceData.invoiceDate} 
                      onChange={handleInputChange}
                    />
                    <Form.Label>Invoice Date</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Control 
                      type="date" 
                      name="validityDate"
                      value={invoiceData.validityDate} 
                      onChange={handleInputChange}
                    />
                    <Form.Label>Validity Date</Form.Label>
                  </Form.Group>
                </Col>
              </Row>

              <div style={{ border: "1px solid #ccc" }}>
                <Row noGutters>
                  <Col md={4} style={{ borderRight: "1px solid #ccc", padding: "15px" }}>
                    {!selected ? (
                      // Initial Search Box Layout
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>Supplier info</strong>
                          <Button variant="info" size="sm">+ New</Button>
                        </div>
                        <Form.Control
                          placeholder="Search by name"
                          value={inputName}
                          onChange={(e) => setInputName(e.target.value)}
                          className="mb-2"
                        />
                        <Button variant="primary" size="sm" onClick={handleSearch}>
                          Search
                        </Button>
                      </>
                    ) : (
                      // Supplier Info Details After Search
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>Supplier/Customer Info</strong>
                          <Button variant="info" size="sm">
                            <FaEdit />
                          </Button>
                        </div>
                        <div>
                          <div>{invoiceData.supplierInfo.name}</div>
                          <div>Business Name: {invoiceData.supplierInfo.businessName}</div>
                          <div>{invoiceData.supplierInfo.state}</div>
                          <div>GSTIN: {invoiceData.supplierInfo.gstin}</div>
                        </div>
                      </>
                    )}
                  </Col>

                  {/* Billing Address */}
                  {selected && (
                    <Col md={4} style={{ borderRight: "1px solid #ccc", padding: "15px" }}>
                      <strong>Billing Address</strong>
                      <div className="mt-2">
                        <div>{invoiceData.billingAddress.addressLine1}</div>
                        <div style={{ color: "red" }}>{invoiceData.billingAddress.addressLine2}</div>
                        <div>{invoiceData.billingAddress.city}</div>
                      </div>
                    </Col>
                  )}

                  {/* Shipping Address */}
                  {selected && (
                    <Col md={4} style={{ padding: "15px" }}>
                      <strong>Shipping Address</strong>
                      <div className="mt-2">
                        <div>{invoiceData.shippingAddress.addressLine1}</div>
                        <div style={{ color: "red" }}>{invoiceData.shippingAddress.addressLine2}</div>
                        <div>{invoiceData.shippingAddress.city}</div>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>

              <div className="item-section mb-3">
                <Row className="align-items-end">
                  <Col md={2}>
                    <Form.Label>Item</Form.Label> 
                    <div className="text-primary">+ New Item</div>
                    <Form.Control 
                      name="product"
                      value={itemForm.product}
                      onChange={handleItemChange}
                      placeholder="Product name"
                    />
                  </Col>
                  <Col md={1}>
                    <Form.Label>Qty</Form.Label>
                    <Form.Control 
                      name="quantity"
                      type="number"
                      value={itemForm.quantity}
                      onChange={handleItemChange}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Label>Price</Form.Label>
                    <Form.Control 
                      name="price"
                      type="number"
                      value={itemForm.price}
                      onChange={handleItemChange}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Label>Discount (%)</Form.Label>
                    <Form.Control 
                      name="discount"
                      type="number"
                      value={itemForm.discount}
                      onChange={handleItemChange}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Label>GST (%)</Form.Label>
                    <Form.Control 
                      name="gst"
                      type="number"
                      value={itemForm.gst}
                      onChange={handleItemChange}
                    />
                  </Col>
                  <Col md={1}>
                    <Button variant="success" onClick={addItem}>Add</Button>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col>
                    <Form.Control 
                      name="description"
                      value={itemForm.description}
                      onChange={handleItemChange}
                      placeholder="Product description" 
                    />
                  </Col>
                </Row>
              </div>

              <Table bordered responsive size="sm" className="mb-3">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>PRODUCT DESC</th>
                    <th>QUANTITY</th>
                    <th>PRICE</th>
                    <th>DISCOUNT</th>
                    <th>GST</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>IGST</th>
                    <th>CESS</th>
                    <th>TOTAL</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.length === 0 ? (
                    <tr><td colSpan={12} className="text-center">No items added</td></tr>
                  ) : (
                    invoiceData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product}</td>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price}</td>
                        <td>{item.discount}%</td>
                        <td>{item.gst}%</td>
                        <td>{item.cgst}%</td>
                        <td>{item.sgst}%</td>
                        <td>{item.igst}%</td>
                        <td>{item.cess}</td>
                        <td>{item.total}</td>
                        <td>
                          <Button variant="danger" size="sm" onClick={() => removeItem(index)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              <Row className="mb-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Note</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      name="note"
                      value={invoiceData.note}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <div>Taxable Amount: ₹{invoiceData.taxableAmount}</div>
                  <div>Total GST: ₹{invoiceData.totalGST}</div>
                  <div>Total Cess: ₹{invoiceData.totalCess}</div>
                  <Form.Select className="my-2">
                    <option>Select Additional Charges</option>
                  </Form.Select>
                  <div className="fw-bold">Grand Total: ₹{invoiceData.grandTotal}</div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <h6>Transportation Details</h6>
                  <Form.Control 
                    as="textarea" 
                    placeholder="Terms and Conditions" 
                    rows={2} 
                    name="transportDetails"
                    value={invoiceData.transportDetails}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col md={6}>
                  <h6>Other Details</h6>
                  <p>For</p>
                  <p>{invoiceData.companyInfo.name}</p>
                  <p>{invoiceData.otherDetails}</p>
                </Col>
              </Row>

              <div className="text-center">
                <Button 
                  variant="primary" 
                  className="me-3"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
                <Button variant="danger">Cancel</Button>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;