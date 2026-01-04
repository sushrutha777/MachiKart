
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
  doc,
  setDoc
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

  const total = items.reduce((sum, item) => sum + (item.price_per_kg * item.quantity) + (item.cleaning ? 30 : 0), 0);

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

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      alert("Please enter a valid 10-digit phone number.");
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
          quantity: item.quantity,
          cleaning: item.cleaning
        })),
        total_amount: total,
        payment_method: "Cash on Delivery",
        order_status: "NEW",
        created_at: serverTimestamp()
      };

      const customId = formData.phone;
      await setDoc(doc(db, "orders", customId), orderData);
      setOrderSuccess(customId);
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

    if (!/^\d{10}$/.test(phone)) {
      setStatusError("Please enter a valid 10-digit phone number.");
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
      <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl shadow-xl border border-primary-100 dark:border-primary-800 sticky top-24 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-black text-primary-950 dark:text-white mb-2">Order Confirmed!</h3>
        <p className="text-sm text-primary-500 dark:text-primary-400 mb-6">Your fresh catch is being prepared associated with:</p>

        {/* Payment Info Notice (Golden & Animated) */}
        <div className="bg-amber-50 dark:bg-amber-900/40 p-4 rounded-xl border border-amber-200 dark:border-amber-700 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-200 mb-1">Payment Method: Cash on Delivery</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
            You can pay via <span className="font-bold">Cash</span> or <span className="font-bold">UPI</span> to the delivery person upon arrival.
          </p>
        </div>

        <div className="bg-primary-50 dark:bg-primary-950 p-3 rounded-lg border border-primary-100 dark:border-primary-800 mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Order ID</p>
          <p className="font-mono font-bold text-lg text-primary-900 dark:text-primary-100 select-all tracking-wider">{orderSuccess}</p>
        </div>

        <button
          onClick={() => {
            setOrderSuccess(null);
            onOrderConfirmed();
          }}
          className="text-sm font-bold text-secondary-600 dark:text-secondary-400 hover:underline"
        >
          Start New Order
        </button>
      </div>
    );
  }

  // if (items.length === 0) {
  //   return null; 
  // } -- Removed to allow Order Tracking visibility

  return (
    <div className="bg-white dark:bg-primary-900 p-6 rounded-2xl shadow-xl shadow-primary-900/10 border border-primary-100 dark:border-primary-800 sticky top-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-primary-950 dark:text-white tracking-tight">Basket</h2>
        <span className="bg-primary-950 dark:bg-primary-100 text-white dark:text-primary-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-sm shadow-primary-200 dark:shadow-none">
          {items.length} Units
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-center py-8 text-primary-400 dark:text-primary-500 font-medium italic">
            Your basket is empty.
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="relative flex gap-4 items-start bg-primary-50 dark:bg-primary-800 p-3 rounded-2xl group border border-transparent hover:border-secondary-200 dark:hover:border-secondary-600 transition-colors">
              <img src={item.image_url || `https://picsum.photos/seed/${item.fish_name}/100/100`} alt={item.fish_name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0 pr-8">
                <h4 className="font-bold text-primary-950 dark:text-white truncate pr-2">{item.fish_name}</h4>
                <div className="flex flex-col mb-2">
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 font-bold">₹{item.price_per_kg}/kg</p>
                  {item.cleaning && (
                    <span className="text-[10px] font-black text-primary-500 bg-primary-100 dark:bg-primary-900 px-1.5 py-0.5 rounded w-fit mt-1">
                      Cleaned (+₹30)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-primary-900 px-2 py-1 rounded-lg border border-primary-100 dark:border-primary-700 shadow-sm w-fit">
                  <button
                    disabled={showCheckout}
                    onClick={() => onUpdateQty(item.id, -0.5)}
                    className="w-6 h-6 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                  </button>
                  <span className="text-sm font-black min-w-[3rem] text-center dark:text-white">{item.quantity} kg</span>
                  <button
                    disabled={showCheckout}
                    onClick={() => onUpdateQty(item.id, 0.5)}
                    className="w-6 h-6 flex items-center justify-center text-primary-400 dark:text-primary-500 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>

              <button
                disabled={showCheckout}
                onClick={() => onRemove(item.id)}
                className="absolute top-2 right-2 text-primary-300 dark:text-primary-600 hover:text-red-500 transition-colors p-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-end mb-2 pt-6 border-t border-primary-100 dark:border-primary-800">
        <span className="text-xs font-bold text-primary-400 dark:text-primary-500 uppercase tracking-widest">Subtotal</span>
        <span className="text-xl font-bold text-primary-900 dark:text-white tracking-tight">₹{total.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-end mb-6 pt-4 border-t-2 border-dashed border-primary-100 dark:border-primary-800">
        <span className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-widest">Total Amount</span>
        <span className="text-4xl font-black text-secondary-500 tracking-tighter leading-none">₹{total.toFixed(2)}</span>
      </div>

      {!showCheckout ? (
        <button
          disabled={items.length === 0}
          onClick={() => setShowCheckout(true)}
          className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-primary-950 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-primary-950 shadow-lg shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Checkout
        </button>
      ) : (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-primary-950 dark:text-white">Shipping Details</h3>
            <button onClick={() => setShowCheckout(false)} className="text-xs font-bold text-red-500 hover:text-red-700">
              CANCEL
            </button>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary-400 dark:text-primary-500 mb-1">Customer Name</label>
              <input
                required
                type="text"
                className="w-full p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-sm font-bold text-primary-900 dark:text-primary-100 placeholder-primary-300 dark:placeholder-primary-700 outline-none focus:ring-2 focus:ring-secondary-400 transition-all border border-transparent focus:bg-white dark:focus:bg-primary-900"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary-400 dark:text-primary-500 mb-1">Mobile Number</label>
              <input
                required
                type="tel"
                maxLength={10}
                pattern="\d{10}"
                title="Please enter a 10-digit phone number"
                className="w-full p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-sm font-bold text-primary-900 dark:text-primary-100 placeholder-primary-300 dark:placeholder-primary-700 outline-none focus:ring-2 focus:ring-secondary-400 transition-all border border-transparent focus:bg-white dark:focus:bg-primary-900"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({ ...formData, phone: val });
                }}
              />
            </div>


            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary-400 dark:text-primary-500 mb-1">Delivery Address</label>
              <textarea
                required
                rows={3}
                className="w-full p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-sm font-bold text-primary-900 dark:text-primary-100 placeholder-primary-300 dark:placeholder-primary-700 outline-none focus:ring-2 focus:ring-secondary-400 transition-all border border-transparent focus:bg-white dark:focus:bg-primary-900 resize-none"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-primary-950 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-primary-950 shadow-lg shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-70 mt-4"
            >
              {submitting ? 'Placing Order...' : 'Confirm Order'}
            </button>
          </form>
        </div>
      )}
      <div className="mt-8 pt-8 border-t border-primary-100 dark:border-primary-800">
        <h3 className="text-sm font-black text-primary-950 dark:text-white uppercase tracking-widest mb-4">Track Your Order</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="tel"
            maxLength={10}
            placeholder="Enter 10-digit Phone Number"
            className="flex-1 p-3 bg-primary-50 dark:bg-primary-950 rounded-xl text-xs font-bold text-primary-900 dark:text-primary-100 placeholder-primary-400 outline-none focus:ring-2 focus:ring-secondary-400"
            value={searchPhone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 10) setSearchPhone(val);
            }}
            onKeyDown={(e) => e.key === 'Enter' && checkStatus()}
          />
          <button
            onClick={checkStatus}
            disabled={checkingStatus}
            className="px-4 bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-950 rounded-xl font-bold text-xs uppercase disabled:opacity-70"
          >
            {checkingStatus ? '...' : 'Check'}
          </button>
        </div>

        {statusError && (
          <p className="text-xs font-bold text-red-500 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900">{statusError}</p>
        )}

        {recentOrder && (
          <div className="bg-primary-50 dark:bg-primary-950/50 p-4 rounded-2xl border border-primary-100 dark:border-primary-800 animation-fade-in-up">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-primary-100 dark:border-primary-800">
              <div>
                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Order Total</p>
                <p className="text-xl font-black text-primary-950 dark:text-white">₹{recentOrder.total_amount.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Items</p>
                <p className="text-sm font-bold text-primary-900 dark:text-white">{recentOrder.items.length}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-2">Current Status</p>
              <div className={`p-4 rounded-xl border-l-4 shadow-sm ${recentOrder.order_status === 'NEW' ? 'bg-secondary-50 border-secondary-500 text-secondary-900' :
                recentOrder.order_status === 'CONFIRMED' ? 'bg-blue-50 border-blue-500 text-blue-900' :
                  recentOrder.order_status === 'OUT_FOR_DELIVERY' ? 'bg-purple-50 border-purple-500 text-purple-900' :
                    recentOrder.order_status === 'DELIVERED' ? 'bg-green-50 border-green-500 text-green-900' :
                      'bg-gray-50 border-gray-500 text-gray-900'
                }`}>
                <p className="font-bold text-sm leading-relaxed">
                  {(() => {
                    switch (recentOrder.order_status) {
                      case 'NEW':
                        return "Waiting for admin to confirm your order, it will take another few minutes to confirm";
                      case 'CONFIRMED':
                        return "Your order has been confirmed";
                      case 'OUT_FOR_DELIVERY':
                        return "Your order is on delivery will reach soon in 30 minutes";
                      case 'DELIVERED':
                        return "Delivered";
                      default:
                        return recentOrder.order_status.replace(/_/g, " ");
                    }
                  })()}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-primary-200 dark:border-primary-800 pt-3 mt-3">
              {recentOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-bold text-primary-600 dark:text-primary-400">
                  <span>{item.fish_name} <span className="text-primary-400">× {item.quantity}</span></span>
                  <span>₹{((item.price_per_kg * item.quantity) + (item.cleaning ? 30 : 0)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;