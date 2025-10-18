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
  FaMoneyBillWave



} from "react-icons/fa";
import "./AdminSidebar.css";
import UserCard from "../../Panels/UserCard/UserCard";


function AdminSidebar({ isCollapsed, setIsCollapsed, onToggleMobile }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      const tablet = width <= 1024 && width > 768;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      if (!mobile && !tablet) {
        setIsMobileOpen(false);
      }
      
      // Auto-collapse on tablet
      if (tablet && !isCollapsed) {
        setIsCollapsed(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed]);

  // Handle mobile toggle from parent
  useEffect(() => {
    if (onToggleMobile !== undefined) {
      setIsMobileOpen(onToggleMobile);
    }
  }, [onToggleMobile]);

  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const handleLogoClick = () => {
    if (isTablet) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const menuItems = [
    { path: "/admindashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/retailers", name: "Retailers", icon: <FaUsers /> },
    { path: "/staff", name: "Staff", icon: <FaUserTie /> },
    { path: "/sales_visit", name: "Sales Visit", icon: <FaClipboardList /> },
    {
      name: "Inventory",
      icon: <FaHandHoldingUsd />,
      subMenu: [
        { path: "/sale_items", name: "Sales Catalogue", icon: <FaBookOpen /> },
        { path: "/purchased_items", name: "Purchased Items", icon: <FaShoppingCart /> }
      ]
    },
    { path: "/sales", name: "Sales", icon: <FaChartLine /> },
     { path: "/admin_expensive", name: "Expensive Request", icon: <FaMoneyBillWave /> },
    { path: "/products", name: "Products", icon: <FaBox /> },
    { path: "/marketing", name: "Offers & Marketing", icon: <FaTags /> },
    { path: "/expenses", name: "Expenses", icon: <FaMoneyBill /> },
    { path: "/reports", name: "Reports", icon: <FaFileAlt /> },
    { path: "/roleaccess", name: "Role Access", icon: <FaKey /> },
  ];

  const handleOverlayClick = () => {
    setIsMobileOpen(false);
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // On mobile: show icons-only sidebar (80px) when open
  // On tablet: always show icons-only sidebar, allow toggle by clicking RP
  // On desktop: show full sidebar with collapse toggle

  return (
    <>
      {/* Mobile toggle button - Only show on mobile */}
      {isMobile && (
        <button
          className="sidebar-toggle"
          onClick={handleMobileToggle}
        >
          {isMobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobileOpen && isMobile && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}

      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "open" : ""
        } ${isMobile ? "mobile" : ""} ${isTablet ? "tablet" : ""}`}
      >
        <div className="sidebar-header">
          <h2 
            className="logo"
            onClick={handleLogoClick}
            style={{ cursor: isTablet ? 'pointer' : 'default' }}
          >
            {isCollapsed || isMobile || isTablet ? "RP" : "RetailPro"}
          </h2>
          
          {/* Show collapse button only on desktop */}
          {!isMobile && !isTablet && (
            <button
              className="sidebar-collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <FaBars />
            </button>
          )}
          
          {/* Show close button on mobile when sidebar is open */}
          {isMobile && isMobileOpen && (
            <button
              className="sidebar-close-btn"
              onClick={handleMobileToggle}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.subMenu ? (
                  <>
                    <button
                      className={`dropdown-btn-link ${openDropdown === item.name ? "open" : ""} ${
                        location.pathname.startsWith("/sale_items") || 
                        location.pathname.startsWith("/purchased_items") ? "active" : ""
                      }`}
                      onClick={() => toggleDropdown(item.name)}
                    >
                      <span className="icon">{item.icon}</span>
                      {/* Show text only on desktop when not collapsed */}
                      {(!isMobile && !isTablet && !isCollapsed) && (
                        <>
                          <span className="link-text">{item.name}</span>
                          <span className="dropdown-arrow">
                            {openDropdown === item.name ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </span>
                        </>
                      )}
                    </button>

                    {openDropdown === item.name && (
                      <ul className="submenu">
                        {item.subMenu.map((sub) => (
                          <li
                            key={sub.path}
                            className={location.pathname === sub.path ? "active" : ""}
                          >
                            <NavLink 
                              to={sub.path} 
                              className="submenu-link"
                              onClick={() => {
                                if (isMobile) setIsMobileOpen(false);
                                if (isTablet) setOpenDropdown(null);
                              }}
                            >
                              <span className="submenu-icon">{sub.icon}</span>
                              {/* Show submenu text only on desktop when not collapsed */}
                              {(!isMobile && !isTablet && !isCollapsed) && (
                                <span className="submenu-text">{sub.name}</span>
                              )}
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
                    onClick={() => {
                      if (isMobile) setIsMobileOpen(false);
                    }}
                  >
                    <span className="icon">{item.icon}</span>
                    {/* Show text only on desktop when not collapsed */}
                    {(!isMobile && !isTablet && !isCollapsed) && (
                      <span className="link-text">{item.name}</span>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <UserCard isCollapsed={isCollapsed || isTablet || isMobile} />
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;