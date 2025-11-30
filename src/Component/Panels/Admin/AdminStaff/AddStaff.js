// import React, { useState, useEffect } from "react";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import { useNavigate, useParams } from "react-router-dom";
// import "./AddStaff.css";
// import { baseurl } from "../../../BaseURL/BaseURL";

// function AddStaff() {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const navigate = useNavigate();
//   const { id } = useParams(); // Get the staff ID from URL params for edit mode
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(false);
//   const [error, setError] = useState("");
//   const [isEditMode, setIsEditMode] = useState(false);
  
//   const [formData, setFormData] = useState({
//     fullName: "",
//     mobileNumber: "",
//     email: "",
//     role: "staff", // Default value set to "Staff"
//     status: "Active"
//   });

//   // Check if we're in edit mode and fetch staff data
//   useEffect(() => {
//     if (id) {
//       setIsEditMode(true);
//       fetchStaffData();
//     }
//   }, [id]);

//   const fetchStaffData = async () => {
//     try {
//       setIsFetching(true);
//       const response = await fetch(`${baseurl}/api/staff/${id}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const staffData = await response.json();
      
//       // Map backend fields to form data
//       setFormData({
//         fullName: staffData.full_name || "",
//         mobileNumber: staffData.mobile_number || "",
//         email: staffData.email || "",
//         role: staffData.role || "Staff",
//         status: staffData.status || "Active"
//       });
//     } catch (error) {
//       console.error("Error fetching staff data:", error);
//       setError("Failed to load staff data");
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevState => ({
//       ...prevState,
//       [name]: value
//     }));
//     if (error) setError("");
//   };

//   const validateForm = () => {
//     const { fullName, mobileNumber, email, role } = formData;
    
//     if (!fullName.trim()) {
//       setError("Full name is required");
//       return false;
//     }
    
//     if (!mobileNumber.trim() || !/^\d{10}$/.test(mobileNumber)) {
//       setError("Please enter a valid 10-digit mobile number");
//       return false;
//     }
    
//     if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       setError("Please enter a valid email address");
//       return false;
//     }
    
//     if (!role) {
//       setError("Role is required");
//       return false;
//     }
    
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);
//     setError("");

//     try {
//       if (isEditMode) {
//         // Update existing staff (PUT request)
//         const response = await fetch(`${baseurl}/api/staff/${id}`, {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(formData),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           throw new Error(result.error || "Failed to update staff account");
//         }

//         console.log("Staff updated successfully:", result);
        
//         // Show success message and redirect
//         alert("Staff account updated successfully!");
//         navigate("/staff");
//       } else {
//         // Create new staff (POST request)
//         const response = await fetch(`${baseurl}/api/staff`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(formData),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           throw new Error(result.error || "Failed to create staff account");
//         }

//         console.log("Staff created successfully:", result);
        
//         // Show success message and redirect
//         alert("Staff account created successfully! Default password is their mobile number.");
//         navigate("/staff");
//       }
//     } catch (err) {
//       console.error(`Error ${isEditMode ? "updating" : "creating"} staff:`, err);
//       setError(err.message || `An error occurred while ${isEditMode ? "updating" : "creating"} staff`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     navigate("/staff");
//   };

//   if (isEditMode && isFetching) {
//     return (
//       <div className="add-staff-page-wrapper">
//         <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//         <div className={`add-staff-main-content ${isCollapsed ? "collapsed" : ""}`}>
//           <div className="add-staff-container">
//             <div className="loading-container">
//               <div className="loading-spinner"></div>
//               <p>Loading staff data...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="add-staff-page-wrapper">
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
//       {/* Main Content Area */}
//       <div className={`add-staff-main-content ${isCollapsed ? "collapsed" : ""}`}>
//         <div className="add-staff-container">
          
//           {/* Page Header */}
//           <div className="page-header-section">
//             <h1 className="page-title">
//               {isEditMode ? "Edit Staff Member" : "Add New Staff"}
//             </h1>
//             <p className="page-subtitle">
//               {isEditMode 
//                 ? "Update staff account information and permissions" 
//                 : "Create a new staff account with appropriate permissions"
//               }
//             </p>
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className="error-message">
//               <span className="error-icon">⚠</span>
//               {error}
//             </div>
//           )}

//           {/* Add/Edit Staff Form */}
//           <div className="add-staff-form-section">
//             <form onSubmit={handleSubmit} className="staff-form">
              
//               {/* Full Name */}
//               <div className="form-row">
//                 <div className="adminform-group half-width">
//                   <label htmlFor="fullName" className="form-label">
//                     Full Name <span className="required">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     id="fullName"
//                     name="fullName"
//                     value={formData.fullName}
//                     onChange={handleInputChange}
//                     className="form-input"
//                     placeholder="Enter full name"
//                     disabled={isLoading}
//                   />
//                 </div>

//                  <div className="adminform-group half-width">
//                   <label htmlFor="mobileNumber" className="form-label">
//                     Mobile Number <span className="required">*</span>
//                   </label>
//                   <input
//                     type="tel"
//                     id="mobileNumber"
//                     name="mobileNumber"
//                     value={formData.mobileNumber}
//                     onChange={handleInputChange}
//                     className="form-input"
//                     placeholder="Enter 10-digit mobile number"
//                     pattern="[0-9]{10}"
//                     maxLength="10"
//                     disabled={isLoading || isEditMode} // Disable mobile number in edit mode
//                   />
//                   {isEditMode && (
//                     <small className="field-note">
//                       Mobile number cannot be changed
//                     </small>
//                   )}
//                 </div>


//               </div>

//               {/* Email and Status */}
//               <div className="form-row">
                
//                 <div className="adminform-group half-width">
//                   <label htmlFor="email" className="form-label">
//                     Email <span className="required">*</span>
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className="form-input"
//                     placeholder="Enter email address"
//                     disabled={isLoading}
//                   />
//                 </div>

//                 <div className="adminform-group half-width">
//                   <label htmlFor="status" className="form-label">
//                     Status
//                   </label>
//                   <select
//                     id="status"
//                     name="status"
//                     value={formData.status}
//                     onChange={handleInputChange}
//                     className="form-select"
//                     disabled={isLoading}
//                   >
//                     <option value="Active">Active</option>
//                     <option value="Inactive">Inactive</option>
//                   </select>
//                 </div>

//               </div>


//               {/* Action Buttons */}
            
//             {/* Action Buttons */}
//             <div className="add-staff-form-actions">
//               <button 
//                 type="button" 
//                 className="add-staff-cancel-btn" 
//                 onClick={handleCancel}
//                 disabled={isLoading}
//               >
//                 Cancel
//               </button>
//               <button 
//                 type="submit" 
//                 className="add-staff-submit-btn"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <>
//                     <span className="add-staff-loading-spinner"></span>
//                     {isEditMode ? "Updating..." : "Creating..."}
//                   </>
//                 ) : (
//                   isEditMode ? "Update" : "Submit"
//                 )}
//               </button>
//             </div>


//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AddStaff;


import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";
import "./AddStaff.css";
import { baseurl } from "../../../BaseURL/BaseURL";

function AddStaff() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    alternateNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    address: "",

    // Job details
    role: "staff",
    designation: "",
    department: "",
    joiningDate: "",
    incentivePercent: "",
    salary: "",

    // Bank info
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",

    // Documents
    aadhaarNumber: "",
    panNumber: "",
    bloodGroup: "",
    emergencyContact: "",

    status: "Active"
  });

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchStaffData();
    }
  }, [id]);

  const fetchStaffData = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(`${baseurl}/api/staff/${id}`);
      const staffData = await response.json();

      setFormData({
        fullName: staffData.full_name || "",
        mobileNumber: staffData.mobile_number || "",
        alternateNumber: staffData.alternate_number || "",
        email: staffData.email || "",
        dateOfBirth: staffData.date_of_birth || "",
        gender: staffData.gender || "",
        address: staffData.address || "",

        role: staffData.role || "staff",
        designation: staffData.designation || "",
        department: staffData.department || "",
        joiningDate: staffData.joining_date || "",
        incentivePercent: staffData.incentive_percent || "",
        salary: staffData.salary || "",

        bankAccountNumber: staffData.bank_account_number || "",
        ifscCode: staffData.ifsc_code || "",
        bankName: staffData.bank_name || "",
        branchName: staffData.branch_name || "",
        upiId: staffData.upi_id || "",

        aadhaarNumber: staffData.aadhaar_number || "",
        panNumber: staffData.pan_number || "",
        bloodGroup: staffData.blood_group || "",
        emergencyContact: staffData.emergency_contact || "",

        status: staffData.status || "Active"
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load staff data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return setError("Full name required");
    if (!/^\d{10}$/.test(formData.mobileNumber))
      return setError("Invalid mobile number");
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
      return setError("Invalid email");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const url = isEditMode
        ? `${baseurl}/api/staff/${id}`
        : `${baseurl}/api/staff`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Operation failed");

      alert(isEditMode ? "Staff updated!" : "Staff added!");
      navigate("/staff");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-staff-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`add-staff-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="add-staff-container">

          <h1>{isEditMode ? "Edit Staff" : "Add New Staff"}</h1>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="staff-form">

            {/* Basic Details */}
            <h3 className="section-title">Basic Details</h3>
            <div className="form-grid">
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
              <Input label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} maxLength="10" onChange={handleInputChange} disabled={isEditMode} />

              <Input label="Alternate Number" name="alternateNumber" value={formData.alternateNumber} maxLength="10" onChange={handleInputChange} />
              <Input label="Email" name="email" value={formData.email} onChange={handleInputChange} />

              <Input type="date" label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
              <Select label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={["Male", "Female", "Other"]} />

              <FullInput label="Address" name="address" value={formData.address} onChange={handleInputChange} />
            </div>

            {/* Job Details */}
            <h3 className="section-title">Job Details</h3>
            <div className="form-grid">
              <Input label="Designation" name="designation" value={formData.designation} onChange={handleInputChange} />
              <Input label="Department" name="department" value={formData.department} onChange={handleInputChange} />

              <Input type="date" label="Joining Date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} />
              <Input type="number" label="Incentive %" name="incentivePercent" value={formData.incentivePercent} onChange={handleInputChange} />

              <Input type="number" label="Salary" name="salary" value={formData.salary} onChange={handleInputChange} />
            </div>

            {/* Bank Details */}
            <h3 className="section-title">Bank Details</h3>
            <div className="form-grid">
              <Input label="Bank Account Number" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange} />
              <Input label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} />

              <Input label="Bank Name" name="bankName" value={formData.bankName} onChange={handleInputChange} />
              <Input label="Branch Name" name="branchName" value={formData.branchName} onChange={handleInputChange} />

              <Input label="UPI ID" name="upiId" value={formData.upiId} onChange={handleInputChange} />
            </div>

            {/* Documents */}
            <h3 className="section-title">Documents</h3>
            <div className="form-grid">
              <Input label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} />
              <Input label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleInputChange} />

              <Input label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} />
              <Input label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} maxLength="10" onChange={handleInputChange} />
            </div>

            {/* Status */}
            <div className="form-grid">
              <Select label="Status" name="status" value={formData.status}
                onChange={handleInputChange} options={["Active", "Inactive"]} />
            </div>

            {/* Buttons */}
            <div className="add-staff-form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate("/staff")}>Cancel</button>
              <button type="submit" className="submit-btn">{isEditMode ? "Update" : "Submit"}</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

/* Reusable small components */
const Input = ({ label, ...props }) => (
  <div className="adminform-group">
    <label>{label}</label>
    <input className="form-input" {...props} />
  </div>
);

const FullInput = ({ label, ...props }) => (
  <div className="adminform-group full-width">
    <label>{label}</label>
    <textarea className="form-input" {...props} rows="2"></textarea>
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="adminform-group">
    <label>{label}</label>
    <select className="form-select" {...props}>
      <option value="">Select</option>
      {options.map((op, i) => (
        <option key={i} value={op}>{op}</option>
      ))}
    </select>
  </div>
);

export default AddStaff;

