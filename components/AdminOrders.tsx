
import React, { useEffect, useState } from "react";
import {
  db,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
  Timestamp,
  writeBatch
} from "../firebase";
import { Order, OrderStatus } from "../types";

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Order[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Order[];
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.error("Orders listener error:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    if (!orderId) return;
    setProcessingId(orderId + status);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        order_status: status,
      });
    } catch (err: any) {
      alert("Update failed: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * DELETE SINGLE ORDER
   * Deletes a specific order document from the 'orders' collection.
   */
  const handleDeleteOrder = async (orderId: string) => {
    console.log("Delete Order requested for ID:", orderId);
    if (!orderId) {
      console.error("Delete failed: Order ID is missing");
      return;
    }
    if (!window.confirm("ARE YOU SURE? This permanently removes the order from history.")) {
      console.log("Delete Order cancelled");
      return;
    }

    setProcessingId(orderId + "delete");
    try {
      console.log("Deleting order doc:", orderId);
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);
      console.log("Order deleted successfully:", orderId);
    } catch (err: any) {
      console.error("Delete failed:", err);
      console.dir(err);
      alert("Delete failed: " + err.message + "\n\nCheck console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * BULK CLEANUP
   * Queries orders older than X days and deletes them using a writeBatch.
   */
  const cleanupOrders = async (days: number | "all") => {
    const confirmMsg = days === "all"
      ? "DANGER: This will delete ALL orders in the database. Proceed?"
      : `Delete all orders older than ${days} days?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      let q;
      if (days === "all") {
        q = query(collection(db, "orders"));
      } else {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (days as number));
        q = query(
          collection(db, "orders"),
          where("created_at", "<=", Timestamp.fromDate(cutoffDate))
        );
      }

      const snap = await getDocs(q);
      if (snap.empty) {
        alert("No orders matched the cleanup criteria.");
        setLoading(false);
        return;
      }

      // 1. Initialize Batch
      const batch = writeBatch(db);

      // 2. Add delete operations to batch
      snap.docs.forEach((d) => {
        batch.delete(d.ref);
      });

      // 3. Commit Batch
      await batch.commit();
      alert(`Cleanup successful! Deleted ${snap.size} orders.`);
    } catch (err: any) {
      console.error("Bulk cleanup error:", err);
      alert("Cleanup failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... inside AdminOrders ...
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'NEW': return 'bg-secondary-100 text-secondary-800';
      case 'CONFIRMED': return 'bg-primary-100 text-primary-800';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      default: return 'bg-primary-50 text-primary-800';
    }
  };

  if (loading && orders.length === 0) return <div className="p-12 text-center text-primary-400 font-medium italic">Processing database...</div>;

  return (
    <div className="space-y-8">
      {/* Batch Actions */}
      <div className="bg-white dark:bg-primary-900 p-4 rounded-2xl border border-primary-100 dark:border-primary-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">Maintenance</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => cleanupOrders(7)} className="px-3 py-2 text-[10px] font-bold bg-transparent hover:bg-green-600 border border-primary-200 dark:border-primary-700 hover:border-green-600 text-primary-500 dark:text-primary-400 hover:text-white rounded-lg transition-all uppercase tracking-wider">Clear &gt; 7 Days</button>
          <button onClick={() => cleanupOrders(30)} className="px-3 py-2 text-[10px] font-bold bg-transparent hover:bg-green-600 border border-primary-200 dark:border-primary-700 hover:border-green-600 text-primary-500 dark:text-primary-400 hover:text-white rounded-lg transition-all uppercase tracking-wider">Clear &gt; 30 Days</button>
          <button onClick={() => cleanupOrders("all")} className="px-3 py-2 text-[10px] font-black bg-transparent hover:bg-red-600 border border-primary-200 dark:border-primary-700 hover:border-red-600 text-primary-500 dark:text-primary-400 hover:text-white rounded-lg transition-all uppercase tracking-wider">Delete All</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((o) => (
          <div key={o.id} className="bg-white dark:bg-primary-900 rounded-2xl shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden flex flex-col hover:shadow-md transition-all">
            <div className="p-4 border-b border-primary-50 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-800/20 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-primary-400 dark:text-primary-500 uppercase tracking-widest">ID: {o.id?.slice(-6).toUpperCase()}</p>
              </div>
              <button
                onClick={() => handleDeleteOrder(o.id!)}
                disabled={processingId === o.id + 'delete'}
                className="p-2 text-primary-300 dark:text-primary-600 hover:text-red-600 transition-all"
                title="Delete Order"
              >
                {processingId === o.id + 'delete' ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                )}
              </button>
            </div>

            <div className="p-5 flex-grow space-y-4">
              <div className="flex justify-between items-start">
                <div className="mb-6">
                  <h3 className="text-lg font-black text-primary-950 dark:text-white mb-1">{o.customer_name}</h3>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary-500 dark:text-primary-400 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {o.phone_number}
                    </p>
                    <p className="text-xs font-medium text-primary-400 dark:text-primary-500 flex items-start gap-2">
                      <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {o.delivery_address}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${getStatusStyle(o.order_status)}`}>
                  {o.order_status}
                </span>
              </div>

              <div className="bg-primary-50 dark:bg-primary-950 p-3 rounded-xl border border-primary-100 dark:border-primary-800 text-[11px] space-y-1.5">
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-primary-700 dark:text-primary-300">
                    <span>{item.fish_name} × {item.quantity}</span>
                    <span className="font-bold text-primary-900 dark:text-white">₹{((item.price_per_kg * item.quantity) + (item.cleaning ? 30 * item.quantity : 0)).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-primary-200 dark:border-primary-800 flex justify-between font-black text-primary-950 dark:text-white text-sm">
                  <span>TOTAL</span>
                  <span className="text-secondary-600 dark:text-secondary-400">₹{o.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-primary-50 dark:bg-primary-950 border-t border-primary-100 dark:border-primary-800 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleUpdateStatus(o.id!, "CONFIRMED")}
                disabled={processingId === o.id + "CONFIRMED"}
                className={`flex items-center justify-center text-[10px] uppercase tracking-widest font-black h-9 rounded-xl transition-all active:scale-95 border ${o.order_status === 'CONFIRMED' ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20' : 'bg-transparent text-primary-400 dark:text-primary-500 border-primary-200 dark:border-primary-700 hover:border-green-500 hover:text-green-500'} ${processingId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processingId === o.id + "CONFIRMED" ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  "Confirm"
                )}
              </button>
              <button
                onClick={() => handleUpdateStatus(o.id!, "OUT_FOR_DELIVERY")}
                disabled={processingId === o.id + "OUT_FOR_DELIVERY"}
                className={`flex items-center justify-center text-[10px] uppercase tracking-widest font-black h-9 rounded-xl transition-all active:scale-95 border ${o.order_status === 'OUT_FOR_DELIVERY' ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20' : 'bg-transparent text-primary-400 dark:text-primary-500 border-primary-200 dark:border-primary-700 hover:border-green-500 hover:text-green-500'} ${processingId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processingId === o.id + "OUT_FOR_DELIVERY" ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  "Transit"
                )}
              </button>
              <button
                onClick={() => handleUpdateStatus(o.id!, "DELIVERED")}
                disabled={processingId === o.id + "DELIVERED"}
                className={`flex items-center justify-center text-[10px] uppercase tracking-widest font-black h-9 rounded-xl transition-all active:scale-95 border ${o.order_status === 'DELIVERED' ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20' : 'bg-transparent text-primary-400 dark:text-primary-500 border-primary-200 dark:border-primary-700 hover:border-green-500 hover:text-green-500'} ${processingId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processingId === o.id + "DELIVERED" ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  "Deliver"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <div className="py-24 text-center text-primary-300 dark:text-primary-600 font-black uppercase tracking-widest text-xs border-2 border-dashed border-primary-200 dark:border-primary-800 rounded-3xl">
          No records found
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
