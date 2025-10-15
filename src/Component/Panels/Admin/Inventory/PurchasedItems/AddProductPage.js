import React, { useState, useEffect } from "react";
import { Button, Form, Table, Alert, Spinner } from "react-bootstrap";
import { BsPlus } from "react-icons/bs";
import AddCompanyModal from "./AddCompanyModal";
import AddCategoryModal from "./AddCategoryModal";
import axios from "axios";
import { baseurl } from "../../../../BaseURL/BaseURL";
import Header from "../../../../Shared/AdminSidebar/AdminHeader"
import AdminSidebar from "../../../../Shared/AdminSidebar/AdminSidebar";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const AddProductPage = ({ groupType = "Purchaseditems", user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const productToEdit = location.state?.productToEdit || null;
  console.log("productToEdit=", productToEdit);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { productId } = useParams();

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [maintainBatch, setMaintainBatch] = useState(false);
  const [batches, setBatches] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
  }, []);

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

  const showAlert = (message, variant = "success") => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: "", variant: "success" }), 3000);
  };

  const createDefaultBatch = () => {
    return {
      id: Date.now(),
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
    maintain_batch: false,
    can_be_sold: false
  });

  useEffect(() => {
    if (productToEdit) {
      const fetchBatches = async () => {
        try {
          const response = await axios.get(`${baseurl}/products/${productToEdit.id}/batches`);

          const mappedBatches = response.data && response.data.length > 0
            ? response.data.map(batch => ({
              id: batch.id,
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
          console.log("mappedBatches=", mappedBatches);
        } catch (error) {
          console.error("Error fetching batches:", error);
          setBatches([createDefaultBatch()]);
        }
      };

      fetchBatches();

  setFormData({
  group_by: productToEdit.group_by ?? groupType,
  goods_name: productToEdit.goods_name ?? productToEdit.name ?? "",
  category_id: productToEdit.category_id ?? "",
  company_id: productToEdit.company_id ?? "",
  price: productToEdit.price ?? "",
  inclusive_gst: productToEdit.inclusive_gst ?? "Inclusive",
  gst_rate: productToEdit.gst_rate ?? "18%",
  non_taxable: productToEdit.non_taxable ?? "",
  net_price: productToEdit.net_price ?? "",
  hsn_code: productToEdit.hsn_code ?? "",
  unit: productToEdit.unit ?? "UNT-UNITS",
  cess_rate: productToEdit.cess_rate ?? "",
  cess_amount: productToEdit.cess_amount ?? "",
  sku: productToEdit.sku ?? "",
  opening_stock: productToEdit.opening_stock ?? "",
  opening_stock_date: productToEdit.opening_stock_date ?? new Date().toISOString().split('T')[0],
  min_stock_alert: productToEdit.min_stock_alert ?? "",
  max_stock_alert: productToEdit.max_stock_alert ?? "",
  description: productToEdit.description ?? "",
  maintain_batch: productToEdit.maintain_batch ?? false,
  can_be_sold: productToEdit.can_be_sold ?? false
});

      setMaintainBatch(productToEdit.maintain_batch || false);
    }
  }, [productToEdit, groupType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

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
  setIsLoading(true);

  // Validate batches if Maintain Batch is enabled
  if (maintainBatch) {
    const invalidBatches = batches.filter(batch =>
      !batch.batchNumber || !batch.quantity || !batch.sellingPrice
    );

    if (invalidBatches.length > 0) {
      window.alert("Please fill all required fields in batch details (Batch Number, Quantity, and Selling Price)");
      setIsLoading(false);
      return;
    }
  }

  try {
    const batchesForBackend = maintainBatch ? batches.map(batch => ({
      batchNumber: batch.batchNumber,
      mfgDate: batch.mfgDate || null,
      expDate: batch.expDate || null,
      quantity: batch.quantity,
      costPrice: batch.costPrice || 0,
      sellingPrice: batch.sellingPrice,
      purchasePrice: batch.purchasePrice || 0,
      mrp: batch.mrp || 0,
      batchPrice: batch.batchPrice || 0
    })) : [];

    const dataToSend = {
      ...formData,
      ...(maintainBatch && { batches: batchesForBackend })
    };

    if (productToEdit) {
      await axios.put(`${baseurl}/products/${productToEdit.id}`, dataToSend, {
        headers: { "Content-Type": "application/json" },
      });
      window.alert(`Product "${formData.goods_name}" updated successfully!`);
    } else {
      await axios.post(`${baseurl}/products`, dataToSend, {
        headers: { "Content-Type": "application/json" },
      });
      window.alert("New product added successfully!");
    }

    // Navigate after alert
    navigate('/purchased_items');

  } catch (error) {
    console.error("Failed to add/update product.", error);
    window.alert("Failed to add/update product.");
  } finally {
    setIsLoading(false);
  }
};
const pageTitle = productToEdit
  ? `Edit Product in Purchased Items`
  : `Add Product to Purchased Items`;

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
              <h3 className="mb-4">{pageTitle}</h3>
         

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

export default AddProductPage;