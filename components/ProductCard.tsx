
import React from 'react';
import { Product } from '../types';

interface Props {
  product: Product;
  onAdd: (cleaning: boolean) => void;
}

const ProductCard: React.FC<Props> = ({ product, onAdd }) => {
  const [isCleaning, setIsCleaning] = React.useState(false);

  return (
    <div className="bg-white dark:bg-primary-900 rounded-3xl shadow-xl shadow-primary-900/5 p-4 border border-white dark:border-primary-800 hover:border-secondary-100 dark:hover:border-secondary-900 transition-all duration-300 group flex flex-col items-center text-center">

      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-primary-50 dark:bg-primary-800">
        <div className="absolute top-3 left-3 z-10">
          <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg shadow-lg ${product.is_premium ? 'bg-secondary-500 text-primary-950' : 'bg-primary-950 text-secondary-500'}`}>
            {product.is_premium ? "✨ PREMIUM CATCH" : "DAILY PORT FRESH"}
          </span>
        </div>
        <img
          src={product.image_url || `https://picsum.photos/seed/${product.fish_name}/500/400`}
          alt={product.fish_name}
          className={`w-full h-full object-cover transition-transform duration-700 ${product.available === false ? 'grayscale' : 'group-hover:scale-110'}`}
        />
        {product.available === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest shadow-2xl rotate-[-10deg] border-2 border-white/20">
              Sold Out
            </span>
          </div>
        )}
        {/* Ingredient visuals decoration mimicking the screenshot */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full space-y-2 mb-6">
        <h3 className="text-2xl font-black text-primary-950 dark:text-white leading-tight">{product.fish_name}</h3>
        <p className="text-xs text-primary-400 dark:text-primary-500 font-medium leading-relaxed px-4">
          Meaty and succulent, perfect for pan-fry or traditional masala fry.
        </p>
      </div>

      <div className="w-full mt-auto space-y-4">
        <div>
          <span className="text-[10px] font-black text-primary-300 dark:text-primary-600 uppercase tracking-widest block mb-1">Market Rate</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-secondary-500 text-3xl font-black tracking-tighter">₹{product.price_per_kg}</span>
            <span className="text-primary-400 dark:text-primary-500 text-xs font-bold">/kg</span>
          </div>
        </div>

        {/* Cleaning Toggle */}
        <div
          onClick={() => {
            if (product.available !== false) {
              setIsCleaning(!isCleaning);
            }
          }}
          className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-3 
            ${product.available === false ? 'opacity-50 cursor-not-allowed border-neutral-200 dark:border-neutral-800' : ''}
            ${isCleaning ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' : 'border-primary-100 dark:border-primary-800 bg-transparent'}`}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isCleaning ? 'bg-secondary-500 border-secondary-500' : 'border-primary-300'}`}>
            {isCleaning && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className={`text-xs font-bold ${isCleaning ? 'text-secondary-700 dark:text-secondary-400' : 'text-primary-400'}`}>
            Add Cleaning (+₹30)
          </span>
        </div>

        <div className="flex gap-2">
          {/* Removed generic icon button, simplifying */}
          <button
            onClick={() => onAdd(isCleaning)}
            disabled={product.available === false}
            className={`flex-grow h-12 rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-primary-900/20 transition-all active:scale-95 flex items-center justify-center 
              ${product.available === false
                ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'
                : 'bg-primary-950 hover:bg-black text-white'}`}
          >
            {product.available === false ? "SOLD OUT" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
