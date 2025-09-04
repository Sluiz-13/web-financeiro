import React, { useContext, ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, AuthContext } from "./context/AuthContext.tsx";
import Transactions from "./pages/Transactions.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Register from "./pages/Register.tsx";
import Savings from "./pages/Savings.tsx";

// Cria uma instância do QueryClient
const queryClient = new QueryClient();

// --- Definições de Tipos ---
interface PrivateRouteProps {
  children: ReactNode;
}
 
// Componente para proteger rotas privadas
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    // O contexto ainda não está disponível, pode ser um estado de carregamento inicial
    return <div>Carregando...</div>; 
  }

  const { token, isLoading } = auth;

  if (isLoading) {
    return <div>Carregando...</div>; // Ou um spinner de carregamento
  }

  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/savings"
              element={
                <PrivateRoute>
                  <Savings />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
