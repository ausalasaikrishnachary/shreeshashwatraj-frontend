import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from "../../../BaseURL/BaseURL"
import './Invoices.css';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Jrtable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState({});

  // Fetch vouchers from API
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/jrroutes`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vouchers');
      }
      
      const result = await response.json();
      
      if (result.success) {
        const transformedVouchers = result.data.map(voucher => ({
          id: voucher.VoucherID,
          voucherNo: voucher.VchNo,
          date: voucher.Date ? new Date(voucher.Date).toISOString().split('T')[0] : 'N/A',
          transactionType: voucher.TransactionType || 'Journal',
          partyName: voucher.PartyName || 'N/A',
          accountName: voucher.AccountName || 'N/A',
          totalAmount: `₹ ${parseFloat(voucher.TotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          balanceAmount: `₹ ${parseFloat(voucher.balance_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          status: voucher.status || 'active',
          entryDate: voucher.EntryDate ? new Date(voucher.EntryDate).toISOString().split('T')[0] : 'N/A',
          createdAt: voucher.created_at ? new Date(voucher.created_at).toISOString().split('T')[0] : 'N/A',
          originalData: voucher
        }));
        
        setVouchers(transformedVouchers);
        setFilteredVouchers(transformedVouchers);
      } else {
        setError(result.message || 'Failed to fetch vouchers');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle Edit - based on Voucher ID
  const handleEdit = async (voucher) => {
    try {
      // Fetch complete voucher data by ID
      const response = await fetch(`${baseurl}/api/jrroutes/${voucher.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch voucher details');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Store the voucher data to pass to edit form
        localStorage.setItem('editVoucherData', JSON.stringify(result.data));
        // Navigate to edit page with voucher ID
        navigate(`/JrCreate/${voucher.id}`);
      } else {
        alert('Failed to load voucher details for editing');
      }
    } catch (error) {
      console.error('Error fetching voucher for edit:', error);
      alert('Error loading voucher details: ' + error.message);
    }
  };

  // Handle View
  const handleView = async (voucher) => {
    try {
      const response = await fetch(`${baseurl}/api/jrroutes/${voucher.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch voucher details');
      }
      
      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem('previewVoucher', JSON.stringify(result.data));
        navigate(`/voucher/preview/${voucher.id}`);
      } else {
        alert('Failed to load voucher details');
      }
    } catch (error) {
      console.error('Error viewing voucher:', error);
      alert('Failed to load voucher details');
    }
  };

  // Handle Delete - based on Voucher ID
  const handleDelete = async (voucher) => {
    if (!window.confirm(`Delete voucher ${voucher.voucherNo}? This action cannot be undone.`)) return;
    
    try {
      setDeleting(prev => ({ ...prev, [voucher.id]: true }));
      
      const response = await fetch(`${baseurl}/api/journaldelete/${voucher.id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Voucher deleted successfully!');
        fetchVouchers(); // Refresh list
      } else {
        alert('Failed to delete: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Error deleting voucher: ' + error.message);
    } finally {
      setDeleting(prev => ({ ...prev, [voucher.id]: false }));
    }
  };

  // Columns for Voucher Table
  const columns = [
    { 
      key: 'voucherNo', 
      title: 'VOUCHER NO', 
      style: { textAlign: 'center', width: '12%' },
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
      style: { textAlign: 'center', width: '10%' } 
    },
    { 
      key: 'transactionType', 
      title: 'TRANSACTION TYPE', 
      style: { textAlign: 'center', width: '12%' },
    },
    { 
      key: 'partyName', 
      title: 'PARTY/CUSTOMER NAME', 
      style: { textAlign: 'center', width: '20%' } 
    },
    { 
      key: 'totalAmount', 
      title: 'AMOUNT (₹)', 
      style: { textAlign: 'center', width: '12%' } 
    },
    {
      key: 'actions',
      title: 'ACTION',
      style: { textAlign: 'center', width: '12%' },
      render: (value, row) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleEdit(row)}
            title="Edit Voucher"
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row)}
            disabled={deleting[row.id]}
            title="Delete Voucher"
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

  // Create new voucher
  const handleCreateClick = () => {
    localStorage.removeItem('editVoucherData');
    navigate("/JrCreate/create");
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
              <strong>Error:</strong> {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={fetchVouchers}
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
            <div className="invoices-actions-section">
              <div className="quotation-container p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold">Journal Vouchers</h5>
                  <button className="btn btn-primary" onClick={handleCreateClick}>
                    <i className="bi bi-plus-circle me-1"></i> Create Journal 
                  </button>
                </div>

                <ReusableTable
                  title="Journal List"
                  data={filteredVouchers}
                  columns={columns}
                  initialEntriesPerPage={5}
                  searchPlaceholder="Search by voucher no, party name, account name..."
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

export default Jrtable;