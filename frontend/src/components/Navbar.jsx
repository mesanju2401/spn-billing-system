import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>🛒 SPN Billing System</h1>
        </div>
        <ul className="navbar-menu">
          <li>
            <Link to="/" className={isActive('/')}>
              💳 Billing
            </Link>
          </li>
          <li>
            <Link to="/products" className={isActive('/products')}>
              📦 Products
            </Link>
          </li>
          <li>
            <Link to="/offers" className={isActive('/offers')}>
              🎁 Offers
            </Link>
          </li>
          <li>
            <Link to="/low-stock" className={isActive('/low-stock')}>
              📉 Low Stock
            </Link>
          </li>
          <li>
            <Link to="/barcode-print" className={isActive('/barcode-print')}>
              🏷️ Print Barcode
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;