
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

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'NEW': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Basket</h2>
        <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
          {items.length} Units
        </span>
      </div>

      {orderSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 animate-pulse text-sm">
          <p className="font-bold">✓ Order Placed!</p>
          <p className="text-xs mt-1">Ref: {orderSuccess}</p>
          <button onClick={() => setOrderSuccess(null)} className="mt-2 text-[10px] font-black uppercase underline">Dismiss</button>
        </div>
      )}

      {/* Status Check Section */}
      <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Live Order Tracker</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Phone"
            className="flex-grow text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
          />
          <button
            onClick={checkStatus}
            disabled={checkingStatus}
            className="bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            {checkingStatus ? '...' : 'Sync'}
          </button>
        </div>

        {statusError && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-tighter">{statusError}</p>}

        {recentOrder && (
          <div className="mt-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Status</span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${getStatusColor(recentOrder.order_status)}`}>
                {recentOrder.order_status}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg">
              {recentOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.fish_name} × {it.quantity}</span>
                  <span className="font-bold text-slate-800">${(it.price_per_kg * it.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-[12px]">
                <span>TOTAL (COD)</span>
                <span>${recentOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto mb-6 pr-1 custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-slate-300 text-center py-16 flex flex-col items-center gap-3">
            <svg className="w-16 h-16 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <p className="text-[10px] font-black uppercase tracking-widest">Basket is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-800 text-xs">{item.fish_name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">${item.price_per_kg.toFixed(2)}/kg</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden h-9 shadow-sm">
                    <button onClick={() => onUpdateQty(item.id, -1)} className="px-3 hover:bg-slate-50 text-slate-400 font-bold transition-colors">-</button>
                    <span className="px-2 text-xs font-black text-slate-800 min-w-[1.5rem] text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)} className="px-3 hover:bg-slate-50 text-slate-400 font-bold transition-colors">+</button>
                  </div>
                  <button type="button" onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-end mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Grand Total</span>
            <span className="text-3xl font-black text-blue-600 tracking-tighter leading-none">${total.toFixed(2)}</span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 italic">COD Only</span>
        </div>

        {!showCheckout ? (
          <button
            onClick={() => items.length > 0 && setShowCheckout(true)}
            disabled={items.length === 0}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95
              ${items.length === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
          >
            Checkout Now
          </button>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-blue-100 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest border-b border-blue-100 pb-2 mb-2">Delivery Info</h3>
            <input required type="text" placeholder="Full Name" className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <input required type="tel" placeholder="Phone Number" className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <textarea required placeholder="Delivery Address" className="w-full p-3 text-sm border border-slate-200 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white transition-all" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCheckout(false)} className="flex-1 py-3 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-white transition-all border border-slate-200">Back</button>
              <button type="submit" disabled={submitting} className="flex-[2] py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95 disabled:opacity-50 transition-all">
                {submitting ? 'Sending...' : 'Confirm Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Cart;
