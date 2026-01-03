
import React, { useState, useEffect } from 'react';
import { CartItem, Order, OrderStatus } from '../types';
import {
  db,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
  doc
} from '../firebase';

interface Props {
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onOrderConfirmed: () => void;
}

const Cart: React.FC<Props> = ({ items, onRemove, onUpdateQty, onOrderConfirmed }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Status Check State
  const [searchPhone, setSearchPhone] = useState('');
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [statusError, setStatusError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  const total = items.reduce((sum, item) => sum + (item.price_per_kg * item.quantity), 0);

  // Effect to handle real-time status updates once an order is found
  useEffect(() => {
    if (!recentOrder?.id) return;

    // Listen to changes on the specific order found
    const unsubscribe = onSnapshot(doc(db, "orders", recentOrder.id), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setRecentOrder({ id: docSnapshot.id, ...docSnapshot.data() } as Order);
      } else {
        // Order was deleted by admin
        setRecentOrder(null);
        setStatusError("This order was removed from our system.");
      }
    });

    return () => unsubscribe();
  }, [recentOrder?.id]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setSubmitting(true);
    try {
      const orderData: Order = {
        customer_name: formData.name,
        phone_number: formData.phone.trim(),
        delivery_address: formData.address,
        items: items.map(item => ({
          fish_name: item.fish_name,
          price_per_kg: item.price_per_kg,
          quantity: item.quantity
        })),
        total_amount: total,
        payment_method: "Cash on Delivery",
        order_status: "NEW",
        created_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setOrderSuccess(docRef.id);
      onOrderConfirmed();
      setFormData({ name: '', phone: '', address: '' });
      setShowCheckout(false);
      alert("Success! Your order has been placed.");
    } catch (err: any) {
      console.error("Checkout Error:", err);
      alert("Database Error: Could not place order. " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const checkStatus = async () => {
    const phone = searchPhone.trim();
    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }
    setCheckingStatus(true);
    setStatusError('');
    setRecentOrder(null);

    try {
      const q = query(
        collection(db, "orders"),
        where("phone_number", "==", phone)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setStatusError("No orders found for this phone number.");
      } else {
        // Find the latest order manually to avoid indexing requirement
        const ords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        const sorted = ords.sort((a, b) => {
          const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
          const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
          return timeB - timeA;
        });
        setRecentOrder(sorted[0]);
        console.log("Found order, established real-time sync for ID:", sorted[0].id);
      }
    } catch (err: any) {
      console.error("Status Check Error:", err);
      setStatusError("Could not connect to database.");
    } finally {
      setCheckingStatus(false);
    }
  };

  // ... inside Cart ...
  // ... inside Cart ...
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'NEW': return 'bg-secondary-100 text-secondary-800';
      case 'CONFIRMED': return 'bg-primary-100 text-primary-800';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      default: return 'bg-primary-50 text-primary-800';
    }
  };

  // Success State (Terminal State)
  if (orderSuccess) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-primary-100 sticky top-24 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-black text-primary-950 mb-2">Order Confirmed!</h3>
        <p className="text-sm text-primary-500 mb-6">Your fresh catch is being prepared associated with Order ID:</p>
        <div className="bg-primary-50 p-3 rounded-lg border border-primary-100 mb-6">
          <p className="font-mono font-bold text-primary-900 select-all">{orderSuccess}</p>
        </div>
        <button
          onClick={() => {
            setOrderSuccess(null);
            onOrderConfirmed();
          }}
          className="text-sm font-bold text-secondary-600 hover:underline"
        >
          Start New Order
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-primary-900/10 border border-primary-100 sticky top-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-primary-950 tracking-tight">Basket</h2>
        <span className="bg-primary-950 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-sm shadow-primary-200">
          {items.length} Units
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map(item => (
          <div key={item.id} className="flex gap-4 items-center bg-primary-50 p-3 rounded-2xl group border border-transparent hover:border-secondary-200 transition-colors">
            <img src={`https://picsum.photos/seed/${item.fish_name}/100/100`} alt={item.fish_name} className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-primary-950 truncate">{item.fish_name}</h4>
              <p className="text-xs text-secondary-600 font-bold">₹{item.price_per_kg}/kg</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-primary-100 shadow-sm">
              <button
                disabled={showCheckout}
                onClick={() => onUpdateQty(item.id, -1)}
                className="w-6 h-6 flex items-center justify-center text-primary-400 hover:text-secondary-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
              </button>
              <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
              <button
                disabled={showCheckout}
                onClick={() => onUpdateQty(item.id, 1)}
                className="w-6 h-6 flex items-center justify-center text-primary-400 hover:text-secondary-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            <button
              disabled={showCheckout}
              onClick={() => onRemove(item.id)}
              className="text-primary-300 hover:text-red-500 transition-colors p-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-end mb-6 pt-6 border-t border-primary-100">
        <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Total Amount</span>
        <span className="text-3xl font-black text-secondary-500 tracking-tighter leading-none">₹{total.toFixed(2)}</span>
      </div>

      {!showCheckout ? (
        <button
          onClick={() => setShowCheckout(true)}
          className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-primary-950 hover:bg-black text-white shadow-lg shadow-primary-900/20 transition-all active:scale-95"
        >
          Checkout
        </button>
      ) : (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-primary-950">Shipping Details</h3>
            <button onClick={() => setShowCheckout(false)} className="text-xs font-bold text-red-500 hover:text-red-700">
              CANCEL
            </button>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Customer Name</label>
              <input
                required
                type="text"
                className="w-full p-4 bg-primary-50 rounded-xl text-sm font-bold text-primary-900 placeholder-primary-300 outline-none focus:ring-2 focus:ring-secondary-400 transition-all border border-transparent focus:bg-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Mobile Number</label>
              <input
                required
                type="tel"
                className="w-full p-4 bg-primary-50 rounded-xl text-sm font-bold text-primary-900 placeholder-primary-300 outline-none focus:ring-2 focus:ring-secondary-400 transition-all border border-transparent focus:bg-white"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Delivery Address</label>
              <textarea
                required
                rows={3}
                className="w-full p-4 bg-primary-50 rounded-xl text-sm font-bold text-primary-900 placeholder-primary-300 outline-none focus:ring-2 focus:ring-secondary-400 transition-all border border-transparent focus:bg-white resize-none"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-primary-950 hover:bg-black text-white shadow-lg shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-70 mt-4"
            >
              {submitting ? 'Placing Order...' : 'Confirm Order'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Cart;