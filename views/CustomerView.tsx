
import React, { useState, useEffect } from 'react';
import {
  db,
  collection,
  getDocs,
  query,
  where,
  onSnapshot
} from '../firebase';
import { Product, CartItem } from '../types';
import ProductCard from '../components/ProductCard';


interface CustomerViewProps {
  cart: CartItem[];
  addToCart: (product: Product, cleaning: boolean) => void;
  toggleCleaning: (productId: string) => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({
  cart,
  addToCart,
  toggleCleaning
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Categories for filter
  const categories = ["ALL", "PREMIUM"];
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Real-time listener for available products
    const q = query(collection(db, "products"), where("available", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      // Sort: Premium first, then by name (optional, but good for stability)
      prods.sort((a, b) => {
        if (a.is_premium === b.is_premium) return 0;
        return a.is_premium ? -1 : 1;
      });
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(p => {
    // 1. Search Filter
    if (searchQuery && !p.fish_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 2. Category Filter
    if (activeCategory === "PREMIUM" && !p.is_premium) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Hero Section */}
      <div className="text-center py-16 md:py-24 space-y-4">
        <div className="inline-block px-4 py-1 rounded-full border border-secondary-200 bg-secondary-50 dark:bg-primary-900 dark:border-primary-800 mb-4">
          <span className="text-[10px] font-black tracking-[0.2em] text-secondary-600 dark:text-secondary-400 uppercase">Freshness Redefined Since 2025</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-primary-950 dark:text-white tracking-tighter leading-[0.9]">
          MacchiKart <br />
          <span className="text-secondary-500 text-3xl md:text-5xl">Sea to Home</span>
        </h1>
        <p className="max-w-2xl mx-auto text-primary-500 dark:text-primary-400 font-medium mt-6 leading-relaxed">
          Directly from Mangalore's Old Port. Hand-selected, masterfully cleaned, and dispatched the same morning to your doorstep.
        </p>
        <div className="w-16 h-1 bg-secondary-400 mx-auto mt-8 rounded-full"></div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-xl shadow-primary-900/5 p-2 mb-16 mx-4 md:mx-0 flex flex-col md:flex-row gap-2 border border-primary-100 dark:border-primary-800">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-primary-300 dark:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search daily arrivals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-primary-50 dark:bg-primary-950 rounded-xl text-sm font-bold text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-600 outline-none focus:ring-2 focus:ring-secondary-400 transition-all border border-transparent dark:border-primary-900"
          />
        </div>
        <div className="flex bg-primary-50 dark:bg-primary-950 p-1 rounded-xl">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-lg text-[10px] font-black tracking-widest transition-all duration-300 ${activeCategory === cat ? 'bg-primary-950 dark:bg-primary-100 text-white dark:text-primary-950 shadow-md' : 'text-primary-400 dark:text-primary-500 hover:text-primary-900 dark:hover:text-primary-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0" id="products">
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-primary-900 p-12 rounded-3xl shadow-sm text-center border-2 border-dashed border-primary-200 dark:border-primary-800">
              <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-400 dark:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-primary-900 dark:text-primary-100 mb-1">No Catch Found</h3>
              <p className="text-primary-500 dark:text-primary-400 text-sm">
                {activeCategory === "PREMIUM" ? "No premium stock available right now." : "Our boats are still out at sea. Check back soon."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={(cleaning) => addToCart(product, cleaning)}
                  cartItem={cart.find(item => item.id === product.id)}
                  onToggleCleaning={() => toggleCleaning(product.id)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>

  );
};

export default CustomerView;
