import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaChartBar,
  FaBoxes,
  FaTags,
  FaMoneyBill,
  FaFileAlt,
  FaKey,
  FaBars,
  FaTimes,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
  FaBookOpen,
  FaShoppingCart,


  FaChartLine,
  FaBox,
  FaHandHoldingUsd,

} from "react-icons/fa";

import "./AdminSidebar.css";
import UserCard from "../../Panels/UserCard/UserCard";

function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const menuItems = [
    { path: "/admindashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/retailers", name: "Retailers", icon: <FaUsers /> },
    { path: "/staff", name: "Staff", icon: <FaUserTie /> },
    { path: "/sales_visit", name: "Sales Visit", icon: <FaClipboardList /> },
  {
    name: "Inventory", // dropdown only
    icon: <FaHandHoldingUsd />,
    subMenu: [
      { path: "/sale_items", name: "Sales Catalogue", icon: <FaBookOpen /> },
      { path: "/purchased_items", name: "Purchased Items", icon: <FaShoppingCart /> }
    ]
  },
    { path: "/sales", name: "Sales", icon: <FaChartLine /> },
    { path: "/products", name: "Products", icon: <FaBox /> },
    { path: "/marketing", name: "Offers & Marketing", icon: <FaTags /> },
    { path: "/expenses", name: "Expenses", icon: <FaMoneyBill /> },
    { path: "/reports", name: "Reports", icon: <FaFileAlt /> },
    { path: "/roleaccess", name: "Role Access", icon: <FaKey /> },
  ];

  const handleOverlayClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {isMobileOpen && isMobile && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}

      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "open" : ""
        } ${isMobile ? "mobile" : ""}`}
      >
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
              <li key={item.name}>
                {/* If has submenu */}
                {item.subMenu ? (
                  <>
               <button
  className={`dropdown-btn-link ${openDropdown === item.name ? "open" : ""}`}
  onClick={() => toggleDropdown(item.name)}
>
  <span className="icon">{item.icon}</span>
  {!isCollapsed && !isMobile && <span>{item.name}</span>}
  <span className="dropdown-arrow">
    {openDropdown === item.name ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
  </span>
</button>


                    {openDropdown === item.name && (
<ul className="submenu" style={{ display: openDropdown === item.name ? "block" : "none" }}>
  {item.subMenu.map((sub) => (
    <li
      key={sub.path}
      className={location.pathname === sub.path ? "active" : ""}
    >
      <NavLink to={sub.path} className="submenu-link">
        <span className="submenu-icon">{sub.icon}</span>
        <span>{sub.name}</span>
      </NavLink>
    </li>
  ))}
</ul>

                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => (isActive ? "active" : undefined)}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                  >
                    <span className="icon">{item.icon}</span>
                    {!isCollapsed && !isMobile && (
                      <span className="link-text">{item.name}</span>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <UserCard isCollapsed={isCollapsed} />
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;
