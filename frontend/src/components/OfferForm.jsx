import React, { useState } from 'react';
import { getProductByBarcode } from '../api/products';
import './OfferForm.css';

const OfferForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    offer_type: 'BUY_X_GET_Y',
    x_quantity: '',
    y_quantity: '',
    discount_percent: '',
    discount_flat: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true,
  });

  const [searchingProduct, setSearchingProduct] = useState(false);

  const handleProductSearch = async () => {
    if (!formData.product_id) {
      alert('Please enter a Product ID');
      return;
    }

    setSearchingProduct(true);
    try {
      const product = await getProductByBarcode(formData.product_id);
      setFormData({
        ...formData,
        product_name: product.name,
      });
    } catch (error) {
      alert('Product not found');
    } finally {
      setSearchingProduct(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get product database ID first
    try {
      const product = await getProductByBarcode(formData.product_id);
      
      const data = {
        product_id: product.id, // Use database ID
        offer_type: formData.offer_type,
        x_quantity: formData.x_quantity ? parseInt(formData.x_quantity) : null,
        y_quantity: formData.y_quantity ? parseInt(formData.y_quantity) : null,
        discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null,
        discount_flat: formData.discount_flat ? parseFloat(formData.discount_flat) : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
      };

      await onSubmit(data);

      // Reset form
      setFormData({
        product_id: '',
        product_name: '',
        offer_type: 'BUY_X_GET_Y',
        x_quantity: '',
        y_quantity: '',
        discount_percent: '',
        discount_flat: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true,
      });
    } catch (error) {
      alert('Error creating offer. Please check product ID.');
    }
  };

  return (
    <div className="offer-form-container">
      <h2>🎁 Create New Offer</h2>
      <form onSubmit={handleSubmit} className="offer-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="product_id">Product ID *</label>
            <div className="product-search">
              <input
                type="text"
                id="product_id"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
                placeholder="e.g., SPN05549901"
              />
              <button
                type="button"
                onClick={handleProductSearch}
                disabled={searchingProduct}
                className="search-btn"
              >
                {searchingProduct ? '...' : '🔍'}
              </button>
            </div>
            {formData.product_name && (
              <span className="product-name-display">✅ {formData.product_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="offer_type">Offer Type *</label>
            <select
              id="offer_type"
              name="offer_type"
              value={formData.offer_type}
              onChange={handleChange}
              required
            >
              <option value="BUY_X_GET_Y">Buy X Get Y Free</option>
              <option value="PERCENTAGE">Percentage Discount</option>
              <option value="FLAT">Flat Discount</option>
            </select>
          </div>
        </div>

        {formData.offer_type === 'BUY_X_GET_Y' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="x_quantity">Buy Quantity (X) *</label>
              <input
                type="number"
                id="x_quantity"
                name="x_quantity"
                value={formData.x_quantity}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g., 1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="y_quantity">Get Free Quantity (Y) *</label>
              <input
                type="number"
                id="y_quantity"
                name="y_quantity"
                value={formData.y_quantity}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g., 1"
              />
            </div>
          </div>
        )}

        {formData.offer_type === 'PERCENTAGE' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="discount_percent">Discount Percentage *</label>
              <input
                type="number"
                id="discount_percent"
                name="discount_percent"
                value={formData.discount_percent}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g., 10"
              />
            </div>
          </div>
        )}

        {formData.offer_type === 'FLAT' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="discount_flat">Flat Discount Amount *</label>
              <input
                type="number"
                id="discount_flat"
                name="discount_flat"
                value={formData.discount_flat}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="e.g., 50"
              />
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_date">Start Date *</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">End Date *</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Active</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating...' : '✅ Create Offer'}
        </button>
      </form>
    </div>
  );
};

export default OfferForm;