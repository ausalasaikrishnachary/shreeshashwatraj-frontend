// import React, { useEffect, useState } from "react";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
// import { baseurl } from "../../../BaseURL/BaseURL";
// import "./CompanyInfo.css";

// const CompanyInfo = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [companyId, setCompanyId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     company_name: "",
//     email: "",
//     phone: "",
//     gstin: "",
//     state: "",
//     state_code: "",
//     location: "",
//     address: "",
//   });

//   useEffect(() => {
//     fetchCompanyInfo();
//   }, []);

//   const fetchCompanyInfo = async () => {
//     try {
//       //   const res = await fetch(`${baseurl}/company-info`);
//       const res = await fetch(`${baseurl}/api/company-info`);
//       const result = await res.json();

//       if (result.success && result.data) {
//         setCompanyId(result.data.id);

//         setFormData({
//           company_name: result.data.company_name || "",
//           email: result.data.email || "",
//           phone: result.data.phone || "",
//           gstin: result.data.gstin || "",
//           state: result.data.state || "",
//           state_code: result.data.state_code || "",
//           location: result.data.location || "",
//           address: result.data.address || "",
//         });
//       }
//     } catch (error) {
//       console.error("Fetch company info error:", error);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.company_name.trim()) {
//       alert("Company name is required");
//       return;
//     }

//     try {
//       setLoading(true);

//       const url = companyId
//         ? `${baseurl}/api/company-info/${companyId}`
//         : `${baseurl}/api/company-info`;

//       const method = companyId ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         throw new Error(result.error || "Failed to save company info");
//       }

//       alert(result.message || "Company info saved successfully");
//       fetchCompanyInfo();
//     } catch (error) {
//       alert(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="company-info-wrapper">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

//       <div className={`company-info-content ${isCollapsed ? "collapsed" : ""}`}>
//         <AdminHeader isCollapsed={isCollapsed} />

//         <div className="company-info-main">
//           <div className="company-info-container">
//             <div className="company-info-header">
//               <h1 className="company-info-title">Company Information</h1>
//               <p className="company-info-subtitle">
//                 Add or update company details
//               </p>
//             </div>

//             <form className="company-info-card" onSubmit={handleSubmit}>
//               <div className="company-info-row">
//                 <div className="company-info-field">
//                   <label>Company Name</label>
//                   <input
//                     type="text"
//                     name="company_name"
//                     value={formData.company_name}
//                     onChange={handleChange}
//                     placeholder="Enter company name"
//                     required
//                   />
//                 </div>

//                 <div className="company-info-field">
//                   <label>Email</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="Enter email"
//                   />
//                 </div>
//               </div>

//               <div className="company-info-row">
//                 <div className="company-info-field">
//                   <label>Phone</label>
//                   <input
//                     type="text"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     placeholder="Enter phone"
//                   />
//                 </div>

//                 <div className="company-info-field">
//                   <label>GSTIN</label>
//                   <input
//                     type="text"
//                     name="gstin"
//                     value={formData.gstin}
//                     onChange={handleChange}
//                     placeholder="Enter GSTIN"
//                   />
//                 </div>
//               </div>

//               <div className="company-info-row">
//                 <div className="company-info-field">
//                   <label>State</label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleChange}
//                     placeholder="Enter state"
//                   />
//                 </div>

//                 <div className="company-info-field">
//                   <label>State Code</label>
//                   <input
//                     type="text"
//                     name="state_code"
//                     value={formData.state_code}
//                     onChange={handleChange}
//                     placeholder="Enter state code"
//                   />
//                 </div>
//               </div>

//               <div className="company-info-row">
//                 <div className="company-info-field company-info-full">
//                   <label>Location</label>
//                   <input
//                     type="text"
//                     name="location"
//                     value={formData.location}
//                     onChange={handleChange}
//                     placeholder="Enter location"
//                   />
//                 </div>
//               </div>

//               <div className="company-info-row">
//                 <div className="company-info-field company-info-full">
//                   <label>Address</label>
//                   <textarea
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     placeholder="Enter full address"
//                     rows="4"
//                   />
//                 </div>
//               </div>

//               <div className="company-info-actions">
//                 <button type="submit" disabled={loading}>
//                   {loading
//                     ? "Saving..."
//                     : companyId
//                       ? "Update Company Info"
//                       : "Save Company Info"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CompanyInfo;

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import { baseurl } from "../../../BaseURL/BaseURL";
import "./CompanyInfo.css";

const STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" },
  { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh (New)" },
];

const getStateByName = (name) => STATES.find((s) => s.name === name);

const getStateByCode = (code) => STATES.find((s) => s.code === code);

const CompanyInfo = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    branch: "",
    email: "",
    phone: "",
    gstin: "",
    state: "",
    state_code: "",
    location: "",
    address: "",
  });

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const res = await fetch(`${baseurl}/api/company-info`);
      const result = await res.json();

      if (result.success && result.data) {
        const stateName = result.data.state || "";
        let stateCode = result.data.state_code || "";

        if (stateName && !stateCode) {
          const selectedState = getStateByName(stateName);
          stateCode = selectedState ? selectedState.code : "";
        }

        setCompanyId(result.data.id);

        setFormData({
          company_name: result.data.company_name || "",
          branch: result.data.branch || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          gstin: result.data.gstin || "",
          state: stateName,
          state_code: stateCode,
          location: result.data.location || "",
          address: result.data.address || "",
        });
      }
    } catch (error) {
      console.error("Fetch company info error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "state") {
        const selectedState = getStateByName(value);
        updated.state_code = selectedState ? selectedState.code : "";
      }

      if (name === "state_code") {
        const selectedState = getStateByCode(value);
        updated.state = selectedState ? selectedState.name : "";
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company_name.trim()) {
      alert("Company name is required");
      return;
    }

    try {
      setLoading(true);

      const url = companyId
        ? `${baseurl}/api/company-info/${companyId}`
        : `${baseurl}/api/company-info`;

      const method = companyId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to save company info");
      }

      alert(result.message || "Company info saved successfully");
      fetchCompanyInfo();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-info-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`company-info-content ${isCollapsed ? "collapsed" : ""}`}>
        <AdminHeader isCollapsed={isCollapsed} />

        <div className="company-info-main">
          <div className="company-info-container">
            <div className="company-info-header">
              <h1 className="company-info-title">Company Information</h1>
              <p className="company-info-subtitle">
                Add or update company details
              </p>
            </div>

            <form className="company-info-card" onSubmit={handleSubmit}>
              <div className="company-info-row">
                <div className="company-info-field">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="company-info-field">
                  <label>Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="Enter branch"
                  />
                </div>
              </div>

              <div className="company-info-row">
                <div className="company-info-field">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone"
                  />
                </div>

                <div className="company-info-field">
                  <label>GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="Enter GSTIN"
                    maxLength="15"
                  />
                </div>
              </div>

              <div className="company-info-row">
                <div className="company-info-field">
                  <label>State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="">Select State</option>
                    {STATES.map((state) => (
                      <option key={state.code} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="company-info-field">
                  <label>State Code</label>
                  <select
                    name="state_code"
                    value={formData.state_code}
                    onChange={handleChange}
                  >
                    <option value="">Select Code</option>
                    {STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="company-info-row">
                <div className="company-info-field company-info-full">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div className="company-info-row">
                <div className="company-info-field company-info-full">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                    rows="4"
                  />
                </div>
              </div>

              <div className="company-info-actions">
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#0b5ed7",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {loading
                    ? "Saving..."
                    : companyId
                      ? "Update Company Info"
                      : "Save Company Info"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
