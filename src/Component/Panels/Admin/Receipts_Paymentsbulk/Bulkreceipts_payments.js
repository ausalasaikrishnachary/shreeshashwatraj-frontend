import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Form, Table } from 'react-bootstrap';
import { FaUpload, FaDownload, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaTrash } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { baseurl } from '../../../BaseURL/BaseURL';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';


const BulkReceiptsPayments = ({ user }) => {
  const navigate = useNavigate();
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Download template
  const downloadTemplate = () => {
    const headers = ['TransactionID', 'Amount', 'Bank Name', 'Bank A/C'];
    const sampleData = [
  ['1', '5000', 'SBI', '1234567890'],
  ['2', '10000', 'HDFC', '9876543210'],
  ['3', '7500', 'ICICI', '5678901234'],
  ['4', '2500', 'Axis Bank', '1122334455'],
  ['5', '15000', 'Kotak Mahindra', '9988776655'],
  ['6', '3200', 'Bank of Baroda', '5544332211'],
  ['7', '8500', 'Canara Bank', '6677889900'],
  ['8', '4200', 'Yes Bank', '4433221100'],
  ['9', '12000', 'PNB', '7766554433'],
  ['10', '6800', 'Union Bank', '8899776655']
];
    
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Direct_Deposit_Template');
    
    XLSX.writeFile(wb, 'direct_deposit_bulk_upload_template.xlsx');
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
    setExcelData([]);
    setImportResults(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          alert('Excel file is empty');
          setLoading(false);
          return;
        }

        // Process data
        const processedData = jsonData.map((row, index) => ({
          id: index + 1,
          transaction_id: row['TransactionID'] || row['transaction_id'] || '',
          amount: row['Amount'] || row['amount'] || '',
          bank_name: row['Bank Name'] || row['bank_name'] || '',
          bank_account_number: row['Bank A/C'] || row['bank_account_number'] || '',
          status: 'pending',
          error: null
        }));

        // Validate data
        const validatedData = processedData.map(item => {
          const errors = [];
          if (!item.transaction_id) errors.push('Transaction ID required');
          if (!item.amount || isNaN(item.amount) || item.amount <= 0) errors.push('Valid amount required');
          if (!item.bank_name) errors.push('Bank name required');
          if (!item.bank_account_number) errors.push('Bank account number required');
          
          return {
            ...item,
            status: errors.length > 0 ? 'error' : 'pending',
            error: errors.join(', ')
          };
        });

        setExcelData(validatedData);
        
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Error reading Excel file. Please check the format.');
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

// Submit data to backend
const handleSubmit = async () => {
  if (excelData.length === 0) {
    alert('No data to submit. Please upload a valid Excel file.');
    return;
  }

  const validRecords = excelData.filter(item => item.status === 'pending');
  if (validRecords.length === 0) {
    alert('No valid records to submit. Please check your data.');
    return;
  }

  setImporting(true);
  setUploadProgress(0);
  
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    for (let i = 0; i < validRecords.length; i++) {
      const record = validRecords[i];
      const progress = Math.round(((i + 1) / validRecords.length) * 100);
      setUploadProgress(progress);

      try {
        // REMOVED created_by from here
        const response = await axios.post(`${baseurl}/api/direct-deposit/import`, {
          transaction_id: record.transaction_id,
          amount: parseFloat(record.amount),
          bank_name: record.bank_name,
          bank_account_number: record.bank_account_number
        });

        if (response.data.success) {
          successCount++;
          setExcelData(prev => prev.map(item => 
            item.id === record.id ? { ...item, status: 'success' } : item
          ));
        } else {
          failCount++;
          errors.push(`Row ${record.id}: ${response.data.message || 'Upload failed'}`);
          setExcelData(prev => prev.map(item => 
            item.id === record.id ? { ...item, status: 'error', error: response.data.message } : item
          ));
        }
      } catch (error) {
        failCount++;
        const errorMsg = error.response?.data?.message || error.message || 'Upload failed';
        errors.push(`Row ${record.id}: ${errorMsg}`);
        setExcelData(prev => prev.map(item => 
          item.id === record.id ? { ...item, status: 'error', error: errorMsg } : item
        ));
      }
    }

    setImportResults({
      total: validRecords.length,
      success: successCount,
      failed: failCount,
      errors: errors
    });

    alert(`Successfully submitted ${successCount} out of ${validRecords.length} records!`);
    
  } catch (error) {
    console.error('Bulk upload error:', error);
    alert('Bulk upload failed. Please try again.');
  } finally {
    setImporting(false);
    setUploadProgress(100);
  }
};

  // Reset form
  const handleReset = () => {
    setExcelFile(null);
    setExcelData([]);
    setImportResults(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a record
  const handleRemoveRecord = (id) => {
    setExcelData(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="container-fluid">
              <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
              <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
                <AdminHeader toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        
      <div className="row">
        <div className="col-12">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <FaUpload className="me-2" />
                Bulk Direct Deposit Import
              </h4>
            </Card.Header>
            
            <Card.Body>
              {/* Step 1: Download Template */}
              <div className="row mb-4">
                <div className="col-12">
                  <h5>Step 1: Download Template</h5>
                  <Button
                    variant="outline-primary"
                    onClick={downloadTemplate}
                    className="d-flex align-items-center"
                  >
                    <FaDownload className="me-2" />
                    Download Direct Deposit Template
                  </Button>
                  <small className="text-muted d-block mt-2">
                    Template includes: TransactionID, Amount, Bank Name, Bank A/C
                  </small>
                </div>
              </div>

              {/* Step 2: Upload Excel File */}
              <div className="row mb-4">
                <div className="col-12">
                  <h5>Step 2: Upload Excel File</h5>
                  <Form.Group>
                    <div className="input-group">
                      <Form.Control
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        disabled={loading || importing}
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={handleReset}
                        disabled={!excelFile || importing}
                      >
                        Clear
                      </Button>
                    </div>
                  </Form.Group>

                  {loading && (
                    <Alert variant="info" className="mt-3">
                      <Spinner size="sm" className="me-2" />
                      Reading Excel file...
                    </Alert>
                  )}

                  {excelFile && !loading && (
                    <Alert variant="success" className="mt-3">
                      <FaCheckCircle className="me-2" />
                      File selected: <strong>{excelFile.name}</strong>
                      <br />
                      <small>{excelData.length} records found</small>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Data Preview Table */}
              {excelData.length > 0 && (
                <div className="row mb-4">
                  <div className="col-12">
                    <h5>Step 3: Preview Data ({excelData.length} records)</h5>
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <Table striped bordered hover size="sm">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th>#</th>
                            <th>Transaction ID</th>
                            <th>Amount (₹)</th>
                            <th>Bank Name</th>
                            <th>Bank A/C</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {excelData.map((item, index) => (
                            <tr key={index} className={
                              item.status === 'success' ? 'table-success' : 
                              item.status === 'error' ? 'table-danger' : ''
                            }>
                              <td>{index + 1}</td>
                              <td>{item.transaction_id}</td>
                              <td>₹{Number(item.amount).toLocaleString('en-IN')}</td>
                              <td>{item.bank_name}</td>
                              <td>{item.bank_account_number}</td>
                              <td>
                                <span className={`badge ${
                                  item.status === 'success' ? 'bg-success' : 
                                  item.status === 'error' ? 'bg-danger' : 'bg-secondary'
                                }`}>
                                  {item.status === 'success' ? '✓ Submitted' : 
                                   item.status === 'error' ? '✗ Error' : '⏳ Pending'}
                                </span>
                                {item.error && (
                                  <div className="small text-danger mt-1">{item.error}</div>
                                )}
                              </td>
                              <td>
                                {item.status === 'pending' && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleRemoveRecord(item.id)}
                                  >
                                    <FaTrash />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {importing && (
                <div className="row mb-4">
                  <div className="col-12">
                    <h5>Upload Progress</h5>
                    <div className="progress mb-2" style={{ height: '25px' }}>
                      <div 
                        className="progress-bar progress-bar-striped progress-bar-animated" 
                        role="progressbar" 
                        style={{ width: `${uploadProgress}%` }}
                      >
                        {uploadProgress}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Results */}
              {importResults && (
                <div className="row mb-4">
                  <div className="col-12">
                    <Alert variant={importResults.failed === 0 ? 'success' : 'warning'}>
                      <h5>Import Results</h5>
                      <p className="mb-0">
                        <strong>Total Records:</strong> {importResults.total}<br />
                        <strong>Successfully Submitted:</strong> {importResults.success}<br />
                        <strong>Failed:</strong> {importResults.failed}
                      </p>
                      {importResults.errors.length > 0 && (
                        <div className="mt-2">
                          <strong>Errors:</strong>
                          <ul className="mb-0 mt-1">
                            {importResults.errors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Alert>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="row">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(-1)}
                      disabled={importing}
                    >
                      <FaArrowLeft className="me-2" />
                      Back
                    </Button>
                    
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        onClick={handleReset}
                        disabled={!excelFile || importing}
                      >
                        Clear All
                      </Button>
                      
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={excelData.length === 0 || importing}
                      >
                        {importing ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FaUpload className="me-2" />
                            Submit {excelData.filter(d => d.status === 'pending').length} Records
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default BulkReceiptsPayments;