import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";

function Expenses() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div>
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <AdminHeader isCollapsed={isCollapsed} />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
       <p>Your main content goes hereYour main content goes hereYour main content goes here</p>
      </div>
    </div>
  );
}

export default Expenses;
