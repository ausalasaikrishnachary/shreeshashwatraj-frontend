// import React from 'react';

// const IRNForm = ({ formData, branches, loading, onChange, onSubmit }) => {
//   return (
//     <form onSubmit={onSubmit} className="irn-form">
//       <div className="form-grid">
//         <div className="form-group">
//           <label>Username *</label>
//           <input
//             type="text"
//             name="username"
//             value={formData.username}
//             onChange={onChange}
//             required
//             placeholder="Enter your username"
//           />
//         </div>

//         <div className="form-group">
//           <label>Password *</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={onChange}
//             required
//             placeholder="Enter your password"
//           />
//         </div>

//         <div className="form-group">
//           <label>Access Token *</label>
//           <input
//             type="text"
//             name="accessToken"
//             value={formData.accessToken}
//             onChange={onChange}
//             required
//             placeholder="Enter access token"
//           />
//         </div>

//         <div className="form-group">
//           <label>Invoice ID *</label>
//           <input
//             type="number"
//             name="invoiceId"
//             value={formData.invoiceId}
//             onChange={onChange}
//             required
//             placeholder="Enter invoice ID"
//           />
//         </div>

//         {/* <div className="form-group">
//           <label>Branch *</label>
//           <select
//             name="branchId"
//             value={formData.branchId}
//             onChange={onChange}
//             required
//           >
//             <option value="">Select Branch</option>
//             {branches.map(branch => (
//               <option key={branch.branch_id} value={branch.branch_id}>
//                 {branch.branch_name} - {branch.GST}
//               </option>
//             ))}
//           </select>
//         </div> */}

//         <div className="form-group">
//           <label>Seller GSTIN *</label>
//           <input
//             type="text"
//             name="sellerGstin"
//             value={formData.sellerGstin}
//             onChange={onChange}
//             required
//             placeholder="Enter seller GSTIN"
//           />
//         </div>
//       </div>

//       <button type="submit" disabled={loading} className="submit-btn">
//         {loading ? (
//           <>
//             <span className="spinner"></span>
//             Generating IRN...
//           </>
//         ) : (
//           'Generate IRN'
//         )}
//       </button>
//     </form>
//   );
// };

// export default IRNForm;



import React from 'react';

const IRNForm = ({ formData, branches, loading, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="irn-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username || "adqgsphpusr1"}
            onChange={onChange}
            required
            placeholder="Enter your username"
          />
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password || "Gsp@1234"}
            onChange={onChange}
            required
            placeholder="Enter your password"
          />
        </div>

        <div className="form-group">
          <label>Access Token *</label>
          <input
            type="text"
            name="accessToken"
            value={formData.accessToken || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJnc3AiXSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9TQl9BUElfRVdCIiwiUk9MRV9TQl9BUElfR1NUX0NPTU1PTiIsIlJPTEVfU0JfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9FX0FQSV9FV0IiLCJST0xFX1NCX0VfQVBJX0dTVF9DT01NT04iLCJST0xFX1NCX0VfQVBJX0dTVF9SRVRVUk5TIiwiUk9MRV9TQl9BUElfRUkiLCJST0xFX1NCX0VfQVBJX0VJIiwiUk9MRV9TQl9BUElfR1NQX09USEVSUyJdLCJqdGkiOiIzOGVmOTlmNi05ZDQxLTQ4NmYtYjlhYy00YTA4Zjk5NTZiY2EiLCJjbGllbnRfaWQiOiI3OTUzNkUzOUYyMTY0NDk4ODM3MjBDQ0Q1MzY0M0Q4RiIsInN1YiI6Ijc5NTM2RTM5RjIxNjQ0OTg4MzcyMENDRDUzNjQzRDhGIiwiZXhwIjoxNzgxNTA2ODgyfQ.TJF16LJTUjWbGldZLOGepkD4fAvpn2AwD6721P3_f6U"}
            onChange={onChange}
            required
            placeholder="Enter access token"
          />
        </div>

        <div className="form-group">
          <label>Invoice ID *</label>
          <input
            type="text"
            name="invoiceId"
            value={formData.invoiceId || "SSA/000004/26-27"}
            onChange={onChange}
            required
            placeholder="Enter invoice ID"
          />
        </div>

        {/* <div className="form-group">
          <label>Branch ID *</label>
          <input
            type="number"
            name="branchId"
            value={formData.branchId || ""}
            onChange={onChange}
            required
            placeholder="Enter branch ID"
          />
        </div> */}

        <div className="form-group">
          <label>Seller GSTIN *</label>
          <input
            type="text"
            name="sellerGstin"
            value={formData.sellerGstin || "02AMBPG7773M002"}
            onChange={onChange}
            required
            placeholder="Enter seller GSTIN"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? (
          <>
            <span className="spinner"></span>
            Generating IRN...
          </>
        ) : (
          'Generate IRN'
        )}
      </button>
    </form>
  );
};

export default IRNForm;