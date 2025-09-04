import api from '../lib/api';

// Função para buscar o token do localStorage
const getToken = () => localStorage.getItem('token');

// Configuração do cabeçalho com o token
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

/**
 * Busca todas as economias do usuário.
 */
export const getAllSavings = () => {
  return api.get('/savings', getAuthHeaders());
};

/**
 * Cria uma nova economia.
 * @param {object} savingData - Os dados da nova economia (amount, description, date).
 */
export const createSaving = (savingData) => {
  return api.post('/savings', savingData, getAuthHeaders());
};

/**
 * Atualiza uma economia existente.
 * @param {string} id - O ID da economia a ser atualizada.
 * @param {object} savingData - Os novos dados da economia.
 */
export const updateSaving = (id, savingData) => {
  return api.put(`/savings/${id}`, savingData, getAuthHeaders());
};

/**
 * Deleta uma economia pelo ID.
 * @param {string} id - O ID da economia a ser deletada.
 */
export const deleteSaving = (id) => {
  return api.delete(`/savings/${id}`, getAuthHeaders());
};

/**
 * Busca o resumo de economias por mês.
 */
export const getSavingsSummary = () => {
  return api.get('/savings/summary', getAuthHeaders());
};
