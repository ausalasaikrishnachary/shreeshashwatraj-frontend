// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
// import "./AddRetailer.css";

// const RetailerForm = () => {
//   const navigate = useNavigate();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const [formData, setFormData] = useState({
//     businessName: "",
//     email: "contact@business.com",
//     phone: "+91 98765 43210",
//     businessType: "",
//     location: "",
//     notes: ""
//   });

//   const businessTypes = [
//     "Select business type",
//     "Retail Store",
//     "E-commerce",
//     "Wholesale",
//     "Franchise",
//     "Other"
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Form submitted:", formData);
//     navigate("/admindashboard/retailers");
//   };

//   const handleCancel = () => {
//     navigate("/admindashboard/retailers");
//   };

//   return (
//     <>
//       <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
//       <div className={`form-container ${isCollapsed ? 'collapsed' : ''}`}>
//         <div className="form-wrapper">
//           <div className="formHeader">
//             <h1 className="title">Add New Retailer</h1>
//             <p className="subtitle">
//               Fill in the retailer details for onboarding approval
//             </p>
//           </div>

//           <form className="form" onSubmit={handleSubmit}>
//             <div className="form-row">
//               <div className="formGroup">
//                 <label htmlFor="businessName" className="label">
//                   Business Name *
//                 </label>
//                 <input
//                   type="text"
//                   id="businessName"
//                   name="businessName"
//                   value={formData.businessName}
//                   onChange={handleChange}
//                   placeholder="Enter business name"
//                   className="input"
//                   required
//                 />
//               </div>

//               <div className="formGroup">
//                 <label htmlFor="email" className="label">
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="contact@business.com"
//                   className="input"
//                   required
//                 />
//               </div>

//               <div className="formGroup">
//                 <label htmlFor="phone" className="label">
//                   Phone *
//                 </label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   placeholder="+91 98765 43210"
//                   className="input"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="formGroup">
//                 <label htmlFor="businessType" className="label">
//                   Business Type
//                 </label>
//                 <select
//                   id="businessType"
//                   name="businessType"
//                   value={formData.businessType}
//                   onChange={handleChange}
//                   className="select"
//                 >
//                   {businessTypes.map((type, index) => (
//                     <option key={index} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="formGroup">
//                 <label htmlFor="location" className="label">
//                   Location
//                 </label>
//                 <input
//                   type="text"
//                   id="location"
//                   name="location"
//                   value={formData.location}
//                   onChange={handleChange}
//                   placeholder="City, State"
//                   className="input"
//                 />
//               </div>

//               <div className="formGroup spacer">
//                 {/* Empty spacer to maintain 3-column layout */}
//               </div>
//             </div>

//             <div className="formGroup full-width">
//               <label htmlFor="notes" className="label">
//                 Notes
//               </label>
//               <textarea
//                 id="notes"
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 placeholder="Additional notes or comments"
//                 rows="4"
//                 className="textarea"
//               />
//             </div>

//             <div className="buttonGroup">
//               <button
//                 type="button"
//                 className="cancelButton"
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </button>
//               <button type="submit" className="submitButton">
//                 Add Retailer
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default RetailerForm;


// import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import Sidebar from '../../Shared/Sidebar/Sidebar';
// import Header from '../../Shared/Header/Header';
// import './AddCustomerForm.css';

// const AddCustomerForm = ({ user }) => {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [sameAsShipping, setSameAsShipping] = useState(false);
//   const [activeTab, setActiveTab] = useState('information');

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//   };

//   return (
//     <div className="dashboard-container">
//       <Header 
//         user={user} 
//         toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
//       />
//       <div className="content-wrapper">
//         <div className={`pcoded-navbar ${sidebarCollapsed ? 'navbar-collapsed' : ''}`}>
//           <Sidebar 
//             user={user} 
//             collapsed={sidebarCollapsed} 
//           />
//         </div>
//         <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
//           <div className="container customer-form-container">
//             <h1 className="customer-form-title">Add Customer</h1>

//             <div className="customer-form-tabs">
//               <div 
//                 className={`customer-tab ${activeTab === 'information' ? 'active' : ''}`}
//                 onClick={() => handleTabClick('information')}
//               >
//                 Information
//               </div>
//               <div 
//                 className={`customer-tab ${activeTab === 'banking' ? 'active' : ''}`}
//                 onClick={() => handleTabClick('banking')}
//               >
//                 Banking & Taxes
//               </div>
//               <div 
//                 className={`customer-tab ${activeTab === 'shipping' ? 'active' : ''}`}
//                 onClick={() => handleTabClick('shipping')}
//               >
//                 Shipping Address
//               </div>
//               <div 
//                 className={`customer-tab ${activeTab === 'billing' ? 'active' : ''}`}
//                 onClick={() => handleTabClick('billing')}
//               >
//                 Billing Address
//               </div>
//             </div>

//             {/* Information Section */}
//             <div className={`card customer-form-card ${activeTab === 'information' ? 'active-section' : ''}`}>
//               <div className="customer-form-section">
//                 <h2 className="customer-section-title">Information</h2>
//                 <div className="row">
//                   {/* Left Column */}
//                   <div className="col-md-6">
//                     {/* Title and Name in same row */}
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Title</label>
//                           <select className="form-select customer-form-input">
//                             <option value="">Select</option>
//                             <option value="Mr.">Mr.</option>
//                             <option value="Mrs.">Mrs.</option>
//                             <option value="Ms.">Ms.</option>
//                             <option value="Dr.">Dr.</option>
//                           </select>
//                         </div>
//                       </div>
//                       <div className="col-md-8">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Name*</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Mobile Number*</label>
//                       <input type="tel" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Customer GSTIN</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Business Name</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Display Name*</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Fax</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>

//                   {/* Right Column */}
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Entity Type</label>
//                       <select className="form-select customer-form-input">
//                         <option value="">Select an Entity Type</option>
//                         <option value="Individual">Individual</option>
//                         <option value="Company">Company</option>
//                         <option value="Partnership">Partnership</option>
//                       </select>
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Email*</label>
//                       <input type="email" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Customer GST Registered Name</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Additional Business Name</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>

//                     <div className="mb-3">
//                       <label className="customer-form-label">Phone Number</label>
//                       <input type="tel" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="customer-form-submit">
//                 <button 
//                   type="button" 
//                   className="btn btn-primary customer-submit-btn"
//                   onClick={() => handleTabClick('banking')}
//                 >
//                   Next: Banking & Taxes
//                 </button>
//               </div>
//             </div>

//             {/* Banking & Taxes Section */}
//             <div className={`card customer-form-card ${activeTab === 'banking' ? 'active-section' : ''}`}>
//               <div className="customer-form-section">
//                 <h2 className="customer-section-title">Banking & Taxes</h2>

//                 {/* Account Information Section */}
//                 <div className="mb-4">
//                   <h3 className="customer-subsection-title">Account Information</h3>
//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Account Number</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Account Name</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Bank Name</label>
//                         <select className="form-select customer-form-input">
//                           <option>Select Bank Name</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">IFSC Code</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Account Type</label>
//                         <select className="form-select customer-form-input">
//                           <option>Savings Account</option>
//                           <option>Current Account</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Branch Name</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Tax Information Section */}
//                 <div className="mb-4">
//                   <h3 className="customer-subsection-title">Tax Information</h3>
//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">PAN</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">TAN</label>
//                         <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">TCS Slab Rate</label>
//                         <select className="form-select customer-form-input">
//                           <option>TCS Not Applicable</option>
//                           <option>0.1%</option>
//                           <option>1%</option>
//                           <option>5%</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Currency</label>
//                         <select className="form-select customer-form-input">
//                           <option>Indian Rupee</option>
//                           <option>US Dollar</option>
//                           <option>Euro</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Terms of Payment</label>
//                         <select className="form-select customer-form-input">
//                           <option>Select Terms of Payment</option>
//                           <option>Net 15</option>
//                           <option>Net 30</option>
//                           <option>Net 60</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Apply Reverse Charge</label>
//                         <select className="form-select customer-form-input">
//                           <option>Yes</option>
//                           <option>No</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="customer-form-label">Export or SEZ Developer</label>
//                         <select className="form-select customer-form-input">
//                           <option>Not Applicable</option>
//                           <option>Export</option>
//                           <option>SEZ Developer</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="customer-form-submit">
//                 <button 
//                   type="button" 
//                   className="btn btn-outline-secondary customer-back-btn"
//                   onClick={() => handleTabClick('information')}
//                 >
//                   Back
//                 </button>
//                 <button 
//                   type="button" 
//                   className="btn btn-primary customer-submit-btn"
//                   onClick={() => handleTabClick('shipping')}
//                 >
//                   Next: Shipping Address
//                 </button>
//               </div>
//             </div>

//             {/* Shipping Address Section */}
//             <div className={`card customer-form-card ${activeTab === 'shipping' ? 'active-section' : ''}`}>
//               <div className="customer-form-section">
//                 <h2 className="customer-section-title">Shipping Address</h2>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Address Line 1*</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Address Line 2</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">City*</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Pin Code*</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} required />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">State*</label>
//                       <select className="form-select customer-form-input" required>
//                         <option>Select a State</option>
//                         <option value="Telangana">Telangana</option>
//                         <option value="Andra Pradesh">Andra Pradesh</option>
//                         <option value="Kerala">Kerala</option>
//                         <option value="Karnataka">Karnataka</option>
//                       </select>
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Country*</label>
//                       <select className="form-select customer-form-input" required>
//                         <option>Select a Country</option>
//                         <option value="India">India</option>
//                         <option value="Bangladesh">Bangladesh</option>
//                         <option value="Canada">Canada</option>
//                         <option value="Iraq">Iraq</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">Branch Name</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="mb-3">
//                       <label className="customer-form-label">GSTIN</label>
//                       <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="customer-form-submit">
//                 <button 
//                   type="button" 
//                   className="btn btn-outline-secondary customer-back-btn"
//                   onClick={() => handleTabClick('banking')}
//                 >
//                   Back
//                 </button>
//                 <button 
//                   type="button" 
//                   className="btn btn-primary customer-submit-btn"
//                   onClick={() => handleTabClick('billing')}
//                 >
//                   Next: Billing Address
//                 </button>
//               </div>
//             </div>

//             {/* Billing Address Section */}
//             <div className={`card customer-form-card ${activeTab === 'billing' ? 'active-section' : ''}`}>
//               <div className="customer-form-section">
//                 <h2 className="customer-section-title">Billing Address</h2>

//                 <div className="mb-3">
//                   <div className="form-check">
//                     <input 
//                       className="form-check-input" 
//                       type="checkbox" 
//                       id="sameAsShipping" 
//                       checked={sameAsShipping}
//                       onChange={(e) => setSameAsShipping(e.target.checked)}
//                     />
//                     <label className="form-check-label" htmlFor="sameAsShipping">
//                       Shipping address is same as billing address
//                     </label>
//                   </div>
//                 </div>

//                 {!sameAsShipping && (
//                   <>
//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Address Line 1</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Address Line 2</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">City</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Pin Code</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">State</label>
//                           <select className="form-select customer-form-input">
//                             <option>Select a State</option>
//                             <option value="Telangana">Telangana</option>
//                             <option value="Andra Pradesh">Andra Pradesh</option>
//                             <option value="Kerala">Kerala</option>
//                             <option value="Karnataka">Karnataka</option>
//                           </select>
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Country</label>
//                           <select className="form-select customer-form-input">
//                             <option>Select a Country</option>
//                             <option value="India">India</option>
//                             <option value="Bangladesh">Bangladesh</option>
//                             <option value="Canada">Canada</option>
//                             <option value="Iraq">Iraq</option>
//                           </select>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="row">
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">Branch Name</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                       <div className="col-md-6">
//                         <div className="mb-3">
//                           <label className="customer-form-label">GSTIN</label>
//                           <input type="text" className="form-control customer-form-input" onChange={handleChange} />
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>

//               <div className="customer-form-submit">
//                 <button 
//                   type="button" 
//                   className="btn btn-outline-secondary customer-back-btn"
//                   onClick={() => handleTabClick('shipping')}
//                 >
//                   Back
//                 </button>
//                 <button type="submit" className="btn btn-primary customer-submit-btn">
//                   Submit
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerForm;






import React, { useState, useEffect } from 'react'; 
import FormLayout, { FormSection } from '../../../Layouts/FormLayout/FormLayout';
import "./AddRetailer.css";
import axios from 'axios'; 
import { useParams, useNavigate } from 'react-router-dom';
import { baseurl } from './../../../BaseURL/BaseURL';

const AddCustomerForm = ({ user }) => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [activeTab, setActiveTab] = useState('information');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [isLoadingGstin, setIsLoadingGstin] = useState(false);
  const [gstinError, setGstinError] = useState(null);
  
  const [formData, setFormData] = useState({
    group: "customer",
    title: "",
    entity_type: "",
    name: "",
    mobile_number: "",
    email: "",
    gstin: "",
    gst_registered_name: "",
    business_name: "",
    additional_business_name: "",
    display_name: "",
    phone_number: "",
    fax: "",
    account_number: "",
    account_name: "",
    bank_name: "",
    account_type: "",
    branch_name: "",
    ifsc_code: "",
    pan: "",
    tan: "",
    tds_slab_rate: "",
    currency: "",
    terms_of_payment: "",
    reverse_charge: "",
    export_sez: "",
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_pin_code: "",
    shipping_state: "",
    shipping_country: "",
    shipping_branch_name: "",
    shipping_gstin: "",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_pin_code: "",
    billing_state: "",
    billing_country: "",
    billing_branch_name: "",
    billing_gstin: ""
  });

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const response = await axios.get(`${baseurl}/accounts/${id}`);
          setFormData(response.data);
          setIsEditing(true);
          
          const isSameAddress = 
            response.data.billing_address_line1 === response.data.shipping_address_line1 &&
            response.data.billing_address_line2 === response.data.shipping_address_line2 &&
            response.data.billing_city === response.data.shipping_city &&
            response.data.billing_pin_code === response.data.shipping_pin_code &&
            response.data.billing_state === response.data.shipping_state &&
            response.data.billing_country === response.data.shipping_country &&
            response.data.billing_branch_name === response.data.shipping_branch_name &&
            response.data.billing_gstin === response.data.shipping_gstin;
            
          setSameAsShipping(isSameAddress);
        } catch (err) {
          console.error('Failed to fetch customer data', err);
        }
      };
      fetchCustomer();
    }
  }, [id]);

    const handleGstinChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Only make API call if GSTIN is 15 characters (valid length)
    if (name === 'gstin' && value.length === 15) {
      try {
        setIsLoadingGstin(true);
        setGstinError(null);
        
        const response = await axios.post(`${baseurl}/gstin-details`, { gstin: value });
        
        if (response.data.success && response.data.result) {
          const result = response.data.result;
          const addr = result.pradr?.addr || {};
          
          // Construct address lines
          const addressLine1 = `${addr.bno || ''}${addr.bno && addr.flno ? ', ' : ''}${addr.flno || ''}`.trim();
          const addressLine2 = `${addr.st || ''}${addr.st && addr.bnm ? ', ' : ''}${addr.bnm || ''}${(addr.st || addr.bnm) && addr.loc ? ', ' : ''}${addr.loc || ''}`.trim();
          
          // Update form data with the fetched values
          setFormData(prev => ({
            ...prev,
            gst_registered_name: result.lgnm || '',
            business_name: result.tradeNam || '',
            additional_business_name: result.tradeNam || '',
            display_name: result.lgnm || '',
            shipping_address_line1: addressLine1,
            shipping_address_line2: addressLine2,
            shipping_city: result.ctj || '',
            shipping_pin_code: addr.pncd || '',
            shipping_state: addr.stcd || '',
            shipping_country: 'India',
            // Also update billing address by default
            billing_address_line1: addressLine1,
            billing_address_line2: addressLine2,
            billing_city: result.ctj || '',
            billing_pin_code: addr.pncd || '',
            billing_state: addr.stcd || '',
            billing_country: 'India'
          }));
          
          // Set same as shipping address to true since we're populating both
          setSameAsShipping(true);
        }
      } catch (error) {
        setGstinError('Failed to fetch GSTIN details. Please enter manually.');
        console.error('Error fetching GSTIN details:', error);
      } finally {
        setIsLoadingGstin(false);
      }
    }
  };

  const tabs = [
    { id: 'information', label: 'Information' },
    { id: 'banking', label: 'Banking & Taxes' },
    { id: 'shipping', label: 'Shipping Address' },
    { id: 'billing', label: 'Billing Address' }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'title', 'name', 'entity_type', 'mobile_number', 'email', 
      'display_name', 'account_number', 'account_name', 'bank_name',
      'account_type', 'ifsc_code', 'branch_name', 'pan', 'currency',
      'terms_of_payment', 'reverse_charge', 'export_sez',
      'shipping_address_line1', 'shipping_city', 'shipping_pin_code',
      'shipping_state', 'shipping_country'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (!sameAsShipping) {
      const billingRequiredFields = [
        'billing_address_line1', 'billing_city', 
        'billing_pin_code', 'billing_state', 'billing_country'
      ];
      billingRequiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
        }
      });
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Mobile validation
    if (formData.mobile_number && !/^[0-9]{10}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Invalid mobile number (10 digits required)';
    }

    // PIN code validation
    if (formData.shipping_pin_code && !/^[0-9]{6}$/.test(formData.shipping_pin_code)) {
      newErrors.shipping_pin_code = 'Invalid PIN code (6 digits required)';
    }

    if (!sameAsShipping && formData.billing_pin_code && !/^[0-9]{6}$/.test(formData.billing_pin_code)) {
      newErrors.billing_pin_code = 'Invalid PIN code (6 digits required)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    let finalData = { ...formData };

    if (sameAsShipping) {
      finalData = {
        ...finalData,
        billing_address_line1: formData.shipping_address_line1,
        billing_address_line2: formData.shipping_address_line2,
        billing_city: formData.shipping_city,
        billing_pin_code: formData.shipping_pin_code,
        billing_state: formData.shipping_state,
        billing_country: formData.shipping_country,
        billing_branch_name: formData.shipping_branch_name,
        billing_gstin: formData.shipping_gstin
      };
    }

    try {
      if (isEditing) {
        await axios.put(`${baseurl}/accounts/${id}`, finalData);
        alert('Customer updated successfully!');
      } else {
        await axios.post(`${baseurl}/accounts`, finalData);
        alert('Customer added successfully!');
      }
      navigate('/view-customers');
    } catch (err) {
      console.error(err);
      alert(`Failed to ${isEditing ? 'update' : 'add'} customer`);
    }
  };

  const renderError = (fieldName) => {
    return errors[fieldName] ? (
      <div className="invalid-feedback" style={{ display: 'block' }}>
        {errors[fieldName]}
      </div>
    ) : null;
  };

  const getInputClass = (fieldName) => {
    return `form-control customer-form-input ${errors[fieldName] ? 'is-invalid' : ''}`;
  };

  const getSelectClass = (fieldName) => {
    return `form-select customer-form-input ${errors[fieldName] ? 'is-invalid' : ''}`;
  };

  return (
    <FormLayout
      user={user}
      title={isEditing ? "Edit Customer" : "Add Customer"}
      tabs={tabs}
      activeTab={activeTab}
      onTabClick={handleTabClick}
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
    >
      <form onSubmit={handleSubmit}>
        <FormSection
          id="information"
          activeTab={activeTab}
          title="Information"
          onBack={null}
          onNext={() => handleTabClick('banking')}
          nextLabel="Banking & Taxes"
        >
          <div className="row">
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="customer-form-label">Title*</label>
                    <select className={getSelectClass('title')} name="title" value={formData.title} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                    {renderError('title')}
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="customer-form-label">Name*</label>
                    <input type="text" name="name" value={formData.name} className={getInputClass('name')} onChange={handleChange} required />
                    {renderError('name')}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="customer-form-label">Mobile Number*</label>
                <input type="tel" name="mobile_number" value={formData.mobile_number} className={getInputClass('mobile_number')} onChange={handleChange} required />
                {renderError('mobile_number')}
              </div>

              <div className="mb-3">
    <label className="customer-form-label">Customer GSTIN*</label>
    <input 
      type="text" 
      name="gstin" 
      value={formData.gstin} 
      className={getInputClass('gstin')} 
      onChange={handleGstinChange} 
      required 
      maxLength="15"
    />
    {isLoadingGstin && <div className="text-muted small">Fetching details...</div>}
    {gstinError && <div className="text-danger small">{gstinError}</div>}
    {renderError('gstin')}
  </div>

              <div className="mb-3">
                <label className="customer-form-label">Business Name*</label>
                <input type="text" name="business_name" value={formData.business_name} className={getInputClass('business_name')} onChange={handleChange} required />
                {renderError('business_name')}
              </div>

              <div className="mb-3">
                <label className="customer-form-label">Display Name*</label>
                <input type="text" name="display_name" value={formData.display_name} className={getInputClass('display_name')} onChange={handleChange} required />
                {renderError('display_name')}
              </div>

              <div className="mb-3">
                <label className="customer-form-label">Fax*</label>
                <input type="text" name="fax" value={formData.fax} className={getInputClass('fax')} onChange={handleChange} required />
                {renderError('fax')}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="customer-form-label">Entity Type*</label>
                <select className={getSelectClass('entity_type')} name="entity_type" value={formData.entity_type} onChange={handleChange} required>
                  <option value="">Select an Entity Type</option>
                  <option value="Individual">Individual</option>
                  <option value="Company">Company</option>
                  <option value="Partnership">Partnership</option>
                </select>
                {renderError('entity_type')}
              </div>

              <div className="mb-3">
                <label className="customer-form-label">Email*</label>
                <input type="email" name="email" value={formData.email} className={getInputClass('email')} onChange={handleChange} required />
                {renderError('email')}
              </div>

              <div className="mb-3">
                <label className="customer-form-label">Customer GST Registered Name*</label>
                <input type="text" name="gst_registered_name" value={formData.gst_registered_name} className={getInputClass('gst_registered_name')} onChange={handleChange} required />
                {renderError('gst_registered_name')}
              </div>

              <div className="mb-3">
                <label className="customer-form-label">Additional Business Name*</label>
                <input type="text" name="additional_business_name" value={formData.additional_business_name} className={getInputClass('additional_business_name')} onChange={handleChange} required />
                {renderError('additional_business_name')}
              </div>

              <div className="mb-3">
                <label className="customer-form-label">Phone Number*</label>
                <input type="tel" name="phone_number" value={formData.phone_number} className={getInputClass('phone_number')} onChange={handleChange} required />
                {renderError('phone_number')}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          id="banking"
          activeTab={activeTab}
          title="Banking & Taxes"
          onBack={() => handleTabClick('information')}
          onNext={() => handleTabClick('shipping')}
          nextLabel="Shipping Address"
        >
          <div className="mb-4">
            <h3 className="customer-subsection-title">Account Information</h3>
            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">Account Number*</label>
                  <input type="text" name="account_number" value={formData.account_number} className={getInputClass('account_number')} onChange={handleChange} required />
                  {renderError('account_number')}
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">Account Name*</label>
                  <input type="text" name="account_name" value={formData.account_name} className={getInputClass('account_name')} onChange={handleChange} required />
                  {renderError('account_name')}
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">Bank Name*</label>
                  <select className={getSelectClass('bank_name')} name="bank_name" value={formData.bank_name} onChange={handleChange} required>
                    <option value="">Select Bank Name</option>
                    <option value="SBI">SBI</option>
                    <option value="ANDHRA">ANDHRA</option>
                    <option value="HDFC">HDFC</option>
                    <option value="ICICI">ICICI</option>
                  </select>
                  {renderError('bank_name')}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">IFSC Code*</label>
                  <input type="text" name="ifsc_code" value={formData.ifsc_code} className={getInputClass('ifsc_code')} onChange={handleChange} required />
                  {renderError('ifsc_code')}
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">Account Type*</label>
                  <select className={getSelectClass('account_type')} name="account_type" value={formData.account_type} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Savings Account">Savings Account</option>
                    <option value="Current Account">Current Account</option>
                  </select>
                  {renderError('account_type')}
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">Branch Name*</label>
                  <input type="text" name="branch_name" value={formData.branch_name} className={getInputClass('branch_name')} onChange={handleChange} required />
                  {renderError('branch_name')}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="customer-subsection-title">Tax Information</h3>
            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">PAN*</label>
                  <input type="text" name="pan" value={formData.pan} className={getInputClass('pan')} onChange={handleChange} required />
                  {renderError('pan')}
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">TAN*</label>
                  <input type="text" name="tan" value={formData.tan} className={getInputClass('tan')} onChange={handleChange} required />
                  {renderError('tan')}
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">TCS Slab Rate*</label>
                  <select className={getSelectClass('tds_slab_rate')} name="tds_slab_rate" value={formData.tds_slab_rate} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Not Applicable">TCS Not Applicable</option>
                    <option value="0.1%">0.1%</option>
                    <option value="1%">1%</option>
                    <option value="5%">5%</option>
                  </select>
                  {renderError('tds_slab_rate')}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">Currency*</label>
                  <select className={getSelectClass('currency')} name="currency" value={formData.currency} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="INR">INR</option>
                    <option value="USD">US Dollar</option>
                    <option value="EUR">Euro</option>
                  </select>
                  {renderError('currency')}
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">Terms of Payment*</label>
                  <select className={getSelectClass('terms_of_payment')} name="terms_of_payment" value={formData.terms_of_payment} onChange={handleChange} required>
                    <option value="">Select Terms of Payment</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                  {renderError('terms_of_payment')}
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">Apply Reverse Charge*</label>
                  <select className={getSelectClass('reverse_charge')} name="reverse_charge" value={formData.reverse_charge} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {renderError('reverse_charge')}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="customer-form-label">Export or SEZ Developer*</label>
                  <select className={getSelectClass('export_sez')} name="export_sez" value={formData.export_sez} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Not Applicable">Not Applicable</option>
                    <option value="Export">Export</option>
                    <option value="SEZ Developer">SEZ Developer</option>
                  </select>
                  {renderError('export_sez')}
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          id="shipping"
          activeTab={activeTab}
          title="Shipping Address"
          onBack={() => handleTabClick('banking')}
          onNext={() => handleTabClick('billing')}
          nextLabel="Billing Address"
        >
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="customer-form-label">Address Line 1*</label>
                <input type="text" name="shipping_address_line1" value={formData.shipping_address_line1} className={getInputClass('shipping_address_line1')} onChange={handleChange} required />
                {renderError('shipping_address_line1')}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="customer-form-label">Address Line 2*</label>
                <input type="text" name="shipping_address_line2" value={formData.shipping_address_line2} className={getInputClass('shipping_address_line2')} onChange={handleChange} required />
                {renderError('shipping_address_line2')}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="customer-form-label">City*</label>
                <input type="text" name="shipping_city" value={formData.shipping_city} className={getInputClass('shipping_city')} onChange={handleChange} required />
                {renderError('shipping_city')}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="customer-form-label">Pin Code*</label>
                <input type="text" name="shipping_pin_code" value={formData.shipping_pin_code} className={getInputClass('shipping_pin_code')} onChange={handleChange} required />
                {renderError('shipping_pin_code')}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="customer-form-label">State*</label>
                <select className={getSelectClass('shipping_state')} name="shipping_state" value={formData.shipping_state} onChange={handleChange} required>
                  <option value="">Select a State</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Andra Pradesh">Andra Pradesh</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
                {renderError('shipping_state')}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="customer-form-label">Country*</label>
                <select className={getSelectClass('shipping_country')} name="shipping_country" value={formData.shipping_country} onChange={handleChange} required>
                  <option value="">Select a Country</option>
                  <option value="India">India</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Canada">Canada</option>
                  <option value="Iraq">Iraq</option>
                </select>
                {renderError('shipping_country')}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="customer-form-label">Branch Name*</label>
                <input type="text" name="shipping_branch_name" value={formData.shipping_branch_name} className={getInputClass('shipping_branch_name')} onChange={handleChange} required />
                {renderError('shipping_branch_name')}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="customer-form-label">GSTIN*</label>
                <input type="text" name="shipping_gstin" value={formData.shipping_gstin} className={getInputClass('shipping_gstin')} onChange={handleChange} required />
                {renderError('shipping_gstin')}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          id="billing"
          activeTab={activeTab}
          title="Billing Address"
          onBack={() => handleTabClick('shipping')}
          onSubmit={handleSubmit}
          isLast={true}
        >
          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="sameAsShipping"
                checked={sameAsShipping}
                onChange={(e) => setSameAsShipping(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="sameAsShipping">
                Shipping address is same as billing address
              </label>
            </div>
          </div>

          {!sameAsShipping && (
            <>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="customer-form-label">Address Line 1*</label>
                    <input type="text" name="billing_address_line1" value={formData.billing_address_line1} className={getInputClass('billing_address_line1')} onChange={handleChange} required />
                    {renderError('billing_address_line1')}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="customer-form-label">Address Line 2*</label>
                    <input type="text" name="billing_address_line2" value={formData.billing_address_line2} className={getInputClass('billing_address_line2')} onChange={handleChange} required />
                    {renderError('billing_address_line2')}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="customer-form-label">City*</label>
                    <input type="text" name="billing_city" value={formData.billing_city} className={getInputClass('billing_city')} onChange={handleChange} required />
                    {renderError('billing_city')}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="customer-form-label">Pin Code*</label>
                    <input type="text" name="billing_pin_code" value={formData.billing_pin_code} className={getInputClass('billing_pin_code')} onChange={handleChange} required />
                    {renderError('billing_pin_code')}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="customer-form-label">State*</label>
                    <select className={getSelectClass('billing_state')} name="billing_state" value={formData.billing_state} onChange={handleChange} required>
                      <option value="">Select a State</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Andra Pradesh">Andra Pradesh</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Karnataka">Karnataka</option>
                    </select>
                    {renderError('billing_state')}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="customer-form-label">Country*</label>
                    <select className={getSelectClass('billing_country')} name="billing_country" value={formData.billing_country} onChange={handleChange} required>
                      <option value="">Select a Country</option>
                      <option value="India">India</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Canada">Canada</option>
                      <option value="Iraq">Iraq</option>
                    </select>
                    {renderError('billing_country')}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="customer-form-label">Branch Name*</label>
                    <input type="text" name="billing_branch_name" value={formData.billing_branch_name} className={getInputClass('billing_branch_name')} onChange={handleChange} required />
                    {renderError('billing_branch_name')}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="customer-form-label">GSTIN*</label>
                    <input type="text" name="billing_gstin" value={formData.billing_gstin} className={getInputClass('billing_gstin')} onChange={handleChange} required />
                    {renderError('billing_gstin')}
                  </div>
                </div>
              </div>
            </>
          )}
        </FormSection>
      </form>
    </FormLayout>
  );
};

export default AddCustomerForm;