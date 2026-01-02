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
    minHeight: 100,
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
  
  // Sales Person Section
  salesPersonSection: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
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
    minHeight: 25,
  },
  tableHeader: {
    backgroundColor: '#343a40',
    borderBottomWidth: 2,
    borderBottomColor: '#212529',
    minHeight: 30,
  },
  
  // Simplified column widths matching your invoice
  colSNo: { width: '5%', padding: 3 },
  colProduct: { width: '20%', padding: 3 },
  colDesc: { width: '25%', padding: 3 },
  colQty: { width: '8%', padding: 3 },
  colPrice: { width: '12%', padding: 3 },
  colGST: { width: '8%', padding: 3 },
  colTotal: { width: '12%', padding: 3 },
  colBatch: { width: '10%', padding: 3 },
  
  // Table cell styles
  tableCell: {
    fontSize: 8,
    lineHeight: 1.4,
    color: '#2c3e50',
    textAlign: 'center',
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableCellLeft: {
    textAlign: 'left',
  },
  tableCellRight: {
    textAlign: 'right',
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
    padding: 8,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
    minHeight: 80,
  },
  amountSection: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
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
    marginBottom: 5,
    paddingBottom: 3,
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
    borderBottom: '1pt solid #000',
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

const SalesPdfDocument = ({ invoiceData, invoiceNumber, gstBreakdown, isSameState }) => {
  const currentData = invoiceData || {};
  const companyInfo = getSafeData(currentData, 'companyInfo', {});
  const supplierInfo = getSafeData(currentData, 'supplierInfo', {});
  const shippingAddress = getSafeData(currentData, 'shippingAddress', {});
  const items = getSafeData(currentData, 'items', []);
  
  const displayInvoiceNumber = invoiceNumber || getSafeData(currentData, 'invoiceNumber', 'INV001');
  const invoiceDate = getSafeData(currentData, 'invoiceDate') 
    ? new Date(getSafeData(currentData, 'invoiceDate')).toLocaleDateString('en-IN') 
    : new Date().toLocaleDateString('en-IN');
    
  const dueDate = getSafeData(currentData, 'validityDate') 
    ? new Date(getSafeData(currentData, 'validityDate')).toLocaleDateString('en-IN') 
    : 'N/A';
  
  // Calculate totals from items
  const calculateTotals = () => {
    let totalTaxableAmount = 0;
    let totalGSTAmount = 0;
    let totalCGSTAmount = 0;
    let totalSGSTAmount = 0;
    let grandTotal = 0;
    
    items.forEach(item => {
      const quantity = parseFloat(getSafeData(item, 'quantity', 1));
      const price = parseFloat(getSafeData(item, 'price', 0));
      const discount = parseFloat(getSafeData(item, 'discount', 0));
      const gst = parseFloat(getSafeData(item, 'gst', 0));
      const cgst = parseFloat(getSafeData(item, 'cgst', 0));
      const sgst = parseFloat(getSafeData(item, 'sgst', 0));
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      const cgstAmount = amountAfterDiscount * (cgst / 100);
      const sgstAmount = amountAfterDiscount * (sgst / 100);
      const itemTotal = amountAfterDiscount + gstAmount;
      
      totalTaxableAmount += amountAfterDiscount;
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
            <Text style={[styles.addressText, styles.tableCellBold, styles.tableCellLeft]}>
              {getSafeData(supplierInfo, 'name', 'Customer')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(supplierInfo, 'businessName', '')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              GSTIN: {getSafeData(supplierInfo, 'gstin', 'N/A')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              State: {getSafeData(supplierInfo, 'state', 'N/A')}
            </Text>
          </View>
          
          {/* Shipping Address */}
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(shippingAddress, 'addressLine1', 'N/A')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(shippingAddress, 'addressLine2', '')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(shippingAddress, 'city', '')} - {getSafeData(shippingAddress, 'pincode', '')}
            </Text>
            <Text style={[styles.addressText, styles.tableCellLeft]}>
              {getSafeData(shippingAddress, 'state', '')}
            </Text>
          </View>
        </View>
        
        {/* Sales Person */}
        {getSafeData(currentData, 'assigned_staff') && getSafeData(currentData, 'assigned_staff') !== 'N/A' && (
          <View style={styles.salesPersonSection}>
            <Text style={[styles.addressText, styles.tableCellBold]}>Sales Person:</Text>
            <Text style={[styles.addressText, styles.tableCellBold, { color: '#007bff' }]}>
              {getSafeData(currentData, 'assigned_staff')}
            </Text>
          </View>
        )}
        
        {/* Items Table */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items Details</Text>
          
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colSNo}><Text style={styles.tableCellHeader}>#</Text></View>
            <View style={styles.colProduct}><Text style={styles.tableCellHeader}>Product</Text></View>
            <View style={styles.colDesc}><Text style={styles.tableCellHeader}>Description</Text></View>
            <View style={styles.colQty}><Text style={styles.tableCellHeader}>Qty</Text></View>
            <View style={styles.colPrice}><Text style={styles.tableCellHeader}>Price</Text></View>
            <View style={styles.colGST}><Text style={styles.tableCellHeader}>GST %</Text></View>
            <View style={styles.colTotal}><Text style={styles.tableCellHeader}>Amount (₹)</Text></View>
          </View>
          
          {/* Table Rows */}
          {items.map((item, index) => {
            const quantity = parseFloat(getSafeData(item, 'quantity', 1));
            const price = parseFloat(getSafeData(item, 'price', 0));
            const gst = parseFloat(getSafeData(item, 'gst', 0));
            const discount = parseFloat(getSafeData(item, 'discount', 0));
            
            const subtotal = quantity * price;
            const discountAmount = subtotal * (discount / 100);
            const amountAfterDiscount = subtotal - discountAmount;
            const gstAmount = amountAfterDiscount * (gst / 100);
            const itemTotal = amountAfterDiscount + gstAmount;
            
            return (
              <View style={styles.tableRow} key={index}>
                {/* S.No */}
                <View style={styles.colSNo}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                </View>
                
                {/* Product */}
                <View style={styles.colProduct}>
                  <Text style={[styles.tableCell, styles.tableCellLeft, styles.tableCellBold]}>
                    {getSafeData(item, 'product', `Item ${index + 1}`)}
                  </Text>
                </View>
                
                {/* Description */}
                <View style={styles.colDesc}>
                  <Text style={[styles.tableCell, styles.tableCellLeft]}>
                    {getSafeData(item, 'description', 'No description')}
                  </Text>
                </View>
                
                {/* Quantity */}
                <View style={styles.colQty}>
                  <Text style={styles.tableCell}>{quantity}</Text>
                </View>
                
                {/* Price */}
                <View style={styles.colPrice}>
                  <Text style={[styles.tableCell, styles.tableCellRight]}>₹{price.toFixed(2)}</Text>
                </View>
                
                {/* GST Percentage */}
                <View style={styles.colGST}>
                  <Text style={styles.tableCell}>{gst}%</Text>
                </View>
                
                {/* Item Total */}
                <View style={styles.colTotal}>
                  <Text style={[styles.tableCell, styles.tableCellRight, styles.tableCellBold]}>
                    ₹{itemTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        
        {/* Totals and Notes Section */}
        <View style={styles.totalsSection}>
          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <View style={styles.notesBox}>
              <Text style={[styles.tableCell, styles.tableCellLeft]}>
                {getSafeData(currentData, 'note', 'Thank you for your business!')}
              </Text>
            </View>
            
            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Transportation Details:</Text>
            <View style={styles.notesBox}>
              <Text style={[styles.tableCell, styles.tableCellLeft]}>
                {getSafeData(currentData, 'transportDetails', 'Standard delivery')}
              </Text>
            </View>
          </View>
          
          {/* Amount Summary */}
          <View style={styles.amountSection}>
            <Text style={styles.amountTitle}>Amount Summary</Text>
            
            {/* Taxable Amount */}
            <View style={styles.amountRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Amount:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold]}>₹{totals.totalTaxableAmount}</Text>
            </View>
            
            {/* GST Breakdown */}
            {isSameState ? (
              <>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>CGST:</Text>
                  <Text style={styles.tableCell}>₹{gstBreakdown?.totalCGST || '0.00'}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.tableCell}>SGST:</Text>
                  <Text style={styles.tableCell}>₹{gstBreakdown?.totalSGST || '0.00'}</Text>
                </View>
              </>
            ) : (
              <View style={styles.amountRow}>
                <Text style={styles.tableCell}>IGST:</Text>
                <Text style={styles.tableCell}>₹{gstBreakdown?.totalIGST || '0.00'}</Text>
              </View>
            )}
            
            {/* Total GST */}
            <View style={styles.amountRow}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Total GST:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellSuccess]}>
                ₹{getSafeData(currentData, 'totalGST', '0.00')}
              </Text>
            </View>
            
            {/* Grand Total */}
            <View style={styles.grandTotal}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>Grand Total:</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, { color: '#28a745' }]}>
                ₹{getSafeData(currentData, 'grandTotal', '0.00')}
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
              <Text style={[styles.bankText, { marginTop: 5 }]}>Authorized Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SalesPdfDocument;