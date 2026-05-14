// frontend/src/components/Sales/BankStatement/BankStatementTable.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./BankStatement.css";
import Select from "react-select";
import { FaDownload, FaUpload, FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx';
import axios from 'axios';

const BankStatementTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [bankStatements, setBankStatements] = useState([]);
  const [filteredStatements, setFilteredStatements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState("July");
  const [year, setYear] = useState("2026");
  const [startDate, setStartDate] = useState("2025-06-08");
  const [endDate, setEndDate] = useState("2025-07-08");
  const [activeTab, setActiveTab] = useState("Bank Statement");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRangeDownloading, setIsRangeDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const fileInputRef = useRef(null);
  const [importResults, setImportResults] = useState(null);
  
  // States for retailer and transaction type per row
  const [accounts, setAccounts] = useState([]);
  const [selectedRetailerPerRow, setSelectedRetailerPerRow] = useState({});
  const [transactionTypePerRow, setTransactionTypePerRow] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const yearOptions = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => {
    const y = 2025 + i;
    return { value: y, label: y };
  });

  const tabs = [
    { name: "Invoices", path: "/sales/invoices" },
    { name: "Receipts", path: "/sales/receipts" },
    { name: "CreditNote", path: "/sales/credit_note" },
    { name: "Payments", path: "/sales/payments" },
    { name: "Journal", path: "/Jrtable" },
    { name: "Bank Statement", path: "/sales/bank-statement" },
  ];

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${baseurl}/accounts`);
       if (res.ok) {
      const data = await res.json();
      setAccounts(data); // ← Removed the filter, now setting all accounts
    } else {
      console.error("Failed to fetch accounts:", res.statusText);
    }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

const handleCreateVoucher = async (row, retailerId, transactionType) => {
  if (!retailerId) {
    alert("Please select a retailer for this transaction");
    return;
  }

  const selectedRetailer = accounts.find(acc => acc.id === parseInt(retailerId));
  if (!selectedRetailer) {
    alert("Selected retailer not found");
    return;
  }

  let amount = 0;
  if (row.debit && parseFloat(row.debit) > 0) {
    amount = parseFloat(row.debit);
  } else if (row.credit && parseFloat(row.credit) > 0) {
    amount = parseFloat(row.credit);
  }

  if (amount <= 0) {
    alert('No amount found for this transaction');
    return;
  }

  const transactionTypeText = transactionType === "credit" ? "Receipt" : "Payment";

  if (!window.confirm(`Create ${transactionTypeText} for ${selectedRetailer.name} with amount ₹${amount.toLocaleString('en-IN')}?`)) {
    return;
  }

  setProcessingId(row.id);

  try {
    const payload = {
      transaction_id: row.transaction_id,
      retailer_id: selectedRetailer.id,
      retailer_name: selectedRetailer.name,
      account_name: selectedRetailer.account_name || "",
      business_name: selectedRetailer.business_name || "",
      amount: amount,
      transaction_type: transactionType === "credit" ? "receipts" : "payments",
      dc: row.debit && parseFloat(row.debit) > 0 ? "D" : "C",
      txn_date: row.txn_date,
      value_date: row.value_date,
      description: row.description,
      ref_no: row.ref_no,
      branch_code: row.branch_code,
      payment_method: "Direct Deposit",
      bank_name: row.bank_name || "Bank Transfer",
      data_type: "Sales",
      balance: row.balance ? parseFloat(row.balance) : null,
    };

    const response = await axios.post(`${baseurl}/api/direct-deposit/create-voucher`, payload);

    if (response.data.success) {
      alert(`✅ ${transactionTypeText} created successfully!\nVoucher Number: ${response.data.voucher_number}`);
      setActionMessage({ type: 'success', message: `${transactionTypeText} created for ${selectedRetailer.name}` });
      
      await fetchBankStatements();
      
      setSelectedRetailerPerRow(prev => ({
        ...prev,
        [row.id]: ''
      }));
      
    } else {
      throw new Error(response.data.message || "Failed to create voucher");
    }
  } catch (error) {
    console.error("Error creating voucher:", error);
    alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    setActionMessage({ type: 'error', message: error.response?.data?.message || error.message });
  } finally {
    setProcessingId(null);
    setTimeout(() => setActionMessage(null), 5000);
  }
};

  const columns = [
    {
      key: "transaction_id",
      title: "Transaction ID",
      style: { textAlign: "center" },
     
    },
    {
      key: "txn_date",
      title: "Txn Date",
      style: { textAlign: "center" },
      render: (value) => value ? new Date(value).toLocaleDateString('en-IN') : "N/A",
    },
    {
      key: "value_date",
      title: "Value Date",
      style: { textAlign: "center" },
      render: (value) => value ? new Date(value).toLocaleDateString('en-IN') : "-",
    },
    {
      key: "description",
      title: "Description",
      style: { textAlign: "left" },
      render: (value) => value || "N/A",
    },
    {
      key: "ref_no",
      title: "Voucher No.",
      style: { textAlign: "center" },
      render: (value) => value || "-",
    },
    {
      key: "branch_code",
      title: "Branch Code",
      style: { textAlign: "center" },
      render: (value) => value || "-",
    },
    {
      key: "debit",
      title: "Debit (₹)",
      style: { textAlign: "right" },
      render: (value) => value ? `₹ ${parseFloat(value).toLocaleString('en-IN')}` : "-",
    },
    {
      key: "credit",
      title: "Credit (₹)",
      style: { textAlign: "right" },
      render: (value) => value ? `₹ ${parseFloat(value).toLocaleString('en-IN')}` : "-",
    },
    {
      key: "balance",
      title: "Balance (₹)",
      style: { textAlign: "right" },
      render: (value) => value ? `₹ ${parseFloat(value).toLocaleString('en-IN')}` : "-",
    },
 {
  key: "retailer_selection",
  title: "Select Customers",
  style: { textAlign: "center", minWidth: "200px" },
  render: (value, row) => (
    <select
      className="form-select form-select-sm"
      value={selectedRetailerPerRow[row.id] || ""}
      onChange={(e) => {
        setSelectedRetailerPerRow(prev => ({
          ...prev,
          [row.id]: e.target.value
        }));
      }}
      style={{ minWidth: "150px" }}
    >
      <option value="">-- Select Customers --</option>
      {accounts.map((account) => (
        <option key={account.id} value={account.id}>
          {account.business_name } ({account.group || "No Group"})
        </option>
      ))}
    </select>
  ),
},
   {
  key: "transaction_type",
  title: "Transaction Type",
  style: { textAlign: "center", minWidth: "150px" },
  render: (value, row) => (
    <select
      className="form-select form-select-sm"
      value={transactionTypePerRow[row.id] || "credit"}
      onChange={(e) => {
        setTransactionTypePerRow(prev => ({
          ...prev,
          [row.id]: e.target.value
        }));
      }}
    >
      <option value="credit"> Receipt</option>
      <option value="debit">Payment</option>
    </select>
  ),
},
    {
      key: "actions",
      title: "Actions",
      style: { textAlign: "center" },
      render: (value, row) => (
        <button
          className="btn btn-sm btn-primary"
         onClick={() => handleCreateVoucher(
  row, 
  selectedRetailerPerRow[row.id], 
  transactionTypePerRow[row.id] || "credit"  
)}
          disabled={processingId === row.id || !selectedRetailerPerRow[row.id]}  
        >
          {processingId === row.id ? (
            <div className="spinner-border spinner-border-sm" role="status"></div>
          ) : (
            "Submit"
          )}
        </button>
      ),
    },
  ];

  // Download template
  const downloadTemplate = () => {
    const headers = ['Txn Date', 'Value Date', 'Description', 'Ref No./Cheque No.', 'Branch Code', 'Debit', 'Credit', 'Balance'];
    const sampleData = [
      ['2024-01-15', '2024-01-15', 'Salary Credit', 'REF001', 'BR001', '', '50000', '50000'],
      ['2024-01-16', '2024-01-16', 'Rent Payment', 'CHQ001', 'BR001', '15000', '', '35000'],
      ['2024-01-17', '2024-01-17', 'Electricity Bill', 'NEFT001', 'BR002', '2500', '', '32500'],
      ['2024-01-18', '2024-01-18', 'Interest Credit', 'INT001', 'BR001', '', '1000', '33500'],
      ['2024-01-19', '2024-01-19', 'ATM Withdrawal', 'ATM001', 'BR003', '5000', '', '28500']
    ];
    
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bank_Statement_Template');
    
    XLSX.writeFile(wb, 'bank_statement_bulk_upload_template.xlsx');
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload a valid Excel file (XLSX, XLS, CSV)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setExcelFile(file);
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          alert('Excel file is empty');
          setIsImporting(false);
          return;
        }

        let successCount = 0;
        let failCount = 0;
        const errors = [];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          try {
            const response = await axios.post(`${baseurl}/api/direct-deposit/import`, {
              txn_date: row['Txn Date'] || row['txn_date'] || '',
              value_date: row['Value Date'] || row['value_date'] || '',
              description: row['Description'] || row['description'] || '',
              ref_no: row['Ref No./Cheque No.'] || row['ref_no'] || '',
              branch_code: row['Branch Code'] || row['branch_code'] || '',
              debit: row['Debit'] ? parseFloat(row['Debit']) : null,
              credit: row['Credit'] ? parseFloat(row['Credit']) : null,
              balance: row['Balance'] ? parseFloat(row['Balance']) : null
            });

            if (response.data.success) {
              successCount++;
            } else {
              failCount++;
              errors.push(`Row ${i + 1}: ${response.data.message}`);
            }
          } catch (error) {
            failCount++;
            errors.push(`Row ${i + 1}: ${error.response?.data?.message || error.message}`);
          }
        }

        setImportResults({
          total: jsonData.length,
          success: successCount,
          failed: failCount,
          errors: errors
        });

        alert(`Import completed!\nSuccess: ${successCount}\nFailed: ${failCount}`);
        
        fetchBankStatements();
        
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Error reading Excel file. Please check the format.');
      } finally {
        setIsImporting(false);
        setExcelFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Fetch bank statements
  const fetchBankStatements = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching bank statements from:", `${baseurl}/api/direct-deposit/statements`);
      
      const response = await fetch(`${baseurl}/api/direct-deposit/statements`);
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("API Response:", result);
        
        let statements = [];
        if (result.success && Array.isArray(result.data)) {
          statements = result.data;
        } else if (Array.isArray(result)) {
          statements = result;
        } else if (result.data && Array.isArray(result.data)) {
          statements = result.data;
        } else {
          console.warn("Unexpected response structure:", result);
          statements = [];
        }
        
        console.log("Processed statements count:", statements.length);
        setBankStatements(statements);
        setFilteredStatements(statements);
        
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch bank statements:', response.status, errorText);
        setBankStatements([]);
        setFilteredStatements([]);
      }
    } catch (err) {
      console.error('Error fetching bank statements:', err);
      setBankStatements([]);
      setFilteredStatements([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (statements) => {
    console.log("Applying filters to statements:", statements.length);
    let filtered = [...statements];
    
    // Filter by month/year
    if (month && year) {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthIndex = monthNames.indexOf(month);
      filtered = filtered.filter((statement) => {
        const statementDate = new Date(statement.txn_date);
        return statementDate.getMonth() === monthIndex && statementDate.getFullYear() === parseInt(year);
      });
      console.log("After month/year filter:", filtered.length);
    }
    
    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter((statement) => {
        const statementDate = new Date(statement.txn_date);
        return statementDate >= start && statementDate <= end;
      });
      console.log("After date range filter:", filtered.length);
    }
    
    console.log("Final filtered statements:", filtered.length);
    setFilteredStatements(filtered);
  };

  useEffect(() => {
    console.log("bankStatements changed:", bankStatements.length);
    applyFilters(bankStatements);
  }, [month, year, startDate, endDate]);

  useEffect(() => {
    console.log("Component mounted, fetching data...");
    fetchBankStatements();
    fetchAccounts();
  }, []);

  // Export to Excel
  const exportToExcel = (data, filename) => {
    const exportData = data.map(item => ({
      'Transaction ID': item.transaction_id,
      'Txn Date': item.txn_date,
      'Value Date': item.value_date || '',
      'Description': item.description,
      'Ref No.': item.ref_no || '',
      'Branch Code': item.branch_code || '',
      'Debit (₹)': item.debit || '',
      'Credit (₹)': item.credit || '',
      'Balance (₹)': item.balance || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bank_Statements');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Handle download by month/year
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const dataToExport = filteredStatements;
      
      if (dataToExport.length === 0) {
        alert(`No statements found for ${month} ${year}`);
        setIsDownloading(false);
        return;
      }
      
      exportToExcel(dataToExport, `bank_statements_${month}_${year}`);
    } catch (err) {
      console.error("Download error:", err);
      alert("Error downloading statements: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle download by date range
  const handleDownloadRange = async () => {
    try {
      if (!startDate || !endDate) {
        alert("Please select both start and end dates");
        return;
      }
      
      if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after end date");
        return;
      }
      
      setIsRangeDownloading(true);
      const dataToExport = filteredStatements;
      
      if (dataToExport.length === 0) {
        alert(`No statements found from ${startDate} to ${endDate}`);
        setIsRangeDownloading(false);
        return;
      }
      
      exportToExcel(dataToExport, `bank_statements_${startDate}_to_${endDate}`);
    } catch (err) {
      console.error("Download range error:", err);
      alert("Error downloading statements: " + err.message);
    } finally {
      setIsRangeDownloading(false);
    }
  };

  const handleViewStatement = (id) => {
    navigate(`/bank-statement-view/${id}`);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  // Calculate totals for stats
  const totalCredits = filteredStatements.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
  const totalDebits = filteredStatements.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
  const totalTransactions = filteredStatements.length;
  const avgBalance = filteredStatements.length > 0 
    ? filteredStatements.reduce((sum, item) => sum + (parseFloat(item.balance) || 0), 0) / filteredStatements.length 
    : 0;

  const updatedStats = [
    {
      label: "Total Credits",
      value: `₹ ${totalCredits.toLocaleString('en-IN')}`,
      change: "+18%",
      type: "credit",
    },
    {
      label: "Total Debits",
      value: `₹ ${totalDebits.toLocaleString('en-IN')}`,
      change: "+15%",
      type: "debit",
    },
    {
      label: "Total Transactions",
      value: totalTransactions.toLocaleString('en-IN'),
      change: "+12%",
      type: "total",
    },
    {
      label: "Average Balance",
      value: `₹ ${avgBalance.toLocaleString('en-IN')}`,
      change: "+8%",
      type: "balance",
    },
  ];

  return (
    <div className="bank-statement-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`bank-statement-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        <div className="bank-statement-content-area">
          
          {/* Tabs Section */}
          <div className="bank-statement-tabs-section">
            <div className="bank-statement-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`bank-statement-tab ${activeTab === tab.name ? "bank-statement-tab--active" : ""}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Header Section */}
          <div className="bank-statement-header-section">
            <div className="bank-statement-header-top">
              <div className="bank-statement-title-section">
                <h1 className="bank-statement-main-title">Bank Statement Management</h1>
                <p className="bank-statement-subtitle">
                  View, manage and track all your bank transactions
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bank-statement-stats-grid">
            {updatedStats.map((stat, index) => (
              <div
                key={index}
                className={`bank-statement-stat-card bank-statement-stat-card--${stat.type}`}
              >
                <h3 className="bank-statement-stat-label">{stat.label}</h3>
                <div className="bank-statement-stat-value">{stat.value}</div>
                <div
                  className={`bank-statement-stat-change ${stat.change.startsWith("+") ? "bank-statement-stat-change--positive" : "bank-statement-stat-change--negative"}`}
                >
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          {/* Actions Section */}
          <div className="bank-statement-actions-section">
            <div className="bank-statement-container p-3">
              <h5 className="mb-3 fw-bold">Bank Transactions</h5>

              {/* Action Message Alert */}
              {actionMessage && (
                <div className={`alert alert-${actionMessage.type === 'success' ? 'success' : 'danger'} mt-2`}>
                  {actionMessage.message}
                </div>
              )}

              {/* Filter and Action Buttons */}
              <div className="row align-items-end g-3 mb-3">
                <div className="col-md-auto">
                  <label className="form-label mb-1">Select Month and Year:</label>
                  <div className="d-flex">
                    <select
                      className="form-select me-2"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      style={{ width: '130px' }}
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

                    <Select
                      options={yearOptions}
                      value={{ value: year, label: year }}
                      onChange={(selected) => setYear(selected.value)}
                      maxMenuHeight={150}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          width: "100px",
                          minWidth: "100px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          width: "100px",
                          minWidth: "100px",
                        }),
                      }}
                    />
                  </div>
                </div>
                
                <div className="col-md-auto">
                  <button
                    className="btn btn-success"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    ) : (
                      <FaFileExcel className="me-1" />
                    )}{" "}
                    Download Month
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
                      style={{ width: '150px' }}
                    />
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ width: '150px' }}
                    />
                  </div>
                </div>
                
                <div className="col-md-auto">
                  <button
                    className="btn btn-success"
                    onClick={handleDownloadRange}
                    disabled={isRangeDownloading}
                  >
                    {isRangeDownloading ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    ) : (
                      <FaFileExcel className="me-1" />
                    )}{" "}
                    Download Range
                  </button>
                </div>

                <div className="col-md-auto">
                  <button
                    className="btn btn-primary"
                    onClick={downloadTemplate}
                  >
                    <FaDownload className="me-1" /> Download Template
                  </button>
                </div>

                <div className="col-md-auto">
                  <div className="d-flex align-items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="excel-upload"
                    />
                    <label htmlFor="excel-upload" className="btn btn-info text-white mb-0">
                      {isImporting ? (
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                      ) : (
                        <FaUpload className="me-1" />
                      )}{" "}
                      Import Excel
                    </label>
                  </div>
                </div>
              </div>

              {/* Import Results Alert */}
              {importResults && (
                <div className={`alert ${importResults.failed === 0 ? 'alert-success' : 'alert-warning'} mt-3`}>
                  <strong>Import Results:</strong><br />
                  Total: {importResults.total} | Success: {importResults.success} | Failed: {importResults.failed}
                  {importResults.errors.length > 0 && (
                    <div className="mt-2">
                      <strong>Errors:</strong>
                      <ul className="mb-0 mt-1">
                        {importResults.errors.map((error, idx) => (
                          <li key={idx} className="text-danger">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Bank Statement Table */}
              <ReusableTable
                title="Bank Statements"
                data={filteredStatements}
                columns={columns}
                searchPlaceholder="Search by Transaction ID, Description, Ref No..."
                initialEntriesPerPage={10}
                showSearch={true}
                showEntriesSelector={true}
                showPagination={true}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankStatementTable;