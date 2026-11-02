import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import ErpAiReporter from "./ErpAiReporter";

export default function AiReportsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        className={`main-content ${isCollapsed ? "collapsed" : ""}`}
        style={{ padding: "0px", background: "#F5F6F7", minHeight: "100vh" }}
      >
        <ErpAiReporter />
      </div>
    </div>
  );
}
