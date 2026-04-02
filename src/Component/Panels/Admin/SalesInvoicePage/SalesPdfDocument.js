import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet 
} from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'NotoSans',
  src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4g.ttf'
});
// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 9,
fontFamily: 'NotoSans'
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
    fontSize: 14,
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
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
    gap: 10,
  },
  salesPersonLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666666',
  },
  salesPersonName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#007bff',
  },
  
  // Items Table
  itemsSection: {
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
    paddingBottom: 4,
    borderBottom: '1pt solid #007bff',
  },
  
  // Table styles - Fixed alignment
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    minHeight: 28,
  },
  tableHeader: {
    backgroundColor: '#343a40',
    borderBottomWidth: 1,
    borderBottomColor: '#212529',
  },
  
  // Column widths - Properly aligned
  colSNo: { width: '8%', padding: 5 },
  colProduct: { width: '32%', padding: 5 },
  colHsn: { width: '15%', padding: 5 },
  colQty: { width: '10%', padding: 5 },
  colPrice: { width: '15%', padding: 5 },
  colGST: { width: '10%', padding: 5 },
  colTotal: { width: '10%', padding: 5 },
  
  // Table cell styles
  tableCell: {
    fontSize: 8,
    lineHeight: 1.4,
    color: '#2c3e50',
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableCellLeft: {
    textAlign: 'left',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellBold: {
    fontWeight: 'bold',
  },
  
  // Totals Section
  totalsSection: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 15,
  },
  notesSection: {
    flex: 2,
  },
  notesBox: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
    minHeight: 80,
  },
  amountSection: {
    flex: 1.2,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    border: '1pt solid #dee2e6',
  },
  amountTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 12,
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
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    paddingTop: 15,
    borderTop: '1pt solid #e0e0e0',
  },
  bankDetails: {
    flex: 1,
  },
  bankTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#007bff',
  },
  bankText: {
    fontSize: 7,
    lineHeight: 1.3,
    marginBottom: 2,
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
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              SHREE SHASHWATRAJ AGRO PVT LTD
            </Text>
            <Text style={styles.companyAddress}>
              Growth Center, Jasoiya, Aurangabad, Bihar - 824101
            </Text>
            <Text style={styles.companyAddress}>
              GSTIN/UIN: 10AAOCS1541B1ZZ
            </Text>
            <Text style={styles.companyAddress}>
              State Name: Bihar | Code: 10
            </Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text><Text style={styles.tableCellBold}>Invoice No:</Text> {displayInvoiceNumber}</Text>
            <Text><Text style={styles.tableCellBold}>Invoice Date:</Text> {invoiceDate}</Text>
            <Text><Text style={styles.tableCellBold}>Due Date:</Text> {dueDate}</Text>
          </View>
        </View>
        
        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={[styles.addressText, styles.tableCellBold]}>
              {getSafeData(supplierInfo, 'name', 'Customer')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(supplierInfo, 'business_name', '')}
            </Text>
            {/* ADDED MOBILE NUMBER HERE */}
            <Text style={styles.addressText}>
             {getSafeData(supplierInfo, 'mobile_number') || getSafeData(supplierInfo, 'phone_number', 'N/A')}
            </Text>
            <Text style={styles.addressText}>
              GSTIN: {getSafeData(supplierInfo, 'gstin', 'N/A')}
            </Text>
            <Text style={styles.addressText}>
              State: {getSafeData(supplierInfo, 'state', 'N/A')}
            </Text>
          </View>
          
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'addressLine1', 'N/A')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'addressLine2', '')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'city', '')} - {getSafeData(shippingAddress, 'pincode', '')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'state', '')}
            </Text>
          </View>
        </View>
        
        {/* Sales Person */}
        {getSafeData(currentData, 'assigned_staff') && getSafeData(currentData, 'assigned_staff') !== 'N/A' && (
          <View style={styles.salesPersonSection}>
            <Text style={styles.salesPersonLabel}>Sales Person:</Text>
            <Text style={styles.salesPersonName}>
              {getSafeData(currentData, 'assigned_staff')}
            </Text>
          </View>
        )}
        
        {/* Items Table */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items Details</Text>
          
          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.colSNo}><Text style={[styles.tableCellHeader, styles.tableCellCenter]}>S.No</Text></View>
              <View style={styles.colProduct}><Text style={[styles.tableCellHeader, styles.tableCellLeft]}>Product</Text></View>
              <View style={styles.colHsn}><Text style={[styles.tableCellHeader, styles.tableCellCenter]}>HSN Code</Text></View>
              <View style={styles.colQty}><Text style={[styles.tableCellHeader, styles.tableCellCenter]}>Units</Text></View>
              <View style={styles.colPrice}><Text style={[styles.tableCellHeader, styles.tableCellRight]}>Price (₹)</Text></View>
              <View style={styles.colGST}><Text style={[styles.tableCellHeader, styles.tableCellCenter]}>GST %</Text></View>
              <View style={styles.colTotal}><Text style={[styles.tableCellHeader, styles.tableCellRight]}>Amount (₹)</Text></View>
            </View>
            
            {/* Table Rows */}
            {items.map((item, index) => {
              const quantity = parseFloat(getSafeData(item, 'quantity', 1));
              const price = parseFloat(getSafeData(item, 'price', 0));
              const gst = parseFloat(getSafeData(item, 'gst', 0));
              const discount = parseFloat(getSafeData(item, 'discount', 0));
              const hsnCode = getSafeData(item, 'hsn_code', '');
              
              const subtotal = quantity * price;
              const discountAmount = subtotal * (discount / 100);
              const amountAfterDiscount = subtotal - discountAmount;
              const gstAmount = amountAfterDiscount * (gst / 100);
              const itemTotal = amountAfterDiscount + gstAmount;
              
              return (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.colSNo}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{index + 1}</Text>
                  </View>
                  <View style={styles.colProduct}>
                    <Text style={[styles.tableCell, styles.tableCellLeft, styles.tableCellBold]}>
                      {getSafeData(item, 'product', `Item ${index + 1}`)}
                    </Text>
                  </View>
                  <View style={styles.colHsn}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>
                      {hsnCode || '-'}
                    </Text>
                  </View>
                  <View style={styles.colQty}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{quantity}</Text>
                  </View>
                  <View style={styles.colPrice}>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>₹{price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.colGST}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{gst}%</Text>
                  </View>
                  <View style={styles.colTotal}>
                    <Text style={[styles.tableCell, styles.tableCellRight, styles.tableCellBold]}>
                      ₹{itemTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Totals and Notes Section */}
        <View style={styles.totalsSection}>
          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <View style={styles.notesBox}>
              <Text style={styles.addressText}>
                {getSafeData(currentData, 'note', 'Thank you for your business!')}
              </Text>
            </View>
          </View>
          
          {/* Amount Summary */}
          <View style={styles.amountSection}>
            <Text style={styles.amountTitle}>Amount Summary</Text>
            
            {/* Taxable Amount */}
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Amount:</Text>
              <Text style={styles.amountValue}>₹{getSafeData(currentData, 'taxableAmount', '0.00')}</Text>
            </View>
            
            {/* GST Breakdown */}
            {isSameState ? (
              <>
                <View style={styles.amountRow}>
                  <Text>CGST:</Text>
                  <Text>₹{gstBreakdown?.totalCGST || '0.00'}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text>SGST:</Text>
                  <Text>₹{gstBreakdown?.totalSGST || '0.00'}</Text>
                </View>
              </>
            ) : (
              <View style={styles.amountRow}>
                <Text>IGST:</Text>
                <Text>₹{gstBreakdown?.totalIGST || '0.00'}</Text>
              </View>
            )}
            
            {/* Total GST */}
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Total GST:</Text>
              <Text style={[styles.amountValue, { color: '#28a745' }]}>
                ₹{getSafeData(currentData, 'totalGST', '0.00')}
              </Text>
            </View>
            
            {/* Grand Total */}
            <View style={styles.grandTotal}>
              <Text style={styles.amountLabel}>Grand Total:</Text>
              <Text style={[styles.amountValue, { color: '#28a745', fontSize: 10 }]}>
                ₹{getSafeData(currentData, 'grandTotal', '0.00')}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details:</Text>
            
            <Text style={styles.bankText}>
              Company Name: SHREE SHASHWATRAJ AGRO PVT LTD
            </Text>
            
            <Text style={styles.bankText}>
              Bank Name: STATE BANK OF INDIA
            </Text>
            
            <Text style={styles.bankText}>
              Branch: SME AURANGABAD
            </Text>
            
            <Text style={styles.bankText}>
              Account Number: 44773710377
            </Text>
            
            <Text style={styles.bankText}>
              IFSC Code: SBIN0063699
            </Text>
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