
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

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'NEW': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading && orders.length === 0) return <div className="p-12 text-center text-slate-400 font-medium italic">Processing database...</div>;

  return (
    <div className="space-y-8">
      {/* Batch Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Maintenance</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => cleanupOrders(7)} className="px-3 py-2 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-all">Clear &gt; 7 Days</button>
          <button onClick={() => cleanupOrders(30)} className="px-3 py-2 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-all">Clear &gt; 30 Days</button>
          <button onClick={() => cleanupOrders("all")} className="px-3 py-2 text-[10px] font-black bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all uppercase tracking-tighter">Purge All</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {o.id?.slice(-6).toUpperCase()}</p>
              </div>
              <button
                onClick={() => handleDeleteOrder(o.id!)}
                disabled={processingId === o.id + 'delete'}
                className="p-2 text-slate-300 hover:text-red-600 transition-all"
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
                <div>
                  <h3 className="font-black text-slate-800 leading-none mb-1">{o.customer_name}</h3>
                  <p className="text-xs text-blue-600 font-bold">{o.phone_number}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${getStatusStyle(o.order_status)}`}>
                  {o.order_status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.fish_name} × {item.quantity}</span>
                    <span className="font-bold text-slate-800">${(item.price_per_kg * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                  <span>TOTAL</span>
                  <span className="text-blue-600">${o.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2">
              <button onClick={() => handleUpdateStatus(o.id!, "CONFIRMED")} className="text-[9px] font-black bg-white border border-slate-200 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">Confirm</button>
              <button onClick={() => handleUpdateStatus(o.id!, "OUT_FOR_DELIVERY")} className="text-[9px] font-black bg-white border border-slate-200 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-all">Transit</button>
              <button onClick={() => handleUpdateStatus(o.id!, "DELIVERED")} className="text-[9px] font-black bg-white border border-slate-200 py-2 rounded-lg hover:bg-green-600 hover:text-white transition-all">Deliver</button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <div className="py-24 text-center text-slate-400 font-black uppercase tracking-widest text-xs border-2 border-dashed rounded-3xl">
          No records found
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
