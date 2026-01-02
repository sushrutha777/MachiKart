
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
import Cart from '../components/Cart';

const CustomerView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for available products
    const q = query(collection(db, "products"), where("available", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold mb-6 text-slate-800 border-l-4 border-blue-600 pl-4">
          Fresh Daily Catch
        </h1>
        {products.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-slate-200">
            <p className="text-slate-500 text-lg">No fish items are currently available. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={() => addToCart(product)} 
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="lg:col-span-1">
        <Cart 
          items={cart} 
          onRemove={removeFromCart} 
          onUpdateQty={updateQuantity}
          onOrderConfirmed={clearCart}
        />
      </div>
    </div>
  );
};

export default CustomerView;
