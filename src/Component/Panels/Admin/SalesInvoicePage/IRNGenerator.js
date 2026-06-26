// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import IRNForm from './IRNForm';
// import IRNResults from './IRNResults';
// import './IRNStyles.css';

// const IRNGenerator = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     username: 'adqgsphpusr1',
//     password: 'Gsp@1234',
//     invoiceId: '',
//     sellerGstin: '02AMBPG7773M002',
//     accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJnc3AiXSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9TQl9BUElfRVdCIiwiUk9MRV9TQl9BUElfR1NUX0NPTU1PTiIsIlJPTEVfU0JfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9FX0FQSV9FV0IiLCJST0xFX1NCX0VfQVBJX0dTVF9DT01NT04iLCJST0xFX1NCX0VfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9BUElfRUkiLCJST0xFX1NCX0VfQVBJX0VJIiwiUk9MRV9TQl9BUElfR1NQX09USEVSUyJdLCJqdGkiOiIzOGVmOTlmNi05ZDQxLTQ4NmYtYjlhYy00YTA4Zjk5NTZiY2EiLCJjbGllbnRfaWQiOiI3OTUzNkUzOUYyMTY0NDk4ODM3MjBDQ0Q1MzY0M0Q4RiIsInN1YiI6Ijc5NTM2RTM5RjIxNjQ0OTg4MzcyMENDRDUzNjQzRDhGIiwiZXhwIjoxNzgxNTA2ODgyfQ.TJF16LJTUjWbGldZLOGepkD4fAvpn2AwD6721P3_f6U'
//   });

//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [invoiceData, setInvoiceData] = useState(null);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [mappedRequestData, setMappedRequestData] = useState(null);

//   const getStateCodeFromGSTIN = (gstin) => {
//     if (!gstin || gstin === "URP") return "";
//     return gstin.substring(0, 2);
//   };

//   const getValidUQC = (unit) => {
//     const unitMap = {
//       PIECES: "NOS",
//       PIECE: "NOS",
//       PCS: "NOS",
//       BAGS: "BAG",
//       BAGS: "BAG",
//       KG: "KGS",
//       KGS: "KGS",
//       LTR: "LTR",
//       LITRE: "LTR",
//       METER: "MTR",
//       METERS: "MTR"
//     };

//     return unitMap[String(unit || "").toUpperCase()] || "NOS";
//   };

//   const getValidHSN = (hsn) => {
//     const code = String(hsn || "").trim();

//     if (/^\d{6,8}$/.test(code)) {
//       return code;
//     }

//     return "100630"; // fallback only
//   };

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       setFormData(prev => ({ ...prev, accessToken: token }));
//     }

//     // Get e-invoice data from navigation state
//     const einvoiceData = location.state?.einvoiceData;

//     if (einvoiceData) {
//       console.log('Received e-invoice data:', einvoiceData);
//       const mappedData = mapEInvoiceToAPIFormat(einvoiceData);
//       setMappedRequestData(mappedData);

//       // Update form data with values from e-invoice
//       setFormData(prev => ({
//         ...prev,
//         invoiceId: einvoiceData.invoice?.invoiceNumber || '',
//         sellerGstin: einvoiceData.companyInfo?.gstin || ''
//       }));
//     } else {
//       setError('No e-invoice data received. Please generate e-invoice first.');
//     }
//   }, [location]);

//   // Map e-invoice JSON to API required format
//   const mapEInvoiceToAPIFormat = (einvoiceData) => {
//     // Determine transaction type
//     const isB2B = einvoiceData.invoice?.bb_bc === 'b2b' || einvoiceData.customerInfo?.gstin

//     //         const sellerStateCode = getStateCodeFromGSTIN(
//     //   einvoiceData.companyInfo?.gstin
//     // );

//     const sellerStateCode = "02";

//     const buyerStateCode = getStateCodeFromGSTIN(
//       einvoiceData.customerInfo?.gstin
//     );

//     const isIntraState =
//       sellerStateCode &&
//       buyerStateCode &&
//       sellerStateCode === buyerStateCode;

//     // Parse invoice date to DD/MM/YYYY format
//     const parseDate = (dateString) => {
//       if (!dateString) return new Date().toLocaleDateString('en-GB');
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-GB');
//     };

//     // Prepare item list
//     const itemList = (einvoiceData.items || []).map((item, index) => {
//       const taxableAmount = parseFloat(item.taxableAmount) || (item.quantity * item.price);
//       const discountAmount = parseFloat(item.discountAmount) || (taxableAmount * (item.discount / 100));
//       const assessableAmount = taxableAmount - discountAmount;
//       const gstAmount = parseFloat(item.gstAmount) || (assessableAmount * (item.gstPercentage / 100));

//       const isIGST = parseFloat(item.igstPercentage) > 0;
//       const isCGST_SGST = parseFloat(item.cgstPercentage) > 0 && parseFloat(item.sgstPercentage) > 0;

//       const igstAmount = isIGST ? gstAmount : 0;
//       const cgstAmount = isCGST_SGST ? gstAmount / 2 : 0;
//       const sgstAmount = isCGST_SGST ? gstAmount / 2 : 0;

//       return {
//         SlNo: (index + 1).toString(),
//         PrdDesc: item.product || item.description || "Product",
//         IsServc: "N",
//         HsnCd: getValidHSN(item.hsnCode),
//         Barcde:
//           String(item.productId || "").length >= 3
//             ? String(item.productId)
//             : "123456",
//         Qty: parseFloat(item.quantity) || 0,
//         FreeQty: 0,
//         Unit: getValidUQC(item.unit),
//         UnitPrice: parseFloat(item.price) || 0,
//         TotAmt: taxableAmount,
//         Discount: parseFloat(item.discount) || 0,
//         PreTaxVal: assessableAmount,
//         AssAmt: assessableAmount,
//         GstRt: parseFloat(item.gstPercentage) || 0,
//         IgstAmt: igstAmount,
//         CgstAmt: cgstAmount,
//         SgstAmt: sgstAmount,
//         CesRt: parseFloat(item.cess) || 0,
//         CesAmt: 0,
//         CesNonAdvlAmt: 0,
//         StateCesRt: 0,
//         StateCesAmt: 0,
//         StateCesNonAdvlAmt: 0,
//         OthChrg: 0,
//         TotItemVal: parseFloat(item.totalAmount) || (assessableAmount + gstAmount),
//         OrdLineRef: item.slNo?.toString() || (index + 1).toString(),
//         PrdSlNo:
//           String(item.productId || "").length > 0
//             ? String(item.productId)
//             : "123456",
//         BchDtls: item.batch ? {
//           Nm: item.batch,
//           Expdt: "",
//           wrDt: ""
//         } : null,
//         AttribDtls: []
//       };
//     });

//     // Calculate totals
//     const totalAssessableValue = itemList.reduce((sum, item) => sum + item.AssAmt, 0);
//     const totalIGST = itemList.reduce((sum, item) => sum + item.IgstAmt, 0);
//     const totalCGST = itemList.reduce((sum, item) => sum + item.CgstAmt, 0);
//     const totalSGST = itemList.reduce((sum, item) => sum + item.SgstAmt, 0);
//     const totalCess = itemList.reduce((sum, item) => sum + item.CesAmt, 0);
//     const totalStateCess = itemList.reduce((sum, item) => sum + item.StateCesAmt, 0);
//     const totalDiscount = itemList.reduce((sum, item) => sum + (item.TotAmt * item.Discount / 100), 0);
//     const totalItemValue = itemList.reduce((sum, item) => sum + item.TotItemVal, 0);

//     const roundOff = parseFloat(einvoiceData.financialSummary?.roundOff) || 0;
//     const additionalCharges = parseFloat(einvoiceData.financialSummary?.additionalChargesAmount) || 0;
//     const grandTotal = parseFloat(einvoiceData.financialSummary?.grandTotal) || totalItemValue;


//     // Prepare the complete API request body
//     const apiRequest = {
//       Version: "1.1",
//       TranDtls: {
//         TaxSch: "GST",
//         SupTyp: isB2B ? "B2B" : "B2C",
//         RegRev: "N",
//         // EcmGstin: null,
//         IgstOnIntra: isIntraState ? "N" : "Y"
//       },
//       DocDtls: {
//         Typ: "INV",
//         No: einvoiceData.invoice?.invoiceNumber || "",
//         Dt: parseDate(einvoiceData.invoice?.invoiceDate)
//       },
//       SellerDtls: {
//         // Gstin: einvoiceData.companyInfo?.gstin || "",
//         Gstin: "02AMBPG7773M002",
//         LglNm: einvoiceData.companyInfo?.name || "",
//         TrdNm: einvoiceData.companyInfo?.name || "",
//         Addr1: einvoiceData.companyInfo?.address?.split(',')[0] || "",
//         Addr2: einvoiceData.companyInfo?.address?.split(',').slice(1).join(',') || "",
//         Loc: einvoiceData.companyInfo?.state?.toUpperCase() || "",
//         Pin: parseInt(einvoiceData.companyInfo?.address?.match(/\d{6}/)?.[0]) || 0,
//         Stcd: einvoiceData.companyInfo?.stateCode || "",
//         Ph: einvoiceData.companyInfo?.phone?.replace(/\D/g, '').slice(0, 10) || "9999999999",
//         Em: (
//           einvoiceData.companyInfo?.email &&
//           einvoiceData.companyInfo.email.length >= 6
//         )
//           ? einvoiceData.companyInfo.email
//           : "seller@gmail.com"
//       },
//       BuyerDtls: {
//         Gstin: einvoiceData.customerInfo?.gstin || "URP",
//         LglNm: einvoiceData.customerInfo?.businessName || einvoiceData.customerInfo?.name || "Consumer",
//         TrdNm: einvoiceData.customerInfo?.name || "Consumer",
//         Pos: buyerStateCode || sellerStateCode,
//         Addr1: einvoiceData.billingAddress?.addressLine1 || "",
//         Addr2: einvoiceData.billingAddress?.addressLine2 || "",
//         Loc: einvoiceData.billingAddress?.city?.toUpperCase() || "",
//         Pin: parseInt(einvoiceData.billingAddress?.pincode) || 0,
//         Stcd: buyerStateCode || sellerStateCode,
//         Ph: einvoiceData.customerInfo?.mobileNumber?.replace(/\D/g, '').slice(0, 10) || "9999999999",
//         Em: (
//           einvoiceData.customerInfo?.email &&
//           einvoiceData.customerInfo.email.length >= 6
//         )
//           ? einvoiceData.customerInfo.email
//           : "buyer@gmail.com"
//       },
//       ItemList: itemList,
//       ValDtls: {
//         AssVal: totalAssessableValue,
//         CgstVal: totalCGST,
//         SgstVal: totalSGST,
//         IgstVal: totalIGST,
//         CesVal: totalCess,
//         StCesVal: totalStateCess,
//         Discount: totalDiscount,
//         OthChrg: additionalCharges,
//         RndOffAmt: roundOff,
//         TotInvVal: grandTotal,
//         TotInvValFc: grandTotal
//       }
//     };

//     console.log('Mapped API Request:', apiRequest);

//     console.log("Seller State:", sellerStateCode);
//     console.log("Buyer State:", buyerStateCode);
//     console.log("Intra State:", isIntraState);
//     console.log("Unit:", itemList[0]?.Unit);
//     console.log("HSN:", itemList[0]?.HsnCd);
//     return apiRequest;
//   };



//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const generateRequestId = () => {
//     return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
//   };



//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!mappedRequestData) {
//       setError("No e-invoice data available.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       // STEP 1: Generate IRN
//       const irnResponse = await axios.post(
//         "http://localhost:5000/api/generate-irn",
//         {
//           payload: {
//             ...mappedRequestData,
//             SellerDtls: {
//               Gstin: "02AMBPG7773M002",
//               LglNm: "NIC company pvt ltd",
//               TrdNm: "NIC Industries",
//               Addr1: "5th block, kuvempu layout",
//               Addr2: "kuvempu layout",
//               Loc: "GANDHINAGAR",
//               Pin: 175121,
//               Stcd: "02",
//               Ph: "9000000000",
//               Em: "abc@gmail.com"
//             }
//           },
//           username: formData.username,
//           password: formData.password,
//           gstin:
//             formData.sellerGstin ||
//             mappedRequestData?.SellerDtls?.Gstin,
//           accessToken: formData.accessToken,
//         }
//       );

//       console.log("IRN Response:", irnResponse.data);

//       // STEP 2: Generate QR Image
//       let qrResponse = null;

//       if (
//         irnResponse.data?.result?.SignedQRCode
//       ) {
//         qrResponse = await axios.post(
//           "http://localhost:5000/api/generate-qr-image",
//           {
//             signedQrCode:
//               irnResponse.data.result.SignedQRCode,
//             gstin:
//               mappedRequestData.SellerDtls.Gstin,
//             invoiceCode:
//               mappedRequestData.DocDtls.No
//           }
//         );

//         console.log("QR Response:", qrResponse.data);
//       }

//       // Merge IRN + QR Data
//       const finalData = {
//         ...irnResponse.data,
//         qrImage: qrResponse?.data || null
//       };

//       setInvoiceData(finalData);
//       setSuccess(true);

//     } catch (err) {
//       console.error(err);

//       setError(
//         err.response?.data?.message ||
//         err.message ||
//         "Failed to generate IRN/QR"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoBack = () => {
//     navigate(-1);
//   };

//   const clearAlert = () => {
//     setError(null);
//     setSuccess(false);
//   };

//   if (!mappedRequestData && !loading) {
//     return (
//       <div className="irn-generator-container">
//         <div className="irn-header">
//           <h1>IRN Generation System</h1>
//           <p>Generate Invoice Reference Number for GST invoices</p>
//         </div>

//         <div className="alert alert-error">
//           <div className="alert-content">
//             <span>❌ No e-invoice data received. Please generate e-invoice first.</span>
//           </div>
//         </div>

//         <button className="btn btn-primary" onClick={handleGoBack}>
//           ← Go Back to E-Invoice
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="irn-generator-container">
//       <div className="irn-header">
//         <h1>IRN Generation System</h1>
//         <p>Generate Invoice Reference Number for GST invoices</p>
//         <button className="btn btn-secondary btn-sm" onClick={handleGoBack}>
//           ← Back
//         </button>
//       </div>

//       {success && (
//         <div className="alert alert-success" onClick={clearAlert}>
//           <div className="alert-content">
//             <span>✅ IRN created successfully!</span>
//             <button className="alert-close">×</button>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="alert alert-error" onClick={clearAlert}>
//           <div className="alert-content">
//             <span>❌ Error: {error}</span>
//             <button className="alert-close">×</button>
//           </div>
//         </div>
//       )}

//       {/* Display mapped data summary */}
//       {mappedRequestData && (
//         <div className="mapped-data-summary" style={{
//           background: '#f8f9fa',
//           padding: '15px',
//           borderRadius: '8px',
//           marginBottom: '20px',
//           fontSize: '14px'
//         }}>
//           <h5>📋 Invoice Summary (Ready for IRN Generation)</h5>
//           <div className="row">
//             <div className="col-md-3">
//               <strong>Invoice No:</strong> {mappedRequestData.DocDtls?.No}
//             </div>
//             <div className="col-md-3">
//               <strong>Invoice Date:</strong> {mappedRequestData.DocDtls?.Dt}
//             </div>
//             <div className="col-md-3">
//               <strong>Total Value:</strong> ₹{mappedRequestData.ValDtls?.TotInvVal?.toFixed(2)}
//             </div>
//             <div className="col-md-3">
//               <strong>Items Count:</strong> {mappedRequestData.ItemList?.length}
//             </div>
//           </div>
//           <div className="row mt-2">
//             <div className="col-md-6">
//               <strong>Seller GSTIN:</strong> {mappedRequestData.SellerDtls?.Gstin}
//             </div>
//             <div className="col-md-6">
//               <strong>Buyer GSTIN:</strong> {mappedRequestData.BuyerDtls?.Gstin}
//             </div>
//           </div>
//         </div>
//       )}

//       <IRNForm
//         formData={formData}
//         branches={branches}
//         loading={loading}
//         onChange={handleInputChange}
//         onSubmit={handleSubmit}
//         hideInvoiceFields={true} // Hide invoice fields since data is from e-invoice
//       />

//       {invoiceData && <IRNResults invoiceData={invoiceData} />}

//       {/* Display the actual request JSON being sent */}
//       {mappedRequestData && (
//         <details style={{ marginTop: '20px' }}>
//           <summary style={{ cursor: 'pointer', color: '#6c757d' }}>
//             🔍 View API Request JSON
//           </summary>
//           <pre style={{
//             background: '#f8f9fa',
//             padding: '15px',
//             borderRadius: '8px',
//             overflow: 'auto',
//             maxHeight: '400px',
//             marginTop: '10px',
//             fontSize: '12px'
//           }}>
//             {JSON.stringify(mappedRequestData, null, 2)}
//           </pre>
//         </details>
//       )}
//     </div>
//   );
// };

// export default IRNGenerator;




import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IRNForm from './IRNForm';
import IRNResults from './IRNResults';
import './IRNStyles.css';
import { baseurl } from '../../../BaseURL/BaseURL';

const IRNGenerator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: 'adqgsphpusr1',
    password: 'Gsp@1234',
    invoiceId: '',
    sellerGstin: '02AMBPG7773M002',
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJnc3AiXSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9TQl9BUElfRVdCIiwiUk9MRV9TQl9BUElfR1NUX0NPTU1PTiIsIlJPTEVfU0JfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9FX0FQSV9FV0IiLCJST0xFX1NCX0VfQVBJX0dTVF9DT01NT04iLCJST0xFX1NCX0VfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9BUElfRUkiLCJST0xFX1NCX0VfQVBJX0VJIiwiUk9MRV9TQl9BUElfR1NQX09USEVSUyJdLCJqdGkiOiJkYmM2NTMzYS1lZGRmLTRmNTAtYWE1Zi1jMWUwZGY5ZTdhODkiLCJjbGllbnRfaWQiOiI3OTUzNkUzOUYyMTY0NDk4ODM3MjBDQ0Q1MzY0M0Q4RiIsInN1YiI6Ijc5NTM2RTM5RjIxNjQ0OTg4MzcyMENDRDUzNjQzRDhGIiwiZXhwIjoxNzg0MDk1MzQ1fQ.8K70oxT_pa13d9FQR7NAl34T9g6VinGb9vE2Prop5FQ'
  });

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mappedRequestData, setMappedRequestData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Static Seller Details
  const staticSellerDetails = {
    Gstin: "02AMBPG7773M002",
    LglNm: "NIC company pvt ltd",
    TrdNm: "NIC Industries",
    Addr1: "5th block, kuvempu layout",
    Addr2: "kuvempu layout",
    Loc: "GANDHINAGAR",
    Pin: 175121,
    Stcd: "02",
    Ph: "9000000000",
    Em: "abc@gmail.com"
  };

  const getStateCodeFromGSTIN = (gstin) => {
    if (!gstin || gstin === "URP") return "";
    return gstin.substring(0, 2);
  };

  const getValidUQC = (unit) => {
    const unitMap = {
      PIECES: "NOS",
      PIECE: "NOS",
      PCS: "NOS",
      BAGS: "BAG",
      KG: "KGS",
      KGS: "KGS",
      LTR: "LTR",
      LITRE: "LTR",
      METER: "MTR",
      METERS: "MTR"
    };
    return unitMap[String(unit || "").toUpperCase()] || "NOS";
  };

  const getValidHSN = (hsn) => {
    const code = String(hsn || "").trim();
    if (/^\d{6,8}$/.test(code)) {
      return code;
    }
    return "100630";
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setFormData(prev => ({ ...prev, accessToken: token }));
    }

    const einvoiceData = location.state?.einvoiceData;

    if (einvoiceData) {
      console.log('Received e-invoice data:', einvoiceData);
      const mappedData = mapEInvoiceToAPIFormat(einvoiceData, 'intra'); // Start with intra-state
      setMappedRequestData(mappedData);

      setFormData(prev => ({
        ...prev,
        invoiceId: einvoiceData.invoice?.invoiceNumber || '',
        sellerGstin: staticSellerDetails.Gstin
      }));
    } else {
      setError('No e-invoice data received. Please generate e-invoice first.');
    }
  }, [location]);

  const mapEInvoiceToAPIFormat = (einvoiceData, transactionType) => {
    const isB2B = einvoiceData.invoice?.bb_bc === 'b2b' || einvoiceData.customerInfo?.gstin;

    const sellerStateCode = staticSellerDetails.Stcd;
    const buyerGSTIN = einvoiceData.customerInfo?.gstin;
    let buyerStateCode = getStateCodeFromGSTIN(buyerGSTIN);
    let buyerPincode = einvoiceData.billingAddress?.pincode || 800001;

    if (!buyerGSTIN || buyerGSTIN === "URP") {
      buyerStateCode = "10";
      buyerPincode = 800001;
    }

    const parseDate = (dateString) => {
      if (!dateString) return new Date().toLocaleDateString('en-GB');
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    };

    // Calculate taxes based on transaction type parameter
    const itemList = (einvoiceData.items || []).map((item, index) => {
      const taxableAmount = parseFloat(item.taxableAmount) || (item.quantity * item.price);
      const discountAmount = parseFloat(item.discountAmount) || (taxableAmount * (item.discount / 100));
      const assessableAmount = taxableAmount - discountAmount;
      const gstPercentage = parseFloat(item.gstPercentage) || 0;
      const totalGstAmount = assessableAmount * (gstPercentage / 100);

      let igstAmount = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;

      if (transactionType === 'intra') {
        // INTRA-STATE: Only CGST and SGST
        cgstAmount = totalGstAmount / 2;
        sgstAmount = totalGstAmount / 2;
        igstAmount = 0;
      } else {
        // INTER-STATE: Only IGST
        igstAmount = totalGstAmount;
        cgstAmount = 0;
        sgstAmount = 0;
      }

      return {
        SlNo: (index + 1).toString(),
        PrdDesc: item.product || item.description || "Product",
        IsServc: "N",
        HsnCd: getValidHSN(item.hsnCode),
        Barcde: String(item.productId || "").length >= 3 ? String(item.productId) : "123456",
        Qty: parseFloat(item.quantity) || 0,
        FreeQty: 0,
        Unit: getValidUQC(item.unit),
        UnitPrice: parseFloat(item.price) || 0,
        TotAmt: taxableAmount,
        Discount: parseFloat(item.discount) || 0,
        PreTaxVal: assessableAmount,
        AssAmt: assessableAmount,
        GstRt: gstPercentage,
        IgstAmt: igstAmount,
        CgstAmt: cgstAmount,
        SgstAmt: sgstAmount,
        CesRt: parseFloat(item.cess) || 0,
        CesAmt: 0,
        CesNonAdvlAmt: 0,
        StateCesRt: 0,
        StateCesAmt: 0,
        StateCesNonAdvlAmt: 0,
        OthChrg: 0,
        TotItemVal: assessableAmount + totalGstAmount,
        OrdLineRef: (index + 1).toString(),
        PrdSlNo: String(item.productId || "").length > 0 ? String(item.productId) : "123456"
      };
    });

    const totalAssessableValue = itemList.reduce((sum, item) => sum + item.AssAmt, 0);
    const totalIGST = itemList.reduce((sum, item) => sum + item.IgstAmt, 0);
    const totalCGST = itemList.reduce((sum, item) => sum + item.CgstAmt, 0);
    const totalSGST = itemList.reduce((sum, item) => sum + item.SgstAmt, 0);
    const totalDiscount = itemList.reduce((sum, item) => sum + (item.TotAmt * item.Discount / 100), 0);
    const totalItemValue = itemList.reduce((sum, item) => sum + item.TotItemVal, 0);

    const roundOff = parseFloat(einvoiceData.financialSummary?.roundOff) || 0;
    const additionalCharges = parseFloat(einvoiceData.financialSummary?.additionalChargesAmount) || 0;
    const grandTotal = parseFloat(einvoiceData.financialSummary?.grandTotal) || totalItemValue;

    const apiRequest = {
      Version: "1.1",
      TranDtls: {
        TaxSch: "GST",
        SupTyp: isB2B ? "B2B" : "B2C",
        RegRev: "N",
        IgstOnIntra: "N"
      },
      DocDtls: {
        Typ: "INV",
        No: String(einvoiceData.invoice?.invoiceNumber || ""),
        Dt: parseDate(einvoiceData.invoice?.invoiceDate)
      },
      SellerDtls: {
        Gstin: String(staticSellerDetails.Gstin),
        LglNm: String(staticSellerDetails.LglNm),
        TrdNm: String(staticSellerDetails.TrdNm),
        Addr1: String(staticSellerDetails.Addr1),
        Addr2: String(staticSellerDetails.Addr2),
        Loc: String(staticSellerDetails.Loc),
        Pin: Number(staticSellerDetails.Pin),
        Stcd: String(staticSellerDetails.Stcd),
        Ph: String(staticSellerDetails.Ph),
        Em: String(staticSellerDetails.Em)
      },
      BuyerDtls: {
        Gstin: String(buyerGSTIN || "URP"),
        LglNm: String(einvoiceData.customerInfo?.businessName || einvoiceData.customerInfo?.name || "Buyer Company"),
        TrdNm: String(einvoiceData.customerInfo?.name || "Buyer"),
        Pos: String(buyerStateCode),
        Addr1: String(einvoiceData.billingAddress?.addressLine1 || "Commercial Complex"),
        Addr2: String(einvoiceData.billingAddress?.addressLine2 || "Sector 1"),
        Loc: String(buyerStateCode === "02" ? "GANDHINAGAR" : "PATNA"),
        Pin: Number(buyerPincode),
        Stcd: String(buyerStateCode),
        Ph: String(einvoiceData.customerInfo?.mobileNumber?.replace(/\D/g, '').slice(0, 10) || "9876543210"),
        Em: String(einvoiceData.customerInfo?.email || "buyer@company.com")
      },
      ItemList: itemList,
      ValDtls: {
        AssVal: Number(totalAssessableValue.toFixed(2)),
        CgstVal: Number(totalCGST.toFixed(2)),
        SgstVal: Number(totalSGST.toFixed(2)),
        IgstVal: Number(totalIGST.toFixed(2)),
        CesVal: 0,
        StCesVal: 0,
        Discount: Number(totalDiscount.toFixed(2)),
        OthChrg: Number(additionalCharges.toFixed(2)),
        RndOffAmt: Number(roundOff.toFixed(2)),
        TotInvVal: Number(grandTotal.toFixed(2)),
        TotInvValFc: Number(grandTotal.toFixed(2))
      }
    };

    console.log(`=== ${transactionType.toUpperCase()}-STATE TRANSACTION ===`);
    console.log("Transaction Type:", transactionType.toUpperCase());
    console.log("IgstOnIntra:", transactionType === 'intra' ? "N" : "Y");
    console.log("IGST Amount:", totalIGST);
    console.log("CGST Amount:", totalCGST);
    console.log("SGST Amount:", totalSGST);
    console.log("=====================================");

    return apiRequest;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendRequestWithRetry = async (einvoiceData, transactionType) => {
    const requestData = mapEInvoiceToAPIFormat(einvoiceData, transactionType);

    console.log(`Attempting with ${transactionType.toUpperCase()} transaction...`);

    const response = await axios.post(
      `${baseurl}/api/generate-irn`,
      {
        payload: requestData,
        username: formData.username,
        password: formData.password,
        gstin: staticSellerDetails.Gstin,
        accessToken: formData.accessToken,
      }
    );

    return { response: response.data, transactionType };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const einvoiceData = location.state?.einvoiceData;

    if (!einvoiceData) {
      setError("No e-invoice data available.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Try INTRA-STATE first
      console.log("=== TRYING INTRA-STATE TRANSACTION FIRST ===");
      let result = await sendRequestWithRetry(einvoiceData, 'intra');
      let irnResponse = result.response;
      let currentType = result.transactionType;

      // Check if we need to retry with INTER-STATE
      if (!irnResponse.success) {
        const errorMessage = irnResponse.message || '';

        // If error indicates we need inter-state (2174 error)
        if (errorMessage.includes('2174') ||
          (errorMessage.includes('CGST') && errorMessage.includes('SGST') && errorMessage.includes('not applicable'))) {
          console.log("Intra-state failed, trying INTER-STATE...");
          result = await sendRequestWithRetry(einvoiceData, 'inter');
          irnResponse = result.response;
          currentType = result.transactionType;
        }
        // If error indicates we need intra-state (2262 or 2294 error)
        else if (errorMessage.includes('2262') || errorMessage.includes('2294')) {
          console.log("Inter-state required but we already tried intra-state, keeping intra-state");
          // Already using intra-state, so just keep it
        }
      }

      console.log(`Final response from ${currentType.toUpperCase()} transaction:`, irnResponse);

      let qrResponse = null;

      if (irnResponse?.success && irnResponse?.result?.SignedQRCode) {
        qrResponse = await axios.post(
          `${baseurl}/api/generate-qr-image`,
          {
            signedQrCode: irnResponse.result.SignedQRCode,
            gstin: staticSellerDetails.Gstin,
            invoiceCode: einvoiceData.invoice?.invoiceNumber || ""
          }
        );
        console.log("QR Response:", qrResponse.data);
      }

      const finalData = {
        ...irnResponse,
        qrImage: qrResponse?.data || null,
        transactionTypeUsed: currentType
      };

      setInvoiceData(finalData);

      if (irnResponse?.success) {
        setSuccess(true);
      } else {
        setError(irnResponse?.message || "Failed to generate IRN");
      }

    } catch (err) {
      console.error("Error details:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to generate IRN/QR"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const clearAlert = () => {
    setError(null);
    setSuccess(false);
  };

  if (!mappedRequestData && !loading) {
    return (
      <div className="irn-generator-container">
        <div className="irn-header">
          <h1>IRN Generation System</h1>
          <p>Generate Invoice Reference Number for GST invoices</p>
        </div>

        <div className="alert alert-error">
          <div className="alert-content">
            <span>❌ No e-invoice data received. Please generate e-invoice first.</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleGoBack}>
          ← Go Back to E-Invoice
        </button>
      </div>
    );
  }

  return (
    <div className="irn-generator-container">
      <div className="irn-header">
        <h1>IRN Generation System</h1>
        <p>Generate Invoice Reference Number for GST invoices</p>
        <button className="btn btn-secondary btn-sm" onClick={handleGoBack}>
          ← Back
        </button>
      </div>

      {success && (
        <div className="alert alert-success" onClick={clearAlert}>
          <div className="alert-content">
            <span>✅ IRN created successfully! (Used {invoiceData?.transactionTypeUsed?.toUpperCase()} transaction)</span>
            <button className="alert-close">×</button>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error" onClick={clearAlert}>
          <div className="alert-content">
            <span>❌ Error: {error}</span>
            <button className="alert-close">×</button>
          </div>
        </div>
      )}

      {mappedRequestData && (
        <div className="mapped-data-summary" style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <h5>📋 Invoice Summary (Auto-detecting Transaction Type)</h5>
          <div className="row">
            <div className="col-md-3">
              <strong>Invoice No:</strong> {mappedRequestData.DocDtls?.No}
            </div>
            <div className="col-md-3">
              <strong>Invoice Date:</strong> {mappedRequestData.DocDtls?.Dt}
            </div>
            <div className="col-md-3">
              <strong>Total Value:</strong> ₹{mappedRequestData.ValDtls?.TotInvVal?.toFixed(2)}
            </div>
            <div className="col-md-3">
              <strong>Items:</strong> {mappedRequestData.ItemList?.length}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-12">
              <strong>Note:</strong> System will automatically try both transaction types to find the correct one
            </div>
          </div>
        </div>
      )}

      <IRNForm
        formData={formData}
        branches={branches}
        loading={loading}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        hideInvoiceFields={true}
      />

      {invoiceData && invoiceData.success && <IRNResults invoiceData={invoiceData} />}

      {mappedRequestData && (
        <details style={{ marginTop: '20px' }}>
          <summary style={{ cursor: 'pointer', color: '#6c757d' }}>
            🔍 View API Request JSON
          </summary>
          <pre style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '400px',
            marginTop: '10px',
            fontSize: '12px'
          }}>
            {JSON.stringify(mappedRequestData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default IRNGenerator;
