import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import ProfitLossReport from "./ProfitLossReport";
import "./Reports.css";

function ProfitLossPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />
        <div className="reports-container" style={{ paddingTop: "20px" }}>
          <ProfitLossReport />
        </div>
      </div>
    </div>
  );
}

export default ProfitLossPage;
