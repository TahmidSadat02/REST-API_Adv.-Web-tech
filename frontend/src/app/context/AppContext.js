"use client";
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; 
import api from '../lib/axios';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const normalizeRole = (roleValue) =>
    typeof roleValue === 'string' ? roleValue.trim().toLowerCase() : '';

  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    const storedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('accessToken')
        : null;

    if (!storedToken) {
      setCategories([]);
      return;
    }

    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error("Failed to fetch menu", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    const storedToken =
      localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        const normalizedRole = normalizeRole(
          decoded?.role ?? decoded?.userRole ?? decoded?.user?.role,
        );
        setUserRole(normalizedRole || null);
        setUserName(decoded.fullName);
        if (normalizedRole === 'admin') {
          fetchCategories();
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Invalid token");
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
      }
    }

    setLoading(false);
  }, [fetchCategories]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('accessToken', newToken);
    try {
      const decoded = jwtDecode(newToken);
      const normalizedRole = normalizeRole(
        decoded?.role ?? decoded?.userRole ?? decoded?.user?.role,
      );
      setUserRole(normalizedRole || null);
      setUserName(decoded.fullName);
      if (normalizedRole === 'admin') {
        fetchCategories();
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error("Failed to decode token on login");
    }
    triggerNotification("Successfully logged in!");
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    setUserName(null);
    setCategories([]);
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    triggerNotification("Logged out successfully");
    router.push('/');
  };

  return (
    <AppContext.Provider value={{ 
      token, 
      userRole,
      userName,
      login, 
      logout, 
      menuItems, 
      loading, 
      fetchMenu, 
      notification, 
      triggerNotification,
      categories,       
      fetchCategories  
    }}>
      {children}
    </AppContext.Provider>
  );
};
