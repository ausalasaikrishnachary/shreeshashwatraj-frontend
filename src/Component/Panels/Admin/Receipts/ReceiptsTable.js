// frontend/src/components/Sales/Receipts/ReceiptsTable.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from '../../../BaseURL/BaseURL';
import './Receipts.css';

const ReceiptsTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [receiptData, setReceiptData] = useState([]);
  const [nextReceiptNumber, setNextReceiptNumber] = useState('REC001');
  const [hasFetchedReceiptNumber, setHasFetchedReceiptNumber] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState('July');
  const [year, setYear] = useState('2025');
  const [startDate, setStartDate] = useState('2025-06-08');
  const [endDate, setEndDate] = useState('2025-07-08');
  const [activeTab, setActiveTab] = useState('Receipts');
  const [invoices, setInvoices] = useState([]); // Add invoices state
  const [selectedInvoice, setSelectedInvoice] = useState(''); // Add selected invoice state

  const [formData, setFormData] = useState({
    receiptNumber: 'REC001',
    retailerId: '',
    amount: '',
    currency: 'INR',
    paymentMethod: 'Direct Deposit',
    receiptDate: new Date().toISOString().split('T')[0],
    note: '',
    bankName: '',
    transactionDate: '',
    reconciliationOption: 'Do Not Reconcile',
    retailerMobile: '',
    retailerEmail: '',
    retailerGstin: '',
    retailerBusinessName: '',
    transactionProofFile: '',
    invoiceNumber: '' // Add invoice number field
  });

  // Fetch invoices from API
  const fetchInvoices = async () => {
    try {
      console.log('Fetching invoices from:', `${baseurl}/api/vouchersnumber`);
      const response = await fetch(`${baseurl}/api/vouchersnumber`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received invoices data:', data);
        setInvoices(data);
      } else {
        console.error('Failed to fetch invoices. Status:', response.status);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  // File change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (PDF, JPG, PNG, DOC, DOCX)');
        return;
      }
    
      setFormData(prev => ({
        ...prev,
        transactionProofFile: file
      }));
    }
  };

  // File remove handler
  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      transactionProofFile: null
    }));
  };

  const receiptStats = [
    { label: 'Total Receipts', value: '₹ 2,50,000', change: '+18%', type: 'total' },
    { label: 'Cash Receipts', value: '₹ 1,50,000', change: '+15%', type: 'cash' },
    { label: 'Bank Receipts', value: '₹ 80,000', change: '+20%', type: 'bank' },
    { label: 'Digital Receipts', value: '₹ 20,000', change: '+25%', type: 'digital' }
  ];

  const columns = [
    { 
      key: 'payee', 
      title: 'Retailer Name', 
      style: { textAlign: 'left' },
      render: (value, row) => {
        const businessName =
          row?.retailer?.business_name ||
          row?.payee_name ||
          row?.retailer_name ||
          'N/A';

        return businessName;
      }
    },
    { 
      key: 'VchNo', 
      title: 'RECEIPT NUMBER', 
      style: { textAlign: 'center' },
      render: (value, row) => (
        <button
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => handleViewReceipt(row.VoucherID)}
          title="Click to view receipt"
        >
          {value || 'N/A'}
        </button>
      )
    },
    { 
      key: 'paid_amount', 
      title: 'AMOUNT', 
      style: { textAlign: 'right' },
      render: (value) => value || '₹ 0.00'
    },
    { 
      key: 'payment_method', 
      title: 'PAYMENT METHOD', 
      style: { textAlign: 'center' },
      render: (value) => value || 'N/A'
    },
    {
      key:'invoice_numbers',
      title:'Accounting',
      style:{textAlign:'center'},
      render:(value) => value || '0'
    },
  {
  key: 'Date',
  title: 'DATE',
  style: { textAlign: 'center' },
  render: (value) => {
    if (!value) return 'N/A';

    const dateObj = new Date(value);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`; // DD-MM-YYYY
  }
}

  ];

  const tabs = [
    { name: 'Invoices', path: '/sales/invoices' },
    { name: 'Receipts', path: '/sales/receipts' },
    { name: 'Quotations', path: '/sales/quotations' },
    { name: 'BillOfSupply', path: '/sales/bill_of_supply' },
    { name: 'CreditNote', path: '/sales/credit_note' },
    { name: 'DeliveryChallan', path: '/sales/delivery_challan' },
    { name: 'Receivables', path: '/sales/receivables' }
  ];

  // Fetch next receipt number
  const fetchNextReceiptNumber = async () => {
    try {
      console.log('Fetching next receipt number from:', `${baseurl}/api/next-receipt-number`);
      const response = await fetch(`${baseurl}/api/next-receipt-number`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received next receipt number:', data.nextReceiptNumber);
        setNextReceiptNumber(data.nextReceiptNumber);
        setFormData(prev => ({
          ...prev,
          receiptNumber: data.nextReceiptNumber
        }));
        setHasFetchedReceiptNumber(true);
      } else {
        console.error('Failed to fetch next receipt number. Status:', response.status);
        await generateFallbackReceiptNumber();
      }
    } catch (err) {
      console.error('Error fetching next receipt number:', err);
      await generateFallbackReceiptNumber();
    }
  };

  // Fallback receipt number generation
  const generateFallbackReceiptNumber = async () => {
    try {
      console.log('Attempting fallback receipt number generation...');
      const response = await fetch(`${baseurl}/api/last-receipt`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastReceiptNumber) {
          const lastNumber = data.lastReceiptNumber;
          const numberMatch = lastNumber.match(/REC(\d+)/);
          if (numberMatch) {
            const nextNum = parseInt(numberMatch[1], 10) + 1;
            const fallbackReceiptNumber = `REC${nextNum.toString().padStart(3, '0')}`;
            console.log('Fallback receipt number generated:', fallbackReceiptNumber);
            setNextReceiptNumber(fallbackReceiptNumber);
            setFormData(prev => ({
              ...prev,
              receiptNumber: fallbackReceiptNumber
            }));
            setHasFetchedReceiptNumber(true);
            return;
          }
        }
      }
      // Default fallback
      setNextReceiptNumber('REC001');
      setFormData(prev => ({
        ...prev,
        receiptNumber: 'REC001'
      }));
      setHasFetchedReceiptNumber(true);
    } catch (err) {
      console.error('Error in fallback receipt number generation:', err);
      setNextReceiptNumber('REC001');
      setFormData(prev => ({
        ...prev,
        receiptNumber: 'REC001'
      }));
      setHasFetchedReceiptNumber(true);
    }
  };

  // Fetch all receipts
  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching receipts from:', `${baseurl}/api/receipts`);
      const response = await fetch(`${baseurl}/api/receipts`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received receipts data:', data);
        
        // Sort data in descending order by receipt_date or id
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.receipt_date || a.created_at);
          const dateB = new Date(b.receipt_date || b.created_at);
          return dateB - dateA || b.id - a.id;
        });

        // Transform data with proper retailer object handling
        const transformedData = sortedData.map(receipt => ({
          ...receipt,
          id: receipt.id || '',
          retailer: receipt.retailer || { 
            business_name: receipt.payee_name || receipt.retailer_name || 'N/A' 
          },
          payee: receipt.retailer?.business_name || receipt.payee_name || receipt.retailer_name || 'N/A',
          amount: `₹ ${parseFloat(receipt.amount || 0).toLocaleString('en-IN')}`,
          receipt_date: receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString('en-IN') : 'N/A',
          payment_method: receipt.payment_method || 'N/A'
        }));

        console.log('Transformed receipts data:', transformedData);
        
        setReceiptData(transformedData);
      } else {
        console.error('Failed to fetch receipts. Status:', response.status);
        alert('Failed to load receipts. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
      alert('Error connecting to server. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch accounts for retailer dropdown
  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${baseurl}/accounts`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      } else {
        console.error('Failed to fetch accounts:', res.statusText);
        alert('Failed to load accounts. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      alert('Error connecting to server. Please check your network or try again later.');
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching initial data...');
    fetchAccounts();
    fetchReceipts();
    fetchNextReceiptNumber();
    fetchInvoices(); // Fetch invoices when component mounts
  }, []);

  // Tab navigation
  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  // Create receipt modal
  const handleCreateClick = async () => {
    console.log('Create button clicked, current receipt number:', nextReceiptNumber);
    if (!hasFetchedReceiptNumber) {
      console.log('Receipt number not fetched yet, fetching now...');
      await fetchNextReceiptNumber();
    }
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setFormData(prev => ({
      ...prev,
      retailerId: '',
      amount: '',
      currency: 'INR',
      paymentMethod: 'Direct Deposit',
      receiptDate: new Date().toISOString().split('T')[0],
      note: '',
      bankName: '',
      transactionDate: '',
      reconciliationOption: 'Do Not Reconcile',
      receiptNumber: nextReceiptNumber,
      invoiceNumber: '' // Reset invoice number
    }));
    setSelectedInvoice(''); // Reset selected invoice
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle retailer selection change
  const handleRetailerChange = (e) => {
    const selectedRetailerId = e.target.value;
    const selectedRetailer = accounts.find(acc => acc.id == selectedRetailerId);
    
    setFormData(prev => ({
      ...prev,
      retailerId: selectedRetailerId,
      retailerMobile: selectedRetailer?.mobile_number || '',
      retailerEmail: selectedRetailer?.email || '',
      retailerGstin: selectedRetailer?.gstin || '',
      retailerBusinessName: selectedRetailer?.business_name || ''
    }));
  };

  // Handle invoice selection change
  const handleInvoiceChange = (e) => {
    const selectedVchNo = e.target.value;
    setSelectedInvoice(selectedVchNo);
    setFormData(prev => ({
      ...prev,
      invoiceNumber: selectedVchNo
    }));
  };

  const handleCreateReceipt = async () => {
    // Validation
    if (!formData.retailerId) {
      alert('Please select a retailer');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!formData.receiptDate) {
      alert('Please select a receipt date');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create FormData instead of JSON
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('receipt_number', formData.receiptNumber);
      formDataToSend.append('retailer_id', formData.retailerId);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('payment_method', formData.paymentMethod);
      formDataToSend.append('receipt_date', formData.receiptDate);
      formDataToSend.append('note', formData.note);
      formDataToSend.append('bank_name', formData.bankName);
      formDataToSend.append('transaction_date', formData.transactionDate || '');
      formDataToSend.append('reconciliation_option', formData.reconciliationOption);
      formDataToSend.append('retailer_name', formData.retailerBusinessName);
      formDataToSend.append('invoice_number', formData.invoiceNumber); // Add invoice number
      
      // Append file if exists
      if (formData.transactionProofFile) {
        formDataToSend.append('transaction_proof', formData.transactionProofFile);
      }

      console.log('Sending receipt data with FormData...');
      console.log('Invoice Number:', formData.invoiceNumber);

      const response = await fetch(`${baseurl}/api/receipts`, {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Receipt created successfully:', result);
        await fetchReceipts(); // Refresh the receipts list
        handleCloseModal(); // Close modal
        alert('Receipt created successfully!');
        
        // Navigate to the ReceiptView page with the new receipt's ID
        if (result.id) {
          navigate(`/receipts_view/${result.id}`);
        } else {
          console.error('No ID returned in response');
          alert('Receipt created, but unable to view details. Please check the receipt list.');
        }

        await fetchNextReceiptNumber(); // Fetch the next receipt number
      } else {
        const errorText = await response.text();
        console.error('Failed to create receipt. Status:', response.status);
        console.error('Error response:', errorText);
        let errorMessage = 'Failed to create receipt. ';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += errorData.error || 'Please try again.';
          if (errorData.error.includes('already exists')) {
            console.log('Duplicate receipt number detected, fetching new number...');
            await fetchNextReceiptNumber();
            errorMessage += ' A new receipt number has been generated. Please try again.';
          }
        } catch {
          errorMessage += 'Please try again.';
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Error creating receipt:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // View receipt details
  const handleViewReceipt = (receiptId) => {
    console.log('View receipt:', receiptId);
    navigate(`/receipts_view/${receiptId}`);
  };

  // Delete receipt
  const handleDeleteReceipt = async (receiptId) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        const response = await fetch(`${baseurl}/api/receipts/${receiptId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Receipt deleted successfully!');
          await fetchReceipts(); // Refresh the list
          await fetchNextReceiptNumber(); // Re-fetch in case deletion affects sequence
        } else {
          alert('Failed to delete receipt. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting receipt:', err);
        alert('Error deleting receipt. Please try again.');
      }
    }
  };

  // Download receipts
  const handleDownload = () => {
    alert(`Downloading receipts for ${month} ${year}`);
  };

  // Download date range receipts
  const handleDownloadRange = () => {
    alert(`Downloading receipts from ${startDate} to ${endDate}`);
  };

  return (
    <div className="receipts-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`receipts-main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        <div className="receipts-content-area">
          {/* Tabs Section */}
          <div className="receipts-tabs-section">
            <div className="receipts-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`receipts-tab ${activeTab === tab.name ? 'receipts-tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Header Section */}
          <div className="receipts-header-section">
            <div className="receipts-header-top">
              <div className="receipts-title-section">
                <h1 className="receipts-main-title">Receipt Management</h1>
                <p className="receipts-subtitle">Create, manage and track all your payment receipts</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="receipts-stats-grid">
            {receiptStats.map((stat, index) => (
              <div key={index} className={`receipts-stat-card receipts-stat-card--${stat.type}`}>
                <h3 className="receipts-stat-label">{stat.label}</h3>
                <div className="receipts-stat-value">{stat.value}</div>
                <div className={`receipts-stat-change ${stat.change.startsWith('+') ? 'receipts-stat-change--positive' : 'receipts-stat-change--negative'}`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          {/* Actions Section */}
          <div className="receipts-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Receipts</h5>
              {/* Filters and Actions */}
              <div className="row align-items-end g-3 mb-3">
                <div className="col-md-auto">
                  <label className="form-label mb-1">Select Month and Year Data:</label>
                  <div className="d-flex">
                    <select
                      className="form-select me-2"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option>January</option>
                      <option>February</option>
                      <option>March</option>
                      <option>April</option>
                      <option>May</option>
                      <option>June</option>
                      <option>July</option>
                      <option>August</option>
                      <option>September</option>
                      <option>October</option>
                      <option>November</option>
                      <option>December</option>
                    </select>
                    <select
                      className="form-select"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option>2025</option>
                      <option>2024</option>
                      <option>2023</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-auto">
                  <button
                    className="btn btn-success mt-4"
                    onClick={handleDownload}
                    disabled={isLoading}
                  >
                    <i className="bi bi-download me-1"></i> Download
                  </button>
                </div>
                <div className="col-md-auto">
                  <label className="form-label mb-1">Select Date Range:</label>
                  <div className="d-flex">
                    <input
                      type="date"
                      className="form-control me-2"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-auto">
                  <button
                    className="btn btn-success mt-4"
                    onClick={handleDownloadRange}
                    disabled={isLoading}
                  >
                    <i className="bi bi-download me-1"></i> Download Range
                  </button>
                </div>
                <div className="col-md-auto">
                  <button
                    className="btn btn-info text-white mt-4"
                    onClick={handleCreateClick}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Receipt'}
                  </button>
                </div>
              </div>

              {/* Receipts Table */}
              <ReusableTable
                title="Receipts"
                data={receiptData} 
                columns={columns}
                searchPlaceholder="Search receipts..."
                initialEntriesPerPage={5}
                showSearch={true}
                showEntriesSelector={false} 
                showPagination={true}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Create Receipt Modal */}
          {isModalOpen && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Create Receipt</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                      disabled={isLoading}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="company-info-recepits-table text-center">
                          <label className="form-label-recepits-table">Navkar Exports</label>
                          <p>NO.63/603 AND 64/604, NEAR JAIN TEMPLE</p>
                          <p>1ST MAIN ROAD, T DASARAHALLI</p>
                          <p>GST : 29AAAMPC7994B1ZE</p>
                          <p>Email: akshay555.ak@gmail.com</p>
                          <p>Phone: 09880990431</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Receipt Number</label>
                          <input
                            type="text"
                            className="form-control"
                            name="receiptNumber"
                            value={formData.receiptNumber}
                            onChange={handleInputChange}
                            placeholder="REC0001"
                            readOnly
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Receipt Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="receiptDate"
                            value={formData.receiptDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Payment Method</label>
                          <select
                            className="form-select"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleInputChange}
                          >
                            <option>Direct Deposit</option>
                            <option>Online Payment</option>
                            <option>Credit/Debit Card</option>
                            <option>Demand Draft</option>
                            <option>Cheque</option>
                            <option>Cash</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Invoice Number Selection - Added below the first row */}
                    <div className="row mb-4">
                     
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Retailer *</label>
                          <select
                            className="form-select"
                            name="retailerId"
                            value={formData.retailerId}
                            onChange={handleRetailerChange}
                            required
                          >
                            <option value="">Select Retailer</option>
                            {accounts
                              .filter(acc => acc.role === "retailer" && acc.business_name)
                              .map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                  {acc.business_name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Amount *</label>
                          <div className="input-group custom-amount-receipts-table">
                            <select
                              className="form-select currency-select-receipts-table"
                              name="currency"
                              value={formData.currency}
                              onChange={handleInputChange}
                            >
                              <option>INR</option>
                              <option>USD</option>
                              <option>EUR</option>
                              <option>GBP</option>
                            </select>
                            <input
                              type="number"
                              className="form-control amount-input-receipts-table"
                              name="amount"
                              value={formData.amount}
                              onChange={handleInputChange}
                              placeholder="Amount"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Note</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Additional notes..."
                          ></textarea>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Invoice Number *</label>
                          <select
                            className="form-select"
                            name="invoiceNumber"
                            value={formData.invoiceNumber}
                            onChange={handleInvoiceChange}
                            required
                          >
                            <option value="">Select Invoice Number</option>
                            {invoices.map((invoice) => (
                              <option key={invoice.VoucherID} value={invoice.VchNo}>
                                {invoice.VchNo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Bank Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            placeholder="Bank Name"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Transaction Proof Document</label>
                          <input 
                            type="file" 
                            className="form-control" 
                            onChange={(e) => handleFileChange(e)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                          <small className="text-muted">
                            {formData.transactionProofFile ? formData.transactionProofFile.name : 'No file chosen'}
                          </small>
                          
                          {formData.transactionProofFile && (
                            <div className="mt-2">
                              <div className="d-flex align-items-center">
                                <span className="badge bg-success me-2">
                                  <i className="bi bi-file-earmark-check"></i>
                                </span>
                                <span className="small">
                                  {formData.transactionProofFile.name} 
                                  ({Math.round(formData.transactionProofFile.size / 1024)} KB)
                                </span>
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger ms-2"
                                  onClick={() => handleRemoveFile()}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Transaction Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="transactionDate"
                            value={formData.transactionDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Reconciliation Option</label>
                          <select
                            className="form-select"
                            name="reconciliationOption"
                            value={formData.reconciliationOption}
                            onChange={handleInputChange}
                          >
                            <option>Do Not Reconcile</option>
                            <option>Customer Reconcile</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={isLoading}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleCreateReceipt}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create Receipt'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptsTable;