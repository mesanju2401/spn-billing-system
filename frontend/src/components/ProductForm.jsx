import React, { useState } from 'react';
import './ProductForm.css';

const ProductForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cost_price: '',
    mrp: '',
    selling_price: '',
    min_stock: '10',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const data = {
      ...formData,
      cost_price: parseFloat(formData.cost_price),
      mrp: parseFloat(formData.mrp),
      selling_price: parseFloat(formData.selling_price),
      min_stock: parseInt(formData.min_stock),
    };

    onSubmit(data);
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      cost_price: '',
      mrp: '',
      selling_price: '',
      min_stock: '10',
    });
  };

  return (
    <div className="product-form-container">
      <h2>➕ Add New Product</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Premium Pen"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Stationery"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cost_price">Cost Price *</label>
            <input
              type="number"
              id="cost_price"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mrp">MRP *</label>
            <input
              type="number"
              id="mrp"
              name="mrp"
              value={formData.mrp}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="selling_price">Selling Price *</label>
            <input
              type="number"
              id="selling_price"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="min_stock">Minimum Stock *</label>
            <input
              type="number"
              id="min_stock"
              name="min_stock"
              value={formData.min_stock}
              onChange={handleChange}
              required
              min="0"
              placeholder="10"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating...' : '✅ Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;