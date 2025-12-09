import React, { useState, useEffect } from 'react';
import BarcodeInput from '../components/BarcodeInput';
import CartTable from '../components/CartTable';
import { getProductByBarcode } from '../api/products';
import { previewBill, confirmBill } from '../api/billing';
import './BillingPage.css';

const BillingPage = () => {
  const [cart, setCart] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Update preview whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      fetchPreview();
    } else {
      setPreview(null);
    }
  }, [cart]);

  const fetchPreview = async () => {
    try {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));
      
      const previewData = await previewBill(items);
      setPreview(previewData);
      
      // Update cart with preview data
      const updatedCart = cart.map((cartItem, index) => ({
        ...cartItem,
        ...previewData.items[index]
      }));
      setCart(updatedCart);
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  const handleProductScanned = async (barcode) => {
    setLoading(true);
    try {
      const product = await getProductByBarcode(barcode);
      
      // Check if product already in cart
      const existingIndex = cart.findIndex(
        item => item.product_id === product.product_id
      );

      if (existingIndex >= 0) {
        // Increase quantity
        const newCart = [...cart];
        newCart[existingIndex].quantity += 1;
        setCart(newCart);
      } else {
        // Add new item
        setCart([...cart, {
          product_id: product.product_id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.selling_price,
          discount: 0,
          line_total: product.selling_price,
          offer_applied: null
        }]);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  const handleRemoveItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const handleConfirmBill = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!window.confirm('Confirm this bill?')) {
      return;
    }

    setConfirming(true);
    try {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const result = await confirmBill(items, 1);
      
      alert(`✅ Bill Confirmed Successfully!\n\nInvoice Number: ${result.invoice_number}\nTotal Amount: ₹${result.final_amount.toFixed(2)}\n\nThank you!`);
      
      // Clear cart
      setCart([]);
      setPreview(null);
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.detail || 'Failed to confirm bill'));
    } finally {
      setConfirming(false);
    }
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    
    if (window.confirm('Clear all items from cart?')) {
      setCart([]);
      setPreview(null);
    }
  };

  return (
    <div className="billing-page">
      <div className="billing-container">
        <div className="billing-header">
          <div className="header-left">
            <h1>💳 Billing Counter</h1>
            <p className="header-subtitle">Scan products to add them to cart</p>
          </div>
          <div className="header-right">
            {cart.length > 0 && (
              <button onClick={handleClearCart} className="clear-cart-btn">
                🗑️ Clear Cart
              </button>
            )}
          </div>
        </div>

        <BarcodeInput onProductScanned={handleProductScanned} />

        <div className="cart-section">
          <div className="cart-header">
            <h2>Shopping Cart</h2>
            {cart.length > 0 && (
              <span className="items-count">{cart.length} item(s)</span>
            )}
          </div>
          
          <CartTable
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        {preview && (
          <div className="totals-section">
            <div className="totals-container">
              <div className="totals-header">
                <h3>Bill Summary</h3>
              </div>
              
              <div className="totals-body">
                <div className="total-row">
                  <span className="total-label">Subtotal:</span>
                  <span className="total-value">₹{preview.subtotal.toFixed(2)}</span>
                </div>
                
                {preview.total_discount > 0 && (
                  <div className="total-row discount">
                    <span className="total-label">
                      <span className="discount-icon">🎁</span>
                      Total Discount:
                    </span>
                    <span className="total-value">- ₹{preview.total_discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="divider"></div>
                
                <div className="total-row grand-total">
                  <span className="total-label">Grand Total:</span>
                  <span className="total-value">₹{preview.final_total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="totals-footer">
                <button
                  onClick={handleConfirmBill}
                  disabled={confirming}
                  className="confirm-btn"
                >
                  {confirming ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      ✅ Confirm & Print Bill
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;