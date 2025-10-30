

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../../Shared/AdminSidebar/AdminHeader";
// import "../Marketing.css";

// function GlobalOffers() {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const navigate = useNavigate();

//   const handleNavigation = (path) => {
//     navigate(path);
//   };

//   return (
//     <div className="marketing-main">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//       <div className={`marketing-content ${isCollapsed ? "collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="marketing-buttons-container">
//           <button
//             className="marketing-btn"
//             onClick={() => handleNavigation("/admin/marketing/global-offers")}
//           >
//             Global Offers
//           </button>

        

        
//         </div>
//       </div>
//     </div>
//   );
// }

// export default GlobalOffers;



// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../../Shared/AdminSidebar/AdminHeader";
// import "../Marketing.css";
// import "./GlobalOffers.css";

// function GlobalOffers() {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [offers, setOffers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     productName: "",
//     discountType: "Percentage",
//     discountValue: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//   });

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleAddOffer = (e) => {
//     e.preventDefault();
//     setOffers([...offers, { ...formData, id: Date.now() }]);
//     setFormData({
//       productName: "",
//       discountType: "Percentage",
//       discountValue: "",
//       description: "",
//       startDate: "",
//       endDate: "",
//     });
//     setShowModal(false);
//   };

//   const handleBack = () => {
//     navigate(-1); // Go back to the previous page
//   };

//   return (
//     <div className="global-offers-main">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//       <div className={`global-offers-content ${isCollapsed ? "collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="offers-header">
//           <h2>Global Offers</h2>
//           <div className="offers-header-buttons">
//             <button className="back-btn" onClick={handleBack}>
//               ← Back
//             </button>
//             <button className="add-offer-btn" onClick={() => setShowModal(true)}>
//               + Add Global Offer
//             </button>
//           </div>
//         </div>

//         <table className="offers-table">
//           <thead>
//             <tr>
//               <th>Product Name</th>
//               <th>Discount Type</th>
//               <th>Discount Value</th>
//               <th>Description</th>
//               <th>Start Date</th>
//               <th>End Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {offers.length > 0 ? (
//               offers.map((offer) => (
//                 <tr key={offer.id}>
//                   <td>{offer.productName}</td>
//                   <td>{offer.discountType}</td>
//                   <td>
//                     {offer.discountType === "Percentage"
//                       ? `${offer.discountValue}%`
//                       : `₹${offer.discountValue}`}
//                   </td>
//                   <td>{offer.description}</td>
//                   <td>{offer.startDate}</td>
//                   <td>{offer.endDate}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" style={{ textAlign: "center" }}>
//                   No offers found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>

//         {showModal && (
//           <div className="modal">
//             <div className="modal-content">
//               <span className="close" onClick={() => setShowModal(false)}>
//                 &times;
//               </span>
//               <h3>Add Global Offer</h3>
//               <form onSubmit={handleAddOffer}>
//                 <label>Product Name</label>
//                 <input
//                   type="text"
//                   name="productName"
//                   value={formData.productName}
//                   onChange={handleInputChange}
//                   required
//                 />

//                 <label>Discount Type</label>
//                 <select
//                   name="discountType"
//                   value={formData.discountType}
//                   onChange={handleInputChange}
//                 >
//                   <option value="Percentage">Percentage</option>
//                   <option value="Flat">Flat</option>
//                 </select>

//                 <label>Discount Value</label>
//                 <input
//                   type="number"
//                   name="discountValue"
//                   value={formData.discountValue}
//                   onChange={handleInputChange}
//                   required
//                 />

//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                 ></textarea>

//                 <label>Start Date</label>
//                 <input
//                   type="date"
//                   name="startDate"
//                   value={formData.startDate}
//                   onChange={handleInputChange}
//                   required
//                 />

//                 <label>End Date</label>
//                 <input
//                   type="date"
//                   name="endDate"
//                   value={formData.endDate}
//                   onChange={handleInputChange}
//                   required
//                 />

//                 <button type="submit" className="save-btn">
//                   Save Offer
//                 </button>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default GlobalOffers;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../../Shared/AdminSidebar/AdminHeader";
import "../Marketing.css";
import "./GlobalOffers.css";

function GlobalOffers() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    discountType: "Percentage",
    discountValue: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // Static data
    const staticOffers = [
      {
        id: 1,
        productName: "Product A",
        discountType: "Percentage",
        discountValue: 10,
        description: "New Year Offer",
        startDate: "2025-01-01",
        endDate: "2025-01-10",
      },
      {
        id: 2,
        productName: "Product B",
        discountType: "Flat",
        discountValue: 200,
        description: "Festival Discount",
        startDate: "2025-02-01",
        endDate: "2025-02-10",
      },
      {
        id: 3,
        productName: "Product C",
        discountType: "Percentage",
        discountValue: 5,
        description: "Limited Offer",
        startDate: "2025-03-05",
        endDate: "2025-03-15",
      },
      {
        id: 4,
        productName: "Product D",
        discountType: "Flat",
        discountValue: 100,
        description: "Flash Sale",
        startDate: "2025-04-01",
        endDate: "2025-04-05",
      },
      {
        id: 5,
        productName: "Product E",
        discountType: "Percentage",
        discountValue: 15,
        description: "Summer Deal",
        startDate: "2025-05-01",
        endDate: "2025-05-15",
      },
      {
        id: 6,
        productName: "Product F",
        discountType: "Flat",
        discountValue: 300,
        description: "Mega Offer",
        startDate: "2025-06-01",
        endDate: "2025-06-20",
      },
      {
        id: 7,
        productName: "Product G",
        discountType: "Percentage",
        discountValue: 20,
        description: "Special Weekend Offer",
        startDate: "2025-07-01",
        endDate: "2025-07-03",
      },
      {
        id: 8,
        productName: "Product H",
        discountType: "Flat",
        discountValue: 150,
        description: "Independence Sale",
        startDate: "2025-08-10",
        endDate: "2025-08-20",
      },
      {
        id: 9,
        productName: "Product I",
        discountType: "Percentage",
        discountValue: 25,
        description: "Festive Bonanza",
        startDate: "2025-09-01",
        endDate: "2025-09-10",
      },
      {
        id: 10,
        productName: "Product J",
        discountType: "Flat",
        discountValue: 500,
        description: "Year-End Sale",
        startDate: "2025-12-01",
        endDate: "2025-12-31",
      },
    ];
    setOffers(staticOffers);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOffer = (e) => {
    e.preventDefault();
    setOffers([...offers, { ...formData, id: Date.now() }]);
    setFormData({
      productName: "",
      discountType: "Percentage",
      discountValue: "",
      description: "",
      startDate: "",
      endDate: "",
    });
    setShowModal(false);
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "All" || offer.discountType === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = filteredOffers.slice(
    indexOfFirstOffer,
    indexOfLastOffer
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="global-offers-main">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        className={`global-offers-content ${isCollapsed ? "collapsed" : ""}`}
      >
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="offers-header">
          <h2>Global Offers</h2>
          <button className="add-offer-btn" onClick={() => setShowModal(true)}>
            + Add Global Offer
          </button>
        </div>

        {/* 🔙 Back Button + Filters */}
        <div className="offers-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="filters">
            <input
              type="text"
              placeholder="Search by Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Percentage">Percentage</option>
              <option value="Flat">Flat</option>
            </select>
          </div>
        </div>

        <table className="offers-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Discount Type</th>
              <th>Discount Value</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {currentOffers.length > 0 ? (
              currentOffers.map((offer) => (
                <tr key={offer.id}>
                  <td>{offer.productName}</td>
                  <td>{offer.discountType}</td>
                  <td>
                    {offer.discountType === "Percentage"
                      ? `${offer.discountValue}%`
                      : `₹${offer.discountValue}`}
                  </td>
                  <td>{offer.description}</td>
                  <td>{offer.startDate}</td>
                  <td>{offer.endDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No offers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowModal(false)}>
                &times;
              </span>
              <h3>Add Global Offer</h3>
              <form onSubmit={handleAddOffer}>
                <label>Product Name</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                />

                <label>Discount Type</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Flat">Flat</option>
                </select>

                <label>Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  required
                />

                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>

                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />

                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />

                <button type="submit" className="save-btn">
                  Save Offer
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GlobalOffers;




