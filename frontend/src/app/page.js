"use client";
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from './context/AppContext';
import api from './lib/axios'; 

export default function MenuPage() {
  const { menuItems, loading, fetchMenu, token, triggerNotification } = useContext(AppContext);
  const router = useRouter();
  const [orderingId, setOrderingId] = useState(null);

  useEffect(() => {
    fetchMenu();
    
  }, []);

  const handleBuyNow = async (item) => {
    
    if (!token) {
      triggerNotification("Please log in or register to place an order.");
      router.push('/login');
      return;
    }

    setOrderingId(item.id);
    
    try {
      
      await api.post('/orders', {
        items: [
          {
            menuItemId: item.id,
            quantity: 1 
          }
        ]
      });
      
      
      triggerNotification(`Order placed for ${item.name}! Check your email.`);
    } catch (error) {
      console.error("Order failed:", error);
      triggerNotification(error.response?.data?.message || "Failed to place order.");
    } finally {
      setOrderingId(null);
    }
  };

  return (
    <div className="py-8">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Our Menu</h2>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-lg">Loading freshly brewed menu...</div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-lg">
          No items found in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <span className="text-emerald-600 font-bold text-lg">${Number(item.price).toFixed(2)}</span>
                </div>
                {item.description && <p className="text-gray-600 text-sm mb-6 leading-relaxed">{item.description}</p>}
              </div>

              {/* The New Buy Button */}
              <button 
                onClick={() => handleBuyNow(item)}
                disabled={orderingId === item.id || !item.isAvailable}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {orderingId === item.id 
                  ? 'Placing Order...' 
                  : !item.isAvailable 
                    ? 'Out of Stock' 
                    : 'Buy Now'}
              </button>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}