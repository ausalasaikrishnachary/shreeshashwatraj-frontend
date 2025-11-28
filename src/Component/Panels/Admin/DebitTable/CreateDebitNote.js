// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
// import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
// import ReusableTable from '../../../Layouts/TableLayout/DataTable';
// import './CreateDebitNote.css'; 
// import { baseurl } from '../../../BaseURL/BaseURL';
// import { useNavigate, useParams } from "react-router-dom";

// const CreateDebitNote = () => {
//   const { id } = useParams();
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [creditNoteNumber, setCreditNoteNumber] = useState("");
//   const [invoiceList, setInvoiceList] = useState([]);
//   const [selectedInvoice, setSelectedInvoice] = useState(""); 
//   const [customerData, setCustomerData] = useState(null);
//   const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
//   const [loadingInvoices, setLoadingInvoices] = useState(false);
//   const [loadingCustomer, setLoadingCustomer] = useState(false);
//   const [loadingCreditNote, setLoadingCreditNote] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editedQuantity, setEditedQuantity] = useState("");
//   const [editedProduct, setEditedProduct] = useState("");
//   const [editedBatch, setEditedBatch] = useState("");
//   const [error, setError] = useState("");
//   const [items, setItems] = useState([]);
//   const [originalItems, setOriginalItems] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [productBatches, setProductBatches] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (id) {
//       setIsEditMode(true);
//       fetchCreditNoteData(id);
//     } else {
//       fetchCreditNoteNumber();
//     }
//   }, [id]);

//   const fetchCreditNoteNumber = async () => {
//     try {
//       setLoadingCreditNote(true);
//       const response = await axios.get(`${baseurl}/api/next-debitnote-number`);
//       const nextNumber = response?.data?.nextCreditNoteNumber;
//       setCreditNoteNumber(nextNumber || "DNOTE001");
//     } catch (error) {
//       setCreditNoteNumber("DNOTE001");
//     } finally {
//       setLoadingCreditNote(false);
//     }
//   };

//   const fetchCreditNoteData = async (creditNoteId) => {
//     try {
//       setLoadingCreditNote(true);
//       const response = await axios.get(`${baseurl}/transactions`);
//       const allTransactions = response.data;
//       const creditNoteData = allTransactions.find(
//         transaction => 
//           transaction.TransactionType === "DebitNote" && 
//           transaction.VoucherID.toString() === creditNoteId.toString()
//       );
//       if (!creditNoteData) throw new Error(`Debit note with ID ${creditNoteId} not found`);
      
//       setCreditNoteNumber(creditNoteData.VchNo || creditNoteData.creditNoteNumber || '');
//       setSelectedInvoice(creditNoteData.InvoiceNumber || creditNoteData.originalInvoiceNumber || '');
//       setNoteDate(creditNoteData.Date || new Date().toISOString().split('T')[0]);
      
//       let itemsData = [];
//       if (creditNoteData.items) itemsData = creditNoteData.items;
//       else if (creditNoteData.batchDetails) itemsData = creditNoteData.batchDetails;
//       else if (creditNoteData.batch_details) itemsData = creditNoteData.batch_details;

//       const itemsWithOriginal = itemsData.map(item => ({
//         ...item,
//         originalQuantity: parseFloat(item.quantity || item.originalQuantity || 0)
//       }));
      
//       setItems(itemsWithOriginal);
//       setOriginalItems(itemsWithOriginal);

//       setCustomerData({
//         business_name: creditNoteData.business_name || creditNoteData.PartyName || creditNoteData.AccountName || 'Customer',
//         email: creditNoteData.email || '',
//         mobile_number: creditNoteData.mobile_number || '',
//         gstin: creditNoteData.gstin || '',
//         account_id: creditNoteData.AccountID || '',
//         party_id: creditNoteData.PartyID || '',
//         billing_address_line1: creditNoteData.billing_address_line1 || '',
//         billing_address_line2: creditNoteData.billing_address_line2 || '',
//         billing_city: creditNoteData.billing_city || '',
//         billing_state: creditNoteData.billing_state || '',
//         billing_country: creditNoteData.billing_country || '',
//         billing_pin_code: creditNoteData.billing_pin_code || '',
//         shipping_address_line1: creditNoteData.shipping_address_line1 || '',
//         shipping_address_line2: creditNoteData.shipping_address_line2 || '',
//         shipping_city: creditNoteData.shipping_city || '',
//         shipping_state: creditNoteData.shipping_state || '',
//         shipping_country: creditNoteData.shipping_country || '',
//         shipping_pin_code: creditNoteData.shipping_pin_code || '',
//         items: itemsWithOriginal
//       });

//       const uniqueProducts = [...new Set(itemsWithOriginal.map(item => item.product))];
//       setProducts(uniqueProducts);

//       const tempProductBatches = {};
//       itemsWithOriginal.forEach(item => {
//         if (!tempProductBatches[item.product]) tempProductBatches[item.product] = new Set();
//         tempProductBatches[item.product].add(item.batch);
//       });
//       const batchesMap = {};
//       uniqueProducts.forEach(prod => {
//         batchesMap[prod] = Array.from(tempProductBatches[prod] || []);
//       });
//       setProductBatches(batchesMap);

//     } catch (error) {
//       setError("Failed to load Debit note data: " + (error.response?.data?.error || error.message));
//     } finally {
//       setLoadingCreditNote(false);
//     }
//   };

//   useEffect(() => {
//     const fetchInvoices = async () => {
//       setLoadingInvoices(true);
//       try {
//         const res = await axios.get(`${baseurl}/transactions`);
//         const salesInvoices = res.data.filter(
//           transaction => transaction.TransactionType === "Purchase"
//         );
//         setInvoiceList(salesInvoices);
//       } catch (err) {
//         setError("Failed to load invoices. Please check server.");
//         setInvoiceList([]);
//       } finally {
//         setLoadingInvoices(false);
//       }
//     };
//     fetchInvoices();
//   }, []);

//   useEffect(() => {
//     const fetchCustomerData = async () => {
//       if (selectedInvoice && !isEditMode) {
//         setLoadingCustomer(true);
//         try {
//           const res = await axios.get(`${baseurl}/transactions`);
//           const allTransactions = res.data;
//           const selectedInvoiceData = allTransactions.find(
//             transaction => 
//               transaction.TransactionType === "Purchase" && 
//               transaction.InvoiceNumber === selectedInvoice
//           );
          
//            console.log("Selected Invoice Data:", selectedInvoiceData);
//           if (selectedInvoiceData) {
//             setCustomerData({
//               business_name: selectedInvoiceData.business_name || selectedInvoiceData.PartyName || selectedInvoiceData.AccountName || 'Customer',
//               email: selectedInvoiceData.email || '',
//               mobile_number: selectedInvoiceData.mobile_number || '',
//               gstin: selectedInvoiceData.gstin || '',
//               account_id: selectedInvoiceData.AccountID || '',
//               party_id: selectedInvoiceData.PartyID || '',
//               billing_address_line1: selectedInvoiceData.billing_address_line1 || '',
//               billing_address_line2: selectedInvoiceData.billing_address_line2 || '',
//               billing_city: selectedInvoiceData.billing_city || '',
//               billing_state: selectedInvoiceData.billing_state || '',
//               billing_country: selectedInvoiceData.billing_country || '',
//               billing_pin_code: selectedInvoiceData.billing_pin_code || '',
//               shipping_address_line1: selectedInvoiceData.shipping_address_line1 || '',
//               shipping_address_line2: selectedInvoiceData.shipping_address_line2 || '',
//               shipping_city: selectedInvoiceData.shipping_city || '',
//               shipping_state: selectedInvoiceData.shipping_state || '',
//               shipping_country: selectedInvoiceData.shipping_country || '',
//               shipping_pin_code: selectedInvoiceData.shipping_pin_code || ''
//             });

//             let invoiceItems = [];
//             if (selectedInvoiceData.items) invoiceItems = selectedInvoiceData.items;
//             else if (selectedInvoiceData.batchDetails) invoiceItems = selectedInvoiceData.batchDetails;
//             else if (selectedInvoiceData.batch_details) invoiceItems = selectedInvoiceData.batch_details;

//             if (invoiceItems && Array.isArray(invoiceItems)) {
//               const itemsWithOriginal = invoiceItems.map(item => ({
//                 ...item,
//                 originalQuantity: parseFloat(item.quantity || 0)
//               }));
//               setItems(itemsWithOriginal);
//               setOriginalItems(itemsWithOriginal);

//               const uniqueProducts = [...new Set(itemsWithOriginal.map(item => item.product))];
//               setProducts(uniqueProducts);

//               const tempProductBatches = {};
//               itemsWithOriginal.forEach(item => {
//                 if (!tempProductBatches[item.product]) tempProductBatches[item.product] = new Set();
//                 tempProductBatches[item.product].add(item.batch);
//               });
//               const batchesMap = {};
//               uniqueProducts.forEach(prod => {
//                 batchesMap[prod] = Array.from(tempProductBatches[prod] || []);
//               });
//               setProductBatches(batchesMap);
//             }
//           } else {
//             setCustomerData(null);
//             setItems([]);
//           }
//         } catch (err) {
//           setCustomerData(null);
//           setItems([]);
//         } finally {
//           setLoadingCustomer(false);
//         }
//       } else if (!selectedInvoice) {
//         setCustomerData(null);
//         setItems([]);
//         setOriginalItems([]);
//         setProducts([]);
//         setProductBatches({});
//       }
//     };
//     fetchCustomerData();
//   }, [selectedInvoice, isEditMode]);

//   const formatAddress = (data, addressType) => {
//     if (!data) return 'Address not available';
//     const addressParts = [
//       data[`${addressType}_address_line1`],
//       data[`${addressType}_address_line2`],
//       data[`${addressType}_city`],
//       data[`${addressType}_pin_code`] ? `PIN: ${data[`${addressType}_pin_code`]}` : '',
//       data[`${addressType}_state`],
//       data[`${addressType}_country`]
//     ].filter(part => part && part.trim() !== '');
//     return addressParts.join(', ') || 'Address not available';
//   };

//   const calculateTotals = () => {
//     if (items.length === 0) return { taxableAmount: 0, totalGST: 0, totalIGST: 0, grandTotal: 0 };

//     const taxableAmount = items.reduce((sum, item) => sum + (parseFloat(item.quantity)||0)*(parseFloat(item.price)||0)*(1-(parseFloat(item.discount||0)/100)),0);
//     const totalIGST = items.reduce((sum,item)=>sum+(parseFloat(item.quantity)||0)*(parseFloat(item.price)||0)*(1-(parseFloat(item.discount||0)/100))*(parseFloat(item.igst||0)/100),0);
//     const totalGST = 0;
//     const grandTotal = taxableAmount + totalIGST + totalGST;
//     return { taxableAmount: taxableAmount.toFixed(2), totalGST: totalGST.toFixed(2), totalIGST: totalIGST.toFixed(2), grandTotal: grandTotal.toFixed(2) };
//   };

//   const totals = calculateTotals();

//   const handleProductChange = (e) => { setEditedProduct(e.target.value); setEditedBatch(""); };
//   const handleBatchChange = (e) => setEditedBatch(e.target.value);
//   const handleQuantityChange = (e) => setEditedQuantity(e.target.value);

//   const handleUpdateItem = (index) => {
//     const newQty = parseFloat(editedQuantity);
//     if (isNaN(newQty) || newQty<0){ window.alert("Please enter valid quantity"); return; }
//     const originalItem = originalItems.find(oi=>oi.product===editedProduct && oi.batch===editedBatch);
//     // if (editedProduct && editedBatch && !originalItem){ window.alert("No original data found"); return; }
//     // const maxQty = originalItem ? parseFloat(originalItem.originalQuantity) : Infinity;
//     // if (newQty>maxQty){ window.alert(`Quantity cannot exceed ${maxQty}`); return; }

//     const updatedItems = [...items];
//     updatedItems[index] = {...updatedItems[index], product:editedProduct, batch:editedBatch, quantity:newQty};
//     setItems(updatedItems);

//     const updatedCustomerData = {...customerData};
//     updatedCustomerData.items = updatedItems;
//     setCustomerData(updatedCustomerData);

//     setEditingIndex(null);
//     setEditedQuantity("");
//     setEditedProduct("");
//     setEditedBatch("");
//   };

//   const handleEditClick = (index, item) => { setEditingIndex(index); setEditedQuantity(item.quantity); setEditedProduct(item.product); setEditedBatch(item.batch); };
//   const handleCancelEdit = () => { setEditingIndex(null); setEditedQuantity(""); setEditedProduct(""); setEditedBatch(""); };

//   const handleDeleteItem = (index, item) => {
//     if(window.confirm(`Remove ${item.product}?`)){
//       const updatedItems = items.filter((_,i)=>i!==index);
//       setItems(updatedItems);
//       const updatedCustomerData = {...customerData}; updatedCustomerData.items=updatedItems; setCustomerData(updatedCustomerData);
//       setOriginalItems(updatedItems);
//       if(updatedItems.length>0){
//         const uniqueProducts = [...new Set(updatedItems.map(item=>item.product))]; setProducts(uniqueProducts);
//         const tempProductBatches={};
//         updatedItems.forEach(item=>{if(!tempProductBatches[item.product]) tempProductBatches[item.product]=new Set(); tempProductBatches[item.product].add(item.batch)});
//         const batchesMap={}; uniqueProducts.forEach(prod=>{batchesMap[prod]=Array.from(tempProductBatches[prod]||[])}); setProductBatches(batchesMap);
//       } else { setProducts([]); setProductBatches({}); }
//     }
//   };

// const handleCreateCreditNote = async () => {
//   try {
//     if(items.length===0 || !selectedInvoice){
//       window.alert("No items or invoice selected");
//       return;
//     }

//     const requestData = {
//       transactionType:"DebitNote",
//       VchNo:creditNoteNumber,
//       Date:noteDate,
//       InvoiceNumber:selectedInvoice,
//       PartyName:customerData?.business_name || 'Customer',
//       BasicAmount:parseFloat(totals.taxableAmount)||0,
//       TaxAmount:parseFloat(totals.totalIGST)||0,
//       TotalAmount:parseFloat(totals.grandTotal)||0,
//       TotalQty:items.reduce((sum,item)=>sum+parseFloat(item.quantity),0),
//       batchDetails:items.map(item=>({
//         product_id:item.product_id,
//         product:item.product,
//         batch:item.batch,
//         quantity:parseFloat(item.quantity)||0,
//         price:parseFloat(item.price)||0,
//         discount:parseFloat(item.discount)||0,
//         gst:parseFloat(item.gst)||0,
//         cgst:parseFloat(item.cgst)||0,
//         sgst:parseFloat(item.sgst)||0,
//         igst:parseFloat(item.igst)||0,
//         cess:parseFloat(item.cess)||0,
//         total:parseFloat(item.total)||0
//       })),
//       creditNoteNumber:creditNoteNumber,
//       originalInvoiceNumber:selectedInvoice,
//       items:items,
//       customerData:customerData
//     };

//     // 🔹 Log the request data to console
//     console.log("debit Note Request Data:", requestData);

//     let response;
//     if(isEditMode){
//       response = await axios.put(`${baseurl}/creditnoteupdate/${id}`, requestData);
//     } else {
//       response = await axios.post(`${baseurl}/transaction`, requestData);
//     }

//     console.log("Backend Response:", response.data); // 🔹 Log backend response

//     if(response.data){
//       window.alert("✅ Debit Note saved successfully!");
//       navigate("/purchase/debit-note");
//     }
//   } catch (err){
//     console.error("Error sending debit note:", err); // 🔹 Log error
//     window.alert("❌ Failed to save debit note");
//   }
// };


//   if(loadingCreditNote && isEditMode) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div><span className="ms-2">Loading debit note data...</span></div>;

//   return (
//     <div className="credit-note-wrapper">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//       <div className={`credit-note-main-content ${isCollapsed ? "collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />
//         <div className="container my-4">

//           {error && (
//             <div className="alert alert-warning alert-dismissible fade show" role="alert">
//               <strong>Warning:</strong> {error}
//               <button type="button" className="btn-close" onClick={() => setError("")}></button>
//             </div>
//           )}

//           <div className="border bg-white p-3" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
//             {/* Top header row */}
//             <div className="row g-0 align-items-start">
//               <div className="col-lg-8 col-md-7 border-end p-3">
//                 <strong>Navkar Exports</strong>
//                 <div style={{ fontSize: 13, marginTop: 6, whiteSpace: "pre-line" }}>
//                   NO.63/603 AND 64/604,NEAR JAIN TEMPLE1ST MAIN ROAD, T DASARAHALLI
//                   {"\n"}Email: akshay555.ak@gmail.com
//                   {"\n"}Phone: 09880900431
//                   {"\n"}GSTIN: 29AAMPC7994B1ZE
//                 </div>
//               </div>

//               <div className="col-lg-4 col-md-5 p-3">
//                 <div className="mb-2">
//                   <label className="form-label small mb-1">Credit Note No</label>
//                   <div className="position-relative">
//                     <input 
//                       className="form-control form-control-sm" 
//                       value={creditNoteNumber || ""} 
//                       readOnly 
//                       placeholder={loadingCreditNote ? "Loading..." : "CNOTE001"}
//                     />
//                     {loadingCreditNote && (
//                       <div className="position-absolute top-50 end-0 translate-middle-y me-2">
//                         <div className="spinner-border spinner-border-sm text-primary" role="status">
//                           <span className="visually-hidden">Loading...</span>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div className="mb-2">
//                   <label className="form-label small mb-1">Note Date</label>
//                   <input 
//                     type="date" 
//                     className="form-control form-control-sm" 
//                     value={noteDate}
//                     onChange={(e) => setNoteDate(e.target.value)}
//                   />
//                 </div>
//               <div>
//   <label className="form-label small mb-1">Invoice</label>
//   <select
//     className="form-select form-select-sm"
//     value={selectedInvoice}
//     onChange={(e) => setSelectedInvoice(e.target.value)}
//   >
//     <option value="">
//       {loadingInvoices ? "Loading invoices..." : "Select Invoice"}
//     </option>
//     {invoiceList.map((inv) => (
//       <option key={inv.VoucherID} value={inv.InvoiceNumber || inv.VchNo || inv.invoiceNumber}>
//         {inv.InvoiceNumber || inv.VchNo || inv.invoiceNumber || `Invoice ${inv.VoucherID}`}
//       </option>
//     ))}
//   </select>
//   {!loadingInvoices && invoiceList.length === 0 && (
//     <div className="text-danger small mt-1">
//       No Purchase invoices found. Please create Purchase invoices first.
//     </div>
//   )}
// </div>
//               </div>
//             </div>

//             {/* Customer Info Section */}
//             <div className="row mt-3">
//               <div className="col-md-4 border p-3">
//                 <div className="fw-bold">Customer Info</div>
//                 {loadingCustomer ? (
//                   <div className="small mt-2 text-muted">
//                     <div className="spinner-border spinner-border-sm me-2" role="status"></div>
//                     Loading customer data...
//                   </div>
//                 ) : customerData ? (
//                   <>
//                     <div className="small">Business: {customerData.business_name || 'N/A'}</div>
//                     <div className="small">Email: {customerData.email || 'N/A'}</div>
//                     <div className="small">Mobile: {customerData.mobile_number || 'N/A'}</div>
//                     <div className="small">GSTIN: {customerData.gstin || 'N/A'}</div>
//                   </>
//                 ) : (
//                   <div className="small mt-2 text-muted">Select an invoice to load customer data</div>
//                 )}
//               </div>

//               <div className="col-md-4 border p-3">
//                 <div className="fw-bold">Billing Address</div>
//                 {customerData ? (
//                   <div className="small mt-2" style={{ whiteSpace: 'pre-line' }}>
//                     {formatAddress(customerData, 'billing')}
//                   </div>
//                 ) : (
//                   <div className="small mt-2 text-muted">Billing address will appear here</div>
//                 )}
//               </div>

//               <div className="col-md-4 border p-3">
//                 <div className="fw-bold">Shipping Address</div>
//                 {customerData ? (
//                   <div className="small mt-2" style={{ whiteSpace: 'pre-line' }}>
//                     {formatAddress(customerData, 'shipping')}
//                   </div>
//                 ) : (
//                   <div className="small mt-2 text-muted">Shipping address will appear here</div>
//                 )}
//               </div>
//             </div>

//             {/* Items Table */}
//             <div className="table-responsive mt-3">
//               <table className="table table-sm table-bordered align-middle">
//                 <thead className="table-light text-center">
//                   <tr>
//                     <th>PRODUCT</th>
//                     <th>BATCH</th>
//                     <th>QTY</th>
//                     <th>PRICE</th>
//                     <th>DISCOUNT</th>
//                     <th>GST %</th>
//                     <th>IGST %</th>
//                     <th>TOTAL</th>
//                     <th>ACTION</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {(customerData?.items || items).length > 0 ? (
//                     (customerData?.items || items).map((item, index) => {
//                       const isEditing = editingIndex === index;
//                       const displayProduct = isEditing ? editedProduct : item.product;
//                       const displayBatch = isEditing ? editedBatch : item.batch;
//                       const displayQuantity = isEditing ? editedQuantity : item.quantity;
//                       const origItem = originalItems.find(oi => oi.product === displayProduct && oi.batch === displayBatch);
//                       const displayPrice = origItem ? parseFloat(origItem.price) : parseFloat(item.price);
//                       const displayDiscount = origItem ? origItem.discount : item.discount;
//                       const displayGst = origItem ? origItem.gst : item.gst;
//                       const displayIgst = origItem ? origItem.igst : item.igst;
//                       const displayTaxable = parseFloat(displayQuantity || 0) * displayPrice * (1 - parseFloat(displayDiscount || 0) / 100);
//                       const displayTotal = (displayTaxable * (1 + parseFloat(displayIgst || 0) / 100)).toFixed(2);
//                       const origForInput = originalItems.find(oi => oi.product === editedProduct && oi.batch === editedBatch);
//                       const maxForInput = origForInput ? origForInput.originalQuantity : "";
//                       const qtyNum = parseFloat(editedQuantity) || 0;
//                       const maxNumForStyle = origForInput ? parseFloat(origForInput.originalQuantity) : Infinity;
//                       const isOver = qtyNum > maxNumForStyle;
//                       const productTdClass = isEditing ? "text-start" : "ps-3 text-start";

//                       return (
//                         <tr key={item.id || index}>
//                           <td className={productTdClass}>
//                             {isEditing ? (
//                               <select 
//                                 value={editedProduct} 
//                                 onChange={handleProductChange} 
//                                 className="form-select form-select-sm"
//                               >
//                                 <option value="">Select Product</option>
//                                 {products.map(p => (
//                                   <option key={p} value={p}>{p}</option>
//                                 ))}
//                               </select>
//                             ) : (
//                               item.product
//                             )}
//                           </td>
//                           <td className={isEditing ? "text-start" : ""}>
//                             {isEditing ? (
//                               <select 
//                                 value={editedBatch} 
//                                 onChange={handleBatchChange} 
//                                 className="form-select form-select-sm"
//                               >
//                                 <option value="">Select Batch</option>
//                                 {(productBatches[editedProduct] || []).map(b => (
//                                   <option key={b} value={b}>{b}</option>
//                                 ))}
//                               </select>
//                             ) : (
//                               item.batch
//                             )}
//                           </td>
//                           <td className="text-end">
//                             {isEditing ? (
//                               <input
//                                 type="number"
//                                 className="form-control form-control-sm"
//                                 value={editedQuantity}
//                                 min="0"
//                                 max={maxForInput}
//                                 step="0.01"
//                                 onChange={handleQuantityChange}
//                                 style={{
//                                   border: isOver ? '2px solid red' : '1px solid #ced4da'
//                                 }}
//                               />
//                             ) : (
//                               item.quantity
//                             )}
//                           </td>
//                           <td className="text-end">₹{isEditing ? displayPrice.toFixed(2) : parseFloat(item.price).toFixed(2)}</td>
//                           <td className="text-end">{isEditing ? displayDiscount : item.discount}</td>
//                           <td className="text-end">{isEditing ? displayGst : item.gst}%</td>
//                           <td className="text-end">{isEditing ? displayIgst : item.igst}%</td>
//                           <td className="text-end fw-bold">
//                             ₹{displayTotal}
//                           </td>
//                           <td className="text-center">
//                             {isEditing ? (
//                               <>
//                                 <button
//                                   className="btn btn-sm btn-success me-1"
//                                   onClick={() => handleUpdateItem(index)}
//                                   title="Save changes"
//                                 >
//                                   ✅
//                                 </button>
//                                 <button
//                                   className="btn btn-sm btn-secondary"
//                                   onClick={handleCancelEdit}
//                                   title="Cancel editing"
//                                 >
//                                   ❌
//                                 </button>
//                               </>
//                             ) : (
//                               <>
//                                 <button
//                                   className="btn btn-sm btn-outline-primary me-1"
//                                   onClick={() => handleEditClick(index, item)}
//                                   title="Edit quantity"
//                                 >
//                                   ✏️
//                                 </button>
//                                 <button 
//                                   className="btn btn-sm btn-outline-danger"
//                                   title="Delete item"
//                                   onClick={() => handleDeleteItem(index, item)}
//                                 >
//                                   🗑️
//                                 </button>
//                               </>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan="9" className="text-center text-muted">
//                         {selectedInvoice ? "No items found for this invoice" : "Select an invoice to view items"}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Note + totals section */}
//             <div className="row mt-3">
//               <div className="col-md-8">
//                 <textarea className="form-control" rows="5" placeholder="Note" defaultValue={""} />
//               </div>
//               <div className="col-md-4">
//                 <div className="border p-2 d-flex flex-column" style={{ minHeight: 120 }}>
//                   <div className="d-flex justify-content-between">
//                     <div>Taxable Amount</div>
//                     <div className="text-end">₹{totals.taxableAmount}</div>
//                   </div>
//                   <div className="d-flex justify-content-between">
//                     <div>Total IGST</div>
//                     <div className="text-end">₹{totals.totalIGST}</div>
//                   </div>
//                   <div className="d-flex justify-content-between align-items-center mt-2">
//                     <div style={{ width: "55%" }}>
//                       <select className="form-select form-select-sm">
//                         <option>Select Additional Charges</option>
//                       </select>
//                     </div>
//                     <div className="text-end" style={{ width: "40%" }}>
//                       <div className="fw-bold">Grand Total</div>
//                       <div className="fs-5 fw-bold">₹{totals.grandTotal}</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Terms and signature */}
//             <div className="row mt-3">
//               <div className="col-md-8 border p-3">
//                 <label className="form-label small">Terms and Condition</label>
//                 <textarea className="form-control" rows="4" placeholder="Terms and Condition" />
//               </div>
//               <div className="col-md-4 border p-3 d-flex flex-column justify-content-between">
//                 <div>For</div>
//                 <div className="mt-3">Authorized Signatory</div>
//               </div>
//             </div>

//             {/* Button */}
//             <div className="d-flex justify-content-end mt-3">
//               <button 
//                 className="btn btn-success"
//                 onClick={handleCreateCreditNote}
//                 disabled={!selectedInvoice || items.length === 0 || !creditNoteNumber}
//               >
//                 {isEditMode ? "📝 Update Credit Note" : "+ Create Credit Note"}
//               </button>
//             </div>
//           </div>

//           {/* Credit Notes Table */}
//           <ReusableTable
//             title="Credit Notes"
//             initialEntriesPerPage={10}
//             searchPlaceholder="Search debit notes..."
//             showSearch={true}
//             showEntriesSelector={true}
//             showPagination={true}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateDebitNote;

import React from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import ItemsTable from "./DebitNoteItemsTable";
import CustomerInfo from "./DebitNoteCustomerInfo";
import useCreditNoteLogic from "./useCreditNoteLogic";
import "./CreateDebitNote.css";

const CreateDebitNote = () => {
  const {
    // Layout
    isCollapsed,
    setIsCollapsed,

    // Error
    error,

    // Header fields
    creditNoteNumber,
    noteDate,
    setNoteDate,
    selectedInvoice,
    setSelectedInvoice,

    // Invoice list
    invoiceList,
    loadingInvoices,

    // Customer
    loadingCustomer,
    customerData,

    // Items
    items,
    products,
    productBatches,

    // Edit states
    editingIndex,
    editedProduct,
    editedBatch,
    editedQuantity,

    // Totals
    totals,

    // Actions
    handleEditClick,
    handleCancelEdit,
    handleQuantityChange,
    handleProductChange,
    handleBatchChange,
    handleUpdateItem,
    handleDeleteItem,
    handleCreateCreditNote,
  } = useCreditNoteLogic();

  return (
    <div className="credit-note-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`credit-note-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="container my-4">

          {/* ERROR WARNING */}
          {error && (
            <div className="alert alert-warning alert-dismissible fade show">
              <strong>Warning:</strong> {error}
            </div>
          )}

          {/* MAIN BLOCK */}
          <div className="border bg-white p-3" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>

            {/* INVOICE HEADER */}
            <div className="row g-0 align-items-start">

              {/* LEFT */}
              <div className="col-lg-8 col-md-7 border-end p-3">
                <strong>Navkar Exports</strong>
                <div style={{ fontSize: 13, marginTop: 6, whiteSpace: "pre-line" }}>
                  NO.63/603 AND 64/604, NEAR JAIN TEMPLE, T DASARAHALLI{"\n"}
                  Email: akshay555.ak@gmail.com{"\n"}
                  Phone: 09880900431{"\n"}
                  GSTIN: 29AAMPC7994B1ZE
                </div>
              </div>

              {/* RIGHT */}
              <div className="col-lg-4 col-md-5 p-3">
                <label className="form-label small">Credit Note No</label>
                <input
                  className="form-control form-control-sm"
                  value={creditNoteNumber}
                  readOnly
                />

                <label className="form-label small mt-2">Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                />

                <label className="form-label small mt-2">Invoice</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedInvoice}
                  onChange={(e) => setSelectedInvoice(e.target.value)}
                >
                  <option value="">
                    {loadingInvoices ? "Loading..." : "Select Invoice"}
                  </option>

                  {invoiceList.map((inv) => (
                    <option key={inv.VoucherID} value={inv.InvoiceNumber}>
                      {inv.InvoiceNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CUSTOMER INFO */}
            <CustomerInfo
              customerData={customerData}
              loadingCustomer={loadingCustomer}
            />

            {/* ITEMS TABLE */}
            <ItemsTable
              items={items}
              products={products}
              productBatches={productBatches}
              editingIndex={editingIndex}
              editedProduct={editedProduct}
              editedBatch={editedBatch}
              editedQuantity={editedQuantity}
              handleEditClick={handleEditClick}
              handleCancelEdit={handleCancelEdit}
              handleQuantityChange={handleQuantityChange}
              handleProductChange={handleProductChange}
              handleBatchChange={handleBatchChange}
              handleUpdateItem={handleUpdateItem}
              handleDeleteItem={handleDeleteItem}
            />

            {/* TOTALS */}
            <div className="row mt-3">
              <div className="col-md-8">
                <textarea className="form-control" rows="4" placeholder="Note" />
              </div>

              <div className="col-md-4 border p-2">
                <div className="d-flex justify-content-between">
                  <span>Taxable Amount</span>
                  <span>₹{totals.taxableAmount}</span>
                </div>

                <div className="d-flex justify-content-between">
                  <span>Total IGST</span>
                  <span>₹{totals.totalIGST}</span>
                </div>

                <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                  <span>Grand Total</span>
                  <span>₹{totals.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-success"
                onClick={handleCreateCreditNote}
                disabled={!selectedInvoice || items.length === 0}
              >
                + Create Credit Note
              </button>
            </div>
          </div>

          {/* CREDIT NOTES TABLE */}
          <ReusableTable title="Credit Notes" />

        </div>
      </div>
    </div>
  );
};

export default CreateDebitNote;