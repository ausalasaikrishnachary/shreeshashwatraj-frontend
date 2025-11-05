import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './Createnote.css'; 
import { baseurl } from '../../../BaseURL/BaseURL';

const CreateNote = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [creditNoteNumber, setCreditNoteNumber] = useState("CNOTE0001");
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(""); 
  const [customerData, setCustomerData] = useState(null);
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [error, setError] = useState("");
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    axios.get(`${baseurl}/next-creditnote-number`)
      .then(res => {
        if (res.data && res.data.nextCreditNoteNumber) {
          setCreditNoteNumber(res.data.nextCreditNoteNumber);
        }
      })
      .catch(err => {
        console.error("Error fetching next number:", err);
        setCreditNoteNumber("CNOTE0001");
      });
  }, []);

  useEffect(() => {
    setLoadingInvoices(true);
    setError("");
    axios.get(`${baseurl}/api/credit-notesales`)
      .then(res => {
        console.log("Fetched invoices:", res.data);
        
        let invoices = [];
        if (Array.isArray(res.data)) {
          invoices = res.data;
        } else if (res.data && Array.isArray(res.data.invoices)) {
          invoices = res.data.invoices;
        } else if (res.data && Array.isArray(res.data.data)) {
          invoices = res.data.data;
        }
        
        setInvoiceList(invoices);
        setLoadingInvoices(false);
      })
      .catch(err => {
        console.error("Error fetching invoices:", err);
        setError("Failed to load invoices. Please check if the server is running.");
        setLoadingInvoices(false);
        setInvoiceList([]);
      });
  }, []);

  useEffect(() => {
    if (selectedInvoice) {
      setLoadingCustomer(true);
      axios.get(`${baseurl}/api/invoice-details/${selectedInvoice}`)
        .then(res => {
          console.log("Fetched invoice details:", res.data);
          setCustomerData(res.data);
          
          // Set batches from the API response
          if (res.data.all_batches && Array.isArray(res.data.all_batches)) {
            setBatches(res.data.all_batches);
          } else {
            setBatches([]);
          }
          
          setLoadingCustomer(false);
        })
        .catch(err => {
          console.error("Error fetching customer details:", err);
          setCustomerData(null);
          setBatches([]);
          setLoadingCustomer(false);
        });
    } else {
      setCustomerData(null);
      setBatches([]);
    }
  }, [selectedInvoice]);

  const formatAddress = (data, addressType) => {
    if (!data) return 'Address not available';
    
    const addressParts = [
      data[`${addressType}_address_line1`],
      data[`${addressType}_address_line2`],
      data[`${addressType}_city`],
      data[`${addressType}_pin_code`] ? `PIN: ${data[`${addressType}_pin_code`]}` : '',
      data[`${addressType}_state`],
      data[`${addressType}_country`],
      data[`${addressType}_branch_name`]
    ].filter(part => part && part.trim() !== '');
    
    return addressParts.join(', ') || 'Address not available';
  };

  // Calculate totals based on all batches
  const calculateTotals = () => {
    if (batches.length === 0) {
      return {
        taxableAmount: 0,
        totalGST: 0,
        totalCess: 0,
        grandTotal: 0
      };
    }

    // Calculate based on batches data
    const taxableAmount = batches.reduce((sum, batch) => {
      const quantity = parseFloat(batch.quantity) || 0;
      const sellingPrice = parseFloat(batch.selling_price) || 0;
      return sum + (quantity * sellingPrice);
    }, 0);

    // These calculations are placeholder - adjust based on your actual GST structure
    const totalGST = taxableAmount * 0.18; // Assuming 18% GST
    const totalCess = 0; // Adjust based on your cess calculation
    const grandTotal = taxableAmount + totalGST + totalCess;

    return {
      taxableAmount: taxableAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      totalCess: totalCess.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const totals = calculateTotals();

  return (
    <div className="credit-note-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`credit-note-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        <div className="container my-4">

          {error && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <strong>Warning:</strong> {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          <div className="border bg-white p-3" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
            {/* Top header row */}
            <div className="row g-0 align-items-start">
              <div className="col-lg-8 col-md-7 border-end p-3">
                <strong>Navkar Exports</strong>
                <div style={{ fontSize: 13, marginTop: 6, whiteSpace: "pre-line" }}>
                  NO.63/603 AND 64/604,NEAR JAIN TEMPLE1ST MAIN ROAD, T DASARAHALLI
                  {"\n"}Email: akshay555.ak@gmail.com
                  {"\n"}Phone: 09880900431
                  {"\n"}GSTIN: 29AAMPC7994B1ZE
                </div>
              </div>

              <div className="col-lg-4 col-md-5 p-3">
                <div className="mb-2">
                  <label className="form-label small mb-1">Credit Note No</label>
                  <input className="form-control form-control-sm" value={creditNoteNumber} readOnly />
                </div>
                <div className="mb-2">
                  <label className="form-label small mb-1">Note Date</label>
                  <input 
                    type="date" 
                    className="form-control form-control-sm" 
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label small mb-1">Invoice</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedInvoice}
                    onChange={(e) => setSelectedInvoice(e.target.value)}
                    disabled={loadingInvoices}
                  >
                    <option value="">
                      {loadingInvoices ? "Loading invoices..." : "Select Invoice"}
                    </option>
                    {!loadingInvoices && invoiceList && Array.isArray(invoiceList) && invoiceList.length > 0 ? (
                      invoiceList.map((inv) => (
                        <option key={inv.VoucherID || inv.id || inv.InvoiceNumber} 
                                value={inv.InvoiceNumber}>
                          {inv.InvoiceNumber} 
                        </option>
                      ))  
                    ) : (
                      !loadingInvoices && <option disabled>No invoices found</option>
                    )}
                  </select>
                  {!loadingInvoices && invoiceList.length === 0 && (
                    <div className="text-danger small mt-1">
                      No invoices available. Please check if sales invoices exist in the database.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-4 border p-3">
                <div className="fw-bold">Customer Info</div>
                {loadingCustomer ? (
                  <div className="small mt-2 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Loading customer data...
                  </div>
                ) : customerData ? (
                  <>
                    <div className="small">Business: {customerData.business_name || 'N/A'}</div>
                    <div className="small">Email: {customerData.email || 'N/A'}</div>
                    <div className="small">Mobile: {customerData.mobile_number || 'N/A'}</div>
                    <div className="small">GSTIN: {customerData.gstin || customerData.gst_registered_name || 'N/A'}</div>
                  </>
                ) : (
                  <div className="small mt-2 text-muted">Select an invoice to load customer data</div>
                )}
              </div>

              <div className="col-md-4 border p-3">
                <div className="fw-bold">Billing Address</div>
                {loadingCustomer ? (
                  <div className="small mt-2 text-muted">Loading address...</div>
                ) : customerData ? (
                  <>
                    <div className="small mt-2" style={{ whiteSpace: 'pre-line' }}>
                      {formatAddress(customerData, 'billing')}
                    </div>
                    {customerData.billing_gstin && (
                      <div className="small mt-2">GSTIN: {customerData.billing_gstin}</div>
                    )}
                  </>
                ) : (
                  <div className="small mt-2 text-muted">Billing address will appear here</div>
                )}
              </div>

              <div className="col-md-4 border p-3">
                <div className="fw-bold">Shipping Address</div>
                {loadingCustomer ? (
                  <div className="small mt-2 text-muted">Loading address...</div>
                ) : customerData ? (
                  <>
                    <div className="small mt-2" style={{ whiteSpace: 'pre-line' }}>
                      {formatAddress(customerData, 'shipping')}
                    </div>
                    {customerData.shipping_gstin && (
                      <div className="small mt-2">GSTIN: {customerData.shipping_gstin}</div>
                    )}
                  </>
                ) : (
                  <div className="small mt-2 text-muted">Shipping address will appear here</div>
                )}
              </div>
            </div>

            {/* Batches table - Now showing all batches */}
            <div className="table-responsive mt-3">
              <table className="table table-sm table-bordered align-middle">
                <thead className="table-light text-center">
                  <tr>
                    <th>PRODUCT</th>
                    <th>BATCH NO</th>
                    <th>QUANTITY</th>
                    <th>SELLING PRICE</th>
                    <th>COST PRICE</th>
                    <th>MRP</th>
                   
                   
                    <th>DISCOUNT</th>
                    <th>GST</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>IGST</th>
                    <th>CESS</th>
                    <th>TOTAL</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCustomer ? (
                    <tr>
                      <td colSpan="16" className="text-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Loading batches data...
                      </td>
                    </tr>
                  ) : batches.length > 0 ? (
                    batches.map((batch, index) => {
                      const quantity = parseFloat(batch.quantity) || 0;
                      const sellingPrice = parseFloat(batch.selling_price) || 0;
                      const total = quantity * sellingPrice;
                      
                      return (
                        <tr key={batch.id || index}>
                          <td className="ps-3 text-start">
                            {customerData?.product_name || 'Product Name'}
                          </td>
                          <td>{batch.batch_number || 'N/A'}</td>
                          <td className="text-end">{batch.quantity || '0.00'}</td>
                          <td className="text-end">{batch.selling_price || '0.00'}</td>
                          <td className="text-end">{batch.cost_price || '0.00'}</td>
                          <td className="text-end">{batch.mrp || '0.00'}</td>
                     
                          <td className="text-end">0.00</td> {/* Discount - adjust as needed */}
                          <td className="text-end">18.00%</td> {/* GST Rate - adjust as needed */}
                          <td className="text-end">{(total * 0.09).toFixed(2)}</td> {/* CGST - 9% */}
                          <td className="text-end">{(total * 0.09).toFixed(2)}</td> {/* SGST - 9% */}
                          <td className="text-end">0.00</td> {/* IGST */}
                          <td className="text-end">0.00</td> {/* CESS */}
                          <td className="text-end">{total.toFixed(2)}</td>
                          <td className="text-center">
                            <button className="btn btn-sm btn-outline-primary me-1" title="Edit">✏️</button>
                            <button className="btn btn-sm btn-outline-danger" title="Delete">🗑️</button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="16" className="text-center text-muted">
                        {selectedInvoice ? 'No batches found for this product' : 'Select an invoice to view batches'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Note + totals */}
            <div className="row mt-3">
              <div className="col-md-8">
                <textarea className="form-control" rows="5" placeholder="Note" defaultValue={""} />
              </div>

              <div className="col-md-4">
                <div className="border p-2 d-flex flex-column" style={{ minHeight: 120 }}>
                  <div className="d-flex justify-content-between">
                    <div>Taxable Amount</div>
                    <div className="text-end">{totals.taxableAmount}</div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>Total GST</div>
                    <div className="text-end">{totals.totalGST}</div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>Total Cess</div>
                    <div className="text-end">{totals.totalCess}</div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div style={{ width: "55%" }}>
                      <select className="form-select form-select-sm">
                        <option>Select Additional Charges</option>
                      </select>
                    </div>
                    <div className="text-end" style={{ width: "40%" }}>
                      <div className="fw-bold">Grand Total</div>
                      <div className="fs-5 fw-bold">{totals.grandTotal}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and signature */}
            <div className="row mt-3">
              <div className="col-md-8 border p-3">
                <label className="form-label small">Terms and Condition</label>
                <textarea className="form-control" rows="4" placeholder="Terms and Condition" />
              </div>

              <div className="col-md-4 border p-3 d-flex flex-column justify-content-between">
                <div>For</div>
                <div className="mt-3">Authorized Signatory</div>
              </div>
            </div>

            {/* Button */}
            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-success">+ Create Credit Note</button>
            </div>
          </div>

          <ReusableTable
            title="Credit Notes"
            initialEntriesPerPage={10}
            searchPlaceholder="Search credit notes..."
            showSearch={true}
            showEntriesSelector={true}
            showPagination={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateNote;