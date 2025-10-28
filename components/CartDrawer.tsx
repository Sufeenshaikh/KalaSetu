import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import Button from './Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { cartItems, addToCart, decreaseQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    
    return (
        <div
            className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'bg-black/60' : 'bg-transparent pointer-events-none'}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
        >
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    <header className="p-6 border-b border-accent/30 flex justify-between items-center flex-shrink-0">
                        <h2 id="cart-drawer-title" className="text-2xl font-heading font-bold text-secondary">Your Cart</h2>
                        <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors" aria-label="Close cart">
                            <CloseIcon />
                        </button>
                    </header>

                    {cartItems.length > 0 ? (
                        <>
                            <main className="flex-1 p-6 overflow-y-auto space-y-6">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-start space-x-4">
                                        <img src={item.images?.[0] || 'https://via.placeholder.com/100'} alt={item.title} className="w-20 h-20 object-cover rounded-md border" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-text-primary leading-tight">{item.title}</h3>
                                            <p className="text-sm text-primary font-semibold my-1">₹{item.price}</p>
                                            <div className="flex items-center mt-2 border border-gray-300 rounded-md w-fit">
                                                <button onClick={() => decreaseQuantity(item.id)} className="px-3 py-1 text-lg hover:bg-gray-100 rounded-l-md" aria-label={`Decrease quantity of ${item.title}`}>-</button>
                                                <span className="px-4 py-1 border-l border-r">{item.quantity}<span className="sr-only"> quantity of {item.title}</span></span>
                                                <button onClick={() => addToCart(item)} className="px-3 py-1 text-lg hover:bg-gray-100 rounded-r-md" aria-label={`Increase quantity of ${item.title}`}>+</button>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Remove ${item.title} from cart`}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                            </main>

                            <footer className="p-6 border-t border-accent/30 flex-shrink-0 space-y-4 bg-surface/50">
                                <div className="flex justify-between font-bold text-lg text-text-primary">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toFixed(2)}</span>
                                </div>
                                <Link 
                                    to="/checkout-success" 
                                    onClick={onClose}
                                    className="block w-full text-center text-lg py-3 px-6 font-bold rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-white hover:bg-opacity-90 focus:ring-primary"
                                >
                                    Proceed to Checkout
                                </Link>
                                <button className="w-full text-center text-sm text-text-secondary hover:text-primary" onClick={clearCart}>
                                    Clear Cart
                                </button>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <h3 className="text-xl font-bold text-secondary">Your cart is empty</h3>
                            <p className="text-text-secondary mt-2">Looks like you haven't added anything yet.</p>
                            <Link to="/shop" onClick={onClose}>
                                <Button className="mt-6">Start Shopping</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;