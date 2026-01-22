import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import './PurchaseInvoice.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaEye, FaTimes } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate } from "react-router-dom";

const KachaPurchaseInvoiceForm = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputName, setInputName] = useState("");
  const [selected, setSelected] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("PINV001");
  const [editingIndex, setEditingIndex] = useState(null); 
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [hasFetchedInvoiceNumber, setHasFetchedInvoiceNumber] = useState(false);
  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] = useState(() => {
    const savedData = localStorage.getItem('draftPurchaseInvoice');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData;
    }
    return {
      invoiceNumber: "", // Changed from "PINV001" to empty string
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
        address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
        email: "spmathur56@gmail.com",
        phone: "9801049700",
        state: "Bihar"
      },
      supplierInfo: {
        name: "",
        businessName: "",
        account_name: "",
        state: "",
        gstin: "", // Keep GSTIN field
        discount: 0 // Add discount field
      },
      billingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      shippingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      items: [],
      note: "",
      taxableAmount: 0,
      grandTotal: 0,
      transportDetails: "",
      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      batchDetails: []
    };
  });

  const [itemForm, setItemForm] = useState({
    product: "",
    product_id: null,
    description: "",
    quantity: 1,
    price: 0,
    discount: 0,
    total: 0,
    batch: "",
    batchDetails: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Save to localStorage whenever invoiceData changes
  useEffect(() => {
    if (hasFetchedInvoiceNumber) {
      localStorage.setItem('draftPurchaseInvoice', JSON.stringify(invoiceData));
    }
  }, [invoiceData, hasFetchedInvoiceNumber]);

  // Open PDF preview - ONLY after form is submitted
  const handlePreview = () => {
    if (!isPreviewReady) {
      setError("Please submit the purchase invoice first to generate preview");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const previewData = {
      ...invoiceData,
      invoiceNumber: invoiceData.invoiceNumber || nextInvoiceNumber
    };

    localStorage.setItem('previewPurchaseInvoice', JSON.stringify(previewData));

    navigate("/purchase/invoice-preview");
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch products - Filter by Purchaseditems
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products for purchase invoice...');
        const res = await fetch(`${baseurl}/products`);
        if (res.ok) {
          const data = await res.json();
          console.log('All products fetched:', data);
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
          setError('Failed to load products');
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  // Fetch suppliers
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        console.log('Fetching suppliers for purchase invoice...');
        const res = await fetch(`${baseurl}/accounts`);
        if (res.ok) {
          const data = await res.json();
          console.log('All accounts fetched:', data);
          setAccounts(data);
        } else {
          console.error('Failed to fetch accounts');
          setError('Failed to load suppliers');
        }
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
        setError('Failed to load suppliers');
      }
    };
    fetchAccounts();
  }, []);

  const editItem = async (index) => {
    const itemToEdit = invoiceData.items[index];
    
    // Set the form data
    setItemForm({
      ...itemToEdit,
      product: itemToEdit.product,
      product_id: itemToEdit.product_id,
      batch: itemToEdit.batch,
      batchDetails: itemToEdit.batchDetails
    });
    
    setSelectedBatch(itemToEdit.batch || "");
    setSelectedBatchDetails(itemToEdit.batchDetails || null);
    setEditingIndex(index);

    // Fetch batches for the product being edited
    if (itemToEdit.product_id) {
      try {
        const res = await fetch(`${baseurl}/products/${itemToEdit.product_id}/batches`);
        if (res.ok) {
          const batchData = await res.json();
          setBatches(batchData);
        } else {
          console.error("Failed to fetch batches for editing");
          setBatches([]);
        }
      } catch (err) {
        console.error("Failed to fetch batches for editing:", err);
        setBatches([]);
      }
    } else {
      setBatches([]);
    }
  };

  const updateItem = () => {
    if (editingIndex === null) return;

    const calculatedItem = {
      ...calculateItemTotal(),
      batch: selectedBatch,
      batchDetails: selectedBatchDetails,
      product_id: itemForm.product_id
    };

    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map((item, index) => 
        index === editingIndex ? calculatedItem : item
      )
    }));

    // Reset form and editing state
    setItemForm({
      product: "",
      product_id: null,
      description: "",
      quantity: 1,
      price: 0,
      discount: invoiceData.supplierInfo.discount || 0, // Keep supplier discount
      total: 0,
      batch: "",
      batchDetails: null
    });
    setBatches([]);
    setSelectedBatch("");
    setSelectedBatchDetails(null);
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setItemForm({
      product: "",
      product_id: null,
      description: "",
      quantity: 1,
      price: 0,
      discount: invoiceData.supplierInfo.discount || 0, // Keep supplier discount
      total: 0,
      batch: "",
      batchDetails: null
    });
    setBatches([]);
    setSelectedBatch("");
    setSelectedBatchDetails(null);
    setEditingIndex(null);
  };

  const calculateItemTotal = () => {
    const quantity = parseFloat(itemForm.quantity) || 0;
    const price = parseFloat(itemForm.price) || 0;
    const discount = parseFloat(itemForm.discount) || 0;

    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;

    return {
      ...itemForm,
      total: total.toFixed(2),
      batchDetails: selectedBatchDetails
    };
  };

  const recalculateAllItems = () => {
    const updatedItems = invoiceData.items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;

      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const total = subtotal - discountAmount;

      return {
        ...item,
        total: total.toFixed(2)
      };
    });

    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    if (!itemForm.product) {
      setError("Please select a product");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const calculatedItem = {
      ...calculateItemTotal(),
      batch: selectedBatch,
      batchDetails: selectedBatchDetails,
      product_id: itemForm.product_id
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, calculatedItem]
    }));

    setItemForm({
      product: "",
      product_id: null,
      description: "",
      quantity: 1,
      price: 0,
      discount: invoiceData.supplierInfo.discount || 0, // Keep supplier discount
      total: 0,
      batch: "",
      batchDetails: null
    });
    setBatches([]);
    setSelectedBatch("");
    setSelectedBatchDetails(null);
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

    const additionalChargeAmount = parseFloat(invoiceData.additionalChargeAmount) || 0;
    const grandTotal = taxableAmount + additionalChargeAmount;

    setInvoiceData(prev => ({
      ...prev,
      taxableAmount: taxableAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.items, invoiceData.additionalChargeAmount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearDraft = async () => {
    localStorage.removeItem('draftPurchaseInvoice');

    const resetData = {
      invoiceNumber: "", // Changed to empty string
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
        address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
        email: "spmathur56@gmail.com",
        phone: "9801049700",
        state: "Bihar"
      },
      supplierInfo: {
        name: "",
        businessName: "",
        business_name: "",
        account_name: "",
        state: "",
        gstin: "",
        discount: 0,
        accountId: ""
      },
      billingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      shippingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      items: [],
      note: "",
      taxableAmount: 0,
      grandTotal: 0,
      transportDetails: "",
      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      batchDetails: []
    };

    setInvoiceData(resetData);
    localStorage.setItem('draftPurchaseInvoice', JSON.stringify(resetData));

    setSelected(false);
    setSelectedSupplierId(null);
    setIsPreviewReady(false);
    setSuccess("Draft cleared successfully!");
    setTimeout(() => setSuccess(false), 3000);
  };

  const incrementInvoiceNumber = (currentNumber) => {
    const numberMatch = currentNumber.match(/PINV(\d+)/);
    if (numberMatch) {
      const nextNum = parseInt(numberMatch[1]) + 1;
      return `PINV${nextNum.toString().padStart(3, '0')}`;
    }
    return 'PINV001'; // fallback
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!invoiceData.supplierInfo.name || !selectedSupplierId) {
      setError("Please select a supplier");
      setLoading(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (invoiceData.items.length === 0) {
      setError("Please add at least one item to the purchase invoice");
      setLoading(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const finalInvoiceNumber = invoiceData.invoiceNumber || nextInvoiceNumber;
      console.log('Submitting purchase invoice with number:', finalInvoiceNumber);

      // Extract batch details from items with ALL data including discount
      const batchDetails = invoiceData.items.map(item => ({
        product: item.product,
        product_id: item.product_id,
        description: item.description,
        batch: item.batch,
        batch_id: item.batch_id,
        quantity: parseFloat(item.quantity) || 0,
        price: parseFloat(item.price) || 0,
        discount: parseFloat(item.discount) || 0,
        total: parseFloat(item.total) || 0,
        batchDetails: item.batchDetails
      }));

      console.log('📦 Processed Batch Details:');
      batchDetails.forEach((detail, index) => {
        console.log(`Batch Detail ${index + 1}:`, {
          product_id: detail.product_id,
          batch_id: detail.batch_id,
          product: detail.product,
          batch: detail.batch
        });
      });

      const firstItemProductId = invoiceData.items[0]?.product_id || null;
      const firstItemBatchId = invoiceData.items[0]?.batch_id || null;
      
      const missingProductIds = invoiceData.items.filter(item => !item.product_id);
      const missingBatchIds = invoiceData.items.filter(item => !item.batch_id);
      
      if (missingProductIds.length > 0) {
        console.warn('⚠️ Items missing product_id:', missingProductIds);
      }
      if (missingBatchIds.length > 0) {
        console.warn('⚠️ Items missing batch_id:', missingBatchIds);
      }

      const payload = {
        ...invoiceData,
        invoiceNumber: finalInvoiceNumber,
        selectedSupplierId: selectedSupplierId,
        TransactionType: 'stock inward', 
        batchDetails: batchDetails,
        primaryProductId: firstItemProductId,
        primaryBatchId: firstItemBatchId,
        PartyID: selectedSupplierId,
        AccountID: selectedSupplierId,
        PartyName: invoiceData.supplierInfo.name,
        AccountName: invoiceData.supplierInfo.account_name,
        businessName: invoiceData.supplierInfo.businessName,
        shippingAddress: invoiceData.shippingAddress?.addressLine1 || '',
        shippingState: invoiceData.shippingAddress?.state || '',
        shippingCity: invoiceData.shippingAddress?.city || '',
        shippingPincode: invoiceData.shippingAddress?.pincode || '',
        billingAddress: invoiceData.billingAddress?.addressLine1 || '',
        billingState: invoiceData.billingAddress?.state || '',
        billingCity: invoiceData.billingAddress?.city || '',
        billingPincode: invoiceData.billingAddress?.pincode || '',
        PaymentTerms: invoiceData.PaymentTerms || "Immediate",
        Freight: parseFloat(invoiceData.Freight) || 0,
        BillSundryAmount: parseFloat(invoiceData.BillSundryAmount) || 0,
        transportDetails: invoiceData.transportDetails || '',
        note: invoiceData.note || '',
        // Mark as kacha invoice
        invoiceType: "KACHA",
        isGstInvoice: false,
        supplierDiscount: invoiceData.supplierInfo.discount || 0 // Include supplier discount in payload
      };

      // Remove items field from payload
      delete payload.items;

      // 🔥 LOG THE FINAL PAYLOAD
      console.log('🚀 Final Purchase Payload (KACHA):', {
        PartyID: payload.PartyID,
        AccountID: payload.AccountID,
        selectedSupplierId: payload.selectedSupplierId,
        supplierInfo: payload.supplierInfo,
        supplierDiscount: payload.supplierDiscount,
        invoiceType: payload.invoiceType,
        TransactionType: payload.TransactionType
      });
      
      // Final validation
      if (!payload.product_id || !payload.batch_id) {
        console.error('❌ CRITICAL: product_id or batch_id is still undefined in payload!');
        console.error('Payload structure:', JSON.stringify(payload, null, 2));
      } else {
        console.log('✅ SUCCESS: product_id and batch_id are properly set in payload!');
      }

      console.log('Submitting kacha purchase invoice payload with invoice number:', payload.invoiceNumber);

      const response = await fetch(`${baseurl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit purchase invoice');
      }

      // Clear localStorage and set success
      localStorage.removeItem('draftPurchaseInvoice');
      setSuccess('stock inward invoice submitted successfully!');
      setIsPreviewReady(true);

      const newDraftData = {
        ...invoiceData,
        items: [],
        taxableAmount: 0,
        grandTotal: 0
      };
      localStorage.setItem('draftPurchaseInvoice', JSON.stringify(newDraftData));

      const previewData = {
        ...invoiceData,
        invoiceNumber: finalInvoiceNumber,
        voucherId: responseData.voucherId,
        invoiceType: "KACHA"
      };
      localStorage.setItem('previewPurchaseInvoice', JSON.stringify(previewData));

      setTimeout(() => {
        navigate(`/kachapurchasepdf/${responseData.voucherId}`);
      }, 2000);

    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    const price = parseFloat(itemForm.price) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    const quantity = parseInt(itemForm.quantity) || 0;

    const priceAfterDiscount = price - (price * discount) / 100;
    return (priceAfterDiscount * quantity).toFixed(2);
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
              <h3 className="text-primary">Create Kacha Purchase Invoice</h3>
              <div>
                <Button
                  variant="info"
                  size="sm"
                  onClick={handlePreview}
                  className="me-2"
                  disabled={!isPreviewReady}
                >
                  <FaEye className="me-1" /> {isPreviewReady ? "View Invoice Preview" : "Submit to Enable Preview"}
                </Button>
                <Button variant="warning" size="sm" onClick={clearDraft}>
                  Clear Draft
                </Button>
              </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {/* Invoice Type Indicator */}
            <Alert variant="info" className="mb-3">
              <strong>Invoice Type: </strong>KACHA (Non-GST Purchase Invoice)
            </Alert>

            <div className="invoice-box p-3 bg-light rounded">
              <h5 className="section-title text-primary mb-3">Create Kacha Purchase Invoice</h5>

              {/* Company Info Section */}
              <Row className="mb-3 company-info bg-white p-3 rounded">
                <Col md={8}>
                  <div>
                    <strong className="text-primary">{invoiceData.companyInfo.name}</strong><br />
                    {invoiceData.companyInfo.address}<br />
                    Email: {invoiceData.companyInfo.email}<br />
                    Phone: {invoiceData.companyInfo.phone}<br />
                    <strong>State: {invoiceData.companyInfo.state}</strong>
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      name="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={handleInputChange}
                      className="border-primary"
                      placeholder="Enter purchase invoice number"
                    />
                    <Form.Label className="fw-bold">Purchase Invoice No</Form.Label>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="date"
                      name="invoiceDate"
                      value={invoiceData.invoiceDate}
                      onChange={handleInputChange}
                      className="border-primary"
                    />
                    <Form.Label className="fw-bold">Invoice Date</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      type="date"
                      name="validityDate"
                      value={invoiceData.validityDate}
                      onChange={handleInputChange}
                      className="border-primary"
                    />
                    <Form.Label className="fw-bold">Validity Date</Form.Label>
                  </Form.Group>
                </Col>
              </Row>

              {/* Supplier Info Section */}
              <div className="bg-white rounded border">
                <Row className="mb-0">
                  <Col md={4} className="border-end p-3">
                    {!selected ? (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-primary">Supplier Info</strong>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/retailers/add")}
                          >
                            New
                          </Button>
                        </div>
                        <Form.Select
                          className="mb-2 border-primary"
                          value={inputName}
                          onChange={(e) => {
                            const selectedName = e.target.value;
                            setInputName(selectedName);
                            const supplier = accounts.find(acc => acc.business_name === selectedName);
                            if (supplier) {
                              setSelectedSupplierId(supplier.id);
                              setSelected(true);

                              const accountDiscount = parseFloat(supplier.discount) || 0;
                              setInvoiceData(prev => ({
                                ...prev,
                                supplierInfo: {
                                  name: supplier.gstin ? supplier.display_name || supplier.business_name : supplier.name || supplier.business_name,
                                  businessName: supplier.business_name,
                                  account_name: supplier.account_name,
                                  state: supplier.billing_state,
                                  gstin: supplier.gstin || "", // Fetch GSTIN
                                  discount: accountDiscount // Fetch discount
                                },
                                billingAddress: {
                                  addressLine1: supplier.billing_address_line1,
                                  addressLine2: supplier.billing_address_line2 || "",
                                  city: supplier.billing_city,
                                  pincode: supplier.billing_pin_code,
                                  state: supplier.billing_state
                                },
                                shippingAddress: {
                                  addressLine1: supplier.shipping_address_line1,
                                  addressLine2: supplier.shipping_address_line2 || "",
                                  city: supplier.shipping_city,
                                  pincode: supplier.shipping_pin_code,
                                  state: supplier.shipping_state
                                }
                              }));
                              setItemForm(prev => ({
                                ...prev,
                                discount: accountDiscount // Apply supplier discount to item form
                              }));
                            }
                          }}
                        >
                          <option value="">Select Supplier</option> 
                          {accounts
                            .filter(acc => acc.role === "supplier") 
                            .map(acc => (
                              <option key={acc.id} value={acc.business_name}>
                                {acc.gstin?.trim()
                                  ? acc.display_name || acc.business_name
                                  : acc.name || acc.business_name}
                              </option>
                            ))}
                        </Form.Select>
                      </>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-primary">Supplier Info</strong>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => {
                              if (selectedSupplierId) {
                                navigate(`/retailers/edit/${selectedSupplierId}`);
                              }
                            }}
                          >
                            <FaEdit /> Edit
                          </Button>
                        </div>
                        <div className="bg-light p-2 rounded">
                          <div><strong>Name:</strong> {invoiceData.supplierInfo.name}</div>
                          <div><strong>Business:</strong> {invoiceData.supplierInfo.businessName}</div>
                          <div><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin || "Not Available"}</div>
                          <div><strong>State:</strong> {invoiceData.supplierInfo.state}</div>
                        </div>
                      </>
                    )}
                  </Col>

                  <Col md={4} className="border-end p-3">
                    <strong className="text-primary">Billing Address</strong>
                    <div className="bg-light p-2 rounded mt-1">
                      <div><strong>Address:</strong> {invoiceData.billingAddress?.addressLine1}</div>
                      <div><strong>City:</strong> {invoiceData.billingAddress?.city}</div>
                      <div><strong>Pincode:</strong> {invoiceData.billingAddress?.pincode}</div>
                      <div><strong>State:</strong> {invoiceData.billingAddress?.state}</div>
                    </div>
                  </Col>

                  <Col md={4} className="p-3">
                    <strong className="text-primary">Shipping Address</strong>
                    <div className="bg-light p-2 rounded mt-1">
                      <div><strong>Address:</strong> {invoiceData.shippingAddress?.addressLine1}</div>
                      <div><strong>City:</strong> {invoiceData.shippingAddress?.city}</div>
                      <div><strong>Pincode:</strong> {invoiceData.shippingAddress?.pincode}</div>
                      <div><strong>State:</strong> {invoiceData.shippingAddress?.state}</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Item Section */}
              <div className="item-section mb-3 mt-3 bg-white p-3 rounded">
                <h6 className="text-primary mb-3">Add Item</h6>
                <Row className="align-items-end">
                  <Col md={2}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="mb-0 fw-bold">Item</Form.Label>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary"
                        style={{ textDecoration: "none", fontSize: "14px" }}
                        onClick={() => navigate("/AddProductPage")}
                      >
                        + New Item
                      </button>
                    </div>
                    <Form.Select
                      name="product"
                      value={itemForm.product}
                      onChange={async (e) => {
                        const selectedName = e.target.value;
                        const selectedProduct = products.find(
                          (p) => p.goods_name === selectedName
                        );

                        if (selectedProduct) {
                          // Get discount from selected supplier account
                          const supplierDiscount = invoiceData.supplierInfo.discount || 0;
                          
                          setItemForm((prev) => ({
                            ...prev,
                            product: selectedProduct.goods_name,
                            product_id: selectedProduct.id,
                            price: selectedProduct.net_price || 0,
                            description: selectedProduct.description || "",
                            discount: supplierDiscount, // Apply supplier discount
                            batch: "",
                            batch_id: ""
                          }));

                          try {
                            const res = await fetch(`${baseurl}/products/${selectedProduct.id}/batches`);
                            const batchData = await res.json();
                            setBatches(batchData);

                            if (selectedProduct.maintain_batch === 0 && batchData.length > 0) {
                              const defaultBatch = batchData[0];
                              setSelectedBatch(defaultBatch.batch_number);
                              setSelectedBatchDetails(defaultBatch);
                              setItemForm(prev => ({
                                ...prev,
                                batch: defaultBatch.batch_number,
                                batch_id: defaultBatch.batch_number,
                                price: defaultBatch.selling_price,
                                discount: supplierDiscount // Keep supplier discount when batch is selected
                              }));
                            } else {
                              setSelectedBatch("");
                              setSelectedBatchDetails(null);
                            }

                          } catch (err) {
                            console.error("Failed to fetch batches:", err);
                            setBatches([]);
                            setSelectedBatch("");
                            setSelectedBatchDetails(null);
                          }
                        } else {
                          setItemForm(prev => ({
                            ...prev,
                            product: "",
                            product_id: "",
                            description: "",
                            price: 0,
                            discount: invoiceData.supplierInfo.discount || 0, // Keep supplier discount
                            batch: "",
                            batch_id: ""
                          }));
                          setBatches([]);
                          setSelectedBatch("");
                          setSelectedBatchDetails(null);
                        }
                      }}
                      className="border-primary"
                    >
                      <option value="">Select Product</option>
                      {products
                        .filter((p) => p.group_by === "Purchaseditems" && p.product_type === "KACHA")
                        .map((p) => (
                          <option key={p.id} value={p.goods_name}>
                            {p.goods_name}
                          </option>
                        ))}
                    </Form.Select>

                    {/* Batch Dropdown */}
                    {batches.length > 0 && itemForm.maintain_batch !== 0 && (
                      <Form.Select
                        className="mt-2 border-primary"
                        name="batch"
                        value={selectedBatch}
                        onChange={(e) => {
                          const batchNumber = e.target.value;
                          setSelectedBatch(batchNumber);
                          const batch = batches.find(b => b.batch_number === batchNumber);
                          setSelectedBatchDetails(batch || null);
                          
                          // Get supplier discount
                          const supplierDiscount = invoiceData.supplierInfo.discount || 0;

                          if (batch) {
                            setItemForm(prev => ({
                              ...prev,
                              batch: batchNumber,
                              batch_id: batch.batch_number,
                              price: batch.selling_price,
                              discount: supplierDiscount // Keep supplier discount
                            }));
                          } else {
                            setItemForm(prev => ({
                              ...prev,
                              batch: "",
                              batch_id: ""
                            }));
                          }
                        }}
                      >
                        <option value="">Select Batch</option>
                        {batches.map((batch) => (
                          <option key={batch.id} value={batch.batch_number}>
                            {batch.batch_number} (Qty: {batch.quantity})
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Col>

                  <Col md={1}>
                    <Form.Label className="fw-bold">Qty</Form.Label>
                    <Form.Control
                      name="quantity"
                      type="number"
                      value={itemForm.quantity}
                      onChange={handleItemChange}
                      min="1"
                      className="border-primary"
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Label className="fw-bold text-primary">
                      Price (₹)
                    </Form.Label>
                    <Form.Control
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemForm.price || ""}
                      onChange={handleItemChange}
                      placeholder="Enter price manually"
                      className="border-primary shadow-sm"
                      style={{
                        height: "42px"
                      }}
                    />
                  </Col>

                  <Col md={2}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="fw-bold">Discount (%)</Form.Label>
                      {invoiceData.retailerDiscount > 0 && (
                        <small className="text-primary">Retailer: {invoiceData.retailerDiscount}%</small>
                      )}
                    
                    </div>
                    <Form.Control
                      name="discount"
                      type="number"
                      value={itemForm.discount}
                      onChange={(e) => {
                        const newDiscount = parseFloat(e.target.value) || 0;
                        setItemForm(prev => ({
                          ...prev,
                          discount: newDiscount
                        }));
                      }}
                      min="0"
                      max="100"
                      className="border-primary"
                      placeholder={
                        invoiceData.supplierInfo.discount > 0 
                          ? `Default: ${invoiceData.supplierInfo.discount}%` 
                          : ""
                      }
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Label className="fw-bold">Total Price (₹)</Form.Label>
                    <Form.Control
                      type="text"
                      value={calculateTotalPrice()}
                      readOnly
                      className="border-primary bg-light"
                    />
                  </Col>

                  <Col md={1}>
                    {editingIndex !== null ? (
                      <div className="d-flex">
                        <Button variant="success" onClick={updateItem} className="me-1">
                          Update
                        </Button>
                        <Button variant="secondary" onClick={cancelEdit}>
                          <FaTimes />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="success" onClick={addItem} className="w-100">
                        Add
                      </Button>
                    )}
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
                      className="border-primary bg-light"
                    />
                  </Col>
                </Row>
              </div>

              {/* Items Table */}
              <div className="bg-white p-3 rounded">
                <h6 className="text-primary mb-3">Items List</h6>
                <Table bordered responsive size="sm" className="mb-3">
                  <thead className="table-dark">
                    <tr>
                      <th>PRODUCT</th>
                      <th>DESCRIPTION</th>
                      <th>QTY</th>
                      <th>PRICE</th>
                      <th>DISCOUNT</th>
                      <th>TOTAL</th>
                      <th>BATCH</th>
                      <th>BATCH DETAILS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted py-3">
                          No items added. Please add items using the form above.
                        </td>
                      </tr>
                    ) : (
                      invoiceData.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product}</td>
                          <td>{item.description}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">₹{item.price}</td>
                          <td className="text-center">{item.discount}%</td>
                          <td className="text-end fw-bold">₹{item.total}</td>
                          <td>{item.batch}</td>
                          <td>
                            {item.batchDetails && (
                              <small>
                                MFG: {item.batchDetails.mfg_date || item.batchDetails.manufacturing_date}<br />
                                EXP: {item.batchDetails.exp_date || item.batchDetails.expiry_date}
                              </small>
                            )}
                          </td>
                          <td className="text-center ">
                            <Button 
                              variant="warning" 
                              size="sm" 
                              onClick={() => editItem(index)}
                              className="me-1"
                              disabled={editingIndex !== null}
                            >
                              <FaEdit />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => removeItem(index)}>
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Totals and Notes Section */}
              <Row className="mb-3 p-3 bg-white rounded border">
                <Col md={7}>
                  <Form.Group controlId="invoiceNote">
                    <Form.Label className="fw-bold text-primary">Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="note"
                      value={invoiceData.note}
                      onChange={handleInputChange}
                      placeholder="Enter your note here..."
                      className="border-primary"
                    />
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <h6 className="text-primary mb-3">Amount Summary</h6>
                  <Row>
                    <Col md={6} className="d-flex flex-column align-items-start">
                      <div className="mb-2 fw-bold">Taxable Amount</div>
                      <div className="mb-2 fw-bold text-success">Grand Total</div>
                    </Col>

                    <Col md={6} className="d-flex flex-column align-items-end">
                      <div className="mb-2">₹{invoiceData.taxableAmount}</div>

            

                      <div className="fw-bold text-success fs-5">₹{invoiceData.grandTotal}</div>
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* Footer Section */}
              <Row className="mb-3 bg-white p-3 rounded">
                <Col md={6}>
                  <h6 className="text-primary">Transportation Details</h6>
                  <Form.Control
                    as="textarea"
                    placeholder="Enter transportation details..."
                    rows={2}
                    name="transportDetails"
                    value={invoiceData.transportDetails}
                    onChange={handleInputChange}
                    className="border-primary"
                  />
                </Col>
                <Col md={6}>
                  <h6 className="text-primary">Other Details</h6>
                  <div className="bg-light p-2 rounded">
                    <p className="mb-1">For</p>
                    <p className="mb-1 fw-bold">{invoiceData.companyInfo.name}</p>
                    <p className="mb-0 text-muted">{invoiceData.otherDetails}</p>
                  </div>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="text-center bg-white p-3 rounded">
                <Button
                  variant="primary"
                  className="me-3 px-4"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Kacha Purchase Invoice'}
                </Button>
                <Button
                  variant="info"
                  className="me-3 px-4"
                  onClick={handlePreview}
                  disabled={!isPreviewReady}
                >
                  {isPreviewReady ? 'View Invoice Preview' : 'Submit to Enable Preview'}
                </Button>
                <Button variant="danger" onClick={() => navigate("/purchase/purchase-invoice")}>
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

export default KachaPurchaseInvoiceForm;