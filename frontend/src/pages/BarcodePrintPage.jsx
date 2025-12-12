import React, { useState } from 'react';
import { getProductByBarcode } from '../api/products';
import './BarcodePrintPage.css';

const BarcodePrintPage = () => {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState(null);
  const [copies, setCopies] = useState(1);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!productId.trim()) {
      alert('Please enter a Product ID');
      return;
    }

    setSearching(true);
    try {
      const data = await getProductByBarcode(productId);
      setProduct(data);
    } catch (error) {
      alert('Product not found');
      setProduct(null);
    } finally {
      setSearching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStickers = () => {
    if (!product) return null;

    const stickers = [];
    for (let i = 0; i < copies; i++) {
      stickers.push(
        <div key={i} className="barcode-sticker">
          <div className="sticker-header">
            <h3>{product.name}</h3>
          </div>
          <div className="sticker-barcode">
            <div className="barcode-lines">
              {/* Simulated barcode visual */}
              {Array.from({ length: 30 }).map((_, idx) => (
                <div
                  key={idx}
                  className="barcode-line"
                  style={{
                    width: `${Math.random() * 3 + 1}px`,
                    height: '60px',
                    backgroundColor: '#000'
                  }}
                />
              ))}
            </div>
            <div className="barcode-text">{product.product_id}</div>
          </div>
          <div className="sticker-details">
            <div className="price-row">
              <span className="label">MRP:</span>
              <span className="value mrp">₹{product.mrp}</span>
            </div>
            <div className="price-row">
              <span className="label">Price:</span>
              <span className="value selling">₹{product.selling_price}</span>
            </div>
          </div>
          <div className="sticker-footer">
            <span>SPN Novelty</span>
          </div>
        </div>
      );
    }
    return stickers;
  };

  return (
    <div className="barcode-print-page">
      <div className="print-controls no-print">
        <h1>🏷️ Barcode Label Printing</h1>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label htmlFor="productId">Product ID</label>
              <input
                type="text"
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter Product ID (e.g., SPN05549901)"
              />
            </div>
            <button type="submit" disabled={searching} className="search-btn">
              {searching ? 'Searching...' : '🔍 Search'}
            </button>
          </form>
        </div>

        {product && (
          <div className="product-preview">
            <h2>Product Details</h2>
            <div className="preview-details">
              <div className="detail-row">
                <span>Product ID:</span>
                <strong>{product.product_id}</strong>
              </div>
              <div className="detail-row">
                <span>Name:</span>
                <strong>{product.name}</strong>
              </div>
              <div className="detail-row">
                <span>Category:</span>
                <strong>{product.category || '-'}</strong>
              </div>
              <div className="detail-row">
                <span>MRP:</span>
                <strong>₹{product.mrp}</strong>
              </div>
              <div className="detail-row">
                <span>Selling Price:</span>
                <strong>₹{product.selling_price}</strong>
              </div>
            </div>

            <div className="copies-section">
              <label htmlFor="copies">Number of Labels:</label>
              <input
                type="number"
                id="copies"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="100"
              />
            </div>

            <button onClick={handlePrint} className="print-btn">
              🖨️ Print {copies} Label{copies > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>

      {product && (
        <div className="print-preview">
          <h2 className="no-print">Print Preview</h2>
          <div className="stickers-grid">
            {renderStickers()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodePrintPage;