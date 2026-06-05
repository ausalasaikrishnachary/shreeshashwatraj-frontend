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
  
  // Static test payload
  const testPayload = {
    Version: "1.1",
    TranDtls: {
      TaxSch: "GST",
      SupTyp: "B2B",
      RegRev: "N",
      EcmGstin: null,
      IgstOnIntra: "N"
    },
    DocDtls: {
      Typ: "INV",
      No: "INV20260528001",
      Dt: "28/05/2026"
    },
    SellerDtls: {
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
    },
    BuyerDtls: {
      Gstin: "36AMBPG7773M002",
      LglNm: "XYZ company pvt ltd",
      TrdNm: "XYZ Industries",
      Pos: "12",
      Addr1: "7th block, kuvempu layout",
      Addr2: "kuvempu layout",
      Loc: "GANDHINAGAR",
      Pin: 500055,
      Stcd: "36",
      Ph: "91111111111",
      Em: "xyz@yahoo.com"
    },
    ItemList: [
      {
        SlNo: "1",
        PrdDesc: "Basmati Rice",
        IsServc: "N",
        HsnCd: "100630",
        Barcde: "987654",
        Qty: 100.345,
        FreeQty: 10,
        Unit: "BAG",
        UnitPrice: 99.545,
        TotAmt: 9988.84,
        Discount: 10,
        PreTaxVal: 1,
        AssAmt: 9978.84,
        GstRt: 12,
        IgstAmt: 1197.46,
        CgstAmt: 0,
        SgstAmt: 0,
        CesRt: 5,
        CesAmt: 498.94,
        CesNonAdvlAmt: 10,
        StateCesRt: 12,
        StateCesAmt: 1197.46,
        StateCesNonAdvlAmt: 5,
        OthChrg: 10,
        TotItemVal: 12897.7,
        OrdLineRef: "3257",
        PrdSlNo: "54321",
        BchDtls: {
          Nm: "654321",
          Expdt: "01/08/2020",
          wrDt: "01/09/2020"
        },
        AttribDtls: [
          {
            Nm: "Basmati Rice",
            Val: "10000"
          }
        ]
      }
    ],
    ValDtls: {
      AssVal: 9978.84,
      CgstVal: 0,
      SgstVal: 0,
      IgstVal: 1197.46,
      CesVal: 508.94,
      StCesVal: 1202.46,
      Discount: 10,
      OthChrg: 20,
      RndOffAmt: 0.3,
      TotInvVal: 12908,
      TotInvValFc: 12897.7
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setFormData(prev => ({ ...prev, accessToken: token }));
    }

    // Update form data with test payload values
    setFormData(prev => ({
      ...prev,
      invoiceId: testPayload.DocDtls.No,
      sellerGstin: testPayload.SellerDtls.Gstin
    }));
  }, []);

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
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setInvoiceData(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'user_name': formData.username,
        'password': formData.password,
        'gstin': formData.sellerGstin || testPayload.SellerDtls.Gstin,
        'requestid': generateRequestId(),
        'Authorization': `Bearer ${formData.accessToken}`
      };

      console.log('Headers:', headers);
      console.log('Request Data (Test Payload):', testPayload);

      const response = await axios.post(
        "https://gsp.adaequare.com/test/enriched/ei/api/invoice",
        testPayload,
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

  return (
    <div className="irn-generator-container">
      <div className="irn-header">
        <h1>IRN Generation System</h1>
        <p>Generate Invoice Reference Number for GST invoices (Test Mode)</p>
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

      {/* Display test payload summary */}
      <div className="mapped-data-summary" style={{ 
        background: '#e7f3ff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        fontSize: '14px',
        border: '1px solid #b3d4ff'
      }}>
        <h5>🧪 Test Payload Summary (Static Data)</h5>
        <div className="row">
          <div className="col-md-3">
            <strong>Invoice No:</strong> {testPayload.DocDtls.No}
          </div>
          <div className="col-md-3">
            <strong>Invoice Date:</strong> {testPayload.DocDtls.Dt}
          </div>
          <div className="col-md-3">
            <strong>Total Value:</strong> ₹{testPayload.ValDtls.TotInvVal.toFixed(2)}
          </div>
          <div className="col-md-3">
            <strong>Items Count:</strong> {testPayload.ItemList.length}
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-6">
            <strong>Seller GSTIN:</strong> {testPayload.SellerDtls.Gstin}
          </div>
          <div className="col-md-6">
            <strong>Buyer GSTIN:</strong> {testPayload.BuyerDtls.Gstin}
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-6">
            <strong>Transaction Type:</strong> {testPayload.TranDtls.SupTyp}
          </div>
          <div className="col-md-6">
            <strong>Tax Scheme:</strong> {testPayload.TranDtls.TaxSch}
          </div>
        </div>
      </div>

      <IRNForm
        formData={formData}
        branches={branches}
        loading={loading}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        hideInvoiceFields={false}
      />

      {invoiceData && <IRNResults invoiceData={invoiceData} />}

      {/* Display the actual request JSON being sent */}
      <details style={{ marginTop: '20px' }}>
        <summary style={{ cursor: 'pointer', color: '#6c757d' }}>
          🔍 View API Request JSON (Test Payload)
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
          {JSON.stringify(testPayload, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default IRNGenerator;