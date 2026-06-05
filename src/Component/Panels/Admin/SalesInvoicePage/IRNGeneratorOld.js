// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import IRNForm from './IRNForm';
// import IRNResults from './IRNResults';
// import './IRNStyles.css';

// const IRNGenerator = () => {
//   const [formData, setFormData] = useState({
//     username: 'adqgsphpusr1',
//     password: 'Gsp@1234',
//     invoiceId: 'SSA/000004/26-27',
//     // branchId: '',
//     sellerGstin: '02AMBPG7773M002',
//     accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJnc3AiXSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9TQl9BUElfRVdCIiwiUk9MRV9TQl9BUElfR1NUX0NPTU1PTiIsIlJPTEVfU0JfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9FX0FQSV9FV0IiLCJST0xFX1NCX0VfQVBJX0dTVF9DT01NT04iLCJST0xFX1NCX0VfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9BUElfRUkiLCJST0xFX1NCX0VfQVBJX0VJIiwiUk9MRV9TQl9BUElfR1NQX09USEVSUyJdLCJqdGkiOiIzOGVmOTlmNi05ZDQxLTQ4NmYtYjlhYy00YTA4Zjk5NTZiY2EiLCJjbGllbnRfaWQiOiI3OTUzNkUzOUYyMTY0NDk4ODM3MjBDQ0Q1MzY0M0Q4RiIsInN1YiI6Ijc5NTM2RTM5RjIxNjQ0OTg4MzcyMENDRDUzNjQzRDhGIiwiZXhwIjoxNzgxNTA2ODgyfQ.TJF16LJTUjWbGldZLOGepkD4fAvpn2AwD6721P3_f6U'
//   });
  
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [invoiceData, setInvoiceData] = useState(null);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       setFormData(prev => ({ ...prev, accessToken: token }));
//     }
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Generate unique request ID
//   const generateRequestId = () => {
//     return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(false);
//     setInvoiceData(null);

//     try {
//       // Prepare request data (body) - according to API specification
//       const requestData = {
//         invoiceId: formData.invoiceId, // Don't parseInt if it's a string like "SSA/000004/26-27"
//         branchId: parseInt(formData.branchId),
//         sellerGstin: formData.sellerGstin
//       };

//       // Prepare headers according to the correct PHP format
//       const headers = {
//         'Content-Type': 'application/json',
//         'user_name': formData.username,
//         'password': formData.password,
//         'gstin': formData.sellerGstin, // GSTIN goes in headers
//         'requestid': generateRequestId(),
//         'Authorization': `Bearer ${formData.accessToken}`
//       };

//       console.log('Headers:', headers);
//       console.log('Request Data:', requestData);

//       const response = await axios.post(
//         "https://gsp.adaequare.com/test/enriched/ei/api/invoice",
//         requestData, // Body data
//         { headers: headers } // Headers
//       );

//       if (response.data.success) {
//         setInvoiceData(response.data.data);
//         setSuccess(true);
//         if (formData.accessToken) {
//           localStorage.setItem('accessToken', formData.accessToken);
//         }
//         setTimeout(() => setSuccess(false), 5000);
//       } else {
//         setError(response.data.message || 'Failed to generate IRN');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || 'An error occurred');
//       console.error('Error details:', err.response?.data || err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearAlert = () => {
//     setError(null);
//     setSuccess(false);
//   };

//   return (
//     <div className="irn-generator-container">
//       <div className="irn-header">
//         <h1>IRN Generation System</h1>
//         <p>Generate Invoice Reference Number for GST invoices</p>
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

//       <IRNForm
//         formData={formData}
//         branches={branches}
//         loading={loading}
//         onChange={handleInputChange}
//         onSubmit={handleSubmit}
//       />

//       {invoiceData && <IRNResults invoiceData={invoiceData} />}
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

const IRNGenerator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: 'adqgsphpusr1',
    password: 'Gsp@1234',
    invoiceId: '',
    sellerGstin: '',
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJnc3AiXSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9TQl9BUElfRVdCIiwiUk9MRV9TQl9BUElfR1NUX0NPTU1PTiIsIlJPTEVfU0JfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9FX0FQSV9FV0IiLCJST0xFX1NCX0VfQVBJX0dTVF9DT01NT04iLCJST0xFX1NCX0VfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9BUElfRUkiLCJST0xFX1NCX0VfQVBJX0VJIiwiUk9MRV9TQl9BUElfR1NQX09USEVSUyJdLCJqdGkiOiIzOGVmOTlmNi05ZDQxLTQ4NmYtYjlhYy00YTA4Zjk5NTZiY2EiLCJjbGllbnRfaWQiOiI3OTUzNkUzOUYyMTY0NDk4ODM3MjBDQ0Q1MzY0M0Q4RiIsInN1YiI6Ijc5NTM2RTM5RjIxNjQ0OTg4MzcyMENDRDUzNjQzRDhGIiwiZXhwIjoxNzgxNTA2ODgyfQ.TJF16LJTUjWbGldZLOGepkD4fAvpn2AwD6721P3_f6U'
  });
  
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mappedRequestData, setMappedRequestData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setFormData(prev => ({ ...prev, accessToken: token }));
    }

    // Get e-invoice data from navigation state
    const einvoiceData = location.state?.einvoiceData;
    
    if (einvoiceData) {
      console.log('Received e-invoice data:', einvoiceData);
      const mappedData = mapEInvoiceToAPIFormat(einvoiceData);
      setMappedRequestData(mappedData);
      
      // Update form data with values from e-invoice
      setFormData(prev => ({
        ...prev,
        invoiceId: einvoiceData.invoice?.invoiceNumber || '',
        sellerGstin: einvoiceData.companyInfo?.gstin || ''
      }));
    } else {
      setError('No e-invoice data received. Please generate e-invoice first.');
    }
  }, [location]);

  // Map e-invoice JSON to API required format
  const mapEInvoiceToAPIFormat = (einvoiceData) => {
    // Determine transaction type
    const isB2B = einvoiceData.invoice?.bb_bc === 'b2b' || einvoiceData.customerInfo?.gstin;
    const isIntraState = einvoiceData.companyInfo?.stateCode === einvoiceData.customerInfo?.state?.split(' ').pop();
    
    // Parse invoice date to DD/MM/YYYY format
    const parseDate = (dateString) => {
      if (!dateString) return new Date().toLocaleDateString('en-GB');
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    };

    // Prepare item list
    const itemList = (einvoiceData.items || []).map((item, index) => {
      const taxableAmount = parseFloat(item.taxableAmount) || (item.quantity * item.price);
      const discountAmount = parseFloat(item.discountAmount) || (taxableAmount * (item.discount / 100));
      const assessableAmount = taxableAmount - discountAmount;
      const gstAmount = parseFloat(item.gstAmount) || (assessableAmount * (item.gstPercentage / 100));
      
      const isIGST = parseFloat(item.igstPercentage) > 0;
      const isCGST_SGST = parseFloat(item.cgstPercentage) > 0 && parseFloat(item.sgstPercentage) > 0;
      
      const igstAmount = isIGST ? gstAmount : 0;
      const cgstAmount = isCGST_SGST ? gstAmount / 2 : 0;
      const sgstAmount = isCGST_SGST ? gstAmount / 2 : 0;
      
      return {
        SlNo: (index + 1).toString(),
        PrdDesc: item.product || item.description || "Product",
        IsServc: "N",
        HsnCd: item.hsnCode || "999999",
        Barcde: item.productId || "",
        Qty: parseFloat(item.quantity) || 0,
        FreeQty: 0,
        Unit: item.unit || "NOS",
        UnitPrice: parseFloat(item.price) || 0,
        TotAmt: taxableAmount,
        Discount: parseFloat(item.discount) || 0,
        PreTaxVal: assessableAmount,
        AssAmt: assessableAmount,
        GstRt: parseFloat(item.gstPercentage) || 0,
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
        TotItemVal: parseFloat(item.totalAmount) || (assessableAmount + gstAmount),
        OrdLineRef: item.slNo?.toString() || (index + 1).toString(),
        PrdSlNo: item.productId || "",
        BchDtls: item.batch ? {
          Nm: item.batch,
          Expdt: "",
          wrDt: ""
        } : null,
        AttribDtls: []
      };
    });

    // Calculate totals
    const totalAssessableValue = itemList.reduce((sum, item) => sum + item.AssAmt, 0);
    const totalIGST = itemList.reduce((sum, item) => sum + item.IgstAmt, 0);
    const totalCGST = itemList.reduce((sum, item) => sum + item.CgstAmt, 0);
    const totalSGST = itemList.reduce((sum, item) => sum + item.SgstAmt, 0);
    const totalCess = itemList.reduce((sum, item) => sum + item.CesAmt, 0);
    const totalStateCess = itemList.reduce((sum, item) => sum + item.StateCesAmt, 0);
    const totalDiscount = itemList.reduce((sum, item) => sum + (item.TotAmt * item.Discount / 100), 0);
    const totalItemValue = itemList.reduce((sum, item) => sum + item.TotItemVal, 0);
    
    const roundOff = parseFloat(einvoiceData.financialSummary?.roundOff) || 0;
    const additionalCharges = parseFloat(einvoiceData.financialSummary?.additionalChargesAmount) || 0;
    const grandTotal = parseFloat(einvoiceData.financialSummary?.grandTotal) || totalItemValue;

    // Prepare the complete API request body
    const apiRequest = {
      Version: "1.1",
      TranDtls: {
        TaxSch: "GST",
        SupTyp: isB2B ? "B2B" : "B2C",
        RegRev: "N",
        EcmGstin: null,
        IgstOnIntra: isIntraState ? "N" : "Y"
      },
      DocDtls: {
        Typ: "INV",
        No: einvoiceData.invoice?.invoiceNumber || "",
        Dt: parseDate(einvoiceData.invoice?.invoiceDate)
      },
      SellerDtls: {
        Gstin: einvoiceData.companyInfo?.gstin || "",
        LglNm: einvoiceData.companyInfo?.name || "",
        TrdNm: einvoiceData.companyInfo?.name || "",
        Addr1: einvoiceData.companyInfo?.address?.split(',')[0] || "",
        Addr2: einvoiceData.companyInfo?.address?.split(',').slice(1).join(',') || "",
        Loc: einvoiceData.companyInfo?.state?.toUpperCase() || "",
        Pin: parseInt(einvoiceData.companyInfo?.address?.match(/\d{6}/)?.[0]) || 0,
        Stcd: einvoiceData.companyInfo?.stateCode || "",
        Ph: einvoiceData.companyInfo?.phone?.replace(/\D/g, '').slice(0, 10) || "0000000000",
        Em: einvoiceData.companyInfo?.email || ""
      },
      BuyerDtls: {
        Gstin: einvoiceData.customerInfo?.gstin || "URP",
        LglNm: einvoiceData.customerInfo?.businessName || einvoiceData.customerInfo?.name || "Consumer",
        TrdNm: einvoiceData.customerInfo?.name || "Consumer",
        Pos: einvoiceData.customerInfo?.stateCode || einvoiceData.billingAddress?.state?.match(/\d{2}/)?.[0] || "00",
        Addr1: einvoiceData.billingAddress?.addressLine1 || "",
        Addr2: einvoiceData.billingAddress?.addressLine2 || "",
        Loc: einvoiceData.billingAddress?.city?.toUpperCase() || "",
        Pin: parseInt(einvoiceData.billingAddress?.pincode) || 0,
        Stcd: einvoiceData.billingAddress?.state?.match(/\d{2}/)?.[0] || "00",
        Ph: einvoiceData.customerInfo?.mobileNumber?.replace(/\D/g, '').slice(0, 10) || "0000000000",
        Em: einvoiceData.customerInfo?.email || ""
      },
      ItemList: itemList,
      ValDtls: {
        AssVal: totalAssessableValue,
        CgstVal: totalCGST,
        SgstVal: totalSGST,
        IgstVal: totalIGST,
        CesVal: totalCess,
        StCesVal: totalStateCess,
        Discount: totalDiscount,
        OthChrg: additionalCharges,
        RndOffAmt: roundOff,
        TotInvVal: grandTotal,
        TotInvValFc: grandTotal
      }
    };

    console.log('Mapped API Request:', apiRequest);
    return apiRequest;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateRequestId = () => {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mappedRequestData) {
      setError('No e-invoice data available. Please go back and generate e-invoice first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setInvoiceData(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'user_name': formData.username,
        'password': formData.password,
        // 'gstin': formData.sellerGstin || mappedRequestData.SellerDtls?.Gstin,
        'gstin':"02AMBPG7773M002",
        'requestid': generateRequestId(),
        'Authorization': `Bearer ${formData.accessToken}`
      };

      console.log('Headers:', headers);
      console.log('Request Data:', mappedRequestData);

      const response = await axios.post(
        "https://gsp.adaequare.com/test/enriched/ei/api/invoice",
        mappedRequestData,
        { headers: headers }
      );
console.log('API Response:', response.data);
      if (response.data.success) {
        setInvoiceData(response.data.data);
        setSuccess(true);
        if (formData.accessToken) {
          localStorage.setItem('accessToken', formData.accessToken);
        }
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.data.message || 'Failed to generate IRN');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      console.error('Error details:', err.response?.data || err);
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
            <span>✅ IRN created successfully!</span>
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

      {/* Display mapped data summary */}
      {mappedRequestData && (
        <div className="mapped-data-summary" style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <h5>📋 Invoice Summary (Ready for IRN Generation)</h5>
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
              <strong>Items Count:</strong> {mappedRequestData.ItemList?.length}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <strong>Seller GSTIN:</strong> {mappedRequestData.SellerDtls?.Gstin}
            </div>
            <div className="col-md-6">
              <strong>Buyer GSTIN:</strong> {mappedRequestData.BuyerDtls?.Gstin}
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
        hideInvoiceFields={true} // Hide invoice fields since data is from e-invoice
      />

      {invoiceData && <IRNResults invoiceData={invoiceData} />}

      {/* Display the actual request JSON being sent */}
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