import React from 'react';
import {
  BarChart,   
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";


// --- Tipos ---
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'entrada' | 'saida';
  department: string;
  date: string;
}

interface RevenueExpenseChartProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const RevenueExpenseChart = ({ transactions, isLoading }: RevenueExpenseChartProps) => {

  const processData = () => {
    if (!transactions) return [];

    const monthlyData = transactions.reduce((acc, tx) => {
      const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { name: month, receita: 0, despesa: 0 };
      }
      const amount = parseFloat(tx.amount); // Converte para número
      if (tx.type === 'entrada') {
        acc[month].receita += amount;
      } else {
        acc[month].despesa += amount;
      }
      return acc;
    }, {} as Record<string, { name: string; receita: number; despesa: number }>);

    return Object.values(monthlyData);
  };

  const chartData = processData();

  if (isLoading) return <p>Carregando gráfico...</p>;
  if (chartData.length === 0) return <p>Não há dados para exibir.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} barCategoryGap={20}>
        {/* grade mais suave */}
        <CartesianGrid stroke="#d1d5db" strokeDasharray="3 3" />

        <XAxis dataKey="name" tick={{ fontSize: 12 }} />

        <YAxis
          tickFormatter={(v) =>
            new Intl.NumberFormat("pt-BR", {
              notation: "compact",
              compactDisplay: "short",
            }).format(v)
          }
          tick={{ fontSize: 12 }}
        />

        {/* tooltip customizado */}
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          contentStyle={{
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "none",
          }}
          formatter={(v: number) =>
            v.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          }
        />

        <Legend wrapperStyle={{ fontSize: 13 }} />

        {/* barras: verde (#22c55e) e vermelho (#ef4444) */}
        <Bar dataKey="receita" name="Receita" fill="#22c55e">
          <LabelList
            dataKey="receita"
            position="top"
            formatter={(v: number) =>
              v.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })
            }
          />
        </Bar>

        <Bar dataKey="despesa" name="Despesa" fill="#ef4444">
          <LabelList
            dataKey="despesa"
            position="top"
            formatter={(v: number) =>
              v.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })
            }
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default RevenueExpenseChart;
