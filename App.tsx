import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';
import { Product, CartItem } from './types';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-primary-950/95 backdrop-blur-md border-b border-primary-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-white p-1.5 rounded-lg group-hover:bg-secondary-400 transition-colors duration-300">
            <svg className="w-6 h-6 text-primary-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 7c-4.5 0-7.9 3-9 4.3C10.9 10 7.5 7 3 7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h1c3.5 0 6.1-2.2 7.5-3.5 1.4 1.3 4 3.5 7.5 3.5h1c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM4 19v-9c2.4 0 4.5 1.5 5.5 2.5C8.5 13.5 6.4 15 4 15V19zm16 0c-2.4 0-4.5-1.5-5.5-2.5 1-1 3.1-2.5 5.5-2.5v5z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white leading-none">MacchiKart</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-secondary-500 font-bold">Premium Coastal Catch</span>
          </div>
        </Link>

        {!isAdmin && (
          <div className="flex gap-4 items-center">
            <button
              onClick={onCartClick}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-primary-800 text-secondary-400 hover:bg-secondary-500 hover:text-primary-950 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Auto-scroll to cart when item is added
    setTimeout(scrollToCart, 100);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const scrollToCart = () => {
    const cartSection = document.getElementById('cart-section');
    if (cartSection) {
      cartSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-primary-50 font-sans text-primary-900">
        <Navbar cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} onCartClick={scrollToCart} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <CustomerView
                cart={cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                clearCart={clearCart}
              />
            } />
            <Route path="/admin/*" element={<AdminView />} />
          </Routes>
        </main>
        <footer className="bg-primary-950 border-t border-primary-900 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="bg-white p-2 rounded-xl">
                <svg className="w-6 h-6 text-primary-950" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 7c-4.5 0-7.9 3-9 4.3C10.9 10 7.5 7 3 7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h1c3.5 0 6.1-2.2 7.5-3.5 1.4 1.3 4 3.5 7.5 3.5h1c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM4 19v-9c2.4 0 4.5 1.5 5.5 2.5C8.5 13.5 6.4 15 4 15V19zm16 0c-2.4 0-4.5-1.5-5.5-2.5 1-1 3.1-2.5 5.5-2.5v5z" />
                </svg>
              </div>
              <span className="font-black text-2xl text-white tracking-tight">MacchiKart</span>
            </div>

            <div className="flex justify-center gap-8 mb-8 text-xs font-bold text-primary-400 uppercase tracking-widest">
              <span>Instagram Feed</span>
              <span>+91 79969 41065</span>
              <Link to="/admin" className="hover:text-white transition-colors">Operator Login</Link>
            </div>

            <p className="text-primary-600 text-[10px] uppercase tracking-widest font-bold">
              &copy; 2025 MacchiKart Terminal System
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
