import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./CategoryTable.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaSearch } from "react-icons/fa";

function Category() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [categoriesData, setCategoriesData] = useState([]);
  const [filteredCategoriesData, setFilteredCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Static categories data
  const staticCategories = [
    {
      id: 1,
      name: "Electronics",
      description: "Electronic devices and accessories",
      product_count: 156,
      status: "Active",
      created_date: "2024-01-15",
      parent_category: null
    },
    {
      id: 2,
      name: "Mobile Phones",
      description: "Smartphones and feature phones",
      product_count: 89,
      status: "Active",
      created_date: "2024-01-16",
      parent_category: "Electronics"
    },
    {
      id: 3,
      name: "Laptops",
      description: "Laptops and notebooks",
      product_count: 67,
      status: "Active",
      created_date: "2024-01-17",
      parent_category: "Electronics"
    },
    {
      id: 4,
      name: "Clothing",
      description: "Fashion and apparel",
      product_count: 234,
      status: "Active",
      created_date: "2024-01-18",
      parent_category: null
    },
    {
      id: 5,
      name: "Men's Wear",
      description: "Clothing for men",
      product_count: 123,
      status: "Active",
      created_date: "2024-01-19",
      parent_category: "Clothing"
    },
    {
      id: 6,
      name: "Women's Wear",
      description: "Clothing for women",
      product_count: 111,
      status: "Active",
      created_date: "2024-01-20",
      parent_category: "Clothing"
    },
    {
      id: 7,
      name: "Home & Kitchen",
      description: "Home appliances and kitchenware",
      product_count: 178,
      status: "Inactive",
      created_date: "2024-01-21",
      parent_category: null
    },
    {
      id: 8,
      name: "Books",
      description: "Books and stationery",
      product_count: 45,
      status: "Active",
      created_date: "2024-01-22",
      parent_category: null
    }
  ];

  // Fetch categories data (using static data for now)
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories when data changes
  useEffect(() => {
    if (categoriesData.length > 0) {
      const filteredData = categoriesData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.parent_category || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategoriesData(filteredData);
    }
  }, [categoriesData, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // For now using static data, replace with API call when ready
      // const response = await axios.get(`${baseurl}/categories`);
      // setCategoriesData(response.data);
      
      setCategoriesData(staticCategories);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories data');
      // Fallback to static data even if API fails
      setCategoriesData(staticCategories);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete category
  const handleDelete = async (id, categoryName) => {
    if (window.confirm(`Are you sure you want to delete ${categoryName}?`)) {
      try {
        // await axios.delete(`${baseurl}/categories/${id}`);
        // Remove from local state for now
        const updatedCategories = categoriesData.filter(cat => cat.id !== id);
        setCategoriesData(updatedCategories);
        alert('Category deleted successfully!');
      } catch (err) {
        console.error('Failed to delete category:', err);
        alert('Failed to delete category');
      }
    }
  };

  // Handle edit category
  const handleEdit = (id) => {
    navigate(`/category/edit/${id}`);
  };

  // Handle view category
  const handleView = (id) => {
    navigate(`/category/view/${id}`);
  };

  // Handle mobile toggle
  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Custom renderers - Simplified to only three columns
  const renderIdCell = (item) => (
    <div className="category-table__id-cell">
      <span className="category-table__id">#{item.id}</span>
    </div>
  );

  const renderCategoryCell = (item) => (
    <div className="category-table__category-cell">
      <strong className="category-table__category-name">{item.name}</strong>
      {item.description && (
        <span className="category-table__category-description">
          {item.description}
        </span>
      )}
      <div className="category-table__meta-info">
        {item.parent_category && (
          <span className="category-table__parent-tag">
            Parent: {item.parent_category}
          </span>
        )}
        <span className="category-table__product-count">
          {item.product_count} products
        </span>
        <span className={`category-table__status category-table__status--${item.status.toLowerCase()}`}>
          {item.status}
        </span>
      </div>
    </div>
  );

  const renderActionsCell = (item) => (
    <div className="category-table__actions">
      <button 
        className="category-table__action-btn category-table__action-btn--view"
        onClick={() => handleView(item.id)}
        title="View"
      >
        👁️
      </button>
      <button 
        className="category-table__action-btn category-table__action-btn--edit"
        onClick={() => handleEdit(item.id)}
        title="Edit"
      >
        ✏️
      </button>
      <button 
        className="category-table__action-btn category-table__action-btn--delete"
        onClick={() => handleDelete(item.id, item.name)}
        title="Delete"
      >
        🗑️
      </button>
    </div>
  );

  // Only three columns: ID, Category, Actions
  const columns = [
    { key: "__item", title: "ID", render: (value, item) => renderIdCell(item) },
    { key: "__item", title: "Category", render: (value, item) => renderCategoryCell(item) },
    { key: "__item", title: "Actions", render: (value, item) => renderActionsCell(item) }
  ];

  const handleAddCategoryClick = () => {
    navigate("/category/add");
  };

  if (loading) {
    return (
      <div className="category-wrapper">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`category-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="category-main-content">
            <div className="loading-spinner">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-wrapper">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          onToggleMobile={isMobileOpen}
        />
        <div className={`category-content-area ${isCollapsed ? "collapsed" : ""}`}>
          <div className="category-main-content">
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchCategories} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-wrapper">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        onToggleMobile={isMobileOpen}
      />
      
      <div className={`category-content-area ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader 
          isCollapsed={isCollapsed} 
          onToggleSidebar={handleToggleMobile}
        />

        <div className="category-main-content">
          <div className="category-content-section">
            <div className="category-header-top">
              <div className="category-title-section">
                <h1 className="category-main-title">All Categories</h1>
                <p className="category-subtitle">
                  Manage product categories and organize your inventory
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center category-search-add-container">
              <div className="category-search-container">
                <div className="category-search-box">
                  <input
                    type="text"
                    placeholder="Search categories ..."
                    className="category-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="category-search-icon" size={18} />
                </div>
              </div>

              <button
                className="category-add-button category-add-button--top"
                onClick={handleAddCategoryClick}
              >
                <span className="category-add-icon">+</span>
                Add Category
              </button>
            </div>

            <div className="category-list-section">
              <div className="category-section-header">
                <h2 className="category-section-title">
                  Categories ({filteredCategoriesData.length})
                </h2>
                <p className="category-section-description">
                  Organize your products with categories and sub-categories
                </p>
              </div>

              <div className="category-table-container">
                <ReusableTable
                  data={filteredCategoriesData}
                  columns={columns}
                  initialEntriesPerPage={10}
                  searchPlaceholder="Search categories..."
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

export default Category;