import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import BillingPage from './pages/BillingPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import OffersPage from './pages/OffersPage.jsx'
import LowStockPage from './pages/LowStockPage.jsx'
import BarcodePrintPage from './pages/BarcodePrintPage.jsx'

function App() {
  return (
    <div className="app">
      <Navbar />

      <Routes>
        {/* default route → Billing */}
        <Route path="/" element={<Navigate to="/billing" replace />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/low-stock" element={<LowStockPage />} />
        <Route path="/barcode-print" element={<BarcodePrintPage />} />

        {/* fallback for wrong URLs */}
        <Route path="*" element={<h2>Page not found</h2>} />
      </Routes>
    </div>
  )
}

export default App
