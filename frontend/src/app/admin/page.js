"use client";
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '../context/AppContext';
import api from '../lib/axios';
import AddMenuItem from '../components/AddMenuItem';

export default function AdminDashboard() {
  
  const { token, userRole, triggerNotification, menuItems, fetchMenu } = useContext(AppContext);
  const router = useRouter();
  
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', price: '', isAvailable: true });

  
  useEffect(() => {
    if (!token || userRole !== 'admin') {
      router.push('/login');
      return;
    }
    fetchOrders();
    fetchMenu();
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

  
  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setEditFormData({ 
      name: item.name, 
      description: item.description, 
      price: item.price, 
      isAvailable: item.isAvailable 
    });
  };

  const handleEditSave = async (id) => {
    try {
      await api.patch(`/menu/${id}`, {
        ...editFormData,
        price: parseFloat(editFormData.price)
      });
      triggerNotification(`${editFormData.name} updated successfully.`);
      setEditingItemId(null);
      fetchMenu(); 
    } catch (error) {
      triggerNotification(error.response?.data?.message || "Failed to update item.");
    }
  };

  const handleDelete = async (id, name) => {
    
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`)) {
      return; 
    }

    try {
      await api.delete(`/menu/${id}`);
      triggerNotification(`${name} deleted successfully.`);
      fetchMenu(); 
    } catch (error) {
      triggerNotification(error.response?.data?.message || "Failed to delete item.");
    }
  };

  
  if (userRole !== 'admin') return null; 

  return (
    <div className="py-8">
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600 font-medium">Manage your coffee shop menu, orders, and inventory.</p>
      </div>

      <AddMenuItem onAddSuccess={() => fetchMenu()} />

      {/* Incoming Orders Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Incoming Orders</h3>
        
        {loadingOrders ? (
          <div className="text-gray-500 font-medium">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-500 bg-gray-50 p-6 rounded-lg border border-gray-200 text-center font-medium">
            No orders have been placed yet.
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
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900 font-bold">#{order.id}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{order.customer?.fullName || 'Unknown'}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">
                      {order.items?.map(i => `${i.quantity}x ${i.menuItem?.name}`).join(', ')}
                    </td>
                    <td className="py-4 px-4 text-emerald-600 font-bold">${Number(order.totalPrice).toFixed(2)}</td>
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
                <th className="py-4 px-4 text-gray-900 font-bold">Description</th>
                <th className="py-4 px-4 text-gray-900 font-bold">Price</th>
                <th className="py-4 px-4 text-gray-900 font-bold">Status</th>
                <th className="py-4 px-4 text-gray-900 font-bold rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-900 font-medium">{item.id}</td>
                  
                  {editingItemId === item.id ? (
                    
                    <>
                      <td className="py-2 px-4">
                        <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2 border border-gray-300 text-black rounded" />
                      </td>
                      <td className="py-2 px-4">
                        <input type="text" value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} className="w-full p-2 border border-gray-300 text-black rounded" />
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
                      <td className="py-4 px-4 text-gray-600 text-sm">{item.description}</td>
                      <td className="py-4 px-4 text-emerald-600 font-bold">${Number(item.price).toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {item.isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-4 flex gap-4">
                        <button onClick={() => handleEditClick(item)} className="text-gray-600 hover:text-gray-900 font-bold underline transition-colors">Edit</button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="text-red-500 hover:text-red-700 font-bold underline transition-colors">Delete</button>
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