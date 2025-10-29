import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Table, Alert, Spinner, Card, Row, Col } from "react-bootstrap";
import { BsPlus } from "react-icons/bs";
import AddCompanyModal from "./AddCompanyModal";
import AddCategoryModal from "./AddCategoryModal";
import axios from "axios";
import { baseurl } from "../../../../BaseURL/BaseURL";
import Header from "../../../../Shared/AdminSidebar/AdminHeader";
import AdminSidebar from "../../../../Shared/AdminSidebar/AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";

// Barcode Component to generate visual barcode
const BarcodeDisplay = ({ value, width = 2, height = 100, displayValue = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (value && canvasRef.current) {
      drawBarcode(value);
    }
  }, [value, width, height]);

  const drawBarcode = (barcodeValue) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Validate barcode value (should be numeric for Code128 simulation)
    const validBarcode = barcodeValue.replace(/[^0-9]/g, '');
    if (!validBarcode) return;

    // Simple Code128-like barcode generation
    ctx.fillStyle = 'black';
    let x = 10; // Starting position

    // Start code
    drawBars(ctx, [2, 1, 2, 2, 2, 2], x, height, width);
    x += (2 + 1 + 2 + 2 + 2 + 2) * width;

    // Draw each digit
    for (let i = 0; i < validBarcode.length; i++) {
      const digit = parseInt(validBarcode[i]);
      const pattern = getCode128Pattern(digit);
      drawBars(ctx, pattern, x, height, width);
      x += (pattern.reduce((a, b) => a + b, 0)) * width;
    }

    // Stop code
    drawBars(ctx, [2, 3, 3, 1, 1, 1, 2], x, height, width);

    // Draw barcode value below
    if (displayValue) {
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(barcodeValue, canvas.width / 2, height + 20);
    }
  };

  const drawBars = (ctx, pattern, x, height, width) => {
    let currentX = x;
    pattern.forEach((barWidth, index) => {
      if (index % 2 === 0) { // Draw bar (even indices are bars)
        ctx.fillRect(currentX, 0, barWidth * width, height);
      }
      currentX += barWidth * width;
    });
  };

  const getCode128Pattern = (digit) => {
    // Simplified Code128 patterns for digits 0-9
    const patterns = {
      0: [2, 1, 2, 2, 2, 2],    // 11011001100
      1: [2, 2, 2, 1, 2, 2],    // 11001101100
      2: [2, 2, 2, 2, 2, 1],    // 11001100110
      3: [1, 2, 1, 2, 2, 3],    // 10010011000
      4: [1, 2, 1, 3, 2, 2],    // 10010001100
      5: [1, 3, 1, 2, 2, 2],    // 10001001100
      6: [1, 2, 2, 2, 1, 3],    // 10011001000
      7: [1, 2, 2, 3, 1, 2],    // 10011000100
      8: [1, 3, 2, 2, 1, 2],    // 10001100100
      9: [2, 2, 1, 2, 1, 3]     // 11001001000
    };
    return patterns[digit] || [2, 1, 2, 2, 2, 2];
  };

  const canvasWidth = (value ? value.length * 12 * width + 40 : 200);

  return (
    <div className="barcode-display">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={displayValue ? height + 30 : height}
        style={{ border: '1px solid #ddd', background: 'white' }}
      />
      <div className="text-muted small mt-1 text-center">Auto-generated</div>
    </div>
  );
};

// Batch Card Component for better organization
const BatchCard = ({ batch, index, onBatchChange, onRemove, canRemove }) => {
  return (
    <Card className="mb-3 batch-card">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Batch #{index + 1}: {batch.batchNumber}</h6>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onRemove(batch.id)}
          disabled={!canRemove}
        >
          Remove
        </Button>
      </Card.Header>
      <Card.Body>
        <div className="row">
          {/* First Row: Basic Information */}
          <div className="col-md-4 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">Batch Number</Form.Label>
              <Form.Control
                value={batch.batchNumber}
                readOnly
                className="bg-light"
              />
              <Form.Text className="text-muted">Auto-generated</Form.Text>
            </Form.Group>
          </div>
          <div className="col-md-4 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">Manufacturing Date</Form.Label>
              <Form.Control
                type="date"
                name="mfgDate"
                value={batch.mfgDate}
                onChange={(e) => onBatchChange(index, e)}
              />
            </Form.Group>
          </div>
          <div className="col-md-4 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">Expiry Date</Form.Label>
              <Form.Control
                type="date"
                name="expDate"
                value={batch.expDate}
                onChange={(e) => onBatchChange(index, e)}
              />
            </Form.Group>
          </div>
        </div>

        {/* Second Row: Pricing Information */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">Sale Price *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="sellingPrice"
                value={batch.sellingPrice}
                onChange={(e) => onBatchChange(index, e)}
                required
                placeholder="Enter sale price"
              />
            </Form.Group>
          </div>
          <div className="col-md-4 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">Purchase Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="purchasePrice"
                value={batch.purchasePrice}
                onChange={(e) => onBatchChange(index, e)}
                placeholder="Enter purchase price"
              />
            </Form.Group>
          </div>
          <div className="col-md-4 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">Cost Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="costPrice"
                value={batch.costPrice}
                onChange={(e) => onBatchChange(index, e)}
                placeholder="Enter cost price"
              />
            </Form.Group>
          </div>
        </div>

        {/* Third Row: Additional Pricing & Stock */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">M.R.P</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="mrp"
                value={batch.mrp}
                onChange={(e) => onBatchChange(index, e)}
                placeholder="Enter MRP"
              />
            </Form.Group>
          </div>
          <div className="col-md-4 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">Batch Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="batchPrice"
                value={batch.batchPrice}
                onChange={(e) => onBatchChange(index, e)}
                placeholder="Enter batch price"
              />
            </Form.Group>
          </div>
          <div className="col-md-4 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold">Stock Quantity *</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={batch.quantity}
                onChange={(e) => onBatchChange(index, e)}
                required
                placeholder="Enter stock quantity"
              />
            </Form.Group>
          </div>
        </div>

        {/* Fourth Row: Barcode */}
        <div className="row">
          <div className="col-12">
            <Form.Group>
              <Form.Label className="fw-bold">Barcode</Form.Label>
              <div className="text-center">
                <BarcodeDisplay 
                  value={batch.barcode} 
                  width={1.5} 
                  height={60} 
                  displayValue={true}
                />
                <Form.Control
                  type="hidden"
                  name="barcode"
                  value={batch.barcode}
                  onChange={(e) => onBatchChange(index, e)}
                />
              </div>
            </Form.Group>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const AddProductPage = ({ groupType = "Purchaseditems", user }) => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [maintainBatch, setMaintainBatch] = useState(false);
  const [batches, setBatches] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
  }, []);

  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) {
        setIsDataLoaded(true);
        return;
      }

      console.log("🔄 Loading product data for editing...");
      setIsLoading(true);

      try {
        console.log("🔄 Fetching product by ID:", productId);
        await fetchProductById(productId);
        console.log("✅ Form data set successfully");
        setIsDataLoaded(true);
      } catch (error) {
        console.error("❌ Error loading product data:", error);
        showAlert("Error loading product data", "danger");
        setIsDataLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [productId, groupType]);

  // Generate barcode number
  const generateBarcode = async () => {
    let isUnique = false;
    let newBarcode;

    while (!isUnique) {
      const timestamp = Date.now();
      newBarcode = `BC${timestamp}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      try {
        const response = await axios.get(`${baseurl}/batches/check-barcode/${newBarcode}`);
        if (response.data.available) {
          isUnique = true;
        }
      } catch (error) {
        console.error('Error checking barcode:', error);
        return newBarcode; // Fallback
      }
    }
    return newBarcode;
  };

  // Fetch next batch number from server
  const fetchNextBatchNumber = async () => {
    try {
      const response = await axios.get(`${baseurl}/batches/next-batch-number`, {
        params: { group_by: formData.group_by }
      });
      return response.data.batch_number;
    } catch (error) {
      console.error('Error fetching next batch number:', error);
      return String(Date.now()).padStart(5, '0'); // Fallback
    }
  };

  // Calculate tax and net price based on GST type
  const calculateTaxAndNetPrice = (price, gstRate, inclusiveGst) => {
    if (!price || !gstRate) return { netPrice: price, taxAmount: 0 };

    const numericPrice = parseFloat(price);
    const numericGstRate = parseFloat(gstRate) / 100;

    if (inclusiveGst === "Inclusive") {
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

  const fetchProductById = async (id) => {
    try {
      const response = await axios.get(`${baseurl}/products/${id}`);
      const product = response.data;

      setFormData({
        group_by: product.group_by || groupType,
        goods_name: product.goods_name || product.name || "",
        category_id: product.category_id || "",
        company_id: product.company_id || "",
        price: product.price || "",
        inclusive_gst: product.inclusive_gst || "Inclusive",
        gst_rate: product.gst_rate || "",
        non_taxable: product.non_taxable || "",
        net_price: product.net_price || "",
        hsn_code: product.hsn_code || "",
        unit: product.unit || "UNT-UNITS",
        cess_rate: product.cess_rate || "",
        cess_amount: product.cess_amount || "",
        sku: product.sku || "",
        opening_stock: product.opening_stock || "",
        balance_stock: product.balance_stock || product.opening_stock || "",
        opening_stock_date: product.opening_stock_date ? product.opening_stock_date.split('T')[0] : new Date().toISOString().split('T')[0],
        min_stock_alert: product.min_stock_alert || "",
        max_stock_alert: product.max_stock_alert || "",
        description: product.description || "",
        maintain_batch: product.maintain_batch || false,
        can_be_sold: product.can_be_sold || false
      });

      setMaintainBatch(product.maintain_batch || false);
      await fetchBatches(id);
    } catch (error) {
      console.error("Error fetching product:", error);
      showAlert("Error fetching product data", "danger");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseurl}/categories`);
      setCategoryOptions(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showAlert("Error fetching categories", "danger");
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${baseurl}/companies`);
      setCompanyOptions(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      showAlert("Error fetching companies", "danger");
    }
  };

  const fetchBatches = async (id = productId) => {
    if (!id) {
      setBatches([]);
      return;
    }
    
    try {
      const response = await axios.get(`${baseurl}/products/${id}/batches`);
      const fetchedBatches = response.data?.length
        ? response.data.map(batch => ({
            id: batch.id || Date.now() + Math.random(),
            batchNumber: batch.batch_number || '',
            mfgDate: batch.mfg_date?.split('T')[0] || "",
            expDate: batch.exp_date?.split('T')[0] || "",
            quantity: batch.quantity || "",
            costPrice: batch.cost_price || "",
            sellingPrice: batch.selling_price || formData.price || "",
            purchasePrice: batch.purchase_price || "",
            mrp: batch.mrp || "",
            batchPrice: batch.batch_price || "",
            barcode: batch.barcode || ''
          }))
        : [];
      setBatches(fetchedBatches);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setBatches([]);
    }
  };

  const showAlert = (message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: "", variant: "success" }), 5000);
  };

  const createDefaultBatch = async () => {
    const batchNumber = await fetchNextBatchNumber();
    const barcode = await generateBarcode();
    return {
      id: Date.now() + Math.random(),
      batchNumber,
      mfgDate: "",
      expDate: "",
      quantity: "",
      costPrice: "",
      sellingPrice: formData.price || "",
      purchasePrice: "",
      mrp: "",
      batchPrice: "",
      barcode
    };
  };

  const [formData, setFormData] = useState({
    group_by: groupType,
    goods_name: "",
    category_id: "",
    company_id: "",
    price: "",
    inclusive_gst: "Inclusive",
    gst_rate: "",
    non_taxable: "",
    net_price: "",
    hsn_code: "",
    unit: "UNT-UNITS",
    cess_rate: "",
    cess_amount: "",
    sku: "",
    opening_stock: "",
    balance_stock: "",
    opening_stock_date: new Date().toISOString().split('T')[0],
    min_stock_alert: "",
    max_stock_alert: "",
    description: "",
    maintain_batch: false,
    can_be_sold: false
  });

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value
    };

    // Recalculate tax and net price when price, GST rate, or GST type changes
    if (name === "price" || name === "gst_rate" || name === "inclusive_gst") {
      if (newFormData.price && newFormData.gst_rate) {
        const { netPrice, taxAmount } = calculateTaxAndNetPrice(
          newFormData.price,
          newFormData.gst_rate,
          newFormData.inclusive_gst
        );
        newFormData.net_price = netPrice;
      }
    }

    // Calculate balance stock based only on opening_stock
    if (name === "opening_stock") {
      const openingStock = parseFloat(newFormData.opening_stock) || 0;
      newFormData.balance_stock = openingStock.toString();
    }

    setFormData(newFormData);

    // Update batch selling prices when main price changes
    if (name === "price" && batches.length > 0) {
      const updatedBatches = batches.map(batch => ({
        ...batch,
        sellingPrice: value || batch.sellingPrice
      }));
      setBatches(updatedBatches);
    }

    if (name === "maintain_batch") {
      if (checked && batches.length === 0) {
        const defaultBatch = await createDefaultBatch();
        setBatches([defaultBatch]);
      } else if (!checked) {
        setBatches([]);
      }
      setMaintainBatch(checked);
    }
  };

  const handleBatchChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...batches];
    updated[index][name] = value;
    setBatches(updated);
  };

  const addNewBatch = async () => {
    const newBatch = await createDefaultBatch();
    setBatches(prev => [...prev, newBatch]);
  };

  const removeBatch = (id) => {
    if (batches.length <= 1 && maintainBatch) {
      showAlert("At least one batch is required when Maintain Batch is enabled.", "warning");
      return;
    }
    const updated = batches.filter((b) => b.id !== id);
    setBatches(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate batch details if maintainBatch is true
    if (maintainBatch) {
      const invalidBatches = batches.filter(
        (batch) => !batch.quantity || !batch.sellingPrice
      );

      if (invalidBatches.length > 0) {
        window.alert(
          "Please fill all required fields in batch details (Quantity and Selling Price)"
        );
        setIsLoading(false);
        return;
      }
    }

    try {
      const batchesForBackend = maintainBatch
        ? batches.map((batch) => ({
            id: batch.id || null,
            batch_number: batch.batchNumber,
            mfgDate: batch.mfgDate || null,
            expDate: batch.expDate || null,
            quantity: parseFloat(batch.quantity) || 0,
            costPrice: parseFloat(batch.costPrice) || 0,
            sellingPrice: parseFloat(batch.sellingPrice) || 0,
            purchasePrice: parseFloat(batch.purchasePrice) || 0,
            mrp: parseFloat(batch.mrp) || 0,
            batchPrice: parseFloat(batch.batchPrice) || 0,
            barcode: batch.barcode
          }))
        : [];

      // Create dataToSend without the quantity field for products table
      const { quantity, ...productDataWithoutQuantity } = formData;
      
      const dataToSend = {
        ...productDataWithoutQuantity,
        stock_in: "0",
        stock_out: "0",
        ...(maintainBatch && { batches: batchesForBackend }),
      };

      console.log("📤 Sending data:", dataToSend);

      if (productId) {
        await axios.put(`${baseurl}/products/${productId}`, dataToSend, {
          headers: { "Content-Type": "application/json" },
        });
        window.alert(`Product "${formData.goods_name}" updated successfully!`);
      } else {
        await axios.post(`${baseurl}/products`, dataToSend, {
          headers: { "Content-Type": "application/json" },
        });
        window.alert("New product added successfully!");
      }

      navigate("/purchased_items");
    } catch (error) {
      console.error("❌ Failed to add/update product:", error);
      window.alert("Failed to add/update product.");
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
        <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
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
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
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
                    <Form.Label>Price *</Form.Label>
                    <Form.Control
                      placeholder="Price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
                </div>

                <div className="row mb-3">
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
                  <div className="col">
                    <Form.Label>HSN Code</Form.Label>
                    <Form.Control
                      placeholder="HSN Code"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <Form.Label>Unit</Form.Label>
                    <Form.Select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                    >
                      <option value="UNT-UNITS">UNT-UNITS</option>
                      <option value="KG-Kilograms">KG-Kilograms</option>
                      <option value="L-Liters">L-Liters</option>
                      <option value="M-Meters">M-Meters</option>
                    </Form.Select>
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

                {/* Stock Management Section */}
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
                  <div className="col">
                    <Form.Label>Opening Stock *</Form.Label>
                    <Form.Control
                      placeholder="Opening Stock"
                      name="opening_stock"
                      type="number"
                      value={formData.opening_stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col">
                    <Form.Label>Balance Stock</Form.Label>
                    <Form.Control
                      placeholder="Balance Stock"
                      name="balance_stock"
                      type="number"
                      value={formData.balance_stock}
                      readOnly
                      className="bg-light"
                    />
                  </div>
                </div>

                <div className="row mb-3">
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
                </div>

                <div className="row mb-3">
                  {groupType !== "Salescatalog" && (
                    <div className="col d-flex align-items-center">
                      <Form.Check
                        type="checkbox"
                        label="Can be Sold"
                        name="can_be_sold"
                        checked={formData.can_be_sold}
                        onChange={handleChange}
                        className="mt-4"
                      />
                    </div>
                  )}
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

                {/* New Batch Section with Cards */}
                {maintainBatch && (
                  <div className="border border-dark p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Batch Details</h5>
                      <Button variant="primary" onClick={addNewBatch}>
                        Add New Batch
                      </Button>
                    </div>
                    
                    <div className="batches-container">
                      {batches.map((batch, index) => (
                        <BatchCard
                          key={batch.id}
                          batch={batch}
                          index={index}
                          onBatchChange={handleBatchChange}
                          onRemove={removeBatch}
                          canRemove={batches.length > 1}
                        />
                      ))}
                    </div>
                    
                    <div className="mt-3 text-muted">
                      <small>* indicates required fields</small>
                    </div>
                    <div className="mt-2">
                      <small className="text-info">
                        <strong>Note:</strong> Batch numbers are generated by the server based on group type.
                      </small>
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
                        {productId ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      productId ? "Update Product" : "Add Product"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;  