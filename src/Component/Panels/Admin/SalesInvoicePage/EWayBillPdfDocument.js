// EWayBillPdfDocument.js
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font,
  Image 
} from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 8,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  // Two column layout
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  leftColumn: {
    width: '50%',
    paddingRight: 8,
  },
  rightColumn: {
    width: '50%',
    paddingLeft: 8,
  },
  
  // Header
  header: {
    marginBottom: 6,
    borderBottom: '2px solid #000000',
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#555555',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  
  // Status Badge
  statusBadge: {
    padding: 3,
    borderRadius: 2,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 7,
    marginBottom: 2,
  },
  statusGenerated: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusCancelled: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  
  // Section styles
  section: {
    marginBottom: 4,
    padding: 4,
    border: '1px solid #e0e0e0',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
    backgroundColor: '#f5f5f5',
    padding: 2,
    paddingHorizontal: 4,
    borderBottom: '1px solid #e0e0e0',
  },
  
  // Field rows
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 1.5,
    alignItems: 'center',
  },
  label: {
    width: '35%',
    fontWeight: 'bold',
    fontSize: 7,
    color: '#444444',
  },
  value: {
    width: '65%',
    fontSize: 7,
    color: '#000000',
  },
  
  // Compact table
  table: {
    width: '100%',
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderBottom: '1px solid #000000',
    fontSize: 6.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #e0e0e0',
    paddingVertical: 1.5,
    fontSize: 6.5,
  },
  tableCol: {
    paddingHorizontal: 2,
    fontSize: 6.5,
  },
  col1: { width: '4%', textAlign: 'center' },
  col2: { width: '16%' },
  col3: { width: '12%' },
  col4: { width: '8%', textAlign: 'center' },
  col5: { width: '12%', textAlign: 'right' },
  col6: { width: '14%', textAlign: 'right' },
  col7: { width: '10%', textAlign: 'center' },
  col8: { width: '24%', textAlign: 'right' },
  
  // Financial summary compact
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 1,
    paddingVertical: 1,
    borderBottom: '0.5px solid #e0e0e0',
  },
  summaryLabel: {
    width: '40%',
    fontSize: 7,
    fontWeight: 'bold',
  },
  summaryValue: {
    width: '60%',
    fontSize: 7,
    textAlign: 'right',
  },
  grandTotal: {
    borderTop: '2px solid #000000',
    paddingTop: 2,
    marginTop: 2,
    fontWeight: 'bold',
    fontSize: 8,
  },
  
  // Footer
  footer: {
    marginTop: 4,
    borderTop: '1px solid #cccccc',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signature: {
    textAlign: 'right',
  },
  signatureLine: {
    width: 100,
    marginLeft: 'auto',
    borderBottom: '1px solid #000000',
    marginTop: 15,
    marginBottom: 3,
  },
  
  // QR Code
  qrContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  qrImage: {
    width: 50,
    height: 50,
  },
  
  // EWB specific
  ewbNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  ewbDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
    paddingVertical: 1,
    borderBottom: '0.5px solid #f0f0f0',
  },
  ewbLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#555555',
  },
  ewbValue: {
    fontSize: 7,
    color: '#000000',
  },
  
  // Transport details compact
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
    paddingVertical: 1,
  },
  
  // IRN Details
  irnContainer: {
    backgroundColor: '#f9f9f9',
    padding: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  irnText: {
    fontSize: 6.5,
    color: '#333333',
  },
});

const EWayBillPdfDocument = ({ 
  invoiceData, 
  invoiceNumber,
  gstBreakdown,
  isSameState,
  unitData,
  ewayBillStatus,
  irnDetails,
  companyInfo
}) => {
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  // Get GST type
  const getGstType = () => {
    if (isSameState) return 'CGST/SGST';
    return 'IGST';
  };

  // Get status style
  const getStatusStyle = () => {
    if (ewayBillStatus?.status === 'Generated') return styles.statusGenerated;
    if (ewayBillStatus?.status === 'Cancelled') return styles.statusCancelled;
    return styles.statusPending;
  };

  // Get status text
  const getStatusText = () => {
    if (ewayBillStatus?.status === 'Generated') return '✓ GENERATED';
    if (ewayBillStatus?.status === 'Cancelled') return '✗ CANCELLED';
    return '⏳ PENDING';
  };

  // Calculate totals
  const taxableAmount = parseFloat(invoiceData.taxableAmount) || 0;
  const totalGST = parseFloat(invoiceData.totalGST) || 0;
  const grandTotal = parseFloat(invoiceData.grandTotal) || 0;

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>E-Way Bill</Text>
            <Text style={styles.headerSubtitle}>Govt. of India - GST Act 2017</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, getStatusStyle()]}>
              <Text>{getStatusText()}</Text>
            </View>
            <Text style={styles.headerSubtitle}>EWB: {ewayBillStatus?.ewbNo || 'N/A'}</Text>
          </View>
        </View>

        {/* Two Column Layout */}
        <View style={styles.row}>
          
          {/* LEFT COLUMN - Invoice Details */}
          <View style={styles.leftColumn}>
            
            {/* Invoice Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Invoice Details</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Invoice No:</Text>
                <Text style={styles.value}>{invoiceNumber}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{formatDate(invoiceData.invoiceDate)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Type:</Text>
                <Text style={styles.value}>{invoiceData.document_type || 'Tax Invoice'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Transaction:</Text>
                <Text style={styles.value}>{invoiceData.bb_bc?.toUpperCase() || 'B2B'}</Text>
              </View>
            </View>

            {/* Supplier */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supplier</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{companyInfo.name || invoiceData.companyInfo.name}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>GSTIN:</Text>
                <Text style={styles.value}>{companyInfo.gstin || invoiceData.companyInfo.gstin}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>State:</Text>
                <Text style={styles.value}>{companyInfo.stateCode || invoiceData.companyInfo.stateCode}</Text>
              </View>
            </View>

            {/* Recipient */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recipient</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{invoiceData.supplierInfo.business_name || invoiceData.supplierInfo.name}</Text>
              </View>
              {invoiceData.bb_bc !== 'b2c' && (
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>GSTIN:</Text>
                  <Text style={styles.value}>{invoiceData.supplierInfo.gstin || 'N/A'}</Text>
                </View>
              )}
              <View style={styles.fieldRow}>
                <Text style={styles.label}>State:</Text>
                <Text style={styles.value}>{invoiceData.supplierInfo.state || 'N/A'}</Text>
              </View>
            </View>

            {/* Financial Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financial Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxable Value:</Text>
                <Text style={styles.summaryValue}>{taxableAmount}</Text>
              </View>
              
              {isSameState ? (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>CGST:</Text>
                    <Text style={styles.summaryValue}>{gstBreakdown.totalCGST}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>SGST:</Text>
                    <Text style={styles.summaryValue}>{gstBreakdown.totalSGST}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>IGST:</Text>
                  <Text style={styles.summaryValue}>{gstBreakdown.totalIGST}</Text>
                </View>
              )}
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total GST:</Text>
                <Text style={styles.summaryValue}>{totalGST}</Text>
              </View>

              {invoiceData.additionalCharge && parseFloat(invoiceData.additionalChargeAmount) > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{invoiceData.additionalCharge}:</Text>
                  <Text style={styles.summaryValue}>{invoiceData.additionalChargeAmount}</Text>
                </View>
              )}

              <View style={[styles.summaryRow, styles.grandTotal]}>
                <Text style={[styles.summaryLabel, { fontSize: 8 }]}>Grand Total:</Text>
                <Text style={[styles.summaryValue, { fontSize: 8 }]}>
                  {grandTotal}
                </Text>
              </View>
            </View>

          </View>

          {/* RIGHT COLUMN - E-Way Bill Details */}
          <View style={styles.rightColumn}>
            
            {/* E-Way Bill Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>E-Way Bill Status</Text>
              <View style={styles.ewbDetailRow}>
                <Text style={styles.ewbLabel}>EWB No:</Text>
                <Text style={styles.ewbValue}>{ewayBillStatus?.ewbNo || 'N/A'}</Text>
              </View>
              <View style={styles.ewbDetailRow}>
                <Text style={styles.ewbLabel}>Generated:</Text>
                <Text style={styles.ewbValue}>{formatDate(ewayBillStatus?.generatedDate)}</Text>
              </View>
              <View style={styles.ewbDetailRow}>
                <Text style={styles.ewbLabel}>Valid Till:</Text>
                <Text style={styles.ewbValue}>{formatDate(ewayBillStatus?.validTill)}</Text>
              </View>
              <View style={styles.ewbDetailRow}>
                <Text style={styles.ewbLabel}>Status:</Text>
                <Text style={[styles.ewbValue, { fontWeight: 'bold' }]}>
                  {ewayBillStatus?.status || 'Pending'}
                </Text>
              </View>
            </View>

            {/* IRN Details */}
            {/* {irnDetails && (
              <View style={[styles.section, { backgroundColor: '#fafafa' }]}>
                <Text style={styles.sectionTitle}>E-Invoice Reference</Text>
                <View style={styles.irnContainer}>
                  <Text style={styles.irnText}>
                    <Text style={{ fontWeight: 'bold' }}>IRN: </Text>
                    {irnDetails.irn_no || 'N/A'}
                  </Text>
                  <Text style={styles.irnText}>
                    <Text style={{ fontWeight: 'bold' }}>Ack No: </Text>
                    {irnDetails.ack_no || 'N/A'}
                  </Text>
                  <Text style={styles.irnText}>
                    <Text style={{ fontWeight: 'bold' }}>Date: </Text>
                    {formatDate(irnDetails.ack_date)}
                  </Text>
                </View>
              </View>
            )} */}

            {/* Transport Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transport</Text>
              <View style={styles.transportRow}>
                <Text style={styles.ewbLabel}>Mode:</Text>
                <Text style={styles.ewbValue}>{invoiceData.transportDetails?.transport || 'Road'}</Text>
              </View>
              <View style={styles.transportRow}>
                <Text style={styles.ewbLabel}>Vehicle:</Text>
                <Text style={styles.ewbValue}>{invoiceData.transportDetails?.vehicleNo || 'N/A'}</Text>
              </View>
              <View style={styles.transportRow}>
                <Text style={styles.ewbLabel}>GR/RR:</Text>
                <Text style={styles.ewbValue}>{invoiceData.transportDetails?.grNumber || 'N/A'}</Text>
              </View>
              <View style={styles.transportRow}>
                <Text style={styles.ewbLabel}>Station:</Text>
                <Text style={styles.ewbValue}>{invoiceData.transportDetails?.station || 'N/A'}</Text>
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Info</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>GST Type:</Text>
                <Text style={styles.value}>{getGstType()}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>GST Exempt:</Text>
                <Text style={styles.value}>{invoiceData.gstExempt ? 'Yes' : 'No'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Trans Type:</Text>
                <Text style={styles.value}>{invoiceData.transportDetails?.transport || 'Road'}</Text>
              </View>
            </View>

            {/* QR Code placeholder */}
            {/* <View style={styles.qrContainer}>
              <Text style={{ fontSize: 6, color: '#999', textAlign: 'center' }}>
                Scan for E-Way Bill Details
              </Text>
            </View> */}

          </View>
        </View>

        {/* Items Table - Full Width */}
        <View style={[styles.section, { marginTop: 2 }]}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, styles.col1]}>#</Text>
              <Text style={[styles.tableCol, styles.col2]}>Product</Text>
              <Text style={[styles.tableCol, styles.col3]}>HSN</Text>
              <Text style={[styles.tableCol, styles.col4]}>Qty</Text>
              <Text style={[styles.tableCol, styles.col5]}>Rate</Text>
              <Text style={[styles.tableCol, styles.col6]}>Taxable</Text>
              <Text style={[styles.tableCol, styles.col7]}>GST%</Text>
              <Text style={[styles.tableCol, styles.col8]}>Total</Text>
            </View>
            
            {invoiceData.items && invoiceData.items.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.col1, { textAlign: 'center' }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tableCol, styles.col2]}>{item.product}</Text>
                <Text style={[styles.tableCol, styles.col3]}>{item.hsn_code || '-'}</Text>
                <Text style={[styles.tableCol, styles.col4, { textAlign: 'center' }]}>
                  {item.quantity} {unitData[item.unit_id] || ''}
                </Text>
                <Text style={[styles.tableCol, styles.col5, { textAlign: 'right' }]}>
                  {item.price}
                </Text>
                <Text style={[styles.tableCol, styles.col6, { textAlign: 'right' }]}>
                  {(parseFloat(item.quantity) * parseFloat(item.price) * (1 - parseFloat(item.discount || 0) / 100)).toFixed(2)}
                </Text>
                <Text style={[styles.tableCol, styles.col7, { textAlign: 'center' }]}>
                  {item.gst}%
                </Text>
                <Text style={[styles.tableCol, styles.col8, { textAlign: 'right' }]}>
                  {item.total}
                </Text>
              </View>
            ))}
            
            {invoiceData.items && invoiceData.items.length > 3 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { width: '100%', textAlign: 'center', fontSize: 6, color: '#999' }]}>
                  ... and {invoiceData.items.length - 3} more items
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={{ fontSize: 6, color: '#666' }}>
              Generated: {formatDate(new Date())} | System: E-Way Bill Portal
            </Text>
          </View>
          <View style={styles.signature}>
            <Text style={{ fontSize: 6 }}>For {companyInfo.name || invoiceData.companyInfo.name}</Text>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 6 }}>Authorized Signatory</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default EWayBillPdfDocument;