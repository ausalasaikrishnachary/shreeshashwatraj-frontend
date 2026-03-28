import React, { useState, useEffect } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";
import "./AddStaff.css";
import { baseurl } from "../../../BaseURL/BaseURL";

// Tab Navigation Component
const TabNavigation = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="staff-form-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`staff-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Form Section Component
const FormSection = ({ 
  id, 
  activeTab, 
  title, 
  children, 
  onBack, 
  onNext, 
  onSubmit, 
  isLast = false,
  isViewing = false,
  onCancel,
  submitLabel = "Submit",
  nextLabel = "Next"
}) => {
  if (id !== activeTab) return null;

  return (
    <div className={`staff-form-card ${id === activeTab ? 'active-section' : ''}`}>
      <h3 className="staff-section-title">{title}</h3>
      <div className="staff-form-section">
        {children}
      </div>
      <div className="staff-form-actions">
        <div className="left-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <div className="right-actions">
          {onBack && (
            <button type="button" className="back-btn" onClick={onBack}>
              Back
            </button>
          )}
          {onNext && !isLast && (
            <button type="button" className="next-btn" onClick={onNext}>
              {nextLabel}
            </button>
          )}
          {onSubmit && isLast && (
            <button type="submit" className="submit-btn">
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Input Components
const Input = ({ label, ...props }) => (
  <div className="adminform-group">
    <label className="staff-form-label">{label}{props.required && '*'}</label>
    <input className="form-input staff-form-input" {...props} />
  </div>
);

const FullInput = ({ label, ...props }) => (
  <div className="adminform-group full-width">
    <label className="staff-form-label">{label}{props.required && '*'}</label>
    <textarea className="form-input staff-form-input" {...props} rows="2"></textarea>
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="adminform-group">
    <label className="staff-form-label">{label}{props.required && '*'}</label>
    <select className="form-select staff-form-input" {...props}>
      <option value="">Select</option>
      {options.map((op, i) => (
        <option key={i} value={op}>{op}</option>
      ))}
    </select>
  </div>
);

function AddStaff() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    alternateNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    role: "staff",
    designation: "",
    department: "",
    joiningDate: "",
    incentivePercent: "",
    salary: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",
    aadhaarNumber: "",
    panNumber: "",
    bloodGroup: "",
    emergencyContact: "",
    status: "Active",
      password: "" ,
     invoiceEnabled: 0
  });

  const tabs = [
    { id: 'basic', label: 'Basic Details' },
    { id: 'job', label: 'Job Details' },
    { id: 'bank', label: 'Bank Details' },
    { id: 'documents', label: 'Documents' }
  ];

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
    
    if (!response.ok) {
      throw new Error(`Failed to fetch staff data: ${response.status}`);
    }
    
    const staffData = await response.json();
    
    // Log the data to see what's being returned
    console.log('Staff Data Response:', staffData);
     console.log('Password from API:', staffData.password || staffData[0]?.password); // Add this lin
    
    // Handle if staffData is an array or single object
    const data = Array.isArray(staffData) ? staffData[0] : staffData;
    
    if (!data) {
      throw new Error('No staff data found');
    }
    
    setFormData({
      fullName: data.name || data.fullName || data.full_name || "",
      mobileNumber: data.mobile_number || data.mobileNumber || "",
      alternateNumber: data.alternate_number || data.alternateNumber || "",
      email: data.email || "",
dateOfBirth: data.date_of_birth 
  ? data.date_of_birth.split("T")[0] 
  : (data.dateOfBirth || ""),

joiningDate: data.joining_date 
  ? data.joining_date.split("T")[0] 
  : (data.joiningDate || ""),
        gender: data.gender || "",
      address: data.address || "",
      role: data.role || "staff",
      designation: data.designation || "",
      department: data.department || "",
   
      incentivePercent: data.incentive_percent || data.incentivePercent || "",
      salary: data.salary || "",
      bankAccountNumber: data.bank_account_number || data.bankAccountNumber || "",
      ifscCode: data.ifsc_code || data.ifscCode || "",
      bankName: data.bank_name || data.bankName || "",
      branchName: data.branch_name || data.branchName || "",
      upiId: data.upi_id || data.upiId || "",
      aadhaarNumber: data.aadhaar_number || data.aadhaarNumber || "",
      panNumber: data.pan || data.pan_number || data.panNumber || "",
      bloodGroup: data.blood_group || data.bloodGroup || "",
      emergencyContact: data.emergency_contact || data.emergencyContact || "",
      status: data.status || "Active",
        password: data.password || "" ,
        invoiceEnabled: data.is_dual_account === 1 ? 1 : 0,
    });
  } catch (err) {
    console.error('Error fetching staff data:', err);
    setError("Failed to load staff data: " + err.message);
  } finally {
    setIsFetching(false);
  }
};

  // Validation functions
  const validateBankAccountNumber = (value) => {
    if (!value) return true; // Allow empty
    const cleaned = value.replace(/\D/g, '');
    return /^\d{9,16}$/.test(cleaned);
  };

  const validateIFSCCode = (value) => {
    if (!value) return true; // Allow empty
    // Accept only alphanumeric characters, exactly 11 characters
    return /^[A-Z0-9]{11}$/.test(value.toUpperCase());
  };

  const validateAadhaarNumber = (value) => {
    if (!value) return true; // Allow empty
    const cleaned = value.replace(/\D/g, '');
    return /^\d{12}$/.test(cleaned);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Apply specific validation and formatting based on field type
    switch (name) {
      case 'bankAccountNumber':
        // Remove non-digit characters
        processedValue = value.replace(/\D/g, '');
        // Limit to 16 digits
        processedValue = processedValue.slice(0, 16);
        break;
        
      case 'ifscCode':
        // Convert to uppercase and remove special characters
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        // Limit to 11 characters
        processedValue = processedValue.slice(0, 11);
        break;
        
      case 'aadhaarNumber':
        // Remove non-digit characters
        processedValue = value.replace(/\D/g, '');
        // Limit to 12 digits
        processedValue = processedValue.slice(0, 12);
        break;
        
      case 'mobileNumber':
      case 'alternateNumber':
      case 'emergencyContact':
        // Remove non-digit characters for phone numbers
        processedValue = value.replace(/\D/g, '');
        // Limit to 10 digits
        processedValue = processedValue.slice(0, 10);
        break;
        
      case 'panNumber':
        // Convert to uppercase and remove special characters
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        // Limit to 10 characters
        processedValue = processedValue.slice(0, 10);
        break;
        
      default:
        break;
    }
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (error) setError("");
  };

  const validateCurrentTab = () => {
    const newErrors = [];
    
    switch (activeTab) {
      case 'basic':
        if (!formData.fullName.trim()) newErrors.push("Full name required");
        if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.push("Invalid mobile number (10 digits required)");
        if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.push("Invalid email format");
        break;
      case 'job':
        if (!formData.designation) newErrors.push("Designation is required");
        if (!formData.department) newErrors.push("Department is required");
        if (!formData.joiningDate) newErrors.push("Joining date is required");
        break;
      case 'bank':
        if (formData.bankAccountNumber && !validateBankAccountNumber(formData.bankAccountNumber)) {
          newErrors.push("Invalid bank account number (9-16 digits required)");
        }
        if (formData.ifscCode && !validateIFSCCode(formData.ifscCode)) {
          newErrors.push("Invalid IFSC code (11 alphanumeric characters only)");
        }
        break;
      case 'documents':
        if (formData.aadhaarNumber && !validateAadhaarNumber(formData.aadhaarNumber)) {
          newErrors.push("Invalid Aadhaar number (12 digits required)");
        }
        if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
          newErrors.push("Invalid PAN number format (e.g., ABCDE1234F)");
        }
        if (formData.emergencyContact && !/^\d{10}$/.test(formData.emergencyContact)) {
          newErrors.push("Invalid emergency contact number (10 digits required)");
        }
        break;
    }
    
    if (newErrors.length > 0) {
      setError(newErrors.join(", "));
      return false;
    }
    
    setError("");
    return true;
  };

  const handleTabClick = (tab) => {
    if (validateCurrentTab()) {
      setActiveTab(tab);
    } else {
      alert('Please fix the errors in the current tab before proceeding.');
    }
  };

  const handleNext = () => {
    if (!validateCurrentTab()) {
      alert('Please fill all required fields in the current tab.');
      return;
    }
    
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate all tabs before submission
  let allTabsValid = true;
  const validationErrors = [];
  
  // Validate basic tab
  if (!formData.fullName.trim()) {
    validationErrors.push("Full name required");
    allTabsValid = false;
  }
  if (!/^\d{10}$/.test(formData.mobileNumber)) {
    validationErrors.push("Invalid mobile number (10 digits required)");
    allTabsValid = false;
  }
  
  // Validate job tab
  if (!formData.designation) {
    validationErrors.push("Designation is required");
    allTabsValid = false;
  }
  if (!formData.department) {
    validationErrors.push("Department is required");
    allTabsValid = false;
  }
  if (!formData.joiningDate) {
    validationErrors.push("Joining date is required");
    allTabsValid = false;
  }
  
  // Validate bank tab if bank details are provided
  if (formData.bankAccountNumber && !validateBankAccountNumber(formData.bankAccountNumber)) {
    validationErrors.push("Invalid bank account number (9-16 digits required)");
    allTabsValid = false;
  }
  if (formData.ifscCode && !validateIFSCCode(formData.ifscCode)) {
    validationErrors.push("Invalid IFSC code (11 alphanumeric characters only)");
    allTabsValid = false;
  }
  
  // Validate documents tab
  if (formData.aadhaarNumber && !validateAadhaarNumber(formData.aadhaarNumber)) {
    validationErrors.push("Invalid Aadhaar number (12 digits required)");
    allTabsValid = false;
  }
  if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
    validationErrors.push("Invalid PAN number format (e.g., ABCDE1234F)");
    allTabsValid = false;
  }
  if (formData.emergencyContact && !/^\d{10}$/.test(formData.emergencyContact)) {
    validationErrors.push("Invalid emergency contact number (10 digits required)");
    allTabsValid = false;
  }
  
  if (!allTabsValid) {
    setError(validationErrors.join(", "));
    return;
  }
  
  setIsLoading(true);

  try {
    const url = isEditMode
      ? `${baseurl}/api/staff/${id}`
      : `${baseurl}/api/staff`;

    // Prepare data for API - match backend field names
    const apiData = {
      fullName: formData.fullName,
      mobileNumber: formData.mobileNumber,
      alternateNumber: formData.alternateNumber || null,
      email: formData.email || "",
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender || null,
      address: formData.address || null,
      role: formData.role,
      designation: formData.designation || null,
      department: formData.department || null,
      joiningDate: formData.joiningDate || null,
      incentivePercent: formData.incentivePercent || null,
      salary: formData.salary || null,
      bankAccountNumber: formData.bankAccountNumber || null,
      ifscCode: formData.ifscCode || null,
      bankName: formData.bankName || null,
      branchName: formData.branchName || null,
      upiId: formData.upiId || null,
      aadhaarNumber: formData.aadhaarNumber || null,
      panNumber: formData.panNumber || null,
      bloodGroup: formData.bloodGroup || null,
      emergencyContact: formData.emergencyContact || null,
      status: formData.status,
      invoiceEnabled: formData.invoiceEnabled 
    };

    // For edit mode, ensure email is not empty since backend requires it
    if (isEditMode && !apiData.email) {
      apiData.email = "placeholder@example.com"; // Or use existing email
    }

    const response = await fetch(url, {
      method: isEditMode ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiData)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || "Operation failed");
    }

    alert(isEditMode ? "Staff updated!" : "Staff added!");
    navigate("/staff");
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleCancel = () => {
    navigate("/staff");
  };

  return (
    <div className="add-staff-page-wrapper">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`add-staff-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="add-staff-container">
          <h1 className="page-title">{isEditMode ? "Edit Staff" : "Add New Staff"}</h1>
          {error && <div className="error-message">{error}</div>}

          {isFetching ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading staff data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="staff-form">
              <TabNavigation 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabClick={handleTabClick} 
              />
              
          <FormSection
  id="basic"
  activeTab={activeTab}
  title="Basic Details"
  onBack={null}
  onNext={handleNext}
  nextLabel="Job Details"
  onCancel={handleCancel}
>
  <div className="form-grid">
    {/* Row 1: Full Name and Mobile Number */}
    <div className="form-field">
      <label className="staff-form-label">Full Name *</label>
      <input 
        type="text"
        name="fullName" 
        className="staff-form-input"
        value={formData.fullName} 
        onChange={handleInputChange} 
        required 
      />
    </div>
    <div className="form-field">
      <label className="staff-form-label">Mobile Number *</label>
      <input 
        type="text"
        name="mobileNumber" 
        className="staff-form-input"
        value={formData.mobileNumber} 
        onChange={handleInputChange} 
        disabled={isEditMode}
        required 
      />
    </div>
    
    {/* Row 2: Alternate Number and Email */}
    <div className="form-field">
      <label className="staff-form-label">Alternate Number</label>
      <input 
        type="text"
        name="alternateNumber" 
        className="staff-form-input"
        value={formData.alternateNumber} 
        onChange={handleInputChange} 
      />
    </div>
    <div className="form-field">
      <label className="staff-form-label">Email *</label>
      <input 
        type="email"
        name="email" 
        className="staff-form-input"
        value={formData.email} 
        onChange={handleInputChange} 
        required 
      />
    </div>
    
    {/* Row 3: Date of Birth and Gender */}
    <div className="form-field">
      <label className="staff-form-label">Date of Birth</label>
      <input 
        type="date"
        name="dateOfBirth" 
        className="staff-form-input"
        value={formData.dateOfBirth} 
        onChange={handleInputChange} 
      />
    </div>
    <div className="form-field">
      <label className="staff-form-label">Gender</label>
      <select 
        name="gender" 
        className="staff-form-input"
        value={formData.gender} 
        onChange={handleInputChange}
      >
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    </div>
    
    {/* Row 4: Address and Password - SIDE BY SIDE */}
    <div className="form-field address-field">
      <label className="staff-form-label">Address</label>
     <textarea 
  name="address"
  value={formData.address} 
  onChange={handleInputChange}
  rows={3}
  placeholder="Enter full address"
  style={{
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",   
    resize: "vertical"
  }}
/>
    </div>
    <div className="form-field password-field">
  <label className="staff-form-label">Password</label>
  <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
    <input 
      type={showPassword ? "text" : "password"}
      name="password"
      className="staff-form-input"
      value={formData.password}
      readOnly={isEditMode}
      placeholder={isEditMode ? "Password cannot be edited" : "Auto-generated"}
      style={{ flex: 1 }}
      disabled={isEditMode}
    />
    {formData.password && (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          padding: "0 12px",
          background: "#f0f0f0",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    )}
  </div>
 
</div>
    
    {/* Row 5: Enable Invoice Checkbox - Full Width */}
 <div style={{ width: "100%", marginTop: "10px" }}>
  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
    
    <input
      type="checkbox"
      name="invoiceEnabled"
      checked={formData.invoiceEnabled === 1}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          invoiceEnabled: e.target.checked ? 1 : 0
        }))
      }
      style={{
        width: "20px",
        height: "19px",
        cursor: "pointer"
      }}
    />

    <span style={{ fontSize: "14px" }}>
      Enable Invoice
    </span>

  </label>
</div>
  </div>
</FormSection>




              <FormSection
                id="job"
                activeTab={activeTab}
                title="Job Details"
                onBack={handleBack}
                onNext={handleNext}
                nextLabel="Bank Details"
                onCancel={handleCancel}
              >
                <div className="form-grid">
                  <Input 
                    label="Designation" 
                    name="designation" 
                    value={formData.designation} 
                    onChange={handleInputChange} 
                    required
                  />
                  <Input 
                    label="Department" 
                    name="department" 
                    value={formData.department} 
                    onChange={handleInputChange} 
                    required
                  />
                  <Input 
                    type="date" 
                    label="Joining Date" 
                    name="joiningDate" 
                    value={formData.joiningDate} 
                    onChange={handleInputChange} 
                    required
                  />
                  <Input 
                    type="number" 
                    label="Incentive %" 
                    name="incentivePercent" 
                    value={formData.incentivePercent} 
                    onChange={handleInputChange} 
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <Input 
                    type="number" 
                    label="Salary" 
                    name="salary" 
                    value={formData.salary} 
                    onChange={handleInputChange} 
                    min="0"
                  />
                </div>
              </FormSection>

              <FormSection
                id="bank"
                activeTab={activeTab}
                title="Bank Details"
                onBack={handleBack}
                onNext={handleNext}
                nextLabel="Documents"
                onCancel={handleCancel}
              >
                <div className="form-grid">
                  <Input 
                    label="Bank Account Number" 
                    name="bankAccountNumber" 
                    value={formData.bankAccountNumber} 
                    onChange={handleInputChange}
                    placeholder="9-16 digits only"
                    title="Enter 9-16 digit account number"
                  />
                  <Input 
                    label="IFSC Code" 
                    name="ifscCode" 
                    value={formData.ifscCode} 
                    onChange={handleInputChange}
                    placeholder="11 characters (alphanumeric)"
                    title="Enter 11 character IFSC code (letters and numbers only)"
                  />
                  <Input 
                    label="Bank Name" 
                    name="bankName" 
                    value={formData.bankName} 
                    onChange={handleInputChange} 
                  />
                  <Input 
                    label="Branch Name" 
                    name="branchName" 
                    value={formData.branchName} 
                    onChange={handleInputChange} 
                  />
                  <Input 
                    label="UPI ID" 
                    name="upiId" 
                    value={formData.upiId} 
                    onChange={handleInputChange} 
                  />
                </div>
              </FormSection>

              <FormSection
                id="documents"
                activeTab={activeTab}
                title="Documents & Status"
                onBack={handleBack}
                onSubmit={handleSubmit}
                isLast={true}
                onCancel={handleCancel}
                submitLabel={isEditMode ? "Update Staff" : "Add Staff"}
              >
                <div className="form-grid">
                  <Input 
                    label="Aadhaar Number" 
                    name="aadhaarNumber" 
                    value={formData.aadhaarNumber} 
                    onChange={handleInputChange}
                    placeholder="12 digits only"
                    title="Enter 12 digit Aadhaar number"
                  />
                  <Input 
                    label="PAN Number" 
                    name="panNumber" 
                    value={formData.panNumber} 
                    onChange={handleInputChange}
                    placeholder="ABCDE1234F"
                    title="Enter PAN in format: ABCDE1234F"
                  />
                  <Input 
                    label="Blood Group" 
                    name="bloodGroup" 
                    value={formData.bloodGroup} 
                    onChange={handleInputChange} 
                  />
                  <Input 
                    label="Emergency Contact" 
                    name="emergencyContact" 
                    value={formData.emergencyContact} 
                    onChange={handleInputChange}
                    placeholder="10 digits only"
                  />
                  <Select 
                    label="Status" 
                    name="status" 
                    value={formData.status}
                    onChange={handleInputChange} 
                    options={["Active", "Inactive"]} 
                  />
                </div>
              </FormSection>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddStaff;