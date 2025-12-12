import React, { useState, useEffect } from 'react';
import OfferForm from '../components/OfferForm';
import { createOffer } from '../api/offers';
import { listProducts } from '../api/products';
import './OffersPage.css';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const productsData = await listProducts();
      setProducts(productsData);
      
      // Get offers from products (simplified - you may need a dedicated offers endpoint)
      const offersData = productsData
        .map(p => p.offers)
        .flat()
        .filter(Boolean);
      
      setOffers(offersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (data) => {
    setCreating(true);
    try {
      await createOffer(data);
      alert('Offer created successfully!');
      fetchData(); // Refresh
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Failed to create offer: ' + (error.response?.data?.detail || error.message));
    } finally {
      setCreating(false);
    }
  };

  const getOfferDescription = (offer) => {
    if (offer.offer_type === 'BUY_X_GET_Y') {
      return `Buy ${offer.x_quantity} Get ${offer.y_quantity} Free`;
    } else if (offer.offer_type === 'PERCENTAGE') {
      return `${offer.discount_percent}% Off`;
    } else if (offer.offer_type === 'FLAT') {
      return `₹${offer.discount_flat} Off`;
    }
    return '-';
  };

  return (
    <div className="offers-page">
      <div className="offers-container">
        <h1>🎁 Offers Management</h1>

        <OfferForm onSubmit={handleCreateOffer} loading={creating} />

        <div className="offers-list-section">
          <h2>Active Offers</h2>
          
          {loading ? (
            <div className="loading">Loading offers...</div>
          ) : (
            <div className="offers-grid">
              {products.map((product) => {
                // Find active offer for this product
                const activeOffer = product.offers?.find(o => o.is_active);
                
                if (!activeOffer) return null;

                return (
                  <div key={product.id} className="offer-card">
                    <div className="offer-header">
                      <h3>{product.name}</h3>
                      <span className="product-id-badge">{product.product_id}</span>
                    </div>
                    
                    <div className="offer-body">
                      <div className="offer-type-badge">
                        {activeOffer.offer_type.replace('_', ' ')}
                      </div>
                      
                      <div className="offer-description">
                        {getOfferDescription(activeOffer)}
                      </div>
                      
                      <div className="offer-dates">
                        <span>📅 {activeOffer.start_date}</span>
                        <span>to</span>
                        <span>{activeOffer.end_date}</span>
                      </div>
                      
                      <div className="offer-status">
                        {activeOffer.is_active ? (
                          <span className="status-badge active">✅ Active</span>
                        ) : (
                          <span className="status-badge inactive">❌ Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {products.every(p => !p.offers?.some(o => o.is_active)) && (
                <div className="empty-state">
                  <p>No active offers found. Create one above!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OffersPage;