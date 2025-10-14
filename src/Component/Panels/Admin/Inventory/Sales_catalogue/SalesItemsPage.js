import React, { useState, useEffect } from "react";
import { Button, Form, Table, Alert, Spinner } from "react-bootstrap";
import { BsPlus } from "react-icons/bs";
import AddCompanyModal from "./AddCompanyModal";
import AddCategoryModal from "../PurchasedItems/AddCategoryModal";
import axios from "axios";
import { baseurl } from "./../../../../BaseURL/BaseURL";
import AdminSidebar from "./../../../../Shared/AdminSidebar/AdminSidebar";
import Header from "./../../../../Shared/AdminSidebar/AdminHeader";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./salesitems.css";

const SalesItemsPage = ({ groupType = "Salescatalog", user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId } = useParams();
  
  const productToEdit = location.state?.productToEdit || null;
  
  console.log("🔍 Debug productToEdit:", productToEdit);
  console.log("🔍 Debug location.state:", location.state);
  console.log("🔍 Debug productId from URL:", productId);

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
      if (!productToEdit && !productId) {
        setIsDataLoaded(true);
        return;
      }

      console.log("🔄 Loading product data for editing...");
      setIsLoading(true);
      
      try {
        if (productToEdit) {
          console.log("📝 Using product from location state:", productToEdit);
          
          setFormData({
            group_by: productToEdit.group_by || groupType,
            goods_name: productToEdit.goods_name || productToEdit.name || "",
            category_id: productToEdit.category_id || "",
            company_id: productToEdit.company_id || "",
            price: productToEdit.price || "",
            inclusive_gst: productToEdit.inclusive_gst || "",
            gst_rate: productToEdit.gst_rate || "",
            non_taxable: productToEdit.non_taxable || "",
            net_price: productToEdit.net_price || "",
            hsn_code: productToEdit.hsn_code || "",
            unit: productToEdit.unit || "UNT-UNITS",
            cess_rate: productToEdit.cess_rate || "",
            cess_amount: productToEdit.cess_amount || "",
            sku: productToEdit.sku || "",
            opening_stock: productToEdit.opening_stock || "",
            opening_stock_date: productToEdit.opening_stock_date ? productToEdit.opening_stock_date.split('T')[0] : new Date().toISOString().split('T')[0],
            min_stock_alert: productToEdit.min_stock_alert || "",
            max_stock_alert: productToEdit.max_stock_alert || "",
            description: productToEdit.description || "",
            maintain_batch: productToEdit.maintain_batch || false
          });
          
          setMaintainBatch(productToEdit.maintain_batch || false);
          await fetchBatches(productToEdit.id);
        } else if (productId) {
          console.log("🔄 Fetching product by ID:", productId);
          await fetchProductById(productId);
        }
        
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
  }, [productToEdit, productId, groupType]);

  const fetchProductById = async (id) => {
    try {
      const response = await axios.get(`${baseurl}/products/${id}`);
      const product = response.data;
      console.log("📦 Fetched product:", product);
      
      setFormData({
        group_by: product.group_by || groupType,
        goods_name: product.goods_name || product.name || "",
        category_id: product.category_id || "",
        company_id: product.company_id || "",
        price: product.price || "",
        inclusive_gst: product.inclusive_gst || "",
        gst_rate: product.gst_rate || "",
        non_taxable: product.non_taxable || "",
        net_price: product.net_price || "",
        hsn_code: product.hsn_code || "",
        unit: product.unit || "UNT-UNITS",
        cess_rate: product.cess_rate || "",
        cess_amount: product.cess_amount || "",
        sku: product.sku || "",
        opening_stock: product.opening_stock || "",
        opening_stock_date: product.opening_stock_date ? product.opening_stock_date.split('T')[0] : new Date().toISOString().split('T')[0],
        min_stock_alert: product.min_stock_alert || "",
        max_stock_alert: product.max_stock_alert || "",
        description: product.description || "",
        maintain_batch: product.maintain_batch || false
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

  const fetchBatches = async (productId = null) => {
    try {
      const idToUse = productId || productToEdit?.id;
      console.log("🔄 Fetching batches for product ID:", idToUse);
      
      if (!idToUse) {
        console.log("❌ No product ID provided for batches");
        setBatches([createDefaultBatch()]);
        return;
      }

      const response = await axios.get(`${baseurl}/products/${idToUse}/batches`);
      console.log("📦 Batches response:", response.data);

      const mappedBatches = response.data && response.data.length > 0
        ? response.data.map(batch => ({
            id: batch.id || Date.now() + Math.random(),
            batchNumber: batch.batch_number || "",
            mfgDate: batch.mfg_date ? batch.mfg_date.split('T')[0] : "",
            expDate: batch.exp_date ? batch.exp_date.split('T')[0] : "",
            quantity: batch.quantity || "",
            costPrice: batch.cost_price || "",
            sellingPrice: batch.selling_price || formData.price || "",
            purchasePrice: batch.purchase_price || "",
            mrp: batch.mrp || "",
            batchPrice: batch.batch_price || ""
          }))
        : [createDefaultBatch()];

      setBatches(mappedBatches);
      console.log("✅ Batches set:", mappedBatches);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setBatches([createDefaultBatch()]);
    }
  };

  const showAlert = (message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: "", variant: "success" }), 5000);
  };

  const createDefaultBatch = () => {
    return {
      id: Date.now() + Math.random(),
      batchNumber: "",
      mfgDate: "",
      expDate: "",
      quantity: "",
      costPrice: "",
      sellingPrice: formData.price || "",
      purchasePrice: "",
      mrp: "",
      batchPrice: ""
    };
  };

  const [formData, setFormData] = useState({
    group_by: groupType,
    goods_name: "",
    category_id: "",
    company_id: "",
    price: "",
    inclusive_gst: "",
    gst_rate: "",
    non_taxable: "",
    net_price: "",
    hsn_code: "",
    unit: "UNT-UNITS",
    cess_rate: "",
    cess_amount: "",
    sku: "",
    opening_stock: "",
    opening_stock_date: new Date().toISOString().split('T')[0],
    min_stock_alert: "",
    max_stock_alert: "",
    description: "",
    maintain_batch: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`🔄 Handling change: ${name} = ${type === 'checkbox' ? checked : value}`);

    if (name === "maintain_batch") {
      if (checked && batches.length === 0) {
        const defaultBatch = createDefaultBatch();
        const updatedBatches = [...batches, defaultBatch];
        setBatches(updatedBatches);
      }
      setFormData(prev => ({ ...prev, maintain_batch: checked }));
      setMaintainBatch(checked);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));

      if (name === "price" && batches.length > 0) {
        const updatedBatches = batches.map(batch => ({
          ...batch,
          sellingPrice: value || batch.sellingPrice
        }));
        setBatches(updatedBatches);
      }
    }
  };

  const handleBatchChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...batches];
    updated[index][name] = value;
    setBatches(updated);
  };

  const addNewBatch = () => {
    const newBatch = createDefaultBatch();
    const updated = [...batches, newBatch];
    setBatches(updated);
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
    console.log("🚀 Submitting form...");

    if (maintainBatch) {
      const invalidBatches = batches.filter(batch =>
        !batch.batchNumber || !batch.quantity || !batch.sellingPrice
      );

      if (invalidBatches.length > 0) {
        showAlert("Please fill all required fields in batch details (Batch Number, Quantity, and Selling Price)", "warning");
        return;
      }
    }

    setIsLoading(true);

    try {
      const batchesForBackend = maintainBatch ? batches.map(batch => ({
        batch_number: batch.batchNumber,
        mfg_date: batch.mfgDate || null,
        exp_date: batch.expDate || null,
        quantity: batch.quantity,
        cost_price: batch.costPrice || 0,
        selling_price: batch.sellingPrice,
        purchase_price: batch.purchasePrice || 0,
        mrp: batch.mrp || 0,
        batch_price: batch.batchPrice || 0
      })) : [];

      const dataToSend = {
        ...formData,
        ...(maintainBatch && { batches: batchesForBackend })
      };

      console.log("📤 Sending data:", dataToSend);

      if (productToEdit || productId) {
        const idToUpdate = productToEdit?.id || productId;
        console.log(`🔄 Updating product ID: ${idToUpdate}`);
        await axios.put(`${baseurl}/products/${idToUpdate}`, dataToSend, {
          headers: { "Content-Type": "application/json" },
        });
        showAlert("Product updated successfully!");
      } else {
        console.log("➕ Creating new product");
        await axios.post(`${baseurl}/products`, dataToSend, {
          headers: { "Content-Type": "application/json" },
        });
        showAlert("Product added successfully!");
      }

      setTimeout(() => navigate('/sale_items'), 1500);
    } catch (error) {
      console.error("❌ Failed to add/update product:", error);
      showAlert("Failed to add/update product.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const pageTitle = (productToEdit || productId) 
    ? `Edit Product in Sales Catalog`
    : `Add Product to Sales Catalog`;

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
              
              {(productToEdit || productId) && (
                <Alert variant="info" className="mb-3">
                  <small>
                    <strong>Editing Mode:</strong> {productToEdit ? `Product ID: ${productToEdit.id}` : `URL ID: ${productId}`}
                    <br />
                    <strong>Product Name:</strong> {formData.goods_name}
                    <br />
                    <strong>Batches:</strong> {batches.length}
                  </small>
                </Alert>
              )}

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
                      <option value="18%">GST Rate 18%</option>
                      <option value="12%">GST Rate 12%</option>
                      <option value="5%">GST Rate 5%</option>
                      <option value="0%">GST Rate 0%</option>
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
                      label="Maintain Batch"
                      name="maintain_batch"
                      checked={formData.maintain_batch}
                      onChange={(e) => {
                        setMaintainBatch(e.target.checked);
                        handleChange(e);
                      }}
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
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Batch No.*</th>
                          <th>Exp. Date</th>
                          <th>Mfg. Date</th>
                          <th>Sale Price*</th>
                          <th>Purchase Price</th>
                          <th>M.R.P</th>
                          <th>Batch Price</th>
                          <th>Stock*</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batches.map((batch, index) => (
                          <tr key={batch.id}>
                            <td>
                              <Form.Control
                                placeholder="Batch Number"
                                name="batchNumber"
                                value={batch.batchNumber}
                                onChange={(e) => handleBatchChange(index, e)}
                                required
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="date"
                                name="expDate"
                                value={batch.expDate}
                                onChange={(e) => handleBatchChange(index, e)}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="date"
                                name="mfgDate"
                                value={batch.mfgDate}
                                onChange={(e) => handleBatchChange(index, e)}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="sellingPrice"
                                value={batch.sellingPrice}
                                onChange={(e) => handleBatchChange(index, e)}
                                required
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="purchasePrice"
                                value={batch.purchasePrice}
                                onChange={(e) => handleBatchChange(index, e)}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="mrp"
                                value={batch.mrp}
                                onChange={(e) => handleBatchChange(index, e)}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="batchPrice"
                                value={batch.batchPrice}
                                onChange={(e) => handleBatchChange(index, e)}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                name="quantity"
                                value={batch.quantity}
                                onChange={(e) => handleBatchChange(index, e)}
                                required
                              />
                            </td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeBatch(batch.id)}
                                disabled={batches.length <= 1}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <Button variant="primary" onClick={addNewBatch}>
                      Add Batch
                    </Button>
                    <div className="mt-2 text-muted">
                      <small>* indicates required fields</small>
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
                        {productToEdit || productId ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      productToEdit || productId ? "Update Product" : "Add Product"
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

export default SalesItemsPage;