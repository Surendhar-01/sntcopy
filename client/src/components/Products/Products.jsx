import React, { useState, useEffect } from 'react';
import './Products.css';
import { hasAdminAccess } from '../../utils/roles';

export default function Products({ db, erp, user }) {
  const [showModal, setShowModal] = useState(false);
  const [newProd, setNewProd] = useState({ code: '', name: '', cat: 'Groundnut', unit: 'tins', price: '', stock: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

  const isAdmin = hasAdminAccess(user);

  useEffect(() => {
    erp.fetchProducts().catch(() => {});
  }, [erp]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = (db.products || [])
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cat.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const handleAdd = async () => {
    if (!newProd.name || !newProd.price) return;

    try {
      await erp.addProduct({
        ...newProd,
        price: parseFloat(newProd.price),
        stock: parseInt(newProd.stock, 10) || 0
      });
      setShowModal(false);
      setNewProd({ code: '', name: '', cat: 'Groundnut', unit: 'tins', price: '', stock: '' });
    } catch (error) {
      alert(error.message || 'Failed to add product');
    }
  };

  const deleteProd = async (id) => {
    if (confirm('Delete product?')) {
      try {
        await erp.deleteProduct(id);
      } catch (error) {
        alert(error.message || 'Failed to delete product');
      }
    }
  };

  const getEmoji = (cat) => {
    if(cat.includes('Groundnut')) return '🥜';
    if(cat.includes('Sunflower')) return '🌻';
    if(cat.includes('Coconut')) return '🥥';
    if(cat.includes('Palm')) return '🌴';
    if(cat.includes('Sesame')) return '🫔';
    if(cat.includes('Castor')) return '🌿';
    return '📦';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-description">Manage your product catalog and view current prices.</p>
      </div>
      <div className="product-catalog-header">
        <div className="flex gap-2 product-catalog-controls">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name-asc">Alphabetical (A-Z)</option>
            <option value="name-desc">Alphabetical (Z-A)</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          {isAdmin && <button className="btn btn-action" onClick={() => setShowModal(true)}>Add Product </button>}
        </div>
      </div>

      <div className="product-grid">
        {filteredProducts.map(p => (
          <div key={p.id} className="flipkart-card">
            <div className="fc-image-box">
              <span className="fc-category-icon">{getEmoji(p.cat)}</span>
              {p.stock <= 5 && p.stock > 0 && <span className="fc-badge orange">Only {p.stock} left</span>}
              {p.stock === 0 && <span className="fc-badge red">Out of Stock</span>}
            </div>
            <div className="fc-details">
              <div className="fc-brand">{p.cat}</div>
              <div className="fc-title">{p.name}</div>
              <div className="fc-price-row">
                <span className="fc-price">₹{p.price.toFixed(2)}</span>
                <span className="fc-mrp">₹{(p.price * 1.1).toFixed(2)}</span>
                <span className="fc-discount">10% off</span>
              </div>
              <div className="fc-meta">
                <span className="text-xs text-muted">ID: {p.code}</span>
                <span className={`text-xs fw-bold ${p.stock > 10 ? 'text-green' : 'text-red'}`}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Unavailable'}
                </span>
              </div>
              {isAdmin && <button className="fc-delete-btn" onClick={() => deleteProd(p.id)}>Delete Product</button>}
            </div>
          </div>
        ))}
      </div>

      {isAdmin && showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Add New Product</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group mb-3"><label>Product Name</label><input value={newProd.name} placeholder="Enter Product Name" onChange={e=>setNewProd({...newProd, name: e.target.value})} autoFocus /></div>
            <div className="form-row mb-3">
              <div className="form-group"><label>Code</label><input value={newProd.code} placeholder="Enter Product Code" onChange={e=>setNewProd({...newProd, code: e.target.value})} /></div>
              <div className="form-group"><label>Category</label><select value={newProd.cat} onChange={e=>setNewProd({...newProd, cat: e.target.value})}><option>Groundnut</option><option>Sunflower</option><option>Palm</option><option>Vanaspati</option><option>Sesame</option><option>Castor</option><option>Coconut</option></select></div>
            </div>
            <div className="form-row mb-4">
              <div className="form-group"><label>Price</label><input type="number" value={newProd.price} placeholder="Enter Price" onChange={e=>setNewProd({...newProd, price: e.target.value})} /></div>
              <div className="form-group"><label>Initial Stock</label><input type="number" value={newProd.stock} placeholder="Enter Initial Stock" onChange={e=>setNewProd({...newProd, stock: e.target.value})} /></div>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary flex-1" onClick={handleAdd}>Save Product</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 24px' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
