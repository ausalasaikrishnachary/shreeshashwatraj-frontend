import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { BsPlus } from 'react-icons/bs';
import AddCompanyModal from './AddCompanyModal';
import AddCategoryModal from '../PurchasedItems/AddCategoryModal';
import AddUnitModal from '../Sales_catalogue/AddUnitsModal';
import axios from 'axios';
import { baseurl } from './../../../../BaseURL/BaseURL';
import AdminSidebar from './../../../../Shared/AdminSidebar/AdminSidebar';
import Header from './../../../../Shared/AdminSidebar/AdminHeader';
import { useNavigate, useParams } from 'react-router-dom';
import './purchaseitem.css';
import Barcode from 'react-barcode';

const AddProductPage = ({ groupType = 'Purchaseditems', user }) => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [maintainBatch, setMaintainBatch] = useState(false);
  const [batches, setBatches] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [unitOptions, setUnitOptions] = useState([]);
  const [showUnitModal, setShowUnitModal] = useState(false);

  // Tax calculation function
  const calculateTaxAndNetPrice = (price, gstRate, inclusiveGst) => {
    if (!price || !gstRate) return { netPrice: price || '', taxAmount: 0 };

    const numericPrice = parseFloat(price);
    const numericGstRate = parseFloat(gstRate) / 100;

    if (inclusiveGst === 'Inclusive') {
      const taxAmount = (numericPrice * numericGstRate) / (1 + numericGstRate);
      const netPrice = numericPrice - taxAmount;
      return {
        netPrice: netPrice.toFixed(2),
        taxAmount: taxAmount.toFixed(2)
      };
    } else {
      const taxAmount = numericPrice * numericGstRate;
      const netPrice = numericPrice + taxAmount;
      return {
        netPrice: netPrice.toFixed(2),
        taxAmount: taxAmount.toFixed(2)
      };
    }
  };

  // Calculate total stock from batches
  const calculateTotalStockFromBatches = () => {
    if (!batches || batches.length === 0) return 0;
    return batches.reduce((total, batch) => total + (parseFloat(batch.quantity) || 0), 0);
  };

  // Calculate maximum MRP from batches
  const calculateMaxMRPFromBatches = () => {
    if (!batches || batches.length === 0) return 0;
    const maxMRP = Math.max(...batches.map(batch => parseFloat(batch.mrp) || 0));
    return maxMRP > 0 ? maxMRP : 0;
  };

  // Calculate maximum selling price from batches
  const calculateMaxSellingPriceFromBatches = () => {
    if (!batches || batches.length === 0) return 0;
    const maxSellingPrice = Math.max(...batches.map(batch => parseFloat(batch.sellingPrice) || 0));
    return maxSellingPrice > 0 ? maxSellingPrice : 0;
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${baseurl}/units`);
      setUnitOptions(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
      showAlert('Error fetching units', 'danger');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
    fetchUnits();
  }, []);

  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) {
        setIsDataLoaded(true);
        return;
      }

      console.log('🔄 Loading product data for editing...');
      setIsLoading(true);

      try {
        console.log('🔄 Fetching product by ID:', productId);
        await fetchProductById(productId);
        console.log('✅ Form data set successfully');
        setIsDataLoaded(true);
      } catch (error) {
        console.error('❌ Error loading product data:', error);
        showAlert('Error loading product data', 'danger');
        setIsDataLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [productId, groupType]);

const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`${baseurl}/products/${id}`);
    const product = response.data;
    console.log('📦 Fetched product:', product);

    // Calculate max values from product data
    const productPurchasePrice = product.purchase_price || 0;
    const productSellingPrice = product.selling_price || 0; // ADD THIS
    const productMRP = product.mrp || 0; // ADD THIS
    let batchPurchasePrice = 0;
    let batchSellingPrice = 0; // ADD THIS
    let batchMRP = 0; // ADD THIS
    
    if (product.batches && product.batches.length > 0) {
      batchPurchasePrice = Math.max(...product.batches.map(b => parseFloat(b.purchasePrice) || 0));
      batchSellingPrice = Math.max(...product.batches.map(b => parseFloat(b.sellingPrice) || 0)); // ADD THIS
      batchMRP = Math.max(...product.batches.map(b => parseFloat(b.mrp) || 0)); // ADD THIS
    }
    
    const finalPurchasePrice = Math.max(productPurchasePrice, batchPurchasePrice);
    const finalSellingPrice = Math.max(productSellingPrice, batchSellingPrice); // ADD THIS
    const finalMRP = Math.max(productMRP, batchMRP); // ADD THIS

    setFormData({
      group_by: product.group_by || groupType,
      goods_name: product.goods_name || product.name || '',
      category_id: product.category_id || '',
      company_id: product.company_id || '',
      purchase_price: product.purchase_price || finalPurchasePrice,
      selling_price: product.selling_price || finalSellingPrice, // ADD THIS
      mrp: product.mrp || finalMRP, // ADD THIS
      inclusive_gst: product.inclusive_gst || '',
      gst_rate: product.gst_rate || '',
      non_taxable: product.non_taxable || '',
      net_price: product.net_price || '',
      hsn_code: product.hsn_code || '',
      unit: product.unit || 'UNT-UNITS',
      cess_rate: product.cess_rate || '',
      cess_amount: product.cess_amount || '',
      sku: product.sku || '',
      opening_stock: product.opening_stock || (product.batches && product.batches[0] ? product.batches[0].opening_stock : ''),
      opening_stock_date: product.opening_stock_date ? product.opening_stock_date.split('T')[0] : new Date().toISOString().split('T')[0],
      min_stock_alert: product.min_stock_alert || '',
      max_stock_alert: product.max_stock_alert || '',
      description: product.description || '',
      maintain_batch: product.maintain_batch || false,
      can_be_sold: product.can_be_sold || false,
    });

    setMaintainBatch(product.maintain_batch || false);
    await fetchBatches(id);
  } catch (error) {
    console.error('Error fetching product:', error);
    showAlert('Error fetching product data', 'danger');
  }
};

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseurl}/categories`);
      setCategoryOptions(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Error fetching categories', 'danger');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${baseurl}/companies`);
      setCompanyOptions(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      showAlert('Error fetching companies', 'danger');
    }
  };

  const fetchBatches = async (id = productId) => {
    if (!id) {
      setBatches([]);
      return;
    }

    try {
      const response = await axios.get(`${baseurl}/products/${id}/batches`);
      const mappedBatches = response.data?.length
        ? response.data.map(batch => ({
          id: batch.id,
          dbId: batch.id,
          batchNumber: batch.batch_number || '',
          mfgDate: batch.mfg_date?.split('T')[0] || '',
          expDate: batch.exp_date?.split('T')[0] || '',
          quantity: batch.quantity || '',
          costPrice: batch.cost_price || '',
          opening_stock: batch.opening_stock || '',
          sellingPrice: batch.selling_price || '',
          purchasePrice: batch.purchase_price || '',
          mrp: batch.mrp || '',
          barcode: batch.barcode || '',
          isExisting: true
        }))
        : [];
      console.log('📦 Fetched batches:', mappedBatches);
      setBatches(mappedBatches);
      
      // Update main prices from batches after fetching
      if (mappedBatches.length > 0) {
        const maxPurchasePrice = Math.max(...mappedBatches.map(b => parseFloat(b.purchasePrice) || 0));
        const maxMRP = calculateMaxMRPFromBatches();
        const maxSellingPrice = calculateMaxSellingPriceFromBatches();
        
        setFormData(prev => ({
          ...prev,
          purchase_price: maxPurchasePrice > 0 ? maxPurchasePrice : prev.purchase_price,
          mrp: maxMRP > 0 ? maxMRP : prev.mrp,
          selling_price: maxSellingPrice > 0 ? maxSellingPrice : prev.selling_price
        }));
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const generateUniqueBarcode = async () => {
    let isUnique = false;
    let newBarcode;
    let attempts = 0;
    const maxAttempts = 10; 

    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      
      // Generate 6-digit number as string
      newBarcode = Math.floor(100000 + Math.random() * 900000).toString();

      try {
        const response = await axios.get(`${baseurl}/batches/check-barcode/${newBarcode}`);
        if (response.data.available) {
          isUnique = true;
          console.log('✅ Generated unique 6-digit barcode:', newBarcode);
        } else {
          console.log('🔄 Barcode exists, generating new one...');
        }
      } catch (error) {
        console.error('Error checking barcode:', error);
        // fallback if API fails
        isUnique = true;
      }
    }

    // Fallback if still not unique after max attempts
    if (!isUnique) {
      newBarcode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('⚠️ Using fallback 6-digit barcode:', newBarcode);
    }

    return newBarcode;
  };

  const createDefaultBatch = async () => {
    const newBarcode = await generateUniqueBarcode();

    return {
      id: `temp_${Date.now()}_${Math.random()}`,
      dbId: null,
      batchNumber: '', // Empty for manual entry
      mfgDate: '',
      expDate: '',
      quantity: formData.opening_stock || '',
      costPrice: '',
      sellingPrice: formData.selling_price || '',
      purchasePrice: formData.purchase_price || '',
      mrp: formData.mrp || '',
      barcode: newBarcode,
      isExisting: false
    };
  };

  // Add this validation function
  const validateBatchNumber = async (batchNumber, currentBatchId = null) => {
    if (!batchNumber) return true; // Skip validation if empty

    try {
      const response = await axios.get(`${baseurl}/batches/check-batch-number`, {
        params: {
          batch_number: batchNumber,
          group_by: formData.group_by || 'Purchaseditems',
          product_id: productId || '' // Exclude current product for updates
        }
      });

      if (response.data.exists) {
        // Check if this is the same batch (during editing)
        if (currentBatchId) {
          const currentBatch = batches.find(b => b.id === currentBatchId);
          if (currentBatch && currentBatch.batchNumber === batchNumber) {
            return true; // It's the same batch, allow it
          }
        }
        return false; // Duplicate found
      }
      return true; // No duplicate
    } catch (error) {
      console.error('Error validating batch number:', error);
      return true; // Don't block if validation fails
    }
  };

  const handleBatchChange = async (index, e) => {
    const { name, value } = e.target;
    const updated = [...batches];
    updated[index][name] = value;

    // Validate batch number when it's changed
    if (name === 'batchNumber' && value) {
      const isValid = await validateBatchNumber(value, updated[index].id);
      if (!isValid) {
        window.alert(`Batch number "${value}" already exists in ${formData.group_by || 'Purchaseditems'}. Please select another batch number.`);
        // Revert the change
        updated[index][name] = batches[index][name];
      }
    }

    setBatches(updated);

    // Update main prices when batch prices change
    if (name === 'purchasePrice') {
      calculateAndUpdateMainPurchasePrice(updated);
    }
    
    if (name === 'sellingPrice') {
      calculateAndUpdateMainSellingPrice(updated);
    }
    
    if (name === 'mrp') {
      calculateAndUpdateMainMRP(updated);
    }
  };

  const calculateAndUpdateMainPurchasePrice = (updatedBatches) => {
    // Find maximum purchase price from all batches
    const maxPurchasePrice = Math.max(...updatedBatches.map(batch => parseFloat(batch.purchasePrice) || 0));
    
    // Update the main form purchase_price field with maximum value
    if (maxPurchasePrice > 0) {
      setFormData(prev => ({
        ...prev,
        purchase_price: maxPurchasePrice.toFixed(2)
      }));
    }
  };

  const calculateAndUpdateMainSellingPrice = (updatedBatches) => {
    // Find maximum selling price from all batches
    const maxSellingPrice = Math.max(...updatedBatches.map(batch => parseFloat(batch.sellingPrice) || 0));
    
    // Update the main form selling_price field with maximum value
    if (maxSellingPrice > 0) {
      setFormData(prev => ({
        ...prev,
        selling_price: maxSellingPrice.toFixed(2)
      }));
    }
  };

  const calculateAndUpdateMainMRP = (updatedBatches) => {
    // Find maximum MRP from all batches
    const maxMRP = Math.max(...updatedBatches.map(batch => parseFloat(batch.mrp) || 0));
    
    // Update the main form MRP field with maximum value
    if (maxMRP > 0) {
      setFormData(prev => ({
        ...prev,
        mrp: maxMRP.toFixed(2)
      }));
    }
  };

 const [formData, setFormData] = useState({
  group_by: groupType,
  goods_name: '',
  category_id: '',
  company_id: '',
  purchase_price: '',
  selling_price: '', // ADD THIS
  mrp: '', // ADD THIS
  inclusive_gst: 'Inclusive',
  gst_rate: '',
  non_taxable: '',
  net_price: '',
  hsn_code: '',
  unit: 'UNT-UNITS',
  cess_rate: '',
  cess_amount: '',
  sku: '',
  opening_stock: '',
  opening_stock_date: new Date().toISOString().split('T')[0],
  min_stock_alert: '',
  max_stock_alert: '',
  description: '',
  maintain_batch: false,
  can_be_sold: false,
});
const handleChange = async (e) => {
  const { name, value, type, checked } = e.target;

  const updatedFormData = {
    ...formData,
    [name]: type === 'checkbox' ? checked : value
  };

  // Update tax calculation when prices change
  if ((name === 'purchase_price' || name === 'gst_rate' || name === 'inclusive_gst') &&
    updatedFormData.purchase_price && updatedFormData.gst_rate) {
    const { netPrice } = calculateTaxAndNetPrice(
      updatedFormData.purchase_price,
      updatedFormData.gst_rate,
      updatedFormData.inclusive_gst
    );
    updatedFormData.net_price = netPrice;
  }

  // Sync main prices to batches for non-batch items
  if (!maintainBatch && batches.length > 0) {
    const updatedBatches = batches.map(batch => ({
      ...batch,
      purchasePrice: name === 'purchase_price' ? value : batch.purchasePrice,
      sellingPrice: name === 'selling_price' ? value : batch.sellingPrice,
      mrp: name === 'mrp' ? value : batch.mrp,
      quantity: name === 'opening_stock' ? value : batch.quantity
    }));
    setBatches(updatedBatches);
  }

  if (name === 'maintain_batch') {
    if (checked && batches.length === 0) {
      const defaultBatch = await createDefaultBatch();
      setBatches([defaultBatch]);
    } else if (!checked) {
      // Create default batch structure for non-batch items
      const defaultBatch = {
        id: `temp_${Date.now()}_${Math.random()}`,
        dbId: null,
        batchNumber: 'DEFAULT',
        mfgDate: '',
        expDate: '',
        quantity: updatedFormData.opening_stock || '',
        costPrice: 0,
        sellingPrice: updatedFormData.selling_price || '',
        purchasePrice: updatedFormData.purchase_price || '',
        mrp: updatedFormData.mrp || '',
        barcode: '',
        isExisting: false
      };
      setBatches([defaultBatch]);
    }
    setMaintainBatch(checked);
  }

  setFormData(updatedFormData);
};

  const addNewBatch = async () => {
    try {
      console.log('➕ Starting to add new batch...');
      console.log('📊 Current batches count:', batches.length);
      console.log('📦 Current product ID:', productId);

      const newBatch = await createDefaultBatch();
      console.log('✅ New batch created:', {
        batchNumber: newBatch.batchNumber,
        id: newBatch.id
      });

      setBatches(prev => {
        const updated = [...prev, newBatch];
        console.log('📦 Batches after add:', updated.map(b => b.batchNumber));

        return updated;
      });

    } catch (error) {
      console.error('❌ Error adding new batch:', error);
      showAlert('Error adding new batch. Please try again.', 'danger');
    }
  };

  const removeBatch = (id) => {
    if (batches.length <= 1 && maintainBatch) {
      showAlert('At least one batch is required when Maintain Batch is enabled.', 'warning');
      return;
    }

    const updated = batches.filter((b) => b.id !== id);
    setBatches(updated);

    // Recalculate main prices after removing batch
    calculateAndUpdateMainPurchasePrice(updated);
    calculateAndUpdateMainSellingPrice(updated);
    calculateAndUpdateMainMRP(updated);
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  // Calculate total stock for batch-managed products
  const calculateTotalStockFromBatches = () => {
    if (!batches || batches.length === 0) return 0;
    const total = batches.reduce((total, batch) => total + (parseFloat(batch.quantity) || 0), 0);
    console.log('📊 Calculated total stock from batches:', total);
    return total;
  };

  if (maintainBatch) {
    // Check for required fields
    const invalidBatches = batches.filter(
      (batch) => !batch.batchNumber || !batch.quantity || !batch.purchasePrice || !batch.barcode
    );

    if (invalidBatches.length > 0) {
      showAlert(
        'Please fill all required fields in batch details (Batch Number, Quantity, Purchase Price, and Barcode)',
        'danger'
      );
      setIsLoading(false);
      return;
    }

    // Validate unique batch numbers within the same product
    const batchNumbers = batches.map(b => b.batchNumber);
    const uniqueBatchNumbers = new Set(batchNumbers);
    if (batchNumbers.length !== uniqueBatchNumbers.size) {
      showAlert('Batch numbers must be unique within this product. Please check your batch numbers.', 'danger');
      setIsLoading(false);
      return;
    }

    // Check if batch number already exists in the same group
    try {
      const batchCheckPromises = batches.map(async (batch) => {
        if (!batch.isExisting) {
          try {
            const response = await axios.get(`${baseurl}/batches/check-batch-number`, {
              params: {
                batch_number: batch.batchNumber,
                group_by: formData.group_by || 'Purchaseditems',
                product_id: productId || ''
              }
            });
            return response.data.exists;
          } catch (error) {
            console.error('Error checking batch number:', error);
            return false;
          }
        }
        return false;
      });

      const batchCheckResults = await Promise.all(batchCheckPromises);
      const hasDuplicateBatches = batchCheckResults.some(exists => exists);

      if (hasDuplicateBatches) {
        showAlert('One or more batch numbers already exist in the same category. Please use unique batch numbers.', 'danger');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error during batch number validation:', error);
    }
  }

  try {
    // Calculate final opening stock
    let finalOpeningStock = parseFloat(formData.opening_stock) || 0;
    if (maintainBatch && batches.length > 0) {
      finalOpeningStock = calculateTotalStockFromBatches();
      console.log('🔄 Using batch-based opening stock:', finalOpeningStock);
    }

    // Calculate final purchase price
    let finalPurchasePrice = parseFloat(formData.purchase_price) || 0;
    if (maintainBatch && batches.length > 0) {
      const batchPurchasePrices = batches.map(batch => parseFloat(batch.purchasePrice) || 0);
      finalPurchasePrice = batchPurchasePrices[0] || 0;
      console.log('🔄 Using batch-based purchase price:', finalPurchasePrice);
    }

    // Generate barcodes for non-batch items first
    let defaultBarcode = null;
    if (!maintainBatch) {
      defaultBarcode = await generateUniqueBarcode();
    }

    // Prepare batches for backend
    const batchesForBackend = await Promise.all(batches.map(async (batch) => {
      const batchData = {
        batch_number: maintainBatch ? batch.batchNumber : 'DEFAULT',
        mfg_date: maintainBatch ? (batch.mfgDate || null) : null,
        exp_date: maintainBatch ? (batch.expDate || null) : null,
        quantity: maintainBatch ? (parseFloat(batch.quantity) || 0) : finalOpeningStock,
        cost_price: parseFloat(batch.costPrice) || 0,
        selling_price: parseFloat(batch.sellingPrice) || parseFloat(formData.selling_price) || 0,
        purchase_price: parseFloat(batch.purchasePrice) || finalPurchasePrice,
        mrp: parseFloat(batch.mrp) || parseFloat(formData.mrp) || 0,
        barcode: maintainBatch ? batch.barcode : defaultBarcode || await generateUniqueBarcode(),
        group_by: formData.group_by || 'Purchaseditems',
        isExisting: batch.isExisting || false
      };

      // For non-batch items, use a default batch structure
      if (!maintainBatch) {
        batchData.batch_number = 'DEFAULT';
        batchData.quantity = finalOpeningStock;
        batchData.purchase_price = finalPurchasePrice;
        batchData.selling_price = parseFloat(formData.selling_price) || 0;
        batchData.mrp = parseFloat(formData.mrp) || 0;
      }

      if (batch.isExisting && batch.dbId && !batch.dbId.toString().includes('temp_')) {
        batchData.id = batch.dbId;
      }

      console.log(`📦 Batch data - ID: ${batch.id}, isExisting: ${batch.isExisting}, sending ID: ${batchData.id}`);
      return batchData;
    }));

    // If no batches exist but maintain_batch is false, create a default batch
    if (!maintainBatch && batchesForBackend.length === 0) {
      const barcode = defaultBarcode || await generateUniqueBarcode();
      batchesForBackend.push({
        batch_number: 'DEFAULT',
        mfg_date: null,
        exp_date: null,
        quantity: finalOpeningStock,
        cost_price: 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        purchase_price: finalPurchasePrice,
        mrp: parseFloat(formData.mrp) || 0,
        barcode: barcode,
        group_by: formData.group_by || 'Purchaseditems',
        isExisting: false
      });
    }

    // Prepare data for backend
    const dataToSend = {
      ...formData,
      group_by: groupType,
      opening_stock: finalOpeningStock,
      purchase_price: finalPurchasePrice,
      stock_in: finalOpeningStock,
      stock_out: 0,
      balance_stock: finalOpeningStock,
      batches: batchesForBackend,
      maintain_batch: maintainBatch
    };

    // Remove selling_price and mrp from main product data since they don't exist in products table
    delete dataToSend.selling_price;
    delete dataToSend.mrp;

    console.log('📤 Sending data to backend:', {
      purchase_price: dataToSend.purchase_price,
      opening_stock: dataToSend.opening_stock,
      stock_in: dataToSend.stock_in,
      stock_out: dataToSend.stock_out,
      balance_stock: dataToSend.balance_stock,
      maintain_batch: dataToSend.maintain_batch,
      batch_count: batchesForBackend.length,
      batch_numbers: batchesForBackend.map(b => b.batch_number),
      first_batch_selling_price: batchesForBackend[0]?.selling_price,
      first_batch_mrp: batchesForBackend[0]?.mrp
    });

    if (productId) {
      console.log(`🔄 Updating product ID: ${productId}`);

      const response = await axios.put(`${baseurl}/products/${productId}`, dataToSend, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Update response:', response.data);
      showAlert('Product updated successfully!', 'success');

      await fetchBatches(productId);
    } else {
      console.log('➕ Creating new product');
      const response = await axios.post(`${baseurl}/products`, dataToSend, {
        headers: { 'Content-Type': 'application/json' }
      });
      showAlert('New product added successfully!', 'success');
    }

    setTimeout(() => navigate('/purchased_items'), 1500);
  } catch (error) {
    console.error('❌ Failed to add/update product:', error);
    console.error('❌ Error response:', error.response?.data);

    let errorMessage = error.response?.data?.message || error.message || 'Failed to add/update product';

    if (errorMessage.includes('batch number') && errorMessage.includes('already exists')) {
      errorMessage = 'Batch number already exists in this category. Please use a unique batch number.';
    }

    showAlert(errorMessage, 'danger');
  } finally {
    setIsLoading(false);
  }
};

  const pageTitle = productId
    ? `Edit Product in Purchase Catalog`
    : `Add Product to Purchase Catalog`;

  if (isLoading && !isDataLoaded) {
    return (
      <div className="dashboard-container">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
          <Header user={user} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
          <div className="content-wrapper">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading product data...</span>
              </Spinner>
              <span className="ms-3">Loading product data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Header user={user} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        <div className="content-wrapper">
          {alert.show && (
            <Alert variant={alert.variant} className="m-3">
              {alert.message}
            </Alert>
          )}

          <div className="container-fluid mt-3 purchased-items-wrapper">
            <div className="container justify-content-center mt-4">
              <h3 className="mb-4 text-center">{pageTitle}</h3>

              <Form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>Product Name *</Form.Label>
                    <Form.Control
                      placeholder="Product Name"
                      name="goods_name"
                      value={formData.goods_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col">
                    <Form.Label>Category *</Form.Label>
                    <div className="d-flex">
                      <Form.Select
                        className="me-1"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category_name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowCategoryModal(true)}
                      >
                        <BsPlus />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>Company *</Form.Label>
                    <div className="d-flex">
                      <Form.Select
                        className="me-1"
                        name="company_id"
                        value={formData.company_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Company Name</option>
                        {companyOptions.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.company_name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowCompanyModal(true)}
                      >
                        <BsPlus />
                      </Button>
                    </div>
                  </div>
                  <div className="col">
                    <Form.Label>Purchase Price *</Form.Label>
                    <Form.Control
                      placeholder="Purchase Price"
                      name="purchase_price" // CHANGED: name to purchase_price
                      type="number"
                      step="0.01"
                      value={formData.purchase_price}
                      onChange={handleChange}
                      required
                      disabled={maintainBatch}
                      className={maintainBatch ? "bg-light" : ""}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        Purchase price is auto-calculated from batch purchase prices
                      </Form.Text>
                    )}
                  </div>
                     
                  <div className="col">
                    <Form.Label>Selling Price</Form.Label>
                    <Form.Control
                      placeholder="Selling Price"
                      name="selling_price" // CHANGED: name to selling_price
                      type="number"
                      step="0.01"
                      value={formData.selling_price}
                      onChange={handleChange}
                      disabled={maintainBatch}
                      className={maintainBatch ? "bg-light" : ""}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        Selling price is auto-calculated from batch selling prices
                      </Form.Text>
                    )}
                  </div>
               
                  <div className="col">
                    <Form.Label>MRP</Form.Label>
                    <Form.Control
                      placeholder="Maximum Retail Price"
                      name="mrp"
                      type="number"
                      step="0.01"
                      value={formData.mrp}
                      onChange={handleChange}
                      disabled={maintainBatch}
                      className={maintainBatch ? "bg-light" : ""}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        MRP is auto-calculated from batch MRPs
                      </Form.Text>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>GST Type</Form.Label>
                    <Form.Select
                      name="inclusive_gst"
                      value={formData.inclusive_gst}
                      onChange={handleChange}
                    >
                      <option value="Inclusive">Inclusive of GST</option>
                      <option value="Exclusive">Exclusive of GST</option>
                    </Form.Select>
                  </div>
                  <div className="col">
                    <Form.Label>GST Rate</Form.Label>
                    <Form.Select
                      name="gst_rate"
                      value={formData.gst_rate}
                      onChange={handleChange}
                    >
                      <option value="">Select GST Rate</option>
                      <option value="18">GST Rate 18%</option>
                      <option value="12">GST Rate 12%</option>
                      <option value="5">GST Rate 5%</option>
                      <option value="0">GST Rate 0%</option>
                    </Form.Select>
                  </div>
                  <div className="col">
                    <Form.Label>Non Taxable</Form.Label>
                    <Form.Control
                      placeholder="Non Taxable"
                      name="non_taxable"
                      type="text"
                      value={formData.non_taxable}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <Form.Label>Net Price | GST</Form.Label>
                    <Form.Control
                      placeholder="Net Price | GST"
                      name="net_price"
                      type="number"
                      step="0.01"
                      value={formData.net_price}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>HSN Code</Form.Label>
                    <Form.Control
                      placeholder="HSN Code"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <Form.Label>Unit *</Form.Label>
                    <div className="d-flex">
                      <Form.Select
                        className="me-1"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Unit</option>
                        {unitOptions.map((unit) => (
                          <option key={unit.id} value={unit.name}>
                            {unit.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowUnitModal(true)}
                      >
                        <BsPlus />
                      </Button>
                    </div>
                  </div>

                  <div className="col">
                    <Form.Label>CESS Rate %</Form.Label>
                    <Form.Control
                      placeholder="CESS Rate%"
                      name="cess_rate"
                      type="number"
                      step="0.01"
                      value={formData.cess_rate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <Form.Label>CESS Amount</Form.Label>
                    <Form.Control
                      placeholder="CESS Amount"
                      name="cess_amount"
                      type="number"
                      step="0.01"
                      value={formData.cess_amount}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>SKU</Form.Label>
                    <Form.Control
                      placeholder="SKU"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Conditionally show Opening Stock field */}
                  {!maintainBatch && (
                    <div className="col">
                      <Form.Label>Opening Stock *</Form.Label>
                      <Form.Control
                        placeholder="Opening Stock"
                        name="opening_stock"
                        type="number"
                        value={formData.opening_stock || (batches.length > 0 ? batches[0].opening_stock : '')}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}

                  {/* Show calculated stock when batches exist */}
                  {maintainBatch && batches.length > 0 && (
                    <div className="col">
                      <Form.Label>Total Stock (from batches)</Form.Label>
                      <Form.Control
                        type="number"
                        value={calculateTotalStockFromBatches()}
                        readOnly
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Calculated from batch quantities
                      </Form.Text>
                    </div>
                  )}

                  <div className="col">
                    <Form.Label>Opening Stock Date</Form.Label>
                    <Form.Control
                      type="date"
                      placeholder="Opening Stock Date"
                      name="opening_stock_date"
                      value={formData.opening_stock_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col">
                    <Form.Label>Min Stock Alert</Form.Label>
                    <Form.Control
                      placeholder="Min Stock Alert"
                      name="min_stock_alert"
                      type="number"
                      value={formData.min_stock_alert}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>Max Stock Alert</Form.Label>
                    <Form.Control
                      placeholder="Max Stock Alert"
                      name="max_stock_alert"
                      type="number"
                      value={formData.max_stock_alert}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      label="Can be Sold (Creates Sales Catalog Entry)"
                      name="can_be_sold"
                      checked={formData.can_be_sold}
                      onChange={handleChange}
                      className="mt-4"
                    />
                  </div>
                  <div className="col d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      label="Maintain Batch"
                      name="maintain_batch"
                      checked={formData.maintain_batch}
                      onChange={handleChange}
                      className="mt-4"
                    />
                  </div>
                </div>

                <Form.Group className="mt-3 mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>

                {maintainBatch && (
                  <div className="border border-dark p-3 mb-3">
                    <h5>Batch Details</h5>
                    {batches.map((batch, index) => (
                      <div key={batch.id} className="mb-3 border p-2">
                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <Form.Label>Batch No.*</Form.Label>
                            <Form.Control
                              placeholder="Enter Batch Number"
                              name="batchNumber"
                              value={batch.batchNumber}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                            />
                            <Form.Text className="text-muted">
                              Enter unique batch number
                            </Form.Text>
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Opening Stock*</Form.Label>
                            <Form.Control
                              type="number"
                              name="quantity"
                              value={batch.quantity}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Mfg. Date</Form.Label>
                            <Form.Control
                              type="date"
                              name="mfgDate"
                              value={batch.mfgDate}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <Form.Label>Exp. Date</Form.Label>
                            <Form.Control
                              type="date"
                              name="expDate"
                              value={batch.expDate}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Purchase Price*</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="purchasePrice" // CHANGED: name to purchasePrice
                              value={batch.purchasePrice}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Selling Price</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="sellingPrice"
                              value={batch.sellingPrice}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <Form.Label>M.R.P</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="mrp"
                              value={batch.mrp}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Cost Price</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="costPrice"
                              value={batch.costPrice}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Barcode *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Barcode"
                              value={batch.barcode}
                              readOnly
                              required
                            />
                            {batch.barcode && (
                              <div className="mt-1 text-center">
                                <Barcode value={batch.barcode} format="CODE128" height={25} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col text-end">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeBatch(batch.id)}
                              disabled={batches.length <= 1}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="primary" onClick={addNewBatch} className="mb-2">
                      Add Batch
                    </Button>
                    <div className="mt-2 text-muted">
                      <small>* Batch numbers are auto-generated and unique across all products</small>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/purchased_items')}
                    className="me-2"
                    disabled={isLoading}
                  >
                    Close
                  </Button>
                  <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        {productId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      productId ? 'Update Product' : 'Add Product'
                    )}
                  </Button>
                </div>
              </Form>

              <AddCompanyModal
                show={showCompanyModal}
                onClose={() => setShowCompanyModal(false)}
                onSave={(newCompany) => {
                  fetchCompanies();
                  setFormData((prev) => ({
                    ...prev,
                    company_id: newCompany.id
                  }));
                  setShowCompanyModal(false);
                }}
              />
              <AddCategoryModal
                show={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onSave={(newCategory) => {
                  fetchCategories();
                  setFormData((prev) => ({
                    ...prev,
                    category_id: newCategory.id
                  }));
                  setShowCategoryModal(false);
                }}
              />

              <AddUnitModal
                show={showUnitModal}
                onClose={() => setShowUnitModal(false)}
                onSave={(newUnit) => {
                  fetchUnits();
                  setFormData((prev) => ({ ...prev, unit: newUnit.name }));
                  setShowUnitModal(false);
                }}
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;