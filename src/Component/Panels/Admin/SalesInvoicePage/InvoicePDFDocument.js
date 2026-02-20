import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet 
} from '@react-pdf/renderer';

// Create styles with dynamic sizing based on page size
const createStyles = (pageSize = 'A4') => {
  const isA5 = pageSize === 'A5';
  
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: isA5 ? 15 : 25,
      fontSize: isA5 ? 8 : 10,
      fontFamily: 'Helvetica',
    },
    
    // Header Section
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: isA5 ? 10 : 15,
      paddingBottom: isA5 ? 8 : 10,
      borderBottom: '1pt solid #e0e0e0',
    },
    companyInfo: {
      flex: 2,
    },
    invoiceMeta: {
      flex: 1,
      backgroundColor: '#f8f9fa',
      padding: isA5 ? 5 : 8,
      borderRadius: 4,
    },
    companyName: {
      fontSize: isA5 ? 14 : 18,
      fontWeight: 'bold',
      marginBottom: isA5 ? 3 : 5,
      color: '#2c3e50',
    },
    companyAddress: {
      fontSize: isA5 ? 7 : 8,
      color: '#666666',
      marginBottom: 2,
    },
    invoiceTitle: {
      fontSize: isA5 ? 12 : 16,
      fontWeight: 'bold',
      marginBottom: isA5 ? 4 : 6,
      color: '#dc3545',
      textAlign: 'center',
    },
    
    // Address Section
    addressSection: {
      flexDirection: 'row',
      marginBottom: isA5 ? 10 : 15,
      gap: isA5 ? 5 : 10,
    },
    addressBox: {
      flex: 1,
      backgroundColor: '#f8f9fa',
      padding: isA5 ? 6 : 8,
      borderRadius: 4,
    },
    sectionTitle: {
      fontSize: isA5 ? 9 : 11,
      fontWeight: 'bold',
      marginBottom: isA5 ? 4 : 6,
      color: '#007bff',
      borderBottom: '1pt solid #007bff',
      paddingBottom: 2,
    },
    addressText: {
      fontSize: isA5 ? 7 : 8,
      marginBottom: 2,
    },
    
    // Sales Person
    salesPersonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#e8f4fd',
      padding: isA5 ? 4 : 6,
      marginBottom: isA5 ? 8 : 10,
      borderRadius: 4,
    },
    salesPersonLabel: {
      fontSize: isA5 ? 8 : 9,
      fontWeight: 'bold',
    },
    salesPersonName: {
      fontSize: isA5 ? 8 : 9,
      fontWeight: 'bold',
      color: '#007bff',
    },
    
    // Items Table - SIMPLIFIED like your image
    itemsSection: {
      marginBottom: isA5 ? 10 : 15,
    },
    itemsTitle: {
      fontSize: isA5 ? 10 : 12,
      fontWeight: 'bold',
      marginBottom: isA5 ? 5 : 8,
      color: '#007bff',
      borderBottom: '1pt solid #007bff',
      paddingBottom: 3,
    },
    table: {
      width: '100%',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#dee2e6',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#dee2e6',
      minHeight: isA5 ? 22 : 28,
      alignItems: 'center',
    },
    tableHeader: {
      backgroundColor: '#343a40',
      borderBottomWidth: 2,
      borderBottomColor: '#212529',
    },
    
    // Simplified columns - matching your image
    colSNo: { width: '5%', padding: isA5 ? 2 : 4 },
    colProduct: { width: '15%', padding: isA5 ? 2 : 4 },
    colDesc: { width: '20%', padding: isA5 ? 2 : 4 },
    colQty: { width: '8%', padding: isA5 ? 2 : 4 },
    colPrice: { width: '12%', padding: isA5 ? 2 : 4 },
    colGST: { width: '8%', padding: isA5 ? 2 : 4 },
    colAmount: { width: '15%', padding: isA5 ? 2 : 4 },
    colEmpty: { width: '17%', padding: isA5 ? 2 : 4 }, // For spacing
    
    // Table cell styles
    tableCell: {
      fontSize: isA5 ? 7 : 9,
      textAlign: 'center',
    },
    tableCellHeader: {
      fontSize: isA5 ? 7 : 9,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
    },
    tableCellBold: {
      fontWeight: 'bold',
    },
    tableCellLeft: {
      textAlign: 'left',
    },
    tableCellRight: {
      textAlign: 'right',
    },
    
    // Amount section - simplified
    amountSection: {
      marginTop: isA5 ? 10 : 15,
      padding: isA5 ? 8 : 12,
      backgroundColor: '#f8f9fa',
      borderRadius: 4,
      width: isA5 ? '60%' : '50%',
      alignSelf: 'flex-end',
    },
    amountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: isA5 ? 4 : 6,
      paddingBottom: isA5 ? 3 : 4,
      borderBottom: '0.5pt dotted #dee2e6',
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: isA5 ? 6 : 8,
      paddingTop: isA5 ? 4 : 6,
      borderTop: '2pt solid #007bff',
      fontWeight: 'bold',
      fontSize: isA5 ? 9 : 11,
    },
    
    // Notes section
    notesSection: {
      marginTop: isA5 ? 8 : 12,
    },
    notesBox: {
      backgroundColor: '#f8f9fa',
      padding: isA5 ? 6 : 8,
      borderRadius: 4,
      marginBottom: isA5 ? 6 : 8,
    },
    
    // Footer
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: isA5 ? 15 : 20,
      paddingTop: isA5 ? 8 : 10,
      borderTop: '1pt solid #e0e0e0',
    },
    signature: {
      alignItems: 'flex-end',
    },
    signatureLine: {
      width: isA5 ? 120 : 150,
      borderTop: '1pt solid #000',
      marginTop: isA5 ? 15 : 20,
      marginBottom: 3,
    },
    
    // Page indicator
    pageIndicator: {
      textAlign: 'center',
      fontSize: isA5 ? 6 : 8,
      color: '#999',
      marginTop: 5,
    },
    continued: {
      textAlign: 'right',
      fontSize: isA5 ? 6 : 8,
      color: '#999',
      fontStyle: 'italic',
      marginTop: 3,
    },
  });
};

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

// Calculate items per page based on page size
const getItemsPerPage = (pageSize) => {
  return pageSize === 'A5' ? 12 : 18; // More items per page with simplified table
};

const InvoicePDFDocument = ({ 
  invoiceData, 
  invoiceNumber, 
  pageSize = 'A4' // 'A4' or 'A5'
}) => {
  const styles = createStyles(pageSize);
  const isA5 = pageSize === 'A5';
  
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
  
  const salesPerson = getSafeData(currentData, 'assigned_staff', 'Bharath');
  
  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalGST = 0;
    let grandTotal = 0;
    
    items.forEach(item => {
      const quantity = parseFloat(getSafeData(item, 'quantity', 1));
      const price = parseFloat(getSafeData(item, 'edited_sale_price', 0)) || parseFloat(getSafeData(item, 'price', 0));
      const gstRate = parseFloat(getSafeData(item, 'gst', 0)) || 0;
      
      const itemSubtotal = price * quantity;
      const itemGST = (itemSubtotal * gstRate) / 100;
      const itemTotal = itemSubtotal + itemGST;
      
      subtotal += itemSubtotal;
      totalGST += itemGST;
      grandTotal += itemTotal;
    });
    
    return {
      subtotal: subtotal.toFixed(2),
      totalGST: totalGST.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };
  
  const totals = calculateTotals();
  
  // Pagination logic
  const itemsPerPage = getItemsPerPage(pageSize);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // Create pages
  const pages = [];
  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const startIndex = pageNum * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);
    const pageItems = items.slice(startIndex, endIndex);
    const isFirstPage = pageNum === 0;
    const isLastPage = pageNum === totalPages - 1;
    
    pages.push(
      <Page key={pageNum} size={pageSize} style={styles.page}>
        {/* Header - only on first page */}
        {isFirstPage && (
          <>
            <View style={styles.header}>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>
                  {getSafeData(companyInfo, 'name', 'SHREE SHASHWAT RAJ AGRO PVT.LTD.')}
                </Text>
                <Text style={styles.companyAddress}>
                  {getSafeData(companyInfo, 'address', 'PATNA ROAD, BHAKHARUAN MORE, DAUDNAGAR, Aurangabad, Bihar 824113')}
                </Text>
                <Text style={styles.companyAddress}>
                  GSTIN: {getSafeData(companyInfo, 'gstin', '10AAOCS1541B1ZZ')} | 
                  Phone: {getSafeData(companyInfo, 'phone', '9801049700')}
                </Text>
              </View>
              <View style={styles.invoiceMeta}>
                <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
                <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Invoice No:</Text> {displayInvoiceNumber}</Text>
                <Text style={styles.tableCell}><Text style={styles.tableCellBold}>Date:</Text> {invoiceDate}</Text>
              </View>
            </View>
            
            {/* Address Section */}
            <View style={styles.addressSection}>
              <View style={styles.addressBox}>
                <Text style={styles.sectionTitle}>Bill To:</Text>
                <Text style={[styles.addressText, styles.tableCellBold]}>{getSafeData(supplierInfo, 'name', 'Customer Name')}</Text>
                <Text style={styles.addressText}>GSTIN: {getSafeData(supplierInfo, 'gstin', 'N/A')}</Text>
                <Text style={styles.addressText}>State: {getSafeData(supplierInfo, 'state', 'Bihar')}</Text>
              </View>
              
              <View style={styles.addressBox}>
                <Text style={styles.sectionTitle}>Ship To:</Text>
                <Text style={styles.addressText}>
                  {getSafeData(shippingAddress, 'addressLine1', getSafeData(billingAddress, 'addressLine1', 'Same as Billing'))}
                </Text>
                <Text style={styles.addressText}>
                  {getSafeData(shippingAddress, 'city', '')} - {getSafeData(shippingAddress, 'pincode', '')}
                </Text>
              </View>
            </View>
            
            {/* Sales Person */}
            <View style={styles.salesPersonRow}>
              <Text style={styles.salesPersonLabel}>Sales Person:</Text>
              <Text style={styles.salesPersonName}>{salesPerson}</Text>
            </View>
          </>
        )}
        
        {/* Continuation header for subsequent pages */}
        {!isFirstPage && (
          <View style={[styles.header, { borderBottom: 'none', marginBottom: 10 }]}>
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { fontSize: isA5 ? 12 : 14 }]}>
                {getSafeData(companyInfo, 'name', 'Company Name')} - Continued
              </Text>
            </View>
            <View style={styles.invoiceMeta}>
              <Text style={styles.tableCell}>Invoice: {displayInvoiceNumber}</Text>
              <Text style={[styles.tableCell, { color: '#007bff' }]}>
                Page {pageNum + 1} of {totalPages}
              </Text>
            </View>
          </View>
        )}
        
        {/* Items Title */}
        {isFirstPage && <Text style={styles.itemsTitle}>Items Details</Text>}
        
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.colSNo}><Text style={styles.tableCellHeader}>#</Text></View>
          <View style={styles.colProduct}><Text style={styles.tableCellHeader}>Product</Text></View>
          <View style={styles.colDesc}><Text style={styles.tableCellHeader}>Description</Text></View>
          <View style={styles.colQty}><Text style={styles.tableCellHeader}>Qty</Text></View>
          <View style={styles.colPrice}><Text style={styles.tableCellHeader}>Price</Text></View>
          <View style={styles.colGST}><Text style={styles.tableCellHeader}>GST %</Text></View>
          <View style={styles.colAmount}><Text style={styles.tableCellHeader}>Amount (*)</Text></View>
          <View style={styles.colEmpty}><Text style={styles.tableCellHeader}></Text></View>
        </View>
        
        {/* Table Rows */}
        {pageItems.map((item, index) => {
          const actualIndex = startIndex + index;
          const quantity = parseFloat(getSafeData(item, 'quantity', 1));
          const price = parseFloat(getSafeData(item, 'edited_sale_price', 0)) || parseFloat(getSafeData(item, 'price', 0));
          const gstRate = parseFloat(getSafeData(item, 'gst', 0)) || 0;
          
          const subtotal = price * quantity;
          const gstAmount = (subtotal * gstRate) / 100;
          const total = subtotal + gstAmount;
          
          const batch = getSafeData(item, 'batch', 'DEFAULT');
          const description = `Batch: ${batch}`;
          
          return (
            <View style={styles.tableRow} key={actualIndex}>
              <View style={styles.colSNo}><Text style={styles.tableCell}>{actualIndex + 1}</Text></View>
              <View style={styles.colProduct}><Text style={[styles.tableCell, styles.tableCellBold]}>{getSafeData(item, 'product', 'Product')}</Text></View>
              <View style={styles.colDesc}><Text style={styles.tableCell}>{description}</Text></View>
              <View style={styles.colQty}><Text style={styles.tableCell}>{quantity}</Text></View>
              <View style={styles.colPrice}><Text style={styles.tableCell}>₹{price.toFixed(2)}</Text></View>
              <View style={styles.colGST}><Text style={styles.tableCell}>{gstRate}%</Text></View>
              <View style={styles.colAmount}><Text style={[styles.tableCell, styles.tableCellBold]}>₹{total.toFixed(2)}</Text></View>
              <View style={styles.colEmpty}><Text style={styles.tableCell}></Text></View>
            </View>
          );
        })}
        
        {/* Fill empty rows for consistent layout */}
        {pageItems.length < itemsPerPage && (
          [...Array(itemsPerPage - pageItems.length)].map((_, idx) => (
            <View style={styles.tableRow} key={`empty-${idx}`}>
              <View style={styles.colSNo}><Text style={styles.tableCell}></Text></View>
              <View style={styles.colProduct}><Text style={styles.tableCell}></Text></View>
              <View style={styles.colDesc}><Text style={styles.tableCell}></Text></View>
              <View style={styles.colQty}><Text style={styles.tableCell}></Text></View>
              <View style={styles.colPrice}><Text style={styles.tableCell}></Text></View>
              <View style={styles.colGST}><Text style={styles.tableCell}></Text></View>
              <View style={styles.colAmount}><Text style={styles.tableCell}></Text></View>
              <View style={styles.colEmpty}><Text style={styles.tableCell}></Text></View>
            </View>
          ))
        )}
        
        {/* Summary and Footer - only on last page */}
        {isLastPage && (
          <>
            {/* Amount Summary */}
            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text style={[styles.tableCell, styles.tableCellBold]}>Amount:</Text>
                <Text style={styles.tableCell}>₹{totals.subtotal}</Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={[styles.tableCell, styles.tableCellBold]}>Total GST:</Text>
                <Text style={styles.tableCell}>₹{totals.totalGST}</Text>
              </View>
              <View style={styles.grandTotalRow}>
                <Text style={[styles.tableCell, styles.tableCellBold]}>Grand Total:</Text>
                <Text style={[styles.tableCell, styles.tableCellBold, { color: '#28a745' }]}>
                  ₹{totals.grandTotal}
                </Text>
              </View>
            </View>
            
            {/* Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes:</Text>
              <View style={styles.notesBox}>
                <Text style={styles.addressText}>Thank you for your business!</Text>
              </View>
              
              <Text style={styles.sectionTitle}>Transportation Details:</Text>
              <View style={styles.notesBox}>
                <Text style={styles.addressText}>Standard delivery</Text>
              </View>
            </View>
            
            {/* Footer */}
            <View style={styles.footer}>
              <View>
                <Text style={[styles.addressText, styles.tableCellBold]}>Bank Details:</Text>
                <Text style={styles.addressText}>Account: XXXX XXXX XXXX</Text>
                <Text style={styles.addressText}>IFSC: XXXX0123456</Text>
              </View>
              <View style={styles.signature}>
                <Text style={styles.addressText}>For {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.addressText}>Authorized Signatory</Text>
              </View>
            </View>
          </>
        )}
        
        {/* Page continuation indicator */}
        {!isLastPage && (
          <Text style={styles.continued}>Continued on next page...</Text>
        )}
        
        {/* Page number for non-first pages */}
        {!isFirstPage && isLastPage && (
          <Text style={styles.pageIndicator}>Page {pageNum + 1} of {totalPages}</Text>
        )}
      </Page>
    );
  }
  
  return (
    <Document>
      {pages}
    </Document>
  );
};

export default InvoicePDFDocument;