import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import './PurchaseInvoiceEdit.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaEye, FaSave, FaTimes } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate, useParams } from "react-router-dom";

const KachaPurchaseInvoiceEdit = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputName, setInputName] = useState("");
  const [selected, setSelected] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("INV001");
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [hasFetchedInvoiceNumber, setHasFetchedInvoiceNumber] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const [invoiceData, setInvoiceData] = useState(() => {
    const savedData = localStorage.getItem('draftInvoice');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData;
    }
    return {
      invoiceNumber: "INV001",
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhusr7@gmail.com",
        phone: "3456549876543",
        state: "Karnataka"
      },
      supplierInfo: {
        name: "",
        businessName: "",
        state: "",
        discount: 0,
         gstin: "" // Add this line
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
    product_id: "",
    description: "",
    quantity: 1,
    price: 0,
    discount: 0,
    total: 0,
    batch: "",
    batch_id: "",
    batchDetails: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setEditingVoucherId(id);
      fetchInvoiceDataForEdit(id);
    } else {
      fetchNextInvoiceNumber();
    }
  }, [id]);

  const fetchInvoiceDataForEdit = async (voucherId) => {
    try {
      setLoading(true);
      console.log('Fetching invoice data for editing:', voucherId);
      
      const response = await fetch(`${baseurl}/transactions/${voucherId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice data');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const apiData = result.data;
        const transformedData = transformApiDataToFormFormat(apiData);
        
        setInvoiceData(transformedData);
        setSelectedSupplierId(apiData.PartyID);
        setSelected(true);
        
        const supplierAccount = accounts.find(acc => acc.id === apiData.PartyID);
        if (supplierAccount) {
          setInputName(supplierAccount.business_name);
        }
        
        window.alert('✅ Invoice loaded for editing successfully!');
      } else {
        throw new Error('No valid data received');
      }
    } catch (err) {
      console.error('Error fetching invoice for edit:', err);
      setError('Failed to load invoice for editing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const transformApiDataToFormFormat = (apiData) => {
    console.log('Transforming API data for form:', apiData);
    
    let batchDetails = [];
    try {
      if (apiData.batch_details && typeof apiData.batch_details === 'string') {
        batchDetails = JSON.parse(apiData.batch_details);
      } else if (Array.isArray(apiData.batch_details)) {
        batchDetails = apiData.batch_details;
      } else if (apiData.BatchDetails && typeof apiData.BatchDetails === 'string') {
        batchDetails = JSON.parse(apiData.BatchDetails);
      }
    } catch (error) {
      console.error('Error parsing batch details:', error);
    }

    const items = batchDetails.map((batch, index) => {
      const quantity = parseFloat(batch.quantity) || 0;
      const price = parseFloat(batch.price) || 0;
      const discount = parseFloat(batch.discount) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const total = subtotal - discountAmount;

      return {
        product: batch.product || 'Product',
        product_id: batch.product_id || '',
        description: batch.description || '',
        quantity: quantity,
        price: price,
        discount: discount,
        total: total.toFixed(2),
        batch: batch.batch || '',
        batch_id: batch.batch_id || '',
        batchDetails: batch.batchDetails || null
      };
    }) || [];

    return {
      voucherId: apiData.VoucherID,
      invoiceNumber: apiData.InvoiceNumber || `INV${apiData.VoucherID}`,
      invoiceDate: apiData.Date ? new Date(apiData.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validityDate: apiData.Date ? new Date(new Date(apiData.Date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhusr7@gmail.com",
        phone: "3456549876543",
        state: "Karnataka"
      },
      
      supplierInfo: {
        name: apiData.PartyName || 'Customer',
        businessName: apiData.AccountName || 'Business',
        state: apiData.billing_state || apiData.BillingState || '',
        discount: parseFloat(apiData.supplierDiscount) || 0,
        id: apiData.PartyID || null
      },
      
      billingAddress: {
        addressLine1: apiData.billing_address_line1 || apiData.BillingAddress || '',
        addressLine2: apiData.billing_address_line2 || '',
        city: apiData.billing_city || apiData.BillingCity || '',
        pincode: apiData.billing_pin_code || apiData.BillingPincode || '',
        state: apiData.billing_state || apiData.BillingState || ''
      },
      
      shippingAddress: {
        addressLine1: apiData.shipping_address_line1 || apiData.ShippingAddress || apiData.billing_address_line1 || apiData.BillingAddress || '',
        addressLine2: apiData.shipping_address_line2 || apiData.billing_address_line2 || '',
        city: apiData.shipping_city || apiData.ShippingCity || apiData.billing_city || apiData.BillingCity || '',
        pincode: apiData.shipping_pin_code || apiData.ShippingPincode || apiData.billing_pin_code || apiData.BillingPincode || '',
        state: apiData.shipping_state || apiData.ShippingState || apiData.billing_state || apiData.BillingState || ''
      },
      
      items: items,
      note: apiData.Notes || "Thank you for your business!",
      taxableAmount: parseFloat(apiData.BasicAmount) || 0,
      grandTotal: parseFloat(apiData.TotalAmount) || 0,
      transportDetails: apiData.Freight && apiData.Freight !== "0.00" ? `Freight: ₹${apiData.Freight}` : "Standard delivery",
      additionalCharge: "",
      additionalChargeAmount: "0.00"
    };
  };

  const fetchNextInvoiceNumber = async () => {
    try {
      console.log('Fetching next invoice number...');
      const response = await fetch(`${baseurl}/next-invoice-number`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received next invoice number:', data.nextInvoiceNumber);
        setNextInvoiceNumber(data.nextInvoiceNumber);
        
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: data.nextInvoiceNumber
        }));
        
        setHasFetchedInvoiceNumber(true);
        
        const currentDraft = localStorage.getItem('draftInvoice');
        if (currentDraft) {
          const draftData = JSON.parse(currentDraft);
          draftData.invoiceNumber = data.nextInvoiceNumber;
          localStorage.setItem('draftInvoice', JSON.stringify(draftData));
        }
      } else {
        console.error('Failed to fetch next invoice number');
        generateFallbackInvoiceNumber();
      }
    } catch (err) {
      console.error('Error fetching next invoice number:', err);
      generateFallbackInvoiceNumber();
    }
  };

  const generateFallbackInvoiceNumber = async () => {
    try {
      const response = await fetch(`${baseurl}/last-invoice`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastInvoiceNumber) {
          const lastNumber = data.lastInvoiceNumber;
          const numberMatch = lastNumber.match(/INV(\d+)/);
          if (numberMatch) {
            const nextNum = parseInt(numberMatch[1]) + 1;
            const fallbackInvoiceNumber = `INV${nextNum.toString().padStart(3, '0')}`;
            setNextInvoiceNumber(fallbackInvoiceNumber);
            setInvoiceData(prev => ({
              ...prev,
              invoiceNumber: fallbackInvoiceNumber
            }));
            setHasFetchedInvoiceNumber(true);
            return;
          }
        }
      }
      
      const currentDraft = localStorage.getItem('draftInvoice');
      if (currentDraft) {
        const draftData = JSON.parse(currentDraft);
        if (draftData.invoiceNumber && draftData.invoiceNumber !== 'INV001') {
          setNextInvoiceNumber(draftData.invoiceNumber);
          setHasFetchedInvoiceNumber(true);
          return;
        }
      }
      
      setNextInvoiceNumber('INV001');
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: 'INV001'
      }));
      setHasFetchedInvoiceNumber(true);
      
    } catch (err) {
      console.error('Error in fallback invoice number generation:', err);
      setNextInvoiceNumber('INV001');
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: 'INV001'
      }));
      setHasFetchedInvoiceNumber(true);
    }
  };

  useEffect(() => {
    if (hasFetchedInvoiceNumber) {
      localStorage.setItem('draftInvoice', JSON.stringify(invoiceData));
    }
  }, [invoiceData, hasFetchedInvoiceNumber]);

  const handlePreview = () => {
    if (!isPreviewReady) {
      window.alert("⚠️ Please submit the invoice first to generate preview");
      return;
    }

    const previewData = {
      ...invoiceData,
      invoiceNumber: invoiceData.invoiceNumber || nextInvoiceNumber
    };
    
    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    
    if (isEditMode && editingVoucherId) {
      navigate(`/sales/invoice-preview/${editingVoucherId}`);
    } else {
      navigate("/sales/invoice-preview");
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
      window.alert("⚠️ Please select a product");
      return;
    }

    const calculatedItem = {
      ...calculateItemTotal(),
      batch: selectedBatch,
      batch_id: itemForm.batch_id,
      product_id: itemForm.product_id,
      batchDetails: selectedBatchDetails
    };

    if (editingItemIndex !== null) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.map((item, index) => 
          index === editingItemIndex ? calculatedItem : item
        )
      }));
      setEditingItemIndex(null);
      window.alert("✅ Item updated successfully!");
    } else {
      setInvoiceData(prev => ({
        ...prev,
        items: [...prev.items, calculatedItem]
      }));
      window.alert("✅ Item added successfully!");
    }

    setItemForm({
      product: "",
      product_id: "",
      description: "",
      quantity: 1,
      price: 0,
      discount: 0,
      total: 0,
      batch: "",
      batch_id: "",
      batchDetails: null
    });
    setBatches([]);
    setSelectedBatch("");
    setSelectedBatchDetails(null);
  };

  const editItem = (index) => {
    const itemToEdit = invoiceData.items[index];
    
    setItemForm({
      product: itemToEdit.product,
      product_id: itemToEdit.product_id,
      description: itemToEdit.description,
      quantity: itemToEdit.quantity,
      price: itemToEdit.price,
      discount: itemToEdit.discount,
      total: itemToEdit.total,
      batch: itemToEdit.batch,
      batch_id: itemToEdit.batch_id,
      batchDetails: itemToEdit.batchDetails
    });
    
    setSelectedBatch(itemToEdit.batch);
    setSelectedBatchDetails(itemToEdit.batchDetails);
    setEditingItemIndex(index);
    
    if (itemToEdit.product_id) {
      fetchBatchesForProduct(itemToEdit.product_id);
    }
  };

  const fetchBatchesForProduct = async (productId) => {
    try {
      const res = await fetch(`${baseurl}/products/${productId}/batches`);
      const batchData = await res.json();
      setBatches(batchData);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
      setBatches([]);
    }
  };

  const cancelEdit = () => {
    setEditingItemIndex(null);
    setItemForm({
      product: "",
      product_id: "",
      description: "",
      quantity: 1,
      price: 0,
      discount: 0,
      total: 0,
      batch: "",
      batch_id: "",
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

  const clearDraft = () => {
    localStorage.removeItem('draftInvoice');
    
    const resetData = {
      invoiceNumber: nextInvoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhusr7@gmail.com",
        phone: "3456549876543",
        state: "Karnataka"
      },
      supplierInfo: {
        name: "",
        businessName: "",
        state: "",
        discount: 0
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
    localStorage.setItem('draftInvoice', JSON.stringify(resetData));
    
    setSelected(false);
    setSelectedSupplierId(null);
    setIsPreviewReady(false);
    window.alert("✅ Draft cleared successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    if (!invoiceData.supplierInfo.name || !selectedSupplierId) {
      window.alert("⚠️ Please select a supplier/customer");
      setLoading(false);
      return;
    }

    if (invoiceData.items.length === 0) {
      window.alert("⚠️ Please add at least one item to the invoice");
      setLoading(false);
      return;
    }

    try {
      const finalInvoiceNumber = invoiceData.invoiceNumber || nextInvoiceNumber;
      console.log('Submitting invoice with number:', finalInvoiceNumber);

      console.log('🔍 Debugging Items Array Before Processing:');
      invoiceData.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          product: item.product,
          product_id: item.product_id,
          batch: item.batch,
          batch_id: item.batch_id,
          has_product_id: !!item.product_id,
          has_batch_id: !!item.batch_id
        });
      });

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
      
      console.log('📦 Product and Batch IDs Summary:');
      console.log('First item product_id:', firstItemProductId);
      console.log('First item batch_id:', firstItemBatchId);
      console.log('All items product_ids:', invoiceData.items.map(item => item.product_id));
      console.log('All items batch_ids:', invoiceData.items.map(item => item.batch_id));

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
        invoiceType: "KACHA",
        isGstInvoice: false,
        batchDetails: batchDetails,
        product_id: 123,
        batch_id: "bth0001",
        primaryProductId: firstItemProductId,
        primaryBatchId: firstItemBatchId,
        supplierDiscount: invoiceData.supplierInfo.discount || 0
      };

      delete payload.companyState;
      delete payload.supplierState;
      delete payload.items;

      console.log('🚀 Final Payload Analysis:');
      console.log('Payload product_id:', payload.product_id);
      console.log('Payload batch_id:', payload.batch_id);
      console.log('Payload primaryProductId:', payload.primaryProductId);
      console.log('Payload primaryBatchId:', payload.primaryBatchId);
      console.log('Payload batchDetails length:', payload.batchDetails.length);
      console.log('First batchDetail product_id:', payload.batchDetails[0]?.product_id);
      console.log('First batchDetail batch_id:', payload.batchDetails[0]?.batch_id);
      
      if (!payload.product_id || !payload.batch_id) {
        console.error('❌ CRITICAL: product_id or batch_id is still undefined in payload!');
        console.error('Payload structure:', JSON.stringify(payload, null, 2));
      } else {
        console.log('✅ SUCCESS: product_id and batch_id are properly set in payload!');
      }

      let response;
      if (isEditMode && editingVoucherId) {
        console.log('🔄 Updating existing invoice with ID:', editingVoucherId);
        response = await fetch(`${baseurl}/transactions/${editingVoucherId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      } else {
        console.log('🆕 Creating new invoice');
        response = await fetch(`${baseurl}/transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit invoice');
      }
      
      console.log('✅ Server Response:', responseData);
      console.log('Response voucherId:', responseData.voucherId);
      console.log('Response product_id:', responseData.product_id);
      console.log('Response batch_id:', responseData.batch_id);
      
      localStorage.removeItem('draftInvoice');
      window.alert(isEditMode ? '✅ Invoice updated successfully!' : '✅ Invoice submitted successfully!');
      setIsPreviewReady(true);

      const previewData = {
        ...invoiceData,
        invoiceNumber: responseData.invoiceNumber || finalInvoiceNumber,
        voucherId: responseData.voucherId || editingVoucherId,
        product_id: responseData.product_id || firstItemProductId,
        batch_id: responseData.batch_id || firstItemBatchId
      };
      localStorage.setItem('previewInvoice', JSON.stringify(previewData));
      
      setTimeout(() => {
        navigate(`/kachapurchasepdf/${responseData.voucherId || editingVoucherId}`);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      setError(err.message);
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
              <h3 className="text-primary">
                {isEditMode ? `Edit Invoice - ${invoiceData.invoiceNumber}` : 'Create Invoice'}
              </h3>
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
              <strong>Invoice Type: </strong>KACHA (Non-GST Invoice)
            </Alert>
            
            <div className="invoice-box p-3 bg-light rounded">
              <h5 className="section-title text-primary mb-3">
                {isEditMode ? 'Edit Invoice' : 'Create Invoice'}
              </h5>

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
                      value={invoiceData.invoiceNumber || nextInvoiceNumber} 
                      onChange={handleInputChange}
                      className="border-primary"
                      readOnly={isEditMode}
                    />
                    <Form.Label className="fw-bold">Invoice No</Form.Label>
                    {!hasFetchedInvoiceNumber && !isEditMode && (
                      <small className="text-muted">Loading invoice number...</small>
                    )}
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
                              setInvoiceData(prev => ({
                                ...prev,
                                supplierInfo: {
                                  name: supplier.name,
                                  businessName: supplier.business_name,
                                  state: supplier.billing_state,
                                  discount: parseFloat(supplier.discount) || 0,
                                      gstin: supplier.gstin || "" // Add this line
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
                                discount: parseFloat(supplier.discount) || 0
                              }));
                            }
                          }}
                        >
                          <option value="">Select Supplier</option>
                          {accounts
                            .filter(acc => acc.role === "supplier")
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
  <div><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin || "Not Applicable"}</div>
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
                <h6 className="text-primary mb-3">
                  {editingItemIndex !== null ? `Edit Item (${editingItemIndex + 1})` : 'Add Items'}
                </h6>
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

                        console.log('🔍 Selected Product:', selectedProduct);

                        if (selectedProduct) {
                          setItemForm((prev) => ({
                            ...prev,
                            product: selectedProduct.goods_name,
                            product_id: selectedProduct.id,
                            price: selectedProduct.net_price,
                            description: selectedProduct.description || "",
                            batch: "",
                            batch_id: ""
                          }));

                          console.log('✅ Product ID set:', selectedProduct.id);

                          try {
                            const res = await fetch(`${baseurl}/products/${selectedProduct.id}/batches`);
                            const batchData = await res.json();
                            console.log('📦 Batches fetched:', batchData);
                            setBatches(batchData);
                            setSelectedBatch("");
                            setSelectedBatchDetails(null);
                          } catch (err) {
                            console.error("Failed to fetch batches:", err);
                            setBatches([]);
                          }
                        } else {
                          setItemForm(prev => ({
                            ...prev,
                            product: "",
                            product_id: "",
                            description: "",
                            price: 0,
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
                        .filter((p) => p.group_by === "Purchaseditems")
                        .map((p) => (
                          <option key={p.id} value={p.goods_name}>
                            {p.goods_name}
                          </option>
                        ))}
                    </Form.Select>

                    <Form.Select
                      className="mt-2 border-primary"
                      name="batch"
                      value={selectedBatch}
                      onChange={(e) => {
                        const batchNumber = e.target.value;
                        setSelectedBatch(batchNumber);
                        const batch = batches.find(b => b.batch_number === batchNumber);
                        setSelectedBatchDetails(batch || null);

                        console.log('🔍 Selected Batch:', batch);

                        if (batch) {
                          setItemForm(prev => ({
                            ...prev,
                            batch: batchNumber,
                            batch_id: batch.batch_number,
                            price: batch.selling_price
                          }));
                          console.log('✅ Batch ID set:', batch.batch_number);
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
                          {batch.batch_number} (Qty: {batch.quantity} )
                        </option>
                      ))}
                    </Form.Select>
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
                    <Form.Label className="fw-bold">Price (₹)</Form.Label>
                    <Form.Control
                      name="price"
                      type="number"
                      value={itemForm.price}
                      readOnly
                      className="border-primary bg-light"
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Label className="fw-bold">Discount (%)</Form.Label>
                    <Form.Control
                      name="discount"
                      type="number"
                      value={itemForm.discount}
                      onChange={handleItemChange}
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
                    <Button 
                      variant={editingItemIndex !== null ? "warning" : "success"} 
                      onClick={addItem} 
                      className="w-100 me-1"
                    >
                      {editingItemIndex !== null ? <FaSave /> : "Add"}
                    </Button>
                    {editingItemIndex !== null && (
                      <Button 
                        variant="secondary" 
                        onClick={cancelEdit} 
                        className="w-100 mt-1"
                      >
                        <FaTimes />
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
                                MFG: {item.batchDetails.mfg_date 
                                  ? new Date(item.batchDetails.mfg_date).toLocaleDateString('en-GB') 
                                  : item.batchDetails.manufacturing_date 
                                    ? new Date(item.batchDetails.manufacturing_date).toLocaleDateString('en-GB') 
                                    : ''}<br/>

                                EXP: {item.batchDetails.exp_date 
                                  ? new Date(item.batchDetails.exp_date).toLocaleDateString('en-GB') 
                                  : item.batchDetails.expiry_date 
                                    ? new Date(item.batchDetails.expiry_date).toLocaleDateString('en-GB') 
                                    : ''}
                              </small>
                            )}
                          </td>
                          <td className="text-center">
                            <Button 
                              variant="warning" 
                              size="sm" 
                              onClick={() => editItem(index)}
                              className="me-1"
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => removeItem(index)}
                            >
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
                  {loading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Invoice' : 'Submit Invoice')}
                </Button>
                <Button 
                  variant="info" 
                  className="me-3 px-4"
                  onClick={handlePreview}
                  disabled={!isPreviewReady}
                >
                  {isPreviewReady ? 'View Invoice Preview' : 'Submit to Enable Preview'}
                </Button>
                <Button variant="danger" onClick={() => navigate("/kachapurchasepdf")}>
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

export default KachaPurchaseInvoiceEdit;