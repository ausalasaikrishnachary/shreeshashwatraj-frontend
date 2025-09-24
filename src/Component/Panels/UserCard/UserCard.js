import React from "react";
import { FaSignOutAlt } from "react-icons/fa"; // logout icon
import "./UserCard.css";

const UserCard = () => {
  const handleLogout = () => {
    // 🔑 add your logout logic here (clear auth, redirect, etc.)
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
