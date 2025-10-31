// import React from 'react'

// const FlashSales = () => {
//   return (
//     <div>
//       FlashSales
//     </div>
//   )
// }

// export default FlashSales



// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../../Shared/AdminSidebar/AdminHeader";
// import "../Marketing.css";

// function FlashSales() {
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
//             onClick={() => handleNavigation("/admin/marketing/flash-sales")}
//           >
//             Flash Sales
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default FlashSales;