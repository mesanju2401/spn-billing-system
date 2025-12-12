import React from 'react';
import './CartTable.css';

const CartTable = ({ items, onUpdateQuantity, onRemoveItem }) => {
  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <p>🛒 Cart is empty. Scan a product to begin.</p>
      </div>
    );
  }

  return (
    <div className="cart-table-container">
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Product ID</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Offer</th>
            <th>Discount</th>
            <th>Line Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="product-name">{item.product_name}</td>
              <td className="product-id">{item.product_id}</td>
              <td className="quantity-cell">
                <div className="quantity-controls">
                  <button
                    onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                    className="qty-btn"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="qty-display">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="price">₹{item.unit_price?.toFixed(2) || '0.00'}</td>
              <td className="offer-text">
                {item.offer_applied || '-'}
              </td>
              <td className="discount">₹{item.discount?.toFixed(2) || '0.00'}</td>
              <td className="line-total">₹{item.line_total?.toFixed(2) || '0.00'}</td>
              <td>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="remove-btn"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CartTable;