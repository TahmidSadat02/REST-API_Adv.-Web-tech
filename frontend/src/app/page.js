"use client";
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from './context/AppContext';
import api from './lib/axios';

export default function MenuPage() {
  const { 
    menuItems, loading, fetchMenu, token, userName, userRole, logout, 
    triggerNotification, categories, fetchCategories,
    cart, addToCart, removeFromCart, clearCart 
  } = useContext(AppContext);
  
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // --- NEW: State for Search Bar ---
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMenu();
    fetchCategories(); 
  }, []);

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const currentQty = prev[id] || 1;
      const newQty = currentQty + delta;
      return { ...prev, [id]: Math.max(1, newQty) };
    });
  };

  const handleAddToCart = (item) => {
    if (!token) {
      triggerNotification("Please log in to add items to your cart.");
      router.push('/login');
      return;
    }
    const finalQuantity = quantities[item.id] || 1; 
    addToCart(item, finalQuantity);
    setQuantities(prev => ({ ...prev, [item.id]: 1 })); 
  };

  const confirmAndPlaceOrder = async () => {
    if (!cart || cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const orderItems = cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity
      }));

      await api.post('/orders', { items: orderItems });
      
      triggerNotification("Success! Your order has been placed. Check your email.");
      clearCart();
      setShowConfirmModal(false); 
    } catch (error) {
      console.error("Order failed:", error);
      triggerNotification(error.response?.data?.message || "Failed to place order.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // --- UPDATED: Filter by BOTH Category AND Search Query ---
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategoryId === 'all' || item.category?.id === selectedCategoryId;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower) || 
                          (item.description && item.description.toLowerCase().includes(searchLower));
                          
    return matchesCategory && matchesSearch;
  });

  const cartTotal = (cart || []).reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="py-8 pb-32">
      <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">
          {token && userName ? `Welcome back, ${userName}!` : 'Welcome to Coffee and Code'}
        </h1>
        <p className="text-amber-800 font-medium">Where great coffee meets great code. Enjoy our curated selection of premium brews.</p>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Our Menu</h2>
        
        {/* --- NEW: Search Input UI --- */}
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="🔍 Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all shadow-sm"
          />
        </div>
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-3 mb-8">
          <button 
            onClick={() => setSelectedCategoryId('all')}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
              selectedCategoryId === 'all' ? 'bg-amber-800 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
            }`}
          >
            All Items
          </button>
          
          {categories?.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
                selectedCategoryId === cat.id ? 'bg-amber-800 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-lg">Loading freshly brewed menu...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-lg">
          {searchQuery ? `No items found matching "${searchQuery}".` : (selectedCategoryId === 'all' ? "No items found in the database." : "No items found in this category.")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const qty = quantities[item.id] || 1; 

            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <span className="text-emerald-600 font-bold text-lg">৳{Number(item.price).toFixed(2)}</span>
                  </div>
                  {item.category && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded mb-3">
                      {item.category.name}
                    </span>
                  )}
                  {item.description && <p className="text-gray-600 text-sm mb-6 leading-relaxed">{item.description}</p>}
                </div>

                <div className="mt-4">
                  {item.isAvailable && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mb-3 border border-gray-200">
                      <span className="text-sm font-bold text-gray-700 ml-2">Qty:</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleQuantityChange(item.id, -1)} className="w-8 h-8 rounded bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center transition-colors">-</button>
                        <span className="font-bold w-4 text-center text-gray-900">{qty}</span>
                        <button onClick={() => handleQuantityChange(item.id, 1)} className="w-8 h-8 rounded bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center transition-colors">+</button>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.isAvailable}
                    className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {!item.isAvailable ? 'Out of Stock' : `Add to Cart • ৳${(Number(item.price) * qty).toFixed(2)}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Panel */}
      {(cart || []).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 md:p-6 z-40 animate-fade-in-up">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex-1 w-full overflow-x-auto">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Your Order</h4>
              <div className="flex gap-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 whitespace-nowrap">
                    <span className="font-bold text-gray-900">{item.quantity}x</span>
                    <span className="text-gray-700">{item.name}</span>
                    <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-500 hover:text-red-700 font-bold">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-500 font-bold">Total</p>
                <p className="text-2xl font-extrabold text-emerald-600">৳{cartTotal.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => setShowConfirmModal(true)} 
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
              >
                Checkout Now
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 px-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
            
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Confirm Order</h3>
            <p className="text-gray-600 font-medium mb-6">You are about to place an order for <span className="font-bold text-emerald-600">৳{cartTotal.toFixed(2)}</span>.</p>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8">
              <p className="text-red-800 font-bold text-sm mb-1">
                ⚠️ Final Step
              </p>
              <p className="text-red-700 text-sm font-medium">
                Once you confirmed order, you can't cancel your order. Our baristas will begin preparing it immediately.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isCheckingOut}
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndPlaceOrder}
                disabled={isCheckingOut}
                className="flex-1 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:bg-gray-600"
              >
                {isCheckingOut ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}