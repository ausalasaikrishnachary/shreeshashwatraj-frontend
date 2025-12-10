import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./Retailers.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaSearch } from "react-icons/fa";

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

  // Handle place order - UPDATED VERSION
  const handlePlaceOrder = (retailer) => {
    navigate("/retailers/place-order", {
      state: {
        retailerId: retailer.id,
        retailerName: retailer.business_name || retailer.name,
        displayName: retailer.display_name, // Add this line
        discount: retailer.discount || 0
      }
    });
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
        Target: ₹ {item.Target ? parseInt(item.Target).toLocaleString() : "100,000"}
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
    </div>
  );
}

export default Retailers;