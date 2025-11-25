import { useEffect, useState } from "react";
import axios from "axios";
import { baseurl } from "../../../BaseURL/BaseURL";
import { useNavigate } from "react-router-dom";

const useCreditNoteLogic = () => {

  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [creditNoteNumber, setCreditNoteNumber] = useState("");
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  // Product + Batch lists
  const [products, setProducts] = useState([]);
  const [productBatches, setProductBatches] = useState({});

  // Editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedProduct, setEditedProduct] = useState("");
  const [editedBatch, setEditedBatch] = useState("");
  const [editedQuantity, setEditedQuantity] = useState("");

  // ------------------------------------------------------------------------------------
  // FETCH ALL TRANSACTIONS
  // ------------------------------------------------------------------------------------
  const fetchAllTransactions = async () => {
    setLoadingInvoices(true);
    const res = await axios.get(`${baseurl}/transactions`);
    setLoadingInvoices(false);
    return res.data;
  };

  // ------------------------------------------------------------------------------------
  // FETCH CREDIT NOTE NUMBER + INVOICE LIST
  // ------------------------------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const creditNo = await axios.get(`${baseurl}/api/next-creditnote-number`);
        setCreditNoteNumber(creditNo.data.nextCreditNoteNumber || "CNOTE001");

        const all = await fetchAllTransactions();
        setInvoiceList(all.filter(t => t.TransactionType === "Sales"));
      } catch (err) {
        setError("Failed to load initial data");
      }
    };

    init();
  }, []);

  // ------------------------------------------------------------------------------------
  // LOAD CUSTOMER + ITEM DETAILS WHEN INVOICE SELECTED
  // ------------------------------------------------------------------------------------
  useEffect(() => {
    const loadCustomer = async () => {
      if (!selectedInvoice) {
        setCustomerData(null);
        setItems([]);
        setProducts([]);
        setProductBatches({});
        return;
      }

      setLoadingCustomer(true);

      const all = await fetchAllTransactions();
      const inv = all.find(t => t.InvoiceNumber === selectedInvoice);

      if (!inv) {
        setLoadingCustomer(false);
        return;
      }

      setCustomerData(inv);

      const itemList = inv.batch_details || inv.items || [];
      setItems(itemList);

      // Extract unique products
      const uniqueProducts = [...new Set(itemList.map(i => i.product))];
      setProducts(uniqueProducts);

      // Create a mapping of product → batches
      const batchMap = {};
      itemList.forEach((i) => {
        if (!batchMap[i.product]) batchMap[i.product] = [];
        if (!batchMap[i.product].includes(i.batch)) batchMap[i.product].push(i.batch);
      });

      setProductBatches(batchMap);

      setLoadingCustomer(false);
    };

    loadCustomer();
  }, [selectedInvoice]);

  // ------------------------------------------------------------------------------------
  // EDIT LOGIC
  // ------------------------------------------------------------------------------------
  const handleEditClick = (index, item) => {
    setEditingIndex(index);
    setEditedProduct(item.product);
    setEditedBatch(item.batch);
    setEditedQuantity(item.quantity);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedProduct("");
    setEditedBatch("");
    setEditedQuantity("");
  };

  const handleQuantityChange = (e) => setEditedQuantity(e.target.value);

  const handleProductChange = (e) => {
    setEditedProduct(e.target.value);
    setEditedBatch("");
  };

  const handleBatchChange = (e) => setEditedBatch(e.target.value);

  const handleUpdateItem = (index) => {
    if (!editedProduct || !editedBatch || !editedQuantity) {
      alert("Please fill all fields");
      return;
    }

    const updated = [...items];

    updated[index] = {
      ...updated[index],
      product: editedProduct,
      batch: editedBatch,
      quantity: parseFloat(editedQuantity)
    };

    setItems(updated);
    handleCancelEdit();
  };

  const handleDeleteItem = (index) => {
    if (window.confirm("Delete this item?")) {
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
    }
  };

  // ------------------------------------------------------------------------------------
  // CALCULATE TOTALS
  // ------------------------------------------------------------------------------------
  const totals = {
    taxableAmount: items.reduce((s, i) => s + i.quantity * i.price, 0).toFixed(2),
    totalIGST: items.reduce((s, i) => s + (i.quantity * i.price * i.igst) / 100, 0).toFixed(2),
    grandTotal: items.reduce(
      (s, i) => s + i.quantity * i.price * (1 + i.igst / 100),
      0
    ).toFixed(2)
  };

  // ------------------------------------------------------------------------------------
  // CREATE CREDIT NOTE
  // ------------------------------------------------------------------------------------
  const handleCreateCreditNote = async () => {
    const payload = {
      transactionType: "CreditNote",
      creditNoteNumber,
      noteDate,
      items,
      customerData,
    };

    await axios.post(`${baseurl}/transaction`, payload);

    alert("Credit Note Created!");
    navigate("/sales/credit_note");
  };

  // ------------------------------------------------------------------------------------
  // RETURN EVERYTHING FOR UI
  // ------------------------------------------------------------------------------------
  return {
    // Layout
    isCollapsed,
    setIsCollapsed,

    // Display + errors
    error,

    // Header fields
    creditNoteNumber,
    noteDate,
    setNoteDate,
    selectedInvoice,
    setSelectedInvoice,

    // Invoice list
    invoiceList,
    loadingInvoices,

    // Customer
    customerData,
    loadingCustomer,

    // Items
    items,
    products,
    productBatches,

    // Edit state
    editingIndex,
    editedProduct,
    editedBatch,
    editedQuantity,

    // Edit handlers
    handleEditClick,
    handleCancelEdit,
    handleQuantityChange,
    handleProductChange,
    handleBatchChange,
    handleUpdateItem,
    handleDeleteItem,

    // Totals
    totals,

    // Creating credit note
    handleCreateCreditNote,
  };
};

export default useCreditNoteLogic;
