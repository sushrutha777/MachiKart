
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
  storage,
  ref,
  uploadBytes,
  getDownloadURL
} from "../firebase";
import { Product } from "../types";

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [form, setForm] = useState({
    fish_name: "",
    price_per_kg: 0,
    available: true,
    is_premium: false,
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
    setUploadStatus("Processing...");

    try {
      let imageUrl = "";

      // Convert Image to Base64 if selected
      if (imageFile) {
        setUploadStatus("Encoding Image...");
        try {
          imageUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        } catch (err) {
          console.error("Encoding Error:", err);
          alert("Failed to process image.");
          return;
        }
      }

      setUploadStatus("Saving to Database...");
      const productData: any = {
        fish_name: form.fish_name,
        price_per_kg: form.price_per_kg,
        available: true, // Always available as per new requirement
        is_premium: form.is_premium,
        last_updated: serverTimestamp(),
      };

      if (imageUrl) {
        productData.image_url = imageUrl;
      }

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          created_at: serverTimestamp(),
        });
      }

      console.log("Save successful!");
      setForm({ fish_name: "", price_per_kg: 0, available: true, is_premium: false });
      setImageFile(null);
      setPreviewUrl(null);
      setEditingId(null);
      setUploadStatus("");
      alert(editingId ? "Product updated!" : "Product added!");

    } catch (err: any) {
      console.error("Submission Error:", err);
      alert("Error: " + err.message);
    } finally {
      setProcessingId(null);
      setUploadStatus("");
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
      available: true,
      is_premium: !!p.is_premium,
    });
    setImageFile(null);
    setPreviewUrl(p.image_url || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ... inside AdminProducts ...
  // ... inside AdminProducts ...
  if (loading) return <div className="p-12 text-center text-primary-400 font-medium italic">Syncing inventory...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1">
        <div className="bg-white dark:bg-primary-900 p-6 rounded-2xl shadow-sm border border-primary-100 dark:border-primary-800 sticky top-24">
          <h2 className="text-lg font-black text-primary-950 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3">
            <span className="w-2 h-8 bg-secondary-500 rounded-full shadow-lg shadow-secondary-500/20"></span>
            {editingId ? "Modify Catch" : "Add New Catch"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-primary-400 dark:text-primary-500 mb-2 uppercase tracking-widest pl-1">Variety Name</label>
                <input
                  required
                  className="w-full p-4 bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-2xl outline-none focus:ring-2 focus:ring-secondary-400 focus:bg-white dark:focus:bg-primary-900 transition-all text-sm font-bold text-primary-900 dark:text-white placeholder-primary-300"
                  placeholder="e.g. Silver Pomfret"
                  value={form.fish_name}
                  onChange={(e) => setForm({ ...form, fish_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-primary-400 dark:text-primary-500 mb-2 uppercase tracking-widest pl-1">Price / Kg</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 font-bold">₹</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full p-4 pl-8 bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-2xl outline-none focus:ring-2 focus:ring-secondary-400 focus:bg-white dark:focus:bg-primary-900 transition-all text-sm font-bold text-primary-900 dark:text-white"
                      value={form.price_per_kg}
                      onChange={(e) => setForm({ ...form, price_per_kg: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-primary-400 dark:text-primary-500 mb-2 uppercase tracking-widest pl-1">Category</label>
                  <label className={`h-[54px] flex items-center justify-center gap-2 rounded-2xl border cursor-pointer transition-all ${form.is_premium ? 'bg-secondary-500 text-primary-950 border-secondary-500 shadow-lg shadow-secondary-500/20' : 'bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800 text-primary-400'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.is_premium}
                      onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {form.is_premium ? "✨ Premium" : "Standard"}
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-primary-400 dark:text-primary-500 mb-3 uppercase tracking-widest pl-1">Product Image</label>

                {/* Image Preview Container - Water-like structure */}
                {previewUrl && (
                  <div className="mb-6 relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl shadow-black/10 border-2 border-primary-200 dark:border-primary-700 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute bottom-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-lg transform translate-y-10 group-hover:translate-y-0 transition-transform"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}

                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        // 1. Basic Validation
                        if (file.size > 5 * 1024 * 1024) {
                          alert("File is too large! Please select an image under 5MB.");
                          return;
                        }

                        // 2. Image Compression/Resizing
                        try {
                          const bitmap = await createImageBitmap(file);
                          const scale = Math.min(1, 800 / bitmap.width);
                          const width = bitmap.width * scale;
                          const height = bitmap.height * scale;

                          const canvas = document.createElement('canvas');
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx?.drawImage(bitmap, 0, 0, width, height);

                          canvas.toBlob((blob) => {
                            if (blob) {
                              const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                              });
                              setImageFile(compressedFile);
                              setPreviewUrl(URL.createObjectURL(compressedFile)); // Set preview URL
                            } else {
                              setImageFile(file);
                              setPreviewUrl(URL.createObjectURL(file)); // Fallback preview URL
                            }
                          }, 'image/jpeg', 0.7);
                        } catch (err) {
                          console.error("Compression failed:", err);
                          setImageFile(file);
                          setPreviewUrl(URL.createObjectURL(file)); // Fallback preview URL
                        }
                      }
                    }}
                  />
                  <div className="w-full p-4 border-2 border-dashed border-primary-200 dark:border-primary-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-primary-400 group-hover:border-secondary-400 group-hover:text-secondary-500 transition-colors bg-primary-50 dark:bg-primary-950">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">{imageFile ? "Change Image" : "Choose Image"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ fish_name: "", price_per_kg: 0, available: true, is_premium: false });
                    setImageFile(null);
                    setPreviewUrl(null); // Clear previewUrl on cancel
                  }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase text-primary-500 dark:text-primary-400 bg-primary-100 dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-700"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={!!processingId}
                className="flex-[2] py-3.5 bg-primary-950 dark:bg-white hover:bg-black dark:hover:bg-primary-100 text-white dark:text-primary-950 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-900/20 transition-all disabled:opacity-50"
              >
                {uploadStatus || (editingId ? "Update Item" : "Add Product")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="xl:col-span-2">
        <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-sm border border-primary-100 dark:border-primary-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-primary-50 dark:bg-primary-950 border-b border-primary-100 dark:border-primary-800">
              <tr>
                <th className="px-6 py-4 text-[9px] font-black text-primary-400 dark:text-primary-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[9px] font-black text-primary-400 dark:text-primary-500 uppercase tracking-widest text-center">Price</th>
                <th className="px-6 py-4 text-[9px] font-black text-primary-400 dark:text-primary-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-primary-400 dark:text-primary-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50 dark:divide-primary-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 overflow-hidden flex-shrink-0">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.fish_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-primary-400 font-bold">IMG</div>
                        )}
                      </div>
                      <span className="font-bold text-primary-900 dark:text-white">{p.fish_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-secondary-600 dark:text-secondary-400">₹{p.price_per_kg.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    {p.is_premium ? (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 flex items-center justify-center gap-1 w-fit mx-auto">
                        <span>✨</span> Premium
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-primary-100 dark:bg-primary-800 text-primary-400 dark:text-primary-400">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 text-primary-300 dark:text-primary-600 hover:text-secondary-600 dark:hover:text-secondary-400 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={processingId === p.id}
                        className="p-2 text-primary-300 dark:text-primary-600 hover:text-red-500 transition-all"
                        title="Delete Fish"
                      >
                        {processingId === p.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent animate-spin rounded-full"></div>
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
