// frontend/src/components/Sales/Receipts/ReceiptsTable.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ReusableTable from "../../../Layouts/TableLayout/DataTable";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./Receipts.css";
import Select from "react-select";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReceiptsPDF from "./ReceiptsPDF";
import { useRef } from "react";

const ReceiptsTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [receiptData, setReceiptData] = useState([]);
  const [nextReceiptNumber, setNextReceiptNumber] = useState("REC001");
  const [hasFetchedReceiptNumber, setHasFetchedReceiptNumber] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState("July");
  const [year, setYear] = useState("2026");
  const [startDate, setStartDate] = useState("2025-06-08");
  const [endDate, setEndDate] = useState("2025-07-08");
  const [activeTab, setActiveTab] = useState("Receipts");
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [invoiceBalance, setInvoiceBalance] = useState(0);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRangeDownloading, setIsRangeDownloading] = useState(false);
  const pdfRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  
  // New state variables for advance receipts modes
  const [isAdvanceOnly, setIsAdvanceOnly] = useState(false);
  const [isBothMode, setIsBothMode] = useState(false);
  const [advanceReceipts, setAdvanceReceipts] = useState([]);
  const [loadingAdvanceReceipts, setLoadingAdvanceReceipts] = useState(false);
  const [selectedAdvanceReceipts, setSelectedAdvanceReceipts] = useState([]);
  const [totalAdvanceAmount, setTotalAdvanceAmount] = useState(0);
  const [showAdvanceReceiptsModal, setShowAdvanceReceiptsModal] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    gstin: "",
    state: "",
    stateCode: "",
    location: "",
  });

  const [invoices, setInvoices] = useState([]);
  const yearOptions = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => {
    const y = 2025 + i;
    return { value: y, label: y };
  });

  const [formData, setFormData] = useState({
    receiptNumber: "REC001",
    retailerId: "",
    retailerName: "",
    amount: "",
    currency: "INR",
    paymentMethod: "Cash",
    receiptDate: new Date().toISOString().split("T")[0],
    note: "",
    bankName: "",
    transactionDate: "",
    reconciliationOption: "Do Not Reconcile",
    retailerMobile: "",
    retailerEmail: "",
    retailerGstin: "",
    transactionProofFile: "",
    invoiceNumber: "",
    account_name: "",
    business_name: "",
  });

  // Fetch advance receipts for a customer
  const fetchAdvanceReceipts = async (customerId) => {
    try {
      setLoadingAdvanceReceipts(true);
      console.log("📌 Fetching advance receipts for customerId:", customerId);

      if (!customerId) {
        console.log("No customer ID found");
        setAdvanceReceipts([]);
        return;
      }

      const response = await fetch(
        `${baseurl}/api/receipts/advance/${customerId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Advance receipts API response:", data);

        let receipts = [];

        if (data.success && Array.isArray(data.receipts)) {
          receipts = data.receipts;
        } else if (Array.isArray(data)) {
          receipts = data;
        } else if (data.receipts && Array.isArray(data.receipts)) {
          receipts = data.receipts;
        } else if (data.data && Array.isArray(data.data)) {
          receipts = data.data;
        }

        receipts.forEach((r) => {
          console.log(
            `📌 Receipt ${r.receipt_number}: total_amount=${r.total_amount}, available_amount=${r.available_amount}`
          );
        });

        setAdvanceReceipts(receipts);
        console.log("Set advance receipts count:", receipts.length);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch advance receipts:", errorText);
        setAdvanceReceipts([]);
      }
    } catch (error) {
      console.error("Error fetching advance receipts:", error);
      setAdvanceReceipts([]);
    } finally {
      setLoadingAdvanceReceipts(false);
    }
  };

  // Handle advance receipt selection/deselection
  const handleAdvanceReceiptSelection = (receipt, isChecked) => {
    let updatedSelection = [...selectedAdvanceReceipts];

    if (isChecked) {
      updatedSelection.push(receipt);
    } else {
      updatedSelection = updatedSelection.filter((r) => r.id !== receipt.id);
    }

    setSelectedAdvanceReceipts(updatedSelection);

    const total = updatedSelection.reduce((sum, r) => {
      const amount = r.available_amount || r.total_amount || 0;
      return sum + parseFloat(amount);
    }, 0);

    setTotalAdvanceAmount(total);

    // Update the amount field when advance receipts are selected
    let remainingAmount = invoiceBalance - total;
    if (remainingAmount < 0) remainingAmount = 0;

    setFormData((prev) => ({
      ...prev,
      amount: remainingAmount.toFixed(2),
    }));
  };

  // Clear all advance receipts
  const handleClearAllAdvanceReceipts = () => {
    setSelectedAdvanceReceipts([]);
    setTotalAdvanceAmount(0);
    setFormData((prev) => ({
      ...prev,
      amount: invoiceBalance.toFixed(2),
    }));
  };

  const fetchInvoices = async () => {
    try {
      console.log("Fetching invoices from:", `${baseurl}/api/vouchersnumber`);
      const response = await fetch(`${baseurl}/api/vouchersnumber?type=Sales`);

      if (response.ok) {
        const data = await response.json();
        console.log("data:", data);
        setInvoices(data);
      } else {
        console.error("Failed to fetch invoices. Status:", response.status);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const res = await fetch(`${baseurl}/api/company-info`);

      const text = await res.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("Company API returned non-JSON:", text);
        throw new Error("Company info API did not return JSON");
      }

      if (!res.ok) {
        throw new Error(result.error || "Failed to fetch company info");
      }

      if (result.success && result.data) {
        setCompanyInfo({
          name: result.data.company_name || "",
          address: result.data.address || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          gstin: result.data.gstin || "",
          state: result.data.state || "",
          stateCode: result.data.state_code || "",
          location: result.data.location || "",
        });
      }
    } catch (error) {
      console.error("Company info fetch error:", error);
    }
  };

  const fetchInvoiceBalance = async (retailerId, invoiceNumber) => {
    if (!retailerId || !invoiceNumber) {
      setInvoiceBalance(0);
      setFormData((prev) => ({
        ...prev,
        amount: "",
      }));
      return;
    }

    try {
      setIsFetchingBalance(true);
      console.log(
        `Fetching balance for retailer ${retailerId}, invoice ${invoiceNumber}`
      );

      const selectedRetailer = accounts.find((acc) => acc.id == retailerId);
      if (!selectedRetailer) {
        console.error("Retailer not found");
        setInvoiceBalance(0);
        setFormData((prev) => ({ ...prev, amount: "" }));
        setIsFetchingBalance(false);
        return;
      }

      try {
        const response = await fetch(
          `${baseurl}/api/receipts?retailer_id=${retailerId}&invoice_number=${invoiceNumber}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Received receipt data for balance check:", data);

          let balanceAmount = 0;

          if (Array.isArray(data)) {
            const relevantReceipts = data.filter((receipt) => {
              const receiptRetailerId =
                receipt.PartyID || receipt.AccountID || receipt.retailer?.id;
              const receiptInvoiceNumber =
                receipt.invoice_number || receipt.InvoiceNumber;

              return (
                receiptRetailerId == retailerId &&
                receiptInvoiceNumber === invoiceNumber
              );
            });

            if (relevantReceipts.length > 0) {
              const latestReceipt = relevantReceipts.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
              )[0];

              balanceAmount = parseFloat(
                latestReceipt.total_balance_amount ||
                  latestReceipt.balance_amount ||
                  0
              );
              console.log(
                "Found balance from receipts array for retailer",
                retailerId,
                "invoice",
                invoiceNumber,
                ":",
                balanceAmount
              );
            }
          } else if (data.total_balance_amount || data.balance_amount) {
            balanceAmount = parseFloat(
              data.total_balance_amount || data.balance_amount || 0
            );
            console.log("Found balance from single receipt:", balanceAmount);
          } else if (data.data) {
            const receiptData = data.data;
            if (Array.isArray(receiptData)) {
              const relevantReceipt = receiptData.find((receipt) => {
                const receiptRetailerId =
                  receipt.PartyID || receipt.AccountID || receipt.retailer?.id;
                return (
                  receiptRetailerId == retailerId &&
                  receipt.invoice_number === invoiceNumber
                );
              });
              if (relevantReceipt) {
                balanceAmount = parseFloat(
                  relevantReceipt.total_balance_amount ||
                    relevantReceipt.balance_amount ||
                    0
                );
              }
            }
          }

          if (balanceAmount > 0) {
            setInvoiceBalance(balanceAmount);
            setFormData((prev) => ({
              ...prev,
              amount: balanceAmount.toString(),
            }));
            setIsFetchingBalance(false);
            return;
          }
        }
      } catch (apiError) {
        console.error("API error fetching receipt balance:", apiError);
      }

      // Check in existing receipt data
      const existingReceipt = receiptData.find((receipt) => {
        const receiptRetailerId =
          receipt.PartyID || receipt.AccountID || receipt.retailer?.id;
        const receiptInvoiceNumber =
          receipt.invoice_number || receipt.InvoiceNumber;

        return (
          receiptRetailerId == retailerId &&
          receiptInvoiceNumber === invoiceNumber
        );
      });

      if (existingReceipt?.total_balance_amount) {
        console.log(
          "Found balance in existing data for retailer",
          retailerId,
          "invoice",
          invoiceNumber,
          ":",
          existingReceipt.total_balance_amount
        );
        const balance = parseFloat(existingReceipt.total_balance_amount);
        setInvoiceBalance(balance);
        setFormData((prev) => ({
          ...prev,
          amount: balance.toString(),
        }));
        setIsFetchingBalance(false);
        return;
      }

      // Check invoices data
      console.warn("No balance found from receipts API, checking invoices data");
      const selectedInvoiceData = invoices.find(
        (inv) => inv.InvoiceNumber === invoiceNumber
      );

      if (selectedInvoiceData) {
        const invoiceRetailerId =
          selectedInvoiceData.PartyID || selectedInvoiceData.AccountID;

        if (invoiceRetailerId != retailerId) {
          console.log(
            "Invoice does not belong to selected retailer. Invoice retailer ID:",
            invoiceRetailerId,
            "Selected retailer ID:",
            retailerId
          );
          setInvoiceBalance(0);
          setFormData((prev) => ({
            ...prev,
            amount: "",
          }));
          alert("This invoice does not belong to the selected retailer.");
          setIsFetchingBalance(false);
          return;
        }

        const invoiceAmount = parseFloat(
          selectedInvoiceData.TotalAmount ||
            selectedInvoiceData.total_amount ||
            selectedInvoiceData.amount ||
            0
        );

        const receiptsForInvoice = receiptData.filter((receipt) => {
          const receiptRetailerId =
            receipt.PartyID || receipt.AccountID || receipt.retailer?.id;
          const receiptInvoiceNumber =
            receipt.invoice_number || receipt.InvoiceNumber;

          return (
            receiptRetailerId == retailerId &&
            receiptInvoiceNumber === invoiceNumber
          );
        });

        const totalPaid = receiptsForInvoice.reduce((sum, receipt) => {
          return sum + parseFloat(receipt.paid_amount || receipt.amount || 0);
        }, 0);

        const balance = invoiceAmount - totalPaid;

        console.log(
          `Invoice amount: ${invoiceAmount}, Total paid: ${totalPaid}, Balance: ${balance}`
        );

        if (balance > 0) {
          setInvoiceBalance(balance);
          setFormData((prev) => ({
            ...prev,
            amount: balance.toString(),
          }));
        } else {
          setInvoiceBalance(0);
          setFormData((prev) => ({
            ...prev,
            amount: "",
          }));
          if (balance === 0) {
            alert("This invoice is already fully paid.");
          } else {
            alert("Invoice has been overpaid. Please check the invoice details.");
          }
        }
      } else {
        console.warn("Invoice not found in invoices data for retailer:", retailerId);
        setInvoiceBalance(0);
        setFormData((prev) => ({
          ...prev,
          amount: "",
        }));
        alert("Invoice not found for the selected retailer.");
      }
    } catch (err) {
      console.error("Error fetching invoice balance:", err);
      setInvoiceBalance(0);
      setFormData((prev) => ({
        ...prev,
        amount: "",
      }));
      alert(
        "Error fetching invoice balance. Please try again or enter amount manually."
      );
    } finally {
      setIsFetchingBalance(false);
    }
  };

  useEffect(() => {
    if (formData.retailerId && formData.invoiceNumber) {
      const timer = setTimeout(() => {
        fetchInvoiceBalance(formData.retailerId, formData.invoiceNumber);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [formData.retailerId, formData.invoiceNumber]);

  // File change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid file type (PDF, JPG, PNG, DOC, DOCX)");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        transactionProofFile: file,
      }));
    }
  };

  // Filter receipts by date range
  const filterReceiptsByDateRange = (receipts, start, end) => {
    if (!start || !end) return receipts;

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    return receipts.filter((receipt) => {
      const receiptDate = new Date(
        receipt.Date || receipt.receipt_date || receipt.created
      );
      return receiptDate >= startDate && receiptDate <= endDate;
    });
  };

  // Filter receipts by month and year
  const filterReceiptsByMonthYear = (receipts, month, year) => {
    if (!month || !year) return receipts;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = monthNames.indexOf(month);

    return receipts.filter((receipt) => {
      const receiptDate = new Date(
        receipt.Date || receipt.receipt_date || receipt.created
      );
      return (
        receiptDate.getMonth() === monthIndex &&
        receiptDate.getFullYear() === parseInt(year)
      );
    });
  };

  // Generate PDF from the ReceiptsPDF component
  const generatePDF = async (filteredData, type = "month") => {
    if (!filteredData || filteredData.length === 0) {
      alert("No receipts found for the selected period");
      return;
    }

    try {
      const element = document.createElement("div");
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.top = "-9999px";
      document.body.appendChild(element);

      const ReactDOM = require("react-dom");
      await new Promise((resolve) => {
        ReactDOM.render(
          <ReceiptsPDF
            ref={pdfRef}
            receipts={filteredData}
            startDate={type === "range" ? startDate : null}
            endDate={type === "range" ? endDate : null}
            month={type === "month" ? month : null}
            year={type === "month" ? year : null}
            title="Receipts Report"
          />,
          element,
          resolve
        );
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);

      let filename = "receipts_report";
      if (type === "range") {
        filename = `receipts_${startDate}_to_${endDate}.pdf`;
      } else {
        filename = `receipts_${month}_${year}.pdf`;
      }

      pdf.save(filename);

      ReactDOM.unmountComponentAtNode(element);
      document.body.removeChild(element);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // File remove handler
  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      transactionProofFile: null,
    }));
  };

  const receiptStats = [
    {
      label: "Total Receipts",
      value: "₹ 2,50,000",
      change: "+18%",
      type: "total",
    },
    {
      label: "Cash Receipts",
      value: "₹ 1,50,000",
      change: "+15%",
      type: "cash",
    },
    { label: "Bank Receipts", value: "₹ 80,000", change: "+20%", type: "bank" },
    {
      label: "Digital Receipts",
      value: "₹ 20,000",
      change: "+25%",
      type: "digital",
    },
  ];

  const columns = [
    {
      key: "payee",
      title: "Retailer Name",
      style: { textAlign: "left" },
      render: (value, row) => {
        return row?.PartyName || "N/A";
      },
    },
    {
      key: "VchNo",
      title: "RECEIPT NUMBER",
      style: { textAlign: "center" },
      render: (value, row) => (
        <button
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => handleViewReceipt(row.VoucherID)}
          title="Click to view receipt"
        >
          {value || "N/A"}
        </button>
      ),
    },
    {
      key: "paid_amount",
      title: "AMOUNT",
      style: { textAlign: "center" },
      render: (value) => value || "₹ 0.00",
    },
    {
      key: "payment_method",
      title: "PAYMENT METHOD",
      style: { textAlign: "center" },
      render: (value) => value || "Cash",
    },
    {
      key: "InvoiceNumber",
      title: "Accounting",
      style: { textAlign: "center" },
      render: (value) => value || "0",
    },
    {
      key: "Date",
      title: "DATE",
      style: { textAlign: "center" },
      render: (value) => {
        if (!value) return "N/A";

        const dateObj = new Date(value);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();

        return `${day}-${month}-${year}`;
      },
    },
  ];

  const tabs = [
    { name: "Invoices", path: "/sales/invoices" },
    { name: "Receipts", path: "/sales/receipts" },
    { name: "CreditNote", path: "/sales/credit_note" },
  ];

  const fetchNextReceiptNumber = async () => {
    try {
      console.log(
        "Fetching next receipt number from:",
        `${baseurl}/api/next-receipt-number`
      );
      const response = await fetch(`${baseurl}/api/next-receipt-number`);
      if (response.ok) {
        const data = await response.json();
        console.log("Received next receipt number:", data.nextReceiptNumber);
        setNextReceiptNumber(data.nextReceiptNumber);
        setFormData((prev) => ({
          ...prev,
          receiptNumber: data.nextReceiptNumber,
        }));
        setHasFetchedReceiptNumber(true);
      } else {
        console.error(
          "Failed to fetch next receipt number. Status:",
          response.status
        );
        await generateFallbackReceiptNumber();
      }
    } catch (err) {
      console.error("Error fetching next receipt number:", err);
      await generateFallbackReceiptNumber();
    }
  };

  const generateFallbackReceiptNumber = async () => {
    try {
      console.log("Attempting fallback receipt number generation...");
      const response = await fetch(`${baseurl}/api/last-receipt`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastReceiptNumber) {
          const lastNumber = data.lastReceiptNumber;
          const numberMatch = lastNumber.match(/REC(\d+)/);
          if (numberMatch) {
            const nextNum = parseInt(numberMatch[1], 10) + 1;
            const fallbackReceiptNumber = `REC${nextNum.toString().padStart(3, "0")}`;
            console.log("Fallback receipt number generated:", fallbackReceiptNumber);
            setNextReceiptNumber(fallbackReceiptNumber);
            setFormData((prev) => ({
              ...prev,
              receiptNumber: fallbackReceiptNumber,
            }));
            setHasFetchedReceiptNumber(true);
            return;
          }
        }
      }
      setNextReceiptNumber("REC001");
      setFormData((prev) => ({
        ...prev,
        receiptNumber: "REC001",
      }));
      setHasFetchedReceiptNumber(true);
    } catch (err) {
      console.error("Error in fallback receipt number generation:", err);
      setNextReceiptNumber("REC001");
      setFormData((prev) => ({
        ...prev,
        receiptNumber: "REC001",
      }));
      setHasFetchedReceiptNumber(true);
    }
  };

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching receipts from:", `${baseurl}/api/receipts`);

      const response = await fetch(`${baseurl}/api/receipts?data_type=Sales`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch error:", response.status, errorText);
        alert("Failed to load receipts");
        return;
      }

      const data = await response.json();
      console.log("Raw API Data:", data);

      const receiptsArray = Array.isArray(data)
        ? data
        : data.data || data.receipts || [];

      const sortedData = receiptsArray.sort((a, b) => {
        const dateA = new Date(a.receipt_date || a.created_at || a.Date);
        const dateB = new Date(b.receipt_date || b.created_at || b.Date);
        return (
          dateB - dateA ||
          (b.VoucherID || 0) - (a.VoucherID || 0) ||
          (b.id || 0) - (a.id || 0)
        );
      });

      const transformedData = sortedData.map((receipt) => {
        const voucherId = receipt.VoucherID || receipt.receipt_id || "";
        const retailerName = receipt.PartyName || "N/A";
        const amount = parseFloat(receipt.paid_amount || 0);

        return {
          ...receipt,
          id: voucherId,
          VoucherID: voucherId,
          retailerId: receipt.PartyID || receipt.retailer_id || "",
          payee: retailerName,
          VchNo: receipt.VchNo || "",
          amount: `₹ ${amount.toLocaleString("en-IN")}`,
          paid_amount: amount,
          Date: receipt.receipt_date || receipt.Date || receipt.created_at,
          receipt_date: receipt.receipt_date
            ? new Date(receipt.receipt_date).toLocaleDateString("en-IN")
            : "N/A",
          payment_method: receipt.payment_method || receipt.PaymentMethod || "N/A",
          InvoiceNumber: receipt.invoice_number || receipt.InvoiceNumber || receipt.invoice_no || "",
          data_type: receipt.data_type || "Sales",
          total_balance_amount: parseFloat(
            receipt.total_balance_amount || receipt.balance_amount || 0
          ),
          balance_amount: parseFloat(
            receipt.balance_amount || receipt.total_balance_amount || 0
          ),
          invoice_numbers: Array.isArray(receipt.invoice_numbers)
            ? receipt.invoice_numbers
            : receipt.invoice_number
              ? [receipt.invoice_number]
              : [],
        };
      });

      console.log("Final Sales Receipt Data:", transformedData);
      setReceiptData(transformedData);
    } catch (err) {
      console.error("Error fetching receipts:", err);
      alert("Server connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${baseurl}/accounts`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      } else {
        console.error("Failed to fetch accounts:", res.statusText);
        alert("Failed to load accounts. Please try again later.");
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
      alert(
        "Error connecting to server. Please check your network or try again later."
      );
    }
  };

  useEffect(() => {
    console.log("Component mounted, fetching initial data...");
    fetchCompanyInfo();
    fetchAccounts();
    fetchReceipts();
    fetchNextReceiptNumber();
    fetchInvoices();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  const handleCreateClick = async () => {
    console.log("Create button clicked, current receipt number:", nextReceiptNumber);
    if (!hasFetchedReceiptNumber) {
      console.log("Receipt number not fetched yet, fetching now...");
      await fetchNextReceiptNumber();
    }

    setFormData((prev) => ({
      ...prev,
      retailerId: "",
      amount: "",
      invoiceNumber: "",
      note: "",
      bankName: "",
      transactionDate: "",
      transactionProofFile: "",
    }));
    setSelectedInvoice("");
    setInvoiceBalance(0);
    setSelectedAdvanceReceipts([]);
    setTotalAdvanceAmount(0);
    setIsAdvanceOnly(false);
    setIsBothMode(false);

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal");
    setIsModalOpen(false);
    setFormData((prev) => ({
      ...prev,
      retailerId: "",
      amount: "",
      retailerName: "",
      account_name: "",
      business_name: "",
      currency: "INR",
      paymentMethod: "Direct Deposit",
      receiptDate: new Date().toISOString().split("T")[0],
      note: "",
      bankName: "",
      transactionDate: "",
      reconciliationOption: "Do Not Reconcile",
      receiptNumber: nextReceiptNumber,
      invoiceNumber: "",
      transactionProofFile: "",
    }));
    setSelectedInvoice("");
    setInvoiceBalance(0);
    setSelectedAdvanceReceipts([]);
    setTotalAdvanceAmount(0);
    setIsAdvanceOnly(false);
    setIsBothMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRetailerChange = (e) => {
    const selectedRetailerId = e.target.value;
    const selectedRetailer = accounts.find(
      (acc) => acc.id == selectedRetailerId
    );

    setFormData((prev) => ({
      ...prev,
      retailerId: selectedRetailerId,
      retailerMobile: selectedRetailer?.mobile_number || "",
      retailerEmail: selectedRetailer?.email || "",
      retailerGstin: selectedRetailer?.gstin || "",
      retailerName: selectedRetailer?.name || "",
      account_name: selectedRetailer?.account_name || "",
      business_name: selectedRetailer?.businessname_name || selectedRetailer?.business_name,
      amount: "",
    }));

    setInvoiceBalance(0);

    if (formData.invoiceNumber) {
      fetchInvoiceBalance(selectedRetailerId, formData.invoiceNumber);
    }

    // Fetch advance receipts when retailer changes
    if (selectedRetailerId) {
      fetchAdvanceReceipts(selectedRetailerId);
    }
  };

  const handleInvoiceChange = (e) => {
    const selectedInvoiceNumber = e.target.value;

    const selectedInvoice = invoices.find(
      (inv) => inv.InvoiceNumber === selectedInvoiceNumber
    );

    setFormData((prev) => ({
      ...prev,
      invoiceNumber: selectedInvoiceNumber,
      amount: selectedInvoice?.TotalAmount || "",
    }));

    setInvoiceBalance(selectedInvoice ? parseFloat(selectedInvoice.TotalAmount) : 0);
  };

  const handleOpenAdvanceReceiptsModal = () => {
    setShowAdvanceReceiptsModal(true);
  };

  // Updated create receipt with three modes
  const handleCreateReceipt = async () => {
    const receiptAmount = parseFloat(formData.amount);
    
    try {
      setIsLoading(true);

      // MODE 1: ADVANCE ONLY MODE
      if (isAdvanceOnly && !isBothMode) {
        if (selectedAdvanceReceipts.length === 0) {
          alert("Please select advance receipts to adjust");
          return;
        }

        for (const advanceReceipt of selectedAdvanceReceipts) {
          const availableAmount = parseFloat(
            advanceReceipt.available_amount || advanceReceipt.total_amount || 0
          );

          const formDataToSend = new FormData();
          formDataToSend.append("invoice_number", formData.invoiceNumber);
          formDataToSend.append("TransactionType", "Receipt");
          formDataToSend.append("paid_amount", availableAmount.toString());
          formDataToSend.append("paid_date", formData.receiptDate);
          formDataToSend.append("note", advanceReceipt.note || "");

          const updateResponse = await fetch(
            `${baseurl}/api/voucher/${advanceReceipt.id}`,
            {
              method: "PUT",
              body: formDataToSend,
            }
          );

          if (!updateResponse.ok) {
            throw new Error(
              `Failed to update advance receipt ${advanceReceipt.receipt_number}`
            );
          }
        }

        alert(`✅ Advance receipts adjusted: ₹${totalAdvanceAmount.toFixed(2)}`);
        handleCloseModal();
        await fetchReceipts();
        await fetchNextReceiptNumber();
      }
      
      // MODE 2: NORMAL RECEIPT ONLY MODE
      else if (!isAdvanceOnly && !isBothMode) {
        if (!formData.retailerId) {
          alert("Please select a retailer");
          return;
        }

        if (!receiptAmount || receiptAmount <= 0) {
          alert("Please enter a valid amount");
          return;
        }

        if (!formData.receiptDate) {
          alert("Please select a receipt date");
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("receipt_number", formData.receiptNumber);
        formDataToSend.append("retailer_id", formData.retailerId);
        formDataToSend.append("amount", receiptAmount.toString());
        formDataToSend.append("account_name", formData.account_name || "");
        formDataToSend.append("business_name", formData.business_name || "");
        formDataToSend.append("currency", formData.currency);
        formDataToSend.append("payment_method", formData.paymentMethod);
        formDataToSend.append("receipt_date", formData.receiptDate);
        formDataToSend.append("note", formData.note);
        formDataToSend.append("bank_name", formData.bankName);
        formDataToSend.append("transaction_date", formData.transactionDate || "");
        formDataToSend.append("reconciliation_option", formData.reconciliationOption);
        formDataToSend.append("retailer_name", formData.retailerName);
        formDataToSend.append("invoice_number", formData.invoiceNumber);
        formDataToSend.append("data_type", "Sales");
        formDataToSend.append('company_name', companyInfo.name || '');
        formDataToSend.append('company_address', companyInfo.address || '');
        formDataToSend.append('company_email', companyInfo.email || '');
        formDataToSend.append('company_phone', companyInfo.phone || '');
        formDataToSend.append('company_gstin', companyInfo.gstin || '');
        formDataToSend.append('company_state', companyInfo.state || '');
        formDataToSend.append('company_state_code', companyInfo.stateCode || '');

        if (formData.transactionProofFile) {
          formDataToSend.append("transaction_proof", formData.transactionProofFile);
        }

        const response = await fetch(`${baseurl}/api/receipts`, {
          method: "POST",
          body: formDataToSend,
        });

        const responseText = await response.text();

        if (response.ok) {
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error("Failed to parse response as JSON:", parseError);
            throw new Error("Invalid response from server");
          }

          let receiptId = result.VoucherID || result.id;

          alert(`✅ Receipt [${formData.receiptNumber}] created: ₹${receiptAmount.toFixed(2)}`);
          handleCloseModal();
          await fetchReceipts();
          await fetchNextReceiptNumber();

          if (receiptId) {
            setTimeout(() => {
              navigate(`/receipts_view/${receiptId}`);
            }, 2000);
          }
        } else {
          throw new Error(responseText || "Failed to create receipt");
        }
      }
      
      // MODE 3: BOTH MODE
      else if (isBothMode) {
        let newReceiptId = null;

        // Update advance receipts
        if (selectedAdvanceReceipts.length > 0) {
          for (const advanceReceipt of selectedAdvanceReceipts) {
            const availableAmount = parseFloat(
              advanceReceipt.available_amount || advanceReceipt.total_amount || 0
            );

            const formDataToSend = new FormData();
            formDataToSend.append("invoice_number", formData.invoiceNumber);
            formDataToSend.append("TransactionType", "Receipt");
            formDataToSend.append("paid_amount", availableAmount.toString());
            formDataToSend.append("paid_date", formData.receiptDate);
            formDataToSend.append("note", `Advance adjusted against invoice ${formData.invoiceNumber}`);

            const updateResponse = await fetch(
              `${baseurl}/api/voucher/${advanceReceipt.id}`,
              {
                method: "PUT",
                body: formDataToSend,
              }
            );

            if (!updateResponse.ok) {
              throw new Error(
                `Failed to update advance receipt ${advanceReceipt.receipt_number}`
              );
            }
          }
        }

        // Create new receipt
        if (receiptAmount > 0) {
          const formDataToSend = new FormData();
          formDataToSend.append("receipt_number", formData.receiptNumber);
          formDataToSend.append("retailer_id", formData.retailerId);
          formDataToSend.append("amount", receiptAmount.toString());
          formDataToSend.append("account_name", formData.account_name || "");
          formDataToSend.append("business_name", formData.business_name || "");
          formDataToSend.append("currency", formData.currency);
          formDataToSend.append("payment_method", formData.paymentMethod);
          formDataToSend.append("receipt_date", formData.receiptDate);
          formDataToSend.append("note", formData.note || `Payment for invoice ${formData.invoiceNumber}`);
          formDataToSend.append("bank_name", formData.bankName);
          formDataToSend.append("transaction_date", formData.transactionDate || "");
          formDataToSend.append("reconciliation_option", formData.reconciliationOption);
          formDataToSend.append("retailer_name", formData.retailerName);
          formDataToSend.append("invoice_number", formData.invoiceNumber);
          formDataToSend.append("data_type", "Sales");
          formDataToSend.append('company_name', companyInfo.name || '');
          formDataToSend.append('company_address', companyInfo.address || '');
          formDataToSend.append('company_email', companyInfo.email || '');
          formDataToSend.append('company_phone', companyInfo.phone || '');
          formDataToSend.append('company_gstin', companyInfo.gstin || '');
          formDataToSend.append('company_state', companyInfo.state || '');
          formDataToSend.append('company_state_code', companyInfo.stateCode || '');

          if (formData.transactionProofFile) {
            formDataToSend.append("transaction_proof", formData.transactionProofFile);
          }

          const response = await fetch(`${baseurl}/api/receipts`, {
            method: "POST",
            body: formDataToSend,
          });

          const responseText = await response.text();

          if (response.ok) {
            let result;
            try {
              result = JSON.parse(responseText);
            } catch (parseError) {
              console.error("Failed to parse response as JSON:", parseError);
              throw new Error("Invalid response from server");
            }
            newReceiptId = result.VoucherID || result.id;
          } else {
            throw new Error(responseText || "Failed to create receipt");
          }
        }

        let successMsg = "";
        if (selectedAdvanceReceipts.length > 0 && receiptAmount > 0) {
          const advanceReceiptNumbers = selectedAdvanceReceipts
            .map((r) => r.receipt_number)
            .join(", ");
          successMsg = `✅ Success!\n\n1️⃣ Advance receipts [${advanceReceiptNumbers}] adjusted: ₹${totalAdvanceAmount.toFixed(2)}\n2️⃣ New receipt [${formData.receiptNumber}] created: ₹${receiptAmount.toFixed(2)}`;
        } else if (selectedAdvanceReceipts.length > 0) {
          successMsg = `✅ Advance receipts adjusted: ₹${totalAdvanceAmount.toFixed(2)}`;
        } else if (receiptAmount > 0) {
          successMsg = `✅ New receipt [${formData.receiptNumber}] created: ₹${receiptAmount.toFixed(2)}`;
        }
        alert(successMsg);

        handleCloseModal();
        await fetchReceipts();
        await fetchNextReceiptNumber();

        if (newReceiptId) {
          setTimeout(() => {
            navigate(`/receipts_view/${newReceiptId}`);
          }, 2000);
        }
      }

    } catch (err) {
      console.error("❌ Error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReceipt = (receiptId) => {
    console.log("View receipt:", receiptId);
    navigate(`/receipts_view/${receiptId}`);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const filteredReceipts = filterReceiptsByMonthYear(receiptData, month, year);

      if (filteredReceipts.length === 0) {
        alert(`No receipts found for ${month} ${year}`);
        setIsDownloading(false);
        return;
      }

      console.log(`Downloading ${filteredReceipts.length} receipts for:`, month, year);
      await generatePDF(filteredReceipts, "month");
    } catch (err) {
      console.error("Download error:", err);
      alert("Error downloading receipts: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadRange = async () => {
    try {
      if (!startDate || !endDate) {
        alert("Please select both start and end dates");
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after end date");
        return;
      }

      setIsRangeDownloading(true);

      const filteredReceipts = filterReceiptsByDateRange(receiptData, startDate, endDate);

      if (filteredReceipts.length === 0) {
        alert(`No receipts found from ${startDate} to ${endDate}`);
        setIsRangeDownloading(false);
        return;
      }

      console.log(`Downloading ${filteredReceipts.length} receipts for date range:`, startDate, "to", endDate);
      await generatePDF(filteredReceipts, "range");
    } catch (err) {
      console.error("Download range error:", err);
      alert("Error downloading receipts: " + err.message);
    } finally {
      setIsRangeDownloading(false);
    }
  };

  const filteredInvoices = formData.retailerId
    ? invoices.filter((inv) => String(inv.PartyID) === String(formData.retailerId))
    : [];

  return (
    <div className="receipts-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`receipts-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        <div className="receipts-content-area">
          <div className="receipts-tabs-section">
            <div className="receipts-tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`receipts-tab ${activeTab === tab.name ? "receipts-tab--active" : ""}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="receipts-header-section">
            <div className="receipts-header-top">
              <div className="receipts-title-section">
                <h1 className="receipts-main-title">Receipt Management</h1>
                <p className="receipts-subtitle">
                  Create, manage and track all your payment receipts
                </p>
              </div>
            </div>
          </div>

          <div className="receipts-stats-grid">
            {receiptStats.map((stat, index) => (
              <div
                key={index}
                className={`receipts-stat-card receipts-stat-card--${stat.type}`}
              >
                <h3 className="receipts-stat-label">{stat.label}</h3>
                <div className="receipts-stat-value">{stat.value}</div>
                <div
                  className={`receipts-stat-change ${stat.change.startsWith("+") ? "receipts-stat-change--positive" : "receipts-stat-change--negative"}`}
                >
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          <div className="receipts-actions-section">
            <div className="quotation-container p-3">
              <h5 className="mb-3 fw-bold">View Receipts</h5>
              <div className="row align-items-end g-3 mb-3">
                <div className="col-md-auto">
                  <label className="form-label mb-1">Select Month and Year Data:</label>
                  <div className="d-flex">
                    <select
                      className="form-select me-2"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option>January</option>
                      <option>February</option>
                      <option>March</option>
                      <option>April</option>
                      <option>May</option>
                      <option>June</option>
                      <option>July</option>
                      <option>August</option>
                      <option>September</option>
                      <option>October</option>
                      <option>November</option>
                      <option>December</option>
                    </select>

                    <Select
                      options={yearOptions}
                      value={{ value: year, label: year }}
                      onChange={(selected) => setYear(selected.value)}
                      maxMenuHeight={150}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          width: "100px",
                          minWidth: "100px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          width: "100px",
                          minWidth: "100px",
                        }),
                        option: (provided) => ({
                          ...provided,
                          whiteSpace: "nowrap",
                          padding: "8px 12px",
                        }),
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-auto">
                  <button
                    className="btn btn-success mt-4"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    ) : (
                      <i className="bi bi-download me-1"></i>
                    )}{" "}
                    Download
                  </button>
                </div>
                <div className="col-md-auto">
                  <label className="form-label mb-1">Select Date Range:</label>
                  <div className="d-flex">
                    <input
                      type="date"
                      className="form-control me-2"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-auto">
                  <button
                    className="btn btn-success mt-4"
                    onClick={handleDownloadRange}
                    disabled={isRangeDownloading}
                  >
                    {isRangeDownloading ? (
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                    ) : (
                      <i className="bi bi-download me-1"></i>
                    )}{" "}
                    Download Range
                  </button>
                </div>
                <div className="col-md-auto">
                  <button
                    className="btn btn-info text-white mt-4"
                    onClick={handleCreateClick}
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Receipt"}
                  </button>
                </div>
              </div>

              <ReusableTable
                title="Receipts"
                data={receiptData}
                columns={columns}
                searchPlaceholder="Search receipts..."
                initialEntriesPerPage={5}
                showSearch={true}
                showEntriesSelector={false}
                showPagination={true}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Create Receipt Modal with Three Modes */}
          {isModalOpen && (
            <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Create Receipt</h5>
                    <button type="button" className="btn-close" onClick={handleCloseModal} disabled={isLoading}></button>
                  </div>
                  <div className="modal-body">
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="company-info-recepits-table text-center">
                          {companyInfo.name ? (
                            <>
                              <label className="form-label-recepits-table">{companyInfo.name}</label>
                              <p>{companyInfo.address}</p>
                              <p>{companyInfo.state}{companyInfo.stateCode ? `, Code: ${companyInfo.stateCode}` : ""}</p>
                              <p>GST : {companyInfo.gstin}</p>
                              <p>Email: {companyInfo.email}</p>
                              <p>Phone: {companyInfo.phone}</p>
                            </>
                          ) : (
                            <p className="text-muted">Loading company info...</p>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Receipt Number</label>
                          <input
                            type="text"
                            className="form-control"
                            name="receiptNumber"
                            value={formData.receiptNumber}
                            onChange={handleInputChange}
                            placeholder="REC0001"
                            readOnly
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Receipt Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="receiptDate"
                            value={formData.receiptDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Payment Method</label>
                          <select
                            className="form-select"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleInputChange}
                          >
                            <option>Direct Deposit</option>
                            <option>Online Payment</option>
                            <option>Credit/Debit Card</option>
                            <option>Demand Draft</option>
                            <option>Cheque</option>
                            <option>Cash</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Mode Selection - Three Options */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <label className="form-label fw-bold mb-2">Select Mode:</label>
                        <div className="d-flex gap-3 align-items-center">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="receiptMode"
                              id="mode-advance-only"
                              checked={isAdvanceOnly && !isBothMode}
                              onChange={() => {
                                setIsAdvanceOnly(true);
                                setIsBothMode(false);
                              }}
                            />
                            <label className="form-check-label" htmlFor="mode-advance-only">
                              Advance Only
                            </label>
                          </div>

                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="receiptMode"
                              id="mode-both"
                              checked={isBothMode}
                              onChange={() => {
                                setIsAdvanceOnly(false);
                                setIsBothMode(true);
                              }}
                            />
                            <label className="form-check-label" htmlFor="mode-both">
                              Both
                            </label>
                          </div>

                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="receiptMode"
                              id="mode-normal"
                              checked={!isAdvanceOnly && !isBothMode}
                              onChange={() => {
                                setIsAdvanceOnly(false);
                                setIsBothMode(false);
                              }}
                            />
                            <label className="form-check-label" htmlFor="mode-normal">
                              Normal Receipt
                            </label>
                          </div>
                        </div>
                        <small className="text-muted d-block mt-1">
                          {isAdvanceOnly && !isBothMode && "ℹ️ Only advance receipts will be updated. No new receipt created."}
                          {isBothMode && "ℹ️ Advance receipts will be updated AND a new receipt will be created."}
                          {!isAdvanceOnly && !isBothMode && "ℹ️ Only a new receipt will be created. No advance updates."}
                        </small>
                      </div>
                    </div>

                    {/* Advance Receipts Selection Section */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="border rounded p-3 bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="text-primary mb-0">
                              <i className="bi bi-receipt me-2"></i>
                              Adjust Advance Receipts
                            </h6>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={handleOpenAdvanceReceiptsModal}
                              disabled={loadingAdvanceReceipts || !formData.retailerId}
                            >
                              {loadingAdvanceReceipts ? "Loading..." : "Select Advance Receipts"}
                            </button>
                          </div>

                          {selectedAdvanceReceipts.length > 0 && (
                            <div className="mt-2">
                              <div className="alert alert-info p-2">
                                <strong>Selected Advance Receipts:</strong>
                                {selectedAdvanceReceipts.map((receipt) => (
                                  <div key={receipt.id} className="d-flex justify-content-between align-items-center mt-1">
                                    <span>{receipt.receipt_number}</span>
                                    <span className="text-success">₹{parseFloat(receipt.total_amount).toFixed(2)}</span>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleAdvanceReceiptSelection(receipt, false)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <div className="border-top mt-2 pt-2">
                                  <strong>Total Adjusted: </strong>
                                  <span className="text-success">₹{totalAdvanceAmount.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Retailer *</label>
                          <select
                            className="form-select"
                            name="retailerId"
                            value={formData.retailerId}
                            onChange={handleRetailerChange}
                            required
                          >
                            <option value="">Select Retailer</option>
                            {accounts
                              .filter((acc) => {
                                const searchLower = searchTerm.toLowerCase();
                                const primaryName = acc.gstin?.trim()
                                  ? acc.display_name || acc.name
                                  : acc.name || acc.display_name;
                                const name = primaryName?.toLowerCase() || "";
                                const businessName = acc.business_name?.toLowerCase() || "";
                                const displayName = acc.display_name?.toLowerCase() || "";
                                return (
                                  (acc.role === "retailer" ||
                                    (acc.role === "supplier" && acc.is_dual_account == 1) ||
                                    (acc.role === "staff" && acc.is_dual_account == 1) ||
                                    acc.group?.trim().toLowerCase() === "sundry debtors") &&
                                  (name.includes(searchLower) || businessName.includes(searchLower) || displayName.includes(searchLower))
                                );
                              })
                              .map((acc) => {
                                const displayText = acc.gstin?.trim()
                                  ? acc.display_name || acc.name
                                  : acc.name || acc.display_name;
                                return (
                                  <option key={acc.id} value={acc.id}>
                                    {displayText}
                                  </option>
                                );
                              })}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-1">
                          <label className="form-label">Invoice Number</label>
                          <div className="input-group">
                            <select
                              className="form-select"
                              name="invoiceNumber"
                              value={formData.invoiceNumber}
                              onChange={handleInvoiceChange}
                              disabled={!formData.retailerId}
                            >
                              <option value="">Select Invoice Number</option>
                              {filteredInvoices.map((invoice) => (
                                <option key={invoice.VoucherID} value={invoice.InvoiceNumber}>
                                  {invoice.InvoiceNumber}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="mb-1">
                          <label className="form-label">Amount *</label>
                          <div className="input-group custom-amount-receipts-table">
                            <select
                              className="form-select currency-select-receipts-table"
                              name="currency"
                              value={formData.currency}
                              onChange={handleInputChange}
                              disabled={isAdvanceOnly && !isBothMode}
                            >
                              <option>INR</option>
                              <option>USD</option>
                              <option>EUR</option>
                              <option>GBP</option>
                            </select>
                            <input
                              type="number"
                              className="form-control amount-input-receipts-table"
                              name="amount"
                              value={formData.amount}
                              onChange={handleInputChange}
                              placeholder={isFetchingBalance ? "Fetching balance..." : "Enter amount"}
                              min="0"
                              step="1"
                              required
                              disabled={isFetchingBalance || (isAdvanceOnly && !isBothMode)}
                            />
                            {isFetchingBalance && (
                              <div className="input-group-text">
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              </div>
                            )}
                          </div>
                          {isBothMode && totalAdvanceAmount > 0 && (
                            <small className="text-success d-block mt-1">
                              ✓ This amount will be used for the NEW receipt
                            </small>
                          )}
                          {totalAdvanceAmount > 0 && !isAdvanceOnly && (
                            <small className="text-muted">
                              Remaining amount after adjusting advance: ₹{formData.amount}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Remark</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Additional notes..."
                            disabled={isAdvanceOnly && !isBothMode}
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Bank Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            placeholder="Bank Name"
                            disabled={isAdvanceOnly && !isBothMode}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Transaction Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="transactionDate"
                            value={formData.transactionDate}
                            onChange={handleInputChange}
                            disabled={isAdvanceOnly && !isBothMode}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Reconciliation Option</label>
                          <select
                            className="form-select"
                            name="reconciliationOption"
                            value={formData.reconciliationOption}
                            onChange={handleInputChange}
                            disabled={isAdvanceOnly && !isBothMode}
                          >
                            <option>Do Not Reconcile</option>
                            <option>Customer Reconcile</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Transaction Proof Document</label>
                          <input
                            type="file"
                            className="form-control"
                            onChange={(e) => handleFileChange(e)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            disabled={isAdvanceOnly && !isBothMode}
                          />
                          <small className="text-muted">
                            {formData.transactionProofFile ? formData.transactionProofFile.name : "No file chosen"}
                          </small>
                          {formData.transactionProofFile && (
                            <div className="mt-2">
                              <div className="d-flex align-items-center">
                                <span className="badge bg-success me-2">
                                  <i className="bi bi-file-earmark-check"></i>
                                </span>
                                <span className="small">
                                  {formData.transactionProofFile.name}({Math.round(formData.transactionProofFile.size / 1024)} KB)
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger ms-2"
                                  onClick={() => handleRemoveFile()}
                                  disabled={isAdvanceOnly && !isBothMode}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={isLoading}>
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleCreateReceipt}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Receipt"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advance Receipts Selection Modal */}
          {showAdvanceReceiptsModal && (
            <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select Advance Receipts to Adjust</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAdvanceReceiptsModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    {advanceReceipts.length === 0 ? (
                      <div className="alert alert-info">No advance receipts available for this customer.</div>
                    ) : (
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th width="5%">Select</th>
                            <th>Receipt Number</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {advanceReceipts.map((receipt) => (
                            <tr key={receipt.id}>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedAdvanceReceipts.some((r) => r.id === receipt.id)}
                                  onChange={(e) => handleAdvanceReceiptSelection(receipt, e.target.checked)}
                                />
                              </td>
                              <td>{receipt.receipt_number}</td>
                              <td>{new Date(receipt.receipt_date).toLocaleDateString()}</td>
                              <td className="text-end fw-bold text-success">
                                ₹{parseFloat(receipt.total_amount).toFixed(2)}
                              </td>
                              <td>{receipt.payment_method}</td>
                              <td>{receipt.note}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="table-active">
                            <td colSpan="3" className="text-end fw-bold">Total Selected:</td>
                            <td className="text-end fw-bold text-success">₹{totalAdvanceAmount.toFixed(2)}</td>
                            <td colSpan="2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowAdvanceReceiptsModal(false)}>
                      Close
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setShowAdvanceReceiptsModal(false)}
                      disabled={selectedAdvanceReceipts.length === 0}
                    >
                      Apply Selected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptsTable;