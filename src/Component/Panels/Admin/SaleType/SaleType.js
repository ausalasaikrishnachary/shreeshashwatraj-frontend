import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";


const baseURL = `${baseurl}/api`; // Change to your server URL

function SaleType() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saleTypes, setSaleTypes] = useState([]);
  const [saleType, setSaleType] = useState("");
  const [series, setSeries] = useState("");
  const [editId, setEditId] = useState(null);

  // Fetch all sale types
  const fetchSaleTypes = async () => {
    try {
      const res = await axios.get(`${baseURL}/saletypes`);
      setSaleTypes(res.data.data);
    } catch (error) {
      console.error("Error fetching sale types:", error);
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
          <div className="card p-4">
            <h3>{editId ? "Edit Sale Type" : "Add Series"}</h3>

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

              {editId && (
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => {
                    setEditId(null);
                    setSaleType("");
                    setSeries("");
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          <div className="card mt-4 p-3">
            <h3>Series List</h3>

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sale Type Series</th>
                  <th>Prefix</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {saleTypes.length > 0 ? (
                  saleTypes.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.sale_type}</td>
                      <td>{item.series}</td>
                      <td>
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No Sale Types Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaleType;