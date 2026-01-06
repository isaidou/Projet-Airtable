import React, { createContext, useState, useContext, useEffect } from 'react';
import { postJson } from '../services/fetch.services';
import { useGlobal } from './GlobalContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const { setGlobalLoading } = useGlobal()
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const login = (userData) => {
    setGlobalLoading(true)
    return postJson('login', userData)
      .then((res) => {
        const tokenString = res.token;
        const decoded = jwtDecode(tokenString);
        
        localStorage.setItem('token', tokenString);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', decoded.isAdmin ? 'true' : 'false');
        localStorage.setItem('userId', decoded.userId);
        
        setIsAuthenticated(true);
        setToken(decoded);
        setIsAdmin(decoded.isAdmin);
        setUserId(decoded.userId);
        navigate('/')
        return res;
      })
      .catch(err => {
        throw err;
      })
      .finally(() => setGlobalLoading(false))
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setToken(null);
    setUserId('');
    navigate('/login');
  };

  const setAuthFromToken = (tokenString) => {
    const decoded = jwtDecode(tokenString);
    localStorage.setItem('token', tokenString);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('isAdmin', decoded.isAdmin ? 'true' : 'false');
    localStorage.setItem('userId', decoded.userId);
    setIsAuthenticated(true);
    setToken(decoded);
    setIsAdmin(decoded.isAdmin);
    setUserId(decoded.userId);
  };

  useEffect(() => {
    const tokenString = localStorage.getItem('token');
    if (tokenString) {
      try {
        const decoded = jwtDecode(tokenString);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(decoded);
          setIsAdmin(decoded.isAdmin);
          setUserId(decoded.userId);
        }
      } catch (error) {
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      login, 
      logout, 
      userId, 
      setAuthFromToken, 
      setIsAuthenticated, 
      setToken, 
      setUserId, 
      setIsAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
