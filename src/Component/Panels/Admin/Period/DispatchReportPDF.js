import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 10,
    textDecoration: 'underline',
  },
  dispatchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoColumn: {
    flexDirection: 'column',
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    width: '40%',
  },
  value: {
    width: '60%',
    fontFamily: 'Helvetica',
  },
  boldValue: {
    fontFamily: 'Helvetica-Bold',
    width: '60%',
  },
  invoiceSection: {
    marginTop: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 10,
    borderRadius: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
  },
  table: {
    display: 'table',
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    minHeight: 25,
  },
  tableTotalRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    backgroundColor: '#f8f8f8',
    minHeight: 25,
  },
  tableGrandTotalContainer: {
    marginTop: 15,
  },
  tableGrandTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    minHeight: 30,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
  },
  tableColHeader: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 5,
  },
  tableCol: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 5,
  },
  tableColHeaderLast: {
    width: '20%',
    padding: 5,
  },
  tableColLast: {
    width: '20%',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  tableCellTotal: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableCellGrandTotal: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 6,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#666',
  },
});

const DispatchReportPDF = ({ invoiceData }) => {
  const {
    orders = [],
    allItems = [],
    totalWeight,
    totalAmount,
    companyInfo,
    transportDetails,
    reportDate
  } = invoiceData || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>SHREE SHASHWAT RAJ AGRO PVT.LTD.</Text>
          <Text style={styles.title}>DESPATCH REPORT</Text>
          
          <View style={styles.dispatchInfo}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Vehicle No :</Text>
                <Text style={styles.value}>{transportDetails?.vehicleNo || '____________'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Total Weight :</Text>
                <Text style={styles.boldValue}>{totalWeight || '0.00'}</Text>
              </View>
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.boldValue}>{formatDate(reportDate)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Render each order/invoice section */}
        {orders.map((order, orderIndex) => {
          let orderTotalWeight = 0;
          let orderTotalQty = 0;
          let orderTotalAmount = 0;

          // Process items - USE THE PRE-CALCULATED VALUES
          const processedItems = order.items.map(item => {
            // Get quantity
            const quantity = item.flash_offer === 1 ? 
              (parseInt(item.buy_quantity) || parseInt(item.quantity) || 1) : 
              (parseInt(item.quantity) || 1);
            
            const totalItemWeight = parseFloat(item.weight) || 0;
            
            const totalItemAmount = parseFloat(item.amount) || 
              ((parseFloat(item.sale_price) || 0) * quantity);
            
            orderTotalWeight += totalItemWeight;
            orderTotalQty += quantity;
            orderTotalAmount += totalItemAmount;
            
            return {
              ...item,
              quantity,
              totalWeight: totalItemWeight,
              totalAmount: totalItemAmount,
              displayQty: item.flash_offer === 1 && item.get_quantity > 0
                ? `${item.quantity} + ${item.get_quantity} FREE`
                : item.quantity
            };
          });

          return (
            <View key={orderIndex} style={styles.invoiceSection} wrap={false}>
              {/* Invoice Header */}
              <View style={styles.invoiceHeader}>
                <View style={styles.infoColumn}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Invoice Number:</Text>
                    <Text style={styles.boldValue}>{order.invoiceNumber || `ORD${orderIndex + 1}`}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.boldValue}>{formatDate(order.invoiceDate)}</Text>
                  </View>
                </View>
                <View style={styles.infoColumn}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Party Name:</Text>
                    <Text style={styles.boldValue}>{order.customerName || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              {/* Items Table */}
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <View style={styles.tableColHeader}>
                    <Text style={styles.tableCellHeader}>S No</Text>
                  </View>
                  <View style={styles.tableColHeader}>
                    <Text style={styles.tableCellHeader}>Particulars</Text>
                  </View>
                  <View style={styles.tableColHeader}>
                    <Text style={styles.tableCellHeader}>Weight</Text>
                  </View>
                  <View style={styles.tableColHeader}>
                    <Text style={styles.tableCellHeader}>Qty</Text>
                  </View>
                  <View style={styles.tableColHeaderLast}>
                    <Text style={styles.tableCellHeader}>Amount</Text>
                  </View>
                </View>

                {/* Table Rows - USE PRE-CALCULATED VALUES */}
                {processedItems.map((item, itemIndex) => (
                  <View style={styles.tableRow} key={itemIndex}>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{itemIndex + 1}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{item.item_name}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>
                        {item.totalWeight.toFixed(2)} {/* Use pre-calculated total weight */}
                      </Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableCell}>{item.displayQty}</Text>
                    </View>
                    <View style={styles.tableColLast}>
                      <Text style={styles.tableCell}>
                        {formatCurrency(item.totalAmount)} {/* Use pre-calculated total amount */}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Total Row */}
                <View style={styles.tableTotalRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellTotal}></Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellTotal}>Total:</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellTotal}>
                      {orderTotalWeight.toFixed(2)} {/* Use accumulated order total */}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellTotal}>
                      {orderTotalQty}
                    </Text>
                  </View>
                  <View style={styles.tableColLast}>
                    <Text style={styles.tableCellTotal}>
                      {formatCurrency(orderTotalAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Grand Total */}
        {orders.length > 1 && (
          <View style={styles.tableGrandTotalContainer}>
            <View style={styles.table}>
              <View style={styles.tableGrandTotalRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellGrandTotal}>GRAND TOTAL:</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellGrandTotal}>
                    {totalWeight || '0.00'}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellGrandTotal}>
                    {allItems.reduce((sum, item) => {
                      const quantity = item.flash_offer === 1 ? 
                        (parseInt(item.buy_quantity) || parseInt(item.quantity) || 1) : 
                        (parseInt(item.quantity) || 1);
                      return sum + quantity;
                    }, 0)}
                  </Text>
                </View>
                <View style={styles.tableColLast}>
                  <Text style={styles.tableCellGrandTotal}>
                    {formatCurrency(totalAmount || 0)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default DispatchReportPDF; 