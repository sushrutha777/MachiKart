
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 7c-4.5 0-7.9 3-9 4.3C10.9 10 7.5 7 3 7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h1c3.5 0 6.1-2.2 7.5-3.5 1.4 1.3 4 3.5 7.5 3.5h1c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM4 19v-9c2.4 0 4.5 1.5 5.5 2.5C8.5 13.5 6.4 15 4 15V19zm16 0c-2.4 0-4.5-1.5-5.5-2.5 1-1 3.1-2.5 5.5-2.5v5z" />
          </svg>
          <span className="text-2xl font-bold tracking-tight">MachiCart</span>
        </Link>
        
        <div className="flex gap-4 items-center">
          <Link 
            to="/" 
            className={`px-3 py-1 rounded-md transition ${!isAdmin ? 'bg-blue-700' : 'hover:bg-blue-500'}`}
          >
            Shop
          </Link>
          <Link 
            to="/admin" 
            className={`px-3 py-1 rounded-md transition ${isAdmin ? 'bg-blue-700' : 'hover:bg-blue-500'}`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<CustomerView />} />
            <Route path="/admin/*" element={<AdminView />} />
          </Routes>
        </main>
        <footer className="bg-slate-800 text-slate-400 py-6 text-center">
          <p>&copy; 2024 MachiCart Fish Grocery. All rights reserved.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
