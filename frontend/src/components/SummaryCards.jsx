import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const formatCurrency = (value) => {
  if (isNaN(value) || value === null) {
    return "R$ 0,00";
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const SummaryCards = ({ summary, isLoading }) => {
  // Estado para controlar a visibilidade, começando como oculto (false)
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  // Função para alternar a visibilidade
  const toggleVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  if (isLoading) {
    return (
      <div className="summary-cards">
        <p>Carregando resumo...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="summary-cards">
        <p>Nenhum resumo disponível.</p>
      </div>
    );
  }

  // Placeholder para quando os valores estiverem ocultos
  const hiddenPlaceholder = "R$ ••••••";

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="card-header revenue">
          <span>Entradas</span>
        </div>
        <div className="card-body">
          {isBalanceVisible ? formatCurrency(summary.total_entrada) : hiddenPlaceholder}
        </div>
      </div>

      <div className="summary-card">
        <div className="card-header expense">
          <span>Saídas</span>
        </div>
        <div className="card-body">
          {isBalanceVisible ? formatCurrency(summary.total_saida) : hiddenPlaceholder}
        </div>
      </div>

      <div className="summary-card">
        <div className="card-header balance" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Saldo</span>
          <button 
            onClick={toggleVisibility} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            aria-label={isBalanceVisible ? "Ocultar saldo" : "Mostrar saldo"}
          >
            {isBalanceVisible ? <Eye size={22} /> : <EyeOff size={22} />}
          </button>
        </div>
        <div className="card-body">
          {isBalanceVisible ? formatCurrency(summary.saldo) : hiddenPlaceholder}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;