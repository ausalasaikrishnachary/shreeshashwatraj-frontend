import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts (optional - can use default fonts)
Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#4A90E2',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 15
  },
  reportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 5
  },
  reportInfoText: {
    fontSize: 10,
    color: '#555'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
    borderLeft: 3,
    borderLeftColor: '#4A90E2',
    paddingLeft: 8
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10
  },
  statCard: {
    width: '23%',
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
    marginRight: '2%'
  },
  statLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    marginBottom: 5
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  statPositive: {
    color: '#27AE60'
  },
  statNegative: {
    color: '#E74C3C'
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 25
  },
  tableHeader: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center'
  },
  tableCell: {
    padding: 6,
    fontSize: 8,
    color: '#555',
    textAlign: 'center'
  },
  col1: { width: '5%' },
  col2: { width: '15%' },
  col3: { width: '10%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  col6: { width: '15%' },
  col7: { width: '15%' },
  col8: { width: '10%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#95A5A6',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  chartText: {
    fontSize: 10,
    color: '#95A5A6'
  },
  filterInfo: {
    fontSize: 9,
    color: '#7F8C8D',
    marginBottom: 5
  },
  staffPerformance: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  staffBar: {
    marginBottom: 10,
    width: '100%'
  },
  staffLabel: {
    fontSize: 10,
    marginBottom: 3,
    color: '#555'
  },
  barBackground: {
    backgroundColor: '#ECF0F1',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden'
  },
  barFill: {
    backgroundColor: '#4A90E2',
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: 8
  },
  barValue: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  summaryText: {
    fontSize: 10,
    marginBottom: 5,
    color: '#555',
    lineHeight: 1.5
  }
});

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      return `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
    }
  } catch (err) {
    return dateString;
  }
  return dateString;
};

// Main PDF Component
const SalesReportPDF = ({ 
  salesData = [],
  summary = { totalSales: 0, monthlyGrowth: 0, kachaSales: 0, pakkaSales: 0 },
  staffData = [],
  fromDate = null,
  toDate = null,
  transactionType = 'all',
  generatedDate = new Date()
}) => {
  
  // Get transaction type display name
  const getTransactionTypeDisplay = () => {
    switch(transactionType) {
      case 'pakka': return 'Pakka/Sales';
      case 'kacha': return 'Kacha Sales';
      default: return 'All Transactions';
    }
  };

  // Calculate totals from sales data
  const totalRecords = salesData.length;
  const totalTaxableAmount = salesData.reduce((sum, item) => sum + (parseFloat(item.Subtotal) || 0), 0);
  const totalDiscount = salesData.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
  const totalGST = salesData.reduce((sum, item) => sum + (parseFloat(item.gst) || 0), 0);

  // Get top performing staff
  const topStaff = staffData.slice(0, 3);

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sales Report Dashboard</Text>
          <Text style={styles.subtitle}>Comprehensive Sales Analysis and Reporting</Text>
        </View>

        {/* Report Information */}
        <View style={styles.reportInfo}>
          <Text style={styles.reportInfoText}>
            Generated On: {generatedDate.toLocaleDateString('en-IN')} at {generatedDate.toLocaleTimeString()}
          </Text>
          <Text style={styles.reportInfoText}>
            Report ID: SR-{generatedDate.getTime()}
          </Text>
        </View>

        {/* Filter Information */}
        <View style={{ marginBottom: 15 }}>
          {fromDate && toDate && (
            <Text style={styles.filterInfo}>
              Date Range: {fromDate} to {toDate}
            </Text>
          )}
          <Text style={styles.filterInfo}>
            Transaction Type: {getTransactionTypeDisplay()}
          </Text>
          <Text style={styles.filterInfo}>
            Total Records: {totalRecords}
          </Text>
        </View>

        {/* Summary Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Sales</Text>
              <Text style={styles.statValue}>{formatCurrency(summary.totalSales)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Monthly Growth</Text>
              <Text style={[
                styles.statValue,
                summary.monthlyGrowth >= 0 ? styles.statPositive : styles.statNegative
              ]}>
                {summary.monthlyGrowth >= 0 ? '+' : ''}{summary.monthlyGrowth}%
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Kacha Sales</Text>
              <Text style={styles.statValue}>{formatCurrency(summary.kachaSales)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Pakka Sales</Text>
              <Text style={styles.statValue}>{formatCurrency(summary.pakkaSales)}</Text>
            </View>
          </View>
        </View>

        {/* Additional Summary Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={styles.summaryText}>Total Taxable Amount:</Text>
            <Text style={styles.summaryText}>{formatCurrency(totalTaxableAmount)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={styles.summaryText}>Total Discount:</Text>
            <Text style={styles.summaryText}>{formatCurrency(totalDiscount)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={styles.summaryText}>Total GST:</Text>
            <Text style={styles.summaryText}>{formatCurrency(totalGST)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={styles.summaryText}>Average Transaction Value:</Text>
            <Text style={styles.summaryText}>
              {totalRecords > 0 ? formatCurrency(summary.totalSales / totalRecords) : formatCurrency(0)}
            </Text>
          </View>
        </View>

        {/* Staff Performance */}
        {topStaff.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Staff Performance</Text>
            <View style={styles.staffPerformance}>
              {topStaff.map((staff, index) => {
                const maxSales = Math.max(...staffData.map(s => s.sales), 1);
                const percentage = (staff.sales / maxSales) * 100;
                return (
                  <View key={index} style={styles.staffBar}>
                    <Text style={styles.staffLabel}>{staff.name}</Text>
                    <View style={styles.barBackground}>
                      <View style={[styles.barFill, { width: `${percentage}%` }]}>
                        <Text style={styles.barValue}>{formatCurrency(staff.sales)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Sales Transactions Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales Transactions</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.col1]}>
                <Text>S.No</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.col2]}>
                <Text>Product</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.col3]}>
                <Text>Quantity</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.col4]}>
                <Text>Taxable Amount</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.col5]}>
                <Text>Total Amount</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.col6]}>
                <Text>Retailer</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.col7]}>
                <Text>Staff</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.col8]}>
                <Text>Date</Text>
              </View>
            </View>

            {/* Table Rows */}
            {salesData.slice(0, 20).map((item, index) => (
              <View key={index} style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, styles.col1]}>
                  <Text>{index + 1}</Text>
                </View>
                <View style={[styles.tableCell, styles.col2]}>
                  <Text>{item.product || '-'}</Text>
                </View>
                <View style={[styles.tableCell, styles.col3]}>
                  <Text>{item.quantity || 0}</Text>
                </View>
                <View style={[styles.tableCell, styles.col4]}>
                  <Text>{formatCurrency(item.Subtotal)}</Text>
                </View>
                <View style={[styles.tableCell, styles.col5]}>
                  <Text>{formatCurrency(item.total)}</Text>
                </View>
                <View style={[styles.tableCell, styles.col6]}>
                  <Text>{item.retailer || '-'}</Text>
                </View>
                <View style={[styles.tableCell, styles.col7]}>
                  <Text>{item.assigned_staff || '-'}</Text>
                </View>
                <View style={[styles.tableCell, styles.col8]}>
                  <Text>{formatDate(item.invoice_date)}</Text>
                </View>
              </View>
            ))}
          </View>
          
          {salesData.length > 20 && (
            <Text style={{ fontSize: 8, marginTop: 5, textAlign: 'center', color: '#95A5A6' }}>
              Showing first 20 of {salesData.length} transactions
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a system-generated report. For any queries, please contact support.</Text>
          <Text>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SalesReportPDF;