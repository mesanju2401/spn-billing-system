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
      
      alert(`Bill confirmed!\nInvoice Number: ${result.invoice_number}\nTotal: ₹${result.final_amount.toFixed(2)}`);
      
      // Clear cart
      setCart([]);
      setPreview(null);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to confirm bill');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="billing-page">
      <div className="billing-container">
        <div className="billing-header">
          <h1>💳 Billing Counter</h1>
        </div>

        <BarcodeInput onProductScanned={handleProductScanned} />

        <CartTable
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />

        {preview && (
          <div className="totals-section">
            <div className="totals-container">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{preview.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row discount">
                <span>Total Discount:</span>
                <span>- ₹{preview.total_discount.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Grand Total:</span>
                <span>₹{preview.final_total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleConfirmBill}
                disabled={confirming}
                className="confirm-btn"
              >
                {confirming ? 'Processing...' : '✅ Confirm Bill'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;