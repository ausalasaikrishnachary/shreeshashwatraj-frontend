// EInvoicePdfDocument.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica', fontWeight: 'normal' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ]
});

const getImageSource = (qrData) => {
  if (!qrData) return null;
  if (qrData.startsWith('data:image')) {
    return qrData;
  }
  if (qrData.startsWith('/9j/') || qrData.startsWith('iVBOR')) {
    return `data:image/png;base64,${qrData}`;
  }
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
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>E-INVOICE</Text>
          <Text style={styles.subtitle}>Government of India - GST E-Invoice</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Number:</Text>
            <Text style={styles.value}>{invoiceNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Date:</Text>
            <Text style={styles.value}>{formatDate(invoiceData?.invoiceDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Document Type:</Text>
            <Text style={styles.value}>{invoiceData?.document_type || 'Sales Invoice'}</Text>
          </View>
        </View>

        {/* IRN Details */}
        <View style={styles.irnSection}>
          <Text style={styles.sectionTitle}>E-Invoice Details</Text>
          <View style={styles.irnDetails}>
            <View style={styles.row}>
              <Text style={styles.label}>IRN:</Text>
              <Text style={[styles.value, styles.irnValue]}>{irnDetails?.irn_no || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ack No:</Text>
              <Text style={styles.value}>{irnDetails?.ack_no || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ack Date:</Text>
              <Text style={styles.value}>{formatDate(irnDetails?.ack_date) || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, styles.statusBadge]}>
                {irnStatus?.IRNgenerated_status || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        {qrDataUrl && (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>QR Code</Text>
            <View style={styles.qrContainer}>
              <Image 
                src={getImageSource(qrDataUrl)} 
                style={styles.qrImage}
              />
              {qrAmount && (
                <Text style={styles.qrAmount}>Amount: ₹{qrAmount.toFixed(2)}</Text>
              )}
            </View>
          </View>
        )}

        {/* Company Details */}
        <View style={styles.companySection}>
          <Text style={styles.sectionTitle}>Seller Details</Text>
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{invoiceData?.companyInfo?.name || 'N/A'}</Text>
            <Text style={styles.companyAddress}>{invoiceData?.companyInfo?.address || 'N/A'}</Text>
            <Text style={styles.companyInfo}>GSTIN: {invoiceData?.companyInfo?.gstin || 'N/A'}</Text>
            <Text style={styles.companyInfo}>State: {invoiceData?.companyInfo?.state || 'N/A'} (Code: {invoiceData?.companyInfo?.stateCode || 'N/A'})</Text>
            <Text style={styles.companyInfo}>Email: {invoiceData?.companyInfo?.email || 'N/A'}</Text>
            <Text style={styles.companyInfo}>Phone: {invoiceData?.companyInfo?.phone || 'N/A'}</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Buyer Details</Text>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{invoiceData?.supplierInfo?.business_name || invoiceData?.supplierInfo?.name || 'N/A'}</Text>
            <Text style={styles.customerInfo}>GSTIN: {invoiceData?.supplierInfo?.gstin || 'URP'}</Text>
            <Text style={styles.customerInfo}>State: {invoiceData?.supplierInfo?.state || 'N/A'}</Text>
            {invoiceData?.supplierInfo?.mobile_number && (
              <Text style={styles.customerInfo}>Mobile: {invoiceData?.supplierInfo?.mobile_number}</Text>
            )}
            {invoiceData?.billingAddress && (
              <Text style={styles.customerInfo}>
                Address: {invoiceData?.billingAddress?.addressLine1 || ''} {invoiceData?.billingAddress?.addressLine2 || ''}
              </Text>
            )}
          </View>
        </View>

        {/* Tax Summary */}
        <View style={styles.taxSection}>
          <Text style={styles.sectionTitle}>Tax Summary</Text>
          <View style={styles.taxDetails}>
            <View style={styles.row}>
              <Text style={styles.label}>Taxable Amount:</Text>
              <Text style={styles.value}>₹{invoiceData?.taxableAmount || '0.00'}</Text>
            </View>
            {isSameState ? (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>CGST:</Text>
                  <Text style={styles.value}>₹{gstBreakdown?.totalCGST || '0.00'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>SGST:</Text>
                  <Text style={styles.value}>₹{gstBreakdown?.totalSGST || '0.00'}</Text>
                </View>
              </>
            ) : (
              <View style={styles.row}>
                <Text style={styles.label}>IGST:</Text>
                <Text style={styles.value}>₹{gstBreakdown?.totalIGST || '0.00'}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Total GST:</Text>
              <Text style={styles.value}>₹{invoiceData?.totalGST || '0.00'}</Text>
            </View>
            <View style={[styles.row, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>₹{invoiceData?.grandTotal || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>This is a system generated e-invoice</Text>
          <Text style={styles.footerText}>Generated on: {new Date().toLocaleString()}</Text>
          <Text style={styles.footerText}>Transaction Type: {isSameState ? 'INTRA-STATE' : 'INTER-STATE'}</Text>
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#1a237e',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  invoiceDetails: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  irnSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  irnValue: {
    color: '#1a237e',
    fontWeight: 'bold',
    fontSize: 10,
  },
  statusBadge: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  qrSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    padding: 10,
  },
  qrImage: {
    width: 120,
    height: 120,
  },
  qrAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 8,
  },
  companySection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  companyDetails: {
    marginTop: 5,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 10,
    color: '#555',
    marginBottom: 2,
  },
  companyInfo: {
    fontSize: 10,
    color: '#555',
    marginBottom: 2,
  },
  customerSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  customerDetails: {
    marginTop: 5,
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 10,
    color: '#555',
    marginBottom: 2,
  },
  taxSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  taxDetails: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 10,
    color: '#666',
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: '#1a237e',
    marginTop: 5,
    paddingTop: 5,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#999',
    marginBottom: 2,
  },
});

export default EInvoicePdfDocument;