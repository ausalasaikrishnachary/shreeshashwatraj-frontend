// import React, { useState, useEffect, useRef } from 'react';
// import { Container, Row, Col, Button, Alert, Modal } from 'react-bootstrap';
// import './Period_InvoicePDFPreview.css';
// import { FaFilePdf, FaEdit, FaArrowLeft, FaRegFileAlt, FaSave, FaQrcode } from "react-icons/fa";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { baseurl } from "../../../BaseURL/BaseURL";
// import ReceiptModal_preview from './ReceiptModal_preview';
// import InvoicePreview_preview from './InvoicePreview_preview';
// import { QRCodeCanvas } from "qrcode.react";

// const Period_InvoicePDFPreview = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const location = useLocation();
  
//   // State management
//   const [invoiceData, setInvoiceData] = useState(null);
//   const [paymentData, setPaymentData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [paymentLoading, setPaymentLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [paymentError, setPaymentError] = useState(null);
//   const [downloading, setDownloading] = useState(false);
//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [generating, setGenerating] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [isEditing, setIsEditing] = useState(false); 
//   const [editableNote, setEditableNote] = useState('');
//   const [editableDescriptions, setEditableDescriptions] = useState({});
//   const [fromPeriod, setFromPeriod] = useState(false);
//   const [periodInvoiceData, setPeriodInvoiceData] = useState(null);
//   const [editableOrderMode, setEditableOrderMode] = useState('');
//   const [showQRModal, setShowQRModal] = useState(false); // State for QR code modal
//   const [qrCodeData, setQRCodeData] = useState(''); // State to store QR code data
  
//   // Receipt form data
//   const [receiptFormData, setReceiptFormData] = useState({
//     receiptNumber: '',
//     retailerId: '',
//     amount: '',
//     currency: 'INR',
//     paymentMethod: 'Direct Deposit',
//     receiptDate: new Date().toISOString().split('T')[0],
//     note: '',
//     bankName: '',
//     transactionDate: '',
//     reconciliationOption: 'Do Not Reconcile',
//     retailerMobile: '',
//     retailerEmail: '',
//     retailerGstin: '',
//     retailerBusinessName: '',
//     invoiceNumber: '',
//     transactionProofFile: null,
//     product_id: '',
//     batch_id: '',
//     TransactionType: 'Receipt'
//   });
  
//   const [isCreatingReceipt, setIsCreatingReceipt] = useState(false);

// const transformPeriodDataToInvoiceFormat = (periodData) => {
//   const accountDetails = periodData.fullAccountDetails || periodData.customerInfo?.account_details;
//   const orderNumber = periodData.orderNumber || periodData.originalOrder?.order_number;
//   const orderMode = periodData.order_mode || periodData.originalOrder?.order_mode || "Pakka";
  
//   let totalTaxableAmount = 0;
//   let totalTaxAmount = 0;
//   let totalGrandTotal = 0;
  
//   const items = (periodData.selectedItems || []).map((item, index) => {
//     const itemTaxableAmount = parseFloat(item.taxable_amount) || 0;
//     const itemTaxAmount = parseFloat(item.tax_amount) || 0;
//     const itemTotal = parseFloat(item.item_total) || 0;
//     const quantity = parseFloat(item.quantity) || 0;
//     const price = parseFloat(item.price) || 0;
//     const discount = parseFloat(item.discount_percentage) || 0;
//     const gst = parseFloat(item.tax_percentage) || 0;
//     const cgst = parseFloat(item.cgst_percentage) || 0;
//     const sgst = parseFloat(item.sgst_percentage) || 0;
    
//     // Add to totals
//     totalTaxableAmount += itemTaxableAmount;
//     totalTaxAmount += itemTaxAmount;
//     totalGrandTotal += itemTotal;
    
//     return {
//       id: index + 1,
//       product: item.item_name || `Item ${index + 1}`,
//       product_id: item.product_id || '',
//       quantity: quantity,
//       price: price,
//       discount: discount,
//       gst: gst,
//       cgst: cgst,
//       sgst: sgst,
//       igst: 0,
//       cess: 0,
//       total: itemTotal.toFixed(2),
//       batch: '',
//       batch_id: item.batch_id || '',
//       assigned_staff: item.assigned_staff || periodData.assigned_staff || 'N/A',
//       staff_incentive: item.staff_incentive || 0,
//       taxable_amount: itemTaxableAmount, 
//       tax_amount: itemTaxAmount 
//     };
//   });
  
//   const taxableAmount = parseFloat(periodData.selectedItemsTotal?.taxableAmount) || totalTaxableAmount;
//   const taxAmount = parseFloat(periodData.selectedItemsTotal?.taxAmount) || totalTaxAmount;
//   const grandTotal = parseFloat(periodData.selectedItemsTotal?.grandTotal) || totalGrandTotal;
  
  
//   return {
//     invoiceNumber: periodData.invoiceNumber || `INV${Date.now().toString().slice(-6)}`,
//     invoiceDate: periodData.invoiceDate || new Date().toISOString().split('T')[0],
//     validityDate: periodData.validityDate || 
//                   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
//     orderNumber: orderNumber,
//     originalOrderNumber: orderNumber,
//     order_mode: orderMode,
    
//     companyInfo: periodData.companyInfo || {
//       name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
//       address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
//       email: "sumukhusr7@gmail.com",
//       phone: "3456549876543",
//       gstin: "29AABCD0503B1ZG",
//       state: "Karnataka"
//     },
    
//     supplierInfo: {
//       name: accountDetails?.name || periodData.customerInfo?.name || periodData.originalOrder?.customer_name || 'Customer',
//       businessName: accountDetails?.business_name || periodData.customerInfo?.businessName || periodData.originalOrder?.customer_name || 'Business',
//       gstin: accountDetails?.gstin || periodData.customerInfo?.gstin || '',
//       state: accountDetails?.billing_state || periodData.customerInfo?.state || '',
//       id: periodData.customerInfo?.id || '',
//       email: accountDetails?.email || '',
//       phone: accountDetails?.phone_number || accountDetails?.mobile_number || '',
//       pan: accountDetails?.pan || '',
//       fullDetails: accountDetails
//     },
    
//     billingAddress: accountDetails ? {
//       addressLine1: accountDetails.billing_address_line1 || "Address not specified",
//       addressLine2: accountDetails.billing_address_line2 || "",
//       city: accountDetails.billing_city || "City not specified",
//       pincode: accountDetails.billing_pin_code || "000000",
//       state: accountDetails.billing_state || "Karnataka",
//       country: accountDetails.billing_country || "India",
//       gstin: accountDetails.billing_gstin || accountDetails.gstin || "",
//       branch_name: accountDetails.billing_branch_name || ""
//     } : periodData.billingAddress || {
//       addressLine1: periodData.originalOrder?.billing_address || "Address not specified",
//       addressLine2: "",
//       city: periodData.originalOrder?.billing_city || "City not specified",
//       pincode: periodData.originalOrder?.billing_pincode || "000000",
//       state: periodData.originalOrder?.billing_state || "Karnataka"
//     },
    
//     shippingAddress: accountDetails ? {
//       addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1 || "Address not specified",
//       addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || "",
//       city: accountDetails.shipping_city || accountDetails.billing_city || "City not specified",
//       pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code || "000000",
//       state: accountDetails.shipping_state || accountDetails.billing_state || "Karnataka",
//       country: accountDetails.shipping_country || accountDetails.billing_country || "India",
//       gstin: accountDetails.shipping_gstin || accountDetails.gstin || "",
//       branch_name: accountDetails.shipping_branch_name || accountDetails.billing_branch_name || ""
//     } : periodData.shippingAddress || periodData.billingAddress || {
//       addressLine1: periodData.originalOrder?.shipping_address || "Address not specified",
//       addressLine2: "",
//       city: periodData.originalOrder?.shipping_city || "City not specified",
//       pincode: periodData.originalOrder?.shipping_pincode || "000000",
//       state: periodData.originalOrder?.shipping_state || "Karnataka"
//     },
    
//     items: items,
    
//     // Use calculated totals - ensure they are numbers before toFixed
//     taxableAmount: (typeof taxableAmount === 'number' ? taxableAmount : parseFloat(taxableAmount) || 0).toFixed(2),
//     totalGST: (typeof taxAmount === 'number' ? taxAmount : parseFloat(taxAmount) || 0).toFixed(2),
//     grandTotal: (typeof grandTotal === 'number' ? grandTotal : parseFloat(grandTotal) || 0).toFixed(2),
//     totalCess: "0.00",
    
//     note: periodData.note || "",
//     transportDetails: periodData.transportDetails || "Standard delivery",
//     additionalCharge: "",
//     additionalChargeAmount: "0.00",
    
//     // Calculate GST totals from all items
//     totalCGST: items.reduce((sum, item) => sum + (parseFloat(item.cgst) || 0), 0).toFixed(2),
//     totalSGST: items.reduce((sum, item) => sum + (parseFloat(item.sgst) || 0), 0).toFixed(2),
//     totalIGST: "0.00",
//     taxType: "CGST/SGST",
    
//     assigned_staff: periodData.assigned_staff || periodData.originalOrder?.assigned_staff || 'N/A',
//     staffid: periodData.staff_id || periodData.staffid || periodData.originalOrder?.staff_id || null,
//     staff_id: periodData.staff_id || periodData.staffid || periodData.originalOrder?.staff_id || null,
//     staff_incentive: periodData.originalOrder?.staff_incentive || 0,
    
//     accountDetails: accountDetails
//   };
// };

  
// useEffect(() => {
//   if (invoiceData) {
//     const mode = invoiceData.order_mode || "PAKKA";
//     const normalizedMode = mode.toUpperCase() === "KACHA" || mode.toUpperCase() === "PAKKA" 
//       ? mode.toUpperCase() 
//       : "PAKKA";
//     setEditableOrderMode(normalizedMode);
//   }
// }, [invoiceData]);

// const handleOrderModeChange = (value) => {
//   const normalizedValue = value.toUpperCase();
//   setEditableOrderMode(normalizedValue);
  
//   // Update invoiceData
//   if (invoiceData) {
//     setInvoiceData(prev => ({
//       ...prev,
//       order_mode: normalizedValue
//     }));
//   }
// };

//   // Function to generate QR code data
//  // Replace the generateQRCodeData function with this:

// // Function to generate QR code data in mobile-friendly format
// const generateQRCodeData = () => {
//   if (!invoiceData) return '';
  
//   // Option 1: Create a URL with invoice details (Best for mobile scanning)
//   const baseUrl = window.location.origin;
//   const invoiceUrl = `${baseUrl}/invoice-view/${invoiceData.invoiceNumber}`;
  
//   // Option 2: Create human-readable text format (shows directly when scanned)
//   const readableText = `
// INVOICE DETAILS
// ================
// Invoice No: ${invoiceData.invoiceNumber}
// Date: ${invoiceData.invoiceDate}
// Customer: ${invoiceData.supplierInfo?.name || 'N/A'}
// Business: ${invoiceData.supplierInfo?.businessName || 'N/A'}

// ITEMS:
// ${invoiceData.items?.map((item, index) => 
//   `${index + 1}. ${item.product || 'Item'} - Qty: ${item.quantity} × ₹${item.price} = ₹${item.total}`
// ).join('\n')}

// AMOUNT SUMMARY:
// Taxable Amount: ₹${invoiceData.taxableAmount || '0.00'}
// Total GST: ₹${invoiceData.totalGST || '0.00'}
// Grand Total: ₹${invoiceData.grandTotal || '0.00'}

// Company: ${invoiceData.companyInfo?.name || 'N/A'}
// GSTIN: ${invoiceData.companyInfo?.gstin || 'N/A'}
// Order Mode: ${invoiceData.order_mode || 'PAKKA'}
// Order No: ${invoiceData.orderNumber || 'N/A'}
//   `.trim();
  
//   // Option 3: Create a URL with encoded data
//   const encodedData = encodeURIComponent(JSON.stringify({
//     type: 'invoice',
//     invoiceNumber: invoiceData.invoiceNumber,
//     date: invoiceData.invoiceDate,
//     customer: invoiceData.supplierInfo?.name,
//     total: invoiceData.grandTotal,
//     items: invoiceData.items?.map(item => ({
//       name: item.product,
//       qty: item.quantity,
//       price: item.price,
//       total: item.total
//     }))
//   }));
  
//   return readableText;
  
// };

// const QRCodeModal = () => {
//   const [qrFormat, setQrFormat] = useState('text'); // 'text' or 'url'
  
//   const getQRCodeValue = () => {
//     if (!invoiceData) return '';
    
//     if (qrFormat === 'url') {
//       // Create a shareable URL
//       const baseUrl = window.location.origin;
//       return `${baseUrl}/invoice/${invoiceData.invoiceNumber}`;
//     } else {
//       // Create human-readable text
//       return `
// INVOICE
// =======
// Invoice: ${invoiceData.invoiceNumber}
// Date: ${invoiceData.invoiceDate}
// Customer: ${invoiceData.supplierInfo?.name || 'N/A'}

// ITEMS:
// ${invoiceData.items?.slice(0, 3).map((item, index) => 
//   `• ${item.product}: ${item.quantity} × ₹${item.price} = ₹${item.total}`
// ).join('\n')}
// ${invoiceData.items?.length > 3 ? `...and ${invoiceData.items.length - 3} more items` : ''}

// TOTAL: ₹${invoiceData.grandTotal || '0.00'}
// Mode: ${invoiceData.order_mode || 'PAKKA'}
// Order: ${invoiceData.orderNumber || 'N/A'}

// Scan with any QR scanner app
//       `.trim();
//     }
//   };
  
//   return (
//     <Modal show={showQRModal} onHide={() => setShowQRModal(false)} size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>
//           <FaQrcode className="me-2" />
//           Invoice QR Code - {invoiceData?.invoiceNumber || 'Invoice'}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <div className="mb-3">
//           <div className="btn-group w-100 mb-3">
//             <Button 
//               variant={qrFormat === 'text' ? 'primary' : 'outline-primary'}
//               onClick={() => setQrFormat('text')}
//               size="sm"
//             >
//               Text Format
//             </Button>
//             <Button 
//               variant={qrFormat === 'url' ? 'primary' : 'outline-primary'}
//               onClick={() => setQrFormat('url')}
//               size="sm"
//             >
//               URL Format
//             </Button>
//           </div>
          
//           <Alert variant="info" className="mb-3">
//             <div className="d-flex align-items-start">
//               <FaQrcode className="me-2 mt-1" />
//               <div>
//                 <strong>How to scan:</strong>
//                 <ul className="mb-0 mt-1">
//                   <li>Open camera or QR scanner app on your phone</li>
//                   <li>Point camera at this QR code</li>
//                   <li>{qrFormat === 'text' 
//                     ? 'Text will appear directly on your phone screen' 
//                     : 'Click the link to open invoice details'
//                   }</li>
//                 </ul>
//               </div>
//             </div>
//           </Alert>
//         </div>
        
//         {invoiceData ? (
//           <div className="text-center">
//             <div className="qr-code-container mb-3 p-3 bg-white rounded shadow-sm">
//               <QRCodeCanvas 
//                 value={getQRCodeValue()}
//                 size={220}
//                 level="H"
//                 includeMargin={true}
//                 renderAs="canvas"
//               />
//             </div>
            
//             <div className="qr-code-details mt-3">
//               <h6>Invoice Summary:</h6>
//               <div className="row">
//                 <div className="col-md-6">
//                   <p><strong>Invoice No:</strong> {invoiceData.invoiceNumber}</p>
//                   <p><strong>Date:</strong> {invoiceData.invoiceDate}</p>
//                   <p><strong>Customer:</strong> {invoiceData.supplierInfo?.name || 'N/A'}</p>
//                 </div>
//                 <div className="col-md-6">
//                   <p><strong>Items:</strong> {invoiceData.items?.length || 0}</p>
//                   <p><strong>Taxable Amt:</strong> ₹{invoiceData.taxableAmount || '0.00'}</p>
//                   <p><strong>Total:</strong> ₹{invoiceData.grandTotal || '0.00'}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <Alert variant="warning">
//             No invoice data available for QR code generation
//           </Alert>
//         )}
//       </Modal.Body>
//       <Modal.Footer>
//         <div className="w-100 d-flex justify-content-between">
//           <div>
//             <Button variant="outline-secondary" onClick={() => setShowQRModal(false)}>
//               Close
//             </Button>
//           </div>
//           <div>
//             <Button 
//               variant="primary"
//               onClick={() => {
//                 const canvas = document.querySelector('canvas');
//                 if (canvas) {
//                   const link = document.createElement('a');
//                   link.download = `Invoice_${invoiceData?.invoiceNumber || 'QR'}_${qrFormat}.png`;
//                   link.href = canvas.toDataURL('image/png');
//                   link.click();
//                 }
//               }}
//               className="me-2"
//             >
//               Download QR
//             </Button>
//             <Button 
//               variant="success"
//               onClick={() => {
//                 // Copy QR code data to clipboard
//                 const textToCopy = getQRCodeValue();
//                 navigator.clipboard.writeText(textToCopy)
//                   .then(() => alert('QR code text copied to clipboard!'))
//                   .catch(err => console.error('Failed to copy: ', err));
//               }}
//             >
//               Copy Text
//             </Button>
//           </div>
//         </div>
//       </Modal.Footer>
//     </Modal>
//   );
// };

//   // Function to show QR code modal
//   const handleShowQRCode = () => {
//     const data = generateQRCodeData();
//     setQRCodeData(data);
//     setShowQRModal(true);
//   };

//   // Transform API data to invoice format
// const transformApiDataToInvoiceFormat = (apiData) => {
//   console.log('Transforming API data:', apiData);
  
//   let batchDetails = [];
//   try {
//     if (apiData.batch_details && typeof apiData.batch_details === 'string') {
//       batchDetails = JSON.parse(apiData.batch_details);
//     } else if (Array.isArray(apiData.batch_details)) {
//       batchDetails = apiData.batch_details;
//     } else if (apiData.BatchDetails && typeof apiData.BatchDetails === 'string') {
//       batchDetails = JSON.parse(apiData.BatchDetails);
//     }
//   } catch (error) {
//     console.error('Error parsing batch details:', error);
//   }

//   let totalTaxableAmount = 0;
//   let totalTaxAmount = 0;
//   let totalGrandTotal = 0;

//   const items = batchDetails.map((batch, index) => {
//     const quantity = parseFloat(batch.quantity) || 0;
//     const price = parseFloat(batch.price) || 0;
//     const discount = parseFloat(batch.discount) || 0;
//     const gst = parseFloat(batch.gst) || 0;
//     const cess = parseFloat(batch.cess) || 0;
    
//     const subtotal = quantity * price;
//     const discountAmount = subtotal * (discount / 100);
//     const taxableAmount = subtotal - discountAmount;
//     const gstAmount = taxableAmount * (gst / 100);
//     const cessAmount = taxableAmount * (cess / 100);
//     const total = taxableAmount + gstAmount + cessAmount;

//     // Add to totals
//     totalTaxableAmount += taxableAmount;
//     totalTaxAmount += gstAmount;
//     totalGrandTotal += total;

//     const isSameState = parseFloat(apiData.IGSTAmount) === 0;
//     let cgst, sgst, igst;
    
//     if (isSameState) {
//       cgst = gst / 2;
//       sgst = gst / 2;
//       igst = 0;
//     } else {
//       cgst = 0;
//       sgst = 0;
//       igst = gst;
//     }

//     return {
//       id: index + 1,
//       product: batch.product || 'Product',
//       order_mode: apiData.order_mode || "Pakka",
//       description: batch.description || `Batch: ${batch.batch}`,
//       quantity: quantity,
//       price: price,
//       discount: discount,
//       gst: gst,
//       cgst: cgst,
//       sgst: sgst,
//       igst: igst,
//       cess: cess,
//       total: total.toFixed(2),
//       batch: batch.batch || '',
//       batch_id: batch.batch_id || '',
//       product_id: batch.product_id || '',
//       taxable_amount: taxableAmount // Add taxable amount
//     };
//   }) || [];

//   // Use calculated totals or fallback to API data
//   const taxableAmount = totalTaxableAmount || parseFloat(apiData.BasicAmount) || parseFloat(apiData.Subtotal) || 0;
//   const totalGST = totalTaxAmount || parseFloat(apiData.TaxAmount) || (parseFloat(apiData.IGSTAmount) + parseFloat(apiData.CGSTAmount) + parseFloat(apiData.SGSTAmount)) || 0;
//   const grandTotal = totalGrandTotal || parseFloat(apiData.TotalAmount) || 0;

//   return {
//     voucherId: apiData.VoucherID,
//     invoiceNumber: apiData.InvoiceNumber || `INV${apiData.VoucherID}`,
//     invoiceDate: apiData.Date ? new Date(apiData.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
//     validityDate: apiData.Date ? new Date(new Date(apiData.Date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    
//     companyInfo: {
//       name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
//       address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
//       email: "sumukhuri7@gmail.com",
//       phone: "3456548878543",
//       gstin: "ZAAABCD0508B1ZG",
//       state: "Karnataka"
//     },
    
//     supplierInfo: {
//       name: apiData.PartyName || 'Customer',
//       businessName: apiData.AccountName || 'Business',
//       gstin: apiData.gstin || '',
//       state: apiData.billing_state || apiData.BillingState || '',
//       id: apiData.PartyID || null
//     },
    
//     billingAddress: {
//       addressLine1: apiData.billing_address_line1 || apiData.BillingAddress || '',
//       addressLine2: apiData.billing_address_line2 || '',
//       city: apiData.billing_city || apiData.BillingCity || '',
//       pincode: apiData.billing_pin_code || apiData.BillingPincode || '',
//       state: apiData.billing_state || apiData.BillingState || ''
//     },
    
//     shippingAddress: {
//       addressLine1: apiData.shipping_address_line1 || apiData.ShippingAddress || apiData.billing_address_line1 || apiData.BillingAddress || '',
//       addressLine2: apiData.shipping_address_line2 || apiData.billing_address_line2 || '',
//       city: apiData.shipping_city || apiData.ShippingCity || apiData.billing_city || apiData.BillingCity || '',
//       pincode: apiData.shipping_pin_code || apiData.ShippingPincode || apiData.billing_pin_code || apiData.BillingPincode || '',
//       state: apiData.shipping_state || apiData.ShippingState || apiData.billing_state || apiData.BillingState || ''
//     },
    
//     items: items.length > 0 ? items : [{
//       id: 1,
//       product: 'Product',
//       description: 'No batch details available',
//       quantity: 1,
//       price: grandTotal,
//       discount: 0,
//       gst: parseFloat(apiData.IGSTPercentage) || 0,
//       cgst: parseFloat(apiData.CGSTPercentage) || 0,
//       sgst: parseFloat(apiData.SGSTPercentage) || 0,
//       igst: parseFloat(apiData.IGSTPercentage) || 0,
//       cess: 0,
//       total: grandTotal.toFixed(2),
//       batch: '',
//       batch_id: '',
//       product_id: '',
//       taxable_amount: grandTotal
//     }],
    
//     taxableAmount: (typeof taxableAmount === 'number' ? taxableAmount : parseFloat(taxableAmount) || 0).toFixed(2),
//     totalGST: (typeof totalGST === 'number' ? totalGST : parseFloat(totalGST) || 0).toFixed(2),
//     grandTotal: (typeof grandTotal === 'number' ? grandTotal : parseFloat(grandTotal) || 0).toFixed(2),
//     totalCess: "0.00",
    
//     note: apiData.Notes || "",
//     transportDetails: apiData.Freight && apiData.Freight !== "0.00" ? `Freight: ₹${apiData.Freight}` : "Standard delivery",
//     additionalCharge: "",
//     additionalChargeAmount: "0.00",
    
//     totalCGST: parseFloat(apiData.CGSTAmount) || 0,
//     totalSGST: parseFloat(apiData.SGSTAmount) || 0,
//     totalIGST: parseFloat(apiData.IGSTAmount) || 0,
//     taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST"
//   };
// };

//   // Transform payment data
//   const transformPaymentData = (apiData) => {
//     const salesEntry = apiData.sales || {};
//     const receiptEntries = apiData.receipts || [];
//     const creditNoteEntries = apiData.creditnotes || [];
    
//     const totalAmount = parseFloat(salesEntry.TotalAmount) || 0;
    
//     const totalPaid = receiptEntries.reduce((sum, receipt) => {
//       return sum + parseFloat(receipt.paid_amount || receipt.TotalAmount || 0);
//     }, 0);
    
//     const totalCreditNotes = creditNoteEntries.reduce((sum, creditnote) => {
//       return sum + parseFloat(creditnote.paid_amount || creditnote.TotalAmount || 0);
//     }, 0);
    
//     const balanceDue = totalAmount - totalPaid - totalCreditNotes;
    
//     const invoiceDate = new Date(salesEntry.Date);
//     const today = new Date();
//     const overdueDays = Math.max(0, Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24)));
    
//     const receipts = Array.isArray(receiptEntries) ? receiptEntries.map(receipt => ({
//       receiptNumber: receipt.VchNo || receipt.receipt_number || 'N/A',
//       paidAmount: parseFloat(receipt.paid_amount || receipt.TotalAmount || 0),
//       paidDate: receipt.Date || receipt.paid_date || '',
//       status: receipt.status || 'Paid',
//       type: 'receipt'
//     })) : [];
    
//     const creditnotes = Array.isArray(creditNoteEntries) ? creditNoteEntries.map(creditnote => ({
//       receiptNumber: creditnote.VchNo || 'CNOTE',
//       paidAmount: parseFloat(creditnote.paid_amount || creditnote.TotalAmount || 0),
//       paidDate: creditnote.Date || creditnote.paid_date || '',
//       status: 'Credit',
//       type: 'credit_note'
//     })) : [];
    
//     let status = 'Pending';
//     if (balanceDue === 0) {
//       status = 'Paid';
//     } else if (totalPaid > 0 || totalCreditNotes > 0) {
//       status = 'Partial';
//     }
    
//     return {
//       invoice: {
//         invoiceNumber: salesEntry.InvoiceNumber || 'N/A',
//         invoiceDate: salesEntry.Date || '',
//         totalAmount: totalAmount,
//         overdueDays: overdueDays
//       },
//       receipts: receipts,
//       creditnotes: creditnotes,
//       summary: {
//         totalPaid: totalPaid,
//         totalCreditNotes: totalCreditNotes,
//         balanceDue: balanceDue,
//         status: status
//       }
//     };
//   };

//   // Fetch transaction data
//   const fetchTransactionData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log('Fetching transaction data for ID:', id);
//       const apiUrl = `${baseurl}/transactions/${id}`;
      
//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const result = await response.json();
      
//       if (result.success && result.data) {
//         const apiData = result.data;
//         const transformedData = transformApiDataToInvoiceFormat(apiData);
//         setInvoiceData(transformedData);
        
//         // Initialize editable descriptions and note
//         const descObj = {};
//         transformedData.items.forEach((item, index) => {
//           descObj[item.id || index] = item.description || '';
//         });
//         setEditableDescriptions(descObj);
//         setEditableNote(transformedData.note || '');
        
//       } else if (result.VoucherID) {
//         const transformedData = transformApiDataToInvoiceFormat(result);
//         setInvoiceData(transformedData);
        
//         // Initialize editable descriptions and note
//         const descObj = {};
//         transformedData.items.forEach((item, index) => {
//           descObj[item.id || index] = item.description || '';
//         });
//         setEditableDescriptions(descObj);
//         setEditableNote(transformedData.note || '');
//       } else {
//         throw new Error(result.message || 'No valid data received from API');
//       }
//     } catch (error) {
//       console.error('Error fetching transaction:', error);
//       setError(`API Error: ${error.message}`);
      
//       const savedData = localStorage.getItem('previewInvoice');
//       if (savedData) {
//         try {
//           const data = JSON.parse(savedData);
//           setInvoiceData(data);
//           setError(null);
//         } catch (parseError) {
//           console.error('Error parsing localStorage data:', parseError);
//         }
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch payment data
//   const fetchPaymentData = async (invoiceNumber) => {
//     try {
//       setPaymentLoading(true);
//       setPaymentError(null);
      
//       console.log('Fetching payment data for invoice:', invoiceNumber);
//       const response = await fetch(`${baseurl}/invoices/${invoiceNumber}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const result = await response.json();
      
//       if (result.success && result.data) {
//         const transformedData = transformPaymentData(result.data);
//         setPaymentData(transformedData);
//       } else {
//         throw new Error(result.message || 'No payment data received');
//       }
//     } catch (error) {
//       console.error('Error fetching payment data:', error);
//       setPaymentError(error.message);
//       if (invoiceData) {
//         const fallbackPaymentData = {
//           invoice: {
//             invoiceNumber: invoiceData.invoiceNumber,
//             invoiceDate: invoiceData.invoiceDate,
//             totalAmount: parseFloat(invoiceData.grandTotal) || 0,
//             overdueDays: 0
//           },
//           receipts: [],
//           summary: {
//             totalPaid: 0,
//             balanceDue: parseFloat(invoiceData.grandTotal) || 0,
//             status: 'Pending'
//           }
//         };
//         setPaymentData(fallbackPaymentData);
//       }
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   // Fetch next receipt number
//   const fetchNextReceiptNumber = async () => {
//     try {
//       const response = await fetch(`${baseurl}/api/next-receipt-number`);
//       if (response.ok) {
//         const data = await response.json();
//         setReceiptFormData(prev => ({
//           ...prev,
//           receiptNumber: data.nextReceiptNumber
//         }));
//       } else {
//         await generateFallbackReceiptNumber();
//       }
//     } catch (err) {
//       console.error('Error fetching next receipt number:', err);
//       await generateFallbackReceiptNumber();
//     }
//   };

//   // Generate fallback receipt number
//   const generateFallbackReceiptNumber = async () => {
//     try {
//       const response = await fetch(`${baseurl}/api/last-receipt`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.lastReceiptNumber) {
//           const lastNumber = data.lastReceiptNumber;
//           const numberMatch = lastNumber.match(/REC(\d+)/);
//           if (numberMatch) {
//             const nextNum = parseInt(numberMatch[1], 10) + 1;
//             const fallbackReceiptNumber = `REC${nextNum.toString().padStart(3, '0')}`;
//             setReceiptFormData(prev => ({
//               ...prev,
//               receiptNumber: fallbackReceiptNumber
//             }));
//             return;
//           }
//         }
//       }
//       setReceiptFormData(prev => ({
//         ...prev,
//         receiptNumber: 'REC001'
//       }));
//     } catch (err) {
//       setReceiptFormData(prev => ({
//         ...prev,
//         receiptNumber: 'REC001'
//       }));
//     }
//   };

//   // Calculate GST breakdown
//   const calculateGSTBreakdown = () => {
//     if (!invoiceData || !invoiceData.items) return { totalCGST: 0, totalSGST: 0, totalIGST: 0 };
    
//     const totalCGST = invoiceData.items.reduce((sum, item) => {
//       const quantity = parseFloat(item.quantity) || 0;
//       const price = parseFloat(item.price) || 0;
//       const discount = parseFloat(item.discount) || 0;
//       const cgstRate = parseFloat(item.cgst) || 0;
      
//       const subtotal = quantity * price;
//       const discountAmount = subtotal * (discount / 100);
//       const amountAfterDiscount = subtotal - discountAmount;
//       const cgstAmount = amountAfterDiscount * (cgstRate / 100);
      
//       return sum + cgstAmount;
//     }, 0);
    
//     const totalSGST = invoiceData.items.reduce((sum, item) => {
//       const quantity = parseFloat(item.quantity) || 0;
//       const price = parseFloat(item.price) || 0;
//       const discount = parseFloat(item.discount) || 0;
//       const sgstRate = parseFloat(item.sgst) || 0;
      
//       const subtotal = quantity * price;
//       const discountAmount = subtotal * (discount / 100);
//       const amountAfterDiscount = subtotal - discountAmount;
//       const sgstAmount = amountAfterDiscount * (sgstRate / 100);
      
//       return sum + sgstAmount;
//     }, 0);
    
//     const totalIGST = invoiceData.items.reduce((sum, item) => {
//       const quantity = parseFloat(item.quantity) || 0;
//       const price = parseFloat(item.price) || 0;
//       const discount = parseFloat(item.discount) || 0;
//       const igstRate = parseFloat(item.igst) || 0;
      
//       const subtotal = quantity * price;
//       const discountAmount = subtotal * (discount / 100);
//       const amountAfterDiscount = subtotal - discountAmount;
//       const igstAmount = amountAfterDiscount * (igstRate / 100);
      
//       return sum + igstAmount;
//     }, 0);
    
//     return {
//       totalCGST: totalCGST.toFixed(2),
//       totalSGST: totalSGST.toFixed(2),
//       totalIGST: totalIGST.toFixed(2)
//     };
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//     setEditableNote(invoiceData?.note || '');
    
//     const descObj = {};
//     invoiceData?.items.forEach((item, index) => {
//       descObj[item.id || index] = item.description || '';
//     });
//     setEditableDescriptions(descObj);
//   };

//   // Handle note change
//   const handleNoteChange = (value) => {
//     setEditableNote(value);
//   };

//   // Handle description change
//   const handleDescriptionChange = (itemId, value) => {
//     setEditableDescriptions(prev => ({
//       ...prev,
//       [itemId]: value
//     }));
//   };

//   // Handle save note and descriptions
//   const handleSaveChanges = async () => {
//     try {
//       setSaving(true);
//       setErrorMessage('');
//       setSuccessMessage('');

//       if (!invoiceData) {
//         throw new Error('No invoice data available');
//       }

//       // Prepare updated items with descriptions
//       const updatedItems = invoiceData.items.map((item, index) => ({
//         ...item,
//         description: editableDescriptions[item.id || index] || item.description || ''
//       }));

//       // Update local state
//       const updatedInvoiceData = {
//         ...invoiceData,
//         note: editableNote,
//         items: updatedItems,
//          order_mode: editableOrderMode // Add this
//       };
      
//       setInvoiceData(updatedInvoiceData);
      
//       // Exit edit mode
//       setIsEditing(false);
      
//       setSuccessMessage('Changes saved successfully!');
//       setTimeout(() => setSuccessMessage(null), 3000);
      
//     } catch (error) {
//       console.error('Error saving changes:', error);
//       setErrorMessage('Failed to save changes: ' + error.message);
//       setTimeout(() => setErrorMessage(null), 5000);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Handle cancel edit
//   const handleCancelEdit = () => {
//     setIsEditing(false);
//     setEditableNote(invoiceData?.note || '');
//     const descObj = {};
//     invoiceData?.items.forEach((item, index) => {
//       descObj[item.id || index] = item.description || '';
//     });
//     setEditableDescriptions(descObj);
//   };

// const handleGenerateInvoice = async () => {
//   try {
//     setGenerating(true);
//     setErrorMessage('');
//     setSuccessMessage('');
    
//     const firstDescription = editableDescriptions[invoiceData?.items[0]?.id || 0] || 
//                             invoiceData?.items[0]?.description || '';

//     // CRITICAL FIX: Get order_mode from local state, not from periodInvoiceData
//     const orderMode = editableOrderMode || 
//                       periodInvoiceData?.order_mode || 
//                       periodInvoiceData?.originalOrder?.order_mode || 
//                       "PAKKA";
    
//     console.log("🎯 Order Mode for invoice generation:", orderMode);
    
//     if (fromPeriod && periodInvoiceData) {
//       const selectedItems = periodInvoiceData.selectedItems || [];
//       const selectedItemIds = periodInvoiceData.selectedItemIds || periodInvoiceData.selected_item_ids || [];
      
//       if (!selectedItems || selectedItems.length === 0) {
//         throw new Error('No selected items found for invoice generation');
//       }
      
//       const accountDetails = periodInvoiceData.fullAccountDetails || 
//                             periodInvoiceData.customerInfo?.account_details;
      
//       const orderNumber = periodInvoiceData.orderNumber || periodInvoiceData.originalOrder?.order_number;
      
//       // Get description from editableDescriptions or use first item description
//       const firstItemDescription = editableDescriptions[invoiceData?.items[0]?.id || 0] || 
//                                   selectedItems[0]?.description || '';
      
//       // Get assigned_staff from periodInvoiceData
//       const assignedStaff = periodInvoiceData.assigned_staff || 
//                            periodInvoiceData.originalOrder?.assigned_staff || 
//                            'N/A';
      
//       // Get staff_id/staffid from periodInvoiceData
//       const staffId = periodInvoiceData.staff_id || 
//                      periodInvoiceData.staffid || 
//                      periodInvoiceData.originalOrder?.staff_id || 
//                      null;
      
//       // Calculate totals by SUMMING ALL ITEMS from database
//       let taxableAmount = 0;
//       let totalGST = 0;
//       let grandTotal = 0;
//       let totalDiscount = 0;
      
//       // Loop through all items and sum their values from DB
//       selectedItems.forEach(item => {
//         // Get values from database (these already have proper calculations)
//         const itemTaxableAmount = parseFloat(item.taxable_amount) || 0;
//         const itemTaxAmount = parseFloat(item.tax_amount) || 0;
//         const itemTotal = parseFloat(item.item_total) || 0;
//         const itemDiscountAmount = parseFloat(item.discount_amount) || 0;
        
//         if (orderMode.toUpperCase() === "KACHA") {
//           // For KACHA mode, GST should be 0
//           taxableAmount += itemTaxableAmount;
//           totalGST += 0;
//           grandTotal += itemTaxableAmount; // Only taxable amount
//         } else {
//           // For PAKKA mode, use original GST values from DB
//           taxableAmount += itemTaxableAmount;
//           totalGST += itemTaxAmount;
//           grandTotal += itemTotal;
//         }
        
//         totalDiscount += itemDiscountAmount;
//       });
      
//       // Debug: Log the calculated totals
//       console.log("📊 CALCULATED TOTALS FROM DATABASE:");
//       console.log("Total Items:", selectedItems.length);
//       console.log("Taxable Amount (sum of all items):", taxableAmount);
//       console.log("Total GST (sum of all items):", totalGST);
//       console.log("Grand Total (sum of all items):", grandTotal);
      
//       // Show breakdown of each item
//       selectedItems.forEach((item, index) => {
//         console.log(`Item ${index + 1}: ${item.item_name}`);
//         console.log(`  Taxable Amount: ${item.taxable_amount}`);
//         console.log(`  Tax Amount: ${item.tax_amount}`);
//         console.log(`  Item Total: ${item.item_total}`);
//       });
      
//       const payload = {
//         ...periodInvoiceData,
        
//         orderNumber: orderNumber,
//         order_number: orderNumber,
//         order_mode: orderMode.toUpperCase(), // Ensure uppercase
        
//         // Include ALL items with their individual values
//         items: selectedItems.map(item => ({
//           originalItemId: item.id,
//           product: item.item_name,
//           product_id: item.product_id,
//           description: editableDescriptions[item.id] || item.description || '',
//           quantity: parseFloat(item.quantity) || 0,
//           price: parseFloat(item.price) || 0,
//           discount: parseFloat(item.discount_percentage) || 0,
//           discount_amount: parseFloat(item.discount_amount) || 0,
//           taxable_amount: parseFloat(item.taxable_amount) || 0, // Include taxable amount
//           tax_amount: parseFloat(item.tax_amount) || 0, // Include tax amount
//           // CRITICAL: Set GST to 0 for KACHA mode
//           gst: orderMode.toUpperCase() === "KACHA" ? 0 : parseFloat(item.tax_percentage) || 0,
//           cgst: orderMode.toUpperCase() === "KACHA" ? 0 : parseFloat(item.cgst_percentage) || 0,
//           sgst: orderMode.toUpperCase() === "KACHA" ? 0 : parseFloat(item.sgst_percentage) || 0,
//           igst: 0,
//           cess: 0,
//           total: orderMode.toUpperCase() === "KACHA" 
//             ? parseFloat(item.taxable_amount) || 0  // Use taxable amount for KACHA
//             : parseFloat(item.item_total) || 0,     // Use total with GST for PAKKA
//           batch: '',
//           batch_id: item.batch_id || '',
//           item_total: parseFloat(item.item_total) || 0 // Keep original item total
//         })),

//         originalOrderNumber: orderNumber,
//         originalOrderId: periodInvoiceData.originalOrderId,
//         selectedItemIds: selectedItemIds,
        
//         // Use our calculated totals that SUM ALL ITEMS
//         taxableAmount: taxableAmount,
//         totalGST: totalGST,
//         totalCess: 0,
//         grandTotal: grandTotal,
//         totalDiscount: totalDiscount,
        
//         // Also send individual sums for verification
//         calculatedTotals: {
//           totalTaxableAmount: taxableAmount,
//           totalTaxAmount: totalGST,
//           totalGrandTotal: grandTotal,
//           totalDiscountAmount: totalDiscount,
//           itemCount: selectedItems.length
//         },
        
//         // Add BasicAmount for voucher table
//         BasicAmount: taxableAmount,
        
//         note: editableNote || periodInvoiceData.note || "",
//         note_preview: (editableNote || periodInvoiceData.note || "").substring(0, 200),
        
//         // Use the correct description from editableDescriptions
//         description_preview: firstItemDescription.substring(0, 200),
        
//         customerInfo: {
//           name: accountDetails?.name || periodInvoiceData.customerInfo?.name,
//           businessName: accountDetails?.business_name || periodInvoiceData.customerInfo?.businessName,
//           gstin: accountDetails?.gstin || periodInvoiceData.customerInfo?.gstin,
//           state: accountDetails?.billing_state || periodInvoiceData.customerInfo?.state,
//           id: periodInvoiceData.customerInfo?.id,
//           email: accountDetails?.email || '',
//           phone: accountDetails?.phone_number || accountDetails?.mobile_number || '',
//           pan: accountDetails?.pan || ''
//         },
        
//         billingAddress: accountDetails ? {
//           addressLine1: accountDetails.billing_address_line1,
//           addressLine2: accountDetails.billing_address_line2 || '',
//           city: accountDetails.billing_city,
//           pincode: accountDetails.billing_pin_code,
//           state: accountDetails.billing_state,
//           country: accountDetails.billing_country,
//           gstin: accountDetails.billing_gstin || accountDetails.gstin
//         } : periodInvoiceData.billingAddress,
        
//         shippingAddress: accountDetails ? {
//           addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1,
//           addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || '',
//           city: accountDetails.shipping_city || accountDetails.billing_city,
//           pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code,
//           state: accountDetails.shipping_state || accountDetails.billing_state,
//           country: accountDetails.shipping_country || accountDetails.billing_country,
//           gstin: accountDetails.shipping_gstin || accountDetails.gstin
//         } : periodInvoiceData.shippingAddress || periodInvoiceData.billingAddress,
        
//         type: 'sales',
//         selectedSupplierId: periodInvoiceData.customerInfo?.id || periodInvoiceData.PartyID,
//         PartyID: periodInvoiceData.customerInfo?.id || periodInvoiceData.PartyID,
//         AccountID: periodInvoiceData.customerInfo?.id || periodInvoiceData.AccountID,
//         PartyName: accountDetails?.name || periodInvoiceData.PartyName,
//         AccountName: accountDetails?.business_name || periodInvoiceData.AccountName,
        
//         // ADD THESE FIELDS TO THE PAYLOAD
//         assigned_staff: assignedStaff,
//         staffid: staffId,
//         staff_id: staffId,
        
//         isPartialInvoice: true,
//         source: 'period_component',
        
//         // Add TaxSystem field for backend
//         TaxSystem: orderMode.toUpperCase() === "KACHA" ? "KACHA_NO_GST" : "GST",
        
//         // Send explicit amount fields for voucher table
//         TotalAmount: grandTotal,
//         TaxAmount: totalGST,
//         Subtotal: taxableAmount
//       };

//       console.log("📦 ORDER MODE in payload:", payload.order_mode);
//       console.log("📦 CALCULATED TOTALS in payload:", payload.calculatedTotals);
//       console.log("📦 FULL INVOICE PAYLOAD BEING SENT:", JSON.stringify(payload, null, 2));

//       const response = await fetch(`${baseurl}/transaction`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || "Failed to generate invoice");
//       }

//       setSuccessMessage(`Invoice generated successfully! Invoice Number: ${result.invoiceNumber || payload.invoiceNumber}`);
      
//       setTimeout(() => {
//         navigate('/period');
//       }, 3000);

//     } else {
//       // Handle non-period invoice generation...
//     }
//   } catch (error) {
//     console.error("Error generating invoice:", error);
//     setErrorMessage(`Failed to generate invoice: ${error.message}`);

//     setTimeout(() => {
//       setErrorMessage(null);
//     }, 5000);
//   } finally {
//     setGenerating(false);
//   }
// };

//   // Handle download PDF
//   const handleDownloadPDF = async () => {
//     try {
//       setDownloading(true);
//       setError(null);
      
//       if (!invoiceData) {
//         throw new Error('No invoice data available');
//       }

//       let pdf;
//       let InvoicePDFDocument;
      
//       try {
//         const reactPdf = await import('@react-pdf/renderer');
//         pdf = reactPdf.pdf;
        
//         const pdfModule = await import('./InvoicePDFDocument');
//         InvoicePDFDocument = pdfModule.default;
//       } catch (importError) {
//         console.error('Error importing PDF modules:', importError);
//         throw new Error('Failed to load PDF generation libraries');
//       }

//       const gstBreakdown = calculateGSTBreakdown();
//       const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

//       let pdfDoc;
//       try {
//         pdfDoc = (
//           <InvoicePDFDocument 
//             invoiceData={invoiceData}
//             invoiceNumber={invoiceData.invoiceNumber}
//             gstBreakdown={gstBreakdown}
//             isSameState={isSameState}
//           />
//         );
//       } catch (componentError) {
//         console.error('Error creating PDF component:', componentError);
//         throw new Error('Failed to create PDF document structure');
//       }

//       let blob;
//       try {
//         blob = await pdf(pdfDoc).toBlob();
//       } catch (pdfError) {
//         console.error('Error generating PDF blob:', pdfError);
//         throw new Error('Failed to generate PDF file');
//       }
      
//       const filename = `Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;

//       const base64data = await new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.onerror = reject;
//         reader.readAsDataURL(blob);
//       });

//       try {
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 30000);

//         const storeResponse = await fetch(`${baseurl}/transactions/${id}/pdf`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             pdfData: base64data,
//             fileName: filename
//           }),
//           signal: controller.signal
//         });

//         clearTimeout(timeoutId);

//         if (!storeResponse.ok) {
//           const errorText = await storeResponse.text();
//           throw new Error(`Server error: ${storeResponse.status} - ${errorText}`);
//         }

//         const storeResult = await storeResponse.json();
        
//         if (storeResult.success) {
//           console.log('PDF stored successfully in database');
          
//           const downloadUrl = URL.createObjectURL(blob);
//           const a = document.createElement('a');
//           a.href = downloadUrl;
//           a.download = filename;
//           document.body.appendChild(a);
//           a.click();
//           document.body.removeChild(a);
//           URL.revokeObjectURL(downloadUrl);
          
//           setSuccess('PDF downloaded and stored successfully!');
//           setTimeout(() => setSuccess(false), 3000);
//         } else {
//           throw new Error(storeResult.message || 'Failed to store PDF');
//         }
//       } catch (storeError) {
//         console.error('Error storing PDF:', storeError);
        
//         const downloadUrl = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = downloadUrl;
//         a.download = filename;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(downloadUrl);
        
//         setSuccess('PDF downloaded successfully! (Not stored in database due to size limitations)');
//         setTimeout(() => setSuccess(false), 3000);
//       }

//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       setError('Failed to generate PDF: ' + error.message);
//       setTimeout(() => setError(null), 5000);
//     } finally {
//       setDownloading(false);
//     }
//   };

//   // Handle delete invoice
//   const handleDeleteInvoice = async () => {
//     if (!invoiceData || !invoiceData.voucherId) return;
    
//     try {
//       setDeleting(true);
//       setError(null);
      
//       const response = await fetch(`${baseurl}/transactions/${invoiceData.voucherId}`, {
//         method: 'DELETE',
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to delete invoice');
//       }
      
//       const result = await response.json();
      
//       setShowDeleteModal(false);
//       alert('Invoice deleted successfully!');
      
//       navigate('/sales/invoices');
      
//       console.log('Invoice deleted successfully:', result);
      
//     } catch (error) {
//       console.error('Error deleting invoice:', error);
//       setError('Failed to delete invoice: ' + error.message);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Handle open receipt modal
//   const handleOpenReceiptModal = () => {
//     if (!invoiceData) return;

//     const balanceDue = paymentData 
//       ? paymentData.summary.balanceDue 
//       : parseFloat(invoiceData.grandTotal);

//     const firstItem = invoiceData.items[0];

//     const updatedForm = {
//       retailerBusinessName: invoiceData.supplierInfo.name,
//       retailerId: invoiceData.supplierInfo.id || '',
//       amount: balanceDue,
//       invoiceNumber: invoiceData.invoiceNumber,
//       product_id: firstItem?.product_id || '',
//       batch_id: firstItem?.batch_id || '',
//       TransactionType: 'Receipt'
//     };

//     setReceiptFormData(prev => ({
//       ...prev,
//       ...updatedForm
//     }));

//     fetchNextReceiptNumber();
//     setShowReceiptModal(true);
//   };

//   // Handle close receipt modal
//   const handleCloseReceiptModal = () => {
//     setShowReceiptModal(false);
//     setIsCreatingReceipt(false);
//   };

//   // Handle receipt input change
//   const handleReceiptInputChange = (e) => {
//     const { name, value } = e.target;
//     setReceiptFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle file change
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         alert('File size should be less than 5MB');
//         return;
//       }
      
//       const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//       if (!allowedTypes.includes(file.type)) {
//         alert('Please select a valid file type (PDF, JPG, PNG, DOC, DOCX)');
//         return;
//       }
      
//       setReceiptFormData(prev => ({
//         ...prev,
//         transactionProofFile: file
//       }));
//     }
//   };

//   // Handle remove file
//   const handleRemoveFile = () => {
//     setReceiptFormData(prev => ({
//       ...prev,
//       transactionProofFile: null
//     }));
//     const fileInput = document.querySelector('input[type="file"]');
//     if (fileInput) fileInput.value = '';
//   };

//   // Handle create receipt from invoice
//   const handleCreateReceiptFromInvoice = async () => {
//     if (!receiptFormData.amount || parseFloat(receiptFormData.amount) <= 0) {
//       alert('Please enter a valid amount');
//       return;
//     }

//     try {
//       setIsCreatingReceipt(true);

//       const formDataToSend = new FormData();

//       formDataToSend.append('receipt_number', receiptFormData.receiptNumber);
//       formDataToSend.append('retailer_id', receiptFormData.retailerId);
//       formDataToSend.append('TransactionType', receiptFormData.TransactionType);
//       formDataToSend.append('retailer_name', receiptFormData.retailerBusinessName);
//       formDataToSend.append('amount', receiptFormData.amount);
//       formDataToSend.append('currency', receiptFormData.currency);
//       formDataToSend.append('payment_method', receiptFormData.paymentMethod);
//       formDataToSend.append('receipt_date', receiptFormData.receiptDate);
//       formDataToSend.append('note', receiptFormData.note);
//       formDataToSend.append('bank_name', receiptFormData.bankName);
//       formDataToSend.append('transaction_date', receiptFormData.transactionDate || '');
//       formDataToSend.append('reconciliation_option', receiptFormData.reconciliationOption);
//       formDataToSend.append('invoice_number', receiptFormData.invoiceNumber);
//       formDataToSend.append('retailer_mobile', receiptFormData.retailerMobile);
//       formDataToSend.append('retailer_email', receiptFormData.retailerEmail);
//       formDataToSend.append('retailer_gstin', receiptFormData.retailerGstin);
      
//       formDataToSend.append('product_id', receiptFormData.product_id || '');
//       formDataToSend.append('batch_id', receiptFormData.batch_id || '');
      
//       formDataToSend.append('retailer_business_name', receiptFormData.retailerBusinessName);
//       formDataToSend.append('from_invoice', 'true');

//       if (receiptFormData.transactionProofFile) {
//         formDataToSend.append('transaction_proof', receiptFormData.transactionProofFile);
//       }

//       const response = await fetch(`${baseurl}/api/receipts`, {
//         method: 'POST',
//         body: formDataToSend,
//       });

//       if (response.ok) {
//         const result = await response.json();
//         handleCloseReceiptModal();
//         alert('Receipt created successfully!');
        
//         if (invoiceData && invoiceData.invoiceNumber) {
//           fetchPaymentData(invoiceData.invoiceNumber);
//         }
        
//         if (result.id) {
//           navigate(`/receipts_view/${result.id}`);
//         }
//       } else {
//         const errorText = await response.text();
//         let errorMessage = 'Failed to create receipt. ';
//         try {
//           const errorData = JSON.parse(errorText);
//           errorMessage += errorData.error || 'Please try again.';
//         } catch {
//           errorMessage += 'Please try again.';
//         }
//         alert(errorMessage);
//       }
//     } catch (err) {
//       console.error('Error creating receipt:', err);
//       alert('Network error. Please check your connection and try again.');
//     } finally {
//       setIsCreatingReceipt(false);
//     }
//   };

//   // Payment Status Component
//   const PaymentStatus = () => {
//     if (paymentLoading) {
//       return (
//         <div className="card shadow-sm mb-3">
//           <div className="card-header bg-primary text-white">
//             <h5 className="mb-0">
//               <i className="bi bi-receipt me-2"></i>
//               Payment Status
//             </h5>
//           </div>
//           <div className="card-body">
//             <div className="text-center">
//               <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               Loading payment status...
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (!paymentData) {
//       return (
//         <div className="card shadow-sm mb-3">
//           <div className="card-header bg-primary text-white">
//             <h5 className="mb-0">
//               <i className="bi bi-receipt me-2"></i>
//               Payment Status
//             </h5>
//           </div>
//           <div className="card-body">
//             <div className="text-center text-muted">
//               <i className="bi bi-exclamation-triangle mb-2"></i>
//               <p>No payment data available</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     const { invoice, receipts, creditnotes, summary } = paymentData;

//     const safeReceipts = Array.isArray(receipts) ? receipts : [];
//     const safeCreditnotes = Array.isArray(creditnotes) ? creditnotes : [];
    
//     const formatIndianDate = (dateString) => {
//       if (!dateString) return 'N/A';
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'Invalid Date';
      
//       const day = String(date.getDate()).padStart(2, '0');
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const year = date.getFullYear();
      
//       return `${day}/${month}/${year}`;
//     };

//     const allTransactions = [
//       ...safeReceipts.map(r => ({ ...r, type: 'receipt' })),
//       ...safeCreditnotes.map(cn => ({ ...cn, type: 'credit_note' }))
//     ].sort((a, b) => new Date(a.paidDate) - new Date(b.paidDate));

//     return (
//       <div className="card shadow-sm mb-3">
//         <div className="card-header bg-primary text-white">
//           <h5 className="mb-0">
//             <i className="bi bi-receipt me-2"></i>
//             Payment Status
//           </h5>
//         </div>
//         <div className="card-body">
//           <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
//             <span className="fw-bold">Status:</span>
//             <span className={`badge ${
//               summary.status === 'Paid' ? 'bg-success' :
//               summary.status === 'Partial' ? 'bg-warning' : 'bg-danger'
//             }`}>
//               {summary.status}
//             </span>
//           </div>

//           <div className="payment-amounts mb-3">
//             <div className="d-flex justify-content-between align-items-center mb-2">
//               <span className="text-muted">
//                 <i className="bi bi-currency-rupee me-1"></i>
//                 Original Invoice:
//               </span>
//               <small className="text-muted ms-1">
//                 (On {formatIndianDate(invoice.invoiceDate)})
//               </small>
//               <span className="fw-bold text-primary">
//                 ₹{invoice.totalAmount.toFixed(2)}
//               </span>
//             </div>

//             {allTransactions.map((transaction, index) => (
//               <div 
//                 key={`${transaction.type}-${index}`} 
//                 className={`d-flex justify-content-between align-items-center mb-2 ps-3 border-start ${
//                   transaction.type === 'receipt' ? 'border-success' : 'border-warning'
//                 }`}
//               >
//                 <span className={transaction.type === 'receipt' ? 'text-success' : 'text-warning'}>
//                   <i className={`bi ${transaction.type === 'receipt' ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
//                   {transaction.type === 'receipt' ? ' Receipt:' : 'Credit Note:'}
//                 </span>
//                 <small className="text-muted ms-1">
//                   (On {formatIndianDate(transaction.paidDate)}) – {transaction.receiptNumber}
//                 </small>
//                 <span className={`fw-bold ${
//                   transaction.type === 'receipt' ? 'text-success' : 'text-warning'
//                 }`}>
//                   ₹{transaction.paidAmount.toFixed(2)}
//                 </span>
//               </div>
//             ))}

//             <div className="d-flex justify-content-between align-items-center mb-2 pt-2 border-top">
//               <span className="text-danger">
//                 <i className="bi bi-exclamation-triangle me-1"></i>
//                 Balance Due:
//               </span>
//               <span className="fw-bold text-danger">
//                 ₹{summary.balanceDue.toFixed(2)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };



//   // Use Effects
//   useEffect(() => {
//     if (location.state && location.state.invoiceData) {
//       console.log('📦 Received data from Period component:', location.state.invoiceData);
      
//       const periodData = location.state.invoiceData;
//       setPeriodInvoiceData(periodData);
//       setFromPeriod(true);
//       setLoading(false);
      
//       const transformedData = transformPeriodDataToInvoiceFormat(periodData);
//       setInvoiceData(transformedData);
      
//       // Initialize editable descriptions and note
//       const descObj = {};
//       transformedData.items.forEach((item, index) => {
//         descObj[item.id || index] = item.description || '';
//       });
//       setEditableDescriptions(descObj);
//       setEditableNote(transformedData.note || '');
      
//       if (periodData.invoiceNumber) {
//         fetchPaymentData(periodData.invoiceNumber);
//       }
//     } else {
//       console.log('🔍 Loading from transaction ID:', id);
//       fetchTransactionData(); 
//     }
//   }, [id, location]);

//   useEffect(() => {
//     if (invoiceData && invoiceData.invoiceNumber) {
//       fetchPaymentData(invoiceData.invoiceNumber);
//     }
//   }, [invoiceData]);

//   // Loading state
//   if (loading) {
//     return (
//       <div className="invoice-preview-page">
//         <div className="text-center p-5">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p className="mt-3">Loading invoice data...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error && !invoiceData) {
//     return (
//       <div className="invoice-preview-page">
//         <Container>
//           <div className="text-center p-5">
//             <Alert variant="danger">
//               <h5>Error Loading Invoice</h5>
//               <p>{error}</p>
//               <div className="mt-3">
//                 <Button variant="primary" onClick={() => window.location.reload()} className="me-2">
//                   Try Again
//                 </Button>
//                 <Button variant="secondary" onClick={() => window.history.back()}>
//                   Go Back
//                 </Button>
//               </div>
//             </Alert>
//           </div>
//         </Container>
//       </div>
//     );
//   }

//   const displayInvoiceNumber = invoiceData?.invoiceNumber || 'INV001';
//   const gstBreakdown = calculateGSTBreakdown();
//   const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

//   return (
//     <div className="invoice-preview-page">
//       {/* Action Bar */}
//       <div className="action-bar bg-white shadow-sm p-3 mb-3 sticky-top d-print-none no-print">
//         <Container fluid>
//           <div className="d-flex justify-content-between align-items-center">
//             <h4 className="mb-0">Invoice Preview - {displayInvoiceNumber}</h4>
//             <div>
//               {/* QR Code Button */}
//               <Button 
//                 variant="outline-primary" 
//                 onClick={handleShowQRCode} 
//                 className="me-2"
//               >
//                 <FaQrcode className="me-1" /> Show QR Code
//               </Button>
              
//               {fromPeriod && (
//                 <Button 
//                   variant="primary" 
//                   onClick={handleGenerateInvoice} 
//                   className="me-2"
//                   disabled={generating}
//                 >
//                   {generating ? 'Generating...' : 'Generate Invoice'}
//                 </Button>
//               )}
              
//               <Button variant="info" className="me-2 text-white" onClick={handleOpenReceiptModal}>
//                 <FaRegFileAlt className="me-1" /> Create Receipt
//               </Button>
              
//               {/* Single Edit Button for both Note and Description */}
//               {isEditing ? (
//                 <>
//                   <Button 
//                     variant="success" 
//                     onClick={handleSaveChanges} 
//                     className="me-2"
//                     disabled={saving}
//                   >
//                     {saving ? (
//                       <>
//                         <div className="spinner-border spinner-border-sm me-1" role="status">
//                           <span className="visually-hidden">Loading...</span>
//                         </div>
//                         Saving...
//                       </>
//                     ) : (
//                       <>
//                         <FaSave className="me-1" /> Save Changes
//                       </>
//                     )}
//                   </Button>
//                   <Button 
//                     variant="secondary" 
//                     onClick={handleCancelEdit}
//                   >
//                     Cancel
//                   </Button>
//                 </>
//               ) : (
//                 <Button 
//                   variant="warning" 
//                   onClick={handleEdit} 
//                   className="me-2"
//                 >
//                   <FaEdit className="me-1" /> Edit Note & Descriptions
//                 </Button>
//               )}

//               <Button 
//                 variant="danger" 
//                 onClick={handleDownloadPDF} 
//                 className="me-2"
//                 disabled={downloading || !invoiceData}
//               >
//                 {downloading ? (
//                   <>
//                     <div className="spinner-border spinner-border-sm me-1" role="status">
//                       <span className="visually-hidden">Loading...</span>
//                     </div>
//                     Generating PDF...
//                   </>
//                 ) : (
//                   <>
//                     <FaFilePdf className="me-1" /> Download PDF
//                   </>
//                 )}
//               </Button>

//               <Button variant="secondary" onClick={() => window.history.back()}>
//                 <FaArrowLeft className="me-1" /> Go Back
//               </Button>
//             </div>
//           </div>
//         </Container>
//       </div>

//       {/* Success/Error Alerts */}
//       {success && (
//         <div className="d-print-none no-print">
//           <Container fluid>
//             <Alert variant="success" className="mb-3">
//               {success}
//             </Alert>
//           </Container>
//         </div>
//       )}

//       {error && invoiceData && (
//         <div className="d-print-none no-print">
//           <Container fluid>
//             <Alert variant="warning" className="mb-3">
//               <Alert.Heading>Using Local Data</Alert.Heading>
//               <p className="mb-0">{error}</p>
//               <Button variant="outline-warning" size="sm" onClick={() => window.location.reload()} className="mt-2">
//                 Retry API Connection
//               </Button>
//             </Alert>
//           </Container>
//         </div>
//       )}

//       {successMessage && (
//         <div className="d-print-none no-print">
//           <Container fluid>
//             <Alert variant="success" className="mb-3">
//               {successMessage}
//             </Alert>
//           </Container>
//         </div>
//       )}

//       {errorMessage && (
//         <div className="d-print-none no-print">
//           <Container fluid>
//             <Alert variant="danger" className="mb-3">
//               {errorMessage}
//             </Alert>
//           </Container>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>Are you sure you want to delete invoice <strong>{displayInvoiceNumber}</strong>?</p>
//           <p className="text-danger">This action cannot be undone and will also update the stock values.</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={handleDeleteInvoice} disabled={deleting}>
//             {deleting ? (
//               <>
//                 <div className="spinner-border spinner-border-sm me-1" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//                 Deleting...
//               </>
//             ) : (
//               'Delete Invoice'
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* QR Code Modal */}
//       <QRCodeModal />

//       {/* Receipt Modal */}
//       <ReceiptModal_preview
//         show={showReceiptModal}
//         onHide={handleCloseReceiptModal}
//         receiptFormData={receiptFormData}
//         onInputChange={handleReceiptInputChange}
//         onFileChange={handleFileChange}
//         onRemoveFile={handleRemoveFile}
//         onCreateReceipt={handleCreateReceiptFromInvoice}
//         isCreatingReceipt={isCreatingReceipt}
//       />

//       {/* Main Content */}
//       <Container fluid className="invoice-preview-container">
//         <Row>
//           {/* Invoice Content */}
//           <Col lg={8}>
//             <InvoicePreview_preview
//               invoiceData={invoiceData}
//               isEditing={isEditing} // Pass combined edit state
//               editableNote={editableNote}
//               editableDescriptions={editableDescriptions}
//               onNoteChange={handleNoteChange}
//               onDescriptionChange={handleDescriptionChange}
//               gstBreakdown={gstBreakdown}
//               isSameState={isSameState}
//               onOrderModeChange={handleOrderModeChange} // Add this prop
//             />
//           </Col>

//           {/* Payment Sidebar */}
//           <Col lg={4} className="d-print-none no-print">
//             <PaymentStatus />
//           </Col>
//         </Row>
//       </Container>
//     </div>
//   );
// };

// export default Period_InvoicePDFPreview;



import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Modal, Card } from 'react-bootstrap';
import './Period_InvoicePDFPreview.css';
import { FaFilePdf, FaEdit, FaArrowLeft, FaSave, FaQrcode, FaPrint } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { baseurl } from "../../../BaseURL/BaseURL";
import InvoicePreview_preview from './InvoicePreview_preview';
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

import QRCodeGenerator from './QRCodeGenerator';
const Period_InvoicePDFPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // State management
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableNote, setEditableNote] = useState('');
  const [editableDescriptions, setEditableDescriptions] = useState({});
  const [fromPeriod, setFromPeriod] = useState(false);
  const [periodInvoiceData, setPeriodInvoiceData] = useState(null);
  const [editableOrderMode, setEditableOrderMode] = useState('');
  // const [qrData, setQrData] = useState(''); // For QR code data
  const [qrData, setQrData] = useState('');
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    gstin: "",
    state: "",
    stateCode: "",
  });

  const transformPeriodDataToInvoiceFormat = (periodData) => {
    const accountDetails = periodData.fullAccountDetails || periodData.customerInfo?.account_details;
    const orderNumber = periodData.orderNumber || periodData.originalOrder?.order_number;
    const orderMode = periodData.order_mode || periodData.originalOrder?.order_mode || "Pakka";

    const TransactionType = orderMode.toUpperCase() === "PAKKA" ? "Sales" : "stock transfer";

    let totalTaxableAmount = 0;
    let totalTaxAmount = 0;
    let totalGrandTotal = 0;
    let totalSGST = 0;
    let totalCGST = 0;
    let totalDiscountAmount = 0;
    let totalCreditCharge = 0;

    const items = (periodData.selectedItems || []).map((item, index) => {
      const flashOffer = parseInt(item.flash_offer) || 0;
      const buyQuantity = parseInt(item.buy_quantity) || 0;
      const getQuantity = parseInt(item.get_quantity) || 0;
      const stockDeductionQuantity = flashOffer === 1 ? buyQuantity + getQuantity : parseFloat(item.quantity) || 1;

      const itemTaxableAmount = parseFloat(item.taxable_amount) || 0;
      const itemTaxAmount = parseFloat(item.tax_amount) || 0;
      const itemTotal = parseFloat(item.item_total) || 0;
      const quantity = parseFloat(item.quantity) || 1;

      const netPrice = parseFloat(item.net_price) || 0;
      const editedSalePrice = parseFloat(item.edited_sale_price) || 0;
      const salePrice = parseFloat(item.sale_price) || 0;

      const price = netPrice;

      const discount = parseFloat(item.discount_percentage) || 0;
      const discountAmount = parseFloat(item.discount_amount) || 0;
      const creditCharge = parseFloat(item.credit_charge) || 0;

      const actualCGSTPercentage = parseFloat(item.cgst_percentage) || 0;
      const actualSGSTPercentage = parseFloat(item.sgst_percentage) || 0;
      const actualCGSTAmount = parseFloat(item.cgst_amount) || 0;
      const actualSGSTAmount = parseFloat(item.sgst_amount) || 0;

      totalTaxableAmount += itemTaxableAmount;
      totalTaxAmount += itemTaxAmount;
      totalGrandTotal += itemTotal;
      totalSGST += actualSGSTAmount;
      totalCGST += actualCGSTAmount;
      totalDiscountAmount += discountAmount;
      totalCreditCharge += creditCharge;

      return {
        id: index + 1,
        product: item.item_name || `Item ${index + 1}`,
        product_id: item.product_id || '',
        quantity: quantity,
        price: price,
        discount: discount,
        discount_amount: discountAmount,
        discount_amount_per_unit: parseFloat(item.discount_amount) || 0,
        gst: parseFloat(item.tax_percentage) || 0,
        hsn_code: item.hsn_code || "",
        cgst: actualCGSTPercentage,
        sgst: actualSGSTPercentage,
        cgst_amount: actualCGSTAmount,
        sgst_amount: actualSGSTAmount,

        stock_deduction_quantity: stockDeductionQuantity,
        flash_offer: flashOffer,
        buy_quantity: buyQuantity,
        get_quantity: getQuantity,
        original_quantity: parseFloat(item.quantity) || 1,
        igst: 0,
        cess: 0,
        total: itemTotal.toFixed(2),
        batch: '',
        batch_id: item.batch_id || '',
        assigned_staff: item.assigned_staff || periodData.assigned_staff || 'N/A',
        staff_incentive: item.staff_incentive || 0,
        taxable_amount: itemTaxableAmount,
        tax_amount: itemTaxAmount,
        credit_charge: creditCharge,

        net_price: netPrice,
        unit_id: item.unit_id || null,      // ← ADD THIS
        unit_name: item.unit_name || '',   // ← ADD THIS
        original_sgst_percentage: item.sgst_percentage,
        original_sgst_amount: item.sgst_amount,
        original_cgst_percentage: item.cgst_percentage,
        original_cgst_amount: item.cgst_amount,
        edited_sale_price: editedSalePrice,
        sale_price: salePrice,

      };
    });

    const taxableAmount = parseFloat(periodData.selectedItemsTotal?.taxableAmount) || totalTaxableAmount;
    const taxAmount = parseFloat(periodData.selectedItemsTotal?.taxAmount) || totalTaxAmount;
    const grandTotal = parseFloat(periodData.selectedItemsTotal?.grandTotal) || totalGrandTotal;

    return {
      TransactionType: TransactionType,

      invoiceNumber: periodData.invoiceNumber || `INV${Date.now().toString().slice(-6)}`,
      invoiceDate: periodData.invoiceDate || new Date().toISOString().split('T')[0],
      validityDate: periodData.validityDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

      orderNumber: orderNumber,
      originalOrderNumber: orderNumber,
      order_mode: orderMode,

      //   companyInfo: periodData.companyInfo || {
      //    name: "SHREE SHASHWATRAJ AGRO PVT LTD",
      // address: "Growth Center, Jasoiya, Aurangabad, Bihar, 824101",
      // email: "spmathur56@gmail.com",
      // phone: "9801049700",
      // gstin: "10AAOCS1541B1ZZ",
      // state: "Bihar",
      // stateCode: "10"
      //   },


      companyInfo: periodData.companyInfo || companyInfo,

      supplierInfo: {
        name: accountDetails?.name || periodData.customerInfo?.name || periodData.originalOrder?.customer_name || 'Customer',
        businessName: accountDetails?.business_name || periodData.customerInfo?.businessName || periodData.originalOrder?.customer_name || 'Business',
        gstin: accountDetails?.gstin || periodData.customerInfo?.gstin || '',
        state: accountDetails?.billing_state || periodData.customerInfo?.state || '',
        id: periodData.customerInfo?.id || '',
        email: accountDetails?.email || '',
        phone: accountDetails?.phone_number || accountDetails?.mobile_number || '',
        pan: accountDetails?.pan || '',
        fullDetails: accountDetails
      },

      billingAddress: accountDetails ? {
        addressLine1: accountDetails.billing_address_line1 || "Address not specified",
        addressLine2: accountDetails.billing_address_line2 || "",
        city: accountDetails.billing_city || "City not specified",
        pincode: accountDetails.billing_pin_code || "000000",
        state: accountDetails.billing_state || "Karnataka",
        country: accountDetails.billing_country || "India",
        gstin: accountDetails.billing_gstin || accountDetails.gstin || "",
        branch_name: accountDetails.billing_branch_name || ""
      } : periodData.billingAddress || {
        addressLine1: periodData.originalOrder?.billing_address || "Address not specified",
        addressLine2: "",
        city: periodData.originalOrder?.billing_city || "City not specified",
        pincode: periodData.originalOrder?.billing_pincode || "000000",
        state: periodData.originalOrder?.billing_state || "Karnataka"
      },

      shippingAddress: accountDetails ? {
        addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1 || "Address not specified",
        addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || "",
        city: accountDetails.shipping_city || accountDetails.billing_city || "City not specified",
        pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code || "000000",
        state: accountDetails.shipping_state || accountDetails.billing_state || "Karnataka",
        country: accountDetails.shipping_country || accountDetails.billing_country || "India",
        gstin: accountDetails.shipping_gstin || accountDetails.gstin || "",
        branch_name: accountDetails.shipping_branch_name || accountDetails.billing_branch_name || ""
      } : periodData.shippingAddress || periodData.billingAddress || {
        addressLine1: periodData.originalOrder?.shipping_address || "Address not specified",
        addressLine2: "",
        city: periodData.originalOrder?.shipping_city || "City not specified",
        pincode: periodData.originalOrder?.shipping_pincode || "000000",
        state: periodData.originalOrder?.shipping_state || "Karnataka"
      },

      items: items,

      flashOfferSummary: periodData.flashOfferSummary || {
        hasFlashOffer: items.some(item => item.flash_offer === 1),
        totalItemsWithFlashOffer: items.filter(item => item.flash_offer === 1).length
      },

      taxableAmount: (typeof taxableAmount === 'number' ? taxableAmount : parseFloat(taxableAmount) || 0).toFixed(2),
      totalGST: (typeof taxAmount === 'number' ? taxAmount : parseFloat(taxAmount) || 0).toFixed(2),
      grandTotal: (typeof grandTotal === 'number' ? grandTotal : parseFloat(grandTotal) || 0).toFixed(2),
      totalCess: "0.00",
      totalDiscountAmount: totalDiscountAmount.toFixed(2),
      totalCreditCharge: totalCreditCharge.toFixed(2),
      note: periodData.note || "",
      transportDetails: periodData.transportDetails || "Standard delivery",
      additionalCharge: "",
      additionalChargeAmount: "0.00",

      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalIGST: "0.00",
      taxType: "CGST/SGST",

      assigned_staff: periodData.assigned_staff || periodData.originalOrder?.assigned_staff || 'N/A',
      staffid: periodData.staff_id || periodData.staffid || periodData.originalOrder?.staff_id || null,
      staff_id: periodData.staff_id || periodData.staffid || periodData.originalOrder?.staff_id || null,
      staff_incentive: periodData.originalOrder?.staff_incentive || 0,

      accountDetails: accountDetails
    };
  };
  useEffect(() => {
    if (invoiceData) {
      const mode = invoiceData.order_mode || "PAKKA";
      const normalizedMode = mode.toUpperCase() === "KACHA" || mode.toUpperCase() === "PAKKA"
        ? mode.toUpperCase()
        : "PAKKA";
      setEditableOrderMode(normalizedMode);

      if (invoiceData.grandTotal) {
        generateQRCodeData();
      }
    }
  }, [invoiceData]);

const handleOrderModeChange = async (switchData) => {
  const { orderMode, updatedItems } = switchData;
  const normalizedValue = orderMode.toUpperCase();

  setEditableOrderMode(normalizedValue);

  // ✅ FIX: Generate new invoice number based on the new order mode
  const newTransactionType = normalizedValue === "PAKKA" ? "Sales" : "stock transfer";
  
  // Fetch new invoice number for the new transaction type
  let newInvoiceNumber = null;
  try {
    console.log(`📞 Fetching new invoice number for ${newTransactionType}...`);
    let url = `${baseurl}/next-invoice-number?transactionType=${encodeURIComponent(newTransactionType)}`;
    
    // ✅ FIX: For Sales, we MUST provide a saleType
    if (newTransactionType === "Sales") {
      // Try to get saleType from various sources
      let saleType = null;
      
      // 1. Check if periodInvoiceData has sale_type
      if (periodInvoiceData?.sale_type) {
        saleType = periodInvoiceData.sale_type;
        console.log(`✅ Using saleType from periodInvoiceData: ${saleType}`);
      }
      // 2. Check if originalOrder has sale_type
      else if (periodInvoiceData?.originalOrder?.sale_type) {
        saleType = periodInvoiceData.originalOrder.sale_type;
        console.log(`✅ Using saleType from originalOrder: ${saleType}`);
      }
      // 3. Check if invoiceData has sale_type
      else if (invoiceData?.sale_type) {
        saleType = invoiceData.sale_type;
        console.log(`✅ Using saleType from invoiceData: ${saleType}`);
      }
      // 4. Use default - "shree shashwath" from your saletypes table
      else {
        // ✅ This matches your saletypes table: sale_type = "shree shashwath", series = "SSA"
        saleType = "shree shashwath";
        console.log(`⚠️ No saleType found, using default: ${saleType}`);
      }
      
      // Add saleType to URL
      url += `&saleType=${encodeURIComponent(saleType)}`;
    }
    
    console.log(`🌐 Request URL: ${url}`);
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      newInvoiceNumber = data.nextInvoiceNumber;
      console.log(`✅ New invoice number for ${newTransactionType}:`, newInvoiceNumber);
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to fetch: ${response.status}`, errorText);
      
      // If 404 with "Sale Type not found", try alternatives
      if (response.status === 404 && errorText.includes('Sale Type not found')) {
        console.log('🔄 SaleType not found, trying alternatives...');
        
        // ✅ These match your saletypes table
        const alternativeSaleTypes = ["godown1", "godown2", "shree shashwath"];
        
        for (const altSaleType of alternativeSaleTypes) {
          console.log(`🔄 Trying alternative saleType: ${altSaleType}`);
          const altUrl = `${baseurl}/next-invoice-number?transactionType=${encodeURIComponent(newTransactionType)}&saleType=${encodeURIComponent(altSaleType)}`;
          const altResponse = await fetch(altUrl);
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            newInvoiceNumber = altData.nextInvoiceNumber;
            console.log(`✅ Received next invoice number with saleType ${altSaleType}:`, newInvoiceNumber);
            break;
          }
        }
      }
      
      // Try fallback
      if (!newInvoiceNumber) {
        newInvoiceNumber = await generateFallbackInvoiceNumber(newTransactionType);
      }
    }
  } catch (err) {
    console.error('❌ Error fetching new invoice number:', err);
    newInvoiceNumber = await generateFallbackInvoiceNumber(newTransactionType);
  }

  if (!newInvoiceNumber) {
    newInvoiceNumber = `INV${Date.now().toString().slice(-6)}`;
    console.log(`⚠️ Using fallback invoice number: ${newInvoiceNumber}`);
  }

  // ✅ IMPORTANT: Update both invoiceData and periodInvoiceData with the new invoice number
  if (updatedItems && updatedItems.length > 0 && invoiceData) {
    console.log("🔄 Received updated items with new product_ids:", updatedItems);

    // Update invoiceData with new invoice number
    const updatedInvoiceData = {
      ...invoiceData,
      order_mode: normalizedValue,
      invoiceNumber: newInvoiceNumber, // ✅ Update invoice number
      TransactionType: newTransactionType, // ✅ Update transaction type
      items: updatedItems
    };
    
    setInvoiceData(updatedInvoiceData);

    // Also update periodInvoiceData
    const updatedPeriodData = {
      ...periodInvoiceData,
      order_mode: normalizedValue,
      invoiceNumber: newInvoiceNumber, // ✅ Update invoice number
      TransactionType: newTransactionType // ✅ Update transaction type
    };
    
    setPeriodInvoiceData(updatedPeriodData);

  } else {
    // Update only order mode and invoice number
    if (invoiceData) {
      const updatedInvoiceData = {
        ...invoiceData,
        order_mode: normalizedValue,
        invoiceNumber: newInvoiceNumber, // ✅ Update invoice number
        TransactionType: newTransactionType // ✅ Update transaction type
      };
      
      setInvoiceData(updatedInvoiceData);
    }
  }
  
  // ✅ Force a re-render to update the display
  console.log(`✅ Order mode changed to ${normalizedValue}, new invoice number: ${newInvoiceNumber}`);
};

  // 1. Add state near other useState declarations
  const [transportDetails, setTransportDetails] = useState({
    transport: "",
    grNumber: "",
    vehicleNo: "",
    station: ""
  });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const res = await fetch(`${baseurl}/api/company-info`);
        const text = await res.text();

        let result;
        try {
          result = JSON.parse(text);
        } catch {
          throw new Error("Company API response is not JSON");
        }

        if (result.success && result.data) {
          const company = {
            name: result.data.company_name || "",
            address: result.data.address || "",
            email: result.data.email || "",
            phone: result.data.phone || "",
            gstin: result.data.gstin || "",
            state: result.data.state || "",
            stateCode: result.data.state_code || "",
          };

          setCompanyInfo(company);
        }
      } catch (error) {
        console.error("Company info fetch error:", error);
      }
    };

    fetchCompanyInfo();
  }, []);

  useEffect(() => {
  if (invoiceData) {
    console.log('📋 Invoice Data Updated:', {
      invoiceNumber: invoiceData.invoiceNumber,
      order_mode: invoiceData.order_mode,
      TransactionType: invoiceData.TransactionType
    });
  }
}, [invoiceData]);

  useEffect(() => {
    if (!invoiceData) return;
    if (!companyInfo.name) return;

    setInvoiceData((prev) => ({
      ...prev,
      companyInfo: companyInfo,
    }));
  }, [companyInfo]);

  // 2. Handler for transport changes
  const handleTransportChange = (newTransport) => {
    setTransportDetails(newTransport);
  };
  const transformApiDataToInvoiceFormat = (apiData) => {
    console.log('Transforming API data:', apiData);

    let batchDetails = [];
    try {
      if (apiData.batch_details && typeof apiData.batch_details === 'string') {
        batchDetails = JSON.parse(apiData.batch_details);
      } else if (Array.isArray(apiData.batch_details)) {
        batchDetails = apiData.batch_details;
      } else if (apiData.BatchDetails && typeof apiData.BatchDetails === 'string') {
        batchDetails = JSON.parse(apiData.BatchDetails);
      }
    } catch (error) {
      console.error('Error parsing batch details:', error);
    }

    let totalTaxableAmount = 0;
    let totalTaxAmount = 0;
    let totalGrandTotal = 0;

    const items = batchDetails.map((batch, index) => {
      const quantity = parseFloat(batch.quantity) || 0;
      const price = parseFloat(batch.price) || 0;
      const discount = parseFloat(batch.discount) || 0;
      const gst = parseFloat(batch.gst) || 0;
      const cess = parseFloat(batch.cess) || 0;

      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const taxableAmount = subtotal - discountAmount;
      const gstAmount = taxableAmount * (gst / 100);
      const cessAmount = taxableAmount * (cess / 100);
      const total = taxableAmount + gstAmount + cessAmount;

      // Add to totals
      totalTaxableAmount += taxableAmount;
      totalTaxAmount += gstAmount;
      totalGrandTotal += total;

      const isSameState = parseFloat(apiData.IGSTAmount) === 0;
      let cgst, sgst, igst;

      if (isSameState) {
        cgst = gst / 2;
        sgst = gst / 2;
        igst = 0;
      } else {
        cgst = 0;
        sgst = 0;
        igst = gst;
      }

      return {
        id: index + 1,
        product: batch.product || 'Product',
        order_mode: apiData.order_mode || "Pakka",
        description: batch.description || `Batch: ${batch.batch}`,
        quantity: quantity,
        price: price,
        discount: discount,
        gst: gst,
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        cess: cess,
        total: total.toFixed(2),
        batch: batch.batch || '',
        batch_id: batch.batch_id || '',
        product_id: batch.product_id || '',
        taxable_amount: taxableAmount
      };
    }) || [];

    // Use calculated totals or fallback to API data
    const taxableAmount = totalTaxableAmount || parseFloat(apiData.BasicAmount) || parseFloat(apiData.Subtotal) || 0;
    const totalGST = totalTaxAmount || parseFloat(apiData.TaxAmount) || (parseFloat(apiData.IGSTAmount) + parseFloat(apiData.CGSTAmount) + parseFloat(apiData.SGSTAmount)) || 0;
    const grandTotal = totalGrandTotal || parseFloat(apiData.TotalAmount) || 0;

    return {
      voucherId: apiData.VoucherID,
      invoiceNumber: apiData.InvoiceNumber || `INV${apiData.VoucherID}`,
      invoiceDate: apiData.Date ? new Date(apiData.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validityDate: apiData.Date ? new Date(new Date(apiData.Date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],

      //     companyInfo: {
      //    name: "SHREE SHASHWATRAJ AGRO PVT LTD",
      // address: "Growth Center, Jasoiya, Aurangabad, Bihar, 824101",
      // email: "spmathur56@gmail.com",
      // phone: "9801049700",
      // gstin: "10AAOCS1541B1ZZ",
      // state: "Bihar",
      // stateCode: "10"
      //     },

      companyInfo: companyInfo,

      supplierInfo: {
        name: apiData.PartyName || 'Customer',
        businessName: apiData.AccountName || 'Business',
        gstin: apiData.gstin || '',
        state: apiData.billing_state || apiData.BillingState || '',
        id: apiData.PartyID || null
      },

      billingAddress: {
        addressLine1: apiData.billing_address_line1 || apiData.BillingAddress || '',
        addressLine2: apiData.billing_address_line2 || '',
        city: apiData.billing_city || apiData.BillingCity || '',
        pincode: apiData.billing_pin_code || apiData.BillingPincode || '',
        state: apiData.billing_state || apiData.BillingState || ''
      },

      shippingAddress: {
        addressLine1: apiData.shipping_address_line1 || apiData.ShippingAddress || apiData.billing_address_line1 || apiData.BillingAddress || '',
        addressLine2: apiData.shipping_address_line2 || apiData.billing_address_line2 || '',
        city: apiData.shipping_city || apiData.ShippingCity || apiData.billing_city || apiData.BillingCity || '',
        pincode: apiData.shipping_pin_code || apiData.ShippingPincode || apiData.billing_pin_code || apiData.BillingPincode || '',
        state: apiData.shipping_state || apiData.ShippingState || apiData.billing_state || apiData.BillingState || ''
      },

      items: items.length > 0 ? items : [{
        id: 1,
        product: 'Product',
        description: 'No batch details available',
        quantity: 1,
        price: grandTotal,
        discount: 0,
        gst: parseFloat(apiData.IGSTPercentage) || 0,
        cgst: parseFloat(apiData.CGSTPercentage) || 0,
        sgst: parseFloat(apiData.SGSTPercentage) || 0,
        igst: parseFloat(apiData.IGSTPercentage) || 0,
        cess: 0,
        total: grandTotal.toFixed(2),
        batch: '',
        batch_id: '',
        product_id: '',
        taxable_amount: grandTotal
      }],

      taxableAmount: (typeof taxableAmount === 'number' ? taxableAmount : parseFloat(taxableAmount) || 0).toFixed(2),
      totalGST: (typeof totalGST === 'number' ? totalGST : parseFloat(totalGST) || 0).toFixed(2),
      grandTotal: (typeof grandTotal === 'number' ? grandTotal : parseFloat(grandTotal) || 0).toFixed(2),
      totalCess: "0.00",

      note: apiData.Notes || "",
      transportDetails: {
        transport: apiData.transport_name || "",
        grNumber: apiData.gr_rr_number || "",
        vehicleNo: apiData.vehicle_number || "",
        station: apiData.station_name || ""
      }, additionalCharge: "",
      additionalChargeAmount: "0.00",

      totalCGST: parseFloat(apiData.CGSTAmount) || 0,
      totalSGST: parseFloat(apiData.SGSTAmount) || 0,
      totalIGST: parseFloat(apiData.IGSTAmount) || 0,
      taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST"
    };
  };

  // Fetch transaction data
  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching transaction data for ID:', id);
      const apiUrl = `${baseurl}/transactions/${id}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const apiData = result.data;
        const transformedData = transformApiDataToInvoiceFormat(apiData);
        setInvoiceData(transformedData);

        // Initialize editable descriptions and note
        const descObj = {};
        transformedData.items.forEach((item, index) => {
          descObj[item.id || index] = item.description || '';
        });
        setEditableDescriptions(descObj);
        setEditableNote(transformedData.note || '');

      } else if (result.VoucherID) {
        const transformedData = transformApiDataToInvoiceFormat(result);
        setInvoiceData(transformedData);

        // Initialize editable descriptions and note
        const descObj = {};
        transformedData.items.forEach((item, index) => {
          descObj[item.id || index] = item.description || '';
        });
        setEditableDescriptions(descObj);
        setEditableNote(transformedData.note || '');
      } else {
        throw new Error(result.message || 'No valid data received from API');
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setError(`API Error: ${error.message}`);

      const savedData = localStorage.getItem('previewInvoice');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setInvoiceData(data);
          setError(null);
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateGSTBreakdown = () => {
    if (!invoiceData || !invoiceData.items) return { totalCGST: 0, totalSGST: 0, totalIGST: 0 };

    const totalCGST = invoiceData.items.reduce((sum, item) => {
      // Use cgst_amount from database if available, otherwise use calculation
      const cgstAmount = parseFloat(item.cgst_amount) || 0;
      return sum + cgstAmount;
    }, 0);

    const totalSGST = invoiceData.items.reduce((sum, item) => {
      // Use sgst_amount from database if available, otherwise use calculation
      const sgstAmount = parseFloat(item.sgst_amount) || 0;
      return sum + sgstAmount;
    }, 0);

    const totalIGST = invoiceData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const igstRate = parseFloat(item.igst) || 0;

      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const igstAmount = amountAfterDiscount * (igstRate / 100);

      return sum + igstAmount;
    }, 0);

    return {
      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalIGST: totalIGST.toFixed(2)
    };
  };


  const handlePrint = async () => {
    try {
      setDownloading(true);
      setError(null);

      if (!invoiceData) {
        throw new Error('No invoice data available');
      }

      let pdf;
      let InvoicceprintOrder;
      let generateQRDataUrl;

      try {
        const reactPdf = await import('@react-pdf/renderer');
        pdf = reactPdf.pdf;

        const pdfModule = await import('./InvoicceprintOrder');
        InvoicceprintOrder = pdfModule.default;
        generateQRDataUrl = pdfModule.generateQRDataUrl;
      } catch (importError) {
        console.error('Error importing PDF modules:', importError);
        throw new Error('Failed to load PDF generation libraries');
      }

      const gstBreakdown = calculateGSTBreakdown();
      const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

      const orderMode = (editableOrderMode || invoiceData.order_mode || 'PAKKA').toUpperCase();
      let qrDataUrl = null;
      let qrAmount = 0;

      try {
        const qrResult = await generateQRDataUrl(invoiceData, orderMode);
        qrDataUrl = qrResult.dataUrl;
        qrAmount = qrResult.amount;
        console.log('✅ QR code generated for PDF, amount:', qrAmount);
      } catch (qrError) {
        console.warn('⚠️ QR generation failed, PDF will render without QR:', qrError.message);
      }

      // FIX: Create a copy of invoiceData with transport details
      const invoiceDataWithTransport = {
        ...invoiceData,
        transportDetails: transportDetails,
        transport_name: transportDetails.transport,
        gr_rr_number: transportDetails.grNumber,
        vehicle_number: transportDetails.vehicleNo,
        station_name: transportDetails.station
      };

      const pdfDoc = (
        <InvoicceprintOrder
          invoiceData={invoiceDataWithTransport}  // Use enhanced data
          invoiceNumber={invoiceData.invoiceNumber}
          gstBreakdown={gstBreakdown}
          isSameState={isSameState}
          qrDataUrl={qrDataUrl}
          qrAmount={qrAmount}
        />
      );

      const blob = await pdf(pdfDoc).toBlob();

      const pdfUrl = URL.createObjectURL(blob);
      const printWindow = window.open(pdfUrl, '_blank');

      if (!printWindow) {
        alert('Popup blocked. Downloading instead.');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

    } catch (error) {
      console.error('Error generating PDF for print:', error);
      setError('Failed to generate PDF for printing: ' + error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setDownloading(false);
    }
  };

  const generateAndStorePDF = async (voucherId) => {
    try {
      if (!invoiceData) throw new Error('No invoice data available');

      let pdf;
      let InvoicePDFDocument;
      let generateQRDataUrl;

      try {
        const reactPdf = await import('@react-pdf/renderer');
        pdf = reactPdf.pdf;

        const pdfModule = await import('./InvoicceprintOrder');
        InvoicePDFDocument = pdfModule.default;
        generateQRDataUrl = pdfModule.generateQRDataUrl;
      } catch (importError) {
        throw new Error('Failed to load PDF generation libraries');
      }

      const gstBreakdown = calculateGSTBreakdown();
      const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

      // Pre-generate QR
      const orderMode = (editableOrderMode || invoiceData.order_mode || 'PAKKA').toUpperCase();
      let qrDataUrl = null;
      let qrAmount = 0;
      try {
        const qrResult = await generateQRDataUrl(invoiceData, orderMode);
        qrDataUrl = qrResult.dataUrl;
        qrAmount = qrResult.amount;
      } catch (qrError) {
        console.warn('QR generation failed for stored PDF:', qrError.message);
      }

      // FIX: Create a copy of invoiceData with transport details
      const invoiceDataWithTransport = {
        ...invoiceData,
        transportDetails: transportDetails,  // Add current transport details
        transport_name: transportDetails.transport,
        gr_rr_number: transportDetails.grNumber,
        vehicle_number: transportDetails.vehicleNo,
        station_name: transportDetails.station
      };

      const pdfDoc = (
        <InvoicePDFDocument
          invoiceData={invoiceDataWithTransport}  // Use the enhanced data
          invoiceNumber={invoiceData.invoiceNumber}
          gstBreakdown={gstBreakdown}
          isSameState={isSameState}
          qrDataUrl={qrDataUrl}
          qrAmount={qrAmount}
        />
      );

      const blob = await pdf(pdfDoc).toBlob();
      const filename = `Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;

      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const storeResponse = await fetch(`${baseurl}/transactions/${voucherId}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfData: base64data, fileName: filename }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!storeResponse.ok) {
        const errorText = await storeResponse.text();
        throw new Error(`Server error: ${storeResponse.status} - ${errorText}`);
      }

      const storeResult = await storeResponse.json();
      if (storeResult.success) {
        console.log('✅ PDF with QR stored successfully for voucher:', voucherId);
        return storeResult;
      } else {
        throw new Error(storeResult.message || 'Failed to store PDF');
      }

    } catch (error) {
      console.error('Error in PDF generation and storage:', error);
      throw error;
    }
  };
  const handleEdit = () => {
    setIsEditing(true);
    setEditableNote(invoiceData?.note || '');

    const descObj = {};
    invoiceData?.items.forEach((item, index) => {
      descObj[item.id || index] = item.description || '';
    });
    setEditableDescriptions(descObj);
  };

  // Handle note change
  const handleNoteChange = (value) => {
    setEditableNote(value);
  };

  // Handle description change
  const handleDescriptionChange = (itemId, value) => {
    setEditableDescriptions(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  // Handle save note and descriptions
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (!invoiceData) {
        throw new Error('No invoice data available');
      }

      // Prepare updated items with descriptions
      const updatedItems = invoiceData.items.map((item, index) => ({
        ...item,
        description: editableDescriptions[item.id || index] || item.description || ''
      }));

      // Update local state
      const updatedInvoiceData = {
        ...invoiceData,
        note: editableNote,
        items: updatedItems,
        order_mode: editableOrderMode
      };

      setInvoiceData(updatedInvoiceData);

      // Exit edit mode
      setIsEditing(false);

      setSuccessMessage('Changes saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('Error saving changes:', error);
      setErrorMessage('Failed to save changes: ' + error.message);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableNote(invoiceData?.note || '');
    const descObj = {};
    invoiceData?.items.forEach((item, index) => {
      descObj[item.id || index] = item.description || '';
    });
    setEditableDescriptions(descObj);
  };


  // Add this function to handle PDF generation and storage

const handleGenerateInvoice = async () => {
  try {
    setGenerating(true);
    setErrorMessage('');
    setSuccessMessage('');

    // ✅ FIX: Determine transaction type and fetch correct invoice number
    const orderMode = editableOrderMode ||
      periodInvoiceData?.order_mode ||
      periodInvoiceData?.originalOrder?.order_mode ||
      "PAKKA";

    // PAKKA = Sales, KACHA = stock transfer
    const transactionType = orderMode.toUpperCase() === "PAKKA" ? "Sales" : "stock transfer";
    
    console.log(`📌 Order Mode: ${orderMode}, Transaction Type: ${transactionType}`);

    let invoiceNumber = null;
    try {
      console.log(`📞 Fetching next invoice number for ${transactionType}...`);
      
      // Build URL with transaction type
      let url = `${baseurl}/next-invoice-number?transactionType=${encodeURIComponent(transactionType)}`;
      
      // ✅ FIX: For Sales, we MUST provide a saleType
      if (transactionType === "Sales") {
        // Try to get saleType from various sources
        let saleType = null;
        
        // 1. Check if periodInvoiceData has sale_type
        if (periodInvoiceData?.sale_type) {
          saleType = periodInvoiceData.sale_type;
          console.log(`✅ Using saleType from periodInvoiceData: ${saleType}`);
        }
        // 2. Check if originalOrder has sale_type
        else if (periodInvoiceData?.originalOrder?.sale_type) {
          saleType = periodInvoiceData.originalOrder.sale_type;
          console.log(`✅ Using saleType from originalOrder: ${saleType}`);
        }
        // 3. Check if invoiceData has sale_type
        else if (invoiceData?.sale_type) {
          saleType = invoiceData.sale_type;
          console.log(`✅ Using saleType from invoiceData: ${saleType}`);
        }
        // 4. Use default - "shree shashwath" from your saletypes table
        else {
          // ✅ This matches your saletypes table: sale_type = "shree shashwath", series = "SSA"
          saleType = "shree shashwath";
          console.log(`⚠️ No saleType found, using default: ${saleType}`);
        }
        
        // Add saleType to URL
        url += `&saleType=${encodeURIComponent(saleType)}`;
      }
      
      console.log(`🌐 Request URL: ${url}`);
      
      const invoiceNumberResponse = await fetch(url);

      if (invoiceNumberResponse.ok) {
        const invoiceNumberData = await invoiceNumberResponse.json();
        invoiceNumber = invoiceNumberData.nextInvoiceNumber;
        console.log(`✅ Received next invoice number for ${transactionType}:`, invoiceNumber);
      } else {
        const errorText = await invoiceNumberResponse.text();
        console.error(`❌ Failed to fetch next invoice number:`, invoiceNumberResponse.status, errorText);
        
        // If 404 with "Sale Type not found", try alternatives
        if (invoiceNumberResponse.status === 404 && errorText.includes('Sale Type not found')) {
          console.log('🔄 SaleType not found, trying alternatives...');
          
          // ✅ These match your saletypes table
          const alternativeSaleTypes = ["godown1", "godown2", "shree shashwath"];
          
          for (const altSaleType of alternativeSaleTypes) {
            console.log(`🔄 Trying alternative saleType: ${altSaleType}`);
            const altUrl = `${baseurl}/next-invoice-number?transactionType=${encodeURIComponent(transactionType)}&saleType=${encodeURIComponent(altSaleType)}`;
            const altResponse = await fetch(altUrl);
            
            if (altResponse.ok) {
              const altData = await altResponse.json();
              invoiceNumber = altData.nextInvoiceNumber;
              console.log(`✅ Received next invoice number with saleType ${altSaleType}:`, invoiceNumber);
              break;
            }
          }
        }
        
        // If still no invoice number, use fallback
        if (!invoiceNumber) {
          invoiceNumber = await generateFallbackInvoiceNumber(transactionType);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching next invoice number:', err);
      invoiceNumber = await generateFallbackInvoiceNumber(transactionType);
    }

    // Final fallback if still no invoice number
    if (!invoiceNumber) {
      invoiceNumber = `INV${Date.now().toString().slice(-6)}`;
      console.log(`⚠️ Using final fallback invoice number: ${invoiceNumber}`);
    }

    // DEBUG: Add logging to see what's coming
    console.log('🔍 DEBUG - periodInvoiceData structure:', {
      periodInvoiceData,
      customerInfo: periodInvoiceData?.customerInfo,
      fullAccountDetails: periodInvoiceData?.fullAccountDetails,
      hasCreditLimit: !!periodInvoiceData?.customerInfo?.credit_limit,
      creditLimitRaw: periodInvoiceData?.customerInfo?.credit_limit,
      creditLimitType: typeof periodInvoiceData?.customerInfo?.credit_limit
    });

    if (fromPeriod && periodInvoiceData) {
      const selectedItems = periodInvoiceData.selectedItems || [];

      if (selectedItems.length === 0) {
        throw new Error('No selected items found for invoice generation');
      }

      // Check stock for each item
      const itemsWithStockIssue = [];

      for (const item of selectedItems) {
        const flashOffer = parseInt(item.flash_offer) || 0;
        const buyQuantity = parseInt(item.buy_quantity) || 0;
        const getQuantity = parseInt(item.get_quantity) || 0;

        const stockCheckQuantity = flashOffer === 1 ? buyQuantity + getQuantity : parseFloat(item.quantity) || 0;

        if (item.product_id) {
          try {
            const batchesRes = await axios.get(`${baseurl}/products/${item.product_id}/batches`);

            if (batchesRes.data && Array.isArray(batchesRes.data)) {
              const stock_quantity = batchesRes.data.reduce((total, batch) => {
                return total + (parseFloat(batch.quantity) || 0);
              }, 0);

              // Compare with total quantity needed
              if (stockCheckQuantity > stock_quantity) {
                itemsWithStockIssue.push({
                  ...item,
                  stock_quantity,
                  shortage: stockCheckQuantity - stock_quantity,
                  is_flash_offer: flashOffer === 1,
                  buy_quantity: buyQuantity,
                  get_quantity: getQuantity,
                  required_total: stockCheckQuantity
                });
              }
            }
          } catch (batchError) {
            console.error(`Error fetching batches for product ${item.product_id}:`, batchError);
          }
        }
      }

      // If stock issues found - show alert but continue
      if (itemsWithStockIssue.length > 0) {
        let windowsAlert = "⚠️ STOCK INSUFFICIENCY DETECTED!\n\n";
        windowsAlert += `Order: ${periodInvoiceData.orderNumber}\n\n`;
        windowsAlert += `Items requiring modification:\n`;

        itemsWithStockIssue.forEach((item, index) => {
          windowsAlert += `${index + 1}. ${item.item_name || 'Unknown Item'}\n`;
          windowsAlert += `   Ordered: ${item.required_total || item.quantity}, Available: ${item.stock_quantity}, Shortage: ${item.shortage} units\n\n`;
        });

        windowsAlert += "Do you want to continue with invoice generation anyway?";

        const proceed = window.confirm(windowsAlert);
        if (!proceed) {
          setGenerating(false);
          setErrorMessage('Invoice generation cancelled due to stock insufficiency.');
          setTimeout(() => setErrorMessage(null), 5000);
          return;
        }
      }

      // ========== END STOCK CHECK ==========
      const firstDescription = editableDescriptions[invoiceData?.items[0]?.id || 0] ||
        invoiceData?.items[0]?.description || '';

      const accountDetails = periodInvoiceData.fullAccountDetails ||
        periodInvoiceData.customerInfo?.account_details;

      const orderNumber = periodInvoiceData.orderNumber || periodInvoiceData.originalOrder?.order_number;

      const firstItemDescription = editableDescriptions[invoiceData?.items[0]?.id || 0] ||
        selectedItems[0]?.description || '';

      const assignedStaff = periodInvoiceData.assigned_staff ||
        periodInvoiceData.originalOrder?.assigned_staff ||
        'N/A';

      const staffId = periodInvoiceData.staff_id ||
        periodInvoiceData.staffid ||
        periodInvoiceData.originalOrder?.staff_id ||
        null;

      const staffIncentive = periodInvoiceData.staff_incentive ||
        periodInvoiceData.originalOrder?.staff_incentive ||
        0;

      let taxableAmount = 0;
      let totalGST = 0;
      let grandTotal = 0;
      let totalDiscount = 0;
      let totalCGST = 0;
      let totalSGST = 0;

      // FIXED: Better credit data parsing function
      const parseCreditValue = (value) => {
        console.log('🔄 Parsing credit value:', { rawValue: value, type: typeof value });

        if (value === null || value === undefined || value === '') {
          console.log('Value is null/undefined/empty, returning 0');
          return 0;
        }

        if (typeof value === 'string') {
          // Check for "NULL" string (case insensitive)
          const trimmedValue = value.trim().toUpperCase();
          if (trimmedValue === 'NULL' || trimmedValue === '') {
            console.log('Value is "NULL" or empty string, returning 0');
            return 0;
          }

          // Remove any non-numeric characters except decimal point and minus sign
          const cleanValue = value.replace(/[^0-9.-]+/g, '');
          if (cleanValue === '') {
            console.log('Cleaned value is empty, returning 0');
            return 0;
          }

          const parsed = parseFloat(cleanValue);

          if (isNaN(parsed)) {
            console.log('Could not parse to number, returning 0');
            return 0;
          }

          console.log(`Successfully parsed "${value}" to ${parsed}`);
          return parsed;
        }

        if (typeof value === 'number') {
          console.log(`Value is already number: ${value}`);
          return value;
        }

        // Try to convert other types
        try {
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) {
            console.log(`Converted to number: ${parsed}`);
            return parsed;
          }
        } catch (e) {
          console.log('Conversion failed, returning 0');
        }

        return 0;
      };

      // FIXED: Get and parse credit values with proper debugging
      const rawCreditLimit = periodInvoiceData.customerInfo?.credit_limit;
      const rawUnpaidAmount = periodInvoiceData.customerInfo?.unpaid_amount;
      const rawBalanceAmount = periodInvoiceData.customerInfo?.balance_amount;

      console.log('📥 RAW CREDIT VALUES RECEIVED:', {
        rawCreditLimit,
        rawUnpaidAmount,
        rawBalanceAmount,
        types: {
          creditLimit: typeof rawCreditLimit,
          unpaidAmount: typeof rawUnpaidAmount,
          balanceAmount: typeof rawBalanceAmount
        }
      });

      const creditLimit = parseCreditValue(rawCreditLimit);
      const unpaidAmount = parseCreditValue(rawUnpaidAmount);
      const balanceAmount = parseCreditValue(rawBalanceAmount);

      console.log('✅ FINAL PARSED CREDIT VALUES:', {
        creditLimit,
        unpaidAmount,
        balanceAmount
      });

      const itemsWithCalculations = selectedItems.map(item => {
        const flashOffer = parseInt(item.flash_offer) || 0;
        const buyQuantity = parseInt(item.buy_quantity) || 0;
        const getQuantity = parseInt(item.get_quantity) || 0;

        const quantity = flashOffer === 1 ? buyQuantity : (parseFloat(item.quantity) || 1);
        const stock_deduction_quantity = flashOffer === 1 ? buyQuantity + getQuantity : quantity;

        const taxablePerUnit = parseFloat(item.taxable_amount) || 0;
        const taxAmountPerUnit = parseFloat(item.tax_amount) || 0;
        const cgstAmountPerUnit = parseFloat(item.cgst_amount) || 0;
        const sgstAmountPerUnit = parseFloat(item.sgst_amount) || 0;

        // CRITICAL FIX: Get net_price from the item
        const netPrice = parseFloat(item.net_price) || 0;
        const editedSalePrice = parseFloat(item.edited_sale_price) || 0;
        const salePrice = parseFloat(item.sale_price) || 0;

        // Use net_price as the primary price
        const price = netPrice;

        const discountAmountPerUnit = parseFloat(item.discount_amount) || 0;
        const creditChargePerUnit = parseFloat(item.credit_charge) || 0;

        const cgstPercentage = parseFloat(item.cgst_percentage) || 0;
        const sgstPercentage = parseFloat(item.sgst_percentage) || 0;
        const taxPercentage = parseFloat(item.tax_percentage) || 0;

        const itemTaxableAmount = taxablePerUnit * quantity;
        const itemTaxAmount = orderMode.toUpperCase() === "KACHA" ? 0 : taxAmountPerUnit * quantity;
        const itemCGSTAmount = orderMode.toUpperCase() === "KACHA" ? 0 : cgstAmountPerUnit * quantity;
        const itemSGSTAmount = orderMode.toUpperCase() === "KACHA" ? 0 : sgstAmountPerUnit * quantity;
        const itemDiscountAmount = discountAmountPerUnit * quantity;
        const itemCreditCharge = creditChargePerUnit * quantity;
        const itemTotal = orderMode.toUpperCase() === "KACHA" ? itemTaxableAmount :
          itemTaxableAmount + itemTaxAmount;

        taxableAmount += itemTaxableAmount;
        totalGST += itemTaxAmount;
        totalCGST += itemCGSTAmount;
        totalSGST += itemSGSTAmount;
        totalDiscount += itemDiscountAmount;
        grandTotal += itemTotal;

        return {
          originalItemId: item.id,
          product: item.item_name,
          product_id: item.product_id,
          product_type: orderMode,
          description: editableDescriptions[item.id] || item.description || '',

          quantity: quantity,
          stock_deduction_quantity: stock_deduction_quantity,

          // CRITICAL FIX: Include net_price in the payload
          net_price: netPrice,
          price: price,
          edited_sale_price: editedSalePrice,
          sale_price: salePrice,
          unit_id: item.unit_id || null,
          unit_name: item.unit_name || "",
          discount_amount: itemDiscountAmount,
          credit_charge: itemCreditCharge,
          discount_amount_per_unit: discountAmountPerUnit,
          credit_charge_per_unit: creditChargePerUnit,

          discount: parseFloat(item.discount_percentage) || 0,
          gst: orderMode.toUpperCase() === "KACHA" ? 0 : taxPercentage,
          cgst: orderMode.toUpperCase() === "KACHA" ? 0 : cgstPercentage,
          sgst: orderMode.toUpperCase() === "KACHA" ? 0 : sgstPercentage,
          igst: 0,
          cess: 0,

          total: itemTotal,
          taxable_amount: itemTaxableAmount,
          tax_amount: itemTaxAmount,
          cgst_amount: itemCGSTAmount,
          sgst_amount: itemSGSTAmount,

          batch: item.batch_id || '',
          batch_id: item.batch_id || '',
          item_total: itemTotal,
          hsn_code: item.hsn_code || "",
          unit_id: item.unit_id || null,
          flash_offer: flashOffer,
          buy_quantity: buyQuantity,
          get_quantity: getQuantity,

          _calculation_note: `Flash: ${flashOffer}, Price: ${price} (net: ${netPrice}, edited: ${editedSalePrice})`
        };
      });

      // FIXED: Perform credit limit check with better logic
      console.log('📊 CREDIT CHECK - ALL VALUES:', {
        creditLimit,
        unpaidAmount,
        balanceAmount,
        grandTotal,
        isCreditLimitSet: creditLimit > 0,
        isCreditLimitValid: typeof creditLimit === 'number' && !isNaN(creditLimit)
      });

      // IMPORTANT: Only check if creditLimit is a valid positive number
      if (creditLimit > 0 && typeof creditLimit === 'number' && !isNaN(creditLimit)) {
        const totalInvoiceAmount = grandTotal;
        const currentTotal = unpaidAmount;
        const newTotal = currentTotal + totalInvoiceAmount;
        const exceedAmount = newTotal - creditLimit;

        console.log('🚨 CREDIT LIMIT CALCULATION:', {
          creditLimit,
          currentTotal,
          totalInvoiceAmount,
          newTotal,
          exceedAmount,
          isExceeded: newTotal > creditLimit
        });

        if (newTotal > creditLimit) {
          // Show Windows alert
          const customerName = accountDetails?.name || periodInvoiceData.customerInfo?.name || 'Customer';

          const alertMessage =
            "⚠️ CREDIT LIMIT EXCEEDED!\n\n" +
            `Customer: ${customerName}\n` +
            `Credit Limit: ₹${creditLimit.toLocaleString('en-IN')}\n` +
            `Unpaid Amount: ₹${unpaidAmount.toLocaleString('en-IN')}\n` +
            `Invoice Amount: ₹${totalInvoiceAmount.toLocaleString('en-IN')}\n` +
            `New Total: ₹${newTotal.toLocaleString('en-IN')}\n` +
            `Exceeds by: ₹${exceedAmount.toLocaleString('en-IN')}\n\n` +
            "Credit limit exceeded! Proceed anyway?\n\n" +
            "OK = Continue with invoice\n" +
            "Cancel = Stop invoice generation";

          console.log('🔄 SHOWING ALERT DIALOG');
          console.log('Alert Message:', alertMessage);

          const proceed = window.confirm(alertMessage);

          if (!proceed) {
            setGenerating(false);
            setErrorMessage('Invoice generation cancelled due to credit limit exceedance.');
            setTimeout(() => setErrorMessage(null), 5000);
            return;
          } else {
            console.log('✅ User chose to proceed despite credit limit');
          }
        } else {
          console.log('✅ Credit limit NOT exceeded, proceeding normally');
        }
      } else {
        console.log('ℹ️ No valid credit limit found:', {
          creditLimit,
          type: typeof creditLimit,
          isNumber: typeof creditLimit === 'number',
          isPositive: creditLimit > 0,
          isNotNaN: !isNaN(creditLimit)
        });

        if (creditLimit === 0) {
          console.log('ℹ️ Credit limit is 0, skipping credit check');
        } else if (creditLimit < 0) {
          console.log('⚠️ Credit limit is negative, skipping credit check');
        } else {
          console.log('⚠️ Credit limit is not a valid number, skipping credit check');
        }
      }

    // ✅ FIX: Clean up the payload to only include valid fields
const payload = {
  // Core transaction fields
  TransactionType: transactionType,
  invoiceNumber: invoiceNumber,
  VchNo: invoiceNumber,
  invoiceDate: new Date().toISOString().split('T')[0],
  validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  
  // Order details
  orderNumber: orderNumber,
  order_number: orderNumber,
  order_mode: orderMode.toUpperCase(),
  
  // Party/Customer details
  PartyID: periodInvoiceData.customerInfo?.id || periodInvoiceData.PartyID,
  AccountID: periodInvoiceData.customerInfo?.id || periodInvoiceData.AccountID,
  PartyName: accountDetails?.name || periodInvoiceData.PartyName || periodInvoiceData.customerInfo?.name,
  AccountName: accountDetails?.business_name || periodInvoiceData.AccountName || periodInvoiceData.customerInfo?.businessName,
  selectedSupplierId: periodInvoiceData.customerInfo?.id || periodInvoiceData.PartyID,
  
  // Customer info
  customerInfo: {
    name: accountDetails?.name || periodInvoiceData.customerInfo?.name,
    businessName: accountDetails?.business_name || periodInvoiceData.customerInfo?.businessName,
    gstin: accountDetails?.gstin || periodInvoiceData.customerInfo?.gstin,
    state: accountDetails?.billing_state || periodInvoiceData.customerInfo?.state,
    id: periodInvoiceData.customerInfo?.id,
    email: accountDetails?.email || '',
    phone: accountDetails?.mobile_number || '',
    pan: accountDetails?.pan || '',
    credit_limit: creditLimit,
    unpaid_amount: unpaidAmount,
    balance_amount: balanceAmount
  },
  
  // Addresses
  billingAddress: accountDetails ? {
    addressLine1: accountDetails.billing_address_line1,
    addressLine2: accountDetails.billing_address_line2 || '',
    city: accountDetails.billing_city,
    pincode: accountDetails.billing_pin_code,
    state: accountDetails.billing_state,
    country: accountDetails.billing_country || 'India',
    gstin: accountDetails.billing_gstin || accountDetails.gstin
  } : periodInvoiceData.billingAddress,
  
  shippingAddress: accountDetails ? {
    addressLine1: accountDetails.shipping_address_line1 || accountDetails.billing_address_line1,
    addressLine2: accountDetails.shipping_address_line2 || accountDetails.billing_address_line2 || '',
    city: accountDetails.shipping_city || accountDetails.billing_city,
    pincode: accountDetails.shipping_pin_code || accountDetails.billing_pin_code,
    state: accountDetails.shipping_state || accountDetails.billing_state,
    country: accountDetails.shipping_country || accountDetails.billing_country || 'India',
    gstin: accountDetails.shipping_gstin || accountDetails.gstin
  } : periodInvoiceData.shippingAddress || periodInvoiceData.billingAddress,
  
  // Staff details
  assigned_staff: assignedStaff,
  staffid: staffId,
  staff_id: staffId,
  staff_incentive: staffIncentive,
  
  // Items
  items: itemsWithCalculations,
  hsn_code: itemsWithCalculations[0]?.hsn_code || "",
  
  // Financial totals
  taxableAmount: taxableAmount,
  totalGST: totalGST,
  totalCess: 0,
  grandTotal: grandTotal,
  totalDiscount: totalDiscount,
  totalCGST: totalCGST,
  totalSGST: totalSGST,
  
  BasicAmount: taxableAmount,
  TotalAmount: grandTotal,
  TaxAmount: totalGST,
  Subtotal: taxableAmount,
  CGSTAmount: totalCGST,
  SGSTAmount: totalSGST,
  
  // Additional fields
  note: editableNote || periodInvoiceData.note || "",
  TaxSystem: orderMode.toUpperCase() === "KACHA" ? "KACHA_NO_GST" : "GST",
  transportDetails: transportDetails,
  transport_name: transportDetails.transport,
  gr_rr_number: transportDetails.grNumber,
  vehicle_number: transportDetails.vehicleNo,
  station_name: transportDetails.station,
  
  // Flash offer summary
  flashOfferSummary: periodInvoiceData.flashOfferSummary || {
    hasFlashOffer: itemsWithCalculations.some(item => item.flash_offer === 1),
    totalItemsWithFlashOffer: itemsWithCalculations.filter(item => item.flash_offer === 1).length
  },
  
  // Original references
  originalOrderNumber: orderNumber,
  originalOrderId: periodInvoiceData.originalOrderId,
  selectedItemIds: periodInvoiceData.selectedItemIds || [],
  
  isPartialInvoice: true,
  source: 'period_component',
  
  // Credit info
  credit_limit: creditLimit,
  unpaid_amount: unpaidAmount,
  balance_amount: balanceAmount
};

console.log("📦 FINAL INVOICE PAYLOAD:", payload);

const response = await fetch(`${baseurl}/transaction`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate invoice");
      }

      if (result.voucherId) {
        try {
          const updatedInvoiceData = {
            ...invoiceData,
            voucherId: result.voucherId,
            TransactionType: transactionType // ✅ Use the determined transaction type
          };

          // Generate and store PDF
          const pdfResult = await generateAndStorePDF(result.voucherId);

          if (pdfResult.success) {
            console.log('✅ PDF stored successfully');
            setSuccessMessage(`Invoice generated successfully! Invoice Number: ${result.invoiceNumber}. Transaction Type: ${transactionType}`);
          }
        } catch (pdfError) {
          console.warn('⚠️ Invoice created but PDF storage failed:', pdfError.message);
          setSuccessMessage(`Invoice generated successfully! Invoice Number: ${result.invoiceNumber} (PDF storage failed: ${pdfError.message})`);
        }
      } else {
        setSuccessMessage(`Invoice generated successfully! Invoice Number: ${result.invoiceNumber || payload.invoiceNumber}. Transaction Type: ${transactionType}`);
      }

      if (result.voucherId) {
        setInvoiceData(prev => ({
          ...prev,
          voucherId: result.voucherId,
          TransactionType: transactionType // ✅ Use the determined transaction type
        }));
      }

      setTimeout(() => {
        navigate('/period');
      }, 3000);

    } else {
      throw new Error('Invalid invoice data source');
    }
  } catch (error) {
    console.error("Error generating invoice:", error);
    setErrorMessage(`Failed to generate invoice: ${error.message}`);

    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  } finally {
    setGenerating(false);
  }
};


const generateFallbackInvoiceNumber = async (transactionType = "Sales") => {
  try {
    const getFinancialYearShort = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      if (month >= 3) {
        return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
      } else {
        return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
      }
    };

    const currentFY = getFinancialYearShort();
    
    // Different prefixes based on transaction type
    let prefix = '';
    switch(transactionType?.toLowerCase()) {
      case 'sales':
        prefix = 'SSA/';
        break;
      case 'stock transfer':
        prefix = 'CS/';
        break;
      case 'stock inward':
        prefix = 'SSk/';
        break;
      case 'purchase':
        prefix = 'SSA/';
        break;
      default:
        prefix = 'SSA/'; // Default fallback
    }
    
    const suffix = `/${currentFY}`;

    // Try to get the last invoice number for this transaction type
    let url = `${baseurl}/last-invoice?transactionType=${encodeURIComponent(transactionType)}`;
    console.log(`📞 Fetching last invoice for ${transactionType} from:`, url);
    
    try {
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📥 Last invoice response for ${transactionType}:`, data);
        
        if (data.lastInvoiceNumber) {
          const lastNumber = data.lastInvoiceNumber;
          console.log(`📄 Last invoice number found: ${lastNumber}`);
          
          // Try to match the pattern
          const pattern = new RegExp(`${prefix}(\\d+)/\\d{2}-\\d{2}`);
          const numberMatch = lastNumber.match(pattern);
          
          if (numberMatch) {
            const nextNum = parseInt(numberMatch[1]) + 1;
            const fallbackInvoiceNumber = `${prefix}${nextNum.toString().padStart(6, "0")}${suffix}`;
            console.log(`✅ Generated fallback invoice number: ${fallbackInvoiceNumber}`);
            return fallbackInvoiceNumber;
          } else {
            console.log(`⚠️ Last invoice ${lastNumber} doesn't match pattern for ${prefix}`);
          }
        } else {
          console.log(`ℹ️ No last invoice found for ${transactionType}`);
        }
      } else {
        console.error(`❌ Failed to fetch last invoice: ${response.status}`);
      }
    } catch (err) {
      console.warn('Could not fetch last invoice:', err);
    }

    // Ultimate fallback - start from 000001
    const defaultNumber = `${prefix}000001${suffix}`;
    console.log(`ℹ️ Using default fallback invoice number: ${defaultNumber}`);
    return defaultNumber;
  } catch (err) {
    console.error(`❌ Error in fallback invoice number generation for ${transactionType}:`, err);
    const getFinancialYearShort = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      if (month >= 3) {
        return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
      } else {
        return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
      }
    };
    return `INV/000001/${getFinancialYearShort()}`;
  }
};

  const calculateGrandTotalForQR = () => {
    if (!invoiceData || !invoiceData.items) {
      console.log('❌ No invoice data or items for QR calculation');
      return 0;
    }

    const orderMode = (editableOrderMode || invoiceData.order_mode || "PAKKA").toUpperCase();

    console.log('🔍 Calculating QR Grand Total:', {
      orderMode,
      itemCount: invoiceData.items.length
    });

    let grandTotal = 0;

    invoiceData.items.forEach((item, index) => {
      const quantity = parseFloat(item.quantity) || 1;

      const taxablePerUnit = parseFloat(item.taxable_amount) || 0;
      const totalTaxable = taxablePerUnit * quantity;

      const gstPerUnit = parseFloat(item.tax_amount) || 0;
      const totalGST = orderMode === "KACHA" ? 0 : gstPerUnit * quantity;

      const itemTotal = totalTaxable + totalGST;

      grandTotal += itemTotal;

      console.log(`💰 Item ${index + 1} Calculation:`, {
        product: item.product,
        quantity,
        taxablePerUnit,
        totalTaxable,
        gstPerUnit,
        totalGST,
        itemTotal,
        accumulatedTotal: grandTotal
      });
    });

    console.log('💰 FINAL QR Grand Total:', grandTotal);

    const invoiceGrandTotal = parseFloat(invoiceData.grandTotal) || 0;

    return Math.max(grandTotal, invoiceGrandTotal);
  };

  const generateQRCodeData = () => {
    if (!invoiceData) {
      console.log('❌ No invoice data available for QR code');
      return '';
    }

    try {
      const amount = calculateGrandTotalForQR();
      console.log('📊 QR Code Amount:', {
        amount,
        orderMode: editableOrderMode || invoiceData.order_mode,
        itemCount: invoiceData.items?.length || 0
      });

      // Ensure amount is properly formatted with 2 decimal places
      const formattedAmount = parseFloat(amount).toFixed(2);

      const upiId = 'shreeshashwatrajagroprivatelimited@sbi';

      const merchantName = invoiceData.companyInfo?.name?.replace(/[^a-zA-Z0-9 ]/g, '') || 'Business';

      const invoiceNumber = invoiceData.invoiceNumber || `INV${Date.now().toString().slice(-6)}`;
      const orderMode = (editableOrderMode || invoiceData.order_mode || "PAKKA").toUpperCase();

      const transactionNote = `Payment for Invoice ${invoiceNumber} (${orderMode} Order)`;

      const upiParams = new URLSearchParams({
        pa: upiId,
        pn: merchantName,
        am: formattedAmount,
        tn: transactionNote,
        cu: 'INR'
      });

      const upiUrl = `upi://pay?${upiParams.toString()}`;

      console.log('✅ Generated UPI URL for amount:', formattedAmount);

      // Update QR code data
      setQrData(upiUrl);

      return upiUrl;

    } catch (error) {
      console.error('❌ Error generating QR code data:', error);
      return '';
    }
  };
  // Handle delete invoice
  const handleDeleteInvoice = async () => {
    if (!invoiceData || !invoiceData.voucherId) return;

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`${baseurl}/transactions/${invoiceData.voucherId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      const result = await response.json();

      setShowDeleteModal(false);
      alert('Invoice deleted successfully!');

      navigate('/sales/invoices');

      console.log('Invoice deleted successfully:', result);

    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (invoiceData && invoiceData.items) {
      const timer = setTimeout(() => {
        generateQRCodeData();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [invoiceData, editableOrderMode]);
  useEffect(() => {
    if (location.state && location.state.invoiceData) {
      console.log('📦 Received data from Period component:', location.state.invoiceData);

      const periodData = location.state.invoiceData;
      console.log('🔍 Credit Data Check in periodInvoiceData:', {
        customerInfo: periodData.customerInfo,
        fullAccountDetails: periodData.fullAccountDetails,
        hasCreditLimit: !!periodData.customerInfo?.credit_limit,
        hasUnpaidAmount: !!periodData.customerInfo?.unpaid_amount,
        hasBalanceAmount: !!periodData.customerInfo?.balance_amount,
        credit_limit_value: periodData.customerInfo?.credit_limit,
        unpaid_amount_value: periodData.customerInfo?.unpaid_amount,
        balance_amount_value: periodData.customerInfo?.balance_amount
      });
      setPeriodInvoiceData(periodData);
      setFromPeriod(true);
      setLoading(false);

      const transformedData = transformPeriodDataToInvoiceFormat(periodData);
      setInvoiceData(transformedData);

      const descObj = {};
      transformedData.items.forEach((item, index) => {
        descObj[item.id || index] = item.description || '';
      });
      setEditableDescriptions(descObj);
      setEditableNote(transformedData.note || '');

    } else {
      console.log('🔍 Loading from transaction ID:', id);
      fetchTransactionData();
    }
  }, [id, location]);

  // const QRCodeGenerator = () => {
  //   const grandTotal = calculateGrandTotalForQR();
  //   const navigate = useNavigate();

  //   useEffect(() => {
  //     if (invoiceData && invoiceData.items && invoiceData.items.length > 0) {
  //       console.log("🔄 Regenerating QR with updated total:", grandTotal);
  //       generateQRCodeData();
  //     }
  //   }, [invoiceData, editableOrderMode, grandTotal]);

  //   if (!invoiceData) return null;

  //   const orderMode = (editableOrderMode || invoiceData.order_mode || "PAKKA").toUpperCase();

  //   const getCorrectGrandTotal = () => {
  //     if (!invoiceData || !invoiceData.items) return 0;

  //     let total = 0;

  //     invoiceData.items.forEach(item => {
  //       const quantity = parseFloat(item.quantity) || 1;
  //       const taxablePerUnit = parseFloat(item.taxable_amount) || 0;
  //       const taxPerUnit = parseFloat(item.tax_amount) || 0;

  //       const itemTaxable = taxablePerUnit * quantity;
  //       const itemTax = orderMode === "KACHA" ? 0 : taxPerUnit * quantity;
  //       const itemTotal = itemTaxable + itemTax;

  //       total += itemTotal;
  //     });

  //     return total;
  //   };

  //   const correctGrandTotal = getCorrectGrandTotal();

  //   const handleViewFullQR = () => {
  //     // Save QR data to localStorage for the new page
  //     localStorage.setItem('qrCodeData', qrData);
  //     localStorage.setItem('invoiceDataForQR', JSON.stringify(invoiceData));

  //     // Navigate to QR code page with state
  //     navigate('/qr-code', {
  //       state: {
  //         qrData: qrData,
  //         invoiceData: invoiceData,
  //         grandTotal: correctGrandTotal,
  //         orderMode: orderMode
  //       }
  //     });
  //   };

  //   return (
  //     <Card className="shadow-sm border-0 mb-3">
  //       <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
  //         <h6 className="mb-0"><FaQrcode className="me-2" /> Scan to Pay</h6>
  //         <Button 
  //           variant="light" 
  //           size="sm" 
  //           onClick={handleViewFullQR}
  //           className="no-print"
  //         >
  //           View Full Page
  //         </Button>
  //       </Card.Header>
  //       <Card.Body>
  //         <div className="text-center mb-3">
  //           <div className="qr-code-box d-inline-block">
  //             {qrData ? (
  //               <QRCodeCanvas 
  //                 value={qrData}
  //                 size={150}
  //                 level="H"
  //                 includeMargin={true}
  //               />
  //             ) : (
  //               <div className="p-3">
  //                 <div className="spinner-border text-primary" role="status">
  //                   <span className="visually-hidden">Generating QR...</span>
  //                 </div>
  //               </div>
  //             )}
  //           </div>

  //           {/* Amount Display */}
  //           <div className="mt-3">
  //             <h5 className="text-success fw-bold mb-1">₹{correctGrandTotal.toFixed(2)}</h5>
  //             <span className={`badge ${orderMode === "KACHA" ? "bg-warning" : "bg-success"}`}>
  //               {orderMode} ORDER
  //             </span>
  //           </div>

  //           {/* Button to view full page */}
  //           <Button 
  //             variant="outline-primary" 
  //             size="sm" 
  //             onClick={handleViewFullQR}
  //             className="mt-3 w-100 no-print"
  //           >
  //             Open QR Code in Full Page
  //           </Button>
  //         </div>
  //       </Card.Body>
  //     </Card>
  //   );
  // };

  if (loading) {
    return (
      <div className="invoice-preview-page">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !invoiceData) {
    return (
      <div className="invoice-preview-page">
        <Container>
          <div className="text-center p-5">
            <Alert variant="danger">
              <h5>Error Loading Invoice</h5>
              <p>{error}</p>
              <div className="mt-3">
                <Button variant="primary" onClick={() => window.location.reload()} className="me-2">
                  Try Again
                </Button>
                <Button variant="secondary" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  const displayInvoiceNumber = invoiceData?.invoiceNumber || 'INV001';
  const gstBreakdown = calculateGSTBreakdown();
  const isSameState = parseFloat(gstBreakdown.totalIGST) === 0;

  return (
    <div className="invoice-preview-page">
      {/* Action Bar */}
      <div className="action-bar bg-white shadow-sm p-3 mb-3 sticky-top d-print-none no-print">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Invoice Preview - {displayInvoiceNumber}</h4>
            <div>


              {fromPeriod && (
                <Button
                  variant="primary"
                  onClick={handleGenerateInvoice}
                  className="me-2"
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Invoice'}
                </Button>
              )}

              {isEditing ? (
                <>
                  <Button
                    variant="success"
                    onClick={handleSaveChanges}
                    className="me-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-1" /> Save Changes
                      </>
                    )}
                  </Button>


                  <Button
                    variant="secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="warning"
                  onClick={handleEdit}
                  className="me-2"
                >
                  <FaEdit className="me-1" /> Edit Note & Descriptions
                </Button>
              )}
              <Button
                variant="success"
                onClick={handlePrint}
                className="me-2"
                disabled={downloading || !invoiceData}
              >
                {downloading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-1" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Preparing Print...
                  </>
                ) : (
                  <>
                    <FaPrint className="me-1" /> Prints
                  </>
                )}
              </Button>

              <Button variant="secondary" onClick={() => window.history.back()}>
                <FaArrowLeft className="me-1" /> Go Back
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="d-print-none no-print">
          <Container fluid>
            <Alert variant="success" className="mb-3">
              {success}
            </Alert>
          </Container>
        </div>
      )}

      {error && invoiceData && (
        <div className="d-print-none no-print">
          <Container fluid>
            <Alert variant="warning" className="mb-3">
              <Alert.Heading>Using Local Data</Alert.Heading>
              <p className="mb-0">{error}</p>
              <Button variant="outline-warning" size="sm" onClick={() => window.location.reload()} className="mt-2">
                Retry API Connection
              </Button>
            </Alert>
          </Container>
        </div>
      )}

      {successMessage && (
        <div className="d-print-none no-print">
          <Container fluid>
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          </Container>
        </div>
      )}

      {errorMessage && (
        <div className="d-print-none no-print">
          <Container fluid>
            <Alert variant="danger" className="mb-3">
              {errorMessage}
            </Alert>
          </Container>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete invoice <strong>{displayInvoiceNumber}</strong>?</p>
          <p className="text-danger">This action cannot be undone and will also update the stock values.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteInvoice} disabled={deleting}>
            {deleting ? (
              <>
                <div className="spinner-border spinner-border-sm me-1" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Deleting...
              </>
            ) : (
              'Delete Invoice'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Container fluid className="invoice-preview-container-order">
        <Row>
          <Col lg={8}>
            <InvoicePreview_preview
              invoiceData={invoiceData}
              isEditing={isEditing}
              editableNote={editableNote}
              editableDescriptions={editableDescriptions}
              onNoteChange={handleNoteChange}
              onDescriptionChange={handleDescriptionChange}
              gstBreakdown={gstBreakdown}
              isSameState={isSameState}
              onOrderModeChange={handleOrderModeChange}
              onTransportChange={handleTransportChange}   // ← ADD
              transportDetails={transportDetails}         // ← ADD
            />
          </Col>

          <Col lg={4}>
            <div className="sticky-top" style={{ top: '80px' }}>
              <QRCodeGenerator
                invoiceData={invoiceData}
                editableOrderMode={editableOrderMode}
                onQrDataGenerated={(qrUrl) => setQrData(qrUrl)}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Period_InvoicePDFPreview;