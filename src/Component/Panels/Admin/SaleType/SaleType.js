import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";

const baseURL = `${baseurl}/api`; // Change to your server URL

function SaleType() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saleTypes, setSaleTypes] = useState([]);
  const [saleType, setSaleType] = useState("");
  const [series, setSeries] = useState("");
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all sale types
  const fetchSaleTypes = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseURL}/saletypes`);
      setSaleTypes(res.data.data);
    } catch (error) {
      console.error("Error fetching sale types:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaleTypes();
  }, []);

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        // Update
        await axios.put(`${baseURL}/saletypes/${editId}`, {
          sale_type: saleType,
          series: series,
        });

        alert("Sale Type updated successfully");
      } else {
        // Create
        await axios.post(`${baseURL}/saletypes`, {
          sale_type: saleType,
          series: series,
        });

        alert("Sale Type added successfully");
      }

      setSaleType("");
      setSeries("");
      setEditId(null);
      setShowModal(false);
      fetchSaleTypes();
    } catch (error) {
      console.error("Error saving sale type:", error);
      alert("Something went wrong");
    }
  };

  // Edit
  const handleEdit = (item) => {
    setEditId(item.id);
    setSaleType(item.sale_type);
    setSeries(item.series);
    setShowModal(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Sale Type?"))
      return;

    try {
      await axios.delete(`${baseURL}/saletypes/${id}`);
      alert("Deleted successfully");
      fetchSaleTypes();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setSaleType("");
    setSeries("");
  };

  // Column definitions for ReusableTable
  const saleTypeColumns = [
    { 
      key: "id", 
      title: "ID" 
    },
    { 
      key: "sale_type", 
      title: "Sale Type Series" 
    },
    { 
      key: "series", 
      title: "Prefix" 
    },
    {
      key: "actions",
      title: "Actions",
      render: (value, item) => (
        <>
          <button
            className="btn btn-warning btn-sm me-2"
            onClick={() => handleEdit(item)}
          >
            Edit
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(item.id)}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="receipts-wrapper">
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div
        className={`receipts-main-content ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="container mt-4">
          <div className="d-flex justify-content-end mb-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Add Series
            </button>
          </div>

          {showModal && (
            <div
              className="modal d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog">
                <div className="modal-content p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">
                      {editId ? "Edit Sale Type" : "Add Series"}
                    </h3>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Sale Type Series</label>
                      <input
                        type="text"
                        className="form-control"
                        value={saleType}
                        onChange={(e) => setSaleType(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Prefix</label>
                      <input
                        type="text"
                        className="form-control"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary">
                      {editId ? "Update" : "Save"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="card mt-4 p-3">
            <ReusableTable
              title="Series List"
              data={saleTypes}
              columns={saleTypeColumns}
              searchPlaceholder="Search sale types..."
              initialEntriesPerPage={5}
              showSearch={true}
              showEntriesSelector={true}  // Changed from false to true
              showPagination={true}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaleType;