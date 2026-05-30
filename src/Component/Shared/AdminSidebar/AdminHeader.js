import React from "react";
import { useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import "./AdminHeader.css";

function AdminHeader({ isCollapsed, onToggleSidebar, isMobile }) {
  const location = useLocation();

  const pageTitles = {
    "/admindashboard": "Dashboard",
    "/retailers": "Contact",
    "/retailers/add": "Add Contact",
    "/retailersscore": "Score",
    "/staff": "Staff",
    "/AddProductPage": "Purchase Catalogue",
    "/products": "Products",
    "/add-product": "Add Product",
    "/marketing": "Offers & Marketing",
    "/add-marketing": "Add Marketing",
    "/expenses": "Expenses",
    "/reports": "Reports",
    "/roleaccess": "Role Access",
    "/sales_visit": "Sales Visit",
    "/sale_items": "Sales Items",
    "/purchased_items": "Purchase Items",
    "/admin_expensive": "Expense Requests",
    "/ledger": "Ledger",
    "/sales/create_note": "Sales Credit Note",
    "/purchase/create_note": "Purchase Debit Note",
    "/purchase/create-purchase-invoice": "Create Purchase Invoice",
    "/kacha_sales": "Kacha Sales Create Invoice",
    "/period": "Order",
    "/credit-period": "Credit Period",
    "/kachareceipts": "Receipts",
    "/sales/receipts": "Receipts",
    "/sales/invoices": "Sales Invoices Table",
    "/kachapurchaseinvoicetable": "Kacha Purchases Table",
    "/kachapurchaseinvoice": "Create Kacha Purchase Invoice",
    "/kachaPurchasevoucher": "Kacha Purchase Voucher",
    "/kachacreditenotetable": "Kacha CreditNotes Table",
    "/kachacreditenote": "Kacha Credit Note",
    "/kachaeditcreditnote": "Kacha Edit Credit Note",
    "/kachadebitnotetable": "Kacha DebitNotes Table",
    "/kachadebitnote": "Kacha Debit Note",
    "/kachaeditdebitenote": "Kacha Edit Debit Note",
    "/kachacreditview": "Kacha Credit View",
    "/kachinvoicetable": "Kacha Sales Invoices",
    "/purchase/purchase-invoice": "Purchase Invoices Table",
    "/purchase/voucher": "Payment Management",
    "/salesitemspage": "Sales Catalog",
    "/sales/createinvoice": "Create Invoice",
    "/purchase/debit_note": "Create Purchase DebitNote",
    "/purchase/debit-note/edit": "Edit Purchase DebitNote",
    "/sales/credit_note": "Sales CreditNotes Table",
    "/sales/credit-note/edit": "Edit Sales CreditNote",
    "/purchase/debit-note": "Purchase DebitNotes Table",
    "/Purchase/editinvoice": "Purchase Edit Invoice",
    "/kachapurchaseedit": "Kacha Purchase Edit Invoice",
    "/Productionpage": "Production",
  };

  const getPageTitle = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    for (const path in pageTitles) {
      if (location.pathname.startsWith(path)) {
        return pageTitles[path];
      }
    }
    return "Dashboard";
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="header-left">
          {isMobile && (
            <button
              className="header-toggle-btn"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
            >
              <FaBars />
            </button>
          )}
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>

        <div className="header-right">
          <span className="welcome-text">Welcome back, Admin User</span>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;