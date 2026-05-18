"use client";
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '../context/AppContext';
import api from '../lib/axios';
import AddMenuItem from '../components/AddMenuItem';

export default function AdminDashboard() {
  const { token, userRole, triggerNotification, menuItems, fetchMenu, categories, fetchCategories } = useContext(AppContext);
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Edit Form State
  const [editingItemId, setEditingItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', price: '', isAvailable: true, categoryId: '' });

  useEffect(() => {
    if (userRole !== 'admin') {
      router.push('/login');
      return;
    }
    fetchOrders();
    fetchMenu();
    fetchCategories(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userRole]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      triggerNotification(`Order #${orderId} is now ${newStatus.toUpperCase()}`);
      fetchOrders(); 
    } catch (error) {
      triggerNotification(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name: newCategoryName });
      triggerNotification(`Category "${newCategoryName}" created successfully.`);
      setNewCategoryName('');
      fetchCategories(); 
    } catch (error) {
      triggerNotification(error.response?.data?.message || "Failed to create category.");
    }
  };

  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setEditFormData({ 
      name: item.name, 
      description: item.description, 
      price: item.price, 
      isAvailable: item.isAvailable,
      categoryId: item.category ? item.category.id : '' 
    });
  };

  const handleEditSave = async (id) => {
    try {
      const payload = {
        name: editFormData.name,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        isAvailable: editFormData.isAvailable,
      };

      if (editFormData.categoryId) {
        payload.categoryId = editFormData.categoryId;
      }

      await api.patch(`/menu/${id}`, payload);
      triggerNotification(`${editFormData.name} updated successfully.`);
      setEditingItemId(null);
      fetchMenu(); 
    } catch (error) {
      triggerNotification(error.response?.data?.message || "Failed to update item.");
    }
  };

  // The Safe Soft Delete (Hides it)
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to hide ${name} from the menu?`)) {
      return; 
    }
    try {
      await api.delete(`/menu/${id}`);
      triggerNotification(`${name} removed successfully.`);
      fetchMenu(); 
    } catch (error) {
      triggerNotification(error.response?.data?.message || "Failed to remove item.");
    }
  };

  if (userRole !== 'admin') return null; 

  // Filter out completed orders to keep the dashboard clean
  const activeOrders = orders.filter(order => order.status !== 'completed');

  return (
    <div className="py-8">
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600 font-medium">Manage your coffee shop menu, categories, and orders.</p>
      </div>

      <AddMenuItem onAddSuccess={() => fetchMenu()} />

      {/* Category Management Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Category Management</h3>
        
        <form onSubmit={handleCreateCategory} className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Category Name" 
            value={newCategoryName} 
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-amber-500"
            required 
          />
          <button type="submit" className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors">
            Add Category
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <span className="text-gray-500 text-sm font-medium">No categories created yet.</span>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="px-4 py-2 bg-gray-100 border border-gray-200 text-gray-800 rounded-full text-sm font-bold flex items-center gap-2">
                {cat.name}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Incoming Orders Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Incoming Orders</h3>
        {loadingOrders ? (
          <div className="text-gray-500 font-medium">Loading orders...</div>
        ) : activeOrders.length === 0 ? (
          <div className="text-gray-500 bg-gray-50 p-6 rounded-lg border border-gray-200 text-center font-medium">
            {orders.length > 0 ? "All orders are completed! Great job." : "No orders have been placed yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-4 text-gray-900 font-bold rounded-tl-lg">Order ID</th>
                  <th className="py-4 px-4 text-gray-900 font-bold">Customer</th>
                  <th className="py-4 px-4 text-gray-900 font-bold">Items</th>
                  <th className="py-4 px-4 text-gray-900 font-bold">Total</th>
                  <th className="py-4 px-4 text-gray-900 font-bold">Status</th>
                  <th className="py-4 px-4 text-gray-900 font-bold rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900 font-bold">#{order.id}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{order.customer?.fullName || 'Unknown'}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">
                      {order.items?.map(i => `${i.quantity}x ${i.menuItem?.name || 'Item (Hidden)'}`).join(', ')}
                    </td>
                    <td className="py-4 px-4 text-emerald-600 font-bold">৳{Number(order.totalPrice).toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'ready' ? 'bg-emerald-100 text-emerald-800' : 
                          'bg-gray-200 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Management Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-4 px-4 text-gray-900 font-bold rounded-tl-lg">ID</th>
                <th className="py-4 px-4 text-gray-900 font-bold">Item Name</th>
                <th className="py-4 px-4 text-gray-900 font-bold">Category</th>
                <th className="py-4 px-4 text-gray-900 font-bold">Price</th>
                <th className="py-4 px-4 text-gray-900 font-bold">Status</th>
                <th className="py-4 px-4 text-gray-900 font-bold rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-900 font-medium">{item.id.substring(0, 8)}...</td>
                  
                  {editingItemId === item.id ? (
                    <>
                      <td className="py-2 px-4">
                        <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2 border border-gray-300 text-black rounded" />
                      </td>
                      <td className="py-2 px-4">
                        <select value={editFormData.categoryId} onChange={(e) => setEditFormData({...editFormData, categoryId: e.target.value})} className="w-full p-2 border border-gray-300 text-black rounded cursor-pointer">
                          <option value="">Uncategorized</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <input type="number" step="0.01" value={editFormData.price} onChange={(e) => setEditFormData({...editFormData, price: e.target.value})} className="w-24 p-2 border border-gray-300 text-black rounded" />
                      </td>
                      <td className="py-2 px-4">
                        <select value={editFormData.isAvailable} onChange={(e) => setEditFormData({...editFormData, isAvailable: e.target.value === 'true'})} className="p-2 border border-gray-300 text-black rounded cursor-pointer">
                          <option value="true">Available</option>
                          <option value="false">Out of Stock</option>
                        </select>
                      </td>
                      <td className="py-2 px-4 flex gap-2">
                        <button onClick={() => handleEditSave(item.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors">Save</button>
                        <button onClick={() => setEditingItemId(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded transition-colors">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-gray-900 font-bold">{item.name}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200">
                          {item.category ? item.category.name : 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-emerald-600 font-bold">৳{Number(item.price).toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {item.isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-4 flex gap-4">
                        <button onClick={() => handleEditClick(item)} className="text-gray-600 hover:text-gray-900 font-bold underline transition-colors">Edit</button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="text-orange-500 hover:text-orange-700 font-bold underline transition-colors">Hide</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}