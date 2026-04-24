import React, { useState } from 'react';
import AdminSidebar from '../../../Shared/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../Shared/AdminSidebar/AdminHeader';

const initialStockOut = [
  { id: 1, name: 'Wheat',  price: 2500, openingStock: 500, stockOut: 150, currentStock: 350, lastUpdated: new Date().toLocaleString() },
  { id: 2, name: 'Rice',   price: 3000, openingStock: 400, stockOut: 75,  currentStock: 325, lastUpdated: new Date().toLocaleString() },
  { id: 3, name: 'Sugar',  price: 4000, openingStock: 300, stockOut: 200, currentStock: 100, lastUpdated: new Date().toLocaleString() },
  { id: 4, name: 'Pulses', price: 8000, openingStock: 200, stockOut: 50,  currentStock: 150, lastUpdated: new Date().toLocaleString() },
  { id: 5, name: 'Maize',  price: 2000, openingStock: 350, stockOut: 120, currentStock: 230, lastUpdated: new Date().toLocaleString() },
];

const initialStockIn = [
  { id: 1, name: 'Wheat',  price: 2500, openingStock: 500, stockIn: 300, currentStock: 800, lastUpdated: new Date().toLocaleString() },
  { id: 2, name: 'Rice',   price: 3000, openingStock: 400, stockIn: 250, currentStock: 650, lastUpdated: new Date().toLocaleString() },
  { id: 3, name: 'Sugar',  price: 4000, openingStock: 300, stockIn: 180, currentStock: 480, lastUpdated: new Date().toLocaleString() },
  { id: 4, name: 'Pulses', price: 8000, openingStock: 200, stockIn: 90,  currentStock: 290, lastUpdated: new Date().toLocaleString() },
  { id: 5, name: 'Maize',  price: 2000, openingStock: 350, stockIn: 200, currentStock: 550, lastUpdated: new Date().toLocaleString() },
];

const ProductionPage = () => {
  const [stockOutProducts, setStockOutProducts] = useState(initialStockOut);
  const [stockInProducts, setStockInProducts]   = useState(initialStockIn);
  const [selectedProduct, setSelectedProduct]   = useState(null);
  const [selectedType, setSelectedType]         = useState(null);
  const [adjustAmount, setAdjustAmount]         = useState('');
  const [showModal, setShowModal]               = useState(false);
  const [modalMessage, setModalMessage]         = useState('');
  const [modalType, setModalType]               = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State for Modal Popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalProductType, setModalProductType] = useState(null);
  const [modalAdjustAmount, setModalAdjustAmount] = useState('');

  const showToastMessage = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 3000);
  };

  const handleProductClick = (product, type) => {
    setModalProduct(product);
    setModalProductType(type);
    setModalAdjustAmount('');
    setIsModalOpen(true);
  };

  const handleModalAdjust = (action) => {
    if (!modalProduct) return;
    
    const raw = modalAdjustAmount.toString().trim();
    const amount = parseFloat(raw);
    if (!raw || isNaN(amount) || amount <= 0) {
      showToastMessage('Please enter a valid quantity greater than 0', 'error');
      return;
    }

    const now = new Date().toLocaleString();

    if (modalProductType === 'out') {
      setStockOutProducts(prev =>
        prev.map(p => {
          if (p.id !== modalProduct.id) return p;
          const newStockOut = action === 'add'
            ? p.stockOut + amount
            : Math.max(0, p.stockOut - amount);
          return { ...p, stockOut: newStockOut, lastUpdated: now };
        })
      );
      setModalProduct(prev => {
        const newStockOut = action === 'add'
          ? prev.stockOut + amount
          : Math.max(0, prev.stockOut - amount);
        return { ...prev, stockOut: newStockOut, lastUpdated: now };
      });
      showToastMessage(
        `Stock Out ${action === 'add' ? 'increased' : 'decreased'} by ${amount} kg — ${modalProduct.name}`,
        'success'
      );
    } else {
      setStockInProducts(prev =>
        prev.map(p => {
          if (p.id !== modalProduct.id) return p;
          const newStockIn = action === 'add'
            ? p.stockIn + amount
            : Math.max(0, p.stockIn - amount);
          return { ...p, stockIn: newStockIn, lastUpdated: now };
        })
      );
      setModalProduct(prev => {
        const newStockIn = action === 'add'
          ? prev.stockIn + amount
          : Math.max(0, prev.stockIn - amount);
        return { ...prev, stockIn: newStockIn, lastUpdated: now };
      });
      showToastMessage(
        `Stock In ${action === 'add' ? 'increased' : 'decreased'} by ${amount} kg — ${modalProduct.name}`,
        'success'
      );
    }

    setModalAdjustAmount('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalProduct(null);
    setModalProductType(null);
    setModalAdjustAmount('');
  };

  const formatPrice = (price) => `₹${(price || 0).toLocaleString()}`;
  const isOut = modalProductType === 'out';
  const accentColor = isOut ? '#ef4444' : '#10b981';
  const adjustLabel = isOut ? 'Stock Out (kg)' : 'Stock In (kg)';
  const adjustValue = modalProduct
    ? (isOut ? modalProduct.stockOut : modalProduct.stockIn)
    : 0;

  return (
    <div className="admin-layout">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />
      <div className={`admin-main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <AdminHeader
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={window.innerWidth <= 768}
        />

      {/* Toast */}
      {showModal && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          <div style={{
            backgroundColor: modalType === 'success' ? '#10b981' : '#ef4444',
            color: 'white', padding: '16px 24px', borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '12px', minWidth: '320px'
          }}>
            <span style={{ fontSize: '18px' }}>{modalType === 'success' ? '✓' : '⚠'}</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{modalMessage}</span>
            <button onClick={() => setShowModal(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 'auto', fontSize: '18px' }}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Modal Popup */}
      {isModalOpen && modalProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }} onClick={closeModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              backgroundColor: accentColor,
              padding: '20px 24px',
              color: 'white',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  {isOut ? '📤 Adjust Stock Out' : '📥 Adjust Stock In'} — {modalProduct.name}
                </h3>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Product Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '4px' }}>Product Name</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>{modalProduct.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '4px' }}>Price</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>{formatPrice(modalProduct.price)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '4px' }}>Opening Stock</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>{modalProduct.openingStock} kg</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '4px' }}>Current Stock</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>{modalProduct.currentStock} kg</div>
                </div>
              </div>

              {/* Current Adjust Value */}
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: `${accentColor}10`,
                borderRadius: '12px',
                border: `2px solid ${accentColor}`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Current {adjustLabel}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: accentColor }}>
                  {adjustValue} kg
                </div>
              </div>

              {/* Adjust Controls */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '12px', display: 'block' }}>
                  Adjust Quantity (kg)
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <input
                    type="number"
                    value={modalAdjustAmount}
                    onChange={(e) => setModalAdjustAmount(e.target.value)}
                    placeholder={`Enter ${isOut ? 'stock out' : 'stock in'} quantity`}
                    min="0.01"
                    step="0.01"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: '14px',
                      border: '1px solid #cbd5e0',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = accentColor}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleModalAdjust('less')}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                  >
                    − Remove
                  </button>
                  <button
                    onClick={() => handleModalAdjust('add')}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                  >
                    + Add
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '16px', textAlign: 'center' }}>
                  Only <strong>{adjustLabel}</strong> is updated. Current Stock is not affected.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
     

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>

        {/* Tables */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

          {/* Stock Out */}
          <div style={tableCard}>
            <div style={{ backgroundColor: '#ef4444', padding: '16px 20px', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>📤 Stock Out Table</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Click a row to open modal</p>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                  <tr>
                    {['Product Name','Price (₹)','Opening Stock (kg)','Stock Out (kg)','Current Stock (kg)','Last Updated'].map((h, i) => (
                      <th key={i} style={thStyle(i)}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stockOutProducts.map(product => (
                    <tr key={product.id} onClick={() => handleProductClick(product, 'out')}
                      style={{ cursor: 'pointer', borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                      <td style={td()}>{product.name}</td>
                      <td style={td('right')}>{formatPrice(product.price)}</td>
                      <td style={td('right')}>{product.openingStock}</td>
                      <td style={td('right', '#ef4444')}>{product.stockOut}</td>
                      <td style={td('right', '#3b82f6')}>{product.currentStock}</td>
                      <td style={{ ...td('right'), fontSize: '11px', color: '#718096' }}>{product.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock In */}
          <div style={tableCard}>
            <div style={{ backgroundColor: '#10b981', padding: '16px 20px', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>📥 Stock In Table</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Click a row to open modal</p>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                  <tr>
                    {['Product Name','Price (₹)','Opening Stock (kg)','Stock In (kg)','Current Stock (kg)','Last Updated'].map((h, i) => (
                      <th key={i} style={thStyle(i)}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stockInProducts.map(product => (
                    <tr key={product.id} onClick={() => handleProductClick(product, 'in')}
                      style={{ cursor: 'pointer', borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                      <td style={td()}>{product.name}</td>
                      <td style={td('right')}>{formatPrice(product.price)}</td>
                      <td style={td('right')}>{product.openingStock}</td>
                      <td style={td('right', '#10b981')}>{product.stockIn}</td>
                      <td style={td('right', '#3b82f6')}>{product.currentStock}</td>
                      <td style={{ ...td('right'), fontSize: '11px', color: '#718096' }}>{product.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        tbody tr:hover { filter: brightness(0.97); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
      `}</style>
    </div>
    </div>
  );
};

// Style helpers
const tableCard = {
  flex: 1, minWidth: '300px', backgroundColor: '#ffffff',
  borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};
const thStyle = (i) => ({
  padding: '12px', textAlign: i === 0 ? 'left' : 'right',
  fontSize: '12px', fontWeight: '600', color: '#4a5568',
  borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap'
});
const td = (align = 'left', color = '#1a202c') => ({
  padding: '12px', textAlign: align, fontSize: '14px',
  color, fontWeight: color !== '#1a202c' ? '600' : '400'
});

export default ProductionPage;