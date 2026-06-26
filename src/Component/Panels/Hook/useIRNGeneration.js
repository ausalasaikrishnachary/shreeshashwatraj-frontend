// // hooks/useIRNGeneration.js
// import { useState } from 'react';
// import axios from 'axios';

// const useIRNGeneration = () => {
//   const [loading, setLoading] = useState(false);

//   // Static Seller Details (copied from IRNGenerator)
//   const staticSellerDetails = {
//     Gstin: "02AMBPG7773M002",
//     LglNm: "NIC company pvt ltd",
//     TrdNm: "NIC Industries",
//     Addr1: "5th block, kuvempu layout",
//     Addr2: "kuvempu layout",
//     Loc: "GANDHINAGAR",
//     Pin: 175121,
//     Stcd: "02",
//     Ph: "9000000000",
//     Em: "abc@gmail.com"
//   };

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
//     return "100630";
//   };

//   const mapEInvoiceToAPIFormat = (einvoiceData, transactionType) => {
//     const isB2B = einvoiceData.invoice?.bb_bc === 'b2b' || einvoiceData.customerInfo?.gstin;

//     const sellerStateCode = staticSellerDetails.Stcd;
//     const buyerGSTIN = einvoiceData.customerInfo?.gstin;
//     let buyerStateCode = getStateCodeFromGSTIN(buyerGSTIN);
//     let buyerPincode = einvoiceData.billingAddress?.pincode || 800001;

//     if (!buyerGSTIN || buyerGSTIN === "URP") {
//       buyerStateCode = "10";
//       buyerPincode = 800001;
//     }

//     const parseDate = (dateString) => {
//       if (!dateString) return new Date().toLocaleDateString('en-GB');
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-GB');
//     };

//     // Calculate taxes based on transaction type parameter
//     const itemList = (einvoiceData.items || []).map((item, index) => {
//       const taxableAmount = parseFloat(item.taxableAmount) || (item.quantity * item.price);
//       const discountAmount = parseFloat(item.discountAmount) || (taxableAmount * (item.discount / 100));
//       const assessableAmount = taxableAmount - discountAmount;
//       const gstPercentage = parseFloat(item.gstPercentage) || 0;
//       const totalGstAmount = assessableAmount * (gstPercentage / 100);

//       let igstAmount = 0;
//       let cgstAmount = 0;
//       let sgstAmount = 0;

//       if (transactionType === 'intra') {
//         // INTRA-STATE: Only CGST and SGST
//         cgstAmount = totalGstAmount / 2;
//         sgstAmount = totalGstAmount / 2;
//         igstAmount = 0;
//       } else {
//         // INTER-STATE: Only IGST
//         igstAmount = totalGstAmount;
//         cgstAmount = 0;
//         sgstAmount = 0;
//       }

//       return {
//         SlNo: (index + 1).toString(),
//         PrdDesc: item.product || item.description || "Product",
//         IsServc: "N",
//         HsnCd: getValidHSN(item.hsnCode),
//         Barcde: String(item.productId || "").length >= 3 ? String(item.productId) : "123456",
//         Qty: parseFloat(item.quantity) || 0,
//         FreeQty: 0,
//         Unit: getValidUQC(item.unit),
//         UnitPrice: parseFloat(item.price) || 0,
//         TotAmt: taxableAmount,
//         Discount: parseFloat(item.discount) || 0,
//         PreTaxVal: assessableAmount,
//         AssAmt: assessableAmount,
//         GstRt: gstPercentage,
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
//         TotItemVal: assessableAmount + totalGstAmount,
//         OrdLineRef: (index + 1).toString(),
//         PrdSlNo: String(item.productId || "").length > 0 ? String(item.productId) : "123456"
//       };
//     });

//     const totalAssessableValue = itemList.reduce((sum, item) => sum + item.AssAmt, 0);
//     const totalIGST = itemList.reduce((sum, item) => sum + item.IgstAmt, 0);
//     const totalCGST = itemList.reduce((sum, item) => sum + item.CgstAmt, 0);
//     const totalSGST = itemList.reduce((sum, item) => sum + item.SgstAmt, 0);
//     const totalDiscount = itemList.reduce((sum, item) => sum + (item.TotAmt * item.Discount / 100), 0);
//     const totalItemValue = itemList.reduce((sum, item) => sum + item.TotItemVal, 0);

//     const roundOff = parseFloat(einvoiceData.financialSummary?.roundOff) || 0;
//     const additionalCharges = parseFloat(einvoiceData.financialSummary?.additionalChargesAmount) || 0;
//     const grandTotal = parseFloat(einvoiceData.financialSummary?.grandTotal) || totalItemValue;

//     const apiRequest = {
//       Version: "1.1",
//       TranDtls: {
//         TaxSch: "GST",
//         SupTyp: isB2B ? "B2B" : "B2C",
//         RegRev: "N",
//         IgstOnIntra: "N"
//       },
//       DocDtls: {
//         Typ: "INV",
//         No: String(einvoiceData.invoice?.invoiceNumber || ""),
//         Dt: parseDate(einvoiceData.invoice?.invoiceDate)
//       },
//       SellerDtls: {
//         Gstin: String(staticSellerDetails.Gstin),
//         LglNm: String(staticSellerDetails.LglNm),
//         TrdNm: String(staticSellerDetails.TrdNm),
//         Addr1: String(staticSellerDetails.Addr1),
//         Addr2: String(staticSellerDetails.Addr2),
//         Loc: String(staticSellerDetails.Loc),
//         Pin: Number(staticSellerDetails.Pin),
//         Stcd: String(staticSellerDetails.Stcd),
//         Ph: String(staticSellerDetails.Ph),
//         Em: String(staticSellerDetails.Em)
//       },
//       BuyerDtls: {
//         Gstin: String(buyerGSTIN || "URP"),
//         LglNm: String(einvoiceData.customerInfo?.businessName || einvoiceData.customerInfo?.name || "Buyer Company"),
//         TrdNm: String(einvoiceData.customerInfo?.name || "Buyer"),
//         Pos: String(buyerStateCode),
//         Addr1: String(einvoiceData.billingAddress?.addressLine1 || "Commercial Complex"),
//         Addr2: String(einvoiceData.billingAddress?.addressLine2 || "Sector 1"),
//         Loc: String(buyerStateCode === "02" ? "GANDHINAGAR" : "PATNA"),
//         Pin: Number(buyerPincode),
//         Stcd: String(buyerStateCode),
//         Ph: String(einvoiceData.customerInfo?.mobileNumber?.replace(/\D/g, '').slice(0, 10) || "9876543210"),
//         Em: String(einvoiceData.customerInfo?.email || "buyer@company.com")
//       },
//       ItemList: itemList,
//       ValDtls: {
//         AssVal: Number(totalAssessableValue.toFixed(2)),
//         CgstVal: Number(totalCGST.toFixed(2)),
//         SgstVal: Number(totalSGST.toFixed(2)),
//         IgstVal: Number(totalIGST.toFixed(2)),
//         CesVal: 0,
//         StCesVal: 0,
//         Discount: Number(totalDiscount.toFixed(2)),
//         OthChrg: Number(additionalCharges.toFixed(2)),
//         RndOffAmt: Number(roundOff.toFixed(2)),
//         TotInvVal: Number(grandTotal.toFixed(2)),
//         TotInvValFc: Number(grandTotal.toFixed(2))
//       }
//     };

//     console.log(`=== ${transactionType.toUpperCase()}-STATE TRANSACTION ===`);
//     console.log("Transaction Type:", transactionType.toUpperCase());
//     console.log("IGST Amount:", totalIGST);
//     console.log("CGST Amount:", totalCGST);
//     console.log("SGST Amount:", totalSGST);

//     return apiRequest;
//   };
  

//   const sendRequestWithRetry = async (einvoiceData, transactionType, username, password, accessToken) => {
//     const requestData = mapEInvoiceToAPIFormat(einvoiceData, transactionType);

//     console.log(`Attempting with ${transactionType.toUpperCase()} transaction...`);

//     const response = await axios.post(
//       "http://localhost:5000/api/generate-irn",
//       {
//         payload: requestData,
//         username: username,
//         password: password,
//         gstin: staticSellerDetails.Gstin,
//         accessToken: accessToken,
//       }
//     );

//     return { response: response.data, transactionType };
//   };

//   const generateIRN = async (einvoiceData, username, password, accessToken) => {
//     setLoading(true);

//     try {
//       // Try INTRA-STATE first
//       console.log("=== TRYING INTRA-STATE TRANSACTION FIRST ===");
//       let result = await sendRequestWithRetry(einvoiceData, 'intra', username, password, accessToken);
//       let irnResponse = result.response;
//       let currentType = result.transactionType;

//       // Check if we need to retry with INTER-STATE
//       if (!irnResponse.success) {
//         const errorMessage = irnResponse.message || '';

//         // If error indicates we need inter-state (2174 error)
//         if (errorMessage.includes('2174') ||
//           (errorMessage.includes('CGST') && errorMessage.includes('SGST') && errorMessage.includes('not applicable'))) {
//           console.log("Intra-state failed, trying INTER-STATE...");
//           result = await sendRequestWithRetry(einvoiceData, 'inter', username, password, accessToken);
//           irnResponse = result.response;
//           currentType = result.transactionType;
//         }
//       }

//       console.log(`Final response from ${currentType.toUpperCase()} transaction:`, irnResponse);

//       let qrResponse = null;

//       if (irnResponse?.success && irnResponse?.result?.SignedQRCode) {
//         qrResponse = await axios.post(
//           "http://localhost:5000/api/generate-qr-image",
//           {
//             signedQrCode: irnResponse.result.SignedQRCode,
//             gstin: staticSellerDetails.Gstin,
//             invoiceCode: einvoiceData.invoice?.invoiceNumber || ""
//           }
//         );
//         console.log("QR Response:", qrResponse.data);
//       }

//       const finalData = {
//         ...irnResponse,
//         qrImage: qrResponse?.data || null,
//         transactionTypeUsed: currentType
//       };

//       if (irnResponse?.success) {
//         return { success: true, data: finalData };
//       } else {
//         const errorMsg = irnResponse?.message || "Failed to generate IRN";
//         return { success: false, error: errorMsg };
//       }

//     } catch (err) {
//       console.error("Error details:", err);
//       const errorMsg = err.response?.data?.message || err.message || "Failed to generate IRN/QR";
//       return { success: false, error: errorMsg };
//     } finally {
//       setLoading(false);
//     }
//   };

//   return {
//     generateIRN,
//     loading
//   };
// };

// export default useIRNGeneration;


// hooks/useIRNGeneration.js
import { useState } from 'react';
import axios from 'axios';
import { baseurl } from '../../BaseURL/BaseURL';

const useIRNGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [irnData, setIrnData] = useState(null);
  const [cancelling, setCancelling] = useState(false);


  // Static Seller Details (copied from IRNGenerator)
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
        // Dt: parseDate(einvoiceData.invoice?.invoiceDate)
        Dt: new Date().toLocaleDateString('en-GB')
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
    console.log("IGST Amount:", totalIGST);
    console.log("CGST Amount:", totalCGST);
    console.log("SGST Amount:", totalSGST);

    return apiRequest;
  };

    // NEW: Function to cancel IRN
  const cancelIRN = async (irnNo, invoiceNumber, gstin, reason = "1", remark = "Cancelled by user") => {
    setCancelling(true);
    setError(null);

    try {
      // Get credentials
      const username = localStorage.getItem('irn_username') || 'adqgsphpusr1';
      const password = localStorage.getItem('irn_password') || 'Gsp@1234';
      const accessToken = localStorage.getItem('accessToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      // Call backend cancel API
      const response = await axios.post(
        `${baseurl}/api/cancel-irn`,
        {
          irn: irnNo,
          cnlrsn: reason,
          cnlrem: remark,
          gstin: gstin || "02AMBPG7773M002",
          invoiceNumber: invoiceNumber
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("IRN Cancellation Response:", response.data);

      if (response.data.success) {
        // Update database status to 'Cancelled'
        const updateResult = await updateInvoiceIRNStatus(invoiceNumber, 'Cancelled');
        
        if (updateResult.success) {
          return { 
            success: true, 
            data: response.data.data,
            message: 'E-Invoice cancelled successfully'
          };
        } else {
          // IRN cancelled but DB update failed
          return { 
            success: true, 
            data: response.data.data,
            warning: 'IRN cancelled but database update failed',
            dbError: updateResult.error
          };
        }
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Failed to cancel e-invoice'
        };
      }

    } catch (error) {
      console.error("Cancel IRN Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to cancel e-invoice";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setCancelling(false);
    }
  };

  // NEW: Function to update IRN status in database
  const updateInvoiceIRNStatus = async (invoiceNumber, status) => {
    try {
      const response = await axios.put(
        `${baseurl}/api/update-invoice-irn`,
        {
          invoiceNumber: invoiceNumber,
          IRNgenerated_status: status
        }
      );

      if (response.data.success) {
        console.log(`✅ Invoice IRN status updated to: ${status}`);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('❌ Error updating IRN status:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update status'
      };
    }
  };

// hooks/useIRNGeneration.js

const getIRNStatus = async (invoiceNumber) => {
  try {
    // Properly encode the invoice number for URL
    const encodedInvoiceNumber = encodeURIComponent(invoiceNumber);
    const response = await axios.get(
      `${baseurl}/api/invoice-irn-status/${encodedInvoiceNumber}`
    );

    if (response.data.success) {
      return { 
        success: true, 
        data: response.data.data 
      };
    } else {
      return { 
        success: false, 
        error: response.data.message 
      };
    }
  } catch (error) {
    console.error('Error fetching IRN status:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

  const sendRequestWithRetry = async (einvoiceData, transactionType, username, password, accessToken) => {
    const requestData = mapEInvoiceToAPIFormat(einvoiceData, transactionType);

    console.log(`Attempting with ${transactionType.toUpperCase()} transaction...`);

    const response = await axios.post(
      `${baseurl}/api/generate-irn`,
      {
        payload: requestData,
        username: username,
        password: password,
        gstin: staticSellerDetails.Gstin,
        accessToken: accessToken,
      }
    );

    return { response: response.data, transactionType };
  };

  // NEW: Function to update invoice in database
  const updateInvoiceInDatabase = async (updateData) => {
    try {
      console.log('Updating invoice with IRN details:', updateData);
      
      const response = await axios.put(
        `${baseurl}/api/update-invoice-irn`,
        updateData
      );

      if (response.data.success) {
        console.log('✅ Invoice updated with IRN details:', response.data);
        return { success: true, data: response.data };
      } else {
        console.warn('⚠️ Failed to update invoice:', response.data.message);
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('❌ Error updating invoice with IRN details:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update invoice'
      };
    }
  };

  const generateIRN = async (einvoiceData, username, password, accessToken) => {
    setLoading(true);
    setError(null);

    try {
      // Try INTRA-STATE first
      console.log("=== TRYING INTRA-STATE TRANSACTION FIRST ===");
      let result = await sendRequestWithRetry(einvoiceData, 'intra', username, password, accessToken);
      let irnResponse = result.response;
      let currentType = result.transactionType;

      // Check if we need to retry with INTER-STATE
      if (!irnResponse.success) {
        const errorMessage = irnResponse.message || '';

        // If error indicates we need inter-state (2174 error)
        if (errorMessage.includes('2174') ||
          (errorMessage.includes('CGST') && errorMessage.includes('SGST') && errorMessage.includes('not applicable'))) {
          console.log("Intra-state failed, trying INTER-STATE...");
          result = await sendRequestWithRetry(einvoiceData, 'inter', username, password, accessToken);
          irnResponse = result.response;
          currentType = result.transactionType;
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

      // If IRN generation was successful, update the database
      if (irnResponse?.success) {
        // Prepare data for database update
        const updateData = {
          invoiceNumber: einvoiceData.invoice?.invoiceNumber,
          branch_code: einvoiceData.branch_code || null,
          ack_no: irnResponse.result?.AckNo || null,
          ack_date: irnResponse.result?.AckDt || null,
          irn_no: irnResponse.result?.Irn || null,
          signed_qr_code: irnResponse.result?.SignedQRCode || null,
          signed_invoice: irnResponse.result?.SignedInvoice || null,
          qr_image: qrResponse?.data?.imageUrl || qrResponse?.data?.filePath || null,
          e_way_bill_no: irnResponse.result?.EwbNo || null,
          e_way_bill_date: irnResponse.result?.EwbDt || null,
          e_way_bill_valid_till: irnResponse.result?.EwbValidTill || null,
          IRNgenerated_status: 'Generated'
        };

        // Update database
        const dbUpdateResult = await updateInvoiceInDatabase(updateData);
        
        if (!dbUpdateResult.success) {
          console.warn('⚠️ IRN generated but database update failed:', dbUpdateResult.error);
          // Still return success for IRN generation, but include warning
          return { 
            success: true, 
            data: finalData,
            dbUpdateWarning: dbUpdateResult.error
          };
        }

        // Return success with both IRN data and DB update info
        return { 
          success: true, 
          data: finalData,
          dbUpdated: true,
          dbUpdateData: dbUpdateResult.data
        };
      } else {
        const errorMsg = irnResponse?.message || "Failed to generate IRN";
        return { success: false, error: errorMsg };
      }

    } catch (err) {
      console.error("Error details:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to generate IRN/QR";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    generateIRN,
    cancelIRN,
    getIRNStatus,
    updateInvoiceIRNStatus,
    loading,
    cancelling,
    error,
    irnData
  };
};

export default useIRNGeneration;