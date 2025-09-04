import React, { useState, useEffect, useContext } from "react";
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import TransactionModal from "../components/TransactionModal";

export default function Transacoes() {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransactions(response.data);
      } catch (err) {
        console.error('Erro ao carregar transações:', err);
        setTransactions([]);
      }
    };

    if (token) fetchTransactions();
  }, [token]);

  return (
    <>
        <div className="app-container">
          <Header />
          <main className="dashboard-main">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Minhas Transações</h1>
              <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
                Nova Transação
              </button>
            </div>

            <div className="bg-white rounded shadow p-4 overflow-x-auto">
              {transactions.length === 0 ? (
                <p className="text-gray-500">Nenhuma transação encontrada.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4">Descrição</th>
                      <th className="py-2 px-4">Valor</th>
                      <th className="py-2 px-4">Tipo</th>
                      <th className="py-2 px-4">Departamento</th>
                      <th className="py-2 px-4">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{tx.title}</td>
                        <td className="py-2 px-4 text-green-600 font-medium">
                          {Number(tx.amount).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="py-2 px-4 capitalize">{tx.type}</td>
                        <td className="py-2 px-4">{tx.department}</td>
                        <td className="py-2 px-4">
                          {new Date(tx.date).valueOf.toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>
        <TransactionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => window.location.reload()} 
        />
    </>
  );
}
