import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from "../../../BaseURL/BaseURL"
import './Invoices.css';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Productstable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [productions, setProductions] = useState([]);
  const [filteredProductions, setFilteredProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState({});

  // Fetch productions from API
  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/production/list`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch productions');
      }
      
      const result = await response.json();
      
      if (result.success) {
        const transformedProductions = result.data.map(production => ({
          id: production.VoucherID,
          voucherNo: production.VchNo,
          date: production.Date ? new Date(production.Date).toISOString().split('T')[0] : 'N/A',
          transactionType: production.TransactionType,
          productId: production.product_id,
          batchId: production.batch_id,
          batchNumber: production.batch_number,
          totalAmount: `₹ ${parseFloat(production.TotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          totalPacks: production.TotalPacks,
          entryDate: production.EntryDate ? new Date(production.EntryDate).toISOString().split('T')[0] : 'N/A',
          items: production.items || [],
          originalData: production
        }));
        
        setProductions(transformedProductions);
        setFilteredProductions(transformedProductions);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching productions:', err);
      setError(err.message);
      setLoading(false);
    }
  };

const handleEdit = (production) => {
  navigate(`/Productioncreate/${production.id}`);
};
  // Handle View
  const handleView = async (production) => {
    try {
      const response = await fetch(`${baseurl}/production/${production.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch production details');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Store in localStorage or navigate to preview page
        localStorage.setItem('previewProduction', JSON.stringify(result.data));
        navigate(`/production/preview/${production.id}`);
      }
    } catch (error) {
      console.error('Error viewing production:', error);
      alert('Failed to load production details');
    }
  };

  // Handle Delete
  const handleDelete = async (production) => {
    if (!window.confirm(`Delete production ${production.voucherNo}? This will revert stock changes.`)) return;
    
    try {
      setDeleting(prev => ({ ...prev, [production.id]: true }));
      
      const response = await fetch(`${baseurl}/production/delete/${production.id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Production deleted successfully!');
        fetchProductions(); // Refresh list
      } else {
        alert('Failed to delete: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting production:', error);
      alert('Error deleting production: ' + error.message);
    } finally {
      setDeleting(prev => ({ ...prev, [production.id]: false }));
    }
  };

  // Columns for Production Table
  const columns = [
    { 
      key: 'voucherNo', 
      title: 'VOUCHER NO', 
      style: { textAlign: 'center' },
      render: (value, row) => (
        <button 
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => handleView(row)}
          title="Click to view details"
        >
          {value}
        </button>
      )
    },
    { 
      key: 'date', 
      title: 'DATE', 
      style: { textAlign: 'center' } 
    },
    { 
      key: 'transactionType', 
      title: 'TRANSACTION TYPE', 
      style: { textAlign: 'center' },
    //   render: (value) => (
    //     <span className={`badge ${value === 'Production' ? 'bg-success' : 'bg-info'}`}>
    //       {value}
    //     </span>
    //   )
    },
  
    { 
      key: 'totalAmount', 
      title: 'TOTAL AMOUNT', 
      style: { textAlign: 'right' } 
    },
  
   
    {
      key: 'actions',
      title: 'ACTION',
      style: { textAlign: 'center' },
      render: (value, row) => (
        <div className="d-flex justify-content-center gap-2">
          {/* <button
            className="btn btn-sm btn-primary"
            onClick={() => handleView(row)}
            title="View Details"
          >
            <FaEye />
          </button> */}
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleEdit(row)}
            title="Edit Production"
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row)}
            disabled={deleting[row.id]}
            title="Delete Production"
          >
            {deleting[row.id] ? (
              <div className="spinner-border spinner-border-sm" role="status"></div>
            ) : (
              <FaTrash />
            )}
          </button>
        </div>
      )
    }
  ];

  // Create new production
  const handleCreateClick = () => {
    navigate("/Productioncreate");
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`admin-main-content ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader 
            isCollapsed={isCollapsed} 
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            isMobile={window.innerWidth <= 768}
          />
          <div className="admin-content-wrapper-sales">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`admin-main-content ${isCollapsed ? "collapsed" : ""}`}>
          <AdminHeader 
            isCollapsed={isCollapsed} 
            onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
            isMobile={window.innerWidth <= 768}
          />
          <div className="admin-content-wrapper-sales">
            <div className="alert alert-danger m-3" role="alert">
              Error loading productions: {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={fetchProductions}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`admin-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader 
          isCollapsed={isCollapsed} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          isMobile={window.innerWidth <= 768}
        />

        <div className="admin-content-wrapper-sales">
          <div className="invoices-content-area">
            <div className="receipts-header-section">
              <div className="receipts-header-top">
                <div className="receipts-title-section">
                  <h1 className="receipts-main-title">Production Management</h1>
                  <p className="receipts-subtitle">Create, manage and track all production and consumption transactions</p>
                </div>
              </div>
            </div>

            <div className="invoices-actions-section">
              <div className="quotation-container p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold">Production Transactions</h5>
                  <button className="btn btn-primary" onClick={handleCreateClick}>
                    <i className="bi bi-plus-circle me-1"></i> Create Production
                  </button>
                </div>

                <ReusableTable
                  title="Production List"
                  data={filteredProductions}
                  columns={columns}
                  initialEntriesPerPage={5}
                  searchPlaceholder="Search by voucher no, batch no or product ID..."
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
};

export default Productstable;