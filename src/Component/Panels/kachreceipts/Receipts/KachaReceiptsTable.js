import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import { baseurl } from '../../../BaseURL/BaseURL';
import './Receipts.css';

const KachaReceiptsTable = () => {
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
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [invoiceBalance, setInvoiceBalance] = useState(0);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

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
    retailerName: '',
    transactionProofFile: '',
    invoiceNumber: ''
  });

  // Fetch invoices from API
  const fetchInvoices = async () => {
    try {
      console.log('Fetching stock transfer vouchers...');
      
      const response = await fetch(`${baseurl}/api/vouchersnumber?type=stock transfer`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received stock transfer vouchers:', data);
        setInvoices(data);
      } else {
        console.error('Failed to fetch invoices. Status:', response.status);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  // Fetch invoice balance
  const fetchInvoiceBalance = async (retailerId, invoiceNumber) => {
    if (!retailerId || !invoiceNumber) {
      setInvoiceBalance(0);
      setFormData(prev => ({
        ...prev,
        amount: ''
      }));
      return;
    }

    try {
      setIsFetchingBalance(true);
      console.log(`Fetching balance for retailer ${retailerId}, invoice ${invoiceNumber}`);
      
      // First, check if the retailer information exists
      const selectedRetailer = accounts.find(acc => acc.id == retailerId);
      if (!selectedRetailer) {
        console.error('Retailer not found');
        setInvoiceBalance(0);
        setFormData(prev => ({ ...prev, amount: '' }));
        setIsFetchingBalance(false);
        return;
      }

      // Check if invoice exists in the invoices list
      const selectedInvoiceData = invoices.find(inv => inv.VchNo === invoiceNumber);
      
      if (!selectedInvoiceData) {
        console.warn('Invoice not found in invoices data');
        setInvoiceBalance(0);
        setFormData(prev => ({
          ...prev,
          amount: ''
        }));
        alert('Invoice not found. Please check the invoice number.');
        setIsFetchingBalance(false);
        return;
      }
      
      // Verify invoice belongs to the selected retailer
      const invoiceRetailerId = selectedInvoiceData.PartyID || selectedInvoiceData.AccountID;
      
      if (invoiceRetailerId && invoiceRetailerId != retailerId) {
        console.log(`Invoice ${invoiceNumber} belongs to retailer ${invoiceRetailerId}, not ${retailerId}`);
        setInvoiceBalance(0);
        setFormData(prev => ({
          ...prev,
          amount: ''
        }));
        alert('This invoice does not belong to the selected retailer.');
        setIsFetchingBalance(false);
        return;
      }

      // Try to fetch balance from receipts API
      try {
        const response = await fetch(
          `${baseurl}/api/receipts?retailer_id=${retailerId}&invoice_number=${invoiceNumber}`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received receipt data for balance check:', data);
          
          let balanceAmount = 0;
          
          if (Array.isArray(data)) {
            // Filter receipts for the specific invoice and retailer
            const relevantReceipts = data.filter(receipt => {
              const receiptRetailerId = receipt.PartyID 
              const receiptInvoiceNumber = receipt.InvoiceNumber || receipt.invoice_number;
              
              return receiptRetailerId == retailerId && 
                     receiptInvoiceNumber === invoiceNumber;
            });
            
            if (relevantReceipts.length > 0) {
              // Get the latest receipt
              const latestReceipt = relevantReceipts.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
              )[0];
              
              balanceAmount = parseFloat(latestReceipt.total_balance_amount || latestReceipt.balance_amount || 0);
              console.log('Found balance from receipts array:', balanceAmount);
            }
          } else if (data.total_balance_amount || data.balance_amount) {
            balanceAmount = parseFloat(data.total_balance_amount || data.balance_amount || 0);
          }
          
          if (balanceAmount > 0) {
            setInvoiceBalance(balanceAmount);
            setFormData(prev => ({
              ...prev,
              amount: balanceAmount.toString()
            }));
          } else {
            await checkInvoiceBalanceFromInvoiceData(retailerId, invoiceNumber);
          }
        } else {
          console.warn('Receipts API returned status:', response.status);
          await checkInvoiceBalanceFromInvoiceData(retailerId, invoiceNumber);
        }
      } catch (apiError) {
        console.error('API error fetching receipt balance:', apiError);
        await checkInvoiceBalanceFromInvoiceData(retailerId, invoiceNumber);
      }
    } catch (err) {
      console.error('Error in fetchInvoiceBalance:', err);
      setInvoiceBalance(0);
      setFormData(prev => ({
        ...prev,
        amount: ''
      }));
      alert('Error fetching invoice balance. Please try again or enter amount manually.');
    } finally {
      setIsFetchingBalance(false);
    }
  };

  // Helper function to check balance from invoice data
  const checkInvoiceBalanceFromInvoiceData = async (retailerId, invoiceNumber) => {
    const selectedInvoiceData = invoices.find(inv => inv.VchNo === invoiceNumber);
    if (selectedInvoiceData) {
      const invoiceAmount = parseFloat(selectedInvoiceData.TotalAmount || 0);
      const paidAmount = parseFloat(selectedInvoiceData.paid_amount || 0);
      const balance = invoiceAmount - paidAmount;
      
      console.log(`Invoice amount: ${invoiceAmount}, Paid: ${paidAmount}, Balance: ${balance}`);
      
      if (balance > 0) {
        setInvoiceBalance(balance);
        setFormData(prev => ({
          ...prev,
          amount: balance.toString()
        }));
      } else {
        setInvoiceBalance(0);
        setFormData(prev => ({
          ...prev,
          amount: ''
        }));
        if (balance === 0) {
          alert('This invoice is already fully paid.');
        } else {
          alert('Invoice has been overpaid. Please check the invoice details.');
        }
      }
    } else {
      console.log('Invoice not found in invoices data');
      setInvoiceBalance(0);
      setFormData(prev => ({
        ...prev,
        amount: ''
      }));
      alert('Invoice details not found. Please enter amount manually.');
    }
  };

  // Auto-fetch balance when both retailer and invoice are selected
  useEffect(() => {
    console.log('Balance fetch triggered:', {
      retailerId: formData.retailerId,
      invoiceNumber: formData.invoiceNumber,
      hasRetailer: !!formData.retailerId,
      hasInvoice: !!formData.invoiceNumber
    });
    
    if (formData.retailerId && formData.invoiceNumber) {
      const timer = setTimeout(() => {
        fetchInvoiceBalance(formData.retailerId, formData.invoiceNumber);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      // Clear amount if either is missing
      setInvoiceBalance(0);
      setFormData(prev => ({
        ...prev,
        amount: ''
      }));
    }
  }, [formData.retailerId, formData.invoiceNumber]);

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
          row?.retailer?.name ||
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
      key:'InvoiceNumber',
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

        return `${day}-${month}-${year}`;
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

      if (!response.ok) {
        console.error('Failed to fetch receipts. Status:', response.status);
        alert('Failed to load receipts. Please try again later.');
        return;
      }

      const data = await response.json();
      console.log('Received receipts data:', data);

      const salesOnlyData = data.filter(item =>
        (item.data_type || '').trim().toLowerCase() === 'stock transfer'
      );

      const sortedData = salesOnlyData.sort((a, b) => {
        const dateA = new Date(a.receipt_date || a.created_at);
        const dateB = new Date(b.receipt_date || b.created_at);
        return dateB - dateA || (b.id || 0) - (a.id || 0);
      });

      const transformedData = sortedData.map(receipt => ({
        ...receipt,
        id: receipt.id || '',
        retailer: receipt.retailer || {
          name:
            receipt.payee_name ||
            receipt.retailer_name ||
            'N/A'
        },
        payee:
          receipt.retailer?.name ||
          receipt.payee_name ||
          receipt.retailer_name ||
          'N/A',
        amount: `₹ ${parseFloat(receipt.amount || 0).toLocaleString('en-IN')}`,
        receipt_date: receipt.receipt_date
          ? new Date(receipt.receipt_date).toLocaleDateString('en-IN')
          : 'N/A',
        payment_method: receipt.payment_method || 'N/A'
      }));

      console.log('Final Sales Receipts:', transformedData);
      setReceiptData(transformedData);

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
    fetchInvoices();
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
    
    // Reset form data for new receipt
    setFormData(prev => ({
      ...prev,
      retailerId: '',
      amount: '',
      invoiceNumber: '',
      note: '',
      bankName: '',
      transactionDate: '',
      transactionProofFile: ''
    }));
    setSelectedInvoice('');
    setInvoiceBalance(0);
    
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
      invoiceNumber: '',
      transactionProofFile: ''
    }));
    setSelectedInvoice('');
    setInvoiceBalance(0);
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
      retailerName: selectedRetailer?.name || '',
      amount: '', 
      invoiceNumber: '' 
    }));
    
    setSelectedInvoice(''); 
    setInvoiceBalance(0); 
  };

  const handleInvoiceChange = (e) => {
    const selectedVchNo = e.target.value;
    setSelectedInvoice(selectedVchNo);
    setFormData(prev => ({
      ...prev,
      invoiceNumber: selectedVchNo,
      amount: '' 
    }));
    
    setInvoiceBalance(0); 
  };

  const handleCreateReceipt = async () => {
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
      
      const formDataToSend = new FormData();
      
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
      formDataToSend.append('retailer_name', formData.retailerName);
      formDataToSend.append('invoice_number', formData.invoiceNumber);
      formDataToSend.append('data_type', 'stock transfer');

      if (formData.transactionProofFile) {
        formDataToSend.append('transaction_proof', formData.transactionProofFile);
      }

      console.log('Sending receipt data with FormData...');
      console.log('Invoice Number:', formData.invoiceNumber);
      console.log('Amount:', formData.amount);

      const response = await fetch(`${baseurl}/api/receipts`, {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Receipt created successfully:', result);
        await fetchReceipts();
        handleCloseModal();
        alert('Receipt created successfully!');
        
        if (result.id) {
          navigate(`/receipts_view/${result.id}`);
        } else {
          console.error('No ID returned in response');
          alert('Receipt created, but unable to view details. Please check the receipt list.');
        }

        await fetchNextReceiptNumber();
      } else {
        const errorText = await response.text();
        console.error('Failed to create receipt. Status:', response.status);
        console.error('Error response:', errorText);
        let errorMessage = 'Failed to create receipt. ';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += errorData.error || 'Please try again.';
          if (errorData.error?.includes('already exists')) {
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
    navigate(`/kachareceipts_view/${receiptId}`);
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
          await fetchReceipts();
          await fetchNextReceiptNumber();
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

                  {/* Retailer and Invoice Selection Row */}
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
  .filter(acc => acc.role === "retailer" && (acc.name || acc.display_name))
  .map((acc) => (
    <option key={acc.id} value={acc.id}>
      {acc.gstin?.trim() ? acc.display_name : acc.name}
    </option>
  ))}
                        </select>
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

                  {/* Balance and Amount Row */}
                  <div className="row mb-4">
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
                            placeholder={isFetchingBalance ? "Fetching balance..." : (invoiceBalance > 0 ? "Auto-filled from balance" : "Enter amount")}
                            min="0"
                            step="0.01"
                            required
                            disabled={isFetchingBalance}
                          />
                          {isFetchingBalance && (
                            <div className="input-group-text">
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
                  </div>

                  {/* Bank and Transaction Details Row */}
                  <div className="row mb-4">
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
                    </div>
                  </div>

                  {/* File Upload and Reconciliation Row */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Transaction Proof Document</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          onChange={handleFileChange}
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
                                onClick={handleRemoveFile}
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
);;
};

export default KachaReceiptsTable;