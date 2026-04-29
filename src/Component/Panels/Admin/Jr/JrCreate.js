import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import './Invoices.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';

const JrCreate = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id && id !== 'create';
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [voucherData, setVoucherData] = useState({
    voucherNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
  });
  
  const [journalForm, setJournalForm] = useState({
    accountId: '',
    accountName: '',
    balance: 0,
    balance_type: 'Dr',
    amount: '',
    amountType: 'Dr'
  });
  
  const [journalItems, setJournalItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const companyInfo = {
    name: "SHREE SHASHWATRAJ AGRO PVT LTD",
    address: "Growth Center, Jasoiya, Aurangabad, Bihar, 824101",
    email: "spmathur56@gmail.com",
    phone: "9801049700",
    gstin: "10AAOCS1541B1ZZ",
    state: "Bihar",
    stateCode: "10"
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchAccounts();
    if (isEditMode) {
      loadVoucherForEdit();
    } else {
      generateVoucherNumber();
    }
  }, [isEditMode, id]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseurl}/accounts`);
      const data = await res.json();
      setAccounts(data || []);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };
const loadVoucherForEdit = async () => {
  if (!isEditMode || !id) return;
  
  try {
    setLoading(true);
    const response = await fetch(`${baseurl}/api/jrroutes/${id}`);
    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      
      // Set header data
      setVoucherData({
        voucherNo: data.VchNo || '',
        invoiceDate: data.Date ? data.Date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      
      // Determine amount type from TransactionType
      let amountType = 'Dr';
      if (data.TransactionType === 'Cr') {
        amountType = 'Cr';
      }
      
      // Set single journal item (only this row)
      const singleItem = {
        id: data.VoucherID,
        accountId: data.PartyID,
        accountName: data.PartyName,
        balance: parseFloat(data.balance_amount) || 0,
        balance_type: data.balance_type || 'Dr',
        amount: parseFloat(data.TotalAmount) || 0,
        amountType: amountType,
        newBalance: parseFloat(data.balance_amount) || 0,
        newBalanceType: data.balance_type || 'Dr'
      };
      
      setJournalItems([singleItem]);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to load voucher');
  } finally {
    setLoading(false);
  }
};

  const generateVoucherNumber = async () => {
    try {
      const response = await fetch(`${baseurl}/api/last-voucher/journal`);
      if (response.ok) {
        const data = await response.json();
        if (data.voucherNo) {
          const lastNumber = parseInt(data.voucherNo.split('-')[1]) || 0;
          const newNumber = String(lastNumber + 1).padStart(3, '0');
          setVoucherData(prev => ({ ...prev, voucherNo: `JRN-${newNumber}` }));
        } else {
          setVoucherData(prev => ({ ...prev, voucherNo: 'JRN-001' }));
        }
      } else {
        setVoucherData(prev => ({ ...prev, voucherNo: 'JRN-001' }));
      }
    } catch (error) {
      console.error('Error generating voucher number:', error);
      setVoucherData(prev => ({ ...prev, voucherNo: 'JRN-001' }));
    }
  };

  const filteredAccounts = (accounts || []).filter(account =>
    (account.name || account.account_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVoucherChange = (e) => {
    const { name, value } = e.target;
    setVoucherData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountSelect = (account) => {
    setJournalForm({
      accountId: account.id,
      accountName: account.name || account.account_name,
      balance: formatBalance(account.balance),
      balance_type: account.balance_type || 'Dr',
      amount: '',
      amountType: 'Dr'
    });
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setJournalForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Calculate new balance based on transaction
  const calculateNewBalance = (currentBalance, balanceType, amount, transactionType) => {
    let newBalance = formatBalance(currentBalance);
    let newBalanceType = balanceType || 'Dr';
    const amt = parseFloat(amount) || 0;
    
    if (transactionType === 'Dr') {
      if (balanceType === 'Dr') {
        newBalance = newBalance + amt;
        newBalanceType = 'Dr';
      } else {
        newBalance = newBalance - amt;
        if (newBalance < 0) {
          newBalanceType = 'Dr';
          newBalance = Math.abs(newBalance);
        } else {
          newBalanceType = 'Cr';
        }
      }
    } else {
      if (balanceType === 'Dr') {
        newBalance = newBalance - amt;
        if (newBalance < 0) {
          newBalanceType = 'Cr';
          newBalance = Math.abs(newBalance);
        } else {
          newBalanceType = 'Dr';
        }
      } else {
        newBalance = newBalance + amt;
        newBalanceType = 'Cr';
      }
    }
    
    return { newBalance, newBalanceType };
  };
  
  const handleAddOrUpdate = () => {
    if (!journalForm.accountName) {
      alert('Please select an account');
      return;
    }
    
    if (!journalForm.amount || parseFloat(journalForm.amount) <= 0) {
      alert('Please enter valid amount');
      return;
    }
    
    const currentBalance = formatBalance(journalForm.balance);
    const currentBalanceType = journalForm.balance_type || 'Dr';
    const amountValue = parseFloat(journalForm.amount) || 0;
    const amountTypeValue = journalForm.amountType || 'Dr';
    
    // Calculate new balance for display
    const { newBalance, newBalanceType } = calculateNewBalance(
      currentBalance,
      currentBalanceType,
      amountValue,
      amountTypeValue
    );
    
    const newItem = {
      id: editingId || Date.now(),
      accountId: journalForm.accountId,
      accountName: journalForm.accountName,
      balance: currentBalance,
      balance_type: currentBalanceType,
      amount: amountValue,
      amountType: amountTypeValue,
      newBalance: newBalance,
      newBalanceType: newBalanceType
    };
    
    if (editingId) {
      setJournalItems(prev => prev.map(item => item.id === editingId ? newItem : item));
      setEditingId(null);
    } else {
      setJournalItems(prev => [...prev, newItem]);
    }
    
    setJournalForm({
      accountId: '',
      accountName: '',
      balance: 0,
      balance_type: 'Dr',
      amount: '',
      amountType: 'Dr'
    });
    setSearchTerm('');
    setIsDropdownOpen(false);
  };
  
  const handleEdit = (item) => {
    setJournalForm({
      accountId: item.accountId,
      accountName: item.accountName,
      balance: item.balance || 0,
      balance_type: item.balance_type || 'Dr',
      amount: item.amount || 0,
      amountType: item.amountType || 'Dr'
    });
    setEditingId(item.id);
  };
  
  const handleDelete = (id) => {
    setJournalItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleCancelEdit = () => {
    setJournalForm({
      accountId: '',
      accountName: '',
      balance: 0,
      balance_type: 'Dr',
      amount: '',
      amountType: 'Dr'
    });
    setEditingId(null);
    setSearchTerm('');
  };
  
  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear all draft data?')) {
      setJournalItems([]);
      setJournalForm({
        accountId: '',
        accountName: '',
        balance: 0,
        balance_type: 'Dr',
        amount: '',
        amountType: 'Dr'
      });
      setEditingId(null);
      if (!isEditMode) {
        generateVoucherNumber();
      }
      setVoucherData(prev => ({
        ...prev,
        invoiceDate: new Date().toISOString().split('T')[0],
      }));
      alert('✅ Draft cleared successfully!');
    }
  };
  
  // Calculate total amount from all journal items
  const calculateTotalAmount = () => {
    return journalItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };
  
// Handle Save
const handleSave = async () => {
  if (journalItems.length === 0) {
    alert('⚠️ Please add at least one journal entry');
    return;
  }
  
  if (!voucherData.voucherNo) {
    alert('⚠️ Please enter voucher number');
    return;
  }
  
  if (!voucherData.invoiceDate) {
    alert('⚠️ Please select date');
    return;
  }
  
  // Calculate totals
  const debitTotal = journalItems
    .filter(item => item.amountType === 'Dr')
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const creditTotal = journalItems
    .filter(item => item.amountType === 'Cr')
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Check if debit and credit totals match
  if (debitTotal !== creditTotal) {
    alert(`⚠️ Journal Voucher is not balanced!\n\nTotal Debit (Dr): ₹${safeToFixed(debitTotal)}\nTotal Credit (Cr): ₹${safeToFixed(creditTotal)}\nDifference: ₹${safeToFixed(Math.abs(debitTotal - creditTotal))}\n\nPlease ensure Debit and Credit amounts are equal.`);
    return;
  }
  
  // Check if there's at least one Debit and one Credit entry
  const hasDebit = journalItems.some(item => item.amountType === 'Dr');
  const hasCredit = journalItems.some(item => item.amountType === 'Cr');
  
  if (!hasDebit || !hasCredit) {
    alert('⚠️ Journal Voucher must have both Debit (Dr) and Credit (Cr) entries!\n\nPlease add at least one Debit and one Credit entry.');
    return;
  }
  
  setSaving(true);
  
  try {
    if (isEditMode && id) {
      // For UPDATE - update ONLY this specific row
      const item = journalItems[0];
      const updateData = {
        invoiceDate: voucherData.invoiceDate,
        partyId: item.accountId,
        partyName: item.accountName,
        balance_amount: item.balance,
        totalAmount: item.amount,
        amount_type: item.amountType
      };
      
      console.log('Updating VoucherID:', id);
      console.log('Update Data:', updateData);
      
      const response = await fetch(`${baseurl}/api/journalupdate/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`✅ ${result.message}`);
        navigate('/Jrtable');
      } else {
        alert(`❌ Failed to update: ${result.message}`);
      }
    } else {
      // For CREATE - insert new rows
      const itemsToSave = journalItems.map(item => ({
        voucherNo: voucherData.voucherNo,
        invoiceDate: voucherData.invoiceDate,
        partyId: item.accountId,
        partyName: item.accountName,
        balance_amount: item.balance || 0,
        amount: item.amount || 0,
        amount_type: item.amountType || 'Dr',
        transactionType: 'Journal'
      }));

      const response = await fetch(`${baseurl}/api/journalcreate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalItems: itemsToSave })
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`✅ ${result.message}`);
        navigate('/Jrtable');
      } else {
        alert(`❌ Failed to save: ${result.message}`);
      }
    }
  } catch (error) {
    console.error('Error saving voucher:', error);
    alert('❌ Error saving voucher. Please try again.');
  } finally {
    setSaving(false);
  }
};
  
  // Calculate debit and credit totals for display
  const debitTotal = journalItems
    .filter(item => item.amountType === 'Dr')
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const creditTotal = journalItems
    .filter(item => item.amountType === 'Cr')
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const isBalanced = debitTotal === creditTotal;

  // Safe number formatting function
  const safeToFixed = (value, digits = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(digits);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />
      <div className={`admin-main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={window.innerWidth <= 768}
        />
        
        <div className="admin-content-wrapper">
          <Container fluid className="entries-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="text-primary">{isEditMode ? 'Edit Journal Voucher' : 'Create Journal Voucher'}</h3>
              <div>
                <Button variant="warning" size="sm" onClick={handleClearDraft} className="me-2">
                  Clear Draft
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate('/Jrtable')}>
                  Back to List
                </Button>
              </div>
            </div>
            
            {/* Company Info Section */}
            <div className="bg-white p-3 rounded shadow-sm mb-4">
              <Row>
                <Col md={8}>
                  <div>
                    <strong className="text-primary fs-5">{companyInfo.name}</strong><br />
                    {companyInfo.address}<br />
                    Email: {companyInfo.email} | Phone: {companyInfo.phone}<br />
                    GSTIN/UIN: {companyInfo.gstin}<br />
                    State Name: {companyInfo.state}, Code: {companyInfo.stateCode}
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-bold mt-1">Voucher No</Form.Label>
                  <Form.Group className="mb-2">
                    <Form.Control 
                      type="text" 
                      name="voucherNo"
                      value={voucherData.voucherNo} 
                      onChange={handleVoucherChange}
                      className="border-primary"
                      placeholder="Voucher No"
                      readOnly={isEditMode}
                      disabled={isEditMode}
                    />
                  </Form.Group>
                  <Form.Label className="fw-bold mt-1">Date</Form.Label>
                  <Form.Group>
                    <Form.Control 
                      type="date" 
                      name="invoiceDate"
                      value={voucherData.invoiceDate} 
                      onChange={handleVoucherChange}
                      className="border-primary"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
            
            {/* Journal Entry Form Section */}
            <div className="bg-white p-3 rounded shadow-sm mb-4">
              <h6 className="text-primary mb-3">
                {editingId ? 'Edit Journal Entry' : 'Add Journal Entry'}
              </h6>
              
              <div className="d-flex align-items-end gap-2 flex-wrap">
                <div style={{ minWidth: '200px', flex: 2, position: 'relative' }} ref={dropdownRef}>
                  <Form.Label className="fw-bold small">Account/Customer Name</Form.Label>
                  <input
                    type="text"
                    className="form-control form-control-sm border-primary"
                    placeholder="Search account..."
                    value={journalForm.accountName || searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                      if (!e.target.value) {
                        setJournalForm(prev => ({
                          ...prev,
                          accountId: '',
                          accountName: '',
                          balance: 0,
                          balance_type: 'Dr'
                        }));
                      }
                    }}
                    onClick={() => setIsDropdownOpen(true)}
                  />
                  
                 {isDropdownOpen && !journalForm.accountId && (
  <div
    className="position-absolute w-100"
    style={{
      top: '100%',
      left: 0,
      zIndex: 9999,
      backgroundColor: '#fff',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxHeight: '300px',
      overflowY: 'auto'
    }}
  >
    <div style={{ 
      padding: '8px 16px', 
      borderBottom: '1px solid #dee2e6', 
      color: '#0d6efd', 
      fontWeight: 600,
      position: 'sticky',
      top: 0,
      backgroundColor: '#fff'
    }}>
      Select Account/Customer
    </div>
    <div>
      {loading ? (
        <div style={{ padding: '16px', textAlign: 'center' }}>Loading...</div>
      ) : filteredAccounts.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', color: '#6c757d' }}>
          No accounts found
        </div>
      ) : (
        filteredAccounts.map(account => (
          <div
            key={account.id}
            onClick={() => handleAccountSelect(account)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderLeft: '3px solid transparent',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ fontWeight: 500, fontSize: '14px' }}>
              {account.name || account.account_name}
              {account.group && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6c757d', 
                  marginLeft: '8px',
                  fontWeight: 'normal'
                }}>
                  ({account.group})
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>
              Balance: ₹{safeToFixed(account.balance)} ({account.balance_type || 'Dr'})
           
            </div>
          </div>
        ))
      )}
    </div>
    <div style={{ 
      padding: '8px 16px', 
      borderTop: '1px solid #dee2e6',
      position: 'sticky',
      bottom: 0,
      backgroundColor: '#fff'
    }}>
      <button
        className="btn btn-sm btn-outline-secondary w-100"
        onClick={() => {
          setIsDropdownOpen(false);
          setSearchTerm('');
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
                </div>
                
                <div style={{ minWidth: '120px', flex: 1 }}>
                  <Form.Label className="fw-bold small">Current Balance</Form.Label>
                  <Form.Control
                    type="text"
                    value={`₹${safeToFixed(journalForm.balance)} (${journalForm.balance_type || 'Dr'})`}
                    readOnly
                    className="bg-light form-control-sm"
                  />
                </div>
                
                <div style={{ minWidth: '120px', flex: 1 }}>
                  <Form.Label className="fw-bold small">Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={journalForm.amount}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    className="border-primary form-control-sm"
                  />
                </div>
                
                <div style={{ minWidth: '100px', flex: 0.8 }}>
                  <Form.Label className="fw-bold small">Type</Form.Label>
                  <Form.Select
                    name="amountType"
                    value={journalForm.amountType}
                    onChange={handleFormChange}
                    className="border-primary form-control-sm"
                  >
                    <option value="Dr">Dr (Debit)</option>
                    <option value="Cr">Cr (Credit)</option>
                  </Form.Select>
                </div>
                
                <div style={{ minWidth: '100px' }}>
                  <div className="d-flex gap-1">
                    <Button 
                      variant={editingId ? "warning" : "success"} 
                      onClick={handleAddOrUpdate}
                      size="sm"
                      disabled={saving}
                    >
                      {editingId ? <FaSave className="me-1" /> : <FaPlus className="me-1" />}
                      {editingId ? 'Update' : 'Add'}
                    </Button>
                    {editingId && (
                      <Button variant="secondary" onClick={handleCancelEdit} size="sm">
                        <FaTimes />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Preview of new balance */}
              {/* {journalForm.accountName && journalForm.amount && (
                <div className="mt-2 p-2 bg-light rounded" style={{ fontSize: '12px' }}>
                  <strong>Preview:</strong> After {journalForm.amountType} of ₹{parseFloat(journalForm.amount) || 0}, 
                  balance will be: 
                  <span className={`ms-2 fw-bold ${journalForm.amountType === 'Dr' ? 'text-danger' : 'text-success'}`}>
                    ₹{safeToFixed(calculateNewBalance(
                      journalForm.balance, 
                      journalForm.balance_type, 
                      journalForm.amount, 
                      journalForm.amountType
                    ).newBalance)} ({calculateNewBalance(
                      journalForm.balance, 
                      journalForm.balance_type, 
                      journalForm.amount, 
                      journalForm.amountType
                    ).newBalanceType})
                  </span>
                </div>
              )} */}
            </div>
            
            {/* Journal Items Table */}
            <div className="bg-white p-3 rounded shadow-sm mb-4">
              <h6 className="text-primary mb-3">Journal Entries</h6>
              <div className="table-responsive">
                <Table bordered responsive size="sm" className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Account Name</th>
                      <th>Current Balance</th>
                      <th>Amount (₹)</th>
                      <th>Type</th>
                      <th>New Balance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journalItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-3">
                          No entries added. Please add entries using the form above.
                        </td>
                      </tr>
                    ) : (
                      journalItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.accountName}</td>
                          <td className="text-end">₹{safeToFixed(item.balance)} ({item.balance_type})</td>
                          <td className="text-end">₹{safeToFixed(item.amount)}</td>
                          <td className="text-center">
                            <span className={`badge ${item.amountType === 'Dr' ? 'bg-danger' : 'bg-success'}`}>
                              {item.amountType}
                            </span>
                          </td>
                          <td className="text-end">
                            <span className={item.newBalanceType === 'Dr' ? 'text-danger' : 'text-success'}>
                              ₹{safeToFixed(item.newBalance)} ({item.newBalanceType})
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button variant="warning" size="sm" onClick={() => handleEdit(item)}>
                                <FaEdit />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {/* {journalItems.length > 0 && (
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="2" className="text-end fw-bold">Totals:</td>
                        <td className="text-end fw-bold">₹{safeToFixed(calculateTotalAmount())}</td>
                        <td colSpan="2">
                          <div className={`text-center fw-bold ${isBalanced ? 'text-success' : 'text-danger'}`}>
                            {isBalanced ? '✓ Balanced' : `✗ Unbalanced (Dr: ₹${safeToFixed(debitTotal)} | Cr: ₹${safeToFixed(creditTotal)})`}
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )} */}
                </Table>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="text-center bg-white p-3 rounded shadow-sm mt-4">
              <Button 
                variant="primary" 
                className="me-3 px-4" 
                onClick={handleSave}
                // disabled={saving || (journalItems.length > 0 && !isBalanced)}
                title={journalItems.length > 0 && !isBalanced ? "Debit and Credit totals must be equal" : ""}
              >
                {saving ? 'Saving...' : (isEditMode ? 'Update Voucher' : 'Save Voucher')}
              </Button>
              <Button variant="danger" onClick={() => navigate('/Jrtable')}>
                Cancel
              </Button>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default JrCreate;