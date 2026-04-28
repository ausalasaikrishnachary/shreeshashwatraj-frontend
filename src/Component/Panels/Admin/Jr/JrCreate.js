import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import './Invoices.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaSave, FaTimes, FaPlus } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';

const JrCreate = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id && id !== 'create';
  
  // State for accounts from API
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Voucher state
  const [voucherData, setVoucherData] = useState({
    voucherNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
  });
  
  // Selected account state
  const [selectedAccount, setSelectedAccount] = useState({
    id: '',
    name: '',
    balance: 0,
    balance_type: 'Dr'
  });
  
  // Amount state
  const [amount, setAmount] = useState('');

  // Company Info
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
    fetchAccounts();
    if (isEditMode) {
      fetchVoucherData(id);
    } else {
      generateVoucherNumber();
    }
  }, [isEditMode, id]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseurl}/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoading(false);
    }
  };

const fetchVoucherData = async (voucherId) => {
  try {
    setLoading(true);
    const response = await fetch(`${baseurl}/api/jrroutes/${voucherId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch voucher data');
    }
    
    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      
      // Map the data correctly from your backend response
      setVoucherData({
        voucherNo: data.VchNo || '',
        invoiceDate: data.Date ? new Date(data.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
      
      // Find the account from your accounts list or use the data directly
      setSelectedAccount({
        id: data.AccountID || data.PartyID || '',
        name: data.AccountName || data.PartyName || '',
        balance: parseFloat(data.balance_amount || 0),
        balance_type: data.balance_type || 'Dr'
      });
      
      setAmount(data.TotalAmount ? parseFloat(data.TotalAmount).toString() : '');
      
    } else {
      alert('Failed to load voucher data: ' + (result.message || 'Unknown error'));
    }
    setLoading(false);
  } catch (error) {
    console.error('Error fetching voucher:', error);
    alert('Failed to load voucher data for editing');
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

  const filteredAccounts = accounts.filter(account =>
    (account.name || account.account_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVoucherChange = (e) => {
    const { name, value } = e.target;
    setVoucherData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount({
      id: account.id,
      name: account.name || account.account_name,
      balance: formatBalance(account.balance),
      balance_type: account.balance_type || 'Dr'
    });
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleBalanceTypeChange = (e) => {
    setSelectedAccount(prev => ({
      ...prev,
      balance_type: e.target.value
    }));
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };
  
  const handleSaveAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter valid amount');
      return;
    }
    alert('✅ Amount saved successfully!');
  };
  
  const handleCancel = () => {
    navigate('/Jrtable');
  };
  
  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear all draft data?')) {
      setAmount('');
      setSelectedAccount({ id: '', name: '', balance: 0, balance_type: 'Dr' });
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
  
const handleSave = async () => {
  if (!selectedAccount.id) {
    alert('⚠️ Please select a customer/account');
    return;
  }
  
  if (!amount || parseFloat(amount) <= 0) {
    alert('⚠️ Please enter a valid amount');
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
  
  setSaving(true);
  
  try {
    const voucherPayload = {
      voucherNo: voucherData.voucherNo,
      invoiceDate: voucherData.invoiceDate,
      partyId: selectedAccount.id,         // PartyID (same as AccountID for customer)
      partyName: selectedAccount.name,     // PartyName
      balance_amount: selectedAccount.balance,
      totalAmount: parseFloat(amount),
      transactionType: 'Journal'
    };
    
    console.log('Saving voucher:', voucherPayload);
    
    let url = `${baseurl}/api/journalcreate`;
    let method = 'POST';
    
    if (isEditMode) {
      url = `${baseurl}/api/journalupdate/${id}`;
      method = 'PUT';
    }
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voucherPayload)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`✅ Voucher ${isEditMode ? 'updated' : 'saved'} successfully!`);
      navigate('/Jrtable');
    } else {
      alert(`❌ Failed to ${isEditMode ? 'update' : 'save'} voucher: ` + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error saving voucher:', error);
    alert(`❌ Error ${isEditMode ? 'updating' : 'saving'} voucher. Please try again.`);
  } finally {
    setSaving(false);
  }
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
            
            {/* Journal Entry Form - Single Row */}
            <div className="bg-white p-3 rounded shadow-sm mb-4">
              <Row className="align-items-end">
                <Col md={3}>
                  <Form.Label className="fw-bold">Party/Customer Name</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control border-primary"
                      placeholder="Search customer..."
                      value={selectedAccount.name || searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                        if (!e.target.value) {
                          setSelectedAccount({ id: '', name: '', balance: 0, balance_type: 'Dr' });
                        }
                      }}
                      onClick={() => setIsDropdownOpen(true)}
                    />
                    
                    {isDropdownOpen && !selectedAccount.id && (
                      <div className="position-absolute w-100" style={{
                        top: '100%', left: 0, zIndex: 9999, backgroundColor: '#fff',
                        border: '1px solid #dee2e6', borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '300px', overflowY: 'auto'
                      }}>
                        <div style={{ padding: '8px 16px', borderBottom: '1px solid #dee2e6', 
                          color: '#0d6efd', fontWeight: 600, position: 'sticky', top: 0, backgroundColor: '#fff' }}>
                          Select Customer
                        </div>
                        <div>
                          {loading ? (
                            <div style={{ padding: '16px', textAlign: 'center' }}>Loading...</div>
                          ) : filteredAccounts.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#6c757d' }}>
                              No customers found
                            </div>
                          ) : (
                            filteredAccounts.map(account => (
                              <div key={account.id} onClick={() => handleAccountSelect(account)} style={{
                                padding: '8px 16px', cursor: 'pointer', borderLeft: '3px solid transparent'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <div style={{ fontWeight: 500, fontSize: '14px' }}>
                                  {account.name || account.account_name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                  Balance: ₹{formatBalance(account.balance).toFixed(2)} ({account.balance_type || 'Dr'})
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div style={{ padding: '8px 16px', borderTop: '1px solid #dee2e6', position: 'sticky', bottom: 0, backgroundColor: '#fff' }}>
                          <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => {
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}>Close</button>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
                
                <Col md={2}>
                  <Form.Label className="fw-bold">Balance Amount</Form.Label>
                  <Form.Control
                    type="text"
                    value={`₹${selectedAccount.balance.toFixed(2)}`}
                    readOnly
                    className="bg-light"
                  />
                </Col>
                
                <Col md={2}>
                  <Form.Label className="fw-bold">Balance Type</Form.Label>
                  <Form.Select
                    value={selectedAccount.balance_type}
                    onChange={handleBalanceTypeChange}
                    className="border-primary"
                  >
                    <option value="Dr">Dr (Debit)</option>
                    <option value="Cr">Cr (Credit)</option>
                  </Form.Select>
                </Col>
                
                <Col md={3}>
                  <Form.Label className="fw-bold">Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className="border-primary"
                  />
                </Col>
                
                <Col md={2}>
                  <Button variant="success" onClick={handleSaveAmount} className="w-100">
                    <FaPlus className="me-1" />
                    Add Amount
                  </Button>
                </Col>
              </Row>
            </div>
            
            {/* Display Voucher Details */}
            {amount && parseFloat(amount) > 0 && selectedAccount.name && (
              <div className="bg-white p-3 rounded shadow-sm mb-4">
                <h6 className="text-primary mb-3">Voucher Details</h6>
                <Table bordered className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Voucher No</th>
                      <th>Date</th>
                      <th>Party Name</th>
                      <th>Amount (₹)</th>
                      <th>Balance Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{voucherData.voucherNo}</td>
                      <td>{voucherData.invoiceDate}</td>
                      <td>{selectedAccount.name}</td>
                      <td className="text-end">₹{parseFloat(amount).toFixed(2)}</td>
                      <td>{selectedAccount.balance_type === 'Dr' ? 'Debit (Dr)' : 'Credit (Cr)'}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            )}
            
<div className="text-center bg-white p-3 rounded shadow-sm mt-4">
  <Button variant="primary" className="me-3 px-4" onClick={handleSave} disabled={saving}>
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