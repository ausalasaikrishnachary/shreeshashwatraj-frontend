// import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaUsers,
//   FaUserTie,
//   FaChartLine,
//   FaBox,
//   FaTags,
//   FaMoneyBill,
//   FaFileAlt,
//   FaKey,
//   FaBars,
// } from "react-icons/fa";
// import "./AdminSidebar.css";

// function AdminSidebar({ isCollapsed, setIsCollapsed }) {
//   const [isMobileOpen, setIsMobileOpen] = useState(false);

//   const menuItems = [
//     { path: "/admindashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
//     { path: "/admindashboard/retailers", name: "Retailers", icon: <FaUsers /> },
//     { path: "/admindashboard/staff", name: "Staff", icon: <FaUserTie /> },
//     { path: "/admindashboard/sales", name: "Sales", icon: <FaChartLine /> },
//     { path: "/admindashboard/products", name: "Products", icon: <FaBox /> },
//     { path: "/admindashboard/marketing", name: "Offers & Marketing", icon: <FaTags /> },
//     { path: "/admindashboard/expenses", name: "Expenses", icon: <FaMoneyBill /> },
//     { path: "/admindashboard/reports", name: "Reports", icon: <FaFileAlt /> },
//     { path: "/admindashboard/roleaccess", name: "Role Access", icon: <FaKey /> },
//   ];

//   return (
//     <>
//       {/* Mobile toggle button */}
//       <button
//         className="sidebar-toggle"
//         onClick={() => setIsMobileOpen(!isMobileOpen)}
//       >
//         ☰
//       </button>

//       <div
//         className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
//           isMobileOpen ? "open" : ""
//         }`}
//       >
//         {/* Logo + collapse row */}
//         <div className="sidebar-header">
//           <h2 className="logo">{isCollapsed ? "RP" : "RetailPro"}</h2>
//           <button
//             className="sidebar-collapse-btn"
//             onClick={() => setIsCollapsed(!isCollapsed)}
//           >
//             <FaBars />
//           </button>
//         </div>

//         <nav>
//           <ul>
//             {menuItems.map((item) => (
//               <li key={item.path}>
//                 <NavLink
//                   to={item.path}
//                   className={({ isActive }) =>
//                     isActive ? "active" : undefined
//                   }
//                 >
//                   <span className="icon">{item.icon}</span>
//                   {!isCollapsed && <span className="link-text">{item.name}</span>}
//                 </NavLink>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         <div className="sidebar-footer">
//           <p>{isCollapsed ? "AU" : "Admin User"}</p>
//           {!isCollapsed && <small>admin@gmail.com</small>}
//         </div>
//       </div>
//     </>
//   );
// }

// export default AdminSidebar;













import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaChartLine,
  FaBox,
  FaTags,
  FaMoneyBill,
  FaFileAlt,
  FaKey,
  FaBars,
  FaTimes
} from "react-icons/fa";
import "./AdminSidebar.css";

function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar on resize to mobile
      if (mobile) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: "/admindashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/admindashboard/retailers", name: "Retailers", icon: <FaUsers /> },
    { path: "/admindashboard/staff", name: "Staff", icon: <FaUserTie /> },
    { path: "/admindashboard/sales", name: "Sales", icon: <FaChartLine /> },
    { path: "/admindashboard/products", name: "Products", icon: <FaBox /> },
    { path: "/admindashboard/marketing", name: "Offers & Marketing", icon: <FaTags /> },
    { path: "/admindashboard/expenses", name: "Expenses", icon: <FaMoneyBill /> },
    { path: "/admindashboard/reports", name: "Reports", icon: <FaFileAlt /> },
    { path: "/admindashboard/roleaccess", name: "Role Access", icon: <FaKey /> },
  ];

  // Close mobile sidebar when clicking outside (on overlay)
  const handleOverlayClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && isMobile && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}

      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "open" : ""
        } ${isMobile ? "mobile" : ""}`}
      >
        {/* Logo + collapse row */}
        <div className="sidebar-header">
          <h2 className="logo">
            {isCollapsed || isMobile ? "RP" : "RetailPro"}
          </h2>
          {!isMobile && (
            <button
              className="sidebar-collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <FaBars />
            </button>
          )}
        </div>

        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "active" : undefined
                  }
                  onClick={() => isMobile && setIsMobileOpen(false)}
                >
                  <span className="icon">{item.icon}</span>
                  {(!isCollapsed && !isMobile) && <span className="link-text">{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>{isCollapsed || isMobile ? "AU" : "Admin User"}</p>
          {!isCollapsed && !isMobile && <small>admin@gmail.com</small>}
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;
