// EInvoicePdfDocument.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica', fontWeight: 'normal' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ]
});

const getImageSource = (qrData) => {
  if (!qrData) return null;
  if (qrData.startsWith('data:image')) return qrData;
  if (qrData.startsWith('/9j/') || qrData.startsWith('iVBOR')) return `data:image/png;base64,${qrData}`;
  return qrData;
};

const EInvoicePdfDocument = ({ 
  invoiceData, 
  invoiceNumber, 
  gstBreakdown, 
  isSameState, 
  qrDataUrl, 
  qrAmount,
  unitData,
  irnDetails,
  irnStatus,
  einvoiceJson
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>E-INVOICE</Text>
          <Text style={styles.subtitle}>Government of India - GST E-Invoice</Text>
        </View>

        {/* Invoice Details - Bordered Table */}
        <View style={styles.borderedTable}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Invoice Number</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{invoiceNumber}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Invoice Date</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{formatDate(invoiceData?.invoiceDate)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Document Type</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{invoiceData?.document_type || 'Sales Invoice'}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Transaction Type</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{isSameState ? 'INTRA-STATE' : 'INTER-STATE'}</Text>
            </View>
          </View>
        </View>

        {/* IRN Details - Bordered Table */}
        <View style={styles.borderedTable}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel, styles.irnLabel]}>
              <Text style={styles.cellText}>IRN</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue, styles.irnValueCell]}>
              <Text style={[styles.cellText, styles.irnValue]}>{irnDetails?.irn_no || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Ack No</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{irnDetails?.ack_no || 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Ack Date</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{formatDate(irnDetails?.ack_date) || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Status</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue, styles.statusCell]}>
              <Text style={[styles.cellText, styles.statusText]}>{irnStatus?.IRNgenerated_status || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* QR Code Section - Balanced with details */}
        <View style={styles.qrSection}>
          <View style={styles.qrLeft}>
            <Text style={styles.sectionTitle}>Seller Details</Text>
            <Text style={styles.companyName}>{invoiceData?.companyInfo?.name || 'N/A'}</Text>
            <Text style={styles.addressText}>{invoiceData?.companyInfo?.address || 'N/A'}</Text>
            <Text style={styles.detailText}>GSTIN: {invoiceData?.companyInfo?.gstin || 'N/A'}</Text>
            <Text style={styles.detailText}>State: {invoiceData?.companyInfo?.state || 'N/A'} (Code: {invoiceData?.companyInfo?.stateCode || 'N/A'})</Text>
            <Text style={styles.detailText}>Email: {invoiceData?.companyInfo?.email || 'N/A'}</Text>
            <Text style={styles.detailText}>Phone: {invoiceData?.companyInfo?.phone || 'N/A'}</Text>
          </View>
          <View style={styles.qrRight}>
            {qrDataUrl && (
              <View style={styles.qrContainer}>
                <Image 
                  src={getImageSource(qrDataUrl)} 
                  style={styles.qrImage}
                />
                {qrAmount && (
                  <Text style={styles.qrAmount}>{qrAmount.toFixed(2)}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Buyer Details - Bordered */}
        <View style={styles.borderedTable}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Buyer Name</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{invoiceData?.supplierInfo?.business_name || invoiceData?.supplierInfo?.name || 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>GSTIN</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{invoiceData?.supplierInfo?.gstin || 'URP'}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>State</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{invoiceData?.supplierInfo?.state || 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Mobile</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{invoiceData?.supplierInfo?.mobile_number || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Address</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue, styles.addressCell]}>
              <Text style={styles.cellText}>
                {invoiceData?.billingAddress?.addressLine1 || ''} {invoiceData?.billingAddress?.addressLine2 || ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Tax Summary - Bordered Table */}
        <View style={styles.borderedTable}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Taxable Amount</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{invoiceData?.taxableAmount || '0.00'}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>Total GST</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{invoiceData?.totalGST || '0.00'}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>
                {isSameState ? 'CGST' : 'IGST'}
              </Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{isSameState ? (gstBreakdown?.totalCGST || '0.00') : (gstBreakdown?.totalIGST || '0.00')}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLabel]}>
              <Text style={styles.cellText}>
                {isSameState ? 'SGST' : 'CESS'}
              </Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue]}>
              <Text style={styles.cellText}>{isSameState ? (gstBreakdown?.totalSGST || '0.00') : '0.00'}</Text>
            </View>
          </View>
          <View style={[styles.tableRow, styles.grandTotalRow]}>
            <View style={[styles.tableCell, styles.tableCellLabel, styles.grandTotalLabel]}>
              <Text style={[styles.cellText, styles.grandTotalText]}>Grand Total</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellValue, styles.grandTotalValue]}>
              <Text style={[styles.cellText, styles.grandTotalAmount]}>{invoiceData?.grandTotal || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>This is a system generated e-invoice | Generated on: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 12,
    borderBottom: 2,
    borderBottomColor: '#1a237e',
    paddingBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  borderedTable: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 20,
  },
  tableCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#333',
    justifyContent: 'center',
  },
  tableCellLabel: {
    backgroundColor: '#f0f0f0',
    width: '25%',
    flexShrink: 0,
  },
  tableCellValue: {
    backgroundColor: '#ffffff',
    width: '25%',
    flexShrink: 0,
  },
  cellText: {
    fontSize: 8,
    color: '#000',
    lineHeight: 1.2,
  },
  irnLabel: {
    width: '15%',
  },
  irnValueCell: {
    width: '85%',
  },
  irnValue: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  statusCell: {
    width: '85%',
  },
  statusText: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  addressCell: {
    width: '75%',
  },
  qrSection: {
    flexDirection: 'row',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 2,
    padding: 6,
    minHeight: 100,
  },
  qrLeft: {
    flex: 1,
    paddingRight: 8,
  },
  qrRight: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#333',
    paddingLeft: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 3,
  },
  companyName: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 7,
    color: '#555',
    marginBottom: 1,
  },
  detailText: {
    fontSize: 7,
    color: '#555',
    marginBottom: 1,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  qrAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 4,
  },
  grandTotalRow: {
    borderBottomWidth: 0,
  },
  grandTotalLabel: {
    backgroundColor: '#e8f5e9',
  },
  grandTotalText: {
    fontWeight: 'bold',
    color: '#1a237e',
  },
  grandTotalValue: {
    backgroundColor: '#e8f5e9',
  },
  grandTotalAmount: {
    fontWeight: 'bold',
    color: '#4caf50',
    fontSize: 12,
  },
  footer: {
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: '#999',
  },
});

export default EInvoicePdfDocument;