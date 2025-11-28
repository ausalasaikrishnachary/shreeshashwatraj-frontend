import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Card, ProgressBar, Modal } from 'react-bootstrap';
import './Invoices.css';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';
import { FaEdit, FaTrash, FaEye, FaInfoCircle, FaRupeeSign, FaTarget, FaTrophy, FaCrosshairs, FaDotCircle, FaBullseye } from "react-icons/fa";
import { baseurl } from '../../../BaseURL/BaseURL';
import { useNavigate, useParams } from "react-router-dom";

// Retailer Eligibility Component
const RetailerEligibility = ({ customerId, customerName, onDiscountUpdate, invoiceAmount = 0 }) => {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Helper function to format month display
  const formatMonthDisplay = (dateString) => {
    if (!dateString) return 'Not available';
    
    try {
      // Handle both YYYY-MM and YYYY-MM-01 formats
      let date;
      if (dateString.includes('-01')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString + '-01');
      }
      
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  const fetchEligibility = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/discount/eligibility/${customerId}`);
      const data = await response.json();
      
      if (data.success) {
        setEligibility(data);
        // Notify parent component about discount update
        if (onDiscountUpdate) {
          onDiscountUpdate(data.nextMonthDiscount);
        }
      } else {
        setError('Failed to fetch eligibility data');
      }
    } catch (err) {
      setError('Error fetching eligibility data');
    } finally {
      setLoading(false);
    }
  };

  // Check eligibility after invoice amount changes
  useEffect(() => {
    if (customerId && invoiceAmount > 0) {
      checkEligibilityWithInvoice();
    }
  }, [invoiceAmount]);

  const checkEligibilityWithInvoice = async () => {
    try {
      const response = await fetch(`${baseurl}/discount/check-invoice-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          invoiceAmount
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEligibility(prev => ({
          ...prev,
          ...data,
          currentSales: data.currentSales,
          isTargetAchieved: data.isEligible,
          nextMonthDiscount: data.nextMonthDiscount
        }));
        
        if (onDiscountUpdate) {
          onDiscountUpdate(data.nextMonthDiscount);
        }
      }
    } catch (err) {
      console.error('Error checking eligibility with invoice:', err);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchEligibility();
    }
  }, [customerId]);

  if (loading) return (
    <Card className="mb-3 border-primary">
      <Card.Body className="text-center py-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 mb-0">Loading target status...</p>
      </Card.Body>
    </Card>
  );
  
  if (error) return (
    <Alert variant="danger" className="py-2">
      <FaInfoCircle className="me-2" />
      {error}
    </Alert>
  );
  
  if (!eligibility) return null;

  return (
    <>
      <Card className="mb-3 border-primary">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-2">
          <strong>
            <FaCrosshairs className="me-2" />
            Retailer Target Status - {customerName}
          </strong>
          <div>
            <Button 
              variant="light" 
              size="sm" 
              className="me-2"
              onClick={() => setShowDetails(true)}
            >
              Details
            </Button>
            <Button variant="light" size="sm" onClick={fetchEligibility}>
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-3">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Current Month: {formatMonthDisplay(eligibility.currentMonth)}</span>
                <Badge bg={eligibility.isTargetAchieved ? "success" : "secondary"}>
                  {eligibility.isTargetAchieved ? "Target Achieved 🎉" : "In Progress"}
                </Badge>
              </div>
              
              <ProgressBar 
                now={eligibility.progressPercentage || 0} 
                variant={eligibility.isTargetAchieved ? "success" : "primary"}
                className="mb-2"
                style={{ height: '20px' }}
              >
                <ProgressBar 
                  now={eligibility.progressPercentage || 0} 
                  label={`${Math.round(eligibility.progressPercentage || 0)}%`}
                />
              </ProgressBar>
              
              <div className="d-flex justify-content-between text-sm">
                <small>₹0</small>
                <small className="fw-bold">Target: ₹{eligibility.target?.toLocaleString() || '0'}</small>
                <small>₹{eligibility.target?.toLocaleString() || '0'}</small>
              </div>
            </Col>
            
            <Col md={4} className="text-center border-start">
              <div className="mb-2">
                <FaRupeeSign className="text-success" />
                <strong className="ms-1 fs-5">₹{eligibility.currentSales?.toLocaleString() || '0'}</strong>
                <div className="text-muted small">Sales Achieved</div>
              </div>
              
              <div className="mb-2">
                <Badge bg="info" className="fs-6">
                  {eligibility.currentDiscount || 0}% Current
                </Badge>
                <div className="text-muted small">Current Discount</div>
              </div>
              
              <div>
                <Badge bg={eligibility.nextMonthDiscount > 0 ? "success" : "secondary"} className="fs-6">
                  {eligibility.nextMonthDiscount || 0}% Next Month
                </Badge>
                <div className="text-muted small">Next Month Discount</div>
              </div>
            </Col>
          </Row>
          
          {eligibility.isTargetAchieved ? (
            <Alert variant="success" className="mt-2 mb-0 p-2 d-flex align-items-center">
              <FaDotCircle className="me-2 fs-5" />
              <div>
                <strong>Congratulations!</strong> Target achieved for {formatMonthDisplay(eligibility.currentMonth)}. 
                <br />
                <small>You will get <strong>20% discount</strong> from {formatMonthDisplay(eligibility.nextMonth)}</small>
              </div>
            </Alert>
          ) : (
            <Alert variant="warning" className="mt-2 mb-0 p-2">
              <strong>Keep going!</strong> Need <strong>₹{eligibility.remainingTarget?.toLocaleString() || '0'}</strong> more to get 20% discount for {formatMonthDisplay(eligibility.nextMonth)}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaBullseye className="me-2" />
            Target Details - {customerName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h6>Current Month: {formatMonthDisplay(eligibility.currentMonth)}</h6>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>Sales Target:</strong></td>
                    <td className="text-end">₹{eligibility.target?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td><strong>Achieved Sales:</strong></td>
                    <td className="text-end text-success">₹{eligibility.currentSales?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td><strong>Remaining Target:</strong></td>
                    <td className="text-end text-warning">₹{eligibility.remainingTarget?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td><strong>Progress:</strong></td>
                    <td className="text-end">{Math.round(eligibility.progressPercentage || 0)}%</td>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Col md={6}>
              <h6>Next Month: {formatMonthDisplay(eligibility.nextMonth)}</h6>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>Current Discount:</strong></td>
                    <td className="text-end">
                      <Badge bg="info">{eligibility.currentDiscount || 0}%</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Next Month Discount:</strong></td>
                    <td className="text-end">
                      <Badge bg={eligibility.nextMonthDiscount > 0 ? "success" : "secondary"}>
                        {eligibility.nextMonthDiscount || 0}%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Status:</strong></td>
                    <td className="text-end">
                      {eligibility.isTargetAchieved ? (
                        <Badge bg="success">Eligible for 20%</Badge>
                      ) : (
                        <Badge bg="warning">Not Eligible</Badge>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
          
          <div className="mt-3 p-3 bg-light rounded">
            <h6>How it works:</h6>
            <ul className="mb-0">
              <li>Achieve your monthly target to get <strong>20% discount</strong> for the next month</li>
              <li>Discount is automatically applied from the 1st of next month</li>
              <li>Check your progress after every sale</li>
              <li>Target resets every month</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const CreateInvoice = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputName, setInputName] = useState("");
  const [selected, setSelected] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("INV001");
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [hasFetchedInvoiceNumber, setHasFetchedInvoiceNumber] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Enhanced Discount state with eligible discount support
  const [discountInfo, setDiscountInfo] = useState({
    discount: 0,
    source: 'none',
    breakdown: {
      eligibleDiscount: 0,
      productDiscount: 0,
      categoryDiscount: 0,
      companyDiscount: 0,
      accountDiscount: 0,
      retailerDiscount: 0
    },
    details: {
      productName: '',
      categoryId: null,
      companyId: null,
      accountId: null,
      hasEligibleDiscount: false
    }
  });

  // Load from localStorage on component mount OR fetch existing invoice data if editing
  const [invoiceData, setInvoiceData] = useState(() => {
    const savedData = localStorage.getItem('draftInvoice');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData;
    }
    return {
      invoiceNumber: "INV001",
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhusr7@gmail.com",
        phone: "3456549876543",
        gstin: "29AABCD0503B1ZG",
        state: "Karnataka"
      },
      supplierInfo: {
        name: "",
        businessName: "",
        state: "",
        gstin: ""
      },
      billingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      shippingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      items: [],
      note: "",
      taxableAmount: 0,
      totalGST: 0,
      totalCess: 0,
      grandTotal: 0,
      transportDetails: "",
      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      batchDetails: []
    };
  });

  const [itemForm, setItemForm] = useState({
    product: "",
    product_id: "",
    description: "",
    quantity: 1,
    price: 0,
    discount: 0,
    gst: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    total: 0,
    batch: "",
    batch_id: "",
    batchDetails: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ==================== ENHANCED DYNAMIC DISCOUNT FUNCTIONS ====================

  const fetchDynamicDiscount = async (productId, accountId) => {
    if (!productId || !accountId) {
      console.log('Missing productId or accountId for discount fetch');
      setDiscountInfo({
        discount: 0,
        source: 'none',
        breakdown: {
          eligibleDiscount: 0,
          productDiscount: 0,
          categoryDiscount: 0,
          companyDiscount: 0,
          accountDiscount: 0,
          retailerDiscount: 0
        },
        details: {
          productName: '',
          categoryId: null,
          companyId: null,
          accountId: null,
          hasEligibleDiscount: false
        }
      });
      return 0;
    }

    try {
      // NEW: First check if retailer has eligible discount for current month
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const eligibleResponse = await fetch(`${baseurl}/discount/eligibility/${accountId}`);
      const eligibilityData = await eligibleResponse.json();
      
      const eligibleDiscount = eligibilityData.nextMonthDiscount || 0;
      const hasEligibleDiscount = eligibleDiscount > 0;

      // Then get hierarchy discount (eligible discount takes priority)
      const hierarchyResponse = await fetch(`${baseurl}/discount-hierarchy/${productId}/${accountId}`);
      
      if (!hierarchyResponse.ok) {
        throw new Error('Failed to fetch discount information');
      }
      
      const hierarchyData = await hierarchyResponse.json();
      
      if (hierarchyData.success) {
        // NEW PRIORITY: Eligible discount FIRST, then use hierarchy discount
        let finalDiscount = 0;
        let source = 'none';
        
        if (hasEligibleDiscount) {
          finalDiscount = eligibleDiscount;
          source = 'eligible_discount';
        } else {
          finalDiscount = hierarchyData.discount;
          source = hierarchyData.discountSource;
        }
        
        console.log('Enhanced discount calculation with priority:', {
          eligibleDiscount,
          hierarchyDiscount: hierarchyData.discount,
          finalDiscount,
          source,
          hasEligibleDiscount
        });
        
        // Update discount info state
        setDiscountInfo({
          discount: finalDiscount,
          source: source,
          breakdown: {
            ...hierarchyData.breakdown,
            eligibleDiscount: eligibleDiscount,
            retailerDiscount: hierarchyData.breakdown.accountDiscount
          },
          details: {
            ...hierarchyData.details,
            hasEligibleDiscount: hasEligibleDiscount
          }
        });

        // Show discount source information to user
        if (finalDiscount > 0) {
          let sourceMessage = '';
          if (source === 'eligible_discount') {
            sourceMessage = `🎯 Target Achievement Reward: ${finalDiscount}% discount applied!`;
          } else {
            sourceMessage = `Applied ${finalDiscount}% discount from ${source}`;
          }
          
          setSuccess(sourceMessage);
          setTimeout(() => setSuccess(false), 4000);
        }
        
        return finalDiscount;
      } else {
        throw new Error(hierarchyData.error || 'Failed to fetch discount');
      }
    } catch (error) {
      console.error('Error fetching enhanced dynamic discount:', error);
      setDiscountInfo({
        discount: 0,
        source: 'none',
        breakdown: {
          eligibleDiscount: 0,
          productDiscount: 0,
          categoryDiscount: 0,
          companyDiscount: 0,
          accountDiscount: 0,
          retailerDiscount: 0
        },
        details: {
          productName: '',
          categoryId: null,
          companyId: null,
          accountId: null,
          hasEligibleDiscount: false
        }
      });
      return 0;
    }
  };

  // Handle retailer discount updates from eligibility component
  const handleRetailerDiscountUpdate = (newDiscount) => {
    console.log('Retailer discount updated:', newDiscount);
    // If we have a product selected, refresh the discount
    if (itemForm.product_id && selectedSupplierId) {
      fetchDynamicDiscount(itemForm.product_id, selectedSupplierId);
    }
  };

  const handleProductSelection = async (selectedName) => {
    const selectedProduct = products.find((p) => p.goods_name === selectedName);

    if (selectedProduct) {
      // Fetch enhanced dynamic discount when product is selected
      let dynamicDiscount = 0;
      if (selectedSupplierId) {
        dynamicDiscount = await fetchDynamicDiscount(selectedProduct.id, selectedSupplierId);
      }

      setItemForm((prev) => ({
        ...prev,
        product: selectedProduct.goods_name,
        product_id: selectedProduct.id,
        price: selectedProduct.net_price,
        gst: parseFloat(selectedProduct.gst_rate) ? selectedProduct.gst_rate.replace("%", "") : 0,
        description: selectedProduct.description || "",
        discount: dynamicDiscount // Set the dynamically fetched discount
      }));

      try {
        const res = await fetch(`${baseurl}/products/${selectedProduct.id}/batches`);
        const batchData = await res.json();
        setBatches(batchData);
        setSelectedBatch("");
        setSelectedBatchDetails(null);
      } catch (err) {
        console.error("Failed to fetch batches:", err);
        setBatches([]);
      }
    }
  };

  const handleBatchSelection = async (batchNumber) => {
    setSelectedBatch(batchNumber);
    const batch = batches.find(b => b.batch_number === batchNumber);
    setSelectedBatchDetails(batch || null);

    if (batch) {
      // Fetch enhanced discount when batch is selected
      let dynamicDiscount = discountInfo.discount;
      if (itemForm.product_id && selectedSupplierId) {
        dynamicDiscount = await fetchDynamicDiscount(itemForm.product_id, selectedSupplierId);
      }

      setItemForm(prev => ({
        ...prev,
        batch_id: batch.id,
        price: batch.selling_price,
        discount: dynamicDiscount // Update discount even when batch changes
      }));
    }
  };

  // ==================== EXISTING FUNCTIONS (PRESERVED) ====================

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setEditingVoucherId(id);
      fetchInvoiceDataForEdit(id);
    } else {
      fetchNextInvoiceNumber();
    }
  }, [id]);

  const fetchInvoiceDataForEdit = async (voucherId) => {
    try {
      setLoading(true);
      console.log('Fetching invoice data for editing:', voucherId);
      
      const response = await fetch(`${baseurl}/transactions/${voucherId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice data');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const apiData = result.data;
        const transformedData = transformApiDataToFormFormat(apiData);
        
        setInvoiceData(transformedData);
        setSelectedSupplierId(apiData.PartyID);
        setSelected(true);
        
        const supplierAccount = accounts.find(acc => acc.id === apiData.PartyID);
        if (supplierAccount) {
          setInputName(supplierAccount.business_name);
        }
        
        setSuccess('Invoice loaded for editing');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('No valid data received');
      }
    } catch (err) {
      console.error('Error fetching invoice for edit:', err);
      setError('Failed to load invoice for editing: ' + err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const transformApiDataToFormFormat = (apiData) => {
    console.log('Transforming API data for form:', apiData);
    
    let batchDetails = [];
    try {
      if (apiData.batch_details && typeof apiData.batch_details === 'string') {
        batchDetails = JSON.parse(apiData.batch_details);
      } else if (Array.isArray(apiData.batch_details)) {
        batchDetails = apiData.batch_details;
      } else if (apiData.BatchDetails && typeof apiData.BatchDetails === 'string') {
        batchDetails = JSON.parse(apiData.BatchDetails);
      }
    } catch (error) {
      console.error('Error parsing batch details:', error);
    }

    const items = batchDetails.map((batch, index) => {
      const quantity = parseFloat(batch.quantity) || 0;
      const price = parseFloat(batch.price) || 0;
      const discount = parseFloat(batch.discount) || 0;
      const gst = parseFloat(batch.gst) || 0;
      const cess = parseFloat(batch.cess) || 0;
      
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      const cessAmount = amountAfterDiscount * (cess / 100);
      const total = amountAfterDiscount + gstAmount + cessAmount;

      return {
        product: batch.product || 'Product',
        product_id: batch.product_id || '',
        description: batch.description || '',
        quantity: quantity,
        price: price,
        discount: discount,
        gst: gst,
        cgst: parseFloat(batch.cgst) || 0,
        sgst: parseFloat(batch.sgst) || 0,
        igst: parseFloat(batch.igst) || 0,
        cess: cess,
        total: total.toFixed(2),
        batch: batch.batch || '',
        batch_id: batch.batch_id || '',
        batchDetails: batch.batchDetails || null,
        // Add detailed breakdown
        subtotal: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        taxableAmount: amountAfterDiscount.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        cessAmount: cessAmount.toFixed(2)
      };
    }) || [];

    return {
      voucherId: apiData.VoucherID,
      invoiceNumber: apiData.InvoiceNumber || `INV${apiData.VoucherID}`,
      invoiceDate: apiData.Date ? new Date(apiData.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validityDate: apiData.Date ? new Date(new Date(apiData.Date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhusr7@gmail.com",
        phone: "3456549876543",
        gstin: "29AABCD0503B1ZG",
        state: "Karnataka"
      },
      
      supplierInfo: {
        name: apiData.PartyName || 'Customer',
        businessName: apiData.AccountName || 'Business',
        gstin: apiData.gstin || '',
        state: apiData.billing_state || apiData.BillingState || '',
        id: apiData.PartyID || null
      },
      
      billingAddress: {
        addressLine1: apiData.billing_address_line1 || apiData.BillingAddress || '',
        addressLine2: apiData.billing_address_line2 || '',
        city: apiData.billing_city || apiData.BillingCity || '',
        pincode: apiData.billing_pin_code || apiData.BillingPincode || '',
        state: apiData.billing_state || apiData.BillingState || ''
      },
      
      shippingAddress: {
        addressLine1: apiData.shipping_address_line1 || apiData.ShippingAddress || apiData.billing_address_line1 || apiData.BillingAddress || '',
        addressLine2: apiData.shipping_address_line2 || apiData.billing_address_line2 || '',
        city: apiData.shipping_city || apiData.ShippingCity || apiData.billing_city || apiData.BillingCity || '',
        pincode: apiData.shipping_pin_code || apiData.ShippingPincode || apiData.billing_pin_code || apiData.BillingPincode || '',
        state: apiData.shipping_state || apiData.ShippingState || apiData.billing_state || apiData.BillingState || ''
      },
      
      items: items,
      note: apiData.Notes || "Thank you for your business!",
      taxableAmount: parseFloat(apiData.BasicAmount) || 0,
      totalGST: parseFloat(apiData.TaxAmount) || 0,
      grandTotal: parseFloat(apiData.TotalAmount) || 0,
      totalCess: "0.00",
      transportDetails: apiData.Freight && apiData.Freight !== "0.00" ? `Freight: ₹${apiData.Freight}` : "Standard delivery",
      additionalCharge: "",
      additionalChargeAmount: "0.00",
      taxType: parseFloat(apiData.IGSTAmount) > 0 ? "IGST" : "CGST/SGST"
    };
  };

  const fetchNextInvoiceNumber = async () => {
    try {
      console.log('Fetching next invoice number...');
      const response = await fetch(`${baseurl}/next-invoice-number`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received next invoice number:', data.nextInvoiceNumber);
        setNextInvoiceNumber(data.nextInvoiceNumber);
        
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: data.nextInvoiceNumber
        }));
        
        setHasFetchedInvoiceNumber(true);
        
        const currentDraft = localStorage.getItem('draftInvoice');
        if (currentDraft) {
          const draftData = JSON.parse(currentDraft);
          draftData.invoiceNumber = data.nextInvoiceNumber;
          localStorage.setItem('draftInvoice', JSON.stringify(draftData));
        }
      } else {
        console.error('Failed to fetch next invoice number');
        generateFallbackInvoiceNumber();
      }
    } catch (err) {
      console.error('Error fetching next invoice number:', err);
      generateFallbackInvoiceNumber();
    }
  };

  const generateFallbackInvoiceNumber = async () => {
    try {
      const response = await fetch(`${baseurl}/last-invoice`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastInvoiceNumber) {
          const lastNumber = data.lastInvoiceNumber;
          const numberMatch = lastNumber.match(/INV(\d+)/);
          if (numberMatch) {
            const nextNum = parseInt(numberMatch[1]) + 1;
            const fallbackInvoiceNumber = `INV${nextNum.toString().padStart(3, '0')}`;
            setNextInvoiceNumber(fallbackInvoiceNumber);
            setInvoiceData(prev => ({
              ...prev,
              invoiceNumber: fallbackInvoiceNumber
            }));
            setHasFetchedInvoiceNumber(true);
            return;
          }
        }
      }
      
      const currentDraft = localStorage.getItem('draftInvoice');
      if (currentDraft) {
        const draftData = JSON.parse(currentDraft);
        if (draftData.invoiceNumber && draftData.invoiceNumber !== 'INV001') {
          setNextInvoiceNumber(draftData.invoiceNumber);
          setHasFetchedInvoiceNumber(true);
          return;
        }
      }
      
      setNextInvoiceNumber('INV001');
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: 'INV001'
      }));
      setHasFetchedInvoiceNumber(true);
      
    } catch (err) {
      console.error('Error in fallback invoice number generation:', err);
      setNextInvoiceNumber('INV001');
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: 'INV001'
      }));
      setHasFetchedInvoiceNumber(true);
    }
  };

  const isSameState = () => {
    const companyState = invoiceData.companyInfo.state;
    const supplierState = invoiceData.supplierInfo.state;
    
    if (!companyState || !supplierState) {
      return true;
    }
    
    return companyState.toLowerCase() === supplierState.toLowerCase();
  };

  useEffect(() => {
    if (hasFetchedInvoiceNumber) {
      localStorage.setItem('draftInvoice', JSON.stringify(invoiceData));
    }
  }, [invoiceData, hasFetchedInvoiceNumber]);

  useEffect(() => {
    const taxType = isSameState() ? "CGST/SGST" : "IGST";
    setInvoiceData(prev => ({
      ...prev,
      taxType: taxType
    }));
    
    if (invoiceData.items.length > 0) {
      recalculateAllItems();
    }
  }, [invoiceData.supplierInfo.state, invoiceData.companyInfo.state]);

  const handlePreview = () => {
    if (!isPreviewReady) {
      setError("Please submit the invoice first to generate preview");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const previewData = {
      ...invoiceData,
      invoiceNumber: invoiceData.invoiceNumber || nextInvoiceNumber
    };
    
    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    
    if (isEditMode && editingVoucherId) {
      navigate(`/sales/invoice-preview/${editingVoucherId}`);
    } else {
      navigate("/sales/invoice-preview");
    }
  };

  const handleSearch = () => {
    if (inputName.trim().toLowerCase() === "dummy") {
      setSelected(true);
      setInvoiceData(prev => ({
        ...prev,
        supplierInfo: {
          name: "Vamshi",
          businessName: "business name",
          state: "Telangana",
          gstin: "29AABCD0503B1ZG"
        },
        billingAddress: {
          addressLine1: "5-300001, Jyoti Nagar, chandrampet, Rajanna sircilla",
          addressLine2: "Address Line2",
          city: "Hyderabad-501505",
          pincode: "501505",
          state: "Telangana"
        },
        shippingAddress: {
          addressLine1: "5-300001, Jyoti Nagar, chandrampet, Rajanna sircilla",
          addressLine2: "Address Line2",
          city: "Hyderabad-501505",
          pincode: "501505",
          state: "Telangana"
        }
      }));
    } else {
      setSelected(false);
      setError("Supplier not found");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${baseurl}/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${baseurl}/accounts`);
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  // ==================== FIXED: INDIVIDUAL PRODUCT CALCULATION ====================

  const calculateItemTotal = () => {
    const quantity = parseFloat(itemForm.quantity) || 0;
    const price = parseFloat(itemForm.price) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    const gst = parseFloat(itemForm.gst) || 0;
    const cess = parseFloat(itemForm.cess) || 0;
    
    // Calculate for individual product
    const subtotal = quantity * price;
    const discountAmount = subtotal * (discount / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const gstAmount = amountAfterDiscount * (gst / 100);
    const cessAmount = amountAfterDiscount * (cess / 100);
    const total = amountAfterDiscount + gstAmount + cessAmount;
    
    const sameState = isSameState();
    let cgst, sgst, igst;
    
    if (sameState) {
      cgst = gst / 2;
      sgst = gst / 2;
      igst = 0;
    } else {
      cgst = 0;
      sgst = 0;
      igst = gst;
    }
    
    return {
      ...itemForm,
      total: total.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      cess: cess,
      batchDetails: selectedBatchDetails,
      // Add detailed breakdown
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxableAmount: amountAfterDiscount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      cessAmount: cessAmount.toFixed(2)
    };
  };

  const recalculateAllItems = () => {
    const sameState = isSameState();
    const updatedItems = invoiceData.items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const gst = parseFloat(item.gst) || 0;
      const cess = parseFloat(item.cess) || 0;
      
      // Calculate for each individual item
      const subtotal = quantity * price;
      const discountAmount = subtotal * (discount / 100);
      const amountAfterDiscount = subtotal - discountAmount;
      const gstAmount = amountAfterDiscount * (gst / 100);
      const cessAmount = amountAfterDiscount * (cess / 100);
      const total = amountAfterDiscount + gstAmount + cessAmount;
      
      let cgst, sgst, igst;
      
      if (sameState) {
        cgst = gst / 2;
        sgst = gst / 2;
        igst = 0;
      } else {
        cgst = 0;
        sgst = 0;
        igst = gst;
      }
      
      return {
        ...item,
        total: total.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        // Update detailed breakdown
        subtotal: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        taxableAmount: amountAfterDiscount.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        cessAmount: cessAmount.toFixed(2)
      };
    });
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    if (!itemForm.product) {
      setError("Please select a product");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const calculatedItem = {
      ...calculateItemTotal(),
      batch: selectedBatch,
      batch_id: itemForm.batch_id,
      product_id: itemForm.product_id,
      batchDetails: selectedBatchDetails
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, calculatedItem]
    }));

    // Reset form including IDs and discount info
    setItemForm({
      product: "",
      product_id: "",
      description: "",
      quantity: 1,
      price: 0,
      discount: 0,
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      total: 0,
      batch: "",
      batch_id: "",
      batchDetails: null
    });
    setBatches([]);
    setSelectedBatch("");
    setSelectedBatchDetails(null);
    
    // Reset discount info
    setDiscountInfo({
      discount: 0,
      source: 'none',
      breakdown: {
        eligibleDiscount: 0,
        productDiscount: 0,
        categoryDiscount: 0,
        companyDiscount: 0,
        accountDiscount: 0,
        retailerDiscount: 0
      },
      details: {
        productName: '',
        categoryId: null,
        companyId: null,
        accountId: null,
        hasEligibleDiscount: false
      }
    });
  };

  const removeItem = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // ==================== FIXED: CALCULATE TOTALS WITH INDIVIDUAL PRODUCT GST ====================

  const calculateTotals = () => {
    // Calculate taxable amount for each product separately
    const taxableAmount = invoiceData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.taxableAmount) || 0);
    }, 0);
    
    // Calculate GST for each product separately
    const totalGST = invoiceData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.gstAmount) || 0);
    }, 0);
    
    // Calculate Cess for each product separately
    const totalCess = invoiceData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.cessAmount) || 0);
    }, 0);
    
    const additionalChargeAmount = parseFloat(invoiceData.additionalChargeAmount) || 0;
    const grandTotal = taxableAmount + totalGST + totalCess + additionalChargeAmount;
    
    setInvoiceData(prev => ({
      ...prev,
      taxableAmount: taxableAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      totalCess: totalCess.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.items, invoiceData.additionalChargeAmount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearDraft = () => {
    localStorage.removeItem('draftInvoice');
    
    const resetData = {
      invoiceNumber: nextInvoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyInfo: {
        name: "J P MORGAN SERVICES INDIA PRIVATE LIMITED",
        address: "Prestige, Technology Park, Sarjapur Outer Ring Road",
        email: "sumukhusr7@gmail.com",
        phone: "3456549876543",
        gstin: "29AABCD0503B1ZG",
        state: "Karnataka"
      },
      supplierInfo: {
        name: "",
        businessName: "",
        state: "",
        gstin: ""
      },
      billingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      shippingAddress: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: "",
        state: ""
      },
      items: [],
      note: "",
      taxableAmount: 0,
      totalGST: 0,
      totalCess: 0,
      grandTotal: 0,
      transportDetails: "",
      additionalCharge: "",
      additionalChargeAmount: 0,
      otherDetails: "Authorized Signatory",
      taxType: "CGST/SGST",
      batchDetails: []
    };
    
    setInvoiceData(resetData);
    localStorage.setItem('draftInvoice', JSON.stringify(resetData));
    
    setSelected(false);
    setSelectedSupplierId(null);
    setIsPreviewReady(false);
    
    // Reset discount info
    setDiscountInfo({
      discount: 0,
      source: 'none',
      breakdown: {
        eligibleDiscount: 0,
        productDiscount: 0,
        categoryDiscount: 0,
        companyDiscount: 0,
        accountDiscount: 0,
        retailerDiscount: 0
      },
      details: {
        productName: '',
        categoryId: null,
        companyId: null,
        accountId: null,
        hasEligibleDiscount: false
      }
    });
    
    setSuccess("Draft cleared successfully!");
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    if (!invoiceData.supplierInfo.name || !selectedSupplierId) {
      setError("Please select a supplier/customer");
      setLoading(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (invoiceData.items.length === 0) {
      setError("Please add at least one item to the invoice");
      setLoading(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const finalInvoiceNumber = invoiceData.invoiceNumber || nextInvoiceNumber;
      console.log('Submitting invoice with number:', finalInvoiceNumber);

      const sameState = isSameState();
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;

      // Calculate GST breakdown from individual items
      invoiceData.items.forEach(item => {
        const gstAmount = parseFloat(item.gstAmount) || 0;
        
        if (sameState) {
          totalCGST += gstAmount / 2;
          totalSGST += gstAmount / 2;
        } else {
          totalIGST += gstAmount;
        }
      });

      const batchDetails = invoiceData.items.map(item => ({
        product: item.product,
        product_id: item.product_id,
        description: item.description,
        batch: item.batch,
        batch_id: item.batch_id,
        quantity: parseFloat(item.quantity) || 0,
        price: parseFloat(item.price) || 0,
        discount: parseFloat(item.discount) || 0,
        gst: parseFloat(item.gst) || 0,
        cgst: parseFloat(item.cgst) || 0,
        sgst: parseFloat(item.sgst) || 0,
        igst: parseFloat(item.igst) || 0,
        cess: parseFloat(item.cess) || 0,
        total: parseFloat(item.total) || 0,
        batchDetails: item.batchDetails,
        // Include detailed breakdown for backend if needed
        subtotal: parseFloat(item.subtotal) || 0,
        discountAmount: parseFloat(item.discountAmount) || 0,
        taxableAmount: parseFloat(item.taxableAmount) || 0,
        gstAmount: parseFloat(item.gstAmount) || 0,
        cessAmount: parseFloat(item.cessAmount) || 0
      }));

      const payload = {
        ...invoiceData,
        invoiceNumber: finalInvoiceNumber,
        selectedSupplierId: selectedSupplierId,
        type: 'sales',
        totalCGST: totalCGST.toFixed(2),
        totalSGST: totalSGST.toFixed(2),
        totalIGST: totalIGST.toFixed(2),
        taxType: sameState ? "CGST/SGST" : "IGST",
        batchDetails: batchDetails,
        product_id: invoiceData.items[0]?.product_id || null,
        batch_id: invoiceData.items[0]?.batch_id || null
      };

      delete payload.companyState;
      delete payload.supplierState;
      delete payload.items;

      console.log('Submitting invoice payload with batchDetails:', payload);

      let response;
      if (isEditMode && editingVoucherId) {
        response = await fetch(`${baseurl}/transactions/${editingVoucherId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${baseurl}/transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit invoice');
      }
      
      localStorage.removeItem('draftInvoice');
      setSuccess(isEditMode ? 'Invoice updated successfully!' : 'Invoice submitted successfully!');
      setIsPreviewReady(true);

      const previewData = {
        ...invoiceData,
        invoiceNumber: responseData.invoiceNumber || finalInvoiceNumber,
        voucherId: responseData.voucherId || editingVoucherId
      };
      localStorage.setItem('previewInvoice', JSON.stringify(previewData));
      
      setTimeout(() => {
        navigate(`/sales/invoice-preview/${responseData.voucherId || editingVoucherId}`);
      }, 2000);
      
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    const price = parseFloat(itemForm.price) || 0;
    const gst = parseFloat(itemForm.gst) || 0;
    const discount = parseFloat(itemForm.discount) || 0;
    const quantity = parseInt(itemForm.quantity) || 0;

    const priceAfterDiscount = price - (price * discount) / 100;
    const priceWithGst = priceAfterDiscount + (priceAfterDiscount * gst) / 100;
    return (priceWithGst * quantity).toFixed(2);
  };

  // ==================== RENDER ====================

  return (
    <div className="admin-layout">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />
      <div className={`admin-main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={window.innerWidth <= 768}
        />
        
        <div className="admin-content-wrapper">
          <Container fluid className="invoice-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="text-primary">
                {isEditMode ? `Edit Invoice - ${invoiceData.invoiceNumber}` : 'Create Invoice'}
              </h3>
              <div>
                <Button 
                  variant="info" 
                  size="sm" 
                  onClick={handlePreview}
                  className="me-2"
                  disabled={!isPreviewReady}
                >
                  <FaEye className="me-1" /> {isPreviewReady ? "View Invoice Preview" : "Submit to Enable Preview"}
                </Button>
                <Button variant="warning" size="sm" onClick={clearDraft}>
                  Clear Draft
                </Button>
              </div>
            </div>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            {/* Tax Type Indicator */}
            {invoiceData.supplierInfo.state && (
              <Alert variant={isSameState() ? "success" : "warning"} className="mb-3">
                <strong>Tax Type: </strong>
                {isSameState() ? (
                  <>CGST & SGST (Same State - {invoiceData.companyInfo.state})</>
                ) : (
                  <>IGST (Inter-State: {invoiceData.companyInfo.state} to {invoiceData.supplierInfo.state})</>
                )}
              </Alert>
            )}
            
            <div className="invoice-box p-3 bg-light rounded">
              <h5 className="section-title text-primary mb-3">
                {isEditMode ? 'Edit Invoice' : 'Create Invoice'}
              </h5>

              {/* Company Info Section */}
              <Row className="mb-3 company-info bg-white p-3 rounded">
                <Col md={8}>
                  <div>
                    <strong className="text-primary">{invoiceData.companyInfo.name}</strong><br />
                    {invoiceData.companyInfo.address}<br />
                    Email: {invoiceData.companyInfo.email}<br />
                    Phone: {invoiceData.companyInfo.phone}<br />
                    GSTIN: {invoiceData.companyInfo.gstin}<br />
                    <strong>State: {invoiceData.companyInfo.state}</strong>
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Control 
                      name="invoiceNumber" 
                      value={invoiceData.invoiceNumber || nextInvoiceNumber} 
                      onChange={handleInputChange}
                      className="border-primary"
                      readOnly={isEditMode}
                    />
                    <Form.Label className="fw-bold">Invoice No</Form.Label>
                    {!hasFetchedInvoiceNumber && !isEditMode && (
                      <small className="text-muted">Loading invoice number...</small>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control 
                      type="date" 
                      name="invoiceDate"
                      value={invoiceData.invoiceDate} 
                      onChange={handleInputChange}
                      className="border-primary"
                    />
                    <Form.Label className="fw-bold">Invoice Date</Form.Label>
                  </Form.Group>
                  <Form.Group>
                    <Form.Control 
                      type="date" 
                      name="validityDate"
                      value={invoiceData.validityDate} 
                      onChange={handleInputChange}
                      className="border-primary"
                    />
                    <Form.Label className="fw-bold">Validity Date</Form.Label>
                  </Form.Group>
                </Col>
              </Row>

              {/* Supplier Info Section */}
              <div className="bg-white rounded border">
                <Row className="mb-0">
                  <Col md={4} className="border-end p-3">
                    {!selected ? (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-primary">Retailer Info</strong>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/retailers/add")}
                          >
                            New
                          </Button>
                        </div>
                        <Form.Select
                          className="mb-2 border-primary"
                          value={inputName}
                          onChange={async (e) => {
                            const selectedName = e.target.value;
                            setInputName(selectedName);
                            const supplier = accounts.find(acc => acc.business_name === selectedName);
                            if (supplier) {
                              setSelectedSupplierId(supplier.id);
                              setSelected(true);
                              setInvoiceData(prev => ({
                                ...prev,
                                supplierInfo: {
                                  name: supplier.display_name,
                                  businessName: supplier.business_name,
                                  state: supplier.billing_state,
                                  gstin: supplier.gstin
                                },
                                billingAddress: {
                                  addressLine1: supplier.billing_address_line1,
                                  addressLine2: supplier.billing_address_line2 || "",
                                  city: supplier.billing_city,
                                  pincode: supplier.billing_pin_code,
                                  state: supplier.billing_state
                                },
                                shippingAddress: {
                                  addressLine1: supplier.shipping_address_line1,
                                  addressLine2: supplier.shipping_address_line2 || "",
                                  city: supplier.shipping_city,
                                  pincode: supplier.shipping_pin_code,
                                  state: supplier.shipping_state
                                }
                              }));

                              // Fetch enhanced discount for current product if one is selected
                              if (itemForm.product_id) {
                                await fetchDynamicDiscount(itemForm.product_id, supplier.id);
                              }
                            }
                          }}
                        >
                          <option value="">Select Retailer</option>
                          {accounts
                            .filter(acc => acc.role === "retailer")
                            .map(acc => (
                              <option key={acc.id} value={acc.business_name}>
                                {acc.business_name} ({acc.mobile_number})
                              </option>
                            ))}
                        </Form.Select>
                      </>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-primary">Supplier Info</strong>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => {
                              if (selectedSupplierId) {
                                navigate(`/retailers/edit/${selectedSupplierId}`);
                              }
                            }}
                          >
                            <FaEdit /> Edit
                          </Button>
                        </div>
                        <div className="bg-light p-2 rounded">
                          <div><strong>Name:</strong> {invoiceData.supplierInfo.name}</div>
                          <div><strong>Business:</strong> {invoiceData.supplierInfo.businessName}</div>
                          <div><strong>GSTIN:</strong> {invoiceData.supplierInfo.gstin}</div>
                          <div><strong>State:</strong> {invoiceData.supplierInfo.state}</div>
                        </div>
                      </>
                    )}
                  </Col>

                  <Col md={4} className="border-end p-3">
                    <strong className="text-primary">Billing Address</strong>
                    <div className="bg-light p-2 rounded mt-1">
                      <div><strong>Address:</strong> {invoiceData.billingAddress?.addressLine1}</div>
                      <div><strong>City:</strong> {invoiceData.billingAddress?.city}</div>
                      <div><strong>Pincode:</strong> {invoiceData.billingAddress?.pincode}</div>
                      <div><strong>State:</strong> {invoiceData.billingAddress?.state}</div>
                    </div>
                  </Col>

                  <Col md={4} className="p-3">
                    <strong className="text-primary">Shipping Address</strong>
                    <div className="bg-light p-2 rounded mt-1">
                      <div><strong>Address:</strong> {invoiceData.shippingAddress?.addressLine1}</div>
                      <div><strong>City:</strong> {invoiceData.shippingAddress?.city}</div>
                      <div><strong>Pincode:</strong> {invoiceData.shippingAddress?.pincode}</div>
                      <div><strong>State:</strong> {invoiceData.shippingAddress?.state}</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Retailer Eligibility Component */}
              {selectedSupplierId && (
                <RetailerEligibility 
                  customerId={selectedSupplierId}
                  customerName={invoiceData.supplierInfo.businessName}
                  onDiscountUpdate={handleRetailerDiscountUpdate}
                  invoiceAmount={parseFloat(invoiceData.grandTotal) || 0}
                />
              )}

              {/* Item Section with Enhanced Dynamic Discount */}
              <div className="item-section mb-3 mt-3 bg-white p-3 rounded">
                <h6 className="text-primary mb-3">Add Items</h6>
                
                {/* Enhanced Discount Information Display */}
                {discountInfo.discount > 0 && (
                  <Alert 
                    variant={discountInfo.source === 'eligible_discount' ? "success" : "info"} 
                    className="p-2 mb-3"
                  >
                    <div className="d-flex align-items-center">
                      <FaInfoCircle className="me-2" />
                      <div>
                        <strong>
                          {discountInfo.source === 'eligible_discount' ? '🎯 ' : ''}
                          Auto-applied Discount: {discountInfo.discount}%
                        </strong>
                        <small className="d-block text-muted">
                          Source: <Badge bg={discountInfo.source === 'eligible_discount' ? "success" : "primary"}>
            {discountInfo.source === 'eligible_discount' ? 'Target Reward' : discountInfo.source}
                          </Badge>
                          {discountInfo.source === 'eligible_discount' && (
                            <span className="ms-2">🎉 Congratulations! You achieved your monthly target!</span>
                          )}
                        </small>
                        {discountInfo.source !== 'eligible_discount' && (
                          <small className="d-block text-muted mt-1">
                            Breakdown: Eligible({discountInfo.breakdown.eligibleDiscount}%) | 
                            Product({discountInfo.breakdown.productDiscount}%) | 
                            Category({discountInfo.breakdown.categoryDiscount}%) | 
                            Company({discountInfo.breakdown.companyDiscount}%) |
                            Retailer({discountInfo.breakdown.retailerDiscount}%)
                          </small>
                        )}
                      </div>
                    </div>
                  </Alert>
                )}

                <Row className="align-items-end">
                  <Col md={2}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="mb-0 fw-bold">Item</Form.Label>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary"
                        style={{ textDecoration: "none", fontSize: "14px" }}
                        onClick={() => navigate("/salesitemspage")}
                      >
                        + New Item
                      </button>
                    </div>
                   
                    <Form.Select
                      name="product"
                      value={itemForm.product}
                      onChange={async (e) => {
                        const selectedName = e.target.value;
                        await handleProductSelection(selectedName);
                      }}
                      className="border-primary"
                    >
                      <option value="">Select Product</option>
                      {products
                        .filter((p) => p.group_by === "Salescatalog")
                        .map((p) => (
                          <option key={p.id} value={p.goods_name}>
                            {p.goods_name}
                          </option>
                        ))}
                    </Form.Select>

                    <Form.Select
                      className="mt-2 border-primary"
                      name="batch"
                      value={selectedBatch}
                      onChange={(e) => handleBatchSelection(e.target.value)}
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.batch_number}>
                          {batch.batch_number} (Qty: {batch.quantity} )
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={1}>
                    <Form.Label className="fw-bold">Qty</Form.Label>
                    <Form.Control
                      name="quantity"
                      type="number"
                      value={itemForm.quantity}
                      onChange={handleItemChange}
                      min="1"
                      className="border-primary"
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Label className="fw-bold">Price (₹)</Form.Label>
                    <Form.Control
                      name="price"
                      type="number"
                      value={itemForm.price}
                      readOnly
                      className="border-primary bg-light"
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Label className="fw-bold">Discount (%)</Form.Label>
                    <Form.Control
                      name="discount"
                      type="number"
                      value={itemForm.discount}
                      onChange={handleItemChange}
                      min="0"
                      max="100"
                      className="border-primary"
                      title="Auto-calculated discount. You can manually override if needed."
                    />
                    {discountInfo.discount > 0 && (
                      <small className="text-muted">
                        Auto-applied: {discountInfo.discount}%
                        {discountInfo.source === 'eligible_discount' && ' (Target Reward)'}
                      </small>
                    )}
                  </Col>

                  <Col md={2}>
                    <Form.Label className="fw-bold">GST (%)</Form.Label>
                    <Form.Control
                      name="gst"
                      type="number"
                      value={itemForm.gst}
                      readOnly
                      className="border-primary bg-light"
                    />
                  </Col>

                  <Col md={2}>
                    <Form.Label className="fw-bold">Total Price (₹)</Form.Label>
                    <Form.Control
                      type="text"
                      value={calculateTotalPrice()}
                      readOnly
                      className="border-primary bg-light"
                    />
                  </Col>
                  <Col md={1}>
                    <Button variant="success" onClick={addItem} className="w-100">
                      Add
                    </Button>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col>
                    <Form.Control
                      name="description"
                      value={itemForm.description}
                      onChange={handleItemChange}
                      placeholder="Product description"
                      readOnly
                      className="border-primary bg-light"
                    />
                  </Col>
                </Row>
              </div>

              {/* Items Table with Detailed Breakdown */}
              <div className="bg-white p-3 rounded">
                {invoiceData.items.length > 0 && (
                  <>
                    <h6 className="text-primary mt-4 mb-3">Items Summary</h6>
                    <Table bordered responsive size="sm" className="mb-3">
                      <thead className="table-dark">
                        <tr>
                          <th>PRODUCT</th>
                          <th>QTY</th>
                          <th>PRICE</th>
                          <th>DISCOUNT</th>
                          <th>TAXABLE AMT</th>
                          <th>GST AMT</th>
                          <th>TOTAL</th>
                          <th>BATCH</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div>
                                <strong>{item.product}</strong>
                                <br />
                                <small className="text-muted">{item.description}</small>
                              </div>
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">₹{item.price}</td>
                            <td className="text-center">
                              {item.discount}%<br />
                              <small className="text-danger">(-₹{item.discountAmount})</small>
                            </td>
                            <td className="text-end text-success">
                              <strong>₹{item.taxableAmount}</strong>
                            </td>
                            <td className="text-end text-primary">
                              <strong>₹{item.gstAmount}</strong>
                              <br />
                              <small>
                                {item.cgst > 0 && `CGST: ${item.cgst}%`}
                                {item.sgst > 0 && ` SGST: ${item.sgst}%`}
                                {item.igst > 0 && ` IGST: ${item.igst}%`}
                              </small>
                            </td>
                            <td className="text-end fw-bold">₹{item.total}</td>
                            <td>{item.batch}</td>
                            <td className="text-center">
                              <Button variant="danger" size="sm" onClick={() => removeItem(index)}>
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}

                {invoiceData.items.length === 0 && (
                  <div className="text-center text-muted py-4">
                    <FaInfoCircle size={48} className="mb-2" />
                    <p>No items added. Please add items using the form above.</p>
                  </div>
                )}
              </div>

              {/* Totals and Notes Section */}
              <Row className="mb-3 p-3 bg-white rounded border">
                <Col md={7}>
                  <Form.Group controlId="invoiceNote">
                    <Form.Label className="fw-bold text-primary">Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="note"
                      value={invoiceData.note}
                      onChange={handleInputChange}
                      placeholder="Enter your note here..."
                      className="border-primary"
                    />
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <h6 className="text-primary mb-3">Amount Summary</h6>
                  <Card className="border-primary">
                    <Card.Body>
                      <Row>
                        <Col md={6} className="d-flex flex-column align-items-start">
                          <div className="mb-2 fw-bold">Taxable Amount</div>
                          <div className="mb-2 fw-bold">Total GST</div>
                          <div className="mb-2 fw-bold">Total Cess</div>
                          <div className="mb-2 fw-bold">Additional Charges</div>
                          <div className="mb-2 fw-bold text-success">Grand Total</div>
                        </Col>

                        <Col md={6} className="d-flex flex-column align-items-end">
                          <div className="mb-2">₹{invoiceData.taxableAmount}</div>
                          <div className="mb-2">₹{invoiceData.totalGST}</div>
                          <div className="mb-2">₹{invoiceData.totalCess}</div>

                          <Form.Select
                            className="mb-2 border-primary"
                            style={{ width: "100%" }}
                            value={invoiceData.additionalCharge || ""}
                            onChange={(e) => {
                              handleInputChange(e);
                              setInvoiceData(prev => ({
                                ...prev,
                                additionalChargeAmount: e.target.value ? 100 : 0
                              }));
                            }}
                            name="additionalCharge"
                          >
                            <option value="">Select Additional Charges</option>
                            <option value="Packing">Packing Charges</option>
                            <option value="Transport">Transport Charges</option>
                            <option value="Service">Service Charges</option>
                          </Form.Select>

                          <div className="fw-bold text-success fs-5">₹{invoiceData.grandTotal}</div>
                        </Col>
                      </Row>
                      
                      {/* Breakdown Summary */}
                      <hr />
                      <div className="mt-2">
                        <small className="text-muted">
                          <strong>Breakdown:</strong> {invoiceData.items.length} item(s) | 
                          Taxable: ₹{invoiceData.taxableAmount} | 
                          GST: ₹{invoiceData.totalGST} | 
                          Total: ₹{invoiceData.grandTotal}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Footer Section */}
              <Row className="mb-3 bg-white p-3 rounded">
                <Col md={6}>
                  <h6 className="text-primary">Transportation Details</h6>
                  <Form.Control 
                    as="textarea" 
                    placeholder="Enter transportation details..." 
                    rows={2} 
                    name="transportDetails"
                    value={invoiceData.transportDetails}
                    onChange={handleInputChange}
                    className="border-primary"
                  />
                </Col>
                <Col md={6}>
                  <h6 className="text-primary">Other Details</h6>
                  <div className="bg-light p-2 rounded">
                    <p className="mb-1">For</p>
                    <p className="mb-1 fw-bold">{invoiceData.companyInfo.name}</p>
                    <p className="mb-0 text-muted">{invoiceData.otherDetails}</p>
                  </div>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="text-center bg-white p-3 rounded">
                <Button 
                  variant="primary" 
                  className="me-3 px-4"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Invoice' : 'Submit Invoice')}
                </Button>
                <Button 
                  variant="info" 
                  className="me-3 px-4"
                  onClick={handlePreview}
                  disabled={!isPreviewReady}
                >
                  {isPreviewReady ? 'View Invoice Preview' : 'Submit to Enable Preview'}
                </Button>
                <Button variant="danger" onClick={() => navigate("/sales/invoices")}>
                  Cancel
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;