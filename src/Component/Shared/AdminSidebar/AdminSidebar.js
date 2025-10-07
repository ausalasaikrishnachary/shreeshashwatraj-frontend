import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  FaTimes,
  FaSignOutAlt
} from "react-icons/fa";
import "./AdminSidebar.css";
import UserCard from "../../Panels/UserCard/UserCard"

function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

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
    { path: "/retailers", name: "Retailers", icon: <FaUsers /> },
    { path: "/staff", name: "Staff", icon: <FaUserTie /> },
    { path: "/sales", name: "Sales", icon: <FaChartLine /> },
    { path: "/products", name: "Products", icon: <FaBox /> },
    { path: "/marketing", name: "Offers & Marketing", icon: <FaTags /> },
    { path: "/expenses", name: "Expenses", icon: <FaMoneyBill /> },
    { path: "/reports", name: "Reports", icon: <FaFileAlt /> },
    { path: "/roleaccess", name: "Role Access", icon: <FaKey /> },
  ];

  // Close mobile sidebar when clicking outside (on overlay)
  const handleOverlayClick = () => {
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isStaff");
    localStorage.removeItem("isRetailer");
    localStorage.removeItem("loginTime");
    
    // Optional: Clear all localStorage (use with caution)
    // localStorage.clear();
    
    // Navigate to login page
    navigate("/login");
    
    // Close mobile sidebar if open
    if (isMobile) {
      setIsMobileOpen(false);
    }
    
    console.log("Logged out successfully");
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
            
            {/* Logout Button */}
            <li className="logout-item">
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                <span className="icon"><FaSignOutAlt /></span>
                {(!isCollapsed && !isMobile) && <span className="link-text">Logout</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Updated sidebar footer with rounded border */}
        <div className="sidebar-footer">
          <UserCard />
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;