import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getTransactions, deleteTransaction } from "../services/transactionsService";
import TransactionModal from "../components/TransactionModal";
import Header from "../components/Header";
import "./Transactions.css";
import { Button } from "../components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// --- Definições de Tipos ---
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'entrada' | 'saida';
  department: string;
  date: string;
}

export default function Transactions() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Transaction> | null>(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const { data: transactions = [], isLoading, isError } = useQuery<Transaction[], Error>({
    queryKey: ["transactions"],
    queryFn: () => getTransactions().then((res) => res.data),
    onError: () => {
      toast.error("Erro ao buscar transações.");
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      toast.success("Transação excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => {
      toast.error("Erro ao excluir transação.");
    },
    onSettled: () => {
      setConfirmModalOpen(false);
      setTransactionToDelete(null);
    },
  });

  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteMutation.mutate(transactionToDelete);
    }
  };

  const openModalForEdit = (tx: Transaction) => {
    setEditData(tx);
    setModalOpen(true);
  };

  const openModalForNew = () => {
    setEditData(null);
    setModalOpen(true);
  };

  return (
    <div className="transactions-page">
      <Header />
      <main className="container">
      </main>
      <div className="flex justify-between items-center mb-4 transaction-header">
        <h1 className="text-2xl font-bold">Minhas Transações</h1>
        <Button onClick={openModalForNew} className="btn-primary">
          Nova Transação
        </Button>
      </div>

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        {isLoading ? (
          <p>Carregando...</p>
        ) : isError ? (
          <p className="text-red-500">Falha ao carregar transações.</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">Nenhuma transação encontrada.</p>
        ) : (
          <table className="w-full text-left border-collapse transaction-table">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b hover:bg-gray-50">
                  <td data-label="Descrição" className="py-3 px-4">{tx.title}</td>
                  <td data-label="Valor" className="py-3 px-4">
                    {"R$ " + parseFloat(tx.amount).toFixed(2).replace('.', ',')}
                  </td>
                  <td data-label="Tipo" className="py-3 px-4">
                    <span className={`badge ${tx.type}`}>{tx.type}</span>
                  </td>
                  <td data-label="Data" className="py-3 px-4">
                    {new Date(tx.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </td>
                  <td data-label="Departamento" className="py-3 px-4">
                    <span className={`py-3 px-4" ${tx.department}`}>{tx.department}</span>
                  </td>
                  <td data-label="Ações" className="py-3 px-4">
                    <Button
                      onClick={() => openModalForEdit(tx)}
                      variant="outline"
                      size="sm"
                      className="btn-edit"
                    >
                      <Pencil size={16} />
                      <span className="ml-1">Editar</span>
                    </Button>

                    <Button
                      onClick={() => handleDelete(tx.id)}
                      variant="destructive"
                      size="sm"
                      className="btn-delete ml-2"
                    >
                      <Trash2 size={16} />
                      <span className="ml-1">Excluir</span>
                    </Button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editData || {}}
        transactionId={editData?.id || null}
      />

      <Dialog open={isConfirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent id="delete-cancel">
          <DialogHeader>
            <DialogTitle id="confirme-delete">Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)} disabled={deleteMutation.isPending}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
