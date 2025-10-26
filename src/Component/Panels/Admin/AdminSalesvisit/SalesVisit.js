import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./SalesVisit.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { useParams, useNavigate } from "react-router-dom";
import {  FaSearch} from "react-icons/fa";


const SalesVisit = ({ mode = "list" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [salesVisitsData, setSalesVisitsData] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [loading, setLoading] = useState(true);
const [filteredSalesVisits, setFilteredSalesVisits] = useState([]); // filtered based on search

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    retailer_name: "",
    staff_name: "",
    visit_type: "",
    visit_outcome: "",
    sales_amount: "",
    transaction_type: "",
    description: "",
    created_at: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch sales visits data
  const fetchSalesVisits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${baseurl}/api/salesvisits`);
      if (res.data.success) {
        const mappedData = res.data.data.map((item) => ({
          ...item,
          sales_amount: parseFloat(item.sales_amount) || 0,
          created_at: new Date(item.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        }));
        setSalesVisitsData(mappedData);

        if (id && (mode === "view" || mode === "edit")) {
          const visit = mappedData.find((v) => v.id.toString() === id);
          if (visit) {
            setSelectedVisit(visit);
            setFormData(visit);
          } else {
            setError(`Sales visit with ID ${id} not found`);
          }
        }
      } else {
        setError(res.data.error || "Failed to fetch sales visits");
      }
    } catch (err) {
      console.error("Error fetching sales visits:", err);
      setError("Server error while fetching sales visits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesVisits();
  }, [id, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(formData.created_at)) {
      window.alert("Invalid date format. Use DD/MM/YYYY");
      return;
    }
    try {
      const res = await axios.put(`${baseurl}/api/salesvisits/${id}`, formData);
      if (res.data.success) {
        window.alert(`Sales Visit for ${formData.retailer_name} updated successfully ✅`);
        navigate("/sales_visit");
      } else {
        window.alert("Failed to update Sales Visit ❌");
      }
    } catch (err) {
      console.error("Update error:", err);
      window.alert("Server error while updating ❌");
    }
  };

  const handleView = (id) => navigate(`/sales_visit/view/${id}`);
  const handleEdit = (id) => navigate(`/sales_visit/edit/${id}`);
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete visit by ${name}?`)) return;

    try {
      const res = await axios.delete(`${baseurl}/api/salesvisits/${id}`);
      if (res.data.success) {
        window.alert(`Sales Visit for ${name} deleted successfully ✅`);
        fetchSalesVisits();
      } else {
        window.alert(`Failed to delete Sales Visit for ${name} ❌`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      window.alert(`Server error while deleting Sales Visit for ${name} ❌`);
    }
  };

  // Filter data based on search input
useEffect(() => {
  if (salesVisitsData.length > 0) {
    const filtered = salesVisitsData.filter((item) => 
      (item.id?.toString().includes(searchTerm)) ||
      (item.retailer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.staff_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.visit_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.visit_outcome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.transaction_type?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSalesVisits(filtered);
  }
}, [searchTerm, salesVisitsData]);


  const columns = [
    { title: "ID", key: "id" },
    { title: "Retailer Name", key: "retailer_name" },
    { title: "Staff Name", key: "staff_name" },
    { title: "Visit Type", key: "visit_type" },
    { title: "Visit Outcome", key: "visit_outcome" },
    { title: "Sales Amount", key: "sales_amount" },
    { title: "Transaction Type", key: "transaction_type" },
    { title: "Description", key: "description" },
    { title: "Date", key: "created_at" },
 {
  title: "Actions",
  key: "actions",
  render: (value, row) => {
    if (!row) return null; // safeguard
    return (
      <div className="retailers-table__actions">
        <button
          className="retailers-table__action-btn retailers-table__action-btn--view"
          onClick={() => handleView(row.id)}
          title="View"
        >
          👁️
        </button>
        <button
          className="retailers-table__action-btn retailers-table__action-btn--edit"
          onClick={() => handleEdit(row.id)}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="retailers-table__action-btn retailers-table__action-btn--delete"
          onClick={() => handleDelete(row.id, row.retailer_name || row.staff_name)}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    );
  },
}

  ];

  const renderViewMode = () => (
    <div className="sales-visit-card">
      <h3>Sales Visit Details</h3>
      {selectedVisit ? (
        <div className="card-content">
          <div className="form-group form-group-row">
            <div>
              <label>ID</label>
              <input type="text" value={selectedVisit.id} readOnly />
            </div>
            <div>
              <label>Retailer Name</label>
              <input type="text" value={selectedVisit.retailer_name} readOnly />
            </div>
          </div>
          <div className="form-group form-group-row">
            <div>
              <label>Staff Name</label>
              <input type="text" value={selectedVisit.staff_name} readOnly />
            </div>
            <div>
              <label>Visit Type</label>
              <input type="text" value={selectedVisit.visit_type} readOnly />
            </div>
          </div>
          <div className="form-group form-group-row">
            <div>
              <label>Visit Outcome</label>
              <input type="text" value={selectedVisit.visit_outcome} readOnly />
            </div>
            <div>
              <label>Sales Amount</label>
              <input type="number" value={selectedVisit.sales_amount} readOnly />
            </div>
          </div>
          <div className="form-group form-group-row">
            <div>
              <label>Transaction Type</label>
              <input type="text" value={selectedVisit.transaction_type} readOnly />
            </div>
            <div>
              <label>Date (DD/MM/YYYY)</label>
              <input type="text" value={selectedVisit.created_at} readOnly />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Description</label>
            <textarea value={selectedVisit.description} readOnly />
          </div>
          <div className="form-actions">
            <button className="back-button" onClick={() => navigate("/sales_visit")}>
              Back to List
            </button>
          </div>
        </div>
      ) : (
        <div className="sales-visit-error">
          <p>Sales visit with ID {id} not found</p>
          <button className="back-button" onClick={() => navigate("/sales_visit")}>
            Back to List
          </button>
        </div>
      )}
    </div>
  );

  const renderEditMode = () => (
    <div className="sales-visit-card">
      <h3>Edit Sales Visit</h3>
      {selectedVisit ? (
        <form onSubmit={handleEditSubmit} className="sales-visit-edit-form">
          <div className="form-group form-group-row">
            <div>
              <label>Retailer Name</label>
              <input
                type="text"
                name="retailer_name"
                value={formData.retailer_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Staff Name</label>
              <input
                type="text"
                name="staff_name"
                value={formData.staff_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-group form-group-row">
            <div>
              <label>Visit Type</label>
              <input
                type="text"
                name="visit_type"
                value={formData.visit_type}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Visit Outcome</label>
              <input
                type="text"
                name="visit_outcome"
                value={formData.visit_outcome}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-group form-group-row">
            <div>
              <label>Sales Amount</label>
              <input
                type="number"
                name="sales_amount"
                value={formData.sales_amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Transaction Type</label>
              <input
                type="text"
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-group form-group-row">
            <div>
              <label>Date (DD/MM/YYYY)</label>
              <input
                type="text"
                name="created_at"
                value={formData.created_at}
                onChange={handleInputChange}
                placeholder="DD/MM/YYYY"
                required
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => navigate("/sales_visit")}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="sales-visit-error">
          <p>Sales visit with ID {id} not found</p>
          <button className="back-button" onClick={() => navigate("/sales_visit")}>
            Back to List
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="sales-visits-wrapper">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`sales-visits-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="sales-visits-main-content">
            <div className="sales-visits-loading">Loading sales visits...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && mode !== "view" && mode !== "edit") {
    return (
      <div className="sales-visits-wrapper">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`sales-visits-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="sales-visits-main-content">
            <div className="sales-visits-error">
              <p>{error}</p>
              <button onClick={fetchSalesVisits} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-visits-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`sales-visits-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        <div className="sales-visits-content-section">
          {mode === "view" && renderViewMode()}
          {mode === "edit" && renderEditMode()}
          {mode === "list" && (
            <>
              <div className="sales-visits-section-header">
                <h2 className="sales-visits-main-title">Sales Visits</h2>
                <p className="sales-visits-subtitle">View all logged sales visits</p>
              </div>

              {/* Search box */}
            <div className="sales-visit-search-container">
                <div className="sales-visit-search-box">
                  <input
                    type="text"
      placeholder="Search by ID, Retailer, Staff, or Transaction..."
      className="sales-visits-search-input"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
       <FaSearch className="sales-visits-search-icon" size={18} />
  </div>
</div>

              <div className="sales-visits-table-container">
  <ReusableTable
    data={filteredSalesVisits} // filtered array based on searchTerm
    columns={columns}
    initialEntriesPerPage={10}
    showSearch={false} // hide built-in search
    showEntriesSelector={true}
    showPagination={true}
  />
</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesVisit;
