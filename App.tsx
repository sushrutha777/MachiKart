import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';
import CartView from './views/CartView';
import { Product, CartItem } from './types';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps & { theme: string; toggleTheme: () => void }> = ({ cartCount, theme, toggleTheme }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-primary-950/95 backdrop-blur-md border-b border-primary-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.jpg"
            alt="MacchiKart Logo"
            className="w-12 h-12 rounded-full border-2 border-white/10 shadow-lg object-cover"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white leading-none">MacchiKart</span>
            <span className="text-[10px] uppercase tracking-widest text-secondary-500 font-bold">Sea to Home</span>
          </div>
        </Link>

        <div className="flex gap-4 items-center">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-800 text-secondary-400 hover:bg-secondary-500 hover:text-primary-950 transition-all duration-300"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {!isAdmin ? (
            <Link
              to="/cart"
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
            </Link>
          ) : (
            <Link
              to="/"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-800 text-secondary-400 hover:bg-red-500 hover:text-white transition-all duration-300"
              title="Exit to Store"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addToCart = (product: Product, cleaning: boolean) => {
    setCart(prev => {
      // Find item with same ID AND same cleaning status
      const existing = prev.find(item => item.id === product.id && !!item.cleaning === !!cleaning);

      if (existing) {
        return prev.map(item =>
          (item.id === product.id && !!item.cleaning === !!cleaning)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, cleaning }];
    });
    // Auto-scroll removed as cart is on separate page
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        // Use parseFloat(toFixed(1)) to avoid floating point errors (e.g. 0.5 + 0.1 = 0.60000001)
        const newQty = Math.max(1, parseFloat((item.quantity + delta).toFixed(1)));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleCleaning = (productId: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, cleaning: !item.cleaning };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  return (
    <HashRouter>
      <div className={`min-h-screen flex flex-col transition-colors duration-300 font-sans text-primary-900 dark:text-primary-100 ${theme === 'dark' ? 'bg-primary-950' : 'bg-golden-shine'}`}>
        <Navbar
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <CustomerView
                cart={cart}
                addToCart={addToCart}
                toggleCleaning={toggleCleaning}
              />
            } />
            <Route path="/cart" element={
              <CartView
                cart={cart}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                clearCart={clearCart}
              />
            } />
            <Route path="/admin/*" element={<AdminView />} />
          </Routes>
        </main>
        <footer className="bg-primary-950 border-t border-primary-900 py-4 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center mb-2 md:mb-6">
              <div className="flex items-center gap-4 mb-2">
                <img
                  src="/logo.jpg"
                  alt="MacchiKart"
                  className="w-10 h-10 md:w-16 md:h-16 rounded-2xl shadow-lg border-2 border-white/10"
                />
                <div className="flex flex-col items-start">
                  <span className="text-lg md:text-4xl font-black text-white tracking-tighter leading-none">MacchiKart</span>
                  <span className="text-[8px] md:text-xs uppercase tracking-widest text-primary-400 font-bold">Sea to Home</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4 pt-2 items-start text-center">
              <div className="flex flex-col items-center">
                <a
                  href="https://www.instagram.com/macchikart?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[8px] md:text-xs font-black text-primary-400 hover:text-white uppercase tracking-[0.2em] transition-colors"
                >
                  Instagram
                </a>
              </div>

              <div className="flex flex-col items-center">
                <a
                  href="tel:+917996941065"
                  className="text-[8px] md:text-xs font-black text-primary-400 hover:text-white uppercase tracking-[0.2em] transition-colors leading-relaxed"
                >
                  +91<br />7996941065
                </a>
              </div>

              <div className="flex flex-col items-center">
                <Link
                  to="/admin"
                  className="text-[8px] md:text-xs font-black text-primary-400 hover:text-white uppercase tracking-[0.2em] transition-colors leading-relaxed"
                >
                  Operator<br />Login
                </Link>
              </div>
            </div>

          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
