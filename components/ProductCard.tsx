
import React from 'react';
import { Product } from '../types';

interface Props {
  product: Product;
  onAdd: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onAdd }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-48 bg-slate-100 overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${product.fish_name}/400/300`} 
          alt={product.fish_name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800">{product.fish_name}</h3>
          <span className="text-sm bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">Fresh</span>
        </div>
        <p className="text-blue-700 text-lg font-semibold mb-4">
          ${product.price_per_kg.toFixed(2)} <span className="text-sm font-normal text-slate-500">/ kg</span>
        </p>
        <button 
          onClick={onAdd}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
