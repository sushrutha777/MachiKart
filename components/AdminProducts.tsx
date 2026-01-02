
import React, { useEffect, useState } from "react";
import {
  db,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "../firebase";
import { Product } from "../types";

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fish_name: "",
    price_per_kg: 0,
    available: true,
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Product[];
      setProducts(list);
      setLoading(false);
    }, (err) => {
      console.error("Firestore sync error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fish_name.trim()) return alert("Please enter a name.");

    setProcessingId("form-submit");
    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), {
          fish_name: form.fish_name,
          price_per_kg: form.price_per_kg,
          available: form.available,
          last_updated: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "products"), {
          ...form,
          created_at: serverTimestamp(),
          last_updated: serverTimestamp(),
        });
      }
      setForm({ fish_name: "", price_per_kg: 0, available: true });
      setEditingId(null);
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * DELETE SINGLE ITEM
   * Deletes a specific product document from the 'products' collection.
   */
  const handleDelete = async (id: string) => {
    console.log("Delete requested for ID:", id);
    if (!id) {
      console.error("Delete failed: ID is missing");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this fish variety?")) {
      console.log("Delete cancelled by user");
      return;
    }

    console.log("Starting delete operation for:", id);
    setProcessingId(id);
    try {
      const docRef = doc(db, "products", id);
      await deleteDoc(docRef);
      console.log("Product deleted successfully:", id);
    } catch (err: any) {
      console.error("Error deleting product:", err);
      // Log full error object for inspection
      console.dir(err);
      alert("Delete failed: " + err.message + "\n\nCheck console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      fish_name: p.fish_name,
      price_per_kg: p.price_per_kg,
      available: p.available,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium italic">Syncing inventory...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
          <h2 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            {editingId ? "Modify Catch" : "Add New Catch"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Variety Name</label>
              <input
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-semibold"
                placeholder="e.g. Pomfret"
                value={form.fish_name}
                onChange={(e) => setForm({ ...form, fish_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Price ($/kg)</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-semibold"
                value={form.price_per_kg}
                onChange={(e) => setForm({ ...form, price_per_kg: Number(e.target.value) })}
              />
            </div>
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              <span className="text-xs font-bold text-slate-600">Visible to Customers</span>
            </label>
            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ fish_name: "", price_per_kg: 0, available: true });
                  }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase text-slate-500 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={!!processingId}
                className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
              >
                {processingId === "form-submit" ? "Syncing..." : editingId ? "Update Item" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800">{p.fish_name}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">${p.price_per_kg.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${p.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.available ? "Available" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={processingId === p.id}
                        className="p-2 text-slate-300 hover:text-red-600 transition-all"
                        title="Delete Fish"
                      >
                        {processingId === p.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
