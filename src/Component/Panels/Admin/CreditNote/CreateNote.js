import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import ReusableTable from '../../../Layouts/TableLayout/DataTable';
import './Createnote.css'; 
import { baseurl } from '../../../BaseURL/BaseURL';

const CreateNote = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [creditNoteNumber, setCreditNoteNumber] = useState("");
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(""); 
  const [customerData, setCustomerData] = useState(null);
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingCreditNote, setLoadingCreditNote] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState("");
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

             useEffect(() => {
  const fetchCreditNoteNumber = async () => {
    try {
      setLoadingCreditNote(true);
      
      const response = await axios.get(`${baseurl}/api/next-creditnote-number`);
      console.log("📦 API Response:", response.data);
      
      const nextNumber = response?.data?.nextCreditNoteNumber;
      if (nextNumber) {
        console.log("✅ About to set credit note number to:", nextNumber);
        setCreditNoteNumber(nextNumber);
        console.log("✅ Set complete - now triggering re-render");
      } else {
        console.warn("⚠️ No nextCreditNoteNumber found. Response structure:", response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching credit note number:", error.response?.data || error.message);
    } finally {
      setLoadingCreditNote(false);
    }
  };

  fetchCreditNoteNumber();
}, []);

// Debug state change
useEffect(() => {
  console.log('🔄 State updated - creditNoteNumber:', creditNoteNumber);
}, [creditNoteNumber]);

  useEffect(() => {
    console.log("🔍 creditNoteNumber updated:", creditNoteNumber);
  }, [creditNoteNumber]);


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
          
          if (res.data.items && Array.isArray(res.data.items)) {
            setItems(res.data.items);
          } else {
            setItems([]);
          }
          setLoadingCustomer(false);
        })
        .catch(err => {
          console.error("Error fetching customer details:", err);
          setCustomerData(null);
          setLoadingCustomer(false);
        });
    } else {
      setCustomerData(null);
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
    if (items.length === 0) {
      return {
        taxableAmount: 0,
        totalGST: 0,
        totalIGST: 0,
        grandTotal: 0
      };
    }

    const taxableAmount = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + (quantity * price);
    }, 0);

    const totalGST = taxableAmount * 0.12; // 18% GST
    const totalIGST = taxableAmount * 0.12; // assuming IGST same as GST
    const grandTotal = taxableAmount + totalIGST;

    return {
      taxableAmount: taxableAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      totalIGST: totalIGST.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const totals = calculateTotals();

  const handleUpdateQuantity = (index, item) => {
    const maxQty = parseFloat(item.originalQuantity || item.quantity);
    const newQty = parseFloat(editedQuantity);

    // Validation checks
    if (isNaN(newQty) || newQty < 0) {
      window.alert("Please enter a valid quantity (positive number)");
      return;
    }

    if (newQty > maxQty) {
      window.alert(`🚨 HIGH ALERT: Quantity cannot exceed original quantity (${maxQty})`);
      return;
    }

    if (newQty === 0) {
      if (!window.confirm("Are you sure you want to set quantity to 0? This will remove the item from calculations.")) {
        return;
      }
    }

    // Calculate new total price
    const price = parseFloat(item.price) || 0;
    const newTotal = (newQty * price).toFixed(2);

    // Update the items state
    const updatedItems = [...items];
    updatedItems[index].quantity = newQty;
    updatedItems[index].total = newTotal;
    setItems(updatedItems);

    // Update customerData.items too for table display
    const updatedCustomerData = { ...customerData };
    updatedCustomerData.items = updatedItems;
    setCustomerData(updatedCustomerData);

    setEditingIndex(null);

    // Show success message with details
  //   window.alert(`✅ Quantity updated successfully!\n\nItem: ${item.product}\nNew Quantity: ${newQty}\nPrice: ₹${price}\nNew Total: ₹${newTotal}`);

  //   // Call API to update quantity in backend
  //   axios
  // .put(`${baseurl}/api/update-invoice-item/${item.id}`, {
  //   quantity: newQty,
  // })
  // .then((res) => {
  //   console.log("Quantity updated in backend successfully!");
  // })
  // .catch((err) => {
  //   console.error("Failed to update quantity in database:", err);
  // });

  };

  const handleEditClick = (index, item) => {
    setEditingIndex(index);
    setEditedQuantity(item.quantity);
  };

  const handleQuantityChange = (e, item) => {
    const newValue = e.target.value;
    setEditedQuantity(newValue);
    
    // Real-time validation for high quantity
    const maxQty = parseFloat(item.originalQuantity || item.quantity);
    const newQty = parseFloat(newValue);
    
    if (!isNaN(newQty) && newQty > maxQty) {
      // You can add visual feedback here if needed
      console.warn(`Quantity exceeds maximum allowed: ${maxQty}`);
    }
  };

const handleCreateCreditNote = async () => {
  try {
    // Validate data
    if (!selectedInvoice) {
      window.alert("Please select an invoice first");
      return;
    }

    if (items.length === 0) {
      window.alert("No items available for credit note");
      return;
    }

    if (!creditNoteNumber) {
      window.alert("Credit note number is not available. Please try again.");
      return;
    }

    // Prepare request data with product_id and batch
    const requestData = {
      transactionType: "CreditNote", // Add this line
      invoiceNumber: selectedInvoice,
      noteDate: noteDate,
      creditNoteNumber: creditNoteNumber,
      items: items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        product: item.product,
        batch: item.batch,
        quantity: item.quantity,
        originalQuantity: item.originalQuantity || item.quantity,
        price: item.price,
        discount: item.discount,
        gst: item.gst,
        igst: item.igst,
        total: item.total
      })),
      customerData: {
        business_name: customerData?.business_name,
        email: customerData?.email,
        mobile_number: customerData?.mobile_number,
        gstin: customerData?.gstin,
        account_id: customerData?.account_id,
        party_id: customerData?.party_id
      },
      totals: totals,
      noteText: document.querySelector('textarea[placeholder="Note"]')?.value || '',
      terms: document.querySelector('textarea[placeholder="Terms and Condition"]')?.value || ''
    };

    console.log("📦 Sending credit note data:", requestData);

    const response = await axios.post(`${baseurl}/transaction`, requestData);

    if (response.data.success) {
      window.alert(`✅ Credit Note created successfully!\n\nCredit Note Number: ${response.data.creditNoteNumber}\nProduct ID: ${response.data.product_id}\nBatch ID: ${response.data.batch_id}\nTotal Amount: ₹${totals.grandTotal}`);
      
      // Reset form or redirect
      setSelectedInvoice("");
      setCustomerData(null);
      setItems([]);
      
      // Refresh credit note number
      const nextNumResponse = await axios.get(`${baseurl}/api/next-creditnote-number`);
      if (nextNumResponse.data && nextNumResponse.data.nextCreditNoteNumber) {
        setCreditNoteNumber(nextNumResponse.data.nextCreditNoteNumber);
      }
      
    } else {
      throw new Error(response.data.error);
    }

  } catch (error) {
    console.error('❌ Error creating credit note:', error);
    window.alert(`❌ Failed to create credit note: ${error.response?.data?.error || error.message}`);
  }
};

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
  <div className="position-relative">
    <input 
      key={creditNoteNumber || 'default'}
      className="form-control form-control-sm" 
      value={creditNoteNumber || ""} 
      readOnly 
      placeholder={loadingCreditNote ? "Loading..." : "CNOTE0001"}
    />
    {loadingCreditNote && (
      <div className="position-absolute top-50 end-0 translate-middle-y me-2">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )}
  </div>
  {!creditNoteNumber && !loadingCreditNote && (
    <div className="text-warning small mt-1">
      Unable to load credit note number. Using default.
    </div>
  )}
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

            {/* Items Table */}
            <div className="table-responsive mt-3">
              <table className="table table-sm table-bordered align-middle">
                <thead className="table-light text-center">
                  <tr>
                    <th>PRODUCT</th>
                    <th>BATCH</th>
                    <th>QTY</th>
                    <th>PRICE</th>
                    <th>DISCOUNT</th>
                    <th>GST %</th>
                    <th>IGST %</th>
                    <th>TOTAL</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {customerData?.items?.length > 0 ? (
                    customerData.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="ps-3 text-start">{item.product}</td>
                        <td>{item.batch}</td>
                        <td className="text-end">
                          {editingIndex === index ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={editedQuantity}
                              min="0"
                              max={item.originalQuantity || item.quantity}
                              step="0.01"
                              onChange={(e) => handleQuantityChange(e, item)}
                              style={{
                                border: parseFloat(editedQuantity) > parseFloat(item.originalQuantity || item.quantity) 
                                  ? '2px solid red' 
                                  : '1px solid #ced4da'
                              }}
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="text-end">₹{item.price}</td>
                        <td className="text-end">{item.discount}</td>
                        <td className="text-end">{item.gst}%</td>
                        <td className="text-end">{item.igst}%</td>
                        <td className="text-end fw-bold">
                          {editingIndex === index ? (
                            <span>₹{(parseFloat(editedQuantity || 0) * parseFloat(item.price || 0)).toFixed(2)}</span>
                          ) : (
                            `₹${item.total}`
                          )}
                        </td>
                        <td className="text-center">
                          {editingIndex === index ? (
                            <>
                              <button
                                className="btn btn-sm btn-success me-1"
                                onClick={() => handleUpdateQuantity(index, item)}
                                title="Save changes"
                              >
                                ✅
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setEditingIndex(null)}
                                title="Cancel editing"
                              >
                                ❌
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => handleEditClick(index, item)}
                                title="Edit quantity"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                title="Delete item"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove ${item.product}?`)) {
                                    // Add delete functionality here
                                    window.alert("Delete functionality to be implemented");
                                  }
                                }}
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted">
                        {selectedInvoice ? "No items found for this invoice" : "Select an invoice to view items"}
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
                    <div className="text-end">₹{totals.taxableAmount}</div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>Total GST</div>
                    <div className="text-end">₹{totals.totalGST}</div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>Total IGST</div>
                    <div className="text-end">₹{totals.totalGST}</div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div style={{ width: "55%" }}>
                      <select className="form-select form-select-sm">
                        <option>Select Additional Charges</option>
                      </select>
                    </div>
                    <div className="text-end" style={{ width: "40%" }}>
                      <div className="fw-bold">Grand Total</div>
                      <div className="fs-5 fw-bold">₹{totals.grandTotal}</div>
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
              <button 
                className="btn btn-success"
                onClick={handleCreateCreditNote}
                disabled={!selectedInvoice || items.length === 0 || !creditNoteNumber}
              >
                + Create Credit Note
              </button>
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