import React, { useState, useEffect } from 'react';
import { getLowStock } from '../api/stock';
import './LowStockPage.css';

const LowStockPage = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const data = await getLowStock();
      setLowStockItems(data);
    } catch (error) {
      console.error('Error fetching low stock:', error);
      alert('Failed to load low stock items');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current, min) => {
    const percentage = (current / min) * 100;
    if (percentage <= 25) return { label: 'CRITICAL', class: 'critical' };
    if (percentage <= 50) return { label: 'LOW', class: 'low' };
    return { label: 'WARNING', class: 'warning' };
  };

  return (
    <div className="low-stock-page">
      <div className="low-stock-container">
        <div className="page-header">
          <h1>📉 Low Stock Alert</h1>
          <button onClick={fetchLowStock} className="refresh-btn" disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading low stock items...</p>
          </div>
        ) : lowStockItems.length === 0 ? (
          <div className="empty-state">
            <div className="success-icon">✅</div>
            <h2>All Stock Levels Normal</h2>
            <p>No products are currently below minimum stock levels.</p>
          </div>
        ) : (
          <>
            <div className="alert-summary">
              <div className="summary-card critical">
                <div className="summary-number">
                  {lowStockItems.filter(item => 
                    getStockStatus(item.current_quantity, item.min_stock).class === 'critical'
                  ).length}
                </div>
                <div className="summary-label">Critical</div>
              </div>
              <div className="summary-card low">
                <div className="summary-number">
                  {lowStockItems.filter(item => 
                    getStockStatus(item.current_quantity, item.min_stock).class === 'low'
                  ).length}
                </div>
                <div className="summary-label">Low</div>
              </div>
              <div className="summary-card warning">
                <div className="summary-number">
                  {lowStockItems.filter(item => 
                    getStockStatus(item.current_quantity, item.min_stock).class === 'warning'
                  ).length}
                </div>
                <div className="summary-label">Warning</div>
              </div>
            </div>

            <div className="low-stock-table-container">
              <table className="low-stock-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Product ID</th>
                    <th>Location</th>
                    <th>Current Stock</th>
                    <th>Min Stock</th>
                    <th>Shortage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, index) => {
                    const status = getStockStatus(item.current_quantity, item.min_stock);
                    const shortage = item.min_stock - item.current_quantity;
                    
                    return (
                      <tr key={index} className={`row-${status.class}`}>
                        <td className="product-name">{item.product_name}</td>
                        <td className="product-id">{item.product_id}</td>
                        <td className="location">
                          {item.outlet_name || 'Godown'}
                        </td>
                        <td className="stock-number current">
                          {item.current_quantity}
                        </td>
                        <td className="stock-number min">
                          {item.min_stock}
                        </td>
                        <td className="stock-number shortage">
                          {shortage}
                        </td>
                        <td>
                          <span className={`status-badge ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LowStockPage;