import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getAllSavings, createSaving, updateSaving, deleteSaving } from '../services/savingsService';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Savings.css';

// --- Tipos ---
interface Saving {
  id: string;
  amount: number;
  description: string;
  date: string;
}

interface SavingForm {
  amount: string;
  description: string;
  date: string;
}

// --- Cores para o gráfico de pizza ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

const Savings = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSaving, setCurrentSaving] = useState<SavingForm & { id?: string | null }>({
    id: null,
    amount: '',
    description: '',
    date: '',
  });
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [savingToDelete, setSavingToDelete] = useState<string | null>(null);

  // Query para buscar todas as economias
  const { data: savings = [], isLoading, isError } = useQuery<Saving[], Error>({
    queryKey: ['savings'],
    queryFn: () => getAllSavings().then((res) => res.data),
    onError: () => {
      toast.error('Falha ao buscar economias.');
    },
  });

  // Mutations
  const createSavingMutation = useMutation<Saving, Error, SavingForm>({
    mutationFn: createSaving,
    onSuccess: () => {
      toast.success('Economia adicionada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      closeModal();
    },
    onError: () => {
      toast.error('Erro ao adicionar economia.');
    },
  });

  const updateSavingMutation = useMutation<Saving, Error, { id: string; data: SavingForm }>({
    mutationFn: ({ id, data }) => updateSaving(id, data),
    onSuccess: () => {
      toast.success('Economia atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      closeModal();
    },
    onError: () => {
      toast.error('Erro ao atualizar economia.');
    },
  });

  const deleteSavingMutation = useMutation<void, Error, string>({
    mutationFn: deleteSaving,
    onSuccess: () => {
      toast.success('Economia excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
    onError: () => {
      toast.error('Erro ao excluir economia.');
    },
    onSettled: () => {
      setConfirmModalOpen(false);
      setSavingToDelete(null);
    },
  });

  // Funções do modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentSaving({ id: null, amount: '', description: '', date: '' });
  };

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSaving({ ...currentSaving, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { amount, description, date } = currentSaving;
    const savingData = {
      amount: parseFloat(amount),
      description,
      date: new Date(`${date}T12:00:00`).toISOString(),
    };

    if (isEditing && currentSaving.id) {
      updateSavingMutation.mutate({ id: currentSaving.id, data: savingData });
    } else {
      createSavingMutation.mutate(savingData);
    }
  };

  const handleEdit = (saving: Saving) => {
    setCurrentSaving({
      ...saving,
      amount: String(saving.amount),
      date: new Date(saving.date).toISOString().split('T')[0],
    });
    setIsEditing(true);
    openModal();
  };

  const handleDelete = (id: string) => {
    setSavingToDelete(id);
    setConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (savingToDelete) {
      deleteSavingMutation.mutate(savingToDelete);
    }
  };

  // --- Processamento de dados para os gráficos ---
  const totalSaved = savings.reduce((sum, saving) => sum + Number(saving.amount), 0);

  const pieChartData = Object.entries(
    savings.reduce((acc, saving) => {
      const description = saving.description || 'Outros';
      acc[description] = (acc[description] || 0) + Number(saving.amount);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="app-container">
      <Header />
      <main className="savings-main">
        <div className="savings-header">
          <h1 className="text-2xl font-bold">Minhas Economias</h1>
          <Button onClick={openModal} className="add-btn">
            <span className="mr-2 h-5 w-5" /> Nova Economia
          </Button>
        </div>

        {isLoading && <p>Carregando economias...</p>}
        {isError && <p className="error-message">Falha ao carregar economias.</p>}

        {!isLoading && !isError && (
          <>
            <div className="summary-section">
              <div className="summary-card-savings">
                <div className="summary-content-total">
                  <div className="total-amount">
                    Total Economizado: R$ {totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="chart-container-savings">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) =>
                          value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data-message">Nenhum dado para o gráfico de pizza.</p>
                )}
              </div>
            </div>

            <div className="savings-list">
              {savings.length > 0 ? (
                savings.map((saving) => (
                  <div key={saving.id} className="saving-card">
                    <div className="saving-details">
                      <span className="saving-date">
                        {new Date(saving.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="saving-description">{saving.description || 'Sem descrição'}</span>
                      <span className="saving-amount">
                        R$ {saving.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="saving-actions">
                      <Button onClick={() => handleEdit(saving)} variant="outline" size="sm">
                        <Pencil size={16} />
                        <span className="ml-1">Editar</span>
                      </Button>
                      <Button onClick={() => handleDelete(saving.id)} variant="destructive" size="sm">
                        <Trash2 size={16} />
                        <span className="ml-1">Excluir</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Nenhuma economia registrada ainda.</p>
              )}
            </div>
          </>
        )}

        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent className="dialog-content max-w-xl w-full mx-auto rounded-xl p-6 bg-white">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Economia' : 'Nova Economia'}</DialogTitle>
              <DialogDescription>Preencha os detalhes da sua economia.</DialogDescription>
            </DialogHeader>
            <form id="economy-form" onSubmit={handleSubmit} className="dialog-form">
              <label className="form-label" htmlFor="description">
                Descrição
              </label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="Ex: Reserva, Cofrinho"
                value={currentSaving.description}
                onChange={handleInputChange}
                disabled={createSavingMutation.isPending || updateSavingMutation.isPending}
                className="form-input"
                required
              />
              <label className="form-label" htmlFor="amount">
                Valor
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                placeholder="R$ 0,00"
                value={currentSaving.amount}
                onChange={handleInputChange}
                disabled={createSavingMutation.isPending || updateSavingMutation.isPending}
                className="form-input"
                required
              />
              <label className="form-label" htmlFor="date">
                Data
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={currentSaving.date}
                onChange={handleInputChange}
                disabled={createSavingMutation.isPending || updateSavingMutation.isPending}
                className="form-input"
                required
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={createSavingMutation.isPending || updateSavingMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createSavingMutation.isPending || updateSavingMutation.isPending}>
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Economia'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isConfirmModalOpen} onOpenChange={setConfirmModalOpen}>
          <DialogContent className="max-w-[26.5rem]">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta economia? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmModalOpen(false)}
                disabled={deleteSavingMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteSavingMutation.isPending}
              >
                {deleteSavingMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Savings;
