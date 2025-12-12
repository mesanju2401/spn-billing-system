import React, { useState, useRef } from 'react';
import './BarcodeInput.css';

const BarcodeInput = ({ onProductScanned }) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!barcode.trim()) {
      alert('Please enter a product ID or barcode');
      return;
    }

    setLoading(true);
    try {
      await onProductScanned(barcode.trim());
      setBarcode('');
      inputRef.current?.focus();
    } catch (error) {
      alert(error.response?.data?.detail || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="barcode-input-container">
      <form onSubmit={handleSubmit} className="barcode-form">
        <div className="input-group">
          <label htmlFor="barcode">Scan/Enter Product ID or Barcode</label>
          <input
            ref={inputRef}
            type="text"
            id="barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan barcode or enter Product ID (e.g., SPN05549901)"
            disabled={loading}
            autoFocus
          />
        </div>
        <button type="submit" disabled={loading} className="add-btn">
          {loading ? 'Adding...' : '➕ Add to Cart'}
        </button>
      </form>
    </div>
  );
};

export default BarcodeInput;