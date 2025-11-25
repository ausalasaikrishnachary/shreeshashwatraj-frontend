import React from "react";

const ItemsTable = ({
  items,
  editingIndex,
  editedProduct,
  editedBatch,
  editedQuantity,
  productBatches,
  products,
  handleEditClick,
  handleCancelEdit,
  handleQuantityChange,
  handleProductChange,
  handleBatchChange,
  handleUpdateItem,
  handleDeleteItem,
}) => {
  return (
    <div className="table-responsive mt-3">
      <table className="table table-sm table-bordered align-middle">
        <thead className="table-light text-center">
          <tr>
            <th>PRODUCT</th>
            <th>BATCH</th>
            <th>QTY</th>
            <th>PRICE</th>
            <th>DISCOUNT</th>
            <th>GST %</th>
            <th>IGST %</th>
            <th>TOTAL</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {items?.length > 0 ? (
            items.map((item, index) => {
              const isEditing = editingIndex === index;

              return (
                <tr key={index}>
                  {/* PRODUCT */}
                  <td>
                    {isEditing ? (
                      <select
                        value={editedProduct}
                        onChange={handleProductChange}
                        className="form-select form-select-sm"
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      item.product
                    )}
                  </td>

                  {/* BATCH */}
                  <td>
                    {isEditing ? (
                      <select
                        value={editedBatch}
                        onChange={handleBatchChange}
                        className="form-select form-select-sm"
                      >
                        <option value="">Select Batch</option>
                        {(productBatches[editedProduct] || []).map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    ) : (
                      item.batch
                    )}
                  </td>

                  {/* QTY */}
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedQuantity}
                        onChange={handleQuantityChange}
                        className="form-control form-control-sm"
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>

                  {/* PRICE */}
                  <td className="text-end">₹{item.price}</td>

                  {/* DISCOUNT */}
                  <td className="text-end">{item.discount}%</td>

                  {/* GST */}
                  <td className="text-end">{item.gst}%</td>

                  {/* IGST */}
                  <td className="text-end">{item.igst}%</td>

                  {/* TOTAL */}
                  <td className="text-end fw-bold">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </td>

                  {/* ACTION */}
                  <td className="text-center">
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => handleUpdateItem(index)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEditClick(index, item)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteItem(index, item)}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="text-center text-muted">
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;
