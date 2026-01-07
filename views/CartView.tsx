import React from 'react';
import Cart from '../components/Cart';
import { CartItem } from '../types';
import { Link } from 'react-router-dom';

interface CartViewProps {
    cart: CartItem[];
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
}

const CartView: React.FC<CartViewProps> = ({
    cart,
    removeFromCart,
    updateQuantity,
    clearCart
}) => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh]">
            <div className="mb-6">
                <Link to="/" className="inline-flex items-center text-sm font-bold text-primary-500 hover:text-secondary-500 transition-colors">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Shop
                </Link>
            </div>

            <Cart
                items={cart}
                onRemove={removeFromCart}
                onUpdateQty={updateQuantity}
                onOrderConfirmed={clearCart}
            />
        </div>
    );
};

export default CartView;
