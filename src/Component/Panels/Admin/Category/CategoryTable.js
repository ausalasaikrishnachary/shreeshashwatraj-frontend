import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import "./CategoryTable.css";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { FaSearch } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";

function Category() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [categoriesData, setCategoriesData] = useState([]);
  const [filteredCategoriesData, setFilteredCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDiscount, setCategoryDiscount] = useState(0);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Static categories data with discount
  const staticCategories = [
    {
      id: 1,
      name: "Electronics",
      description: "Electronic devices and accessories",
      product_count: 156,
      status: "Active",
      created_date: "2024-01-15",
      parent_category: null,
      discount: 10.00
    },
    {
      id: 2,
      name: "Mobile Phones",
      description: "Smartphones and feature phones",
      product_count: 89,
      status: "Active",
      created_date: "2024-01-16",
      parent_category: "Electronics",
      discount: 5.00
    },
    {
      id: 3,
      name: "Laptops",
      description: "Laptops and notebooks",
      product_count: 67,
      status: "Active",
      created_date: "2024-01-17",
      parent_category: "Electronics",
      discount: 15.00
    }
  ];

  // Normalize category data to ensure consistent field names
  const normalizeCategory = (category) => {
    return {
      id: category.id,
      name: category.name || category.category_name || "Unnamed Category",
      description: category.description || "",
      product_count: category.product_count || 0,
      status: category.status || "Active",
      created_date: category.created_date || new Date().toISOString().split('T')[0],
      parent_category: category.parent_category || null,
      discount: category.discount || 0
    };
  };

  // Fetch categories data
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories when data changes
  useEffect(() => {
    if (categoriesData.length > 0) {
      const filteredData = categoriesData.filter(item => {
        const name = item.name || "";
        const description = item.description || "";
        const parentCategory = item.parent_category || "";
        const discount = item.discount?.toString() || "";
        
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parentCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
          discount.includes(searchTerm)
        );
      });
      setFilteredCategoriesData(filteredData);
    } else {
      setFilteredCategoriesData([]);
    }
  }, [categoriesData, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/categories`);
      const normalizedData = response.data.map(normalizeCategory);
      setCategoriesData(normalizedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategoriesData(staticCategories);
      setError('Failed to load categories data from server. Using demo data.');
    } finally {
      setLoading(false);
    }
  };

  // Handle save category via API
  const handleSaveCategory = async () => {
    if (categoryName.trim() === "") return;
    
    setIsSaving(true);
    try {
      const response = await axios.post(`${baseurl}/categories`, {
        category_name: categoryName,
        discount: parseFloat(categoryDiscount) || 0
      });
      
      const newCategory = normalizeCategory(response.data);
      setCategoriesData(prev => [...prev, newCategory]);
      setCategoryName("");
      setCategoryDiscount(0);
      setShowAddModal(false);
      alert('Category added successfully!');
    } catch (error) {
      console.error("Error saving category:", error);
      alert('Failed to add category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit category
  const handleEdit = (id) => {
    const categoryToEdit = categoriesData.find(cat => cat.id === id);
    if (categoryToEdit) {
      setEditingCategory(categoryToEdit);
      setCategoryName(categoryToEdit.name);
      setCategoryDiscount(categoryToEdit.discount || 0);
      setShowEditModal(true);
    }
  };

  // Handle update category
  const handleUpdateCategory = async () => {
    if (categoryName.trim() === "" || !editingCategory) return;
    
    setIsSaving(true);
    try {
      const response = await axios.put(`${baseurl}/categories/${editingCategory.id}`, {
        category_name: categoryName,
        discount: parseFloat(categoryDiscount) || 0
      });
      
      // Update the category in local state
      const updatedCategories = categoriesData.map(cat =>
        cat.id === editingCategory.id 
          ? { ...cat, name: categoryName, discount: parseFloat(categoryDiscount) || 0 }
          : cat
      );
      setCategoriesData(updatedCategories);
      
      setCategoryName("");
      setCategoryDiscount(0);
      setShowEditModal(false);
      setEditingCategory(null);
      alert('Category updated successfully!');
    } catch (error) {
      console.error("Error updating category:", error);
      alert('Failed to update category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete category
  const handleDelete = async (id, categoryName) => {
    if (window.confirm(`Are you sure you want to delete ${categoryName}?`)) {
      try {
        await axios.delete(`${baseurl}/categories/${id}`);
        const updatedCategories = categoriesData.filter(cat => cat.id !== id);
        setCategoriesData(updatedCategories);
        alert('Category deleted successfully!');
      } catch (err) {
        console.error('Failed to delete category:', err);
        alert('Failed to delete category');
      }
    }
  };

  // Handle mobile toggle
  const handleToggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Handle modal open/close
  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setCategoryName("");
    setCategoryDiscount(0);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCategoryName("");
    setCategoryDiscount(0);
    setEditingCategory(null);
  };

  // Custom renderers
  const renderIdCell = (item) => (
    <div className="category-table__id-cell">
      <span className="category-table__id">#{item.id}</span>
    </div>
  );

  const renderCategoryCell = (item) => {
    const name = item.name || "Unnamed Category";
    const description = item.description || "";
    const parentCategory = item.parent_category || "";
    const productCount = item.product_count || 0;
    const status = item.status || "Active";
    const discount = item.discount || 0;
    
    return (
      <div className="category-table__category-cell">
        <div className="category-table__header-row">
          <strong className="category-table__category-name">{name}</strong>
          {/* {discount > 0 && (
            <span className="category-table__discount-badge">
              {discount}% OFF
            </span>
          )} */}
        </div>
        {description && (
          <span className="category-table__category-description">
            {description}
          </span>
        )}
        <div className="category-table__meta-info">
          {/* {parentCategory && (
            <span className="category-table__parent-tag">
              Parent: {parentCategory}
            </span>
          )} */}
          {/* <span className="category-table__product-count">
            {productCount} products
          </span> */}
          {/* <span className={`category-table__status category-table__status--${status.toLowerCase()}`}>
            {status}
          </span> */}
        </div>
      </div>
    );
  };

  const renderDiscountCell = (item) => {
    const discount = item.discount || 0;
    return (
      <div className="category-table__discount-cell">
        <span className={`category-table__discount-value ${discount > 0 ? 'has-discount' : 'no-discount'}`}>
          {discount > 0 ? `${discount}%` : 'No Discount'}
        </span>
      </div>
    );
  };

  const renderActionsCell = (item) => {
    const name = item.name || "Unnamed Category";
    
    return (
      <div className="category-table__actions">
        <button 
          className="category-table__action-btn category-table__action-btn--edit"
          onClick={() => handleEdit(item.id)}
          title="Edit"
        >
          ✏️
        </button>
        <button 
          className="category-table__action-btn category-table__action-btn--delete"
          onClick={() => handleDelete(item.id, name)}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    );
  };

  const columns = [
    { key: "__item", title: "ID", render: (value, item) => renderIdCell(item) },
    { key: "__item", title: "Category", render: (value, item) => renderCategoryCell(item) },
    { key: "__item", title: "Discount", render: (value, item) => renderDiscountCell(item) },
    { key: "__item", title: "Actions", render: (value, item) => renderActionsCell(item) }
  ];

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
                onClick={handleOpenAddModal}
              >
                <span className="category-add-icon">+</span>
                Add Category
              </button>
            </div>

            {error && categoriesData.length > 0 && (
              <div className="alert alert-warning" role="alert">
                {error}
              </div>
            )}

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
                  initialEntriesPerPage={5}
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

      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Discount (%)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Enter discount percentage"
              value={categoryDiscount}
              onChange={(e) => setCategoryDiscount(e.target.value)}
            />
            <Form.Text className="text-muted">
              Enter 0 for no discount
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveCategory} 
            disabled={isSaving || categoryName.trim() === ""}
          >
            {isSaving ? 'Saving...' : 'Save Category'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Discount (%)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Enter discount percentage"
              value={categoryDiscount}
              onChange={(e) => setCategoryDiscount(e.target.value)}
            />
            <Form.Text className="text-muted">
              Enter 0 for no discount
            </Form.Text>
          </Form.Group>
          {editingCategory && (
            <div className="text-muted small">
              Category ID: {editingCategory.id}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateCategory} 
            disabled={isSaving || categoryName.trim() === ""}
          >
            {isSaving ? 'Updating...' : 'Update Category'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Category;