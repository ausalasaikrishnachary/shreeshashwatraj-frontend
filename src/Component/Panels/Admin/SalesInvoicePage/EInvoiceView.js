// EInvoiceView.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
  Alert,
  Spinner
} from 'react-bootstrap';
import {
  FaPrint,
  FaDownload,
  FaCopy,
  FaArrowLeft,
  FaRupeeSign,
  FaBuilding,
  FaUser,
  FaCreditCard,
  FaTruck,
  FaFileInvoice,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';
import { baseurl } from "../../../BaseURL/BaseURL";

const EInvoiceView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Get invoice data from location state or fetch from API
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        
        // Check if data was passed via state
        if (location.state?.invoiceData) {
          setInvoiceData(location.state.invoiceData);
          if (location.state.invoiceData.invoiceNumber) {
            await fetchPaymentData(location.state.invoiceData.invoiceNumber);
          }
        } 
        // Check if we have invoice ID in URL params
        else if (location.state?.invoiceId) {
          await fetchInvoiceById(location.state.invoiceId);
        }
        else {
          setError("No invoice data available");
        }
      } catch (err) {
        console.error("Error loading e-invoice:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [location]);
  

  const fetchInvoiceById = async (voucherId) => {
    try {
      const response = await fetch(`${baseurl}/transactions/${voucherId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const transformedData = transformApiDataToInvoiceFormat(result.data);
        setInvoiceData(transformedData);
        if (transformedData.invoiceNumber) {
          await fetchPaymentData(transformedData.invoiceNumber);
        }
      } else {
        throw new Error("Failed to fetch invoice data");
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError(err.message);
    }
  };

  const fetchPaymentData = async (invoiceNumber) => {
    try {
      const encodedInvoiceNumber = encodeURIComponent(invoiceNumber);
      const response = await fetch(`${baseurl}/invoices/${encodedInvoiceNumber}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const transformedData = transformPaymentData(result.data);
        setPaymentData(transformedData);
      }
    } catch (err) {
      console.error("Error fetching payment data:", err);
    }
  };

  const transformApiDataToInvoiceFormat = (apiData) => {
    let batchDetails = [];
    try {
      if (apiData.batch_details && typeof apiData.batch_details === "string") {
        batchDetails = JSON.parse(apiData.batch_details);
      } else if (Array.isArray(apiData.batch_details)) {
        batchDetails = apiData.batch_details;
      }
    } catch (error) {
      console.error("Error parsing batch details:", error);
    }

    const items = batchDetails.map((batch, index) => ({
      id: index + 1,
      product: batch.product || "Product",
      description: batch.description || `Batch: ${batch.batch}`,
      hsn_code: batch.hsn_code || "",
      quantity: parseFloat(batch.quantity) || 0,
      price: parseFloat(batch.price) || 0,
      original_price: parseFloat(batch.original_price) || 0,
      discount: parseFloat(batch.discount) || 0,
      gst: parseFloat(batch.gst) || 0,
      cgst: parseFloat(batch.cgst) || 0,
      sgst: parseFloat(batch.sgst) || 0,
      igst: parseFloat(batch.igst) || 0,
      cess: parseFloat(batch.cess) || 0,
      total: (parseFloat(batch.quantity) * parseFloat(batch.price)).toFixed(2),
      batch: batch.batch || "",
      batch_id: batch.batch_id || "",
      product_id: batch.product_id || "",
      unit_id: batch.unit_id || null
    }));

    return {
      voucherId: apiData.VoucherID,
      invoiceNumber: apiData.InvoiceNumber,
      invoiceDate: apiData.Date ? new Date(apiData.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      companyInfo: {
        name: apiData.company_name || "Company Name",
        address: apiData.company_address || "",
        email: apiData.company_email || "",
        phone: apiData.company_phone || "",
        gstin: apiData.company_gstin || "",
        state: apiData.company_state || "",
        stateCode: apiData.company_state_code || ""
      },
      supplierInfo: {
        name: apiData.PartyName || "Customer",
        business_name: apiData.business_name || "",
        gstin: apiData.gstin || "",
        state: apiData.billing_state || "",
        mobile_number: apiData.retailer_mobile || "",
        id: apiData.PartyID || null
      },
      billingAddress: {
        addressLine1: apiData.billing_address_line1 || "",
        addressLine2: apiData.billing_address_line2 || "",
        city: apiData.billing_city || "",
        pincode: apiData.billing_pin_code || "",
        state: apiData.billing_state || ""
      },
      shippingAddress: {
        addressLine1: apiData.shipping_address_line1 || apiData.billing_address_line1 || "",
        addressLine2: apiData.shipping_address_line2 || apiData.billing_address_line2 || "",
        city: apiData.shipping_city || apiData.billing_city || "",
        pincode: apiData.shipping_pin_code || apiData.billing_pin_code || "",
        state: apiData.shipping_state || apiData.billing_state || ""
      },
      items: items,
      taxableAmount: apiData.BasicAmount || 0,
      totalGST: apiData.TaxAmount || 0,
      grandTotal: apiData.TotalAmount || 0,
      roundOff: apiData.round_off || 0,
      note: apiData.Notes || "Thank you for your business!",
      transportDetails: {
        transport: apiData.transport_name || "",
        grNumber: apiData.gr_rr_number || "",
        vehicleNo: apiData.vehicle_number || "",
        station: apiData.station_name || ""
      },
      additionalCharge: apiData.additional_charges_type || "",
      additionalChargeAmount: apiData.additional_charges_amount || 0,
      assigned_staff: apiData.assigned_staff || "N/A",
      bb_bc: apiData.bb_bc || "b2b"
    };
  };

  const transformPaymentData = (apiData) => {
    const salesEntry = apiData.sales || apiData.stocktransfer || {};
    const receiptEntries = apiData.receipts || [];
    const creditNoteEntries = apiData.creditnotes || [];

    const totalAmount = parseFloat(salesEntry.TotalAmount) || 0;
    const receipts = Array.isArray(receiptEntries) ? receiptEntries : [];
    const totalPaid = receipts.reduce((sum, receipt) => {
      return sum + parseFloat(receipt.paid_amount || receipt.TotalAmount || 0);
    }, 0);

    const creditnotes = Array.isArray(creditNoteEntries) ? creditNoteEntries : [];
    const totalCreditNotes = creditnotes.reduce((sum, creditnote) => {
      return sum + parseFloat(creditnote.paid_amount || creditnote.TotalAmount || 0);
    }, 0);

    const balanceDue = totalAmount - totalPaid - totalCreditNotes;

    let status = "Pending";
    if (balanceDue === 0) {
      status = "Paid";
    } else if (totalPaid > 0 || totalCreditNotes > 0) {
      status = "Partial";
    }

    return {
      summary: {
        totalPaid: totalPaid,
        totalCreditNotes: totalCreditNotes,
        balanceDue: balanceDue,
        status: status
      },
      receipts: receipts.map(receipt => ({
        receiptNumber: receipt.VchNo || receipt.receipt_number,
        paidAmount: parseFloat(receipt.paid_amount || receipt.TotalAmount || 0),
        paidDate: receipt.Date || receipt.paid_date,
        paymentMethod: receipt.payment_method || "N/A"
      })),
      creditnotes: creditnotes.map(creditnote => ({
        receiptNumber: creditnote.VchNo || "CNOTE",
        paidAmount: parseFloat(creditnote.paid_amount || creditnote.TotalAmount || 0),
        paidDate: creditnote.Date || creditnote.paid_date
      }))
    };
  };

  const generateEInvoiceJSON = () => {
    if (!invoiceData) return null;

    const gstBreakdown = calculateGSTBreakdown();

    return {
      invoice: {
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        voucherId: invoiceData.voucherId,
        documentType: "Tax Invoice",
        bb_bc: invoiceData.bb_bc || "b2b"
      },
      companyInfo: invoiceData.companyInfo,
      customerInfo: invoiceData.supplierInfo,
      billingAddress: invoiceData.billingAddress,
      shippingAddress: invoiceData.shippingAddress,
      items: invoiceData.items.map((item, idx) => ({
        slNo: idx + 1,
        ...item,
        taxableAmount: (item.quantity * item.price).toFixed(2),
        discountAmount: ((item.quantity * item.price) * (item.discount / 100)).toFixed(2),
        gstAmount: ((item.quantity * item.price * (1 - item.discount / 100)) * (item.gst / 100)).toFixed(2)
      })),
      financialSummary: {
        taxableAmount: parseFloat(invoiceData.taxableAmount),
        totalCGST: parseFloat(gstBreakdown.totalCGST),
        totalSGST: parseFloat(gstBreakdown.totalSGST),
        totalIGST: parseFloat(gstBreakdown.totalIGST),
        totalGST: parseFloat(invoiceData.totalGST),
        additionalCharges: invoiceData.additionalCharge || "",
        additionalChargesAmount: parseFloat(invoiceData.additionalChargeAmount) || 0,
        roundOff: parseFloat(invoiceData.roundOff) || 0,
        grandTotal: parseFloat(invoiceData.grandTotal)
      },
      paymentInfo: paymentData ? {
        status: paymentData.summary.status,
        totalPaid: paymentData.summary.totalPaid,
        totalCreditNotes: paymentData.summary.totalCreditNotes,
        balanceDue: paymentData.summary.balanceDue,
        receipts: paymentData.receipts,
        creditNotes: paymentData.creditnotes
      } : null,
      transportDetails: invoiceData.transportDetails,
      additionalInfo: {
        note: invoiceData.note,
        assignedStaff: invoiceData.assigned_staff
      },
      generatedOn: new Date().toISOString()
    };
  };

  const calculateGSTBreakdown = () => {
    if (!invoiceData || !invoiceData.items) {
      return { totalCGST: 0, totalSGST: 0, totalIGST: 0 };
    }

    const totalCGST = invoiceData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const cgstRate = parseFloat(item.cgst) || 0;
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      return sum + (amountAfterDiscount * (cgstRate / 100));
    }, 0);

    const totalSGST = invoiceData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const sgstRate = parseFloat(item.sgst) || 0;
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      return sum + (amountAfterDiscount * (sgstRate / 100));
    }, 0);

    const totalIGST = invoiceData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const igstRate = parseFloat(item.igst) || 0;
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      return sum + (amountAfterDiscount * (igstRate / 100));
    }, 0);

    return {
      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalIGST: totalIGST.toFixed(2)
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const jsonData = generateEInvoiceJSON();
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `einvoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopyToClipboard = () => {
    const jsonData = generateEInvoiceJSON();
    const jsonString = JSON.stringify(jsonData, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      alert('JSON data copied to clipboard!');
    }).catch(err => {
      alert('Failed to copy: ' + err);
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid':
        return <Badge bg="success"><FaCheckCircle className="me-1" /> Paid</Badge>;
      case 'Partial':
        return <Badge bg="warning"><FaClock className="me-1" /> Partial</Badge>;
      default:
        return <Badge bg="danger"><FaTimesCircle className="me-1" /> Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading e-invoice data...</p>
      </Container>
    );
  }

  if (error || !invoiceData) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading E-Invoice</Alert.Heading>
          <p>{error || "No invoice data available"}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  const einvoiceJson = generateEInvoiceJSON();

  return (
    <div className="einvoice-view-page" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="einvoice-header bg-white shadow-sm p-4 mb-4 sticky-top">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h2 className="mb-1">
                <FaFileInvoice className="me-2 text-primary" />
                E-Invoice Details
              </h2>
              <p className="text-muted mb-0">
                Invoice #{invoiceData.invoiceNumber} | Date: {new Date(invoiceData.invoiceDate).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-2 mt-sm-0">
              <Button variant="outline-secondary" onClick={() => navigate(-1)} className="me-2">
                <FaArrowLeft className="me-1" /> Back
              </Button>
              <Button variant="primary" onClick={handlePrint} className="me-2">
                <FaPrint className="me-1" /> Print
              </Button>
              <Button variant="success" onClick={handleDownloadJSON} className="me-2">
                <FaDownload className="me-1" /> Download JSON
              </Button>
              <Button variant="info" onClick={handleCopyToClipboard}>
                <FaCopy className="me-1" /> Copy
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid>
        <Row>
          {/* Summary Cards */}
          <Col lg={12} className="mb-4">
            <Row>
              <Col md={3} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="text-muted mb-2">Total Amount</h6>
                        <h3 className="mb-0 text-primary">₹{parseFloat(invoiceData.grandTotal).toFixed(2)}</h3>
                      </div>
                      <FaRupeeSign className="text-primary fs-1 opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="text-muted mb-2">Payment Status</h6>
                        <div className="fs-4">{paymentData && getStatusBadge(paymentData.summary.status)}</div>
                      </div>
                      <FaCreditCard className="text-info fs-1 opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="text-muted mb-2">Balance Due</h6>
                        <h4 className={`mb-0 ${paymentData?.summary?.balanceDue > 0 ? 'text-danger' : 'text-success'}`}>
                          ₹{paymentData ? paymentData.summary.balanceDue.toFixed(2) : parseFloat(invoiceData.grandTotal).toFixed(2)}
                        </h4>
                      </div>
                      <FaRupeeSign className="text-danger fs-1 opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="text-muted mb-2">Total Items</h6>
                        <h3 className="mb-0">{invoiceData.items.length}</h3>
                      </div>
                      <FaBuilding className="text-success fs-1 opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Business Details */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0"><FaBuilding className="me-2 text-primary" /> Business Details</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <h6 className="text-muted mb-2">Company Information</h6>
                  <p className="mb-1"><strong>Name:</strong> {invoiceData.companyInfo.name}</p>
                  <p className="mb-1"><strong>Address:</strong> {invoiceData.companyInfo.address}</p>
                  <p className="mb-1"><strong>GSTIN:</strong> {invoiceData.companyInfo.gstin}</p>
                  <p className="mb-1"><strong>State:</strong> {invoiceData.companyInfo.state} (Code: {invoiceData.companyInfo.stateCode})</p>
                  <p className="mb-1"><strong>Email:</strong> {invoiceData.companyInfo.email}</p>
                  <p className="mb-0"><strong>Phone:</strong> {invoiceData.companyInfo.phone}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0"><FaUser className="me-2 text-primary" /> Customer Details</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <h6 className="text-muted mb-2">Customer Information</h6>
                  <p className="mb-1"><strong>Name:</strong> {invoiceData.supplierInfo.name}</p>
                  {invoiceData.supplierInfo.business_name && (
                    <p className="mb-1"><strong>Business Name:</strong> {invoiceData.supplierInfo.business_name}</p>
                  )}
                  <p className="mb-1"><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin || "N/A"}</p>
                  <p className="mb-1"><strong>State:</strong> {invoiceData.supplierInfo.state || "N/A"}</p>
                  <p className="mb-0"><strong>Mobile:</strong> {invoiceData.supplierInfo.mobile_number || "N/A"}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Addresses */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">📍 Billing Address</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">
                  {invoiceData.billingAddress.addressLine1}<br />
                  {invoiceData.billingAddress.addressLine2 && <>{invoiceData.billingAddress.addressLine2}<br /></>}
                  {invoiceData.billingAddress.city} - {invoiceData.billingAddress.pincode}<br />
                  {invoiceData.billingAddress.state}
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">🚚 Shipping Address</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">
                  {invoiceData.shippingAddress.addressLine1}<br />
                  {invoiceData.shippingAddress.addressLine2 && <>{invoiceData.shippingAddress.addressLine2}<br /></>}
                  {invoiceData.shippingAddress.city} - {invoiceData.shippingAddress.pincode}<br />
                  {invoiceData.shippingAddress.state}
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* Items Table */}
          <Col lg={12} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">📦 Items Details</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>HSN Code</th>
                        <th>Quantity</th>
                        <th>Price (₹)</th>
                        <th>Discount %</th>
                        <th>GST %</th>
                        <th>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{item.product}</td>
                          <td>{item.hsn_code || "-"}</td>
                          <td>{item.quantity}</td>
                          <td className="text-end">₹{parseFloat(item.price).toFixed(2)}</td>
                          <td className="text-center">{item.discount}%</td>
                          <td className="text-center">{item.gst}%</td>
                          <td className="text-end fw-bold">₹{parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Financial Summary */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">💰 Financial Summary</h5>
              </Card.Header>
              <Card.Body>
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td><strong>Taxable Amount:</strong></td>
                      <td className="text-end">₹{parseFloat(invoiceData.taxableAmount).toFixed(2)}</td>
                    </tr>
                    {calculateGSTBreakdown().totalCGST > 0 && (
                      <>
                        <tr>
                          <td><strong>CGST:</strong></td>
                          <td className="text-end">₹{calculateGSTBreakdown().totalCGST}</td>
                        </tr>
                        <tr>
                          <td><strong>SGST:</strong></td>
                          <td className="text-end">₹{calculateGSTBreakdown().totalSGST}</td>
                        </tr>
                      </>
                    )}
                    {calculateGSTBreakdown().totalIGST > 0 && (
                      <tr>
                        <td><strong>IGST:</strong></td>
                        <td className="text-end">₹{calculateGSTBreakdown().totalIGST}</td>
                      </tr>
                    )}
                    <tr>
                      <td><strong>Total GST:</strong></td>
                      <td className="text-end">₹{parseFloat(invoiceData.totalGST).toFixed(2)}</td>
                    </tr>
                    {invoiceData.additionalCharge && parseFloat(invoiceData.additionalChargeAmount) > 0 && (
                      <tr>
                        <td><strong>{invoiceData.additionalCharge}:</strong></td>
                        <td className="text-end">₹{parseFloat(invoiceData.additionalChargeAmount).toFixed(2)}</td>
                      </tr>
                    )}
                    {parseFloat(invoiceData.roundOff) !== 0 && (
                      <tr>
                        <td><strong>Round Off:</strong></td>
                        <td className="text-end">
                          <span className={parseFloat(invoiceData.roundOff) < 0 ? 'text-danger' : 'text-success'}>
                            {parseFloat(invoiceData.roundOff) < 0 ? invoiceData.roundOff : `+${invoiceData.roundOff}`}
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr className="border-top">
                      <td><strong className="fs-5">Grand Total:</strong></td>
                      <td className="text-end"><strong className="fs-5 text-success">₹{parseFloat(invoiceData.grandTotal).toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>

          {/* Payment Information */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">💳 Payment Information</h5>
              </Card.Header>
              <Card.Body>
                {paymentData ? (
                  <>
                    <div className="mb-3">
                      <strong>Status:</strong> {getStatusBadge(paymentData.summary.status)}
                    </div>
                    <div className="mb-3">
                      <strong>Total Paid:</strong> ₹{paymentData.summary.totalPaid.toFixed(2)}
                    </div>
                    {paymentData.summary.totalCreditNotes > 0 && (
                      <div className="mb-3">
                        <strong>Credit Notes:</strong> ₹{paymentData.summary.totalCreditNotes.toFixed(2)}
                      </div>
                    )}
                    <div className="mb-3">
                      <strong>Balance Due:</strong> 
                      <span className={`ms-2 fw-bold ${paymentData.summary.balanceDue > 0 ? 'text-danger' : 'text-success'}`}>
                        ₹{paymentData.summary.balanceDue.toFixed(2)}
                      </span>
                    </div>
                    {paymentData.receipts.length > 0 && (
                      <>
                        <hr />
                        <h6 className="mb-2">Recent Receipts</h6>
                        {paymentData.receipts.slice(0, 3).map((receipt, idx) => (
                          <div key={idx} className="small text-muted mb-1">
                            {receipt.receiptNumber} - ₹{receipt.paidAmount.toFixed(2)} ({new Date(receipt.paidDate).toLocaleDateString()})
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-muted mb-0">No payment information available</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Transport Details */}
          {invoiceData.transportDetails && (invoiceData.transportDetails.vehicleNo || invoiceData.transportDetails.transport) && (
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0"><FaTruck className="me-2 text-primary" /> Transport Details</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {invoiceData.transportDetails.transport && (
                      <Col md={3}>
                        <strong>Transport:</strong>
                        <p className="mb-0">{invoiceData.transportDetails.transport}</p>
                      </Col>
                    )}
                    {invoiceData.transportDetails.grNumber && (
                      <Col md={3}>
                        <strong>GR/RR No.:</strong>
                        <p className="mb-0">{invoiceData.transportDetails.grNumber}</p>
                      </Col>
                    )}
                    {invoiceData.transportDetails.vehicleNo && (
                      <Col md={3}>
                        <strong>Vehicle No.:</strong>
                        <p className="mb-0">{invoiceData.transportDetails.vehicleNo}</p>
                      </Col>
                    )}
                    {invoiceData.transportDetails.station && (
                      <Col md={3}>
                        <strong>Station:</strong>
                        <p className="mb-0">{invoiceData.transportDetails.station}</p>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Notes */}
          {invoiceData.note && (
            <Col lg={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">📝 Notes</h5>
                </Card.Header>
                <Card.Body>
                  <p className="mb-0">{invoiceData.note}</p>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* JSON Data Display */}
          <Col lg={12} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">📋 Complete JSON Data</h5>
              </Card.Header>
              <Card.Body>
                <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', overflow: 'auto', maxHeight: '400px' }}>
                  {JSON.stringify(einvoiceJson, null, 2)}
                </pre>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        @media print {
          .einvoice-header {
            position: static !important;
          }
          .btn {
            display: none !important;
          }
          .shadow-sm {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EInvoiceView;