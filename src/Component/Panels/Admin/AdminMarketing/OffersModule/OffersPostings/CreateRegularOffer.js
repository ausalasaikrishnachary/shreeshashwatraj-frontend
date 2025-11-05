// import React, { useState, useEffect } from "react";

// function CreateRegularOffer({ editingOffer, onBack, onSuccess }) {
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
//   const [offerType, setOfferType] = useState("global");
//   const [categories, setCategories] = useState([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [removeExistingImage, setRemoveExistingImage] = useState(false); // New state for image removal

//   const API_BASE = "http://localhost:5000/api";
//   const API_BASE_CAT = "http://localhost:5000";

//   // Function to convert date to YYYY-MM-DD format for HTML date input
//   const formatDateForInput = (dateString) => {
//     if (!dateString) return '';
    
//     try {
//       // If the date is already in YYYY-MM-DD format, return as is
//       if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
//         return dateString;
//       }
      
//       // If date is in DD/MM/YYYY format (Indian format)
//       if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
//         const [day, month, year] = dateString.split('/');
//         return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
//       }
      
//       // For other formats, use Date object
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) {
//         return '';
//       }
      
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
      
//       return `${year}-${month}-${day}`;
//     } catch (error) {
//       console.error('Error formatting date for input:', error);
//       return '';
//     }
//   };

//   const fetchCategories = async () => {
//     setCategoriesLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_CAT}/categories`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       setCategories(data);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//     } finally {
//       setCategoriesLoading(false);
//     }
//   };

//   const createOffer = async (offerData) => {
//     const formDataToSend = new FormData();
    
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

//   const updateOffer = async (id, offerData, shouldRemoveImage = false) => {
//     const formDataToSend = new FormData();
    
//     formDataToSend.append('title', offerData.title);
//     formDataToSend.append('description', offerData.description);
//     formDataToSend.append('discountPercentage', offerData.discountPercentage);
//     formDataToSend.append('minimumAmount', offerData.minimumAmount);
//     formDataToSend.append('validFrom', offerData.validFrom);
//     formDataToSend.append('validUntil', offerData.validUntil);
//     formDataToSend.append('offerType', offerData.offerType);
//     formDataToSend.append('status', offerData.status);
    
//     // Add removeImage flag if user wants to remove existing image
//     if (shouldRemoveImage) {
//       formDataToSend.append('removeImage', 'true');
//     }
    
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

//   useEffect(() => {
//     if (editingOffer) {
//       setOfferType(editingOffer.offer_type);
      
//       // Format dates for the form inputs
//       const formattedValidFrom = formatDateForInput(editingOffer.valid_from);
//       const formattedValidUntil = formatDateForInput(editingOffer.valid_until);
      
//       console.log('Original dates:', {
//         valid_from: editingOffer.valid_from,
//         valid_until: editingOffer.valid_until
//       });
//       console.log('Formatted dates:', {
//         validFrom: formattedValidFrom,
//         validUntil: formattedValidUntil
//       });

//       setFormData({
//         title: editingOffer.title,
//         discountPercentage: editingOffer.discount_percentage,
//         minimumAmount: editingOffer.minimum_amount?.toString() || "0",
//         validFrom: formattedValidFrom,
//         validUntil: formattedValidUntil,
//         description: editingOffer.description,
//         image: null,
//         category: editingOffer.category_id || "",
//         productName: editingOffer.product_name || ""
//       });

//       // Reset image removal state when editing a new offer
//       setRemoveExistingImage(false);

//       if (editingOffer.offer_type === 'category') {
//         fetchCategories();
//       }
//     }
//   }, [editingOffer]);

//   useEffect(() => {
//     if (offerType === 'category' && categories.length === 0) {
//       fetchCategories();
//     }
//   }, [offerType]);

//   const handleInputChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "image") {
//       setFormData(prev => ({ ...prev, image: files[0] }));
//       // If user selects a new image, automatically uncheck "Remove Image"
//       if (files[0]) {
//         setRemoveExistingImage(false);
//       }
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleCategoryChange = (e) => {
//     const selectedCategoryId = e.target.value;
//     setFormData(prev => ({ ...prev, category: selectedCategoryId }));
    
//     if (selectedCategoryId) {
//       const selectedCategory = categories.find(cat => cat.id == selectedCategoryId);
//       if (selectedCategory && selectedCategory.current_discount_from_history) {
//         setFormData(prev => ({ 
//           ...prev, 
//           discountPercentage: selectedCategory.current_discount_from_history.toString()
//         }));
//       } else {
//         setFormData(prev => ({ 
//           ...prev, 
//           discountPercentage: ""
//         }));
//       }
//     } else {
//       setFormData(prev => ({ 
//         ...prev, 
//         discountPercentage: ""
//       }));
//     }
//   };

//   // Function to handle image removal
//   const handleRemoveImage = () => {
//     setRemoveExistingImage(!removeExistingImage);
//     // Clear any selected new image
//     setFormData(prev => ({ ...prev, image: null }));
    
//     // Reset file input
//     const fileInput = document.querySelector('input[name="image"]');
//     if (fileInput) {
//       fileInput.value = '';
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const offerData = {
//       ...formData,
//       discountPercentage: parseFloat(formData.discountPercentage),
//       minimumAmount: parseFloat(formData.minimumAmount) || 0,
//       offerType,
//       status: "active"
//     };

//     try {
//       if (editingOffer) {
//         await updateOffer(editingOffer.id, offerData, removeExistingImage);
//       } else {
//         await createOffer(offerData);
//       }
//       onSuccess();
//     } catch (error) {
//       alert('Error saving offer. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="offers-create-container">
//       <form onSubmit={handleSubmit} className="offers-form">
//         {/* Offer Type Selection */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">Offer Type *</label>
//           <div className="offers-type-selector">
//             <button
//               type="button"
//               className={`offers-type-btn ${offerType === 'global' ? 'offers-type-active' : ''}`}
//               onClick={() => setOfferType('global')}
//             >
//               Global Offer (All Products)
//             </button>
//             <button
//               type="button"
//               className={`offers-type-btn ${offerType === 'category' ? 'offers-type-active' : ''}`}
//               onClick={() => {
//                 setOfferType('category');
//                 if (categories.length === 0) {
//                   fetchCategories();
//                 }
//               }}
//             >
//               Category Specific
//             </button>
//           </div>
//         </div>

//         {/* Basic Information */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">Offer Title *</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             className="offers-form-input"
//             required
//             placeholder="Enter offer title"
//           />
//         </div>

//         <div className="offers-form-row">
//           <div className="offers-form-group">
//             <label className="offers-form-label">Discount Percentage *</label>
//             <input
//               type="number"
//               name="discountPercentage"
//               value={formData.discountPercentage}
//               onChange={handleInputChange}
//               className="offers-form-input"
//               min="0"
//               max="100"
//               step="0.01"
//               required
//               placeholder="e.g., 15.5"
//             />
//           </div>
          
//           <div className="offers-form-group">
//             <label className="offers-form-label">Minimum Amount (₹)</label>
//             <input
//               type="number"
//               name="minimumAmount"
//               value={formData.minimumAmount}
//               onChange={handleInputChange}
//               className="offers-form-input"
//               min="0"
//               step="0.01"
//               placeholder="Default: 0"
//             />
//           </div>
//         </div>

//         {/* Category Specific Fields */}
//         {offerType === 'category' && (
//           <div className="offers-form-row">
//             <div className="offers-form-group">
//               <label className="offers-form-label">Category *</label>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleCategoryChange}
//                 className="offers-form-select"
//                 required
//                 disabled={categoriesLoading}
//               >
//                 <option value="">Select Category</option>
//                 {categoriesLoading ? (
//                   <option value="" disabled>Loading categories...</option>
//                 ) : (
//                   categories.map(cat => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.category_name} 
//                       {cat.current_discount_from_history ? 
//                         ` (Current Discount: ${cat.current_discount_from_history}%)` : 
//                         ' (No active discount)'
//                       }
//                     </option>
//                   ))
//                 )}
//               </select>
//               {categoriesLoading && (
//                 <div className="offers-loading-small">Loading categories...</div>
//               )}
//             </div>
            
//             <div className="offers-form-group">
//               <label className="offers-form-label">Product Name</label>
//               <input
//                 type="text"
//                 name="productName"
//                 value={formData.productName}
//                 onChange={handleInputChange}
//                 className="offers-form-input"
//                 placeholder="Specific product or leave empty for all category products"
//               />
//             </div>
//           </div>
//         )}

//         {/* Validity Period */}
//         <div className="offers-form-row">
//           <div className="offers-form-group">
//             <label className="offers-form-label">Valid From *</label>
//             <input
//               type="date"
//               name="validFrom"
//               value={formData.validFrom}
//               onChange={handleInputChange}
//               className="offers-form-input"
//               required
//             />
//           </div>
          
//           <div className="offers-form-group">
//             <label className="offers-form-label">Valid Until *</label>
//             <input
//               type="date"
//               name="validUntil"
//               value={formData.validUntil}
//               onChange={handleInputChange}
//               className="offers-form-input"
//               required
//             />
//           </div>
//         </div>

//         {/* Additional Fields */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">Description *</label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleInputChange}
//             className="offers-form-textarea"
//             rows="3"
//             required
//             placeholder="Describe the offer details..."
//           />
//         </div>

//         <div className="offers-form-group">
//           <label className="offers-form-label">Offer Image</label>
//           <input
//             type="file"
//             name="image"
//             onChange={handleInputChange}
//             className="offers-form-file"
//             accept="image/*"
//           />
          
//           {editingOffer && editingOffer.image_url && !removeExistingImage && (
//             <div className="offers-current-image">
//               <p>Current Image:</p>
//               <img 
//                 src={`http://localhost:5000${editingOffer.image_url}`} 
//                 alt="Current offer" 
//                 className="offers-image-preview"
//               />
//               <button
//                 type="button"
//                 onClick={handleRemoveImage}
//                 className="offers-btn-remove-image"
//               >
//                 ✕ Remove Current Image
//               </button>
//             </div>
//           )}
          
//           {editingOffer && removeExistingImage && (
//             <div className="offers-image-removed">
//               <p>🗑️ Current image will be removed when you update the offer.</p>
//               <button
//                 type="button"
//                 onClick={handleRemoveImage}
//                 className="offers-btn-undo-remove"
//               >
//                 ↶ Undo Remove
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="offers-form-actions">
//           <button type="button" onClick={onBack} className="offers-btn-cancel">
//             Cancel
//           </button>
//           <button type="submit" className="offers-btn-submit" disabled={loading}>
//             {loading ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default CreateRegularOffer;



// import React, { useState, useEffect } from "react";

// function CreateRegularOffer({ editingOffer, onBack, onSuccess }) {
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
//   const [offerType, setOfferType] = useState("global");
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(false);
//   const [productsLoading, setProductsLoading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [removeExistingImage, setRemoveExistingImage] = useState(false);

//   const API_BASE = "http://localhost:5000/api";
//   const API_BASE_CAT = "http://localhost:5000";

//   // Function to convert date to YYYY-MM-DD format for HTML date input
//   const formatDateForInput = (dateString) => {
//     if (!dateString) return '';
    
//     try {
//       if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
//         return dateString;
//       }
      
//       if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
//         const [day, month, year] = dateString.split('/');
//         return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
//       }
      
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) {
//         return '';
//       }
      
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
      
//       return `${year}-${month}-${day}`;
//     } catch (error) {
//       console.error('Error formatting date for input:', error);
//       return '';
//     }
//   };

//   const fetchCategories = async () => {
//     setCategoriesLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_CAT}/categories`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log('📋 Categories loaded:', data);
//       setCategories(data);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//     } finally {
//       setCategoriesLoading(false);
//     }
//   };

//   // New function to fetch products by category
//   const fetchProductsByCategory = async (categoryId) => {
//     if (!categoryId) {
//       console.log('❌ No category ID provided');
//       setProducts([]);
//       return;
//     }
    
//     console.log('🔄 Fetching products for category ID:', categoryId);
//     setProductsLoading(true);
    
//     try {
//       const response = await fetch(`${API_BASE_CAT}/products/category/${categoryId}`);
//       console.log('📡 API Response status:', response.status);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('📦 Products data received:', data);
//       setProducts(data);
//     } catch (error) {
//       console.error('❌ Error fetching products by category:', error);
//       setProducts([]);
//     } finally {
//       setProductsLoading(false);
//     }
//   };

//   const createOffer = async (offerData) => {
//     const formDataToSend = new FormData();
    
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

//   const updateOffer = async (id, offerData, shouldRemoveImage = false) => {
//     const formDataToSend = new FormData();
    
//     formDataToSend.append('title', offerData.title);
//     formDataToSend.append('description', offerData.description);
//     formDataToSend.append('discountPercentage', offerData.discountPercentage);
//     formDataToSend.append('minimumAmount', offerData.minimumAmount);
//     formDataToSend.append('validFrom', offerData.validFrom);
//     formDataToSend.append('validUntil', offerData.validUntil);
//     formDataToSend.append('offerType', offerData.offerType);
//     formDataToSend.append('status', offerData.status);
    
//     if (shouldRemoveImage) {
//       formDataToSend.append('removeImage', 'true');
//     }
    
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

//   useEffect(() => {
//     if (editingOffer) {
//       setOfferType(editingOffer.offer_type);
      
//       const formattedValidFrom = formatDateForInput(editingOffer.valid_from);
//       const formattedValidUntil = formatDateForInput(editingOffer.valid_until);
      
//       console.log('Original dates:', {
//         valid_from: editingOffer.valid_from,
//         valid_until: editingOffer.valid_until
//       });
//       console.log('Formatted dates:', {
//         validFrom: formattedValidFrom,
//         validUntil: formattedValidUntil
//       });

//       setFormData({
//         title: editingOffer.title,
//         discountPercentage: editingOffer.discount_percentage,
//         minimumAmount: editingOffer.minimum_amount?.toString() || "0",
//         validFrom: formattedValidFrom,
//         validUntil: formattedValidUntil,
//         description: editingOffer.description,
//         image: null,
//         category: editingOffer.category_id || "",
//         productName: editingOffer.product_name || ""
//       });

//       setRemoveExistingImage(false);

//       if (editingOffer.offer_type === 'category' && editingOffer.category_id) {
//         fetchCategories();
//         // Fetch products for the category when editing
//         fetchProductsByCategory(editingOffer.category_id);
//       }
//     }
//   }, [editingOffer]);

//   useEffect(() => {
//     if (offerType === 'category' && categories.length === 0) {
//       fetchCategories();
//     }
//   }, [offerType]);

//   const handleInputChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "image") {
//       setFormData(prev => ({ ...prev, image: files[0] }));
//       if (files[0]) {
//         setRemoveExistingImage(false);
//       }
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleCategoryChange = (e) => {
//     const selectedCategoryId = e.target.value;
//     console.log('🎯 Category changed to:', selectedCategoryId);
    
//     setFormData(prev => ({ 
//       ...prev, 
//       category: selectedCategoryId,
//       productName: "" // Reset product name when category changes
//     }));
    
//     // Fetch products for the selected category
//     fetchProductsByCategory(selectedCategoryId);
    
//     if (selectedCategoryId) {
//       const selectedCategory = categories.find(cat => cat.id == selectedCategoryId);
//       if (selectedCategory && selectedCategory.current_discount_from_history) {
//         setFormData(prev => ({ 
//           ...prev, 
//           discountPercentage: selectedCategory.current_discount_from_history.toString()
//         }));
//       } else {
//         setFormData(prev => ({ 
//           ...prev, 
//           discountPercentage: ""
//         }));
//       }
//     } else {
//       setFormData(prev => ({ 
//         ...prev, 
//         discountPercentage: ""
//       }));
//     }
//   };

//   const handleProductChange = (e) => {
//     const selectedProductName = e.target.value;
//     setFormData(prev => ({ ...prev, productName: selectedProductName }));
//   };

//   // Function to handle image removal
//   const handleRemoveImage = () => {
//     setRemoveExistingImage(!removeExistingImage);
//     setFormData(prev => ({ ...prev, image: null }));
    
//     const fileInput = document.querySelector('input[name="image"]');
//     if (fileInput) {
//       fileInput.value = '';
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const offerData = {
//       ...formData,
//       discountPercentage: parseFloat(formData.discountPercentage),
//       minimumAmount: parseFloat(formData.minimumAmount) || 0,
//       offerType,
//       status: "active"
//     };

//     try {
//       if (editingOffer) {
//         await updateOffer(editingOffer.id, offerData, removeExistingImage);
//       } else {
//         await createOffer(offerData);
//       }
//       onSuccess();
//     } catch (error) {
//       alert('Error saving offer. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="offers-create-container">
//       <form onSubmit={handleSubmit} className="offers-form">
//         {/* Offer Type Selection */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">Offer Type *</label>
//           <div className="offers-type-selector">
//             <button
//               type="button"
//               className={`offers-type-btn ${offerType === 'global' ? 'offers-type-active' : ''}`}
//               onClick={() => setOfferType('global')}
//             >
//               Global Offer (All Products)
//             </button>
//             <button
//               type="button"
//               className={`offers-type-btn ${offerType === 'category' ? 'offers-type-active' : ''}`}
//               onClick={() => {
//                 setOfferType('category');
//                 if (categories.length === 0) {
//                   fetchCategories();
//                 }
//               }}
//             >
//               Category Specific
//             </button>
//           </div>
//         </div>

//         {/* Basic Information */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">Offer Title *</label>
//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleInputChange}
//             className="offers-form-input"
//             required
//             placeholder="Enter offer title"
//           />
//         </div>

//         <div className="offers-form-row">
//           <div className="offers-form-group">
//             <label className="offers-form-label">Discount Percentage *</label>
//             <input
//               type="number"
//               name="discountPercentage"
//               value={formData.discountPercentage}
//               onChange={handleInputChange}
//               className="offers-form-input"
//               min="0"
//               max="100"
//               step="0.01"
//               required
//               placeholder="e.g., 15.5"
//             />
//           </div>
          
//           <div className="offers-form-group">
//             <label className="offers-form-label">Minimum Amount (₹)</label>
//             <input
//               type="number"
//               name="minimumAmount"
//               value={formData.minimumAmount}
//               onChange={handleInputChange}
//               className="offers-form-input"
//               min="0"
//               step="0.01"
//               placeholder="Default: 0"
//             />
//           </div>
//         </div>

//         {/* Category Specific Fields */}
//         {offerType === 'category' && (
//           <div className="offers-form-row">
//             <div className="offers-form-group">
//               <label className="offers-form-label">Category *</label>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleCategoryChange}
//                 className="offers-form-select"
//                 required
//                 disabled={categoriesLoading}
//               >
//                 <option value="">Select Category</option>
//                 {categoriesLoading ? (
//                   <option value="" disabled>Loading categories...</option>
//                 ) : (
//                   categories.map(cat => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.category_name} 
//                       {cat.current_discount_from_history ? 
//                         ` (Current Discount: ${cat.current_discount_from_history}%)` : 
//                         ' (No active discount)'
//                       }
//                     </option>
//                   ))
//                 )}
//               </select>
//               {categoriesLoading && (
//                 <div className="offers-loading-small">Loading categories...</div>
//               )}
//             </div>
            
//             <div className="offers-form-group">
//               <label className="offers-form-label">Product Name</label>
//               <select
//                 name="productName"
//                 value={formData.productName}
//                 onChange={handleProductChange}
//                 className="offers-form-select"
//                 disabled={!formData.category || productsLoading}
//               >
//                 <option value="">All Products in Category</option>
//                 {productsLoading ? (
//                   <option value="" disabled>Loading products...</option>
//                 ) : (
//                   products.map(product => (
//                     <option key={product.id} value={product.goods_name}>
//                       {product.goods_name}
//                     </option>
//                   ))
//                 )}
//               </select>
//               {productsLoading && (
//                 <div className="offers-loading-small">Loading products...</div>
//               )}
//               {formData.category && products.length === 0 && !productsLoading && (
//                 <div className="offers-no-products">
//                   No products found in this category
//                   <br />
//                   <small>Debug: Category ID: {formData.category}, Products: {products.length}</small>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Validity Period */}
//         <div className="offers-form-row">
//           <div className="offers-form-group">
//             <label className="offers-form-label">Valid From *</label>
//             <input
//               type="date"
//               name="validFrom"
//               value={formData.validFrom}
//               onChange={handleInputChange}
//               className="offers-form-input"
//               required
//             />
//           </div>
          
//           <div className="offers-form-group">
//             <label className="offers-form-label">Valid Until *</label>
//             <input
//               type="date"
//               name="validUntil"
//               value={formData.validUntil}
//               onChange={handleInputChange}
//               className="offers-form-input"
//               required
//             />
//           </div>
//         </div>

//         {/* Additional Fields */}
//         <div className="offers-form-group">
//           <label className="offers-form-label">Description *</label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleInputChange}
//             className="offers-form-textarea"
//             rows="3"
//             required
//             placeholder="Describe the offer details..."
//           />
//         </div>

//         <div className="offers-form-group">
//           <label className="offers-form-label">Offer Image</label>
//           <input
//             type="file"
//             name="image"
//             onChange={handleInputChange}
//             className="offers-form-file"
//             accept="image/*"
//           />
          
//           {editingOffer && editingOffer.image_url && !removeExistingImage && (
//             <div className="offers-current-image">
//               <p>Current Image:</p>
//               <img 
//                 src={`http://localhost:5000${editingOffer.image_url}`} 
//                 alt="Current offer" 
//                 className="offers-image-preview"
//               />
//               <button
//                 type="button"
//                 onClick={handleRemoveImage}
//                 className="offers-btn-remove-image"
//               >
//                 ✕ Remove Current Image
//               </button>
//             </div>
//           )}
          
//           {editingOffer && removeExistingImage && (
//             <div className="offers-image-removed">
//               <p>🗑️ Current image will be removed when you update the offer.</p>
//               <button
//                 type="button"
//                 onClick={handleRemoveImage}
//                 className="offers-btn-undo-remove"
//               >
//                 ↶ Undo Remove
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="offers-form-actions">
//           <button type="button" onClick={onBack} className="offers-btn-cancel">
//             Cancel
//           </button>
//           <button type="submit" className="offers-btn-submit" disabled={loading}>
//             {loading ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default CreateRegularOffer;


import React, { useState, useEffect } from "react";

function CreateRegularOffer({ editingOffer, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    discountPercentage: "",
    minimumAmount: "0",
    validFrom: "",
    validUntil: "",
    description: "",
    image: null,
    category: "",
    productName: "",
    productId: "" // NEW: store product ID
  });
  const [offerType, setOfferType] = useState("global");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const API_BASE = "http://localhost:5000/api";
  const API_BASE_CAT = "http://localhost:5000";

  // Function to convert date to YYYY-MM-DD format for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch(`${API_BASE_CAT}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('📋 Categories loaded:', data);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // New function to fetch products by category
  const fetchProductsByCategory = async (categoryId) => {
    if (!categoryId) {
      console.log('❌ No category ID provided');
      setProducts([]);
      return;
    }
    
    console.log('🔄 Fetching products for category ID:', categoryId);
    setProductsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/products/category/${categoryId}`);
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Products data received:', data);
      setProducts(data);
    } catch (error) {
      console.error('❌ Error fetching products by category:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const createOffer = async (offerData) => {
    const formDataToSend = new FormData();
    
    formDataToSend.append('title', offerData.title);
    formDataToSend.append('description', offerData.description);
    formDataToSend.append('discountPercentage', offerData.discountPercentage);
    formDataToSend.append('minimumAmount', offerData.minimumAmount);
    formDataToSend.append('validFrom', offerData.validFrom);
    formDataToSend.append('validUntil', offerData.validUntil);
    formDataToSend.append('offerType', offerData.offerType);
    
    if (offerData.category) {
      formDataToSend.append('category', offerData.category);
    }
    if (offerData.productName) {
      formDataToSend.append('productName', offerData.productName);
    }
    if (offerData.productId) {
      formDataToSend.append('productId', offerData.productId); // NEW: send product ID
    }
    if (offerData.image) {
      formDataToSend.append('image', offerData.image);
    }

    try {
      const response = await fetch(`${API_BASE}/offers`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  };

  const updateOffer = async (id, offerData, shouldRemoveImage = false) => {
    const formDataToSend = new FormData();
    
    formDataToSend.append('title', offerData.title);
    formDataToSend.append('description', offerData.description);
    formDataToSend.append('discountPercentage', offerData.discountPercentage);
    formDataToSend.append('minimumAmount', offerData.minimumAmount);
    formDataToSend.append('validFrom', offerData.validFrom);
    formDataToSend.append('validUntil', offerData.validUntil);
    formDataToSend.append('offerType', offerData.offerType);
    formDataToSend.append('status', offerData.status);
    
    if (shouldRemoveImage) {
      formDataToSend.append('removeImage', 'true');
    }
    
    if (offerData.category) {
      formDataToSend.append('category', offerData.category);
    }
    if (offerData.productName) {
      formDataToSend.append('productName', offerData.productName);
    }
    if (offerData.productId) {
      formDataToSend.append('productId', offerData.productId); // NEW: send product ID
    }
    if (offerData.image) {
      formDataToSend.append('image', offerData.image);
    }

    try {
      const response = await fetch(`${API_BASE}/offers/${id}`, {
        method: 'PUT',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (editingOffer) {
      setOfferType(editingOffer.offer_type);
      
      const formattedValidFrom = formatDateForInput(editingOffer.valid_from);
      const formattedValidUntil = formatDateForInput(editingOffer.valid_until);
      
      console.log('Original dates:', {
        valid_from: editingOffer.valid_from,
        valid_until: editingOffer.valid_until
      });
      console.log('Formatted dates:', {
        validFrom: formattedValidFrom,
        validUntil: formattedValidUntil
      });

      setFormData({
        title: editingOffer.title,
        discountPercentage: editingOffer.discount_percentage,
        minimumAmount: editingOffer.minimum_amount?.toString() || "0",
        validFrom: formattedValidFrom,
        validUntil: formattedValidUntil,
        description: editingOffer.description,
        image: null,
        category: editingOffer.category_id || "",
        productName: editingOffer.product_name || "",
        productId: editingOffer.product_id || "" // NEW: set product ID when editing
      });

      setRemoveExistingImage(false);

      if (editingOffer.offer_type === 'category' && editingOffer.category_id) {
        fetchCategories();
        // Fetch products for the category when editing
        fetchProductsByCategory(editingOffer.category_id);
      }
    }
  }, [editingOffer]);

  useEffect(() => {
    if (offerType === 'category' && categories.length === 0) {
      fetchCategories();
    }
  }, [offerType]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData(prev => ({ ...prev, image: files[0] }));
      if (files[0]) {
        setRemoveExistingImage(false);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    console.log('🎯 Category changed to:', selectedCategoryId);
    
    setFormData(prev => ({ 
      ...prev, 
      category: selectedCategoryId,
      productName: "", // Reset product name when category changes
      productId: "" // Reset product ID when category changes
    }));
    
    // Fetch products for the selected category
    fetchProductsByCategory(selectedCategoryId);
    
    if (selectedCategoryId) {
      const selectedCategory = categories.find(cat => cat.id == selectedCategoryId);
      if (selectedCategory && selectedCategory.current_discount_from_history) {
        setFormData(prev => ({ 
          ...prev, 
          discountPercentage: selectedCategory.current_discount_from_history.toString()
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          discountPercentage: ""
        }));
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        discountPercentage: ""
      }));
    }
  };

  const handleProductChange = (e) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === "") {
      // If "All Products in Category" is selected
      setFormData(prev => ({ 
        ...prev, 
        productName: "",
        productId: ""
      }));
    } else {
      // Find the selected product to get both name and ID
      const selectedProduct = products.find(product => product.id == selectedValue);
      if (selectedProduct) {
        setFormData(prev => ({ 
          ...prev, 
          productName: selectedProduct.goods_name,
          productId: selectedProduct.id
        }));
      }
    }
  };

  // Function to handle image removal
  const handleRemoveImage = () => {
    setRemoveExistingImage(!removeExistingImage);
    setFormData(prev => ({ ...prev, image: null }));
    
    const fileInput = document.querySelector('input[name="image"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const offerData = {
      ...formData,
      discountPercentage: parseFloat(formData.discountPercentage),
      minimumAmount: parseFloat(formData.minimumAmount) || 0,
      offerType,
      status: "active"
    };

    console.log('📤 Submitting offer data:', offerData);

    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, offerData, removeExistingImage);
      } else {
        await createOffer(offerData);
      }
      onSuccess();
    } catch (error) {
      alert('Error saving offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="offers-create-container">
      <form onSubmit={handleSubmit} className="offers-form">
        {/* Offer Type Selection */}
        <div className="offers-form-group">
          <label className="offers-form-label">Offer Type *</label>
          <div className="offers-type-selector">
            <button
              type="button"
              className={`offers-type-btn ${offerType === 'global' ? 'offers-type-active' : ''}`}
              onClick={() => setOfferType('global')}
            >
              Global Offer (All Products)
            </button>
            <button
              type="button"
              className={`offers-type-btn ${offerType === 'category' ? 'offers-type-active' : ''}`}
              onClick={() => {
                setOfferType('category');
                if (categories.length === 0) {
                  fetchCategories();
                }
              }}
            >
              Category Specific
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="offers-form-group">
          <label className="offers-form-label">Offer Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="offers-form-input"
            required
            placeholder="Enter offer title"
          />
        </div>

        <div className="offers-form-row">
          <div className="offers-form-group">
            <label className="offers-form-label">Discount Percentage *</label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              className="offers-form-input"
              min="0"
              max="100"
              step="0.01"
              required
              placeholder="e.g., 15.5"
            />
          </div>
          
          <div className="offers-form-group">
            <label className="offers-form-label">Minimum Amount (₹)</label>
            <input
              type="number"
              name="minimumAmount"
              value={formData.minimumAmount}
              onChange={handleInputChange}
              className="offers-form-input"
              min="0"
              step="0.01"
              placeholder="Default: 0"
            />
          </div>
        </div>

        {/* Category Specific Fields */}
        {offerType === 'category' && (
          <div className="offers-form-row">
            <div className="offers-form-group">
              <label className="offers-form-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className="offers-form-select"
                required
                disabled={categoriesLoading}
              >
                <option value="">Select Category</option>
                {categoriesLoading ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name} 
                      {cat.current_discount_from_history ? 
                        ` (Current Discount: ${cat.current_discount_from_history}%)` : 
                        ' (No active discount)'
                      }
                    </option>
                  ))
                )}
              </select>
              {categoriesLoading && (
                <div className="offers-loading-small">Loading categories...</div>
              )}
            </div>
            
            <div className="offers-form-group">
              <label className="offers-form-label">Product Name</label>
              <select
                name="productName"
                value={formData.productId} // Use productId as value
                onChange={handleProductChange}
                className="offers-form-select"
                disabled={!formData.category || productsLoading}
              >
                <option value="">All Products in Category</option>
                {productsLoading ? (
                  <option value="" disabled>Loading products...</option>
                ) : (
                  products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.goods_name} (ID: {product.id})
                    </option>
                  ))
                )}
              </select>
              {productsLoading && (
                <div className="offers-loading-small">Loading products...</div>
              )}
              {formData.category && products.length === 0 && !productsLoading && (
                <div className="offers-no-products">
                  No products found in this category
                  <br />
                  <small>Debug: Category ID: {formData.category}, Products: {products.length}</small>
                </div>
              )}
              {/* Debug info */}
              {formData.productId && (
                <div className="offers-debug-info">
                  <small>Selected Product ID: {formData.productId}, Name: {formData.productName}</small>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validity Period */}
        <div className="offers-form-row">
          <div className="offers-form-group">
            <label className="offers-form-label">Valid From *</label>
            <input
              type="date"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleInputChange}
              className="offers-form-input"
              required
            />
          </div>
          
          <div className="offers-form-group">
            <label className="offers-form-label">Valid Until *</label>
            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleInputChange}
              className="offers-form-input"
              required
            />
          </div>
        </div>

        {/* Additional Fields */}
        <div className="offers-form-group">
          <label className="offers-form-label">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="offers-form-textarea"
            rows="3"
            required
            placeholder="Describe the offer details..."
          />
        </div>

        <div className="offers-form-group">
          <label className="offers-form-label">Offer Image</label>
          <input
            type="file"
            name="image"
            onChange={handleInputChange}
            className="offers-form-file"
            accept="image/*"
          />
          
          {editingOffer && editingOffer.image_url && !removeExistingImage && (
            <div className="offers-current-image">
              <p>Current Image:</p>
              <img 
                src={`http://localhost:5000${editingOffer.image_url}`} 
                alt="Current offer" 
                className="offers-image-preview"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="offers-btn-remove-image"
              >
                ✕ Remove Current Image
              </button>
            </div>
          )}
          
          {editingOffer && removeExistingImage && (
            <div className="offers-image-removed">
              <p>🗑️ Current image will be removed when you update the offer.</p>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="offers-btn-undo-remove"
              >
                ↶ Undo Remove
              </button>
            </div>
          )}
        </div>

        <div className="offers-form-actions">
          <button type="button" onClick={onBack} className="offers-btn-cancel">
            Cancel
          </button>
          <button type="submit" className="offers-btn-submit" disabled={loading}>
            {loading ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRegularOffer;