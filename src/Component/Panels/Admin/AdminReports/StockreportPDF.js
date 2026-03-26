import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
  },

  shopName: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },

  headerRow: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#f2f2f2',
    paddingVertical: 4,
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 4,
  },

  // Adjusted widths to accommodate category column
  colItem: {
    width: '18%',
    justifyContent: 'center',
  },

  colCategory: {
    width: '12%',
    justifyContent: 'center',
  },

  colSmall: {
    width: '7%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  colMedium: {
    width: '9%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'right',
    width: '100%',
  },

  headerTextLeft: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'left',
    width: '100%',
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
    if (!value && value !== 0) return "0.00";
    return Number(value).toFixed(2);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <Text style={styles.shopName}>{shopName}</Text>
        <Text style={styles.reportTitle}>
          STOCK REPORT From : {fromDate} To {toDate}
        </Text>

        {/* Header Row */}
        <View style={styles.headerRow}>

          <View style={styles.colItem}>
            <Text style={[styles.headerTextLeft, { paddingLeft: 4 }]}>
              Item Name
            </Text>
          </View>

          {/* Category Column Header */}
          <View style={styles.colCategory}>
            <Text style={[styles.headerTextLeft, { paddingLeft: 0 }]}>
              Category
            </Text>
          </View>

          <View style={styles.colSmall}>
            <Text style={styles.headerText}>Op. Qty</Text>
          </View>

          <View style={styles.colSmall}>
            <Text style={styles.headerText}>BL. Qty</Text>
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
              {item.itemName || '-'}
            </Text>

            {/* Category Column Data */}
            <Text style={[styles.colCategory, styles.cellRight]}>
              {item.categoryName || 'Uncategorized'}
            </Text>

            <Text style={[styles.colSmall, styles.cellRight]}>
              {formatNumber(item.opQty)}
            </Text>

            <Text style={[styles.colSmall, styles.cellRight]}>
              {formatNumber(item.currentStock)}
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

        {/* Footer with total count if needed */}
        {items.length === 0 && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#666' }}>No data available for the selected period</Text>
          </View>
        )}

        {/* Page number */}
        <Text
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 8,
            color: '#666',
          }}
          fixed
        >
          Page 1 of 1
        </Text>
      </Page>
    </Document>
  );
};

export default StockReportPDF;