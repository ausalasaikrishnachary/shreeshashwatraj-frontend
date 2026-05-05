import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import "./Invoices.css";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaPlus,
  FaEye,
} from "react-icons/fa";
import { baseurl } from "../../../BaseURL/BaseURL";

const Productioncreate = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const isEditMode = id && id !== "create";

  // State for products from API
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Invoice header state
  const [invoiceData, setInvoiceData] = useState({
    voucherNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
  });

  // Form state for production entry
  const [productionForm, setProductionForm] = useState({
    itemName: "",
    itemId: "",
    batchNo: "",
    batchId: "",
    qty: "",
    rate: "",
    amount: "",
    productionType: "Consumption",
  });

  // Production items list
  const [productionItems, setProductionItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [narration, setNarration] = useState("");

  // Company Info
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    gstin: "",
    state: "",
    stateCode: "",
  });

  useEffect(() => {
    fetchProducts();
    if (isEditMode) {
      fetchProductionData(id);
    } else {
      generateVoucherNumber();
    }
  }, [isEditMode, id]);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const res = await fetch(`${baseurl}/api/company-info`);
        const text = await res.text();

        let result;
        try {
          result = JSON.parse(text);
        } catch {
          throw new Error("Company API response is not JSON");
        }

        if (result.success && result.data) {
          setCompanyInfo({
            name: result.data.company_name || "",
            address: result.data.address || "",
            email: result.data.email || "",
            phone: result.data.phone || "",
            gstin: result.data.gstin || "",
            state: result.data.state || "",
            stateCode: result.data.state_code || "",
          });
        }
      } catch (error) {
        console.error("Company info fetch error:", error);
      }
    };

    fetchCompanyInfo();
  }, []);

  const fetchProductionData = async (voucherId) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/production/${voucherId}`);
      const result = await response.json();

      console.log("API Response:", result); // Debug log

      if (result.success) {
        const data = result.data;

        // Check if data has voucher property (from your GET API)
        if (data.voucher) {
          // Set invoice data from voucher object
          setInvoiceData({
            voucherNo: data.voucher.VchNo || "",
            invoiceDate: data.voucher.Date
              ? new Date(data.voucher.Date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          });
        } else {
          // Fallback: if data is directly the voucher object
          setInvoiceData({
            voucherNo: data.VchNo || "",
            invoiceDate: data.Date
              ? new Date(data.Date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          });
        }

        // Transform items for the table
        const items = (data.items || []).map((item) => ({
          id: item.id || Date.now(),
          itemName: item.product || "",
          itemId: item.product_id || "",
          batchNo: item.batch || "N.A.",
          batchId: item.batch_id || "",
          qty: item.quantity || 0,
          rate: item.price || 0,
          amount: item.total || 0,
          type: item.transaction_type || "Production",
        }));

        setProductionItems(items);
      } else {
        alert(
          "Failed to load production data: " +
            (result.message || "Unknown error"),
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching production data:", error);
      alert("Failed to load production data for editing");
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseurl}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate voucher number
  const generateVoucherNumber = async () => {
    try {
      const response = await fetch(`${baseurl}/production/last-voucher`);
      if (response.ok) {
        const data = await response.json();
        if (data.voucherNo) {
          const lastNumber = parseInt(data.voucherNo.split("-")[1]) || 0;
          const newNumber = String(lastNumber + 1).padStart(3, "0");
          setInvoiceData((prev) => ({
            ...prev,
            voucherNo: `COS-${newNumber}`,
          }));
        } else {
          setInvoiceData((prev) => ({ ...prev, voucherNo: "COS-001" }));
        }
      } else {
        setInvoiceData((prev) => ({ ...prev, voucherNo: "COS-001" }));
      }
    } catch (error) {
      console.error("Error generating voucher number:", error);
      setInvoiceData((prev) => ({ ...prev, voucherNo: "COS-001" }));
    }
  };

  // Fetch batches for selected product
  const fetchBatchesForProduct = async (productId) => {
    try {
      const response = await fetch(`${baseurl}/products/${productId}/batches`);
      const data = await response.json();
      setBatches(data);
      return data;
    } catch (error) {
      console.error("Error fetching batches:", error);
      setBatches([]);
      return [];
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.goods_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle invoice header change
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle product selection
  const handleProductSelect = async (product) => {
    setProductionForm((prev) => ({
      ...prev,
      itemName: product.goods_name || product.name,
      itemId: product.id,
      rate: product.net_price || product.price || 0,
      batchNo: "",
      batchId: "",
    }));

    await fetchBatchesForProduct(product.id);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductionForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "qty" || name === "rate") {
        const qty = parseFloat(updated.qty) || 0;
        const rate = parseFloat(updated.rate) || 0;
        updated.amount = (qty * rate).toFixed(2);
      }

      return updated;
    });
  };

  // Add or Update item
  const handleAddOrUpdate = () => {
    if (!productionForm.itemName) {
      alert("Please select an item");
      return;
    }

    if (!productionForm.qty || parseFloat(productionForm.qty) <= 0) {
      alert("Please enter valid quantity");
      return;
    }

    const newItem = {
      id: editingId || Date.now(),
      itemName: productionForm.itemName,
      itemId: productionForm.itemId,
      batchNo: productionForm.batchNo || "N.A.",
      batchId: productionForm.batchId,
      qty: productionForm.qty,
      rate: productionForm.rate,
      amount: productionForm.amount,
      type: productionForm.productionType,
    };

    if (editingId) {
      setProductionItems((prev) =>
        prev.map((item) => (item.id === editingId ? newItem : item)),
      );
      setEditingId(null);
    } else {
      setProductionItems((prev) => [...prev, newItem]);
    }

    // Reset form
    setProductionForm({
      itemName: "",
      itemId: "",
      batchNo: "",
      batchId: "",
      qty: "",
      rate: "",
      amount: "",
      productionType: "Production",
    });
    setBatches([]);
    setSearchTerm("");
  };

  // Edit item
  const handleEdit = async (item) => {
    setProductionForm({
      itemName: item.itemName,
      itemId: item.itemId,
      batchNo: item.batchNo,
      batchId: item.batchId,
      qty: item.qty,
      rate: item.rate,
      amount: item.amount,
      productionType: item.type,
    });
    setEditingId(item.id);

    if (item.itemId) {
      await fetchBatchesForProduct(item.itemId);
    }
  };

  // Delete item
  const handleDelete = (id) => {
    setProductionItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Cancel edit
  const handleCancel = () => {
    navigate("/productstable");
  };

  // Clear Draft
  const handleClearDraft = () => {
    if (window.confirm("Are you sure you want to clear all draft data?")) {
      setProductionItems([]);
      setProductionForm({
        itemName: "",
        itemId: "",
        batchNo: "",
        batchId: "",
        qty: "",
        rate: "",
        amount: "",
        productionType: "Production",
      });
      setNarration("");
      setEditingId(null);
      setBatches([]);
      if (!isEditMode) {
        generateVoucherNumber();
      }
      setInvoiceData((prev) => ({
        ...prev,
        invoiceDate: new Date().toISOString().split("T")[0],
      }));
      alert("✅ Draft cleared successfully!");
    }
  };

  // Save Production (Create or Update)
  const handleSave = async () => {
    if (productionItems.length === 0) {
      alert("⚠️ Please add at least one production item");
      return;
    }

    if (!invoiceData.voucherNo) {
      alert("⚠️ Please enter voucher number");
      return;
    }

    if (!invoiceData.invoiceDate) {
      alert("⚠️ Please select date");
      return;
    }

    setSaving(true);

    try {
      const productionData = {
        voucherNo: invoiceData.voucherNo,
        invoiceDate: invoiceData.invoiceDate,
        productionItems: productionItems.map((item) => ({
          itemName: item.itemName,
          itemId: item.itemId,
          batchNo: item.batchNo,
          batchId: item.batchId,
          qty: parseFloat(item.qty),
          rate: parseFloat(item.rate),
          amount: parseFloat(item.amount),
          type: item.type,
        })),
      };

      let url = `${baseurl}/production/create`;
      let method = "POST";

      if (isEditMode) {
        // Use the voucher ID from the URL for update
        url = `${baseurl}/production/update/${id}`;
        method = "PUT";
      }

      console.log("Saving to:", url, "with method:", method); // Debug log

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productionData),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Production ${isEditMode ? "updated" : "saved"} successfully!`,
        );
        navigate("/productstable"); // Update with your actual list route
      } else {
        alert(
          `❌ Failed to ${isEditMode ? "update" : "save"} production: ` +
            (result.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error saving production:", error);
      alert(
        `❌ Error ${isEditMode ? "updating" : "saving"} production. Please try again.`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      <div
        className={`admin-main-content ${sidebarCollapsed ? "collapsed" : ""}`}
      >
        <AdminHeader
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={window.innerWidth <= 768}
        />

        <div className="admin-content-wrapper">
          <Container fluid className="production-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="text-primary">
                {isEditMode ? "Edit Production" : "Create Production"}
              </h3>
              <div>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={handleClearDraft}
                  className="me-2"
                >
                  Clear Draft
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/productstable")}
                >
                  Back to List
                </Button>
              </div>
            </div>

            {/* Company Info Section */}
            <div className="bg-white p-3 rounded shadow-sm mb-4">
              <Row>
                <Col md={8}>
                  <div>
                    <strong className="text-primary fs-5">
                      {companyInfo.name || "Company Name"}
                    </strong>
                    <br />
                    {companyInfo.address || "Company Address"}
                    <br />
                    Email: {companyInfo.email || "-"} | Phone:{" "}
                    {companyInfo.phone || "-"}
                    <br />
                    GSTIN/UIN: {companyInfo.gstin || "-"}
                    <br />
                    State Name: {companyInfo.state || "-"}, Code:{" "}
                    {companyInfo.stateCode || "-"}
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-bold mt-1">Voucher No</Form.Label>

                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      name="voucherNo"
                      value={invoiceData.voucherNo}
                      onChange={handleInvoiceChange}
                      className="border-primary"
                      placeholder="Voucher No"
                      readOnly={isEditMode}
                      disabled={isEditMode}
                    />
                  </Form.Group>
                  <Form.Label className="fw-bold mt-1">Date</Form.Label>

                  <Form.Group>
                    <Form.Control
                      type="date"
                      name="invoiceDate"
                      value={invoiceData.invoiceDate}
                      onChange={handleInvoiceChange}
                      className="border-primary"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Production Form Section */}
            <div className="bg-white p-3 rounded shadow-sm mb-4">
              <h6 className="text-primary mb-3">
                {editingId ? "Edit Production Item" : "Add Production Item"}
              </h6>

              {/* Horizontal Form */}
              <div className="d-flex align-items-end gap-2 flex-wrap">
                <div
                  style={{ minWidth: "180px", flex: 2, position: "relative" }}
                >
                  <Form.Label className="fw-bold small">Item Name</Form.Label>
                  <input
                    type="text"
                    className="form-control form-control-sm border-primary"
                    placeholder="Search product..."
                    value={productionForm.itemName || searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                      if (!e.target.value) {
                        setProductionForm((prev) => ({
                          ...prev,
                          itemName: "",
                          itemId: "",
                          rate: "",
                        }));
                        setBatches([]);
                      }
                    }}
                    onClick={() => setIsDropdownOpen(true)}
                  />

                  {/* Product Dropdown */}
                  {isDropdownOpen && !productionForm.itemId && (
                    <div
                      className="position-absolute w-100"
                      style={{
                        top: "100%",
                        left: 0,
                        zIndex: 9999,
                        backgroundColor: "#fff",
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px 16px",
                          borderBottom: "1px solid #dee2e6",
                          color: "#0d6efd",
                          fontWeight: 600,
                          position: "sticky",
                          top: 0,
                          backgroundColor: "#fff",
                        }}
                      >
                        Select Product
                      </div>
                      <div>
                        {loading ? (
                          <div style={{ padding: "16px", textAlign: "center" }}>
                            Loading...
                          </div>
                        ) : filteredProducts.length === 0 ? (
                          <div
                            style={{
                              padding: "16px",
                              textAlign: "center",
                              color: "#6c757d",
                            }}
                          >
                            No products found
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              onClick={() => handleProductSelect(product)}
                              style={{
                                padding: "8px 16px",
                                cursor: "pointer",
                                borderLeft: "3px solid transparent",
                                transition: "background-color 0.2s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#f8f9fa")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <div
                                style={{ fontWeight: 400, fontSize: "13px" }}
                              >
                                {product.goods_name || product.name}
                              </div>
                              <div
                                style={{ fontSize: "11px", color: "#6c757d" }}
                              >
                                Rate: ₹{product.net_price || product.price || 0}{" "}
                                | Unit: {product.unit_name || "-"}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div
                        style={{
                          padding: "8px 16px",
                          borderTop: "1px solid #dee2e6",
                          position: "sticky",
                          bottom: 0,
                          backgroundColor: "#fff",
                        }}
                      >
                        <button
                          className="btn btn-sm btn-outline-secondary w-100"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setSearchTerm("");
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ minWidth: "120px", flex: 1 }}>
                  <Form.Label className="fw-bold small">Batch No.</Form.Label>
                  <Form.Select
                    name="batchNo"
                    value={productionForm.batchNo}
                    onChange={(e) => {
                      const selectedBatch = batches.find(
                        (b) => b.batch_number === e.target.value,
                      );
                      setProductionForm((prev) => ({
                        ...prev,
                        batchNo: e.target.value,
                        batchId: selectedBatch?.id || "",
                      }));
                    }}
                    className="border-primary"
                    size="sm"
                    disabled={batches.length === 0}
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.batch_number}>
                        {batch.batch_number} (Qty: {batch.quantity})
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div style={{ minWidth: "100px", flex: 1 }}>
                  <Form.Label className="fw-bold small">Qty</Form.Label>
                  <Form.Control
                    type="number"
                    name="qty"
                    value={productionForm.qty}
                    onChange={handleFormChange}
                    placeholder="0"
                    className="border-primary"
                    size="sm"
                  />
                </div>

                <div style={{ minWidth: "100px", flex: 1 }}>
                  <Form.Label className="fw-bold small">Rate</Form.Label>
                  <Form.Control
                    type="number"
                    name="rate"
                    value={productionForm.rate}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    className="border-primary"
                    size="sm"
                  />
                </div>

                <div style={{ minWidth: "100px", flex: 1 }}>
                  <Form.Label className="fw-bold small">Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="amount"
                    value={productionForm.amount}
                    readOnly
                    className="border-primary bg-light"
                    size="sm"
                  />
                </div>

                <div style={{ minWidth: "130px", flex: 1.2 }}>
                  <Form.Label className="fw-bold small">
                    Production Type
                  </Form.Label>
                  <Form.Select
                    name="productionType"
                    value={productionForm.productionType}
                    onChange={handleFormChange}
                    className="border-primary"
                    size="sm"
                  >
                    <option value="Consumption">Consumption</option>
                    <option value="Production">Production</option>
                  </Form.Select>
                </div>

                <div style={{ minWidth: "100px" }}>
                  <div className="d-flex gap-1">
                    <Button
                      variant={editingId ? "warning" : "success"}
                      onClick={handleAddOrUpdate}
                      size="sm"
                      disabled={saving}
                    >
                      {editingId ? (
                        <FaSave className="me-1" />
                      ) : (
                        <FaPlus className="me-1" />
                      )}
                      {editingId ? "Update" : "Add"}
                    </Button>
                    {editingId && (
                      <Button
                        variant="secondary"
                        onClick={handleCancel}
                        size="sm"
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Production Items Table */}
            <div className="bg-white p-3 rounded shadow-sm mb-4">
              <h6 className="text-primary mb-3">Production Items</h6>
              <div className="table-responsive">
                <Table bordered responsive size="sm" className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>ItemName</th>
                      <th>BatchNo</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-3">
                          No items added. Please add items using the form above.
                        </td>
                      </tr>
                    ) : (
                      productionItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.itemName}</td>
                          <td>{item.batchNo}</td>
                          <td>{item.qty}</td>
                          <td>{parseFloat(item.rate).toFixed(2)}</td>
                          <td>{parseFloat(item.amount).toFixed(2)}</td>
                          <td>
                            <span
                              className={`badge ${item.type === "Production" ? "bg-success" : "bg-info"}`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
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
            </div>

            {/* Action Buttons */}
            <div className="text-center bg-white p-3 rounded shadow-sm mt-4">
              <Button
                variant="primary"
                className="me-3 px-4"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : isEditMode
                    ? "Update Production"
                    : "Save Production"}
              </Button>
              <Button variant="danger" onClick={handleClearDraft}>
                Cancel
              </Button>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Productioncreate;
