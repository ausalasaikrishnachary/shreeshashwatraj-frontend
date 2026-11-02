import React, { useEffect, useRef } from "react";
import "./erp-ai-reporter.umd.js";

export default function ErpAiReporter({ defaultQuery, isEmbedded = false }) {
  const ref = useRef(null);
  const token = localStorage.getItem("token") || "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenant_id || "shree_shashwatraj_agro";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleReport = (e) => {
      console.log("ERP AI Report Generated:", e.detail);
    };

    el.addEventListener("reportGenerated", handleReport);
    return () => el.removeEventListener("reportGenerated", handleReport);
  }, []);

  return (
    <div
      className="erp-ai-reporter-wrapper"
      style={{
        width: "100%",
        minHeight: isEmbedded ? "750px" : "calc(100vh - 60px)",
        borderRadius: isEmbedded ? "8px" : "0",
        overflow: "hidden",
      }}
    >
      <erp-ai-reporter
        ref={ref}
        api-url="http://localhost:8000"
        tenant-id={tenantId}
        token={token}
        default-query={defaultQuery || "What is our net profit and gross profit for 2026?"}
      />
    </div>
  );
}
