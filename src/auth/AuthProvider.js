import React, { createContext, useState, useEffect } from 'react';
import { getToken, setToken, isAuthenticated, loginRequest, logoutRequest } from './index';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
      // se não autenticado, redireciona para raiz
      navigate('/');
    }
  }, [authenticated, navigate]);

  async function login(email, senha) {
    const data = await loginRequest(email, senha);
    if (data && data.api_key) {
      setToken(data.api_key);
      setAuthenticated(true);
    }
    return data;
  }

  async function logout() {
    await logoutRequest();
    setAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
