import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import './Invoices.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaEye, FaSave, FaTimes } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate, useParams } from "react-router-dom";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [isPriceEditing, setIsPriceEditing] = useState(false);
const [tempPrice, setTempPrice] = useState("");
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
        name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
        address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
        email: "spmathur56@gmail.com",
        phone: "9801049700",
        gstin: "10AAOCS1541B1ZZ",
        state: "Bihar"
      },
      supplierInfo: {
        name: "",
        business_name: "",
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
    product_id: "",
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
        
        if (apiData.staffid) {
          setSelectedStaffId(apiData.staffid);
        }
        
        setSuccess('Invoice loaded for editing');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('No valid data received');
      }
    } catch (err) {
      console.error('Error fetching invoice for edit:', err);
      setError('Failed to load invoice for editing: ' + err.message);
      setTimeout(() => setError(null), 5000);
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
      const gst = parseFloat(batch.gst) || 0;
      const cess = parseFloat(batch.cess) || 0;
      
      // Calculate item total
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      const cessAmount = amountAfterDiscount * (cess / 100);
      const total = amountAfterDiscount + gstAmount + cessAmount;

      return {
        product: batch.product || 'Product',
        product_id: batch.product_id || '',
        description: batch.description || '',
        quantity: quantity,
        price: price,
        discount: discount,
        gst: gst,
        cgst: parseFloat(batch.cgst) || 0,
        sgst: parseFloat(batch.sgst) || 0,
        igst: parseFloat(batch.igst) || 0,
        cess: cess,
        total: total.toFixed(2),
        batch: batch.batch || '',
        batch_id: batch.batch_id || '',
        batchDetails: batch.batchDetails || null,
        assigned_staff: batch.assigned_staff || apiData.assigned_staff || apiData.AssignedStaff || 'N/A'
      };
    }) || [];

    // Find the account details to get business_name
    const account = accounts.find(acc => acc.id === apiData.PartyID);
    
    return {
      voucherId: apiData.VoucherID,
      invoiceNumber: apiData.InvoiceNumber || `INV${apiData.VoucherID}`,
      invoiceDate: apiData.Date ? new Date(apiData.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validityDate: apiData.Date ? new Date(new Date(apiData.Date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      
      companyInfo: {
        name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
        address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
        email: "spmathur56@gmail.com",
        phone: "9801049700",
        gstin: "10AAOCS1541B1ZZ",
        state: "Bihar"
      },
      
      supplierInfo: {
        name: apiData.PartyName || 'Customer',
 business_name: account?.business_name || apiData.business_name || 'Business',
  account_name: account?.account_name || apiData.account_name || 'Busines',
          gstin: apiData.gstin || '',
        state: apiData.billing_state || apiData.BillingState || '',
        id: apiData.PartyID || null,
        staffid: apiData.staffid || apiData.staff_id || null,
        assigned_staff: apiData.assigned_staff || apiData.AssignedStaff || account?.assigned_staff || 'N/A',
        
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
      totalGST: parseFloat(apiData.TaxAmount) || 0,
      grandTotal: parseFloat(apiData.TotalAmount) || 0,
      totalCess: "0.00",
      transportDetails: apiData.Freight && apiData.Freight !== "0.00" ? `Freight: ₹${apiData.Freight}` : "Standard delivery",
      additionalCharge: "",
      additionalChargeAmount: "0.00",
      taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST",
      
      staffid: apiData.staffid || apiData.staff_id || null,
      assigned_staff: apiData.assigned_staff || apiData.AssignedStaff || 'N/A'
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

  // Check if states are same for GST calculation
  const isSameState = () => {
    const companyState = invoiceData.companyInfo.state;
    const billingState = invoiceData.billingAddress?.state;
    const shippingState = invoiceData.shippingAddress?.state;
    
    // Use billing state primarily, fallback to shipping state
    const supplierState = billingState || shippingState;
    
    if (!companyState || !supplierState) {
      return true; // Default to same state if not specified
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
  }, [invoiceData.supplierInfo.state, invoiceData.billingAddress.state, invoiceData.shippingAddress.state]);

  // Open PDF preview - ONLY after form is submitted
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

    const calculatedItem = calculateItemTotal();
    


    const finalItem = {
      ...calculatedItem,
      batch: selectedBatch,
      batch_id: itemForm.batch_id,
      product_id: itemForm.product_id,
      batchDetails: selectedBatchDetails
    };

    if (editingItemIndex !== null) {
      // Update existing item
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.map((item, index) => 
          index === editingItemIndex ? finalItem : item
        )
      }));
      setEditingItemIndex(null);
      setSuccess(`Item "${finalItem.product}" updated successfully!`);
    } else {
      // Add new item
      setInvoiceData(prev => ({
        ...prev,
        items: [...prev.items, finalItem]
      }));
      setSuccess(`Item "${finalItem.product}" added successfully!`);
    }
    
    setTimeout(() => setSuccess(false), 2000);

    // Reset form
    setItemForm({
      product: "",
      product_id: "",
      description: "",
      quantity: 0,
      price: 0,
      discount: 0,
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
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
    
    // Set the form fields with the item data
    setItemForm({
      product: itemToEdit.product,
      product_id: itemToEdit.product_id,
      description: itemToEdit.description,
      quantity: itemToEdit.quantity,
      price: itemToEdit.price,
      discount: itemToEdit.discount,
      gst: itemToEdit.gst,
      cgst: itemToEdit.cgst,
      sgst: itemToEdit.sgst,
      igst: itemToEdit.igst,
      cess: itemToEdit.cess,
      total: itemToEdit.total,
      batch: itemToEdit.batch,
      batch_id: itemToEdit.batch_id,
      batchDetails: itemToEdit.batchDetails
    });
    
    setSelectedBatch(itemToEdit.batch);
    setSelectedBatchDetails(itemToEdit.batchDetails);
    setEditingItemIndex(index);
    
    // Fetch batches for the product
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
      quantity: 0,
      price: 0,
      discount: 0,
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
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
         name: "SHREE SHASHWAT RAJ AGRO PVT.LTD.",
      address: "PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113",
      email: "spmathur56@gmail.com",
      phone: "9801049700",
      gstin: "10AAOCS1541B1ZZ",
      state: "Bihar"
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

    try {
      const finalInvoiceNumber = invoiceData.invoiceNumber || nextInvoiceNumber;
      console.log('Submitting invoice with number:', finalInvoiceNumber);

      // Get staff information
      const staffAccount = accounts.find(acc => acc.staffid == selectedStaffId);
      const staffName = staffAccount?.assigned_staff || 
                       invoiceData.supplierInfo.assigned_staff || 
                       accounts.find(acc => acc.id == selectedSupplierId)?.assigned_staff ||
                       'N/A';

      // Calculate GST AMOUNTS for voucher table
      const sameState = isSameState();
      let totalCGSTAmount = 0;
      let totalSGSTAmount = 0;
      let totalIGSTAmount = 0;
      
      // Calculate percentages for voucher table
      let totalCGSTPercentage = 0;
      let totalSGSTPercentage = 0;
      let totalIGSTPercentage = 0;

      // Calculate GST amounts item by item
      invoiceData.items.forEach((item, index) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const discount = parseFloat(item.discount) || 0;
        const gst = parseFloat(item.gst) || 0;
        
        const subtotal = quantity * price;
        const discountAmount = subtotal * (discount / 100);
        const amountAfterDiscount = subtotal - discountAmount;
        const gstAmount = amountAfterDiscount * (gst / 100);
        
        if (sameState) {
          // Same state: GST amount divided equally
          totalCGSTAmount += gstAmount / 2;
          totalSGSTAmount += gstAmount / 2;
          totalCGSTPercentage = gst / 2; 
          totalSGSTPercentage = gst / 2; 
          totalIGSTPercentage = 0;      
        } else {
          // Different state: Full GST as IGST
          totalIGSTAmount += gstAmount;
          totalIGSTPercentage = gst;      // Percentage: 5 for 5% GST
        }
      });


      // Extract batch details from items with PERCENTAGES for items table
      const batchDetails = invoiceData.items.map(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const discount = parseFloat(item.discount) || 0;
        
        return {
          product: item.product,
          product_id: item.product_id,
          description: item.description,
          batch: item.batch,
          batch_id: item.batch_id,
          quantity: quantity,
          price: price,
          discount: discount,
          gst: parseFloat(item.gst) || 0,          
          cgst: parseFloat(item.cgst) || 0,        
          sgst: parseFloat(item.sgst) || 0,       
          igst: parseFloat(item.igst) || 0,       
          cess: parseFloat(item.cess) || 0,
          total: parseFloat(item.total) || 0,
          batchDetails: item.batchDetails,
          assigned_staff: staffName
        };
      });

      // Get product_id and batch_id for logging
      const firstItemProductId = invoiceData.items[0]?.product_id || null;
      const firstItemBatchId = invoiceData.items[0]?.batch_id || null;
      
      const payload = {
        ...invoiceData,
        invoiceNumber: finalInvoiceNumber,
        selectedSupplierId: selectedSupplierId,
        staffid: selectedStaffId,
        assigned_staff: staffName,
        staffName: staffName,
        type: 'sales',
         TransactionType: "Sales", 
        CGSTAmount: totalCGSTAmount.toFixed(2),   
        SGSTAmount: totalSGSTAmount.toFixed(2),    
        IGSTAmount: totalIGSTAmount.toFixed(2),   
        
        CGSTPercentage: totalCGSTPercentage.toFixed(2),
        SGSTPercentage: totalSGSTPercentage.toFixed(2), 
        IGSTPercentage: totalIGSTPercentage.toFixed(2), 
        
        taxType: sameState ? "CGST/SGST" : "IGST",
        batchDetails: batchDetails,  
        product_id: 123,
        batch_id: "bth0001",
        primaryProductId: firstItemProductId,
        primaryBatchId: firstItemBatchId,
        PartyID: selectedSupplierId,
        AccountID: invoiceData.supplierInfo.accountId,
        PartyName: invoiceData.supplierInfo.name,
  account_name: invoiceData.supplierInfo.account_name || 
                accounts.find(acc => acc.id === selectedSupplierId)?.account_name || 
                invoiceData.supplierInfo.name,
  business_name: invoiceData.supplierInfo.business_name || 
                 accounts.find(acc => acc.id === selectedSupplierId)?.business_name || 
                 invoiceData.supplierInfo.name
};     

      console.log('🚀 Final Payload to Backend:', {
        // Voucher table amounts
        "CGST Amount (Voucher)": `₹${payload.CGSTAmount}`,
        "SGST Amount (Voucher)": `₹${payload.SGSTAmount}`,
        "IGST Amount (Voucher)": `₹${payload.IGSTAmount}`,
        
        // Voucher table percentages
        "CGST % (Voucher)": `${payload.CGSTPercentage}%`,
        "SGST % (Voucher)": `${payload.SGSTPercentage}%`,
        "IGST % (Voucher)": `${payload.IGSTPercentage}%`,
        
        // Items table percentages
        "Items GST Data": batchDetails.map(item => ({
          product: item.product,
          "GST %": `${item.gst}%`,
          "CGST %": `${item.cgst}%`,
          "SGST %": `${item.sgst}%`,
          "IGST %": `${item.igst}%`
        }))
      });

      // Remove unused fields
      delete payload.companyState;
      delete payload.supplierState;
      delete payload.items;
      
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
        console.log('🆕 Creating new invoice with staffid:', selectedStaffId);
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
      
      localStorage.removeItem('draftInvoice');
      setSuccess(isEditMode ? 'Invoice updated successfully!' : 'Invoice submitted successfully!');
      setIsPreviewReady(true);

      // Store preview data
      const previewData = {
        ...invoiceData,
        invoiceNumber: responseData.invoiceNumber || finalInvoiceNumber,
        voucherId: responseData.voucherId || editingVoucherId,
        product_id: responseData.product_id || firstItemProductId,
        batch_id: responseData.batch_id || firstItemBatchId,
        staffid: responseData.staffid || selectedStaffId,
        assigned_staff: responseData.assigned_staff || staffName,
        staffName: responseData.staffName || staffName,
        supplierInfo: {
          ...invoiceData.supplierInfo,
          staffid: responseData.staffid || selectedStaffId,
          assigned_staff: responseData.assigned_staff || staffName
        }
      };
      
      localStorage.setItem('previewInvoice', JSON.stringify(previewData));
      
      // Navigate to preview page with voucher ID
      setTimeout(() => {
        navigate(`/sales/invoice-preview/${responseData.voucherId || editingVoucherId}`);
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
            
            {/* Tax Type Indicator */}
            {invoiceData.billingAddress?.state && (
              <Alert variant={isSameState() ? "success" : "warning"} className="mb-3">
                <strong>Tax Type: </strong>
                {isSameState() ? (
                  <>CGST & SGST (Same State - Company: {invoiceData.companyInfo.state}, Customer: {invoiceData.billingAddress?.state})</>
                ) : (
                  <>IGST (Inter-State: Company: {invoiceData.companyInfo.state} → Customer: {invoiceData.billingAddress?.state})</>
                )}
              </Alert>
            )}
            
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
                        disabled   
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

  if (selectedName === "") {
    setSelected(false);
    setSelectedSupplierId(null);
    setSelectedStaffId("");
    setItemForm(prev => ({ ...prev, discount: 0 })); // Reset discount
    return;
  }

  const supplier = accounts.find(acc => acc.business_name === selectedName);
  if (supplier) {
    setSelectedSupplierId(supplier.id);
    setSelected(true);

    if (supplier.staffid) {
      setSelectedStaffId(supplier.staffid);
    }

    const retailerDiscount = parseFloat(supplier.discount) || 0;

    setInvoiceData(prev => ({
      ...prev,
      supplierInfo: {
        name: supplier.gstin ? supplier.display_name : supplier.name,
        state: supplier.billing_state,
        gstin: supplier.gstin,
        accountId: supplier.id,
        staffid: supplier.staffid,
        business_name: supplier.business_name,
        account_name: supplier.account_name,
        assigned_staff: supplier.assigned_staff,
        discount: retailerDiscount // optional: store it
      },
      billingAddress: {
        addressLine1: supplier.billing_address_line1,
        addressLine2: supplier.billing_address_line2 || "",
        city: supplier.billing_city,
        pincode: supplier.billing_pin_code,
        state: supplier.billing_state
      },
      shippingAddress: {
        addressLine1: supplier.shipping_address_line1 || supplier.billing_address_line1,
        addressLine2: supplier.shipping_address_line2 || supplier.billing_address_line2 || "",
        city: supplier.shipping_city || supplier.billing_city,
        pincode: supplier.shipping_pin_code || supplier.billing_pin_code,
        state: supplier.shipping_state || supplier.billing_state
      }
    }));

    // THIS IS THE MAIN FIX: Apply discount to new items
    setItemForm(prev => ({
      ...prev,
      discount: retailerDiscount
    }));
  }
}}
>
            <option value="">Select Retailer </option>
            {accounts
              .filter(acc => acc.role === "retailer")
              .map(acc => (
<option key={acc.id} value={acc.business_name}>
  {acc.gstin?.trim()
    ? acc.display_name || acc.name
    : acc.name || acc.display_name}
</option>
            
              ))}
          </Form.Select>
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="text-primary">Customer Info</strong>
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
<div><strong>Business:</strong> {invoiceData.supplierInfo.business_name || invoiceData.supplierInfo.businessName}</div> 
            <div><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin}</div>
            <div><strong>State:</strong> {invoiceData.supplierInfo.state}</div>
            {/* Display assigned staff from the selected retailer */}
            {selectedStaffId && (
              <div><strong>Assigned Staff:</strong> {
                accounts.find(acc => acc.staffid == selectedStaffId)?.assigned_staff || 
                invoiceData.supplierInfo.assigned_staff ||
                "Not Assigned"
              }</div>
            )}
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
              <div className="item-section mb-3 mt-3 bg-white p-2 rounded">
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
    const selectedProduct = products.find(
      (p) => p.goods_name === selectedName
    );

if (selectedProduct) {
  // Get current retailer discount
  const retailerDiscount = parseFloat(
    accounts.find(acc => acc.id === selectedSupplierId)?.discount || 0
  ) || 0;

  setItemForm(prev => ({
    ...prev,
    product: selectedProduct.goods_name,
    product_id: selectedProduct.id,
    price: selectedProduct.net_price || 0,
    gst: parseFloat(selectedProduct.gst_rate?.replace("%", "") || 0),
    description: selectedProduct.description || "",
    discount: retailerDiscount,  
    quantity: prev.quantity || 1,
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
            price: defaultBatch.selling_price
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
        gst: 0,
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
    .filter(
        (p) =>
        (p.group_by === "Salescatalog" ||
        p.can_be_sold === 1 ||
        p.can_be_sold === true) &&
        p.product_type === "PAKKA" 
    )
    .map((p) => (
      <option key={p.id} value={p.goods_name}>
        {p.goods_name}
      </option>
    ))}
</Form.Select>


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
const currentDiscount = itemForm.discount || 0;
      if (batch) {
        setItemForm(prev => ({
          ...prev,
          batch: batchNumber,
          batch_id: batch.batch_number,
          price: batch.selling_price,
          discount: currentDiscount  
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
{/* <Col md={2}>
  <div className="d-flex align-items-center justify-content-between mb-1">
    <Form.Label className="fw-bold text-primary mb-0">
      Price (₹)
    </Form.Label>

    <div className="d-flex gap-2">
      {!isPriceEditing ? (
        <FaEdit
          className="text-warning cursor-pointer"
          size={14}
          title="Click to edit price manually"
          onClick={() => {
            setIsPriceEditing(true);
            setTempPrice(itemForm.price || "");
            window.alert("✏️ You can now edit the price manually.");
          }}
          style={{ cursor: "pointer" }}
        />
      ) : (
        <>
          <FaSave
            className="text-success cursor-pointer"
            size={14}
            title="Save price"
            onClick={() => {
              const newPrice = parseFloat(tempPrice) || 0;
              setItemForm(prev => ({
                ...prev,
                price: newPrice
              }));
              setIsPriceEditing(false);
              setTempPrice("");
              window.alert(`✅ Manual price updated successfully!\nNew Price: ₹${newPrice.toFixed(2)}`);
            }}
            style={{ cursor: "pointer" }}
          />
          <FaTimes
            className="text-danger cursor-pointer"
            size={14}
            title="Cancel editing"
            onClick={() => {
              setIsPriceEditing(false);
              setTempPrice("");
              window.alert("❌ Price editing cancelled. Reverted to original price.");
            }}
            style={{ cursor: "pointer" }}
          />
        </>
      )}
    </div>
  </div>

  <Form.Control
    name="price"
    type="number"
    step="0.01"
    min="0"
    value={isPriceEditing ? tempPrice : (itemForm.price || "")}
    onChange={(e) => {
      if (isPriceEditing) {
        setTempPrice(e.target.value);
      }
    }}
    placeholder={isPriceEditing ? "Enter custom price" : "Auto-filled / Click edit icon"}
    className={`border-primary shadow-sm ${!isPriceEditing ? 'bg-light' : 'border-success'}`}
    readOnly={!isPriceEditing}
    style={{ 
      fontWeight: "500",
      height: "42px"
    }}
  />


</Col> */}


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
      // fontWeight: "500",
      height: "42px"
    }}
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
<Col md={1} className="sales-invoice-add px-0">
  <div className="d-flex flex-column h-100 justify-content-end">
    <Button 
      variant={editingItemIndex !== null ? "warning" : "success"} 
      onClick={addItem} 
      className="sales-invoice-add-btn mb-1"
      size="sm"
    >
      {editingItemIndex !== null ? <FaSave /> : "Add"}
    </Button>

    {editingItemIndex !== null && (
      <Button 
        variant="secondary" 
        onClick={cancelEdit} 
        className="sales-invoice-cancel-btn"
        size="sm"
      >
        <FaTimes />
      </Button>
    )}
  </div>
</Col>

</Row>
                <Row className="mt-3">
                  <Col>
                    <Form.Control
                      name="description"
                      value={itemForm.description}
                      onChange={handleItemChange}
                      placeholder="Product description"
                      readOnly
                      className="border-primary bg-light"
                      style={{width:'1150px', marginLeft:"10px"}}
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
<td className="salesinvoice-edit">
  <div className="d-flex flex-column gap-1 align-items-center">
    <Button 
      variant="warning" 
      size="sm" 
      onClick={() => editItem(index)}
      className="w-100"
    >
      <FaEdit />
    </Button>
    <Button 
      variant="danger" 
      size="sm" 
      onClick={() => removeItem(index)}
      className="w-100"
    >
      <FaTrash />
    </Button>
  </div>
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
                      <div className="mb-2 fw-bold text-success">Grand Total</div>
                    </Col>

                    <Col md={6} className="d-flex flex-column align-items-end">
                      <div className="mb-2">₹{invoiceData.taxableAmount}</div>
                      <div className="mb-2">₹{invoiceData.totalGST}</div>
                      <div className="mb-2">₹{invoiceData.totalCess}</div>
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