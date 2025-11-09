// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../../../Shared/AdminSidebar/AdminHeader";
// import "./OffersPostings.css";

// function OffersPostings() {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState("regular");
//   const [offers, setOffers] = useState([]);
//   const [flashSales, setFlashSales] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("All");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showModal, setShowModal] = useState(false);
//   const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);
//   const [editingOffer, setEditingOffer] = useState(null);
//   const [editingFlashSale, setEditingFlashSale] = useState(null);
//   const [offerType, setOfferType] = useState("global");
//   const [flashSaleType, setFlashSaleType] = useState("bogo");
//   const [loading, setLoading] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(false);
//   const offersPerPage = 5;

//   const API_BASE = "http://localhost:5000/api";
//   const API_BASE_CAT = "http://localhost:5000";

//   // Regular Offers Form State
//   const [formData, setFormData] = useState({
//     title: "",
//     discountPercentage: "",
//     minimumAmount: "0",
//     validFrom: "",
//     validUntil: "",
//     description: "",
//     image: null,
//     category: "",
//     productName: ""
//   });

//   // Flash Sales Form State
//   const [flashSaleData, setFlashSaleData] = useState({
//     title: "",
//     description: "",
//     flashSaleType: "bogo",
//     products: [],
//     validFrom: "",
//     validUntil: "",
//     startTime: "",
//     endTime: "",
//     image: null,
//     discountValue: "",
//     buyQuantity: 1,
//     getQuantity: 1,
//     expiryThreshold: 7,
//     stockLimit: "",
//     purchaseLimit: 1,
//     termsConditions: ""
//   });

//   const flashSaleTypes = [
//     { value: "bogo", label: "Buy One Get One", description: "Buy X get Y free" },
//     { value: "expiry", label: "Near Expiry", description: "Discounts on expiring products" },
//     { value: "clearance", label: "Clearance Sale", description: "Stock clearance discounts" },
//     { value: "seasonal", label: "Seasonal Flash", description: "Seasonal product discounts" },
//     { value: "hourly", label: "Hourly Deal", description: "Limited time hourly discounts" },
//     { value: "limited_stock", label: "Limited Stock", description: "Limited quantity offers" }
//   ];

//   // Sample products data for flash sales
//   const sampleProducts = [
//     { id: 1, name: "Premium Olive Oil", category: "Groceries", expiryDate: "2024-12-31", currentStock: 150 },
//     { id: 2, name: "Organic Milk", category: "Groceries", expiryDate: "2024-06-15", currentStock: 45 },
//     { id: 3, name: "Wireless Headphones", category: "Electronics", expiryDate: null, currentStock: 200 },
//     { id: 4, name: "Yoga Mat", category: "Sports", expiryDate: null, currentStock: 75 },
//     { id: 5, name: "Face Cream", category: "Beauty", expiryDate: "2024-08-20", currentStock: 120 }
//   ];

//   // API Functions
//   const fetchCategories = async () => {
//     console.log("Fetching categories..."); // Debug log
//     setCategoriesLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_CAT}/categories`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("Categories fetched:", data); // Debug log
//       setCategories(data);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//     } finally {
//       setCategoriesLoading(false);
//     }
//   };

//   const fetchOffers = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${API_BASE}/offers?page=${currentPage}&limit=${offersPerPage}&search=${searchTerm}&offer_type=${filterType === 'All' ? '' : filterType}`
//       );
//       const data = await response.json();
//       if (data.offers) {
//         setOffers(data.offers);
//       }
//     } catch (error) {
//       console.error('Error fetching offers:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createOffer = async (offerData) => {
//     const formDataToSend = new FormData();
    
//     // Append all form data
//     formDataToSend.append('title', offerData.title);
//     formDataToSend.append('description', offerData.description);
//     formDataToSend.append('discountPercentage', offerData.discountPercentage);
//     formDataToSend.append('minimumAmount', offerData.minimumAmount);
//     formDataToSend.append('validFrom', offerData.validFrom);
//     formDataToSend.append('validUntil', offerData.validUntil);
//     formDataToSend.append('offerType', offerData.offerType);
    
//     if (offerData.category) {
//       formDataToSend.append('category', offerData.category);
//     }
//     if (offerData.productName) {
//       formDataToSend.append('productName', offerData.productName);
//     }
//     if (offerData.image) {
//       formDataToSend.append('image', offerData.image);
//     }

//     try {
//       const response = await fetch(`${API_BASE}/offers`, {
//         method: 'POST',
//         body: formDataToSend,
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       console.error('Error creating offer:', error);
//       throw error;
//     }
//   };

//   const updateOffer = async (id, offerData) => {
//     const formDataToSend = new FormData();
    
//     // Append all form data
//     formDataToSend.append('title', offerData.title);
//     formDataToSend.append('description', offerData.description);
//     formDataToSend.append('discountPercentage', offerData.discountPercentage);
//     formDataToSend.append('minimumAmount', offerData.minimumAmount);
//     formDataToSend.append('validFrom', offerData.validFrom);
//     formDataToSend.append('validUntil', offerData.validUntil);
//     formDataToSend.append('offerType', offerData.offerType);
//     formDataToSend.append('status', offerData.status);
    
//     if (offerData.category) {
//       formDataToSend.append('category', offerData.category);
//     }
//     if (offerData.productName) {
//       formDataToSend.append('productName', offerData.productName);
//     }
//     if (offerData.image) {
//       formDataToSend.append('image', offerData.image);
//     }

//     try {
//       const response = await fetch(`${API_BASE}/offers/${id}`, {
//         method: 'PUT',
//         body: formDataToSend,
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       console.error('Error updating offer:', error);
//       throw error;
//     }
//   };

//   const deleteOffer = async (id) => {
//     try {
//       const response = await fetch(`${API_BASE}/offers/${id}`, {
//         method: 'DELETE',
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       console.error('Error deleting offer:', error);
//       throw error;
//     }
//   };

//   const toggleOfferStatus = async (id, currentStatus) => {
//     const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
//     try {
//       const response = await fetch(`${API_BASE}/offers/${id}/status`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       return await response.json();
//     } catch (error) {
//       console.error('Error updating offer status:', error);
//       throw error;
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "regular") {
//       fetchOffers();
//     }
//   }, [currentPage, searchTerm, filterType, activeTab]);

//   // Fetch categories when modal opens for category specific offers - FIXED
//   useEffect(() => {
//     if (showModal && offerType === 'category') {
//       console.log("Modal opened for category offer, fetching categories..."); // Debug log
//       fetchCategories();
//     }
//   }, [showModal, offerType]);

//   // Fetch categories when offer type changes to category in the modal
//   useEffect(() => {
//     if (showModal && offerType === 'category' && categories.length === 0) {
//       console.log("Offer type changed to category, fetching categories..."); // Debug log
//       fetchCategories();
//     }
//   }, [offerType, showModal]);

//   // Regular Offers Handlers
//   const handleInputChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "image") {
//       setFormData(prev => ({ ...prev, image: files[0] }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleCategoryChange = (e) => {
//     const selectedCategoryId = e.target.value;
//     console.log("Selected category ID:", selectedCategoryId); // Debug log
//     console.log("Available categories:", categories); // Debug log
    
//     setFormData(prev => ({ ...prev, category: selectedCategoryId }));
    
//     // Auto-fill discount percentage if category has current discount
//     if (selectedCategoryId) {
//       const selectedCategory = categories.find(cat => cat.id == selectedCategoryId);
//       console.log("Selected category:", selectedCategory); // Debug log
      
//       if (selectedCategory && selectedCategory.current_discount_from_history) {
//         console.log("Setting discount to:", selectedCategory.current_discount_from_history); // Debug log
//         setFormData(prev => ({ 
//           ...prev, 
//           discountPercentage: selectedCategory.current_discount_from_history.toString()
//         }));
//       } else {
//         console.log("No current discount found for this category"); // Debug log
//         // Reset discount percentage if no current discount
//         setFormData(prev => ({ 
//           ...prev, 
//           discountPercentage: ""
//         }));
//       }
//     } else {
//       // Reset discount percentage if no category selected
//       setFormData(prev => ({ 
//         ...prev, 
//         discountPercentage: ""
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     const offerData = {
//       ...formData,
//       discountPercentage: parseFloat(formData.discountPercentage),
//       minimumAmount: parseFloat(formData.minimumAmount) || 0,
//       offerType,
//       status: "active"
//     };

//     try {
//       if (editingOffer) {
//         await updateOffer(editingOffer.id, offerData);
//       } else {
//         await createOffer(offerData);
//       }
//       fetchOffers();
//       handleCloseModal();
//     } catch (error) {
//       alert('Error saving offer. Please try again.');
//     }
//   };

//   const handleEdit = (offer) => {
//     setEditingOffer(offer);
//     setOfferType(offer.offer_type);
//     setFormData({
//       title: offer.title,
//       discountPercentage: offer.discount_percentage,
//       minimumAmount: offer.minimum_amount?.toString() || "0",
//       validFrom: offer.valid_from,
//       validUntil: offer.valid_until,
//       description: offer.description,
//       image: null, // Reset image file input
//       category: offer.category_id || "",
//       productName: offer.product_name || ""
//     });
//     setShowModal(true);
    
//     // Fetch categories if editing a category offer
//     if (offer.offer_type === 'category') {
//       console.log("Editing category offer, fetching categories..."); // Debug log
//       fetchCategories();
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this offer?")) {
//       try {
//         await deleteOffer(id);
//         fetchOffers();
//       } catch (error) {
//         alert('Error deleting offer. Please try again.');
//       }
//     }
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingOffer(null);
//     setFormData({
//       title: "",
//       discountPercentage: "",
//       minimumAmount: "0",
//       validFrom: "",
//       validUntil: "",
//       description: "",
//       image: null,
//       category: "",
//       productName: ""
//     });
//   };

//   const handleToggleStatus = async (id, currentStatus) => {
//     try {
//       await toggleOfferStatus(id, currentStatus);
//       fetchOffers();
//     } catch (error) {
//       alert('Error updating offer status. Please try again.');
//     }
//   };

//   // Flash Sales Handlers (using local state as before)
//   const handleFlashSaleInputChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "image") {
//       setFlashSaleData(prev => ({ ...prev, image: files[0] }));
//     } else if (name === "products") {
//       const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
//       setFlashSaleData(prev => ({ ...prev, products: selectedOptions }));
//     } else {
//       setFlashSaleData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleFlashSaleSubmit = (e) => {
//     e.preventDefault();
    
//     const newFlashSale = {
//       id: editingFlashSale ? editingFlashSale.id : Date.now(),
//       ...flashSaleData,
//       status: "active",
//       createdAt: editingFlashSale ? editingFlashSale.createdAt : new Date().toISOString().split('T')[0]
//     };

//     if (editingFlashSale) {
//       setFlashSales(flashSales.map(sale => sale.id === editingFlashSale.id ? newFlashSale : sale));
//     } else {
//       setFlashSales([...flashSales, newFlashSale]);
//     }

//     handleCloseFlashSaleModal();
//   };

//   const handleEditFlashSale = (sale) => {
//     setEditingFlashSale(sale);
//     setFlashSaleType(sale.flashSaleType);
//     setFlashSaleData({
//       title: sale.title,
//       description: sale.description,
//       flashSaleType: sale.flashSaleType,
//       products: sale.products || [],
//       validFrom: sale.validFrom,
//       validUntil: sale.validUntil,
//       startTime: sale.startTime,
//       endTime: sale.endTime,
//       image: sale.image,
//       discountValue: sale.discountValue || "",
//       buyQuantity: sale.buyQuantity || 1,
//       getQuantity: sale.getQuantity || 1,
//       expiryThreshold: sale.expiryThreshold || 7,
//       stockLimit: sale.stockLimit || "",
//       purchaseLimit: sale.purchaseLimit || 1,
//       termsConditions: sale.termsConditions || ""
//     });
//     setShowFlashSaleModal(true);
//   };

//   const handleDeleteFlashSale = (id) => {
//     if (window.confirm("Are you sure you want to delete this flash sale?")) {
//       setFlashSales(flashSales.filter(sale => sale.id !== id));
//     }
//   };

//   const handleCloseFlashSaleModal = () => {
//     setShowFlashSaleModal(false);
//     setEditingFlashSale(null);
//     setFlashSaleData({
//       title: "",
//       description: "",
//       flashSaleType: "bogo",
//       products: [],
//       validFrom: "",
//       validUntil: "",
//       startTime: "",
//       endTime: "",
//       image: null,
//       discountValue: "",
//       buyQuantity: 1,
//       getQuantity: 1,
//       expiryThreshold: 7,
//       stockLimit: "",
//       purchaseLimit: 1,
//       termsConditions: ""
//     });
//   };

//   const toggleFlashSaleStatus = (id) => {
//     setFlashSales(flashSales.map(sale => 
//       sale.id === id 
//         ? { ...sale, status: sale.status === "active" ? "inactive" : "active" }
//         : sale
//     ));
//   };

//   // Get products near expiry for suggestions
//   const getNearExpiryProducts = () => {
//     const threshold = parseInt(flashSaleData.expiryThreshold) || 7;
//     const today = new Date();
//     return sampleProducts.filter(product => {
//       if (!product.expiryDate) return false;
//       const expiryDate = new Date(product.expiryDate);
//       const diffTime = expiryDate - today;
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//       return diffDays <= threshold && diffDays >= 0;
//     });
//   };

//   // Filter and Pagination Logic
//   const filteredOffers = offers.filter((offer) => {
//     const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          offer.description.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterType === "All" || offer.offer_type === filterType;
//     return matchesSearch && matchesFilter;
//   });

//   const filteredFlashSales = flashSales.filter((sale) => {
//     return sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//            sale.description.toLowerCase().includes(searchTerm.toLowerCase());
//   });

//   const currentItems = activeTab === "regular" ? filteredOffers : filteredFlashSales;
//   const totalPages = Math.ceil(currentItems.length / offersPerPage);
//   const indexOfLastItem = currentPage * offersPerPage;
//   const indexOfFirstItem = indexOfLastItem - offersPerPage;
//   const currentItemsPage = currentItems.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   // Render Flash Sale Form
//   const renderFlashSaleForm = () => {
//     const nearExpiryProducts = getNearExpiryProducts();
    
//     return (
//       <form onSubmit={handleFlashSaleSubmit} className="offers-form">
//         {/* Flash Sale Type */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">Flash Sale Type *</label>
//           <div className="offers-flash-types-grid">
//             {flashSaleTypes.map(type => (
//               <div
//                 key={type.value}
//                 className={`offers-flash-type-card ${flashSaleType === type.value ? 'offers-flash-type-active' : ''}`}
//                 onClick={() => {
//                   setFlashSaleType(type.value);
//                   setFlashSaleData(prev => ({ ...prev, flashSaleType: type.value }));
//                 }}
//               >
//                 <div className="offers-flash-type-icon">
//                   {type.value === 'bogo' && '🎁'}
//                   {type.value === 'expiry' && '⏰'}
//                   {type.value === 'clearance' && '🏷️'}
//                   {type.value === 'seasonal' && '🌞'}
//                   {type.value === 'hourly' && '🕒'}
//                   {type.value === 'limited_stock' && '📦'}
//                 </div>
//                 <div className="offers-flash-type-info">
//                   <div className="offers-flash-type-title">{type.label}</div>
//                   <div className="offers-flash-type-desc">{type.description}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Basic Information */}
//         <div className="offers-form-row">
//           <div className="offers-form-group">
//             <label className="offers-form-label">Flash Sale Title *</label>
//             <input
//               type="text"
//               name="title"
//               value={flashSaleData.title}
//               onChange={handleFlashSaleInputChange}
//               className="offers-form-input"
//               required
//               placeholder="e.g., Weekend BOGO Sale"
//             />
//           </div>
//         </div>

//         <div className="offers-form-group">
//           <label className="offers-form-label">Description *</label>
//           <textarea
//             name="description"
//             value={flashSaleData.description}
//             onChange={handleFlashSaleInputChange}
//             className="offers-form-textarea"
//             rows="2"
//             required
//             placeholder="Describe the flash sale..."
//           />
//         </div>

//         {/* Products Selection */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">
//             Select Products *
//             {flashSaleType === 'expiry' && nearExpiryProducts.length > 0 && (
//               <span className="offers-suggestion-note">
//                 ({nearExpiryProducts.length} products expiring within {flashSaleData.expiryThreshold} days)
//               </span>
//             )}
//           </label>
//           <select
//             name="products"
//             multiple
//             value={flashSaleData.products}
//             onChange={handleFlashSaleInputChange}
//             className="offers-form-select offers-form-multiselect"
//             required
//             size="4"
//           >
//             {sampleProducts.map(product => (
//               <option key={product.id} value={product.id}>
//                 {product.name} - {product.category}
//                 {product.expiryDate && ` (Expires: ${product.expiryDate})`}
//                 {product.currentStock && ` - Stock: ${product.currentStock}`}
//               </option>
//             ))}
//           </select>
//           <div className="offers-selected-count">
//             {flashSaleData.products.length} product(s) selected
//           </div>
//         </div>

//         {/* Flash Sale Specific Fields */}
//         <div className="offers-form-row">
//           {flashSaleType === 'bogo' && (
//             <>
//               <div className="offers-form-group">
//                 <label className="offers-form-label">Buy Quantity *</label>
//                 <input
//                   type="number"
//                   name="buyQuantity"
//                   value={flashSaleData.buyQuantity}
//                   onChange={handleFlashSaleInputChange}
//                   className="offers-form-input"
//                   min="1"
//                   required
//                 />
//               </div>
//               <div className="offers-form-group">
//                 <label className="offers-form-label">Get Quantity Free *</label>
//                 <input
//                   type="number"
//                   name="getQuantity"
//                   value={flashSaleData.getQuantity}
//                   onChange={handleFlashSaleInputChange}
//                   className="offers-form-input"
//                   min="1"
//                   required
//                 />
//               </div>
//             </>
//           )}

//           {flashSaleType === 'expiry' && (
//             <>
//               <div className="offers-form-group">
//                 <label className="offers-form-label">Discount Percentage *</label>
//                 <input
//                   type="number"
//                   name="discountValue"
//                   value={flashSaleData.discountValue}
//                   onChange={handleFlashSaleInputChange}
//                   className="offers-form-input"
//                   min="1"
//                   max="100"
//                   required
//                   placeholder="e.g., 30"
//                 />
//               </div>
//               <div className="offers-form-group">
//                 <label className="offers-form-label">Expiry Threshold (Days) *</label>
//                 <input
//                   type="number"
//                   name="expiryThreshold"
//                   value={flashSaleData.expiryThreshold}
//                   onChange={handleFlashSaleInputChange}
//                   className="offers-form-input"
//                   min="1"
//                   max="365"
//                   required
//                 />
//               </div>
//             </>
//           )}

//           {(flashSaleType === 'clearance' || flashSaleType === 'seasonal' || flashSaleType === 'hourly') && (
//             <div className="offers-form-group">
//               <label className="offers-form-label">Discount Percentage *</label>
//               <input
//                 type="number"
//                 name="discountValue"
//                 value={flashSaleData.discountValue}
//                 onChange={handleFlashSaleInputChange}
//                 className="offers-form-input"
//                 min="1"
//                 max="100"
//                 required
//               />
//             </div>
//           )}

//           {flashSaleType === 'limited_stock' && (
//             <>
//               <div className="offers-form-group">
//                 <label className="offers-form-label">Discount Percentage *</label>
//                 <input
//                   type="number"
//                   name="discountValue"
//                   value={flashSaleData.discountValue}
//                   onChange={handleFlashSaleInputChange}
//                   className="offers-form-input"
//                   min="1"
//                   max="100"
//                   required
//                 />
//               </div>
//               <div className="offers-form-group">
//                 <label className="offers-form-label">Stock Limit</label>
//                 <input
//                   type="number"
//                   name="stockLimit"
//                   value={flashSaleData.stockLimit}
//                   onChange={handleFlashSaleInputChange}
//                   className="offers-form-input"
//                   min="1"
//                   placeholder="Leave empty for no limit"
//                 />
//               </div>
//             </>
//           )}
//         </div>

//         {/* Date & Time */}
//         <div className="offers-form-row">
//           <div className="offers-form-group">
//             <label className="offers-form-label">Start Date *</label>
//             <input
//               type="date"
//               name="validFrom"
//               value={flashSaleData.validFrom}
//               onChange={handleFlashSaleInputChange}
//               className="offers-form-input"
//               required
//             />
//           </div>
//           <div className="offers-form-group">
//             <label className="offers-form-label">End Date *</label>
//             <input
//               type="date"
//               name="validUntil"
//               value={flashSaleData.validUntil}
//               onChange={handleFlashSaleInputChange}
//               className="offers-form-input"
//               required
//             />
//           </div>
//         </div>

//         <div className="offers-form-row">
//           <div className="offers-form-group">
//             <label className="offers-form-label">Start Time *</label>
//             <input
//               type="time"
//               name="startTime"
//               value={flashSaleData.startTime}
//               onChange={handleFlashSaleInputChange}
//               className="offers-form-input"
//               required
//             />
//           </div>
//           <div className="offers-form-group">
//             <label className="offers-form-label">End Time *</label>
//             <input
//               type="time"
//               name="endTime"
//               value={flashSaleData.endTime}
//               onChange={handleFlashSaleInputChange}
//               className="offers-form-input"
//               required
//             />
//           </div>
//         </div>

//         {/* Purchase Limit */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">Purchase Limit per Customer</label>
//           <input
//             type="number"
//             name="purchaseLimit"
//             value={flashSaleData.purchaseLimit}
//             onChange={handleFlashSaleInputChange}
//             className="offers-form-input"
//             min="1"
//             placeholder="Maximum quantity a customer can purchase"
//           />
//         </div>

//         {/* Additional Fields */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">Terms & Conditions</label>
//           <textarea
//             name="termsConditions"
//             value={flashSaleData.termsConditions}
//             onChange={handleFlashSaleInputChange}
//             className="offers-form-textarea"
//             rows="2"
//             placeholder="Enter terms and conditions for this flash sale..."
//           />
//         </div>

//         <div className="offers-form-group">
//           <label className="offers-form-label">Flash Sale Image</label>
//           <input
//             type="file"
//             name="image"
//             onChange={handleFlashSaleInputChange}
//             className="offers-form-file"
//             accept="image/*"
//           />
//         </div>

//         <div className="offers-form-actions">
//           <button 
//             type="button" 
//             onClick={handleCloseFlashSaleModal} 
//             className="offers-btn-cancel"
//           >
//             Cancel
//           </button>
//           <button 
//             type="submit" 
//             className="offers-btn-submit"
//           >
//             {editingFlashSale ? 'Update Flash Sale' : 'Create Flash Sale'}
//           </button>
//         </div>
//       </form>
//     );
//   };

//   // Render Regular Offer Form
//   const renderRegularOfferForm = () => (
//     <form onSubmit={handleSubmit} className="offers-form">
//       {/* Offer Type Selection */}
//       <div className="offers-form-group">
//         <label className="offers-form-label">Offer Type *</label>
//         <div className="offers-type-selector">
//           <button
//             type="button"
//             className={`offers-type-btn ${offerType === 'global' ? 'offers-type-active' : ''}`}
//             onClick={() => setOfferType('global')}
//           >
//             Global Offer (All Products)
//           </button>
//           <button
//             type="button"
//             className={`offers-type-btn ${offerType === 'category' ? 'offers-type-active' : ''}`}
//             onClick={() => {
//               setOfferType('category');
//               // Fetch categories immediately when category type is selected
//               if (categories.length === 0) {
//                 console.log("Category type selected, fetching categories..."); // Debug log
//                 fetchCategories();
//               }
//             }}
//           >
//             Category Specific
//           </button>
//         </div>
//       </div>

//       {/* Basic Information */}
//       <div className="offers-form-group">
//         <label className="offers-form-label">Offer Title *</label>
//         <input
//           type="text"
//           name="title"
//           value={formData.title}
//           onChange={handleInputChange}
//           className="offers-form-input"
//           required
//           placeholder="Enter offer title"
//         />
//       </div>

//       <div className="offers-form-row">
//         <div className="offers-form-group">
//           <label className="offers-form-label">Discount Percentage *</label>
//           <input
//             type="number"
//             name="discountPercentage"
//             value={formData.discountPercentage}
//             onChange={handleInputChange}
//             className="offers-form-input"
//             min="0"
//             max="100"
//             step="0.01"
//             required
//             placeholder="e.g., 15.5"
//           />
//         </div>
        
//         <div className="offers-form-group">
//           <label className="offers-form-label">Minimum Amount (₹)</label>
//           <input
//             type="number"
//             name="minimumAmount"
//             value={formData.minimumAmount}
//             onChange={handleInputChange}
//             className="offers-form-input"
//             min="0"
//             step="0.01"
//             placeholder="Default: 0"
//           />
//         </div>
//       </div>

//       {/* Category Specific Fields */}
//       {offerType === 'category' && (
//         <div className="offers-form-row">
//           <div className="offers-form-group">
//             <label className="offers-form-label">Category *</label>
//             <select
//               name="category"
//               value={formData.category}
//               onChange={handleCategoryChange}
//               className="offers-form-select"
//               required
//               disabled={categoriesLoading}
//             >
//               <option value="">Select Category</option>
//               {categoriesLoading ? (
//                 <option value="" disabled>Loading categories...</option>
//               ) : (
//                 categories.map(cat => (
//                   <option key={cat.id} value={cat.id}>
//                     {cat.category_name} 
//                     {cat.current_discount_from_history ? 
//                       ` (Current Discount: ${cat.current_discount_from_history}%)` : 
//                       ' (No active discount)'
//                     }
//                   </option>
//                 ))
//               )}
//             </select>
//             {categoriesLoading && (
//               <div className="offers-loading-small">Loading categories...</div>
//             )}
//           </div>
          
//           <div className="offers-form-group">
//             <label className="offers-form-label">Product Name</label>
//             <input
//               type="text"
//               name="productName"
//               value={formData.productName}
//               onChange={handleInputChange}
//               className="offers-form-input"
//               placeholder="Specific product or leave empty for all category products"
//             />
//           </div>
//         </div>
//       )}

//       {/* Validity Period */}
//       <div className="offers-form-row">
//         <div className="offers-form-group">
//           <label className="offers-form-label">Valid From *</label>
//           <input
//             type="date"
//             name="validFrom"
//             value={formData.validFrom}
//             onChange={handleInputChange}
//             className="offers-form-input"
//             required
//           />
//         </div>
        
//         <div className="offers-form-group">
//           <label className="offers-form-label">Valid Until *</label>
//           <input
//             type="date"
//             name="validUntil"
//             value={formData.validUntil}
//             onChange={handleInputChange}
//             className="offers-form-input"
//             required
//           />
//         </div>
//       </div>

//       {/* Additional Fields */}
//       <div className="offers-form-group">
//         <label className="offers-form-label">Description *</label>
//         <textarea
//           name="description"
//           value={formData.description}
//           onChange={handleInputChange}
//           className="offers-form-textarea"
//           rows="3"
//           required
//           placeholder="Describe the offer details..."
//         />
//       </div>

//       <div className="offers-form-group">
//         <label className="offers-form-label">Offer Image</label>
//         <input
//           type="file"
//           name="image"
//           onChange={handleInputChange}
//           className="offers-form-file"
//           accept="image/*"
//         />
//         {editingOffer && editingOffer.image_url && (
//           <div className="offers-current-image">
//             <p>Current Image:</p>
//             <img 
//               src={`http://localhost:5000${editingOffer.image_url}`} 
//               alt="Current offer" 
//               className="offers-image-preview"
//             />
//           </div>
//         )}
//       </div>

//       <div className="offers-form-actions">
//         <button type="button" onClick={handleCloseModal} className="offers-btn-cancel">
//           Cancel
//         </button>
//         <button type="submit" className="offers-btn-submit" disabled={loading}>
//           {loading ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}
//         </button>
//       </div>
//     </form>
//   );

//   // Render Flash Sale Card
//   const renderFlashSaleCard = (sale) => {
//     const getFlashSaleDescription = () => {
//       switch (sale.flashSaleType) {
//         case 'bogo':
//           return `Buy ${sale.buyQuantity} Get ${sale.getQuantity} Free`;
//         case 'expiry':
//           return `${sale.discountValue}% off - Expiring within ${sale.expiryThreshold} days`;
//         case 'clearance':
//           return `${sale.discountValue}% off - Clearance Sale`;
//         case 'seasonal':
//           return `${sale.discountValue}% off - Seasonal Offer`;
//         case 'hourly':
//           return `${sale.discountValue}% off - Hourly Deal`;
//         case 'limited_stock':
//           return `${sale.discountValue}% off - Limited Stock`;
//         default:
//           return sale.description;
//       }
//     };

//     return (
//       <div key={sale.id} className={`offers-card-item offers-flash-sale-card ${sale.status}`}>
//         <div className="offers-flash-badge">FLASH SALE</div>
//         <div className="offers-card-image">
//           {sale.image ? (
//             <img src={sale.image} alt={sale.title} />
//           ) : (
//             <div className="offers-no-image">Flash Sale</div>
//           )}
//         </div>
        
//         <div className="offers-card-content">
//           <div className="offers-card-header">
//             <h3 className="offers-card-title">{sale.title}</h3>
//             <span className={`offers-status-badge ${sale.status}`}>
//               {sale.status}
//             </span>
//           </div>
          
//           <p className="offers-card-desc">{sale.description}</p>
          
//           <div className="offers-details-list">
//             <div className="offers-detail-item">
//               <strong>Type:</strong> 
//               {flashSaleTypes.find(t => t.value === sale.flashSaleType)?.label}
//             </div>
            
//             <div className="offers-detail-item">
//               <strong>Offer:</strong> {getFlashSaleDescription()}
//             </div>
            
//             <div className="offers-detail-item">
//               <strong>Timing:</strong> {sale.startTime} - {sale.endTime}
//             </div>
            
//             <div className="offers-detail-item">
//               <strong>Valid:</strong> {sale.validFrom} to {sale.validUntil}
//             </div>

//             {sale.purchaseLimit > 1 && (
//               <div className="offers-detail-item">
//                 <strong>Limit:</strong> {sale.purchaseLimit} per customer
//               </div>
//             )}
//           </div>

//           <div className="offers-card-actions">
//             <button 
//               className="offers-btn-edit"
//               onClick={() => handleEditFlashSale(sale)}
//             >
//               Edit
//             </button>
//             <button 
//               className="offers-btn-delete"
//               onClick={() => handleDeleteFlashSale(sale.id)}
//             >
//               Delete
//             </button>
//             <button 
//               className={`offers-btn-status ${sale.status}`}
//               onClick={() => toggleFlashSaleStatus(sale.id)}
//             >
//               {sale.status === 'active' ? 'Deactivate' : 'Activate'}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Render Regular Offer Card
//   const renderRegularOfferCard = (offer) => (
//     <div key={offer.id} className={`offers-card-item ${offer.status}`}>
//       <div className="offers-card-image">
//         {offer.image_url ? (
//           <img src={`http://localhost:5000${offer.image_url}`} alt={offer.title} />
//         ) : (
//           <div className="offers-no-image">No Image</div>
//         )}
//       </div>
      
//       <div className="offers-card-content">
//         <div className="offers-card-header">
//           <h3 className="offers-card-title">{offer.title}</h3>
//           <span className={`offers-status-badge ${offer.status}`}>
//             {offer.status}
//           </span>
//         </div>
        
//         <p className="offers-card-desc">{offer.description}</p>
        
//         <div className="offers-details-list">
//           <div className="offers-detail-item">
//             <strong>Discount:</strong> {offer.discount_percentage}%
//           </div>
          
//           <div className="offers-detail-item">
//             <strong>Min. Amount:</strong> ₹{offer.minimum_amount || 0}
//           </div>
          
//           {offer.offer_type === 'category' && (
//             <>
//               <div className="offers-detail-item">
//                 <strong>Category:</strong> {offer.category_name}
//               </div>
//               {offer.product_name && (
//                 <div className="offers-detail-item">
//                   <strong>Product:</strong> {offer.product_name}
//                 </div>
//               )}
//             </>
//           )}
          
//           <div className="offers-detail-item">
//             <strong>Valid:</strong> {offer.valid_from} to {offer.valid_until}
//           </div>
//         </div>

//         <div className="offers-card-actions">
//           <button 
//             className="offers-btn-edit"
//             onClick={() => handleEdit(offer)}
//           >
//             Edit
//           </button>
//           <button 
//             className="offers-btn-delete"
//             onClick={() => handleDelete(offer.id)}
//           >
//             Delete
//           </button>
//           <button 
//             className={`offers-btn-status ${offer.status}`}
//             onClick={() => handleToggleStatus(offer.id, offer.status)}
//           >
//             {offer.status === 'active' ? 'Deactivate' : 'Activate'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="offers-postings-page">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//       <div className={`offers-postings-main ${isCollapsed ? "sidebar-collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="offers-postings-container">
//           {/* Header Section */}
//           <div className="offers-postings-header">
//             <div className="offers-header-left">
//               <h1 className="offers-main-title">Offers & Flash Sales</h1>
//             </div>
//             <button 
//               className="offers-add-btn"
//               onClick={() => {
//                 if (activeTab === "regular") {
//                   setShowModal(true);
//                   // Pre-fetch categories when opening modal for regular offers
//                   console.log("Opening modal, pre-fetching categories..."); // Debug log
//                   fetchCategories();
//                 } else {
//                   setShowFlashSaleModal(true);
//                 }
//               }}
//             >
//               + Add {activeTab === "regular" ? "Offer" : "Flash Sale"}
//             </button>
//           </div>

//           {/* Tab Navigation */}
//           <div className="offers-tab-navigation">
//             <button 
//               className={`offers-tab-btn ${activeTab === "regular" ? "offers-tab-active" : ""}`}
//               onClick={() => setActiveTab("regular")}
//             >
//               Regular Offers
//             </button>
//             <button 
//               className={`offers-tab-btn ${activeTab === "flash" ? "offers-tab-active" : ""}`}
//               onClick={() => setActiveTab("flash")}
//             >
//               Flash Sales
//             </button>
//           </div>

//           {/* Filters Section */}
//           <div className="offers-filters-section">
//             <div className="offers-search-box">
//               <input
//                 type="text"
//                 placeholder={`Search ${activeTab === "regular" ? "offers" : "flash sales"}...`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="offers-search-input"
//               />
//               <span className="offers-search-icon">🔍</span>
//             </div>
            
//             {activeTab === "regular" && (
//               <select 
//                 value={filterType} 
//                 onChange={(e) => setFilterType(e.target.value)}
//                 className="offers-filter-select"
//               >
//                 <option value="All">All Offers</option>
//                 <option value="global">Global Offers</option>
//                 <option value="category">Category Specific</option>
//               </select>
//             )}
//           </div>

//           {loading && (
//             <div className="offers-loading">Loading offers...</div>
//           )}

//           {/* Content based on active tab */}
//           <div className="offers-cards-grid">
//             {currentItemsPage.length > 0 ? (
//               currentItemsPage.map(item => 
//                 activeTab === "regular" 
//                   ? renderRegularOfferCard(item)
//                   : renderFlashSaleCard(item)
//               )
//             ) : (
//               <div className="offers-empty-state">
//                 <div className="offers-empty-icon">📋</div>
//                 <h3>No {activeTab === "regular" ? "offers" : "flash sales"} found</h3>
//                 <p>
//                   {searchTerm 
//                     ? `No ${activeTab === "regular" ? "offers" : "flash sales"} match your search criteria.`
//                     : `Get started by creating your first ${activeTab === "regular" ? "offer" : "flash sale"}.`
//                   }
//                 </p>
//                 <button 
//                   className="offers-add-btn"
//                   onClick={() => {
//                     if (activeTab === "regular") {
//                       setShowModal(true);
//                       // Pre-fetch categories when opening modal from empty state
//                       console.log("Opening modal from empty state, fetching categories..."); // Debug log
//                       fetchCategories();
//                     } else {
//                       setShowFlashSaleModal(true);
//                     }
//                   }}
//                 >
//                   + Add {activeTab === "regular" ? "Offer" : "Flash Sale"}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && currentItems.length > 0 && (
//             <div className="offers-pagination">
//               <button 
//                 onClick={handlePrevPage} 
//                 disabled={currentPage === 1}
//                 className="offers-pagination-btn"
//               >
//                 Previous
//               </button>
//               <span className="offers-pagination-info">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <button 
//                 onClick={handleNextPage} 
//                 disabled={currentPage === totalPages}
//                 className="offers-pagination-btn"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Regular Offer Modal */}
//         {showModal && (
//           <div className="offers-modal-overlay">
//             <div className="offers-modal-content">
//               <div className="offers-modal-header">
//                 <h2 className="offers-modal-title">
//                   {editingOffer ? 'Edit Offer' : 'Create New Offer'}
//                 </h2>
//                 <button className="offers-close-btn" onClick={handleCloseModal}>×</button>
//               </div>
//               {renderRegularOfferForm()}
//             </div>
//           </div>
//         )}

//         {/* Flash Sale Modal */}
//         {showFlashSaleModal && (
//           <div className="offers-modal-overlay">
//             <div className="offers-modal-content offers-flash-modal">
//               <div className="offers-modal-header">
//                 <h2 className="offers-modal-title">
//                   {editingFlashSale ? 'Edit Flash Sale' : 'Create Flash Sale'}
//                 </h2>
//                 <button className="offers-close-btn" onClick={handleCloseFlashSaleModal}>×</button>
//               </div>
//               {renderFlashSaleForm()}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default OffersPostings;




// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../../../Shared/AdminSidebar/AdminHeader";
// import RegularOffersList from "./RegularOffersList";
// import FlashSalesList from "./FlashSalesList";
// import CreateRegularOffer from "./CreateRegularOffer";
// import CreateFlashSale from "./CreateFlashSale";
// import "./OffersPostings.css";

// function OffersPostings() {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState("regular");
//   const [currentView, setCurrentView] = useState("list"); // "list", "create", "edit"
//   const [editingOffer, setEditingOffer] = useState(null);
//   const [editingFlashSale, setEditingFlashSale] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("All");

//   // Handle navigation between views
//   const handleShowCreateForm = () => {
//     setCurrentView("create");
//     setEditingOffer(null);
//     setEditingFlashSale(null);
//   };

//   const handleShowEditForm = (item, type) => {
//     if (type === "regular") {
//       setEditingOffer(item);
//     } else {
//       setEditingFlashSale(item);
//     }
//     setCurrentView("create");
//   };

//   const handleBackToList = () => {
//     setCurrentView("list");
//     setEditingOffer(null);
//     setEditingFlashSale(null);
//   };

//   const handleCreateSuccess = () => {
//     handleBackToList();
//   };

//   // Render current view based on state
//   const renderCurrentView = () => {
//     if (currentView === "list") {
//       if (activeTab === "regular") {
//         return (
//           <RegularOffersList
//             searchTerm={searchTerm}
//             filterType={filterType}
//             onSearchChange={setSearchTerm}
//             onFilterChange={setFilterType}
//             onAddNew={handleShowCreateForm}
//             onEditItem={(offer) => handleShowEditForm(offer, "regular")}
//           />
//         );
//       } else {
//         return (
//           <FlashSalesList
//             searchTerm={searchTerm}
//             onSearchChange={setSearchTerm}
//             onAddNew={handleShowCreateForm}
//             onEditItem={(sale) => handleShowEditForm(sale, "flash")}
//           />
//         );
//       }
//     } else if (currentView === "create") {
//       if (activeTab === "regular") {
//         return (
//           <CreateRegularOffer
//             editingOffer={editingOffer}
//             onBack={handleBackToList}
//             onSuccess={handleCreateSuccess}
//           />
//         );
//       } else {
//         return (
//           <CreateFlashSale
//             editingFlashSale={editingFlashSale}
//             onBack={handleBackToList}
//             onSuccess={handleCreateSuccess}
//           />
//         );
//       }
//     }
//   };

//   return (
//     <div className="offers-postings-page">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//       <div className={`offers-postings-main ${isCollapsed ? "sidebar-collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="offers-postings-container">
//           {/* Header Section */}
//           <div className="offers-postings-header">
//             <div className="offers-header-left">
//               {currentView === "list" ? (
//                 <h1 className="offers-main-title">Offers & Flash Sales</h1>
//               ) : (
//                 <div className="offers-create-header">
//                   <button 
//                     className="offers-back-btn"
//                     onClick={handleBackToList}
//                   >
//                     ← Back to {activeTab === "regular" ? "Offers" : "Flash Sales"}
//                   </button>
//                   <h1 className="offers-main-title">
//                     {editingOffer || editingFlashSale 
//                       ? `Edit ${activeTab === "regular" ? "Offer" : "Flash Sale"}` 
//                       : `Create New ${activeTab === "regular" ? "Offer" : "Flash Sale"}`
//                     }
//                   </h1>
//                 </div>
//               )}
//             </div>
            
//             {currentView === "list" && (
//               <button 
//                 className="offers-add-btn"
//                 onClick={handleShowCreateForm}
//               >
//                 + Add {activeTab === "regular" ? "Offer" : "Flash Sale"}
//               </button>
//             )}
//           </div>

//           {/* Tab Navigation - Only show in list view */}
//           {currentView === "list" && (
//             <div className="offers-tab-navigation">
//               <button 
//                 className={`offers-tab-btn ${activeTab === "regular" ? "offers-tab-active" : ""}`}
//                 onClick={() => setActiveTab("regular")}
//               >
//                 Regular Offers
//               </button>
//               <button 
//                 className={`offers-tab-btn ${activeTab === "flash" ? "offers-tab-active" : ""}`}
//                 onClick={() => setActiveTab("flash")}
//               >
//                 Flash Sales
//               </button>
//             </div>
//           )}

//           {/* Render the current view */}
//           {renderCurrentView()}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default OffersPostings;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../../../Shared/AdminSidebar/AdminHeader";
import RegularOffersList from "./RegularOffersList";
import FlashSalesList from "./FlashSalesList";
import CreateRegularOffer from "./CreateRegularOffer";
import CreateFlashSale from "./CreateFlashSale";
import "./OffersPostings.css";

function OffersPostings() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("regular");
  const [currentView, setCurrentView] = useState("list"); // "list", "create", "edit"
  const [editingOffer, setEditingOffer] = useState(null);
  const [editingFlashSale, setEditingFlashSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Handle navigation between views
  const handleShowCreateForm = () => {
    setCurrentView("create");
    setEditingOffer(null);
    setEditingFlashSale(null);
  };

  const handleShowEditForm = (item, type) => {
    if (type === "regular") {
      setEditingOffer(item);
    } else {
      setEditingFlashSale(item);
    }
    setCurrentView("create");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setEditingOffer(null);
    setEditingFlashSale(null);
  };

  const handleCreateSuccess = () => {
    handleBackToList();
  };

  // Render current view based on state
  const renderCurrentView = () => {
    if (currentView === "list") {
      if (activeTab === "regular") {
        return (
          <RegularOffersList
            searchTerm={searchTerm}
            filterType={filterType}
            onSearchChange={setSearchTerm}
            onFilterChange={setFilterType}
            onAddNew={handleShowCreateForm}
            onEditItem={(offer) => handleShowEditForm(offer, "regular")}
          />
        );
      } else {
        return (
          <FlashSalesList
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddNew={handleShowCreateForm}
            onEditItem={(sale) => handleShowEditForm(sale, "flash")}
          />
        );
      }
    } else if (currentView === "create") {
      if (activeTab === "regular") {
        return (
          <CreateRegularOffer
            editingOffer={editingOffer}
            onBack={handleBackToList}
            onSuccess={handleCreateSuccess}
          />
        );
      } else {
        return (
          <CreateFlashSale
            editingFlashSale={editingFlashSale}
            onBack={handleBackToList}
            onSuccess={handleCreateSuccess}
          />
        );
      }
    }
  };

  return (
    <div className="offers-postings-page">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`offers-postings-main ${isCollapsed ? "sidebar-collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="offers-postings-container">
          {/* Header Section */}
          <div className="offers-postings-header">
            <div className="offers-header-left">
              {currentView === "list" ? (
                <h1 className="offers-main-title">Offers & Flash Sales</h1>
              ) : (
                <div className="offers-create-header">
                  <button 
                    className="offers-back-btn"
                    onClick={handleBackToList}
                  >
                    ← Back to {activeTab === "regular" ? "Offers" : "Flash Sales"}
                  </button>
                  <h1 className="offers-main-title">
                    {editingOffer || editingFlashSale 
                      ? `Edit ${activeTab === "regular" ? "Offer" : "Flash Sale"}` 
                      : `Create New ${activeTab === "regular" ? "Offer" : "Flash Sale"}`
                    }
                  </h1>
                </div>
              )}
            </div>
            
            {currentView === "list" && (
              <button 
                className="offers-add-btn"
                onClick={handleShowCreateForm}
              >
                + Add {activeTab === "regular" ? "Offer" : "Flash Sale"}
              </button>
            )}
          </div>

          {/* Tab Navigation - Only show in list view */}
          {currentView === "list" && (
            <div className="offers-tab-navigation">
              <button 
                className={`offers-tab-btn ${activeTab === "regular" ? "offers-tab-active" : ""}`}
                onClick={() => setActiveTab("regular")}
              >
                Regular Offers
              </button>
              <button 
                className={`offers-tab-btn ${activeTab === "flash" ? "offers-tab-active" : ""}`}
                onClick={() => setActiveTab("flash")}
              >
                Flash Sales
              </button>
            </div>
          )}

          {/* Render the current view */}
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
}

export default OffersPostings;