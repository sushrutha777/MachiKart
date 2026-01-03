import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminProducts from '../components/AdminProducts';
import AdminOrders from '../components/AdminOrders';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
  const [passkey, setPasskey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');

  // Optional: Check session storage to keep user logged in for the session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_authorized');
    if (savedAuth === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === 'KUDLA2025') {
      setIsAuthorized(true);
      setError('');
      sessionStorage.setItem('admin_authorized', 'true');
    } else {
      setError('Invalid Passkey. Access Denied.');
      setPasskey('');
    }
  };

  // ... inside AdminView ...
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl shadow-xl shadow-primary-900/10 border border-primary-100 dark:border-primary-800 w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-primary-950 dark:bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary-500 shadow-lg shadow-primary-900/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-primary-950 dark:text-white text-center mb-2">Admin Access</h2>
          <p className="text-primary-500 dark:text-primary-400 text-center text-sm mb-8">Please enter the security passkey to manage MachiCart inventory and orders.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                autoFocus
                type="password"
                placeholder="Enter Passkey"
                className={`w-full p-4 bg-primary-50 dark:bg-primary-950 border ${error ? 'border-secondary-500 ring-secondary-100' : 'border-primary-200 dark:border-primary-700 ring-primary-100'} rounded-xl outline-none focus:ring-4 focus:bg-white dark:focus:bg-primary-900 transition-all text-center font-bold tracking-widest text-lg text-primary-950 dark:text-white`}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
              />
              {error && <p className="text-secondary-600 text-[10px] font-black uppercase text-center mt-2 tracking-widest animate-bounce">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-primary-950 dark:bg-white hover:bg-black dark:hover:bg-primary-100 text-white dark:text-primary-950 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary-900/20 transition-all active:scale-95"
            >
              Verify & Enter
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary-100 dark:border-primary-800 text-center">
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">MachiCart Secure Portal v2.0</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-950 dark:text-white tracking-tight">Management Portal</h1>
          <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mt-1">Authorized Access Only</p>
        </div>

        <div className="bg-white dark:bg-primary-900 p-1 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex gap-1 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-primary-950 dark:bg-primary-100 text-white dark:text-primary-950 shadow-md' : 'text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-800'}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-primary-950 dark:bg-primary-100 text-white dark:text-primary-950 shadow-md' : 'text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-800'}`}
          >
            Inventory
          </button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'orders' ? <AdminOrders /> : <AdminProducts />}
      </div>
    </div>
  );
};

export default AdminView;
