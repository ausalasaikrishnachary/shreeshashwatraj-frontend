import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
  },

  // Header Section
  shopName: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20, // Increased from 6 to 20 for gap
  },
  reportTitle: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },

  // Table Header
  headerRow: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#f2f2f2',
    paddingVertical: 4,
  },

  // Data Row
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 4,
  },

 // Column widths
colItem: {
  width: '32%',
  justifyContent: 'center',
},

colSmall: {
  width: '9%',
  justifyContent: 'center',
  alignItems: 'center',   // IMPORTANT
},

colMedium: {
  width: '11%',
  justifyContent: 'center',
  alignItems: 'center',   // IMPORTANT
},

headerText: {
  fontFamily: 'Helvetica-Bold',
  fontSize: 9,
  textAlign: 'right',
  width: '100%',   // IMPORTANT
},

  cellLeft: {
    textAlign: 'left',
    fontSize: 9,
  },

  cellRight: {
    textAlign: 'right',
    fontSize: 9,
  },

  boldRight: {
    textAlign: 'right',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
});

const StockReportPDF = ({ reportData }) => {
  const {
    shopName = "SHREE SHASHWAT RAJ AGRO PVT.LTD",
    fromDate = "01-04-2025",
    toDate = "01-04-2025",
    items = [],
  } = reportData || {};

  const formatNumber = (value) => {
    if (!value) return "0.00";
    return Number(value).toFixed(2);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <Text style={styles.shopName}>{shopName}</Text>
        {/* Gap of 20px between shop name and report title */}
        <Text style={styles.reportTitle}>
          STOCK REPORT From : {fromDate} To {toDate}
        </Text>

        {/* Header Row */}
<View style={styles.headerRow}>

  <View style={styles.colItem}>
    <Text style={{ textAlign: 'left', paddingLeft: 4, fontFamily: 'Helvetica-Bold', fontSize: 9 }}>
      Item Name
    </Text>
  </View>

  <View style={styles.colSmall}>
    <Text style={styles.headerText}>Op. Qty</Text>
  </View>

  <View style={styles.colMedium}>
    <Text style={styles.headerText}>Op. Val</Text>
  </View>

  <View style={styles.colSmall}>
    <Text style={styles.headerText}>Prch Qty</Text>
  </View>

  <View style={styles.colMedium}>
    <Text style={styles.headerText}>Prch Val</Text>
  </View>

  <View style={styles.colSmall}>
    <Text style={styles.headerText}>Sale Qty</Text>
  </View>

  <View style={styles.colMedium}>
    <Text style={styles.headerText}>Sale Val</Text>
  </View>

  <View style={styles.colMedium}>
    <Text style={styles.headerText}>Clo. Bal</Text>
  </View>

</View>

        {/* Data Rows */}
        {items.map((item, index) => (
          <View style={styles.row} key={index}>
            <Text style={[styles.colItem, styles.cellLeft]}>
              {item.itemName}
            </Text>

            <Text style={[styles.colSmall, styles.cellRight]}>
              {formatNumber(item.opQty)}
            </Text>

            <Text style={[styles.colMedium, styles.cellRight]}>
              {formatNumber(item.opVal)}
            </Text>

            <Text style={[styles.colSmall, styles.cellRight]}>
              {formatNumber(item.prchQty)}
            </Text>

            <Text style={[styles.colMedium, styles.cellRight]}>
              {formatNumber(item.prchVal)}
            </Text>

            <Text style={[styles.colSmall, styles.cellRight]}>
              {formatNumber(item.saleQty)}
            </Text>

            <Text style={[styles.colMedium, styles.cellRight]}>
              {formatNumber(item.saleVal)}
            </Text>

            <Text style={[styles.colMedium, styles.boldRight]}>
              {formatNumber(
                item.cloBal ??
                (item.opQty || 0) +
                (item.prchQty || 0) -
                (item.saleQty || 0)
              )}
            </Text>
          </View>
        ))}

      </Page>
    </Document>
  );
};

export default StockReportPDF;