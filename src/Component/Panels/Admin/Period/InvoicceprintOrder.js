import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  Image,
  
} from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';
import QRCode from 'qrcode';

Font.register({
  family: 'NotoSans',
  src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4g.ttf'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 14,            // ↓ was 25 — tighter page margin = less outer whitespace
    fontSize: 9,
    fontFamily: 'NotoSans',
  },
  
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,        // ↓ was 20
    paddingBottom: 4,       // ↓ was 15
    borderBottom: '1pt solid #e0e0e0',
  },
  companyInfo: { flex: 2 },
  invoiceMeta: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 4,             // ↓ was 10
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,        // ↓ was 5
    color: '#2c3e50',
  },
  companyAddress: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 1,        // ↓ was 3
    lineHeight: 1.2,        // ↓ was 1.3
  },
  invoiceTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,        // ↓ was 8
    color: '#dc3545',
    textAlign: 'center',
  },
  
  // Bill To & Transport Row
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,        // ↓ was 15
    gap: 4,                 // ↓ was 10
  },
  billToBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 4,             // ↓ was 10
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  transportBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 4,             // ↓ was 10
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,        // ↓ was 8
    color: '#007bff',
    borderBottom: '1pt solid #007bff',
    paddingBottom: 1,       // ↓ was 3
  },
  addressText: {
    fontSize: 8,
    marginBottom: 1,        // ↓ was 3
    lineHeight: 1.2,        // ↓ was 1.3
  },
  transportLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#555',
    marginBottom: 1,        // ↓ was 2
  },
  transportValue: {
    fontSize: 8,
    color: '#333',
  },
  
  // Items Table
  itemsSection: {
    marginBottom: 4,        // ↓ was 15
  },
  itemsTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,        // ↓ was 8
    color: '#007bff',
    paddingBottom: 2,       // ↓ was 4
    borderBottom: '1pt solid #007bff',
  },

  // Outer table: solid 1pt black border
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 4,
  },

  // Data rows: NO horizontal lines, ultra-compact height
  tableRow: {
    flexDirection: 'row',
    minHeight: 11,          // ↓ was 13 — ultra tight like client image
  },

  // Header row
  tableHeader: {
    backgroundColor: '#343a40',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    minHeight: 14,          // ↓ was 16
  },

  rowOdd:  { backgroundColor: '#ffffff' },
  rowEven: { backgroundColor: '#f7f7f7' },

  // ── COLUMNS: paddingVertical: 0 = zero row gap ──
  colSNo: {
    width: '3%',
    paddingHorizontal: 2,
    paddingVertical: 0,     // ↓ was 1
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colProduct: {
    width: '15%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colHsn: {
    width: '8%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colQty: {
    width: '4%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colFreeQty: {
    width: '4%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colPrice: {
    width: '7%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colDiscount: {
    width: '7%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colCreditCharge: {
    width: '7%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colTaxable: {
    width: '8%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colGSTPercent: {
    width: '5%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colGSTAmt: {
    width: '7%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colCGST: {
    width: '7%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colSGST: {
    width: '7%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colTotal: {
    width: '8%',
    paddingHorizontal: 2,
    paddingVertical: 0,
  },
  
  tableCell: {
    fontSize: 7,
    lineHeight: 1.1,        // ↓ was 1.2 — tightest possible
    color: '#2c3e50',
    textAlign: 'center',
  },
  tableCellHeader: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableCellLeft:   { textAlign: 'left' },
  tableCellRight:  { textAlign: 'right' },
  tableCellCenter: { textAlign: 'center' },
  tableCellBold:   { fontFamily: 'Helvetica-Bold' },
  
  // Amount + QR Row
  bottomRow: {
    flexDirection: 'row',
    marginBottom: 4,        // ↓ was 20
    gap: 4,                 // ↓ was 10
  },
  amountSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 4,             // ↓ was 10
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  amountTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,        // ↓ was 10
    color: '#007bff',
    textAlign: 'center',
    borderBottom: '1pt solid #dee2e6',
    paddingBottom: 2,       // ↓ was 5
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,        // ↓ was 5
    paddingBottom: 1,       // ↓ was 3
    borderBottom: '0.5pt dotted #e9ecef',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '2pt solid #007bff',
    paddingTop: 3,          // ↓ was 8
    marginTop: 3,           // ↓ was 8
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },

  // QR Code Section
  qrSection: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 4,             // ↓ was 10
    borderRadius: 4,
    border: '1pt solid #007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#007bff',
    marginBottom: 2,        // ↓ was 6
    textAlign: 'center',
  },
  qrImage: {
    width: 80,              // ↓ was 90
    height: 80,
  },
  qrAmount: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#28a745',
    marginTop: 2,           // ↓ was 6
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,           // ↓ was 20
    paddingTop: 4,          // ↓ was 15
    borderTop: '1pt solid #e0e0e0',
  },
  bankDetails: { flex: 1 },
  bankTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,        // ↓ was 6
    color: '#007bff',
  },
  bankText: {
    fontSize: 8,
    lineHeight: 1.2,        // ↓ was 1.3
    marginBottom: 1,        // ↓ was 3
  },
  signature: {
    alignItems: 'flex-end',
    flex: 1,
  },
  signatureBox: {
    alignItems: 'center',
    width: 200,
  },
  signatureLine: {
    width: 180,
    marginBottom: 3,        // ↓ was 5
    marginTop: 12,          // ↓ was 20
    borderBottom: '1pt solid #000',
  },
});

const getSafeData = (data, path, defaultValue = '') => {
  try {
    const keys = path.split('.');
    let result = data;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined || result === null) return defaultValue;
    }
    return result || defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const getCustomerMobile = (supplierInfo) => {
  const mobileNumber = getSafeData(supplierInfo, 'mobile_number', '');
  const phone = getSafeData(supplierInfo, 'phone', '');
  const phoneNumber = getSafeData(supplierInfo, 'phone_number', '');
  if (mobileNumber && mobileNumber !== 'N/A') return mobileNumber;
  if (phone && phone !== 'N/A') return phone;
  if (phoneNumber && phoneNumber !== 'N/A') return phoneNumber;
  return 'N/A';
};

const generateQRDataUrl = async (invoiceData, orderMode) => {
  try {
    const items = getSafeData(invoiceData, 'items', []);
    let grandTotal = 0;
    items.forEach(item => {
      const quantity = parseFloat(getSafeData(item, 'quantity', 1));
      const taxablePerUnit = parseFloat(getSafeData(item, 'taxable_amount', 0));
      const taxPerUnit = parseFloat(getSafeData(item, 'tax_amount', 0));
      const itemTaxable = taxablePerUnit * quantity;
      const itemTax = orderMode === 'KACHA' ? 0 : taxPerUnit * quantity;
      grandTotal += itemTaxable + itemTax;
    });
    const invoiceGrandTotal = parseFloat(getSafeData(invoiceData, 'grandTotal', 0));
    let finalAmount;
    if (orderMode === 'KACHA') {
      let taxableOnlyTotal = 0;
      items.forEach(item => {
        const quantity = parseFloat(getSafeData(item, 'quantity', 1));
        const taxablePerUnit = parseFloat(getSafeData(item, 'taxable_amount', 0));
        taxableOnlyTotal += taxablePerUnit * quantity;
      });
      finalAmount = Math.max(grandTotal, taxableOnlyTotal);
    } else {
      finalAmount = Math.max(grandTotal, invoiceGrandTotal);
    }
    const formattedAmount = finalAmount.toFixed(2);
    const upiId = 'shreeshashwatrajagroprivatelimited@sbi';
    const merchantName = (getSafeData(invoiceData, 'companyInfo.name', 'Business')).replace(/[^a-zA-Z0-9 ]/g, '');
    const invoiceNumber = getSafeData(invoiceData, 'invoiceNumber', `INV${Date.now().toString().slice(-6)}`);
    const transactionNote = `Payment for Invoice ${invoiceNumber} (${orderMode} Order)`;
    const upiParams = new URLSearchParams({ pa: upiId, pn: merchantName, am: formattedAmount, tn: transactionNote, cu: 'INR' });
    const upiUrl = `upi://pay?${upiParams.toString()}`;
    const dataUrl = await QRCode.toDataURL(upiUrl, { width: 200, margin: 1, errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#FFFFFF' } });
    return { dataUrl, amount: finalAmount };
  } catch (error) {
    console.error('Error generating QR data URL:', error);
    return { dataUrl: null, amount: 0 };
  }
};

const InvoicceprintOrder = ({ invoiceData, invoiceNumber, gstBreakdown, isSameState, qrDataUrl, qrAmount }) => {
  const currentData = invoiceData || {};
  const companyInfo = getSafeData(currentData, 'companyInfo', {});
  const supplierInfo = getSafeData(currentData, 'supplierInfo', {});
  const items = getSafeData(currentData, 'items', []);
  const orderMode = getSafeData(currentData, 'order_mode', 'PAKKA').toUpperCase();
  const displayInvoiceNumber = invoiceNumber || getSafeData(currentData, 'invoiceNumber', 'INV001');
  const invoiceDate = getSafeData(currentData, 'invoiceDate') 
    ? new Date(getSafeData(currentData, 'invoiceDate')).toLocaleDateString('en-IN') 
    : new Date().toLocaleDateString('en-IN');
  const dueDate = getSafeData(currentData, 'validityDate') 
    ? new Date(getSafeData(currentData, 'validityDate')).toLocaleDateString('en-IN') 
    : 'N/A';
  const transportDetails = getSafeData(currentData, 'transportDetails', {});
  const finalVehicleNo = getSafeData(transportDetails, 'vehicleNo', '') || getSafeData(currentData, 'vehicle_number', '');
  
  const calculateTotals = () => {
    let totalTaxableAmount = 0;
    let totalGSTAmount = 0;
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    let grandTotal = 0;
    items.forEach(item => {
      const quantity = parseFloat(getSafeData(item, 'quantity', 1));
      const taxablePerUnit = parseFloat(getSafeData(item, 'taxable_amount', 0));
      const taxableAmount = taxablePerUnit * quantity;
      const gstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'tax_amount', 0)) * quantity;
      const cgstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'cgst_amount', 0)) * quantity;
      const sgstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'sgst_amount', 0)) * quantity;
      const itemTotal = orderMode === 'KACHA' ? taxableAmount : taxableAmount + gstAmount;
      totalTaxableAmount += taxableAmount;
      totalGSTAmount += gstAmount;
      totalCGSTAmount += cgstAmount;
      totalSGSTAmount += sgstAmount;
      grandTotal += itemTotal;
    });
    return {
      totalTaxableAmount: totalTaxableAmount.toFixed(2),
      totalGSTAmount: totalGSTAmount.toFixed(2),
      totalCGSTAmount: totalCGSTAmount.toFixed(2),
      totalSGSTAmount: totalSGSTAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };
  
  const totals = calculateTotals();
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{getSafeData(companyInfo, 'name', 'SHREE SHASHWATRAJ AGRO PVT LTD')}</Text>
            <Text style={styles.companyAddress}>{getSafeData(companyInfo, 'address', 'Growth Center, Jasoiya, Aurangabad, Bihar, 824101')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
              <Text style={[styles.companyAddress, { marginRight: 5 }]}>Email: {getSafeData(companyInfo, 'email', 'spmathur56@gmail.com')} |</Text>
              <Text style={[styles.companyAddress, { marginRight: 5 }]}>Phone: {getSafeData(companyInfo, 'phone', '9801049700')} |</Text>
              <Text style={[styles.companyAddress, { marginRight: 5 }]}>GSTIN: {getSafeData(companyInfo, 'gstin', '10AAOCS1541B1ZZ')} |</Text>
              <Text style={styles.companyAddress}>State Code: {getSafeData(companyInfo, 'stateCode', '10')}</Text>
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Invoice No:</Text> {displayInvoiceNumber}</Text>
            <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Invoice Date:</Text> {invoiceDate}</Text>
            <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Due Date:</Text> {dueDate}</Text>
          </View>
        </View>
        
        {/* Bill To + Transport Details */}
        <View style={styles.infoRow}>
          <View style={styles.billToBox}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={[styles.addressText, styles.tableCellBold, styles.tableCellLeft]}>{getSafeData(supplierInfo, 'name', 'Customer')}</Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>{getSafeData(supplierInfo, 'businessName', '')}</Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>Mobile: {getCustomerMobile(supplierInfo)}</Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>GSTIN: {getSafeData(supplierInfo, 'gstin', 'N/A')}</Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>State: {getSafeData(supplierInfo, 'state', 'N/A')}</Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>Email: {getSafeData(supplierInfo, 'email', 'N/A')}</Text>
          </View>
          <View style={styles.transportBox}>
            <Text style={styles.sectionTitle}>Transport Details:</Text>
            <View style={{ marginTop: 3 }}>
              <Text style={styles.transportLabel}>Vehicle No.:</Text>
              <Text style={styles.transportValue}>{finalVehicleNo || '-'}</Text>
            </View>
          </View>
        </View>
        
        {/* Items Table */}
        <View style={styles.itemsSection}>
          <View style={styles.table}>

            {/* Header row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.colSNo}><Text style={styles.tableCellHeader}>#</Text></View>
              <View style={styles.colProduct}><Text style={styles.tableCellHeader}>Product</Text></View>
              <View style={styles.colHsn}><Text style={styles.tableCellHeader}>HSN Code</Text></View>
              <View style={styles.colQty}><Text style={styles.tableCellHeader}>Units</Text></View>
              <View style={styles.colFreeQty}><Text style={styles.tableCellHeader}>Free</Text></View>
              <View style={styles.colPrice}><Text style={styles.tableCellHeader}>Price</Text></View>
              <View style={styles.colDiscount}><Text style={styles.tableCellHeader}>Disc Amt</Text></View>
              <View style={styles.colCreditCharge}><Text style={styles.tableCellHeader}>Cr Charge</Text></View>
              <View style={styles.colTaxable}><Text style={styles.tableCellHeader}>Taxable</Text></View>
              <View style={styles.colGSTPercent}><Text style={styles.tableCellHeader}>GST%</Text></View>
              <View style={styles.colGSTAmt}><Text style={styles.tableCellHeader}>GST Amt</Text></View>
              <View style={styles.colCGST}><Text style={styles.tableCellHeader}>CGST</Text></View>
              <View style={styles.colSGST}><Text style={styles.tableCellHeader}>SGST</Text></View>
              <View style={styles.colTotal}><Text style={styles.tableCellHeader}>Total</Text></View>
            </View>

            {/* Data rows */}
            {items.map((item, index) => {
              const quantity = parseFloat(getSafeData(item, 'quantity', 1));
              const flashOffer = parseInt(getSafeData(item, 'flash_offer', 0));
              const buyQuantity = parseInt(getSafeData(item, 'buy_quantity', 0));
              const getQuantity = parseInt(getSafeData(item, 'get_quantity', 0));
              const price = parseFloat(getSafeData(item, 'net_price', getSafeData(item, 'price', 0)));
              const discountAmount = parseFloat(getSafeData(item, 'discount_amount', 0)) * quantity;
              const creditCharge = parseFloat(getSafeData(item, 'credit_charge', 0)) * quantity;
              const taxablePerUnit = parseFloat(getSafeData(item, 'taxable_amount', 0));
              const taxableAmount = taxablePerUnit * quantity;
              const gst = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'gst', 0));
              const gstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'tax_amount', 0)) * quantity;
              const cgstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'cgst_amount', 0)) * quantity;
              const sgstAmount = orderMode === 'KACHA' ? 0 : parseFloat(getSafeData(item, 'sgst_amount', 0)) * quantity;
              const itemTotal = orderMode === 'KACHA' ? taxableAmount : taxableAmount + gstAmount;
              const hsnCode = getSafeData(item, 'hsn_code', '-');
              const unitName = getSafeData(item, 'unit_name', '');
              const rowBg = index % 2 === 0 ? styles.rowOdd : styles.rowEven;

              return (
                <View style={[styles.tableRow, rowBg]} key={index}>
                  <View style={styles.colSNo}><Text style={styles.tableCell}>{index + 1}</Text></View>
                  <View style={styles.colProduct}>
                    <Text style={[styles.tableCell, styles.tableCellLeft, styles.tableCellBold]}>
                      {getSafeData(item, 'product', `Item ${index + 1}`)}
                    </Text>
                  </View>
                  <View style={styles.colHsn}><Text style={[styles.tableCell, styles.tableCellCenter]}>{hsnCode}</Text></View>
                  <View style={styles.colQty}>
                    <Text style={styles.tableCell}>
                      {flashOffer === 1 ? `${buyQuantity} ${unitName ? unitName : ''}`.trim() : `${quantity} ${unitName ? unitName : ''}`.trim()}
                    </Text>
                  </View>
                  <View style={styles.colFreeQty}>
                    <Text style={styles.tableCell}>
                      {flashOffer === 1 ? `${getQuantity} ${unitName ? unitName : ''}`.trim() : '-'}
                    </Text>
                  </View>
                  <View style={styles.colPrice}><Text style={[styles.tableCell, styles.tableCellRight]}>{'\u20B9'}{price.toFixed(2)}</Text></View>
                  <View style={styles.colDiscount}><Text style={[styles.tableCell, styles.tableCellRight]}>{'\u20B9'}{discountAmount.toFixed(2)}</Text></View>
                  <View style={styles.colCreditCharge}><Text style={[styles.tableCell, styles.tableCellRight]}>{'\u20B9'}{creditCharge.toFixed(2)}</Text></View>
                  <View style={styles.colTaxable}>
                    <Text style={[styles.tableCell, styles.tableCellRight, styles.tableCellBold]}>{'\u20B9'}{taxableAmount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.colGSTPercent}><Text style={styles.tableCell}>{orderMode === 'KACHA' ? '0%' : `${gst}%`}</Text></View>
                  <View style={styles.colGSTAmt}>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>{'\u20B9'}{orderMode === 'KACHA' ? '0.00' : gstAmount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.colCGST}>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>{'\u20B9'}{orderMode === 'KACHA' ? '0.00' : cgstAmount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.colSGST}>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>{'\u20B9'}{orderMode === 'KACHA' ? '0.00' : sgstAmount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.colTotal}>
                    <Text style={[styles.tableCell, styles.tableCellRight, styles.tableCellBold, { color: '#28a745' }]}>
                      {'\u20B9'}{itemTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Amount Summary + QR */}
        <View style={styles.bottomRow}>
          <View style={styles.amountSection}>
            <Text style={styles.amountTitle}>Amount Summary</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Taxable Amount:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold]}>{'\u20B9'}{totals.totalTaxableAmount}</Text>
            </View>
            {orderMode === 'PAKKA' && (
              <>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>CGST:</Text>
                  <Text style={styles.tableCell}>{'\u20B9'}{totals.totalCGSTAmount}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>SGST:</Text>
                  <Text style={styles.tableCell}>{'\u20B9'}{totals.totalSGSTAmount}</Text>
                </View>
              </>
            )}
            <View style={styles.amountRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Total GST:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, { color: '#28a745' }]}>
                {'\u20B9'}{orderMode === 'KACHA' ? '0.00' : totals.totalGSTAmount}
              </Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={[styles.tableCell, styles.tableCellBold, { fontSize: 10 }]}>Grand Total:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, { color: '#28a745', fontSize: 10 }]}>
                {'\u20B9'}{totals.grandTotal}
              </Text>
            </View>
          </View>

          <View style={styles.qrSection}>
            {qrDataUrl ? (
              <>
                <Text style={styles.qrTitle}>Scan to Pay via UPI</Text>
                <Image src={qrDataUrl} style={styles.qrImage} />
                <Text style={styles.qrAmount}>{'\u20B9'}{(qrAmount || parseFloat(totals.grandTotal)).toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.qrTitle}>QR Code Not Available</Text>
            )}
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details:</Text>
            <View style={{ backgroundColor: '#f8f9fa', padding: 4, borderRadius: 3 }}>
              <Text style={styles.bankText}>Company Name: SHREE SHASHWATRAJ AGRO PVT LTD</Text>
              <Text style={styles.bankText}>Bank Name: STATE BANK OF INDIA</Text>
              <Text style={styles.bankText}>Branch: SME AURANGABAD</Text>
              <Text style={styles.bankText}>Account Number: 44773710377</Text>
              <Text style={styles.bankText}>IFSC Code: SBIN0063699</Text>
            </View>
          </View>
          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text style={styles.bankText}>For {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
              <View style={styles.signatureLine} />
              <Text style={[styles.bankText, { marginTop: 3 }]}>Authorized Signatory</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export { generateQRDataUrl };
export default InvoicceprintOrder;