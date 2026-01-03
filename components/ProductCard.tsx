
import React from 'react';
import { Product } from '../types';

interface Props {
  product: Product;
  onAdd: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onAdd }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-primary-900/5 p-4 border border-white hover:border-secondary-100 transition-all duration-300 group flex flex-col items-center text-center">

      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-primary-50">
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-primary-950 text-secondary-500 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
            DAILY PORT FRESH
          </span>
        </div>
        <img
          src={`https://picsum.photos/seed/${product.fish_name}/500/400`}
          alt={product.fish_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Ingredient visuals decoration mimicking the screenshot */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full space-y-2 mb-6">
        <h3 className="text-2xl font-black text-primary-950 leading-tight">{product.fish_name}</h3>
        <p className="text-xs text-primary-400 font-medium leading-relaxed px-4">
          Meaty and succulent, perfect for pan-fry or traditional masala fry.
        </p>
      </div>

      <div className="w-full mt-auto space-y-4">
        <div>
          <span className="text-[10px] font-black text-primary-300 uppercase tracking-widest block mb-1">Market Rate</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-secondary-500 text-3xl font-black tracking-tighter">₹{product.price_per_kg}</span>
            <span className="text-primary-400 text-xs font-bold">/kg</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary-50 text-primary-400 hover:bg-primary-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          <button
            onClick={onAdd}
            className="flex-grow h-12 bg-primary-950 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-primary-900/20 transition-all active:scale-95 flex items-center justify-center"
          >
            Select Catch
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
