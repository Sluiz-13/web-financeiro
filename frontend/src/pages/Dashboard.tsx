import React from "react";
import "./Dashboard.css";
import Header from "../components/Header";
import SummaryCards from "../components/SummaryCards";
import RevenueExpenseChart from "../components/charts/RevenueExpenseChart";
import CategoryChart from "../components/charts/CategoryChart";
import { useQuery } from "@tanstack/react-query";
import { getTransactions, getFinancialSummary } from "../services/transactionsService";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'entrada' | 'saida';
  department: string;
  date: string;
}

interface FinancialSummary {
  total_entrada: number;
  total_saida: number;
  saldo: number;
}

export default function Dashboard() {
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[], Error>({
    queryKey: ["transactions"],
    queryFn: () => getTransactions().then((res) => res.data),
  });

  const { data: financialSummary, isLoading: isLoadingSummary } = useQuery<FinancialSummary, Error>({
    queryKey: ["financialSummary"],
    queryFn: () => getFinancialSummary().then((res) => res.data),
  });

  return (
    <div className="app-container">
      <Header />
      <main className="dashboard-main">
        <SummaryCards summary={financialSummary} isLoading={isLoadingSummary} />

        <div className="charts-grid">
          <div className="chart-container">
            <h2 className="chart-title">Receitas vs Despesas</h2>
            <div className="chart-content">
              <RevenueExpenseChart transactions={transactions} isLoading={isLoadingTransactions} />
            </div>
          </div>

          <div className="chart-container">
            <h2 className="chart-title">Despesas por Categoria</h2>
            <div className="chart-content">
              <CategoryChart transactions={transactions} isLoading={isLoadingTransactions} />
            </div>
          </div>

          {/* Gráfico de Saldo Mensal (ocupando a largura total) - A ser implementado */}
          <div className="chart-container min-w-full">
            <h2 className="chart-title">Saldo Mensal</h2>
            <div className="chart-content">
              <p style={{ textAlign: 'center', padding: '20px' }}>Área do Gráfico de Linha (A ser implementado)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
