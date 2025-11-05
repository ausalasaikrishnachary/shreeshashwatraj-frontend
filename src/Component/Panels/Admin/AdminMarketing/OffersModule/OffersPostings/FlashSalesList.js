import React, { useState, useEffect } from "react";

function FlashSalesList({ searchTerm, onSearchChange, onAddNew, onEditItem }) {
  const [flashSales, setFlashSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 5;

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

  // Sample data - replace with actual API calls
  useEffect(() => {
    // Simulate loading flash sales
    const sampleFlashSales = [
      {
        id: 1,
        title: "Weekend BOGO Sale",
        description: "Buy one get one free on selected items",
        flashSaleType: "bogo",
        status: "active",
        validFrom: "2024-01-15",
        validUntil: "2024-01-20",
        startTime: "09:00",
        endTime: "21:00",
        buyQuantity: 1,
        getQuantity: 1,
        purchaseLimit: 2,
        createdAt: "2024-01-10"
      },
      {
        id: 2,
        title: "Clearance Sale",
        description: "Clearance discounts on old stock",
        flashSaleType: "clearance",
        status: "active",
        validFrom: "2024-12-25",
        validUntil: "2024-12-31",
        startTime: "10:00",
        endTime: "22:00",
        discountValue: 30,
        purchaseLimit: 5,
        createdAt: "2024-12-20"
      }
    ];
    setFlashSales(sampleFlashSales);
  }, []);

  const flashSaleTypes = [
    { value: "bogo", label: "Buy One Get One", description: "Buy X get Y free" },
    { value: "expiry", label: "Near Expiry", description: "Discounts on expiring products" },
    { value: "clearance", label: "Clearance Sale", description: "Stock clearance discounts" },
    { value: "seasonal", label: "Seasonal Flash", description: "Seasonal product discounts" },
    { value: "hourly", label: "Hourly Deal", description: "Limited time hourly discounts" },
    { value: "limited_stock", label: "Limited Stock", description: "Limited quantity offers" }
  ];

  const handleDeleteFlashSale = (id) => {
    if (window.confirm("Are you sure you want to delete this flash sale?")) {
      setFlashSales(flashSales.filter(sale => sale.id !== id));
    }
  };

  const toggleFlashSaleStatus = (id) => {
    setFlashSales(flashSales.map(sale => 
      sale.id === id 
        ? { ...sale, status: sale.status === "active" ? "inactive" : "active" }
        : sale
    ));
  };

  // Filter and Pagination Logic
  const filteredFlashSales = flashSales.filter((sale) => {
    return sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           sale.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredFlashSales.length / offersPerPage);
  const indexOfLastItem = currentPage * offersPerPage;
  const indexOfFirstItem = indexOfLastItem - offersPerPage;
  const currentItemsPage = filteredFlashSales.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const renderFlashSaleCard = (sale) => {
    const getFlashSaleDescription = () => {
      switch (sale.flashSaleType) {
        case 'bogo':
          return `Buy ${sale.buyQuantity} Get ${sale.getQuantity} Free`;
        case 'expiry':
          return `${sale.discountValue}% off - Expiring within ${sale.expiryThreshold} days`;
        case 'clearance':
          return `${sale.discountValue}% off - Clearance Sale`;
        case 'seasonal':
          return `${sale.discountValue}% off - Seasonal Offer`;
        case 'hourly':
          return `${sale.discountValue}% off - Hourly Deal`;
        case 'limited_stock':
          return `${sale.discountValue}% off - Limited Stock`;
        default:
          return sale.description;
      }
    };

    return (
      <div key={sale.id} className={`offers-card-item offers-flash-sale-card ${sale.status}`}>
        <div className="offers-flash-badge">FLASH SALE</div>
        <div className="offers-card-image">
          {sale.image ? (
            <img src={sale.image} alt={sale.title} />
          ) : (
            <div className="offers-no-image">Flash Sale</div>
          )}
        </div>
        
        <div className="offers-card-content">
          <div className="offers-card-header">
            <h3 className="offers-card-title">{sale.title}</h3>
            <span className={`offers-status-badge ${sale.status}`}>
              {sale.status}
            </span>
          </div>
          
          <p className="offers-card-desc">{sale.description}</p>
          
          <div className="offers-details-list">
            <div className="offers-detail-item">
              <strong>Type:</strong> 
              {flashSaleTypes.find(t => t.value === sale.flashSaleType)?.label}
            </div>
            
            <div className="offers-detail-item">
              <strong>Offer:</strong> {getFlashSaleDescription()}
            </div>
            
            <div className="offers-detail-item">
              <strong>Timing:</strong> {sale.startTime} - {sale.endTime}
            </div>
            
            <div className="offers-detail-item">
              <strong>Valid:</strong> {formatToIndianDate(sale.validFrom)} to {formatToIndianDate(sale.validUntil)}
            </div>

            {sale.purchaseLimit > 1 && (
              <div className="offers-detail-item">
                <strong>Limit:</strong> {sale.purchaseLimit} per customer
              </div>
            )}

            <div className="offers-detail-item">
              <strong>Created:</strong> {formatToIndianDate(sale.createdAt)}
            </div>
          </div>

          <div className="offers-card-actions">
            <button 
              className="offers-btn-edit"
              onClick={() => onEditItem(sale)}
            >
              Edit
            </button>
            <button 
              className="offers-btn-delete"
              onClick={() => handleDeleteFlashSale(sale.id)}
            >
              Delete
            </button>
            <button 
              className={`offers-btn-status ${sale.status}`}
              onClick={() => toggleFlashSaleStatus(sale.id)}
            >
              {sale.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="offers-list-container">
      {/* Filters Section */}
      <div className="offers-filters-section">
        <div className="offers-search-box">
          <input
            type="text"
            placeholder="Search flash sales..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="offers-search-input"
          />
          <span className="offers-search-icon">🔍</span>
        </div>
      </div>

      {/* Flash Sales Grid */}
      <div className="offers-cards-grid">
        {currentItemsPage.length > 0 ? (
          currentItemsPage.map(renderFlashSaleCard)
        ) : (
          <div className="offers-empty-state">
            <div className="offers-empty-icon">⚡</div>
            <h3>No flash sales found</h3>
            <p>
              {searchTerm 
                ? "No flash sales match your search criteria."
                : "Get started by creating your first flash sale."
              }
            </p>
            <button 
              className="offers-add-btn"
              onClick={onAddNew}
            >
              + Add Flash Sale
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && filteredFlashSales.length > 0 && (
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

export default FlashSalesList;