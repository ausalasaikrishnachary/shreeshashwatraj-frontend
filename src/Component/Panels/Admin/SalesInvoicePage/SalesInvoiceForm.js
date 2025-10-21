import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, InputGroup, Alert } from 'react-bootstrap';
import './Invoices.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate } from "react-router-dom";

const CreateInvoice = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputName, setInputName] = useState("");
  const [selected, setSelected] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();
  
  // Load from localStorage on component mount
  const [invoiceData, setInvoiceData] = useState(() => {
    const savedData = localStorage.getItem('draftInvoice');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      invoiceNumber: "INV01",
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    };
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

  // Save to localStorage whenever invoiceData changes
  useEffect(() => {
    localStorage.setItem('draftInvoice', JSON.stringify(invoiceData));
  }, [invoiceData]);

  const handleSearch = () => {
    if (inputName.trim().toLowerCase() === "dummy") {
      setSelected(true);
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${baseurl}/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${baseurl}/accounts`);
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

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
    
    const cgst = gst / 2;
    const sgst = gst / 2;
    
    return {
      ...itemForm,
      total: total.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: 0,
      cess: itemForm.cess || 0
    };
  };

  const addItem = () => {
    const calculatedItem = {
      ...calculateItemTotal(),
      batch: selectedBatch,
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, calculatedItem]
    }));

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
    setBatches([]);
    setSelectedBatch("");
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

  const clearDraft = () => {
    localStorage.removeItem('draftInvoice');
    setInvoiceData({
      invoiceNumber: "INV01",
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    setSuccess("Draft cleared successfully!");
    setTimeout(() => setSuccess(false), 3000);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);
  
  // Validate required fields
  if (!invoiceData.supplierInfo.name || !selectedSupplierId) {
    setError("Please select a supplier/customer");
    setLoading(false);
    setTimeout(() => setError(null), 3000);
    return;
  }

  if (invoiceData.items.length === 0) {
    setError("Please add at least one item to the invoice");
    setLoading(false);
    setTimeout(() => setError(null), 3000);
    return;
  }

  try {
    const payload = {
      ...invoiceData,
      selectedSupplierId: selectedSupplierId,
      type: 'sales'
    };

    console.log('Submitting invoice:', payload);

    const response = await fetch(`${baseurl}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Handle specific database errors
      if (responseData.code === 'DUPLICATE_KEY_ERROR') {
        throw new Error('System configuration error. Please contact administrator.');
      }
      throw new Error(responseData.error || responseData.details || 'Failed to submit invoice');
    }
    
    // Clear localStorage after successful submission
    localStorage.removeItem('draftInvoice');
    
    setSuccess('Invoice submitted successfully!');
    
    // Reset form
    setInvoiceData({
      invoiceNumber: "INV" + Math.floor(Math.random() * 1000),
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    setSelected(false);
    setSelectedSupplierId(null);
    
    setTimeout(() => {
      setSuccess(false);
      navigate("/sales/invoices");
    }, 2000);
    
  } catch (err) {
    console.error('Submission error:', err);
    setError(err.message);
    setTimeout(() => setError(null), 5000);
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Create Invoice</h3>
              <Button variant="warning" size="sm" onClick={clearDraft}>
                Clear Draft
              </Button>
            </div>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <div className="invoice-box p-3">
              <h5 className="section-title">Create Invoice</h5>

              {/* Rest of your existing JSX remains the same */}
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

              {/* Supplier Info Section - Your existing code */}
              <div style={{ border: "1px solid #ccc" }}>
                <Row className="mb-3">
                  <Col md={4} style={{ borderRight: "1px solid #ccc", padding: "15px" }}>
                    {!selected ? (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>Supplier Info</strong>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/retailers/add")}
                          >
                            New
                          </Button>
                        </div>
                        <Form.Select
                          className="mb-2"
                          value={inputName}
                          onChange={(e) => {
                            const selectedName = e.target.value;
                            setInputName(selectedName);
                            const supplier = accounts.find(acc => acc.business_name === selectedName);
                            if (supplier) {
                              setSelectedSupplierId(supplier.id);
                              setSelected(true);
                              setInvoiceData(prev => ({
                                ...prev,
                                supplierInfo: {
                                  name: supplier.display_name,
                                  businessName: supplier.business_name,
                                  state: supplier.billing_state,
                                  gstin: supplier.gstin
                                },
                                billingAddress: {
                                  addressLine1: supplier.billing_address_line1,
                                  city: supplier.billing_city,
                                  pincode: supplier.billing_pin_code,
                                  state: supplier.billing_state
                                },
                                shippingAddress: {
                                  addressLine1: supplier.shipping_address_line1,
                                  city: supplier.shipping_city,
                                  pincode: supplier.shipping_pin_code,
                                  state: supplier.shipping_state
                                }
                              }));
                            }
                          }}
                        >
                          <option value="">Select Retailer</option>
                          {accounts
                            .filter(acc => acc.role === "retailer")
                            .map(acc => (
                              <option key={acc.id} value={acc.business_name}>
                                {acc.business_name} ({acc.mobile_number})
                              </option>
                            ))}
                        </Form.Select>
                      </>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>Supplier / Customer Info</strong>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => {
                              if (selectedSupplierId) {
                                navigate(`/retailers/edit/${selectedSupplierId}`);
                              } else {
                                alert("Please select a supplier first!");
                              }
                            }}
                          >
                            <FaEdit /> Edit
                          </Button>
                        </div>
                        <div>
                          <div>Display Name: {invoiceData.supplierInfo.name}</div>
                          <div>Business Name: {invoiceData.supplierInfo.businessName}</div>
                          <div>Customer GSTIN: {invoiceData.supplierInfo.gstin}</div>
                        </div>
                      </>
                    )}
                  </Col>

                  <Col md={4} style={{ borderRight: "1px solid #ccc", padding: "15px" }}>
                    <strong>Billing Address</strong>
                    <div>Address: {invoiceData.billingAddress?.addressLine1}</div>
                    <div>City: {invoiceData.billingAddress?.city}</div>
                    <div>Pincode: {invoiceData.billingAddress?.pincode}</div>
                    <div>State: {invoiceData.billingAddress?.state}</div>
                  </Col>

                  <Col md={4} style={{ padding: "15px" }}>
                    <strong>Shipping Address</strong>
                    <div>Address: {invoiceData.shippingAddress?.addressLine1}</div>
                    <div>City: {invoiceData.shippingAddress?.city}</div>
                    <div>Pincode: {invoiceData.shippingAddress?.pincode}</div>
                    <div>State: {invoiceData.shippingAddress?.state}</div>
                  </Col>
                </Row>
              </div>

              {/* Item Section - Your existing code */}
              <div className="item-section mb-3 mt-3">
                <Row className="align-items-end">
                  <Col md={2}>
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label className="mb-0">Item</Form.Label>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary"
                        style={{ textDecoration: "none", fontSize: "14px" }}
                        onClick={() => navigate("/salesitemspage")}
                      >
                        + New Item
                      </button>
                    </div>
                    <Form.Select
                      name="product"
                      value={itemForm.product}
                      onChange={async (e) => {
                        const selectedName = e.target.value;
                        setItemForm((prev) => ({ ...prev, product: selectedName }));

                        const selectedProduct = products.find(
                          (p) => p.goods_name === selectedName
                        );

                        if (selectedProduct) {
                          setItemForm((prev) => ({
                            ...prev,
                            product: selectedProduct.goods_name,
                            price: selectedProduct.net_price,
                            gst: parseFloat(selectedProduct.gst_rate)
                              ? selectedProduct.gst_rate.replace("%", "")
                              : 0,
                            description: selectedProduct.description || "",
                          }));

                          try {
                            const res = await fetch(`${baseurl}/products/${selectedProduct.id}/batches`);
                            const batchData = await res.json();
                            setBatches(batchData);
                            setSelectedBatch("");
                          } catch (err) {
                            console.error("Failed to fetch batches:", err);
                            setBatches([]);
                          }
                        } else {
                          setItemForm((prev) => ({
                            ...prev,
                            price: "",
                            gst: "",
                            description: "",
                          }));
                          setBatches([]);
                          setSelectedBatch("");
                        }
                      }}
                    >
                      <option value="">Select Product</option>
                      {products
                        .filter((p) => p.group_by === "Salescatalog")
                        .map((p) => (
                          <option key={p.id} value={p.goods_name}>
                            {p.goods_name}
                          </option>
                        ))}
                    </Form.Select>

                    <Form.Select
                      className="mt-2"
                      name="batch"
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.batch_number}>
                          {batch.batch_number}
                        </option>
                      ))}
                    </Form.Select>
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
                      readOnly
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
                      readOnly
                    />
                  </Col>

                  <Col md={1}>
                    <Button variant="success" onClick={addItem}>
                      Add
                    </Button>
                  </Col>
                </Row>

                <Row className="mt-2">
                  <Col>
                    <Form.Control
                      name="description"
                      value={itemForm.description}
                      onChange={handleItemChange}
                      placeholder="Product description"
                      readOnly
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
                    <th>BATCH</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.length === 0 ? (
                    <tr><td colSpan={13} className="text-center">No items added</td></tr>
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
                        <td>{item.batch}</td>
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

              <Row className="mb-3 p-2" style={{ border: "1px solid black", borderRadius: "6px" }}>
                <Col md={7}>
                  <Form.Group controlId="invoiceNote">
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="note"
                      value={invoiceData.note}
                      onChange={handleInputChange}
                      placeholder="Enter your note here..."
                      style={{ resize: 'both' }}
                    />
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <Row>
                    <Col md={6} className="d-flex flex-column align-items-start">
                      <div>Taxable Amount</div>
                      <div>Total GST</div>
                      <div>Total Cess</div>
                      <div>Select Additional Charges</div>
                      <div>Grand Total</div>
                    </Col>

                    <Col md={6} className="d-flex flex-column align-items-end">
                      <div>₹{invoiceData.taxableAmount}</div>
                      <div>₹{invoiceData.totalGST}</div>
                      <div>₹{invoiceData.totalCess}</div>

                      <Form.Select
                        className="mb-2"
                        style={{ width: "100%" }}
                        value={invoiceData.additionalCharge || ""}
                        onChange={handleInputChange}
                        name="additionalCharge"
                      >
                        <option value="">Select Additional Charges</option>
                        <option value="Packing">Packing Charges</option>
                        <option value="Transport">Transport Charges</option>
                        <option value="Service">Service Charges</option>
                      </Form.Select>

                      <div className="fw-bold">₹{invoiceData.grandTotal}</div>
                    </Col>
                  </Row>
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
                <Button variant="danger" onClick={() => navigate("/sales/invoices")}>
                  Cancel
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;