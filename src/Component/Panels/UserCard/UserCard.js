import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./UserCard.css";

const UserCard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    
    // Navigate to home page
    navigate("/");
    
    console.log("User logged out");
  };

  return (
    <div className="user-card">
      {/* User Info */}
      <div className="user-info">
        <span className="user-name">Admin User</span>
        <span className="user-email">admin@gmail.com</span>
      </div>

      {/* Logout Icon */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="logout-icon" />
      </button>
    </div>
  );
};

export default UserCard;