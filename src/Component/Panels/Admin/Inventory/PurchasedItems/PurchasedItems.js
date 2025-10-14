import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlusCircle, FaMinusCircle, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../../../Shared/AdminSidebar/AdminSidebar";
import ReusableTable from "../../../../Layouts/TableLayout/ReusableTable";
import AddServiceModal from "./AddServiceModal";
import AddStockModal from "./AddStockModal";
import DeductStockModal from "./DeductStockModal";
import StockDetailsModal from "./StockDetailsModal";
import { baseurl } from "../../../../BaseURL/BaseURL";

import "./PurchasedItems.css";
import AdminHeader from "../../../../Shared/AdminSidebar/AdminHeader";

const PurchasedItems = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [currentStockData, setCurrentStockData] = useState({
    opening_stock: 0,
    stock_in: 0,
    stock_out: 0,
    balance_stock: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseurl}/products`);
      const formatted = response.data
        .filter((item) => item.group_by === "Purchaseditems")
        .map((item) => ({
           id: item.id,
          name: item.goods_name,
          price: item.price,
          description: item.description,
          gst: item.gst_rate,
          updatedBy: 'System',
          updatedOn: new Date(item.updated_at).toLocaleDateString(),
          opening_stock: item.opening_stock || 0,
          stock_in: item.stock_in || 0,
          stock_out: item.stock_out || 0,
          balance_stock: item.balance_stock || 0,
          category_id: item.category_id,
          company_id: item.company_id,
          inclusive_gst: item.inclusive_gst,
          non_taxable: item.non_taxable,
          net_price: item.net_price,
          hsn_code: item.hsn_code,
          unit: item.unit,
          cess_rate: item.cess_rate,
          cess_amount: item.cess_amount,
          sku: item.sku,
          opening_stock_date: item.opening_stock_date,
          min_stock_alert: item.min_stock_alert,
          max_stock_alert: item.max_stock_alert,
          can_be_sold: item.can_be_sold,
          maintain_batch: item.maintain_batch,
        }));
      setItems(formatted);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${baseurl}/products/${id}`);
        alert("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleEditClick = (product) => {
  const productData = {
      id: product.id,
      goods_name: product.name,
      price: product.price,
      description: product.description,
      gst_rate: product.gst,
      opening_stock: product.opening_stock,
      category_id: product.category_id,
      company_id: product.company_id,
      inclusive_gst: product.inclusive_gst,
      non_taxable: product.non_taxable,
      net_price: product.net_price,
      hsn_code: product.hsn_code,
      unit: product.unit,
      cess_rate: product.cess_rate,
      cess_amount: product.cess_amount,
      sku: product.sku,
      opening_stock_date: product.opening_stock_date,
      min_stock_alert: product.min_stock_alert,
      max_stock_alert: product.max_stock_alert,
      can_be_sold: product.can_be_sold,
      group_by: 'Purchaseditems',
      maintain_batch: product.maintain_batch,
      batches: []
    };
    navigate("/AddProductPage", { state: { productToEdit: productData } });
  };

  const handleAddStock = async ({ quantity, remark }) => {
    try {
      await axios.post(`${baseurl}/stock/${selectedProductId}`, {
        stock_in: quantity,
        stock_out: 0,
        date: new Date().toISOString().split("T")[0],
        remark,
      });
      fetchProducts();
      alert("Stock added successfully!");
    } catch (error) {
      alert("Failed to add stock");
    }
  };

  const handleDeductStock = async ({ quantity, remark }) => {
    try {
      await axios.post(`${baseurl}/stock/${selectedProductId}`, {
        stock_in: 0,
        stock_out: quantity,
        date: new Date().toISOString().split("T")[0],
        remark,
      });
      fetchProducts();
      alert("Stock deducted successfully!");
    } catch (error) {
      alert("Failed to deduct stock");
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "name", title: "Product Name" },
    { key: "description", title: "Description" },
    { key: "gst", title: "GST Rate" },
    { key: "updatedBy", title: "Updated By" },
    { key: "updatedOn", title: "Updated On" },
    {
      key: "action",
      title: "Action",
      render: (item) => (
        <>
          <FaEdit className="text-success me-2 action-icon" title="Edit" onClick={() => handleEditClick(item)} />
          <FaTrash className="text-danger me-2 action-icon" title="Delete" onClick={() => handleDeleteProduct(item.id)} />
          <FaPlusCircle className="text-warning me-2 action-icon" title="Add Stock" onClick={() => { setSelectedProductId(item.id); setCurrentStockData(item); setShowStockModal(true); }} />
          <FaMinusCircle className="text-danger me-2 action-icon" title="Deduct Stock" onClick={() => { setSelectedProductId(item.id); setCurrentStockData(item); setShowDeductModal(true); }} />
          <FaEye className="text-primary action-icon" title="View Details" onClick={() => { setSelectedItem(item); setShowViewModal(true); }} />
        </>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

        <div className="container-fluid mt-3 purchased-items-wrapper">
          {/* Top buttons */}
          <div className="d-flex justify-content-between">

                  {/* Search */}
          <div className="retailers-search-container mb-3">
            <div className="retailers-search-box">
              <span className="retailers-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search purchased items..."
                className="retailers-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex gap-2 mb-3 justify-content-end">
            <div className="dropdown">
              <button className="btn btn-info dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                <i className="bi bi-list me-2"></i> Purchased Items
              </button>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/purchased_items">Purchased Items</a></li>
                <li><a className="dropdown-item" href="/sale_items">Sales Catalog</a></li>
              </ul>
            </div>

            <div className="dropdown">
              <button className="btn btn-success dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                <i className="bi bi-plus-circle me-2"></i> ADD
              </button>
              <ul className="dropdown-menu">
                <li><button className="dropdown-item" onClick={() => navigate("/AddProductPage")}>Products</button></li>
                <li><button className="dropdown-item" onClick={() => setShowServiceModal(true)}>Services</button></li>
              </ul>
            </div>
          </div>

    
          </div>

          {/* Table */}
          <ReusableTable
            data={filteredItems}
            columns={columns}
            initialEntriesPerPage={10}
            showSearch={false}
            showEntriesSelector={true}
            showPagination={true}
          />
        </div>
      </div>

      {/* Modals */}
      <AddServiceModal show={showServiceModal} onClose={() => setShowServiceModal(false)} groupType="Purchaseditems" />
      <AddStockModal show={showStockModal} onClose={() => setShowStockModal(false)} currentStock={currentStockData.balance_stock} onSave={handleAddStock} />
      <DeductStockModal show={showDeductModal} onClose={() => setShowDeductModal(false)} currentStock={currentStockData.balance_stock} onSave={handleDeductStock} />
      <StockDetailsModal show={showViewModal} onClose={() => { setShowViewModal(false); setSelectedItem(null); }} stockData={selectedItem} context="purchase" />
    </div>
  );
};

export default PurchasedItems;
