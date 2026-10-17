import api from './api';

/**
 * Get AI Packaging Recommendation from Express backend (which calls NVIDIA NIM API)
 */
export const getAIRecommendation = async (payload) => {
  const response = await api.post('/ai/recommend', payload);
  return response.data;
};

/**
 * Calculate deterministic quotation using backend pricing engine
 */
export const calculateQuotation = async (payload) => {
  const response = await api.post('/plans/quote', payload);
  return response.data;
};

/**
 * Save new packaging plan to MongoDB
 */
export const savePackagingPlan = async (planData) => {
  const response = await api.post('/plans', planData);
  return response.data;
};

/**
 * Fetch all saved plans / orders for the authenticated user
 */
export const getMyOrders = async () => {
  const response = await api.get('/plans');
  return response.data;
};

/**
 * Fetch specific plan details by ID
 */
export const getOrderById = async (id) => {
  const response = await api.get(`/plans/${id}`);
  return response.data;
};

/**
 * Update an existing packaging plan
 */
export const updatePlan = async (id, updateData) => {
  const response = await api.put(`/plans/${id}`, updateData);
  return response.data;
};

/**
 * Delete a packaging plan
 */
export const deletePlan = async (id) => {
  const response = await api.delete(`/plans/${id}`);
  return response.data;
};
