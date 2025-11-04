import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import './Invoices.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate } from "react-router-dom";

const CreateInvoice = ({ user }) => {
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
  const navigate = useNavigate();

  // Load from localStorage on component mount
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
        gstin: "29AABCD0503B1ZG",
        state: "Karnataka"
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
      totalGST: 0,
      totalCess: 0,
      grandTotal: 0,
      transportDetails: "",
      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      batchDetails: []
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
    total: 0,
    batch: "",
    batchDetails: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch next invoice number on component mount
  useEffect(() => {
    fetchNextInvoiceNumber();
  }, []);

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


  // In your CreateInvoice component, update the batch selection logic
const fetchBatchesForProduct = async (productName) => {
  try {
    const product = products.find(p => p.goods_name === productName);
    if (product) {
      const res = await fetch(`${baseurl}/products/${product.id}/batches`);
      const batchData = await res.json();
      
      // Filter only batches with available stock
      const availableBatches = batchData.filter(batch => 
        parseFloat(batch.quantity) > 0
      );
      
      setBatches(availableBatches);
      setSelectedBatch("");
      setSelectedBatchDetails(null);
      
      console.log(`📦 Available batches for ${productName}:`, availableBatches);
    }
  } catch (err) {
    console.error("Failed to fetch batches:", err);
    setBatches([]);
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

  // Check if states are same for GST calculation
  const isSameState = () => {
    const companyState = invoiceData.companyInfo.state;
    const supplierState = invoiceData.supplierInfo.state;
    
    if (!companyState || !supplierState) {
      return true;
    }
    
    return companyState.toLowerCase() === supplierState.toLowerCase();
  };

  // Save to localStorage whenever invoiceData changes
  useEffect(() => {
    if (hasFetchedInvoiceNumber) {
      localStorage.setItem('draftInvoice', JSON.stringify(invoiceData));
    }
  }, [invoiceData, hasFetchedInvoiceNumber]);

  // Update tax type when supplier info changes
  useEffect(() => {
    const taxType = isSameState() ? "CGST/SGST" : "IGST";
    setInvoiceData(prev => ({
      ...prev,
      taxType: taxType
    }));
    
    if (invoiceData.items.length > 0) {
      recalculateAllItems();
    }
  }, [invoiceData.supplierInfo.state, invoiceData.companyInfo.state]);

  // Open PDF preview
  const handlePreview = () => {
    if (!isPreviewReady) {
      setError("Please submit the invoice first to generate preview");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const previewData = {
      ...invoiceData,
      invoiceNumber: invoiceData.invoiceNumber || nextInvoiceNumber
    };
    
    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    navigate("/sales/invoice-preview");
  };

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
          pincode: "501505",
          state: "Telangana"
        },
        shippingAddress: {
          addressLine1: "5-300001, Jyoti Nagar, chandrampet, Rajanna sircilla",
          addressLine2: "Address Line2",
          city: "Hyderabad-501505",
          pincode: "501505",
          state: "Telangana"
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
    const cess = parseFloat(itemForm.cess) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const gstAmount = amountAfterDiscount * (gst / 100);
    const cessAmount = amountAfterDiscount * (cess / 100);
    const total = amountAfterDiscount + gstAmount + cessAmount;
    
    const sameState = isSameState();
    let cgst, sgst, igst;
    
    if (sameState) {
      cgst = gst / 2;
      sgst = gst / 2;
      igst = 0;
    } else {
      cgst = 0;
      sgst = 0;
      igst = gst;
    }
    
    return {
      ...itemForm,
      total: total.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      cess: cess,
      batchDetails: selectedBatchDetails
    };
  };

  const recalculateAllItems = () => {
    const sameState = isSameState();
    const updatedItems = invoiceData.items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const gst = parseFloat(item.gst) || 0;
      const cess = parseFloat(item.cess) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      const cessAmount = amountAfterDiscount * (cess / 100);
      const total = amountAfterDiscount + gstAmount + cessAmount;
      
      let cgst, sgst, igst;
      
      if (sameState) {
        cgst = gst / 2;
        sgst = gst / 2;
        igst = 0;
      } else {
        cgst = 0;
        sgst = 0;
        igst = gst;
      }
      
      return {
        ...item,
        total: total.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2)
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
      batchDetails: selectedBatchDetails
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
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const cess = parseFloat(item.cess) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const cessAmount = amountAfterDiscount * (cess / 100);
      
      return sum + cessAmount;
    }, 0);
    
    const additionalChargeAmount = parseFloat(invoiceData.additionalChargeAmount) || 0;
    const grandTotal = taxableAmount + totalGST + totalCess + additionalChargeAmount;
    
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
        gstin: "29AABCD0503B1ZG",
        state: "Karnataka"
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
      totalGST: 0,
      totalCess: 0,
      grandTotal: 0,
      transportDetails: "",
      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      batchDetails: []
    };
    
    setInvoiceData(resetData);
    localStorage.setItem('draftInvoice', JSON.stringify(resetData));
    
    setSelected(false);
    setSelectedSupplierId(null);
    setIsPreviewReady(false);
    setSuccess("Draft cleared successfully!");
    setTimeout(() => setSuccess(false), 3000);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);
  
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

  // Validate batch availability for all items and get product IDs
  const validatedItems = [];
  for (const item of invoiceData.items) {
    const product = products.find(p => p.goods_name === item.product);
    if (!product) {
      setError(`Product "${item.product}" not found in database`);
      setLoading(false);
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Store the product_id for backend processing
    const validatedItem = {
      ...item,
      product_id: product.id, // Include product_id
      product_maintain_batch: product.maintain_batch
    };

    // If product maintains batches, validate batch selection and availability
    if (product.maintain_batch === 1) {
      if (!item.batch) {
        setError(`Batch selection is required for product "${item.product}" (batch-managed product)`);
        setLoading(false);
        setTimeout(() => setError(null), 5000);
        return;
      }

      try {
        const res = await fetch(`${baseurl}/products/${product.id}/batches`);
        if (!res.ok) {
          throw new Error(`Failed to fetch batches for ${item.product}`);
        }
        
        const batches = await res.json();
        const selectedBatch = batches.find(b => b.batch_number === item.batch);
        
        if (!selectedBatch) {
          const availableBatches = batches.map(b => b.batch_number).join(', ');
          setError(`Batch "${item.batch}" not found for product "${item.product}". Available batches: ${availableBatches}`);
          setLoading(false);
          setTimeout(() => setError(null), 5000);
          return;
        }
        
        const availableQuantity = parseFloat(selectedBatch.quantity) || 0;
        const requestedQuantity = parseFloat(item.quantity) || 0;
        
        if (availableQuantity < requestedQuantity) {
          setError(`Insufficient stock in batch "${item.batch}" for product "${item.product}". Available: ${availableQuantity}, Requested: ${requestedQuantity}`);
          setLoading(false);
          setTimeout(() => setError(null), 5000);
          return;
        }

        // Include batch details for backend
        validatedItem.batchDetails = selectedBatch;

        console.log(`✅ Batch validation passed for ${item.product}:`, {
          product_id: product.id,
          batch: item.batch,
          available: availableQuantity,
          requested: requestedQuantity
        });

      } catch (err) {
        console.error("Error validating batch:", err);
        setError(`Error validating batch for "${item.product}": ${err.message}`);
        setLoading(false);
        setTimeout(() => setError(null), 5000);
        return;
      }
    } else {
      // For non-batch products, validate overall stock availability
      const availableStock = parseFloat(product.balance_stock) || 0;
      const requestedQuantity = parseFloat(item.quantity) || 0;
      
      if (availableStock < requestedQuantity) {
        setError(`Insufficient stock for product "${item.product}". Available: ${availableStock}, Requested: ${requestedQuantity}`);
        setLoading(false);
        setTimeout(() => setError(null), 5000);
        return;
      }

      console.log(`✅ Stock validation passed for ${item.product}:`, {
        product_id: product.id,
        available: availableStock,
        requested: requestedQuantity
      });
    }

    validatedItems.push(validatedItem);
  }

  // All validations passed, proceed with invoice submission
  try {
    const finalInvoiceNumber = invoiceData.invoiceNumber || nextInvoiceNumber;
    console.log('✅ All validations passed. Submitting invoice with number:', finalInvoiceNumber);

    // Calculate GST breakdown for backend
    const sameState = isSameState();
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    if (sameState) {
      totalCGST = parseFloat(invoiceData.totalGST) / 2;
      totalSGST = parseFloat(invoiceData.totalGST) / 2;
      totalIGST = 0;
    } else {
      totalCGST = 0;
      totalSGST = 0;
      totalIGST = parseFloat(invoiceData.totalGST);
    }

    // Prepare enhanced batch details with real-time product information
    const enhancedBatchDetails = validatedItems.map(item => {
      const product = products.find(p => p.goods_name === item.product);
      
      return {
        product: item.product,
        product_id: item.product_id, // This is now guaranteed to be present
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        gst: item.gst,
        cgst: item.cgst,
        sgst: item.sgst,
        igst: item.igst,
        cess: item.cess,
        total: item.total,
        batch: item.batch || '',
        batchDetails: item.batchDetails || null,
        // Include product info for backend processing
        product_maintain_batch: product?.maintain_batch || 0,
        product_balance_stock: product?.balance_stock || 0
      };
    });

    // Create payload with complete data - USE VALIDATED ITEMS
    const payload = {
      ...invoiceData,
      items: validatedItems, // Use the validated items with product_ids
      invoiceNumber: finalInvoiceNumber,
      selectedSupplierId: selectedSupplierId,
      type: 'sales',
      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalIGST: totalIGST.toFixed(2),
      taxType: sameState ? "CGST/SGST" : "IGST",
      batchDetails: enhancedBatchDetails,
      // Include addresses for backend storage
      billing_address_line1: invoiceData.billingAddress.addressLine1,
      billing_address_line2: invoiceData.billingAddress.addressLine2,
      billing_city: invoiceData.billingAddress.city,
      billing_pin_code: invoiceData.billingAddress.pincode,
      billing_state: invoiceData.billingAddress.state,
      shipping_address_line1: invoiceData.shippingAddress.addressLine1,
      shipping_address_line2: invoiceData.shippingAddress.addressLine2,
      shipping_city: invoiceData.shippingAddress.city,
      shipping_pin_code: invoiceData.shippingAddress.pincode,
      shipping_state: invoiceData.shippingAddress.state,
      // Include validation timestamp
      validated_at: new Date().toISOString()
    };

    console.log('📤 Submitting validated payload:', {
      invoiceNumber: payload.invoiceNumber,
      itemsCount: payload.items.length,
      itemsWithProductIds: payload.items.map(i => ({ product: i.product, product_id: i.product_id })),
      batchDetailsCount: payload.batchDetails.length,
      totalAmount: payload.grandTotal
    });

    const response = await fetch(`${baseurl}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to submit invoice');
    }
    
    localStorage.removeItem('draftInvoice');
    setSuccess('Invoice submitted successfully! Stock updated automatically.');
    setIsPreviewReady(true);

    // Update preview data with the submitted invoice data
    const previewData = {
      ...invoiceData,
      invoiceNumber: responseData.invoiceNumber || finalInvoiceNumber,
      voucherId: responseData.voucherId,
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    
    // Navigate to preview page WITH THE ID from backend response
    const previewId = responseData.voucherId || responseData.invoiceNumber;
    
    console.log('✅ Invoice submitted successfully. Navigating to preview:', previewId);
    
    setTimeout(() => {
      navigate(`/sales/invoice-preview/${previewId}`);
    }, 2000);
    
  } catch (err) {
    console.error('❌ Invoice submission error:', err);
    setError(`Failed to submit invoice: ${err.message}`);
    setTimeout(() => setError(null), 5000);
  } finally {
    setLoading(false);
  }
};

  const calculateTotalPrice = () => {
    const price = parseFloat(itemForm.price) || 0;
    const gst = parseFloat(itemForm.gst) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    const quantity = parseInt(itemForm.quantity) || 0;

    const priceAfterDiscount = price - (price * discount) / 100;
    const priceWithGst = priceAfterDiscount + (priceAfterDiscount * gst) / 100;
    return (priceWithGst * quantity).toFixed(2);
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
              <h3 className="text-primary">Create Invoice</h3>
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
            
            {/* Tax Type Indicator */}
            {invoiceData.supplierInfo.state && (
              <Alert variant={isSameState() ? "success" : "warning"} className="mb-3">
                <strong>Tax Type: </strong>
                {isSameState() ? (
                  <>CGST & SGST (Same State - {invoiceData.companyInfo.state})</>
                ) : (
                  <>IGST (Inter-State: {invoiceData.companyInfo.state} to {invoiceData.supplierInfo.state})</>
                )}
              </Alert>
            )}
            
            <div className="invoice-box p-3 bg-light rounded">
              <h5 className="section-title text-primary mb-3">Create Invoice</h5>

              {/* Company Info Section */}
              <Row className="mb-3 company-info bg-white p-3 rounded">
                <Col md={8}>
                  <div>
                    <strong className="text-primary">{invoiceData.companyInfo.name}</strong><br />
                    {invoiceData.companyInfo.address}<br />
                    Email: {invoiceData.companyInfo.email}<br />
                    Phone: {invoiceData.companyInfo.phone}<br />
                    GSTIN: {invoiceData.companyInfo.gstin}<br />
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
                      readOnly
                    />
                    <Form.Label className="fw-bold">Invoice No</Form.Label>
                    {!hasFetchedInvoiceNumber && (
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
                          <strong className="text-primary">Retailer Info</strong>
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
                                  name: supplier.display_name,
                                  businessName: supplier.business_name,
                                  state: supplier.billing_state,
                                  gstin: supplier.gstin
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
                          <div><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin}</div>
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
                <h6 className="text-primary mb-3">Add Items</h6>
                <Row className="align-items-end">
                  <Col md={2}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="mb-0 fw-bold">Item</Form.Label>
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

                            // Fetch available batches for this product
                            await fetchBatchesForProduct(selectedName);
                          }
                        }}
                        className="border-primary"
                      >
                        <option value="">Select Product</option>
                        {products
                          .filter((p) => p.group_by === "Salescatalog")
                          .map((p) => (
                            <option key={p.id} value={p.goods_name}>
                              {p.goods_name} {p.maintain_batch ? '(Batch Managed)' : ''}
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
                        }}
                        disabled={batches.length === 0}
                      >
                        <option value="">Select Batch</option>
                        {batches.map((batch) => (
                          <option key={batch.id} value={batch.batch_number}>
                            {batch.batch_number} (Available: {batch.quantity})
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
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Label className="fw-bold">GST (%)</Form.Label>
                    <Form.Control
                      name="gst"
                      type="number"
                      value={itemForm.gst}
                      readOnly
                      className="border-primary bg-light"
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
                    <Button variant="success" onClick={addItem} className="w-100">
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
                      <th>GST</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>IGST</th>
                      <th>CESS</th>
                      <th>TOTAL</th>
                      <th>BATCH</th>
                      <th>BATCH DETAILS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="text-center text-muted py-3">
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
                          <td className="text-center">{item.gst}%</td>
                          <td className="text-center">{item.cgst}%</td>
                          <td className="text-center">{item.sgst}%</td>
                          <td className="text-center">{item.igst}%</td>
                          <td className="text-center">{item.cess}</td>
                          <td className="text-end fw-bold">₹{item.total}</td>
                          <td>{item.batch}</td>
                          <td>
                            {item.batchDetails && (
                              <small>
                                MFG: {item.batchDetails.mfg_date || item.batchDetails.manufacturing_date}<br/>
                                EXP: {item.batchDetails.exp_date || item.batchDetails.expiry_date}
                              </small>
                            )}
                          </td>
                          <td className="text-center">
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
                      <div className="mb-2 fw-bold">Total GST</div>
                      <div className="mb-2 fw-bold">Total Cess</div>
                      <div className="mb-2 fw-bold">Additional Charges</div>
                      <div className="mb-2 fw-bold text-success">Grand Total</div>
                    </Col>

                    <Col md={6} className="d-flex flex-column align-items-end">
                      <div className="mb-2">₹{invoiceData.taxableAmount}</div>
                      <div className="mb-2">₹{invoiceData.totalGST}</div>
                      <div className="mb-2">₹{invoiceData.totalCess}</div>

                      <Form.Select
                        className="mb-2 border-primary"
                        style={{ width: "100%" }}
                        value={invoiceData.additionalCharge || ""}
                        onChange={(e) => {
                          handleInputChange(e);
                          setInvoiceData(prev => ({
                            ...prev,
                            additionalChargeAmount: e.target.value ? 100 : 0
                          }));
                        }}
                        name="additionalCharge"
                      >
                        <option value="">Select Additional Charges</option>
                        <option value="Packing">Packing Charges</option>
                        <option value="Transport">Transport Charges</option>
                        <option value="Service">Service Charges</option>
                      </Form.Select>

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
                  {loading ? 'Submitting...' : 'Submit Invoice'}
                </Button>
                <Button 
                  variant="info" 
                  className="me-3 px-4"
                  onClick={handlePreview}
                  disabled={!isPreviewReady}
                >
                  {isPreviewReady ? 'View Invoice Preview' : 'Submit to Enable Preview'}
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