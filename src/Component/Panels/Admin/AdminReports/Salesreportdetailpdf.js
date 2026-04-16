// SalesReportpdf.js
import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

// Font
Font.register({
  family: 'NotoSans',
  src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4g.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSans',
    fontSize: 10
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 2,
    paddingBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3
  },
  dateRange: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 3
  },
  table: {
    marginTop: 10,
    borderWidth: 1
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid'
  },
  tableHeader: {
    backgroundColor: '#000',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid'
  },
  tableCell: {
    padding: 5,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid'
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  // Column widths (adjusted - removed Product column)
  colSNo:     { width: '8%' },    // Increased from 5%
  colInvoice: { width: '15%' },   // Increased from 12%
  colParty:   { width: '22%' },   // Increased from 18%
  colDate:    { width: '15%' },   // Increased from 12%
  colType:    { width: '12%' },   // Increased from 10%
  colQty:     { width: '12%' },   // Increased from 8%
  colPrice:   { width: '16%' },   // Increased from 15%
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 2,
    paddingTop: 5
  },
  summaryText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 5
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold'
  }
});

// Currency format function
const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// PDF Component
export const SalesReportPDFDocument = ({
  data,
  fromDate,
  toDate,
  productName,
  generatedDate
}) => {
  // Calculate totals
  let totalQty = 0;
  let totalAmount = 0;

  data.forEach(item => {
    const qty    = parseFloat(item.quantity) || 0;
    const price  = parseFloat(item.price)    || 0;
    totalQty    += qty;
    totalAmount += price * qty;
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Sales Report Detail</Text>
          <Text style={styles.subtitle}>Product Wise Sales Report</Text>
          {productName && (
            <Text style={styles.dateRange}>Product: {productName}</Text>
          )}
          <Text style={styles.dateRange}>
            Period: {fromDate || 'All'} to {toDate || 'All'}
          </Text>
          <Text style={styles.dateRange}>
            Generated: {generatedDate}
          </Text>
        </View>

        {/* TABLE HEADER - No Product Column */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.colSNo,     styles.headerText, styles.textCenter]}>S.No</Text>
          <Text style={[styles.tableCell, styles.colInvoice, styles.headerText, styles.textCenter]}>Invoice No</Text>
          <Text style={[styles.tableCell, styles.colParty,   styles.headerText]}>Party Name</Text>
          <Text style={[styles.tableCell, styles.colDate,    styles.headerText, styles.textCenter]}>Date</Text>
          <Text style={[styles.tableCell, styles.colType,    styles.headerText, styles.textCenter]}>Type</Text>
          <Text style={[styles.tableCell, styles.colQty,     styles.headerText, styles.textCenter]}>Qty</Text>
          <Text style={[styles.tableCell, styles.colPrice,   styles.headerText, styles.textRight]}>Price</Text>
        </View>

        {/* TABLE BODY - No Product Column */}
        {data.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colSNo, styles.textCenter]}>
              {index + 1}
            </Text>
            <Text style={[styles.tableCell, styles.colInvoice, styles.textCenter]}>
              {item.VchNo || '-'}
            </Text>
            <Text style={[styles.tableCell, styles.colParty]}>
              {item.PartyName || '-'}
            </Text>
            <Text style={[styles.tableCell, styles.colDate, styles.textCenter]}>
              {item.date || '-'}
            </Text>
            <Text style={[styles.tableCell, styles.colType, styles.textCenter]}>
              {item.TransactionType || '-'}
            </Text>
            <Text style={[styles.tableCell, styles.colQty, styles.textCenter]}>
              {parseFloat(item.quantity) || 0}
            </Text>
            <Text style={[styles.tableCell, styles.colPrice, styles.textRight]}>
              {formatCurrency(item.price)}
            </Text>
          </View>
        ))}

        {/* SUMMARY - Only showing Total Quantity (commented out Total Amount as per your code) */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total Quantity:</Text>
          <Text style={styles.summaryValue}>{totalQty}</Text>
        </View>
      </Page>
    </Document>
  );
};

// GENERATE FUNCTION
export const generateSalesReportPDF = async (
  data,
  summary,
  fromDate,
  toDate,
  transactionType,
  productName
) => {
  const { pdf } = await import('@react-pdf/renderer');
  const currentDate = new Date().toLocaleString('en-IN');

  const blob = await pdf(
    <SalesReportPDFDocument
      data={data}
      fromDate={fromDate}
      toDate={toDate}
      productName={productName}
      generatedDate={currentDate}
    />
  ).toBlob();

  return blob;
};

export default generateSalesReportPDF;