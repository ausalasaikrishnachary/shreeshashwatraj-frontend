// import React, { useState, useEffect } from "react";

// function RegularOffersList({ searchTerm, filterType, onSearchChange, onFilterChange, onAddNew, onEditItem }) {
//   const [offers, setOffers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const offersPerPage = 5;

//   const API_BASE = "http://localhost:5000/api";

//   // Function to format date to Indian format (DD/MM/YYYY)
//   const formatToIndianDate = (dateString) => {
//     if (!dateString) return 'N/A';
    
//     try {
//       const date = new Date(dateString);
      
//       // Check if date is valid
//       if (isNaN(date.getTime())) {
//         return 'Invalid Date';
//       }
      
//       const day = String(date.getDate()).padStart(2, '0');
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const year = date.getFullYear();
      
//       return `${day}/${month}/${year}`;
//     } catch (error) {
//       console.error('Error formatting date:', error);
//       return 'Invalid Date';
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

//   const deleteOffer = async (id) => {
//     try {
//       const response = await fetch(`${API_BASE}/offers/${id}`, {
//         method: 'DELETE',
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       fetchOffers();
//     } catch (error) {
//       console.error('Error deleting offer:', error);
//       alert('Error deleting offer. Please try again.');
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
      
//       fetchOffers();
//     } catch (error) {
//       console.error('Error updating offer status:', error);
//       alert('Error updating offer status. Please try again.');
//     }
//   };

//   useEffect(() => {
//     fetchOffers();
//   }, [currentPage, searchTerm, filterType]);

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this offer?")) {
//       await deleteOffer(id);
//     }
//   };

//   const handleToggleStatus = async (id, currentStatus) => {
//     await toggleOfferStatus(id, currentStatus);
//   };

//   // Filter and Pagination Logic
//   const filteredOffers = offers.filter((offer) => {
//     const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          offer.description.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterType === "All" || offer.offer_type === filterType;
//     return matchesSearch && matchesFilter;
//   });

//   const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
//   const indexOfLastItem = currentPage * offersPerPage;
//   const indexOfFirstItem = indexOfLastItem - offersPerPage;
//   const currentItemsPage = filteredOffers.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

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
//             <div className="offers-detail-item">
//               <strong>Category:</strong> {offer.category_name}
//             </div>
//           )}
          
//           <div className="offers-detail-item">
//             <strong>Valid:</strong> {formatToIndianDate(offer.valid_from)} to {formatToIndianDate(offer.valid_until)}
//           </div>
//         </div>

//         <div className="offers-card-actions">
//           <button 
//             className="offers-btn-edit"
//             onClick={() => onEditItem(offer)}
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
//     <div className="offers-list-container">
//       {/* Filters Section */}
//       <div className="offers-filters-section">
//         <div className="offers-search-box">
//           <input
//             type="text"
//             placeholder="Search offers..."
//             value={searchTerm}
//             onChange={(e) => onSearchChange(e.target.value)}
//             className="offers-search-input"
//           />
//           <span className="offers-search-icon">🔍</span>
//         </div>
        
//         <select 
//           value={filterType} 
//           onChange={(e) => onFilterChange(e.target.value)}
//           className="offers-filter-select"
//         >
//           <option value="All">All Offers</option>
//           <option value="global">Global Offers</option>
//           <option value="category">Category Specific</option>
//         </select>
//       </div>

//       {loading && (
//         <div className="offers-loading">Loading offers...</div>
//       )}

//       {/* Offers Grid */}
//       <div className="offers-cards-grid">
//         {currentItemsPage.length > 0 ? (
//           currentItemsPage.map(renderRegularOfferCard)
//         ) : (
//           <div className="offers-empty-state">
//             <div className="offers-empty-icon">📋</div>
//             <h3>No offers found</h3>
//             <p>
//               {searchTerm 
//                 ? "No offers match your search criteria."
//                 : "Get started by creating your first offer."
//               }
//             </p>
//             <button 
//               className="offers-add-btn"
//               onClick={onAddNew}
//             >
//               + Add Offer
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && filteredOffers.length > 0 && (
//         <div className="offers-pagination">
//           <button 
//             onClick={handlePrevPage} 
//             disabled={currentPage === 1}
//             className="offers-pagination-btn"
//           >
//             Previous
//           </button>
//           <span className="offers-pagination-info">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button 
//             onClick={handleNextPage} 
//             disabled={currentPage === totalPages}
//             className="offers-pagination-btn"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default RegularOffersList;



import React, { useState, useEffect } from "react";
import { baseurl } from "../../../../../BaseURL/BaseURL";

function RegularOffersList({ searchTerm, filterType, onSearchChange, onFilterChange, onAddNew, onEditItem }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 5;

  const API_BASE = `${baseurl}/api`;

  // Function to format date to Indian format (DD/MM/YYYY)
  const formatToIndianDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/offers?page=${currentPage}&limit=${offersPerPage}&search=${searchTerm}&offer_type=${filterType === 'All' ? '' : filterType}`
      );
      const data = await response.json();
      if (data.offers) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/offers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Error deleting offer. Please try again.');
    }
  };

  const toggleOfferStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`${API_BASE}/offers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer status:', error);
      alert('Error updating offer status. Please try again.');
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [currentPage, searchTerm, filterType]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      await deleteOffer(id);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await toggleOfferStatus(id, currentStatus);
  };

  // Filter and Pagination Logic
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || offer.offer_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
  const indexOfLastItem = currentPage * offersPerPage;
  const indexOfFirstItem = indexOfLastItem - offersPerPage;
  const currentItemsPage = filteredOffers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const renderRegularOfferCard = (offer) => (
    <div key={offer.id} className={`offers-card-item ${offer.status}`}>
      <div className="offers-card-image">
        {offer.image_url ? (
          <img src={`${baseurl}${offer.image_url}`} alt={offer.title} />
        ) : (
          <div className="offers-no-image">No Image</div>
        )}
      </div>
      
      <div className="offers-card-content">
        <div className="offers-card-header">
          <h3 className="offers-card-title">{offer.title}</h3>
          <span className={`offers-status-badge ${offer.status}`}>
            {offer.status}
          </span>
        </div>
        
        <p className="offers-card-desc">{offer.description}</p>
        
        <div className="offers-details-list">
          <div className="offers-detail-item">
            <strong>Discount:</strong> {offer.discount_percentage}%
          </div>
          
          <div className="offers-detail-item">
            <strong>Min. Amount:</strong> ₹{offer.minimum_amount || 0}
          </div>
          
          <div className="offers-detail-item">
            <strong>Type:</strong> 
            {offer.offer_type === 'global' && ' Global Offer'}
            {offer.offer_type === 'category' && ' Category Specific'}
            {offer.offer_type === 'product' && ' Product Specific'}
          </div>
          
          {offer.offer_type === 'category' && (
            <div className="offers-detail-item">
              <strong>Category:</strong> {offer.category_name}
            </div>
          )}
          
          {offer.offer_type === 'product' && (
            <div className="offers-detail-item">
              <strong>Product:</strong> {offer.product_name}
            </div>
          )}
          
          <div className="offers-detail-item">
            <strong>Valid:</strong> {formatToIndianDate(offer.valid_from)} to {formatToIndianDate(offer.valid_until)}
          </div>
        </div>

        <div className="offers-card-actions">
          <button 
            className="offers-btn-edit"
            onClick={() => onEditItem(offer)}
          >
            Edit
          </button>
          <button 
            className="offers-btn-delete"
            onClick={() => handleDelete(offer.id)}
          >
            Delete
          </button>
          <button 
            className={`offers-btn-status ${offer.status}`}
            onClick={() => handleToggleStatus(offer.id, offer.status)}
          >
            {offer.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="offers-list-container">
      {/* Filters Section */}
      <div className="offers-filters-section">
        <div className="offers-search-box">
          <input
            type="text"
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="offers-search-input"
          />
          <span className="offers-search-icon">🔍</span>
        </div>
        
        <select 
          value={filterType} 
          onChange={(e) => onFilterChange(e.target.value)}
          className="offers-filter-select"
        >
          <option value="All">All Offers</option>
          <option value="global">Global Offers</option>
          <option value="category">Category Specific</option>
          <option value="product">Product Specific</option>
        </select>
      </div>

      {loading && (
        <div className="offers-loading">Loading offers...</div>
      )}

      {/* Offers Grid */}
      <div className="offers-cards-grid">
        {currentItemsPage.length > 0 ? (
          currentItemsPage.map(renderRegularOfferCard)
        ) : (
          <div className="offers-empty-state">
            <div className="offers-empty-icon">📋</div>
            <h3>No offers found</h3>
            <p>
              {searchTerm 
                ? "No offers match your search criteria."
                : "Get started by creating your first offer."
              }
            </p>
            <button 
              className="offers-add-btn"
              onClick={onAddNew}
            >
              + Add Offer
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && filteredOffers.length > 0 && (
        <div className="offers-pagination">
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
            className="offers-pagination-btn"
          >
            Previous
          </button>
          <span className="offers-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="offers-pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default RegularOffersList;