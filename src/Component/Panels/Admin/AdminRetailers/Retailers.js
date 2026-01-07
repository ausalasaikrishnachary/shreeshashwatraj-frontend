import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./Retailers.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaSearch, FaUpload, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

function Retailers() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [retailersData, setRetailersData] = useState([]);
  const [filteredRetailersData, setFilteredRetailersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("retailer");
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch retailers data from API
  useEffect(() => {
    fetchRetailers();
  }, []);

  // Filter retailers by role when data changes or role selection changes
  useEffect(() => {
    if (retailersData.length > 0) {
      const filteredData = retailersData
        .filter(item => {
          if (selectedRole === "retailer") {
            return item.role === "retailer";
          } else if (selectedRole === "supplier") {
            return item.role === "supplier";
          }
          return false;
        })
        .filter(item =>
          (item.business_name || item.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.mobile_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.group || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      setFilteredRetailersData(filteredData);
    }
  }, [retailersData, searchTerm, selectedRole]);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/accounts`);
      setRetailersData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch retailers:', err);
      setError('Failed to load retailers data');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete retailer/supplier
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`${baseurl}/accounts/${id}`);
        alert(`${selectedRole === 'retailer' ? 'Retailer' : 'Supplier'} deleted successfully!`);
        fetchRetailers();
      } catch (err) {
        console.error('Failed to delete:', err);
        alert(`Failed to delete ${selectedRole === 'retailer' ? 'retailer' : 'supplier'}`);
      }
    }
  };

  // Handle edit retailer/supplier
  const handleEdit = (id) => {
    navigate(`/retailers/edit/${id}`);
  };

  // Handle view retailer/supplier
  const handleView = (id) => {
    navigate(`/retailers/view/${id}`);
  };

  // Handle mobile toggle
  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Handle add retailer
  const handleAddRetailer = () => {
    navigate("/retailers/add");
  };

  // Handle place order
  const handlePlaceOrder = (retailer) => {
    navigate("/retailers/place-order", {
      state: {
        retailerId: retailer.id,
        retailerName: retailer.business_name || retailer.name,
        displayName: retailer.display_name,
        discount: retailer.discount || 0
      }
    });
  };

  // Bulk Upload Functions
  const handleBulkUploadClick = () => {
    setShowBulkUploadModal(true);
    setUploadError("");
    setUploadSuccess("");
    setPreviewData([]);
    setIsPreviewMode(false);
    setBulkUploadFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setUploadError("Please select an Excel file (.xlsx, .xls, .csv)");
      return;
    }

    setBulkUploadFile(file);
    setUploadError("");
    setUploadSuccess("");
    
    // Preview the file
    previewExcelFile(file);
  };

const previewExcelFile = (file) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      if (jsonData.length < 2) {
        setUploadError("Excel file is empty or has no data");
        return;
      }

      // Get headers
      const headers = jsonData[0];
      
      // Check required headers
      const requiredHeaders = ["name", "business_name", "display_name"];
      const missingHeaders = requiredHeaders.filter(header => 
        !headers.some(h => h && h.toString().toLowerCase().replace(/\s+/g, '_') === header)
      );

      if (missingHeaders.length > 0) {
        setUploadError(`Missing required columns: ${missingHeaders.join(", ")}`);
        return;
      }

      // Process data rows
      const processedData = jsonData.slice(1).map((row, index) => {
        const rowData = {};
        headers.forEach((header, colIndex) => {
          if (header) {
            const key = header.toString().toLowerCase().replace(/\s+/g, '_');
            // Ensure target is always lowercase
            if (key === 'target') {
              rowData['target'] = row[colIndex] || "";
            } else {
              rowData[key] = row[colIndex] || "";
            }
          }
        });
        
        // Set role based on selectedRole
        rowData.role = selectedRole;
        
        // Set group based on role
        if (selectedRole === "retailer") {
          rowData.group = rowData.group || "Retailer";
          rowData.entity_type = rowData.entity_type || "Individual";
        } else {
          rowData.group = rowData.group || "SUPPLIERS";
        }
        
        // Set default values for required fields
        rowData.status = "Active";
        rowData.password = rowData.name ? 
          `${rowData.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}@123` : "";
        rowData.discount = rowData.discount || 0;
        
        // Ensure target is set and remove any uppercase Target
        rowData.target = rowData.target || 100000;
        if (rowData.Target) {
          delete rowData.Target;
        }
        
        return {
          ...rowData,
          __id: index + 1,
          __status: "pending"
        };
      });

      setPreviewData(processedData);
      setIsPreviewMode(true);
      setUploadError("");
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      setUploadError("Error parsing Excel file. Please check the format.");
    }
  };

  reader.onerror = () => {
    setUploadError("Error reading file");
  };

  reader.readAsArrayBuffer(file);
};

  const handleBulkUpload = async () => {
    if (!bulkUploadFile || previewData.length === 0) {
      setUploadError("Please select a valid Excel file first");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess("");

    try {
      const totalRecords = previewData.length;
      let successfulUploads = 0;
      let failedUploads = 0;
      const errors = [];

      for (let i = 0; i < previewData.length; i++) {
        const record = previewData[i];
        
        // Calculate progress
        const progress = Math.round(((i + 1) / totalRecords) * 100);
        setUploadProgress(progress);

        try {
          // Prepare data for API
          const uploadData = {
            ...record,
            // Remove internal fields
            __id: undefined,
            __status: undefined
          };

          // Send to API
          await axios.post(`${baseurl}/accounts`, uploadData);
          successfulUploads++;

          // Update preview status
          setPreviewData(prev => prev.map(item => 
            item.__id === record.__id 
              ? { ...item, __status: "success" }
              : item
          ));

        } catch (error) {
          failedUploads++;
          errors.push(`Row ${i + 2}: ${error.response?.data?.message || error.message}`);
          
          // Update preview status
          setPreviewData(prev => prev.map(item => 
            item.__id === record.__id 
              ? { ...item, __status: "error", __error: error.response?.data?.message || "Upload failed" }
              : item
          ));
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Complete upload
      setUploadProgress(100);
      
      if (failedUploads === 0) {
        setUploadSuccess(`Successfully uploaded ${successfulUploads} ${selectedRole}(s)!`);
        // Refresh retailers list
        setTimeout(() => {
          fetchRetailers();
          setShowBulkUploadModal(false);
        }, 2000);
      } else {
        setUploadError(
          `Uploaded ${successfulUploads} out of ${totalRecords} records. ${failedUploads} failed.`
        );
      }

    } catch (error) {
      console.error("Bulk upload error:", error);
      setUploadError("Bulk upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create template data based on selected role
    const templateHeaders = selectedRole === "retailer" 
      ? [
          "name", "business_name", "display_name", "email", "mobile_number", 
          "phone_number", "entity_type", "gstin", "discount", "target",
          "credit_limit", "shipping_address_line1", "shipping_city", 
          "shipping_state", "shipping_pin_code", "shipping_country",
          "billing_address_line1", "billing_city", "billing_state", 
          "billing_pin_code", "billing_country"
        ]
      : [
          "name", "business_name", "display_name", "email", "mobile_number", 
          "phone_number", "gstin", "discount", "target", 
          "shipping_address_line1", "shipping_city", "shipping_state", 
          "shipping_pin_code", "shipping_country", "billing_address_line1", 
          "billing_city", "billing_state", "billing_pin_code", "billing_country"
        ];

    // Create sample data
    const sampleData = selectedRole === "retailer"
      ? ["John Doe", "ABC Traders", "John's Store", "john@example.com", "9876543210", 
         "0441234567", "Individual", "27ABCDE1234F1Z5", "10", "100000", 
         "50000", "123 Main Street", "Chennai", "Tamil Nadu", "600001", 
         "India", "123 Main Street", "Chennai", "Tamil Nadu", "600001", "India"]
      : ["Supplier Corp", "Supplier Corp", "Supplier Corp Display", "supplier@example.com", 
         "9876543210", "0441234567", "27ABCDE1234F1Z5", "5", "500000", 
         "456 Supplier Street", "Mumbai", "Maharashtra", "400001", 
         "India", "456 Supplier Street", "Mumbai", "Maharashtra", "400001", "India"];

    const ws = XLSX.utils.aoa_to_sheet([templateHeaders, sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    // Generate and download file
    const fileName = `${selectedRole}_bulk_upload_template.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const closeBulkUploadModal = () => {
    setShowBulkUploadModal(false);
    setBulkUploadFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess("");
    setPreviewData([]);
    setIsPreviewMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Custom renderers
  const renderRetailerCell = (item) => (
    <div className="retailers-table__retailer-cell">
      <strong className="retailers-table__retailer-name">{item.business_name || item.name}</strong>
      <span className="retailers-table__retailer-id">ID: {item.id}</span>
    </div>
  );

  const renderContactCell = (item) => (
    <div className="retailers-table__contact-cell">
      <div className="retailers-table__contact-item">
        <span className="retailers-table__contact-icon">📞</span>
        {item.mobile_number}
      </div>
      <div className="retailers-table__contact-email">
        {item.email}
      </div>
    </div>
  );

  const renderTypeLocationCell = (item) => (
    <div className="retailers-table__type-location-cell">
      <strong className="retailers-table__type">
        {item.entity_type}
      </strong>
      <div className="retailers-table__location">
        <span className="retailers-table__location-icon">📍</span>
        {item.shipping_city}, {item.shipping_state}
      </div>
    </div>
  );

const renderPerformanceCell = (item) => (
  <div className="retailers-table__performance-cell">
    <div className="retailers-table__rating">
      <span className="retailers-table__rating-icon">⭐</span>
      Discount: {item.discount || 0}%
    </div>
    <div className="retailers-table__revenue">
      Target: ₹ {((item.target || item.Target || 100000) ? parseInt(item.target || item.Target || 100000).toLocaleString() : "100,000")}
    </div>
  </div>
);

  const renderGroupTypeCell = (item) => (
    <div className="retailers-table__group-type-cell">
      <span className="retailers-table__group-type">
        {item.group || "N/A"}
      </span>
    </div>
  );

  const renderStatusCell = (item) => (
    <span className={`retailers-table__status retailers-table__status--active`}>
      Active
    </span>
  );

  const renderActionsCell = (item) => (
    <div className="retailers-table__actions">
      <button
        className="retailers-table__action-btn retailers-table__action-btn--view"
        onClick={() => handleView(item.id)}
        title="View"
      >
        👁️
      </button>
      <button
        className="retailers-table__action-btn retailers-table__action-btn--edit"
        onClick={() => handleEdit(item.id)}
        title="Edit"
      >
        ✏️
      </button>
      <button
        className="retailers-table__action-btn retailers-table__action-btn--delete"
        onClick={() => handleDelete(item.id, item.business_name || item.name)}
        title="Delete"
      >
        🗑️
      </button>
    </div>
  );

  const columns = [
    { key: "__item", title: selectedRole === "retailer" ? "Retailer" : "Supplier", render: (value, item) => renderRetailerCell(item) },
    { key: "__item", title: "Contact", render: (value, item) => renderContactCell(item) },
    { key: "__item", title: "Type & Location", render: (value, item) => renderTypeLocationCell(item) },
    { key: "display_name", title: "Display Name" },
    { key: "__item", title: "Group Type", render: (value, item) => renderGroupTypeCell(item) },
    { key: "__item", title: "Performance", render: (value, item) => renderPerformanceCell(item) },
    { key: "__item", title: "Status", render: (value, item) => renderStatusCell(item) },
    { 
      key: "__item", 
      title: "Place Order", 
      render: (value, item) => (
        <button
          className="retailers-table__order-btn"
          onClick={() => handlePlaceOrder(item)}
          title="Place Order"
        >
          🛒 Order
        </button>
      )
    },
    { 
      key: "__item", 
      title: "Actions", 
      render: (value, item) => (
        <div className="retailers-table__actions">
          <button
            className="retailers-table__action-btn retailers-table__action-btn--view"
            onClick={() => handleView(item.id)}
            title="View"
          >
            👁️
          </button>
          <button
            className="retailers-table__action-btn retailers-table__action-btn--edit"
            onClick={() => handleEdit(item.id)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="retailers-table__action-btn retailers-table__action-btn--delete"
            onClick={() => handleDelete(item.id, item.business_name || item.name)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  const getTitle = () => {
    return selectedRole === "retailer" ? "All Contacts" : "All Suppliers";
  };

  const getSubtitle = () => {
    return selectedRole === "retailer"
      ? ""
      : "";
  };

  const getSectionTitle = () => {
    return selectedRole === "retailer" ? "Retailers" : "Suppliers";
  };

  const getSectionDescription = () => {
    return selectedRole === "retailer"
      ? ""
      : "";
  };

  if (loading) {
    return (
      <div className="retailers-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="retailers-main-content">
            <div className="loading-spinner">Loading {selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="retailers-wrapper">
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="retailers-main-content">
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchRetailers} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="retailers-wrapper">
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onToggleMobile={isMobileOpen}
      />

      <div className={`retailers-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          isCollapsed={isCollapsed}
          onToggleSidebar={handleToggleMobile}
        />

        <div className="retailers-main-content">
          <div className="retailers-content-section">
            <div className="retailers-header-top">
              <div className="retailers-title-section">
                <h1 className="retailers-main-title">{getTitle()}</h1>
                <p className="retailers-subtitle">
                  {getSubtitle()}
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center retailers-search-add-container">
              <div className="retailers-search-container">
                <div className="retailers-search-box">
                  <input
                    type="text"
                    placeholder={`Search ${selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...`}
                    className="retailers-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="retailers-search-icon" size={18} />
                </div>
              </div>

              <div className="retailers-buttons-container">
                <div className="retailers-role-selector">
                  <select
                    className="retailers-role-dropdown"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="retailer">Retailers</option>
                    <option value="supplier">Suppliers</option>
                  </select>
                </div>

                <div className="retailers-add-buttons">
                  <button
                    className="retailers-add-button retailers-add-button--upload"
                    onClick={handleBulkUploadClick}
                    title="Bulk Upload"
                  >
                    <FaUpload className="retailers-add-icon" />
                    Bulk Upload
                  </button>
                  <button
                    className="retailers-add-button retailers-add-button--retailer"
                    onClick={handleAddRetailer}
                  >
                    <span className="retailers-add-icon">+</span>
                    Add Contact
                  </button>
                </div>
              </div>
            </div>

            <div className="retailers-list-section">
              <div className="retailers-section-header">
                <h2 className="retailers-section-title">
                  {getSectionTitle()} ({filteredRetailersData.length})
                </h2>
                <p className="retailers-section-description">
                  {getSectionDescription()}
                </p>
              </div>

              <div className="retailers-table-container">
                <ReusableTable
                  data={filteredRetailersData}
                  columns={columns}
                  initialEntriesPerPage={10}
                  searchPlaceholder={`Search ${selectedRole === 'retailer' ? 'retailers' : 'suppliers'}...`}
                  showSearch={true}
                  showEntriesSelector={true}
                  showPagination={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                <FaFileExcel style={{ marginRight: '10px', color: '#1d6f42' }} />
                Bulk Upload {selectedRole === 'retailer' ? 'Retailers' : 'Suppliers'}
              </h2>
              <button className="modal-close-btn" onClick={closeBulkUploadModal}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {!isPreviewMode ? (
                <>
                  <div className="upload-instructions">
                    <h4>Instructions:</h4>
                    <ul>
                      <li>Download the template file to see the required format</li>
                      <li>Fill in the data following the template structure</li>
                      <li>Upload the completed Excel file (.xlsx, .xls, .csv)</li>
                      <li>Required fields: <strong>name, business_name, display_name</strong></li>
                      <li>Each record will be added as a <strong>{selectedRole}</strong></li>
                    </ul>
                  </div>

                  <div className="upload-actions">
                    <button
                      className="btn-template-download"
                      onClick={downloadTemplate}
                    >
                      <FaFileExcel /> Download Template
                    </button>

                    <div className="file-upload-area">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        id="bulk-upload-file"
                      />
                      <label htmlFor="bulk-upload-file" className="file-upload-label">
                        <FaUpload size={24} />
                        <span>Choose Excel File</span>
                        {bulkUploadFile && (
                          <span className="selected-file">{bulkUploadFile.name}</span>
                        )}
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="preview-section">
                    <h4>Preview ({previewData.length} records)</h4>
                    <div className="preview-table-container">
                      <table className="preview-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Business Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((item, index) => (
                            <tr key={item.__id} className={`preview-row ${item.__status}`}>
                              <td>{index + 1}</td>
                              <td>{item.name}</td>
                              <td>{item.business_name}</td>
                              <td>{item.email}</td>
                              <td>{item.mobile_number}</td>
                              <td>
                                <span className={`status-badge ${item.__status}`}>
                                  {item.__status === 'success' ? '✓ Ready' : 
                                   item.__status === 'error' ? '✗ Error' : '⏳ Pending'}
                                </span>
                                {item.__error && (
                                  <div className="error-tooltip">{item.__error}</div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {uploading && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">{uploadProgress}%</div>
                    </div>
                  )}
                </>
              )}

              {uploadError && (
                <div className="alert alert-error">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="alert alert-success">
                  {uploadSuccess}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={closeBulkUploadModal}
                disabled={uploading}
              >
                Cancel
              </button>
              
              {isPreviewMode && (
                <button
                  className="btn-back"
                  onClick={() => setIsPreviewMode(false)}
                  disabled={uploading}
                >
                  Back
                </button>
              )}
              
              {isPreviewMode && (
                <button
                  className="btn-upload"
                  onClick={handleBulkUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : `Upload ${previewData.length} ${selectedRole}(s)`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Retailers;