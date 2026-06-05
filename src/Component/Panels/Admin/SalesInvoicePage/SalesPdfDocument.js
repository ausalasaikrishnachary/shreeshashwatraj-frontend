import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'NotoSans',
  src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4g.ttf'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 14,
    fontSize: 8,
    fontFamily: 'NotoSans',
    width: '100%',
    minHeight: '100%',
  },

  /* ── HEADER ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottom: '1pt solid #e0e0e0',
  },
  companyInfo: {
    flex: 2,
  },
  invoiceMeta: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 4,
    borderRadius: 2,
    border: '1pt solid #dee2e6',
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#2c3e50',
  },
  companyAddress: {
    fontSize: 7,
    color: '#666666',
    marginBottom: 1,
    lineHeight: 1.2,
  },
  invoiceTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#dc3545',
    textAlign: 'center',
  },

  /* ── ADDRESS SECTION ── */
  addressSection: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 4,
  },
  addressBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 4,
    borderRadius: 2,
    border: '1pt solid #dee2e6',
  },

  /* ── SECTION TITLE ── */
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#007bff',
    borderBottom: '1pt solid #007bff',
    paddingBottom: 1,
  },
  addressText: {
    fontSize: 7,
    marginBottom: 1,
    lineHeight: 1.2,
  },

  /* ── TABLE ── */
  itemsSection: {
    marginBottom: 4,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 14,
  },
  tableHeader: {
    backgroundColor: '#343a40',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    minHeight: 14,
  },

  /* ── COLUMN CELLS ── */
  colSNo: {
    width: '5%',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colProduct: {
    width: '22%',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colHsn: {
    width: '10%',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colQuantity: {
    width: '10%',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colRateIncl: {
    width: '12%',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colRateExcl: {
    width: '12%',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colDiscount: {
    width: '8%',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colGST: {
    width: '7%',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  colTotal: {
    width: '14%',
    paddingHorizontal: 2,
    paddingVertical: 1,
  },

  tableCell: {
    fontSize: 7,
    lineHeight: 1.1,
    color: '#2c3e50',
  },
  tableCellHeader: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableCellLeft:   { textAlign: 'left' },
  tableCellRight:  { textAlign: 'right' },
  tableCellCenter: { textAlign: 'center' },
  tableCellBold:   { fontWeight: 'bold' },

  rowEven: {
    backgroundColor: '#f9f9f9',
  },
  rowOdd: {
    backgroundColor: '#ffffff',
  },

  /* ── QR + AMOUNT ROW ── */
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 4,
  },
  col: {
    flex: 1,
  },

  /* ── QR CARD ── */
  qrSection: {
    backgroundColor: '#f0f8ff',
    padding: 1,
    borderRadius: 2,
    border: '1pt solid #007bff',
    alignItems: 'center',
    marginBottom: 4,
  },
  qrTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 1,
    textAlign: 'center',
  },
  qrImage: {
    width: 46,
    height: 46,
  },
  qrAmount: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 1,
    textAlign: 'center',
  },

  /* ── TRANSPORT BOX ── */
  transportBox: {
    padding: 4,
    borderRadius: 2,
    border: '1pt solid #dee2e6',
  },
  transportRow: {
    flexDirection: 'row',
    marginBottom: 1,
    alignItems: 'center',
    width: '100%',
  },

  /* ── AMOUNT SUMMARY ── */
  amountSection: {
    backgroundColor: '#f8f9fa',
    padding: 4,
    borderRadius: 2,
    border: '1pt solid #dee2e6',
  },
  amountTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#007bff',
    textAlign: 'center',
    borderBottom: '1pt solid #dee2e6',
    paddingBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    paddingBottom: 1,
    borderBottom: '1pt dotted #e9ecef',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1.5pt solid #007bff',
    paddingTop: 3,
    marginTop: 2,
  },
  amountLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 8,
    fontWeight: 'bold',
  },

  /* ── FOOTER ── */
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
    paddingTop: 4,
    borderTop: '1pt solid #e0e0e0',
    gap: 6,
  },
  bankDetails: {
    flex: 1.2,
  },
  bankTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#007bff',
  },
  bankText: {
    fontSize: 6.5,
    lineHeight: 1.2,
    marginBottom: 1,
  },
  signature: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  signatureBox: {
    alignItems: 'center',
    width: 100,
  },
  signatureLine: {
    width: 90,
    marginBottom: 2,
    marginTop: 10,
    borderBottom: '1pt solid #000',
  },

  /* ── MISC ── */
  salesPersonSection: {
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 4,
    borderRadius: 2,
    border: '1pt solid #dee2e6',
    gap: 6,
  },
  salesPersonLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#666666',
  },
  salesPersonName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#007bff',
  },
  notesBox: {
    backgroundColor: '#f8f9fa',
    padding: 4,
    borderRadius: 2,
    border: '1pt solid #dee2e6',
    minHeight: 50,
  },
  itemsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#007bff',
    paddingBottom: 2,
    borderBottom: '1pt solid #007bff',
  },
});

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

const SalesPdfDocument = ({ invoiceData, invoiceNumber, gstBreakdown, isSameState, qrDataUrl, qrAmount, unitData }) => {
  const currentData = invoiceData || {};
  const companyInfo     = getSafeData(currentData, 'companyInfo', {});
  const supplierInfo    = getSafeData(currentData, 'supplierInfo', {});
  const shippingAddress = getSafeData(currentData, 'shippingAddress', {});
  const items  = getSafeData(currentData, 'items', []);
  const bb_bc  = getSafeData(currentData, 'bb_bc', 'b2b');

  const displayInvoiceNumber = invoiceNumber || getSafeData(currentData, 'invoiceNumber', 'INV001');
  const invoiceDate = getSafeData(currentData, 'invoiceDate')
    ? new Date(getSafeData(currentData, 'invoiceDate')).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');
  const dueDate = getSafeData(currentData, 'validityDate')
    ? new Date(getSafeData(currentData, 'validityDate')).toLocaleDateString('en-IN')
    : 'N/A';

  const additionalCharge       = getSafeData(currentData, 'additionalCharge', '');
  const additionalChargeAmount = parseFloat(getSafeData(currentData, 'additionalChargeAmount', '0'));
  const discountCharges        = getSafeData(currentData, 'discount_charges', '');
  const discountChargesAmount  = parseFloat(getSafeData(currentData, 'discount_charges_amount', '0'));

  return (
    <Document>
      <Page size="A5" style={styles.page}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>SHREE SHASHWATRAJ AGRO PVT LTD</Text>
            <Text style={styles.companyAddress}>Growth Center, Jasoiya, Aurangabad, Bihar - 824101</Text>
            <Text style={styles.companyAddress}>GSTIN/UIN: 10AAOCS1541B1ZZ</Text>
            <Text style={styles.companyAddress}>State Name: Bihar | Code: 10</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>{getSafeData(currentData, 'document_type') || 'TAX INVOICE'}</Text>
            <Text style={styles.addressText}><Text style={styles.tableCellBold}>Invoice No:</Text> {displayInvoiceNumber}</Text>
            <Text style={styles.addressText}><Text style={styles.tableCellBold}>Invoice Date:</Text> {invoiceDate}</Text>
            <Text style={styles.addressText}><Text style={styles.tableCellBold}>Due Date:</Text> {dueDate}</Text>
          </View>
        </View>

        {/* ── BILL TO / SHIP TO ── */}
        <View style={styles.addressSection}>
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.addressText}>
              {bb_bc === 'b2c'
                ? getSafeData(supplierInfo, 'name', 'N/A')
                : getSafeData(supplierInfo, 'business_name', 'N/A')}
            </Text>
            <Text style={styles.addressText}>
              {getSafeData(supplierInfo, 'mobile_number') || getSafeData(supplierInfo, 'phone_number', 'N/A')}
            </Text>
            {bb_bc !== 'b2c' && (
              <Text style={styles.addressText}>GSTIN: {getSafeData(supplierInfo, 'gstin', 'N/A')}</Text>
            )}
            <Text style={styles.addressText}>State: {getSafeData(supplierInfo, 'state', 'N/A')}</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <Text style={styles.addressText}>{getSafeData(shippingAddress, 'addressLine1', 'N/A')}</Text>
            <Text style={styles.addressText}>{getSafeData(shippingAddress, 'addressLine2', '')}</Text>
            <Text style={styles.addressText}>
              {getSafeData(shippingAddress, 'city', '')} - {getSafeData(shippingAddress, 'pincode', '')}
            </Text>
            <Text style={styles.addressText}>{getSafeData(shippingAddress, 'state', '')}</Text>
          </View>
        </View>

        {/* ── ITEMS TABLE ── */}
        <View style={styles.itemsSection}>
          <View style={styles.table}>

            {/* ── Header row ── */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.colSNo}>
                <Text style={[styles.tableCellHeader, styles.tableCellCenter]}>SNo</Text>
              </View>
              <View style={styles.colProduct}>
                <Text style={[styles.tableCellHeader, styles.tableCellLeft]}>Description of Goods </Text>
              </View>
              <View style={styles.colHsn}>
                <Text style={[styles.tableCellHeader, styles.tableCellCenter]}>HSN</Text>
              </View>
              <View style={styles.colQuantity}>
                <Text style={[styles.tableCellHeader, styles.tableCellCenter]}>Qty</Text>
              </View>
              <View style={styles.colRateIncl}>
                <Text style={[styles.tableCellHeader, styles.tableCellRight]}>Rate (Incl)</Text>
              </View>
              <View style={styles.colRateExcl}>
                <Text style={[styles.tableCellHeader, styles.tableCellRight]}>Rate (Excl)</Text>
              </View>
              {/* <View style={styles.colDiscount}>
                <Text style={[styles.tableCellHeader, styles.tableCellCenter]}>Disc%</Text>
              </View> */}
              <View style={styles.colGST}>
                <Text style={[styles.tableCellHeader, styles.tableCellCenter]}>GST%</Text>
              </View>
              <View style={styles.colTotal}>
                <Text style={[styles.tableCellHeader, styles.tableCellRight]}>Amount</Text>
              </View>
            </View>

            {/* ── Data rows ── */}
            {items.map((item, index) => {
              const quantity       = parseFloat(getSafeData(item, 'quantity', 1));
              const price          = parseFloat(getSafeData(item, 'price', 0));
              const originalPrice  = parseFloat(getSafeData(item, 'original_price', price));
              const gst            = parseFloat(getSafeData(item, 'gst', 0));
              const discount       = parseFloat(getSafeData(item, 'discount', 0));
              const hsnCode        = getSafeData(item, 'hsn_code', '');
              const unitName       = getSafeData(item, 'unit_name') || (unitData && unitData[item.unit_id]) || '';

              const subtotal            = quantity * price;
              const discountAmount      = subtotal * (discount / 100);
              const amountAfterDiscount = subtotal - discountAmount;
              const gstAmount           = amountAfterDiscount * (gst / 100);
              const itemTotal           = amountAfterDiscount + gstAmount;

              const quantityDisplay = unitName && unitName !== 'null' && unitName !== ''
                ? `${quantity} ${unitName}`
                : quantity.toString();

              const rowBg = index % 2 === 0 ? styles.rowOdd : styles.rowEven;

              return (
                <View style={[styles.tableRow, rowBg]} key={index}>
                  <View style={styles.colSNo}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{index + 1}</Text>
                  </View>
                  <View style={styles.colProduct}>
                    <Text style={[styles.tableCell, styles.tableCellLeft, styles.tableCellBold]}>
                      {getSafeData(item, 'product', `Item ${index + 1}`).substring(0, 20)}
                    </Text>
                  </View>
                  <View style={styles.colHsn}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{hsnCode || '-'}</Text>
                  </View>
                  <View style={styles.colQuantity}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{quantityDisplay}</Text>
                  </View>
                  <View style={styles.colRateIncl}>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>{'\u20B9'}{originalPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.colRateExcl}>
                    <Text style={[styles.tableCell, styles.tableCellRight]}>{'\u20B9'}{price.toFixed(2)}</Text>
                  </View>
                  {/* <View style={styles.colDiscount}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{discount}%</Text>
                  </View> */}
                  <View style={styles.colGST}>
                    <Text style={[styles.tableCell, styles.tableCellCenter]}>{gst}%</Text>
                  </View>
                  <View style={styles.colTotal}>
                    <Text style={[styles.tableCell, styles.tableCellRight, styles.tableCellBold]}>
                      {'\u20B9'}{itemTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── QR + AMOUNT SUMMARY ROW ── */}
        <View style={styles.row}>

          {/* LEFT: QR card + Transport */}
          <View style={styles.col}>
            {qrDataUrl && (
              <View style={styles.qrSection}>
                <Text style={styles.qrTitle}>Scan to Pay</Text>
                <Image src={qrDataUrl} style={styles.qrImage} />
                <Text style={styles.qrAmount}>
                  {'\u20B9'}{(qrAmount || parseFloat(getSafeData(currentData, 'grandTotal', 0))).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.transportBox}>
              <Text style={styles.sectionTitle}>Transport Details:</Text>
              <View style={styles.transportRow}>
                <Text style={[styles.addressText, { fontWeight: 'bold', width: '65%' }]}>Vehicle No.:</Text>
                <Text style={[styles.addressText, { flex: 1 }]}>
                  {getSafeData(currentData, 'transportDetails.vehicleNo') || '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* RIGHT: Amount Summary */}
          <View style={styles.col}>
            <View style={styles.amountSection}>
              <Text style={styles.amountTitle}>Amount Summary</Text>

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Taxable Amount:</Text>
                <Text style={styles.amountValue}>{'\u20B9'}{getSafeData(currentData, 'taxableAmount', '0.00')}</Text>
              </View>

              {isSameState ? (
                <>
                  <View style={styles.amountRow}>
                    <Text style={styles.addressText}>CGST:</Text>
                    <Text style={styles.addressText}>{'\u20B9'}{gstBreakdown?.totalCGST || '0.00'}</Text>
                  </View>
                  <View style={styles.amountRow}>
                    <Text style={styles.addressText}>SGST:</Text>
                    <Text style={styles.addressText}>{'\u20B9'}{gstBreakdown?.totalSGST || '0.00'}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.amountRow}>
                  <Text style={styles.addressText}>IGST:</Text>
                  <Text style={styles.addressText}>{'\u20B9'}{gstBreakdown?.totalIGST || '0.00'}</Text>
                </View>
              )}

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Total GST:</Text>
                <Text style={[styles.amountValue, { color: '#28a745' }]}>
                  {'\u20B9'}{getSafeData(currentData, 'totalGST', '0.00')}
                </Text>
              </View>

              {additionalCharge && additionalChargeAmount > 0 && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>{additionalCharge}:</Text>
                  <Text style={styles.amountValue}>{'\u20B9'}{additionalChargeAmount.toFixed(2)}</Text>
                </View>
              )}

              {discountCharges && discountChargesAmount > 0 && (
                <View style={[styles.amountRow, { borderBottomColor: '#ffcccc' }]}>
                  <Text style={[styles.amountLabel, { color: '#dc3545' }]}>
                    Discount ({discountCharges === 'percentage' ? '%' : '\u20B9'}):
                  </Text>
                  <Text style={[styles.amountValue, { color: '#dc3545' }]}>
                    - {'\u20B9'}{discountChargesAmount.toFixed(2)}
                  </Text>
                </View>
              )}

              {(() => {
                const roundOff = parseFloat(getSafeData(currentData, 'roundOff', '0'));
                if (roundOff !== 0) {
                  return (
                    <View style={[styles.amountRow, { borderBottomColor: '#e9ecef' }]}>
                      <Text style={styles.amountLabel}>Round Off:</Text>
                      <Text style={[styles.amountValue, { color: roundOff < 0 ? '#dc3545' : '#28a745' }]}>
                        {roundOff < 0 ? roundOff.toFixed(2) : `+${roundOff.toFixed(2)}`}
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}

              <View style={styles.grandTotal}>
                <Text style={styles.amountLabel}>Grand Total:</Text>
                <Text style={[styles.amountValue, { color: '#28a745', fontSize: 9 }]}>
                  {'\u20B9'}{getSafeData(currentData, 'grandTotal', '0.00')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details:</Text>
            <Text style={styles.bankText}>SHREE SHASHWATRAJ AGRO PVT LTD</Text>
            <Text style={styles.bankText}>SBI - SME AURANGABAD</Text>
            <Text style={styles.bankText}>A/C: 44773710377</Text>
            <Text style={styles.bankText}>IFSC: SBIN0063699</Text>
          </View>
          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text style={styles.bankText}>For {getSafeData(companyInfo, 'name', 'Company Name')}</Text>
              <View style={styles.signatureLine} />
              <Text style={[styles.bankText, { marginTop: 2 }]}>Authorized Signatory</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default SalesPdfDocument;