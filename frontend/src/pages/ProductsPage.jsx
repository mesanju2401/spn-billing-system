import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import { createProduct, listProducts } from '../api/products';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (data) => {
    setCreating(true);
    try {
      const newProduct = await createProduct(data);
      alert(`Product created successfully!\nProduct ID: ${newProduct.product_id}\nBarcode: ${newProduct.barcode_value}`);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product: ' + (error.response?.data?.detail || error.message));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="products-page">
      <div className="products-container">
        <h1>📦 Product Management</h1>

        <ProductForm onSubmit={handleCreateProduct} loading={creating} />

        <div className="products-list-section">
          <h2>Product List ({products.length})</h2>
          
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>No products found. Create your first product above!</p>
            </div>
          ) : (
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Cost Price</th>
                    <th>MRP</th>
                    <th>Selling Price</th>
                    <th>Min Stock</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="product-id-cell">{product.product_id}</td>
                      <td className="product-name-cell">{product.name}</td>
                      <td>{product.category || '-'}</td>
                      <td className="price-cell">₹{product.cost_price}</td>
                      <td className="price-cell">₹{product.mrp}</td>
                      <td className="price-cell selling">₹{product.selling_price}</td>
                      <td className="center">{product.min_stock}</td>
                      <td className="date-cell">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;