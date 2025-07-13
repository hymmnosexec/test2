// context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router'; // 引入 useRouter

export const AuthContext = createContext({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter(); // 获取路由对象

  useEffect(() => {
    const username = Cookies.get('username');
    if (username) {
      setUser({ username });
    } else {
      setUser(null);
    }
  }, [router.asPath]); // 将 router.asPath 作为依赖项

  const isLoggedIn = !!user;
  const isAdmin = user && user.username === 'admin';

  const logout = async () => {
    await fetch('/api/logout'); 
    Cookies.remove('username');
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn,
    isAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};