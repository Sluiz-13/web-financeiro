import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createTransaction,
  updateTransaction,
} from "../services/transactionsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";                   // ⬅️ novo ícone
import "./TransactionModal.css";

/* --- Tipos -------------------------------------------------------- */
type TransactionType = "entrada" | "saida";

interface TransactionForm {
  title: string;
  amount: string;             // string no form
  type: TransactionType;
  department: string;
  date: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<TransactionForm> & { id?: string };
  transactionId?: string | null;
}

/* --- Componente --------------------------------------------------- */
export default function TransactionModal({
  isOpen,
  onClose,
  initialData = {},
  transactionId = null,
}: TransactionModalProps) {
  const queryClient = useQueryClient();

  /* estado do formulário */
  const [form, setForm] = useState<TransactionForm>({
    title: "",
    amount: "",
    type: "entrada",
    department: "",
    date: "",
  });

  /* efeito: popular quando abre para edição ou zerar se novo */
  useEffect(() => {
    if (isOpen && initialData && Object.keys(initialData).length > 0) {
      setForm({
        title: initialData.title || "",
        amount: String(initialData.amount || ""),
        type: initialData.type || "entrada",
        department: initialData.department || "",
        date: initialData.date ? initialData.date.split("T")[0] : "",
      });
    } else if (isOpen) {
      setForm({
        title: "",
        amount: "",
        type: "entrada",
        department: "",
        date: "",
      });
    }
  }, [initialData, isOpen]);

  /* mutation: cria ou atualiza */
  const mutation = useMutation({
    mutationFn: (formData: TransactionForm) => {
      const dataToSend = { ...formData, amount: Number(formData.amount), expected: false };
      return transactionId
        ? updateTransaction(transactionId, dataToSend)
        : createTransaction(dataToSend);
    },
    onSuccess: () => {
      toast.success("Transação salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Erro ao salvar transação.";
      toast.error(msg);
    },
  });

  /* handlers ------------------------------------------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  /* --- JSX -------------------------------------------------------- */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="dialog-content max-w-xl w-full mx-auto rounded-xl p-6 bg-white"
        id="new-form"
      >

        {/* cabeçalho */}
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">
            {transactionId ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
          <DialogDescription className="dialog-description">
            Preencha os detalhes para organizar suas finanças.
          </DialogDescription>
        </DialogHeader>

        {/* formulário */}
        <form
          id="transaction-form"
          onSubmit={handleSubmit}
          className="dialog-form"
        >
          {/* Descrição */}
          <label className="form-label" htmlFor="title">
            Descrição
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Ex: Salário, Aluguel"
            value={form.title}
            onChange={handleChange}
            disabled={mutation.isPending}
            className="form-input"
            required
          />

          {/* Valor */}
          <label className="form-label" htmlFor="amount">
            Valor
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            placeholder="R$ 0,00"
            value={form.amount}
            onChange={handleChange}
            disabled={mutation.isPending}
            className="form-input"
            required
          />

          {/* Grid: Tipo + Departamento */}
          <div className="form-grid">
            <div>
              <label className="form-label" htmlFor="type">
                Tipo
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={mutation.isPending}
                className="form-input"
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>

            <div>
                <label className="form-label" htmlFor="department">
                  Departamento
                </label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  disabled={mutation.isPending}
                  className="form-input"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Casa">Casa</option>
                  <option value="Estudos">Estudos</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
          </div>

          {/* Data */}
          <label className="form-label" htmlFor="date">
            Data
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            disabled={mutation.isPending}
            className="form-input"
            required
          />
        </form>

        {/* rodapé */}
        <DialogFooter className="dialog-footer">
          <Button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="btn-secondary bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="transaction-form"
            disabled={mutation.isPending}
            className="btn-primary bg-green-600 hover:bg-green-700"
          >
            {mutation.isPending ? "Salvando..." : "Salvar Transação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
