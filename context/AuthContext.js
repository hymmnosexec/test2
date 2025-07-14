// context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie;
    const usernameCookie = cookies?.split(';').find(c => c.trim().startsWith('username='));

    if (usernameCookie) {
      const username = usernameCookie.split('=')[1];
      const isAdmin = username === 'admin';
      setUser({ username, isAdmin });
    } else {
      setUser(null);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

const logout = async () => {
    // 向服务端发送登出请求
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error('登出失败:', error);
    }
    // 客户端清除状态
    setUser(null);
    router.push('/');
  };

  const isLoggedIn = !!user;
  const isAdmin = user && user.isAdmin;

  const value = { user, isLoggedIn, isAdmin, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}