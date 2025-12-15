import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { BsPlus } from 'react-icons/bs';
import AddCompanyModal from './AddCompanyModal';
import AddCategoryModal from '../PurchasedItems/AddCategoryModal';
import AddUnitModal from './AddUnitsModal';
import axios from 'axios';
import { baseurl } from './../../../../BaseURL/BaseURL';
import AdminSidebar from './../../../../Shared/AdminSidebar/AdminSidebar';
import Header from './../../../../Shared/AdminSidebar/AdminHeader';
import { useNavigate, useParams } from 'react-router-dom';
import './salesitems.css';
import Barcode from 'react-barcode';
import { FaUpload, FaTrash } from 'react-icons/fa';

const SalesItemsPage = ({ groupType = 'Salescatalog', user }) => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
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

    // Calculate initial MRP value
    let mrpValue = product.mrp || '';
    
    // Set initial form data
    setFormData({
      group_by: product.group_by || groupType,
      goods_name: product.goods_name || product.name || '',
      category_id: product.category_id || '',
      company_id: product.company_id || '',
      price: product.price || '',
      mrp: mrpValue, // Set initial MRP
      inclusive_gst: product.inclusive_gst || '',
      purchase_price: product.purchase_price || '',
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
      min_sale_price: product.min_sale_price || '',
      description: product.description || '',
      maintain_batch: product.maintain_batch || false,
    });

    // Load images
    if (product.images) {
      try {
        const parsedImages = typeof product.images === 'string'
          ? JSON.parse(product.images)
          : product.images;
        setImages(Array.isArray(parsedImages) ? parsedImages : []);
      } catch (e) {
        setImages([]);
      }
    } else {
      setImages([]);
    }

    setMaintainBatch(product.maintain_batch || false);
    
    // Fetch batches and update MRP
    await fetchBatches(id);
    
    // After batches are fetched, update MRP if needed
    if (product.maintain_batch) {
      // Give a small delay to ensure batches are set
      setTimeout(async () => {
        // Re-fetch batches to ensure we have the latest data
        const batchesResponse = await axios.get(`${baseurl}/products/${id}/batches`);
        if (batchesResponse.data?.length > 0) {
          const batchMRPs = batchesResponse.data.map(b => parseFloat(b.mrp) || 0);
          const maxBatchMRP = Math.max(...batchMRPs);
          
          if (!isNaN(maxBatchMRP) && maxBatchMRP > 0) {
            setFormData(prev => ({
              ...prev,
              mrp: maxBatchMRP.toFixed(2)
            }));
            console.log('✅ Updated MRP from batches:', maxBatchMRP);
          }
        }
      }, 100);
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    showAlert('Error fetching product data', 'danger');
  }
};

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter for image files
    const imageFiles = files.filter(file =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      showAlert('Please select valid image files (JPEG, PNG, GIF, WebP)', 'warning');
      return;
    }

    // Check total images won't exceed limit
    if (images.length + imageFiles.length > 10) {
      showAlert('Maximum 10 images allowed per product', 'warning');
      return;
    }

    setUploadingImages(true);

    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const endpoint = productId
        ? `${baseurl}/products/${productId}/upload-images`
        : `${baseurl}/products/temp/upload-images`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setImages(response.data.images);
        showAlert('Images uploaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showAlert(error.response?.data?.message || 'Failed to upload images', 'danger');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imagePath) => {
    if (!productId) {
      // If creating new product, just remove from local state
      setImages(images.filter(img => img !== imagePath));
      return;
    }

    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await axios.delete(`${baseurl}/products/${productId}/image`, {
          data: { imagePath }
        });

        if (response.data.success) {
          setImages(response.data.images);
          showAlert('Image deleted successfully!', 'success');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        showAlert('Failed to delete image', 'danger');
      }
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
        mrp: batch.mrp || '', // Make sure this is correctly mapped
        barcode: batch.barcode || '',
        isExisting: true
      }))
      : [];
    
    console.log('📦 Fetched batches with MRP:', mappedBatches);
    setBatches(mappedBatches);
    
    // FIXED: Update main MRP from batches after fetching
    if (mappedBatches.length > 0) {
      const batchMRPs = mappedBatches.map(b => parseFloat(b.mrp) || 0);
      const maxBatchMRP = Math.max(...batchMRPs);
      console.log('📊 Calculated max MRP from batches:', maxBatchMRP);
      
      // Only update if we have valid MRP values
      if (!isNaN(maxBatchMRP) && maxBatchMRP > 0) {
        setFormData(prev => ({
          ...prev,
          mrp: maxBatchMRP.toFixed(2)
        }));
      }
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
      sellingPrice: '',
      purchasePrice: '',
      mrp: formData.mrp || '', // ADDED: Default MRP from form
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
          group_by: formData.group_by || 'Salescatalog',
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
      window.alert(`Batch number "${value}" already exists in ${formData.group_by || 'Salescatalog'}. Please select another batch number.`);
      // Revert the change
      updated[index][name] = batches[index][name];
    }
  }

  setBatches(updated);

  if (name === 'sellingPrice') {
    calculateAndUpdateMainPrice(updated);
  }
  
  if (name === 'purchasePrice') {
    calculateAndUpdateMainPurchasePrice(updated);
  }
  
  // FIXED: Update main MRP when batch MRP changes
  if (name === 'mrp') {
    // Wait for state to update
    setTimeout(() => {
      calculateAndUpdateMainMRP(updated);
    }, 0);
  }
};

  const calculateAndUpdateMainPurchasePrice = (updatedBatches) => {
    // Calculate TOTAL purchase price from all batches
    const totalPurchasePrice = updatedBatches.reduce((sum, batch) => {
      const purchasePrice = parseFloat(batch.purchasePrice) || 0;
      return sum + purchasePrice;
    }, 0);

    // Update the main form purchase_price field with TOTAL
    setFormData(prev => ({
      ...prev,
      purchase_price: totalPurchasePrice.toFixed(2)
    }));
  };

const calculateAndUpdateMainMRP = (updatedBatches) => {
  if (!updatedBatches || updatedBatches.length === 0) {
    console.log('No batches to calculate MRP from');
    return;
  }
  
  console.log('Calculating MRP from batches:', updatedBatches.map(b => ({ batch: b.batchNumber, mrp: b.mrp })));
  
  // Find maximum MRP from all batches
  const batchMRPs = updatedBatches.map(batch => parseFloat(batch.mrp) || 0);
  const maxMRP = Math.max(...batchMRPs);
  
  console.log('Max MRP calculated:', maxMRP);
  
  if (!isNaN(maxMRP) && maxMRP !== -Infinity) {
    setFormData(prev => ({
      ...prev,
      mrp: maxMRP.toFixed(2)
    }));
    console.log('Updated form MRP to:', maxMRP.toFixed(2));
  }
};

  const [formData, setFormData] = useState({
    group_by: groupType,
    goods_name: '',
    category_id: '',
    company_id: '',
    price: '',
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
    min_sale_price: '',
    description: '',
    maintain_batch: false,
    purchase_price: '' // ADDED: Purchase price field
  });

const handleChange = async (e) => {
  const { name, value, type, checked } = e.target;
  console.log(`🔄 Handling change: ${name} = ${type === 'checkbox' ? checked : value}`);

  const updatedFormData = {
    ...formData,
    [name]: type === 'checkbox' ? checked : value
  };

  if ((name === 'price' || name === 'gst_rate' || name === 'inclusive_gst') &&
    updatedFormData.price && updatedFormData.gst_rate) {
    const { netPrice } = calculateTaxAndNetPrice(
      updatedFormData.price,
      updatedFormData.gst_rate,
      updatedFormData.inclusive_gst
    );
    updatedFormData.net_price = netPrice;
  }

  // When batch management is OFF and MRP changes, sync it to batches if they exist
  if (name === 'mrp' && batches.length > 0 && !maintainBatch) {
    const updatedBatches = batches.map(batch => ({
      ...batch,
      mrp: value || ''
    }));
    setBatches(updatedBatches);
  }

  if (name === 'price' && batches.length > 0) {
    const updatedBatches = batches.map(batch => ({
      ...batch,
      sellingPrice: value || batch.sellingPrice
    }));
    setBatches(updatedBatches);
  }
  
  // Sync main purchase price to batches
  if (name === 'purchase_price' && batches.length > 0) {
    const updatedBatches = batches.map(batch => ({
      ...batch,
      purchasePrice: value || batch.purchasePrice
    }));
    setBatches(updatedBatches);
  }

  if (name === 'maintain_batch') {
    if (checked && batches.length === 0) {
      const defaultBatch = await createDefaultBatch();
      // Use current MRP from form for the new batch
      const batchWithMRP = {
        ...defaultBatch,
        mrp: formData.mrp || ''
      };
      setBatches([batchWithMRP]);
    } else if (!checked && batches.length > 0) {
      // When turning OFF batch management, use the maximum MRP from batches
      const maxMRP = Math.max(...batches.map(b => parseFloat(b.mrp) || 0));
      if (!isNaN(maxMRP) && maxMRP > 0) {
        updatedFormData.mrp = maxMRP.toFixed(2);
      }
      setBatches([]);
    }
    setMaintainBatch(checked);
  }

  setFormData(updatedFormData);
};

  const calculateAndUpdateMainPrice = (updatedBatches) => {
    const totalSellingPrice = updatedBatches.reduce((sum, batch) => {
      const sellingPrice = parseFloat(batch.sellingPrice) || 0;
      return sum + sellingPrice;
    }, 0);

    setFormData(prev => ({
      ...prev,
      price: totalSellingPrice.toFixed(2)
    }));
    
    calculateAndUpdateMainPurchasePrice(updatedBatches);
    
    calculateAndUpdateMainMRP(updatedBatches);
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

        calculateAndUpdateMainPrice(updated);

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

    calculateAndUpdateMainPrice(updated);
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  const calculateTotalStockFromBatches = () => {
    if (!batches || batches.length === 0) return 0;
    const total = batches.reduce((total, batch) => total + (parseFloat(batch.quantity) || 0), 0);
    console.log('📊 Calculated total stock from batches:', total);
    return total;
  };

  // Validate batches if maintainBatch is enabled
  if (maintainBatch) {
    // Check for required fields
    const invalidBatches = batches.filter(
      (batch) => !batch.batchNumber || !batch.quantity || !batch.sellingPrice || !batch.barcode
    );

    if (invalidBatches.length > 0) {
      showAlert(
        'Please fill all required fields in batch details (Batch Number, Quantity, Selling Price, and Barcode)',
        'danger'
      );
      setIsLoading(false);
      return;
    }

    const batchNumbers = batches.map(b => b.batchNumber);
    const uniqueBatchNumbers = new Set(batchNumbers);
    if (batchNumbers.length !== uniqueBatchNumbers.size) {
      showAlert('Batch numbers must be unique within this product. Please check your batch numbers.', 'danger');
      setIsLoading(false);
      return;
    }

    try {
      const batchCheckPromises = batches.map(async (batch) => {
        if (!batch.isExisting) {
          try {
            const response = await axios.get(`${baseurl}/batches/check-batch-number`, {
              params: {
                batch_number: batch.batchNumber,
                group_by: formData.group_by || 'Salescatalog',
                product_id: productId || '' // Exclude current product for updates
              }
            });
            return response.data.exists;
          } catch (error) {
            console.error('Error checking batch number:', error);
            return false; // Don't block submission if check fails
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

    let finalPrice = parseFloat(formData.price) || 0;
    if (maintainBatch && batches.length > 0) {
      const batchPrices = batches.map(batch => parseFloat(batch.sellingPrice) || 0);
      finalPrice = batchPrices[0] || 0;
      console.log('🔄 Using batch-based price:', finalPrice);
    }

    let finalMRP = 0;
    if (maintainBatch && batches.length > 0) {
      const batchMRPs = batches.map(batch => parseFloat(batch.mrp) || 0);
      finalMRP = Math.max(...batchMRPs) || 0;
      console.log('🔄 Using batch-based MRP:', finalMRP);
    } else {
      finalMRP = parseFloat(formData.mrp) || 0;
      console.log('🔄 Using form MRP:', finalMRP);
    }

    let finalPurchasePrice = parseFloat(formData.purchase_price) || 0;
    if (maintainBatch && batches.length > 0) {
      const batchPurchasePrices = batches.map(batch => parseFloat(batch.purchasePrice) || 0);
      finalPurchasePrice = batchPurchasePrices[0] || 0;
      console.log('🔄 Using batch-based purchase price:', finalPurchasePrice);
    }

    const batchesForBackend = maintainBatch
      ? batches.map((batch) => {
        const batchData = {
          batch_number: batch.batchNumber,
          mfg_date: batch.mfgDate || null,
          exp_date: batch.expDate || null,
          quantity: parseFloat(batch.quantity) || 0,
          cost_price: parseFloat(batch.costPrice) || 0,
          selling_price: parseFloat(batch.sellingPrice) || 0,
          purchase_price: parseFloat(batch.purchasePrice) || 0,
          mrp: parseFloat(batch.mrp) || 0,
          barcode: batch.barcode,
          group_by: formData.group_by || 'Salescatalog',
          isExisting: batch.isExisting || false
        };

        if (batch.isExisting && batch.dbId && !batch.dbId.toString().includes('temp_')) {
          batchData.id = batch.dbId;
        }

        console.log(`📦 Batch data - ID: ${batch.id}, isExisting: ${batch.isExisting}, sending ID: ${batchData.id}`);
        return batchData;
      })
      : [];

    // Prepare data for backend WITHOUT MRP field in products table
    const dataToSend = {
      ...formData,
      images: images,
      group_by: groupType,
      opening_stock: finalOpeningStock,
      price: finalPrice, // Use calculated price (batch or form)
      purchase_price: finalPurchasePrice, // Use calculated purchase price
      // DO NOT include mrp field here - it doesn't exist in products table
      // mrp: finalMRP, // REMOVED - This field doesn't exist in products table
      // Ensure proper stock initialization based on batch management
      stock_in: maintainBatch ? finalOpeningStock : finalOpeningStock,
      stock_out: 0,
      balance_stock: finalOpeningStock,
      batches: batchesForBackend
    };

    // Remove mrp from dataToSend since it doesn't exist in products table
    delete dataToSend.mrp;

    console.log('📤 Sending data to backend:', {
      opening_stock: dataToSend.opening_stock,
      price: dataToSend.price,
      purchase_price: dataToSend.purchase_price,
      stock_in: dataToSend.stock_in,
      stock_out: dataToSend.stock_out,
      balance_stock: dataToSend.balance_stock,
      maintain_batch: dataToSend.maintain_batch,
      batch_count: batchesForBackend.length,
      batch_numbers: batchesForBackend.map(b => b.batch_number)
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

    setTimeout(() => navigate('/sale_items'), 1500);
  } catch (error) {
    console.error('❌ Failed to add/update product:', error);
    console.error('❌ Error response:', error.response?.data);

    // Handle specific batch number duplicate error from backend
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
    ? `Edit Product in Sales Catalog`
    : `Add Product to Sales Catalog`;

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
                    <Form.Label> Selling Price *</Form.Label>
                    <Form.Control
                      placeholder=" Selling Price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      disabled={maintainBatch}
                      className={maintainBatch ? "bg-light" : ""}
                    />
                    {maintainBatch && (
                      <Form.Text className="text-muted">
                        Price is auto-calculated from batch selling prices
                      </Form.Text>
                    )}
                  </div>

                  <div className="col">
                    <Form.Label>Purchase Price *</Form.Label>
                    <Form.Control
                      placeholder="Purchase Price"
                      name="purchase_price"
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
  <Form.Label>MRP</Form.Label>
  <Form.Control
    placeholder="Maximum Retail Price"
    name="mrp"
    type="number"
    step="0.01"
    value={formData.mrp || ''}
    onChange={handleChange}
    disabled={maintainBatch} 
    className={maintainBatch ? "bg-light" : ""}
  />
  {maintainBatch && (
    <Form.Text className="text-muted">
      MRP is auto-calculated as maximum from batch MRPs
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
                  <div className="col">
                    <Form.Label>Minimum Sale Price</Form.Label>
                    <Form.Control
                      placeholder="Minimum Sale Price"
                      name="min_sale_price"
                      type="number"
                      step="0.01"
                      value={formData.min_sale_price}
                      onChange={handleChange}
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

                {/* Image Upload Section */}
                <div className="border border-dark p-3 mb-3">
                  <h5>Product Images</h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload Images (Max 10, 5MB each)</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploadingImages || images.length >= 10}
                      />
                      <Button
                        variant="outline-secondary"
                        className="ms-2"
                        onClick={() => document.querySelector('input[type="file"]').click()}
                        disabled={uploadingImages || images.length >= 10}
                      >
                        <FaUpload /> Browse
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Supported formats: JPEG, PNG, GIF, WebP
                    </Form.Text>
                    {uploadingImages && (
                      <div className="mt-2">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Uploading images...
                      </div>
                    )}
                  </Form.Group>

                  {/* Image Preview Grid */}
                  {images.length > 0 && (
                    <div className="row">
                      {images.map((image, index) => (
                        <div key={index} className="col-md-3 col-sm-4 col-6 mb-3">
                          <div className="card h-100">
                            <div className="card-img-top position-relative" style={{ height: '150px', overflow: 'hidden' }}>
                              <img
                                src={image.startsWith('/') ? `${baseurl}${image}` : image}
                                alt={`Product ${index + 1}`}
                                className="img-fluid h-100 w-100 object-fit-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/150x150?text=Image+Error';
                                }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-1"
                                onClick={() => handleDeleteImage(image)}
                                title="Delete image"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                            <div className="card-body p-2 text-center">
                              <small className="text-muted">Image {index + 1}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {images.length === 0 && !uploadingImages && (
                    <div className="text-center py-4 border rounded">
                      <FaUpload size={48} className="text-muted mb-3" />
                      <p className="text-muted">No images uploaded yet</p>
                    </div>
                  )}
                </div>

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
                            <Form.Label>Exp. Date</Form.Label>
                            <Form.Control
                              type="date"
                              name="expDate"
                              value={batch.expDate}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <Form.Label>Mfg. Date</Form.Label>
                            <Form.Control
                              type="date"
                              name="mfgDate"
                              value={batch.mfgDate}
                              onChange={(e) => handleBatchChange(index, e)}
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Sale Price*</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="sellingPrice"
                              value={batch.sellingPrice}
                              onChange={(e) => handleBatchChange(index, e)}
                              required
                            />
                          </div>
                          <div className="col-md-4">
                            <Form.Label>Purchase Price</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="purchasePrice"
                              value={batch.purchasePrice}
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
                    onClick={() => navigate('/sale_items')}
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

export default SalesItemsPage;