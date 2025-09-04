import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Tipos ---
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'entrada' | 'saida';
  department: string;
  date: string;
}

interface CategoryChartProps {
  transactions: Transaction[];
  isLoading: boolean;
}

// --- Cores para o gráfico ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

const CategoryChart = ({ transactions, isLoading }: CategoryChartProps) => {

  const processData = () => {
    if (!transactions) return [];

    const expensesByDept = transactions
      .filter((tx) => tx.type === 'saida')
      .reduce((acc, tx) => {
        const dept = tx.department || 'Sem Categoria';
        if (!acc[dept]) {
          acc[dept] = 0;
        }
        acc[dept] += parseFloat(tx.amount);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expensesByDept).map(([name, value]) => ({ name, value }));
  };

  const chartData = processData();

  if (isLoading) return <p>Carregando gráfico...</p>;
  if (chartData.length === 0) return <p>Não há dados de despesas para exibir.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={(entry) => `${entry.name}`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
