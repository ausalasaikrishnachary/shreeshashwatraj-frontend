import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet 
} from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 25,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '1pt solid #e0e0e0',
  },
  companyInfo: {
    flex: 2,
  },
  invoiceMeta: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  companyAddress: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 3,
    lineHeight: 1.3,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#dc3545',
    textAlign: 'center',
  },
  
  // Address Section
  addressSection: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  addressBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
    minHeight: 120,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
    borderBottom: '1pt solid #007bff',
    paddingBottom: 3,
  },
  addressText: {
    fontSize: 8,
    marginBottom: 3,
    lineHeight: 1.3,
  },
  
  // Order Mode Section
  orderModeSection: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  orderModeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // Items Table
  itemsSection: {
    marginBottom: 15,
  },
  itemsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
    paddingBottom: 4,
    borderBottom: '1pt solid #007bff',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: '#343a40',
    borderBottomWidth: 2,
    borderBottomColor: '#212529',
    minHeight: 35,
  },
  
  // Column widths (updated for better centering)
  colSNo: { width: '4%', padding: 4 },
  colProduct: { width: '15%', padding: 4 },
  colDesc: { width: '20%', padding: 4 },
  colQty: { width: '6%', padding: 4 },
  colEDP: { width: '9%', padding: 4 },
  colCreditCharge: { width: '9%', padding: 4 },
  colTaxable: { width: '10%', padding: 4 },
  colGSTPercent: { width: '6%', padding: 4 },
  colGSTAmount: { width: '8%', padding: 4 },
  colCGST: { width: '8%', padding: 4 },
  colSGST: { width: '8%', padding: 4 },
  colTotal: { width: '9%', padding: 4 },
  
  // Table cell styles - ALL CENTERED
  tableCell: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#2c3e50',
    textAlign: 'center',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableCellBold: {
    fontWeight: 'bold',
  },
  tableCellPrimary: {
    color: '#007bff',
  },
  tableCellSuccess: {
    color: '#28a745',
  },
  tableCellDanger: {
    color: '#dc3545',
  },
  
  // Additional styles
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    textAlign: 'center',
    alignSelf: 'center',
  },
  badgePrimary: {
    backgroundColor: '#007bff',
    color: '#ffffff',
  },
  badgeSecondary: {
    backgroundColor: '#6c757d',
    color: '#ffffff',
  },
  
  // Totals Section
  totalsSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  notesSection: {
    flex: 2,
  },
  notesBox: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
    minHeight: 100,
  },
  amountSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  amountTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
    textAlign: 'center',
    borderBottom: '1pt solid #dee2e6',
    paddingBottom: 5,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: '0.5pt dotted #e9ecef',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '2pt solid #007bff',
    paddingTop: 8,
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1pt solid #e0e0e0',
  },
  bankDetails: {
    flex: 1,
  },
  bankTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#007bff',
  },
  bankText: {
    fontSize: 8,
    lineHeight: 1.3,
    marginBottom: 3,
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
    marginBottom: 5,
    marginTop: 20,
  },
  
  // Table summary row
  summaryRow: {
    flexDirection: 'row',
    borderTop: '2pt solid #dee2e6',
    backgroundColor: '#f8f9fa',
  },
});

// Safe data access helper
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

const InvoicePDFDocument = ({ invoiceData, invoiceNumber, gstBreakdown, isSameState }) => {
  const currentData = invoiceData || {};
  const companyInfo = getSafeData(currentData, 'companyInfo', {});
  const supplierInfo = getSafeData(currentData, 'supplierInfo', {});
  const shippingAddress = getSafeData(currentData, 'shippingAddress', {});
  const billingAddress = getSafeData(currentData, 'billingAddress', {});
  const items = getSafeData(currentData, 'items', []);
  
  const displayInvoiceNumber = invoiceNumber || getSafeData(currentData, 'invoiceNumber', 'INV001');
  const invoiceDate = getSafeData(currentData, 'invoiceDate') 
    ? new Date(getSafeData(currentData, 'invoiceDate')).toLocaleDateString('en-IN') 
    : new Date().toLocaleDateString('en-IN');
    
  const dueDate = getSafeData(currentData, 'validityDate') 
    ? new Date(getSafeData(currentData, 'validityDate')).toLocaleDateString('en-IN') 
    : 'N/A';
  
  const orderMode = (getSafeData(currentData, 'order_mode', 'PAKKA')).toUpperCase();
  const isKacha = orderMode === 'KACHA';
  
  // Calculate totals from items
  const calculateTotals = () => {
    let totalTaxableAmount = 0;
    let totalGSTAmount = 0;
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    let totalCreditCharge = 0;
    let grandTotal = 0;
    
    items.forEach(item => {
      const quantity = parseFloat(getSafeData(item, 'quantity', 1));
      
      // Get per unit values
      const taxablePerUnit = parseFloat(getSafeData(item, 'taxable_amount', 0)) / quantity || 0;
      const gstPerUnit = isKacha ? 0 : parseFloat(getSafeData(item, 'tax_amount', 0)) / quantity || 0;
      const cgstPerUnit = isKacha ? 0 : parseFloat(getSafeData(item, 'cgst_amount', 0)) / quantity || 0;
      const sgstPerUnit = isKacha ? 0 : parseFloat(getSafeData(item, 'sgst_amount', 0)) / quantity || 0;
      const creditChargePerUnit = parseFloat(getSafeData(item, 'credit_charge', 0)) / quantity || 0;
      
      // Calculate totals by multiplying with quantity
      const itemTaxableAmount = taxablePerUnit * quantity;
      const itemGSTAmount = isKacha ? 0 : gstPerUnit * quantity;
      const itemCGSTAmount = isKacha ? 0 : cgstPerUnit * quantity;
      const itemSGSTAmount = isKacha ? 0 : sgstPerUnit * quantity;
      const itemCreditCharge = creditChargePerUnit * quantity;
      const itemTotal = isKacha ? itemTaxableAmount : itemTaxableAmount + itemGSTAmount;
      
      totalTaxableAmount += itemTaxableAmount;
      totalGSTAmount += itemGSTAmount;
      totalCGSTAmount += itemCGSTAmount;
      totalSGSTAmount += itemSGSTAmount;
      totalCreditCharge += itemCreditCharge;
      grandTotal += itemTotal;
    });
    
    return {
      totalTaxableAmount: totalTaxableAmount.toFixed(2),
      totalGSTAmount: totalGSTAmount.toFixed(2),
      totalCGSTAmount: totalCGSTAmount.toFixed(2),
      totalSGSTAmount: totalSGSTAmount.toFixed(2),
      totalCreditCharge: totalCreditCharge.toFixed(2),
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
            <Text style={styles.companyName}>{getSafeData(companyInfo, 'name', 'SHREE SHASHWAT RAJ AGRO PVT.LTD.')}</Text>
            <Text style={styles.companyAddress}>
              {getSafeData(companyInfo, 'address', 'PATNA ROAD, 0, SHREE SHASHWAT RAJ AGRO PVT LTD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113')}
            </Text>
            <Text style={styles.companyAddress}>
              Email: {getSafeData(companyInfo, 'email', 'spmathur56@gmail.com')} | 
              Phone: {getSafeData(companyInfo, 'phone', '9801049700')} | 
              GSTIN: {getSafeData(companyInfo, 'gstin', '10AAOCS1541B1ZZ')}
            </Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Invoice No:</Text> {displayInvoiceNumber}</Text>
            <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Invoice Date:</Text> {invoiceDate}</Text>
            <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Due Date:</Text> {dueDate}</Text>
          </View>
        </View>
        
        {/* Address Section */}
        <View style={styles.addressSection}>
          {/* Billing Address */}
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={[styles.addressText, styles.tableCellBold]}>{getSafeData(supplierInfo, 'name', 'Customer')}</Text>
            <Text style={styles.addressText}>{getSafeData(supplierInfo, 'businessName', '')}</Text>
            <Text style={styles.addressText}>GSTIN: {getSafeData(supplierInfo, 'gstin', 'N/A')}</Text>
            <Text style={styles.addressText}>State: {getSafeData(supplierInfo, 'state', 'N/A')}</Text>
            <Text style={styles.addressText}>Email: {getSafeData(supplierInfo, 'email', 'N/A')}</Text>
            
            {/* Order Mode Display */}
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.addressText, styles.tableCellBold]}>Order Type: {orderMode}</Text>
              <Text style={[styles.addressText, isKacha ? { color: '#dc3545' } : { color: '#28a745' }]}>
                {isKacha ? "No GST applicable" : "GST applicable as per item rates"}
              </Text>
            </View>
          </View>
          
          {/* Shipping Address */}
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <Text style={styles.addressText}>{getSafeData(shippingAddress, 'addressLine1', getSafeData(billingAddress, 'addressLine1', 'N/A'))}</Text>
            <Text style={styles.addressText}>{getSafeData(shippingAddress, 'addressLine2', getSafeData(billingAddress, 'addressLine2', ''))}</Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'city', getSafeData(billingAddress, 'city', ''))} - 
              {getSafeData(shippingAddress, 'pincode', getSafeData(billingAddress, 'pincode', ''))}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'state', getSafeData(billingAddress, 'state', ''))}, 
              {getSafeData(shippingAddress, 'country', getSafeData(billingAddress, 'country', 'India'))}
            </Text>
            {getSafeData(shippingAddress, 'gstin') && (
              <Text style={styles.addressText}>Shipping GSTIN: {getSafeData(shippingAddress, 'gstin')}</Text>
            )}
            
            {/* Sales Person */}
            {getSafeData(currentData, 'assigned_staff') && getSafeData(currentData, 'assigned_staff') !== 'N/A' && (
              <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.addressText}>Sales Person:</Text>
                <Text style={[styles.addressText, styles.tableCellBold, { color: '#007bff' }]}>
                  {getSafeData(currentData, 'assigned_staff')}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Items Table */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items Details</Text>
          
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colSNo}><Text style={styles.tableCellHeader}>#</Text></View>
            <View style={styles.colProduct}><Text style={styles.tableCellHeader}>Product</Text></View>
            <View style={styles.colDesc}><Text style={styles.tableCellHeader}>Description</Text></View>
            <View style={styles.colQty}><Text style={styles.tableCellHeader}>Qty</Text></View>
            <View style={styles.colEDP}><Text style={styles.tableCellHeader}>EDP</Text></View>
            <View style={styles.colCreditCharge}><Text style={styles.tableCellHeader}>Credit Charge</Text></View>
            <View style={styles.colTaxable}><Text style={styles.tableCellHeader}>Taxable Amount</Text></View>
            <View style={styles.colGSTPercent}><Text style={styles.tableCellHeader}>GST </Text></View>
            <View style={styles.colGSTAmount}><Text style={styles.tableCellHeader}>GST Amt</Text></View>
            <View style={styles.colCGST}><Text style={styles.tableCellHeader}>CGST Amt</Text></View>
            <View style={styles.colSGST}><Text style={styles.tableCellHeader}>SGST Amt</Text></View>
            <View style={styles.colTotal}><Text style={styles.tableCellHeader}>Item Total</Text></View>
          </View>
          
          {/* Table Rows */}
          {items.map((item, index) => {
            const quantity = parseFloat(getSafeData(item, 'quantity', 1));
            const editedPrice = parseFloat(getSafeData(item, 'edited_sale_price', 0)) || parseFloat(getSafeData(item, 'price', 0));
            const creditCharge = parseFloat(getSafeData(item, 'credit_charge', 0));
            const taxablePerUnit = parseFloat(getSafeData(item, 'taxable_amount', 0)) / quantity || 0;
            const gstPercentage = isKacha ? 0 : parseFloat(getSafeData(item, 'gst', 0));
            const gstPerUnit = isKacha ? 0 : parseFloat(getSafeData(item, 'tax_amount', 0)) / quantity || 0;
            const cgstPerUnit = isKacha ? 0 : parseFloat(getSafeData(item, 'cgst_amount', 0)) / quantity || 0;
            const sgstPerUnit = isKacha ? 0 : parseFloat(getSafeData(item, 'sgst_amount', 0)) / quantity || 0;
            
            // Calculate totals by multiplying with quantity
            const totalTaxable = taxablePerUnit * quantity;
            const totalGST = gstPerUnit * quantity;
            const totalCGST = cgstPerUnit * quantity;
            const totalSGST = sgstPerUnit * quantity;
            const totalCreditCharge = creditCharge * quantity;
            const itemTotal = isKacha ? totalTaxable : totalTaxable + totalGST;
            
            return (
              <View style={styles.tableRow} key={index}>
                {/* S.No */}
                <View style={styles.colSNo}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                </View>
                
                {/* Product */}
                <View style={styles.colProduct}>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>{getSafeData(item, 'product', `Item ${index + 1}`)}</Text>
                </View>
                
                {/* Description */}
                <View style={styles.colDesc}>
                  <Text style={styles.tableCell}>{getSafeData(item, 'description', 'No description')}</Text>
                </View>
                
                {/* Quantity */}
                <View style={styles.colQty}>
                  <Text style={styles.tableCell}>{quantity}</Text>
                </View>
                
                {/* EDP */}
                <View style={styles.colEDP}>
                  <Text style={styles.tableCell}>₹{editedPrice.toFixed(2)}</Text>
                </View>
                
                {/* Credit Charge */}
                <View style={styles.colCreditCharge}>
                  <Text style={styles.tableCell}>₹{creditCharge.toFixed(2)}</Text>
                </View>
                
                {/* Taxable Amount */}
                <View style={styles.colTaxable}>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>₹{totalTaxable.toFixed(2)}</Text>
                </View>
                
                {/* GST Percentage */}
              <View style={styles.colGSTPercent}>
  <View style={styles.badge}>
    <Text style={styles.tableCell}>
      {isKacha ? '0%' : `${gstPercentage}%`}
    </Text>
  </View>
</View>
                
                {/* GST Amount */}
                <View style={styles.colGSTAmount}>
                  <Text style={styles.tableCell}>
                    {isKacha ? '₹0.00' : `₹${totalGST.toFixed(2)}`}
                  </Text>
                </View>
                
                {/* CGST Amount */}
                <View style={styles.colCGST}>
                  <Text style={styles.tableCell}>
                    {isKacha ? '₹0.00' : `₹${totalCGST.toFixed(2)}`}
                  </Text>
                </View>
                
                {/* SGST Amount */}
                <View style={styles.colSGST}>
                  <Text style={styles.tableCell}>
                    {isKacha ? '₹0.00' : `₹${totalSGST.toFixed(2)}`}
                  </Text>
                </View>
                
                {/* Item Total */}
                <View style={styles.colTotal}>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellSuccess]}>
                    ₹{itemTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
          
          {/* Table Summary - Single Row like in the image */}
          <View style={[styles.tableRow, styles.summaryRow]}>
            <View style={[styles.colSNo, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colProduct, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colDesc, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colQty, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colEDP, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colCreditCharge, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colTaxable, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colGSTPercent, { borderRightWidth: 0 }]}></View>
            <View style={styles.colGSTAmount}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Total:</Text>
            </View>
            <View style={styles.colCGST}>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellSuccess]}>
                ₹{totals.totalGSTAmount}
              </Text>
            </View>
            <View style={[styles.colSGST, { borderRightWidth: 0 }]}></View>
            <View style={styles.colTotal}>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellDanger]}>
                ₹{totals.grandTotal}
              </Text>
            </View>
          </View>
          
          <View style={[styles.tableRow, { backgroundColor: '#f8f9fa', borderBottom: 'none' }]}>
            <View style={[styles.colSNo, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colProduct, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colDesc, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colQty, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colEDP, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colCreditCharge, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colTaxable, { borderRightWidth: 0 }]}></View>
            <View style={styles.colGSTPercent}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>GST:</Text>
            </View>
            <View style={styles.colGSTAmount}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>1-</Text>
            </View>
            <View style={styles.colCGST}>
              <Text style={styles.tableCell}>
                Total: {totals.totalGSTAmount}
              </Text>
            </View>
            <View style={[styles.colSGST, { borderRightWidth: 0 }]}></View>
            <View style={[styles.colTotal, { borderRightWidth: 0 }]}></View>
          </View>
        </View>
        
        {/* Totals and Notes Section */}
        <View style={styles.totalsSection}>
          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <View style={styles.notesBox}>
              <Text style={styles.tableCell}>
                {getSafeData(currentData, 'note', 'No note added')}
              </Text>
            </View>
            
            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Transportation Details:</Text>
            <View style={styles.notesBox}>
              <Text style={styles.tableCell}>
                {getSafeData(currentData, 'transportDetails', 'Standard delivery')}
              </Text>
            </View>
          </View>
          
          {/* Amount Summary */}
          <View style={styles.amountSection}>
            <Text style={styles.amountTitle}>Amount Summary</Text>
            
            {/* Taxable Amount */}
            <View style={styles.amountRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Taxable Amount:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold]}>₹{totals.totalTaxableAmount}</Text>
            </View>
            
            {/* CGST and SGST (only for PAKKA) */}
            {!isKacha && (
              <>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>CGST:</Text>
                  <Text style={styles.tableCell}>₹{totals.totalCGSTAmount}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>SGST:</Text>
                  <Text style={styles.tableCell}>₹{totals.totalSGSTAmount}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>Total GST:</Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellSuccess]}>
                    ₹{totals.totalGSTAmount}
                  </Text>
                </View>
              </>
            )}
            
            {/* Credit Charge */}
            {parseFloat(totals.totalCreditCharge) > 0 && (
              <View style={styles.amountRow}>
                <Text style={styles.tableCell}>Credit Charge:</Text>
                <Text style={styles.tableCell}>₹{totals.totalCreditCharge}</Text>
              </View>
            )}
            
            {/* Grand Total */}
            <View style={styles.grandTotal}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Grand Total:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, { color: isKacha ? '#007bff' : '#28a745' }]}>
                ₹{totals.grandTotal}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details:</Text>
            <Text style={styles.bankText}>Account Name: {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
            <Text style={styles.bankText}>Account Number: XXXX XXXX XXXX</Text>
            <Text style={styles.bankText}>IFSC Code: XXXX0123456</Text>
            <Text style={styles.bankText}>Bank Name: Sample Bank</Text>
          </View>
          
          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text style={styles.bankText}>For {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.bankText}>Authorized Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDFDocument;