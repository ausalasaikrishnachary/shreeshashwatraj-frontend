import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./Expenses.css";

function Expenses() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expensesData, setExpensesData] = useState([
    {
      id: "EXP001",
      staff: { name: "Ravi Kumar", id: "STF001" },
      category: "Travel",
      date: "2024-01-15",
      amount: "₹ 1,250",
      description: "Fuel for retailer visits in Delhi region",
      status: "approved",
      approvedBy: "Admin",
      remarks: "Approved for regular travel expenses"
    },
    {
      id: "EXP002",
      staff: { name: "Priya Singh", id: "STF002" },
      category: "Meals",
      date: "2024-01-14",
      amount: "₹ 450",
      description: "Lunch during client meeting at Mumbai",
      status: "pending"
    },
    {
      id: "EXP003",
      staff: { name: "Amit Verma", id: "STF003" },
      category: "Travel",
      date: "2024-01-12",
      amount: "₹ 2,800",
      description: "Flight tickets for Bangalore business trip",
      status: "rejected",
      approvedBy: "Admin",
      remarks: "Flight booking not pre-approved. Please use train for local travel."
    },
    {
      id: "EXP004",
      staff: { name: "Ravi Kumar", id: "STF001" },
      category: "Communication",
      date: "2024-01-13",
      amount: "₹ 350",
      description: "Mobile recharge for business calls",
      status: "approved",
      approvedBy: "Admin"
    }
  ]);

  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    expenseDate: "",
    description: "",
    receipt: null
  });

  // Calculate summary statistics
  const getSummaryStats = () => {
    const total = expensesData.length;
    const pending = expensesData.filter(expense => expense.status === 'pending').length;
    const approved = expensesData.filter(expense => expense.status === 'approved').length;
    const rejected = expensesData.filter(expense => expense.status === 'rejected').length;
    
    const totalAmount = expensesData.reduce((sum, expense) => {
      const amount = parseInt(expense.amount.replace(/[^0-9]/g, '')) || 0;
      return sum + amount;
    }, 0);

    return {
      total,
      pending,
      approved,
      rejected,
      totalAmount: `₹ ${totalAmount.toLocaleString()}`
    };
  };

  const summaryStats = getSummaryStats();

  const handleApprove = (expenseId) => {
    const updatedExpenses = expensesData.map(expense => 
      expense.id === expenseId 
        ? { ...expense, status: 'approved', approvedBy: 'Admin' }
        : expense
    );
    setExpensesData(updatedExpenses);
  };

  const handleReject = (expenseId) => {
    const updatedExpenses = expensesData.map(expense => 
      expense.id === expenseId 
        ? { ...expense, status: 'rejected', approvedBy: 'Admin' }
        : expense
    );
    setExpensesData(updatedExpenses);
  };

  const handleAddExpenseClick = () => {
    setShowAddExpense(true);
  };

  const handleCancelAddExpense = () => {
    setShowAddExpense(false);
    setNewExpense({
      category: "",
      amount: "",
      expenseDate: "",
      description: "",
      receipt: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setNewExpense(prev => ({
      ...prev,
      receipt: e.target.files[0]
    }));
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    
    if (!newExpense.category || !newExpense.amount || !newExpense.expenseDate || !newExpense.description) {
      alert("Please fill in all required fields");
      return;
    }

    const expense = {
      id: `EXP${String(expensesData.length + 1).padStart(3, '0')}`,
      staff: { name: "Current User", id: "STF000" },
      category: newExpense.category,
      date: newExpense.expenseDate,
      amount: `₹ ${parseInt(newExpense.amount).toLocaleString()}`,
      description: newExpense.description,
      status: "pending"
    };

    setExpensesData(prev => [...prev, expense]);
    handleCancelAddExpense();
  };

  const getStatusBadge = (status, expense = null) => {
    switch (status) {
      case 'approved':
        return (
          <span className="status-badge approved">
            Approved
            {expense && expense.approvedBy && (
              <span className="approved-by">by {expense.approvedBy}</span>
            )}
          </span>
        );
      case 'rejected':
        return (
          <span className="status-badge rejected">
            Rejected
            {expense && expense.approvedBy && (
              <span className="approved-by">by {expense.approvedBy}</span>
            )}
          </span>
        );
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      default:
        return null;
    }
  };

  // Summary Cards Component
  const SummaryCards = () => (
    <div className="summary-cards">
      <div className="summary-card total">
        <div className="card-icon">📊</div>
        <div className="card-content">
          <div className="card-value">{summaryStats.total}</div>
          <div className="card-label">Total Expenses</div>
        </div>
      </div>
      
      <div className="summary-card pending">
        <div className="card-icon">⏳</div>
        <div className="card-content">
          <div className="card-value">{summaryStats.pending}</div>
          <div className="card-label">Pending</div>
        </div>
      </div>
      
      <div className="summary-card approved">
        <div className="card-icon">✅</div>
        <div className="card-content">
          <div className="card-value">{summaryStats.approved}</div>
          <div className="card-label">Approved</div>
        </div>
      </div>
      
      <div className="summary-card rejected">
        <div className="card-icon">❌</div>
        <div className="card-content">
          <div className="card-value">{summaryStats.rejected}</div>
          <div className="card-label">Rejected</div>
        </div>
      </div>
      
      <div className="summary-card amount">
        <div className="card-icon">💰</div>
        <div className="card-content">
          <div className="card-value">{summaryStats.totalAmount}</div>
          <div className="card-label">Total Amount</div>
        </div>
      </div>
    </div>
  );

  // Add Expense Form Component
  const AddExpenseForm = () => (
    <div className="add-expense-container">
      
      <div className="add-expense-form-container">
        <form onSubmit={handleSubmitExpense} className="add-expense-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select 
                id="category"
                name="category"
                value={newExpense.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Communication">Communication</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (₹) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newExpense.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="expenseDate">Expense Date *</label>
            <input
              type="date"
              id="expenseDate"
              name="expenseDate"
              value={newExpense.expenseDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={newExpense.description}
              onChange={handleInputChange}
              placeholder="Enter expense description"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="receipt">Receipt (Optional)</label>
            <div className="file-upload">
              <input
                type="file"
                id="receipt"
                name="receipt"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label htmlFor="receipt" className="file-upload-label">
                Choose File
              </label>
              <span className="file-name">
                {newExpense.receipt ? newExpense.receipt.name : "No file chosen"}
              </span>
            </div>
            <small>Supported formats: PDF, JPG, PNG (Max 5MB)</small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancelAddExpense}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Submit Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Main Expenses Table Component
  const ExpensesTable = () => (
    <div className="expenses-container">
      <div className="expenses-header">
        <div className="header-content">
          <div>
            <h1>All Expenses</h1>
            <p>Review and manage staff expense submissions</p>
          </div>
          <button className="btn-add-expense" onClick={handleAddExpenseClick}>
            + Add Expense
          </button>
        </div>
      </div>

      <SummaryCards />

      <div className="expenses-section">
        <div className="section-header">
          <h2>📊 Expenses List ({expensesData.length})</h2>
          <p>Review and approve staff expense submissions</p>
        </div>

        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Staff</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expensesData.map((expense) => (
                <tr key={expense.id}>
                  <td className="expense-id">{expense.id}</td>
                  <td className="staff-info">
                    <div className="staff-name">{expense.staff.name}</div>
                    <div className="staff-id">{expense.staff.id}</div>
                  </td>
                  <td className="category">{expense.category}</td>
                  <td className="date">{expense.date}</td>
                  <td className="amount">{expense.amount}</td>
                  <td className="description">{expense.description}</td>
                  <td className="status">
                    {getStatusBadge(expense.status, expense)}
                    {expense.remarks && expense.status !== 'pending' && (
                      <div className="remarks">{expense.remarks}</div>
                    )}
                  </td>
                  <td className="actions">
                    {expense.status === 'pending' && (
                      <div className="action-buttons">
                        <button className="btn-approve" onClick={() => handleApprove(expense.id)}>
                          Approve
                        </button>
                        <button className="btn-reject" onClick={() => handleReject(expense.id)}>
                          Reject
                        </button>
                      </div>
                    )}
                    {expense.status !== 'pending' && (
                      <span className="no-actions">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
              <AdminHeader isCollapsed={isCollapsed} />

        {showAddExpense ? <AddExpenseForm /> : <ExpensesTable />}
      </div>
    </div>
  );
}

export default Expenses;