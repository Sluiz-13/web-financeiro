import React, { createContext, useState, useEffect, ReactNode } from "react";

// --- Definições de Tipos ---
interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (newToken: string) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// --- Criação do Contexto ---
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Componente do Provedor ---
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega o token salvo no localStorage ao iniciar
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salva o token ao fazer login
  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // Remove o token ao fazer logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // --- Valor do Contexto ---
  const contextValue: AuthContextType = {
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};